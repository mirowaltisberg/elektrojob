-- CV-Jobfinder: ausschliesslich serverseitiger Zugriff, bestehende Swipe-Daten bleiben erhalten.
create table public.job_finder_sessions (
  id uuid primary key,
  name text not null check (char_length(name) between 1 and 100),
  cv_path text not null unique,
  cv_filename text not null,
  cv_uploaded_at timestamptz,
  jobs jsonb not null check (jsonb_typeof(jobs) = 'array' and jsonb_array_length(jobs) between 1 and 60),
  swipes jsonb not null default '[]' check (jsonb_typeof(swipes) = 'array' and jsonb_array_length(swipes) <= 60),
  synthetic boolean not null default false,
  ip_hash text not null,
  consent_version text not null default 'job-finder-v1',
  consented_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  last_activity_at timestamptz not null default now(),
  access_expires_at timestamptz not null default now() + interval '7 days',
  retention_expires_at timestamptz not null default now() + interval '90 days',
  completed_at timestamptz,
  summary text,
  email_from text not null,
  email_to jsonb not null check (jsonb_typeof(email_to) = 'array' and jsonb_array_length(email_to) between 1 and 5)
);
create index job_finder_sessions_rate_idx on public.job_finder_sessions (ip_hash, created_at);
create index job_finder_sessions_retention_idx on public.job_finder_sessions (retention_expires_at);
alter table public.job_finder_sessions enable row level security;
revoke all on public.job_finder_sessions from public, anon, authenticated;
grant select, insert, update, delete on public.job_finder_sessions to service_role;

create table public.job_finder_deliveries (
  session_id uuid not null references public.job_finder_sessions(id) on delete cascade,
  kind text not null check (kind in ('cv','summary')),
  status text not null default 'pending' check (status in ('pending','sending','sent','review')),
  provider_id text,
  attempts integer not null default 0,
  first_attempt_at timestamptz,
  lease_until timestamptz,
  sent_at timestamptz,
  last_error text,
  primary key (session_id, kind)
);
create index job_finder_deliveries_pending_idx on public.job_finder_deliveries (status, lease_until) where status <> 'sent';
alter table public.job_finder_deliveries enable row level security;
revoke all on public.job_finder_deliveries from public, anon, authenticated;
grant select, insert, update, delete on public.job_finder_deliveries to service_role;

create function public.create_job_finder_session(p_session jsonb) returns jsonb
language plpgsql security invoker set search_path = '' as $$
declare existing public.job_finder_sessions;
begin
  -- Der IP-Lock verhindert paralleles Umgehen des dauerhaften Stundenlimits.
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(p_session->>'ip_hash', 214));
  select * into existing from public.job_finder_sessions where id = (p_session->>'id')::uuid;
  if found then return to_jsonb(existing); end if;
  if not (p_session->>'synthetic')::boolean and
    (select count(*) from public.job_finder_sessions where ip_hash = p_session->>'ip_hash' and not synthetic and created_at > now() - interval '1 hour') >= 3 then
    raise exception 'finder_rate_limit' using errcode = 'P0001';
  end if;
  insert into public.job_finder_sessions (id,name,cv_path,cv_filename,jobs,synthetic,ip_hash,email_from,email_to)
    values ((p_session->>'id')::uuid,p_session->>'name',p_session->>'cv_path',p_session->>'cv_filename',p_session->'jobs',(p_session->>'synthetic')::boolean,p_session->>'ip_hash',p_session->>'email_from',p_session->'email_to')
    returning * into existing;
  return to_jsonb(existing);
end $$;
revoke all on function public.create_job_finder_session(jsonb) from public, anon, authenticated;
grant execute on function public.create_job_finder_session(jsonb) to service_role;

-- Der Datensatz reserviert den privaten Pfad VOR dem Upload. Erst nach bestätigtem
-- Speichern der PDF wird der Versandauftrag in derselben Transaktion freigegeben.
create function public.confirm_job_finder_cv(p_id uuid) returns jsonb
language plpgsql security invoker set search_path = '' as $$
declare s public.job_finder_sessions;
begin
  update public.job_finder_sessions set cv_uploaded_at=coalesce(cv_uploaded_at,now())
    where id=p_id and access_expires_at > now() returning * into s;
  if not found then raise exception 'finder_expired'; end if;
  insert into public.job_finder_deliveries(session_id,kind) values(p_id,'cv') on conflict do nothing;
  return to_jsonb(s);
end $$;
revoke all on function public.confirm_job_finder_cv(uuid) from public, anon, authenticated;
grant execute on function public.confirm_job_finder_cv(uuid) to service_role;

create function public.record_job_finder_swipe(p_id uuid,p_job_id text,p_choice text) returns jsonb
language plpgsql security invoker set search_path = '' as $$
declare s public.job_finder_sessions; previous jsonb;
begin
  select * into s from public.job_finder_sessions where id = p_id for update;
  if not found or s.access_expires_at <= now() or s.cv_uploaded_at is null then raise exception 'finder_expired'; end if;
  if p_choice not in ('like','pass') or not exists(select 1 from jsonb_array_elements(s.jobs) j where j->>'id' = p_job_id) then raise exception 'finder_invalid_choice'; end if;
  select j into previous from jsonb_array_elements(s.swipes) j where j->>'jobId' = p_job_id;
  if previous is not null then
    if previous->>'choice' <> p_choice then raise exception 'finder_choice_conflict'; end if;
    return to_jsonb(s);
  end if;
  if s.completed_at is not null then raise exception 'finder_completed'; end if;
  update public.job_finder_sessions set swipes = swipes || jsonb_build_array(jsonb_build_object('jobId',p_job_id,'choice',p_choice)), last_activity_at = now()
    where id = p_id returning * into s;
  return to_jsonb(s);
end $$;
revoke all on function public.record_job_finder_swipe(uuid,text,text) from public, anon, authenticated;
grant execute on function public.record_job_finder_swipe(uuid,text,text) to service_role;

-- Vergleich mit der gelesenen Auswahl verhindert einen Abschluss mit veralteter Zusammenfassung.
create function public.finish_job_finder_session(p_id uuid,p_swipes jsonb,p_summary text) returns jsonb
language plpgsql security invoker set search_path = '' as $$
declare s public.job_finder_sessions;
begin
  select * into s from public.job_finder_sessions where id = p_id for update;
  if not found or s.retention_expires_at <= now() then raise exception 'finder_expired'; end if;
  if s.completed_at is not null then return to_jsonb(s); end if;
  if s.swipes <> p_swipes then raise exception 'finder_changed'; end if;
  if jsonb_array_length(s.swipes) = 0 then raise exception 'finder_no_choices'; end if;
  update public.job_finder_sessions set completed_at = now(), summary = p_summary where id = p_id returning * into s;
  insert into public.job_finder_deliveries(session_id,kind) values(p_id,'summary') on conflict do nothing;
  return to_jsonb(s);
end $$;
revoke all on function public.finish_job_finder_session(uuid,jsonb,text) from public, anon, authenticated;
grant execute on function public.finish_job_finder_session(uuid,jsonb,text) to service_role;

create function public.claim_job_finder_delivery(p_id uuid,p_kind text) returns jsonb
language plpgsql security invoker set search_path = '' as $$
declare d public.job_finder_deliveries;
begin
  select * into d from public.job_finder_deliveries where session_id=p_id and kind=p_kind for update skip locked;
  if not found or d.status in ('sent','review') or d.lease_until > now() then return null; end if;
  -- Resend dedupliziert 24 Stunden. Danach keine automatische Doppelzustellung riskieren.
  if d.first_attempt_at < now() - interval '23 hours' then
    update public.job_finder_deliveries set status='review',last_error='idempotency_window_expired' where session_id=p_id and kind=p_kind;
    return null;
  end if;
  update public.job_finder_deliveries set status='sending',attempts=attempts+1,first_attempt_at=coalesce(first_attempt_at,now()),lease_until=now()+interval '2 minutes'
    where session_id=p_id and kind=p_kind returning * into d;
  return to_jsonb(d);
end $$;
revoke all on function public.claim_job_finder_delivery(uuid,text) from public, anon, authenticated;
grant execute on function public.claim_job_finder_delivery(uuid,text) to service_role;

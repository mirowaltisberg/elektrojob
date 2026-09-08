-- Bestehender QERO-CV-Prozess: CV in applications, Interessen am gleichen Datensatz.
-- Kein separater Mailanbieter und keine frei waehlbaren Empfaenger im Jobportal.
-- Nur die in dieser Feature-Arbeit angelegten Versandfelder werden optional;
-- die Spalten und allfaellige Inhalte bleiben erhalten und werden nicht mehr verwendet.
alter table public.job_finder_sessions alter column email_from drop not null, alter column email_to drop not null;
alter table public.job_finder_deliveries drop constraint job_finder_deliveries_status_check;
alter table public.job_finder_deliveries add constraint job_finder_deliveries_status_check check(status in ('pending','sending','sent','review','skipped'));

create or replace function public.create_job_finder_session(p_session jsonb) returns jsonb
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
  insert into public.job_finder_sessions (id,name,cv_path,cv_filename,cv_sha256,jobs,synthetic,ip_hash)
    values ((p_session->>'id')::uuid,p_session->>'name',p_session->>'cv_path',p_session->>'cv_filename',p_session->>'cv_sha256',p_session->'jobs',(p_session->>'synthetic')::boolean,p_session->>'ip_hash')
    returning * into existing;
  return to_jsonb(existing);
end $$;
revoke all on function public.create_job_finder_session(jsonb) from public, anon, authenticated;
grant execute on function public.create_job_finder_session(jsonb) to service_role;


create or replace function public.confirm_job_finder_cv(p_id uuid) returns jsonb
language plpgsql security invoker set search_path = '' as $$
declare s public.job_finder_sessions;
begin
  update public.job_finder_sessions set cv_uploaded_at=coalesce(cv_uploaded_at,now())
    where id=p_id and access_expires_at > now() returning * into s;
  if not found then raise exception 'finder_expired'; end if;
  insert into public.applications (id,job_id,name,email,phone,cv_path,cv_filename,source,site,status,consent_version,consented_at,retention_expires_at,ip_hash,submitted_at)
    values(s.id,'job-finder',s.name,null,null,s.cv_path,s.cv_filename,case when s.synthetic then 'synthetic' else 'form' end,'elektrojob.ch','received',s.consent_version,s.consented_at,s.retention_expires_at,s.ip_hash,now())
    on conflict(id) do nothing;
  insert into public.job_finder_deliveries(session_id,kind) values(p_id,'cv') on conflict do nothing;
  return to_jsonb(s);
end $$;
revoke all on function public.confirm_job_finder_cv(uuid) from public, anon, authenticated;
grant execute on function public.confirm_job_finder_cv(uuid) to service_role;


create or replace function public.finish_job_finder_session(p_id uuid,p_swipes jsonb,p_summary text) returns jsonb
language plpgsql security invoker set search_path = '' as $$
declare s public.job_finder_sessions;
begin
  select * into s from public.job_finder_sessions where id = p_id for update;
  if not found or s.retention_expires_at <= now() then raise exception 'finder_expired'; end if;
  if s.completed_at is not null then return to_jsonb(s); end if;
  if s.swipes <> p_swipes then raise exception 'finder_changed'; end if;
  if jsonb_array_length(s.swipes) = 0 then raise exception 'finder_no_choices'; end if;
  update public.job_finder_sessions set completed_at = now(), summary = p_summary where id = p_id returning * into s;
  update public.applications set message=p_summary where id=p_id and job_id='job-finder';
  insert into public.job_finder_deliveries(session_id,kind) values(p_id,'summary') on conflict do nothing;
  return to_jsonb(s);
end $$;
revoke all on function public.finish_job_finder_session(uuid,jsonb,text) from public, anon, authenticated;
grant execute on function public.finish_job_finder_session(uuid,jsonb,text) to service_role;


create or replace function public.claim_job_finder_delivery(p_id uuid,p_kind text) returns jsonb
language plpgsql security invoker set search_path = '' as $$
declare d public.job_finder_deliveries;
begin
  select * into d from public.job_finder_deliveries where session_id=p_id and kind=p_kind for update skip locked;
  if not found or d.status in ('sent','review','skipped') or d.lease_until > now() then return null; end if;
  update public.job_finder_deliveries set status='sending',attempts=attempts+1,first_attempt_at=coalesce(first_attempt_at,now()),lease_until=now()+interval '2 minutes'
    where session_id=p_id and kind=p_kind returning * into d;
  return to_jsonb(d);
end $$;
revoke all on function public.claim_job_finder_delivery(uuid,text) from public, anon, authenticated;
grant execute on function public.claim_job_finder_delivery(uuid,text) to service_role;

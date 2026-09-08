-- Der Hash erlaubt die sichere Wiederaufnahme eines bestätigten CV-Auftrags.
alter table public.job_finder_sessions add column cv_sha256 text not null check (cv_sha256 ~ '^[a-f0-9]{64}$');
alter table public.job_finder_sessions drop constraint job_finder_sessions_jobs_check;
alter table public.job_finder_sessions add constraint job_finder_sessions_jobs_check check (jsonb_typeof(jobs) = 'array' and jsonb_array_length(jobs) between 0 and 60);
create index job_finder_sessions_upload_pending_idx on public.job_finder_sessions(created_at) where cv_uploaded_at is null;

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
  insert into public.job_finder_sessions (id,name,cv_path,cv_filename,cv_sha256,jobs,synthetic,ip_hash,email_from,email_to)
    values ((p_session->>'id')::uuid,p_session->>'name',p_session->>'cv_path',p_session->>'cv_filename',p_session->>'cv_sha256',p_session->'jobs',(p_session->>'synthetic')::boolean,p_session->>'ip_hash',p_session->>'email_from',p_session->'email_to')
    returning * into existing;
  return to_jsonb(existing);
end $$;
revoke all on function public.create_job_finder_session(jsonb) from public, anon, authenticated;
grant execute on function public.create_job_finder_session(jsonb) to service_role;

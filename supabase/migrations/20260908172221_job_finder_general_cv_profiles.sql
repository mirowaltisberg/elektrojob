-- Ein allgemeiner CV braucht keine fiktive Stelle. Bestehende Bewerbungen bleiben unveraendert.
alter table public.applications add column application_kind text not null default 'job' check(application_kind in ('job','profile'));
alter table public.applications alter column job_id drop not null;
alter table public.applications add constraint applications_job_or_profile_check check(job_id is not null or application_kind='profile');

create or replace function public.confirm_job_finder_cv(p_id uuid) returns jsonb
language plpgsql security invoker set search_path = '' as $$
declare s public.job_finder_sessions;
begin
  update public.job_finder_sessions set cv_uploaded_at=coalesce(cv_uploaded_at,now())
    where id=p_id and access_expires_at > now() returning * into s;
  if not found then raise exception 'finder_expired'; end if;
  insert into public.applications (id,job_id,application_kind,name,email,phone,cv_path,cv_filename,source,site,status,consent_version,consented_at,retention_expires_at,ip_hash,submitted_at)
    values(s.id,null,'profile',s.name,null,null,s.cv_path,s.cv_filename,case when s.synthetic then 'synthetic' else 'form' end,'elektrojob.ch','received',s.consent_version,s.consented_at,s.retention_expires_at,s.ip_hash,now())
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
  update public.applications set message=p_summary where id=p_id and application_kind='profile';
  insert into public.job_finder_deliveries(session_id,kind) values(p_id,'summary') on conflict do nothing;
  return to_jsonb(s);
end $$;
revoke all on function public.finish_job_finder_session(uuid,jsonb,text) from public, anon, authenticated;
grant execute on function public.finish_job_finder_session(uuid,jsonb,text) to service_role;

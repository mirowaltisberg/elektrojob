-- Private Sichtungsnachweise. Keine Firmenangaben und keine öffentliche API.
create table public.job_ad_scrape_state (
  trade text primary key,
  observed_at timestamptz not null
);
create table public.job_ad_lifecycle (
  trade text not null,
  source_key text not null check (source_key ~ '^[a-f0-9]{64}$'),
  last_seen_at timestamptz not null,
  checked_at timestamptz not null,
  missing_since timestamptz,
  missing_runs integer not null default 0 check (missing_runs >= 0),
  primary key (trade, source_key)
);
alter table public.job_ad_scrape_state enable row level security;
alter table public.job_ad_lifecycle enable row level security;
revoke all on public.job_ad_scrape_state, public.job_ad_lifecycle from public, anon, authenticated;
grant select, insert, update, delete on public.job_ad_scrape_state, public.job_ad_lifecycle to service_role;

create function public.record_job_ad_snapshot(p_trade text, p_observed_at timestamptz, p_seen_keys text[])
returns boolean language plpgsql security invoker set search_path = '' as $$
declare previous timestamptz;
begin
  if p_trade is distinct from 'elektro' or p_observed_at is null
    or p_observed_at > now() or p_observed_at < now() - interval '1 day'
    or p_seen_keys is null or cardinality(p_seen_keys) not between 1 and 10000
    or exists (select 1 from unnest(p_seen_keys) k where k is null or k !~ '^[a-f0-9]{64}$') then
    raise exception 'Invalid completed scrape';
  end if;
  perform pg_advisory_xact_lock(hashtextextended('job_ad_snapshot:' || p_trade, 0));
  select observed_at into previous from public.job_ad_scrape_state where trade = p_trade;
  if previous is not null and p_observed_at <= previous then return false; end if;

  update public.job_ad_lifecycle set
    checked_at = p_observed_at,
    missing_since = coalesce(missing_since, p_observed_at),
    missing_runs = least(missing_runs + 1, 1000)
  where trade = p_trade and not (source_key = any(p_seen_keys));

  insert into public.job_ad_lifecycle(trade, source_key, last_seen_at, checked_at)
  select p_trade, k, p_observed_at, p_observed_at from (select distinct unnest(p_seen_keys) k) keys
  on conflict (trade, source_key) do update set
    last_seen_at = excluded.last_seen_at, checked_at = excluded.checked_at,
    missing_since = null, missing_runs = 0;

  insert into public.job_ad_scrape_state values (p_trade, p_observed_at)
  on conflict (trade) do update set observed_at = excluded.observed_at;
  -- Veraltete Nachweise müssen nicht unbegrenzt aufbewahrt werden.
  delete from public.job_ad_lifecycle where trade = p_trade
    and last_seen_at < p_observed_at - interval '90 days';
  return true;
end $$;
revoke all on function public.record_job_ad_snapshot(text, timestamptz, text[]) from public, anon, authenticated;
grant execute on function public.record_job_ad_snapshot(text, timestamptz, text[]) to service_role;

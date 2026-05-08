-- Tinder-for-jobs feature schema
-- Apply via Supabase MCP or the SQL editor in the Supabase dashboard.

create table if not exists public.swipe_sessions (
  id uuid primary key default gen_random_uuid(),
  plz text not null,
  email text not null,
  phone text not null,
  cv_path text not null,
  cv_filename text not null,
  user_agent text,
  ip_hash text,
  created_at timestamptz not null default now()
);

create index if not exists swipe_sessions_email_idx
  on public.swipe_sessions (email);

create table if not exists public.swipe_decisions (
  id bigserial primary key,
  session_id uuid not null references public.swipe_sessions(id) on delete cascade,
  job_id text not null,
  direction text not null check (direction in ('left','right')),
  created_at timestamptz not null default now(),
  unique (session_id, job_id)
);

create index if not exists swipe_decisions_session_idx
  on public.swipe_decisions (session_id, created_at desc);

-- Tag applications by channel so we can distinguish form vs swipe submissions.
alter table public.applications
  add column if not exists source text not null default 'form';

create index if not exists applications_source_idx
  on public.applications (source);

-- RLS: server-only writes (service role) to all three tables.
alter table public.swipe_sessions enable row level security;
alter table public.swipe_decisions enable row level security;

-- No public policies — only the service role (bypasses RLS) writes.

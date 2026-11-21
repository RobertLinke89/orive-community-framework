-- ORIVE Dezk: personal calendar entries + in-app facilitator–seeker chat.
-- FILE ONLY — do not apply until Robert approves.
-- RLS: each facilitator only sees their own rows (auth.uid() = facilitator_id).
-- Chat messages are in-app only. Sending a row here must never trigger email,
-- WhatsApp, or any other outbound notification.

create table if not exists public.dezk_entries (
  id uuid primary key default gen_random_uuid(),
  facilitator_id uuid not null references auth.users (id) on delete cascade,
  title text not null,
  entry_date date not null,
  start_time time,
  end_time time,
  all_day boolean not null default false,
  entry_type text not null check (entry_type in ('personal', 'reminder', 'note', 'social')),
  meta text,
  done boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists dezk_entries_facilitator_date_idx
  on public.dezk_entries (facilitator_id, entry_date);

create table if not exists public.dezk_threads (
  id uuid primary key default gen_random_uuid(),
  facilitator_id uuid not null references auth.users (id) on delete cascade,
  -- Seeker identity as known from a booking or directory inquiry (no new auth required for v1).
  seeker_key text not null,
  seeker_name text,
  seeker_email text,
  source text not null default 'booking' check (source in ('booking', 'inquiry')),
  source_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (facilitator_id, seeker_key)
);

create index if not exists dezk_threads_facilitator_idx
  on public.dezk_threads (facilitator_id);

create table if not exists public.dezk_messages (
  id uuid primary key default gen_random_uuid(),
  thread_id uuid not null references public.dezk_threads (id) on delete cascade,
  facilitator_id uuid not null references auth.users (id) on delete cascade,
  sender text not null check (sender in ('facilitator', 'seeker')),
  body text not null,
  created_at timestamptz not null default now()
);

create index if not exists dezk_messages_thread_idx
  on public.dezk_messages (thread_id, created_at);

-- Optional notification-read receipts (today the bell uses localStorage).
create table if not exists public.dezk_notice_reads (
  facilitator_id uuid not null references auth.users (id) on delete cascade,
  notice_id text not null,
  read_at timestamptz not null default now(),
  primary key (facilitator_id, notice_id)
);

alter table public.dezk_entries enable row level security;
alter table public.dezk_threads enable row level security;
alter table public.dezk_messages enable row level security;
alter table public.dezk_notice_reads enable row level security;

create policy dezk_entries_own on public.dezk_entries
  for all using (auth.uid() = facilitator_id)
  with check (auth.uid() = facilitator_id);

create policy dezk_threads_own on public.dezk_threads
  for all using (auth.uid() = facilitator_id)
  with check (auth.uid() = facilitator_id);

create policy dezk_messages_own on public.dezk_messages
  for all using (auth.uid() = facilitator_id)
  with check (auth.uid() = facilitator_id);

create policy dezk_notice_reads_own on public.dezk_notice_reads
  for all using (auth.uid() = facilitator_id)
  with check (auth.uid() = facilitator_id);

-- Intentionally no trigger, webhook, or Edge Function on these tables.
-- Application code that inserts dezk_messages must not call sendEmail,
-- WhatsApp Cloud API, or any notify path.

-- Radar presence / visibility. Default is incognito (privacy by default).
-- FILE ONLY — do not apply until Robert approves.
-- A facilitator appears with name + avatar on other people's radars only when
-- visibility = 'live'. Others may read live rows only; incognito rows are
-- never readable by anyone except the owner.

create table if not exists public.dezk_presence (
  facilitator_id uuid primary key references auth.users (id) on delete cascade,
  visibility text not null default 'incognito' check (visibility in ('incognito', 'live')),
  updated_at timestamptz not null default now()
);

alter table public.dezk_presence enable row level security;

create policy dezk_presence_own on public.dezk_presence
  for all using (auth.uid() = facilitator_id)
  with check (auth.uid() = facilitator_id);

-- Other authenticated users may only see profiles that opted into Live.
create policy dezk_presence_live_read on public.dezk_presence
  for select using (visibility = 'live');

-- No trigger or notification on visibility changes.

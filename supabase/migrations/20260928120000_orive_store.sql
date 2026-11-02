-- One document for ORIVE bookings, slots and intake.
-- The API updates it with a version check so two writes cannot overwrite each other.
create table if not exists public.orive_store (
  id text primary key,
  version integer not null default 1,
  body jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.orive_store enable row level security;

-- The Next.js server writes with the service role, which bypasses RLS.
-- The anon key has no policy, so the document is not public.

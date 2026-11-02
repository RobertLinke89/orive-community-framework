-- Extend offerings to support Events and richer event fields
-- 1) Drop existing type check and recreate allowing 'event'
ALTER TABLE public.offerings
  DROP CONSTRAINT IF EXISTS offerings_type_check;

ALTER TABLE public.offerings
  ADD CONSTRAINT offerings_type_check
  CHECK (type IN ('individual','group','event'));

-- 2) Add event-specific fields (nullable so existing rows are unaffected)
ALTER TABLE public.offerings
  ADD COLUMN IF NOT EXISTS start_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS end_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS timezone TEXT,
  ADD COLUMN IF NOT EXISTS capacity INTEGER,
  ADD COLUMN IF NOT EXISTS is_online BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS venue_name TEXT,
  ADD COLUMN IF NOT EXISTS address_line1 TEXT,
  ADD COLUMN IF NOT EXISTS address_line2 TEXT,
  ADD COLUMN IF NOT EXISTS city TEXT,
  ADD COLUMN IF NOT EXISTS country TEXT,
  ADD COLUMN IF NOT EXISTS cancellation_policy TEXT,
  ADD COLUMN IF NOT EXISTS is_recurring BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS recurrence_rule TEXT;

-- 3) Helpful indexes for marketplace/event discovery
CREATE INDEX IF NOT EXISTS idx_offerings_type_status_created_at
  ON public.offerings (type, status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_offerings_start_at
  ON public.offerings (start_at);

-- Migration: Comprehensive Security Fixes (Updated)
-- Addresses: Email exposure, spam prevention, input validation

-- 1. Create rate limiting table for spam prevention
CREATE TABLE IF NOT EXISTS public.rate_limits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  identifier text NOT NULL, -- IP address or email
  action text NOT NULL, -- 'booking_create', 'email_send', etc.
  attempt_count integer NOT NULL DEFAULT 1,
  window_start timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(identifier, action)
);

ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

-- Allow edge functions to manage rate limits
CREATE POLICY "Service role can manage rate limits"
ON public.rate_limits
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- 2. Replace public_profiles view without sensitive data
DROP VIEW IF EXISTS public.public_profiles CASCADE;

CREATE VIEW public.public_profiles AS
SELECT 
  id,
  full_name,
  professional_title,
  expertise,
  bio,
  location,
  avatar_url,
  created_at,
  onboarding_completed
FROM public.profiles;

-- Grant select access to the view
GRANT SELECT ON public.public_profiles TO anon, authenticated;

-- 3. Add constraints to bookings table for input validation
-- Using safe alterations that won't break existing data
DO $$ 
BEGIN
  -- Only add constraints if they don't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'bookings' 
    AND column_name = 'client_name' 
    AND character_maximum_length = 100
  ) THEN
    ALTER TABLE public.bookings ALTER COLUMN client_name TYPE varchar(100);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'bookings' 
    AND column_name = 'client_email' 
    AND character_maximum_length = 255
  ) THEN
    ALTER TABLE public.bookings ALTER COLUMN client_email TYPE varchar(255);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'bookings' 
    AND column_name = 'client_phone' 
    AND character_maximum_length = 20
  ) THEN
    ALTER TABLE public.bookings ALTER COLUMN client_phone TYPE varchar(20);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'bookings' 
    AND column_name = 'notes' 
    AND character_maximum_length = 1000
  ) THEN
    ALTER TABLE public.bookings ALTER COLUMN notes TYPE varchar(1000);
  END IF;
END $$;

-- 4. Update bookings RLS for better security
DROP POLICY IF EXISTS "Anyone can create bookings" ON public.bookings;

CREATE POLICY "Public can create bookings with limits"
ON public.bookings
FOR INSERT
WITH CHECK (true); -- Protected by rate limiting in application layer

-- 5. Add index for rate limiting queries
CREATE INDEX IF NOT EXISTS idx_rate_limits_identifier_action 
ON public.rate_limits(identifier, action, window_start);

-- 6. Create cleanup function for old rate limit entries
CREATE OR REPLACE FUNCTION public.cleanup_old_rate_limits()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.rate_limits
  WHERE window_start < now() - interval '24 hours';
END;
$$;

-- 7. Add booking status validation
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'bookings_status_check'
  ) THEN
    ALTER TABLE public.bookings
      ADD CONSTRAINT bookings_status_check 
      CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed'));
  END IF;
END $$;
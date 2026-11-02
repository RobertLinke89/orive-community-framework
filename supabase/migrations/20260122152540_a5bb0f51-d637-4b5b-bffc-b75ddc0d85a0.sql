-- Add marketplace visibility flag to profiles
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS is_visible boolean NOT NULL DEFAULT false;

-- Ensure public_profiles view only exposes profiles that opted in + completed onboarding
-- IMPORTANT: keep the exact same column order as the existing view
CREATE OR REPLACE VIEW public.public_profiles AS
SELECT
  id,
  full_name,
  professional_title,
  expertise,
  bio,
  location,
  avatar_url,
  banner_url,
  onboarding_completed,
  created_at
  -- Explicitly EXCLUDES: email (PII that should not be public)
FROM public.profiles
WHERE onboarding_completed = true
  AND is_visible = true;

-- Tighten public profile function to respect visibility
CREATE OR REPLACE FUNCTION public.get_public_profile(profile_id uuid)
RETURNS TABLE(
  id uuid,
  full_name text,
  professional_title text,
  expertise text,
  bio text,
  location text,
  avatar_url text,
  banner_url text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id,
    p.full_name,
    p.professional_title,
    p.expertise,
    p.bio,
    p.location,
    p.avatar_url,
    p.banner_url
  FROM public.profiles p
  WHERE p.id = profile_id
    AND p.onboarding_completed = true
    AND p.is_visible = true;
END;
$$;

-- Tighten public availability function to respect visibility
CREATE OR REPLACE FUNCTION public.get_public_availability(p_facilitator_id uuid)
RETURNS TABLE(day_of_week integer, start_time time without time zone, end_time time without time zone)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only return availability for facilitators that are public/active AND opted-in to marketplace visibility
  IF NOT EXISTS (
    SELECT 1
    FROM public.profiles p
    WHERE p.id = p_facilitator_id
      AND p.onboarding_completed = true
      AND p.is_visible = true
  ) THEN
    RETURN;
  END IF;

  RETURN QUERY
  SELECT a.day_of_week, a.start_time, a.end_time
  FROM public.availability_slots a
  WHERE a.facilitator_id = p_facilitator_id
    AND a.is_available = true
  ORDER BY a.day_of_week, a.start_time
  LIMIT 200;
END;
$$;

-- Helpful index for marketplace listing filters
CREATE INDEX IF NOT EXISTS idx_profiles_visible_onboarded_created_at
ON public.profiles (is_visible, onboarding_completed, created_at DESC);

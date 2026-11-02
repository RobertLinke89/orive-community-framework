-- ============================================
-- SECURE PROFILES TABLE - PREVENT EMAIL EXPOSURE
-- ============================================

-- 1. Drop and recreate the public_profiles view to ensure it excludes email
-- Using security_invoker to respect RLS of the querying user
DROP VIEW IF EXISTS public.public_profiles;

CREATE VIEW public.public_profiles
WITH (security_invoker = on) AS
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
  -- Explicitly EXCLUDES: email (PII that should not be public)
FROM public.profiles
WHERE onboarding_completed = true;

-- 2. Add explicit DENY policy for anonymous users on profiles table
-- This ensures unauthenticated users cannot access profiles directly
CREATE POLICY "Anonymous users cannot access profiles"
ON public.profiles
FOR SELECT
TO anon
USING (false);

-- 3. Add explicit DENY for anonymous INSERT/UPDATE/DELETE
CREATE POLICY "Anonymous users cannot modify profiles"
ON public.profiles
FOR ALL
TO anon
USING (false)
WITH CHECK (false);

-- 4. Create a secure function for public profile lookup (without email)
-- This allows looking up facilitator info for booking pages without exposing email
CREATE OR REPLACE FUNCTION public.get_public_profile(profile_id uuid)
RETURNS TABLE (
  id uuid,
  full_name text,
  professional_title text,
  expertise text,
  bio text,
  location text,
  avatar_url text
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
    p.avatar_url
  FROM public.profiles p
  WHERE p.id = profile_id
    AND p.onboarding_completed = true;
END;
$$;

-- Grant execute to both anon and authenticated for public profile lookup
GRANT EXECUTE ON FUNCTION public.get_public_profile(uuid) TO anon;
GRANT EXECUTE ON FUNCTION public.get_public_profile(uuid) TO authenticated;
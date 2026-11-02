-- Fix 1: Remove overly permissive RLS policies on profiles table
-- These policies allow anyone to query profiles directly and access email addresses
DROP POLICY IF EXISTS "Anonymous users can view profiles" ON public.profiles;
DROP POLICY IF EXISTS "Authenticated users can view other profiles" ON public.profiles;

-- Fix 2: Recreate public_profiles view with SECURITY INVOKER
-- This ensures the view uses the querying user's permissions, not the creator's
DROP VIEW IF EXISTS public.public_profiles;

CREATE VIEW public.public_profiles
WITH (security_invoker = true)
AS
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

-- Note: Users can still view their own complete profile via:
-- "Users can view their own complete profile" policy (USING: auth.uid() = id)
-- Public access is now only through public_profiles view (no emails exposed)
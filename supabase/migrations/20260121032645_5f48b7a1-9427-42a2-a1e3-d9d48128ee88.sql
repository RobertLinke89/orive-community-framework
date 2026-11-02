-- Fix: profiles_table_email_exposure
-- Remove email from profiles table since it's already stored in auth.users
-- Update the get_public_profile function to not include email (already secure)
-- Remove the email column from the profiles table to eliminate exposure risk

-- First, update the public_profiles view to ensure email is not exposed
DROP VIEW IF EXISTS public.public_profiles;

CREATE VIEW public.public_profiles AS
SELECT 
  p.id,
  p.full_name,
  p.professional_title,
  p.expertise,
  p.bio,
  p.location,
  p.avatar_url,
  p.banner_url,
  p.onboarding_completed,
  p.created_at
FROM public.profiles p
WHERE p.onboarding_completed = true;

-- Grant SELECT on the view to authenticated and anon users
GRANT SELECT ON public.public_profiles TO authenticated;
GRANT SELECT ON public.public_profiles TO anon;

-- Drop the email column from profiles since it duplicates auth.users.email
-- Note: We keep email in auth.users which is the secure source
ALTER TABLE public.profiles DROP COLUMN IF EXISTS email;
-- Add banner_url column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS banner_url TEXT;

-- Drop and recreate the public_profiles view to include banner_url
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
  banner_url,
  onboarding_completed,
  created_at
FROM public.profiles;

-- Grant access to the view
GRANT SELECT ON public.public_profiles TO anon, authenticated;

-- Update the get_public_profile function to include banner_url
DROP FUNCTION IF EXISTS public.get_public_profile(uuid);

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
    AND p.onboarding_completed = true;
END;
$$;

-- Add comment
COMMENT ON COLUMN public.profiles.banner_url IS 'URL for the facilitator profile banner/cover photo';
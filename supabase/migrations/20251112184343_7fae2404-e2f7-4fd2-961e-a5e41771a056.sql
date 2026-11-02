-- Recreate the view with SECURITY INVOKER to use querying user's permissions
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
  onboarding_completed,
  created_at,
  updated_at
FROM public.profiles;

-- Grant access to the view
GRANT SELECT ON public.public_profiles TO anon, authenticated;

-- Add helpful comment
COMMENT ON VIEW public.public_profiles IS 
'Public view of profiles without sensitive data like email addresses. Use this view for displaying facilitator profiles to other users. Uses SECURITY INVOKER for proper RLS enforcement.';

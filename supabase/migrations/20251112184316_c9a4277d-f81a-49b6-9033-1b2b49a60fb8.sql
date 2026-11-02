-- Drop the public viewing policy since RLS policies are additive (OR logic)
-- With two policies, users could still see all data via the permissive policy
DROP POLICY IF EXISTS "Public profiles are viewable without email" ON public.profiles;

-- Now we only have one policy: users can see their own complete profile
-- For public viewing, we'll create a view that excludes sensitive data

-- Create a public view of profiles without email addresses
CREATE OR REPLACE VIEW public.public_profiles AS
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
'Public view of profiles without sensitive data like email addresses. Use this view for displaying facilitator profiles to other users.';

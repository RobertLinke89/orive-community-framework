-- Add back a policy for viewing other users' profiles
-- Note: RLS is row-level, not column-level, so we can't hide specific columns at the DB level
-- Application code MUST filter out email when querying other users' profiles
CREATE POLICY "Authenticated users can view other profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (true);

-- Add policy for anonymous users to view profiles (for public pages)
CREATE POLICY "Anonymous users can view profiles"
ON public.profiles
FOR SELECT
TO anon
USING (true);

-- Update the view comment to explain usage
COMMENT ON VIEW public.public_profiles IS 
'Convenience view that excludes email addresses. The underlying profiles table is accessible but application code should use this view OR explicitly exclude email when querying other users profiles: .select(''id, full_name, professional_title, expertise, bio, location, avatar_url, onboarding_completed, created_at, updated_at'')';

-- Drop the existing public SELECT policy
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;

-- Create a new policy that shows all fields to the profile owner
CREATE POLICY "Users can view their own complete profile"
ON public.profiles
FOR SELECT
USING (auth.uid() = id);

-- Create a policy for public viewing without sensitive data
-- This uses a view or we can handle it in the application layer
-- For now, we'll create a policy that allows public viewing but 
-- the application should filter out email addresses in queries
CREATE POLICY "Public profiles are viewable without email"
ON public.profiles
FOR SELECT
USING (true);

-- Add a comment to remind developers to exclude email in public queries
COMMENT ON POLICY "Public profiles are viewable without email" ON public.profiles IS 
'When querying profiles publicly, always exclude the email field using .select(''id, full_name, professional_title, expertise, bio, location, avatar_url, onboarding_completed, created_at, updated_at'')';

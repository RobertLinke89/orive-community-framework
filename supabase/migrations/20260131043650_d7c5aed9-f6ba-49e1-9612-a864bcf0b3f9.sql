-- Add explicit deny policy for anonymous SELECT on waitlist
-- This table already has admin-only SELECT but needs explicit anon denial
CREATE POLICY "Deny anonymous select waitlist"
ON public.waitlist
FOR SELECT
TO anon
USING (false);

-- Add explicit deny policy for anonymous UPDATE on waitlist
CREATE POLICY "Deny anonymous update waitlist"
ON public.waitlist
FOR UPDATE
TO anon
USING (false);

-- Add explicit deny policy for anonymous DELETE on waitlist
CREATE POLICY "Deny anonymous delete waitlist"
ON public.waitlist
FOR DELETE
TO anon
USING (false);
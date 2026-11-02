-- Harden RLS policies for bookings to explicitly deny anonymous access and restrict authenticated access

-- Ensure RLS is enabled (idempotent)
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- Drop legacy policies if they exist (names from current schema)
DROP POLICY IF EXISTS "Facilitators can view their bookings" ON public.bookings;
DROP POLICY IF EXISTS "Facilitators can update their bookings" ON public.bookings;
DROP POLICY IF EXISTS "Only service role can insert bookings" ON public.bookings;

-- Explicitly deny all anonymous access
CREATE POLICY "Deny anonymous select bookings"
ON public.bookings
FOR SELECT
TO anon
USING (false);

CREATE POLICY "Deny anonymous insert bookings"
ON public.bookings
FOR INSERT
TO anon
WITH CHECK (false);

CREATE POLICY "Deny anonymous update bookings"
ON public.bookings
FOR UPDATE
TO anon
USING (false)
WITH CHECK (false);

CREATE POLICY "Deny anonymous delete bookings"
ON public.bookings
FOR DELETE
TO anon
USING (false);

-- Allow authenticated facilitators to read/update only their own bookings
CREATE POLICY "Facilitators can view their bookings"
ON public.bookings
FOR SELECT
TO authenticated
USING (auth.uid() = facilitator_id);

CREATE POLICY "Facilitators can update their bookings"
ON public.bookings
FOR UPDATE
TO authenticated
USING (auth.uid() = facilitator_id)
WITH CHECK (auth.uid() = facilitator_id);

-- Prevent authenticated users from inserting/deleting bookings directly (handled by backend service role)
CREATE POLICY "Deny authenticated insert bookings"
ON public.bookings
FOR INSERT
TO authenticated
WITH CHECK (false);

CREATE POLICY "Deny authenticated delete bookings"
ON public.bookings
FOR DELETE
TO authenticated
USING (false);

-- Allow service role to insert bookings (defense-in-depth; service role typically bypasses RLS)
CREATE POLICY "Service role can insert bookings"
ON public.bookings
FOR INSERT
TO service_role
WITH CHECK (true);

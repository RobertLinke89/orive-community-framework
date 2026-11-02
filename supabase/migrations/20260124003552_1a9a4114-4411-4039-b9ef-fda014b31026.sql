-- Fix: ensure new analytics policies do not apply to anonymous users

-- marketing_events
DROP POLICY IF EXISTS "Admins can read marketing events" ON public.marketing_events;
DROP POLICY IF EXISTS "Facilitators can read their marketing events" ON public.marketing_events;
DROP POLICY IF EXISTS "Deny inserts marketing events" ON public.marketing_events;
DROP POLICY IF EXISTS "Deny updates marketing events" ON public.marketing_events;
DROP POLICY IF EXISTS "Deny deletes marketing events" ON public.marketing_events;

CREATE POLICY "Admins can read marketing events"
ON public.marketing_events
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "Facilitators can read their marketing events"
ON public.marketing_events
FOR SELECT
TO authenticated
USING (auth.uid() = facilitator_id);

CREATE POLICY "Deny inserts marketing events"
ON public.marketing_events
FOR INSERT
TO authenticated
WITH CHECK (false);

CREATE POLICY "Deny updates marketing events"
ON public.marketing_events
FOR UPDATE
TO authenticated
USING (false);

CREATE POLICY "Deny deletes marketing events"
ON public.marketing_events
FOR DELETE
TO authenticated
USING (false);


-- booking_attributions
DROP POLICY IF EXISTS "Admins can read booking attributions" ON public.booking_attributions;
DROP POLICY IF EXISTS "Facilitators can read their booking attributions" ON public.booking_attributions;
DROP POLICY IF EXISTS "Deny inserts booking attributions" ON public.booking_attributions;
DROP POLICY IF EXISTS "Deny updates booking attributions" ON public.booking_attributions;
DROP POLICY IF EXISTS "Deny deletes booking attributions" ON public.booking_attributions;

CREATE POLICY "Admins can read booking attributions"
ON public.booking_attributions
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "Facilitators can read their booking attributions"
ON public.booking_attributions
FOR SELECT
TO authenticated
USING (auth.uid() = facilitator_id);

CREATE POLICY "Deny inserts booking attributions"
ON public.booking_attributions
FOR INSERT
TO authenticated
WITH CHECK (false);

CREATE POLICY "Deny updates booking attributions"
ON public.booking_attributions
FOR UPDATE
TO authenticated
USING (false);

CREATE POLICY "Deny deletes booking attributions"
ON public.booking_attributions
FOR DELETE
TO authenticated
USING (false);

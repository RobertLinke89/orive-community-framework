-- Fix reviews policy that compares encrypted email with plaintext
-- The current policy compares encrypted b.client_email with plaintext auth.users.email
-- which will always fail because encrypt_pii() is used on bookings.client_email

DROP POLICY IF EXISTS "Users can only review offerings they booked" ON public.reviews;

CREATE POLICY "Users can only review offerings they booked" 
ON public.reviews 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.bookings b
    WHERE b.offering_id = reviews.offering_id
      AND b.status = 'completed'
      AND public.decrypt_pii(b.client_email) = (
        SELECT email FROM auth.users WHERE id = auth.uid()
      )
  )
);
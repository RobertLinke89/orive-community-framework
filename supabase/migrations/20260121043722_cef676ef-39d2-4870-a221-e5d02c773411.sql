-- Fix the reviews INSERT policy that has column ambiguity bug
-- The current policy resolves b.offering_id = b.offering_id (always true!)
-- We need to reference reviews.offering_id from the row being inserted

DROP POLICY IF EXISTS "Users can only review offerings they booked" ON public.reviews;

CREATE POLICY "Users can only review offerings they booked" 
ON public.reviews 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.bookings b
    WHERE b.offering_id = reviews.offering_id
      AND b.status = 'completed'
      AND b.client_email = (
        SELECT email FROM auth.users WHERE id = auth.uid()
      )
  )
);
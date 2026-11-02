-- First drop the policy that depends on client_email column
DROP POLICY IF EXISTS "Users can only review offerings they booked" ON public.reviews;

-- Now change the bookings PII columns to text to accommodate encrypted data
ALTER TABLE public.bookings 
  ALTER COLUMN client_name TYPE text,
  ALTER COLUMN client_email TYPE text,
  ALTER COLUMN client_phone TYPE text;

-- Recreate the review policy using decrypted email comparison
CREATE POLICY "Users can only review offerings they booked" 
ON public.reviews 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM bookings b
    WHERE b.offering_id = reviews.offering_id 
      AND b.status = 'completed'
      AND public.decrypt_pii(b.client_email) = (
        SELECT email FROM auth.users WHERE id = auth.uid()
      )
  )
);
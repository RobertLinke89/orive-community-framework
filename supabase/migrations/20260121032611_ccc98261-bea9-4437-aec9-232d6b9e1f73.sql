-- Fix: reviews_unrestricted_insert
-- Add a policy that verifies the reviewer has a completed booking for the offering_id before allowing review creation

-- First, drop the existing overly permissive INSERT policy
DROP POLICY IF EXISTS "Authenticated users can create reviews" ON public.reviews;

-- Create a new policy that requires the reviewer to have a completed booking
-- for the specific offering they are reviewing
CREATE POLICY "Users can only review offerings they booked" 
ON public.reviews 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.bookings b
    WHERE b.offering_id = offering_id
      AND b.status = 'completed'
      AND b.client_email = (
        SELECT email FROM auth.users WHERE id = auth.uid()
      )
  )
);

-- Also add a booking_id column to link reviews to specific bookings for audit trail
ALTER TABLE public.reviews 
ADD COLUMN IF NOT EXISTS booking_id uuid REFERENCES public.bookings(id);

-- Add user_id column to track who created the review
ALTER TABLE public.reviews 
ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id);
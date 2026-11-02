-- Fix security issues from previous migration

-- 1. Drop the problematic view that exposes auth.users
DROP VIEW IF EXISTS public.client_bookings;

-- 2. Create a safer approach: security definer function for client data access
-- This avoids exposing auth.users via a view
CREATE OR REPLACE FUNCTION public.get_my_bookings()
RETURNS TABLE (
  id uuid,
  booking_date date,
  booking_time time,
  duration integer,
  status text,
  created_at timestamptz,
  facilitator_id uuid,
  offering_id uuid,
  notes text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_email text;
BEGIN
  -- Get the current user's email securely
  SELECT email INTO user_email FROM auth.users WHERE id = auth.uid();
  
  -- Return bookings matching their email
  RETURN QUERY
  SELECT 
    b.id,
    b.booking_date,
    b.booking_time,
    b.duration,
    b.status,
    b.created_at,
    b.facilitator_id,
    b.offering_id,
    b.notes
  FROM public.bookings b
  WHERE b.client_email = user_email;
END;
$$;

-- Grant execute to authenticated users
GRANT EXECUTE ON FUNCTION public.get_my_bookings() TO authenticated;
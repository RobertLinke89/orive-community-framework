-- Create a function to get remaining spots for an offering (bypasses RLS via SECURITY DEFINER)
CREATE OR REPLACE FUNCTION public.get_offering_remaining_spots(p_offering_id uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_capacity integer;
  v_booked_count integer;
BEGIN
  -- Get the capacity from the offering
  SELECT capacity INTO v_capacity
  FROM public.offerings
  WHERE id = p_offering_id;
  
  -- If no capacity set, return NULL
  IF v_capacity IS NULL THEN
    RETURN NULL;
  END IF;
  
  -- Count confirmed/pending bookings for this offering
  SELECT COUNT(*)::integer INTO v_booked_count
  FROM public.bookings
  WHERE offering_id = p_offering_id
    AND status IN ('confirmed', 'pending');
  
  -- Return remaining spots (minimum 0)
  RETURN GREATEST(0, v_capacity - v_booked_count);
END;
$$;
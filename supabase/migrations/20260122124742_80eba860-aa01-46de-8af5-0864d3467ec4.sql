-- Reduce public scraping risk by removing unrestricted SELECT from availability_slots
-- and providing a controlled RPC for public availability lookups.

-- 1) Remove overly-broad public read policy
DROP POLICY IF EXISTS "Anyone can view availability" ON public.availability_slots;

-- 2) Create a controlled function for public availability lookup (single facilitator only)
CREATE OR REPLACE FUNCTION public.get_public_availability(p_facilitator_id uuid)
RETURNS TABLE(
  day_of_week integer,
  start_time time without time zone,
  end_time time without time zone
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO public
AS $$
BEGIN
  -- Only return availability for facilitators that are public/active (onboarding completed)
  IF NOT EXISTS (
    SELECT 1
    FROM public.profiles p
    WHERE p.id = p_facilitator_id
      AND p.onboarding_completed = true
  ) THEN
    RETURN;
  END IF;

  RETURN QUERY
  SELECT a.day_of_week, a.start_time, a.end_time
  FROM public.availability_slots a
  WHERE a.facilitator_id = p_facilitator_id
    AND a.is_available = true
  ORDER BY a.day_of_week, a.start_time
  LIMIT 200;
END;
$$;

-- Fix: Postgres cannot change OUT-parameter rowtype in-place; drop and recreate get_my_bookings()

DROP FUNCTION IF EXISTS public.get_my_bookings();

CREATE OR REPLACE FUNCTION public.get_my_bookings()
RETURNS TABLE(
  id uuid,
  booking_date date,
  booking_time time without time zone,
  duration integer,
  status text,
  created_at timestamp with time zone,
  facilitator_id uuid,
  offering_id uuid,
  notes text,
  client_name text,
  client_email text,
  client_phone text,
  payment_status text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  user_email text;
  current_user_id uuid;
  booking_count integer;
BEGIN
  current_user_id := auth.uid();
  SELECT email INTO user_email FROM auth.users WHERE auth.users.id = current_user_id;

  SELECT COUNT(*) INTO booking_count
  FROM public.bookings b
  WHERE b.facilitator_id = current_user_id
     OR public.decrypt_pii(b.client_email::text) = user_email;

  INSERT INTO public.pii_access_log (user_id, action, resource_type, record_count)
  VALUES (current_user_id, 'view_bookings', 'booking_pii', booking_count);

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
    b.notes,
    public.decrypt_pii(b.client_name::text) as client_name,
    public.decrypt_pii(b.client_email::text) as client_email,
    public.decrypt_pii(b.client_phone::text) as client_phone,
    COALESCE(bp.status, 'unpaid') as payment_status
  FROM public.bookings b
  LEFT JOIN public.booking_payments bp ON bp.booking_id = b.id
  WHERE b.facilitator_id = current_user_id
     OR public.decrypt_pii(b.client_email::text) = user_email;
END;
$$;
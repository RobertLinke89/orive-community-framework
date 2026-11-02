-- Drop existing function to allow return type change
DROP FUNCTION IF EXISTS public.get_my_bookings();

-- Recreate get_my_bookings with decrypted PII columns
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
  client_phone text
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
  
  -- Return bookings with decrypted PII for facilitators
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
    public.decrypt_pii(b.client_phone::text) as client_phone
  FROM public.bookings b
  WHERE b.facilitator_id = auth.uid()
     OR public.decrypt_pii(b.client_email::text) = user_email;
END;
$$;

-- Add comments documenting the encryption
COMMENT ON COLUMN public.bookings.client_email IS 'Encrypted PII - use get_facilitator_bookings() to access decrypted data';
COMMENT ON COLUMN public.bookings.client_phone IS 'Encrypted PII - use get_facilitator_bookings() to access decrypted data';
COMMENT ON COLUMN public.bookings.client_name IS 'Encrypted PII - use get_facilitator_bookings() to access decrypted data';
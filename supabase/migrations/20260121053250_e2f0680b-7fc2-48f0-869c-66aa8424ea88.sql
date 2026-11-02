-- Create PII access audit log table
CREATE TABLE public.pii_access_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  record_count INTEGER DEFAULT 0,
  accessed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  ip_address TEXT,
  user_agent TEXT
);

-- Enable RLS
ALTER TABLE public.pii_access_log ENABLE ROW LEVEL SECURITY;

-- Only service role can insert (from functions)
CREATE POLICY "Only service role can insert audit logs"
ON public.pii_access_log
FOR INSERT
WITH CHECK (true);

-- Deny all other access to anonymous users
CREATE POLICY "Deny anonymous access to pii_access_log"
ON public.pii_access_log
FOR SELECT
USING (false);

-- Facilitators can view their own access logs
CREATE POLICY "Users can view their own access logs"
ON public.pii_access_log
FOR SELECT
USING (auth.uid() = user_id);

-- Create index for efficient querying
CREATE INDEX idx_pii_access_log_user_id ON public.pii_access_log(user_id);
CREATE INDEX idx_pii_access_log_accessed_at ON public.pii_access_log(accessed_at DESC);

-- Update get_my_bookings to log PII access
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
SET search_path TO 'public'
AS $function$
DECLARE
  user_email text;
  current_user_id uuid;
  booking_count integer;
BEGIN
  -- Get the current user's ID and email securely
  current_user_id := auth.uid();
  SELECT email INTO user_email FROM auth.users WHERE auth.users.id = current_user_id;
  
  -- Count bookings that will be returned (for audit)
  SELECT COUNT(*) INTO booking_count
  FROM public.bookings b
  WHERE b.facilitator_id = current_user_id
     OR public.decrypt_pii(b.client_email::text) = user_email;
  
  -- Log the PII access
  INSERT INTO public.pii_access_log (user_id, action, resource_type, record_count)
  VALUES (current_user_id, 'view_bookings', 'booking_pii', booking_count);
  
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
  WHERE b.facilitator_id = current_user_id
     OR public.decrypt_pii(b.client_email::text) = user_email;
END;
$function$;
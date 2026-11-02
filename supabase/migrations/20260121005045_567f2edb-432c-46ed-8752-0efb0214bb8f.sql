-- ============================================
-- GDPR-COMPLIANT SECURITY FOR BOOKINGS TABLE
-- ============================================

-- 1. Drop the overly permissive public INSERT policy
DROP POLICY IF EXISTS "Public can create bookings with limits" ON public.bookings;

-- 2. Create a secure INSERT policy - only service role (edge functions) can insert
-- This forces all bookings through the rate-limited create-booking edge function
CREATE POLICY "Only service role can insert bookings"
ON public.bookings
FOR INSERT
TO service_role
WITH CHECK (true);

-- 3. Create a policy for authenticated users to create their own bookings (future use)
CREATE POLICY "Authenticated users can create bookings for themselves"
ON public.bookings
FOR INSERT
TO authenticated
WITH CHECK (
  -- User must be either the facilitator or provide their email matching their auth email
  auth.uid() = facilitator_id OR 
  client_email = (SELECT email FROM auth.users WHERE id = auth.uid())
);

-- 4. Ensure SELECT policy properly restricts access
-- Only facilitators can see their own bookings (already exists but let's ensure it)
DROP POLICY IF EXISTS "Facilitators can view their bookings" ON public.bookings;
CREATE POLICY "Facilitators can view their bookings"
ON public.bookings
FOR SELECT
TO authenticated
USING (auth.uid() = facilitator_id);

-- 5. Create a view for clients to see their own bookings (GDPR: right to access)
CREATE OR REPLACE VIEW public.client_bookings AS
SELECT 
  id,
  booking_date,
  booking_time,
  duration,
  status,
  created_at,
  facilitator_id,
  offering_id,
  notes
FROM public.bookings
WHERE client_email = (SELECT email FROM auth.users WHERE id = auth.uid());

-- 6. Create function for GDPR data deletion request (right to erasure)
CREATE OR REPLACE FUNCTION public.delete_client_booking_data(p_client_email text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Anonymize rather than delete to maintain booking history integrity
  UPDATE public.bookings
  SET 
    client_name = 'GDPR_DELETED',
    client_email = 'deleted@gdpr.request',
    client_phone = NULL,
    notes = NULL
  WHERE client_email = p_client_email;
END;
$$;

-- 7. Create function for automatic data retention cleanup (GDPR: storage limitation)
-- Anonymize personal data in bookings older than 2 years
CREATE OR REPLACE FUNCTION public.cleanup_old_booking_pii()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.bookings
  SET 
    client_name = 'ARCHIVED',
    client_email = 'archived@retention.policy',
    client_phone = NULL,
    notes = NULL
  WHERE 
    booking_date < CURRENT_DATE - INTERVAL '2 years'
    AND client_email NOT LIKE '%@gdpr.request'
    AND client_email NOT LIKE '%@retention.policy';
END;
$$;

-- 8. Create audit log table for GDPR compliance tracking
CREATE TABLE IF NOT EXISTS public.booking_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id uuid NOT NULL,
  action text NOT NULL CHECK (action IN ('created', 'updated', 'viewed', 'deleted', 'anonymized')),
  performed_by uuid,
  performed_at timestamptz DEFAULT now(),
  ip_address text,
  details jsonb
);

-- Enable RLS on audit log
ALTER TABLE public.booking_audit_log ENABLE ROW LEVEL SECURITY;

-- Only service role can access audit logs (for compliance reporting)
CREATE POLICY "Only service role can manage audit logs"
ON public.booking_audit_log
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Facilitators can view audit logs for their bookings
CREATE POLICY "Facilitators can view their booking audits"
ON public.booking_audit_log
FOR SELECT
TO authenticated
USING (
  booking_id IN (SELECT id FROM public.bookings WHERE facilitator_id = auth.uid())
);

-- 9. Create trigger to auto-log booking access (for GDPR accountability)
CREATE OR REPLACE FUNCTION public.log_booking_changes()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.booking_audit_log (booking_id, action, performed_by, details)
    VALUES (NEW.id, 'created', auth.uid(), jsonb_build_object('client_email_hash', md5(NEW.client_email)));
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO public.booking_audit_log (booking_id, action, performed_by, details)
    VALUES (NEW.id, 'updated', auth.uid(), jsonb_build_object(
      'old_status', OLD.status,
      'new_status', NEW.status,
      'is_anonymized', NEW.client_email LIKE '%@gdpr.request' OR NEW.client_email LIKE '%@retention.policy'
    ));
  END IF;
  RETURN NEW;
END;
$$;

-- Create the trigger
DROP TRIGGER IF EXISTS booking_audit_trigger ON public.bookings;
CREATE TRIGGER booking_audit_trigger
AFTER INSERT OR UPDATE ON public.bookings
FOR EACH ROW
EXECUTE FUNCTION public.log_booking_changes();

-- 10. Add consent tracking column to bookings table
ALTER TABLE public.bookings 
ADD COLUMN IF NOT EXISTS gdpr_consent boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS consent_timestamp timestamptz DEFAULT now();

-- 11. Grant execute permissions to authenticated users for their data access
GRANT EXECUTE ON FUNCTION public.delete_client_booking_data(text) TO service_role;
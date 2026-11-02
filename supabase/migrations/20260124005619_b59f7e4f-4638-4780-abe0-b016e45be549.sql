-- Add audit logging for WhatsApp PII reads + allow admins to view all access logs

-- 1) Admin can read all PII access logs
ALTER TABLE public.pii_access_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can view all access logs" ON public.pii_access_log;
CREATE POLICY "Admins can view all access logs"
ON public.pii_access_log
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::public.app_role));

-- 2) Log access in get_my_whatsapp_conversations()
CREATE OR REPLACE FUNCTION public.get_my_whatsapp_conversations()
 RETURNS TABLE(id uuid, facilitator_id uuid, client_name text, client_phone text, client_phone_hash text, session_type text, status text, unread_count integer, last_message_at timestamp with time zone, created_at timestamp with time zone, updated_at timestamp with time zone)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  uid uuid;
  conversation_count integer;
BEGIN
  uid := auth.uid();
  IF uid IS NULL THEN
    RETURN;
  END IF;

  -- Count records to be returned (for audit)
  SELECT COUNT(*) INTO conversation_count
  FROM public.whatsapp_conversations c
  WHERE c.facilitator_id = uid;

  -- Log the PII access (best-effort)
  BEGIN
    INSERT INTO public.pii_access_log (user_id, action, resource_type, record_count)
    VALUES (uid, 'view_whatsapp_conversations', 'whatsapp_pii', conversation_count);
  EXCEPTION WHEN others THEN
    -- Never block core functionality if audit logging fails
    NULL;
  END;

  RETURN QUERY
  SELECT
    c.id,
    c.facilitator_id,
    public.decrypt_pii(c.client_name) as client_name,
    public.decrypt_pii(c.client_phone) as client_phone,
    c.client_phone_hash,
    c.session_type,
    c.status,
    c.unread_count,
    c.last_message_at,
    c.created_at,
    c.updated_at
  FROM public.whatsapp_conversations c
  WHERE c.facilitator_id = uid
  ORDER BY c.last_message_at DESC NULLS LAST, c.created_at DESC;
END;
$function$;

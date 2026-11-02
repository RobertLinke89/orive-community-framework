-- Harden bookings PII handling + tighten redundant policy

-- 1) Remove redundant/possibly confusing policy; default-deny already blocks anon
DROP POLICY IF EXISTS "Deny anonymous access to bookings" ON public.bookings;

-- 2) Ensure only facilitators can read bookings via table RLS (keep existing policy as-is)
-- (No change required if policy already exists.)

-- 3) Enforce database-level encryption for booking PII (defense-in-depth)
CREATE OR REPLACE FUNCTION public.bookings_secure_write()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Always encrypt PII fields if present and not already encrypted
  IF NEW.client_name IS NOT NULL AND left(NEW.client_name::text, 4) <> 'enc:' THEN
    NEW.client_name := public.encrypt_pii(NEW.client_name::text);
  END IF;

  IF NEW.client_email IS NOT NULL AND left(NEW.client_email::text, 4) <> 'enc:' THEN
    NEW.client_email := public.encrypt_pii(lower(NEW.client_email::text));
  END IF;

  IF NEW.client_phone IS NOT NULL AND left(NEW.client_phone::text, 4) <> 'enc:' THEN
    NEW.client_phone := public.encrypt_pii(NEW.client_phone::text);
  END IF;

  -- Keep updated_at fresh
  NEW.updated_at := now();

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS bookings_secure_write_trigger ON public.bookings;
CREATE TRIGGER bookings_secure_write_trigger
BEFORE INSERT OR UPDATE ON public.bookings
FOR EACH ROW
EXECUTE FUNCTION public.bookings_secure_write();

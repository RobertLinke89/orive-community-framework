-- Security hardening: encrypt WhatsApp conversation PII at rest and prevent facilitator_id manipulation

-- 1) Add a deterministic hash column for phone lookup (avoid decrypting entire table for searches)
ALTER TABLE public.whatsapp_conversations
ADD COLUMN IF NOT EXISTS client_phone_hash text;

CREATE INDEX IF NOT EXISTS idx_whatsapp_conversations_facilitator_phone_hash
ON public.whatsapp_conversations (facilitator_id, client_phone_hash);

-- 2) Trigger: encrypt PII on insert, set phone hash, and protect immutable ownership fields
CREATE OR REPLACE FUNCTION public.whatsapp_conversations_secure_write()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  plaintext_phone text;
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Ensure ownership is set correctly
    IF NEW.facilitator_id IS NULL THEN
      NEW.facilitator_id := auth.uid();
    END IF;

    -- Compute hash from provided plaintext phone
    plaintext_phone := NEW.client_phone;
    IF plaintext_phone IS NOT NULL AND left(plaintext_phone, 4) = 'enc:' THEN
      -- If somehow already encrypted, attempt to derive plaintext for hashing.
      plaintext_phone := public.decrypt_pii(plaintext_phone);
    END IF;

    IF plaintext_phone IS NOT NULL THEN
      NEW.client_phone_hash := encode(digest(plaintext_phone, 'sha256'), 'hex');
    END IF;

    -- Encrypt PII
    NEW.client_name := public.encrypt_pii(NEW.client_name);
    NEW.client_phone := public.encrypt_pii(NEW.client_phone);

    -- Ensure timestamps
    IF NEW.created_at IS NULL THEN
      NEW.created_at := now();
    END IF;
    NEW.updated_at := now();
    RETURN NEW;
  END IF;

  IF TG_OP = 'UPDATE' THEN
    -- Ownership + PII should be immutable once created
    IF NEW.facilitator_id IS DISTINCT FROM OLD.facilitator_id THEN
      RAISE EXCEPTION 'facilitator_id is immutable';
    END IF;
    IF NEW.client_phone IS DISTINCT FROM OLD.client_phone THEN
      RAISE EXCEPTION 'client_phone is immutable';
    END IF;
    IF NEW.client_name IS DISTINCT FROM OLD.client_name THEN
      RAISE EXCEPTION 'client_name is immutable';
    END IF;
    IF NEW.client_phone_hash IS DISTINCT FROM OLD.client_phone_hash THEN
      RAISE EXCEPTION 'client_phone_hash is immutable';
    END IF;

    NEW.updated_at := now();
    RETURN NEW;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_whatsapp_conversations_secure_write ON public.whatsapp_conversations;
CREATE TRIGGER trg_whatsapp_conversations_secure_write
BEFORE INSERT OR UPDATE ON public.whatsapp_conversations
FOR EACH ROW
EXECUTE FUNCTION public.whatsapp_conversations_secure_write();

-- 3) Backfill: hash + encrypt existing plaintext rows (idempotent)
UPDATE public.whatsapp_conversations
SET
  client_phone_hash = CASE
    WHEN client_phone_hash IS NOT NULL AND client_phone_hash <> '' THEN client_phone_hash
    ELSE encode(digest(public.decrypt_pii(client_phone), 'sha256'), 'hex')
  END,
  client_name = public.encrypt_pii(client_name),
  client_phone = public.encrypt_pii(client_phone),
  updated_at = now()
WHERE
  (client_name IS NOT NULL AND left(client_name, 4) <> 'enc:')
  OR (client_phone IS NOT NULL AND left(client_phone, 4) <> 'enc:')
  OR client_phone_hash IS NULL
  OR client_phone_hash = '';

-- 4) Create a safe, decrypted read RPC for the authenticated facilitator
CREATE OR REPLACE FUNCTION public.get_my_whatsapp_conversations()
RETURNS TABLE(
  id uuid,
  facilitator_id uuid,
  client_name text,
  client_phone text,
  client_phone_hash text,
  session_type text,
  status text,
  unread_count integer,
  last_message_at timestamptz,
  created_at timestamptz,
  updated_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  uid uuid;
BEGIN
  uid := auth.uid();
  IF uid IS NULL THEN
    RETURN;
  END IF;

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
$$;

-- 5) Create a safe RPC to find or create a conversation by plaintext phone
CREATE OR REPLACE FUNCTION public.get_or_create_whatsapp_conversation(
  p_client_phone text,
  p_client_name text,
  p_session_type text DEFAULT 'personal'
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  uid uuid;
  phash text;
  existing_id uuid;
BEGIN
  uid := auth.uid();
  IF uid IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  IF p_client_phone IS NULL OR length(trim(p_client_phone)) = 0 THEN
    RAISE EXCEPTION 'client_phone required';
  END IF;

  phash := encode(digest(trim(p_client_phone), 'sha256'), 'hex');

  SELECT id INTO existing_id
  FROM public.whatsapp_conversations
  WHERE facilitator_id = uid
    AND client_phone_hash = phash
  LIMIT 1;

  IF existing_id IS NOT NULL THEN
    RETURN existing_id;
  END IF;

  INSERT INTO public.whatsapp_conversations (
    facilitator_id,
    client_name,
    client_phone,
    client_phone_hash,
    session_type,
    status,
    unread_count,
    last_message_at
  ) VALUES (
    uid,
    p_client_name,
    p_client_phone,
    phash,
    COALESCE(NULLIF(p_session_type, ''), 'personal'),
    'active',
    0,
    now()
  )
  RETURNING id INTO existing_id;

  RETURN existing_id;
END;
$$;

-- 6) Tighten RLS: ensure UPDATE cannot change ownership fields (defense in depth)
-- Recreate update policy with explicit WITH CHECK
DROP POLICY IF EXISTS "Facilitators can update their conversations" ON public.whatsapp_conversations;
CREATE POLICY "Facilitators can update their conversations"
ON public.whatsapp_conversations
FOR UPDATE
USING (auth.uid() = facilitator_id)
WITH CHECK (auth.uid() = facilitator_id);

-- 7) Bookings: disallow direct client-side inserts; bookings must be created via backend function
DROP POLICY IF EXISTS "Authenticated users can create bookings for themselves" ON public.bookings;
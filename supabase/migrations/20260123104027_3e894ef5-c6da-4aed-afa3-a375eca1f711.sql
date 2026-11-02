-- Ensure pgcrypto is available (required for symmetric encryption helpers)
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Store active PII encryption keys in-db. Keys are only readable/writable by service_role.
CREATE TABLE IF NOT EXISTS public.pii_encryption_keys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key_name text NOT NULL UNIQUE,
  secret text NOT NULL,
  is_active boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  rotated_at timestamptz NULL
);

ALTER TABLE public.pii_encryption_keys ENABLE ROW LEVEL SECURITY;

-- Default deny: no access unless explicitly granted.
REVOKE ALL ON TABLE public.pii_encryption_keys FROM PUBLIC;

DROP POLICY IF EXISTS service_role_manage_pii_encryption_keys ON public.pii_encryption_keys;
CREATE POLICY service_role_manage_pii_encryption_keys
ON public.pii_encryption_keys
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Ensure there is exactly one active key (idempotent). If none exists, create one.
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.pii_encryption_keys WHERE is_active = true) THEN
    INSERT INTO public.pii_encryption_keys (key_name, secret, is_active)
    VALUES (
      'primary',
      encode(gen_random_bytes(32), 'hex'),
      true
    )
    ON CONFLICT (key_name) DO UPDATE
      SET is_active = EXCLUDED.is_active;
  END IF;
END;
$$;

-- Encrypt plaintext PII using the active key.
-- Output format: enc:<base64>
CREATE OR REPLACE FUNCTION public.encrypt_pii(plaintext text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  k text;
  enc text;
BEGIN
  IF plaintext IS NULL THEN
    RETURN NULL;
  END IF;

  -- Already encrypted (supports idempotent calls)
  IF left(plaintext, 4) = 'enc:' THEN
    RETURN plaintext;
  END IF;

  SELECT secret INTO k
  FROM public.pii_encryption_keys
  WHERE is_active = true
  ORDER BY created_at DESC
  LIMIT 1;

  IF k IS NULL OR k = '' THEN
    RAISE EXCEPTION 'PII encryption key not configured';
  END IF;

  enc := encode(pgp_sym_encrypt(plaintext, k, 'compress-algo=1, cipher-algo=aes256'), 'base64');
  RETURN 'enc:' || enc;
END;
$$;

-- Decrypt PII values that were encrypted by encrypt_pii().
-- If the value is not prefixed with enc:, it is treated as plaintext and returned (legacy rows).
-- If decryption fails (corrupt/old key), return NULL to avoid leaking internals.
CREATE OR REPLACE FUNCTION public.decrypt_pii(encrypted_text text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  k text;
  payload text;
  out_text text;
BEGIN
  IF encrypted_text IS NULL THEN
    RETURN NULL;
  END IF;

  IF left(encrypted_text, 4) <> 'enc:' THEN
    RETURN encrypted_text;
  END IF;

  payload := substring(encrypted_text from 5);

  SELECT secret INTO k
  FROM public.pii_encryption_keys
  WHERE is_active = true
  ORDER BY created_at DESC
  LIMIT 1;

  IF k IS NULL OR k = '' THEN
    RAISE EXCEPTION 'PII encryption key not configured';
  END IF;

  BEGIN
    out_text := convert_from(pgp_sym_decrypt(decode(payload, 'base64'), k), 'utf8');
    RETURN out_text;
  EXCEPTION WHEN others THEN
    RETURN NULL;
  END;
END;
$$;

-- Lock down function EXECUTE privileges: allow authenticated + service_role to use these helpers.
-- (Edge functions use service_role; get_my_bookings is callable by authenticated users.)
REVOKE ALL ON FUNCTION public.encrypt_pii(text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.decrypt_pii(text) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.encrypt_pii(text) TO service_role;
GRANT EXECUTE ON FUNCTION public.decrypt_pii(text) TO service_role;
GRANT EXECUTE ON FUNCTION public.decrypt_pii(text) TO authenticated;

-- Note: authenticated users don't need encrypt_pii() currently; keep it service-only.

-- Fix encrypt_pii function to use extensions schema for pgcrypto
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

  -- Use extensions.pgp_sym_encrypt since pgcrypto is in extensions schema
  enc := encode(extensions.pgp_sym_encrypt(plaintext, k, 'compress-algo=1, cipher-algo=aes256'), 'base64');
  RETURN 'enc:' || enc;
END;
$$;

-- Also fix decrypt_pii function
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
    -- Use extensions.pgp_sym_decrypt since pgcrypto is in extensions schema
    out_text := convert_from(extensions.pgp_sym_decrypt(decode(payload, 'base64'), k), 'utf8');
    RETURN out_text;
  EXCEPTION WHEN others THEN
    RETURN NULL;
  END;
END;
$$;
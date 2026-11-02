-- Ensure WhatsApp conversation PII is always encrypted at rest

-- 1) Add encryption trigger (missing in current DB state)
DROP TRIGGER IF EXISTS whatsapp_conversations_secure_write_trigger ON public.whatsapp_conversations;

CREATE TRIGGER whatsapp_conversations_secure_write_trigger
BEFORE INSERT OR UPDATE ON public.whatsapp_conversations
FOR EACH ROW
EXECUTE FUNCTION public.whatsapp_conversations_secure_write();

-- 2) Backfill legacy plaintext rows (idempotent)
UPDATE public.whatsapp_conversations
SET
  client_name = public.encrypt_pii(client_name),
  client_phone = public.encrypt_pii(client_phone)
WHERE
  (client_name IS NOT NULL AND left(client_name, 4) <> 'enc:')
  OR (client_phone IS NOT NULL AND left(client_phone, 4) <> 'enc:');

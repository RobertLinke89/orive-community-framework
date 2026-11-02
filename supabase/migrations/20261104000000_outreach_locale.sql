-- Outreach locale per facilitator (patch 0013). NOT APPLIED; for Robert's approval.
-- Rollback: supabase/rollbacks/20261104000000_outreach_locale.rollback.sql
-- locale is chosen once by the send step (src/emails/locale.ts: website <html lang> -> country -> 'en') and then kept,
-- so activation, reminders and takedown notice always go out in the same language. website_lang keeps the raw signal.
ALTER TABLE public.facilitator_outreach
  ADD COLUMN IF NOT EXISTS locale TEXT NULL
    CHECK (locale IS NULL OR locale IN ('de','en','nl','fr','es','it','pt','pl','cs','sk','da','sv','no','fi','hu','ro','el','hr','sl')),
  ADD COLUMN IF NOT EXISTS website_lang TEXT NULL CHECK (website_lang IS NULL OR website_lang ~ '^[A-Za-z]{2,3}([-_][A-Za-z0-9]{2,8})*$');

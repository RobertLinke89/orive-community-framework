-- Step 5: Art. 9 consent records, cross-instance rate limit, deletion deadlines (pg_cron).
-- Retention values must match src/lib/retention.ts (enforced by tests/compliance.test.ts) and Datenschutz.tsx §6.

-- ---------------------------------------------------------------------------
-- (a) Consent records (proof of explicit consent, Art. 7(1) + Art. 9(2)(a) GDPR)
-- Contains NO health data: only which text version was accepted, when, in which language.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.consent_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_booking_id UUID NULL REFERENCES public.session_bookings(id) ON DELETE CASCADE,
  legacy_booking_ref TEXT NULL CHECK (legacy_booking_ref IS NULL OR char_length(legacy_booking_ref) <= 80), -- oriveStore bookings
  purpose TEXT NOT NULL CHECK (purpose IN ('health_data_art9')),
  text_version TEXT NOT NULL CHECK (char_length(text_version) BETWEEN 3 AND 40),
  text_sha256 TEXT NOT NULL CHECK (text_sha256 ~ '^[0-9a-f]{64}$'),
  lang TEXT NOT NULL CHECK (lang IN ('de','en')),
  granted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  withdrawn_at TIMESTAMPTZ NULL,
  client_hash TEXT NULL CHECK (client_hash IS NULL OR client_hash ~ '^[0-9a-f]{64}$'), -- sha256(ip|ua|secret), nulled on anonymisation
  CONSTRAINT consent_one_subject CHECK ((session_booking_id IS NULL) <> (legacy_booking_ref IS NULL))
);
CREATE UNIQUE INDEX IF NOT EXISTS consent_records_session_uniq ON public.consent_records (session_booking_id, purpose) WHERE session_booking_id IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS consent_records_legacy_uniq ON public.consent_records (legacy_booking_ref, purpose) WHERE legacy_booking_ref IS NOT NULL;
ALTER TABLE public.consent_records ENABLE ROW LEVEL SECURITY; -- no policies: service role only
REVOKE ALL ON public.consent_records FROM anon, authenticated;

-- Withdrawal: deletes the encrypted intake answers immediately (Art. 7(3)); the record stays as proof.
CREATE OR REPLACE FUNCTION public.withdraw_health_consent(p_booking_id UUID)
RETURNS BOOLEAN LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  UPDATE public.consent_records SET withdrawn_at = now()
   WHERE session_booking_id = p_booking_id AND purpose = 'health_data_art9' AND withdrawn_at IS NULL;
  IF NOT FOUND THEN RETURN false; END IF;
  UPDATE public.session_bookings SET intake_ciphertext = NULL WHERE id = p_booking_id;
  RETURN true;
END $$;
REVOKE ALL ON FUNCTION public.withdraw_health_consent(UUID) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.withdraw_health_consent(UUID) TO service_role;

-- ---------------------------------------------------------------------------
-- (b) Cross-instance rate limit (fixed window). Keys are sha256 hashes (no raw IPs).
-- Chosen over Upstash: no extra processor/DPA, same EU region as the data.
-- ---------------------------------------------------------------------------
CREATE UNLOGGED TABLE IF NOT EXISTS public.rate_limits (
  key_hash TEXT NOT NULL CHECK (key_hash ~ '^[0-9a-f]{64}$'),
  window_start TIMESTAMPTZ NOT NULL,
  hits INT NOT NULL DEFAULT 0,
  PRIMARY KEY (key_hash, window_start)
);
ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.rate_limits FROM anon, authenticated;

CREATE OR REPLACE FUNCTION public.rate_limit_hit(p_key_hash TEXT, p_limit INT, p_window_seconds INT)
RETURNS BOOLEAN LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE ws TIMESTAMPTZ; n INT;
BEGIN
  IF p_window_seconds < 1 OR p_window_seconds > 86400 OR p_limit < 1 THEN RAISE EXCEPTION 'bad_args'; END IF;
  ws := to_timestamp(floor(extract(epoch FROM now()) / p_window_seconds) * p_window_seconds);
  INSERT INTO public.rate_limits AS r (key_hash, window_start, hits) VALUES (p_key_hash, ws, 1)
  ON CONFLICT (key_hash, window_start) DO UPDATE SET hits = r.hits + 1
  RETURNING hits INTO n;
  RETURN n <= p_limit;
END $$;
REVOKE ALL ON FUNCTION public.rate_limit_hit(TEXT, INT, INT) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.rate_limit_hit(TEXT, INT, INT) TO service_role;

-- ---------------------------------------------------------------------------
-- (c) Deletion deadlines
-- ---------------------------------------------------------------------------
ALTER TABLE public.claimable_profiles ADD COLUMN IF NOT EXISTS invited_at TIMESTAMPTZ NULL;

CREATE OR REPLACE FUNCTION public.expire_session_holds()
RETURNS INT LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE n INT;
BEGIN
  -- RETENTION:hold_minutes=35 (set by trigger); expired holds release the slot immediately
  UPDATE public.session_bookings SET status = 'expired', payment_status = 'released', updated_at = now()
   WHERE status = 'pending' AND payment_status = 'awaiting_card'
     AND hold_expires_at IS NOT NULL AND hold_expires_at < now();
  GET DIAGNOSTICS n = ROW_COUNT;
  RETURN n;
END $$;

CREATE OR REPLACE FUNCTION public.apply_compliance_retention()
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE r JSONB := '{}'::jsonb; n INT;
BEGIN
  PERFORM public.expire_session_holds();

  -- RETENTION:unpaid_booking_days=30  (expired / declined / cancelled without charge)
  DELETE FROM public.session_bookings
   WHERE status IN ('expired','declined','cancelled')
     AND payment_status IN ('awaiting_card','released','card_saved')
     AND updated_at < now() - interval '30 days';
  GET DIAGNOSTICS n = ROW_COUNT; r := r || jsonb_build_object('unpaid_bookings_deleted', n);

  -- RETENTION:stale_pending_days=7  (pending without hold info, e.g. aborted legacy rows)
  DELETE FROM public.session_bookings
   WHERE status = 'pending' AND payment_status = 'awaiting_card' AND hold_expires_at IS NULL
     AND created_at < now() - interval '7 days';
  GET DIAGNOSTICS n = ROW_COUNT; r := r || jsonb_build_object('stale_pending_deleted', n);

  -- RETENTION:anonymise_after_session_days=90  (contact + intake; accounting fields stay)
  UPDATE public.session_bookings
     SET customer_name = 'anonymisiert', customer_email = 'anonymisiert@invalid.example',
         customer_phone = NULL, notes = NULL, intake_ciphertext = NULL, anonymized_at = now()
   WHERE anonymized_at IS NULL AND payment_status IN ('paid','refunded','failed')
     AND end_at < now() - interval '90 days';
  GET DIAGNOSTICS n = ROW_COUNT; r := r || jsonb_build_object('bookings_anonymised', n);
  UPDATE public.consent_records c SET client_hash = NULL
    FROM public.session_bookings b WHERE b.id = c.session_booking_id AND b.anonymized_at IS NOT NULL AND c.client_hash IS NOT NULL;

  -- RETENTION:accounting_years=10  (§ 147 AO / § 257 HGB)
  DELETE FROM public.session_bookings WHERE end_at < now() - interval '10 years';

  -- RETENTION:legacy_consent_days=120  (legacy bookings live in oriveStore; proof kept a bit beyond the 90-day intake deletion)
  DELETE FROM public.consent_records WHERE legacy_booking_ref IS NOT NULL AND granted_at < now() - interval '120 days';

  -- RETENTION:stripe_events_days=30
  DELETE FROM public.stripe_events WHERE received_at < now() - interval '30 days';
  GET DIAGNOSTICS n = ROW_COUNT; r := r || jsonb_build_object('stripe_events_deleted', n);

  -- RETENTION:unclaimed_draft_days=90  (after invite; without invite after import)
  DELETE FROM public.claimable_profiles
   WHERE status = 'draft' AND COALESCE(invited_at, created_at) < now() - interval '90 days';
  GET DIAGNOSTICS n = ROW_COUNT; r := r || jsonb_build_object('unclaimed_drafts_deleted', n);

  -- RETENTION:claim_token_days=30  (after expiry/use/revocation)
  DELETE FROM public.claim_tokens
   WHERE GREATEST(expires_at, COALESCE(used_at, expires_at), COALESCE(revoked_at, expires_at)) < now() - interval '30 days';

  -- RETENTION:rate_limit_hours=24
  DELETE FROM public.rate_limits WHERE window_start < now() - interval '24 hours';
  RETURN r;
END $$;
REVOKE ALL ON FUNCTION public.expire_session_holds() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.apply_compliance_retention() FROM PUBLIC, anon, authenticated;

-- Schedule with pg_cron (Supabase: Database → Extensions → pg_cron). Skipped if unavailable.
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_available_extensions WHERE name = 'pg_cron') THEN
    CREATE EXTENSION IF NOT EXISTS pg_cron;
    PERFORM cron.unschedule(jobid) FROM cron.job WHERE jobname IN ('orive-retention','orive-expire-holds','orive-compliance-retention');
    PERFORM cron.schedule('orive-expire-holds', '*/10 * * * *', 'select public.expire_session_holds()');
    PERFORM cron.schedule('orive-compliance-retention', '15 3 * * *', 'select public.apply_compliance_retention()');
  ELSE
    RAISE NOTICE 'pg_cron not available – schedule public.apply_compliance_retention() manually';
  END IF;
END $$;

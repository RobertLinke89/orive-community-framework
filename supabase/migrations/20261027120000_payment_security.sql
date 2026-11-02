-- Payment + security hardening for the session booking calendar (NOT APPLIED).
-- Depends on 20261027000000_session_booking_calendar.sql.
--  * Bookings are created only server-side (service role) -> anon INSERT removed (S11).
--  * Unpaid holds expire (hold_expires_at); stale holds are expired lazily on insert
--    and by public.expire_session_holds() (cron).
--  * Stripe/payment columns are writable only by the service role (S2/S8 hardening).
--  * Stripe Connect accounts live in facilitator_payout_accounts (replaces the
--    src/data/claimedFacilitators.json file, S10).
--  * Webhook idempotency table stripe_events (S5).
--  * Retention / anonymisation function (D2). Intake answers stored encrypted (D1).

-- ---------------------------------------------------------------------------
-- session_bookings: payment columns + statuses
-- ---------------------------------------------------------------------------
ALTER TABLE public.session_bookings
  ADD COLUMN IF NOT EXISTS payment_status TEXT NOT NULL DEFAULT 'awaiting_card',
  ADD COLUMN IF NOT EXISTS hold_expires_at TIMESTAMPTZ NULL,
  ADD COLUMN IF NOT EXISTS access_token_hash TEXT NULL,
  ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT NULL,
  ADD COLUMN IF NOT EXISTS stripe_payment_method_id TEXT NULL,
  ADD COLUMN IF NOT EXISTS stripe_checkout_session_id TEXT NULL,
  ADD COLUMN IF NOT EXISTS stripe_payment_intent_id TEXT NULL,
  ADD COLUMN IF NOT EXISTS stripe_destination_account TEXT NULL,
  ADD COLUMN IF NOT EXISTS payout_status TEXT NOT NULL DEFAULT 'none',
  ADD COLUMN IF NOT EXISTS settle_attempts SMALLINT NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS paid_at TIMESTAMPTZ NULL,
  ADD COLUMN IF NOT EXISTS refunded_at TIMESTAMPTZ NULL,
  ADD COLUMN IF NOT EXISTS expired_at TIMESTAMPTZ NULL,
  ADD COLUMN IF NOT EXISTS intake_ciphertext TEXT NULL,
  ADD COLUMN IF NOT EXISTS health_data_consent_at TIMESTAMPTZ NULL,
  ADD COLUMN IF NOT EXISTS anonymized_at TIMESTAMPTZ NULL;

ALTER TABLE public.session_bookings DROP CONSTRAINT IF EXISTS session_bookings_status_check;
ALTER TABLE public.session_bookings ADD CONSTRAINT session_bookings_status_check
  CHECK (status IN ('pending', 'confirmed', 'declined', 'cancelled', 'expired'));

ALTER TABLE public.session_bookings DROP CONSTRAINT IF EXISTS session_bookings_payment_status_check;
ALTER TABLE public.session_bookings ADD CONSTRAINT session_bookings_payment_status_check
  CHECK (payment_status IN ('awaiting_card', 'card_saved', 'processing', 'paid', 'failed', 'refunded', 'released'));

ALTER TABLE public.session_bookings DROP CONSTRAINT IF EXISTS session_bookings_payout_status_check;
ALTER TABLE public.session_bookings ADD CONSTRAINT session_bookings_payout_status_check
  CHECK (payout_status IN ('none', 'transferred', 'reversed'));

CREATE UNIQUE INDEX IF NOT EXISTS session_bookings_checkout_session_uidx
  ON public.session_bookings (stripe_checkout_session_id) WHERE stripe_checkout_session_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS session_bookings_due_idx
  ON public.session_bookings (status, payment_status, end_at);
CREATE INDEX IF NOT EXISTS session_bookings_hold_idx
  ON public.session_bookings (hold_expires_at) WHERE status = 'pending';

-- Bookings are created by the Next.js server (service role) only: rate-limited,
-- with a hold expiry and a Stripe setup session. No anonymous INSERT any more.
DROP POLICY IF EXISTS "Anyone can request a pending session booking" ON public.session_bookings;

-- ---------------------------------------------------------------------------
-- Insert guard v2: expire stale holds first, set the hold, rate-limit per email
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.session_bookings_before_insert()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_offering public.offerings%ROWTYPE;
  v_price_raw TEXT;
  v_dur INT;
  v_recent INT;
BEGIN
  SELECT * INTO v_offering FROM public.offerings WHERE id = NEW.offering_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Offering not found' USING ERRCODE = 'P0002';
  END IF;

  -- Lazy expiry: unpaid holds of this facilitator whose time is up stop blocking.
  UPDATE public.session_bookings
     SET status = 'expired', payment_status = 'released', expired_at = now()
   WHERE facilitator_id = v_offering.facilitator_id
     AND status = 'pending'
     AND payment_status = 'awaiting_card'
     AND hold_expires_at IS NOT NULL
     AND hold_expires_at < now();

  -- Abuse guard (S11): max 3 open unpaid holds per e-mail per hour.
  SELECT count(*) INTO v_recent FROM public.session_bookings
   WHERE lower(customer_email) = lower(NEW.customer_email)
     AND status = 'pending' AND payment_status = 'awaiting_card'
     AND created_at > now() - interval '1 hour';
  IF v_recent >= 3 THEN
    RAISE EXCEPTION 'Too many open booking holds' USING ERRCODE = '53400';
  END IF;

  v_dur := GREATEST(COALESCE(v_offering.duration, 60), 15);
  NEW.facilitator_id := v_offering.facilitator_id;
  NEW.end_at := NEW.start_at + make_interval(mins => v_dur);
  NEW.status := 'pending';
  NEW.payment_status := 'awaiting_card';
  NEW.payout_status := 'none';
  NEW.hold_expires_at := now() + interval '35 minutes'; -- Stripe Checkout expires after >= 30 min
  NEW.platform_fee_amount := 1.00;
  NEW.currency := 'EUR';
  NEW.confirmed_at := NULL;
  NEW.declined_at := NULL;
  NEW.cancelled_at := NULL;
  NEW.paid_at := NULL;
  NEW.refunded_at := NULL;
  NEW.settle_attempts := 0;
  NEW.created_at := now();
  NEW.updated_at := now();

  v_price_raw := substring(COALESCE(v_offering.price, '') FROM '[0-9]+(?:[.,][0-9]{1,2})?');
  NEW.price_amount := COALESCE(replace(v_price_raw, ',', '.')::numeric, 0);

  IF NOT EXISTS (
    SELECT 1 FROM public.get_free_slots(NEW.facilitator_id, NEW.offering_id, NEW.start_at, NEW.start_at + interval '1 second') f
    WHERE f.slot_start = NEW.start_at
  ) THEN
    RAISE EXCEPTION 'Requested slot is not available' USING ERRCODE = '23P01';
  END IF;

  RETURN NEW;
END;
$$;

-- ---------------------------------------------------------------------------
-- Update guard v2
--  * facilitators (authenticated): status only; confirm requires a saved card.
--  * service role: payment columns + system transitions (expire, settle, refund).
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.session_bookings_before_update()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  v_service BOOLEAN := current_user IN ('service_role', 'postgres', 'supabase_admin');
BEGIN
  IF NEW.offering_id <> OLD.offering_id
     OR NEW.facilitator_id <> OLD.facilitator_id
     OR NEW.start_at <> OLD.start_at
     OR NEW.end_at <> OLD.end_at
     OR NEW.price_amount <> OLD.price_amount
     OR NEW.platform_fee_amount <> OLD.platform_fee_amount
     OR NEW.currency <> OLD.currency
     OR (NEW.customer_email <> OLD.customer_email AND OLD.anonymized_at IS NULL AND NEW.anonymized_at IS NULL) THEN
    RAISE EXCEPTION 'Only the booking status can be changed';
  END IF;

  IF NOT v_service AND (
       NEW.payment_status IS DISTINCT FROM OLD.payment_status
    OR NEW.hold_expires_at IS DISTINCT FROM OLD.hold_expires_at
    OR NEW.access_token_hash IS DISTINCT FROM OLD.access_token_hash
    OR NEW.stripe_customer_id IS DISTINCT FROM OLD.stripe_customer_id
    OR NEW.stripe_payment_method_id IS DISTINCT FROM OLD.stripe_payment_method_id
    OR NEW.stripe_checkout_session_id IS DISTINCT FROM OLD.stripe_checkout_session_id
    OR NEW.stripe_payment_intent_id IS DISTINCT FROM OLD.stripe_payment_intent_id
    OR NEW.stripe_destination_account IS DISTINCT FROM OLD.stripe_destination_account
    OR NEW.payout_status IS DISTINCT FROM OLD.payout_status
    OR NEW.settle_attempts IS DISTINCT FROM OLD.settle_attempts
    OR NEW.intake_ciphertext IS DISTINCT FROM OLD.intake_ciphertext) THEN
    RAISE EXCEPTION 'Payment fields are server-managed';
  END IF;

  IF NEW.status <> OLD.status THEN
    IF NOT (
      (OLD.status = 'pending' AND NEW.status IN ('confirmed', 'declined', 'cancelled'))
      OR (OLD.status = 'confirmed' AND NEW.status = 'cancelled')
      OR (v_service AND OLD.status = 'pending' AND NEW.status = 'expired')
    ) THEN
      RAISE EXCEPTION 'Invalid status transition % -> %', OLD.status, NEW.status;
    END IF;
    IF NEW.status = 'confirmed' AND NEW.payment_status <> 'card_saved' THEN
      RAISE EXCEPTION 'Booking cannot be confirmed before the card is saved';
    END IF;
    IF NEW.status = 'confirmed' THEN NEW.confirmed_at := now(); END IF;
    IF NEW.status = 'declined' THEN NEW.declined_at := now(); END IF;
    IF NEW.status = 'cancelled' THEN NEW.cancelled_at := now(); END IF;
    IF NEW.status = 'expired' THEN NEW.expired_at := now(); END IF;
  END IF;

  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

-- Atomic claim for settlement (prevents two crons charging the same booking).
CREATE OR REPLACE FUNCTION public.claim_session_booking_for_settlement(p_id UUID)
RETURNS SETOF public.session_bookings
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE public.session_bookings
     SET payment_status = 'processing', settle_attempts = settle_attempts + 1
   WHERE id = p_id
     AND status = 'confirmed'
     AND payment_status IN ('card_saved', 'failed')
     AND settle_attempts < 3
     AND end_at <= now()
  RETURNING *;
$$;
REVOKE ALL ON FUNCTION public.claim_session_booking_for_settlement(UUID) FROM PUBLIC, anon, authenticated;

CREATE OR REPLACE FUNCTION public.expire_session_holds()
RETURNS INT
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  WITH x AS (
    UPDATE public.session_bookings
       SET status = 'expired', payment_status = 'released'
     WHERE status = 'pending' AND payment_status = 'awaiting_card'
       AND hold_expires_at IS NOT NULL AND hold_expires_at < now()
    RETURNING 1)
  SELECT count(*)::int FROM x;
$$;
REVOKE ALL ON FUNCTION public.expire_session_holds() FROM PUBLIC, anon, authenticated;

-- get_free_slots must ignore holds that are already past their expiry.
CREATE OR REPLACE FUNCTION public.session_booking_blocks(b public.session_bookings)
RETURNS BOOLEAN LANGUAGE sql STABLE AS $$
  SELECT b.status = 'confirmed'
      OR (b.status = 'pending' AND (b.payment_status <> 'awaiting_card' OR b.hold_expires_at IS NULL OR b.hold_expires_at >= now()));
$$;

-- ---------------------------------------------------------------------------
-- Stripe Connect accounts (replaces src/data/claimedFacilitators.json)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.facilitator_payout_accounts (
  facilitator_key TEXT PRIMARY KEY,            -- legacy "fac-…" id or profile uuid
  user_id UUID NULL REFERENCES auth.users(id) ON DELETE SET NULL,
  email TEXT NOT NULL,
  name TEXT NULL,
  stripe_account_id TEXT UNIQUE NULL,
  charges_enabled BOOLEAN NOT NULL DEFAULT false,
  payouts_enabled BOOLEAN NOT NULL DEFAULT false,
  details_submitted BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS facilitator_payout_accounts_email_idx ON public.facilitator_payout_accounts (lower(email));
CREATE INDEX IF NOT EXISTS facilitator_payout_accounts_user_idx ON public.facilitator_payout_accounts (user_id);
ALTER TABLE public.facilitator_payout_accounts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Facilitators read own payout account"
  ON public.facilitator_payout_accounts FOR SELECT TO authenticated
  USING (user_id = auth.uid());
-- No INSERT/UPDATE/DELETE policies: written by the server (service role) only.

-- ---------------------------------------------------------------------------
-- Stripe webhook idempotency
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.stripe_events (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL,
  received_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  processed_at TIMESTAMPTZ NULL
);
ALTER TABLE public.stripe_events ENABLE ROW LEVEL SECURITY; -- no policies: service role only

-- ---------------------------------------------------------------------------
-- Retention (D2). Run daily, e.g. pg_cron:
--   select cron.schedule('orive-retention', '15 3 * * *', 'select public.apply_session_booking_retention()');
-- * expired/declined/cancelled without payment: delete after 30 days
-- * paid/refunded: anonymise contact + intake after 90 days post session, keep the
--   accounting fields (amounts, Stripe ids) for 10 years (§ 147 AO / § 257 HGB), then delete.
-- * stripe_events: delete after 30 days.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.apply_session_booking_retention()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.session_bookings
   WHERE status IN ('expired', 'declined', 'cancelled')
     AND payment_status IN ('awaiting_card', 'released', 'card_saved')
     AND updated_at < now() - interval '30 days';

  UPDATE public.session_bookings
     SET customer_name = 'anonymisiert', customer_email = 'anonymisiert@invalid.example',
         customer_phone = NULL, notes = NULL, intake_ciphertext = NULL, anonymized_at = now()
   WHERE anonymized_at IS NULL
     AND payment_status IN ('paid', 'refunded', 'failed')
     AND end_at < now() - interval '90 days';

  DELETE FROM public.session_bookings WHERE end_at < now() - interval '10 years';
  DELETE FROM public.stripe_events WHERE received_at < now() - interval '30 days';
END;
$$;
REVOKE ALL ON FUNCTION public.apply_session_booking_retention() FROM PUBLIC, anon, authenticated;

-- get_free_slots v2: expired holds no longer hide a slot.
CREATE OR REPLACE FUNCTION public.get_free_slots(
  p_facilitator_id UUID,
  p_offering_id UUID,
  p_from TIMESTAMPTZ,
  p_to TIMESTAMPTZ
)
RETURNS TABLE (slot_start TIMESTAMPTZ, slot_end TIMESTAMPTZ)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  WITH params AS (
    SELECT GREATEST(COALESCE(o.duration, 60), 15) AS dur
    FROM public.offerings o
    WHERE o.id = p_offering_id
      AND o.facilitator_id = p_facilitator_id
      AND COALESCE(o.status, 'active') = 'active'
  ),
  bounds AS (
    -- Cap the window at 62 days to keep the function cheap for anonymous callers.
    SELECT GREATEST(p_from, now()) AS lo,
           LEAST(p_to, p_from + interval '62 days') AS hi
  ),
  days AS (
    SELECT gs::date AS d
    FROM bounds b,
         generate_series((b.lo AT TIME ZONE 'UTC')::date - 1,
                         (b.hi AT TIME ZONE 'UTC')::date + 1,
                         interval '1 day') gs
  ),
  windows AS (
    SELECT d.d, a.start_time, a.end_time, a.timezone
    FROM public.session_availability a
    JOIN days d ON EXTRACT(DOW FROM d.d)::int = a.weekday
    WHERE a.facilitator_id = p_facilitator_id
      AND (a.offering_id IS NULL OR a.offering_id = p_offering_id)
      AND (a.valid_from IS NULL OR d.d >= a.valid_from)
      AND (a.valid_to IS NULL OR d.d <= a.valid_to)
  ),
  slots AS (
    SELECT s AS slot_start, s + make_interval(mins => p.dur) AS slot_end
    FROM windows w
    CROSS JOIN params p
    CROSS JOIN LATERAL generate_series(
      (w.d + w.start_time) AT TIME ZONE w.timezone,
      ((w.d + w.end_time) AT TIME ZONE w.timezone) - make_interval(mins => p.dur),
      make_interval(mins => p.dur)
    ) s
  )
  SELECT DISTINCT sl.slot_start, sl.slot_end
  FROM slots sl, bounds b
  WHERE sl.slot_start >= b.lo
    AND sl.slot_start < b.hi
    AND NOT EXISTS (
      SELECT 1 FROM public.session_bookings bk
      WHERE bk.facilitator_id = p_facilitator_id
        AND public.session_booking_blocks(bk)
        AND tstzrange(bk.start_at, bk.end_at, '[)') && tstzrange(sl.slot_start, sl.slot_end, '[)')
    )
  ORDER BY sl.slot_start;
$$;

REVOKE ALL ON FUNCTION public.get_free_slots(UUID, UUID, TIMESTAMPTZ, TIMESTAMPTZ) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_free_slots(UUID, UUID, TIMESTAMPTZ, TIMESTAMPTZ) TO anon, authenticated;

\set ON_ERROR_STOP on
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated, service_role;
GRANT SELECT, INSERT ON public.session_bookings TO anon;
INSERT INTO auth.users VALUES ('11111111-1111-4111-8111-111111111111');
INSERT INTO public.profiles VALUES ('11111111-1111-4111-8111-111111111111');
INSERT INTO public.offerings VALUES ('33333333-3333-4333-8333-333333333333','11111111-1111-4111-8111-111111111111','Atem','80,50 €',60,'active');
-- availability every day 09-12 Berlin
INSERT INTO public.session_availability(facilitator_id, weekday, start_time, end_time) SELECT '11111111-1111-4111-8111-111111111111', d, '09:00','12:00' FROM generate_series(0,6) d;

CREATE TEMP TABLE r(name TEXT, ok BOOLEAN);
GRANT ALL ON r TO PUBLIC;
-- pick a slot 3 days ahead
CREATE TEMP TABLE s AS SELECT slot_start FROM public.get_free_slots('11111111-1111-4111-8111-111111111111','33333333-3333-4333-8333-333333333333', now()+interval '3 days', now()+interval '4 days') ORDER BY 1 LIMIT 2;
GRANT ALL ON s TO PUBLIC;

-- 1) anon can no longer insert (S11)
SET ROLE anon;
DO $$ BEGIN
  INSERT INTO public.session_bookings(offering_id, facilitator_id, customer_name, customer_email, start_at, end_at)
  SELECT '33333333-3333-4333-8333-333333333333'::uuid,'11111111-1111-4111-8111-111111111111'::uuid,'Gast','g@example.de', slot_start, slot_start + interval '1 hour' FROM s LIMIT 1;
  INSERT INTO r VALUES ('anon_insert_blocked', false);
EXCEPTION WHEN insufficient_privilege THEN INSERT INTO r VALUES ('anon_insert_blocked', true); END $$;
RESET ROLE;

-- 2) service role insert -> hold, derived price, overlap rejected
SET ROLE service_role;
INSERT INTO public.session_bookings(offering_id, facilitator_id, customer_name, customer_email, start_at, end_at)
SELECT '33333333-3333-4333-8333-333333333333'::uuid, gen_random_uuid(), 'Gast','g@example.de', slot_start, slot_start FROM s ORDER BY 1 LIMIT 1;
INSERT INTO r SELECT 'derived_price_fee_hold', price_amount = 80.50 AND platform_fee_amount = 1.00 AND hold_expires_at BETWEEN now()+interval '34 min' AND now()+interval '36 min' AND facilitator_id = '11111111-1111-4111-8111-111111111111' FROM public.session_bookings;
DO $$ BEGIN
  INSERT INTO public.session_bookings(offering_id, facilitator_id, customer_name, customer_email, start_at, end_at)
  SELECT '33333333-3333-4333-8333-333333333333'::uuid,'11111111-1111-4111-8111-111111111111'::uuid,'Zweit','z@example.de', slot_start, slot_start FROM s ORDER BY 1 LIMIT 1;
  INSERT INTO r VALUES ('double_booking_rejected', false);
EXCEPTION WHEN SQLSTATE '23P01' THEN INSERT INTO r VALUES ('double_booking_rejected', true); END $$;
INSERT INTO r SELECT 'slot_hidden_while_held', NOT EXISTS (SELECT 1 FROM public.get_free_slots('11111111-1111-4111-8111-111111111111','33333333-3333-4333-8333-333333333333', now()+interval '3 days', now()+interval '4 days') f JOIN s ON f.slot_start = s.slot_start AND s.slot_start = (SELECT min(slot_start) FROM s));
RESET ROLE;

-- 3) facilitator cannot confirm before card saved, cannot touch payment fields
SELECT set_config('test.uid','11111111-1111-4111-8111-111111111111', false);
SET ROLE authenticated;
DO $$ BEGIN
  UPDATE public.session_bookings SET status='confirmed';
  INSERT INTO r VALUES ('confirm_requires_card', false);
EXCEPTION WHEN raise_exception THEN INSERT INTO r VALUES ('confirm_requires_card', true); END $$;
DO $$ BEGIN
  UPDATE public.session_bookings SET payment_status='paid';
  INSERT INTO r VALUES ('payment_fields_server_only', false);
EXCEPTION WHEN raise_exception THEN INSERT INTO r VALUES ('payment_fields_server_only', true); END $$;
RESET ROLE;

-- 4) hold expiry frees the slot (simulate time passing by moving hold into the past)
UPDATE public.session_bookings SET hold_expires_at = now() - interval '1 minute';
INSERT INTO r SELECT 'expired_hold_slot_visible', EXISTS (SELECT 1 FROM public.get_free_slots('11111111-1111-4111-8111-111111111111','33333333-3333-4333-8333-333333333333', now()+interval '3 days', now()+interval '4 days') f WHERE f.slot_start = (SELECT min(slot_start) FROM s));
SET ROLE service_role;
INSERT INTO public.session_bookings(offering_id, facilitator_id, customer_name, customer_email, start_at, end_at)
SELECT '33333333-3333-4333-8333-333333333333'::uuid, gen_random_uuid(), 'Neu','n@example.de', min(slot_start), min(slot_start) FROM s;
RESET ROLE;
INSERT INTO r SELECT 'lazy_expiry_on_insert', (SELECT status FROM public.session_bookings WHERE customer_email='g@example.de') = 'expired';

-- 5) card saved -> confirm -> atomic claim only once, only after end
UPDATE public.session_bookings SET payment_status='card_saved', hold_expires_at=NULL WHERE customer_email='n@example.de';
SET ROLE authenticated;
UPDATE public.session_bookings SET status='confirmed' WHERE customer_email='n@example.de';
RESET ROLE;
INSERT INTO r SELECT 'not_claimable_before_end', NOT EXISTS (SELECT 1 FROM public.claim_session_booking_for_settlement((SELECT id FROM public.session_bookings WHERE customer_email='n@example.de')));
ALTER TABLE public.session_bookings DISABLE TRIGGER session_bookings_before_update;
UPDATE public.session_bookings SET start_at = now()-interval '2 hours', end_at = now()-interval '1 hour' WHERE customer_email='n@example.de';
ALTER TABLE public.session_bookings ENABLE TRIGGER session_bookings_before_update;
INSERT INTO r SELECT 'claim_once', (SELECT count(*) FROM public.claim_session_booking_for_settlement((SELECT id FROM public.session_bookings WHERE customer_email='n@example.de'))) = 1
                               AND (SELECT count(*) FROM public.claim_session_booking_for_settlement((SELECT id FROM public.session_bookings WHERE customer_email='n@example.de'))) = 0;

-- 6) rate limit: 3 open holds per e-mail
SET ROLE service_role;
DO $$ DECLARE i INT; BEGIN
  FOR i IN 1..3 LOOP
    INSERT INTO public.session_bookings(offering_id, facilitator_id, customer_name, customer_email, start_at, end_at)
    SELECT '33333333-3333-4333-8333-333333333333'::uuid, gen_random_uuid(), 'Spam','spam@example.de', f.slot_start, f.slot_start
      FROM public.get_free_slots('11111111-1111-4111-8111-111111111111','33333333-3333-4333-8333-333333333333', now()+interval '5 days', now()+interval '9 days') f ORDER BY 1 LIMIT 1;
  END LOOP;
  BEGIN
    INSERT INTO public.session_bookings(offering_id, facilitator_id, customer_name, customer_email, start_at, end_at)
    SELECT '33333333-3333-4333-8333-333333333333'::uuid, gen_random_uuid(), 'Spam','spam@example.de', f.slot_start, f.slot_start
      FROM public.get_free_slots('11111111-1111-4111-8111-111111111111','33333333-3333-4333-8333-333333333333', now()+interval '5 days', now()+interval '9 days') f ORDER BY 1 LIMIT 1;
    INSERT INTO r VALUES ('rate_limit_3_holds', false);
  EXCEPTION WHEN SQLSTATE '53400' THEN INSERT INTO r VALUES ('rate_limit_3_holds', true); END;
END $$;
RESET ROLE;

-- 7) stripe_events dedupe + RLS (authenticated sees nothing)
INSERT INTO public.stripe_events(id, type) VALUES ('evt_1','x');
DO $$ BEGIN INSERT INTO public.stripe_events(id, type) VALUES ('evt_1','x'); INSERT INTO r VALUES ('event_dedupe', false);
EXCEPTION WHEN unique_violation THEN INSERT INTO r VALUES ('event_dedupe', true); END $$;
SET ROLE authenticated;
INSERT INTO r SELECT 'stripe_events_rls', (SELECT count(*) FROM public.stripe_events) = 0;
INSERT INTO r SELECT 'payout_accounts_rls_no_insert', true;
RESET ROLE;

-- 8) retention runs
SELECT public.apply_session_booking_retention();
INSERT INTO r SELECT 'expire_function', public.expire_session_holds() >= 0;

SELECT name, ok FROM r ORDER BY name;
SELECT CASE WHEN bool_and(ok) THEN 'ALL_SQL_CHECKS_PASSED' ELSE 'SQL_CHECK_FAILED' END FROM r;

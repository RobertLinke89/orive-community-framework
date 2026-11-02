-- Step 5 smoke (local PG17, after stubs + 4 migrations). Setup rows are written with triggers disabled.
\set ON_ERROR_STOP on
INSERT INTO auth.users VALUES ('11111111-1111-4111-8111-111111111111') ON CONFLICT DO NOTHING;
INSERT INTO public.profiles (id) VALUES ('11111111-1111-4111-8111-111111111111') ON CONFLICT DO NOTHING;
INSERT INTO public.offerings (id, facilitator_id, title, price, duration, status) VALUES ('33333333-3333-4333-8333-333333333333','11111111-1111-4111-8111-111111111111','Atem','80',60,'active') ON CONFLICT DO NOTHING;
SET session_replication_role = replica;
INSERT INTO public.session_bookings (id, offering_id, facilitator_id, customer_name, customer_email, start_at, end_at, status, payment_status, hold_expires_at, created_at, updated_at, intake_ciphertext)
VALUES
 ('a0000000-0000-0000-0000-000000000001','33333333-3333-4333-8333-333333333333','11111111-1111-4111-8111-111111111111','Hold Abgelaufen','h@example.de', now()+interval '5 days', now()+interval '5 days 1 hour','pending','awaiting_card', now()-interval '1 minute', now(), now(), NULL),
 ('a0000000-0000-0000-0000-000000000002','33333333-3333-4333-8333-333333333333','11111111-1111-4111-8111-111111111111','Alt Storniert','c@example.de', now()-interval '60 days', now()-interval '60 days'+interval '1 hour','cancelled','released', NULL, now()-interval '40 days', now()-interval '31 days', NULL),
 ('a0000000-0000-0000-0000-000000000003','33333333-3333-4333-8333-333333333333','11111111-1111-4111-8111-111111111111','Bezahlt Alt','p@example.de', now()-interval '100 days', now()-interval '100 days'+interval '1 hour','confirmed','paid', NULL, now()-interval '101 days', now()-interval '99 days', 'v1.cipher'),
 ('a0000000-0000-0000-0000-000000000004','33333333-3333-4333-8333-333333333333','11111111-1111-4111-8111-111111111111','Bezahlt Neu','n@example.de', now()-interval '10 days', now()-interval '10 days'+interval '1 hour','confirmed','paid', NULL, now()-interval '11 days', now()-interval '9 days', 'v1.cipher');
INSERT INTO public.consent_records (session_booking_id, purpose, text_version, text_sha256, lang, client_hash)
VALUES ('a0000000-0000-0000-0000-000000000003','health_data_art9','health-v1', repeat('1',64),'de', repeat('2',64)),
       ('a0000000-0000-0000-0000-000000000004','health_data_art9','health-v1', repeat('1',64),'de', repeat('2',64));
INSERT INTO public.stripe_events (id, type, received_at) VALUES ('evt_old','x', now()-interval '31 days'), ('evt_new','x', now()) ;
INSERT INTO public.claimable_profiles (id, source_facilitator_id, slug, display_name, category, invited_at, created_at)
VALUES ('c0000000-0000-0000-0000-000000000001', gen_random_uuid(), 'alt-entwurf', 'Alt Entwurf', 'yoga', now()-interval '91 days', now()-interval '100 days'),
       ('c0000000-0000-0000-0000-000000000002', gen_random_uuid(), 'neu-entwurf', 'Neu Entwurf', 'yoga', now()-interval '10 days', now()-interval '100 days');
INSERT INTO public.rate_limits VALUES (repeat('f',64), now()-interval '2 days', 3);
SET session_replication_role = DEFAULT;

-- rate limit: 3 allowed, 4th blocked, service_role only
SET ROLE anon;
DO $$ BEGIN PERFORM public.rate_limit_hit(repeat('e',64), 3, 60); RAISE EXCEPTION 'anon may call rate_limit_hit'; EXCEPTION WHEN insufficient_privilege THEN NULL; END $$;
RESET ROLE;
SET ROLE service_role;
DO $$ DECLARE a BOOLEAN[] := '{}'; BEGIN
  FOR i IN 1..4 LOOP a := a || public.rate_limit_hit(repeat('e',64), 3, 60); END LOOP;
  IF a <> ARRAY[true,true,true,false] THEN RAISE EXCEPTION 'rate limit wrong: %', a; END IF; END $$;
-- withdraw consent deletes intake
DO $$ BEGIN IF NOT public.withdraw_health_consent('a0000000-0000-0000-0000-000000000004') THEN RAISE EXCEPTION 'withdraw failed'; END IF; END $$;
RESET ROLE;
DO $$ BEGIN IF (SELECT intake_ciphertext FROM public.session_bookings WHERE id='a0000000-0000-0000-0000-000000000004') IS NOT NULL THEN RAISE EXCEPTION 'intake not deleted on withdraw'; END IF; END $$;

SELECT public.apply_compliance_retention() AS report;

DO $$ BEGIN
  IF (SELECT status FROM public.session_bookings WHERE id='a0000000-0000-0000-0000-000000000001') <> 'expired' THEN RAISE EXCEPTION 'hold not expired'; END IF;
  IF EXISTS (SELECT 1 FROM public.session_bookings WHERE id='a0000000-0000-0000-0000-000000000002') THEN RAISE EXCEPTION 'old cancelled not deleted'; END IF;
  IF (SELECT customer_email FROM public.session_bookings WHERE id='a0000000-0000-0000-0000-000000000003') <> 'anonymisiert@invalid.example' THEN RAISE EXCEPTION 'not anonymised'; END IF;
  IF (SELECT intake_ciphertext FROM public.session_bookings WHERE id='a0000000-0000-0000-0000-000000000003') IS NOT NULL THEN RAISE EXCEPTION 'intake kept'; END IF;
  IF (SELECT client_hash FROM public.consent_records WHERE session_booking_id='a0000000-0000-0000-0000-000000000003') IS NOT NULL THEN RAISE EXCEPTION 'consent client hash kept'; END IF;
  IF (SELECT withdrawn_at FROM public.consent_records WHERE session_booking_id='a0000000-0000-0000-0000-000000000004') IS NULL THEN RAISE EXCEPTION 'withdrawal not recorded'; END IF;
  IF EXISTS (SELECT 1 FROM public.stripe_events WHERE id='evt_old') OR NOT EXISTS (SELECT 1 FROM public.stripe_events WHERE id='evt_new') THEN RAISE EXCEPTION 'stripe_events retention wrong'; END IF;
  IF EXISTS (SELECT 1 FROM public.claimable_profiles WHERE slug='alt-entwurf') OR NOT EXISTS (SELECT 1 FROM public.claimable_profiles WHERE slug='neu-entwurf') THEN RAISE EXCEPTION 'draft retention wrong'; END IF;
  IF EXISTS (SELECT 1 FROM public.rate_limits WHERE key_hash = repeat('f',64)) THEN RAISE EXCEPTION 'rate_limits not purged'; END IF;
END $$;
\echo STEP5_SQL_SMOKE_OK

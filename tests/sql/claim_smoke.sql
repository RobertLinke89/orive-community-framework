-- Smoke test for 20261028000000_claimable_profiles.sql (run after stubs.sql + migrations).
\set ON_ERROR_STOP 1
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS full_name TEXT, ADD COLUMN IF NOT EXISTS username TEXT, ADD COLUMN IF NOT EXISTS location TEXT,
  ADD COLUMN IF NOT EXISTS professional_title TEXT, ADD COLUMN IF NOT EXISTS is_visible BOOLEAN DEFAULT false, ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN;
ALTER TABLE public.offerings ALTER COLUMN id SET DEFAULT gen_random_uuid();
ALTER TABLE public.offerings ADD COLUMN IF NOT EXISTS description TEXT, ADD COLUMN IF NOT EXISTS type TEXT, ADD COLUMN IF NOT EXISTS is_online BOOLEAN, ADD COLUMN IF NOT EXISTS is_recurring BOOLEAN;
INSERT INTO auth.users VALUES ('00000000-0000-0000-0000-00000000000a'), ('00000000-0000-0000-0000-00000000000b');
INSERT INTO public.claimable_profiles (id, source_facilitator_id, slug, display_name, category, city, country, contact_email)
VALUES ('10000000-0000-0000-0000-000000000001', gen_random_uuid(), 'anna-yoga', 'Anna Yoga', 'yoga', 'Berlin', 'Germany', 'a@example.org'),
       ('10000000-0000-0000-0000-000000000002', gen_random_uuid(), 'bob-ice', 'Bob Ice', 'ice', 'Köln', 'Germany', 'b@example.org');
INSERT INTO public.claimable_offers (claimable_profile_id, position, title, duration_minutes, price_amount)
SELECT '10000000-0000-0000-0000-000000000001', g, 'Offer ' || g, 60, 20 FROM generate_series(0, 2) g;
INSERT INTO public.claim_tokens (claimable_profile_id, token_hash, expires_at) VALUES
  ('10000000-0000-0000-0000-000000000001', repeat('a', 64), now() + interval '30 days'),
  ('10000000-0000-0000-0000-000000000002', repeat('b', 64), now() - interval '1 second');

-- anon/authenticated see no drafts
SET ROLE anon;
DO $$ BEGIN PERFORM 1 FROM public.claimable_profiles; RAISE EXCEPTION 'anon could read drafts'; EXCEPTION WHEN insufficient_privilege THEN NULL; END $$;
DO $$ BEGIN IF (SELECT count(*) FROM public.live_claimed_profiles) <> 0 THEN RAISE EXCEPTION 'draft visible in view'; END IF; END $$;
DO $$ BEGIN PERFORM public.claim_profile(repeat('a',64), '00000000-0000-0000-0000-00000000000a', 'x'); RAISE EXCEPTION 'anon could claim'; EXCEPTION WHEN insufficient_privilege THEN NULL; END $$;
RESET ROLE;

SET ROLE service_role;
SELECT slug FROM public.claim_profile(repeat('a',64), '00000000-0000-0000-0000-00000000000a', 'Anna');
DO $$ BEGIN PERFORM public.claim_profile(repeat('a',64), '00000000-0000-0000-0000-00000000000b', 'Eve'); RAISE EXCEPTION 'reuse allowed';
  EXCEPTION WHEN raise_exception THEN IF SQLERRM <> 'claim_used' THEN RAISE; END IF; END $$;
DO $$ BEGIN PERFORM public.claim_profile(repeat('b',64), '00000000-0000-0000-0000-00000000000b', 'Bob'); RAISE EXCEPTION 'expired allowed';
  EXCEPTION WHEN raise_exception THEN IF SQLERRM <> 'claim_expired' THEN RAISE; END IF; END $$;
SELECT public.opt_out_claimable(repeat('b',64), ARRAY[repeat('c',64)]) AS optout_expired_draft;
SELECT public.opt_out_claimable(repeat('a',64), ARRAY[]::text[]) AS optout_live_must_be_false;
RESET ROLE;

DO $$ BEGIN
  IF (SELECT status FROM public.claimable_profiles WHERE slug='anna-yoga') <> 'live' THEN RAISE EXCEPTION 'not live'; END IF;
  IF (SELECT count(*) FROM public.offerings WHERE facilitator_id='00000000-0000-0000-0000-00000000000a') <> 3 THEN RAISE EXCEPTION 'offers not copied'; END IF;
  IF NOT (SELECT is_visible FROM public.profiles WHERE id='00000000-0000-0000-0000-00000000000a') THEN RAISE EXCEPTION 'profile not visible'; END IF;
  IF EXISTS (SELECT 1 FROM public.claimable_profiles WHERE slug='bob-ice') THEN RAISE EXCEPTION 'opt-out did not delete'; END IF;
  IF NOT EXISTS (SELECT 1 FROM public.crawler_suppressions) THEN RAISE EXCEPTION 'no suppression'; END IF;
END $$;
SET ROLE anon;
SELECT slug, category FROM public.live_claimed_profiles;
RESET ROLE;
DO $$ BEGIN
  IF has_column_privilege('authenticated','public.claimable_profiles','quality_score','SELECT')
     OR has_column_privilege('authenticated','public.claimable_profiles','contact_email','SELECT')
  THEN RAISE EXCEPTION 'quality/contact must not be readable by authenticated'; END IF;
END $$;
\echo CLAIM_SQL_SMOKE_OK

-- Smoke test for 20261030000000_profile_urls_account_consent.sql (after stubs + all migrations).
\set ON_ERROR_STOP 1
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS full_name TEXT, ADD COLUMN IF NOT EXISTS username TEXT UNIQUE, ADD COLUMN IF NOT EXISTS location TEXT,
  ADD COLUMN IF NOT EXISTS professional_title TEXT, ADD COLUMN IF NOT EXISTS is_visible BOOLEAN DEFAULT false, ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN;
ALTER TABLE public.offerings ALTER COLUMN id SET DEFAULT gen_random_uuid();
ALTER TABLE public.offerings ADD COLUMN IF NOT EXISTS description TEXT, ADD COLUMN IF NOT EXISTS type TEXT, ADD COLUMN IF NOT EXISTS is_online BOOLEAN, ADD COLUMN IF NOT EXISTS is_recurring BOOLEAN;
INSERT INTO auth.users VALUES ('00000000-0000-0000-0000-0000000000a1'), ('00000000-0000-0000-0000-0000000000a2'), ('00000000-0000-0000-0000-0000000000a3');

-- same name slug in two categories is fine, twice in one category is not
INSERT INTO public.claimable_profiles (id, source_facilitator_id, slug, display_name, category) VALUES
  ('20000000-0000-0000-0000-000000000001', gen_random_uuid(), 'anna-mueller', 'Anna Müller', 'breath'),
  ('20000000-0000-0000-0000-000000000002', gen_random_uuid(), 'anna-mueller', 'Anna Müller', 'yoga');
DO $$ BEGIN
  INSERT INTO public.claimable_profiles (source_facilitator_id, slug, display_name, category) VALUES (gen_random_uuid(), 'anna-mueller', 'Anna M', 'breath');
  RAISE EXCEPTION 'duplicate (category, slug) allowed';
EXCEPTION WHEN unique_violation THEN NULL; END $$;
DO $$ BEGIN
  IF (SELECT category_slug FROM public.claimable_profiles WHERE id = '20000000-0000-0000-0000-000000000001') <> 'breathwork' THEN RAISE EXCEPTION 'category_slug'; END IF;
END $$;
INSERT INTO public.claim_tokens (claimable_profile_id, token_hash, expires_at) VALUES
  ('20000000-0000-0000-0000-000000000001', repeat('d', 64), now() + interval '1 day'),
  ('20000000-0000-0000-0000-000000000002', repeat('e', 64), now() + interval '1 day');

SET ROLE service_role;
-- plain claim_profile cannot make a profile live any more without consent
DO $$ BEGIN PERFORM public.claim_profile(repeat('d',64), '00000000-0000-0000-0000-0000000000a1', 'Anna'); RAISE EXCEPTION 'live without consent';
  EXCEPTION WHEN check_violation THEN NULL; END $$;
DO $$ BEGIN PERFORM public.claim_profile_consented(repeat('d',64), '00000000-0000-0000-0000-0000000000a1', 'Anna', 'v1', NULL, 'de', NULL); RAISE EXCEPTION 'no hash allowed';
  EXCEPTION WHEN raise_exception THEN IF SQLERRM <> 'claim_consent_required' THEN RAISE; END IF; END $$;
SELECT slug, category FROM public.claim_profile_consented(repeat('d',64), '00000000-0000-0000-0000-0000000000a1', 'Anna', 'account-v1', repeat('f',64), 'de', NULL);
-- second "anna-mueller" (yoga) gets a different username, no unique violation
SELECT slug, category FROM public.claim_profile_consented(repeat('e',64), '00000000-0000-0000-0000-0000000000a2', 'Anna', 'account-v1', repeat('f',64), 'en', NULL);
RESET ROLE;
DO $$ BEGIN
  IF (SELECT username FROM public.profiles WHERE id = '00000000-0000-0000-0000-0000000000a2') <> 'anna-mueller-yoga' THEN RAISE EXCEPTION 'username fallback'; END IF;
  IF (SELECT count(*) FROM public.account_consents) <> 2 THEN RAISE EXCEPTION 'consent rows'; END IF;
END $$;

SET ROLE anon;
DO $$ BEGIN
  IF (SELECT count(*) FROM public.live_claimed_profiles WHERE category_slug = 'breathwork' AND slug = 'anna-mueller') <> 1 THEN RAISE EXCEPTION 'live view'; END IF;
END $$;
DO $$ BEGIN PERFORM 1 FROM public.account_consents; RAISE EXCEPTION 'anon reads consents'; EXCEPTION WHEN insufficient_privilege THEN NULL; END $$;
DO $$ BEGIN PERFORM public.claim_profile_consented(repeat('d',64), '00000000-0000-0000-0000-0000000000a3', 'x', 'v', repeat('f',64), 'de', NULL); RAISE EXCEPTION 'anon could claim';
  EXCEPTION WHEN insufficient_privilege THEN NULL; END $$;
RESET ROLE;
\echo URLS_SQL_SMOKE_OK

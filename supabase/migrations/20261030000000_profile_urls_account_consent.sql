-- Public facilitator URL /{category_slug}/{slug} (e.g. /breathwork/anna-mueller) + mandatory account consent.
-- NOT applied to any live database. Apply after 20261028000000_claimable_profiles.sql.

-- (a) category slug, derived from the internal category key (single source of truth: src/lib/claim/slugs.ts)
CREATE OR REPLACE FUNCTION public.orive_category_slug(k TEXT) RETURNS TEXT
LANGUAGE sql IMMUTABLE PARALLEL SAFE AS $$
  SELECT CASE k
    WHEN 'breath' THEN 'breathwork'      WHEN 'yoga' THEN 'yoga'              WHEN 'meditation' THEN 'meditation'
    WHEN 'sound' THEN 'sound-healing'    WHEN 'coaching' THEN 'life-coaching' WHEN 'bodywork' THEN 'bodywork'
    WHEN 'mindfulness' THEN 'mindfulness' WHEN 'spiritual' THEN 'spiritual-growth' WHEN 'kambo' THEN 'kambo'
    WHEN 'ice' THEN 'ice-bathing'        WHEN 'sauna' THEN 'sauna-heat'
  END $$;

ALTER TABLE public.claimable_profiles
  ADD COLUMN IF NOT EXISTS category_slug TEXT GENERATED ALWAYS AS (public.orive_category_slug(category)) STORED,
  ADD COLUMN IF NOT EXISTS terms_consented_at TIMESTAMPTZ NULL,
  ADD COLUMN IF NOT EXISTS terms_consent_version TEXT NULL;

-- name slug is unique per category (anna-mueller, anna-mueller-2 …), no longer globally
ALTER TABLE public.claimable_profiles DROP CONSTRAINT IF EXISTS claimable_profiles_slug_key;
CREATE UNIQUE INDEX IF NOT EXISTS claimable_profiles_category_slug_uniq ON public.claimable_profiles (category_slug, slug);
CREATE INDEX IF NOT EXISTS claimable_profiles_slug_live_idx ON public.claimable_profiles (slug) WHERE status = 'live';
ALTER TABLE public.claimable_profiles DROP CONSTRAINT IF EXISTS claimable_live_needs_consent;
ALTER TABLE public.claimable_profiles ADD CONSTRAINT claimable_live_needs_consent
  CHECK (status = 'draft' OR terms_consented_at IS NOT NULL) NOT VALID;  -- NOT VALID: existing rows untouched; new/updated rows checked

GRANT SELECT (category_slug, terms_consented_at) ON public.claimable_profiles TO authenticated;

-- (b) account consent (terms + Art. 9(2)(a) GDPR), mandatory after every sign-up incl. Google / Apple
CREATE TABLE IF NOT EXISTS public.account_consents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  purpose TEXT NOT NULL CHECK (purpose IN ('account_terms_art9')),
  text_version TEXT NOT NULL,
  text_sha256 TEXT NOT NULL CHECK (text_sha256 ~ '^[0-9a-f]{64}$'),
  lang TEXT NOT NULL CHECK (lang IN ('de','en')),
  client_hash TEXT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  withdrawn_at TIMESTAMPTZ NULL,
  UNIQUE (user_id, purpose, text_version)
);
ALTER TABLE public.account_consents ENABLE ROW LEVEL SECURITY;   -- no policies: server (service role) only
REVOKE ALL ON public.account_consents FROM anon, authenticated;

-- (c) public view: only live AND consented profiles, now with category_slug (appended -> CREATE OR REPLACE is allowed)
CREATE OR REPLACE VIEW public.live_claimed_profiles
WITH (security_barrier = true) AS
  SELECT id, slug, display_name, category, categories, city, country, website, instagram, bio,
         colourway, cover_key, profile_id, claimed_at, category_slug
  FROM public.claimable_profiles WHERE status = 'live' AND terms_consented_at IS NOT NULL;
GRANT SELECT ON public.live_claimed_profiles TO anon, authenticated;

-- (d) claim_profile: username can no longer simply be the slug (slugs repeat across categories)
CREATE OR REPLACE FUNCTION public.claim_profile(p_token_hash TEXT, p_user_id UUID, p_full_name TEXT)
RETURNS TABLE (claimable_id UUID, slug TEXT, category TEXT)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  t public.claim_tokens%ROWTYPE;
  cp public.claimable_profiles%ROWTYPE;
  o public.claimable_offers%ROWTYPE;
  new_offering UUID;
  uname TEXT;
BEGIN
  SELECT * INTO t FROM public.claim_tokens WHERE token_hash = p_token_hash FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'claim_invalid' USING ERRCODE = 'P0001'; END IF;
  IF t.revoked_at IS NOT NULL OR t.expires_at <= now() THEN RAISE EXCEPTION 'claim_expired' USING ERRCODE = 'P0001'; END IF;
  IF t.used_at IS NOT NULL THEN RAISE EXCEPTION 'claim_used' USING ERRCODE = 'P0001'; END IF;

  SELECT * INTO cp FROM public.claimable_profiles WHERE id = t.claimable_profile_id FOR UPDATE;
  IF cp.status <> 'draft' OR cp.claimed_by IS NOT NULL THEN RAISE EXCEPTION 'claim_used' USING ERRCODE = 'P0001'; END IF;
  IF EXISTS (SELECT 1 FROM public.claimable_profiles WHERE claimed_by = p_user_id) THEN
    RAISE EXCEPTION 'claim_user_has_profile' USING ERRCODE = 'P0001';
  END IF;

  UPDATE public.claim_tokens SET used_at = now(), used_by = p_user_id WHERE id = t.id;
  UPDATE public.claim_tokens SET revoked_at = now() WHERE claimable_profile_id = cp.id AND id <> t.id AND used_at IS NULL;

  uname := cp.slug;
  IF EXISTS (SELECT 1 FROM public.profiles WHERE username = uname AND id <> p_user_id) THEN
    uname := cp.slug || '-' || cp.category_slug;
    IF EXISTS (SELECT 1 FROM public.profiles WHERE username = uname AND id <> p_user_id) THEN
      uname := uname || '-' || left(replace(p_user_id::text, '-', ''), 6);
    END IF;
  END IF;

  INSERT INTO public.profiles (id, full_name, username, location, professional_title, is_visible, onboarding_completed)
  VALUES (p_user_id, COALESCE(NULLIF(btrim(p_full_name), ''), cp.display_name), uname,
          NULLIF(concat_ws(', ', cp.city, cp.country), ''), cp.category, true, false)
  ON CONFLICT (id) DO UPDATE SET is_visible = true,
    username = COALESCE(public.profiles.username, EXCLUDED.username),
    location = COALESCE(public.profiles.location, EXCLUDED.location);

  FOR o IN SELECT * FROM public.claimable_offers WHERE claimable_profile_id = cp.id ORDER BY position LOOP
    INSERT INTO public.offerings (facilitator_id, title, description, duration, price, type, is_online, is_recurring, status)
    VALUES (p_user_id, o.title, o.description, o.duration_minutes,
            CASE WHEN o.price_amount IS NULL THEN NULL ELSE o.price_amount::text END,
            'session', o.format = 'online', false, 'draft')
    RETURNING id INTO new_offering;
    UPDATE public.claimable_offers SET offering_id = new_offering WHERE id = o.id;
  END LOOP;

  UPDATE public.claimable_profiles
     SET status = 'live', claimed_by = p_user_id, claimed_at = now(), profile_id = p_user_id, updated_at = now(),
         terms_consented_at = COALESCE(terms_consented_at, CASE WHEN current_setting('orive.claim_consented', true) = 'on' THEN now() END),
         terms_consent_version = COALESCE(terms_consent_version, NULLIF(current_setting('orive.claim_consent_version', true), ''))
   WHERE id = cp.id;

  RETURN QUERY SELECT cp.id, cp.slug, cp.category;
END $$;

-- (e) the only entry point the app uses: consent record + claim in ONE transaction (no consent -> nothing happens)
CREATE OR REPLACE FUNCTION public.claim_profile_consented(
  p_token_hash TEXT, p_user_id UUID, p_full_name TEXT,
  p_consent_version TEXT, p_consent_sha256 TEXT, p_consent_lang TEXT, p_client_hash TEXT)
RETURNS TABLE (claimable_id UUID, slug TEXT, category TEXT)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF p_consent_version IS NULL OR p_consent_sha256 IS NULL OR p_consent_sha256 !~ '^[0-9a-f]{64}$' OR p_consent_lang NOT IN ('de','en') THEN
    RAISE EXCEPTION 'claim_consent_required' USING ERRCODE = 'P0001';
  END IF;
  INSERT INTO public.account_consents (user_id, purpose, text_version, text_sha256, lang, client_hash)
  VALUES (p_user_id, 'account_terms_art9', p_consent_version, p_consent_sha256, p_consent_lang, p_client_hash)
  ON CONFLICT (user_id, purpose, text_version) DO UPDATE SET withdrawn_at = NULL;
  PERFORM set_config('orive.claim_consented', 'on', true);
  PERFORM set_config('orive.claim_consent_version', p_consent_version, true);
  RETURN QUERY SELECT * FROM public.claim_profile(p_token_hash, p_user_id, p_full_name);
END $$;

REVOKE ALL ON FUNCTION public.claim_profile(TEXT, UUID, TEXT) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.claim_profile_consented(TEXT, UUID, TEXT, TEXT, TEXT, TEXT, TEXT) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.claim_profile(TEXT, UUID, TEXT) TO service_role;
GRANT EXECUTE ON FUNCTION public.claim_profile_consented(TEXT, UUID, TEXT, TEXT, TEXT, TEXT, TEXT) TO service_role;
REVOKE ALL ON FUNCTION public.orive_category_slug(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.orive_category_slug(TEXT) TO anon, authenticated, service_role;

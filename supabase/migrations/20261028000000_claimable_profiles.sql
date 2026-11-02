-- Claimable facilitator profiles imported from the crawler project.
-- Draft profiles are NOT public: no anon/authenticated SELECT policy at all.
-- All access goes through server routes (service role) or the SECURITY DEFINER
-- functions below. Claim tokens are stored only as SHA-256 hashes.

CREATE TABLE IF NOT EXISTS public.claimable_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_facilitator_id UUID NOT NULL UNIQUE,          -- crawler public.facilitators.id
  slug TEXT NOT NULL UNIQUE CHECK (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' AND char_length(slug) BETWEEN 3 AND 80),
  display_name TEXT NOT NULL CHECK (char_length(btrim(display_name)) BETWEEN 2 AND 160),
  category TEXT NOT NULL CHECK (category IN ('ice','sauna','breath','yoga','meditation','mindfulness','bodywork','sound','spiritual','coaching','kambo')),
  categories TEXT[] NOT NULL DEFAULT '{}',
  city TEXT NULL,
  country TEXT NULL,
  website TEXT NULL,
  instagram TEXT NULL,
  contact_email TEXT NULL,                              -- invite address; never rendered publicly
  source_url TEXT NULL,
  bio TEXT NULL CHECK (bio IS NULL OR char_length(bio) <= 2000),   -- from enrichment; shown as draft until edited
  quality_score SMALLINT NULL CHECK (quality_score IS NULL OR quality_score BETWEEN -100 AND 200), -- crawler model v1, ADMIN-ONLY
  quality_tier TEXT NULL CHECK (quality_tier IS NULL OR quality_tier IN ('A','B','C','reject')),
  colourway TEXT NOT NULL DEFAULT 'dark' CHECK (colourway IN ('dark','white')),
  cover_key TEXT NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','live')),
  claimed_by UUID NULL REFERENCES auth.users(id) ON DELETE SET NULL,
  claimed_at TIMESTAMPTZ NULL,
  profile_id UUID NULL REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT claimable_live_needs_owner CHECK (status = 'draft' OR (claimed_by IS NOT NULL AND claimed_at IS NOT NULL))
);
CREATE UNIQUE INDEX IF NOT EXISTS claimable_profiles_claimed_by_uniq ON public.claimable_profiles (claimed_by) WHERE claimed_by IS NOT NULL;

CREATE TABLE IF NOT EXISTS public.claimable_offers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  claimable_profile_id UUID NOT NULL REFERENCES public.claimable_profiles(id) ON DELETE CASCADE,
  position SMALLINT NOT NULL CHECK (position BETWEEN 0 AND 20),
  title TEXT NOT NULL CHECK (char_length(btrim(title)) BETWEEN 2 AND 120),
  description TEXT NULL CHECK (description IS NULL OR char_length(description) <= 600),
  duration_minutes INT NULL CHECK (duration_minutes IS NULL OR duration_minutes BETWEEN 5 AND 10080),
  format TEXT NOT NULL DEFAULT 'in_person' CHECK (format IN ('in_person','online','hybrid')),
  price_amount NUMERIC(10,2) NULL CHECK (price_amount IS NULL OR price_amount >= 0),
  currency TEXT NOT NULL DEFAULT 'EUR',
  is_preset BOOLEAN NOT NULL DEFAULT true,              -- shown as "Beispiel" until edited/confirmed
  offering_id UUID NULL REFERENCES public.offerings(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (claimable_profile_id, position)
);

CREATE TABLE IF NOT EXISTS public.claim_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  claimable_profile_id UUID NOT NULL REFERENCES public.claimable_profiles(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL UNIQUE CHECK (token_hash ~ '^[0-9a-f]{64}$'),
  expires_at TIMESTAMPTZ NOT NULL,
  used_at TIMESTAMPTZ NULL,
  used_by UUID NULL REFERENCES auth.users(id) ON DELETE SET NULL,
  revoked_at TIMESTAMPTZ NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS claim_tokens_profile_idx ON public.claim_tokens (claimable_profile_id);

-- Opt-out list: re-imports skip these (hash of normalised e-mail / source id, no plain PII kept).
CREATE TABLE IF NOT EXISTS public.crawler_suppressions (
  key_hash TEXT PRIMARY KEY CHECK (key_hash ~ '^[0-9a-f]{64}$'),
  reason TEXT NOT NULL DEFAULT 'opt_out',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.claimable_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.claimable_offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.claim_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crawler_suppressions ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.claimable_profiles, public.claimable_offers, public.claim_tokens, public.crawler_suppressions FROM anon, authenticated;

-- Owners may read their own (claimed) row; live rows are readable publicly WITHOUT contact_email
-- via the view below. Drafts are never exposed.
CREATE POLICY "Owner reads own claimable profile" ON public.claimable_profiles
  FOR SELECT TO authenticated USING (claimed_by = auth.uid());
-- column-level grant: owners never see contact_email/quality_* through the API
GRANT SELECT (id, slug, display_name, category, categories, city, country, website, instagram, bio, colourway, cover_key, status, claimed_by, claimed_at, profile_id, created_at, updated_at) ON public.claimable_profiles TO authenticated;

CREATE OR REPLACE VIEW public.live_claimed_profiles
WITH (security_barrier = true) AS
  SELECT id, slug, display_name, category, categories, city, country, website, instagram, bio,
         colourway, cover_key, profile_id, claimed_at
  FROM public.claimable_profiles WHERE status = 'live';
GRANT SELECT ON public.live_claimed_profiles TO anon, authenticated;

-- ---------------------------------------------------------------------------
-- Atomic claim: token single-use + expiry, links auth user, copies offers into
-- public.offerings, creates/updates public.profiles, flips draft -> live.
-- Called only by the server (service role) AFTER it verified the user's JWT.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.claim_profile(p_token_hash TEXT, p_user_id UUID, p_full_name TEXT)
RETURNS TABLE (claimable_id UUID, slug TEXT, category TEXT)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  t public.claim_tokens%ROWTYPE;
  cp public.claimable_profiles%ROWTYPE;
  o public.claimable_offers%ROWTYPE;
  new_offering UUID;
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
  -- every other open token for this profile dies with the claim
  UPDATE public.claim_tokens SET revoked_at = now() WHERE claimable_profile_id = cp.id AND id <> t.id AND used_at IS NULL;

  INSERT INTO public.profiles (id, full_name, username, location, professional_title, is_visible, onboarding_completed)
  VALUES (p_user_id, COALESCE(NULLIF(btrim(p_full_name), ''), cp.display_name), cp.slug,
          NULLIF(concat_ws(', ', cp.city, cp.country), ''), cp.category, true, false)
  ON CONFLICT (id) DO UPDATE SET is_visible = true,
    username = COALESCE(public.profiles.username, EXCLUDED.username),
    location = COALESCE(public.profiles.location, EXCLUDED.location);

  FOR o IN SELECT * FROM public.claimable_offers WHERE claimable_profile_id = cp.id ORDER BY position LOOP
    INSERT INTO public.offerings (facilitator_id, title, description, duration, price, type, is_online, is_recurring, status)
    VALUES (p_user_id, o.title, o.description, o.duration_minutes,
            CASE WHEN o.price_amount IS NULL THEN NULL ELSE o.price_amount::text END,
            'session', o.format = 'online', false, 'draft')   -- offers stay 'draft' until the facilitator confirms them
    RETURNING id INTO new_offering;
    UPDATE public.claimable_offers SET offering_id = new_offering WHERE id = o.id;
  END LOOP;

  UPDATE public.claimable_profiles
     SET status = 'live', claimed_by = p_user_id, claimed_at = now(), profile_id = p_user_id, updated_at = now()
   WHERE id = cp.id;

  RETURN QUERY SELECT cp.id, cp.slug, cp.category;
END $$;

-- GDPR: delete everything we hold about an unclaimed draft and suppress re-import.
CREATE OR REPLACE FUNCTION public.opt_out_claimable(p_token_hash TEXT, p_suppress_keys TEXT[])
RETURNS BOOLEAN LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE cid UUID; k TEXT;
BEGIN
  SELECT t.claimable_profile_id INTO cid FROM public.claim_tokens t
   JOIN public.claimable_profiles p ON p.id = t.claimable_profile_id
   WHERE t.token_hash = p_token_hash AND p.status = 'draft';      -- expired tokens still allow opt-out
  IF cid IS NULL THEN RETURN false; END IF;
  FOREACH k IN ARRAY COALESCE(p_suppress_keys, '{}') LOOP
    INSERT INTO public.crawler_suppressions (key_hash) VALUES (k) ON CONFLICT DO NOTHING;
  END LOOP;
  DELETE FROM public.claimable_profiles WHERE id = cid;           -- cascades offers + tokens
  RETURN true;
END $$;

REVOKE ALL ON FUNCTION public.claim_profile(TEXT, UUID, TEXT) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.opt_out_claimable(TEXT, TEXT[]) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.claim_profile(TEXT, UUID, TEXT) TO service_role;
GRANT EXECUTE ON FUNCTION public.opt_out_claimable(TEXT, TEXT[]) TO service_role;

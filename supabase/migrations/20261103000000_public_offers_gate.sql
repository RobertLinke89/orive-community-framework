-- Public offers (step 6) – APP project. NOT APPLIED; for Robert's approval. Rollback: supabase/rollbacks/20261103000000_public_offers_gate.rollback.sql
-- Crawled offers live in the crawler project (public.facilitator_offers). They are shown only for publicly visible facilitators (gate below); joined via
-- claimable_profiles.source_facilitator_id. No new public grants: the app reads with the service role server-side.

-- "angebote" is a static route under /{category}/ and must never become a profile slug
ALTER TABLE public.claimable_profiles DROP CONSTRAINT IF EXISTS claimable_slug_not_reserved;
ALTER TABLE public.claimable_profiles ADD CONSTRAINT claimable_slug_not_reserved CHECK (slug <> 'angebote') NOT VALID;

-- ============================================================================================================
-- Batch approval (Robert) + one-click opt-out + outreach lifecycle
-- Visibility gate (src/lib/claim/visibility.ts):
--   hidden_at IS NULL AND (published_at IS NOT NULL OR (status='live' AND terms_consented_at IS NOT NULL))
-- ============================================================================================================
CREATE TABLE IF NOT EXISTS public.release_batches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  label TEXT NOT NULL,
  approved_by UUID NULL REFERENCES auth.users(id) ON DELETE SET NULL,
  approved_at TIMESTAMPTZ NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.release_batches ENABLE ROW LEVEL SECURITY;   -- no policies: service role only
REVOKE ALL ON public.release_batches FROM anon, authenticated;

ALTER TABLE public.claimable_profiles
  ADD COLUMN IF NOT EXISTS release_batch_id UUID NULL REFERENCES public.release_batches(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS published_at TIMESTAMPTZ NULL,
  ADD COLUMN IF NOT EXISTS hidden_at TIMESTAMPTZ NULL,
  ADD COLUMN IF NOT EXISTS opt_out_token_hash TEXT NULL CHECK (opt_out_token_hash IS NULL OR opt_out_token_hash ~ '^[0-9a-f]{64}$');
CREATE UNIQUE INDEX IF NOT EXISTS claimable_profiles_optout_uniq ON public.claimable_profiles (opt_out_token_hash) WHERE opt_out_token_hash IS NOT NULL;
CREATE INDEX IF NOT EXISTS claimable_profiles_public_cat_idx ON public.claimable_profiles (category, source_facilitator_id)
  WHERE hidden_at IS NULL AND (published_at IS NOT NULL OR (status = 'live' AND terms_consented_at IS NOT NULL));
-- publishing requires an approved batch
ALTER TABLE public.claimable_profiles DROP CONSTRAINT IF EXISTS claimable_published_needs_batch;
ALTER TABLE public.claimable_profiles ADD CONSTRAINT claimable_published_needs_batch
  CHECK (published_at IS NULL OR release_batch_id IS NOT NULL) NOT VALID;

-- public view follows the new gate (column list unchanged -> CREATE OR REPLACE allowed)
CREATE OR REPLACE VIEW public.live_claimed_profiles
WITH (security_barrier = true) AS
  SELECT id, slug, display_name, category, categories, city, country, website, instagram, bio,
         colourway, cover_key, profile_id, claimed_at, category_slug
  FROM public.claimable_profiles
  WHERE hidden_at IS NULL AND (published_at IS NOT NULL OR (status = 'live' AND terms_consented_at IS NOT NULL));

CREATE TABLE IF NOT EXISTS public.facilitator_outreach (
  claimable_profile_id UUID PRIMARY KEY REFERENCES public.claimable_profiles(id) ON DELETE CASCADE,
  release_batch_id UUID NULL REFERENCES public.release_batches(id) ON DELETE SET NULL,
  published_at TIMESTAMPTZ NULL,
  activation_sent_at TIMESTAMPTZ NULL,
  reminder1_sent_at TIMESTAMPTZ NULL,
  reminder2_sent_at TIMESTAMPTZ NULL,
  reminder3_sent_at TIMESTAMPTZ NULL,
  responded_at TIMESTAMPTZ NULL,
  response_type TEXT NULL CHECK (response_type IS NULL OR response_type IN ('confirmed','opt_out','deleted')),
  unpublished_at TIMESTAMPTZ NULL,
  unpublish_reason TEXT NULL CHECK (unpublish_reason IS NULL OR unpublish_reason IN ('no_response_after_reminder3','opt_out','deleted','manual')),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK ((responded_at IS NULL) = (response_type IS NULL))
);
CREATE INDEX IF NOT EXISTS facilitator_outreach_open_idx ON public.facilitator_outreach (activation_sent_at)
  WHERE responded_at IS NULL AND unpublished_at IS NULL;
ALTER TABLE public.facilitator_outreach ENABLE ROW LEVEL SECURITY;  -- no policies: service role only
REVOKE ALL ON public.facilitator_outreach FROM anon, authenticated;

-- Robert approves a batch: publish all its profiles + start outreach. Mail sending is a separate explicit step
-- that calls mark_outreach_sent(id,'activation') after Resend accepted the mail.
CREATE OR REPLACE FUNCTION public.publish_release_batch(p_batch UUID, p_approved_by UUID)
RETURNS INTEGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE n INTEGER;
BEGIN
  UPDATE public.release_batches SET approved_by = p_approved_by, approved_at = now() WHERE id = p_batch AND approved_at IS NULL;
  IF NOT FOUND THEN RAISE EXCEPTION 'batch_missing_or_already_approved' USING ERRCODE = 'P0001'; END IF;
  UPDATE public.claimable_profiles SET published_at = now(), updated_at = now()
   WHERE release_batch_id = p_batch AND published_at IS NULL AND hidden_at IS NULL AND opt_out_token_hash IS NOT NULL;
  GET DIAGNOSTICS n = ROW_COUNT;
  INSERT INTO public.facilitator_outreach (claimable_profile_id, release_batch_id, published_at)
    SELECT id, p_batch, published_at FROM public.claimable_profiles WHERE release_batch_id = p_batch AND published_at IS NOT NULL
  ON CONFLICT (claimable_profile_id) DO NOTHING;
  RETURN n;
END $$;

CREATE OR REPLACE FUNCTION public.mark_outreach_sent(p_id UUID, p_kind TEXT)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  UPDATE public.facilitator_outreach SET updated_at = now(),
    activation_sent_at = CASE WHEN p_kind = 'activation' THEN COALESCE(activation_sent_at, now()) ELSE activation_sent_at END,
    reminder1_sent_at  = CASE WHEN p_kind = 'reminder1'  THEN COALESCE(reminder1_sent_at, now())  ELSE reminder1_sent_at END,
    reminder2_sent_at  = CASE WHEN p_kind = 'reminder2'  THEN COALESCE(reminder2_sent_at, now())  ELSE reminder2_sent_at END,
    reminder3_sent_at  = CASE WHEN p_kind = 'reminder3'  THEN COALESCE(reminder3_sent_at, now())  ELSE reminder3_sent_at END
  WHERE claimable_profile_id = p_id AND responded_at IS NULL AND unpublished_at IS NULL;
END $$;

-- one-click opt-out: hide immediately (idempotent), record response
CREATE OR REPLACE FUNCTION public.hide_profile_by_optout(p_token_hash TEXT)
RETURNS TABLE (display_name TEXT, source_facilitator_id UUID, contact_email TEXT)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  RETURN QUERY UPDATE public.claimable_profiles cp SET hidden_at = COALESCE(cp.hidden_at, now()), updated_at = now()
    WHERE cp.opt_out_token_hash = p_token_hash RETURNING cp.display_name, cp.source_facilitator_id, cp.contact_email;
  UPDATE public.facilitator_outreach o SET responded_at = COALESCE(o.responded_at, now()), response_type = COALESCE(o.response_type, 'opt_out'),
         unpublished_at = COALESCE(o.unpublished_at, now()), unpublish_reason = COALESCE(o.unpublish_reason, 'opt_out'), updated_at = now()
    FROM public.claimable_profiles cp WHERE cp.id = o.claimable_profile_id AND cp.opt_out_token_hash = p_token_hash;
END $$;

-- full deletion: suppress re-import, delete the row (cascades offers/tokens/outreach); claimed accounts are not deleted here
CREATE OR REPLACE FUNCTION public.delete_profile_by_optout(p_token_hash TEXT, p_suppress_keys TEXT[])
RETURNS BOOLEAN LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE pid UUID;
BEGIN
  SELECT id INTO pid FROM public.claimable_profiles WHERE opt_out_token_hash = p_token_hash AND claimed_by IS NULL FOR UPDATE;
  IF pid IS NULL THEN RETURN FALSE; END IF;
  INSERT INTO public.crawler_suppressions (key_hash, reason) SELECT k, 'opt_out_delete' FROM unnest(p_suppress_keys) k
    WHERE k ~ '^[0-9a-f]{64}$' ON CONFLICT DO NOTHING;
  DELETE FROM public.claimable_profiles WHERE id = pid;
  RETURN TRUE;
END $$;

-- day-28 auto-unpublish (no mail); only rows still without response
CREATE OR REPLACE FUNCTION public.unpublish_outreach_due(p_ids UUID[])
RETURNS INTEGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE n INTEGER;
BEGIN
  WITH due AS (
    UPDATE public.facilitator_outreach SET unpublished_at = now(), unpublish_reason = 'no_response_after_reminder3', updated_at = now()
     WHERE claimable_profile_id = ANY(p_ids) AND responded_at IS NULL AND unpublished_at IS NULL
       AND reminder3_sent_at IS NOT NULL AND reminder3_sent_at <= now() - interval '7 days'
       AND activation_sent_at <= now() - interval '28 days'
    RETURNING claimable_profile_id)
  UPDATE public.claimable_profiles cp SET published_at = NULL, updated_at = now()
    FROM due WHERE cp.id = due.claimable_profile_id AND cp.status = 'draft';
  GET DIAGNOSTICS n = ROW_COUNT;
  RETURN n;
END $$;

-- claim = response "confirmed" (trigger, so claim_profile() itself stays unchanged)
CREATE OR REPLACE FUNCTION public.outreach_on_claim() RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.status = 'live' AND OLD.status = 'draft' THEN
    UPDATE public.facilitator_outreach SET responded_at = COALESCE(responded_at, now()), response_type = COALESCE(response_type, 'confirmed'), updated_at = now()
     WHERE claimable_profile_id = NEW.id;
  END IF;
  RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS claimable_profiles_outreach_claim ON public.claimable_profiles;
CREATE TRIGGER claimable_profiles_outreach_claim AFTER UPDATE OF status ON public.claimable_profiles
  FOR EACH ROW EXECUTE FUNCTION public.outreach_on_claim();

REVOKE ALL ON FUNCTION public.publish_release_batch(UUID, UUID), public.mark_outreach_sent(UUID, TEXT), public.hide_profile_by_optout(TEXT),
  public.delete_profile_by_optout(TEXT, TEXT[]), public.unpublish_outreach_due(UUID[]), public.outreach_on_claim() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.publish_release_batch(UUID, UUID), public.mark_outreach_sent(UUID, TEXT), public.hide_profile_by_optout(TEXT),
  public.delete_profile_by_optout(TEXT, TEXT[]), public.unpublish_outreach_due(UUID[]) TO service_role;

-- Optional scheduler alternative to an external cron (needs pg_cron + pg_net, NOT enabled here):
-- SELECT cron.schedule('orive-outreach-dry-run', '15 7 * * *',
--   $$SELECT net.http_get('https://orive.co/api/cron/outreach', headers => jsonb_build_object('Authorization','Bearer <CRON_SECRET>'))$$);

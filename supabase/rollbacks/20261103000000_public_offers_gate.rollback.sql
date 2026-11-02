-- Rollback for 20261103000000_public_offers_gate.sql
DROP TRIGGER IF EXISTS claimable_profiles_outreach_claim ON public.claimable_profiles;
DROP FUNCTION IF EXISTS public.outreach_on_claim(), public.unpublish_outreach_due(UUID[]), public.delete_profile_by_optout(TEXT, TEXT[]),
  public.hide_profile_by_optout(TEXT), public.mark_outreach_sent(UUID, TEXT), public.publish_release_batch(UUID, UUID);
DROP TABLE IF EXISTS public.facilitator_outreach;
CREATE OR REPLACE VIEW public.live_claimed_profiles WITH (security_barrier = true) AS
  SELECT id, slug, display_name, category, categories, city, country, website, instagram, bio,
         colourway, cover_key, profile_id, claimed_at, category_slug
  FROM public.claimable_profiles WHERE status = 'live' AND terms_consented_at IS NOT NULL;
ALTER TABLE public.claimable_profiles DROP CONSTRAINT IF EXISTS claimable_published_needs_batch;
DROP INDEX IF EXISTS public.claimable_profiles_public_cat_idx;
DROP INDEX IF EXISTS public.claimable_profiles_optout_uniq;
ALTER TABLE public.claimable_profiles DROP COLUMN IF EXISTS opt_out_token_hash, DROP COLUMN IF EXISTS hidden_at,
  DROP COLUMN IF EXISTS published_at, DROP COLUMN IF EXISTS release_batch_id;
DROP TABLE IF EXISTS public.release_batches;
ALTER TABLE public.claimable_profiles DROP CONSTRAINT IF EXISTS claimable_slug_not_reserved;
-- NOTE: after rollback the app code must be reverted too (it selects published_at/hidden_at).

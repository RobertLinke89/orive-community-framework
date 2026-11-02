-- Public offers (step 6) – CRAWLER project apcrvowzrihkpkuwxbhb. NOT APPLIED; for Robert's approval.
-- Rollback: supabase/rollbacks/20261103000000_offers_publication.rollback.sql
-- Today: facilitator_offers / facilitator_offer_enrichment have RLS ON and NO policies -> only service role can read.
-- This migration keeps it that way for anon/authenticated and adds an OPTIONAL defence-in-depth allowlist + view:
-- the app syncs publicly visible facilitators into offer_publications (on batch approval or claim; delete on opt-out / unpublish), and
-- published_facilitator_offers only ever returns offers of facilitators in that list.
-- The app code (src/lib/offers/repo.ts) already enforces the visibility gate itself; the view can be adopted later.

REVOKE ALL ON public.facilitator_offers, public.facilitator_offer_enrichment FROM anon, authenticated;

CREATE TABLE IF NOT EXISTS public.offer_publications (
  facilitator_id UUID PRIMARY KEY REFERENCES public.facilitators(id) ON DELETE CASCADE,
  app_claimable_profile_id UUID NOT NULL,       -- claimable_profiles.id in the app project
  consented_at TIMESTAMPTZ NOT NULL,            -- published_at or terms_consented_at from the app
  published_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.offer_publications ENABLE ROW LEVEL SECURITY;   -- no policies: service role only
REVOKE ALL ON public.offer_publications FROM anon, authenticated;

CREATE OR REPLACE VIEW public.published_facilitator_offers
WITH (security_barrier = true, security_invoker = true) AS
  SELECT o.id, o.facilitator_id, o.type, o.title, o.description, o.price, o.currency, o.duration, o.url,
         o.image_url, o.starts_at
  FROM public.facilitator_offers o
  JOIN public.offer_publications p ON p.facilitator_id = o.facilitator_id;
REVOKE ALL ON public.published_facilitator_offers FROM anon, authenticated;
GRANT SELECT ON public.published_facilitator_offers TO service_role;

-- detail page "more offers" + per-type listing
CREATE INDEX IF NOT EXISTS facilitator_offers_type_fac_idx ON public.facilitator_offers (type, facilitator_id);

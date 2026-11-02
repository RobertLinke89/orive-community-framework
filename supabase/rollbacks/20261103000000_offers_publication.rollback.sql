DROP VIEW IF EXISTS public.published_facilitator_offers;
DROP TABLE IF EXISTS public.offer_publications;
DROP INDEX IF EXISTS public.facilitator_offers_type_fac_idx;
-- REVOKE is not rolled back on purpose (anon/authenticated had no usable access before: RLS on, no policies).

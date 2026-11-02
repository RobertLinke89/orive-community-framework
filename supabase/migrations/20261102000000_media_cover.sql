-- Allow one uploadable cover image per profile (kind = 'cover'). File only; not applied live.
ALTER TABLE public.facilitator_media DROP CONSTRAINT IF EXISTS facilitator_media_kind_check;
ALTER TABLE public.facilitator_media ADD CONSTRAINT facilitator_media_kind_check CHECK (kind IN ('gallery','offer','product','cover'));
ALTER TABLE public.facilitator_media DROP CONSTRAINT IF EXISTS media_kind_target;
ALTER TABLE public.facilitator_media ADD CONSTRAINT media_kind_target CHECK (
  (kind IN ('gallery','cover') AND offer_id IS NULL AND product_id IS NULL) OR
  (kind = 'offer' AND offer_id IS NOT NULL AND product_id IS NULL) OR
  (kind = 'product' AND product_id IS NOT NULL AND offer_id IS NULL));
CREATE UNIQUE INDEX IF NOT EXISTS facilitator_media_cover_uniq ON public.facilitator_media (claimable_profile_id) WHERE kind = 'cover';

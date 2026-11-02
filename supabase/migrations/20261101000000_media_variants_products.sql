-- Patch 0005 (NOT applied to any live database).
-- (a) resized WebP variants: storage_path = largest variant `{owner}/{uuid}.webp`, smaller ones `{owner}/{uuid}-w{width}.webp`
ALTER TABLE public.facilitator_media ADD COLUMN IF NOT EXISTS variants SMALLINT[] NOT NULL DEFAULT '{}'
  CHECK (cardinality(variants) <= 4 AND 0 < ALL (variants) AND 2000 >= ALL (variants));

-- (b) max 24 products per profile; title/url checks already in 20261031000000
CREATE OR REPLACE FUNCTION public.facilitator_products_guard() RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.claimable_profiles WHERE id = NEW.claimable_profile_id AND claimed_by = NEW.owner_id) THEN
    RAISE EXCEPTION 'product_not_owner' USING ERRCODE = 'P0001';
  END IF;
  IF TG_OP = 'INSERT' THEN
    PERFORM pg_advisory_xact_lock(hashtext('products:' || NEW.claimable_profile_id::text));
    IF (SELECT count(*) FROM public.facilitator_products WHERE claimable_profile_id = NEW.claimable_profile_id) >= 24 THEN
      RAISE EXCEPTION 'products_full' USING ERRCODE = 'P0001';
    END IF;
  END IF;
  IF TG_OP = 'UPDATE' AND (NEW.owner_id <> OLD.owner_id OR NEW.claimable_profile_id <> OLD.claimable_profile_id) THEN
    RAISE EXCEPTION 'product_immutable_owner' USING ERRCODE = 'P0001';
  END IF;
  NEW.updated_at := now();
  RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS facilitator_products_guard ON public.facilitator_products;
CREATE TRIGGER facilitator_products_guard BEFORE INSERT OR UPDATE ON public.facilitator_products FOR EACH ROW EXECUTE FUNCTION public.facilitator_products_guard();

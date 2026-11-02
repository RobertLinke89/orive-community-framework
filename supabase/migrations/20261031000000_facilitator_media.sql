-- Facilitator media: gallery (max 12), one image per offer / product, products. NOT applied to any live database.
-- Files: PRIVATE Storage bucket `facilitator-media`, path `{owner_user_id}/{uuid}.{jpg|png|webp}`.
-- Writes: only the owning facilitator (claimed_by = auth.uid()). Public reads: only for live + consented profiles.
-- The app reads via the service role and hands out short-lived signed URLs (lib/claim/media.ts).

-- (a) bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('facilitator-media', 'facilitator-media', false, 5242880, ARRAY['image/jpeg','image/png','image/webp'])
ON CONFLICT (id) DO UPDATE SET public = false, file_size_limit = EXCLUDED.file_size_limit, allowed_mime_types = EXCLUDED.allowed_mime_types;

-- helper: is this auth user the owner of a claimed profile / is the profile publicly visible?
CREATE OR REPLACE FUNCTION public.media_owner_ok(p_user UUID) RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.claimable_profiles WHERE claimed_by = p_user) $$;
CREATE OR REPLACE FUNCTION public.media_profile_public(p_profile UUID) RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.claimable_profiles WHERE id = p_profile AND status = 'live' AND terms_consented_at IS NOT NULL) $$;
CREATE OR REPLACE FUNCTION public.media_owner_public(p_user UUID) RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.claimable_profiles WHERE claimed_by = p_user AND status = 'live' AND terms_consented_at IS NOT NULL) $$;
REVOKE ALL ON FUNCTION public.media_owner_ok(UUID), public.media_profile_public(UUID), public.media_owner_public(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.media_owner_ok(UUID), public.media_profile_public(UUID), public.media_owner_public(UUID) TO anon, authenticated, service_role;

-- (b) storage policies (storage.objects has RLS enabled by Supabase)
DROP POLICY IF EXISTS "facilitator media: owner insert" ON storage.objects;
CREATE POLICY "facilitator media: owner insert" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'facilitator-media' AND (storage.foldername(name))[1] = auth.uid()::text AND public.media_owner_ok(auth.uid()));
DROP POLICY IF EXISTS "facilitator media: owner update" ON storage.objects;
CREATE POLICY "facilitator media: owner update" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'facilitator-media' AND (storage.foldername(name))[1] = auth.uid()::text)
  WITH CHECK (bucket_id = 'facilitator-media' AND (storage.foldername(name))[1] = auth.uid()::text);
DROP POLICY IF EXISTS "facilitator media: owner delete" ON storage.objects;
CREATE POLICY "facilitator media: owner delete" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'facilitator-media' AND (storage.foldername(name))[1] = auth.uid()::text);
DROP POLICY IF EXISTS "facilitator media: owner read" ON storage.objects;
CREATE POLICY "facilitator media: owner read" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'facilitator-media' AND (storage.foldername(name))[1] = auth.uid()::text);
DROP POLICY IF EXISTS "facilitator media: public read live" ON storage.objects;
CREATE POLICY "facilitator media: public read live" ON storage.objects FOR SELECT TO anon, authenticated
  USING (bucket_id = 'facilitator-media' AND (storage.foldername(name))[1] ~ '^[0-9a-f-]{36}$'
         AND public.media_owner_public(((storage.foldername(name))[1])::uuid));

-- (c) products (shown only when published)
CREATE TABLE IF NOT EXISTS public.facilitator_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  claimable_profile_id UUID NOT NULL REFERENCES public.claimable_profiles(id) ON DELETE CASCADE,
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  position SMALLINT NOT NULL DEFAULT 0,
  title TEXT NOT NULL CHECK (char_length(btrim(title)) BETWEEN 2 AND 120),
  description TEXT NULL CHECK (description IS NULL OR char_length(description) <= 600),
  price_amount NUMERIC(10,2) NULL CHECK (price_amount IS NULL OR price_amount BETWEEN 0 AND 100000),
  currency TEXT NOT NULL DEFAULT 'EUR' CHECK (currency ~ '^[A-Z]{3}$'),
  url TEXT NULL CHECK (url IS NULL OR url ~ '^https?://'),
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','published')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS facilitator_products_profile_idx ON public.facilitator_products (claimable_profile_id, position);

-- (d) media rows
CREATE TABLE IF NOT EXISTS public.facilitator_media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  claimable_profile_id UUID NOT NULL REFERENCES public.claimable_profiles(id) ON DELETE CASCADE,
  kind TEXT NOT NULL CHECK (kind IN ('gallery','offer','product')),
  offer_id UUID NULL REFERENCES public.claimable_offers(id) ON DELETE CASCADE,
  product_id UUID NULL REFERENCES public.facilitator_products(id) ON DELETE CASCADE,
  storage_path TEXT NOT NULL UNIQUE CHECK (storage_path ~ '^[0-9a-f-]{36}/[0-9a-f-]{36}\.(jpg|png|webp)$'),
  alt TEXT NOT NULL CHECK (char_length(btrim(alt)) BETWEEN 3 AND 200),
  width INT NULL CHECK (width IS NULL OR width BETWEEN 1 AND 20000),
  height INT NULL CHECK (height IS NULL OR height BETWEEN 1 AND 20000),
  mime TEXT NOT NULL CHECK (mime IN ('image/jpeg','image/png','image/webp')),
  bytes INT NOT NULL CHECK (bytes BETWEEN 1 AND 5242880),
  position SMALLINT NOT NULL DEFAULT 0,
  rights_confirmed_at TIMESTAMPTZ NOT NULL DEFAULT now(),   -- uploader confirmed they own the rights (UI checkbox, server-checked)
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT media_kind_target CHECK (
    (kind = 'gallery' AND offer_id IS NULL AND product_id IS NULL) OR
    (kind = 'offer' AND offer_id IS NOT NULL AND product_id IS NULL) OR
    (kind = 'product' AND product_id IS NOT NULL AND offer_id IS NULL)),
  CONSTRAINT media_path_owner CHECK (split_part(storage_path, '/', 1) = owner_id::text)
);
CREATE UNIQUE INDEX IF NOT EXISTS facilitator_media_offer_uniq ON public.facilitator_media (offer_id) WHERE kind = 'offer';
CREATE UNIQUE INDEX IF NOT EXISTS facilitator_media_product_uniq ON public.facilitator_media (product_id) WHERE kind = 'product';
CREATE INDEX IF NOT EXISTS facilitator_media_profile_idx ON public.facilitator_media (claimable_profile_id, kind, position);

-- owner of the media must be the one who claimed the profile; gallery max 12
CREATE OR REPLACE FUNCTION public.facilitator_media_guard() RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.claimable_profiles WHERE id = NEW.claimable_profile_id AND claimed_by = NEW.owner_id) THEN
    RAISE EXCEPTION 'media_not_owner' USING ERRCODE = 'P0001';
  END IF;
  IF NEW.kind = 'offer' AND NOT EXISTS (SELECT 1 FROM public.claimable_offers WHERE id = NEW.offer_id AND claimable_profile_id = NEW.claimable_profile_id) THEN
    RAISE EXCEPTION 'media_bad_offer' USING ERRCODE = 'P0001';
  END IF;
  IF NEW.kind = 'product' AND NOT EXISTS (SELECT 1 FROM public.facilitator_products WHERE id = NEW.product_id AND claimable_profile_id = NEW.claimable_profile_id) THEN
    RAISE EXCEPTION 'media_bad_product' USING ERRCODE = 'P0001';
  END IF;
  IF TG_OP = 'INSERT' AND NEW.kind = 'gallery' THEN
    PERFORM pg_advisory_xact_lock(hashtext(NEW.claimable_profile_id::text));
    IF (SELECT count(*) FROM public.facilitator_media WHERE claimable_profile_id = NEW.claimable_profile_id AND kind = 'gallery') >= 12 THEN
      RAISE EXCEPTION 'gallery_full' USING ERRCODE = 'P0001';
    END IF;
  END IF;
  RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS facilitator_media_guard ON public.facilitator_media;
CREATE TRIGGER facilitator_media_guard BEFORE INSERT OR UPDATE ON public.facilitator_media FOR EACH ROW EXECUTE FUNCTION public.facilitator_media_guard();

-- (e) RLS: owner manages own rows; everybody reads rows of live + consented profiles only
ALTER TABLE public.facilitator_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.facilitator_products ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.facilitator_media, public.facilitator_products FROM anon, authenticated;
GRANT SELECT ON public.facilitator_media, public.facilitator_products TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.facilitator_media, public.facilitator_products TO authenticated;
GRANT ALL ON public.facilitator_media, public.facilitator_products TO service_role;

CREATE POLICY "media: public read live" ON public.facilitator_media FOR SELECT TO anon, authenticated USING (public.media_profile_public(claimable_profile_id));
CREATE POLICY "media: owner read" ON public.facilitator_media FOR SELECT TO authenticated USING (owner_id = auth.uid());
CREATE POLICY "media: owner insert" ON public.facilitator_media FOR INSERT TO authenticated WITH CHECK (owner_id = auth.uid());
CREATE POLICY "media: owner update" ON public.facilitator_media FOR UPDATE TO authenticated USING (owner_id = auth.uid()) WITH CHECK (owner_id = auth.uid());
CREATE POLICY "media: owner delete" ON public.facilitator_media FOR DELETE TO authenticated USING (owner_id = auth.uid());

CREATE POLICY "products: public read live" ON public.facilitator_products FOR SELECT TO anon, authenticated USING (status = 'published' AND public.media_profile_public(claimable_profile_id));
CREATE POLICY "products: owner read" ON public.facilitator_products FOR SELECT TO authenticated USING (owner_id = auth.uid());
CREATE POLICY "products: owner insert" ON public.facilitator_products FOR INSERT TO authenticated
  WITH CHECK (owner_id = auth.uid() AND EXISTS (SELECT 1 FROM public.claimable_profiles p WHERE p.id = claimable_profile_id AND p.claimed_by = auth.uid()));
CREATE POLICY "products: owner update" ON public.facilitator_products FOR UPDATE TO authenticated USING (owner_id = auth.uid()) WITH CHECK (owner_id = auth.uid());
CREATE POLICY "products: owner delete" ON public.facilitator_products FOR DELETE TO authenticated USING (owner_id = auth.uid());

-- (f) atomic gallery reorder (service role, after the route checked ownership)
CREATE OR REPLACE FUNCTION public.reorder_facilitator_media(p_owner UUID, p_profile UUID, p_ids UUID[])
RETURNS BOOLEAN LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE i INT;
BEGIN
  IF (SELECT count(*) FROM public.facilitator_media WHERE claimable_profile_id = p_profile AND owner_id = p_owner AND kind = 'gallery') <> coalesce(array_length(p_ids, 1), 0)
     OR EXISTS (SELECT 1 FROM unnest(p_ids) x WHERE NOT EXISTS (SELECT 1 FROM public.facilitator_media m WHERE m.id = x AND m.owner_id = p_owner AND m.claimable_profile_id = p_profile AND m.kind = 'gallery'))
  THEN RETURN false; END IF;
  FOR i IN 1 .. coalesce(array_length(p_ids, 1), 0) LOOP
    UPDATE public.facilitator_media SET position = i - 1 WHERE id = p_ids[i];
  END LOOP;
  RETURN true;
END $$;
REVOKE ALL ON FUNCTION public.reorder_facilitator_media(UUID, UUID, UUID[]) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.reorder_facilitator_media(UUID, UUID, UUID[]) TO service_role;

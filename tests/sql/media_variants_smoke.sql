-- 20261101000000 smoke: variants column + product guard (24 max, owner only)
\set ON_ERROR_STOP on
INSERT INTO auth.users VALUES ('33333333-3333-4333-8333-333333333333') ON CONFLICT DO NOTHING;
SET session_replication_role = replica;
INSERT INTO public.claimable_profiles (id, source_facilitator_id, slug, display_name, category, status, claimed_by, claimed_at, terms_consented_at)
VALUES ('e0000000-0000-4000-8000-000000000001', gen_random_uuid(), 'v-live', 'Vera Sauna', 'sauna', 'live', '33333333-3333-4333-8333-333333333333', now(), now());
SET session_replication_role = DEFAULT;
SET ROLE authenticated; SELECT set_config('test.uid','33333333-3333-4333-8333-333333333333',false);
INSERT INTO public.facilitator_media (owner_id, claimable_profile_id, kind, storage_path, alt, mime, bytes, width, height, variants)
VALUES (auth.uid(), 'e0000000-0000-4000-8000-000000000001', 'gallery', auth.uid()||'/'||gen_random_uuid()||'.webp', 'Sauna', 'image/webp', 1000, 1600, 1067, '{400,800,1600}');
DO $$ BEGIN INSERT INTO public.facilitator_media (owner_id, claimable_profile_id, kind, storage_path, alt, mime, bytes, variants)
  VALUES (auth.uid(), 'e0000000-0000-4000-8000-000000000001', 'gallery', auth.uid()||'/'||gen_random_uuid()||'.webp', 'x y', 'image/webp', 1, '{0}');
  RAISE EXCEPTION 'bad variant allowed'; EXCEPTION WHEN check_violation THEN NULL; END $$;
DO $$ BEGIN FOR i IN 1..24 LOOP
  INSERT INTO public.facilitator_products (claimable_profile_id, owner_id, title, position) VALUES ('e0000000-0000-4000-8000-000000000001', auth.uid(), 'Produkt '||i, i); END LOOP; END $$;
DO $$ BEGIN INSERT INTO public.facilitator_products (claimable_profile_id, owner_id, title) VALUES ('e0000000-0000-4000-8000-000000000001', auth.uid(), 'Zu viel');
  RAISE EXCEPTION '25th product allowed'; EXCEPTION WHEN raise_exception THEN IF SQLERRM <> 'products_full' THEN RAISE; END IF; END $$;
UPDATE public.facilitator_products SET status = 'published' WHERE title = 'Produkt 1';
RESET ROLE;
SET ROLE anon; SELECT set_config('test.uid','',false);
DO $$ BEGIN IF (SELECT count(*) FROM public.facilitator_products) <> 1 THEN RAISE EXCEPTION 'anon sees drafts'; END IF; END $$;
RESET ROLE;
SELECT 'media variants smoke ok';

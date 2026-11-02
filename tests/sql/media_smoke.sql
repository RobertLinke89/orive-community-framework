-- Media migration smoke (local PG17, after stubs + storage_stubs + all migrations).
\set ON_ERROR_STOP on
INSERT INTO auth.users VALUES ('11111111-1111-4111-8111-111111111111'),('22222222-2222-4222-8222-222222222222') ON CONFLICT DO NOTHING;
SET session_replication_role = replica;
INSERT INTO public.claimable_profiles (id, source_facilitator_id, slug, display_name, category, status, claimed_by, claimed_at, terms_consented_at)
VALUES ('d0000000-0000-4000-8000-000000000001', gen_random_uuid(), 'm-live', 'Live', 'yoga', 'live', '11111111-1111-4111-8111-111111111111', now(), now()),
       ('d0000000-0000-4000-8000-000000000002', gen_random_uuid(), 'm-draft', 'Draft', 'yoga', 'draft', '22222222-2222-4222-8222-222222222222', now(), NULL);
SET session_replication_role = DEFAULT;
-- owner inserts gallery rows; 13th fails
SET ROLE authenticated; SELECT set_config('test.uid','11111111-1111-4111-8111-111111111111',false);
DO $$ BEGIN FOR i IN 1..12 LOOP
  INSERT INTO public.facilitator_media (owner_id, claimable_profile_id, kind, storage_path, alt, mime, bytes, position)
  VALUES (auth.uid(), 'd0000000-0000-4000-8000-000000000001','gallery', auth.uid()||'/'||gen_random_uuid()||'.jpg','Raum '||i,'image/jpeg',1000,i); END LOOP; END $$;
DO $$ BEGIN INSERT INTO public.facilitator_media (owner_id, claimable_profile_id, kind, storage_path, alt, mime, bytes)
  VALUES (auth.uid(),'d0000000-0000-4000-8000-000000000001','gallery', auth.uid()||'/'||gen_random_uuid()||'.jpg','zu viel','image/jpeg',1);
  RAISE EXCEPTION '13th allowed'; EXCEPTION WHEN raise_exception THEN IF SQLERRM <> 'gallery_full' THEN RAISE; END IF; END $$;
-- owner may not write into another's profile / folder
DO $$ BEGIN INSERT INTO public.facilitator_media (owner_id, claimable_profile_id, kind, storage_path, alt, mime, bytes)
  VALUES (auth.uid(),'d0000000-0000-4000-8000-000000000002','gallery', auth.uid()||'/'||gen_random_uuid()||'.jpg','fremd','image/jpeg',1);
  RAISE EXCEPTION 'foreign profile allowed'; EXCEPTION WHEN raise_exception THEN IF SQLERRM <> 'media_not_owner' THEN RAISE; END IF; END $$;
DO $$ BEGIN INSERT INTO public.facilitator_media (owner_id, claimable_profile_id, kind, storage_path, alt, mime, bytes)
  VALUES ('22222222-2222-4222-8222-222222222222','d0000000-0000-4000-8000-000000000002','gallery','22222222-2222-4222-8222-222222222222/'||gen_random_uuid()||'.jpg','fremd','image/jpeg',1);
  RAISE EXCEPTION 'impersonation allowed'; EXCEPTION WHEN insufficient_privilege THEN NULL; END $$;
-- storage: own folder ok, foreign folder denied
INSERT INTO storage.objects (bucket_id, name) VALUES ('facilitator-media', '11111111-1111-4111-8111-111111111111/a.jpg');
DO $$ BEGIN INSERT INTO storage.objects (bucket_id, name) VALUES ('facilitator-media','22222222-2222-4222-8222-222222222222/x.jpg');
  RAISE EXCEPTION 'foreign folder allowed'; EXCEPTION WHEN insufficient_privilege THEN NULL; END $$;
RESET ROLE;
SET session_replication_role = replica;
INSERT INTO public.facilitator_media (owner_id, claimable_profile_id, kind, storage_path, alt, mime, bytes)
VALUES ('22222222-2222-4222-8222-222222222222','d0000000-0000-4000-8000-000000000002','gallery','22222222-2222-4222-8222-222222222222/'||gen_random_uuid()||'.jpg','Entwurf','image/jpeg',1);
INSERT INTO storage.objects (bucket_id, name) VALUES ('facilitator-media', '22222222-2222-4222-8222-222222222222/b.jpg');
SET session_replication_role = DEFAULT;
-- public: sees live profile media only
SET ROLE anon; SELECT set_config('test.uid','',false);
DO $$ BEGIN
  IF (SELECT count(*) FROM public.facilitator_media) <> 12 THEN RAISE EXCEPTION 'anon sees % media', (SELECT count(*) FROM public.facilitator_media); END IF;
  IF (SELECT count(*) FROM storage.objects) <> 1 THEN RAISE EXCEPTION 'anon sees draft objects'; END IF;
  BEGIN INSERT INTO storage.objects (bucket_id,name) VALUES ('facilitator-media','11111111-1111-4111-8111-111111111111/z.jpg'); RAISE EXCEPTION 'anon upload';
  EXCEPTION WHEN insufficient_privilege THEN NULL; END; END $$;
RESET ROLE;
-- reorder RPC: service_role only, exact set required
SET ROLE authenticated;
DO $$ BEGIN PERFORM public.reorder_facilitator_media(gen_random_uuid(), gen_random_uuid(), '{}'); RAISE EXCEPTION 'auth may reorder'; EXCEPTION WHEN insufficient_privilege THEN NULL; END $$;
RESET ROLE; SET ROLE service_role;
DO $$ DECLARE ids UUID[]; BEGIN
  SELECT array_agg(id ORDER BY position DESC) INTO ids FROM public.facilitator_media WHERE claimable_profile_id='d0000000-0000-4000-8000-000000000001';
  IF NOT public.reorder_facilitator_media('11111111-1111-4111-8111-111111111111','d0000000-0000-4000-8000-000000000001', ids) THEN RAISE EXCEPTION 'reorder failed'; END IF;
  IF public.reorder_facilitator_media('11111111-1111-4111-8111-111111111111','d0000000-0000-4000-8000-000000000001', ids[1:3]) THEN RAISE EXCEPTION 'partial reorder accepted'; END IF;
  IF (SELECT alt FROM public.facilitator_media WHERE position=0 AND claimable_profile_id='d0000000-0000-4000-8000-000000000001') <> 'Raum 12' THEN RAISE EXCEPTION 'order wrong'; END IF;
END $$;
RESET ROLE;
SELECT 'media smoke ok';

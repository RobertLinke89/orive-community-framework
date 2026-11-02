DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname='facilitator_media_cover_uniq') THEN RAISE EXCEPTION 'cover index missing'; END IF;
  IF pg_get_constraintdef((SELECT oid FROM pg_constraint WHERE conname='facilitator_media_kind_check')) NOT LIKE '%cover%' THEN RAISE EXCEPTION 'kind check lacks cover'; END IF;
END $$;
SELECT 'media_cover_smoke ok';

-- Drop conflicting policies if they exist, then recreate for offering-images bucket only
DO $$
BEGIN
  -- Create bucket-specific policies
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE policyname = 'Anyone can view offering-images bucket'
    AND tablename = 'objects'
  ) THEN
    CREATE POLICY "Anyone can view offering-images bucket"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'offering-images');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE policyname = 'Auth users can upload to offering-images'
    AND tablename = 'objects'
  ) THEN
    CREATE POLICY "Auth users can upload to offering-images"
    ON storage.objects FOR INSERT
    WITH CHECK (bucket_id = 'offering-images' AND auth.role() = 'authenticated');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE policyname = 'Users can delete own offering-images'
    AND tablename = 'objects'
  ) THEN
    CREATE POLICY "Users can delete own offering-images"
    ON storage.objects FOR DELETE
    USING (bucket_id = 'offering-images' AND auth.uid()::text = (storage.foldername(name))[1]);
  END IF;
END $$;
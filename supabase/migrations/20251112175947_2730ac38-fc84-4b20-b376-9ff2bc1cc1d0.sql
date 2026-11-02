-- Create storage bucket for profile avatars
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true);

-- Create storage bucket for offering images
INSERT INTO storage.buckets (id, name, public)
VALUES ('offerings', 'offerings', true);

-- RLS policies for avatars bucket
CREATE POLICY "Avatar images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their own avatar"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update their own avatar"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own avatar"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- RLS policies for offerings bucket
CREATE POLICY "Offering images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'offerings');

CREATE POLICY "Users can upload their own offering images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'offerings' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update their own offering images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'offerings' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own offering images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'offerings' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);
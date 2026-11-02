-- Add image_url column to offerings table
ALTER TABLE public.offerings ADD COLUMN IF NOT EXISTS image_url text;
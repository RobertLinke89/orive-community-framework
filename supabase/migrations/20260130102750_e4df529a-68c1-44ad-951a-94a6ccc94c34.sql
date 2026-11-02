-- Add tags column to offerings table for custom tags on sessions and events
ALTER TABLE public.offerings 
ADD COLUMN tags text[] DEFAULT '{}';

-- Add an index for better performance when filtering by tags
CREATE INDEX idx_offerings_tags ON public.offerings USING GIN(tags);
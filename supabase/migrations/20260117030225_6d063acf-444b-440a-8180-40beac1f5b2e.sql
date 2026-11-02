-- Add facilitator_id column to favorites for saving facilitator profiles
ALTER TABLE public.favorites 
ADD COLUMN facilitator_id TEXT;

-- Create unique constraint for facilitator favorites
ALTER TABLE public.favorites 
ADD CONSTRAINT favorites_user_facilitator_unique UNIQUE (user_id, facilitator_id);

-- Create index for faster lookups
CREATE INDEX idx_favorites_facilitator_id ON public.favorites(facilitator_id);
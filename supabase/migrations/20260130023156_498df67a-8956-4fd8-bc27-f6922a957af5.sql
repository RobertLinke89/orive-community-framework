
-- Create offering_images table for gallery images
CREATE TABLE public.offering_images (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  offering_id UUID NOT NULL REFERENCES public.offerings(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  alt_text TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.offering_images ENABLE ROW LEVEL SECURITY;

-- Index for faster queries
CREATE INDEX idx_offering_images_offering_id ON public.offering_images(offering_id);
CREATE INDEX idx_offering_images_sort_order ON public.offering_images(offering_id, sort_order);

-- RLS Policies: Facilitators can manage their own offering images
CREATE POLICY "Facilitators can view their offering images"
ON public.offering_images
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.offerings
    WHERE offerings.id = offering_images.offering_id
    AND offerings.facilitator_id = auth.uid()
  )
);

CREATE POLICY "Facilitators can insert their offering images"
ON public.offering_images
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.offerings
    WHERE offerings.id = offering_images.offering_id
    AND offerings.facilitator_id = auth.uid()
  )
);

CREATE POLICY "Facilitators can update their offering images"
ON public.offering_images
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.offerings
    WHERE offerings.id = offering_images.offering_id
    AND offerings.facilitator_id = auth.uid()
  )
);

CREATE POLICY "Facilitators can delete their offering images"
ON public.offering_images
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.offerings
    WHERE offerings.id = offering_images.offering_id
    AND offerings.facilitator_id = auth.uid()
  )
);

-- Public can view active offering images
CREATE POLICY "Public can view active offering images"
ON public.offering_images
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.offerings
    WHERE offerings.id = offering_images.offering_id
    AND offerings.status = 'active'
  )
);

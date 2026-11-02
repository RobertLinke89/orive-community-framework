-- Create a table for session reviews
CREATE TABLE public.reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  offering_id UUID REFERENCES public.offerings(id) ON DELETE CASCADE,
  reviewer_name TEXT NOT NULL,
  reviewer_avatar TEXT,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Create policy for public viewing of reviews
CREATE POLICY "Reviews are viewable by everyone" 
ON public.reviews 
FOR SELECT 
USING (true);

-- Create policy for authenticated users to create reviews
CREATE POLICY "Authenticated users can create reviews" 
ON public.reviews 
FOR INSERT 
WITH CHECK (true);

-- Create index for faster lookups by offering
CREATE INDEX idx_reviews_offering_id ON public.reviews(offering_id);

-- Insert sample reviews for demo purposes
INSERT INTO public.reviews (offering_id, reviewer_name, reviewer_avatar, rating, comment) VALUES
(NULL, 'Sarah M.', NULL, 5, 'This session completely transformed my approach to stress management. The facilitator was incredibly knowledgeable and created a safe space for exploration.'),
(NULL, 'Michael K.', NULL, 5, 'I''ve attended many wellness sessions, but this one stands out. The personalized attention and practical techniques I learned have become part of my daily routine.'),
(NULL, 'Emma L.', NULL, 4, 'Great session with valuable insights. The breathing techniques taught here have helped me sleep better and feel more centered throughout the day.');
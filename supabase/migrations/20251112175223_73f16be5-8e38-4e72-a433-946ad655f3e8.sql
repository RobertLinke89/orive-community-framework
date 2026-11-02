-- Create profiles table for facilitator information
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  professional_title TEXT,
  expertise TEXT,
  bio TEXT,
  location TEXT,
  email TEXT,
  avatar_url TEXT,
  onboarding_completed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create offerings table for sessions and experiences
CREATE TABLE IF NOT EXISTS public.offerings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  facilitator_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('group', 'individual')),
  title TEXT NOT NULL,
  description TEXT,
  price TEXT,
  duration INTEGER,
  location TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'draft')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.offerings ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Profiles are viewable by everyone"
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Offerings policies
CREATE POLICY "Offerings are viewable by everyone"
  ON public.offerings FOR SELECT
  USING (true);

CREATE POLICY "Users can view their own offerings"
  ON public.offerings FOR SELECT
  USING (auth.uid() = facilitator_id);

CREATE POLICY "Users can create their own offerings"
  ON public.offerings FOR INSERT
  WITH CHECK (auth.uid() = facilitator_id);

CREATE POLICY "Users can update their own offerings"
  ON public.offerings FOR UPDATE
  USING (auth.uid() = facilitator_id);

CREATE POLICY "Users can delete their own offerings"
  ON public.offerings FOR DELETE
  USING (auth.uid() = facilitator_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER set_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_offerings_updated_at
  BEFORE UPDATE ON public.offerings
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Create indexes for better performance
CREATE INDEX idx_offerings_facilitator_id ON public.offerings(facilitator_id);
CREATE INDEX idx_offerings_status ON public.offerings(status);
CREATE INDEX idx_profiles_onboarding ON public.profiles(onboarding_completed);
-- Create bookings table
CREATE TABLE public.bookings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  offering_id UUID REFERENCES public.offerings(id) ON DELETE CASCADE,
  facilitator_id UUID NOT NULL,
  client_name TEXT NOT NULL,
  client_email TEXT NOT NULL,
  client_phone TEXT,
  booking_date DATE NOT NULL,
  booking_time TIME NOT NULL,
  duration INTEGER NOT NULL DEFAULT 60,
  status TEXT NOT NULL DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT valid_status CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed'))
);

-- Enable RLS
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- Facilitators can view their own bookings
CREATE POLICY "Facilitators can view their bookings"
ON public.bookings
FOR SELECT
USING (auth.uid() = facilitator_id);

-- Facilitators can update their own bookings
CREATE POLICY "Facilitators can update their bookings"
ON public.bookings
FOR UPDATE
USING (auth.uid() = facilitator_id);

-- Anyone can create a booking (public booking form)
CREATE POLICY "Anyone can create bookings"
ON public.bookings
FOR INSERT
WITH CHECK (true);

-- Create availability slots table
CREATE TABLE public.availability_slots (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  facilitator_id UUID NOT NULL,
  day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_available BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT valid_time_range CHECK (end_time > start_time)
);

-- Enable RLS
ALTER TABLE public.availability_slots ENABLE ROW LEVEL SECURITY;

-- Facilitators can manage their own availability
CREATE POLICY "Facilitators can view their availability"
ON public.availability_slots
FOR SELECT
USING (auth.uid() = facilitator_id);

CREATE POLICY "Facilitators can insert their availability"
ON public.availability_slots
FOR INSERT
WITH CHECK (auth.uid() = facilitator_id);

CREATE POLICY "Facilitators can update their availability"
ON public.availability_slots
FOR UPDATE
USING (auth.uid() = facilitator_id);

CREATE POLICY "Facilitators can delete their availability"
ON public.availability_slots
FOR DELETE
USING (auth.uid() = facilitator_id);

-- Anyone can view availability (for booking forms)
CREATE POLICY "Anyone can view availability"
ON public.availability_slots
FOR SELECT
USING (true);

-- Create updated_at trigger for bookings
CREATE TRIGGER update_bookings_updated_at
BEFORE UPDATE ON public.bookings
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- Create indexes for better performance
CREATE INDEX idx_bookings_facilitator ON public.bookings(facilitator_id);
CREATE INDEX idx_bookings_date ON public.bookings(booking_date);
CREATE INDEX idx_bookings_status ON public.bookings(status);
CREATE INDEX idx_availability_facilitator ON public.availability_slots(facilitator_id);
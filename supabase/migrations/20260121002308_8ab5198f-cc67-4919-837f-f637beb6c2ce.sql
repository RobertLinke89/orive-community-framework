-- Add followup_sent column to bookings table
ALTER TABLE public.bookings 
ADD COLUMN followup_sent boolean NOT NULL DEFAULT false;

-- Add index for efficient querying of completed bookings that need follow-up
CREATE INDEX idx_bookings_followup_pending 
ON public.bookings (booking_date, booking_time) 
WHERE followup_sent = false AND status = 'confirmed';
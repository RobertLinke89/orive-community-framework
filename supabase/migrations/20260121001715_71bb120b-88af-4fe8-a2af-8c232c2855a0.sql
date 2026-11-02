-- Add reminder_sent column to bookings table
ALTER TABLE public.bookings 
ADD COLUMN reminder_sent boolean NOT NULL DEFAULT false;

-- Add index for efficient querying of upcoming bookings that need reminders
CREATE INDEX idx_bookings_reminder_pending 
ON public.bookings (booking_date, booking_time) 
WHERE reminder_sent = false AND status = 'confirmed';
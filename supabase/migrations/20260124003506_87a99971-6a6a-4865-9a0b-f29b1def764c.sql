-- UTM + marketing analytics event stream
CREATE TABLE IF NOT EXISTS public.marketing_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),

  -- Identity / ownership
  facilitator_id uuid NULL,
  user_id uuid NULL,
  client_token text NULL,

  -- Context
  event_type text NOT NULL, -- e.g. 'profile_view', 'share_copy', 'share_open', 'share_native', 'booking_start', 'booking_created', 'booking_completed'
  page_path text NULL,
  page_url text NULL,
  referrer text NULL,
  user_agent text NULL,

  -- Domain links (optional)
  profile_id uuid NULL,
  offering_id uuid NULL,
  booking_id uuid NULL,

  -- Attribution payload
  utm jsonb NOT NULL DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_marketing_events_facilitator_created
  ON public.marketing_events (facilitator_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_marketing_events_type_created
  ON public.marketing_events (event_type, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_marketing_events_profile_created
  ON public.marketing_events (profile_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_marketing_events_utm_gin
  ON public.marketing_events USING GIN (utm);

ALTER TABLE public.marketing_events ENABLE ROW LEVEL SECURITY;

-- Read: admins see all; facilitators see their own rows.
CREATE POLICY "Admins can read marketing events"
ON public.marketing_events
FOR SELECT
USING (has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "Facilitators can read their marketing events"
ON public.marketing_events
FOR SELECT
USING (auth.uid() = facilitator_id);

-- No direct client writes (writes happen via backend function using service role)
CREATE POLICY "Deny inserts marketing events"
ON public.marketing_events
FOR INSERT
WITH CHECK (false);

CREATE POLICY "Deny updates marketing events"
ON public.marketing_events
FOR UPDATE
USING (false);

CREATE POLICY "Deny deletes marketing events"
ON public.marketing_events
FOR DELETE
USING (false);


-- Booking attribution (first/last touch)
CREATE TABLE IF NOT EXISTS public.booking_attributions (
  booking_id uuid PRIMARY KEY,
  facilitator_id uuid NOT NULL,

  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),

  first_touch_event_id uuid NULL,
  last_touch_event_id uuid NULL,

  first_utm jsonb NOT NULL DEFAULT '{}'::jsonb,
  last_utm jsonb NOT NULL DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_booking_attributions_facilitator
  ON public.booking_attributions (facilitator_id);

ALTER TABLE public.booking_attributions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read booking attributions"
ON public.booking_attributions
FOR SELECT
USING (has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "Facilitators can read their booking attributions"
ON public.booking_attributions
FOR SELECT
USING (auth.uid() = facilitator_id);

CREATE POLICY "Deny inserts booking attributions"
ON public.booking_attributions
FOR INSERT
WITH CHECK (false);

CREATE POLICY "Deny updates booking attributions"
ON public.booking_attributions
FOR UPDATE
USING (false);

CREATE POLICY "Deny deletes booking attributions"
ON public.booking_attributions
FOR DELETE
USING (false);


-- Keep booking_attributions.updated_at fresh
CREATE OR REPLACE FUNCTION public.set_updated_at_booking_attributions()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_booking_attributions_updated_at ON public.booking_attributions;
CREATE TRIGGER trg_booking_attributions_updated_at
BEFORE UPDATE ON public.booking_attributions
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at_booking_attributions();

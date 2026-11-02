-- Store Real User Monitoring (RUM) web vitals
CREATE TABLE IF NOT EXISTS public.web_vitals_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),

  name text NOT NULL,
  value double precision NOT NULL,
  rating text NULL,
  delta double precision NULL,
  metric_id text NULL,
  navigation_type text NULL,

  page_path text NULL,
  page_url text NULL,
  user_agent text NULL,

  client_token text NULL,
  ip_hash text NULL
);

ALTER TABLE public.web_vitals_events ENABLE ROW LEVEL SECURITY;

-- No INSERT policy on purpose: clients cannot write directly.
-- Allow admins to read.
CREATE POLICY "Admins can read web vitals"
ON public.web_vitals_events
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

CREATE INDEX IF NOT EXISTS idx_web_vitals_events_created_at
ON public.web_vitals_events (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_web_vitals_events_name_created
ON public.web_vitals_events (name, created_at DESC);
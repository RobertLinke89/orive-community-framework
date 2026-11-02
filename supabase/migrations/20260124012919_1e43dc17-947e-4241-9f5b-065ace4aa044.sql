-- Cooldown state for PII access spike alerting
CREATE TABLE IF NOT EXISTS public.pii_alert_cooldowns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  resource_type text NOT NULL,
  last_alert_at timestamptz NOT NULL DEFAULT now(),
  last_window_start timestamptz NOT NULL,
  last_window_end timestamptz NOT NULL,
  last_count integer NOT NULL,
  baseline_per_hour numeric NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (resource_type)
);

ALTER TABLE public.pii_alert_cooldowns ENABLE ROW LEVEL SECURITY;

-- No public policies: table is managed only by backend functions using service role.

-- Keep updated_at in sync
DROP TRIGGER IF EXISTS pii_alert_cooldowns_set_updated_at ON public.pii_alert_cooldowns;
CREATE TRIGGER pii_alert_cooldowns_set_updated_at
BEFORE UPDATE ON public.pii_alert_cooldowns
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

CREATE INDEX IF NOT EXISTS idx_pii_alert_cooldowns_last_alert_at
ON public.pii_alert_cooldowns (last_alert_at DESC);

CREATE INDEX IF NOT EXISTS idx_pii_alert_cooldowns_resource_type
ON public.pii_alert_cooldowns (resource_type);
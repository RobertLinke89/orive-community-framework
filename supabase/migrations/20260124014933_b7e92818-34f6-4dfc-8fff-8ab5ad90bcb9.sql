-- Per-(resource_type, action) cooldown overrides for PII spike alerts
CREATE TABLE IF NOT EXISTS public.pii_alert_overrides (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  resource_type text NOT NULL,
  action text NOT NULL,
  is_enabled boolean NOT NULL DEFAULT true,
  cooldown_minutes integer NOT NULL DEFAULT 60,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (resource_type, action)
);

ALTER TABLE public.pii_alert_overrides ENABLE ROW LEVEL SECURITY;

-- Admins can manage overrides
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'pii_alert_overrides'
      AND policyname = 'admins_manage_pii_alert_overrides'
  ) THEN
    CREATE POLICY admins_manage_pii_alert_overrides
    ON public.pii_alert_overrides
    FOR ALL
    TO authenticated
    USING (public.has_role(auth.uid(), 'admin'::public.app_role))
    WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));
  END IF;
END $$;

-- updated_at trigger
DROP TRIGGER IF EXISTS pii_alert_overrides_set_updated_at ON public.pii_alert_overrides;
CREATE TRIGGER pii_alert_overrides_set_updated_at
BEFORE UPDATE ON public.pii_alert_overrides
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

CREATE INDEX IF NOT EXISTS idx_pii_alert_overrides_resource_action
ON public.pii_alert_overrides (resource_type, action);


-- Extend cooldown tracking to be per (resource_type, action)
ALTER TABLE public.pii_alert_cooldowns
ADD COLUMN IF NOT EXISTS action text;

UPDATE public.pii_alert_cooldowns
SET action = COALESCE(action, '*')
WHERE action IS NULL;

ALTER TABLE public.pii_alert_cooldowns
ALTER COLUMN action SET DEFAULT '*';

ALTER TABLE public.pii_alert_cooldowns
ALTER COLUMN action SET NOT NULL;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'pii_alert_cooldowns_resource_type_key'
  ) THEN
    ALTER TABLE public.pii_alert_cooldowns
    DROP CONSTRAINT pii_alert_cooldowns_resource_type_key;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'pii_alert_cooldowns_resource_action_key'
  ) THEN
    ALTER TABLE public.pii_alert_cooldowns
    ADD CONSTRAINT pii_alert_cooldowns_resource_action_key UNIQUE (resource_type, action);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_pii_alert_cooldowns_resource_action
ON public.pii_alert_cooldowns (resource_type, action);

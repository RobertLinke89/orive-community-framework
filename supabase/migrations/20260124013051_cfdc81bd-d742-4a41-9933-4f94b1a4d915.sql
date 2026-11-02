-- Add explicit deny policies (keeps table service-role-only, clears linter warning)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'pii_alert_cooldowns'
      AND policyname = 'deny_select_pii_alert_cooldowns'
  ) THEN
    CREATE POLICY deny_select_pii_alert_cooldowns
    ON public.pii_alert_cooldowns
    FOR SELECT
    USING (false);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'pii_alert_cooldowns'
      AND policyname = 'deny_insert_pii_alert_cooldowns'
  ) THEN
    CREATE POLICY deny_insert_pii_alert_cooldowns
    ON public.pii_alert_cooldowns
    FOR INSERT
    WITH CHECK (false);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'pii_alert_cooldowns'
      AND policyname = 'deny_update_pii_alert_cooldowns'
  ) THEN
    CREATE POLICY deny_update_pii_alert_cooldowns
    ON public.pii_alert_cooldowns
    FOR UPDATE
    USING (false);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'pii_alert_cooldowns'
      AND policyname = 'deny_delete_pii_alert_cooldowns'
  ) THEN
    CREATE POLICY deny_delete_pii_alert_cooldowns
    ON public.pii_alert_cooldowns
    FOR DELETE
    USING (false);
  END IF;
END $$;
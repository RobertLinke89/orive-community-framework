-- Explicitly deny anonymous access on notification_reads (linter hardening)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'notification_reads'
      AND policyname = 'Deny anonymous select notification_reads'
  ) THEN
    CREATE POLICY "Deny anonymous select notification_reads"
    ON public.notification_reads
    FOR SELECT
    TO anon
    USING (false);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'notification_reads'
      AND policyname = 'Deny anonymous insert notification_reads'
  ) THEN
    CREATE POLICY "Deny anonymous insert notification_reads"
    ON public.notification_reads
    FOR INSERT
    TO anon
    WITH CHECK (false);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'notification_reads'
      AND policyname = 'Deny anonymous update notification_reads'
  ) THEN
    CREATE POLICY "Deny anonymous update notification_reads"
    ON public.notification_reads
    FOR UPDATE
    TO anon
    USING (false)
    WITH CHECK (false);
  END IF;
END $$;

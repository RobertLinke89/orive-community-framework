-- Per-user notification read state (last seen)

CREATE TABLE IF NOT EXISTS public.notification_reads (
  user_id uuid PRIMARY KEY,
  last_seen_notifications_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.notification_reads ENABLE ROW LEVEL SECURITY;

-- Users manage their own read state
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'notification_reads'
      AND policyname = 'Users can view own notification read state'
  ) THEN
    CREATE POLICY "Users can view own notification read state"
    ON public.notification_reads
    FOR SELECT
    TO authenticated
    USING ((auth.role() = 'authenticated') AND (auth.uid() = user_id));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'notification_reads'
      AND policyname = 'Users can insert own notification read state'
  ) THEN
    CREATE POLICY "Users can insert own notification read state"
    ON public.notification_reads
    FOR INSERT
    TO authenticated
    WITH CHECK ((auth.role() = 'authenticated') AND (auth.uid() = user_id));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'notification_reads'
      AND policyname = 'Users can update own notification read state'
  ) THEN
    CREATE POLICY "Users can update own notification read state"
    ON public.notification_reads
    FOR UPDATE
    TO authenticated
    USING ((auth.role() = 'authenticated') AND (auth.uid() = user_id))
    WITH CHECK ((auth.role() = 'authenticated') AND (auth.uid() = user_id));
  END IF;
END $$;

-- Keep updated_at fresh
DROP TRIGGER IF EXISTS trg_notification_reads_updated_at ON public.notification_reads;
CREATE TRIGGER trg_notification_reads_updated_at
BEFORE UPDATE ON public.notification_reads
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- Enable realtime for this table as well (so badge can update instantly when user marks seen)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'notification_reads'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.notification_reads;
  END IF;
END $$;

-- Secure resources table: deny direct client access; allow access via backend function only
ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  -- SELECT
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'resources' AND policyname = 'deny_select_resources'
  ) THEN
    CREATE POLICY deny_select_resources ON public.resources FOR SELECT USING (false);
  END IF;

  -- INSERT
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'resources' AND policyname = 'deny_insert_resources'
  ) THEN
    CREATE POLICY deny_insert_resources ON public.resources FOR INSERT WITH CHECK (false);
  END IF;

  -- UPDATE
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'resources' AND policyname = 'deny_update_resources'
  ) THEN
    CREATE POLICY deny_update_resources ON public.resources FOR UPDATE USING (false);
  END IF;

  -- DELETE
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'resources' AND policyname = 'deny_delete_resources'
  ) THEN
    CREATE POLICY deny_delete_resources ON public.resources FOR DELETE USING (false);
  END IF;
END $$;
-- Tighten public exposure for offerings: only allow public SELECT when status='active'
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname='public' AND tablename='offerings' AND policyname='Offerings are viewable by everyone'
  ) THEN
    DROP POLICY "Offerings are viewable by everyone" ON public.offerings;
  END IF;
END $$;

CREATE POLICY "Public can view active offerings"
ON public.offerings
FOR SELECT
TO anon, authenticated
USING (status = 'active');

-- Note: keep existing authenticated-only policies (create/update/delete and own-view) intact.

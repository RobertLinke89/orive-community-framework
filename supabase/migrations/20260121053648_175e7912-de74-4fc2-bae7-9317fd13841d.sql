-- Drop the overly permissive INSERT policy
DROP POLICY IF EXISTS "Only service role can insert audit logs" ON public.pii_access_log;

-- The pii_access_log table only gets inserts from SECURITY DEFINER functions
-- No direct INSERT policy needed - authenticated users cannot insert directly
-- The SECURITY DEFINER function bypasses RLS when inserting
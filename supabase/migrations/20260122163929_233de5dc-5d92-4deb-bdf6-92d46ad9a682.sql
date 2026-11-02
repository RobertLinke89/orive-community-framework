-- Role change audit logging + safety guard (prevent deleting last admin)

-- 1) Audit log table
CREATE TABLE IF NOT EXISTS public.role_audit_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  performed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  performed_by UUID,
  action TEXT NOT NULL, -- 'granted' | 'revoked'
  target_user_id UUID NOT NULL,
  role public.app_role NOT NULL,
  details JSONB
);

ALTER TABLE public.role_audit_log ENABLE ROW LEVEL SECURITY;

-- Admins can view audit log
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname='public' AND tablename='role_audit_log' AND policyname='admins_can_view_role_audit'
  ) THEN
    CREATE POLICY admins_can_view_role_audit
    ON public.role_audit_log
    FOR SELECT
    TO authenticated
    USING (public.has_role(auth.uid(), 'admin'));
  END IF;
END $$;

-- 2) Trigger function to log changes
CREATE OR REPLACE FUNCTION public.log_user_role_changes()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.role_audit_log (performed_by, action, target_user_id, role, details)
    VALUES (auth.uid(), 'granted', NEW.user_id, NEW.role, jsonb_build_object('user_role_id', NEW.id));
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO public.role_audit_log (performed_by, action, target_user_id, role, details)
    VALUES (auth.uid(), 'revoked', OLD.user_id, OLD.role, jsonb_build_object('user_role_id', OLD.id));
    RETURN OLD;
  END IF;

  RETURN NULL;
END;
$$;

-- 3) Safety: prevent deleting the last admin
CREATE OR REPLACE FUNCTION public.prevent_deleting_last_admin()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  admin_count INTEGER;
BEGIN
  IF OLD.role <> 'admin' THEN
    RETURN OLD;
  END IF;

  SELECT COUNT(*) INTO admin_count
  FROM public.user_roles
  WHERE role = 'admin';

  IF admin_count <= 1 THEN
    RAISE EXCEPTION 'Cannot revoke the last admin role.';
  END IF;

  RETURN OLD;
END;
$$;

-- 4) Attach triggers to user_roles (if not already attached)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger
    WHERE tgname = 'trg_user_roles_audit_changes'
  ) THEN
    CREATE TRIGGER trg_user_roles_audit_changes
    AFTER INSERT OR DELETE ON public.user_roles
    FOR EACH ROW
    EXECUTE FUNCTION public.log_user_role_changes();
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger
    WHERE tgname = 'trg_user_roles_prevent_last_admin'
  ) THEN
    CREATE TRIGGER trg_user_roles_prevent_last_admin
    BEFORE DELETE ON public.user_roles
    FOR EACH ROW
    EXECUTE FUNCTION public.prevent_deleting_last_admin();
  END IF;
END $$;

-- Helpful indexes
CREATE INDEX IF NOT EXISTS idx_role_audit_log_target_user_id ON public.role_audit_log (target_user_id);
CREATE INDEX IF NOT EXISTS idx_role_audit_log_performed_at ON public.role_audit_log (performed_at DESC);

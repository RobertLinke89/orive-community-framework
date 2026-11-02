-- Harden admin-only overrides policy to explicitly exclude anonymous sessions
DROP POLICY IF EXISTS admins_manage_pii_alert_overrides ON public.pii_alert_overrides;
CREATE POLICY admins_manage_pii_alert_overrides
ON public.pii_alert_overrides
FOR ALL
TO authenticated
USING (auth.role() = 'authenticated' AND public.has_role(auth.uid(), 'admin'::public.app_role))
WITH CHECK (auth.role() = 'authenticated' AND public.has_role(auth.uid(), 'admin'::public.app_role));

-- Ensure cooldown deny policies also explicitly exclude anonymous sessions
ALTER POLICY deny_select_pii_alert_cooldowns ON public.pii_alert_cooldowns
USING (auth.role() = 'authenticated' AND false);
ALTER POLICY deny_insert_pii_alert_cooldowns ON public.pii_alert_cooldowns
WITH CHECK (auth.role() = 'authenticated' AND false);
ALTER POLICY deny_update_pii_alert_cooldowns ON public.pii_alert_cooldowns
USING (auth.role() = 'authenticated' AND false);
ALTER POLICY deny_delete_pii_alert_cooldowns ON public.pii_alert_cooldowns
USING (auth.role() = 'authenticated' AND false);
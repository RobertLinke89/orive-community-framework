-- Ensure deny policies do not target anonymous role (still deny all access)
ALTER POLICY deny_select_pii_alert_cooldowns ON public.pii_alert_cooldowns TO authenticated;
ALTER POLICY deny_insert_pii_alert_cooldowns ON public.pii_alert_cooldowns TO authenticated;
ALTER POLICY deny_update_pii_alert_cooldowns ON public.pii_alert_cooldowns TO authenticated;
ALTER POLICY deny_delete_pii_alert_cooldowns ON public.pii_alert_cooldowns TO authenticated;
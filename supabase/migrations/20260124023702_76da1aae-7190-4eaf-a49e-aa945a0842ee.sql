-- Tighten RLS policy roles for realtime-enabled tables to authenticated users only

-- whatsapp_conversations
ALTER POLICY "Facilitators can view their conversations"
ON public.whatsapp_conversations
TO authenticated
USING ((auth.role() = 'authenticated') AND (auth.uid() = facilitator_id));

ALTER POLICY "Facilitators can insert conversations"
ON public.whatsapp_conversations
TO authenticated
WITH CHECK ((auth.role() = 'authenticated') AND (auth.uid() = facilitator_id));

ALTER POLICY "Facilitators can update their conversations"
ON public.whatsapp_conversations
TO authenticated
USING ((auth.role() = 'authenticated') AND (auth.uid() = facilitator_id))
WITH CHECK ((auth.role() = 'authenticated') AND (auth.uid() = facilitator_id));

ALTER POLICY "Facilitators can delete their conversations"
ON public.whatsapp_conversations
TO authenticated
USING ((auth.role() = 'authenticated') AND (auth.uid() = facilitator_id));

-- booking_audit_log
ALTER POLICY "Facilitators can view their booking audits"
ON public.booking_audit_log
TO authenticated
USING (
  (auth.role() = 'authenticated') AND
  (booking_id IN (
    SELECT bookings.id
    FROM public.bookings
    WHERE bookings.facilitator_id = auth.uid()
  ))
);

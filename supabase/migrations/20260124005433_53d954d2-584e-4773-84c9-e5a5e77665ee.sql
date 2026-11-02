-- Tighten RLS for whatsapp_conversations to prevent cross-facilitator data access

ALTER TABLE public.whatsapp_conversations ENABLE ROW LEVEL SECURITY;

-- Drop existing policies (names from current schema listing)
DROP POLICY IF EXISTS "Deny anonymous access to whatsapp_conversations" ON public.whatsapp_conversations;
DROP POLICY IF EXISTS "Facilitators can view their conversations" ON public.whatsapp_conversations;
DROP POLICY IF EXISTS "Facilitators can insert conversations" ON public.whatsapp_conversations;
DROP POLICY IF EXISTS "Facilitators can update their conversations" ON public.whatsapp_conversations;
DROP POLICY IF EXISTS "Facilitators can delete their conversations" ON public.whatsapp_conversations;

-- Explicitly deny anonymous access
CREATE POLICY "Deny anonymous select whatsapp_conversations"
ON public.whatsapp_conversations
FOR SELECT
TO anon
USING (false);

CREATE POLICY "Deny anonymous insert whatsapp_conversations"
ON public.whatsapp_conversations
FOR INSERT
TO anon
WITH CHECK (false);

CREATE POLICY "Deny anonymous update whatsapp_conversations"
ON public.whatsapp_conversations
FOR UPDATE
TO anon
USING (false)
WITH CHECK (false);

CREATE POLICY "Deny anonymous delete whatsapp_conversations"
ON public.whatsapp_conversations
FOR DELETE
TO anon
USING (false);

-- Allow facilitators to manage only their own conversations
CREATE POLICY "Facilitators can view their conversations"
ON public.whatsapp_conversations
FOR SELECT
TO authenticated
USING (auth.uid() = facilitator_id);

CREATE POLICY "Facilitators can insert conversations"
ON public.whatsapp_conversations
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = facilitator_id);

CREATE POLICY "Facilitators can update their conversations"
ON public.whatsapp_conversations
FOR UPDATE
TO authenticated
USING (auth.uid() = facilitator_id)
WITH CHECK (auth.uid() = facilitator_id);

CREATE POLICY "Facilitators can delete their conversations"
ON public.whatsapp_conversations
FOR DELETE
TO authenticated
USING (auth.uid() = facilitator_id);

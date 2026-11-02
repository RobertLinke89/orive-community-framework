-- Create table for WhatsApp conversations
CREATE TABLE public.whatsapp_conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  facilitator_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  client_name text NOT NULL,
  client_phone text NOT NULL,
  session_type text NOT NULL DEFAULT 'personal',
  last_message_at timestamptz DEFAULT now(),
  status text NOT NULL DEFAULT 'active',
  unread_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create table for conversation messages
CREATE TABLE public.whatsapp_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES public.whatsapp_conversations(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('assistant', 'user')),
  content text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create table for WhatsApp assistant settings
CREATE TABLE public.whatsapp_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  facilitator_id uuid UNIQUE NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  is_enabled boolean DEFAULT true,
  auto_followup_24h boolean DEFAULT true,
  auto_followup_48h boolean DEFAULT true,
  auto_followup_7d boolean DEFAULT false,
  welcome_message text DEFAULT 'Hello! Thank you for completing your session. How are you feeling right now?',
  personal_session_prompt text,
  group_session_prompt text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.whatsapp_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whatsapp_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whatsapp_settings ENABLE ROW LEVEL SECURITY;

-- RLS policies for conversations
CREATE POLICY "Facilitators can view their conversations"
  ON public.whatsapp_conversations FOR SELECT
  USING (auth.uid() = facilitator_id);

CREATE POLICY "Facilitators can insert conversations"
  ON public.whatsapp_conversations FOR INSERT
  WITH CHECK (auth.uid() = facilitator_id);

CREATE POLICY "Facilitators can update their conversations"
  ON public.whatsapp_conversations FOR UPDATE
  USING (auth.uid() = facilitator_id);

CREATE POLICY "Facilitators can delete their conversations"
  ON public.whatsapp_conversations FOR DELETE
  USING (auth.uid() = facilitator_id);

-- RLS policies for messages (via conversation ownership)
CREATE POLICY "Facilitators can view messages in their conversations"
  ON public.whatsapp_messages FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.whatsapp_conversations
    WHERE id = conversation_id AND facilitator_id = auth.uid()
  ));

CREATE POLICY "Facilitators can insert messages in their conversations"
  ON public.whatsapp_messages FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.whatsapp_conversations
    WHERE id = conversation_id AND facilitator_id = auth.uid()
  ));

-- RLS policies for settings
CREATE POLICY "Facilitators can view their settings"
  ON public.whatsapp_settings FOR SELECT
  USING (auth.uid() = facilitator_id);

CREATE POLICY "Facilitators can insert their settings"
  ON public.whatsapp_settings FOR INSERT
  WITH CHECK (auth.uid() = facilitator_id);

CREATE POLICY "Facilitators can update their settings"
  ON public.whatsapp_settings FOR UPDATE
  USING (auth.uid() = facilitator_id);

-- Triggers for updated_at
CREATE TRIGGER update_whatsapp_conversations_updated_at
  BEFORE UPDATE ON public.whatsapp_conversations
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_whatsapp_settings_updated_at
  BEFORE UPDATE ON public.whatsapp_settings
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
-- Create tasks table for Kanban board
CREATE TABLE public.tasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  facilitator_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'open',
  priority TEXT,
  assignee TEXT,
  position INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  CONSTRAINT valid_status CHECK (status IN ('open', 'in-progress', 'review', 'done')),
  CONSTRAINT valid_priority CHECK (priority IS NULL OR priority IN ('low', 'medium', 'high'))
);

-- Create indexes for performance
CREATE INDEX idx_tasks_facilitator ON public.tasks(facilitator_id);
CREATE INDEX idx_tasks_status ON public.tasks(status);
CREATE INDEX idx_tasks_position ON public.tasks(facilitator_id, status, position);

-- Enable RLS
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Facilitators can only manage their own tasks
CREATE POLICY "Facilitators can view their tasks"
  ON public.tasks FOR SELECT
  USING (auth.uid() = facilitator_id);

CREATE POLICY "Facilitators can create their tasks"
  ON public.tasks FOR INSERT
  WITH CHECK (auth.uid() = facilitator_id);

CREATE POLICY "Facilitators can update their tasks"
  ON public.tasks FOR UPDATE
  USING (auth.uid() = facilitator_id);

CREATE POLICY "Facilitators can delete their tasks"
  ON public.tasks FOR DELETE
  USING (auth.uid() = facilitator_id);

-- Trigger for updated_at
CREATE TRIGGER update_tasks_updated_at
  BEFORE UPDATE ON public.tasks
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();
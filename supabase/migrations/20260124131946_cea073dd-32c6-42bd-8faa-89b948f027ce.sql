-- Create workspaces table
CREATE TABLE public.workspaces (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  owner_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create workspace_members table for membership
CREATE TABLE public.workspace_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member')),
  invited_by UUID,
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(workspace_id, user_id)
);

-- Add workspace_id and assignee_id to tasks table
ALTER TABLE public.tasks 
ADD COLUMN workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE,
ADD COLUMN assignee_id UUID;

-- Enable RLS
ALTER TABLE public.workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspace_members ENABLE ROW LEVEL SECURITY;

-- Workspaces policies
CREATE POLICY "Users can view workspaces they are members of"
ON public.workspaces FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.workspace_members 
    WHERE workspace_members.workspace_id = workspaces.id 
    AND workspace_members.user_id = auth.uid()
  )
);

CREATE POLICY "Users can create workspaces"
ON public.workspaces FOR INSERT
WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Owners and admins can update workspaces"
ON public.workspaces FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.workspace_members 
    WHERE workspace_members.workspace_id = workspaces.id 
    AND workspace_members.user_id = auth.uid()
    AND workspace_members.role IN ('owner', 'admin')
  )
);

CREATE POLICY "Owners can delete workspaces"
ON public.workspaces FOR DELETE
USING (auth.uid() = owner_id);

-- Workspace members policies
CREATE POLICY "Members can view workspace members"
ON public.workspace_members FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.workspace_members wm 
    WHERE wm.workspace_id = workspace_members.workspace_id 
    AND wm.user_id = auth.uid()
  )
);

CREATE POLICY "Owners and admins can add members"
ON public.workspace_members FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.workspace_members wm 
    WHERE wm.workspace_id = workspace_members.workspace_id 
    AND wm.user_id = auth.uid()
    AND wm.role IN ('owner', 'admin')
  )
  OR 
  -- Allow owner to add themselves when creating workspace
  (auth.uid() = user_id AND role = 'owner')
);

CREATE POLICY "Owners and admins can update members"
ON public.workspace_members FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.workspace_members wm 
    WHERE wm.workspace_id = workspace_members.workspace_id 
    AND wm.user_id = auth.uid()
    AND wm.role IN ('owner', 'admin')
  )
);

CREATE POLICY "Owners and admins can remove members"
ON public.workspace_members FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.workspace_members wm 
    WHERE wm.workspace_id = workspace_members.workspace_id 
    AND wm.user_id = auth.uid()
    AND wm.role IN ('owner', 'admin')
  )
  OR auth.uid() = user_id -- Members can remove themselves
);

-- Update tasks policies to allow workspace member access
CREATE POLICY "Workspace members can view workspace tasks"
ON public.tasks FOR SELECT
USING (
  workspace_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.workspace_members 
    WHERE workspace_members.workspace_id = tasks.workspace_id 
    AND workspace_members.user_id = auth.uid()
  )
);

CREATE POLICY "Workspace members can create workspace tasks"
ON public.tasks FOR INSERT
WITH CHECK (
  workspace_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.workspace_members 
    WHERE workspace_members.workspace_id = tasks.workspace_id 
    AND workspace_members.user_id = auth.uid()
  )
);

CREATE POLICY "Workspace members can update workspace tasks"
ON public.tasks FOR UPDATE
USING (
  workspace_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.workspace_members 
    WHERE workspace_members.workspace_id = tasks.workspace_id 
    AND workspace_members.user_id = auth.uid()
  )
);

CREATE POLICY "Workspace members can delete workspace tasks"
ON public.tasks FOR DELETE
USING (
  workspace_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.workspace_members 
    WHERE workspace_members.workspace_id = tasks.workspace_id 
    AND workspace_members.user_id = auth.uid()
  )
);

-- Create trigger for updated_at on workspaces
CREATE TRIGGER update_workspaces_updated_at
BEFORE UPDATE ON public.workspaces
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- Create index for performance
CREATE INDEX idx_workspace_members_user ON public.workspace_members(user_id);
CREATE INDEX idx_workspace_members_workspace ON public.workspace_members(workspace_id);
CREATE INDEX idx_tasks_workspace ON public.tasks(workspace_id);
CREATE INDEX idx_tasks_assignee ON public.tasks(assignee_id);
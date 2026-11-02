
-- Create a trigger to automatically add workspace owner as a member
-- This solves the RLS chicken-and-egg problem

CREATE OR REPLACE FUNCTION public.add_workspace_owner_as_member()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Automatically add the owner as a member with 'owner' role
  INSERT INTO public.workspace_members (workspace_id, user_id, role, invited_by)
  VALUES (NEW.id, NEW.owner_id, 'owner', NEW.owner_id)
  ON CONFLICT DO NOTHING;
  
  RETURN NEW;
END;
$$;

-- Create trigger on workspace insert
DROP TRIGGER IF EXISTS on_workspace_created ON public.workspaces;
CREATE TRIGGER on_workspace_created
  AFTER INSERT ON public.workspaces
  FOR EACH ROW
  EXECUTE FUNCTION public.add_workspace_owner_as_member();

-- Also fix the SELECT policy on workspaces to allow owners to see their own workspaces directly
DROP POLICY IF EXISTS "Users can view workspaces they are members of" ON public.workspaces;
CREATE POLICY "Users can view their own or member workspaces"
  ON public.workspaces FOR SELECT
  USING (
    owner_id = auth.uid() 
    OR EXISTS (
      SELECT 1 FROM public.workspace_members
      WHERE workspace_members.workspace_id = workspaces.id
        AND workspace_members.user_id = auth.uid()
    )
  );

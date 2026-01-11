-- Add WBS (Work Breakdown Structure) codes to phases and tasks
ALTER TABLE voltbuild_phases 
ADD COLUMN IF NOT EXISTS wbs_code TEXT;

ALTER TABLE voltbuild_tasks 
ADD COLUMN IF NOT EXISTS wbs_code TEXT;

-- Add target milestones table for deadline tracking
CREATE TABLE IF NOT EXISTS voltbuild_target_milestones (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES voltbuild_projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  target_date DATE NOT NULL,
  milestone_type TEXT NOT NULL DEFAULT 'target' CHECK (milestone_type IN ('target', 'delivery', 'approval', 'deadline')),
  color TEXT DEFAULT '#ef4444',
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on target milestones
ALTER TABLE voltbuild_target_milestones ENABLE ROW LEVEL SECURITY;

-- RLS policies for target milestones
CREATE POLICY "Users can view target milestones for their projects" 
ON voltbuild_target_milestones FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM voltbuild_projects 
    WHERE voltbuild_projects.id = project_id 
    AND voltbuild_projects.user_id = auth.uid()
  )
);

CREATE POLICY "Users can create target milestones for their projects" 
ON voltbuild_target_milestones FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM voltbuild_projects 
    WHERE voltbuild_projects.id = project_id 
    AND voltbuild_projects.user_id = auth.uid()
  )
);

CREATE POLICY "Users can update target milestones for their projects" 
ON voltbuild_target_milestones FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM voltbuild_projects 
    WHERE voltbuild_projects.id = project_id 
    AND voltbuild_projects.user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete target milestones for their projects" 
ON voltbuild_target_milestones FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM voltbuild_projects 
    WHERE voltbuild_projects.id = project_id 
    AND voltbuild_projects.user_id = auth.uid()
  )
);

-- Create trigger for auto-updating updated_at
CREATE TRIGGER update_voltbuild_target_milestones_updated_at
BEFORE UPDATE ON voltbuild_target_milestones
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
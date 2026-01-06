-- Add task-level date columns to voltbuild_tasks
ALTER TABLE voltbuild_tasks
  ADD COLUMN IF NOT EXISTS estimated_start_date DATE,
  ADD COLUMN IF NOT EXISTS estimated_end_date DATE;

-- Create milestones table
CREATE TABLE IF NOT EXISTS voltbuild_milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES voltbuild_projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  target_date DATE NOT NULL,
  status TEXT DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'completed', 'missed')),
  phase_id UUID REFERENCES voltbuild_phases(id) ON DELETE SET NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE voltbuild_milestones ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for milestones
CREATE POLICY "Users can view milestones for their projects"
  ON voltbuild_milestones FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM voltbuild_projects p
      WHERE p.id = voltbuild_milestones.project_id
      AND p.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create milestones for their projects"
  ON voltbuild_milestones FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM voltbuild_projects p
      WHERE p.id = voltbuild_milestones.project_id
      AND p.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update milestones for their projects"
  ON voltbuild_milestones FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM voltbuild_projects p
      WHERE p.id = voltbuild_milestones.project_id
      AND p.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete milestones for their projects"
  ON voltbuild_milestones FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM voltbuild_projects p
      WHERE p.id = voltbuild_milestones.project_id
      AND p.user_id = auth.uid()
    )
  );

-- Create trigger for updated_at
CREATE TRIGGER update_voltbuild_milestones_updated_at
  BEFORE UPDATE ON voltbuild_milestones
  FOR EACH ROW
  EXECUTE FUNCTION update_voltbuild_updated_at();

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_voltbuild_milestones_project_id ON voltbuild_milestones(project_id);
CREATE INDEX IF NOT EXISTS idx_voltbuild_tasks_dates ON voltbuild_tasks(estimated_start_date, estimated_end_date);
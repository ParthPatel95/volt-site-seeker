-- Add new columns to voltbuild_risks for enhanced risk management
ALTER TABLE voltbuild_risks 
  ADD COLUMN IF NOT EXISTS probability TEXT DEFAULT 'medium' CHECK (probability IN ('low', 'medium', 'high', 'very_high')),
  ADD COLUMN IF NOT EXISTS impact TEXT DEFAULT 'medium' CHECK (impact IN ('low', 'medium', 'high', 'critical')),
  ADD COLUMN IF NOT EXISTS risk_score INTEGER,
  ADD COLUMN IF NOT EXISTS category TEXT CHECK (category IN ('technical', 'schedule', 'financial', 'regulatory', 'utility', 'supply_chain', 'weather', 'other')),
  ADD COLUMN IF NOT EXISTS estimated_cost_impact NUMERIC(12,2),
  ADD COLUMN IF NOT EXISTS cost_impact_range_min NUMERIC(12,2),
  ADD COLUMN IF NOT EXISTS cost_impact_range_max NUMERIC(12,2),
  ADD COLUMN IF NOT EXISTS estimated_days_delay INTEGER,
  ADD COLUMN IF NOT EXISTS response_type TEXT DEFAULT 'mitigate' CHECK (response_type IN ('avoid', 'transfer', 'mitigate', 'accept')),
  ADD COLUMN IF NOT EXISTS linked_task_id UUID REFERENCES voltbuild_tasks(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS identified_date DATE DEFAULT CURRENT_DATE,
  ADD COLUMN IF NOT EXISTS target_resolution_date DATE,
  ADD COLUMN IF NOT EXISTS actual_resolution_date DATE,
  ADD COLUMN IF NOT EXISTS trigger_indicators TEXT,
  ADD COLUMN IF NOT EXISTS last_review_date TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS review_notes TEXT;

-- Create function to calculate risk score
CREATE OR REPLACE FUNCTION calculate_risk_score()
RETURNS TRIGGER AS $$
BEGIN
  NEW.risk_score := (
    CASE NEW.probability 
      WHEN 'low' THEN 1 
      WHEN 'medium' THEN 2 
      WHEN 'high' THEN 3 
      WHEN 'very_high' THEN 4 
      ELSE 2 
    END
  ) * (
    CASE NEW.impact 
      WHEN 'low' THEN 1 
      WHEN 'medium' THEN 2 
      WHEN 'high' THEN 3 
      WHEN 'critical' THEN 4 
      ELSE 2 
    END
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger to auto-calculate risk score
DROP TRIGGER IF EXISTS calculate_risk_score_trigger ON voltbuild_risks;
CREATE TRIGGER calculate_risk_score_trigger
  BEFORE INSERT OR UPDATE OF probability, impact ON voltbuild_risks
  FOR EACH ROW
  EXECUTE FUNCTION calculate_risk_score();

-- Update existing rows to calculate risk score
UPDATE voltbuild_risks SET risk_score = (
  CASE probability 
    WHEN 'low' THEN 1 
    WHEN 'medium' THEN 2 
    WHEN 'high' THEN 3 
    WHEN 'very_high' THEN 4 
    ELSE 2 
  END
) * (
  CASE impact 
    WHEN 'low' THEN 1 
    WHEN 'medium' THEN 2 
    WHEN 'high' THEN 3 
    WHEN 'critical' THEN 4 
    ELSE 2 
  END
) WHERE risk_score IS NULL;

-- Create risk history table for audit trail
CREATE TABLE IF NOT EXISTS voltbuild_risk_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  risk_id UUID NOT NULL REFERENCES voltbuild_risks(id) ON DELETE CASCADE,
  changed_by UUID REFERENCES auth.users(id),
  changed_at TIMESTAMPTZ DEFAULT NOW(),
  field_changed TEXT NOT NULL,
  old_value TEXT,
  new_value TEXT,
  notes TEXT
);

-- Create risk comments table for collaboration
CREATE TABLE IF NOT EXISTS voltbuild_risk_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  risk_id UUID NOT NULL REFERENCES voltbuild_risks(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on new tables
ALTER TABLE voltbuild_risk_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE voltbuild_risk_comments ENABLE ROW LEVEL SECURITY;

-- RLS policies for risk history (using user_id instead of created_by)
CREATE POLICY "Users can view risk history for accessible projects"
  ON voltbuild_risk_history FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM voltbuild_risks r
      JOIN voltbuild_projects p ON r.project_id = p.id
      WHERE r.id = voltbuild_risk_history.risk_id
      AND (p.user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'))
    )
  );

CREATE POLICY "Users can insert risk history for accessible projects"
  ON voltbuild_risk_history FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM voltbuild_risks r
      JOIN voltbuild_projects p ON r.project_id = p.id
      WHERE r.id = voltbuild_risk_history.risk_id
      AND (p.user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'))
    )
  );

-- RLS policies for risk comments
CREATE POLICY "Users can view risk comments for accessible projects"
  ON voltbuild_risk_comments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM voltbuild_risks r
      JOIN voltbuild_projects p ON r.project_id = p.id
      WHERE r.id = voltbuild_risk_comments.risk_id
      AND (p.user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'))
    )
  );

CREATE POLICY "Users can insert risk comments for accessible projects"
  ON voltbuild_risk_comments FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM voltbuild_risks r
      JOIN voltbuild_projects p ON r.project_id = p.id
      WHERE r.id = voltbuild_risk_comments.risk_id
      AND (p.user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'))
    )
  );

CREATE POLICY "Users can delete own risk comments"
  ON voltbuild_risk_comments FOR DELETE
  USING (user_id = auth.uid());

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_voltbuild_risks_risk_score ON voltbuild_risks(risk_score);
CREATE INDEX IF NOT EXISTS idx_voltbuild_risks_category ON voltbuild_risks(category);
CREATE INDEX IF NOT EXISTS idx_voltbuild_risks_status ON voltbuild_risks(status);
CREATE INDEX IF NOT EXISTS idx_voltbuild_risk_history_risk_id ON voltbuild_risk_history(risk_id);
CREATE INDEX IF NOT EXISTS idx_voltbuild_risk_comments_risk_id ON voltbuild_risk_comments(risk_id);
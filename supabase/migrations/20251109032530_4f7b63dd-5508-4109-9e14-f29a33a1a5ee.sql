-- Add data quality reports table
CREATE TABLE IF NOT EXISTS public.aeso_data_quality_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_date TIMESTAMPTZ NOT NULL,
  records_checked INTEGER NOT NULL,
  clean_records INTEGER NOT NULL,
  total_issues INTEGER NOT NULL,
  outlier_count INTEGER NOT NULL,
  missing_value_count INTEGER NOT NULL,
  duplicate_count INTEGER NOT NULL,
  quality_score NUMERIC NOT NULL CHECK (quality_score >= 0 AND quality_score <= 100),
  issue_details JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add scheduled tasks tracking table
CREATE TABLE IF NOT EXISTS public.aeso_scheduled_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_name TEXT NOT NULL,
  task_type TEXT NOT NULL,
  last_run TIMESTAMPTZ,
  next_run TIMESTAMPTZ,
  status TEXT DEFAULT 'pending',
  execution_time_ms INTEGER,
  error_message TEXT,
  result JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add model versioning table
CREATE TABLE IF NOT EXISTS public.aeso_model_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  version_name TEXT NOT NULL UNIQUE,
  model_type TEXT NOT NULL,
  description TEXT,
  hyperparameters JSONB,
  training_config JSONB,
  performance_metrics JSONB,
  is_active BOOLEAN DEFAULT false,
  deployed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_quality_reports_date ON public.aeso_data_quality_reports(report_date);
CREATE INDEX IF NOT EXISTS idx_scheduled_tasks_name ON public.aeso_scheduled_tasks(task_name);
CREATE INDEX IF NOT EXISTS idx_scheduled_tasks_next_run ON public.aeso_scheduled_tasks(next_run);
CREATE INDEX IF NOT EXISTS idx_model_versions_active ON public.aeso_model_versions(is_active);

-- Enable RLS
ALTER TABLE public.aeso_data_quality_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.aeso_scheduled_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.aeso_model_versions ENABLE ROW LEVEL SECURITY;

-- Public read access policies
CREATE POLICY "Allow public read access to quality reports"
  ON public.aeso_data_quality_reports FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public read access to scheduled tasks"
  ON public.aeso_scheduled_tasks FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public read access to model versions"
  ON public.aeso_model_versions FOR SELECT
  TO public
  USING (true);

-- Service role full access
CREATE POLICY "Allow service role full access to quality reports"
  ON public.aeso_data_quality_reports FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow service role full access to scheduled tasks"
  ON public.aeso_scheduled_tasks FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow service role full access to model versions"
  ON public.aeso_model_versions FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
-- Drop existing table if it exists to recreate with correct schema
DROP TABLE IF EXISTS public.aeso_data_quality_reports CASCADE;

-- Create table for data quality reports
CREATE TABLE public.aeso_data_quality_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  report_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  total_records INTEGER NOT NULL,
  quality_score DECIMAL(5,2) NOT NULL,
  missing_data_analysis JSONB,
  outlier_count INTEGER,
  recent_completeness DECIMAL(5,2),
  enhanced_feature_coverage JSONB,
  quality_factors JSONB,
  price_statistics JSONB,
  recommendations TEXT[],
  temporal_gaps INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.aeso_data_quality_reports ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (read-only for monitoring)
CREATE POLICY "Anyone can view quality reports"
  ON public.aeso_data_quality_reports
  FOR SELECT
  USING (true);

CREATE POLICY "Service role can insert quality reports"
  ON public.aeso_data_quality_reports
  FOR INSERT
  WITH CHECK (true);

-- Create index for faster queries
CREATE INDEX idx_aeso_quality_reports_date ON public.aeso_data_quality_reports(report_date DESC);
CREATE INDEX idx_aeso_quality_reports_score ON public.aeso_data_quality_reports(quality_score);
-- Phase 6: Add missing columns and advanced ML features

-- Add missing columns to aeso_model_parameters
ALTER TABLE public.aeso_model_parameters 
ADD COLUMN IF NOT EXISTS feature_scaling JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS hyperparameters JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS ensemble_config JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS optimization_history JSONB DEFAULT '[]'::jsonb;

-- Add missing columns to aeso_model_performance
ALTER TABLE public.aeso_model_performance 
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS prediction_interval_80 NUMERIC,
ADD COLUMN IF NOT EXISTS prediction_interval_95 NUMERIC,
ADD COLUMN IF NOT EXISTS residual_std_dev NUMERIC,
ADD COLUMN IF NOT EXISTS regime_performance JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS drift_metrics JSONB DEFAULT '{}'::jsonb;

-- Create Phase 6: Auto-retraining schedule table
CREATE TABLE IF NOT EXISTS public.aeso_retraining_schedule (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  model_version TEXT NOT NULL,
  scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
  triggered_by TEXT NOT NULL, -- 'drift_detection', 'schedule', 'manual'
  trigger_reason TEXT,
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'running', 'completed', 'failed'
  training_started_at TIMESTAMP WITH TIME ZONE,
  training_completed_at TIMESTAMP WITH TIME ZONE,
  performance_before JSONB,
  performance_after JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_retraining_schedule_status 
  ON public.aeso_retraining_schedule(status);
  
CREATE INDEX IF NOT EXISTS idx_retraining_schedule_scheduled 
  ON public.aeso_retraining_schedule(scheduled_at);

-- Create Phase 6: Hyperparameter tuning results table
CREATE TABLE IF NOT EXISTS public.aeso_hyperparameter_trials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  model_version TEXT NOT NULL,
  hyperparameters JSONB NOT NULL,
  performance_metrics JSONB NOT NULL,
  training_duration_seconds INTEGER,
  trial_number INTEGER NOT NULL,
  is_best_trial BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_hyperparameter_trials_version 
  ON public.aeso_hyperparameter_trials(model_version);

CREATE INDEX IF NOT EXISTS idx_hyperparameter_trials_best 
  ON public.aeso_hyperparameter_trials(is_best_trial) WHERE is_best_trial = true;

-- Enable RLS
ALTER TABLE public.aeso_retraining_schedule ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.aeso_hyperparameter_trials ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Allow authenticated users to read retraining schedule"
  ON public.aeso_retraining_schedule
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow service role to manage retraining schedule"
  ON public.aeso_retraining_schedule
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to read hyperparameter trials"
  ON public.aeso_hyperparameter_trials
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow service role to manage hyperparameter trials"
  ON public.aeso_hyperparameter_trials
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Comments
COMMENT ON TABLE public.aeso_retraining_schedule IS 'Phase 6: Tracks automatic model retraining schedule based on drift detection';
COMMENT ON TABLE public.aeso_hyperparameter_trials IS 'Phase 6: Stores hyperparameter tuning trials for model optimization';
COMMENT ON COLUMN public.aeso_model_parameters.hyperparameters IS 'Phase 6: Optimized hyperparameters from tuning';
COMMENT ON COLUMN public.aeso_model_parameters.ensemble_config IS 'Phase 6: Configuration for advanced ensemble methods';
COMMENT ON COLUMN public.aeso_model_performance.regime_performance IS 'Phase 6: Performance breakdown by market regime';
COMMENT ON COLUMN public.aeso_model_performance.drift_metrics IS 'Phase 6: Model drift detection metrics';
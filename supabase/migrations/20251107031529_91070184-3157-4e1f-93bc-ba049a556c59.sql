-- Create table to store learned model parameters
CREATE TABLE IF NOT EXISTS public.aeso_model_parameters (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  model_version TEXT NOT NULL,
  parameter_type TEXT NOT NULL, -- 'coefficient', 'ensemble_weight', 'threshold'
  parameter_name TEXT NOT NULL,
  parameter_value NUMERIC NOT NULL,
  feature_correlations JSONB,
  feature_statistics JSONB,
  training_samples INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(model_version, parameter_type, parameter_name)
);

-- Enable RLS
ALTER TABLE public.aeso_model_parameters ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read parameters
CREATE POLICY "Anyone can view model parameters"
  ON public.aeso_model_parameters
  FOR SELECT
  USING (true);

-- Allow service role to insert/update parameters
CREATE POLICY "Service role can manage model parameters"
  ON public.aeso_model_parameters
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Create index for faster lookups
CREATE INDEX idx_model_parameters_version ON public.aeso_model_parameters(model_version, created_at DESC);
-- Phase 8: Prediction Explanations Table
CREATE TABLE IF NOT EXISTS public.aeso_prediction_explanations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prediction_id UUID NOT NULL,
  target_timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
  predicted_price NUMERIC NOT NULL,
  feature_contributions JSONB NOT NULL,
  key_drivers JSONB NOT NULL,
  sensitivity_analysis JSONB NOT NULL,
  explanation_text TEXT NOT NULL,
  confidence_breakdown JSONB NOT NULL,
  model_version TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_aeso_prediction_explanations_prediction_id 
  ON public.aeso_prediction_explanations(prediction_id);

CREATE INDEX IF NOT EXISTS idx_aeso_prediction_explanations_timestamp 
  ON public.aeso_prediction_explanations(target_timestamp DESC);

CREATE INDEX IF NOT EXISTS idx_aeso_prediction_explanations_created 
  ON public.aeso_prediction_explanations(created_at DESC);

-- Enable RLS
ALTER TABLE public.aeso_prediction_explanations ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated users to read prediction explanations
CREATE POLICY "Allow authenticated users to read prediction explanations"
  ON public.aeso_prediction_explanations
  FOR SELECT
  TO authenticated
  USING (true);

-- Only service role can insert/update explanations (done via edge functions)
CREATE POLICY "Allow service role to manage prediction explanations"
  ON public.aeso_prediction_explanations
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Add trigger for updated_at
CREATE TRIGGER update_aeso_prediction_explanations_updated_at
  BEFORE UPDATE ON public.aeso_prediction_explanations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Add comment for documentation
COMMENT ON TABLE public.aeso_prediction_explanations IS 'Phase 8: Stores detailed explanations of predictions including feature contributions, key drivers, and sensitivity analysis for model interpretability';

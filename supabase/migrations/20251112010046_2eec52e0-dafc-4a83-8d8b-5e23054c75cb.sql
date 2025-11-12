-- Phase 5: Ensemble Prediction Framework (Fixed)
-- Add table to track ensemble predictions and model weights

CREATE TABLE IF NOT EXISTS public.aeso_ensemble_predictions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  target_timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
  prediction_timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Individual model predictions
  ml_predictor_price NUMERIC,
  moving_average_price NUMERIC,
  arima_price NUMERIC,
  seasonal_price NUMERIC,
  
  -- Ensemble result
  ensemble_price NUMERIC NOT NULL,
  
  -- Model weights used
  ml_weight NUMERIC DEFAULT 0.4,
  ma_weight NUMERIC DEFAULT 0.2,
  arima_weight NUMERIC DEFAULT 0.2,
  seasonal_weight NUMERIC DEFAULT 0.2,
  
  -- Actual outcome and error metrics
  actual_price NUMERIC,
  ensemble_error NUMERIC,
  ensemble_smape NUMERIC,
  
  -- Confidence metrics
  prediction_std NUMERIC,
  confidence_interval_lower NUMERIC,
  confidence_interval_upper NUMERIC,
  
  -- Metadata
  model_version TEXT DEFAULT 'ensemble_v1',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(target_timestamp, prediction_timestamp)
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_aeso_ensemble_target_ts ON public.aeso_ensemble_predictions(target_timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_aeso_ensemble_prediction_ts ON public.aeso_ensemble_predictions(prediction_timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_aeso_ensemble_actual_price ON public.aeso_ensemble_predictions(actual_price) WHERE actual_price IS NOT NULL;

-- Enable RLS
ALTER TABLE public.aeso_ensemble_predictions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies and recreate
DROP POLICY IF EXISTS "Allow public read access to ensemble predictions" ON public.aeso_ensemble_predictions;
DROP POLICY IF EXISTS "Allow authenticated insert to ensemble predictions" ON public.aeso_ensemble_predictions;
DROP POLICY IF EXISTS "Allow authenticated update to ensemble predictions" ON public.aeso_ensemble_predictions;

CREATE POLICY "Allow public read access to ensemble predictions"
  ON public.aeso_ensemble_predictions FOR SELECT
  USING (true);

CREATE POLICY "Allow authenticated insert to ensemble predictions"
  ON public.aeso_ensemble_predictions FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow authenticated update to ensemble predictions"
  ON public.aeso_ensemble_predictions FOR UPDATE
  USING (true);

-- Add comments
COMMENT ON TABLE public.aeso_ensemble_predictions IS 'Stores ensemble predictions combining multiple forecasting models';
COMMENT ON COLUMN public.aeso_ensemble_predictions.ensemble_price IS 'Final ensemble prediction as weighted average of all models';
COMMENT ON COLUMN public.aeso_ensemble_predictions.ml_weight IS 'Weight assigned to ML predictor in ensemble (sum of all weights = 1.0)';
COMMENT ON COLUMN public.aeso_ensemble_predictions.prediction_std IS 'Standard deviation across model predictions (uncertainty measure)';

-- Table to track dynamic model weights based on recent performance
CREATE TABLE IF NOT EXISTS public.aeso_model_weights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  effective_date TIMESTAMP WITH TIME ZONE NOT NULL,
  
  -- Current optimal weights
  ml_weight NUMERIC NOT NULL,
  ma_weight NUMERIC NOT NULL,
  arima_weight NUMERIC NOT NULL,
  seasonal_weight NUMERIC NOT NULL,
  
  -- Performance metrics that led to these weights
  ml_recent_smape NUMERIC,
  ma_recent_smape NUMERIC,
  arima_recent_smape NUMERIC,
  seasonal_recent_smape NUMERIC,
  
  -- Metadata
  evaluation_period_days INTEGER DEFAULT 7,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(effective_date)
);

-- Enable RLS
ALTER TABLE public.aeso_model_weights ENABLE ROW LEVEL SECURITY;

-- Drop existing policies and recreate
DROP POLICY IF EXISTS "Allow public read access to model weights" ON public.aeso_model_weights;
DROP POLICY IF EXISTS "Allow authenticated insert to model weights" ON public.aeso_model_weights;

CREATE POLICY "Allow public read access to model weights"
  ON public.aeso_model_weights FOR SELECT
  USING (true);

CREATE POLICY "Allow authenticated insert to model weights"
  ON public.aeso_model_weights FOR INSERT
  WITH CHECK (true);

-- Add index
CREATE INDEX IF NOT EXISTS idx_aeso_model_weights_date ON public.aeso_model_weights(effective_date DESC);

COMMENT ON TABLE public.aeso_model_weights IS 'Tracks optimal model weights over time based on recent performance';
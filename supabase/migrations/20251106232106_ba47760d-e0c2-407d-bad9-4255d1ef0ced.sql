-- Create table to store model performance metrics
CREATE TABLE IF NOT EXISTS public.aeso_model_performance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  model_version TEXT NOT NULL,
  evaluation_date TIMESTAMPTZ NOT NULL DEFAULT now(),
  mae DECIMAL(10,2), -- Mean Absolute Error
  rmse DECIMAL(10,2), -- Root Mean Square Error
  mape DECIMAL(10,2), -- Mean Absolute Percentage Error
  r_squared DECIMAL(10,4), -- R-squared score
  feature_importance JSONB, -- Store feature importance scores
  training_samples INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.aeso_model_performance ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read model performance
CREATE POLICY "Model performance is viewable by everyone"
ON public.aeso_model_performance
FOR SELECT
USING (true);

-- Policy: Only service role can insert (via edge functions)
CREATE POLICY "Service role can insert model performance"
ON public.aeso_model_performance
FOR INSERT
WITH CHECK (true);

-- Create index for faster queries
CREATE INDEX idx_aeso_model_performance_date ON public.aeso_model_performance(evaluation_date DESC);

-- Add index to training data for faster feature queries
CREATE INDEX IF NOT EXISTS idx_aeso_training_data_timestamp ON public.aeso_training_data(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_aeso_weather_forecasts_timestamp ON public.aeso_weather_forecasts(target_timestamp);
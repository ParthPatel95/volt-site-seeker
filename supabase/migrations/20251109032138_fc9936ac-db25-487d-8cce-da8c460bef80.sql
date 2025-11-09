-- Add market regime detection table
CREATE TABLE IF NOT EXISTS public.aeso_market_regimes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  timestamp TIMESTAMPTZ NOT NULL,
  regime TEXT NOT NULL CHECK (regime IN ('normal', 'high_price', 'low_price', 'high_demand', 'volatile', 'renewable_surge')),
  confidence NUMERIC NOT NULL CHECK (confidence >= 0 AND confidence <= 1),
  avg_price_24h NUMERIC NOT NULL,
  price_volatility_24h NUMERIC NOT NULL,
  avg_load_24h NUMERIC NOT NULL,
  renewable_percentage NUMERIC NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(timestamp)
);

-- Add predictions table for tracking  
CREATE TABLE IF NOT EXISTS public.aeso_predictions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  predicted_at TIMESTAMPTZ NOT NULL,
  target_timestamp TIMESTAMPTZ NOT NULL,
  hours_ahead INTEGER NOT NULL,
  predicted_price NUMERIC NOT NULL,
  actual_price NUMERIC,
  prediction_error NUMERIC,
  absolute_error NUMERIC,
  percent_error NUMERIC,
  confidence NUMERIC,
  model_version TEXT NOT NULL,
  prediction_method TEXT,
  individual_predictions JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add columns to existing aeso_model_performance table
ALTER TABLE public.aeso_model_performance 
  ADD COLUMN IF NOT EXISTS predictions_evaluated INTEGER;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_regimes_timestamp ON public.aeso_market_regimes(timestamp);
CREATE INDEX IF NOT EXISTS idx_regimes_regime ON public.aeso_market_regimes(regime);
CREATE INDEX IF NOT EXISTS idx_predictions_target ON public.aeso_predictions(target_timestamp);
CREATE INDEX IF NOT EXISTS idx_predictions_predicted_at ON public.aeso_predictions(predicted_at);

-- Enable RLS
ALTER TABLE public.aeso_market_regimes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.aeso_predictions ENABLE ROW LEVEL SECURITY;

-- Public read access policies
CREATE POLICY "Allow public read access to regimes"
  ON public.aeso_market_regimes FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public read access to predictions"
  ON public.aeso_predictions FOR SELECT
  TO public
  USING (true);

-- Service role full access
CREATE POLICY "Allow service role full access to regimes"
  ON public.aeso_market_regimes FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow service role full access to predictions"
  ON public.aeso_predictions FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
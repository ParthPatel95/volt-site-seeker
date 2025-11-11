-- Phase 9: Multi-Market Support Tables

-- Multi-market request tracking
CREATE TABLE IF NOT EXISTS public.multi_market_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  primary_market TEXT NOT NULL,
  horizon_hours INTEGER NOT NULL,
  comparison_enabled BOOLEAN NOT NULL DEFAULT false,
  predictions_count INTEGER NOT NULL DEFAULT 0,
  request_timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Index for tracking
CREATE INDEX IF NOT EXISTS idx_multi_market_requests_timestamp 
  ON public.multi_market_requests(request_timestamp DESC);

CREATE INDEX IF NOT EXISTS idx_multi_market_requests_market 
  ON public.multi_market_requests(primary_market);

-- Market metadata and configuration
CREATE TABLE IF NOT EXISTS public.market_configurations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  market_code TEXT NOT NULL UNIQUE,
  market_name TEXT NOT NULL,
  region TEXT NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  unit TEXT NOT NULL DEFAULT 'MWh',
  status TEXT NOT NULL DEFAULT 'preview', -- active, preview, coming_soon
  predictor_available BOOLEAN NOT NULL DEFAULT false,
  typical_price_min NUMERIC,
  typical_price_max NUMERIC,
  spike_threshold NUMERIC,
  features JSONB,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Insert initial market configurations
INSERT INTO public.market_configurations (market_code, market_name, region, currency, status, predictor_available, typical_price_min, typical_price_max, spike_threshold, features)
VALUES 
  ('aeso', 'Alberta Energy System Operator', 'Alberta, Canada', 'CAD', 'active', true, 0, 200, 150, '["demand", "wind", "solar", "gas_price", "temperature", "imports"]'::jsonb),
  ('ercot', 'Electric Reliability Council of Texas', 'Texas, USA', 'USD', 'preview', false, 0, 300, 250, '["demand", "wind", "solar", "gas_price", "temperature", "reserves"]'::jsonb),
  ('miso', 'Midcontinent Independent System Operator', 'Midwest, USA', 'USD', 'preview', false, 0, 150, 100, '["demand", "wind", "coal", "gas_price", "nuclear", "temperature"]'::jsonb),
  ('caiso', 'California Independent System Operator', 'California, USA', 'USD', 'preview', false, 0, 200, 150, '["demand", "solar", "wind", "gas_price", "imports", "temperature"]'::jsonb),
  ('pjm', 'PJM Interconnection', 'Mid-Atlantic, USA', 'USD', 'preview', false, 0, 180, 120, '["demand", "nuclear", "gas_price", "coal", "temperature"]'::jsonb)
ON CONFLICT (market_code) DO NOTHING;

-- Enable RLS
ALTER TABLE public.multi_market_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.market_configurations ENABLE ROW LEVEL SECURITY;

-- Policies for multi_market_requests
CREATE POLICY "Allow authenticated users to read multi-market requests"
  ON public.multi_market_requests
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow service role to manage multi-market requests"
  ON public.multi_market_requests
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Policies for market_configurations
CREATE POLICY "Allow authenticated users to read market configurations"
  ON public.market_configurations
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow service role to manage market configurations"
  ON public.market_configurations
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Trigger for updated_at
CREATE TRIGGER update_market_configurations_updated_at
  BEFORE UPDATE ON public.market_configurations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Comments
COMMENT ON TABLE public.multi_market_requests IS 'Phase 9: Tracks multi-market prediction requests and comparison analytics';
COMMENT ON TABLE public.market_configurations IS 'Phase 9: Stores configuration and metadata for supported energy markets';

-- Phase 7: Prediction Performance Tracking Table
CREATE TABLE IF NOT EXISTS public.aeso_prediction_performance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  horizon_hours INTEGER NOT NULL,
  cache_hit_count INTEGER NOT NULL DEFAULT 0,
  cache_miss_count INTEGER NOT NULL DEFAULT 0,
  total_duration_ms INTEGER NOT NULL,
  predictions_generated INTEGER NOT NULL DEFAULT 0,
  cache_hit_rate NUMERIC NOT NULL DEFAULT 0,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_aeso_prediction_performance_timestamp 
  ON public.aeso_prediction_performance(request_timestamp DESC);

CREATE INDEX IF NOT EXISTS idx_aeso_prediction_performance_cache_rate 
  ON public.aeso_prediction_performance(cache_hit_rate DESC);

-- Enable RLS
ALTER TABLE public.aeso_prediction_performance ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated users to read performance metrics
CREATE POLICY "Allow authenticated users to read performance metrics"
  ON public.aeso_prediction_performance
  FOR SELECT
  TO authenticated
  USING (true);

-- Only service role can insert performance metrics (done via edge functions)
CREATE POLICY "Allow service role to manage performance metrics"
  ON public.aeso_prediction_performance
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Add comment for documentation
COMMENT ON TABLE public.aeso_prediction_performance IS 'Phase 7: Tracks prediction request performance, cache hit rates, and optimization metrics';

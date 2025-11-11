-- Phase 7: Add price lag columns to training data for better feature engineering

-- Add calculated price lag features directly to training data
ALTER TABLE public.aeso_training_data
ADD COLUMN IF NOT EXISTS price_lag_1h NUMERIC,
ADD COLUMN IF NOT EXISTS price_lag_2h NUMERIC,
ADD COLUMN IF NOT EXISTS price_lag_3h NUMERIC,
ADD COLUMN IF NOT EXISTS price_lag_24h NUMERIC,
ADD COLUMN IF NOT EXISTS price_rolling_avg_24h NUMERIC,
ADD COLUMN IF NOT EXISTS price_rolling_std_24h NUMERIC,
ADD COLUMN IF NOT EXISTS price_momentum_1h NUMERIC,
ADD COLUMN IF NOT EXISTS price_momentum_3h NUMERIC,
ADD COLUMN IF NOT EXISTS wind_hour_interaction NUMERIC,
ADD COLUMN IF NOT EXISTS temp_demand_interaction NUMERIC,
ADD COLUMN IF NOT EXISTS is_valid_record BOOLEAN DEFAULT true;

-- Create index for faster feature calculation queries
CREATE INDEX IF NOT EXISTS idx_training_data_timestamp_desc 
  ON public.aeso_training_data(timestamp DESC);

CREATE INDEX IF NOT EXISTS idx_training_data_valid_records 
  ON public.aeso_training_data(is_valid_record, timestamp) 
  WHERE is_valid_record = true;

-- Comments
COMMENT ON COLUMN public.aeso_training_data.price_lag_1h IS 'Phase 7: Price 1 hour ago';
COMMENT ON COLUMN public.aeso_training_data.price_lag_24h IS 'Phase 7: Price 24 hours ago';
COMMENT ON COLUMN public.aeso_training_data.price_rolling_avg_24h IS 'Phase 7: 24-hour rolling average price';
COMMENT ON COLUMN public.aeso_training_data.price_momentum_1h IS 'Phase 7: Price rate of change over 1 hour';
COMMENT ON COLUMN public.aeso_training_data.is_valid_record IS 'Phase 7: Flag for data quality - false if invalid';
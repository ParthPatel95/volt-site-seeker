-- Phase 1 ML Improvements: Add extended lag features and quantile features
-- Add missing lag features
ALTER TABLE aeso_training_data 
ADD COLUMN IF NOT EXISTS price_lag_6h NUMERIC,
ADD COLUMN IF NOT EXISTS price_lag_12h NUMERIC,
ADD COLUMN IF NOT EXISTS price_lag_168h NUMERIC;

-- Add rolling quantile features (10th, 50th, 90th percentile over 24h window)
ALTER TABLE aeso_training_data
ADD COLUMN IF NOT EXISTS price_quantile_10th_24h NUMERIC,
ADD COLUMN IF NOT EXISTS price_quantile_50th_24h NUMERIC,
ADD COLUMN IF NOT EXISTS price_quantile_90th_24h NUMERIC;

-- Add demand quantile features
ALTER TABLE aeso_training_data
ADD COLUMN IF NOT EXISTS demand_quantile_90th_24h NUMERIC;

-- Add day type feature (0=weekday, 1=weekend, 2=holiday)
ALTER TABLE aeso_training_data
ADD COLUMN IF NOT EXISTS day_type INTEGER;

-- Create indexes for better query performance on new features
CREATE INDEX IF NOT EXISTS idx_aeso_training_data_price_lag_6h ON aeso_training_data(price_lag_6h);
CREATE INDEX IF NOT EXISTS idx_aeso_training_data_price_lag_12h ON aeso_training_data(price_lag_12h);
CREATE INDEX IF NOT EXISTS idx_aeso_training_data_day_type ON aeso_training_data(day_type);

COMMENT ON COLUMN aeso_training_data.price_lag_6h IS 'Pool price 6 hours ago ($/MWh)';
COMMENT ON COLUMN aeso_training_data.price_lag_12h IS 'Pool price 12 hours ago ($/MWh)';
COMMENT ON COLUMN aeso_training_data.price_lag_168h IS 'Pool price 1 week ago ($/MWh)';
COMMENT ON COLUMN aeso_training_data.price_quantile_10th_24h IS '10th percentile of prices over last 24h';
COMMENT ON COLUMN aeso_training_data.price_quantile_50th_24h IS 'Median price over last 24h';
COMMENT ON COLUMN aeso_training_data.price_quantile_90th_24h IS '90th percentile of prices over last 24h';
COMMENT ON COLUMN aeso_training_data.day_type IS 'Day type: 0=weekday, 1=weekend, 2=holiday';
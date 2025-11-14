-- Add forecast columns to aeso_training_data table for AESO forecast data
ALTER TABLE aeso_training_data 
ADD COLUMN IF NOT EXISTS wind_forecast_1h NUMERIC,
ADD COLUMN IF NOT EXISTS wind_forecast_3h NUMERIC,
ADD COLUMN IF NOT EXISTS wind_forecast_24h NUMERIC,
ADD COLUMN IF NOT EXISTS solar_forecast_1h NUMERIC,
ADD COLUMN IF NOT EXISTS solar_forecast_3h NUMERIC,
ADD COLUMN IF NOT EXISTS solar_forecast_24h NUMERIC,
ADD COLUMN IF NOT EXISTS load_forecast_1h NUMERIC,
ADD COLUMN IF NOT EXISTS load_forecast_3h NUMERIC,
ADD COLUMN IF NOT EXISTS load_forecast_24h NUMERIC,
ADD COLUMN IF NOT EXISTS pool_price_forecast_1h NUMERIC,
ADD COLUMN IF NOT EXISTS pool_price_forecast_3h NUMERIC,
ADD COLUMN IF NOT EXISTS pool_price_forecast_24h NUMERIC;

COMMENT ON COLUMN aeso_training_data.wind_forecast_1h IS 'AESO wind generation forecast 1 hour ahead (MW)';
COMMENT ON COLUMN aeso_training_data.wind_forecast_3h IS 'AESO wind generation forecast 3 hours ahead (MW)';
COMMENT ON COLUMN aeso_training_data.wind_forecast_24h IS 'AESO wind generation forecast 24 hours ahead (MW)';
COMMENT ON COLUMN aeso_training_data.solar_forecast_1h IS 'AESO solar generation forecast 1 hour ahead (MW)';
COMMENT ON COLUMN aeso_training_data.solar_forecast_3h IS 'AESO solar generation forecast 3 hours ahead (MW)';
COMMENT ON COLUMN aeso_training_data.solar_forecast_24h IS 'AESO solar generation forecast 24 hours ahead (MW)';
COMMENT ON COLUMN aeso_training_data.load_forecast_1h IS 'AESO load forecast 1 hour ahead (MW)';
COMMENT ON COLUMN aeso_training_data.load_forecast_3h IS 'AESO load forecast 3 hours ahead (MW)';
COMMENT ON COLUMN aeso_training_data.load_forecast_24h IS 'AESO load forecast 24 hours ahead (MW)';
COMMENT ON COLUMN aeso_training_data.pool_price_forecast_1h IS 'AESO pool price forecast 1 hour ahead ($/MWh)';
COMMENT ON COLUMN aeso_training_data.pool_price_forecast_3h IS 'AESO pool price forecast 3 hours ahead ($/MWh)';
COMMENT ON COLUMN aeso_training_data.pool_price_forecast_24h IS 'AESO pool price forecast 24 hours ahead ($/MWh)';
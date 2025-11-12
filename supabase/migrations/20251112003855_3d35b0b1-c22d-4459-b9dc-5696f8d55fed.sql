-- Add Phase 2: Deep Feature Engineering columns to aeso_training_data

-- Extended lag features (48h, 72h)
ALTER TABLE aeso_training_data ADD COLUMN IF NOT EXISTS price_lag_48h NUMERIC;
ALTER TABLE aeso_training_data ADD COLUMN IF NOT EXISTS price_lag_72h NUMERIC;
ALTER TABLE aeso_training_data ADD COLUMN IF NOT EXISTS demand_lag_3h NUMERIC;
ALTER TABLE aeso_training_data ADD COLUMN IF NOT EXISTS demand_lag_6h NUMERIC;
ALTER TABLE aeso_training_data ADD COLUMN IF NOT EXISTS wind_lag_3h NUMERIC;
ALTER TABLE aeso_training_data ADD COLUMN IF NOT EXISTS wind_lag_6h NUMERIC;

-- Rolling volatility windows
ALTER TABLE aeso_training_data ADD COLUMN IF NOT EXISTS price_volatility_3h NUMERIC;
ALTER TABLE aeso_training_data ADD COLUMN IF NOT EXISTS price_volatility_6h NUMERIC;
ALTER TABLE aeso_training_data ADD COLUMN IF NOT EXISTS price_volatility_12h NUMERIC;
ALTER TABLE aeso_training_data ADD COLUMN IF NOT EXISTS demand_volatility_6h NUMERIC;
ALTER TABLE aeso_training_data ADD COLUMN IF NOT EXISTS wind_volatility_6h NUMERIC;

-- Advanced interaction terms
ALTER TABLE aeso_training_data ADD COLUMN IF NOT EXISTS temp_demand_hour_interaction NUMERIC;
ALTER TABLE aeso_training_data ADD COLUMN IF NOT EXISTS wind_solar_demand_interaction NUMERIC;
ALTER TABLE aeso_training_data ADD COLUMN IF NOT EXISTS price_demand_ratio NUMERIC;
ALTER TABLE aeso_training_data ADD COLUMN IF NOT EXISTS renewable_capacity_factor NUMERIC;

-- Day-ahead indicators
ALTER TABLE aeso_training_data ADD COLUMN IF NOT EXISTS price_acceleration NUMERIC; -- 2nd derivative of price
ALTER TABLE aeso_training_data ADD COLUMN IF NOT EXISTS volatility_trend NUMERIC; -- Change in volatility
ALTER TABLE aeso_training_data ADD COLUMN IF NOT EXISTS demand_forecast_error NUMERIC; -- Deviation from expected demand
ALTER TABLE aeso_training_data ADD COLUMN IF NOT EXISTS supply_cushion NUMERIC; -- Total gen - demand

-- Market stress indicators
ALTER TABLE aeso_training_data ADD COLUMN IF NOT EXISTS market_stress_score NUMERIC;
ALTER TABLE aeso_training_data ADD COLUMN IF NOT EXISTS price_spike_probability NUMERIC;

COMMENT ON COLUMN aeso_training_data.price_lag_48h IS 'Pool price 48 hours ago ($/MWh)';
COMMENT ON COLUMN aeso_training_data.price_lag_72h IS 'Pool price 72 hours ago ($/MWh)';
COMMENT ON COLUMN aeso_training_data.price_volatility_3h IS 'Price standard deviation over 3-hour window';
COMMENT ON COLUMN aeso_training_data.price_volatility_6h IS 'Price standard deviation over 6-hour window';
COMMENT ON COLUMN aeso_training_data.price_volatility_12h IS 'Price standard deviation over 12-hour window';
COMMENT ON COLUMN aeso_training_data.temp_demand_hour_interaction IS 'Three-way interaction: temperature × demand × hour';
COMMENT ON COLUMN aeso_training_data.wind_solar_demand_interaction IS 'Renewable generation × demand interaction';
COMMENT ON COLUMN aeso_training_data.price_acceleration IS 'Second derivative of price (rate of price change)';
COMMENT ON COLUMN aeso_training_data.supply_cushion IS 'Total generation minus demand (MW)';
COMMENT ON COLUMN aeso_training_data.market_stress_score IS 'Composite indicator of market stress (0-100)';

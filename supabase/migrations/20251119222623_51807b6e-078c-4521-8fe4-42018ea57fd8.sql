-- Add Phase 3 feature columns (Weather Integration, Natural Gas, Interactions, Volatility, Momentum)
ALTER TABLE aeso_training_data
ADD COLUMN IF NOT EXISTS gas_price_aeco NUMERIC,
ADD COLUMN IF NOT EXISTS gas_price_lag_24h NUMERIC,
ADD COLUMN IF NOT EXISTS gas_price_ma_7d NUMERIC,
ADD COLUMN IF NOT EXISTS gas_price_momentum NUMERIC,
ADD COLUMN IF NOT EXISTS gas_demand_interaction NUMERIC,
ADD COLUMN IF NOT EXISTS gas_temp_interaction NUMERIC,
ADD COLUMN IF NOT EXISTS gas_wind_interaction NUMERIC,
ADD COLUMN IF NOT EXISTS temp_demand_interaction NUMERIC,
ADD COLUMN IF NOT EXISTS wind_hour_interaction NUMERIC,
ADD COLUMN IF NOT EXISTS wind_solar_demand_interaction NUMERIC,
ADD COLUMN IF NOT EXISTS temp_demand_hour_interaction NUMERIC,
ADD COLUMN IF NOT EXISTS wind_volatility_6h NUMERIC,
ADD COLUMN IF NOT EXISTS renewable_volatility NUMERIC,
ADD COLUMN IF NOT EXISTS price_momentum_1h NUMERIC,
ADD COLUMN IF NOT EXISTS price_momentum_3h NUMERIC;

-- Add Phase 4 feature columns (Advanced Feature Engineering)
ALTER TABLE aeso_training_data
ADD COLUMN IF NOT EXISTS price_squared NUMERIC,
ADD COLUMN IF NOT EXISTS price_cubed NUMERIC,
ADD COLUMN IF NOT EXISTS demand_squared NUMERIC,
ADD COLUMN IF NOT EXISTS wind_generation_squared NUMERIC,
ADD COLUMN IF NOT EXISTS price_per_mw_demand NUMERIC,
ADD COLUMN IF NOT EXISTS renewable_ratio NUMERIC,
ADD COLUMN IF NOT EXISTS gas_generation_ratio NUMERIC,
ADD COLUMN IF NOT EXISTS price_to_ma_ratio NUMERIC,
ADD COLUMN IF NOT EXISTS price_demand_cross NUMERIC,
ADD COLUMN IF NOT EXISTS renewable_price_cross NUMERIC,
ADD COLUMN IF NOT EXISTS gas_price_demand_cross NUMERIC,
ADD COLUMN IF NOT EXISTS temperature_demand_cross NUMERIC,
ADD COLUMN IF NOT EXISTS wind_speed_generation_cross NUMERIC,
ADD COLUMN IF NOT EXISTS price_bin INTEGER,
ADD COLUMN IF NOT EXISTS demand_bin INTEGER,
ADD COLUMN IF NOT EXISTS time_bin INTEGER,
ADD COLUMN IF NOT EXISTS renewable_bin INTEGER;

-- Add indexes for frequently queried columns
CREATE INDEX IF NOT EXISTS idx_aeso_training_gas_price ON aeso_training_data(gas_price_aeco);
CREATE INDEX IF NOT EXISTS idx_aeso_training_price_bin ON aeso_training_data(price_bin);
CREATE INDEX IF NOT EXISTS idx_aeso_training_demand_bin ON aeso_training_data(demand_bin);

COMMENT ON COLUMN aeso_training_data.gas_price_aeco IS 'AECO natural gas spot price ($/GJ)';
COMMENT ON COLUMN aeso_training_data.price_bin IS 'Binned price category: 0=negative, 1=low(<50), 2=normal(<100), 3=high(<200), 4=very high(<500), 5=extreme';
COMMENT ON COLUMN aeso_training_data.demand_bin IS 'Binned demand category: 0=very low, 1=low, 2=normal, 3=high, 4=very high';
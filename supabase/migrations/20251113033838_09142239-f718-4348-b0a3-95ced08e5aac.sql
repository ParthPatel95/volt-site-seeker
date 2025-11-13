-- Add advanced features to aeso_training_data table

-- Fourier features for seasonality
ALTER TABLE aeso_training_data ADD COLUMN IF NOT EXISTS fourier_daily_sin_1 NUMERIC;
ALTER TABLE aeso_training_data ADD COLUMN IF NOT EXISTS fourier_daily_cos_1 NUMERIC;
ALTER TABLE aeso_training_data ADD COLUMN IF NOT EXISTS fourier_daily_sin_2 NUMERIC;
ALTER TABLE aeso_training_data ADD COLUMN IF NOT EXISTS fourier_daily_cos_2 NUMERIC;
ALTER TABLE aeso_training_data ADD COLUMN IF NOT EXISTS fourier_weekly_sin NUMERIC;
ALTER TABLE aeso_training_data ADD COLUMN IF NOT EXISTS fourier_weekly_cos NUMERIC;
ALTER TABLE aeso_training_data ADD COLUMN IF NOT EXISTS fourier_annual_sin_1 NUMERIC;
ALTER TABLE aeso_training_data ADD COLUMN IF NOT EXISTS fourier_annual_cos_1 NUMERIC;
ALTER TABLE aeso_training_data ADD COLUMN IF NOT EXISTS fourier_annual_sin_2 NUMERIC;
ALTER TABLE aeso_training_data ADD COLUMN IF NOT EXISTS fourier_annual_cos_2 NUMERIC;

-- Natural gas price features
ALTER TABLE aeso_training_data ADD COLUMN IF NOT EXISTS gas_price_aeco NUMERIC;
ALTER TABLE aeso_training_data ADD COLUMN IF NOT EXISTS gas_price_lag_24h NUMERIC;
ALTER TABLE aeso_training_data ADD COLUMN IF NOT EXISTS gas_price_momentum NUMERIC;
ALTER TABLE aeso_training_data ADD COLUMN IF NOT EXISTS gas_price_ma_7d NUMERIC;

-- Gas interaction features
ALTER TABLE aeso_training_data ADD COLUMN IF NOT EXISTS gas_temp_interaction NUMERIC;
ALTER TABLE aeso_training_data ADD COLUMN IF NOT EXISTS gas_demand_interaction NUMERIC;
ALTER TABLE aeso_training_data ADD COLUMN IF NOT EXISTS gas_wind_interaction NUMERIC;

-- Market timing features
ALTER TABLE aeso_training_data ADD COLUMN IF NOT EXISTS is_morning_ramp INTEGER;
ALTER TABLE aeso_training_data ADD COLUMN IF NOT EXISTS is_evening_peak INTEGER;
ALTER TABLE aeso_training_data ADD COLUMN IF NOT EXISTS is_overnight INTEGER;

-- Advanced features
ALTER TABLE aeso_training_data ADD COLUMN IF NOT EXISTS weekend_demand_factor NUMERIC;
ALTER TABLE aeso_training_data ADD COLUMN IF NOT EXISTS temp_extreme_cold INTEGER;
ALTER TABLE aeso_training_data ADD COLUMN IF NOT EXISTS temp_extreme_hot INTEGER;
ALTER TABLE aeso_training_data ADD COLUMN IF NOT EXISTS renewable_volatility NUMERIC;

-- Create index for gas price lookups
CREATE INDEX IF NOT EXISTS idx_gas_price_timestamp ON aeso_natural_gas_prices(timestamp);

-- Add comments for documentation
COMMENT ON COLUMN aeso_training_data.fourier_daily_sin_1 IS 'First harmonic sine component of daily cycle (24h period)';
COMMENT ON COLUMN aeso_training_data.fourier_annual_sin_1 IS 'First harmonic sine component of annual cycle (365d period)';
COMMENT ON COLUMN aeso_training_data.gas_price_aeco IS 'AECO natural gas price ($/MMBtu) - major price driver';
COMMENT ON COLUMN aeso_training_data.gas_demand_interaction IS 'Interaction between gas price and demand for price sensitivity';
COMMENT ON COLUMN aeso_training_data.renewable_volatility IS '6-hour rolling standard deviation of renewable generation';

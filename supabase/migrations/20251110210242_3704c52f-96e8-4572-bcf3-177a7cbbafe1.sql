-- Add lagged natural gas price columns to aeso_enhanced_features table
ALTER TABLE public.aeso_enhanced_features
ADD COLUMN IF NOT EXISTS natural_gas_price_lag_1d NUMERIC,
ADD COLUMN IF NOT EXISTS natural_gas_price_lag_7d NUMERIC,
ADD COLUMN IF NOT EXISTS natural_gas_price_lag_30d NUMERIC;

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_aeso_enhanced_features_gas_lag_1d ON public.aeso_enhanced_features(natural_gas_price_lag_1d);
CREATE INDEX IF NOT EXISTS idx_aeso_enhanced_features_gas_lag_7d ON public.aeso_enhanced_features(natural_gas_price_lag_7d);
CREATE INDEX IF NOT EXISTS idx_aeso_enhanced_features_gas_lag_30d ON public.aeso_enhanced_features(natural_gas_price_lag_30d);
-- Create table for natural gas price data
CREATE TABLE IF NOT EXISTS public.aeso_natural_gas_prices (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
  price DECIMAL(10, 4) NOT NULL,
  source TEXT NOT NULL DEFAULT 'EIA',
  market TEXT NOT NULL DEFAULT 'AECO',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(timestamp, market)
);

-- Create index for efficient querying
CREATE INDEX IF NOT EXISTS idx_natural_gas_prices_timestamp ON public.aeso_natural_gas_prices(timestamp DESC);

-- Enable RLS
ALTER TABLE public.aeso_natural_gas_prices ENABLE ROW LEVEL SECURITY;

-- Create policy for read access
CREATE POLICY "Natural gas prices are viewable by everyone" 
ON public.aeso_natural_gas_prices 
FOR SELECT 
USING (true);

-- Create table for enhanced feature storage
CREATE TABLE IF NOT EXISTS public.aeso_enhanced_features (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
  price_volatility_1h DECIMAL(10, 4),
  price_volatility_24h DECIMAL(10, 4),
  price_momentum_3h DECIMAL(10, 4),
  natural_gas_price DECIMAL(10, 4),
  renewable_curtailment DECIMAL(10, 4),
  net_imports DECIMAL(10, 4),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(timestamp)
);

-- Create index
CREATE INDEX IF NOT EXISTS idx_enhanced_features_timestamp ON public.aeso_enhanced_features(timestamp DESC);

-- Enable RLS
ALTER TABLE public.aeso_enhanced_features ENABLE ROW LEVEL SECURITY;

-- Create policy
CREATE POLICY "Enhanced features are viewable by everyone" 
ON public.aeso_enhanced_features 
FOR SELECT 
USING (true);

-- Add columns to model_parameters for XGBoost hyperparameters
ALTER TABLE public.aeso_model_parameters 
ADD COLUMN IF NOT EXISTS learning_rate DECIMAL(10, 6) DEFAULT 0.1,
ADD COLUMN IF NOT EXISTS max_depth INTEGER DEFAULT 6,
ADD COLUMN IF NOT EXISTS min_samples_split INTEGER DEFAULT 10,
ADD COLUMN IF NOT EXISTS n_estimators INTEGER DEFAULT 100,
ADD COLUMN IF NOT EXISTS subsample DECIMAL(10, 4) DEFAULT 0.8;
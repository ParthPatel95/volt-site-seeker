-- Add Phase 3 enhanced features to training data
ALTER TABLE aeso_training_data 
ADD COLUMN IF NOT EXISTS net_demand NUMERIC,
ADD COLUMN IF NOT EXISTS renewable_penetration NUMERIC,
ADD COLUMN IF NOT EXISTS hour_of_week INTEGER,
ADD COLUMN IF NOT EXISTS heating_degree_days NUMERIC,
ADD COLUMN IF NOT EXISTS cooling_degree_days NUMERIC,
ADD COLUMN IF NOT EXISTS demand_ramp_rate NUMERIC,
ADD COLUMN IF NOT EXISTS wind_ramp_rate NUMERIC,
ADD COLUMN IF NOT EXISTS price_ramp_rate NUMERIC;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_training_hour_of_week 
ON aeso_training_data(hour_of_week);

CREATE INDEX IF NOT EXISTS idx_training_net_demand 
ON aeso_training_data(net_demand);

CREATE INDEX IF NOT EXISTS idx_training_renewable_penetration 
ON aeso_training_data(renewable_penetration);
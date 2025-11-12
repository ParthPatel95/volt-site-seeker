-- Add new columns to aeso_training_data for enhanced market features

-- System Marginal Price (the marginal cost to serve load)
ALTER TABLE public.aeso_training_data
ADD COLUMN IF NOT EXISTS system_marginal_price numeric,
ADD COLUMN IF NOT EXISTS smp_pool_price_spread numeric;

-- Intertie Flows (imports/exports with neighboring jurisdictions)
ALTER TABLE public.aeso_training_data
ADD COLUMN IF NOT EXISTS intertie_bc_flow numeric,
ADD COLUMN IF NOT EXISTS intertie_sask_flow numeric,
ADD COLUMN IF NOT EXISTS intertie_montana_flow numeric,
ADD COLUMN IF NOT EXISTS total_interchange_flow numeric;

-- Operating Reserve Prices (ancillary services)
ALTER TABLE public.aeso_training_data
ADD COLUMN IF NOT EXISTS operating_reserve_price numeric,
ADD COLUMN IF NOT EXISTS spinning_reserve_mw numeric,
ADD COLUMN IF NOT EXISTS supplemental_reserve_mw numeric;

-- Transmission Constraints
ALTER TABLE public.aeso_training_data
ADD COLUMN IF NOT EXISTS transmission_outages_count integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS transmission_constraint_hours numeric;

-- Generation Outages
ALTER TABLE public.aeso_training_data
ADD COLUMN IF NOT EXISTS generation_outages_mw numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS available_capacity_mw numeric;

-- Market Stress Indicators
ALTER TABLE public.aeso_training_data
ADD COLUMN IF NOT EXISTS reserve_margin_percent numeric,
ADD COLUMN IF NOT EXISTS grid_stress_score numeric;

-- Create indexes for better query performance on new columns
CREATE INDEX IF NOT EXISTS idx_aeso_training_smp ON public.aeso_training_data(system_marginal_price);
CREATE INDEX IF NOT EXISTS idx_aeso_training_interchange ON public.aeso_training_data(total_interchange_flow);
CREATE INDEX IF NOT EXISTS idx_aeso_training_or_price ON public.aeso_training_data(operating_reserve_price);
CREATE INDEX IF NOT EXISTS idx_aeso_training_outages ON public.aeso_training_data(generation_outages_mw);

COMMENT ON COLUMN public.aeso_training_data.system_marginal_price IS 'System Marginal Price - the cost to serve one additional MW of load';
COMMENT ON COLUMN public.aeso_training_data.smp_pool_price_spread IS 'Spread between Pool Price and SMP, indicates market tightness';
COMMENT ON COLUMN public.aeso_training_data.total_interchange_flow IS 'Net interchange flow (positive = import, negative = export)';
COMMENT ON COLUMN public.aeso_training_data.operating_reserve_price IS 'Operating reserve clearing price ($/MW)';
COMMENT ON COLUMN public.aeso_training_data.generation_outages_mw IS 'Total generation capacity on outage';
COMMENT ON COLUMN public.aeso_training_data.reserve_margin_percent IS 'Available capacity margin as percentage of demand';
COMMENT ON COLUMN public.aeso_training_data.grid_stress_score IS 'Calculated score indicating grid stress level (0-100)';
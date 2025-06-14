
-- Create substations table for detailed infrastructure mapping
CREATE TABLE public.substations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  latitude NUMERIC,
  longitude NUMERIC,
  voltage_level TEXT NOT NULL, -- '69kV', '138kV', '345kV', etc.
  capacity_mva NUMERIC NOT NULL,
  utility_owner TEXT NOT NULL,
  interconnection_type TEXT, -- 'transmission', 'distribution', 'generation'
  status TEXT NOT NULL DEFAULT 'active', -- 'active', 'planned', 'decommissioned'
  commissioning_date DATE,
  upgrade_potential NUMERIC, -- estimated additional capacity in MVA
  load_factor NUMERIC, -- current utilization percentage
  coordinates_source TEXT DEFAULT 'estimated',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create city power infrastructure analysis table
CREATE TABLE public.city_power_analysis (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  total_substation_capacity_mva NUMERIC NOT NULL,
  available_capacity_mva NUMERIC NOT NULL,
  average_load_factor NUMERIC NOT NULL,
  peak_demand_estimate_mw NUMERIC NOT NULL,
  energy_rate_estimate_per_mwh NUMERIC NOT NULL,
  utility_companies JSONB, -- array of utility companies serving the area
  transmission_lines JSONB, -- major transmission infrastructure
  generation_sources JSONB, -- nearby power generation facilities
  market_conditions JSONB, -- current market analysis
  grid_reliability_score INTEGER NOT NULL, -- 1-100 scale
  expansion_opportunities JSONB, -- potential for new infrastructure
  regulatory_environment JSONB, -- local regulations and incentives
  analysis_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Insert sample substation data for major Texas cities
INSERT INTO public.substations (name, city, state, voltage_level, capacity_mva, utility_owner, interconnection_type, load_factor) VALUES
('Houston Main', 'Houston', 'TX', '345kV', 2000, 'CenterPoint Energy', 'transmission', 75.5),
('Houston North', 'Houston', 'TX', '138kV', 800, 'CenterPoint Energy', 'transmission', 82.3),
('Houston East', 'Houston', 'TX', '138kV', 600, 'CenterPoint Energy', 'distribution', 68.9),
('Dallas Central', 'Dallas', 'TX', '345kV', 1800, 'Oncor Electric', 'transmission', 78.2),
('Dallas North', 'Dallas', 'TX', '138kV', 900, 'Oncor Electric', 'transmission', 71.4),
('Austin Main', 'Austin', 'TX', '345kV', 1200, 'Austin Energy', 'transmission', 65.8),
('Austin West', 'Austin', 'TX', '138kV', 500, 'Austin Energy', 'distribution', 59.3),
('San Antonio Central', 'San Antonio', 'TX', '345kV', 1500, 'CPS Energy', 'transmission', 73.1),
('Fort Worth Main', 'Fort Worth', 'TX', '138kV', 700, 'Oncor Electric', 'transmission', 69.7);

-- Create indexes for performance
CREATE INDEX idx_substations_city_state ON public.substations(city, state);
CREATE INDEX idx_substations_capacity ON public.substations(capacity_mva DESC);
CREATE INDEX idx_city_power_analysis_city_state ON public.city_power_analysis(city, state);
CREATE INDEX idx_city_power_analysis_date ON public.city_power_analysis(analysis_date DESC);

-- Enable RLS
ALTER TABLE public.substations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.city_power_analysis ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (public read access for infrastructure data)
CREATE POLICY "Substations are publicly readable" ON public.substations FOR SELECT USING (true);
CREATE POLICY "Authenticated users can modify substations" ON public.substations FOR ALL USING (auth.uid() IS NOT NULL);

CREATE POLICY "City power analysis is publicly readable" ON public.city_power_analysis FOR SELECT USING (true);
CREATE POLICY "Authenticated users can modify city power analysis" ON public.city_power_analysis FOR ALL USING (auth.uid() IS NOT NULL);

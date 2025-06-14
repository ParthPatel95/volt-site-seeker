
-- Create energy markets table
CREATE TABLE public.energy_markets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  market_name TEXT NOT NULL,
  market_code TEXT NOT NULL UNIQUE,
  region TEXT NOT NULL,
  api_endpoint TEXT,
  timezone TEXT NOT NULL DEFAULT 'UTC',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create energy rates table for real-time pricing
CREATE TABLE public.energy_rates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  market_id UUID REFERENCES public.energy_markets(id) NOT NULL,
  rate_type TEXT NOT NULL, -- 'real_time', 'day_ahead', 'demand_charge'
  price_per_mwh NUMERIC NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
  node_name TEXT,
  node_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create utility companies table
CREATE TABLE public.utility_companies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_name TEXT NOT NULL,
  service_territory TEXT NOT NULL,
  state TEXT NOT NULL,
  market_id UUID REFERENCES public.energy_markets(id),
  website_url TEXT,
  contact_info JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create utility tariffs table
CREATE TABLE public.utility_tariffs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  utility_id UUID REFERENCES public.utility_companies(id) NOT NULL,
  tariff_name TEXT NOT NULL,
  tariff_code TEXT NOT NULL,
  rate_schedule JSONB NOT NULL, -- stores complex rate structures
  demand_charge_per_kw NUMERIC,
  minimum_demand_mw NUMERIC,
  maximum_demand_mw NUMERIC,
  time_of_use_rates JSONB,
  seasonal_adjustments JSONB,
  effective_date DATE NOT NULL,
  expiration_date DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create energy cost calculations table
CREATE TABLE public.energy_cost_calculations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  property_id UUID REFERENCES public.properties(id),
  tariff_id UUID REFERENCES public.utility_tariffs(id),
  monthly_consumption_mwh NUMERIC NOT NULL,
  peak_demand_mw NUMERIC NOT NULL,
  calculated_monthly_cost NUMERIC NOT NULL,
  calculation_details JSONB,
  calculation_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Insert sample energy markets
INSERT INTO public.energy_markets (market_name, market_code, region, api_endpoint, timezone) VALUES
('Electric Reliability Council of Texas', 'ERCOT', 'Texas', 'https://api.ercot.com', 'America/Chicago'),
('PJM Interconnection', 'PJM', 'Eastern US', 'https://api.pjm.com', 'America/New_York'),
('California Independent System Operator', 'CAISO', 'California', 'https://api.caiso.com', 'America/Los_Angeles'),
('New York Independent System Operator', 'NYISO', 'New York', 'https://api.nyiso.com', 'America/New_York');

-- Insert sample utility companies
INSERT INTO public.utility_companies (company_name, service_territory, state, market_id, website_url) VALUES
('Oncor Electric Delivery', 'North Texas', 'TX', (SELECT id FROM public.energy_markets WHERE market_code = 'ERCOT'), 'https://www.oncor.com'),
('CenterPoint Energy', 'Houston Area', 'TX', (SELECT id FROM public.energy_markets WHERE market_code = 'ERCOT'), 'https://www.centerpointenergy.com'),
('Pacific Gas & Electric', 'Northern California', 'CA', (SELECT id FROM public.energy_markets WHERE market_code = 'CAISO'), 'https://www.pge.com'),
('PECO Energy', 'Philadelphia Area', 'PA', (SELECT id FROM public.energy_markets WHERE market_code = 'PJM'), 'https://www.peco.com');

-- Create indexes for performance
CREATE INDEX idx_energy_rates_market_timestamp ON public.energy_rates(market_id, timestamp DESC);
CREATE INDEX idx_energy_rates_timestamp ON public.energy_rates(timestamp DESC);
CREATE INDEX idx_utility_tariffs_utility_effective ON public.utility_tariffs(utility_id, effective_date DESC);
CREATE INDEX idx_energy_cost_calculations_property ON public.energy_cost_calculations(property_id);

-- Enable RLS on all tables
ALTER TABLE public.energy_markets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.energy_rates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.utility_companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.utility_tariffs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.energy_cost_calculations ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (public read access for market data, authenticated users for calculations)
CREATE POLICY "Energy markets are publicly readable" ON public.energy_markets FOR SELECT USING (true);
CREATE POLICY "Energy rates are publicly readable" ON public.energy_rates FOR SELECT USING (true);
CREATE POLICY "Utility companies are publicly readable" ON public.utility_companies FOR SELECT USING (true);
CREATE POLICY "Utility tariffs are publicly readable" ON public.utility_tariffs FOR SELECT USING (true);
CREATE POLICY "Users can view energy cost calculations" ON public.energy_cost_calculations FOR SELECT USING (true);
CREATE POLICY "Users can create energy cost calculations" ON public.energy_cost_calculations FOR INSERT WITH CHECK (true);

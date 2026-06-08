
-- Add last_verified to existing tables
ALTER TABLE public.alberta_carrier_pops ADD COLUMN IF NOT EXISTS last_verified DATE;
ALTER TABLE public.alberta_fiber_routes ADD COLUMN IF NOT EXISTS last_verified DATE;
ALTER TABLE public.alberta_transmission_lines ADD COLUMN IF NOT EXISTS last_verified DATE;
ALTER TABLE public.alberta_gas_pipelines ADD COLUMN IF NOT EXISTS last_verified DATE;
ALTER TABLE public.alberta_water_sources ADD COLUMN IF NOT EXISTS last_verified DATE;
ALTER TABLE public.alberta_water_licences ADD COLUMN IF NOT EXISTS last_verified DATE;
ALTER TABLE public.alberta_industrial_parks ADD COLUMN IF NOT EXISTS last_verified DATE;
ALTER TABLE public.alberta_logistics_assets ADD COLUMN IF NOT EXISTS last_verified DATE;
ALTER TABLE public.alberta_generation_assets ADD COLUMN IF NOT EXISTS last_verified DATE;
ALTER TABLE public.alberta_population_centres ADD COLUMN IF NOT EXISTS last_verified DATE;
ALTER TABLE public.alberta_municipal_incentives ADD COLUMN IF NOT EXISTS last_verified DATE;
ALTER TABLE public.cloud_regions ADD COLUMN IF NOT EXISTS last_verified DATE;
ALTER TABLE public.internet_exchanges ADD COLUMN IF NOT EXISTS last_verified DATE;

-- Workforce stats per centre
CREATE TABLE public.alberta_workforce_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  centre_name TEXT NOT NULL,
  lat DOUBLE PRECISION NOT NULL,
  lng DOUBLE PRECISION NOT NULL,
  labour_force INTEGER,
  unemployment_rate NUMERIC,
  pct_post_secondary NUMERIC,
  electricians_count INTEGER,
  hvac_techs_count INTEGER,
  it_workers_count INTEGER,
  median_wage_electrician NUMERIC,
  median_wage_it NUMERIC,
  source_url TEXT,
  last_verified DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.alberta_workforce_stats TO authenticated;
GRANT ALL ON public.alberta_workforce_stats TO service_role;
ALTER TABLE public.alberta_workforce_stats ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Read workforce stats" ON public.alberta_workforce_stats FOR SELECT TO authenticated USING (true);

-- Post-secondary institutions
CREATE TABLE public.alberta_post_secondary (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_name TEXT NOT NULL,
  city TEXT,
  lat DOUBLE PRECISION NOT NULL,
  lng DOUBLE PRECISION NOT NULL,
  program_focus TEXT[],
  annual_grads_relevant INTEGER,
  source_url TEXT,
  last_verified DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.alberta_post_secondary TO authenticated;
GRANT ALL ON public.alberta_post_secondary TO service_role;
ALTER TABLE public.alberta_post_secondary ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Read post secondary" ON public.alberta_post_secondary FOR SELECT TO authenticated USING (true);

-- Construction / EPC capacity
CREATE TABLE public.alberta_construction_capacity (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  firm_name TEXT NOT NULL,
  hq_city TEXT,
  mega_project_capable BOOLEAN DEFAULT false,
  union_status TEXT,
  recent_projects JSONB,
  source_url TEXT,
  last_verified DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.alberta_construction_capacity TO authenticated;
GRANT ALL ON public.alberta_construction_capacity TO service_role;
ALTER TABLE public.alberta_construction_capacity ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Read construction capacity" ON public.alberta_construction_capacity FOR SELECT TO authenticated USING (true);

-- Construction wages
CREATE TABLE public.alberta_construction_wages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trade TEXT NOT NULL,
  union_rate_cad_hr NUMERIC,
  open_shop_rate_cad_hr NUMERIC,
  benefits_loading_pct NUMERIC,
  source_url TEXT,
  last_verified DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.alberta_construction_wages TO authenticated;
GRANT ALL ON public.alberta_construction_wages TO service_role;
ALTER TABLE public.alberta_construction_wages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Read wages" ON public.alberta_construction_wages FOR SELECT TO authenticated USING (true);

-- Regulatory zones per municipality
CREATE TABLE public.alberta_regulatory_zones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  municipality TEXT NOT NULL,
  lat DOUBLE PRECISION NOT NULL,
  lng DOUBLE PRECISION NOT NULL,
  mill_rate_non_residential NUMERIC,
  machinery_equipment_exempt BOOLEAN,
  school_tax_rate NUMERIC,
  aer_region TEXT,
  auc_typical_permit_weeks INTEGER,
  indigenous_consultation_required BOOLEAN,
  treaty_area TEXT,
  source_url TEXT,
  last_verified DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.alberta_regulatory_zones TO authenticated;
GRANT ALL ON public.alberta_regulatory_zones TO service_role;
ALTER TABLE public.alberta_regulatory_zones ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Read regulatory zones" ON public.alberta_regulatory_zones FOR SELECT TO authenticated USING (true);

-- Carrier POP details
CREATE TABLE public.alberta_carrier_pop_details (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  facility_name TEXT NOT NULL,
  city TEXT,
  lat DOUBLE PRECISION NOT NULL,
  lng DOUBLE PRECISION NOT NULL,
  facility_type TEXT,
  open_access BOOLEAN,
  cross_connect_fee_estimate_cad NUMERIC,
  building_owner TEXT,
  carriers_on_net TEXT[],
  source_url TEXT,
  last_verified DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.alberta_carrier_pop_details TO authenticated;
GRANT ALL ON public.alberta_carrier_pop_details TO service_role;
ALTER TABLE public.alberta_carrier_pop_details ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Read pop details" ON public.alberta_carrier_pop_details FOR SELECT TO authenticated USING (true);

-- Last-mile broadband providers per centre
CREATE TABLE public.alberta_last_mile_providers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  population_centre TEXT NOT NULL,
  lat DOUBLE PRECISION NOT NULL,
  lng DOUBLE PRECISION NOT NULL,
  providers JSONB NOT NULL,
  source_url TEXT,
  last_verified DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.alberta_last_mile_providers TO authenticated;
GRANT ALL ON public.alberta_last_mile_providers TO service_role;
ALTER TABLE public.alberta_last_mile_providers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Read last mile" ON public.alberta_last_mile_providers FOR SELECT TO authenticated USING (true);

-- Dark fiber inventory
CREATE TABLE public.alberta_dark_fiber_inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  segment_name TEXT NOT NULL,
  start_lat DOUBLE PRECISION NOT NULL,
  start_lng DOUBLE PRECISION NOT NULL,
  end_lat DOUBLE PRECISION NOT NULL,
  end_lng DOUBLE PRECISION NOT NULL,
  owner TEXT,
  lit_or_dark TEXT,
  conduit_owner TEXT,
  ifa_count_estimate INTEGER,
  source_url TEXT,
  last_verified DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.alberta_dark_fiber_inventory TO authenticated;
GRANT ALL ON public.alberta_dark_fiber_inventory TO service_role;
ALTER TABLE public.alberta_dark_fiber_inventory ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Read dark fiber" ON public.alberta_dark_fiber_inventory FOR SELECT TO authenticated USING (true);

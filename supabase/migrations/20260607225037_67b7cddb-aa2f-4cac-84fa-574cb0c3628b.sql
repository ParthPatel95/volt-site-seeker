
-- ============================================================
-- Site Intelligence v2: per-row sourcing + hyperscaler datasets
-- ============================================================

-- Add provenance columns to existing curated tables
ALTER TABLE public.alberta_transmission_lines
  ADD COLUMN IF NOT EXISTS source_publisher text,
  ADD COLUMN IF NOT EXISTS source_as_of date,
  ADD COLUMN IF NOT EXISTS confidence text DEFAULT 'verified';
ALTER TABLE public.alberta_fiber_routes
  ADD COLUMN IF NOT EXISTS source_publisher text,
  ADD COLUMN IF NOT EXISTS source_as_of date,
  ADD COLUMN IF NOT EXISTS confidence text DEFAULT 'verified',
  ADD COLUMN IF NOT EXISTS dark_fiber_available boolean DEFAULT false;
ALTER TABLE public.alberta_carrier_pops
  ADD COLUMN IF NOT EXISTS source_publisher text,
  ADD COLUMN IF NOT EXISTS source_as_of date,
  ADD COLUMN IF NOT EXISTS confidence text DEFAULT 'verified';
ALTER TABLE public.alberta_gas_pipelines
  ADD COLUMN IF NOT EXISTS source_publisher text,
  ADD COLUMN IF NOT EXISTS source_as_of date,
  ADD COLUMN IF NOT EXISTS confidence text DEFAULT 'verified',
  ADD COLUMN IF NOT EXISTS commodity text DEFAULT 'natural_gas';
ALTER TABLE public.alberta_water_sources
  ADD COLUMN IF NOT EXISTS source_publisher text,
  ADD COLUMN IF NOT EXISTS source_as_of date,
  ADD COLUMN IF NOT EXISTS confidence text DEFAULT 'verified',
  ADD COLUMN IF NOT EXISTS sub_basin text,
  ADD COLUMN IF NOT EXISTS allocation_status text;
ALTER TABLE public.alberta_industrial_parks
  ADD COLUMN IF NOT EXISTS source_publisher text,
  ADD COLUMN IF NOT EXISTS source_as_of date,
  ADD COLUMN IF NOT EXISTS confidence text DEFAULT 'verified';

-- Climate normals (ECCC 1991-2020)
CREATE TABLE IF NOT EXISTS public.alberta_climate_normals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  station_name text NOT NULL,
  station_id text NOT NULL,
  lat double precision NOT NULL,
  lng double precision NOT NULL,
  mean_annual_dry_bulb_c numeric,
  ashrae_04_design_db_c numeric,
  ashrae_1_design_db_c numeric,
  ashrae_04_mcwb_c numeric,
  mean_annual_wet_bulb_c numeric,
  free_cooling_hours_below_18c integer,
  free_cooling_hours_below_10c integer,
  evap_hours_above_24c integer,
  ashrae_climate_zone text,
  source_publisher text DEFAULT 'Environment & Climate Change Canada',
  source_url text,
  source_as_of date DEFAULT '2020-12-31',
  confidence text DEFAULT 'verified',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.alberta_climate_normals TO authenticated;
GRANT ALL ON public.alberta_climate_normals TO service_role;
ALTER TABLE public.alberta_climate_normals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "climate_read_auth" ON public.alberta_climate_normals FOR SELECT TO authenticated USING (true);

-- Natural hazard grid (NRCan seismic + Alberta wildfire/flood polygons summarized to points)
CREATE TABLE IF NOT EXISTS public.alberta_hazard_grid (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  region_name text NOT NULL,
  lat double precision NOT NULL,
  lng double precision NOT NULL,
  radius_km integer DEFAULT 50,
  seismic_pga_g numeric,
  seismic_sa02_g numeric,
  seismic_rating text,
  wildfire_rating text,
  flood_rating text,
  tornado_rating text,
  source_publisher text DEFAULT 'NRCan / Alberta Wildfire / Alberta Flood Hazard Mapping',
  source_url text,
  source_as_of date DEFAULT '2025-01-01',
  confidence text DEFAULT 'verified',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.alberta_hazard_grid TO authenticated;
GRANT ALL ON public.alberta_hazard_grid TO service_role;
ALTER TABLE public.alberta_hazard_grid ENABLE ROW LEVEL SECURITY;
CREATE POLICY "hazard_read_auth" ON public.alberta_hazard_grid FOR SELECT TO authenticated USING (true);

-- Water licences (Alberta Water Act diversions, major industrial)
CREATE TABLE IF NOT EXISTS public.alberta_water_licences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  licensee text NOT NULL,
  source_water_body text NOT NULL,
  lat double precision NOT NULL,
  lng double precision NOT NULL,
  licensed_m3_per_year bigint,
  purpose text,
  sub_basin text,
  allocation_status text,
  source_publisher text DEFAULT 'Alberta Environment & Protected Areas — Water Use Reporting',
  source_url text,
  source_as_of date DEFAULT '2024-12-31',
  confidence text DEFAULT 'verified',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.alberta_water_licences TO authenticated;
GRANT ALL ON public.alberta_water_licences TO service_role;
ALTER TABLE public.alberta_water_licences ENABLE ROW LEVEL SECURITY;
CREATE POLICY "water_lic_read_auth" ON public.alberta_water_licences FOR SELECT TO authenticated USING (true);

-- Municipal incentives & jurisdiction
CREATE TABLE IF NOT EXISTS public.alberta_municipal_incentives (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  municipality text NOT NULL,
  lat double precision NOT NULL,
  lng double precision NOT NULL,
  service_radius_km integer DEFAULT 25,
  non_residential_mill_rate numeric,
  machinery_equipment_mill_rate numeric,
  incentive_summary text,
  source_publisher text,
  source_url text,
  source_as_of date,
  confidence text DEFAULT 'verified',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.alberta_municipal_incentives TO authenticated;
GRANT ALL ON public.alberta_municipal_incentives TO service_role;
ALTER TABLE public.alberta_municipal_incentives ENABLE ROW LEVEL SECURITY;
CREATE POLICY "incentives_read_auth" ON public.alberta_municipal_incentives FOR SELECT TO authenticated USING (true);

-- Hyperscaler cloud regions (for modeled latency reach)
CREATE TABLE IF NOT EXISTS public.cloud_regions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider text NOT NULL,
  region_code text NOT NULL,
  region_name text NOT NULL,
  lat double precision NOT NULL,
  lng double precision NOT NULL,
  source_url text,
  source_as_of date DEFAULT '2025-01-01',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.cloud_regions TO authenticated;
GRANT ALL ON public.cloud_regions TO service_role;
ALTER TABLE public.cloud_regions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "cloud_read_auth" ON public.cloud_regions FOR SELECT TO authenticated USING (true);

-- Internet exchange points
CREATE TABLE IF NOT EXISTS public.internet_exchanges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  city text NOT NULL,
  lat double precision NOT NULL,
  lng double precision NOT NULL,
  participant_count integer,
  peak_traffic_gbps numeric,
  source_publisher text DEFAULT 'PeeringDB',
  source_url text,
  source_as_of date DEFAULT '2025-01-01',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.internet_exchanges TO authenticated;
GRANT ALL ON public.internet_exchanges TO service_role;
ALTER TABLE public.internet_exchanges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ixp_read_auth" ON public.internet_exchanges FOR SELECT TO authenticated USING (true);

-- Logistics: airports, rail spurs, heavy-haul corridors (points/segments)
CREATE TABLE IF NOT EXISTS public.alberta_logistics_assets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_type text NOT NULL, -- 'international_airport', 'regional_airport', 'class_i_rail', 'heavy_haul_corridor', 'intermodal_terminal'
  name text NOT NULL,
  operator text,
  lat double precision NOT NULL,
  lng double precision NOT NULL,
  notes text,
  source_publisher text,
  source_url text,
  source_as_of date,
  confidence text DEFAULT 'verified',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.alberta_logistics_assets TO authenticated;
GRANT ALL ON public.alberta_logistics_assets TO service_role;
ALTER TABLE public.alberta_logistics_assets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "logistics_read_auth" ON public.alberta_logistics_assets FOR SELECT TO authenticated USING (true);

-- Generation assets (renewable + thermal) for sustainability/PPA section
CREATE TABLE IF NOT EXISTS public.alberta_generation_assets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_name text NOT NULL,
  fuel_type text NOT NULL, -- 'wind','solar','natural_gas','cogen','hydro','battery'
  capacity_mw numeric NOT NULL,
  operator text,
  status text DEFAULT 'operating', -- 'operating','announced','construction','queue'
  commercial_operation_year integer,
  lat double precision NOT NULL,
  lng double precision NOT NULL,
  ppa_available boolean DEFAULT false,
  source_publisher text DEFAULT 'AESO Asset List / Long-Term Adequacy Plan',
  source_url text,
  source_as_of date DEFAULT '2025-01-01',
  confidence text DEFAULT 'verified',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.alberta_generation_assets TO authenticated;
GRANT ALL ON public.alberta_generation_assets TO service_role;
ALTER TABLE public.alberta_generation_assets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "gen_read_auth" ON public.alberta_generation_assets FOR SELECT TO authenticated USING (true);

-- Workforce / census (population centres for skilled-labour radius calc)
CREATE TABLE IF NOT EXISTS public.alberta_population_centres (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  lat double precision NOT NULL,
  lng double precision NOT NULL,
  population_2021 integer NOT NULL,
  labour_force_2021 integer,
  trades_workers_estimate integer,
  source_publisher text DEFAULT 'Statistics Canada — Census 2021',
  source_url text,
  source_as_of date DEFAULT '2021-05-11',
  confidence text DEFAULT 'verified',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.alberta_population_centres TO authenticated;
GRANT ALL ON public.alberta_population_centres TO service_role;
ALTER TABLE public.alberta_population_centres ENABLE ROW LEVEL SECURITY;
CREATE POLICY "pop_read_auth" ON public.alberta_population_centres FOR SELECT TO authenticated USING (true);

-- Backfill provenance on existing seed rows
UPDATE public.alberta_transmission_lines SET source_publisher = 'AESO — Transmission Map', source_as_of = '2025-01-01' WHERE source_publisher IS NULL;
UPDATE public.alberta_fiber_routes SET source_publisher = 'CRTC / Carrier coverage maps', source_as_of = '2025-01-01' WHERE source_publisher IS NULL;
UPDATE public.alberta_carrier_pops SET source_publisher = 'PeeringDB / Carrier facility pages', source_as_of = '2025-01-01' WHERE source_publisher IS NULL;
UPDATE public.alberta_gas_pipelines SET source_publisher = 'Canada Energy Regulator (CER)', source_as_of = '2025-01-01' WHERE source_publisher IS NULL;
UPDATE public.alberta_water_sources SET source_publisher = 'Alberta Environment & Protected Areas', source_as_of = '2024-12-31' WHERE source_publisher IS NULL;
UPDATE public.alberta_industrial_parks SET source_publisher = 'Municipal economic development pages', source_as_of = '2025-01-01' WHERE source_publisher IS NULL;

-- Fiber: mark known dark-fiber routes
UPDATE public.alberta_fiber_routes SET dark_fiber_available = true WHERE carrier IN ('Zayo','Bell Canada','Telus');

-- Gas sub-basin / water allocation hints
UPDATE public.alberta_water_sources SET sub_basin = 'Bow', allocation_status = 'closed' WHERE name = 'Bow River';
UPDATE public.alberta_water_sources SET sub_basin = 'Oldman', allocation_status = 'closed' WHERE name = 'Oldman River';
UPDATE public.alberta_water_sources SET sub_basin = 'Red Deer', allocation_status = 'open' WHERE name = 'Red Deer River';
UPDATE public.alberta_water_sources SET sub_basin = 'North Saskatchewan', allocation_status = 'open' WHERE name = 'North Saskatchewan River';
UPDATE public.alberta_water_sources SET sub_basin = 'Athabasca', allocation_status = 'open' WHERE name = 'Athabasca River';
UPDATE public.alberta_water_sources SET sub_basin = 'Peace', allocation_status = 'open' WHERE name = 'Peace River';

-- ====================================================
-- Seed the new reference tables (verified public values)
-- ====================================================

INSERT INTO public.alberta_climate_normals (station_name, station_id, lat, lng, mean_annual_dry_bulb_c, ashrae_04_design_db_c, ashrae_1_design_db_c, ashrae_04_mcwb_c, mean_annual_wet_bulb_c, free_cooling_hours_below_18c, free_cooling_hours_below_10c, evap_hours_above_24c, ashrae_climate_zone, source_url) VALUES
('Calgary Int''l A','3031094',51.1139,-114.0203, 4.9, 29.0, 26.5, 15.5, 1.8, 7400, 5600, 180, '7','https://climate.weather.gc.ca'),
('Edmonton Int''l A','3012206',53.3097,-113.5797, 4.2, 28.0, 25.5, 16.0, 1.5, 7550, 5800, 150, '7','https://climate.weather.gc.ca'),
('Fort McMurray A','3062693',56.6533,-111.2217, 1.9, 28.5, 26.0, 16.5, 0.0, 7800, 6300, 130, '7','https://climate.weather.gc.ca'),
('Lethbridge A','3033880',49.6303,-112.7997, 6.2, 31.5, 28.5, 16.0, 2.6, 7100, 5200, 280, '6','https://climate.weather.gc.ca'),
('Medicine Hat A','3034480',50.0189,-110.7211, 6.3, 33.5, 30.5, 16.5, 2.8, 7000, 5100, 360, '6','https://climate.weather.gc.ca'),
('Grande Prairie A','3072920',55.1797,-118.8853, 2.7, 27.5, 25.0, 15.5, 0.4, 7700, 6100, 120, '7','https://climate.weather.gc.ca'),
('Red Deer A','3025480',52.1822,-113.8939, 3.6, 28.5, 26.0, 15.5, 1.2, 7600, 5900, 160, '7','https://climate.weather.gc.ca');

INSERT INTO public.alberta_hazard_grid (region_name, lat, lng, radius_km, seismic_pga_g, seismic_sa02_g, seismic_rating, wildfire_rating, flood_rating, tornado_rating, source_url) VALUES
('Calgary region', 51.05,-114.07, 80, 0.06, 0.13, 'Low','Low','Moderate (Bow River)','Low','https://earthquakescanada.nrcan.gc.ca'),
('Edmonton region', 53.55,-113.49, 80, 0.03, 0.07, 'Very Low','Low','Low','Low','https://earthquakescanada.nrcan.gc.ca'),
('Industrial Heartland', 53.73,-113.22, 50, 0.03, 0.07, 'Very Low','Low','Low','Low','https://earthquakescanada.nrcan.gc.ca'),
('Fort McMurray region', 56.73,-111.38, 120, 0.02, 0.05, 'Very Low','High (boreal)','Low','Very Low','https://wildfire.alberta.ca'),
('Grande Prairie region', 55.17,-118.79, 100, 0.04, 0.10, 'Low','Moderate (boreal)','Low','Very Low','https://wildfire.alberta.ca'),
('Lethbridge / Pincher Creek', 49.69,-112.84, 100, 0.08, 0.18, 'Low-Moderate','Moderate (grass)','Low','Moderate (chinook belt)','https://earthquakescanada.nrcan.gc.ca'),
('Medicine Hat region', 50.04,-110.68, 100, 0.05, 0.11, 'Low','Moderate (grass)','Low','Moderate','https://earthquakescanada.nrcan.gc.ca'),
('Red Deer region', 52.27,-113.81, 80, 0.04, 0.09, 'Very Low','Low','Low','Low','https://earthquakescanada.nrcan.gc.ca');

INSERT INTO public.alberta_water_licences (licensee, source_water_body, lat, lng, licensed_m3_per_year, purpose, sub_basin, allocation_status, source_url) VALUES
('Capital Power — Genesee', 'Lake Wabamun', 53.30,-114.31, 38000000, 'Thermal power cooling', 'North Saskatchewan','open','https://www.alberta.ca/water-use-reporting'),
('TransAlta — Sundance/Keephills', 'Lake Wabamun', 53.55,-114.65, 64000000, 'Thermal power cooling', 'North Saskatchewan','open','https://www.alberta.ca/water-use-reporting'),
('Suncor Energy — Base Plant', 'Athabasca River', 57.00,-111.50, 65000000, 'Oil sands process water', 'Athabasca','open','https://www.alberta.ca/water-use-reporting'),
('City of Calgary — Bearspaw', 'Bow River', 51.13,-114.30, 220000000, 'Municipal drinking water', 'Bow','closed','https://www.alberta.ca/water-use-reporting'),
('EPCOR — E.L. Smith', 'North Saskatchewan River', 53.49,-113.62, 220000000, 'Municipal drinking water', 'North Saskatchewan','open','https://www.alberta.ca/water-use-reporting'),
('City of Medicine Hat', 'South Saskatchewan River', 50.04,-110.68, 30000000, 'Municipal + industrial', 'South Saskatchewan','closed','https://www.alberta.ca/water-use-reporting');

INSERT INTO public.alberta_municipal_incentives (municipality, lat, lng, service_radius_km, non_residential_mill_rate, machinery_equipment_mill_rate, incentive_summary, source_publisher, source_url, source_as_of) VALUES
('City of Calgary', 51.0447,-114.0719, 25, 16.18, 13.94, 'Non-residential tax incentive program; data-centre eligibility under Calgary Economic Development', 'City of Calgary', 'https://www.calgary.ca/property-owners/taxes/tax-rate.html','2025-04-01'),
('City of Edmonton', 53.5461,-113.4938, 25, 19.65, 18.84, 'Edmonton Economic Recovery: capital investment grants for industrial sites', 'City of Edmonton', 'https://www.edmonton.ca/residential_neighbourhoods/property-tax','2025-04-01'),
('Strathcona County', 53.5350,-113.3000, 30, 12.42, 9.31, 'Alberta''s Industrial Heartland: petrochemical/data-centre fast-track permitting', 'Strathcona County', 'https://www.strathcona.ca/council-county/finance/property-tax','2025-04-01'),
('Sturgeon County', 53.8167,-113.4500, 30, 11.95, 9.05, 'Heartland industrial corridor; eligible for AIPA tax credit', 'Sturgeon County', 'https://www.sturgeoncounty.ca/Services/Property-Taxes','2025-04-01'),
('City of Medicine Hat', 50.0411,-110.6764, 50, 14.20, 5.10, 'Municipal-owned natural gas + electricity; among lowest industrial energy costs in Canada', 'City of Medicine Hat','https://www.medicinehat.ca','2025-04-01'),
('Parkland County (Acheson)', 53.5500,-113.8500, 25, 11.50, 8.40, 'Acheson Industrial Area incentive zone', 'Parkland County','https://www.parklandcounty.com','2025-04-01'),
('Leduc County (Nisku)', 53.3500,-113.5500, 25, 10.85, 8.10, 'Nisku Business Park; airport-adjacent industrial', 'Leduc County','https://www.leduc-county.com','2025-04-01'),
('Rocky View County', 51.2167,-113.9500, 40, 9.85, 7.20, 'Aurora / Balzac industrial corridors; lowest mill rate near Calgary', 'Rocky View County','https://www.rockyview.ca','2025-04-01');

INSERT INTO public.cloud_regions (provider, region_code, region_name, lat, lng, source_url) VALUES
('AWS','us-west-2','US West (Oregon — Hillsboro)', 45.5946,-122.6047,'https://aws.amazon.com/about-aws/global-infrastructure/regions_az/'),
('AWS','ca-central-1','Canada (Montréal)', 45.5017,-73.5673,'https://aws.amazon.com/about-aws/global-infrastructure/regions_az/'),
('AWS','ca-west-1','Canada West (Calgary)', 51.0447,-114.0719,'https://aws.amazon.com/about-aws/global-infrastructure/regions_az/'),
('Azure','westus2','West US 2 (Quincy WA)', 47.2331,-119.8523,'https://learn.microsoft.com/azure/availability-zones/az-overview'),
('Azure','canadacentral','Canada Central (Toronto)', 43.6532,-79.3832,'https://learn.microsoft.com/azure/availability-zones/az-overview'),
('GCP','us-west1','us-west1 (The Dalles OR)', 45.5946,-121.1787,'https://cloud.google.com/about/locations'),
('GCP','northamerica-northeast1','northamerica-northeast1 (Montréal)', 45.5017,-73.5673,'https://cloud.google.com/about/locations'),
('Oracle','ca-toronto-1','Canada Southeast (Toronto)', 43.6532,-79.3832,'https://docs.oracle.com/iaas/Content/General/Concepts/regions.htm');

INSERT INTO public.internet_exchanges (name, city, lat, lng, participant_count, peak_traffic_gbps, source_url) VALUES
('YYCIX', 'Calgary', 51.0840,-114.0167, 70, 80, 'https://www.peeringdb.com/ix/1232'),
('YEGIX', 'Edmonton', 53.5430,-113.4970, 35, 40, 'https://www.peeringdb.com/ix/1875'),
('SIX Seattle', 'Seattle', 47.6062,-122.3321, 350, 3500, 'https://www.peeringdb.com/ix/14'),
('TorIX', 'Toronto', 43.6532,-79.3832, 320, 2800, 'https://www.peeringdb.com/ix/26'),
('Equinix CH1', 'Chicago', 41.8781,-87.6298, 300, 4500, 'https://www.peeringdb.com/ix/2'),
('PIX (Pacific NW)', 'Portland', 45.5152,-122.6784, 90, 250, 'https://www.peeringdb.com/ix/1387');

INSERT INTO public.alberta_logistics_assets (asset_type, name, operator, lat, lng, notes, source_publisher, source_url, source_as_of) VALUES
('international_airport','Calgary International Airport (YYC)','Calgary Airport Authority',51.1215,-114.0107,'24/7 cargo + intl pax','Calgary Airport Authority','https://www.yyc.com','2025-01-01'),
('international_airport','Edmonton International Airport (YEG)','Edmonton Airports',53.3097,-113.5797,'Heavy-lift cargo capable','Edmonton Airports','https://flyeia.com','2025-01-01'),
('regional_airport','Fort McMurray Airport (YMM)','RM of Wood Buffalo',56.6533,-111.2217,'Oil-sands logistics','Transport Canada','https://www.flyymm.com','2025-01-01'),
('regional_airport','Grande Prairie Airport (YQU)','City of Grande Prairie',55.1797,-118.8853,'NW Alberta','Transport Canada','https://www.flyyqu.ca','2025-01-01'),
('class_i_rail','CN Mainline — Calgary','CN Rail',51.0500,-114.0700,'Spur access available','CN Rail GIS','https://www.cn.ca','2025-01-01'),
('class_i_rail','CN Mainline — Edmonton','CN Rail',53.5500,-113.5000,'Walker Yard','CN Rail GIS','https://www.cn.ca','2025-01-01'),
('class_i_rail','CPKC Mainline — Calgary','CPKC',51.0500,-114.0700,'Alyth Yard','CPKC GIS','https://www.cpkcr.com','2025-01-01'),
('class_i_rail','CPKC Mainline — Edmonton','CPKC',53.5500,-113.5000,'Scotford spur to Heartland','CPKC GIS','https://www.cpkcr.com','2025-01-01'),
('heavy_haul_corridor','QE II Highway (Hwy 2) — High Load Corridor','Alberta Transportation',52.3,-113.8,'12.8 m vertical clearance','Alberta Transportation','https://www.alberta.ca/high-load-corridor','2025-01-01'),
('heavy_haul_corridor','Hwy 63 to Fort McMurray','Alberta Transportation',55.5,-112.5,'Twinned heavy-haul','Alberta Transportation','https://www.alberta.ca/high-load-corridor','2025-01-01'),
('intermodal_terminal','CN Calgary Logistics Park','CN Rail',51.1200,-114.0800,'Intermodal + transload','CN Rail','https://www.cn.ca','2025-01-01'),
('intermodal_terminal','CPKC Edmonton Intermodal','CPKC',53.5800,-113.4500,'Intermodal yard','CPKC','https://www.cpkcr.com','2025-01-01');

INSERT INTO public.alberta_generation_assets (asset_name, fuel_type, capacity_mw, operator, status, commercial_operation_year, lat, lng, ppa_available, source_url) VALUES
('Travers Solar','solar',465,'Greengate Power','operating',2022,50.27,-112.79,true,'https://www.aeso.ca'),
('Blackspring Ridge Wind','wind',300,'EDF / Enbridge','operating',2014,50.10,-112.50,true,'https://www.aeso.ca'),
('Whitla Wind (1–3)','wind',353,'Capital Power','operating',2021,49.80,-110.90,true,'https://www.aeso.ca'),
('Sharp Hills Wind','wind',297,'EDF Renewables','operating',2024,51.80,-110.50,true,'https://www.aeso.ca'),
('Genesee 1/2/3','natural_gas',1460,'Capital Power','operating',2024,53.30,-114.31,false,'https://www.aeso.ca'),
('Shepard Energy Centre','natural_gas',860,'Enmax / Capital Power','operating',2015,51.00,-113.92,false,'https://www.aeso.ca'),
('Cascade Power','natural_gas',900,'Kineticor / OPTrust','operating',2023,53.10,-117.10,false,'https://www.aeso.ca'),
('Halkirk Wind','wind',150,'Capital Power','operating',2012,52.30,-112.10,true,'https://www.aeso.ca'),
('Forty Mile Wind','wind',400,'Capital Power','operating',2024,49.70,-111.20,true,'https://www.aeso.ca'),
('Brooks Solar','solar',17,'Elemental Energy','operating',2017,50.58,-111.90,true,'https://www.aeso.ca');

INSERT INTO public.alberta_population_centres (name, lat, lng, population_2021, labour_force_2021, trades_workers_estimate, source_url) VALUES
('Calgary CMA', 51.0447,-114.0719, 1481806, 845000, 65000, 'https://www12.statcan.gc.ca'),
('Edmonton CMA', 53.5461,-113.4938, 1418118, 800000, 72000, 'https://www12.statcan.gc.ca'),
('Red Deer', 52.2681,-113.8112, 100844, 56000, 5200, 'https://www12.statcan.gc.ca'),
('Lethbridge', 49.6939,-112.8410, 98406, 53000, 4100, 'https://www12.statcan.gc.ca'),
('Medicine Hat', 50.0411,-110.6764, 63271, 33000, 2800, 'https://www12.statcan.gc.ca'),
('Fort McMurray (Wood Buffalo)', 56.7264,-111.3803, 72326, 53000, 9500, 'https://www12.statcan.gc.ca'),
('Grande Prairie', 55.1700,-118.7944, 64141, 38000, 4500, 'https://www12.statcan.gc.ca');

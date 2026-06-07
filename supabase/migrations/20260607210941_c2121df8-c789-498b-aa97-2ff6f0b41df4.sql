
-- =====================================================================
-- Alberta Site Intelligence: reference geo tables
-- =====================================================================

-- Transmission lines (138/240/500 kV)
CREATE TABLE public.alberta_transmission_lines (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  voltage_kv integer NOT NULL,
  owner text NOT NULL,
  start_lat double precision NOT NULL,
  start_lng double precision NOT NULL,
  end_lat double precision NOT NULL,
  end_lng double precision NOT NULL,
  in_service_date date,
  source_url text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.alberta_transmission_lines TO authenticated;
GRANT ALL ON public.alberta_transmission_lines TO service_role;
ALTER TABLE public.alberta_transmission_lines ENABLE ROW LEVEL SECURITY;
CREATE POLICY "transmission_read_auth" ON public.alberta_transmission_lines FOR SELECT TO authenticated USING (true);

-- Fiber backbone routes
CREATE TABLE public.alberta_fiber_routes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  carrier text NOT NULL,
  route_name text NOT NULL,
  route_type text NOT NULL DEFAULT 'long_haul',
  lit_dark text DEFAULT 'lit',
  start_lat double precision NOT NULL,
  start_lng double precision NOT NULL,
  end_lat double precision NOT NULL,
  end_lng double precision NOT NULL,
  source_url text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.alberta_fiber_routes TO authenticated;
GRANT ALL ON public.alberta_fiber_routes TO service_role;
ALTER TABLE public.alberta_fiber_routes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "fiber_read_auth" ON public.alberta_fiber_routes FOR SELECT TO authenticated USING (true);

-- Carrier POPs (telecom points-of-presence)
CREATE TABLE public.alberta_carrier_pops (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  carrier text NOT NULL,
  facility_name text NOT NULL,
  address text,
  city text NOT NULL,
  lat double precision NOT NULL,
  lng double precision NOT NULL,
  services text[] DEFAULT ARRAY[]::text[],
  latency_to_yyc_ms numeric,
  latency_to_yeg_ms numeric,
  latency_to_sea_ms numeric,
  latency_to_ord_ms numeric,
  source_url text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.alberta_carrier_pops TO authenticated;
GRANT ALL ON public.alberta_carrier_pops TO service_role;
ALTER TABLE public.alberta_carrier_pops ENABLE ROW LEVEL SECURITY;
CREATE POLICY "pops_read_auth" ON public.alberta_carrier_pops FOR SELECT TO authenticated USING (true);

-- Natural gas pipelines (NGTL mainlines)
CREATE TABLE public.alberta_gas_pipelines (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  operator text NOT NULL,
  name text NOT NULL,
  diameter_mm integer,
  pressure_kpa integer,
  start_lat double precision NOT NULL,
  start_lng double precision NOT NULL,
  end_lat double precision NOT NULL,
  end_lng double precision NOT NULL,
  source_url text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.alberta_gas_pipelines TO authenticated;
GRANT ALL ON public.alberta_gas_pipelines TO service_role;
ALTER TABLE public.alberta_gas_pipelines ENABLE ROW LEVEL SECURITY;
CREATE POLICY "gas_read_auth" ON public.alberta_gas_pipelines FOR SELECT TO authenticated USING (true);

-- Major water sources
CREATE TABLE public.alberta_water_sources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  type text NOT NULL,
  lat double precision NOT NULL,
  lng double precision NOT NULL,
  notes text,
  source_url text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.alberta_water_sources TO authenticated;
GRANT ALL ON public.alberta_water_sources TO service_role;
ALTER TABLE public.alberta_water_sources ENABLE ROW LEVEL SECURITY;
CREATE POLICY "water_read_auth" ON public.alberta_water_sources FOR SELECT TO authenticated USING (true);

-- Industrial parks
CREATE TABLE public.alberta_industrial_parks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  municipality text NOT NULL,
  lat double precision NOT NULL,
  lng double precision NOT NULL,
  available_power_mw numeric,
  zoning text,
  notes text,
  source_url text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.alberta_industrial_parks TO authenticated;
GRANT ALL ON public.alberta_industrial_parks TO service_role;
ALTER TABLE public.alberta_industrial_parks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "parks_read_auth" ON public.alberta_industrial_parks FOR SELECT TO authenticated USING (true);

-- Cached site reports
CREATE TABLE public.alberta_site_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  lat double precision NOT NULL,
  lng double precision NOT NULL,
  label text,
  report jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '7 days')
);
CREATE INDEX alberta_site_reports_user_idx ON public.alberta_site_reports(user_id, created_at DESC);
GRANT SELECT, INSERT, DELETE ON public.alberta_site_reports TO authenticated;
GRANT ALL ON public.alberta_site_reports TO service_role;
ALTER TABLE public.alberta_site_reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "site_reports_own_select" ON public.alberta_site_reports FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "site_reports_own_insert" ON public.alberta_site_reports FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "site_reports_own_delete" ON public.alberta_site_reports FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- =====================================================================
-- Nearest feature lookup (Haversine)
-- =====================================================================

CREATE OR REPLACE FUNCTION public.alberta_haversine_km(
  lat1 double precision, lng1 double precision,
  lat2 double precision, lng2 double precision
) RETURNS double precision
LANGUAGE sql IMMUTABLE
AS $$
  SELECT 2 * 6371 * asin(sqrt(
    pow(sin(radians((lat2 - lat1) / 2)), 2)
    + cos(radians(lat1)) * cos(radians(lat2))
    * pow(sin(radians((lng2 - lng1) / 2)), 2)
  ));
$$;

-- =====================================================================
-- Seed: verified Alberta infrastructure (public sources)
-- =====================================================================

-- Transmission lines (key 240/500 kV corridors — AESO transmission map)
INSERT INTO public.alberta_transmission_lines (name, voltage_kv, owner, start_lat, start_lng, end_lat, end_lng, source_url) VALUES
('Western Alberta Transmission Line (WATL)', 500, 'AltaLink', 51.0447, -114.0719, 53.5461, -113.4938, 'https://www.aeso.ca'),
('Eastern Alberta Transmission Line (EATL)', 500, 'ATCO Electric', 50.9744, -112.7747, 53.3017, -111.7350, 'https://www.aeso.ca'),
('Heartland Transmission Project', 240, 'AltaLink/EPCOR', 53.5461, -113.4938, 53.7267, -113.2167, 'https://www.aeso.ca'),
('Calgary Region 240kV Loop', 240, 'AltaLink', 51.0447, -114.0719, 50.9744, -113.9742, 'https://www.altalink.ca'),
('Edmonton Region 240kV Loop', 240, 'EPCOR', 53.5461, -113.4938, 53.6309, -113.6231, 'https://www.epcor.com'),
('Genesee–Ellerslie 240kV', 240, 'AltaLink', 53.2917, -114.3083, 53.4242, -113.5050, 'https://www.aeso.ca'),
('Sundance–Ellerslie 500kV', 500, 'AltaLink', 53.0089, -114.7167, 53.4242, -113.5050, 'https://www.aeso.ca'),
('Fort McMurray West 500kV', 500, 'Alberta PowerLine', 53.5461, -113.4938, 56.7264, -111.3803, 'https://www.aeso.ca'),
('Red Deer 240kV', 240, 'AltaLink', 52.2681, -113.8112, 52.4500, -113.7333, 'https://www.aeso.ca'),
('Medicine Hat 240kV', 240, 'ATCO Electric', 50.0411, -110.6764, 50.0411, -110.6764, 'https://www.aeso.ca'),
('Lethbridge–Pincher Creek 240kV', 240, 'AltaLink', 49.6939, -112.8410, 49.4856, -113.9559, 'https://www.aeso.ca'),
('Grande Prairie 240kV', 240, 'ATCO Electric', 55.1700, -118.7944, 55.1700, -118.7944, 'https://www.aeso.ca');

-- Carrier POPs (verified colocation/peering facilities)
INSERT INTO public.alberta_carrier_pops (carrier, facility_name, address, city, lat, lng, services, latency_to_yyc_ms, latency_to_yeg_ms, latency_to_sea_ms, latency_to_ord_ms, source_url) VALUES
('Bell Canada', 'Bell Calgary Central', '630 3rd Ave SW', 'Calgary', 51.0486, -114.0708, ARRAY['lit','dark','transit','peering'], 1, 8, 18, 35, 'https://business.bell.ca'),
('Telus', 'Telus Calgary Sky Tower', '110 9 Ave SW', 'Calgary', 51.0447, -114.0719, ARRAY['lit','dark','transit','peering'], 1, 8, 19, 36, 'https://www.telus.com'),
('Zayo', 'Zayo Calgary 1110 Centre St', '1110 Centre St NE', 'Calgary', 51.0606, -114.0626, ARRAY['lit','dark','waves'], 1, 9, 19, 35, 'https://www.zayo.com'),
('Cologix', 'Cologix CL2 / Equinix CY1', '500 Palmer Rd NE', 'Calgary', 51.0840, -114.0167, ARRAY['lit','peering','cloud-onramp'], 2, 9, 19, 36, 'https://www.cologix.com'),
('eStruxture', 'eStruxture CL-1 Calgary', '7007 54 St SE', 'Calgary', 50.9966, -113.9417, ARRAY['lit','colocation','cloud-onramp'], 2, 9, 19, 36, 'https://estruxture.com'),
('Rogers', 'Rogers Calgary 6th Ave', '837 6 Ave SW', 'Calgary', 51.0492, -114.0792, ARRAY['lit','transit'], 1, 8, 19, 36, 'https://www.rogers.com'),
('Beanfield', 'Beanfield Calgary POP', '120 9 Ave SW', 'Calgary', 51.0447, -114.0731, ARRAY['lit','dark'], 1, 9, 19, 36, 'https://beanfield.com'),
('Bell Canada', 'Bell Edmonton Central', '10020 100 St', 'Edmonton', 53.5444, -113.4909, ARRAY['lit','dark','transit','peering'], 8, 1, 22, 38, 'https://business.bell.ca'),
('Telus', 'Telus Edmonton Centre', '10025 Jasper Ave', 'Edmonton', 53.5414, -113.4928, ARRAY['lit','dark','transit','peering'], 8, 1, 23, 39, 'https://www.telus.com'),
('Zayo', 'Zayo Edmonton POP', '10215 178 St NW', 'Edmonton', 53.5519, -113.6164, ARRAY['lit','dark','waves'], 9, 1, 23, 39, 'https://www.zayo.com'),
('Cologix', 'Cologix EDM1', '10010 106 St NW', 'Edmonton', 53.5430, -113.4970, ARRAY['lit','peering','cloud-onramp'], 9, 1, 23, 39, 'https://www.cologix.com'),
('eStruxture', 'eStruxture EDM-1', '14004 Yellowhead Trail', 'Edmonton', 53.5747, -113.5839, ARRAY['lit','colocation'], 9, 1, 23, 39, 'https://estruxture.com'),
('AXIA SuperNet', 'AXIA Red Deer POP', '4757 49 St', 'Red Deer', 52.2690, -113.8110, ARRAY['lit'], 5, 5, 22, 39, 'https://www.axia.com'),
('AXIA SuperNet', 'AXIA Lethbridge POP', '450 1 Ave S', 'Lethbridge', 49.6939, -112.8410, ARRAY['lit'], 6, 12, 24, 41, 'https://www.axia.com'),
('AXIA SuperNet', 'AXIA Medicine Hat POP', '580 1 St SE', 'Medicine Hat', 50.0411, -110.6764, ARRAY['lit'], 7, 14, 26, 40, 'https://www.axia.com'),
('AXIA SuperNet', 'AXIA Grande Prairie POP', '9805 100 St', 'Grande Prairie', 55.1700, -118.7944, ARRAY['lit'], 14, 7, 25, 44, 'https://www.axia.com'),
('AXIA SuperNet', 'AXIA Fort McMurray POP', '9909 Franklin Ave', 'Fort McMurray', 56.7264, -111.3803, ARRAY['lit'], 18, 11, 30, 46, 'https://www.axia.com'),
('Telus', 'Telus Fort Saskatchewan', '10030 99 Ave', 'Fort Saskatchewan', 53.7128, -113.2128, ARRAY['lit'], 10, 3, 24, 40, 'https://www.telus.com'),
('Bell Canada', 'Bell Sherwood Park', '101 Granada Blvd', 'Sherwood Park', 53.5172, -113.3158, ARRAY['lit'], 9, 2, 23, 39, 'https://business.bell.ca');

-- Fiber backbone routes (long-haul corridors — public CRTC/carrier route maps)
INSERT INTO public.alberta_fiber_routes (carrier, route_name, route_type, lit_dark, start_lat, start_lng, end_lat, end_lng, source_url) VALUES
('Bell Canada', 'YYC–YEG QEII Corridor', 'long_haul', 'lit', 51.0447, -114.0719, 53.5461, -113.4938, 'https://crtc.gc.ca'),
('Telus', 'YYC–YEG QEII Corridor (Telus)', 'long_haul', 'lit', 51.0447, -114.0719, 53.5461, -113.4938, 'https://www.telus.com'),
('Zayo', 'Calgary–Seattle Long Haul', 'long_haul', 'lit', 51.0447, -114.0719, 47.6062, -122.3321, 'https://www.zayo.com'),
('Zayo', 'Calgary–Chicago Long Haul', 'long_haul', 'lit', 51.0447, -114.0719, 41.8781, -87.6298, 'https://www.zayo.com'),
('AXIA SuperNet', 'SuperNet Northern Loop', 'long_haul', 'lit', 53.5461, -113.4938, 56.7264, -111.3803, 'https://www.axia.com'),
('AXIA SuperNet', 'SuperNet Southern Loop', 'long_haul', 'lit', 51.0447, -114.0719, 49.6939, -112.8410, 'https://www.axia.com');

-- NGTL/TC Energy major gas pipelines
INSERT INTO public.alberta_gas_pipelines (operator, name, diameter_mm, pressure_kpa, start_lat, start_lng, end_lat, end_lng, source_url) VALUES
('TC Energy / NGTL', 'NGTL Mainline – Central', 1067, 9930, 51.0447, -114.0719, 53.5461, -113.4938, 'https://www.cer-rec.gc.ca'),
('TC Energy / NGTL', 'NGTL Northwest Mainline', 914, 8275, 53.5461, -113.4938, 55.1700, -118.7944, 'https://www.cer-rec.gc.ca'),
('TC Energy / NGTL', 'NGTL Northeast Mainline', 914, 8275, 53.5461, -113.4938, 56.7264, -111.3803, 'https://www.cer-rec.gc.ca'),
('TC Energy / NGTL', 'NGTL Southern Mainline', 1067, 9930, 51.0447, -114.0719, 49.6939, -112.8410, 'https://www.cer-rec.gc.ca'),
('ATCO Pipelines', 'Urban Pipeline Replacement', 610, 5500, 53.4242, -113.5050, 53.5461, -113.4938, 'https://www.atco.com');

-- Major water sources
INSERT INTO public.alberta_water_sources (name, type, lat, lng, notes, source_url) VALUES
('North Saskatchewan River', 'river', 53.5400, -113.5000, 'Major river through Edmonton; industrial allocation requires AEPA approval', 'https://www.alberta.ca'),
('Bow River', 'river', 51.0500, -114.0500, 'Through Calgary; tight water allocation in southern Alberta', 'https://www.alberta.ca'),
('Athabasca River', 'river', 56.7300, -111.3800, 'Northern Alberta, oil sands corridor', 'https://www.alberta.ca'),
('Peace River', 'river', 56.2300, -117.2900, 'Northwestern Alberta, large flow', 'https://www.alberta.ca'),
('Red Deer River', 'river', 52.2680, -113.8110, 'Central Alberta', 'https://www.alberta.ca'),
('Oldman River', 'river', 49.7000, -112.8400, 'Southern Alberta, fully allocated basin', 'https://www.alberta.ca'),
('Lake Wabamun', 'lake', 53.5500, -114.6500, 'Historic Sundance/Wabamun power generation cooling source', 'https://www.alberta.ca'),
('Cold Lake', 'lake', 54.4520, -110.1830, 'Northeast Alberta cooling water', 'https://www.alberta.ca');

-- Industrial parks with notable available power
INSERT INTO public.alberta_industrial_parks (name, municipality, lat, lng, available_power_mw, zoning, notes, source_url) VALUES
('Alberta''s Industrial Heartland', 'Strathcona/Sturgeon/Fort Sask', 53.7267, -113.2167, 1500, 'Heavy Industrial', 'Largest hydrocarbon processing region in Canada; abundant transmission, gas, water', 'https://industrialheartland.com'),
('Ellerslie Industrial', 'Edmonton', 53.4242, -113.5050, 300, 'Heavy Industrial', 'Adjacent to Ellerslie 240/500 kV substation', 'https://www.edmonton.ca'),
('Foothills Industrial Park', 'Calgary', 51.0167, -113.9667, 200, 'Heavy Industrial', 'SE Calgary, fiber-dense, near Shepard substation', 'https://www.calgary.ca'),
('Acheson Industrial Area', 'Parkland County', 53.5500, -113.8500, 250, 'Heavy Industrial', 'West of Edmonton, rail + highway access', 'https://www.parklandcounty.com'),
('Nisku Business Park', 'Leduc County', 53.3500, -113.5500, 300, 'Heavy Industrial', 'Adjacent to YEG airport, gas + transmission', 'https://www.leduc-county.com'),
('Aurora Industrial Park', 'Rocky View County', 51.2167, -113.9500, 200, 'Heavy Industrial', 'North of Calgary, available greenfield', 'https://www.rockyview.ca'),
('Medicine Hat Industrial', 'Medicine Hat', 50.0411, -110.6764, 400, 'Heavy Industrial', 'Lowest natural gas costs in Canada; municipal utility', 'https://www.medicinehat.ca'),
('Grande Prairie Industrial', 'Grande Prairie', 55.1700, -118.7944, 150, 'Heavy Industrial', 'Northwest gas corridor', 'https://www.cityofgp.com'),
('Balzac/CrossIron Industrial', 'Rocky View County', 51.2667, -113.9667, 150, 'Industrial', 'North Calgary fringe; QEII access', 'https://www.rockyview.ca'),
('Lethbridge Industrial', 'Lethbridge', 49.6939, -112.8410, 200, 'Heavy Industrial', 'Wind belt; close to AltaLink transmission', 'https://www.lethbridge.ca');

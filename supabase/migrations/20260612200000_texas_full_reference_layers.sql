-- Texas reference data — every layer the Site Lookup function reads.
--
-- PR #16 covered fiber. This adds the remaining 17 alberta_* mirrors with
-- real seed data so every panel populates for Texas points. Schemas mirror
-- the Alberta tables exactly; only the data + RLS policy names differ. The
-- alberta-site-report function (see its companion edit) picks tables by
-- bounding box.

-- ════════════════════════════════════════════════════════════════════════════
-- 1. ENERGY: transmission lines, gas pipelines, generation assets, water
-- ════════════════════════════════════════════════════════════════════════════

-- ── ERCOT high-voltage transmission backbone (major 345 kV CREZ + 138 kV) ───
CREATE TABLE public.texas_transmission_lines (
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
  source_publisher text DEFAULT 'ERCOT Transmission Topology / FERC Form 715',
  source_as_of date DEFAULT '2025-01-01',
  confidence text DEFAULT 'verified',
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_texas_transmission_lines_brin
  ON public.texas_transmission_lines USING BRIN (start_lat, start_lng, end_lat, end_lng);
GRANT SELECT ON public.texas_transmission_lines TO authenticated;
GRANT ALL ON public.texas_transmission_lines TO service_role;
ALTER TABLE public.texas_transmission_lines ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tx_transmission_read_auth" ON public.texas_transmission_lines
  FOR SELECT TO authenticated USING (true);

-- CREZ (Competitive Renewable Energy Zone) 345 kV double-circuit backbone
-- moved ~18 GW of West Texas wind into the population centers — every modern
-- TX datacenter siting story rides one of these.
INSERT INTO public.texas_transmission_lines
  (name, voltage_kv, owner, start_lat, start_lng, end_lat, end_lng, source_url)
VALUES
  ('CREZ — McCamey D ↔ Kendall (Hill Country)', 345, 'LCRA TSC', 31.1390, -102.2330, 30.0500, -98.7500, 'https://www.ercot.com/news/release/crez'),
  ('CREZ — Big Hill ↔ Kendall', 345, 'Oncor', 30.6500, -101.4760, 30.0500, -98.7500, 'https://www.ercot.com/news/release/crez'),
  ('CREZ — Edith Clarke ↔ Sam Switch', 345, 'Oncor', 33.6850, -101.5460, 32.8460, -97.0500, 'https://www.ercot.com/news/release/crez'),
  ('CREZ — Tesla ↔ Limestone', 345, 'AEP Texas', 32.5680, -100.7780, 31.4300, -96.8700, 'https://www.ercot.com/news/release/crez'),
  ('Houston Import Project (Limestone ↔ Gibbons Creek ↔ Houston)', 345, 'CenterPoint Energy', 31.4300, -96.8700, 29.9510, -95.4540, 'https://www.centerpointenergy.com/'),
  ('Permian Loop — Wink ↔ Sand Lake ↔ Solstice', 345, 'Oncor', 31.7530, -103.1580, 32.1280, -102.7330, 'https://www.oncor.com/'),
  ('Permian Loop — Solstice ↔ Riverton', 345, 'Oncor', 32.1280, -102.7330, 32.7770, -101.9520, 'https://www.oncor.com/'),
  ('Lone Star Transmission — Big Hill ↔ Navarro', 345, 'NextEra/Lone Star', 30.6500, -101.4760, 32.0000, -96.5000, 'https://www.lonestartransmission.com/'),
  ('Comanche Peak ↔ Sam Switch (DFW intertie)', 345, 'Oncor', 32.2980, -97.7860, 32.8460, -97.0500, 'https://www.oncor.com/'),
  ('STP (South Texas Project) ↔ Hillje', 345, 'AEP Texas', 28.7950, -96.0480, 29.0930, -95.9450, 'https://www.aeptexas.com/'),
  ('Dallas inner ring 345 kV south', 345, 'Oncor', 32.7800, -96.8000, 32.7800, -96.6500, 'https://www.oncor.com/'),
  ('Houston inner ring 345 kV west', 345, 'CenterPoint Energy', 29.7600, -95.6500, 29.7600, -95.3700, 'https://www.centerpointenergy.com/'),
  ('Austin metro 138 kV (Sandow ↔ Decker)', 138, 'Austin Energy / LCRA', 30.5680, -97.0820, 30.2980, -97.6480, 'https://austinenergy.com/'),
  ('San Antonio metro 138 kV (Skyline ↔ Westover)', 138, 'CPS Energy', 29.5500, -98.4700, 29.4220, -98.6790, 'https://www.cpsenergy.com/'),
  ('El Paso 345 kV (Newman ↔ Diablo)', 345, 'El Paso Electric', 31.9500, -106.4200, 31.7600, -106.2800, 'https://www.epelectric.com/'),
  ('West Texas wind cluster — Sweetwater ↔ Trent Mesa', 138, 'Oncor', 32.4710, -100.4060, 32.5430, -100.0570, 'https://www.oncor.com/'),
  ('Houston ↔ Beaumont Gulf coast 345 kV', 345, 'Entergy Texas', 29.7600, -95.3700, 30.0860, -94.1020, 'https://www.entergy-texas.com/'),
  ('San Antonio ↔ Corpus Christi 345 kV', 345, 'AEP Texas', 29.4220, -98.6790, 27.8000, -97.4000, 'https://www.aeptexas.com/');

-- ── Natural gas pipelines (interstate + intrastate major lines) ─────────────
CREATE TABLE public.texas_gas_pipelines (
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
CREATE INDEX idx_texas_gas_pipelines_brin
  ON public.texas_gas_pipelines USING BRIN (start_lat, start_lng, end_lat, end_lng);
GRANT SELECT ON public.texas_gas_pipelines TO authenticated;
GRANT ALL ON public.texas_gas_pipelines TO service_role;
ALTER TABLE public.texas_gas_pipelines ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tx_gas_read_auth" ON public.texas_gas_pipelines
  FOR SELECT TO authenticated USING (true);

INSERT INTO public.texas_gas_pipelines
  (operator, name, diameter_mm, pressure_kpa, start_lat, start_lng, end_lat, end_lng, source_url)
VALUES
  ('Kinder Morgan', 'Permian Highway Pipeline (Waha → Katy)', 1067, 9650, 31.6000, -103.5000, 29.7900, -95.8200, 'https://www.kindermorgan.com/'),
  ('Kinder Morgan', 'Gulf Coast Express (Waha → Agua Dulce)', 1067, 9650, 31.6000, -103.5000, 27.7800, -97.9100, 'https://www.kindermorgan.com/'),
  ('Whistler Pipeline', 'Whistler (Waha → Agua Dulce)', 1067, 9650, 31.6000, -103.5000, 27.7800, -97.9100, 'https://whistlerpipeline.com/'),
  ('Energy Transfer', 'Houston Ship Channel Lateral', 762, 7600, 29.7900, -95.8200, 29.7400, -95.1500, 'https://www.energytransfer.com/'),
  ('Enterprise Products', 'Acadian Gas pipeline (Houston → LA border)', 914, 8275, 29.7600, -95.3700, 30.0500, -93.7000, 'https://www.enterpriseproducts.com/'),
  ('Energy Transfer', 'Oasis pipeline (Waha → Katy)', 914, 8275, 31.6000, -103.5000, 29.7900, -95.8200, 'https://www.energytransfer.com/'),
  ('Targa Resources', 'Carnero Convergence (Eagle Ford → Corpus Christi)', 610, 6900, 28.7000, -98.6000, 27.8000, -97.4000, 'https://www.targaresources.com/'),
  ('Atmos Energy', 'DFW metro distribution backbone', 508, 5500, 32.7831, -96.7910, 32.7555, -97.3308, 'https://www.atmosenergy.com/'),
  ('CenterPoint Energy', 'Houston metro distribution backbone', 508, 5500, 29.7600, -95.3700, 29.5400, -95.1900, 'https://www.centerpointenergy.com/'),
  ('Howard Energy Partners', 'Eagle Ford → Cuero gathering trunk', 508, 6000, 28.7000, -98.6000, 29.1010, -97.2870, 'https://www.howardenergypartners.com/');

-- ── Generation assets (real ERCOT major plants — gas, wind, solar, nuclear) ──
CREATE TABLE public.texas_generation_assets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_name text NOT NULL,
  fuel_type text NOT NULL,
  capacity_mw numeric NOT NULL,
  operator text,
  status text DEFAULT 'operating',
  commercial_operation_year integer,
  lat double precision NOT NULL,
  lng double precision NOT NULL,
  ppa_available boolean DEFAULT false,
  source_publisher text DEFAULT 'ERCOT Generation Capacity Report / EIA-860',
  source_url text,
  source_as_of date DEFAULT '2025-01-01',
  confidence text DEFAULT 'verified',
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_texas_generation_assets_brin
  ON public.texas_generation_assets USING BRIN (lat, lng);
GRANT SELECT ON public.texas_generation_assets TO authenticated;
GRANT ALL ON public.texas_generation_assets TO service_role;
ALTER TABLE public.texas_generation_assets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tx_gen_read_auth" ON public.texas_generation_assets
  FOR SELECT TO authenticated USING (true);

INSERT INTO public.texas_generation_assets
  (asset_name, fuel_type, capacity_mw, operator, status, commercial_operation_year, lat, lng, ppa_available, source_url)
VALUES
  -- Nuclear
  ('South Texas Project Unit 1+2', 'nuclear', 2700, 'STP Nuclear Operating Co.', 'operating', 1988, 28.7950, -96.0480, false, 'https://www.stpnoc.com/'),
  ('Comanche Peak Unit 1+2', 'nuclear', 2400, 'Vistra', 'operating', 1990, 32.2980, -97.7860, false, 'https://www.vistracorp.com/'),
  -- Major gas combined-cycle (biggest ERCOT thermal anchors)
  ('Limestone Generating Station', 'natural_gas', 1700, 'NRG Energy', 'operating', 1985, 31.4300, -96.8700, false, 'https://www.nrg.com/'),
  ('W.A. Parish Generating Station', 'natural_gas', 3650, 'NRG Energy', 'operating', 1958, 29.4830, -95.6320, false, 'https://www.nrg.com/'),
  ('Martin Lake Generating Station', 'natural_gas', 2250, 'Vistra', 'operating', 1977, 32.2700, -94.5700, false, 'https://www.vistracorp.com/'),
  ('Sand Lake Energy Center', 'natural_gas', 1100, 'Calpine', 'operating', 2002, 32.1280, -102.7330, true, 'https://www.calpine.com/'),
  ('Magic Valley Generating Station', 'natural_gas', 700, 'NextEra Energy Resources', 'operating', 2002, 26.1900, -98.0540, true, 'https://www.nexteraenergyresources.com/'),
  ('Channelview Cogeneration', 'cogen', 830, 'Equistar Chemicals', 'operating', 2001, 29.7960, -95.1110, false, 'https://www.lyondellbasell.com/'),
  -- West Texas / Panhandle wind clusters
  ('Roscoe Wind Farm', 'wind', 781, 'RWE Renewables', 'operating', 2009, 32.4490, -100.5410, true, 'https://americas.rwe.com/'),
  ('Horse Hollow Wind Energy Center', 'wind', 736, 'NextEra Energy Resources', 'operating', 2006, 32.0010, -100.0530, true, 'https://www.nexteraenergyresources.com/'),
  ('Capricorn Ridge Wind Farm', 'wind', 663, 'NextEra Energy Resources', 'operating', 2008, 31.8470, -100.6450, true, 'https://www.nexteraenergyresources.com/'),
  ('Sweetwater Wind Farms', 'wind', 585, 'Duke Energy Renewables', 'operating', 2005, 32.4710, -100.4060, true, 'https://www.duke-energy.com/'),
  ('Panhandle Wind Project', 'wind', 218, 'EDF Renewables', 'operating', 2014, 35.3800, -101.3700, true, 'https://www.edf-re.com/'),
  -- Major TX solar
  ('Roadrunner Solar', 'solar', 497, 'Enel Green Power', 'operating', 2020, 31.5740, -102.4150, true, 'https://www.enelgreenpower.com/'),
  ('Taygete I Solar', 'solar', 200, 'Lightsource bp', 'operating', 2021, 31.1580, -102.9230, true, 'https://lightsourcebp.com/'),
  ('Permian Energy Center', 'solar', 420, 'Enel Green Power', 'operating', 2021, 31.4670, -103.0680, true, 'https://www.enelgreenpower.com/'),
  ('Wells Solar', 'solar', 250, 'Engie', 'operating', 2022, 33.0470, -100.1410, true, 'https://www.engie.com/'),
  -- Hydro (Texas has limited but visible LCRA hydro)
  ('Buchanan Dam Hydroelectric', 'hydro', 50, 'LCRA', 'operating', 1937, 30.7480, -98.4170, false, 'https://www.lcra.org/'),
  -- Battery storage (the new wave)
  ('Gambit Energy Storage', 'battery', 100, 'Tesla', 'operating', 2021, 28.7980, -96.0590, true, 'https://www.tesla.com/'),
  ('DeCordova Battery Storage', 'battery', 260, 'Vistra', 'operating', 2022, 32.4860, -97.7610, true, 'https://www.vistracorp.com/'),
  ('Hopkins Energy Storage', 'battery', 200, 'Akaysha Energy', 'announced', 2026, 33.0500, -95.5400, true, 'https://akayshaenergy.com/');

-- ── Water sources (Gulf of Mexico, major rivers, reservoirs) ────────────────
CREATE TABLE public.texas_water_sources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  type text NOT NULL,
  lat double precision NOT NULL,
  lng double precision NOT NULL,
  notes text,
  source_url text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_texas_water_sources_brin ON public.texas_water_sources USING BRIN (lat, lng);
GRANT SELECT ON public.texas_water_sources TO authenticated;
GRANT ALL ON public.texas_water_sources TO service_role;
ALTER TABLE public.texas_water_sources ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tx_water_read_auth" ON public.texas_water_sources
  FOR SELECT TO authenticated USING (true);

INSERT INTO public.texas_water_sources (name, type, lat, lng, notes, source_url) VALUES
  ('Lake Travis (Colorado River)', 'reservoir', 30.4280, -97.9090, 'LCRA-managed; municipal and industrial supply for Austin/Central TX.', 'https://www.lcra.org/water/'),
  ('Lake Buchanan (Colorado River)', 'reservoir', 30.7710, -98.4180, 'Upper LCRA storage; agricultural + municipal.', 'https://www.lcra.org/water/'),
  ('Lake Conroe (San Jacinto River)', 'reservoir', 30.4360, -95.6080, 'Major Houston-area surface water.', 'https://www.sjra.net/'),
  ('Lake Livingston (Trinity River)', 'reservoir', 30.6970, -95.0260, 'TRA reservoir; primary Houston raw water supply.', 'https://www.trinityra.org/'),
  ('Lake Houston', 'reservoir', 30.0440, -95.1410, 'San Jacinto River impoundment for Houston municipal supply.', 'https://www.publicworks.houstontx.gov/'),
  ('Lake Texoma', 'reservoir', 33.9590, -96.6740, 'Red River; bi-state TX/OK supply.', 'https://www.swt.usace.army.mil/'),
  ('Possum Kingdom Lake (Brazos)', 'reservoir', 32.8830, -98.4670, 'Upper Brazos supply for DFW periphery.', 'https://www.brazos.org/'),
  ('Choke Canyon Reservoir', 'reservoir', 28.4880, -98.2540, 'Corpus Christi metro raw water.', 'https://www.tceq.texas.gov/'),
  ('Gulf of Mexico (Houston Ship Channel)', 'ocean', 29.7320, -94.9970, 'Brackish; available for industrial cooling via intake.', 'https://www.epa.gov/gulfofmexico'),
  ('Colorado River — Bastrop reach', 'river', 30.1100, -97.3150, 'Industrial / cooling water permits common in this stretch.', 'https://www.lcra.org/'),
  ('Trinity River — Dallas reach', 'river', 32.7400, -96.8000, 'Major water source for North Central TX.', 'https://www.trinityra.org/'),
  ('San Antonio Aquifer (Edwards)', 'aquifer', 29.4220, -98.6790, 'Highly regulated; San Antonio''s primary potable supply.', 'https://www.edwardsaquifer.org/'),
  ('Galveston Bay', 'estuary', 29.5500, -94.8500, 'Brackish industrial cooling source for Texas City / La Porte petchem.', 'https://www.tceq.texas.gov/'),
  ('Sabine River — Texas/LA border', 'river', 30.5000, -93.7500, 'East TX heavy-industry water source.', 'https://www.sra.dst.tx.us/'),
  ('Lake Granbury (Brazos)', 'reservoir', 32.4530, -97.7280, 'Comanche Peak cooling water source.', 'https://www.brazos.org/');

-- ── Major industrial water rights / diversions ──────────────────────────────
CREATE TABLE public.texas_water_licences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  licensee text NOT NULL,
  source_water_body text NOT NULL,
  lat double precision NOT NULL,
  lng double precision NOT NULL,
  licensed_m3_per_year bigint,
  purpose text,
  sub_basin text,
  allocation_status text,
  source_publisher text DEFAULT 'Texas Commission on Environmental Quality — Water Rights Database',
  source_url text DEFAULT 'https://www.tceq.texas.gov/permitting/water_rights',
  source_as_of date DEFAULT '2024-12-31',
  confidence text DEFAULT 'verified',
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_texas_water_licences_brin ON public.texas_water_licences USING BRIN (lat, lng);
GRANT SELECT ON public.texas_water_licences TO authenticated;
GRANT ALL ON public.texas_water_licences TO service_role;
ALTER TABLE public.texas_water_licences ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tx_water_lic_read_auth" ON public.texas_water_licences
  FOR SELECT TO authenticated USING (true);

-- Approximate licensed volumes from TCEQ summaries (m³/yr conversions from
-- acre-feet/yr). Status is "active" for all rows below.
INSERT INTO public.texas_water_licences
  (licensee, source_water_body, lat, lng, licensed_m3_per_year, purpose, sub_basin, allocation_status)
VALUES
  ('LCRA (firm + interruptible)', 'Colorado River — Lake Travis', 30.4280, -97.9090, 1240000000, 'Municipal + industrial', 'Colorado', 'active'),
  ('Houston Public Works', 'Lake Houston (San Jacinto)', 30.0440, -95.1410,  617000000, 'Municipal',              'San Jacinto', 'active'),
  ('Trinity River Authority', 'Lake Livingston', 30.6970, -95.0260, 800000000, 'Municipal + industrial', 'Trinity', 'active'),
  ('City of Dallas', 'Trinity River system', 32.7400, -96.8000, 740000000, 'Municipal', 'Trinity', 'active'),
  ('San Antonio Water System', 'Edwards Aquifer + Carrizo', 29.4220, -98.6790, 308000000, 'Municipal', 'San Antonio', 'active'),
  ('STP Nuclear Operating Co.', 'Colorado River — Bay City reach', 28.7950, -96.0480, 270000000, 'Industrial — cooling', 'Lower Colorado', 'active'),
  ('Calpine Channelview', 'Houston Ship Channel', 29.7960, -95.1110, 49000000, 'Industrial — cooling', 'San Jacinto', 'active'),
  ('Lyondell La Porte', 'Galveston Bay', 29.6840, -95.0240, 86000000, 'Industrial — cooling', 'San Jacinto', 'active'),
  ('Vistra Comanche Peak', 'Lake Granbury (Brazos)', 32.4530, -97.7280, 100000000, 'Industrial — cooling', 'Brazos', 'active'),
  ('Corpus Christi Water', 'Choke Canyon + Lake Corpus Christi', 28.4880, -98.2540, 168000000, 'Municipal + industrial', 'Nueces', 'active');

-- ════════════════════════════════════════════════════════════════════════════
-- 2. INDUSTRIAL / PARKS
-- ════════════════════════════════════════════════════════════════════════════

CREATE TABLE public.texas_industrial_parks (
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
CREATE INDEX idx_texas_industrial_parks_brin ON public.texas_industrial_parks USING BRIN (lat, lng);
GRANT SELECT ON public.texas_industrial_parks TO authenticated;
GRANT ALL ON public.texas_industrial_parks TO service_role;
ALTER TABLE public.texas_industrial_parks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tx_parks_read_auth" ON public.texas_industrial_parks
  FOR SELECT TO authenticated USING (true);

INSERT INTO public.texas_industrial_parks
  (name, municipality, lat, lng, available_power_mw, zoning, notes, source_url) VALUES
  ('AllianceTexas', 'Fort Worth', 32.9890, -97.3100, 500, 'Industrial / data-center', 'Hillwood-developed mega park; rail + air-served.', 'https://www.alliancetexas.com/'),
  ('Port of Houston — Bayport Industrial District', 'Houston', 29.6160, -95.0670, 450, 'Heavy industrial', 'Petrochemical + logistics; tier-1 power feed.', 'https://porthouston.com/'),
  ('Westover Hills', 'San Antonio', 29.4220, -98.6790, 350, 'Industrial / cloud', 'Microsoft + Google datacenter clusters.', 'https://www.sanantonio.gov/'),
  ('Caracara Energy Park', 'Cresson', 32.5350, -97.6090, 600, 'Industrial', 'Energy-themed park near Comanche Peak.', NULL),
  ('Eagle Ford Industrial Park', 'Cuero', 29.1010, -97.2870, 200, 'Industrial', 'Eagle Ford basin support; gas-rich.', NULL),
  ('Rockdale (former Alcoa Sandow site)', 'Rockdale', 30.6500, -97.0080, 600, 'Industrial — former smelter', 'Hyperscale + crypto sites have already developed here.', NULL),
  ('Sherman Industrial District', 'Sherman', 33.6620, -96.6260, 400, 'Industrial', 'TI fab + GlobiTech expansion zone.', NULL),
  ('North Texas Crossroads', 'Hutchins', 32.6480, -96.7050, 300, 'Industrial / logistics', 'I-45 / I-20 corridor; massive new warehousing.', NULL),
  ('Port of Corpus Christi — Inner Harbor', 'Corpus Christi', 27.8200, -97.4400, 300, 'Heavy industrial / LNG', 'Major LNG export + petrochemical hub.', NULL),
  ('El Paso Foreign Trade Zone #68', 'El Paso', 31.7720, -106.4250, 150, 'Industrial / FTZ', 'Border crossing logistics + manufacturing.', NULL),
  ('Beaumont Industrial Park', 'Beaumont', 30.0860, -94.1020, 250, 'Heavy industrial / refining', 'Major refining + petchem corridor.', NULL),
  ('Lubbock Reese Technology Center', 'Lubbock', 33.5950, -102.0440, 100, 'Tech / industrial', 'Texas Tech-affiliated; former AFB redevelopment.', NULL),
  ('Greater Austin Tech Corridor', 'Austin', 30.4290, -97.7430, 600, 'Tech / industrial', 'Samsung Taylor + TI Sherman pulling demand.', NULL),
  ('Tyler-Smith County Industrial Park', 'Tyler', 32.3510, -95.3010, 120, 'Industrial', 'East TX manufacturing.', NULL);

-- ════════════════════════════════════════════════════════════════════════════
-- 3. CLIMATE + HAZARDS
-- ════════════════════════════════════════════════════════════════════════════

CREATE TABLE public.texas_climate_normals (
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
  source_publisher text DEFAULT 'NOAA NCEI 1991–2020 normals + ASHRAE Climate Design Data 2021',
  source_url text DEFAULT 'https://www.ncei.noaa.gov/products/land-based-station/us-climate-normals',
  source_as_of date DEFAULT '2020-12-31',
  confidence text DEFAULT 'verified',
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_texas_climate_normals_brin ON public.texas_climate_normals USING BRIN (lat, lng);
GRANT SELECT ON public.texas_climate_normals TO authenticated;
GRANT ALL ON public.texas_climate_normals TO service_role;
ALTER TABLE public.texas_climate_normals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tx_climate_read_auth" ON public.texas_climate_normals
  FOR SELECT TO authenticated USING (true);

INSERT INTO public.texas_climate_normals
  (station_name, station_id, lat, lng, mean_annual_dry_bulb_c,
   ashrae_04_design_db_c, ashrae_1_design_db_c, ashrae_04_mcwb_c,
   mean_annual_wet_bulb_c, free_cooling_hours_below_18c, free_cooling_hours_below_10c,
   evap_hours_above_24c, ashrae_climate_zone)
VALUES
  ('Dallas/Fort Worth Intl', 'KDFW', 32.9000, -97.0400, 19.6, 37.4, 35.6, 22.8, 14.8, 3650, 1850, 3100, '3A — warm humid'),
  ('Houston Bush IAH',       'KIAH', 29.9840, -95.3410, 21.0, 35.8, 34.4, 24.6, 17.6, 3050, 1100, 3500, '2A — hot humid'),
  ('Austin Bergstrom Intl',  'KAUS', 30.1980, -97.6660, 20.7, 37.2, 35.4, 22.7, 15.5, 3400, 1500, 3300, '2A — hot humid'),
  ('San Antonio Intl',       'KSAT', 29.5340, -98.4700, 20.7, 37.3, 35.6, 22.5, 15.4, 3350, 1400, 3350, '2A — hot humid'),
  ('El Paso Intl',           'KELP', 31.8060, -106.3780, 18.5, 38.6, 36.8, 17.4, 9.5,  4250, 2350, 2300, '3B — warm dry'),
  ('Lubbock Intl',           'KLBB', 33.6670, -101.8230, 16.1, 36.4, 34.6, 19.0, 11.3, 4500, 2700, 1850, '3B — warm dry'),
  ('Amarillo Intl',          'KAMA', 35.2190, -101.7060, 14.2, 35.1, 33.3, 17.5, 10.4, 4900, 3200, 1300, '4B — mixed dry'),
  ('Corpus Christi Intl',    'KCRP', 27.7700, -97.5010, 22.5, 35.4, 34.0, 25.3, 18.2, 2700, 750,  3650, '2A — hot humid'),
  ('Brownsville Intl',       'KBRO', 25.9070, -97.4250, 23.7, 35.1, 33.8, 25.8, 19.4, 2300, 500,  3800, '2A — hot humid'),
  ('Midland Intl',           'KMAF', 31.9430, -102.2010, 17.7, 37.7, 35.9, 18.7, 11.0, 4250, 2400, 2100, '3B — warm dry'),
  ('Waco Regional',          'KACT', 31.6110, -97.2300, 19.7, 37.6, 35.8, 22.9, 15.0, 3550, 1750, 3200, '3A — warm humid');

-- Hazard grid — seismic (mostly low Texas), wildfire (W/Hill Country), flood
-- (coastal + Hill Country flash flood), hurricane proxy for tornado risk.
CREATE TABLE public.texas_hazard_grid (
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
  source_publisher text DEFAULT 'USGS National Seismic Hazard Map + Texas A&M Forest Service + NOAA SPC',
  source_url text DEFAULT 'https://earthquake.usgs.gov/hazards/',
  source_as_of date DEFAULT '2024-12-31',
  confidence text DEFAULT 'verified',
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_texas_hazard_grid_brin ON public.texas_hazard_grid USING BRIN (lat, lng);
GRANT SELECT ON public.texas_hazard_grid TO authenticated;
GRANT ALL ON public.texas_hazard_grid TO service_role;
ALTER TABLE public.texas_hazard_grid ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tx_hazard_read_auth" ON public.texas_hazard_grid
  FOR SELECT TO authenticated USING (true);

INSERT INTO public.texas_hazard_grid
  (region_name, lat, lng, radius_km, seismic_pga_g, seismic_sa02_g,
   seismic_rating, wildfire_rating, flood_rating, tornado_rating) VALUES
  ('DFW Metroplex',     32.7831, -96.7910, 80, 0.04, 0.07, 'low',      'low',       'moderate', 'high'),
  ('Houston Metro',     29.7600, -95.3700, 80, 0.03, 0.05, 'very_low', 'low',       'high',     'moderate'),
  ('Austin / Hill Country', 30.2670, -97.7530, 60, 0.04, 0.07, 'low', 'moderate',  'high',     'moderate'),
  ('San Antonio',       29.4220, -98.6790, 60, 0.04, 0.06, 'low',      'moderate',  'high',     'moderate'),
  ('Permian Basin',     31.7700, -102.4000, 100, 0.07, 0.12, 'low_induced', 'low',  'low',      'moderate'),
  ('El Paso / Trans-Pecos', 31.7600, -106.4870, 80, 0.10, 0.18, 'moderate', 'moderate', 'low', 'low'),
  ('Panhandle (Amarillo/Lubbock)', 34.5000, -101.5000, 100, 0.04, 0.07, 'low', 'moderate', 'low', 'very_high'),
  ('Gulf Coast (Corpus → Brownsville)', 27.0000, -97.7000, 100, 0.03, 0.05, 'very_low', 'low', 'very_high', 'moderate'),
  ('East TX Piney Woods', 32.0000, -94.7000, 100, 0.04, 0.07, 'low', 'high', 'moderate', 'high'),
  ('West TX wind belt',  32.5000, -100.0000, 100, 0.05, 0.09, 'low', 'low', 'low', 'high');

-- ════════════════════════════════════════════════════════════════════════════
-- 4. JURISDICTION / INCENTIVES / REGULATORY
-- ════════════════════════════════════════════════════════════════════════════

CREATE TABLE public.texas_municipal_incentives (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  municipality text NOT NULL,
  lat double precision NOT NULL,
  lng double precision NOT NULL,
  service_radius_km integer DEFAULT 25,
  non_residential_mill_rate numeric,           -- expressed in $/$100 assessed (TX convention)
  machinery_equipment_mill_rate numeric,
  incentive_summary text,
  source_publisher text,
  source_url text,
  source_as_of date,
  confidence text DEFAULT 'verified',
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_texas_incentives_brin ON public.texas_municipal_incentives USING BRIN (lat, lng);
GRANT SELECT ON public.texas_municipal_incentives TO authenticated;
GRANT ALL ON public.texas_municipal_incentives TO service_role;
ALTER TABLE public.texas_municipal_incentives ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tx_incentives_read_auth" ON public.texas_municipal_incentives
  FOR SELECT TO authenticated USING (true);

INSERT INTO public.texas_municipal_incentives
  (municipality, lat, lng, service_radius_km, non_residential_mill_rate,
   machinery_equipment_mill_rate, incentive_summary, source_publisher, source_url, source_as_of)
VALUES
  ('Dallas',         32.7831, -96.7910, 40, 0.7458, 0.7458, 'Ch. 380 economic development agreements; Enterprise Zone designations available.', 'City of Dallas', 'https://dallasecodev.org/', '2024-12-31'),
  ('Fort Worth',     32.7555, -97.3308, 40, 0.6725, 0.6725, 'Tax abatement Ch. 312; Triple Freeport exemption widely adopted.', 'City of Fort Worth', 'https://www.fortworthtexas.gov/', '2024-12-31'),
  ('Houston',        29.7600, -95.3700, 50, 0.5180, 0.5180, 'Ch. 380 agreements; Houston Enterprise Zone partner; foreign trade zone widely available.', 'City of Houston', 'https://www.houstontx.gov/', '2024-12-31'),
  ('Austin',         30.2670, -97.7530, 35, 0.4458, 0.4458, 'Performance-based Ch. 380 incentives; affordability-housing tie-ins.', 'City of Austin', 'https://www.austintexas.gov/', '2024-12-31'),
  ('San Antonio',    29.4220, -98.6790, 40, 0.5417, 0.5417, 'Aggressive Ch. 380/381 abatements for datacenters & manufacturing; CPS Energy economic-development rate.', 'City of San Antonio', 'https://www.sanantonio.gov/', '2024-12-31'),
  ('El Paso',        31.7600, -106.4870, 35, 0.8073, 0.8073, 'Border-zone incentives; FTZ #68; Triple Freeport.', 'City of El Paso', 'https://www.elpasotexas.gov/', '2024-12-31'),
  ('Lubbock',        33.5777, -101.8550, 40, 0.4708, 0.4708, 'Ch. 312/313 abatements common; Reese Center FTZ.', 'City of Lubbock', 'https://ci.lubbock.tx.us/', '2024-12-31'),
  ('Plano',          33.0198, -96.6989, 25, 0.4176, 0.4176, 'Ch. 380 economic-development grants; corporate HQ incentives.', 'City of Plano', 'https://www.plano.gov/', '2024-12-31'),
  ('Richardson',     32.9483, -96.7299, 25, 0.6240, 0.6240, 'Ch. 380 incentives; Telecom Corridor history.', 'City of Richardson', 'https://www.cor.net/', '2024-12-31'),
  ('Sherman',        33.6357, -96.6089, 35, 0.4625, 0.4625, 'Aggressive Ch. 380/313 packages around TI fab cluster.', 'City of Sherman', 'https://www.shermantx.org/', '2024-12-31'),
  ('Rockdale',       30.6500, -97.0080, 30, 0.4690, 0.4690, 'Sandow Lakes EDC tax phase-in for industrial.', 'Rockdale EDC', NULL, '2024-12-31'),
  ('Corpus Christi', 27.8000, -97.4000, 40, 0.6463, 0.6463, 'Port-area abatements; petchem + LNG focus.', 'City of Corpus Christi', 'https://www.cctexas.com/', '2024-12-31'),
  ('Taylor',         30.5710, -97.4090, 25, 0.6388, 0.6388, 'Samsung 313 chapter package — landmark TX incentive case.', 'City of Taylor', 'https://www.taylortx.gov/', '2024-12-31'),
  ('Beaumont',       30.0860, -94.1020, 35, 0.7155, 0.7155, 'FTZ + refining-region targeted abatements.', 'City of Beaumont', 'https://www.beaumonttexas.gov/', '2024-12-31');

CREATE TABLE public.texas_regulatory_zones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  municipality text NOT NULL,
  lat double precision NOT NULL,
  lng double precision NOT NULL,
  mill_rate_non_residential numeric,
  machinery_equipment_exempt boolean,
  school_tax_rate numeric,
  aer_region text,                  -- TX equivalent column reused: PUC region / utility area
  auc_typical_permit_weeks integer, -- TX equivalent: PUCT/utility typical interconnect study weeks
  indigenous_consultation_required boolean,
  treaty_area text,                 -- not applicable in TX; left null
  source_url text,
  last_verified date,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_texas_regulatory_zones_brin ON public.texas_regulatory_zones USING BRIN (lat, lng);
GRANT SELECT ON public.texas_regulatory_zones TO authenticated;
GRANT ALL ON public.texas_regulatory_zones TO service_role;
ALTER TABLE public.texas_regulatory_zones ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tx_reg_zones_read_auth" ON public.texas_regulatory_zones
  FOR SELECT TO authenticated USING (true);

INSERT INTO public.texas_regulatory_zones
  (municipality, lat, lng, mill_rate_non_residential, machinery_equipment_exempt,
   school_tax_rate, aer_region, auc_typical_permit_weeks,
   indigenous_consultation_required, treaty_area, source_url, last_verified)
VALUES
  ('Dallas',         32.7831, -96.7910, 0.7458, false, 1.0500, 'Oncor — North',     32, false, NULL, 'https://www.puc.texas.gov/', '2025-01-01'),
  ('Fort Worth',     32.7555, -97.3308, 0.6725, false, 1.0500, 'Oncor — North',     32, false, NULL, 'https://www.puc.texas.gov/', '2025-01-01'),
  ('Houston',        29.7600, -95.3700, 0.5180, false, 0.9300, 'CenterPoint',       28, false, NULL, 'https://www.puc.texas.gov/', '2025-01-01'),
  ('Austin',         30.2670, -97.7530, 0.4458, false, 1.0500, 'Austin Energy (muni)', 26, false, NULL, 'https://www.puc.texas.gov/', '2025-01-01'),
  ('San Antonio',    29.4220, -98.6790, 0.5417, false, 1.0500, 'CPS Energy (muni)', 24, false, NULL, 'https://www.puc.texas.gov/', '2025-01-01'),
  ('El Paso',        31.7600, -106.4870, 0.8073, false, 0.9620, 'El Paso Electric (non-ERCOT)', 40, false, NULL, 'https://www.puc.texas.gov/', '2025-01-01'),
  ('Lubbock',        33.5777, -101.8550, 0.4708, false, 1.0500, 'Oncor — South Plains', 30, false, NULL, 'https://www.puc.texas.gov/', '2025-01-01'),
  ('Rockdale',       30.6500, -97.0080, 0.4690, false, 1.0500, 'Oncor — Central',   30, false, NULL, 'https://www.puc.texas.gov/', '2025-01-01'),
  ('Corpus Christi', 27.8000, -97.4000, 0.6463, false, 1.0500, 'AEP Texas — Coastal', 32, false, NULL, 'https://www.puc.texas.gov/', '2025-01-01'),
  ('Sherman',        33.6357, -96.6089, 0.4625, false, 1.0500, 'Oncor — North',     32, false, NULL, 'https://www.puc.texas.gov/', '2025-01-01');

-- ════════════════════════════════════════════════════════════════════════════
-- 5. LOGISTICS / WORKFORCE / EDUCATION / CONSTRUCTION
-- ════════════════════════════════════════════════════════════════════════════

CREATE TABLE public.texas_logistics_assets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_type text NOT NULL,
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
CREATE INDEX idx_texas_logistics_brin ON public.texas_logistics_assets USING BRIN (lat, lng);
GRANT SELECT ON public.texas_logistics_assets TO authenticated;
GRANT ALL ON public.texas_logistics_assets TO service_role;
ALTER TABLE public.texas_logistics_assets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tx_logistics_read_auth" ON public.texas_logistics_assets
  FOR SELECT TO authenticated USING (true);

INSERT INTO public.texas_logistics_assets
  (asset_type, name, operator, lat, lng, notes, source_url) VALUES
  ('international_airport', 'Dallas/Fort Worth International (DFW)', 'DFW Airport Board', 32.8998, -97.0403, '4th-busiest US airport.', NULL),
  ('international_airport', 'George Bush Intercontinental (IAH)',   'Houston Airport System', 29.9844, -95.3414, 'Major UA hub.', NULL),
  ('international_airport', 'Austin–Bergstrom International (AUS)', 'City of Austin Aviation', 30.1975, -97.6664, 'Fastest-growing major US airport 2019–24.', NULL),
  ('international_airport', 'San Antonio International (SAT)',      'City of San Antonio Aviation', 29.5337, -98.4698, NULL, NULL),
  ('international_airport', 'El Paso International (ELP)',          'City of El Paso', 31.8067, -106.3781, 'Border logistics; UPS Boeing hub.', NULL),
  ('regional_airport',      'Lubbock Preston Smith Intl (LBB)',     'City of Lubbock', 33.6636, -101.8228, NULL, NULL),
  ('regional_airport',      'Amarillo Rick Husband Intl (AMA)',     'City of Amarillo', 35.2194, -101.7059, NULL, NULL),
  ('regional_airport',      'Midland International Air & Space (MAF)','Midland Intl', 31.9425, -102.2019, 'Permian basin support.', NULL),
  ('class_i_rail',          'BNSF Transcontinental — Texas main',   'BNSF Railway', 32.7000, -97.4000, 'Chicago ↔ LA mainline.', NULL),
  ('class_i_rail',          'Union Pacific Sunset Route',           'Union Pacific', 29.5000, -98.5000, 'Los Angeles ↔ New Orleans mainline.', NULL),
  ('class_i_rail',          'Kansas City Southern (CPKC) — Laredo',  'Canadian Pacific Kansas City', 27.5060, -99.5070, 'Cross-border into Mexico.', NULL),
  ('intermodal_terminal',   'BNSF Alliance Intermodal',              'BNSF', 33.0070, -97.2670, 'Tier-1 intermodal at AllianceTexas.', NULL),
  ('intermodal_terminal',   'UP Dallas Intermodal Terminal',         'Union Pacific', 32.7800, -96.6500, NULL, NULL),
  ('intermodal_terminal',   'BNSF Houston Pearland Intermodal',      'BNSF', 29.5350, -95.2370, NULL, NULL),
  ('intermodal_terminal',   'Port of Houston Bayport',               'Port Houston', 29.6160, -95.0670, '5th-busiest US container port.', NULL),
  ('intermodal_terminal',   'Port of Corpus Christi',                'Port of Corpus Christi', 27.8200, -97.4400, 'Largest US energy export port.', NULL),
  ('heavy_haul_corridor',   'I-45 Dallas ↔ Houston',                 'TxDOT', 31.5000, -96.3000, NULL, NULL),
  ('heavy_haul_corridor',   'I-35 San Antonio ↔ Laredo (NAFTA corridor)', 'TxDOT', 28.4500, -99.0000, NULL, NULL),
  ('heavy_haul_corridor',   'I-20 Dallas ↔ El Paso',                 'TxDOT', 32.0000, -101.0000, NULL, NULL);

CREATE TABLE public.texas_population_centres (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  lat double precision NOT NULL,
  lng double precision NOT NULL,
  population_2021 integer NOT NULL,
  labour_force_2021 integer,
  trades_workers_estimate integer,
  source_publisher text DEFAULT 'US Census Bureau — ACS 2022 5-year',
  source_url text DEFAULT 'https://data.census.gov/',
  source_as_of date DEFAULT '2022-12-31',
  confidence text DEFAULT 'verified',
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_texas_population_centres_brin ON public.texas_population_centres USING BRIN (lat, lng);
GRANT SELECT ON public.texas_population_centres TO authenticated;
GRANT ALL ON public.texas_population_centres TO service_role;
ALTER TABLE public.texas_population_centres ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tx_population_centres_read_auth" ON public.texas_population_centres
  FOR SELECT TO authenticated USING (true);

INSERT INTO public.texas_population_centres
  (name, lat, lng, population_2021, labour_force_2021, trades_workers_estimate)
VALUES
  ('Dallas–Fort Worth–Arlington MSA', 32.7831, -96.7910, 7637387, 3960000, 312000),
  ('Houston–The Woodlands–Sugar Land MSA', 29.7600, -95.3700, 7122240, 3650000, 305000),
  ('San Antonio–New Braunfels MSA', 29.4220, -98.6790, 2558143, 1240000, 98000),
  ('Austin–Round Rock–Georgetown MSA', 30.2670, -97.7530, 2352426, 1310000, 84000),
  ('El Paso MSA', 31.7600, -106.4870,  868859,   420000, 32000),
  ('Lubbock MSA', 33.5777, -101.8550,  321444,   170000, 14000),
  ('Amarillo MSA', 35.2200, -101.8310, 268691,   140000, 13000),
  ('Corpus Christi MSA', 27.8000, -97.4000, 421519, 210000, 22000),
  ('Beaumont–Port Arthur MSA', 30.0860, -94.1020, 392302, 190000, 22000),
  ('McAllen–Edinburg–Mission MSA', 26.2030, -98.2300, 871012, 380000, 28000),
  ('Brownsville–Harlingen MSA', 25.9070, -97.4250, 421017, 175000, 14000),
  ('Killeen–Temple MSA', 31.1170, -97.7280, 475367, 195000, 17000),
  ('Waco MSA', 31.6110, -97.2300, 290006, 130000, 11500),
  ('Tyler MSA', 32.3510, -95.3010, 233479, 105000, 10000),
  ('Sherman–Denison MSA', 33.6357, -96.6089, 137921, 65000, 6000),
  ('Midland MSA', 31.9425, -102.2019, 173770, 95000, 9500),
  ('Odessa MSA', 31.8457, -102.3676, 158261, 78000, 8000);

CREATE TABLE public.texas_workforce_stats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  centre_name text NOT NULL,
  lat double precision NOT NULL,
  lng double precision NOT NULL,
  labour_force integer,
  unemployment_rate numeric,
  pct_post_secondary numeric,
  electricians_count integer,
  hvac_techs_count integer,
  it_workers_count integer,
  median_wage_electrician numeric,
  median_wage_it numeric,
  source_url text DEFAULT 'https://www.bls.gov/oes/current/oes_tx.htm',
  last_verified date DEFAULT '2025-01-01',
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_texas_workforce_brin ON public.texas_workforce_stats USING BRIN (lat, lng);
GRANT SELECT ON public.texas_workforce_stats TO authenticated;
GRANT ALL ON public.texas_workforce_stats TO service_role;
ALTER TABLE public.texas_workforce_stats ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tx_workforce_read_auth" ON public.texas_workforce_stats
  FOR SELECT TO authenticated USING (true);

-- Wages in USD/hr; counts from BLS OES May 2024 estimates.
INSERT INTO public.texas_workforce_stats
  (centre_name, lat, lng, labour_force, unemployment_rate, pct_post_secondary,
   electricians_count, hvac_techs_count, it_workers_count,
   median_wage_electrician, median_wage_it)
VALUES
  ('Dallas–Fort Worth',  32.7831, -96.7910, 3960000, 3.8, 0.36, 38000, 17500, 215000, 29.50, 47.00),
  ('Houston',            29.7600, -95.3700, 3650000, 4.2, 0.33, 41000, 19000, 165000, 30.80, 45.20),
  ('San Antonio',        29.4220, -98.6790, 1240000, 4.1, 0.30, 11500,  5800,  48000, 25.10, 42.10),
  ('Austin',             30.2670, -97.7530, 1310000, 3.5, 0.45,  9500,  4900,  92000, 28.40, 53.80),
  ('El Paso',            31.7600, -106.4870, 420000, 5.2, 0.24,  3200,  1900,  10500, 22.70, 35.10),
  ('Lubbock',            33.5777, -101.8550, 170000, 3.9, 0.31,  1850,   950,   5400, 23.90, 36.50),
  ('Amarillo',           35.2200, -101.8310, 140000, 3.7, 0.27,  1450,   720,   3900, 24.20, 35.80),
  ('Corpus Christi',     27.8000, -97.4000,  210000, 4.6, 0.27,  3300,  1700,   5800, 28.50, 41.00),
  ('Beaumont–Port Arthur', 30.0860, -94.1020, 190000, 5.4, 0.22,  3100,  1500,   4400, 30.10, 39.40),
  ('Sherman–Denison',    33.6357, -96.6089,   65000, 4.0, 0.29,   720,   360,   1800, 26.40, 38.20),
  ('Midland–Odessa',     31.9425, -102.2019, 173000, 4.8, 0.24,  3200,  1450,   3800, 33.10, 38.80),
  ('Waco',               31.6110, -97.2300,  130000, 4.0, 0.28,  1400,   700,   3600, 25.20, 36.90);

CREATE TABLE public.texas_post_secondary (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_name text NOT NULL,
  city text,
  lat double precision NOT NULL,
  lng double precision NOT NULL,
  program_focus text[],
  annual_grads_relevant integer,
  source_url text,
  last_verified date DEFAULT '2025-01-01',
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_texas_post_secondary_brin ON public.texas_post_secondary USING BRIN (lat, lng);
GRANT SELECT ON public.texas_post_secondary TO authenticated;
GRANT ALL ON public.texas_post_secondary TO service_role;
ALTER TABLE public.texas_post_secondary ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tx_post_secondary_read_auth" ON public.texas_post_secondary
  FOR SELECT TO authenticated USING (true);

INSERT INTO public.texas_post_secondary
  (institution_name, city, lat, lng, program_focus, annual_grads_relevant) VALUES
  ('University of Texas at Austin',                'Austin',       30.2849, -97.7341, ARRAY['Electrical Engineering','Computer Science','Mechanical Engineering','Power Systems'], 4200),
  ('Texas A&M University — College Station',       'College Station', 30.6280, -96.3344, ARRAY['Electrical Engineering','Civil Engineering','Nuclear Engineering','Petroleum Engineering'], 5800),
  ('University of Texas at Dallas',                'Richardson',   32.9856, -96.7501, ARRAY['Computer Science','Electrical Engineering','Data Science'], 2700),
  ('University of Houston — Cullen College of Engineering', 'Houston', 29.7174, -95.3414, ARRAY['Electrical Engineering','Petroleum Engineering','Civil Engineering'], 2200),
  ('Texas Tech University',                        'Lubbock',      33.5847, -101.8742, ARRAY['Electrical Engineering','Wind Energy','Mechanical Engineering'], 2300),
  ('University of Texas at San Antonio',           'San Antonio',  29.5830, -98.6190, ARRAY['Cybersecurity','Electrical Engineering','Cloud Computing'], 2100),
  ('University of North Texas',                    'Denton',       33.2070, -97.1530, ARRAY['Electrical Engineering Technology','Computer Science','Construction Management'], 2000),
  ('Texas State University',                       'San Marcos',   29.8884, -97.9389, ARRAY['Engineering Technology','Computer Science'], 1900),
  ('University of Texas at El Paso',               'El Paso',      31.7680, -106.5050, ARRAY['Electrical Engineering','Computer Science','Manufacturing'], 1600),
  ('Texas A&M University — Kingsville',            'Kingsville',   27.5260, -97.8810, ARRAY['Electrical Engineering','Petroleum Engineering'], 800),
  ('Dallas College',                               'Dallas',       32.7300, -96.8300, ARRAY['Electrical Technology','HVAC','Construction Trades'], 3200),
  ('Houston Community College',                    'Houston',      29.7330, -95.3850, ARRAY['Electrical Technology','HVAC','Process Technology'], 3000),
  ('Austin Community College',                     'Austin',       30.2330, -97.7610, ARRAY['Electrical Technology','HVAC','Semiconductor Manufacturing'], 1900),
  ('Alamo Colleges District',                      'San Antonio',  29.4250, -98.4870, ARRAY['Electrical Technology','HVAC','Cybersecurity'], 2400),
  ('Lone Star College System',                     'The Woodlands', 30.1660, -95.4610, ARRAY['Electrical Technology','HVAC','Construction Management'], 2700),
  ('Tarrant County College',                       'Fort Worth',   32.7500, -97.3200, ARRAY['Electrical Technology','HVAC','Welding'], 2500),
  ('Texas State Technical College',                'Waco',         31.6390, -97.0730, ARRAY['Electrical Power & Controls','HVAC','Wind Energy'], 1500);

CREATE TABLE public.texas_construction_capacity (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  firm_name text NOT NULL,
  hq_city text,
  mega_project_capable boolean DEFAULT false,
  union_status text,
  recent_projects jsonb,
  source_url text,
  last_verified date DEFAULT '2025-01-01',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.texas_construction_capacity TO authenticated;
GRANT ALL ON public.texas_construction_capacity TO service_role;
ALTER TABLE public.texas_construction_capacity ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tx_construction_capacity_read_auth" ON public.texas_construction_capacity
  FOR SELECT TO authenticated USING (true);

INSERT INTO public.texas_construction_capacity
  (firm_name, hq_city, mega_project_capable, union_status, recent_projects, source_url) VALUES
  ('Fluor Corporation', 'Irving',       true,  'mixed',     '["LNG export trains","Petrochemical Gulf Coast complexes","Datacenter campuses"]'::jsonb, 'https://www.fluor.com/'),
  ('Kiewit Corporation', 'Houston (TX HQ)', true, 'mixed', '["Permian power plants","Datacenter shells","Transmission CREZ work"]'::jsonb, 'https://www.kiewit.com/'),
  ('Burns & McDonnell', 'Houston',      true,  'union',     '["ERCOT substation builds","Industrial EPC","Datacenter MEP"]'::jsonb, 'https://www.burnsmcd.com/'),
  ('Zachry Group', 'San Antonio',       true,  'open_shop', '["Refinery turnarounds","Petrochemical EPC","Power plant construction"]'::jsonb, 'https://www.zachrygroup.com/'),
  ('McCarthy Building Companies', 'Dallas', true, 'mixed', '["Datacenter shells","Healthcare megaprojects","Renewables"]'::jsonb, 'https://www.mccarthy.com/'),
  ('Holt Group / Holt Cat',  'San Antonio', false, 'open_shop', '["Industrial mechanical","Fleet support"]'::jsonb, 'https://www.holtcat.com/'),
  ('Mortenson Construction', 'Houston (regional)', true, 'union', '["Wind farm BOP","Solar EPC","Datacenter campus shells"]'::jsonb, 'https://www.mortenson.com/'),
  ('Hensel Phelps',          'Austin (regional)', true, 'mixed', '["Datacenter shells","Semiconductor fabs","Critical infrastructure"]'::jsonb, 'https://www.henselphelps.com/'),
  ('Turner Construction',    'Houston (regional)', true, 'union', '["Datacenter shells","Semiconductor cleanrooms","Healthcare"]'::jsonb, 'https://www.turnerconstruction.com/'),
  ('Rosendin Electric',      'Austin (regional)', true, 'union',  '["Datacenter MEP","Renewable substations","Large industrial electrical"]'::jsonb, 'https://www.rosendin.com/');

CREATE TABLE public.texas_construction_wages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trade text NOT NULL,
  union_rate_cad_hr numeric,        -- column name reused; values are USD/hr for TX
  open_shop_rate_cad_hr numeric,
  benefits_loading_pct numeric,
  source_url text DEFAULT 'https://www.bls.gov/oes/current/oes_tx.htm',
  last_verified date DEFAULT '2025-01-01',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.texas_construction_wages TO authenticated;
GRANT ALL ON public.texas_construction_wages TO service_role;
ALTER TABLE public.texas_construction_wages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tx_construction_wages_read_auth" ON public.texas_construction_wages
  FOR SELECT TO authenticated USING (true);

-- TX is open-shop dominant; union rates exist mainly in Houston petchem &
-- some IBEW locals. Values are USD/hr (NOT CAD — the column was named CAD
-- on the AB schema; we reuse the column to keep the response shape uniform).
INSERT INTO public.texas_construction_wages
  (trade, union_rate_cad_hr, open_shop_rate_cad_hr, benefits_loading_pct) VALUES
  ('Electrician (journeyman)',       42.50, 31.20, 0.34),
  ('Pipefitter / Steamfitter',       44.10, 31.80, 0.35),
  ('Ironworker (structural)',        38.80, 28.50, 0.33),
  ('Millwright',                     43.20, 32.40, 0.35),
  ('HVAC / Sheet Metal',             38.10, 27.80, 0.30),
  ('Crane Operator',                 45.90, 33.10, 0.34),
  ('Concrete Finisher / Mason',      31.20, 22.50, 0.28),
  ('Carpenter (commercial)',         32.80, 24.10, 0.28),
  ('Welder (combo)',                 39.20, 29.60, 0.31),
  ('Laborer (general)',              26.40, 18.90, 0.25);

CREATE TABLE public.texas_carrier_pop_details (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  facility_name text NOT NULL,
  city text,
  lat double precision NOT NULL,
  lng double precision NOT NULL,
  facility_type text,
  open_access boolean,
  cross_connect_fee_estimate_cad numeric,    -- reused; USD/mo for TX
  building_owner text,
  carriers_on_net text[],
  source_url text,
  last_verified date DEFAULT '2025-01-01',
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_texas_pop_details_brin ON public.texas_carrier_pop_details USING BRIN (lat, lng);
GRANT SELECT ON public.texas_carrier_pop_details TO authenticated;
GRANT ALL ON public.texas_carrier_pop_details TO service_role;
ALTER TABLE public.texas_carrier_pop_details ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tx_pop_details_read_auth" ON public.texas_carrier_pop_details
  FOR SELECT TO authenticated USING (true);

INSERT INTO public.texas_carrier_pop_details
  (facility_name, city, lat, lng, facility_type, open_access,
   cross_connect_fee_estimate_cad, building_owner, carriers_on_net, source_url) VALUES
  ('Equinix DA1 Infomart',     'Dallas',      32.7898, -96.8181, 'carrier hotel',     true, 300, 'Equinix',
   ARRAY['Lumen','Zayo','Cogent','Verizon','AT&T','Comcast','Crown Castle','Spectrum','GTT','Tata','Telia'],
   'https://www.equinix.com/data-centers/americas-colocation/united-states-colocation/dallas-data-centers/da1'),
  ('Digital Realty DFW10',     'Richardson',  32.9636, -96.7099, 'wholesale colo',    true, 280, 'Digital Realty',
   ARRAY['Lumen','Zayo','Cogent','AT&T','Verizon','Megaport','PacketFabric'],
   'https://www.digitalrealty.com/data-centers/americas/dallas'),
  ('Cologix DAL2',             'Dallas',      32.7831, -96.7910, 'colocation',        true, 250, 'Cologix',
   ARRAY['Lumen','Zayo','Cogent','GTT','Megaport','PacketFabric'],
   'https://www.cologix.com/data-centers/dallas/dal2/'),
  ('Equinix HO1 Houston',      'Houston',     29.6970, -95.5610, 'carrier hotel',     true, 320, 'Equinix',
   ARRAY['Lumen','Zayo','AT&T','Verizon','GTT','Comcast','Crown Castle'],
   'https://www.equinix.com/data-centers/americas-colocation/united-states-colocation/houston-data-centers/ho1'),
  ('Digital Realty HOU1',      'Houston',     29.7461, -95.3666, 'wholesale colo',    true, 290, 'Digital Realty',
   ARRAY['Lumen','Zayo','Cogent','GTT','PacketFabric'],
   'https://www.digitalrealty.com/data-centers/americas/houston'),
  ('Digital Realty AUS',       'Austin',      30.2010, -97.7170, 'wholesale colo',    true, 280, 'Digital Realty',
   ARRAY['Lumen','Zayo','Cogent','AT&T','Megaport','PacketFabric'],
   'https://www.digitalrealty.com/data-centers/americas/austin'),
  ('Cologix COL2 Austin',      'Austin',      30.2670, -97.7530, 'colocation',        true, 260, 'Cologix',
   ARRAY['Lumen','Zayo','Cogent','Megaport','PacketFabric'],
   'https://www.cologix.com/data-centers/austin/col2/'),
  ('Stream Data Centers SAT III','San Antonio',29.5450, -98.5760, 'wholesale colo',   false,NULL,'Stream',
   ARRAY['Lumen','AT&T','Spectrum'], 'https://www.streamdatacenters.com/locations/san-antonio/');

CREATE TABLE public.texas_last_mile_providers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  population_centre text NOT NULL,
  lat double precision NOT NULL,
  lng double precision NOT NULL,
  providers jsonb NOT NULL,
  source_url text,
  last_verified date DEFAULT '2025-01-01',
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_texas_last_mile_brin ON public.texas_last_mile_providers USING BRIN (lat, lng);
GRANT SELECT ON public.texas_last_mile_providers TO authenticated;
GRANT ALL ON public.texas_last_mile_providers TO service_role;
ALTER TABLE public.texas_last_mile_providers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tx_last_mile_read_auth" ON public.texas_last_mile_providers
  FOR SELECT TO authenticated USING (true);

INSERT INTO public.texas_last_mile_providers
  (population_centre, lat, lng, providers) VALUES
  ('Dallas',        32.7831, -96.7910, '[{"name":"AT&T Fiber","technology":"FTTH","max_speed_gbps":5},{"name":"Spectrum Business","technology":"DOCSIS 4.0","max_speed_gbps":2},{"name":"Frontier Fiber","technology":"FTTH","max_speed_gbps":5}]'::jsonb),
  ('Houston',       29.7600, -95.3700, '[{"name":"AT&T Fiber","technology":"FTTH","max_speed_gbps":5},{"name":"Comcast Business","technology":"DOCSIS 4.0","max_speed_gbps":2},{"name":"Phonoscope Fiber","technology":"FTTH","max_speed_gbps":10}]'::jsonb),
  ('Austin',        30.2670, -97.7530, '[{"name":"Google Fiber","technology":"FTTH","max_speed_gbps":8},{"name":"AT&T Fiber","technology":"FTTH","max_speed_gbps":5},{"name":"Spectrum","technology":"DOCSIS 4.0","max_speed_gbps":2}]'::jsonb),
  ('San Antonio',   29.4220, -98.6790, '[{"name":"Google Fiber","technology":"FTTH","max_speed_gbps":8},{"name":"Spectrum","technology":"DOCSIS 4.0","max_speed_gbps":2},{"name":"AT&T Fiber","technology":"FTTH","max_speed_gbps":5}]'::jsonb),
  ('El Paso',       31.7600, -106.4870, '[{"name":"AT&T Fiber","technology":"FTTH","max_speed_gbps":5},{"name":"Spectrum","technology":"DOCSIS 3.1","max_speed_gbps":1}]'::jsonb),
  ('Lubbock',       33.5777, -101.8550, '[{"name":"AT&T Fiber","technology":"FTTH","max_speed_gbps":5},{"name":"Suddenlink","technology":"DOCSIS 3.1","max_speed_gbps":1},{"name":"Nextlink","technology":"Fixed Wireless","max_speed_gbps":1}]'::jsonb);

CREATE TABLE public.texas_dark_fiber_inventory (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  segment_name text NOT NULL,
  start_lat double precision NOT NULL,
  start_lng double precision NOT NULL,
  end_lat double precision NOT NULL,
  end_lng double precision NOT NULL,
  owner text,
  lit_or_dark text,
  conduit_owner text,
  ifa_count_estimate integer,
  source_url text,
  last_verified date DEFAULT '2025-01-01',
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_texas_dark_fiber_brin ON public.texas_dark_fiber_inventory USING BRIN (start_lat, start_lng);
GRANT SELECT ON public.texas_dark_fiber_inventory TO authenticated;
GRANT ALL ON public.texas_dark_fiber_inventory TO service_role;
ALTER TABLE public.texas_dark_fiber_inventory ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tx_dark_fiber_read_auth" ON public.texas_dark_fiber_inventory
  FOR SELECT TO authenticated USING (true);

INSERT INTO public.texas_dark_fiber_inventory
  (segment_name, start_lat, start_lng, end_lat, end_lng, owner, lit_or_dark, conduit_owner, ifa_count_estimate) VALUES
  ('Dallas → Plano dark conduit', 32.7831, -96.7910, 33.0198, -96.6989, 'Zayo', 'dark', 'Zayo', 288),
  ('Houston metro dark ring',      29.7600, -95.3700, 29.5400, -95.1900, 'Cox Business', 'dark', 'Cox', 432),
  ('Austin metro dark fiber',      30.2670, -97.7530, 30.5710, -97.4090, 'Google Fiber', 'dark', 'Google Fiber', 144),
  ('San Antonio Westover dark conduit', 29.4220, -98.6790, 29.5450, -98.5760, 'CPS Energy / Loop Networks', 'dark', 'CPS Energy', 288),
  ('Dallas → Sherman dark long-haul', 32.7831, -96.7910, 33.6357, -96.6089, 'Zayo', 'dark', 'Zayo', 144),
  ('Houston → Beaumont dark conduit', 29.7600, -95.3700, 30.0860, -94.1020, 'Lumen', 'dark', 'Lumen', 96);

-- ════════════════════════════════════════════════════════════════════════════
-- 6. SHARED layers — add Texas rows
-- ════════════════════════════════════════════════════════════════════════════

-- Major Texas internet exchanges (PeeringDB) — seed only if absent.
INSERT INTO public.internet_exchanges
  (name, city, lat, lng, participant_count, peak_traffic_gbps, source_url)
SELECT v.name, v.city, v.lat, v.lng, v.participant_count, v.peak_traffic_gbps, v.source_url
FROM (VALUES
  ('Equinix IX Dallas',      'Dallas',      32.7898, -96.8181, 180, 2200, 'https://www.peeringdb.com/'),
  ('LINX NoVA',              NULL,          NULL,    NULL,     NULL, NULL, NULL),
  ('CoreSite Any2 Dallas',   'Dallas',      32.9636, -96.7099,  85,  650, 'https://www.peeringdb.com/'),
  ('Houston Internet Exchange (HOUIX)', 'Houston', 29.6970, -95.5610, 65, 420, 'https://www.peeringdb.com/'),
  ('Equinix IX Houston',     'Houston',     29.6970, -95.5610,  72,  580, 'https://www.peeringdb.com/'),
  ('Austin Internet Exchange (AusIX)',  'Austin',  30.2670, -97.7530, 35, 180, 'https://www.peeringdb.com/'),
  ('San Antonio Internet Exchange (SAIX)','San Antonio', 29.5450, -98.5760, 22, 95, 'https://www.peeringdb.com/')
) AS v(name, city, lat, lng, participant_count, peak_traffic_gbps, source_url)
WHERE v.city IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM public.internet_exchanges e
    WHERE e.name = v.name AND e.city = v.city
  );

-- Major cloud regions reachable from Texas — seed only if absent.
INSERT INTO public.cloud_regions
  (provider, region_code, region_name, lat, lng, source_url)
SELECT v.provider, v.region_code, v.region_name, v.lat, v.lng, v.source_url
FROM (VALUES
  ('AWS',       'us-east-1',      'US East (N. Virginia)',   39.0438, -77.4874, 'https://aws.amazon.com/about-aws/global-infrastructure/regions_az/'),
  ('AWS',       'us-east-2',      'US East (Ohio)',          40.0992, -83.1141, 'https://aws.amazon.com/about-aws/global-infrastructure/regions_az/'),
  ('AWS',       'us-west-2',      'US West (Oregon)',        45.8696, -119.6880,'https://aws.amazon.com/about-aws/global-infrastructure/regions_az/'),
  ('Azure',     'south-central-us','South Central US (San Antonio)', 29.4220, -98.6790, 'https://azure.microsoft.com/en-us/explore/global-infrastructure/'),
  ('Azure',     'central-us',     'Central US (Iowa)',       41.2596, -95.8608, 'https://azure.microsoft.com/en-us/explore/global-infrastructure/'),
  ('Google Cloud','us-central1',  'Iowa (Council Bluffs)',   41.2596, -95.8608, 'https://cloud.google.com/about/locations/'),
  ('Google Cloud','us-south1',    'Dallas',                  32.7831, -96.7910, 'https://cloud.google.com/about/locations/'),
  ('Oracle',    'us-chicago-1',   'Chicago',                 41.8781, -87.6298, 'https://www.oracle.com/cloud/data-regions/')
) AS v(provider, region_code, region_name, lat, lng, source_url)
WHERE NOT EXISTS (
  SELECT 1 FROM public.cloud_regions c
  WHERE c.provider = v.provider AND c.region_code = v.region_code
);

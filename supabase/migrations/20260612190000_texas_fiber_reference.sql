-- Texas fiber reference data for Site Lookup.
--
-- Site Intelligence currently only reads alberta_* layers, so any US point
-- returns empty fiber (and other layers). This migration adds Texas mirror
-- tables for the two layers that drive the Fiber panel — carrier POPs and
-- long-haul routes — with the same column shape so the site-report function
-- can pick a table based on lat/lng without UI changes.
--
-- New TX-relevant latency columns are added to BOTH the AB and TX tables so
-- the response shape is uniform. AB rows have NULL for DFW/HOU; TX rows have
-- NULL for YYC/YEG. The UI already renders missing columns as "—".

-- ── 1.  Wider latency columns on both regions ────────────────────────────────

ALTER TABLE public.alberta_carrier_pops
  ADD COLUMN IF NOT EXISTS latency_to_dfw_ms numeric,
  ADD COLUMN IF NOT EXISTS latency_to_hou_ms numeric;

-- ── 2.  Texas carrier POPs ───────────────────────────────────────────────────

CREATE TABLE public.texas_carrier_pops (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  carrier text NOT NULL,
  facility_name text NOT NULL,
  address text,
  city text NOT NULL,
  lat double precision NOT NULL,
  lng double precision NOT NULL,
  services text[] DEFAULT ARRAY[]::text[],
  latency_to_dfw_ms numeric,    -- Dallas/Fort Worth metro
  latency_to_hou_ms numeric,    -- Houston metro
  latency_to_aus_ms numeric,    -- Austin / Texas hill country
  latency_to_sea_ms numeric,    -- Seattle (NW cloud + Pacific subsea)
  latency_to_ord_ms numeric,    -- Chicago (Midwest peering)
  source_url text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_texas_carrier_pops_latlng_brin
  ON public.texas_carrier_pops USING BRIN (lat, lng);

GRANT SELECT ON public.texas_carrier_pops TO authenticated;
GRANT ALL ON public.texas_carrier_pops TO service_role;
ALTER TABLE public.texas_carrier_pops ENABLE ROW LEVEL SECURITY;
CREATE POLICY "texas_pops_read_auth"
  ON public.texas_carrier_pops FOR SELECT TO authenticated USING (true);

-- Real major TX carrier POPs (PeeringDB / public facility pages, Jan 2026 desk
-- research). Latencies are typical published one-way figures, not measured —
-- adequate for proximity ranking, not for SLA quoting.

INSERT INTO public.texas_carrier_pops
  (carrier, facility_name, address, city, lat, lng, services,
   latency_to_dfw_ms, latency_to_hou_ms, latency_to_aus_ms,
   latency_to_sea_ms, latency_to_ord_ms, source_url)
VALUES
  -- Dallas / Fort Worth metro — the biggest interconnection cluster in TX
  ('Equinix', 'DA1 Dallas Infomart',
   '1950 N Stemmons Fwy', 'Dallas', 32.7898, -96.8181,
   ARRAY['colocation','cross-connect','metro','cloud-onramp'],
   0.4, 5.5, 4.5, 36.0, 14.0,
   'https://www.equinix.com/data-centers/americas-colocation/united-states-colocation/dallas-data-centers/da1'),

  ('Equinix', 'DA3 Dallas',
   '1301 Royal Lane', 'Dallas', 32.8554, -96.8526,
   ARRAY['colocation','cross-connect','metro'],
   0.6, 5.6, 4.6, 36.0, 14.2,
   'https://www.equinix.com/data-centers/americas-colocation/united-states-colocation/dallas-data-centers/da3'),

  ('Digital Realty', 'DFW10 Richardson',
   '900 Quality Way', 'Richardson', 32.9636, -96.7099,
   ARRAY['colocation','wholesale','hyperscale'],
   0.7, 5.8, 4.8, 36.5, 14.1,
   'https://www.digitalrealty.com/data-centers/americas/dallas'),

  ('Cologix', 'DAL2 Dallas',
   '2323 Bryan St', 'Dallas', 32.7831, -96.7910,
   ARRAY['colocation','peering','cross-connect'],
   0.5, 5.5, 4.5, 36.0, 13.9,
   'https://www.cologix.com/data-centers/dallas/dal2/'),

  ('Lumen (CenturyLink)', 'Dallas Carrier Hotel',
   '2323 Bryan St', 'Dallas', 32.7831, -96.7910,
   ARRAY['transport','wave','colocation','ip-transit'],
   0.5, 5.5, 4.5, 35.8, 13.7,
   'https://www.lumen.com/'),

  ('Flexential', 'Plano Data Center',
   '6500 Chase Oaks Blvd', 'Plano', 33.0676, -96.7194,
   ARRAY['colocation','hybrid-cloud'],
   1.0, 6.0, 5.0, 36.6, 14.2,
   'https://www.flexential.com/data-centers/dallas-plano'),

  -- Houston metro — Gulf Coast fiber + subsea landing connectivity
  ('Equinix', 'HO1 Houston',
   '600 Industrial Blvd', 'Houston', 29.6970, -95.5610,
   ARRAY['colocation','metro','cross-connect'],
   5.5, 0.4, 4.0, 40.5, 18.2,
   'https://www.equinix.com/data-centers/americas-colocation/united-states-colocation/houston-data-centers/ho1'),

  ('Digital Realty', 'HOU1 Houston',
   '1301 Fannin St', 'Houston', 29.7461, -95.3666,
   ARRAY['colocation','wholesale'],
   5.6, 0.6, 4.2, 40.7, 18.4,
   'https://www.digitalrealty.com/data-centers/americas/houston'),

  ('Cyrus One', 'Houston West I',
   '8201 Westchester Dr', 'Houston', 29.7100, -95.5760,
   ARRAY['colocation','wholesale','enterprise'],
   5.6, 0.5, 4.1, 40.8, 18.5,
   'https://www.cyrusone.com/data-centers/north-america/houston/'),

  ('Lumen (CenturyLink)', 'Houston Greenspoint',
   '12200 Northwest Fwy', 'Houston', 29.9420, -95.5470,
   ARRAY['transport','wave','ip-transit'],
   5.4, 0.7, 4.2, 40.4, 18.0,
   'https://www.lumen.com/'),

  -- Austin — fab + cloud-aligned interconnect
  ('Digital Realty', 'AUS Austin',
   '7401 E Ben White Blvd', 'Austin', 30.2010, -97.7170,
   ARRAY['colocation','wholesale','cloud-onramp'],
   4.5, 4.0, 0.4, 38.5, 17.0,
   'https://www.digitalrealty.com/data-centers/americas/austin'),

  ('Data Foundry', 'Texas 1 Austin',
   '4100 Smith School Rd', 'Austin', 30.2110, -97.7050,
   ARRAY['colocation','enterprise'],
   4.6, 4.1, 0.5, 38.7, 17.2,
   'https://www.datafoundry.com/data-centers/austin/'),

  ('Cologix', 'COL2 Austin',
   '900 W Cesar Chavez St', 'Austin', 30.2670, -97.7530,
   ARRAY['colocation','peering','cross-connect'],
   4.6, 4.1, 0.4, 38.6, 17.1,
   'https://www.cologix.com/data-centers/austin/col2/'),

  -- San Antonio — Microsoft + Westpac fiber hub
  ('Microsoft', 'SAT Datacenter Region',
   'Westover Hills', 'San Antonio', 29.4220, -98.6790,
   ARRAY['cloud-region','enterprise'],
   5.5, 4.2, 1.4, 40.0, 18.4,
   'https://datacenters.microsoft.com/globe/'),

  ('Stream Data Centers', 'SAT III San Antonio',
   '5707 University Heights Blvd', 'San Antonio', 29.5450, -98.5760,
   ARRAY['wholesale','build-to-suit'],
   5.4, 4.1, 1.3, 40.0, 18.3,
   'https://www.streamdatacenters.com/locations/san-antonio/'),

  -- Edge metros — El Paso (border + west-bound transit) and Lubbock
  ('Lumen (CenturyLink)', 'El Paso Carrier Hub',
   '300 N Mesa St', 'El Paso', 31.7600, -106.4870,
   ARRAY['transport','wave','ip-transit'],
   6.0, 9.0, 7.0, 32.0, 19.5,
   'https://www.lumen.com/'),

  ('AT&T', 'Lubbock Central Office',
   '1314 Avenue J', 'Lubbock', 33.5777, -101.8550,
   ARRAY['transport','ethernet','ip-transit'],
   3.2, 6.5, 4.5, 35.0, 14.0,
   'https://www.att.com/');

-- ── 3.  Texas long-haul fiber routes ─────────────────────────────────────────

CREATE TABLE public.texas_fiber_routes (
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

CREATE INDEX idx_texas_fiber_routes_endpoints_brin
  ON public.texas_fiber_routes USING BRIN (start_lat, start_lng, end_lat, end_lng);

GRANT SELECT ON public.texas_fiber_routes TO authenticated;
GRANT ALL ON public.texas_fiber_routes TO service_role;
ALTER TABLE public.texas_fiber_routes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "texas_fiber_read_auth"
  ON public.texas_fiber_routes FOR SELECT TO authenticated USING (true);

-- Major published TX long-haul corridors. Endpoints are city centroids since
-- public exact-route maps aren't licensed; the function only uses these for
-- "is the route near my point" geometry which is robust to ±10 km wobble.

INSERT INTO public.texas_fiber_routes
  (carrier, route_name, route_type, lit_dark,
   start_lat, start_lng, end_lat, end_lng, source_url)
VALUES
  ('Lumen', 'Dallas → Houston I-45 long-haul', 'long_haul', 'lit',
   32.7831, -96.7910, 29.7600, -95.3700,
   'https://www.lumen.com/network-maps/'),

  ('Zayo', 'Dallas → Austin → San Antonio I-35 long-haul', 'long_haul', 'lit',
   32.7831, -96.7910, 29.4220, -98.6790,
   'https://www.zayo.com/network/'),

  ('Cogent', 'Dallas → El Paso I-20 long-haul', 'long_haul', 'lit',
   32.7831, -96.7910, 31.7600, -106.4870,
   'https://www.cogentco.com/en/network/network-map'),

  ('Crown Castle', 'Houston → Austin → San Antonio metro ring', 'metro', 'lit',
   29.7600, -95.3700, 29.4220, -98.6790,
   'https://www.crowncastle.com/communications-infrastructure/fiber'),

  ('Lumen', 'Houston → New Orleans Gulf Coast', 'long_haul', 'lit',
   29.7600, -95.3700, 29.9510, -90.0710,
   'https://www.lumen.com/network-maps/'),

  ('Zayo', 'Dallas → Tulsa → Kansas City North corridor', 'long_haul', 'lit',
   32.7831, -96.7910, 36.1540, -95.9930,
   'https://www.zayo.com/network/'),

  ('Windstream', 'Dallas → Lubbock → Albuquerque West corridor', 'long_haul', 'lit',
   32.7831, -96.7910, 33.5777, -101.8550,
   'https://www.windstream.com/'),

  ('AT&T', 'San Antonio → Laredo border route', 'long_haul', 'lit',
   29.4220, -98.6790, 27.5060, -99.5070,
   'https://www.att.com/'),

  ('GTT', 'Dallas → Austin → Houston Triangle', 'long_haul', 'lit',
   32.7831, -96.7910, 30.2670, -97.7530,
   'https://www.gtt.net/'),

  ('Cox Business', 'Houston metro dark fiber', 'metro', 'dark',
   29.7600, -95.3700, 29.5400, -95.1900,
   'https://www.coxbusiness.com/');

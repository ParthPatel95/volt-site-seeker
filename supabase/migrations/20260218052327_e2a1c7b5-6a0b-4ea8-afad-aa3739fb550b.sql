
-- ============================================================
-- Table 1: aeso_market_snapshots
-- Unified periodic snapshots of all AESO API data
-- ============================================================
CREATE TABLE public.aeso_market_snapshots (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  timestamp TIMESTAMPTZ NOT NULL,
  snapshot_type TEXT NOT NULL DEFAULT 'realtime',

  -- Pool Price
  pool_price NUMERIC,
  system_marginal_price NUMERIC,

  -- Load
  ail_mw NUMERIC,
  forecast_ail_mw NUMERIC,

  -- Generation Capacity & Outages
  total_installed_capacity_mw NUMERIC,
  total_available_capacity_mw NUMERIC,
  total_outage_mw NUMERIC,
  planned_outage_mw NUMERIC,
  forced_outage_mw NUMERIC,

  -- Operating Reserves (detailed)
  or_dispatched_mw NUMERIC,
  or_clearing_price NUMERIC,
  or_regulating_mw NUMERIC,
  or_spinning_mw NUMERIC,
  or_supplemental_mw NUMERIC,

  -- Interchange flows
  interchange_bc_flow_mw NUMERIC,
  interchange_sk_flow_mw NUMERIC,
  interchange_mt_flow_mw NUMERIC,

  -- Interchange capability (limits)
  interchange_bc_capability_mw NUMERIC,
  interchange_sk_capability_mw NUMERIC,
  interchange_mt_capability_mw NUMERIC,

  -- Merit Order Summary
  merit_order_depth INTEGER,
  marginal_fuel_type TEXT,
  merit_order_snapshot JSONB,

  -- Generation by fuel
  generation_gas_mw NUMERIC,
  generation_wind_mw NUMERIC,
  generation_solar_mw NUMERIC,
  generation_hydro_mw NUMERIC,
  generation_coal_mw NUMERIC,
  generation_other_mw NUMERIC,

  -- Metadata
  data_sources JSONB,
  created_at TIMESTAMPTZ DEFAULT now(),

  UNIQUE(timestamp, snapshot_type)
);

CREATE INDEX idx_ams_timestamp ON public.aeso_market_snapshots(timestamp DESC);
CREATE INDEX idx_ams_type_ts ON public.aeso_market_snapshots(snapshot_type, timestamp DESC);

ALTER TABLE public.aeso_market_snapshots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to market snapshots"
  ON public.aeso_market_snapshots FOR SELECT USING (true);

CREATE POLICY "Allow service role insert to market snapshots"
  ON public.aeso_market_snapshots FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow service role update to market snapshots"
  ON public.aeso_market_snapshots FOR UPDATE USING (true);

-- ============================================================
-- Table 2: aeso_assets
-- Reference table for all AIES-connected assets
-- ============================================================
CREATE TABLE public.aeso_assets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  asset_id TEXT UNIQUE NOT NULL,
  asset_name TEXT,
  fuel_type TEXT,
  sub_fuel_type TEXT,
  installed_capacity_mw NUMERIC,
  net_to_grid_capacity_mw NUMERIC,
  owner TEXT,
  operating_status TEXT,
  region TEXT,
  last_updated TIMESTAMPTZ DEFAULT now(),
  metadata JSONB
);

CREATE INDEX idx_aa_fuel ON public.aeso_assets(fuel_type);
CREATE INDEX idx_aa_status ON public.aeso_assets(operating_status);

ALTER TABLE public.aeso_assets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to assets"
  ON public.aeso_assets FOR SELECT USING (true);

CREATE POLICY "Allow service role insert to assets"
  ON public.aeso_assets FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow service role update to assets"
  ON public.aeso_assets FOR UPDATE USING (true);

-- ============================================================
-- Table 3: aeso_outages
-- Track generation, interchange, and load outages
-- ============================================================
CREATE TABLE public.aeso_outages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  outage_type TEXT NOT NULL,
  asset_id TEXT,
  asset_name TEXT,
  outage_mw NUMERIC,
  start_time TIMESTAMPTZ,
  end_time TIMESTAMPTZ,
  reason TEXT,
  status TEXT DEFAULT 'active',
  source_api TEXT,
  fetched_at TIMESTAMPTZ DEFAULT now(),
  metadata JSONB
);

CREATE INDEX idx_ao_type_time ON public.aeso_outages(outage_type, start_time DESC);
CREATE INDEX idx_ao_active ON public.aeso_outages(status) WHERE status = 'active';
CREATE INDEX idx_ao_asset ON public.aeso_outages(asset_id);

ALTER TABLE public.aeso_outages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to outages"
  ON public.aeso_outages FOR SELECT USING (true);

CREATE POLICY "Allow service role insert to outages"
  ON public.aeso_outages FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow service role update to outages"
  ON public.aeso_outages FOR UPDATE USING (true);

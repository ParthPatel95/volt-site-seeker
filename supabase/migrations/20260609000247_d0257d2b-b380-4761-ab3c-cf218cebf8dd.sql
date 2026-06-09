
-- Append-only raw history of every AESO observation we pull.
-- Never overwritten; one row per ingestion event.
CREATE TABLE IF NOT EXISTS public.aeso_raw_price_observations (
  id BIGSERIAL PRIMARY KEY,
  observed_for TIMESTAMPTZ NOT NULL,          -- hour-ending the value applies to (UTC)
  observed_at TIMESTAMPTZ NOT NULL DEFAULT now(), -- when we pulled it
  pool_price NUMERIC,
  system_marginal_price NUMERIC,
  forecast_pool_price NUMERIC,
  ail_demand_mw NUMERIC,
  source TEXT NOT NULL,                       -- e.g. 'aeso-data-collector','aeso-comprehensive-backfill'
  source_endpoint TEXT,                       -- AESO API path used
  revision_id TEXT,                           -- AESO-provided revision/version if any
  api_response_status INTEGER,
  request_id UUID NOT NULL DEFAULT gen_random_uuid(),
  raw_payload JSONB,                          -- full raw record from AESO
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_aeso_raw_obs_for ON public.aeso_raw_price_observations (observed_for DESC);
CREATE INDEX IF NOT EXISTS idx_aeso_raw_obs_at ON public.aeso_raw_price_observations (observed_at DESC);
CREATE INDEX IF NOT EXISTS idx_aeso_raw_obs_source ON public.aeso_raw_price_observations (source, observed_for DESC);

GRANT SELECT ON public.aeso_raw_price_observations TO authenticated;
GRANT ALL ON public.aeso_raw_price_observations TO service_role;

ALTER TABLE public.aeso_raw_price_observations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can read raw AESO observations"
  ON public.aeso_raw_price_observations FOR SELECT
  TO authenticated
  USING (true);

-- Service role bypasses RLS; no insert policy needed for clients (append-only via edge functions).

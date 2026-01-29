-- Create table to persist scrap metal prices across function cold starts
CREATE TABLE public.scrap_metal_price_cache (
  id TEXT PRIMARY KEY DEFAULT 'current',
  prices JSONB NOT NULL,
  fetched_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL,
  api_calls_today INTEGER DEFAULT 1,
  last_api_call_date DATE DEFAULT CURRENT_DATE
);

-- No RLS needed - this is internal system cache
ALTER TABLE public.scrap_metal_price_cache ENABLE ROW LEVEL SECURITY;

-- Allow edge functions to read/write (service role)
CREATE POLICY "Service role full access" ON public.scrap_metal_price_cache
  FOR ALL USING (true) WITH CHECK (true);
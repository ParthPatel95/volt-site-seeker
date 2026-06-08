CREATE TABLE IF NOT EXISTS public.alberta_fiber_depth_cache (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cache_key text NOT NULL UNIQUE,
  lat double precision NOT NULL,
  lng double precision NOT NULL,
  payload jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_alberta_fiber_depth_cache_key
  ON public.alberta_fiber_depth_cache(cache_key);

GRANT SELECT ON public.alberta_fiber_depth_cache TO authenticated;
GRANT ALL ON public.alberta_fiber_depth_cache TO service_role;

ALTER TABLE public.alberta_fiber_depth_cache ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can read fiber depth cache"
  ON public.alberta_fiber_depth_cache
  FOR SELECT
  TO authenticated
  USING (true);
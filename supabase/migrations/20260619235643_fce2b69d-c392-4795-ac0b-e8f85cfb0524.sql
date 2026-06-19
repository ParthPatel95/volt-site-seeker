
ALTER TABLE public.scraping_jobs
  ADD COLUMN IF NOT EXISTS scraper_key text,
  ADD COLUMN IF NOT EXISTS params jsonb,
  ADD COLUMN IF NOT EXISTS items_found integer,
  ADD COLUMN IF NOT EXISTS items_new integer,
  ADD COLUMN IF NOT EXISTS result_summary jsonb,
  ADD COLUMN IF NOT EXISTS triggered_by uuid;

CREATE INDEX IF NOT EXISTS scraping_jobs_scraper_key_started_at_idx
  ON public.scraping_jobs (scraper_key, started_at DESC);

-- BRIN indexes on (lat, lng) for the Site Intelligence reference tables.
--
-- These tables are all read-mostly geographic lookups (climate normals,
-- hazard grid, water licences, etc.) used by the SiteWorkspace panels.
-- Rows are clustered by region in practice, which is what BRIN was designed
-- for: a fraction of the storage cost of a B-tree, and dramatically better
-- than a sequential scan for bbox-style range queries (`lat BETWEEN ... AND ...`
-- AND lng BETWEEN ... AND ...). CREATE INDEX IF NOT EXISTS keeps the migration
-- idempotent if re-run.

CREATE INDEX IF NOT EXISTS idx_alberta_climate_normals_latlng_brin
  ON public.alberta_climate_normals USING BRIN (lat, lng);

CREATE INDEX IF NOT EXISTS idx_alberta_hazard_grid_latlng_brin
  ON public.alberta_hazard_grid USING BRIN (lat, lng);

CREATE INDEX IF NOT EXISTS idx_alberta_water_licences_latlng_brin
  ON public.alberta_water_licences USING BRIN (lat, lng);

CREATE INDEX IF NOT EXISTS idx_alberta_municipal_incentives_latlng_brin
  ON public.alberta_municipal_incentives USING BRIN (lat, lng);

CREATE INDEX IF NOT EXISTS idx_cloud_regions_latlng_brin
  ON public.cloud_regions USING BRIN (lat, lng);

CREATE INDEX IF NOT EXISTS idx_internet_exchanges_latlng_brin
  ON public.internet_exchanges USING BRIN (lat, lng);

CREATE INDEX IF NOT EXISTS idx_alberta_logistics_assets_latlng_brin
  ON public.alberta_logistics_assets USING BRIN (lat, lng);

CREATE INDEX IF NOT EXISTS idx_alberta_generation_assets_latlng_brin
  ON public.alberta_generation_assets USING BRIN (lat, lng);

CREATE INDEX IF NOT EXISTS idx_alberta_population_centres_latlng_brin
  ON public.alberta_population_centres USING BRIN (lat, lng);

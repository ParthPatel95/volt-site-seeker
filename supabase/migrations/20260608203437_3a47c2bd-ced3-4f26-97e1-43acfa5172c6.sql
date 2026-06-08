
ALTER TABLE public.alberta_workforce_stats        ADD COLUMN IF NOT EXISTS confidence TEXT NOT NULL DEFAULT 'estimated';
ALTER TABLE public.alberta_post_secondary         ADD COLUMN IF NOT EXISTS confidence TEXT NOT NULL DEFAULT 'estimated';
ALTER TABLE public.alberta_construction_capacity  ADD COLUMN IF NOT EXISTS confidence TEXT NOT NULL DEFAULT 'estimated';
ALTER TABLE public.alberta_construction_wages     ADD COLUMN IF NOT EXISTS confidence TEXT NOT NULL DEFAULT 'estimated';
ALTER TABLE public.alberta_regulatory_zones       ADD COLUMN IF NOT EXISTS confidence TEXT NOT NULL DEFAULT 'estimated';
ALTER TABLE public.alberta_carrier_pop_details    ADD COLUMN IF NOT EXISTS confidence TEXT NOT NULL DEFAULT 'estimated';
ALTER TABLE public.alberta_last_mile_providers    ADD COLUMN IF NOT EXISTS confidence TEXT NOT NULL DEFAULT 'estimated';
ALTER TABLE public.alberta_dark_fiber_inventory   ADD COLUMN IF NOT EXISTS confidence TEXT NOT NULL DEFAULT 'estimated';

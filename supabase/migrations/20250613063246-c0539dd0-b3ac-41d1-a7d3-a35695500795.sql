
-- Add missing fields to scraped_properties table (only the ones that don't exist)
ALTER TABLE public.scraped_properties 
ADD COLUMN IF NOT EXISTS lot_size_acres NUMERIC,
ADD COLUMN IF NOT EXISTS price_per_sqft NUMERIC,
ADD COLUMN IF NOT EXISTS year_built INTEGER;

-- Add indexes for better performance (only if they don't exist)
CREATE INDEX IF NOT EXISTS idx_scraped_properties_city_state ON public.scraped_properties(city, state);
CREATE INDEX IF NOT EXISTS idx_scraped_properties_property_type ON public.scraped_properties(property_type);
CREATE INDEX IF NOT EXISTS idx_scraped_properties_scraped_at ON public.scraped_properties(scraped_at DESC);
CREATE INDEX IF NOT EXISTS idx_scraped_properties_source ON public.scraped_properties(source);

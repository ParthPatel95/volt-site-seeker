
-- Delete all existing scraped properties data
DELETE FROM public.scraped_properties;

-- Reset the sequence if needed to start fresh with clean IDs
-- This ensures we start fresh with clean data

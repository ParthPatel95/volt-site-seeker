
-- Delete all synthetic data from scraped_properties table
-- This will remove properties that were generated rather than scraped from real sources
DELETE FROM public.scraped_properties 
WHERE source IN ('ai_scraper', 'market_intelligence', 'synthetic_data') 
   OR description LIKE '%Market Intelligence%'
   OR description LIKE '%algorithmically generated%'
   OR address LIKE '%Industrial Parkway%'
   OR address LIKE '%Commerce Boulevard%'
   OR address LIKE '%Manufacturing Drive%';

-- Also clean up any properties that look like they were generated (common patterns)
DELETE FROM public.scraped_properties 
WHERE (address LIKE '%1000 %' OR address LIKE '%1150 %' OR address LIKE '%1300 %')
   AND (address LIKE '%Industrial%' OR address LIKE '%Commerce%' OR address LIKE '%Manufacturing%')
   AND source != 'loopnet'
   AND source != 'crexi'
   AND source != 'realtor_ca';

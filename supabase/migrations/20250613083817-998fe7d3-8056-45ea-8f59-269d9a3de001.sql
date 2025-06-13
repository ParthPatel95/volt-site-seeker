
-- Delete all existing scraped properties data to start fresh with real data only
DELETE FROM public.scraped_properties;

-- Also clean up any remaining synthetic data that might have been missed
DELETE FROM public.properties 
WHERE source = 'ai_scraper' 
   OR address LIKE '%Post Oak Blvd%'
   OR address LIKE '%McKinney Street%'
   OR address LIKE '%Technology Way%'
   OR address LIKE '%Commerce Boulevard%'
   OR address LIKE '%Industrial Parkway%'
   OR address LIKE '%Manufacturing Drive%'
   OR address LIKE '%Logistics Drive%'
   OR address LIKE '%Opportunity Lane%';

-- Clean up related data for deleted properties
DELETE FROM public.volt_scores 
WHERE property_id NOT IN (SELECT id FROM public.properties);

DELETE FROM public.property_notes 
WHERE property_id NOT IN (SELECT id FROM public.properties);

DELETE FROM public.property_brokers 
WHERE property_id NOT IN (SELECT id FROM public.properties);

DELETE FROM public.alerts 
WHERE property_id IS NOT NULL 
AND property_id NOT IN (SELECT id FROM public.properties);

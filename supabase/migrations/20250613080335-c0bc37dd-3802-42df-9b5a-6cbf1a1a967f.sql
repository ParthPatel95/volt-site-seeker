
-- Clean up all old synthetic/fake data from the database
-- This will remove all non-real property data to ensure only authentic data is shown

-- Delete all synthetic data from scraped_properties table
DELETE FROM public.scraped_properties 
WHERE source IN ('ai_scraper', 'synthetic_data', 'mock_data', 'test_data')
   OR address LIKE '%Industrial Parkway%'
   OR address LIKE '%Commerce Boulevard%'
   OR address LIKE '%Manufacturing Drive%'
   OR address LIKE '%Technology Way%'
   OR address LIKE '%Post Oak Blvd%'
   OR address LIKE '%McKinney Street%'
   OR description LIKE '%Market Intelligence%'
   OR description LIKE '%algorithmically generated%'
   OR description LIKE '%synthetic%'
   OR description LIKE '%mock%'
   OR description LIKE '%test%';

-- Delete synthetic data from properties table
DELETE FROM public.properties 
WHERE source IN ('ai_scraper', 'synthetic_data', 'mock_data', 'test_data', 'market_intelligence')
   OR address LIKE '%Industrial Parkway%'
   OR address LIKE '%Commerce Boulevard%'
   OR address LIKE '%Manufacturing Drive%'
   OR address LIKE '%Technology Way%'
   OR address LIKE '%Post Oak Blvd%'
   OR address LIKE '%McKinney Street%'
   OR description LIKE '%Market Intelligence%'
   OR description LIKE '%algorithmically generated%'
   OR description LIKE '%synthetic%'
   OR description LIKE '%mock%'
   OR description LIKE '%test%';

-- Clean up related volt_scores for deleted properties
DELETE FROM public.volt_scores 
WHERE property_id NOT IN (SELECT id FROM public.properties);

-- Clean up property_notes for deleted properties
DELETE FROM public.property_notes 
WHERE property_id NOT IN (SELECT id FROM public.properties);

-- Clean up property_brokers for deleted properties
DELETE FROM public.property_brokers 
WHERE property_id NOT IN (SELECT id FROM public.properties);

-- Clean up alerts for deleted properties
DELETE FROM public.alerts 
WHERE property_id IS NOT NULL 
AND property_id NOT IN (SELECT id FROM public.properties);

-- Delete test/synthetic corporate intelligence data
DELETE FROM public.companies 
WHERE name LIKE '%Test%' 
   OR name LIKE '%Mock%'
   OR name LIKE '%Sample%'
   OR sector = 'test';

DELETE FROM public.corporate_insights 
WHERE company_name LIKE '%Test%'
   OR company_name LIKE '%Mock%'
   OR company_name LIKE '%Sample%'
   OR content LIKE '%test%'
   OR content LIKE '%mock%';

DELETE FROM public.distress_alerts 
WHERE company_name LIKE '%Test%'
   OR company_name LIKE '%Mock%'
   OR company_name LIKE '%Sample%';

DELETE FROM public.industry_intelligence 
WHERE company_name LIKE '%Test%'
   OR company_name LIKE '%Mock%'
   OR company_name LIKE '%Sample%'
   OR industry = 'test';

DELETE FROM public.linkedin_intelligence 
WHERE company LIKE '%Test%'
   OR company LIKE '%Mock%'
   OR company LIKE '%Sample%'
   OR content LIKE '%test%'
   OR content LIKE '%mock%';

-- Reset sequences if needed to start fresh
-- This ensures clean auto-incrementing if any tables use sequences


-- Clean up old/test company data and reset the corporate intelligence tables
DELETE FROM public.companies 
WHERE name LIKE '%Test%' 
   OR name LIKE '%Mock%'
   OR name LIKE '%Sample%'
   OR name LIKE '%Corp%'
   OR name LIKE '%Industries%'
   OR name LIKE '%Systems%'
   OR name LIKE '%Inc%'
   OR sector = 'test'
   OR industry LIKE '%test%'
   OR analyzed_at < '2025-06-14'::date;

-- Clean up related distress alerts for deleted companies
DELETE FROM public.distress_alerts 
WHERE company_name NOT IN (SELECT name FROM public.companies);

-- Clean up corporate insights for deleted companies
DELETE FROM public.corporate_insights 
WHERE company_name NOT IN (SELECT name FROM public.companies);

-- Clean up industry intelligence for deleted companies
DELETE FROM public.industry_intelligence 
WHERE company_name NOT IN (SELECT name FROM public.companies);

-- Clean up linkedin intelligence for deleted companies
DELETE FROM public.linkedin_intelligence 
WHERE company NOT IN (SELECT name FROM public.companies);

-- Reset auto-increment sequences if needed
SELECT setval(pg_get_serial_sequence('companies', 'id'), 1, false);
SELECT setval(pg_get_serial_sequence('distress_alerts', 'id'), 1, false);
SELECT setval(pg_get_serial_sequence('corporate_insights', 'id'), 1, false);
SELECT setval(pg_get_serial_sequence('industry_intelligence', 'id'), 1, false);
SELECT setval(pg_get_serial_sequence('linkedin_intelligence', 'id'), 1, false);

-- Insert realistic demo users into voltmarket_profiles
INSERT INTO public.voltmarket_profiles (user_id, role, seller_type, company_name, phone_number, bio, profile_image_url, website, linkedin_url, is_id_verified, is_email_verified) VALUES
(gen_random_uuid(), 'seller', 'developer', 'GreenTech Energy Solutions', '+1-555-0123', 'Leading renewable energy developer with 15+ years experience in solar and wind projects across the Southwest US.', 'https://images.unsplash.com/photo-1494790108755-2616b612b5bc?w=150', 'https://greentech-energy.com', 'https://linkedin.com/in/sarahchen-energy', true, true),
(gen_random_uuid(), 'seller', 'developer', 'Industrial Power Corp', '+1-555-0124', 'Specializing in industrial power infrastructure and energy-intensive facilities. Over $2B in developed projects.', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150', 'https://industrialpower.com', 'https://linkedin.com/in/mrodriguez-power', true, true),
(gen_random_uuid(), 'buyer', NULL, 'Renewable Energy Partners', '+1-555-0125', 'Investment firm focused on renewable energy assets and sustainable infrastructure with $5B+ AUM.', 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150', 'https://re-partners.com', 'https://linkedin.com/in/ejohnson-energy', true, true),
(gen_random_uuid(), 'seller', 'developer', 'Power Solutions LLC', '+1-555-0126', 'Energy consultant and developer specializing in utility-scale projects and grid interconnection.', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150', 'https://powersolutions.com', 'https://linkedin.com/in/dkim-power', true, true),
(gen_random_uuid(), 'buyer', NULL, 'Clean Energy Ventures', '+1-555-0127', 'Private equity firm investing in clean energy and grid infrastructure. Focus on energy transition technologies.', 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150', 'https://cleanenergyvc.com', 'https://linkedin.com/in/jmartinez-cleantech', true, true),
(gen_random_uuid(), 'seller', 'utility', 'Grid Infrastructure Group', '+1-555-0128', 'Experienced in transmission and distribution infrastructure development. Former utility executive.', 'https://images.unsplash.com/photo-1566492031773-4f4e44671d66?w=150', 'https://gridinfra.com', 'https://linkedin.com/in/rthompson-grid', true, true),
(gen_random_uuid(), 'seller', 'developer', 'Solar Dynamics Inc', '+1-555-0129', 'Solar project developer with portfolio of 2GW+ utility-scale installations across 12 states.', 'https://images.unsplash.com/photo-1594736797933-d0588ee2bd80?w=150', 'https://solardynamics.com', 'https://linkedin.com/in/lwang-solar', true, true),
(gen_random_uuid(), 'buyer', NULL, 'Energy Capital Partners', '+1-555-0130', 'Investment fund specializing in energy infrastructure acquisitions. $10B+ in energy investments.', 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150', 'https://energycapital.com', 'https://linkedin.com/in/janderson-energycap', true, true),
(gen_random_uuid(), 'seller', 'developer', 'Wind Power Systems', '+1-555-0131', 'Wind energy developer with expertise in offshore and onshore projects. 1.5GW portfolio.', 'https://images.unsplash.com/photo-1534751516642-a1af1ef26a56?w=150', 'https://windpowersys.com', 'https://linkedin.com/in/mgarcia-wind', true, true),
(gen_random_uuid(), 'seller', 'manufacturer', 'Battery Storage Solutions', '+1-555-0132', 'Leading provider of grid-scale battery storage systems. 500MWh+ deployed globally.', 'https://images.unsplash.com/photo-1553729459-efe14ef6055d?w=150', 'https://batterystorage.com', 'https://linkedin.com/in/tbrown-battery', true, true),
(gen_random_uuid(), 'seller', 'developer', 'Hydropower Innovations', '+1-555-0133', 'Small hydro and micro-hydro specialist. Sustainable water power solutions for 20+ years.', 'https://images.unsplash.com/photo-1543610892-0b1f7e6d8ac1?w=150', 'https://hydroinnovations.com', 'https://linkedin.com/in/apatrick-hydro', true, true),
(gen_random_uuid(), 'buyer', NULL, 'Infrastructure Investment Corp', '+1-555-0134', 'Large-scale infrastructure investment with focus on energy transition projects.', 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=150', 'https://infrainvest.com', 'https://linkedin.com/in/staylor-infra', true, true),
(gen_random_uuid(), 'seller', 'manufacturer', 'Turbine Technologies', '+1-555-0135', 'Wind turbine manufacturer and refurbishment specialist. Certified pre-owned equipment.', 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=150', 'https://turbinetech.com', 'https://linkedin.com/in/clee-turbine', true, true),
(gen_random_uuid(), 'seller', 'developer', 'Energy Storage Dynamics', '+1-555-0136', 'Grid-scale energy storage developer and operator. Focus on frequency regulation and arbitrage.', 'https://images.unsplash.com/photo-1590736969955-71cc94901144?w=150', 'https://energystorage.com', 'https://linkedin.com/in/rjones-storage', true, true),
(gen_random_uuid(), 'buyer', NULL, 'Green Capital Fund', '+1-555-0137', 'ESG-focused investment fund specializing in renewable energy and sustainability projects.', 'https://images.unsplash.com/photo-1574126154517-d1e0d89ef734?w=150', 'https://greencapital.com', 'https://linkedin.com/in/ldavis-green', true, true),
(gen_random_uuid(), 'seller', 'developer', 'Geothermal Energy Corp', '+1-555-0138', 'Geothermal energy development and enhanced geothermal systems. Deep earth expertise.', 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=150', 'https://geothermalcorp.com', 'https://linkedin.com/in/kwilson-geo', true, true),
(gen_random_uuid(), 'seller', 'utility', 'Regional Power Authority', '+1-555-0139', 'Public utility authority with surplus generation assets. Regulatory compliant sales.', 'https://images.unsplash.com/photo-1556157382-97eda2d62296?w=150', 'https://regionpower.gov', 'https://linkedin.com/in/mmiller-utility', true, true),
(gen_random_uuid(), 'buyer', NULL, 'Pension Fund Energy Investments', '+1-555-0140', 'Institutional investor seeking long-term energy infrastructure investments for pension portfolios.', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150', 'https://pensionfund.com', 'https://linkedin.com/in/awhite-pension', true, true),
(gen_random_uuid(), 'seller', 'developer', 'Biomass Power Solutions', '+1-555-0141', 'Biomass and waste-to-energy project developer. Sustainable waste management and power generation.', 'https://images.unsplash.com/photo-1487837647815-bbc8f9d49c15?w=150', 'https://biomasspower.com', 'https://linkedin.com/in/jharris-biomass', true, true),
(gen_random_uuid(), 'seller', 'manufacturer', 'Solar Panel Distributors', '+1-555-0142', 'Tier-1 solar panel distributor with warehouse locations nationwide. Bulk pricing available.', 'https://images.unsplash.com/photo-1573164713988-8665fc963095?w=150', 'https://solarpanels.com', 'https://linkedin.com/in/bclark-solar', true, true);

-- Insert sample listings for different types
INSERT INTO public.voltmarket_listings (seller_id, listing_type, title, description, location, power_capacity_mw, asking_price, is_featured, views_count, status, property_type, facility_tier, available_power_mw, power_rate_per_kw, cooling_type, hosting_types, minimum_commitment_months, specs) 
SELECT 
  vp.id as seller_id,
  'site',
  'Premium Data Center Site - Phoenix',
  'Fully permitted 250MW data center development site with existing electrical infrastructure. Tier III design specifications with dual power feeds and redundant cooling systems. Located in Arizona''s premier technology corridor with excellent fiber connectivity.',
  'Phoenix, Arizona',
  250,
  45000000,
  true,
  1247,
  'active',
  'data_center',
  'tier_3',
  250,
  0.065,
  'evaporative',
  ARRAY['mining', 'ai_training', 'hpc'],
  12,
  '{"land_acres": 50, "building_sqft": 500000, "redundancy": "2N", "fiber_providers": 5, "utility_feeds": 2}'
FROM public.voltmarket_profiles vp 
WHERE vp.company_name = 'GreenTech Energy Solutions'
LIMIT 1;

INSERT INTO public.voltmarket_listings (seller_id, listing_type, title, description, location, power_capacity_mw, asking_price, is_featured, views_count, status, equipment_type, brand, model, specs, equipment_condition, manufacture_year, quantity) 
SELECT 
  vp.id as seller_id,
  'equipment',
  'Vestas V90 Wind Turbine Portfolio',
  'Portfolio of 25 Vestas V90 3MW wind turbines. Excellent condition with full service history. Average capacity factor 35%. Perfect for wind farm expansion or new development.',
  'Kansas',
  75,
  18500000,
  true,
  892,
  'active',
  'wind_turbine',
  'Vestas',
  'V90-3.0MW',
  '{"rotor_diameter_m": 90, "hub_height_m": 105, "rated_power_mw": 3.0, "cut_in_speed_ms": 4, "rated_speed_ms": 15, "service_agreement": "active"}',
  'excellent',
  2018,
  25
FROM public.voltmarket_profiles vp 
WHERE vp.company_name = 'Wind Power Systems'
LIMIT 1;

-- Continue adding more listings...
INSERT INTO public.voltmarket_listings (seller_id, listing_type, title, description, location, power_capacity_mw, asking_price, is_featured, views_count, status, equipment_type, brand, model, specs, equipment_condition, manufacture_year, quantity) 
SELECT 
  vp.id as seller_id,
  'equipment',
  'Tesla Megapack Battery Systems',
  '50MWh Tesla Megapack battery storage system. Grid-scale energy storage perfect for frequency regulation, peak shaving, and renewable integration. Includes installation and commissioning.',
  'California',
  25,
  12000000,
  true,
  1456,
  'active',
  'battery_storage',
  'Tesla',
  'Megapack',
  '{"capacity_mwh": 50, "warranty_years": 10, "round_trip_efficiency": 92.5, "response_time_ms": 250, "fire_suppression": "integrated"}',
  'new',
  2023,
  2
FROM public.voltmarket_profiles vp 
WHERE vp.company_name = 'Battery Storage Solutions'
LIMIT 1;
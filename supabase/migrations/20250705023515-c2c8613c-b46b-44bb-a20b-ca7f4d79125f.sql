-- Add sample listings for testing
INSERT INTO voltmarket_listings (
  seller_id, 
  listing_type, 
  title, 
  description, 
  location, 
  power_capacity_mw, 
  asking_price, 
  status
) VALUES 
(
  'bb93574c-b196-4c93-bd0a-74e100163763', 
  'site_sale', 
  'Premium Texas Data Center Site', 
  'Exceptional 150MW power capacity site in Dallas, Texas. Tier 3 facility with redundant power and cooling systems. Perfect for large-scale mining operations with direct utility connection and backup generators.', 
  'Dallas, TX', 
  150, 
  12500000, 
  'active'
),
(
  'bb93574c-b196-4c93-bd0a-74e100163763', 
  'site_lease', 
  'Alberta Mining Facility for Lease', 
  'Industrial mining facility in Calgary with 85MW capacity. Excellent access to hydroelectric power at competitive rates. Includes cooling infrastructure and 24/7 security.', 
  'Calgary, AB', 
  85, 
  45000, 
  'active'
),
(
  'bb93574c-b196-4c93-bd0a-74e100163763', 
  'hosting', 
  'Quebec Hydro Mining Hosting', 
  'Professional hosting services with Quebec hydro power. Competitive rates and professional management. Tier 1 facility with redundant power and cooling.', 
  'Montreal, QC', 
  200, 
  NULL, 
  'active'
),
(
  'bb93574c-b196-4c93-bd0a-74e100163763', 
  'equipment', 
  'Antminer S19 Pro - 25 Units', 
  'Brand new Antminer S19 Pro units, 110 TH/s each. Never used, factory sealed. Bulk pricing available for serious buyers.', 
  'Toronto, ON', 
  NULL, 
  850000, 
  'active'
);

-- Update the hosting listing with proper power rate
UPDATE voltmarket_listings 
SET power_rate_per_kw = 0.045 
WHERE listing_type = 'hosting' AND title = 'Quebec Hydro Mining Hosting';

-- Add equipment details to the equipment listing
UPDATE voltmarket_listings 
SET brand = 'Bitmain', model = 'Antminer S19 Pro', quantity = 25, equipment_condition = 'new'
WHERE listing_type = 'equipment' AND title = 'Antminer S19 Pro - 25 Units';
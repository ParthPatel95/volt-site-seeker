-- Create profiles table for additional user information
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  company_name TEXT,
  role TEXT DEFAULT 'buyer',
  phone_number TEXT,
  bio TEXT,
  avatar_url TEXT,
  website TEXT,
  linkedin_url TEXT,
  is_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create voltmarket_listings table
CREATE TABLE IF NOT EXISTS public.voltmarket_listings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  seller_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  listing_type TEXT NOT NULL DEFAULT 'site',
  power_capacity_mw NUMERIC,
  asking_price NUMERIC NOT NULL,
  location TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  featured BOOLEAN DEFAULT false,
  images TEXT[] DEFAULT '{}',
  specifications JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on both tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.voltmarket_listings ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles
CREATE POLICY "Profiles are viewable by everyone" 
ON public.profiles 
FOR SELECT 
USING (true);

CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create policies for listings
CREATE POLICY "Listings are viewable by everyone" 
ON public.voltmarket_listings 
FOR SELECT 
USING (status = 'active');

CREATE POLICY "Sellers can manage their own listings" 
ON public.voltmarket_listings 
FOR ALL 
USING (seller_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

-- Add trigger for automatic timestamp updates on profiles
CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add trigger for automatic timestamp updates on listings
CREATE TRIGGER update_listings_updated_at
BEFORE UPDATE ON public.voltmarket_listings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample users (these will be created without auth.users entries for demo purposes)
INSERT INTO public.profiles (id, user_id, display_name, company_name, role, phone_number, bio, avatar_url, website, is_verified) VALUES
(gen_random_uuid(), gen_random_uuid(), 'Sarah Chen', 'GreenTech Energy Solutions', 'seller', '+1-555-0123', 'Leading renewable energy developer with 15+ years experience in solar and wind projects.', 'https://images.unsplash.com/photo-1494790108755-2616b612b5bc?w=150', 'https://greentech-energy.com', true),
(gen_random_uuid(), gen_random_uuid(), 'Michael Rodriguez', 'Industrial Power Corp', 'seller', '+1-555-0124', 'Specializing in industrial power infrastructure and energy-intensive facilities.', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150', 'https://industrialpower.com', true),
(gen_random_uuid(), gen_random_uuid(), 'Emily Johnson', 'Renewable Energy Partners', 'buyer', '+1-555-0125', 'Investment firm focused on renewable energy assets and sustainable infrastructure.', 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150', 'https://re-partners.com', true),
(gen_random_uuid(), gen_random_uuid(), 'David Kim', 'Power Solutions LLC', 'seller', '+1-555-0126', 'Energy consultant and developer specializing in utility-scale projects.', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150', 'https://powersolutions.com', true),
(gen_random_uuid(), gen_random_uuid(), 'Jennifer Martinez', 'Clean Energy Ventures', 'buyer', '+1-555-0127', 'Private equity firm investing in clean energy and grid infrastructure.', 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150', 'https://cleanenergyvc.com', true),
(gen_random_uuid(), gen_random_uuid(), 'Robert Thompson', 'Grid Infrastructure Group', 'seller', '+1-555-0128', 'Experienced in transmission and distribution infrastructure development.', 'https://images.unsplash.com/photo-1566492031773-4f4e44671d66?w=150', 'https://gridinfra.com', true),
(gen_random_uuid(), gen_random_uuid(), 'Lisa Wang', 'Solar Dynamics Inc', 'seller', '+1-555-0129', 'Solar project developer with portfolio of utility-scale installations.', 'https://images.unsplash.com/photo-1594736797933-d0588ee2bd80?w=150', 'https://solardynamics.com', true),
(gen_random_uuid(), gen_random_uuid(), 'James Anderson', 'Energy Capital Partners', 'buyer', '+1-555-0130', 'Investment fund specializing in energy infrastructure acquisitions.', 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150', 'https://energycapital.com', true),
(gen_random_uuid(), gen_random_uuid(), 'Maria Garcia', 'Wind Power Systems', 'seller', '+1-555-0131', 'Wind energy developer with expertise in offshore and onshore projects.', 'https://images.unsplash.com/photo-1534751516642-a1af1ef26a56?w=150', 'https://windpowersys.com', true),
(gen_random_uuid(), gen_random_uuid(), 'Thomas Brown', 'Battery Storage Solutions', 'seller', '+1-555-0132', 'Leading provider of grid-scale battery storage systems.', 'https://images.unsplash.com/photo-1553729459-efe14ef6055d?w=150', 'https://batterystorage.com', true);

-- Insert sample listings using the profile IDs
INSERT INTO public.voltmarket_listings (seller_id, title, description, listing_type, power_capacity_mw, asking_price, location, featured, images, specifications) 
SELECT 
  p.id as seller_id,
  listing_data.title,
  listing_data.description,
  listing_data.listing_type,
  listing_data.power_capacity_mw,
  listing_data.asking_price,
  listing_data.location,
  listing_data.featured,
  listing_data.images,
  listing_data.specifications
FROM public.profiles p
CROSS JOIN (
  VALUES 
    ('Premium Solar Farm - Ready to Build', 'Fully permitted 250MW solar development site with interconnection agreement. Includes land lease, environmental permits, and grid connection studies completed.', 'site', 250, 45000000, 'Phoenix, Arizona', true, ARRAY['https://images.unsplash.com/photo-1548613053-6147bb40b48b?w=800', 'https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?w=800'], '{"land_acres": 1200, "interconnection_mw": 250, "permit_status": "approved", "construction_timeline": "18 months"}'),
    ('Industrial Data Center Campus', '150MW data center development opportunity with existing power infrastructure and fiber connectivity. Zoned for industrial use.', 'site', 150, 28000000, 'Austin, Texas', true, ARRAY['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800'], '{"building_sqft": 500000, "power_redundancy": "N+1", "cooling_system": "evaporative", "fiber_providers": 3}'),
    ('Wind Turbine Portfolio - Vestas V90', 'Portfolio of 25 Vestas V90 3MW wind turbines. Well maintained with service agreements. Average capacity factor 35%.', 'equipment', 75, 18500000, 'Kansas', false, ARRAY['https://images.unsplash.com/photo-1466611653911-95081537e5b7?w=800'], '{"manufacturer": "Vestas", "model": "V90", "year": 2018, "service_agreement": "active", "capacity_factor": "35%"}'),
    ('Battery Storage System - Tesla Megapack', '50MWh Tesla Megapack battery storage system. Grid-scale energy storage for frequency regulation and peak shaving.', 'equipment', 25, 12000000, 'California', true, ARRAY['https://images.unsplash.com/photo-1593941707874-ef25b8b4a92b?w=800'], '{"capacity_mwh": 50, "manufacturer": "Tesla", "installation_year": 2022, "warranty_remaining": "8 years"}'),
    ('Hydroelectric Plant - Modernization Opportunity', '45MW run-of-river hydroelectric facility requiring turbine upgrades. Excellent water rights and long-term PPA.', 'site', 45, 35000000, 'Oregon', false, ARRAY['https://images.unsplash.com/photo-1419833479618-221cfe337d8a?w=800'], '{"water_rights": "perpetual", "ppa_term": "15 years", "upgrade_potential": "60MW", "environmental_compliance": "current"}'),
    ('Natural Gas Peaker Plant', '200MW natural gas peaking facility with dual fuel capability. Strategic location for grid reliability services.', 'site', 200, 65000000, 'New York', false, ARRAY['https://images.unsplash.com/photo-1565726964055-0a1ab446b8a9?w=800'], '{"fuel_type": "dual", "heat_rate": "9500 BTU/kWh", "environmental_controls": "SCR, CO catalyst", "grid_services": "frequency response"}')
) AS listing_data(title, description, listing_type, power_capacity_mw, asking_price, location, featured, images, specifications)
WHERE p.role = 'seller'
LIMIT 35;
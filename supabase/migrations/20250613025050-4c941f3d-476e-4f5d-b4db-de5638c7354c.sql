
-- Create table for scraped properties (separate from main properties)
CREATE TABLE public.scraped_properties (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  zip_code TEXT,
  property_type TEXT NOT NULL,
  square_footage INTEGER,
  lot_size_acres NUMERIC,
  asking_price NUMERIC,
  price_per_sqft NUMERIC,
  year_built INTEGER,
  power_capacity_mw NUMERIC,
  substation_distance_miles NUMERIC,
  transmission_access BOOLEAN DEFAULT false,
  zoning TEXT,
  description TEXT,
  listing_url TEXT,
  source TEXT NOT NULL DEFAULT 'ai_scraper',
  scraped_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  moved_to_properties BOOLEAN DEFAULT false,
  ai_analysis JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add Row Level Security
ALTER TABLE public.scraped_properties ENABLE ROW LEVEL SECURITY;

-- Create policies for scraped properties (accessible to all authenticated users for now)
CREATE POLICY "Users can view scraped properties" 
  ON public.scraped_properties 
  FOR SELECT 
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can insert scraped properties" 
  ON public.scraped_properties 
  FOR INSERT 
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update scraped properties" 
  ON public.scraped_properties 
  FOR UPDATE 
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can delete scraped properties" 
  ON public.scraped_properties 
  FOR DELETE 
  USING (auth.uid() IS NOT NULL);

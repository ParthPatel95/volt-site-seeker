
-- Create table for storing company real estate assets from SEC filings
CREATE TABLE IF NOT EXISTS public.company_real_estate_assets (
  id TEXT NOT NULL PRIMARY KEY,
  company_ticker TEXT,
  company_name TEXT NOT NULL,
  property_type TEXT NOT NULL CHECK (property_type IN ('Office', 'Data Center', 'Industrial', 'Other Industrial Asset')),
  location_description TEXT NOT NULL,
  coordinates POINT,
  source TEXT NOT NULL DEFAULT 'SEC Filing',
  raw_text TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_company_real_estate_assets_company_name ON public.company_real_estate_assets(company_name);
CREATE INDEX IF NOT EXISTS idx_company_real_estate_assets_ticker ON public.company_real_estate_assets(company_ticker);
CREATE INDEX IF NOT EXISTS idx_company_real_estate_assets_property_type ON public.company_real_estate_assets(property_type);

-- Enable Row Level Security (optional - since this is public company data)
ALTER TABLE public.company_real_estate_assets ENABLE ROW LEVEL SECURITY;

-- Create policy to allow read access to all users
CREATE POLICY "Allow read access to real estate assets" 
  ON public.company_real_estate_assets 
  FOR SELECT 
  USING (true);

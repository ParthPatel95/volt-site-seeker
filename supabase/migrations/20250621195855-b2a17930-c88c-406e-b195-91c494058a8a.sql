
-- Create table for storing verified heavy power sites with comprehensive data
CREATE TABLE public.verified_heavy_power_sites (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  coordinates POINT,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  zip_code TEXT,
  
  -- Classification and identification
  naics_code TEXT,
  industry_type TEXT NOT NULL,
  facility_type TEXT,
  business_status TEXT DEFAULT 'unknown',
  
  -- Power and capacity information
  historical_peak_mw NUMERIC,
  estimated_current_mw NUMERIC,
  estimated_free_mw NUMERIC,
  capacity_utilization NUMERIC,
  substation_distance_km NUMERIC,
  transmission_access BOOLEAN DEFAULT false,
  
  -- Confidence and validation scores
  confidence_score INTEGER DEFAULT 0,
  confidence_level TEXT CHECK (confidence_level IN ('High', 'Medium', 'Low')),
  idle_score INTEGER DEFAULT 0,
  power_potential TEXT CHECK (power_potential IN ('High', 'Medium', 'Low')),
  
  -- Source tracking and validation
  data_sources JSONB DEFAULT '[]'::jsonb,
  verified_sources_count INTEGER DEFAULT 0,
  last_verified_at TIMESTAMP WITH TIME ZONE,
  validation_status TEXT DEFAULT 'pending',
  
  -- Satellite and visual analysis
  satellite_image_url TEXT,
  visual_status TEXT CHECK (visual_status IN ('Active', 'Idle', 'Likely Abandoned')),
  satellite_analysis JSONB,
  
  -- Business and financial data
  listing_price NUMERIC,
  price_per_sqft NUMERIC,
  square_footage INTEGER,
  lot_size_acres NUMERIC,
  year_built INTEGER,
  property_type TEXT,
  zoning TEXT,
  
  -- Additional metadata
  environmental_permits JSONB DEFAULT '[]'::jsonb,
  regulatory_status JSONB,
  market_data JSONB,
  risk_factors JSONB DEFAULT '[]'::jsonb,
  
  -- Audit and lifecycle
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  deleted_at TIMESTAMP WITH TIME ZONE,
  created_by UUID REFERENCES auth.users(id),
  
  -- Scan metadata
  scan_id UUID,
  jurisdiction TEXT NOT NULL,
  discovery_method TEXT,
  last_scan_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add Row Level Security
ALTER TABLE public.verified_heavy_power_sites ENABLE ROW LEVEL SECURITY;

-- Create policies for verified heavy power sites
CREATE POLICY "Users can view verified sites" 
  ON public.verified_heavy_power_sites 
  FOR SELECT 
  USING (deleted_at IS NULL);

CREATE POLICY "Users can create verified sites" 
  ON public.verified_heavy_power_sites 
  FOR INSERT 
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their verified sites" 
  ON public.verified_heavy_power_sites 
  FOR UPDATE 
  USING (auth.uid() = created_by AND deleted_at IS NULL);

CREATE POLICY "Users can soft delete their verified sites" 
  ON public.verified_heavy_power_sites 
  FOR UPDATE 
  USING (auth.uid() = created_by);

-- Create indexes for performance
CREATE INDEX idx_verified_sites_jurisdiction ON public.verified_heavy_power_sites(jurisdiction);
CREATE INDEX idx_verified_sites_confidence ON public.verified_heavy_power_sites(confidence_score);
CREATE INDEX idx_verified_sites_coordinates ON public.verified_heavy_power_sites USING GIST(coordinates);
CREATE INDEX idx_verified_sites_industry ON public.verified_heavy_power_sites(industry_type);
CREATE INDEX idx_verified_sites_scan_id ON public.verified_heavy_power_sites(scan_id);
CREATE INDEX idx_verified_sites_deleted ON public.verified_heavy_power_sites(deleted_at);

-- Create table for scan sessions
CREATE TABLE public.site_scan_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  jurisdiction TEXT NOT NULL,
  city TEXT,
  scan_type TEXT NOT NULL DEFAULT 'comprehensive',
  status TEXT NOT NULL DEFAULT 'pending',
  progress INTEGER DEFAULT 0,
  current_phase TEXT,
  
  -- Configuration
  config JSONB DEFAULT '{}'::jsonb,
  filters JSONB DEFAULT '{}'::jsonb,
  
  -- Results and statistics
  sites_discovered INTEGER DEFAULT 0,
  sites_verified INTEGER DEFAULT 0,
  data_sources_used JSONB DEFAULT '[]'::jsonb,
  processing_time_minutes NUMERIC,
  
  -- Audit
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  created_by UUID REFERENCES auth.users(id)
);

-- Enable RLS for scan sessions
ALTER TABLE public.site_scan_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their scan sessions" 
  ON public.site_scan_sessions 
  FOR SELECT 
  USING (auth.uid() = created_by);

CREATE POLICY "Users can create scan sessions" 
  ON public.site_scan_sessions 
  FOR INSERT 
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their scan sessions" 
  ON public.site_scan_sessions 
  FOR UPDATE 
  USING (auth.uid() = created_by);

-- Create function to soft delete sites
CREATE OR REPLACE FUNCTION public.soft_delete_verified_site(site_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.verified_heavy_power_sites 
  SET deleted_at = now(), updated_at = now()
  WHERE id = site_id AND created_by = auth.uid() AND deleted_at IS NULL;
  
  RETURN FOUND;
END;
$$;

-- Create function to bulk delete sites
CREATE OR REPLACE FUNCTION public.bulk_delete_verified_sites(site_ids UUID[])
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  UPDATE public.verified_heavy_power_sites 
  SET deleted_at = now(), updated_at = now()
  WHERE id = ANY(site_ids) AND created_by = auth.uid() AND deleted_at IS NULL;
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$;

-- Create function to restore deleted sites
CREATE OR REPLACE FUNCTION public.restore_verified_site(site_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.verified_heavy_power_sites 
  SET deleted_at = NULL, updated_at = now()
  WHERE id = site_id AND created_by = auth.uid() AND deleted_at IS NOT NULL;
  
  RETURN FOUND;
END;
$$;

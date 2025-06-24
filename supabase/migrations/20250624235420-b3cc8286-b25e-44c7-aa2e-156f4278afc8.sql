
-- Create table to store industry intelligence scan results
CREATE TABLE public.industry_intel_results (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  scan_session_id uuid REFERENCES public.site_scan_sessions(id),
  opportunity_type text NOT NULL CHECK (opportunity_type IN ('distressed', 'idle', 'corporate')),
  name text NOT NULL,
  address text,
  city text,
  state text,
  zip_code text,
  coordinates point,
  estimated_power_mw numeric DEFAULT 0,
  distress_score integer DEFAULT 0 CHECK (distress_score >= 0 AND distress_score <= 100),
  ai_insights text,
  data_sources jsonb DEFAULT '[]'::jsonb,
  opportunity_details jsonb DEFAULT '{}'::jsonb,
  status text DEFAULT 'active' CHECK (status IN ('active', 'closed', 'monitoring')),
  created_by uuid REFERENCES auth.users(id),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.industry_intel_results ENABLE ROW LEVEL SECURITY;

-- Create policies for industry_intel_results
CREATE POLICY "Users can view their own intel results" 
  ON public.industry_intel_results 
  FOR SELECT 
  USING (auth.uid() = created_by);

CREATE POLICY "Users can create their own intel results" 
  ON public.industry_intel_results 
  FOR INSERT 
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own intel results" 
  ON public.industry_intel_results 
  FOR UPDATE 
  USING (auth.uid() = created_by);

CREATE POLICY "Users can delete their own intel results" 
  ON public.industry_intel_results 
  FOR DELETE 
  USING (auth.uid() = created_by);

-- Create indexes for better performance
CREATE INDEX idx_industry_intel_results_scan_session ON public.industry_intel_results(scan_session_id);
CREATE INDEX idx_industry_intel_results_created_by ON public.industry_intel_results(created_by);
CREATE INDEX idx_industry_intel_results_opportunity_type ON public.industry_intel_results(opportunity_type);
CREATE INDEX idx_industry_intel_results_status ON public.industry_intel_results(status);

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_industry_intel_results_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_industry_intel_results_updated_at
  BEFORE UPDATE ON public.industry_intel_results
  FOR EACH ROW
  EXECUTE FUNCTION update_industry_intel_results_updated_at();

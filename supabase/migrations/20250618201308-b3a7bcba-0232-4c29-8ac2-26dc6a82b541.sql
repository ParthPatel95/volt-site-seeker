
-- Create table for AI company analysis results
CREATE TABLE public.ai_company_analysis (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_name TEXT NOT NULL,
  financial_outlook TEXT,
  risk_assessment TEXT,
  investment_recommendation TEXT,
  power_consumption_analysis TEXT,
  key_insights TEXT[],
  distress_probability NUMERIC,
  acquisition_readiness NUMERIC,
  analyzed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.ai_company_analysis ENABLE ROW LEVEL SECURITY;

-- Create policies for authenticated users
CREATE POLICY "Authenticated users can view AI analysis" ON public.ai_company_analysis FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert AI analysis" ON public.ai_company_analysis FOR INSERT TO authenticated WITH CHECK (true);

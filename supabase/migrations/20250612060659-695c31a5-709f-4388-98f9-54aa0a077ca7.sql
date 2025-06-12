
-- Create companies table for corporate intelligence
CREATE TABLE public.companies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  ticker TEXT,
  industry TEXT NOT NULL,
  sector TEXT NOT NULL,
  market_cap BIGINT,
  debt_to_equity NUMERIC,
  current_ratio NUMERIC,
  revenue_growth NUMERIC,
  profit_margin NUMERIC,
  financial_health_score INTEGER,
  distress_signals TEXT[],
  power_usage_estimate NUMERIC,
  locations JSONB,
  analyzed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create distress alerts table
CREATE TABLE public.distress_alerts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_name TEXT NOT NULL,
  alert_type TEXT NOT NULL,
  distress_level INTEGER NOT NULL,
  signals TEXT[] NOT NULL,
  power_capacity NUMERIC NOT NULL,
  potential_value NUMERIC NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create scraping sources table
CREATE TABLE public.scraping_sources (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('real_estate', 'corporate', 'news', 'social')),
  status TEXT NOT NULL DEFAULT 'inactive' CHECK (status IN ('active', 'inactive', 'error')),
  keywords TEXT[] NOT NULL DEFAULT '{}',
  last_run TIMESTAMP WITH TIME ZONE,
  properties_found INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create scraping jobs table
CREATE TABLE public.scraping_jobs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  source_id UUID NOT NULL REFERENCES public.scraping_sources(id) ON DELETE CASCADE,
  source_name TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('running', 'completed', 'failed')),
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  properties_found INTEGER DEFAULT 0,
  errors TEXT[]
);

-- Create corporate insights table
CREATE TABLE public.corporate_insights (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  source TEXT NOT NULL,
  company_name TEXT NOT NULL,
  insight_type TEXT NOT NULL,
  content TEXT NOT NULL,
  keywords TEXT[],
  discovered_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create news intelligence table
CREATE TABLE public.news_intelligence (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  source TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  url TEXT,
  keywords TEXT[],
  published_at TIMESTAMP WITH TIME ZONE,
  discovered_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create social intelligence table  
CREATE TABLE public.social_intelligence (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  source TEXT NOT NULL,
  platform TEXT NOT NULL,
  content TEXT NOT NULL,
  author TEXT,
  url TEXT,
  keywords TEXT[],
  posted_at TIMESTAMP WITH TIME ZONE,
  discovered_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create LinkedIn intelligence table
CREATE TABLE public.linkedin_intelligence (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company TEXT NOT NULL,
  content TEXT NOT NULL,
  post_date TIMESTAMP WITH TIME ZONE NOT NULL,
  keywords TEXT[],
  signals TEXT[],
  discovered_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create industry intelligence table
CREATE TABLE public.industry_intelligence (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  industry TEXT NOT NULL,
  company_name TEXT NOT NULL,
  ticker TEXT,
  market_cap BIGINT,
  power_intensity TEXT,
  financial_health INTEGER,
  risk_level TEXT,
  scanned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.distress_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scraping_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scraping_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.corporate_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.news_intelligence ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_intelligence ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.linkedin_intelligence ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.industry_intelligence ENABLE ROW LEVEL SECURITY;

-- Create policies to allow authenticated users to access all data
CREATE POLICY "Authenticated users can view companies" ON public.companies FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert companies" ON public.companies FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update companies" ON public.companies FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Authenticated users can view distress alerts" ON public.distress_alerts FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert distress alerts" ON public.distress_alerts FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can view scraping sources" ON public.scraping_sources FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can manage scraping sources" ON public.scraping_sources FOR ALL TO authenticated USING (true);

CREATE POLICY "Authenticated users can view scraping jobs" ON public.scraping_jobs FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can manage scraping jobs" ON public.scraping_jobs FOR ALL TO authenticated USING (true);

CREATE POLICY "Authenticated users can view corporate insights" ON public.corporate_insights FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert corporate insights" ON public.corporate_insights FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can view news intelligence" ON public.news_intelligence FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert news intelligence" ON public.news_intelligence FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can view social intelligence" ON public.social_intelligence FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert social intelligence" ON public.social_intelligence FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can view linkedin intelligence" ON public.linkedin_intelligence FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert linkedin intelligence" ON public.linkedin_intelligence FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can view industry intelligence" ON public.industry_intelligence FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert industry intelligence" ON public.industry_intelligence FOR INSERT TO authenticated WITH CHECK (true);

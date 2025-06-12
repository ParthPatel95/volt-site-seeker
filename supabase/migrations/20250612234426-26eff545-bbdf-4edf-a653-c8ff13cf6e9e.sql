
-- Fix companies table to ensure proper constraints and indexes
ALTER TABLE public.companies 
ADD CONSTRAINT companies_name_unique UNIQUE (name);

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_companies_industry ON public.companies(industry);
CREATE INDEX IF NOT EXISTS idx_companies_financial_health ON public.companies(financial_health_score);
CREATE INDEX IF NOT EXISTS idx_companies_analyzed_at ON public.companies(analyzed_at);

-- Fix distress_alerts table indexes
CREATE INDEX IF NOT EXISTS idx_distress_alerts_company ON public.distress_alerts(company_name);
CREATE INDEX IF NOT EXISTS idx_distress_alerts_level ON public.distress_alerts(distress_level);
CREATE INDEX IF NOT EXISTS idx_distress_alerts_created ON public.distress_alerts(created_at);

-- Add missing constraints to prevent data inconsistency
ALTER TABLE public.distress_alerts 
ADD CONSTRAINT distress_level_range CHECK (distress_level >= 0 AND distress_level <= 100);

ALTER TABLE public.companies 
ADD CONSTRAINT financial_health_range CHECK (financial_health_score >= 0 AND financial_health_score <= 100);

-- Ensure industry_intelligence table has proper structure
ALTER TABLE public.industry_intelligence 
ADD CONSTRAINT industry_intelligence_company_unique UNIQUE (company_name, industry);

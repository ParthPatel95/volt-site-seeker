
-- Create power demand forecasts table
CREATE TABLE public.power_demand_forecasts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID REFERENCES companies(id) NOT NULL,
  forecast_date DATE NOT NULL,
  predicted_consumption_mw NUMERIC NOT NULL,
  confidence_score INTEGER NOT NULL CHECK (confidence_score >= 0 AND confidence_score <= 100),
  forecast_horizon_months INTEGER NOT NULL,
  seasonal_factors JSONB,
  growth_assumptions JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create competitor analysis table
CREATE TABLE public.competitor_analysis (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID REFERENCES companies(id) NOT NULL,
  competitor_name TEXT NOT NULL,
  market_share_estimate NUMERIC,
  power_usage_comparison NUMERIC,
  competitive_advantages TEXT[],
  competitive_weaknesses TEXT[],
  market_positioning TEXT,
  analysis_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create investment scores table
CREATE TABLE public.investment_scores (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID REFERENCES companies(id) NOT NULL,
  overall_score INTEGER NOT NULL CHECK (overall_score >= 0 AND overall_score <= 100),
  risk_score INTEGER NOT NULL CHECK (risk_score >= 0 AND risk_score <= 100),
  opportunity_score INTEGER NOT NULL CHECK (opportunity_score >= 0 AND opportunity_score <= 100),
  timing_score INTEGER NOT NULL CHECK (timing_score >= 0 AND timing_score <= 100),
  confidence_level INTEGER NOT NULL CHECK (confidence_level >= 0 AND confidence_level <= 100),
  recommendation TEXT NOT NULL,
  key_factors TEXT[],
  risk_factors TEXT[],
  expected_roi_range JSONB,
  calculated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create portfolio recommendations table
CREATE TABLE public.portfolio_recommendations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  recommendation_type TEXT NOT NULL,
  target_companies UUID[],
  diversification_score INTEGER NOT NULL CHECK (diversification_score >= 0 AND diversification_score <= 100),
  risk_adjusted_return NUMERIC,
  geographic_allocation JSONB,
  sector_allocation JSONB,
  timing_recommendations JSONB,
  investment_thesis TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE
);

-- Create due diligence reports table
CREATE TABLE public.due_diligence_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID REFERENCES companies(id) NOT NULL,
  report_type TEXT NOT NULL,
  executive_summary TEXT,
  financial_analysis JSONB,
  power_infrastructure_assessment JSONB,
  risk_assessment JSONB,
  valuation_analysis JSONB,
  recommendations TEXT[],
  report_data JSONB,
  generated_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create supply chain analysis table
CREATE TABLE public.supply_chain_analysis (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID REFERENCES companies(id) NOT NULL,
  supplier_dependencies TEXT[],
  critical_components TEXT[],
  disruption_risks JSONB,
  geographic_exposure JSONB,
  regulatory_risks TEXT[],
  mitigation_strategies TEXT[],
  impact_on_power_consumption JSONB,
  analysis_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create ESG scores table
CREATE TABLE public.esg_scores (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID REFERENCES companies(id) NOT NULL,
  environmental_score INTEGER NOT NULL CHECK (environmental_score >= 0 AND environmental_score <= 100),
  social_score INTEGER NOT NULL CHECK (social_score >= 0 AND social_score <= 100),
  governance_score INTEGER NOT NULL CHECK (governance_score >= 0 AND governance_score <= 100),
  overall_esg_score INTEGER NOT NULL CHECK (overall_esg_score >= 0 AND overall_esg_score <= 100),
  carbon_footprint_mt NUMERIC,
  renewable_energy_percent NUMERIC,
  sustainability_commitments TEXT[],
  regulatory_compliance_score INTEGER,
  green_transition_opportunities TEXT[],
  assessment_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user alert preferences table
CREATE TABLE public.user_alert_preferences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  alert_type TEXT NOT NULL,
  criteria JSONB NOT NULL,
  notification_channels TEXT[] NOT NULL DEFAULT ARRAY['email'],
  is_active BOOLEAN NOT NULL DEFAULT true,
  frequency TEXT NOT NULL DEFAULT 'real_time',
  last_triggered TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create market timing analysis table
CREATE TABLE public.market_timing_analysis (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID REFERENCES companies(id) NOT NULL,
  market_cycle_phase TEXT NOT NULL,
  optimal_acquisition_window JSONB,
  market_conditions_score INTEGER NOT NULL CHECK (market_conditions_score >= 0 AND market_conditions_score <= 100),
  institutional_activity_level TEXT,
  fire_sale_probability NUMERIC,
  timing_recommendation TEXT,
  key_timing_factors TEXT[],
  analysis_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add sentiment scoring to existing social_intelligence table
ALTER TABLE public.social_intelligence 
ADD COLUMN IF NOT EXISTS sentiment_score INTEGER CHECK (sentiment_score >= -100 AND sentiment_score <= 100),
ADD COLUMN IF NOT EXISTS sentiment_analysis JSONB,
ADD COLUMN IF NOT EXISTS early_warning_signals TEXT[];

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_power_demand_forecasts_company_id ON power_demand_forecasts(company_id);
CREATE INDEX IF NOT EXISTS idx_competitor_analysis_company_id ON competitor_analysis(company_id);
CREATE INDEX IF NOT EXISTS idx_investment_scores_company_id ON investment_scores(company_id);
CREATE INDEX IF NOT EXISTS idx_portfolio_recommendations_user_id ON portfolio_recommendations(user_id);
CREATE INDEX IF NOT EXISTS idx_due_diligence_reports_company_id ON due_diligence_reports(company_id);
CREATE INDEX IF NOT EXISTS idx_supply_chain_analysis_company_id ON supply_chain_analysis(company_id);
CREATE INDEX IF NOT EXISTS idx_esg_scores_company_id ON esg_scores(company_id);
CREATE INDEX IF NOT EXISTS idx_user_alert_preferences_user_id ON user_alert_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_market_timing_analysis_company_id ON market_timing_analysis(company_id);

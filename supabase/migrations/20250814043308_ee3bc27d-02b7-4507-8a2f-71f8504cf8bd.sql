-- Create tables for advanced intelligence and analytics features

-- Predictive Energy Trading Platform
CREATE TABLE public.predictive_models (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  model_type TEXT NOT NULL CHECK (model_type IN ('energy_price', 'demand_forecast', 'arbitrage', 'risk_assessment')),
  market TEXT NOT NULL,
  predictions JSONB NOT NULL,
  confidence_score NUMERIC(3,2),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL
);

CREATE TABLE public.trading_signals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  signal_type TEXT NOT NULL CHECK (signal_type IN ('buy', 'sell', 'hold', 'arbitrage')),
  market TEXT NOT NULL,
  asset TEXT NOT NULL,
  confidence NUMERIC(3,2),
  price_target NUMERIC(10,2),
  risk_level TEXT CHECK (risk_level IN ('low', 'medium', 'high')),
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Voice Search and Multi-Modal Search
CREATE TABLE public.voice_search_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  search_query TEXT NOT NULL,
  audio_duration_ms INTEGER,
  search_results JSONB,
  search_type TEXT CHECK (search_type IN ('voice', 'text', 'image')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Due Diligence Automation
CREATE TABLE public.automated_due_diligence (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  listing_id UUID,
  user_id UUID NOT NULL,
  report_type TEXT NOT NULL CHECK (report_type IN ('property', 'financial', 'technical', 'regulatory', 'comprehensive')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  report_data JSONB,
  risk_score NUMERIC(3,2),
  recommendations JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Corporate Acquisition Intelligence
CREATE TABLE public.acquisition_targets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_name TEXT NOT NULL,
  industry TEXT,
  market_cap NUMERIC(15,2),
  acquisition_readiness_score NUMERIC(3,2),
  distress_signals JSONB,
  financial_metrics JSONB,
  last_updated TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Regulatory Intelligence
CREATE TABLE public.regulatory_updates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  jurisdiction TEXT NOT NULL,
  agency TEXT NOT NULL,
  update_type TEXT CHECK (update_type IN ('policy', 'permit', 'compliance', 'tariff', 'filing')),
  title TEXT NOT NULL,
  description TEXT,
  impact_level TEXT CHECK (impact_level IN ('low', 'medium', 'high', 'critical')),
  affected_sectors TEXT[],
  document_url TEXT,
  effective_date DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Risk Management
CREATE TABLE public.risk_assessments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  assessment_type TEXT NOT NULL CHECK (assessment_type IN ('portfolio', 'market', 'credit', 'operational', 'regulatory')),
  risk_metrics JSONB NOT NULL,
  risk_score NUMERIC(3,2),
  recommendations JSONB,
  scenario_analysis JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Energy Arbitrage Opportunities
CREATE TABLE public.arbitrage_opportunities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  market_from TEXT NOT NULL,
  market_to TEXT NOT NULL,
  price_spread NUMERIC(10,4),
  profit_potential NUMERIC(10,2),
  risk_adjusted_return NUMERIC(5,2),
  execution_window_start TIMESTAMP WITH TIME ZONE,
  execution_window_end TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'executed', 'expired')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- AI-Powered Site Recommendations
CREATE TABLE public.site_recommendations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  location_lat NUMERIC(10,8),
  location_lng NUMERIC(11,8),
  recommendation_score NUMERIC(3,2),
  criteria_weights JSONB,
  analysis_factors JSONB,
  recommendation_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Dynamic Pricing Models
CREATE TABLE public.dynamic_pricing (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  asset_type TEXT NOT NULL,
  asset_id UUID,
  base_price NUMERIC(10,2),
  dynamic_price NUMERIC(10,2),
  pricing_factors JSONB,
  market_conditions JSONB,
  valid_until TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.predictive_models ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trading_signals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.voice_search_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.automated_due_diligence ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.acquisition_targets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.regulatory_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.risk_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.arbitrage_opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dynamic_pricing ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own trading signals" ON public.trading_signals FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own trading signals" ON public.trading_signals FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own voice search logs" ON public.voice_search_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create voice search logs" ON public.voice_search_logs FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can view their own due diligence reports" ON public.automated_due_diligence FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own due diligence reports" ON public.automated_due_diligence FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own due diligence reports" ON public.automated_due_diligence FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own risk assessments" ON public.risk_assessments FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own risk assessments" ON public.risk_assessments FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own site recommendations" ON public.site_recommendations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own site recommendations" ON public.site_recommendations FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Public read policies for market data
CREATE POLICY "Anyone can view predictive models" ON public.predictive_models FOR SELECT USING (true);
CREATE POLICY "Anyone can view acquisition targets" ON public.acquisition_targets FOR SELECT USING (true);
CREATE POLICY "Anyone can view regulatory updates" ON public.regulatory_updates FOR SELECT USING (true);
CREATE POLICY "Anyone can view arbitrage opportunities" ON public.arbitrage_opportunities FOR SELECT USING (true);
CREATE POLICY "Anyone can view dynamic pricing" ON public.dynamic_pricing FOR SELECT USING (true);

-- Create indexes for performance
CREATE INDEX idx_predictive_models_type_market ON public.predictive_models(model_type, market);
CREATE INDEX idx_trading_signals_user_type ON public.trading_signals(user_id, signal_type);
CREATE INDEX idx_voice_search_logs_user_created ON public.voice_search_logs(user_id, created_at);
CREATE INDEX idx_automated_due_diligence_user_status ON public.automated_due_diligence(user_id, status);
CREATE INDEX idx_acquisition_targets_score ON public.acquisition_targets(acquisition_readiness_score);
CREATE INDEX idx_regulatory_updates_jurisdiction_impact ON public.regulatory_updates(jurisdiction, impact_level);
CREATE INDEX idx_risk_assessments_user_type ON public.risk_assessments(user_id, assessment_type);
CREATE INDEX idx_arbitrage_opportunities_status_profit ON public.arbitrage_opportunities(status, profit_potential);
CREATE INDEX idx_site_recommendations_user_score ON public.site_recommendations(user_id, recommendation_score);
CREATE INDEX idx_dynamic_pricing_asset_valid ON public.dynamic_pricing(asset_type, asset_id, valid_until);

-- Create triggers for updated_at columns
CREATE TRIGGER update_predictive_models_updated_at BEFORE UPDATE ON public.predictive_models FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_trading_signals_updated_at BEFORE UPDATE ON public.trading_signals FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_automated_due_diligence_updated_at BEFORE UPDATE ON public.automated_due_diligence FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_risk_assessments_updated_at BEFORE UPDATE ON public.risk_assessments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
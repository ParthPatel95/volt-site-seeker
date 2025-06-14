
-- Enable Row Level Security on all the tables that are missing it
ALTER TABLE public.power_demand_forecasts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.competitor_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.investment_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolio_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.due_diligence_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.supply_chain_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.esg_scores ENABLE ROW LEVEL SECURITY;

-- Create policies for power_demand_forecasts
CREATE POLICY "Anyone can view power demand forecasts" ON public.power_demand_forecasts
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert power demand forecasts" ON public.power_demand_forecasts
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update power demand forecasts" ON public.power_demand_forecasts
  FOR UPDATE USING (auth.uid() IS NOT NULL);

-- Create policies for competitor_analysis
CREATE POLICY "Anyone can view competitor analysis" ON public.competitor_analysis
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert competitor analysis" ON public.competitor_analysis
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update competitor analysis" ON public.competitor_analysis
  FOR UPDATE USING (auth.uid() IS NOT NULL);

-- Create policies for investment_scores
CREATE POLICY "Anyone can view investment scores" ON public.investment_scores
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert investment scores" ON public.investment_scores
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update investment scores" ON public.investment_scores
  FOR UPDATE USING (auth.uid() IS NOT NULL);

-- Create policies for portfolio_recommendations
CREATE POLICY "Users can view their own portfolio recommendations" ON public.portfolio_recommendations
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own portfolio recommendations" ON public.portfolio_recommendations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own portfolio recommendations" ON public.portfolio_recommendations
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own portfolio recommendations" ON public.portfolio_recommendations
  FOR DELETE USING (auth.uid() = user_id);

-- Create policies for due_diligence_reports
CREATE POLICY "Anyone can view due diligence reports" ON public.due_diligence_reports
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert due diligence reports" ON public.due_diligence_reports
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update due diligence reports" ON public.due_diligence_reports
  FOR UPDATE USING (auth.uid() IS NOT NULL);

-- Create policies for supply_chain_analysis
CREATE POLICY "Anyone can view supply chain analysis" ON public.supply_chain_analysis
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert supply chain analysis" ON public.supply_chain_analysis
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update supply chain analysis" ON public.supply_chain_analysis
  FOR UPDATE USING (auth.uid() IS NOT NULL);

-- Create policies for esg_scores
CREATE POLICY "Anyone can view ESG scores" ON public.esg_scores
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert ESG scores" ON public.esg_scores
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update ESG scores" ON public.esg_scores
  FOR UPDATE USING (auth.uid() IS NOT NULL);

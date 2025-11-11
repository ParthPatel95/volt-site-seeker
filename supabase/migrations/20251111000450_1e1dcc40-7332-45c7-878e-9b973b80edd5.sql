-- Phase 10: AI Trading Advisories Table
CREATE TABLE IF NOT EXISTS public.ai_trading_advisories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  market TEXT NOT NULL,
  advisory_type TEXT NOT NULL DEFAULT 'trading_strategy',
  outlook TEXT NOT NULL,
  confidence NUMERIC NOT NULL,
  summary TEXT NOT NULL,
  recommendations JSONB NOT NULL,
  risk_assessment JSONB NOT NULL,
  opportunities JSONB DEFAULT '[]'::jsonb,
  key_insights JSONB NOT NULL,
  price_targets JSONB,
  model_performance_snapshot JSONB,
  predictions_analyzed INTEGER NOT NULL DEFAULT 0,
  generated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Indexes for queries
CREATE INDEX IF NOT EXISTS idx_ai_trading_advisories_market 
  ON public.ai_trading_advisories(market);

CREATE INDEX IF NOT EXISTS idx_ai_trading_advisories_generated 
  ON public.ai_trading_advisories(generated_at DESC);

CREATE INDEX IF NOT EXISTS idx_ai_trading_advisories_outlook 
  ON public.ai_trading_advisories(outlook);

-- Enable RLS
ALTER TABLE public.ai_trading_advisories ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read advisories
CREATE POLICY "Allow authenticated users to read AI trading advisories"
  ON public.ai_trading_advisories
  FOR SELECT
  TO authenticated
  USING (true);

-- Only service role can insert advisories (via edge functions)
CREATE POLICY "Allow service role to manage AI trading advisories"
  ON public.ai_trading_advisories
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Comment
COMMENT ON TABLE public.ai_trading_advisories IS 'Phase 10: Stores AI-generated trading advisories and recommendations powered by Lovable AI';

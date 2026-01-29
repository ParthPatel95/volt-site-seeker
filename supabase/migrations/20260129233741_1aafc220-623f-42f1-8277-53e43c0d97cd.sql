-- Create table for caching market intelligence data (timeseries, fluctuation, news, OHLC)
CREATE TABLE public.scrap_metal_market_data (
  id TEXT PRIMARY KEY DEFAULT 'current',
  
  -- Time series data (7-day history per metal)
  timeseries_data JSONB,
  timeseries_fetched_at TIMESTAMPTZ,
  
  -- Fluctuation data (weekly price changes)
  fluctuation_data JSONB,
  fluctuation_fetched_at TIMESTAMPTZ,
  
  -- News data (metal market news)
  news_data JSONB,
  news_fetched_at TIMESTAMPTZ,
  
  -- OHLC data (open/high/low/close)
  ohlc_data JSONB,
  ohlc_fetched_at TIMESTAMPTZ,
  
  -- API usage tracking (separate from price cache)
  api_calls_today INTEGER DEFAULT 0,
  last_api_call_date DATE,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.scrap_metal_market_data ENABLE ROW LEVEL SECURITY;

-- Policy: Only service role can access (internal system table)
CREATE POLICY "Service role access only for market data"
ON public.scrap_metal_market_data
FOR ALL
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_scrap_metal_market_data_updated_at
BEFORE UPDATE ON public.scrap_metal_market_data
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert initial row
INSERT INTO public.scrap_metal_market_data (id) VALUES ('current');
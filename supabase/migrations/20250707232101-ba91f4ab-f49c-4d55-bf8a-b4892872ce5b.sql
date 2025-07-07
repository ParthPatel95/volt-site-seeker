-- Create portfolios and portfolio items tables for VoltMarket
CREATE TABLE IF NOT EXISTS public.voltmarket_portfolios (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  portfolio_type TEXT NOT NULL CHECK (portfolio_type IN ('investment', 'development', 'trading', 'research')),
  total_value NUMERIC DEFAULT 0,
  target_allocation JSONB DEFAULT '{}',
  risk_tolerance TEXT NOT NULL CHECK (risk_tolerance IN ('conservative', 'moderate', 'aggressive', 'speculative')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.voltmarket_portfolio_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  portfolio_id UUID NOT NULL,
  listing_id UUID,
  item_type TEXT NOT NULL CHECK (item_type IN ('listing', 'investment', 'opportunity', 'research')),
  name TEXT NOT NULL,
  acquisition_price NUMERIC,
  current_value NUMERIC,
  acquisition_date TIMESTAMP WITH TIME ZONE,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'sold', 'under_contract', 'monitoring')),
  notes TEXT,
  metadata JSONB DEFAULT '{}',
  added_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  FOREIGN KEY (portfolio_id) REFERENCES public.voltmarket_portfolios(id) ON DELETE CASCADE
);

-- Enable Row Level Security
ALTER TABLE public.voltmarket_portfolios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.voltmarket_portfolio_items ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for portfolios
CREATE POLICY "Users can view their own portfolios" 
ON public.voltmarket_portfolios 
FOR SELECT 
USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can create their own portfolios" 
ON public.voltmarket_portfolios 
FOR INSERT 
WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update their own portfolios" 
ON public.voltmarket_portfolios 
FOR UPDATE 
USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can delete their own portfolios" 
ON public.voltmarket_portfolios 
FOR DELETE 
USING (auth.uid()::text = user_id::text);

-- Create RLS policies for portfolio items
CREATE POLICY "Users can view their own portfolio items" 
ON public.voltmarket_portfolio_items 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.voltmarket_portfolios 
  WHERE id = portfolio_id AND auth.uid()::text = user_id::text
));

CREATE POLICY "Users can create portfolio items in their portfolios" 
ON public.voltmarket_portfolio_items 
FOR INSERT 
WITH CHECK (EXISTS (
  SELECT 1 FROM public.voltmarket_portfolios 
  WHERE id = portfolio_id AND auth.uid()::text = user_id::text
));

CREATE POLICY "Users can update their own portfolio items" 
ON public.voltmarket_portfolio_items 
FOR UPDATE 
USING (EXISTS (
  SELECT 1 FROM public.voltmarket_portfolios 
  WHERE id = portfolio_id AND auth.uid()::text = user_id::text
));

CREATE POLICY "Users can delete their own portfolio items" 
ON public.voltmarket_portfolio_items 
FOR DELETE 
USING (EXISTS (
  SELECT 1 FROM public.voltmarket_portfolios 
  WHERE id = portfolio_id AND auth.uid()::text = user_id::text
));

-- Create triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION public.update_portfolio_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_voltmarket_portfolios_updated_at
  BEFORE UPDATE ON public.voltmarket_portfolios
  FOR EACH ROW
  EXECUTE FUNCTION public.update_portfolio_updated_at();

CREATE TRIGGER update_voltmarket_portfolio_items_updated_at
  BEFORE UPDATE ON public.voltmarket_portfolio_items
  FOR EACH ROW
  EXECUTE FUNCTION public.update_portfolio_updated_at();
-- Create table for caching cryptocurrency details
CREATE TABLE public.crypto_details_cache (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  symbol TEXT NOT NULL UNIQUE,
  data JSONB NOT NULL,
  last_updated TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.crypto_details_cache ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access (since this is market data)
CREATE POLICY "Crypto details cache is publicly readable" 
ON public.crypto_details_cache 
FOR SELECT 
USING (true);

-- Create policy for authenticated users to insert/update
CREATE POLICY "Authenticated users can manage crypto cache" 
ON public.crypto_details_cache 
FOR ALL 
USING (auth.uid() IS NOT NULL);

-- Create index for faster lookups
CREATE INDEX idx_crypto_details_cache_symbol ON public.crypto_details_cache(symbol);
CREATE INDEX idx_crypto_details_cache_updated ON public.crypto_details_cache(last_updated);
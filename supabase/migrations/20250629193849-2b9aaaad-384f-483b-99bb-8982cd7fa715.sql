
-- Create table for storing BTC ROI calculations
CREATE TABLE public.btc_roi_calculations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  site_name TEXT NOT NULL,
  calculation_type TEXT NOT NULL CHECK (calculation_type IN ('hosting', 'self')),
  form_data JSONB NOT NULL,
  network_data JSONB NOT NULL,
  results JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.btc_roi_calculations ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own calculations" 
  ON public.btc_roi_calculations 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own calculations" 
  ON public.btc_roi_calculations 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own calculations" 
  ON public.btc_roi_calculations 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own calculations" 
  ON public.btc_roi_calculations 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Create index for better performance
CREATE INDEX idx_btc_roi_calculations_user_id ON public.btc_roi_calculations(user_id);
CREATE INDEX idx_btc_roi_calculations_created_at ON public.btc_roi_calculations(created_at DESC);

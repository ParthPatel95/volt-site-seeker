-- Create prediction accuracy tracking table
CREATE TABLE public.aeso_prediction_accuracy (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  prediction_id UUID REFERENCES public.aeso_price_predictions(id),
  target_timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
  predicted_price NUMERIC NOT NULL,
  actual_price NUMERIC NOT NULL,
  absolute_error NUMERIC NOT NULL,
  percent_error NUMERIC NOT NULL,
  horizon_hours INTEGER NOT NULL,
  model_version TEXT,
  within_confidence BOOLEAN DEFAULT false,
  validated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.aeso_prediction_accuracy ENABLE ROW LEVEL SECURITY;

-- Allow public read access for accuracy metrics
CREATE POLICY "Public can view prediction accuracy" 
ON public.aeso_prediction_accuracy 
FOR SELECT 
USING (true);

-- Allow authenticated users to insert accuracy records
CREATE POLICY "Authenticated users can insert accuracy records" 
ON public.aeso_prediction_accuracy 
FOR INSERT 
WITH CHECK (true);

-- Create index for faster queries
CREATE INDEX idx_aeso_prediction_accuracy_target_timestamp 
ON public.aeso_prediction_accuracy(target_timestamp DESC);

CREATE INDEX idx_aeso_prediction_accuracy_horizon 
ON public.aeso_prediction_accuracy(horizon_hours);
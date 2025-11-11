-- Create retraining history table to track automatic retraining
CREATE TABLE IF NOT EXISTS public.aeso_retraining_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  triggered BOOLEAN NOT NULL DEFAULT false,
  reason TEXT NOT NULL,
  performance_before DECIMAL,
  performance_after DECIMAL,
  improvement DECIMAL,
  training_records_before INTEGER,
  training_records_after INTEGER,
  duration_seconds INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create index for faster queries
CREATE INDEX idx_aeso_retraining_history_created_at ON public.aeso_retraining_history(created_at DESC);

-- Enable RLS
ALTER TABLE public.aeso_retraining_history ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all authenticated users to view retraining history
CREATE POLICY "Allow authenticated users to view retraining history"
  ON public.aeso_retraining_history
  FOR SELECT
  TO authenticated
  USING (true);

-- Create policy to allow service role to insert retraining history
CREATE POLICY "Allow service role to insert retraining history"
  ON public.aeso_retraining_history
  FOR INSERT
  TO service_role
  WITH CHECK (true);

COMMENT ON TABLE public.aeso_retraining_history IS 'Tracks automatic model retraining events and their outcomes';

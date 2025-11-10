-- Phase 6: Automated Retraining History Table
CREATE TABLE IF NOT EXISTS public.aeso_retraining_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  triggered_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  trigger_reason TEXT NOT NULL,
  previous_model_version TEXT NOT NULL,
  new_model_version TEXT,
  previous_mae NUMERIC,
  previous_rmse NUMERIC,
  new_mae NUMERIC,
  new_rmse NUMERIC,
  improvement_mae NUMERIC,
  drift_score NUMERIC,
  status TEXT NOT NULL DEFAULT 'triggered', -- triggered, completed, failed
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_aeso_retraining_history_triggered_at 
  ON public.aeso_retraining_history(triggered_at DESC);

CREATE INDEX IF NOT EXISTS idx_aeso_retraining_history_status 
  ON public.aeso_retraining_history(status);

-- Enable RLS
ALTER TABLE public.aeso_retraining_history ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated users to read retraining history
CREATE POLICY "Allow authenticated users to read retraining history"
  ON public.aeso_retraining_history
  FOR SELECT
  TO authenticated
  USING (true);

-- Only service role can insert/update retraining history (done via edge functions)
CREATE POLICY "Allow service role to manage retraining history"
  ON public.aeso_retraining_history
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Add trigger for updated_at
CREATE TRIGGER update_aeso_retraining_history_updated_at
  BEFORE UPDATE ON public.aeso_retraining_history
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Add comment for documentation
COMMENT ON TABLE public.aeso_retraining_history IS 'Phase 6: Tracks automated model retraining events, triggers, and performance improvements';

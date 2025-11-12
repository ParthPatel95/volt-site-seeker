-- Phase 4: Time Series Cross-Validation Support
-- Add table to track cross-validation folds and results

CREATE TABLE IF NOT EXISTS public.aeso_cv_folds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fold_number INTEGER NOT NULL,
  train_start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  train_end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  validation_start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  validation_end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  model_version TEXT,
  smape NUMERIC,
  mae NUMERIC,
  rmse NUMERIC,
  mape NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(fold_number, train_start_date, train_end_date)
);

-- Add indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_aeso_cv_folds_fold_number ON public.aeso_cv_folds(fold_number);
CREATE INDEX IF NOT EXISTS idx_aeso_cv_folds_created_at ON public.aeso_cv_folds(created_at DESC);

-- Enable RLS
ALTER TABLE public.aeso_cv_folds ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Allow public read access to CV folds"
  ON public.aeso_cv_folds FOR SELECT
  USING (true);

CREATE POLICY "Allow authenticated insert to CV folds"
  ON public.aeso_cv_folds FOR INSERT
  WITH CHECK (true);

-- Add comments
COMMENT ON TABLE public.aeso_cv_folds IS 'Stores time series cross-validation fold definitions and performance metrics';
COMMENT ON COLUMN public.aeso_cv_folds.fold_number IS 'Sequential fold number for time series CV';
COMMENT ON COLUMN public.aeso_cv_folds.train_start_date IS 'Start of training period for this fold';
COMMENT ON COLUMN public.aeso_cv_folds.train_end_date IS 'End of training period for this fold';
COMMENT ON COLUMN public.aeso_cv_folds.validation_start_date IS 'Start of validation period for this fold';
COMMENT ON COLUMN public.aeso_cv_folds.validation_end_date IS 'End of validation period for this fold';
COMMENT ON COLUMN public.aeso_cv_folds.smape IS 'Symmetric Mean Absolute Percentage Error for this fold';

-- Function to generate time series CV folds
CREATE OR REPLACE FUNCTION public.generate_time_series_cv_folds(
  num_folds INTEGER DEFAULT 5,
  validation_window_hours INTEGER DEFAULT 168 -- 1 week
)
RETURNS TABLE(
  fold_number INTEGER,
  train_start TIMESTAMP WITH TIME ZONE,
  train_end TIMESTAMP WITH TIME ZONE,
  validation_start TIMESTAMP WITH TIME ZONE,
  validation_end TIMESTAMP WITH TIME ZONE
) 
LANGUAGE plpgsql
AS $$
DECLARE
  min_date TIMESTAMP WITH TIME ZONE;
  max_date TIMESTAMP WITH TIME ZONE;
  total_hours NUMERIC;
  fold_size_hours NUMERIC;
  current_fold INTEGER;
BEGIN
  -- Get data date range
  SELECT MIN(timestamp), MAX(timestamp) 
  INTO min_date, max_date
  FROM aeso_training_data;
  
  -- Calculate total hours and fold size
  total_hours := EXTRACT(EPOCH FROM (max_date - min_date)) / 3600;
  fold_size_hours := (total_hours - validation_window_hours) / num_folds;
  
  RAISE NOTICE 'Data range: % to % (% hours total)', min_date, max_date, total_hours;
  RAISE NOTICE 'Creating % folds with % hour validation windows', num_folds, validation_window_hours;
  
  -- Generate folds with expanding training window
  FOR current_fold IN 1..num_folds LOOP
    train_start := min_date;
    train_end := min_date + (fold_size_hours * current_fold) * INTERVAL '1 hour';
    validation_start := train_end;
    validation_end := validation_start + validation_window_hours * INTERVAL '1 hour';
    
    -- Ensure we don't exceed available data
    IF validation_end > max_date THEN
      validation_end := max_date;
    END IF;
    
    fold_number := current_fold;
    
    RETURN NEXT;
  END LOOP;
END;
$$;

COMMENT ON FUNCTION public.generate_time_series_cv_folds IS 'Generates time series cross-validation folds with expanding training windows';
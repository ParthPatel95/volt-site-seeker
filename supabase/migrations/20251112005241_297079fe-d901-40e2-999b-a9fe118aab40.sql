-- Fix security warning: Add search_path to generate_time_series_cv_folds function
DROP FUNCTION IF EXISTS public.generate_time_series_cv_folds(INTEGER, INTEGER);

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
SECURITY DEFINER
SET search_path = public
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
-- Add missing generation columns to capture all AESO fuel types
ALTER TABLE aeso_training_data 
ADD COLUMN IF NOT EXISTS generation_other NUMERIC DEFAULT 0;

-- Backfill historical data by calculating "other" from the difference
-- between actual demand (ail_mw) and known generation sources
UPDATE aeso_training_data 
SET generation_other = GREATEST(0, 
  COALESCE(ail_mw, 0) - (
    COALESCE(generation_wind, 0) + 
    COALESCE(generation_solar, 0) + 
    COALESCE(generation_gas, 0) + 
    COALESCE(generation_coal, 0) + 
    COALESCE(generation_hydro, 0)
  )
)
WHERE generation_other IS NULL OR generation_other = 0;
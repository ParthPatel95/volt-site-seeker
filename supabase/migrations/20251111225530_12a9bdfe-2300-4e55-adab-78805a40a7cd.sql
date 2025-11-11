-- Add validation timestamp to predictions table
ALTER TABLE aeso_price_predictions 
ADD COLUMN IF NOT EXISTS validated_at TIMESTAMP WITH TIME ZONE;

-- Add enhanced validation metrics to accuracy table
ALTER TABLE aeso_prediction_accuracy 
ADD COLUMN IF NOT EXISTS symmetric_percent_error NUMERIC,
ADD COLUMN IF NOT EXISTS actual_regime TEXT,
ADD COLUMN IF NOT EXISTS predicted_regime TEXT,
ADD COLUMN IF NOT EXISTS spike_risk NUMERIC;

-- Create index for faster validation queries
CREATE INDEX IF NOT EXISTS idx_predictions_validation 
ON aeso_price_predictions(target_timestamp, validated_at) 
WHERE validated_at IS NULL;

-- Create index for accuracy analysis by regime
CREATE INDEX IF NOT EXISTS idx_accuracy_regime 
ON aeso_prediction_accuracy(actual_regime, validated_at);

-- Create index for accuracy analysis by horizon
CREATE INDEX IF NOT EXISTS idx_accuracy_horizon 
ON aeso_prediction_accuracy(horizon_hours, validated_at);
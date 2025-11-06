-- Clean up invalid training data with zero pool prices
-- This ensures predictions are based on valid historical data
DELETE FROM aeso_training_data 
WHERE pool_price = 0 OR pool_price IS NULL;

-- Add a comment for tracking
COMMENT ON TABLE aeso_training_data IS 'AESO training data for price predictions. Only stores records with valid non-zero pool prices.';
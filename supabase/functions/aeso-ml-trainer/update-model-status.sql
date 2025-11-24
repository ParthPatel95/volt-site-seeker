-- Update aeso_model_status after training
-- This is called by the ML trainer to track the latest model
INSERT INTO aeso_model_status (
  model_version,
  trained_at,
  mae,
  rmse,
  smape,
  r_squared,
  training_records,
  predictions_evaluated,
  model_quality,
  available_training_records,
  records_with_features
)
VALUES (
  $1, -- model_version
  NOW(),
  $2, -- mae
  $3, -- rmse
  $4, -- smape
  $5, -- r_squared
  $6, -- training_records
  0,  -- predictions_evaluated (will be updated by validator)
  CASE 
    WHEN $4 < 20 THEN 'excellent'
    WHEN $4 < 30 THEN 'good'
    WHEN $4 < 40 THEN 'fair'
    ELSE 'needs_improvement'
  END,
  $7, -- available_training_records
  $8  -- records_with_features
);

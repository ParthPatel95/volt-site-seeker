-- Add unique constraint on timestamp to enable upsert operations
ALTER TABLE aeso_training_data 
ADD CONSTRAINT aeso_training_data_timestamp_key UNIQUE (timestamp);
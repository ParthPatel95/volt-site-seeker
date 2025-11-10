-- AESO AI Model - Daily Automatic Training Setup
-- This script sets up a cron job to automatically retrain the AESO price prediction model every 24 hours

-- Required extensions (should already be enabled)
-- CREATE EXTENSION IF NOT EXISTS pg_cron;
-- CREATE EXTENSION IF NOT EXISTS pg_net;

-- Schedule daily model retraining at 3:00 AM MST (after data collection at 2:00 AM)
-- This ensures the model learns from the latest data continuously
SELECT cron.schedule(
  'aeso-daily-model-training',
  '0 3 * * *', -- Every day at 3:00 AM
  $$
  SELECT
    net.http_post(
        url:='https://ktgosplhknmnyagxrgbe.supabase.co/functions/v1/aeso-model-trainer',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt0Z29zcGxoa25tbnlhZ3hyZ2JlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk2OTkzMDUsImV4cCI6MjA2NTI3NTMwNX0.KVs7C_7PHARS-JddBgARWFpDZE6yCeMTLgZhu2UKACE"}'::jsonb,
        body:='{"auto_retrain": true}'::jsonb
    ) as request_id;
  $$
);

-- Schedule weather data collection every 6 hours (provides fresh weather forecasts)
SELECT cron.schedule(
  'aeso-weather-collection',
  '0 */6 * * *', -- Every 6 hours
  $$
  SELECT
    net.http_post(
        url:='https://ktgosplhknmnyagxrgbe.supabase.co/functions/v1/aeso-weather-integration',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt0Z29zcGxoa25tbnlhZ3hyZ2JlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk2OTkzMDUsImV4cCI6MjA2NTI3NTMwNX0.KVs7C_7PHARS-JddBgARWFpDZE6yCeMTLgZhu2UKACE"}'::jsonb,
        body:='{}'::jsonb
    ) as request_id;
  $$
);

-- Verify scheduled jobs
SELECT * FROM cron.job WHERE jobname IN ('aeso-daily-model-training', 'aeso-weather-collection');

-- View job execution history
SELECT * FROM cron.job_run_details 
WHERE jobid IN (SELECT jobid FROM cron.job WHERE jobname IN ('aeso-daily-model-training', 'aeso-weather-collection'))
ORDER BY start_time DESC 
LIMIT 20;

-- MANUAL TRIGGERS (for testing)
-- Manually trigger model training:
-- SELECT
--   net.http_post(
--       url:='https://ktgosplhknmnyagxrgbe.supabase.co/functions/v1/aeso-model-trainer',
--       headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt0Z29zcGxoa25tbnlhZ3hyZ2JlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk2OTkzMDUsImV4cCI6MjA2NTI3NTMwNX0.KVs7C_7PHARS-JddBgARWFpDZE6yCeMTLgZhu2UKACE"}'::jsonb,
--       body:='{"manual_trigger": true}'::jsonb
--   ) as request_id;

-- Manually trigger weather collection:
-- SELECT
--   net.http_post(
--       url:='https://ktgosplhknmnyagxrgbe.supabase.co/functions/v1/aeso-weather-integration',
--       headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt0Z29zcGxoa25tbnlhZ3hyZ2JlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk2OTkzMDUsImV4cCI6MjA2NTI3NTMwNX0.KVs7C_7PHARS-JddBgARWFpDZE6yCeMTLgZhu2UKACE"}'::jsonb,
--       body:='{}'::jsonb
--   ) as request_id;

-- UNSCHEDULE JOBS (if needed)
-- SELECT cron.unschedule('aeso-daily-model-training');
-- SELECT cron.unschedule('aeso-weather-collection');

-- NOTES:
-- 1. The model retrains daily at 3 AM to learn from the previous day's data
-- 2. Weather forecasts are collected every 6 hours for accurate predictions
-- 3. Training data is continuously accumulated in aeso_training_data table
-- 4. Model performance metrics are tracked in aeso_model_performance table
-- 5. The model automatically improves as more data is collected over time

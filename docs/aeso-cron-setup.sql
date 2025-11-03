-- ============================================================
-- AESO AI Price Prediction - Automated Cron Jobs Setup
-- ============================================================
-- 
-- IMPORTANT: Before running this SQL, you MUST enable the following
-- extensions in your Supabase dashboard:
-- 
-- 1. Go to: Database → Extensions
-- 2. Enable: pg_cron
-- 3. Enable: pg_net
-- 
-- Then run this SQL in the SQL Editor to set up automated jobs.
-- ============================================================

-- Job 1: Hourly Data Collection
-- Collects current market data, weather, and stores enriched features
-- Runs: Every hour at minute 5 (e.g., 1:05, 2:05, 3:05, etc.)
SELECT cron.schedule(
  'aeso-hourly-data-collection',
  '5 * * * *',
  $$
  SELECT net.http_post(
    url := 'https://ktgosplhknmnyagxrgbe.supabase.co/functions/v1/aeso-data-collector',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt0Z29zcGxoa25tbnlhZ3hyZ2JlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk2OTkzMDUsImV4cCI6MjA2NTI3NTMwNX0.KVs7C_7PHARS-JddBgARWFpDZE6yCeMTLgZhu2UKACE"}'::jsonb,
    body := '{}'::jsonb
  ) as request_id;
  $$
);

-- Job 2: Weekly Model Training & Evaluation
-- Retrains the AI model on recent data and evaluates performance
-- Runs: Every Sunday at 2:00 AM
SELECT cron.schedule(
  'aeso-weekly-model-training',
  '0 2 * * 0',
  $$
  SELECT net.http_post(
    url := 'https://ktgosplhknmnyagxrgbe.supabase.co/functions/v1/aeso-model-trainer',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt0Z29zcGxoa25tbnlhZ3hyZ2JlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk2OTkzMDUsImV4cCI6MjA2NTI3NTMwNX0.KVs7C_7PHARS-JddBgARWFpDZE6yCeMTLgZhu2UKACE"}'::jsonb,
    body := '{}'::jsonb
  ) as request_id;
  $$
);

-- ============================================================
-- Verify Cron Jobs Are Running
-- ============================================================
-- Run this query to check the status of your cron jobs:
-- SELECT * FROM cron.job;

-- ============================================================
-- View Cron Job Execution History
-- ============================================================
-- Run this to see recent job executions and their status:
-- SELECT * FROM cron.job_run_details 
-- ORDER BY start_time DESC 
-- LIMIT 20;

-- ============================================================
-- Manually Trigger Jobs for Testing
-- ============================================================
-- Test data collection:
-- SELECT net.http_post(
--   url := 'https://ktgosplhknmnyagxrgbe.supabase.co/functions/v1/aeso-data-collector',
--   headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt0Z29zcGxoa25tbnlhZ3hyZ2JlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk2OTkzMDUsImV4cCI6MjA2NTI3NTMwNX0.KVs7C_7PHARS-JddBgARWFpDZE6yCeMTLgZhu2UKACE"}'::jsonb,
--   body := '{}'::jsonb
-- );

-- Test model training:
-- SELECT net.http_post(
--   url := 'https://ktgosplhknmnyagxrgbe.supabase.co/functions/v1/aeso-model-trainer',
--   headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt0Z29zcGxoa25tbnlhZ3hyZ2JlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk2OTkzMDUsImV4cCI6MjA2NTI3NTMwNX0.KVs7C_7PHARS-JddBgARWFpDZE6yCeMTLgZhu2UKACE"}'::jsonb,
--   body := '{}'::jsonb
-- );

-- ============================================================
-- Unschedule Jobs (if needed)
-- ============================================================
-- To remove a cron job:
-- SELECT cron.unschedule('aeso-hourly-data-collection');
-- SELECT cron.unschedule('aeso-weekly-model-training');

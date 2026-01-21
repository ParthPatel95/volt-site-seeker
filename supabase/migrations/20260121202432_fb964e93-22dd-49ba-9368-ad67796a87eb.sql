-- Clear all estimated/fake generation data from historical records
-- Real generation data collection only started in November 2025
-- Investor credibility requires real AESO data only

UPDATE aeso_training_data 
SET 
  generation_gas = NULL,
  generation_wind = NULL,
  generation_solar = NULL,
  generation_hydro = NULL,
  generation_coal = NULL,
  generation_other = NULL
WHERE timestamp < '2025-11-01';
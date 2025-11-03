-- Create table for enriched historical training data
CREATE TABLE IF NOT EXISTS aeso_training_data (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  timestamp timestamptz NOT NULL,
  pool_price numeric NOT NULL,
  ail_mw numeric,
  temperature_calgary numeric,
  temperature_edmonton numeric,
  wind_speed numeric,
  cloud_cover numeric,
  solar_irradiance numeric,
  generation_coal numeric,
  generation_gas numeric,
  generation_wind numeric,
  generation_solar numeric,
  generation_hydro numeric,
  interchange_net numeric,
  operating_reserve numeric,
  outage_capacity_mw numeric,
  is_holiday boolean DEFAULT false,
  is_weekend boolean DEFAULT false,
  day_of_week int,
  hour_of_day int,
  month int,
  season text,
  created_at timestamptz DEFAULT now()
);

-- Store price predictions with confidence intervals
CREATE TABLE IF NOT EXISTS aeso_price_predictions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  prediction_timestamp timestamptz NOT NULL,
  target_timestamp timestamptz NOT NULL,
  horizon_hours int NOT NULL,
  predicted_price numeric NOT NULL,
  confidence_lower numeric,
  confidence_upper numeric,
  confidence_score numeric,
  model_version text,
  features_used jsonb,
  created_at timestamptz DEFAULT now()
);

-- Store model performance metrics
CREATE TABLE IF NOT EXISTS aeso_model_performance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  model_version text NOT NULL,
  mae numeric,
  rmse numeric,
  mape numeric,
  r_squared numeric,
  training_period_start timestamptz,
  training_period_end timestamptz,
  evaluation_date timestamptz DEFAULT now(),
  feature_importance jsonb,
  created_at timestamptz DEFAULT now()
);

-- Store weather forecasts for prediction
CREATE TABLE IF NOT EXISTS aeso_weather_forecasts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  forecast_timestamp timestamptz NOT NULL,
  target_timestamp timestamptz NOT NULL,
  location text,
  temperature numeric,
  wind_speed numeric,
  cloud_cover numeric,
  precipitation_probability numeric,
  created_at timestamptz DEFAULT now()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_training_data_timestamp ON aeso_training_data(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_predictions_target_timestamp ON aeso_price_predictions(target_timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_predictions_prediction_timestamp ON aeso_price_predictions(prediction_timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_weather_forecasts_target ON aeso_weather_forecasts(target_timestamp);
CREATE INDEX IF NOT EXISTS idx_model_performance_version ON aeso_model_performance(model_version);

-- Enable Row Level Security
ALTER TABLE aeso_training_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE aeso_price_predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE aeso_model_performance ENABLE ROW LEVEL SECURITY;
ALTER TABLE aeso_weather_forecasts ENABLE ROW LEVEL SECURITY;

-- RLS Policies - Allow public read access for now
CREATE POLICY "Anyone can view training data" ON aeso_training_data FOR SELECT USING (true);
CREATE POLICY "Anyone can view predictions" ON aeso_price_predictions FOR SELECT USING (true);
CREATE POLICY "Anyone can view model performance" ON aeso_model_performance FOR SELECT USING (true);
CREATE POLICY "Anyone can view weather forecasts" ON aeso_weather_forecasts FOR SELECT USING (true);

-- Allow authenticated users to insert data
CREATE POLICY "Authenticated users can insert training data" ON aeso_training_data FOR INSERT WITH CHECK (true);
CREATE POLICY "Authenticated users can insert predictions" ON aeso_price_predictions FOR INSERT WITH CHECK (true);
CREATE POLICY "Authenticated users can insert model performance" ON aeso_model_performance FOR INSERT WITH CHECK (true);
CREATE POLICY "Authenticated users can insert weather forecasts" ON aeso_weather_forecasts FOR INSERT WITH CHECK (true);
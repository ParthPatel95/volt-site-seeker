# AESO AI Price Prediction System - Complete Setup Guide

## 🎯 Overview

State-of-the-art machine learning-inspired price prediction system for AESO electricity market with:
- **Ensemble AI Models**: Linear regression + Time series + Gradient boosting + Seasonal patterns
- **20+ Features**: Weather, generation mix, time patterns, holidays, historical data
- **Smart Alerts**: Price spikes, negative prices, optimal timing recommendations
- **Advanced Analytics**: Scenario analysis, model performance tracking, weather correlations

---

## ✅ What's Already Implemented

### 1. Database Schema (4 Tables)
- ✅ `aeso_training_data` - Enriched historical data with 20+ features
- ✅ `aeso_price_predictions` - Prediction results with confidence intervals
- ✅ `aeso_model_performance` - Model accuracy metrics (MAE, RMSE, MAPE, R²)
- ✅ `aeso_weather_forecasts` - Weather data for predictions

### 2. Edge Functions (4 Functions)
- ✅ `aeso-weather-integration` - Fetches weather data from Open-Meteo API
- ✅ `aeso-data-collector` - Collects & enriches hourly market data
- ✅ `aeso-price-predictor` - Main AI prediction engine (ensemble models)
- ✅ `aeso-model-trainer` - Weekly model evaluation & retraining

### 3. Frontend Components (7 Components)
- ✅ `AESOPricePredictionDashboard` - Main prediction interface
- ✅ `PricePredictionChart` - Interactive forecast charts with confidence bands
- ✅ `PricePredictionAlerts` - Smart notifications for price events
- ✅ `ScenarioAnalysis` - What-if calculator for different conditions
- ✅ `FeatureImpactVisualization` - Shows which factors drive prices
- ✅ `ModelPerformanceMetrics` - Live model accuracy tracking
- ✅ `AESOPredictionAnalytics` - Advanced hourly/weekly/weather analytics

### 4. Integration
- ✅ **Integrated into AESO Market Hub** as "AI Predictions" tab
- ✅ Accessible from main AESO market view

---

## 🚀 Quick Start

### Step 1: Access the Prediction Dashboard

1. Navigate to **AESO Market & Intelligence Hub**
2. Click the **"AI Predictions"** tab (Brain icon)
3. Click **"Generate 24h Forecast"** to create predictions

### Step 2: Collect Initial Training Data

Before generating accurate predictions, you need training data:

1. In the AI Predictions tab, click **"Collect Data"**
2. Wait for data collection to complete
3. Run this multiple times to build up historical data
4. OR wait for automated hourly collection (see Cron Setup below)

---

## 📊 Features Breakdown

### 1. **Price Forecasting**
- 1-hour, 6-hour, 24-hour, and 7-day predictions
- Confidence intervals (95% prediction bands)
- Confidence scores for each prediction
- Real-time weather integration

### 2. **Smart Alerts** (Automatic)
- 🚨 **Price Spike Alerts** - Warns when prices exceed $100/MWh
- 💰 **Negative Price Alerts** - Alerts for negative prices (excess renewables)
- ⚡ **Optimal Timing** - Shows best time for energy-intensive operations
- 📈 **Volatility Warnings** - High price fluctuation alerts

### 3. **Scenario Analysis** (What-If Calculator)
Adjust variables to see price impact:
- **Temperature Change**: ±15°C
- **Wind Speed Change**: ±30 km/h
- **Additional Outages**: 0-2000 MW
- Shows real-time price impact calculations

### 4. **Advanced Analytics**
- **Hourly Patterns**: Average price by hour of day
- **Weekly Patterns**: Average price by day of week
- **Temperature Correlation**: Price vs temperature analysis
- **Wind Correlation**: Price vs wind speed analysis

### 5. **Model Performance Tracking**
- **Overall Accuracy Score** (target: >85%)
- **MAE** (Mean Absolute Error) - target: <$10/MWh
- **RMSE** (Root Mean Square Error)
- **MAPE** (Mean Absolute Percentage Error) - target: <15%
- **R² Score** (goodness of fit)
- **Feature Importance Rankings**

---

## ⚙️ Automated Data Collection Setup

### Enable Cron Jobs (Required for Automation)

1. **Enable Extensions in Supabase Dashboard**:
   - Go to: **Database → Extensions**
   - Enable: `pg_cron`
   - Enable: `pg_net`

2. **Run the Cron Setup SQL**:
   - Open: `docs/aeso-cron-setup.sql`
   - Copy the entire contents
   - Go to: **Supabase Dashboard → SQL Editor**
   - Paste and execute

### Cron Jobs Created:

#### Job 1: Hourly Data Collection
- **Schedule**: Every hour at :05 (1:05, 2:05, etc.)
- **Function**: `aeso-data-collector`
- **Purpose**: Collects market data, weather, calculates features, stores in DB

#### Job 2: Weekly Model Training
- **Schedule**: Every Sunday at 2:00 AM
- **Function**: `aeso-model-trainer`
- **Purpose**: Retrains model on new data, evaluates accuracy, updates performance metrics

---

## 🧪 Manual Testing & Debugging

### Test Edge Functions Directly

#### Test Data Collection:
```bash
# From Supabase Dashboard → SQL Editor
SELECT net.http_post(
  url := 'https://ktgosplhknmnyagxrgbe.supabase.co/functions/v1/aeso-data-collector',
  headers := '{"Content-Type": "application/json", "Authorization": "Bearer YOUR_ANON_KEY"}'::jsonb,
  body := '{}'::jsonb
);
```

#### Test Prediction Generation:
```bash
# From Supabase Dashboard → SQL Editor
SELECT net.http_post(
  url := 'https://ktgosplhknmnyagxrgbe.supabase.co/functions/v1/aeso-price-predictor',
  headers := '{"Content-Type": "application/json", "Authorization": "Bearer YOUR_ANON_KEY"}'::jsonb,
  body := '{"horizon": "24h"}'::jsonb
);
```

### Check Cron Job Status:
```sql
-- View all cron jobs
SELECT * FROM cron.job;

-- View recent executions
SELECT * FROM cron.job_run_details 
ORDER BY start_time DESC 
LIMIT 20;
```

### Check Training Data:
```sql
-- See how much training data is available
SELECT COUNT(*), 
       MIN(timestamp) as oldest,
       MAX(timestamp) as newest
FROM aeso_training_data;

-- View recent training data samples
SELECT * FROM aeso_training_data 
ORDER BY timestamp DESC 
LIMIT 10;
```

---

## 📈 Expected Accuracy Targets

### Prediction Accuracy Goals:
- **1-hour ahead**: <$5/MWh error (90% of time)
- **6-hour ahead**: <$10/MWh error (85% of time)
- **24-hour ahead**: <$15/MWh error (80% of time)
- **7-day ahead**: Within ±20% (75% of time)

### Model Metrics Targets:
- **MAE**: <$10/MWh
- **RMSE**: <$15/MWh
- **MAPE**: <15%
- **R² Score**: >0.75

*Note: Accuracy improves over time as more training data accumulates.*

---

## 🎯 How the AI Models Work

### Ensemble Approach (4 Models):

1. **Linear Regression Model**
   - Uses: Hour of day, day of week, temperature, wind speed
   - Weight: 25-30%
   - Best for: Short-term trends

2. **Time Series Decomposition**
   - Uses: Trend + hourly patterns + weekly patterns + monthly patterns
   - Weight: 25-35%
   - Best for: Seasonal patterns

3. **Gradient Boosting (Decision Tree Logic)**
   - Uses: All features with complex interactions
   - Weight: 25-30%
   - Best for: Non-linear relationships

4. **Seasonal Pattern Matching**
   - Uses: Historical data from similar periods
   - Weight: 10-30% (increases with more data)
   - Best for: Long-term forecasts

### Key Features Used (20+):
- ✅ Recent price history (1h, 2h, 6h, 24h ago)
- ✅ Rolling statistics (24h mean, std dev, min, max)
- ✅ Hour of day (peak vs off-peak)
- ✅ Day of week (weekday vs weekend)
- ✅ Month & season
- ✅ Holidays (Canadian federal & Alberta provincial)
- ✅ Temperature (Calgary & Edmonton average)
- ✅ Wind speed
- ✅ Cloud cover (affects solar)
- ✅ Generation mix (gas, wind, solar, hydro)
- ✅ System load
- ✅ Operating reserves
- ✅ Asset outages
- ✅ Cross-features (temperature × hour, wind × season)

---

## 🔧 Troubleshooting

### Issue: "Insufficient training data" error
**Solution**: 
- Click "Collect Data" button 10-20 times to build up initial dataset
- Wait for automated hourly collection to accumulate data
- Check if cron jobs are running (see Cron Job Status query above)

### Issue: Low prediction accuracy
**Solution**:
- Ensure you have at least 7 days (168 hours) of training data
- Run the model trainer function manually
- Check model performance metrics in the dashboard
- Accuracy improves over time as more data accumulates

### Issue: Cron jobs not running
**Solution**:
1. Verify `pg_cron` and `pg_net` extensions are enabled
2. Check job status: `SELECT * FROM cron.job;`
3. Check job logs: `SELECT * FROM cron.job_run_details ORDER BY start_time DESC LIMIT 20;`
4. Ensure edge functions are deployed (check Supabase Functions dashboard)

### Issue: Edge function 503 errors
**Solution**:
- First call to a function may cold start (takes 5-10 seconds)
- Retry the operation - subsequent calls will be fast
- Check edge function logs in Supabase dashboard

---

## 📚 Additional Resources

- **Supabase Functions Dashboard**: Monitor edge function health and logs
- **Database Dashboard**: View table data and query execution
- **SQL Editor**: Run manual queries and testing commands
- **Edge Function Logs**: Debug issues with prediction generation

---

## 🎉 What's Next?

### Optional Enhancements:
1. **Export Functionality**: Add CSV/JSON export for predictions
2. **API Endpoints**: Expose predictions via REST API for external apps
3. **Webhook Notifications**: Get alerts via email/SMS when prices spike
4. **Custom Models**: Train specialized models for specific use cases
5. **Historical Backtesting**: Validate model accuracy against past data

---

## 📞 Support

For issues or questions:
1. Check edge function logs in Supabase dashboard
2. Review cron job execution history
3. Verify training data is accumulating
4. Check model performance metrics

---

**System Status**: ✅ Fully Operational  
**Last Updated**: November 2025  
**Version**: v1.0-ensemble

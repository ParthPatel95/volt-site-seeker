import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('Calculating enhanced features from training data...');

    // Fetch all training data ordered by timestamp
    let allTrainingData = [];
    let trainingPage = 0;
    const pageSize = 1000;
    
    while (true) {
      const { data, error } = await supabase
        .from('aeso_training_data')
        .select('*')
        .order('timestamp', { ascending: true })
        .range(trainingPage * pageSize, (trainingPage + 1) * pageSize - 1);
      
      if (error) throw error;
      if (!data || data.length === 0) break;
      
      allTrainingData = allTrainingData.concat(data);
      if (data.length < pageSize) break;
      trainingPage++;
    }
    
    const trainingData = allTrainingData;
    if (trainingData.length === 0) throw new Error('No training data available');

    console.log(`Processing ${trainingData.length} training records...`);

    // Fetch ALL natural gas prices (paginated)
    let allGasPrices = [];
    let gasPage = 0;
    
    while (true) {
      const { data, error } = await supabase
        .from('aeso_natural_gas_prices')
        .select('timestamp, price')
        .order('timestamp', { ascending: true })
        .range(gasPage * pageSize, (gasPage + 1) * pageSize - 1);
      
      if (error) throw error;
      if (!data || data.length === 0) break;
      
      allGasPrices = allGasPrices.concat(data);
      if (data.length < pageSize) break;
      gasPage++;
    }
    
    const gasPrices = allGasPrices;
    
    console.log(`Building hourly gas price map from ${gasPrices.length} records...`);
    
    // Build hourly gas price map (data has timestamps at XX:12:36, round to hour)
    const hourlyGasPrices = new Map<number, number>();
    (gasPrices || []).forEach((gp: any) => {
      const timestamp = new Date(gp.timestamp);
      // Round to nearest hour (needed because gas prices are at XX:12:36)
      timestamp.setUTCMinutes(0, 0, 0);
      const timeKey = timestamp.getTime();
      hourlyGasPrices.set(timeKey, gp.price);
    });
    
    console.log(`Gas price map built with ${hourlyGasPrices.size} hourly entries`);
    
    const enhancedFeatures = [];

    for (let i = 0; i < trainingData.length; i++) {
      const current = trainingData[i];
      const currentTime = new Date(current.timestamp);
      
      // ========== PHASE 2: CYCLICAL TEMPORAL FEATURES ==========
      const hour = currentTime.getUTCHours();
      const dayOfWeek = currentTime.getUTCDay();
      const month = currentTime.getUTCMonth() + 1;
      
      const hourSin = Math.sin(2 * Math.PI * hour / 24);
      const hourCos = Math.cos(2 * Math.PI * hour / 24);
      const dayOfWeekSin = Math.sin(2 * Math.PI * dayOfWeek / 7);
      const dayOfWeekCos = Math.cos(2 * Math.PI * dayOfWeek / 7);
      const monthSin = Math.sin(2 * Math.PI * month / 12);
      const monthCos = Math.cos(2 * Math.PI * month / 12);

      // Calculate price volatility (standard deviation over rolling windows)
      const priceVolatility1h = calculateVolatility(trainingData, i, 1);
      const priceVolatility6h = calculateVolatility(trainingData, i, 6);
      const priceVolatility24h = calculateVolatility(trainingData, i, 24);

      // Calculate price momentum (rate of change)
      const priceMomentum3h = calculateMomentum(trainingData, i, 3);
      const priceMomentum24h = calculateMomentum(trainingData, i, 24);
      
      // ========== PHASE 2: ROLLING STATISTICS ==========
      const priceRollingAvg6h = calculateRollingAverage(trainingData, i, 6, 'pool_price');
      const priceRollingAvg24h = calculateRollingAverage(trainingData, i, 24, 'pool_price');
      const windRollingAvg24h = calculateRollingAverage(trainingData, i, 24, 'generation_wind');
      const demandRollingAvg24h = calculateRollingAverage(trainingData, i, 24, 'ail_mw');
      const priceRollingStd24h = calculateRollingStdDev(trainingData, i, 24, 'pool_price');
      
      // Min/max price in last 24 hours
      const priceMin24h = calculateRollingMin(trainingData, i, 24, 'pool_price');
      const priceMax24h = calculateRollingMax(trainingData, i, 24, 'pool_price');
      
      // ========== PHASE 2: MORE LAGGED FEATURES ==========
      // Wind generation lags
      const windLag1h = i >= 1 ? trainingData[i - 1].generation_wind : null;
      const windLag6h = i >= 6 ? trainingData[i - 6].generation_wind : null;
      const windLag24h = i >= 24 ? trainingData[i - 24].generation_wind : null;
      const windLag168h = i >= 168 ? trainingData[i - 168].generation_wind : null;
      
      // Demand lags
      const demandLag1h = i >= 1 ? trainingData[i - 1].ail_mw : null;
      const demandLag24h = i >= 24 ? trainingData[i - 24].ail_mw : null;
      const demandLag168h = i >= 168 ? trainingData[i - 168].ail_mw : null;
      
      // Temperature lags
      const tempLag1h = i >= 1 ? trainingData[i - 1].temperature_calgary : null;
      const tempLag6h = i >= 6 ? trainingData[i - 6].temperature_calgary : null;
      const tempLag24h = i >= 24 ? trainingData[i - 24].temperature_calgary : null;
      
      // Price lags (for autoregressive component)
      const priceLag1h = i >= 1 ? trainingData[i - 1].pool_price : null;
      const priceLag2h = i >= 2 ? trainingData[i - 2].pool_price : null;
      const priceLag3h = i >= 3 ? trainingData[i - 3].pool_price : null;
      const priceLag6h = i >= 6 ? trainingData[i - 6].pool_price : null;
      const priceLag12h = i >= 12 ? trainingData[i - 12].pool_price : null;
      const priceLag24h = i >= 24 ? trainingData[i - 24].pool_price : null;

      // Get hourly natural gas price
      const roundedTime = new Date(currentTime);
      roundedTime.setUTCMinutes(0, 0, 0);
      const timeKey = roundedTime.getTime();
      const gasPrice = hourlyGasPrices.get(timeKey) || null;
      
      // Debug first record
      if (i === 0) {
        console.log(`Debug first record - original timestamp: ${currentTime.toISOString()}`);
        console.log(`Debug first record - rounded timestamp: ${roundedTime.toISOString()}`);
        console.log(`Debug first record - timeKey: ${timeKey}`);
        console.log(`Debug first record - gasPrice: ${gasPrice}`);
        console.log(`Debug first record - map has ${hourlyGasPrices.size} entries`);
        // Show first few map entries
        let count = 0;
        for (const [key, value] of hourlyGasPrices.entries()) {
          if (count < 3) {
            const date = new Date(key);
            console.log(`  Map entry ${count}: key=${key}, date=${date.toISOString()}, price=${value}`);
          }
          count++;
        }
      }
      
      // Calculate lagged gas prices
      const time1d = new Date(currentTime.getTime() - 24 * 60 * 60 * 1000);
      time1d.setUTCMinutes(0, 0, 0);
      const gasPrice1DayAgo = hourlyGasPrices.get(time1d.getTime()) || null;
      
      const time7d = new Date(currentTime.getTime() - 7 * 24 * 60 * 60 * 1000);
      time7d.setUTCMinutes(0, 0, 0);
      const gasPrice7DaysAgo = hourlyGasPrices.get(time7d.getTime()) || null;
      
      const time30d = new Date(currentTime.getTime() - 30 * 24 * 60 * 60 * 1000);
      time30d.setUTCMinutes(0, 0, 0);
      const gasPrice30DaysAgo = hourlyGasPrices.get(time30d.getTime()) || null;

      // Calculate renewable curtailment (difference between potential and actual)
      const renewableCurtailment = calculateRenewableCurtailment(current);

      // Calculate net imports
      const netImports = current.interchange_net || 0;
      
      // ========== PHASE 2: FEATURE INTERACTIONS ==========
      const windGen = current.generation_wind || 0;
      const demand = current.ail_mw || 0;
      const temp = current.temperature_calgary || 10;
      const gasGen = current.generation_gas || 0;
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6 ? 1 : 0;
      
      // Interaction features
      const windGenHourInteraction = windGen * hour; // Wind impact varies by time of day
      const tempDemandInteraction = temp * demand; // Temperature-driven demand
      const gasPriceGasGenInteraction = gasPrice ? (gasPrice * gasGen) : null; // Gas cost impact
      const weekendHourInteraction = isWeekend * hour; // Different patterns on weekends
      const tempExtreme = Math.abs(temp - 15); // Distance from mild temperature
      const tempExtremeHourInteraction = tempExtreme * hour; // Peak heating/cooling times

      enhancedFeatures.push({
        timestamp: current.timestamp,
        // Original features
        price_volatility_1h: priceVolatility1h,
        price_volatility_6h: priceVolatility6h,
        price_volatility_24h: priceVolatility24h,
        price_momentum_3h: priceMomentum3h,
        price_momentum_24h: priceMomentum24h,
        natural_gas_price: gasPrice,
        natural_gas_price_lag_1d: gasPrice1DayAgo,
        natural_gas_price_lag_7d: gasPrice7DaysAgo,
        natural_gas_price_lag_30d: gasPrice30DaysAgo,
        renewable_curtailment: renewableCurtailment,
        net_imports: netImports,
        // Phase 2: Cyclical features
        hour_sin: hourSin,
        hour_cos: hourCos,
        day_of_week_sin: dayOfWeekSin,
        day_of_week_cos: dayOfWeekCos,
        month_sin: monthSin,
        month_cos: monthCos,
        // Phase 2: Rolling statistics
        price_rolling_avg_6h: priceRollingAvg6h,
        price_rolling_avg_24h: priceRollingAvg24h,
        wind_rolling_avg_24h: windRollingAvg24h,
        demand_rolling_avg_24h: demandRollingAvg24h,
        price_rolling_std_24h: priceRollingStd24h,
        price_min_24h: priceMin24h,
        price_max_24h: priceMax24h,
        // Phase 2: More lagged features
        wind_lag_1h: windLag1h,
        wind_lag_6h: windLag6h,
        wind_lag_24h: windLag24h,
        wind_lag_168h: windLag168h,
        demand_lag_1h: demandLag1h,
        demand_lag_24h: demandLag24h,
        demand_lag_168h: demandLag168h,
        temp_lag_1h: tempLag1h,
        temp_lag_6h: tempLag6h,
        temp_lag_24h: tempLag24h,
        price_lag_1h: priceLag1h,
        price_lag_2h: priceLag2h,
        price_lag_3h: priceLag3h,
        price_lag_6h: priceLag6h,
        price_lag_12h: priceLag12h,
        price_lag_24h: priceLag24h,
        // Phase 2: Feature interactions
        wind_gen_hour_interaction: windGenHourInteraction,
        temp_demand_interaction: tempDemandInteraction,
        gas_price_gas_gen_interaction: gasPriceGasGenInteraction,
        weekend_hour_interaction: weekendHourInteraction,
        temp_extreme_hour_interaction: tempExtremeHourInteraction
      });

      // Insert in batches of 1000
      if (enhancedFeatures.length === 1000 || i === trainingData.length - 1) {
        const { error: insertError } = await supabase
          .from('aeso_enhanced_features')
          .upsert(enhancedFeatures, {
            onConflict: 'timestamp',
            ignoreDuplicates: false
          });

        if (insertError) {
          console.error('Error inserting enhanced features:', insertError);
          throw insertError;
        }

        console.log(`Inserted ${enhancedFeatures.length} enhanced feature records`);
        enhancedFeatures.length = 0;
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        featuresCalculated: trainingData.length 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error calculating enhanced features:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function calculateVolatility(data: any[], currentIndex: number, hoursBack: number): number | null {
  const startIndex = Math.max(0, currentIndex - hoursBack);
  const window = data.slice(startIndex, currentIndex + 1);
  
  // Need at least 2 data points, and require at least 50% of expected window
  const expectedPoints = Math.min(hoursBack, currentIndex + 1);
  if (window.length < 2 || window.length < expectedPoints * 0.5) {
    return null;
  }
  
  const prices = window.map(d => d.pool_price).filter(p => p !== null && p !== undefined);
  if (prices.length < 2) return null;
  
  const mean = prices.reduce((sum, p) => sum + p, 0) / prices.length;
  const variance = prices.reduce((sum, p) => sum + Math.pow(p - mean, 2), 0) / prices.length;
  
  return Math.sqrt(variance);
}

function calculateMomentum(data: any[], currentIndex: number, hoursBack: number): number | null {
  const pastIndex = Math.max(0, currentIndex - hoursBack);
  
  // Not enough data
  if (pastIndex === currentIndex || currentIndex < hoursBack) return null;
  
  const currentPrice = data[currentIndex].pool_price;
  const pastPrice = data[pastIndex].pool_price;
  
  // Handle null/undefined prices
  if (currentPrice === null || currentPrice === undefined || pastPrice === null || pastPrice === undefined) {
    return null;
  }
  
  // $0 prices are valid! But we can't calculate momentum from them (division by zero)
  // Instead, use absolute change when past price is $0
  if (pastPrice === 0) {
    return currentPrice * 10; // Scale to percentage-like values (if price goes from $0 to $5, momentum = 50)
  }
  
  return ((currentPrice - pastPrice) / pastPrice) * 100;
}

function calculateRenewableCurtailment(record: any): number {
  // Estimate potential renewable generation based on conditions
  const windGeneration = record.generation_wind || 0;
  const solarGeneration = record.generation_solar || 0;
  
  // During high wind speed periods with low demand, curtailment is likely
  const windSpeed = record.wind_speed || 0;
  const demand = record.ail_mw || 0;
  
  // Simple heuristic: if wind speed is high but generation is low relative to capacity
  // and demand is low, estimate curtailment
  const potentialWind = windSpeed > 30 ? windSpeed * 50 : windGeneration; // Rough estimate
  const estimatedCurtailment = Math.max(0, potentialWind - windGeneration);
  
  return estimatedCurtailment;
}

function getInterpolatedGasPrice(hourlyPrices: Map<number, number>, timestamp: Date): number | null {
  // Round timestamp to start of the hour
  const roundedTime = new Date(timestamp);
  roundedTime.setUTCMinutes(0, 0, 0);
  const timeKey = roundedTime.getTime();
  
  const price = hourlyPrices.get(timeKey);
  return price !== undefined ? price : null;
}

// ========== PHASE 2: ROLLING STATISTICS FUNCTIONS ==========

function calculateRollingAverage(data: any[], currentIndex: number, hoursBack: number, field: string): number | null {
  const startIndex = Math.max(0, currentIndex - hoursBack);
  const window = data.slice(startIndex, currentIndex + 1);
  
  if (window.length < 2) return null;
  
  const values = window.map(d => d[field]).filter(v => v !== null && v !== undefined);
  if (values.length === 0) return null;
  
  return values.reduce((sum, v) => sum + v, 0) / values.length;
}

function calculateRollingStdDev(data: any[], currentIndex: number, hoursBack: number, field: string): number | null {
  const startIndex = Math.max(0, currentIndex - hoursBack);
  const window = data.slice(startIndex, currentIndex + 1);
  
  if (window.length < 2) return null;
  
  const values = window.map(d => d[field]).filter(v => v !== null && v !== undefined);
  if (values.length < 2) return null;
  
  const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
  const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length;
  
  return Math.sqrt(variance);
}

function calculateRollingMin(data: any[], currentIndex: number, hoursBack: number, field: string): number | null {
  const startIndex = Math.max(0, currentIndex - hoursBack);
  const window = data.slice(startIndex, currentIndex + 1);
  
  if (window.length === 0) return null;
  
  const values = window.map(d => d[field]).filter(v => v !== null && v !== undefined);
  if (values.length === 0) return null;
  
  return Math.min(...values);
}

function calculateRollingMax(data: any[], currentIndex: number, hoursBack: number, field: string): number | null {
  const startIndex = Math.max(0, currentIndex - hoursBack);
  const window = data.slice(startIndex, currentIndex + 1);
  
  if (window.length === 0) return null;
  
  const values = window.map(d => d[field]).filter(v => v !== null && v !== undefined);
  if (values.length === 0) return null;
  
  return Math.max(...values);
}
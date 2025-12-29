import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('Collecting AESO training data...');

    // Fetch current market data and weather data
    const energyData = await supabase.functions.invoke('energy-data-integration');
    const weatherData = await supabase.functions.invoke('aeso-weather-integration');

    console.log('Energy data full response:', JSON.stringify(energyData, null, 2));

    if (energyData.error) {
      console.error('Error fetching energy data:', energyData.error);
      throw new Error('Failed to fetch energy data: ' + energyData.error.message);
    }

    if (!energyData.data?.aeso) {
      console.error('No AESO data in response:', energyData.data);
      throw new Error('Failed to fetch AESO market data - no aeso data in response');
    }

    const aesoData = energyData.data.aeso;
    const currentTime = new Date();
    
    // Check if pricing data exists (API succeeded)
    if (!aesoData.pricing) {
      console.error('ERROR: AESO API failed - no pricing object returned');
      console.error('API success indicator:', aesoData.apiSuccess);
      console.error('Full AESO data:', JSON.stringify(aesoData, null, 2));
      throw new Error('AESO API failure: No pricing data available. Cannot collect training data when API is down.');
    }
    
    const poolPrice = aesoData.pricing.current_price;
    const systemMarginalPrice = aesoData.pricing.system_marginal_price;
    const smpSpread = aesoData.pricing.smp_spread;
    
    console.log('Pool price:', poolPrice);
    console.log('System Marginal Price:', systemMarginalPrice);
    console.log('SMP-Pool Spread:', smpSpread);
    console.log('AESO pricing data:', JSON.stringify(aesoData.pricing, null, 2));
    console.log('AESO load data:', JSON.stringify(aesoData.loadData, null, 2));
    console.log('Intertie flows:', JSON.stringify(aesoData.intertieFlows, null, 2));
    console.log('Operating reserve:', JSON.stringify(aesoData.operatingReserve, null, 2));
    console.log('Generation outages:', JSON.stringify(aesoData.generationOutages, null, 2));
    console.log('Wind forecast:', aesoData.windForecast ? `${aesoData.windForecast.forecasts?.length || 0} hours available` : 'Not available');
    console.log('Solar forecast:', aesoData.solarForecast ? `${aesoData.solarForecast.forecasts?.length || 0} hours available` : 'Not available');
    console.log('Load forecast:', aesoData.loadForecast ? `${aesoData.loadForecast.forecasts?.length || 0} hours available` : 'Not available');
    
    // NEW: Fetch actual forecast data from AESO API
    const forecastApiKey = Deno.env.get('AESO_SUBSCRIPTION_KEY_PRIMARY') ||
                           Deno.env.get('AESO_API_KEY') ||
                           Deno.env.get('AESO_SUB_KEY') ||
                           Deno.env.get('AESO_SUBSCRIPTION_KEY_SECONDARY');
    
    let loadForecastData = null;
    if (forecastApiKey) {
      try {
        const formatDate = (date: Date) => {
          const month = String(date.getMonth() + 1).padStart(2, '0');
          const day = String(date.getDate()).padStart(2, '0');
          const year = date.getFullYear();
          return `${month}${day}${year}`;
        };
        
        const now = new Date();
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        const forecastResponse = await fetch(
          `https://apimgw.aeso.ca/public/actualforecast-api/v1/load/albertaInternalLoad?startDate=${formatDate(now)}&endDate=${formatDate(tomorrow)}`,
          { 
            headers: { 
              'Accept': 'application/json',
              'Ocp-Apim-Subscription-Key': forecastApiKey
            } 
          }
        );
        
        if (forecastResponse.ok) {
          loadForecastData = await forecastResponse.json();
          console.log('✅ Fetched load forecast data from AESO API:', loadForecastData?.return?.['Actual Forecast']?.length || 0, 'hours');
        } else {
          console.warn('Load forecast API returned:', forecastResponse.status);
        }
      } catch (e) {
        console.warn('Could not fetch load forecast:', e);
      }
    }
    
    // Validate pool price exists (can be zero or negative - both are valid market prices)
    if (poolPrice === undefined || poolPrice === null) {
      console.error('ERROR: Pool price is undefined/null despite pricing object existing');
      console.error('Full AESO data:', JSON.stringify(aesoData, null, 2));
      throw new Error('AESO data integrity error: pricing object exists but current_price is undefined.');
    }
    
    // Price range validation (-$100 to $1000 per MWh)
    if (poolPrice < -100 || poolPrice > 1000) {
      console.warn('⚠️ UNUSUAL PRICE DETECTED:', poolPrice, '$/MWh - outside normal range [-100, 1000]');
      console.log('This price will be stored but flagged for review');
    }
    
    // Log zero prices (legitimate market condition - oversupply)
    if (poolPrice === 0) {
      console.log('✅ Zero pool price - valid market condition (oversupply)');
    } else {
      console.log('✅ Valid pool price:', poolPrice, '$/MWh');
    }

    // Calculate derived features
    const isWeekend = currentTime.getDay() === 0 || currentTime.getDay() === 6;
    const dayOfWeek = currentTime.getDay();
    const hourOfDay = currentTime.getHours();
    const month = currentTime.getMonth() + 1;
    const season = getSeason(month);
    const isHoliday = checkIfHoliday(currentTime);

    // Get latest weather data for both cities
    const { data: calgaryWeather } = await supabase
      .from('aeso_weather_forecasts')
      .select('*')
      .eq('location', 'Calgary')
      .order('target_timestamp', { ascending: false })
      .limit(1)
      .single();

    const { data: edmontonWeather } = await supabase
      .from('aeso_weather_forecasts')
      .select('*')
      .eq('location', 'Edmonton')
      .order('target_timestamp', { ascending: false })
      .limit(1)
      .single();

    
    // Extract generation mix data
    const generationData = aesoData.generationMix || {};
    const intertieData = aesoData.intertieFlows || {};
    const orData = aesoData.operatingReserve || {};
    const outageData = aesoData.generationOutages || {};
    
    // Enhanced logging for operating reserves
    console.log('📊 Operating Reserve extraction:', {
      raw: orData,
      total_mw: orData?.total_mw,
      spinning_mw: orData?.spinning_mw,
      supplemental_mw: orData?.supplemental_mw,
      required_mw: orData?.required_mw,
      price: orData?.price
    });
    
    console.log('Generation mix data:', generationData);
    
    // Extract forecast values from AESO Actual Forecast API
    let loadForecast1h = null, loadForecast3h = null, loadForecast24h = null;
    if (loadForecastData?.return?.['Actual Forecast']) {
      const forecasts = loadForecastData.return['Actual Forecast'];
      // Sort by forecast hour to get 1h, 3h, 24h ahead
      forecasts.sort((a: any, b: any) => {
        const aTime = new Date(`${a.forecast_date} ${a.forecast_hour_ending.split(' ')[0]}`);
        const bTime = new Date(`${b.forecast_date} ${b.forecast_hour_ending.split(' ')[0]}`);
        return aTime.getTime() - bTime.getTime();
      });
      
      // Extract forecasts at specific horizons (1h, 3h, 24h ahead)
      if (forecasts.length > 0) loadForecast1h = parseFloat(forecasts[0]?.forecast_ail) || null;
      if (forecasts.length > 2) loadForecast3h = parseFloat(forecasts[2]?.forecast_ail) || null;
      if (forecasts.length > 23) loadForecast24h = parseFloat(forecasts[23]?.forecast_ail) || null;
      
      console.log('📊 Load forecasts extracted:', {
        '1h': loadForecast1h,
        '3h': loadForecast3h,
        '24h': loadForecast24h
      });
    }
    
    // Calculate grid stress score (0-100)
    const demand = aesoData.loadData?.current_demand_mw || 0;
    const availableCapacity = outageData.available_mw || 0;
    const reserveMargin = availableCapacity > 0 && demand > 0 
      ? ((availableCapacity - demand) / demand) * 100 
      : 15; // Default to 15% if unavailable
    
    const gridStressScore = calculateGridStressScore(
      poolPrice,
      reserveMargin,
      orData.price || 0,
      outageData.outages_mw || 0
    );
    
    // Calculate renewable penetration percentage
    const totalGeneration = (generationData.wind_mw || 0) + (generationData.solar_mw || 0) + 
                            (generationData.natural_gas_mw || 0) + (generationData.coal_mw || 0) + 
                            (generationData.hydro_mw || 0) + (generationData.other_mw || 0);
    const renewableMW = (generationData.wind_mw || 0) + (generationData.solar_mw || 0) + (generationData.hydro_mw || 0);
    const renewablePenetration = totalGeneration > 0 ? (renewableMW / totalGeneration) * 100 : null;
    
    // Calculate price spike probability based on multiple factors
    const priceSpikeProb = calculatePriceSpikeProb(poolPrice, gridStressScore, reserveMargin);
    
    console.log('📊 Calculated derived metrics:', {
      reserveMargin: reserveMargin?.toFixed(2),
      renewablePenetration: renewablePenetration?.toFixed(2),
      priceSpikeProb: priceSpikeProb?.toFixed(2),
      gridStressScore
    });
    
    // Fetch last 24 hours of price data for rolling analytics calculations
    let priceRollingAvg24h = null;
    let priceRollingStd24h = null;
    let priceVolatility6h = null;
    let priceMomentum3h = null;
    
    const { data: recentPrices, error: pricesError } = await supabase
      .from('aeso_training_data')
      .select('pool_price, timestamp')
      .gte('timestamp', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
      .order('timestamp', { ascending: true });
    
    if (!pricesError && recentPrices && recentPrices.length >= 3) {
      const prices = recentPrices.map(r => r.pool_price).filter(p => p !== null && p !== undefined) as number[];
      
      if (prices.length >= 3) {
        // 24h rolling average
        priceRollingAvg24h = prices.reduce((a, b) => a + b, 0) / prices.length;
        
        // 24h rolling standard deviation
        const variance = prices.reduce((sum, p) => sum + Math.pow(p - priceRollingAvg24h!, 2), 0) / prices.length;
        priceRollingStd24h = Math.sqrt(variance);
        
        // 6h volatility (last 6 prices)
        const last6 = prices.slice(-6);
        if (last6.length >= 2) {
          const min6 = Math.min(...last6);
          const max6 = Math.max(...last6);
          const avg6 = last6.reduce((a, b) => a + b, 0) / last6.length;
          priceVolatility6h = avg6 > 0 ? ((max6 - min6) / avg6) * 100 : 0;
        }
        
        // 3h momentum (price change over last 3 hours)
        const last3 = prices.slice(-3);
        if (last3.length >= 2) {
          priceMomentum3h = last3[last3.length - 1] - last3[0];
        }
        
        console.log('📊 Rolling analytics calculated:', {
          avg24h: priceRollingAvg24h?.toFixed(2),
          std24h: priceRollingStd24h?.toFixed(2),
          volatility6h: priceVolatility6h?.toFixed(1),
          momentum3h: priceMomentum3h?.toFixed(2),
          pricesUsed: prices.length
        });
      }
    } else {
      console.log('⚠️ Could not calculate rolling analytics:', pricesError?.message || 'Not enough data');
    }
    
    // Create training data record with enhanced features
    const trainingData = {
      timestamp: currentTime.toISOString(),
      pool_price: poolPrice,
      system_marginal_price: systemMarginalPrice,
      smp_pool_price_spread: smpSpread,
      ail_mw: demand || null,
      temperature_calgary: calgaryWeather?.temperature || null,
      temperature_edmonton: edmontonWeather?.temperature || null,
      wind_speed: calgaryWeather?.wind_speed || null,
      cloud_cover: calgaryWeather?.cloud_cover || null,
      solar_irradiance: calculateSolarIrradiance(calgaryWeather?.cloud_cover || 0, hourOfDay),
      generation_coal: generationData.coal_mw || 0,
      generation_gas: generationData.natural_gas_mw || 0,
      generation_wind: generationData.wind_mw || 0,
      generation_solar: generationData.solar_mw || 0,
      generation_hydro: generationData.hydro_mw || 0,
      generation_other: generationData.other_mw || 0,
      // NEW: Actual load forecasts from AESO Actual Forecast API
      load_forecast_1h: loadForecast1h,
      load_forecast_3h: loadForecast3h,
      load_forecast_24h: loadForecast24h,
      // Note: Wind, solar, and pool price forecasts are NOT available via AESO public API
      wind_forecast_1h: null,
      wind_forecast_3h: null,
      wind_forecast_24h: null,
      solar_forecast_1h: null,
      solar_forecast_3h: null,
      solar_forecast_24h: null,
      pool_price_forecast_1h: null,
      pool_price_forecast_3h: null,
      pool_price_forecast_24h: null,
      // Intertie flows (positive = import, negative = export)
      intertie_bc_flow: intertieData.bc_flow || 0,
      intertie_sask_flow: intertieData.sask_flow || 0,
      intertie_montana_flow: intertieData.montana_flow || 0,
      total_interchange_flow: intertieData.total_flow || 0,
      interchange_net: intertieData.total_flow || 0,
      // Operating Reserve - Enhanced mapping from energy-data-integration
      operating_reserve_price: orData?.price ?? null,
      spinning_reserve_mw: orData?.spinning_mw ?? orData?.total_mw ?? null,
      supplemental_reserve_mw: orData?.supplemental_mw ?? null,
      operating_reserve: orData?.total_mw ?? (orData?.spinning_mw || 0) + (orData?.supplemental_mw || 0),
      // Generation Outages & Capacity - Use calculated values from energy-data-integration
      generation_outages_mw: outageData.outages_mw || 0,
      available_capacity_mw: outageData.available_mw || null,
      outage_capacity_mw: outageData.outages_mw || 0,
      transmission_outages_count: 0,
      // Rolling Price Analytics - Calculated from historical data
      price_rolling_avg_24h: priceRollingAvg24h,
      price_rolling_std_24h: priceRollingStd24h,
      price_volatility_6h: priceVolatility6h,
      price_momentum_3h: priceMomentum3h,
      // Market Indicators
      reserve_margin_percent: reserveMargin,
      grid_stress_score: gridStressScore,
      renewable_penetration: renewablePenetration,
      price_spike_probability: priceSpikeProb,
      // Temporal features
      is_holiday: isHoliday,
      is_weekend: isWeekend,
      day_of_week: dayOfWeek,
      hour_of_day: hourOfDay,
      month: month,
      season: season
    };

    // Insert training data
    const { error: insertError } = await supabase
      .from('aeso_training_data')
      .insert(trainingData);

    if (insertError) {
      console.error('Error inserting training data:', insertError);
      throw insertError;
    }

    console.log('Training data collected successfully');

    return new Response(JSON.stringify({
      success: true,
      timestamp: currentTime.toISOString(),
      pool_price: poolPrice,
      features_collected: Object.keys(trainingData).length
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Data collection error:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

function getSeason(month: number): string {
  if (month >= 3 && month <= 5) return 'spring';
  if (month >= 6 && month <= 8) return 'summer';
  if (month >= 9 && month <= 11) return 'fall';
  return 'winter';
}

function checkIfHoliday(date: Date): boolean {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  
  // Canadian federal and Alberta holidays
  const holidays = [
    { month: 1, day: 1 }, // New Year's Day
    { month: 2, day: 15 }, // Family Day (3rd Monday - approximate)
    { month: 4, day: 7 }, // Good Friday (varies - approximate)
    { month: 5, day: 22 }, // Victoria Day (Monday before May 25 - approximate)
    { month: 7, day: 1 }, // Canada Day
    { month: 8, day: 1 }, // Heritage Day (1st Monday - approximate)
    { month: 9, day: 4 }, // Labour Day (1st Monday - approximate)
    { month: 10, day: 9 }, // Thanksgiving (2nd Monday - approximate)
    { month: 11, day: 11 }, // Remembrance Day
    { month: 12, day: 25 }, // Christmas
    { month: 12, day: 26 }, // Boxing Day
  ];
  
  return holidays.some(h => h.month === month && h.day === day);
}

function calculateSolarIrradiance(cloudCover: number, hour: number): number {
  // Simplified solar irradiance calculation
  // Max irradiance around noon, reduced by cloud cover
  const hourAngle = Math.abs(hour - 12) / 12; // 0 at noon, 1 at midnight
  const maxIrradiance = 1000; // W/m²
  const solarFactor = Math.max(0, 1 - hourAngle);
  const cloudFactor = 1 - (cloudCover / 100);
  return maxIrradiance * solarFactor * cloudFactor;
}

function calculateOutageCapacity(outages: any): number {
  if (!outages || !Array.isArray(outages)) return 0;
  return outages.reduce((sum: number, outage: any) => sum + (outage.capacity || 0), 0);
}

function calculateGridStressScore(
  poolPrice: number,
  reserveMargin: number | null,
  orPrice: number,
  outagesMW: number
): number {
  // Grid stress score (0-100): combines price, reserve margin, OR price, outages
  let score = 0;
  
  // Price component (0-40 points): higher price = more stress
  if (poolPrice > 200) score += 40;
  else if (poolPrice > 100) score += 30;
  else if (poolPrice > 50) score += 15;
  else if (poolPrice > 20) score += 5;
  
  // Reserve margin component (0-30 points): lower margin = more stress
  if (reserveMargin !== null) {
    if (reserveMargin < 5) score += 30;
    else if (reserveMargin < 10) score += 20;
    else if (reserveMargin < 15) score += 10;
    else if (reserveMargin < 20) score += 5;
  }
  
  // Operating reserve price component (0-20 points)
  if (orPrice > 100) score += 20;
  else if (orPrice > 50) score += 15;
  else if (orPrice > 20) score += 10;
  else if (orPrice > 10) score += 5;
  
  // Outages component (0-10 points): more outages = more stress
  if (outagesMW > 2000) score += 10;
  else if (outagesMW > 1000) score += 7;
  else if (outagesMW > 500) score += 4;
  else if (outagesMW > 0) score += 2;
  
  return Math.min(100, score);
}

function calculatePriceSpikeProb(price: number, stress: number, reserve: number): number {
  let prob = 10; // Base probability
  
  // Price component
  if (price > 100) prob += 30;
  else if (price > 50) prob += 15;
  else if (price > 30) prob += 5;
  
  // Grid stress component
  if (stress > 70) prob += 40;
  else if (stress > 40) prob += 20;
  else if (stress > 20) prob += 10;
  
  // Reserve margin component (lower = higher risk)
  if (reserve < 10) prob += 20;
  else if (reserve < 15) prob += 10;
  else if (reserve < 20) prob += 5;
  
  return Math.min(prob, 95);
}

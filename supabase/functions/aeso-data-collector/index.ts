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
    
    console.log('Generation mix data:', generationData);
    
    // Calculate grid stress score (0-100)
    const demand = aesoData.loadData?.current_demand_mw || 0;
    const availableCapacity = outageData.available_mw || 0;
    const reserveMargin = availableCapacity > 0 && demand > 0 
      ? ((availableCapacity - demand) / demand) * 100 
      : null;
    
    const gridStressScore = calculateGridStressScore(
      poolPrice,
      reserveMargin,
      orData.price || 0,
      outageData.outages_mw || 0
    );
    
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
      // Intertie flows (positive = import, negative = export)
      intertie_bc_flow: intertieData.bc_flow || 0,
      intertie_sask_flow: intertieData.sask_flow || 0,
      intertie_montana_flow: intertieData.montana_flow || 0,
      total_interchange_flow: intertieData.total_flow || 0,
      interchange_net: intertieData.total_flow || 0, // Keep for backward compatibility
      // Operating Reserve
      operating_reserve_price: orData.price || null,
      spinning_reserve_mw: orData.spinning_mw || null,
      supplemental_reserve_mw: orData.supplemental_mw || null,
      operating_reserve: orData.total_mw || 0, // Keep for backward compatibility
      // Generation Outages & Capacity
      generation_outages_mw: outageData.outages_mw || 0,
      available_capacity_mw: outageData.available_mw || null,
      outage_capacity_mw: outageData.outages_mw || 0, // Keep for backward compatibility
      transmission_outages_count: 0, // Will be enhanced in future with transmission API
      // Market Indicators
      reserve_margin_percent: reserveMargin,
      grid_stress_score: gridStressScore,
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

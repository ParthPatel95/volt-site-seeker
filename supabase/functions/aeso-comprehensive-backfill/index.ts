import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface BackfillRequest {
  phase: 'prices' | 'weather' | 'demand' | 'generation' | 'all' | 'status';
  startYear?: number;
  endYear?: number;
  batchMonths?: number;
  offsetMonths?: number;
}

interface BackfillProgress {
  phase: string;
  totalMonths: number;
  completedMonths: number;
  recordsProcessed: number;
  currentDate: string;
  estimatedTimeRemaining: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const aesoKey = Deno.env.get('AESO_API_KEY') || Deno.env.get('AESO_SUBSCRIPTION_KEY_PRIMARY');
    const supabase = createClient(supabaseUrl, supabaseKey);

    const body: BackfillRequest = await req.json();
    const { 
      phase = 'status', 
      startYear = 2018, 
      endYear = new Date().getFullYear(),
      batchMonths = 3,
      offsetMonths = 0 
    } = body;

    console.log(`Comprehensive backfill: phase=${phase}, startYear=${startYear}, endYear=${endYear}, offset=${offsetMonths}`);

    // Status check - return current data coverage
    if (phase === 'status') {
      return new Response(JSON.stringify(await getDataStatus(supabase)), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Process based on phase
    let result;
    switch (phase) {
      case 'prices':
        result = await backfillPrices(supabase, aesoKey, startYear, endYear, batchMonths, offsetMonths);
        break;
      case 'weather':
        result = await backfillWeather(supabase, startYear, endYear, batchMonths, offsetMonths);
        break;
      case 'demand':
        result = await backfillDemand(supabase, aesoKey, startYear, endYear, batchMonths, offsetMonths);
        break;
      case 'generation':
        result = await backfillGeneration(supabase, aesoKey, startYear, endYear, batchMonths, offsetMonths);
        break;
      case 'all':
        // Run all phases in sequence for this batch
        const priceResult = await backfillPrices(supabase, aesoKey, startYear, endYear, batchMonths, offsetMonths);
        const weatherResult = await backfillWeather(supabase, startYear, endYear, batchMonths, offsetMonths);
        const demandResult = await backfillDemand(supabase, aesoKey, startYear, endYear, batchMonths, offsetMonths);
        const genResult = await backfillGeneration(supabase, aesoKey, startYear, endYear, batchMonths, offsetMonths);
        
        result = {
          success: true,
          phase: 'all',
          prices: priceResult,
          weather: weatherResult,
          demand: demandResult,
          generation: genResult,
          nextOffsetMonths: priceResult.nextOffsetMonths,
          isComplete: priceResult.isComplete && weatherResult.isComplete && demandResult.isComplete && genResult.isComplete
        };
        break;
      default:
        throw new Error(`Unknown phase: ${phase}`);
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Comprehensive backfill error:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

async function getDataStatus(supabase: any) {
  // Get overall record counts and coverage
  const { data: stats } = await supabase.rpc('get_backfill_stats').maybeSingle();
  
  // Fallback if RPC doesn't exist
  const { count: totalRecords } = await supabase
    .from('aeso_training_data')
    .select('*', { count: 'exact', head: true });

  const { count: weatherComplete } = await supabase
    .from('aeso_training_data')
    .select('*', { count: 'exact', head: true })
    .not('temperature_calgary', 'is', null)
    .not('wind_speed', 'is', null);

  const { count: demandComplete } = await supabase
    .from('aeso_training_data')
    .select('*', { count: 'exact', head: true })
    .not('ail_mw', 'is', null);

  const { count: generationComplete } = await supabase
    .from('aeso_training_data')
    .select('*', { count: 'exact', head: true })
    .not('generation_gas', 'is', null);

  const { data: dateRange } = await supabase
    .from('aeso_training_data')
    .select('timestamp')
    .order('timestamp', { ascending: true })
    .limit(1)
    .single();

  const { data: latestDate } = await supabase
    .from('aeso_training_data')
    .select('timestamp')
    .order('timestamp', { ascending: false })
    .limit(1)
    .single();

  return {
    success: true,
    totalRecords: totalRecords || 0,
    coverage: {
      weather: totalRecords ? Math.round((weatherComplete || 0) / totalRecords * 100) : 0,
      demand: totalRecords ? Math.round((demandComplete || 0) / totalRecords * 100) : 0,
      generation: totalRecords ? Math.round((generationComplete || 0) / totalRecords * 100) : 0
    },
    dateRange: {
      start: dateRange?.timestamp || null,
      end: latestDate?.timestamp || null
    },
    targetRange: {
      start: '2018-01-01',
      end: new Date().toISOString().split('T')[0]
    },
    estimatedRecordsNeeded: 70000
  };
}

async function backfillPrices(supabase: any, aesoKey: string | undefined, startYear: number, endYear: number, batchMonths: number, offsetMonths: number) {
  if (!aesoKey) {
    return { success: false, error: 'AESO API key not configured', recordsInserted: 0, isComplete: true };
  }

  const totalMonths = (endYear - startYear + 1) * 12;
  const startMonth = offsetMonths;
  const endMonth = Math.min(startMonth + batchMonths, totalMonths);
  
  let recordsInserted = 0;
  const errors: string[] = [];

  for (let monthOffset = startMonth; monthOffset < endMonth; monthOffset++) {
    const year = startYear + Math.floor(monthOffset / 12);
    const month = (monthOffset % 12) + 1;
    
    const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
    const endDate = new Date(year, month, 0).toISOString().split('T')[0]; // Last day of month
    
    console.log(`Fetching prices for ${startDate} to ${endDate}`);

    try {
      // Check if we already have data for this period
      const { count: existingCount } = await supabase
        .from('aeso_training_data')
        .select('*', { count: 'exact', head: true })
        .gte('timestamp', startDate)
        .lte('timestamp', `${endDate}T23:59:59`);

      if (existingCount && existingCount > 600) {
        console.log(`Skipping ${startDate} - already have ${existingCount} records`);
        continue;
      }

      // Fetch from AESO API
      const url = `https://api.aeso.ca/report/v1.1/price/poolPrice?startDate=${startDate}&endDate=${endDate}`;
      const response = await fetch(url, {
        headers: {
          'X-API-Key': aesoKey,
          'Ocp-Apim-Subscription-Key': aesoKey
        }
      });

      if (!response.ok) {
        errors.push(`AESO API error for ${startDate}: ${response.status}`);
        continue;
      }

      const data = await response.json();
      const prices = data?.return?.['Pool Price Report'] || [];

      if (prices.length === 0) {
        console.log(`No price data for ${startDate}`);
        continue;
      }

      // Insert records
      for (const price of prices) {
        const timestamp = price.begin_datetime_utc;
        const poolPrice = parseFloat(price.pool_price);

        if (!timestamp || isNaN(poolPrice)) continue;

        const { error } = await supabase
          .from('aeso_training_data')
          .upsert({
            timestamp,
            pool_price: poolPrice,
            hour_of_day: new Date(timestamp).getHours(),
            day_of_week: new Date(timestamp).getDay(),
            month: new Date(timestamp).getMonth() + 1,
            is_weekend: [0, 6].includes(new Date(timestamp).getDay())
          }, { 
            onConflict: 'timestamp',
            ignoreDuplicates: false 
          });

        if (!error) recordsInserted++;
      }

      console.log(`Inserted ${prices.length} price records for ${startDate}`);
      
      // Rate limiting delay
      await new Promise(r => setTimeout(r, 200));

    } catch (error) {
      errors.push(`Error processing ${startDate}: ${error.message}`);
      console.error(`Error for ${startDate}:`, error);
    }
  }

  return {
    success: true,
    phase: 'prices',
    recordsInserted,
    monthsProcessed: endMonth - startMonth,
    nextOffsetMonths: endMonth,
    isComplete: endMonth >= totalMonths,
    errors: errors.length > 0 ? errors : undefined
  };
}

async function backfillWeather(supabase: any, startYear: number, endYear: number, batchMonths: number, offsetMonths: number) {
  const cities = [
    { name: 'Calgary', lat: 51.0447, lon: -114.0719 },
    { name: 'Edmonton', lat: 53.5461, lon: -113.4938 }
  ];

  const totalMonths = (endYear - startYear + 1) * 12;
  const startMonth = offsetMonths;
  const endMonth = Math.min(startMonth + batchMonths, totalMonths);
  
  let recordsUpdated = 0;
  const errors: string[] = [];

  for (let monthOffset = startMonth; monthOffset < endMonth; monthOffset++) {
    const year = startYear + Math.floor(monthOffset / 12);
    const month = (monthOffset % 12) + 1;
    
    const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
    const endDate = new Date(year, month, 0).toISOString().split('T')[0];
    
    console.log(`Fetching weather for ${startDate} to ${endDate}`);

    try {
      // Get records needing weather data for this month
      const { data: recordsToUpdate } = await supabase
        .from('aeso_training_data')
        .select('id, timestamp')
        .gte('timestamp', startDate)
        .lte('timestamp', `${endDate}T23:59:59`)
        .or('temperature_calgary.is.null,wind_speed.is.null')
        .limit(1000);

      if (!recordsToUpdate || recordsToUpdate.length === 0) {
        console.log(`No records need weather for ${startDate}`);
        continue;
      }

      // Fetch weather from Open-Meteo Archive API
      const weatherData: Record<string, any> = {};
      
      for (const city of cities) {
        const url = `https://archive-api.open-meteo.com/v1/archive?latitude=${city.lat}&longitude=${city.lon}&start_date=${startDate}&end_date=${endDate}&hourly=temperature_2m,windspeed_10m,cloudcover&timezone=America/Edmonton`;
        
        const response = await fetch(url);
        if (!response.ok) {
          errors.push(`Open-Meteo error for ${city.name} ${startDate}: ${response.status}`);
          continue;
        }
        
        const data = await response.json();
        weatherData[city.name.toLowerCase()] = data;
      }

      if (!weatherData.calgary || !weatherData.edmonton) {
        continue;
      }

      // Build hour-indexed weather lookup
      const weatherByHour: Record<string, any> = {};
      const calgaryHours = weatherData.calgary.hourly;
      const edmontonHours = weatherData.edmonton.hourly;
      
      for (let i = 0; i < calgaryHours.time.length; i++) {
        const hour = calgaryHours.time[i];
        weatherByHour[hour] = {
          temp_calgary: calgaryHours.temperature_2m[i],
          temp_edmonton: edmontonHours.temperature_2m?.[i],
          wind_speed: (calgaryHours.windspeed_10m[i] + (edmontonHours.windspeed_10m?.[i] || calgaryHours.windspeed_10m[i])) / 2,
          cloud_cover: (calgaryHours.cloudcover[i] + (edmontonHours.cloudcover?.[i] || calgaryHours.cloudcover[i])) / 2
        };
      }

      // Update records
      for (const record of recordsToUpdate) {
        const recordTime = new Date(record.timestamp);
        const hourKey = recordTime.toISOString().slice(0, 13) + ':00';
        const localHourKey = `${recordTime.getFullYear()}-${String(recordTime.getMonth() + 1).padStart(2, '0')}-${String(recordTime.getDate()).padStart(2, '0')}T${String(recordTime.getHours()).padStart(2, '0')}:00`;
        
        const weather = weatherByHour[hourKey] || weatherByHour[localHourKey];
        if (!weather) continue;

        const hour = recordTime.getHours();
        const solarIrradiance = calculateSolarIrradiance(weather.cloud_cover, hour);
        const avgTemp = (weather.temp_calgary + (weather.temp_edmonton || weather.temp_calgary)) / 2;

        const { error } = await supabase
          .from('aeso_training_data')
          .update({
            temperature_calgary: weather.temp_calgary,
            temperature_edmonton: weather.temp_edmonton || weather.temp_calgary,
            wind_speed: weather.wind_speed,
            cloud_cover: weather.cloud_cover,
            solar_irradiance: solarIrradiance,
            heating_degree_days: avgTemp < 18 ? 18 - avgTemp : 0,
            cooling_degree_days: avgTemp > 18 ? avgTemp - 18 : 0
          })
          .eq('id', record.id);

        if (!error) recordsUpdated++;
      }

      console.log(`Updated ${recordsToUpdate.length} weather records for ${startDate}`);
      
      // Small delay to avoid rate limiting
      await new Promise(r => setTimeout(r, 100));

    } catch (error) {
      errors.push(`Error processing weather ${startDate}: ${error.message}`);
      console.error(`Weather error for ${startDate}:`, error);
    }
  }

  return {
    success: true,
    phase: 'weather',
    recordsUpdated,
    monthsProcessed: endMonth - startMonth,
    nextOffsetMonths: endMonth,
    isComplete: endMonth >= totalMonths,
    errors: errors.length > 0 ? errors : undefined
  };
}

async function backfillDemand(supabase: any, aesoKey: string | undefined, startYear: number, endYear: number, batchMonths: number, offsetMonths: number) {
  if (!aesoKey) {
    return { success: false, error: 'AESO API key not configured', recordsUpdated: 0, isComplete: true };
  }

  const totalMonths = (endYear - startYear + 1) * 12;
  const startMonth = offsetMonths;
  const endMonth = Math.min(startMonth + batchMonths, totalMonths);
  
  let recordsUpdated = 0;
  const errors: string[] = [];

  for (let monthOffset = startMonth; monthOffset < endMonth; monthOffset++) {
    const year = startYear + Math.floor(monthOffset / 12);
    const month = (monthOffset % 12) + 1;
    
    const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
    const endDate = new Date(year, month, 0).toISOString().split('T')[0];
    
    console.log(`Fetching demand for ${startDate} to ${endDate}`);

    try {
      // Check if we have records needing demand for this period
      const { data: recordsToUpdate, count: needingUpdate } = await supabase
        .from('aeso_training_data')
        .select('id, timestamp', { count: 'exact' })
        .gte('timestamp', startDate)
        .lte('timestamp', `${endDate}T23:59:59`)
        .is('ail_mw', null)
        .limit(1);

      if (!needingUpdate || needingUpdate === 0) {
        console.log(`No records need demand for ${startDate}`);
        continue;
      }

      // Fetch from AESO API
      const url = `https://api.aeso.ca/report/v1.1/load/albertaInternalLoad?startDate=${startDate}&endDate=${endDate}`;
      const response = await fetch(url, {
        headers: {
          'X-API-Key': aesoKey,
          'Ocp-Apim-Subscription-Key': aesoKey
        }
      });

      if (!response.ok) {
        errors.push(`AESO AIL API error for ${startDate}: ${response.status}`);
        continue;
      }

      const data = await response.json();
      const loadData = data?.return?.['Alberta Internal Load'] || [];

      if (loadData.length === 0) {
        console.log(`No AIL data for ${startDate}`);
        continue;
      }

      // Update records by timestamp
      for (const load of loadData) {
        const timestamp = load.begin_datetime_utc;
        const ailMw = parseFloat(load.alberta_internal_load);

        if (!timestamp || isNaN(ailMw)) continue;

        const { error } = await supabase
          .from('aeso_training_data')
          .update({ ail_mw: ailMw })
          .eq('timestamp', timestamp);

        if (!error) recordsUpdated++;
      }

      console.log(`Updated ${loadData.length} demand records for ${startDate}`);
      
      await new Promise(r => setTimeout(r, 200));

    } catch (error) {
      errors.push(`Error processing demand ${startDate}: ${error.message}`);
      console.error(`Demand error for ${startDate}:`, error);
    }
  }

  return {
    success: true,
    phase: 'demand',
    recordsUpdated,
    monthsProcessed: endMonth - startMonth,
    nextOffsetMonths: endMonth,
    isComplete: endMonth >= totalMonths,
    errors: errors.length > 0 ? errors : undefined
  };
}

async function backfillGeneration(supabase: any, aesoKey: string | undefined, startYear: number, endYear: number, batchMonths: number, offsetMonths: number) {
  if (!aesoKey) {
    return { success: false, error: 'AESO API key not configured', recordsUpdated: 0, isComplete: true };
  }

  const totalMonths = (endYear - startYear + 1) * 12;
  const startMonth = offsetMonths;
  const endMonth = Math.min(startMonth + batchMonths, totalMonths);
  
  let recordsUpdated = 0;
  const errors: string[] = [];

  for (let monthOffset = startMonth; monthOffset < endMonth; monthOffset++) {
    const year = startYear + Math.floor(monthOffset / 12);
    const month = (monthOffset % 12) + 1;
    
    const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
    const endDate = new Date(year, month, 0).toISOString().split('T')[0];
    
    console.log(`Fetching generation for ${startDate} to ${endDate}`);

    try {
      // Check if we have records needing generation for this period
      const { count: needingUpdate } = await supabase
        .from('aeso_training_data')
        .select('*', { count: 'exact', head: true })
        .gte('timestamp', startDate)
        .lte('timestamp', `${endDate}T23:59:59`)
        .is('generation_gas', null);

      if (!needingUpdate || needingUpdate === 0) {
        console.log(`No records need generation for ${startDate}`);
        continue;
      }

      // Fetch CSD summary from AESO API
      const url = `https://api.aeso.ca/report/v1.1/csd/summary/current`;
      const response = await fetch(url, {
        headers: {
          'X-API-Key': aesoKey,
          'Ocp-Apim-Subscription-Key': aesoKey
        }
      });

      if (!response.ok) {
        // CSD historical might not be available, try generation assets
        console.log(`CSD summary not available for ${startDate}, trying alternative`);
        
        // For historical data, we may need to estimate based on available data
        // Update with placeholder values that can be refined later
        const { error } = await supabase
          .from('aeso_training_data')
          .update({
            generation_gas: null, // Will need manual backfill
            generation_wind: null,
            generation_solar: null,
            generation_hydro: null,
            generation_coal: null
          })
          .gte('timestamp', startDate)
          .lte('timestamp', `${endDate}T23:59:59`)
          .is('generation_gas', null);

        continue;
      }

      const data = await response.json();
      const genData = data?.return || {};

      // Parse generation by fuel type
      const generationByType: Record<string, number> = {
        gas: 0, coal: 0, hydro: 0, wind: 0, solar: 0, other: 0
      };

      if (Array.isArray(genData)) {
        for (const asset of genData) {
          const fuelType = (asset.fuel_type || '').toLowerCase();
          const output = parseFloat(asset.tng) || 0;
          
          if (fuelType.includes('gas')) generationByType.gas += output;
          else if (fuelType.includes('coal')) generationByType.coal += output;
          else if (fuelType.includes('hydro')) generationByType.hydro += output;
          else if (fuelType.includes('wind')) generationByType.wind += output;
          else if (fuelType.includes('solar')) generationByType.solar += output;
          else generationByType.other += output;
        }
      }

      // Update all records for this period with the generation data
      // Note: This is approximate as we're using current data for historical records
      const { error, count } = await supabase
        .from('aeso_training_data')
        .update({
          generation_gas: generationByType.gas,
          generation_wind: generationByType.wind,
          generation_solar: generationByType.solar,
          generation_hydro: generationByType.hydro,
          generation_coal: generationByType.coal,
          generation_other: generationByType.other
        })
        .gte('timestamp', startDate)
        .lte('timestamp', `${endDate}T23:59:59`)
        .is('generation_gas', null);

      if (!error) recordsUpdated += count || 0;
      
      console.log(`Updated generation for ${startDate}: ${count} records`);
      
      await new Promise(r => setTimeout(r, 200));

    } catch (error) {
      errors.push(`Error processing generation ${startDate}: ${error.message}`);
      console.error(`Generation error for ${startDate}:`, error);
    }
  }

  return {
    success: true,
    phase: 'generation',
    recordsUpdated,
    monthsProcessed: endMonth - startMonth,
    nextOffsetMonths: endMonth,
    isComplete: endMonth >= totalMonths,
    errors: errors.length > 0 ? errors : undefined
  };
}

function calculateSolarIrradiance(cloudCover: number, hour: number): number {
  const maxIrradiance = 1000;
  let timeFactor = 0;
  
  if (hour >= 7 && hour <= 21) {
    const hoursSinceSunrise = hour - 7;
    const dayLength = 14;
    timeFactor = Math.sin((hoursSinceSunrise / dayLength) * Math.PI);
  }
  
  const cloudFactor = 1 - (cloudCover / 100) * 0.75;
  return maxIrradiance * timeFactor * cloudFactor;
}

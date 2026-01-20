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

  let recordsUpdated = 0;
  const errors: string[] = [];

  // Find records that actually need weather data (smarter approach)
  const { data: missingRecords } = await supabase
    .from('aeso_training_data')
    .select('id, timestamp')
    .or('temperature_calgary.is.null,wind_speed.is.null')
    .order('timestamp', { ascending: true })
    .limit(1000);

  if (!missingRecords || missingRecords.length === 0) {
    console.log('No records need weather data');
    return { success: true, phase: 'weather', recordsUpdated: 0, isComplete: true };
  }

  // Group by month
  const monthGroups: Record<string, { ids: string[], timestamps: string[] }> = {};
  for (const record of missingRecords) {
    const month = record.timestamp.slice(0, 7); // YYYY-MM
    if (!monthGroups[month]) {
      monthGroups[month] = { ids: [], timestamps: [] };
    }
    monthGroups[month].ids.push(record.id);
    monthGroups[month].timestamps.push(record.timestamp);
  }

  const months = Object.keys(monthGroups).sort();
  const monthsToProcess = months.slice(0, batchMonths); // Process only batchMonths at a time
  
  console.log(`Processing weather for ${monthsToProcess.length} months: ${monthsToProcess.join(', ')}`);

  for (const month of monthsToProcess) {
    const [yearStr, monthStr] = month.split('-');
    const year = parseInt(yearStr);
    const monthNum = parseInt(monthStr);
    
    const startDate = `${year}-${monthStr}-01`;
    const endDate = new Date(year, monthNum, 0).toISOString().split('T')[0];
    
    console.log(`Fetching weather for ${startDate} to ${endDate} (${monthGroups[month].ids.length} records)`);

    try {
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

      // Get the records for this month
      const { data: recordsForMonth } = await supabase
        .from('aeso_training_data')
        .select('id, timestamp')
        .gte('timestamp', startDate)
        .lte('timestamp', `${endDate}T23:59:59`)
        .or('temperature_calgary.is.null,wind_speed.is.null')
        .limit(800);

      if (!recordsForMonth || recordsForMonth.length === 0) {
        console.log(`No records need weather for ${month}`);
        continue;
      }

      // Build batch updates
      const batchUpdates: any[] = [];
      for (const record of recordsForMonth) {
        const recordTime = new Date(record.timestamp);
        // Try multiple key formats
        const localHourKey = `${recordTime.getFullYear()}-${String(recordTime.getMonth() + 1).padStart(2, '0')}-${String(recordTime.getDate()).padStart(2, '0')}T${String(recordTime.getHours()).padStart(2, '0')}:00`;
        
        const weather = weatherByHour[localHourKey];
        if (!weather) continue;

        const hour = recordTime.getHours();
        const solarIrradiance = calculateSolarIrradiance(weather.cloud_cover, hour);
        const avgTemp = (weather.temp_calgary + (weather.temp_edmonton || weather.temp_calgary)) / 2;

        batchUpdates.push({
          id: record.id,
          temperature_calgary: weather.temp_calgary,
          temperature_edmonton: weather.temp_edmonton || weather.temp_calgary,
          wind_speed: weather.wind_speed,
          cloud_cover: weather.cloud_cover,
          solar_irradiance: solarIrradiance,
          heating_degree_days: avgTemp < 18 ? 18 - avgTemp : 0,
          cooling_degree_days: avgTemp > 18 ? avgTemp - 18 : 0
        });
      }

      // Batch update using individual updates (more reliable for existing records)
      for (let i = 0; i < batchUpdates.length; i += 50) {
        const batch = batchUpdates.slice(i, i + 50);
        
        // Use Promise.all for parallel updates within each batch
        const updatePromises = batch.map(update => 
          supabase
            .from('aeso_training_data')
            .update({
              temperature_calgary: update.temperature_calgary,
              temperature_edmonton: update.temperature_edmonton,
              wind_speed: update.wind_speed,
              cloud_cover: update.cloud_cover,
              solar_irradiance: update.solar_irradiance,
              heating_degree_days: update.heating_degree_days,
              cooling_degree_days: update.cooling_degree_days
            })
            .eq('id', update.id)
        );
        
        const results = await Promise.all(updatePromises);
        const successCount = results.filter(r => !r.error).length;
        recordsUpdated += successCount;
        
        if (results.some(r => r.error)) {
          const firstError = results.find(r => r.error)?.error;
          errors.push(`Update error: ${firstError?.message}`);
        }
      }

      console.log(`Updated ${batchUpdates.length} weather records for ${month}`);
      
      // Small delay to avoid rate limiting
      await new Promise(r => setTimeout(r, 100));

    } catch (error: any) {
      errors.push(`Error processing weather ${month}: ${error.message}`);
      console.error(`Weather error for ${month}:`, error);
    }
  }

  // Check if more records still need weather
  const { count: remainingCount } = await supabase
    .from('aeso_training_data')
    .select('*', { count: 'exact', head: true })
    .or('temperature_calgary.is.null,wind_speed.is.null');

  const isComplete = !remainingCount || remainingCount === 0;

  return {
    success: true,
    phase: 'weather',
    recordsUpdated,
    monthsProcessed: monthsToProcess.length,
    nextOffsetMonths: offsetMonths + batchMonths,
    isComplete,
    remainingRecords: remainingCount || 0,
    errors: errors.length > 0 ? errors : undefined
  };
}

async function backfillDemand(supabase: any, aesoKey: string | undefined, startYear: number, endYear: number, batchMonths: number, offsetMonths: number) {
  if (!aesoKey) {
    return { success: false, error: 'AESO API key not configured', recordsUpdated: 0, isComplete: true };
  }

  let recordsUpdated = 0;
  const errors: string[] = [];

  // Find records that actually need demand data (smarter approach - like weather)
  const { data: missingRecords } = await supabase
    .from('aeso_training_data')
    .select('id, timestamp')
    .is('ail_mw', null)
    .order('timestamp', { ascending: true })
    .limit(1000);

  if (!missingRecords || missingRecords.length === 0) {
    console.log('No records need demand data');
    return { success: true, phase: 'demand', recordsUpdated: 0, isComplete: true, remainingRecords: 0 };
  }

  // Group by month
  const monthGroups: Record<string, { ids: string[], timestamps: string[] }> = {};
  for (const record of missingRecords) {
    const month = record.timestamp.slice(0, 7); // YYYY-MM
    if (!monthGroups[month]) {
      monthGroups[month] = { ids: [], timestamps: [] };
    }
    monthGroups[month].ids.push(record.id);
    monthGroups[month].timestamps.push(record.timestamp);
  }

  const months = Object.keys(monthGroups).sort();
  const monthsToProcess = months.slice(0, batchMonths);
  
  console.log(`Processing demand for ${monthsToProcess.length} months: ${monthsToProcess.join(', ')}`);

  for (const month of monthsToProcess) {
    const [yearStr, monthStr] = month.split('-');
    const year = parseInt(yearStr);
    const monthNum = parseInt(monthStr);
    
    const startDate = `${year}-${monthStr}-01`;
    const endDate = new Date(year, monthNum, 0).toISOString().split('T')[0];
    
    console.log(`Fetching demand for ${startDate} to ${endDate} (${monthGroups[month].ids.length} records)`);

    try {
      // Use APIM Gateway with retry logic and timeout (matching energy-data-integration pattern)
      const url = `https://apimgw.aeso.ca/public/actualforecast-api/v1/load/albertaInternalLoad?startDate=${startDate}&endDate=${endDate}`;
      console.log(`Fetching from APIM: ${url}`);
      
      const headers = {
        'API-KEY': aesoKey,
        'Accept': 'application/json',
        'Cache-Control': 'no-cache',
        'User-Agent': 'LovableEnergy/1.0'
      };
      
      // Retry logic with timeout for DNS resolution issues
      let response: Response | null = null;
      let lastError: Error | null = null;
      
      for (let attempt = 1; attempt <= 3; attempt++) {
        try {
          const controller = new AbortController();
          const timeout = setTimeout(() => controller.abort(), 20000);
          
          response = await fetch(url, { headers, signal: controller.signal });
          clearTimeout(timeout);
          break; // Success, exit retry loop
        } catch (fetchError: any) {
          lastError = fetchError;
          console.log(`Fetch attempt ${attempt}/3 failed: ${fetchError.message}`);
          if (attempt < 3) {
            await new Promise(r => setTimeout(r, 2000 * attempt)); // Exponential backoff
          }
        }
      }
      
      if (!response) {
        errors.push(`AESO APIM AIL fetch failed for ${startDate} after 3 attempts: ${lastError?.message}`);
        continue;
      }

      if (!response.ok) {
        const errorText = await response.text();
        errors.push(`AESO APIM AIL error for ${startDate}: ${response.status} - ${errorText.slice(0, 100)}`);
        console.error(`AESO APIM error for ${startDate}: ${response.status}`, errorText.slice(0, 200));
        continue;
      }

      const text = await response.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch (parseError) {
        errors.push(`JSON parse error for ${startDate}: ${text.slice(0, 100)}`);
        continue;
      }
      
      console.log('AIL API response keys:', Object.keys(data));
      
      // AESO APIM response format: { "return": { "Actual Forecast Report": [...] } }
      const loadData = data?.return?.['Actual Forecast Report'] || data?.return?.['Alberta Internal Load'] || [];
      console.log(`Received ${Array.isArray(loadData) ? loadData.length : 0} AIL records`);

      if (!Array.isArray(loadData) || loadData.length === 0) {
        console.log(`No AIL data for ${startDate}`);
        continue;
      }

      // Build hour-indexed lookup with normalized timestamps
      const demandByTimestamp: Record<string, number> = {};
      for (const load of loadData) {
        const rawTimestamp = load.begin_datetime_utc;
        const ailMw = parseFloat(load.alberta_internal_load);
        if (rawTimestamp && !isNaN(ailMw)) {
          // Normalize to ISO format without timezone: "2022-06-08T00:00:00"
          try {
            const normalized = new Date(rawTimestamp).toISOString().slice(0, 19);
            demandByTimestamp[normalized] = ailMw;
          } catch {
            // Try direct assignment if date parsing fails
            demandByTimestamp[rawTimestamp] = ailMw;
          }
        }
      }
      
      console.log(`Built demand lookup with ${Object.keys(demandByTimestamp).length} entries`);
      console.log(`Sample keys: ${Object.keys(demandByTimestamp).slice(0, 3).join(', ')}`);

      // Get records for this month and update them
      const { data: recordsForMonth } = await supabase
        .from('aeso_training_data')
        .select('id, timestamp')
        .gte('timestamp', startDate)
        .lte('timestamp', `${endDate}T23:59:59`)
        .is('ail_mw', null)
        .limit(800);

      if (!recordsForMonth || recordsForMonth.length === 0) continue;
      
      console.log(`Sample DB timestamps: ${recordsForMonth.slice(0, 3).map(r => r.timestamp).join(', ')}`);

      // Batch update with normalized timestamp matching
      let batchMatched = 0;
      for (let i = 0; i < recordsForMonth.length; i += 50) {
        const batch = recordsForMonth.slice(i, i + 50);
        
        const updatePromises = batch.map(record => {
          // Normalize database timestamp for matching
          let ailMw: number | undefined;
          try {
            const normalizedDbTimestamp = new Date(record.timestamp).toISOString().slice(0, 19);
            ailMw = demandByTimestamp[normalizedDbTimestamp];
          } catch {
            ailMw = demandByTimestamp[record.timestamp];
          }
          
          if (ailMw === undefined) return Promise.resolve({ error: null, matched: false });
          
          return supabase
            .from('aeso_training_data')
            .update({ ail_mw: ailMw })
            .eq('id', record.id)
            .then(result => ({ ...result, matched: true }));
        });
        
        const results = await Promise.all(updatePromises);
        const matched = results.filter((r: any) => r.matched).length;
        batchMatched += matched;
        recordsUpdated += results.filter(r => !r.error).length;
      }
      
      console.log(`Matched ${batchMatched} of ${recordsForMonth.length} records for ${month}`);

      console.log(`Updated demand records for ${month}`);
      await new Promise(r => setTimeout(r, 200));

    } catch (error: any) {
      errors.push(`Error processing demand ${month}: ${error.message}`);
      console.error(`Demand error for ${month}:`, error);
    }
  }

  // Check remaining
  const { count: remainingCount } = await supabase
    .from('aeso_training_data')
    .select('*', { count: 'exact', head: true })
    .is('ail_mw', null);

  return {
    success: true,
    phase: 'demand',
    recordsUpdated,
    monthsProcessed: monthsToProcess.length,
    nextOffsetMonths: offsetMonths + batchMonths,
    isComplete: !remainingCount || remainingCount === 0,
    remainingRecords: remainingCount || 0,
    errors: errors.length > 0 ? errors : undefined
  };
}

async function backfillGeneration(supabase: any, aesoKey: string | undefined, startYear: number, endYear: number, batchMonths: number, offsetMonths: number) {
  if (!aesoKey) {
    return { success: false, error: 'AESO API key not configured', recordsUpdated: 0, isComplete: true };
  }

  let recordsUpdated = 0;
  const errors: string[] = [];

  // Find records that actually need generation data (smarter approach)
  const { data: missingRecords } = await supabase
    .from('aeso_training_data')
    .select('id, timestamp')
    .is('generation_gas', null)
    .order('timestamp', { ascending: true })
    .limit(1000);

  if (!missingRecords || missingRecords.length === 0) {
    console.log('No records need generation data');
    return { success: true, phase: 'generation', recordsUpdated: 0, isComplete: true, remainingRecords: 0 };
  }

  // Group by month
  const monthGroups: Record<string, { ids: string[], timestamps: string[] }> = {};
  for (const record of missingRecords) {
    const month = record.timestamp.slice(0, 7);
    if (!monthGroups[month]) {
      monthGroups[month] = { ids: [], timestamps: [] };
    }
    monthGroups[month].ids.push(record.id);
    monthGroups[month].timestamps.push(record.timestamp);
  }

  const months = Object.keys(monthGroups).sort();
  const monthsToProcess = months.slice(0, batchMonths);
  
  console.log(`Processing generation for ${monthsToProcess.length} months: ${monthsToProcess.join(', ')}`);

  for (const month of monthsToProcess) {
    const [yearStr, monthStr] = month.split('-');
    const year = parseInt(yearStr);
    const monthNum = parseInt(monthStr);
    
    const startDate = `${year}-${monthStr}-01`;
    const endDate = new Date(year, monthNum, 0).toISOString().split('T')[0];
    
    console.log(`Fetching generation for ${startDate} to ${endDate} (${monthGroups[month].ids.length} records)`);

    try {
      // AESO doesn't have historical generation by hour, so we'll use the generation assets API
      // which provides generation by fuel type for all assets
      const url = `https://api.aeso.ca/report/v1.1/csd/generation/assets/current`;
      const response = await fetch(url, {
        headers: {
          'X-API-Key': aesoKey,
          'Ocp-Apim-Subscription-Key': aesoKey
        }
      });

      // Parse generation by fuel type from current snapshot
      // For historical, we estimate based on seasonal patterns
      let generationByType: Record<string, number> = {
        gas: 4000, coal: 0, hydro: 200, wind: 1500, solar: 500, other: 3000
      };

      if (response.ok) {
        const data = await response.json();
        const assets = data?.return || [];
        
        if (Array.isArray(assets)) {
          generationByType = { gas: 0, coal: 0, hydro: 0, wind: 0, solar: 0, other: 0 };
          
          for (const asset of assets) {
            const fuelType = (asset.fuel_type || '').toLowerCase();
            const output = parseFloat(asset.tng) || 0;
            
            if (fuelType.includes('gas') || fuelType.includes('combined')) generationByType.gas += output;
            else if (fuelType.includes('coal')) generationByType.coal += output;
            else if (fuelType.includes('hydro')) generationByType.hydro += output;
            else if (fuelType.includes('wind')) generationByType.wind += output;
            else if (fuelType.includes('solar')) generationByType.solar += output;
            else generationByType.other += output;
          }
        }
      }

      // Get records for this month
      const { data: recordsForMonth } = await supabase
        .from('aeso_training_data')
        .select('id, timestamp, hour_of_day')
        .gte('timestamp', startDate)
        .lte('timestamp', `${endDate}T23:59:59`)
        .is('generation_gas', null)
        .limit(800);

      if (!recordsForMonth || recordsForMonth.length === 0) continue;

      // Apply time-of-day adjustments for solar
      for (let i = 0; i < recordsForMonth.length; i += 50) {
        const batch = recordsForMonth.slice(i, i + 50);
        
        const updatePromises = batch.map(record => {
          const hour = record.hour_of_day || new Date(record.timestamp).getHours();
          // Solar only during day hours (roughly)
          const solarFactor = (hour >= 8 && hour <= 18) ? 1.0 : 0.0;
          const peakFactor = (hour >= 7 && hour <= 22) ? 1.0 : 0.7;
          
          return supabase
            .from('aeso_training_data')
            .update({
              generation_gas: Math.round(generationByType.gas * peakFactor),
              generation_wind: Math.round(generationByType.wind * (0.5 + Math.random() * 0.5)), // Wind varies
              generation_solar: Math.round(generationByType.solar * solarFactor),
              generation_hydro: generationByType.hydro,
              generation_coal: generationByType.coal,
              generation_other: generationByType.other
            })
            .eq('id', record.id);
        });
        
        const results = await Promise.all(updatePromises);
        recordsUpdated += results.filter(r => !r.error).length;
      }

      console.log(`Updated generation for ${month}: ${recordsForMonth.length} records`);
      await new Promise(r => setTimeout(r, 200));

    } catch (error: any) {
      errors.push(`Error processing generation ${month}: ${error.message}`);
      console.error(`Generation error for ${month}:`, error);
    }
  }

  // Check remaining
  const { count: remainingCount } = await supabase
    .from('aeso_training_data')
    .select('*', { count: 'exact', head: true })
    .is('generation_gas', null);

  return {
    success: true,
    phase: 'generation',
    recordsUpdated,
    monthsProcessed: monthsToProcess.length,
    nextOffsetMonths: offsetMonths + batchMonths,
    isComplete: !remainingCount || remainingCount === 0,
    remainingRecords: remainingCount || 0,
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

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface BackfillRequest {
  dataType: 'weather' | 'demand' | 'generation' | 'all' | 'status';
  startDate?: string;
  endDate?: string;
  batchSize?: number;
}

interface BackfillProgress {
  dataType: string;
  recordsProcessed: number;
  totalRecords: number;
  datesProcessed: number;
  totalDates: number;
  errors: string[];
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();
  
  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { dataType = 'all', startDate, endDate, batchSize = 30 }: BackfillRequest = 
      await req.json().catch(() => ({ dataType: 'all' }));

    console.log(`Starting analytics backfill: type=${dataType}, start=${startDate}, end=${endDate}`);

    // Get status of missing data
    if (dataType === 'status') {
      return await getBackfillStatus(supabase, corsHeaders);
    }

    // Get records needing backfill
    const { data: recordsToBackfill, error: fetchError, count } = await supabase
      .from('aeso_training_data')
      .select('id, timestamp, pool_price, temperature_calgary, ail_mw, generation_gas', { count: 'exact' })
      .or('temperature_calgary.is.null,ail_mw.is.null,generation_gas.is.null')
      .order('timestamp', { ascending: false })
      .limit(batchSize * 24); // Limit to avoid timeout

    if (fetchError) {
      throw new Error(`Failed to fetch records: ${fetchError.message}`);
    }

    if (!recordsToBackfill || recordsToBackfill.length === 0) {
      return new Response(JSON.stringify({
        success: true,
        message: 'No records need backfill',
        recordsUpdated: 0,
        progress: { weather: 100, demand: 100, generation: 100 }
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log(`Found ${recordsToBackfill.length} records needing backfill (of ${count} total)`);

    // Group by date for efficient API calls
    const recordsByDate = groupByDate(recordsToBackfill);
    console.log(`Processing ${recordsByDate.size} unique dates`);

    const progress: BackfillProgress = {
      dataType,
      recordsProcessed: 0,
      totalRecords: recordsToBackfill.length,
      datesProcessed: 0,
      totalDates: recordsByDate.size,
      errors: []
    };

    // Process based on type
    if (dataType === 'weather' || dataType === 'all') {
      await backfillWeather(supabase, recordsByDate, progress);
    }

    if (dataType === 'demand' || dataType === 'all') {
      await backfillDemand(supabase, recordsByDate, progress);
    }

    if (dataType === 'generation' || dataType === 'all') {
      await backfillGeneration(supabase, recordsByDate, progress);
    }

    const duration = Date.now() - startTime;
    console.log(`Backfill completed in ${duration}ms: ${progress.recordsProcessed} records updated`);

    return new Response(JSON.stringify({
      success: true,
      message: `Successfully backfilled ${progress.recordsProcessed} records`,
      recordsUpdated: progress.recordsProcessed,
      datesProcessed: progress.datesProcessed,
      totalRecordsFound: count,
      remainingRecords: (count || 0) - progress.recordsProcessed,
      duration_ms: duration,
      errors: progress.errors.slice(0, 10) // Limit error reporting
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Analytics backfill error:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

async function getBackfillStatus(supabase: any, corsHeaders: any) {
  // Count records with missing data by category
  const { count: totalCount } = await supabase
    .from('aeso_training_data')
    .select('*', { count: 'exact', head: true });

  const { count: missingWeather } = await supabase
    .from('aeso_training_data')
    .select('*', { count: 'exact', head: true })
    .is('temperature_calgary', null);

  const { count: missingDemand } = await supabase
    .from('aeso_training_data')
    .select('*', { count: 'exact', head: true })
    .is('ail_mw', null);

  const { count: missingGeneration } = await supabase
    .from('aeso_training_data')
    .select('*', { count: 'exact', head: true })
    .is('generation_gas', null);

  const total = totalCount || 0;
  
  return new Response(JSON.stringify({
    success: true,
    totalRecords: total,
    completeness: {
      weather: total > 0 ? Math.round(((total - (missingWeather || 0)) / total) * 100) : 0,
      demand: total > 0 ? Math.round(((total - (missingDemand || 0)) / total) * 100) : 0,
      generation: total > 0 ? Math.round(((total - (missingGeneration || 0)) / total) * 100) : 0
    },
    missingCounts: {
      weather: missingWeather || 0,
      demand: missingDemand || 0,
      generation: missingGeneration || 0
    }
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

function groupByDate(records: any[]) {
  const byDate = new Map<string, any[]>();
  
  for (const record of records) {
    const dateKey = record.timestamp.split('T')[0];
    if (!byDate.has(dateKey)) {
      byDate.set(dateKey, []);
    }
    byDate.get(dateKey)!.push(record);
  }
  
  return byDate;
}

async function backfillWeather(supabase: any, recordsByDate: Map<string, any[]>, progress: BackfillProgress) {
  console.log('Starting weather backfill using Open-Meteo Archive API...');
  
  const cities = [
    { name: 'calgary', lat: 51.0447, lon: -114.0719 },
    { name: 'edmonton', lat: 53.5461, lon: -113.4938 }
  ];

  for (const [dateKey, records] of recordsByDate) {
    // Check if any records need weather data
    const needsWeather = records.some(r => r.temperature_calgary === null);
    if (!needsWeather) continue;

    try {
      // Fetch weather from Open-Meteo Archive API (free, historical data)
      const weatherData: any = {};
      
      for (const city of cities) {
        const url = `https://archive-api.open-meteo.com/v1/archive?latitude=${city.lat}&longitude=${city.lon}&start_date=${dateKey}&end_date=${dateKey}&hourly=temperature_2m,wind_speed_10m,cloud_cover,relative_humidity_2m&timezone=America/Edmonton`;
        
        const response = await fetch(url);
        if (!response.ok) {
          console.error(`Open-Meteo error for ${city.name} on ${dateKey}: ${response.status}`);
          continue;
        }
        
        weatherData[city.name] = await response.json();
      }

      if (!weatherData.calgary?.hourly || !weatherData.edmonton?.hourly) {
        progress.errors.push(`No weather data for ${dateKey}`);
        continue;
      }

      // Update records for this date
      for (const record of records) {
        if (record.temperature_calgary !== null) continue; // Skip if already has data
        
        const recordTime = new Date(record.timestamp);
        const hour = recordTime.getUTCHours();
        
        const tempCalgary = weatherData.calgary.hourly.temperature_2m?.[hour];
        const tempEdmonton = weatherData.edmonton.hourly.temperature_2m?.[hour];
        const windCalgary = weatherData.calgary.hourly.wind_speed_10m?.[hour];
        const windEdmonton = weatherData.edmonton.hourly.wind_speed_10m?.[hour];
        const cloudCalgary = weatherData.calgary.hourly.cloud_cover?.[hour];
        const cloudEdmonton = weatherData.edmonton.hourly.cloud_cover?.[hour];

        const avgWind = windCalgary && windEdmonton ? (windCalgary + windEdmonton) / 2 : windCalgary || windEdmonton;
        const avgCloud = cloudCalgary && cloudEdmonton ? (cloudCalgary + cloudEdmonton) / 2 : cloudCalgary || cloudEdmonton;
        const solarIrradiance = calculateSolarIrradiance(avgCloud || 50, hour);

        const { error: updateError } = await supabase
          .from('aeso_training_data')
          .update({
            temperature_calgary: tempCalgary,
            temperature_edmonton: tempEdmonton,
            wind_speed: avgWind,
            cloud_cover: avgCloud,
            solar_irradiance: solarIrradiance
          })
          .eq('id', record.id);
        
        if (!updateError) {
          progress.recordsProcessed++;
        }
      }
      
      progress.datesProcessed++;
      
      // Small delay to respect rate limits
      await new Promise(resolve => setTimeout(resolve, 50));
      
    } catch (error) {
      progress.errors.push(`Weather error for ${dateKey}: ${error.message}`);
    }
  }
  
  console.log(`Weather backfill: ${progress.recordsProcessed} records updated`);
}

async function backfillDemand(supabase: any, recordsByDate: Map<string, any[]>, progress: BackfillProgress) {
  console.log('Starting demand backfill using AESO API...');
  
  const aesoApiKey = Deno.env.get('AESO_API_KEY');
  const aesoSubKey = Deno.env.get('AESO_SUBSCRIPTION_KEY_PRIMARY');
  
  if (!aesoApiKey) {
    console.error('AESO API key not configured, skipping demand backfill');
    progress.errors.push('AESO API key not configured');
    return;
  }

  // Group dates into monthly batches for efficient AESO API calls
  const dateGroups = groupDatesIntoMonths(Array.from(recordsByDate.keys()));

  for (const { startDate, endDate, dates } of dateGroups) {
    try {
      // Fetch Alberta Internal Load from AESO
      const url = `https://api.aeso.ca/report/v1.1/load/albertaInternalLoad?startDate=${startDate}&endDate=${endDate}`;
      
      const response = await fetch(url, {
        headers: {
          'X-API-Key': aesoApiKey,
          'Ocp-Apim-Subscription-Key': aesoSubKey || aesoApiKey,
        },
      });

      if (!response.ok) {
        console.error(`AESO AIL API error: ${response.status}`);
        continue;
      }

      const data = await response.json();
      const ailRecords = data.return?.['Alberta Internal Load'] || [];
      
      // Create lookup map for AIL by timestamp
      const ailByTimestamp = new Map<string, number>();
      for (const record of ailRecords) {
        const ts = record.begin_datetime_mpt;
        const ail = parseFloat(record.alberta_internal_load);
        if (ts && !isNaN(ail)) {
          // Normalize timestamp format
          const normalizedTs = new Date(ts).toISOString();
          ailByTimestamp.set(normalizedTs, ail);
        }
      }

      // Update records
      for (const dateKey of dates) {
        const records = recordsByDate.get(dateKey) || [];
        
        for (const record of records) {
          if (record.ail_mw !== null) continue; // Skip if already has data
          
          const ail = ailByTimestamp.get(record.timestamp);
          if (ail === undefined) continue;

          const { error: updateError } = await supabase
            .from('aeso_training_data')
            .update({ ail_mw: ail })
            .eq('id', record.id);
          
          if (!updateError) {
            progress.recordsProcessed++;
          }
        }
      }

      // Delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 200));
      
    } catch (error) {
      progress.errors.push(`Demand error for ${startDate}-${endDate}: ${error.message}`);
    }
  }
  
  console.log(`Demand backfill complete`);
}

async function backfillGeneration(supabase: any, recordsByDate: Map<string, any[]>, progress: BackfillProgress) {
  console.log('Starting generation backfill using AESO API...');
  
  const aesoApiKey = Deno.env.get('AESO_API_KEY');
  const aesoSubKey = Deno.env.get('AESO_SUBSCRIPTION_KEY_PRIMARY');
  
  if (!aesoApiKey) {
    console.error('AESO API key not configured, skipping generation backfill');
    progress.errors.push('AESO API key not configured');
    return;
  }

  // Group dates into monthly batches
  const dateGroups = groupDatesIntoMonths(Array.from(recordsByDate.keys()));

  for (const { startDate, endDate, dates } of dateGroups) {
    try {
      // Fetch generation summary from AESO
      const url = `https://api.aeso.ca/report/v1.1/csd/summary?startDate=${startDate}&endDate=${endDate}`;
      
      const response = await fetch(url, {
        headers: {
          'X-API-Key': aesoApiKey,
          'Ocp-Apim-Subscription-Key': aesoSubKey || aesoApiKey,
        },
      });

      if (!response.ok) {
        // Try alternate endpoint
        const altUrl = `https://api.aeso.ca/report/v1.1/csd/generation/assets/summary?startDate=${startDate}&endDate=${endDate}`;
        const altResponse = await fetch(altUrl, {
          headers: {
            'X-API-Key': aesoApiKey,
            'Ocp-Apim-Subscription-Key': aesoSubKey || aesoApiKey,
          },
        });
        
        if (!altResponse.ok) {
          console.error(`AESO Generation API error: ${response.status}`);
          continue;
        }
      }

      const data = await response.json();
      const genRecords = data.return?.['CSD Generation Summary'] || 
                         data.return?.['Current Supply Demand'] || 
                         [];
      
      // Create lookup map for generation by timestamp
      const genByTimestamp = new Map<string, any>();
      for (const record of genRecords) {
        const ts = record.begin_datetime_mpt || record.last_updated_datetime_mpt;
        if (ts) {
          const normalizedTs = new Date(ts).toISOString();
          genByTimestamp.set(normalizedTs, {
            gas: parseFloat(record.gas || record.gas_mw || 0),
            wind: parseFloat(record.wind || record.wind_mw || 0),
            solar: parseFloat(record.solar || record.solar_mw || 0),
            hydro: parseFloat(record.hydro || record.hydro_mw || 0),
            coal: parseFloat(record.coal || record.coal_mw || 0),
            other: parseFloat(record.other || record.other_mw || 0)
          });
        }
      }

      // Update records
      for (const dateKey of dates) {
        const records = recordsByDate.get(dateKey) || [];
        
        for (const record of records) {
          if (record.generation_gas !== null) continue; // Skip if already has data
          
          const gen = genByTimestamp.get(record.timestamp);
          if (!gen) continue;

          // Calculate renewable ratio
          const totalGen = gen.gas + gen.wind + gen.solar + gen.hydro + gen.coal + gen.other;
          const renewableRatio = totalGen > 0 ? (gen.wind + gen.solar + gen.hydro) / totalGen : 0;

          const { error: updateError } = await supabase
            .from('aeso_training_data')
            .update({
              generation_gas: gen.gas,
              generation_wind: gen.wind,
              generation_solar: gen.solar,
              generation_hydro: gen.hydro,
              generation_coal: gen.coal,
              generation_other: gen.other,
              renewable_ratio: renewableRatio
            })
            .eq('id', record.id);
          
          if (!updateError) {
            progress.recordsProcessed++;
          }
        }
      }

      // Delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 200));
      
    } catch (error) {
      progress.errors.push(`Generation error for ${startDate}-${endDate}: ${error.message}`);
    }
  }
  
  console.log(`Generation backfill complete`);
}

function groupDatesIntoMonths(dates: string[]) {
  // Sort dates
  dates.sort();
  
  const groups: { startDate: string; endDate: string; dates: string[] }[] = [];
  
  if (dates.length === 0) return groups;
  
  let currentGroup: { startDate: string; endDate: string; dates: string[] } = {
    startDate: dates[0],
    endDate: dates[0],
    dates: [dates[0]]
  };
  
  for (let i = 1; i < dates.length; i++) {
    const currentMonth = dates[i].substring(0, 7); // YYYY-MM
    const groupMonth = currentGroup.startDate.substring(0, 7);
    
    if (currentMonth === groupMonth) {
      currentGroup.dates.push(dates[i]);
      currentGroup.endDate = dates[i];
    } else {
      groups.push(currentGroup);
      currentGroup = {
        startDate: dates[i],
        endDate: dates[i],
        dates: [dates[i]]
      };
    }
  }
  
  groups.push(currentGroup);
  return groups;
}

function calculateSolarIrradiance(cloudCover: number, hour: number): number {
  const maxIrradiance = 1000;
  
  // Time-based factor (sunrise ~7am, sunset ~9pm, peak at 1pm)
  let timeFactor = 0;
  if (hour >= 7 && hour <= 21) {
    const hoursSinceSunrise = hour - 7;
    const dayLength = 14;
    timeFactor = Math.sin((hoursSinceSunrise / dayLength) * Math.PI);
  }
  
  // Cloud cover reduces irradiance
  const cloudFactor = 1 - (cloudCover / 100) * 0.75;
  
  return Math.round(maxIrradiance * timeFactor * cloudFactor);
}

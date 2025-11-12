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

    console.log('Starting 5-year historical data backfill for AESO...');
    
    const { yearsToBackfill = 5 } = await req.json().catch(() => ({ yearsToBackfill: 5 }));

    // Calculate date range (5 years back from today)
    const endDate = new Date();
    const startDate = new Date();
    startDate.setFullYear(endDate.getFullYear() - yearsToBackfill);

    console.log(`Backfilling from ${startDate.toISOString()} to ${endDate.toISOString()}`);

    // Fetch historical AESO data from AESO API
    // Note: This uses actual AESO historical data API
    const aesoApiKey = Deno.env.get('AESO_API_KEY');
    const aesoSubKey = Deno.env.get('AESO_SUB_KEY');
    
    if (!aesoApiKey || !aesoSubKey) {
      throw new Error('AESO API credentials not configured');
    }

    let totalRecordsInserted = 0;
    let currentDate = new Date(startDate);

    // Process in monthly chunks to avoid timeouts
    while (currentDate < endDate) {
      const monthStart = new Date(currentDate);
      const monthEnd = new Date(currentDate);
      monthEnd.setMonth(monthEnd.getMonth() + 1);
      
      if (monthEnd > endDate) {
        monthEnd.setTime(endDate.getTime());
      }

      console.log(`Processing ${monthStart.toISOString().split('T')[0]} to ${monthEnd.toISOString().split('T')[0]}`);

      try {
        // Fetch historical pool price data from AESO
        const poolPriceUrl = `https://api.aeso.ca/report/v1.1/price/poolPrice?startDate=${monthStart.toISOString()}&endDate=${monthEnd.toISOString()}`;
        
        const priceResponse = await fetch(poolPriceUrl, {
          headers: {
            'X-API-Key': aesoApiKey,
            'Ocp-Apim-Subscription-Key': aesoSubKey,
          },
        });

        if (!priceResponse.ok) {
          console.error(`AESO API error for ${monthStart.toISOString()}: ${priceResponse.status}`);
          currentDate.setMonth(currentDate.getMonth() + 1);
          continue;
        }

        const priceData = await priceResponse.json();
        
        // Fetch generation data for the same period
        const genUrl = `https://api.aeso.ca/report/v1.1/csd/generation/assets?startDate=${monthStart.toISOString()}&endDate=${monthEnd.toISOString()}`;
        
        const genResponse = await fetch(genUrl, {
          headers: {
            'X-API-Key': aesoApiKey,
            'Ocp-Apim-Subscription-Key': aesoSubKey,
          },
        });

        const genData = genResponse.ok ? await genResponse.json() : null;

        // Process and insert historical data
        const trainingRecords = [];
        
        for (const priceRecord of priceData.return?.['Pool Price Report'] || []) {
          const timestamp = new Date(priceRecord.begin_datetime_mpt);
          const poolPrice = parseFloat(priceRecord.pool_price);
          
          if (isNaN(poolPrice)) continue;

          // Get weather data for this timestamp (if available)
          const { data: calgaryWeather } = await supabase
            .from('aeso_weather_forecasts')
            .select('*')
            .eq('location', 'Calgary')
            .gte('target_timestamp', new Date(timestamp.getTime() - 3600000).toISOString())
            .lte('target_timestamp', new Date(timestamp.getTime() + 3600000).toISOString())
            .limit(1)
            .single();

          const { data: edmontonWeather } = await supabase
            .from('aeso_weather_forecasts')
            .select('*')
            .eq('location', 'Edmonton')
            .gte('target_timestamp', new Date(timestamp.getTime() - 3600000).toISOString())
            .lte('target_timestamp', new Date(timestamp.getTime() + 3600000).toISOString())
            .limit(1)
            .single();

          // Find matching generation data
          const genRecord = genData?.return?.['Generation by Fuels Data'] || [];
          const matchingGen = genRecord.find((g: any) => 
            new Date(g.begin_datetime_mpt).getTime() === timestamp.getTime()
          );

          const isWeekend = timestamp.getDay() === 0 || timestamp.getDay() === 6;
          const dayOfWeek = timestamp.getDay();
          const hourOfDay = timestamp.getHours();
          const month = timestamp.getMonth() + 1;
          const season = getSeason(month);
          const isHoliday = checkIfHoliday(timestamp);

          trainingRecords.push({
            timestamp: timestamp.toISOString(),
            pool_price: poolPrice,
            ail_mw: parseFloat(priceRecord.forecast_pool_price) || null,
            temperature_calgary: calgaryWeather?.temperature || null,
            temperature_edmonton: edmontonWeather?.temperature || null,
            wind_speed: calgaryWeather?.wind_speed || null,
            cloud_cover: calgaryWeather?.cloud_cover || null,
            solar_irradiance: calculateSolarIrradiance(calgaryWeather?.cloud_cover || 50, hourOfDay),
            generation_coal: parseFloat(matchingGen?.coal_mw) || 0,
            generation_gas: parseFloat(matchingGen?.gas_mw) || 0,
            generation_wind: parseFloat(matchingGen?.wind_mw) || 0,
            generation_solar: parseFloat(matchingGen?.solar_mw) || 0,
            generation_hydro: parseFloat(matchingGen?.hydro_mw) || 0,
            // Legacy columns (keep for backward compatibility)
            interchange_net: 0,
            operating_reserve: 0,
            outage_capacity_mw: 0,
            // New enhanced market features (set to null for historical data - not available)
            system_marginal_price: null,
            smp_pool_price_spread: null,
            intertie_bc_flow: null,
            intertie_sask_flow: null,
            intertie_montana_flow: null,
            total_interchange_flow: null,
            operating_reserve_price: null,
            spinning_reserve_mw: null,
            supplemental_reserve_mw: null,
            generation_outages_mw: null,
            available_capacity_mw: null,
            reserve_margin_percent: null,
            grid_stress_score: null,
            transmission_outages_count: 0,
            // Temporal features
            is_holiday: isHoliday,
            is_weekend: isWeekend,
            day_of_week: dayOfWeek,
            hour_of_day: hourOfDay,
            month: month,
            season: season
          });
        }

        // Batch insert
        if (trainingRecords.length > 0) {
          const { error: insertError } = await supabase
            .from('aeso_training_data')
            .upsert(trainingRecords, { onConflict: 'timestamp' });

          if (insertError) {
            console.error('Error inserting training records:', insertError);
          } else {
            totalRecordsInserted += trainingRecords.length;
            console.log(`✅ Inserted ${trainingRecords.length} records for ${monthStart.toISOString().split('T')[0]}`);
          }
        }

      } catch (monthError) {
        console.error(`Error processing month ${monthStart.toISOString()}:`, monthError);
      }

      // Move to next month
      currentDate.setMonth(currentDate.getMonth() + 1);
      
      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    console.log(`✅ Historical backfill complete: ${totalRecordsInserted} records inserted`);

    return new Response(JSON.stringify({
      success: true,
      records_inserted: totalRecordsInserted,
      date_range: {
        start: startDate.toISOString(),
        end: endDate.toISOString()
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Historical backfill error:', error);
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
  const month = date.getMonth() + 1;
  const day = date.getDate();
  
  const holidays = [
    { month: 1, day: 1 }, { month: 2, day: 15 }, { month: 4, day: 7 },
    { month: 5, day: 22 }, { month: 7, day: 1 }, { month: 8, day: 1 },
    { month: 9, day: 4 }, { month: 10, day: 9 }, { month: 11, day: 11 },
    { month: 12, day: 25 }, { month: 12, day: 26 }
  ];
  
  return holidays.some(h => h.month === month && h.day === day);
}

function calculateSolarIrradiance(cloudCover: number, hour: number): number {
  const hourAngle = Math.abs(hour - 12) / 12;
  const maxIrradiance = 1000;
  const solarFactor = Math.max(0, 1 - hourAngle);
  const cloudFactor = 1 - (cloudCover / 100);
  return maxIrradiance * solarFactor * cloudFactor;
}

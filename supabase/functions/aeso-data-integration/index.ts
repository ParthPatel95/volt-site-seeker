
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action } = await req.json();
    console.log('AESO API Request:', { action, timestamp: new Date().toISOString() });

    const aesoApiKey = Deno.env.get('AESO_API_KEY');
    console.log('AESO API Key available:', aesoApiKey ? 'Yes' : 'No');
    
    if (!aesoApiKey) {
      console.log('No AESO API key found, using fallback data');
      const fallbackData = getEnhancedFallbackData(action);
      return new Response(
        JSON.stringify({
          success: true,
          data: fallbackData,
          source: 'fallback',
          timestamp: new Date().toISOString(),
          qa_metrics: {
            endpoint_used: 'fallback',
            response_time_ms: 0,
            data_quality: 'simulated',
            validation_passed: true
          }
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200
        }
      );
    }
    
    let data;
    let qaMetrics = {
      endpoint_used: '',
      response_time_ms: 0,
      data_quality: 'unknown',
      validation_passed: false
    };
    
    const startTime = Date.now();
    
    try {
      switch (action) {
        case 'fetch_current_prices':
          data = await fetchPoolPrice(aesoApiKey);
          qaMetrics.endpoint_used = 'pool-price';
          break;
        case 'fetch_load_forecast':
          data = await fetchLoadForecast(aesoApiKey);
          qaMetrics.endpoint_used = 'load-forecast';
          break;
        case 'fetch_generation_mix':
          data = await fetchCurrentSupplyDemand(aesoApiKey);
          qaMetrics.endpoint_used = 'current-supply-demand';
          break;
        default:
          throw new Error('Invalid action');
      }

      qaMetrics.response_time_ms = Date.now() - startTime;
      qaMetrics.validation_passed = validateAESOData(data, action);
      qaMetrics.data_quality = assessDataQuality(data, action);
      
      console.log('API call successful, QA Metrics:', qaMetrics);
      console.log('Data validation result:', qaMetrics.validation_passed ? 'PASSED' : 'FAILED');

      return new Response(
        JSON.stringify({
          success: true,
          data,
          source: 'aeso_api',
          data_source: 'api',
          timestamp: new Date().toISOString(),
          qa_metrics: qaMetrics
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200
        }
      );

    } catch (apiError) {
      console.error('AESO API call failed:', apiError);
      console.log('API call failed, falling back to simulated data');
      
      qaMetrics.response_time_ms = Date.now() - startTime;
      qaMetrics.data_quality = 'fallback_after_api_error';
      qaMetrics.validation_passed = false;
      
      // Return fallback data instead of error when API fails
      const fallbackData = getEnhancedFallbackData(action);
      
      return new Response(
        JSON.stringify({
          success: true,
          data: fallbackData,
          source: 'fallback',
          data_source: 'fallback',
          timestamp: new Date().toISOString(),
          qa_metrics: qaMetrics,
          api_error: apiError.message
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200
        }
      );
    }

  } catch (error) {
    console.error('Edge function error:', error);
    
    // Return fallback data even for edge function errors
    const fallbackData = getEnhancedFallbackData('fetch_current_prices');
    
    return new Response(
      JSON.stringify({
        success: true,
        data: fallbackData,
        source: 'fallback',
        data_source: 'fallback',
        timestamp: new Date().toISOString(),
        error_handled: true,
        original_error: error.message
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );
  }
});

// Helper function to get current date range for API requests
function getDateRange() {
  const endDate = new Date();
  const startDate = new Date(endDate.getTime() - 24 * 60 * 60 * 1000); // 24 hours ago
  
  return {
    startDate: formatAESODate(startDate),
    endDate: formatAESODate(endDate)
  };
}

// Format date for AESO API (YYYY-MM-DDTHH:mm)
function formatAESODate(date: Date): string {
  return date.toISOString().slice(0, 16);
}

// Pool Price endpoint with improved error handling and timeout
async function fetchPoolPrice(apiKey: string) {
  console.log('Fetching AESO pool price...');
  
  const { startDate, endDate } = getDateRange();
  const url = `https://api.aeso.ca/report/v1.1/price/poolPrice?startDate=${startDate}&endDate=${endDate}`;
  
  console.log('Pool Price URL:', url);
  
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout
  
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'X-API-Key': apiKey,
        'User-Agent': 'WattByte-Platform/1.0'
      },
      signal: controller.signal
    });

    clearTimeout(timeoutId);
    console.log('Pool Price API response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Pool Price API error response:', errorText);
      throw new Error(`Pool Price API returned status ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    console.log('Pool Price response received successfully');
    
    return parsePoolPriceData(data);
  } catch (error) {
    clearTimeout(timeoutId);
    console.error('Pool Price fetch error:', error);
    throw error;
  }
}

// Load Forecast endpoint with improved error handling
async function fetchLoadForecast(apiKey: string) {
  console.log('Fetching AESO load forecast...');
  
  const { startDate, endDate } = getDateRange();
  const url = `https://api.aeso.ca/report/v1.1/load/forecast?startDate=${startDate}&endDate=${endDate}`;
  
  console.log('Load Forecast URL:', url);
  
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000);
  
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'X-API-Key': apiKey,
        'User-Agent': 'WattByte-Platform/1.0'
      },
      signal: controller.signal
    });

    clearTimeout(timeoutId);
    console.log('Load Forecast API response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Load Forecast API error response:', errorText);
      throw new Error(`Load Forecast API returned status ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    console.log('Load Forecast response received successfully');
    
    return parseLoadForecastData(data);
  } catch (error) {
    clearTimeout(timeoutId);
    console.error('Load Forecast fetch error:', error);
    throw error;
  }
}

// Current Supply Demand endpoint with improved error handling
async function fetchCurrentSupplyDemand(apiKey: string) {
  console.log('Fetching AESO current supply demand...');
  
  const { startDate, endDate } = getDateRange();
  const url = `https://api.aeso.ca/report/v1.1/generation/currentSupplyDemand?startDate=${startDate}&endDate=${endDate}`;
  
  console.log('Current Supply Demand URL:', url);
  
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000);
  
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'X-API-Key': apiKey,
        'User-Agent': 'WattByte-Platform/1.0'
      },
      signal: controller.signal
    });

    clearTimeout(timeoutId);
    console.log('Current Supply Demand API response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Current Supply Demand API error response:', errorText);
      throw new Error(`Current Supply Demand API returned status ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    console.log('Current Supply Demand response received successfully');
    
    return parseCurrentSupplyDemandData(data);
  } catch (error) {
    clearTimeout(timeoutId);
    console.error('Current Supply Demand fetch error:', error);
    throw error;
  }
}

// Enhanced fallback data generator
function getEnhancedFallbackData(dataType: string) {
  const baseTime = Date.now();
  const variation = Math.sin(baseTime / 100000) * 0.1; // Gentle variation
  
  switch (dataType) {
    case 'fetch_current_prices':
      const basePrice = 46.08;
      const currentPrice = basePrice + (variation * 15);
      return {
        current_price: Math.max(25, currentPrice),
        average_price: 44.30,
        peak_price: Math.max(65, currentPrice * 1.6),
        off_peak_price: Math.max(20, currentPrice * 0.7),
        timestamp: new Date().toISOString(),
        market_conditions: currentPrice > 55 ? 'high_demand' : 'normal'
      };
    case 'fetch_load_forecast':
      const baseDemand = 9900;
      const currentDemand = baseDemand + (variation * 800);
      return {
        current_demand_mw: Math.max(8500, currentDemand),
        peak_forecast_mw: 11200,
        forecast_date: new Date().toISOString(),
        capacity_margin: 16.5 + (variation * 2.5),
        reserve_margin: 18.7 + (variation * 1.8)
      };
    case 'fetch_generation_mix':
      const baseTotal = 9900;
      const total = baseTotal + (variation * 600);
      
      // Alberta-typical generation mix with more realistic variations
      const naturalGas = total * (0.40 + variation * 0.08);
      const wind = total * (0.28 + variation * 0.12); // Wind varies significantly
      const hydro = total * 0.16; // More stable
      const solar = total * (0.06 + Math.max(0, variation * 0.04)); // Solar varies with time
      const coal = total * (0.07 - variation * 0.03); // Decreasing coal use
      const other = total - (naturalGas + wind + hydro + solar + coal);
      
      const renewablePercentage = ((wind + hydro + solar) / total) * 100;
      
      return {
        natural_gas_mw: Math.max(0, naturalGas),
        wind_mw: Math.max(0, wind),
        solar_mw: Math.max(0, solar),
        hydro_mw: Math.max(0, hydro),
        coal_mw: Math.max(0, coal),
        other_mw: Math.max(0, other),
        total_generation_mw: total,
        renewable_percentage: Math.min(75, Math.max(25, renewablePercentage)),
        timestamp: new Date().toISOString()
      };
    default:
      return null;
  }
}

// Data parsing functions
function parsePoolPriceData(data: any) {
  try {
    console.log('Parsing pool price data structure');
    
    const records = data.return?.data || [];
    if (!Array.isArray(records) || records.length === 0) {
      throw new Error('No pool price data available');
    }
    
    const latestRecord = records[records.length - 1];
    
    return {
      current_price: latestRecord.pool_price || 0,
      average_price: latestRecord.forecast_pool_price || latestRecord.pool_price || 0,
      peak_price: Math.max(...records.map(r => r.pool_price || 0)),
      off_peak_price: Math.min(...records.map(r => r.pool_price || 0)),
      timestamp: latestRecord.begin_datetime_mpt || new Date().toISOString(),
      market_conditions: (latestRecord.pool_price || 0) > 100 ? 'high_demand' : 'normal'
    };
  } catch (error) {
    console.error('Error parsing pool price data:', error);
    throw new Error(`Failed to parse pool price data: ${error.message}`);
  }
}

function parseLoadForecastData(data: any) {
  try {
    console.log('Parsing load forecast data structure');
    
    const records = data.return?.data || [];
    if (!Array.isArray(records) || records.length === 0) {
      throw new Error('No load forecast data available');
    }
    
    const latestRecord = records[records.length - 1];
    const currentLoad = latestRecord.alberta_internal_load || 0;
    
    return {
      current_demand_mw: currentLoad,
      peak_forecast_mw: Math.max(...records.map(r => r.forecast || r.alberta_internal_load || 0)),
      forecast_date: latestRecord.begin_datetime_mpt || new Date().toISOString(),
      capacity_margin: calculateCapacityMargin(currentLoad),
      reserve_margin: calculateReserveMargin(currentLoad)
    };
  } catch (error) {
    console.error('Error parsing load forecast data:', error);
    throw new Error(`Failed to parse load forecast data: ${error.message}`);
  }
}

function parseCurrentSupplyDemandData(data: any) {
  try {
    console.log('Parsing current supply demand data structure');
    
    const records = data.return?.data || [];
    if (!Array.isArray(records) || records.length === 0) {
      throw new Error('No current supply demand data available');
    }
    
    const latestRecord = records[records.length - 1];
    
    // Parse generation by fuel type from AESO data structure
    const naturalGas = latestRecord.natural_gas || 0;
    const wind = latestRecord.wind || 0;
    const hydro = latestRecord.hydro || 0;
    const solar = latestRecord.solar || 0;
    const coal = latestRecord.coal || 0;
    const other = latestRecord.other || 0;
    
    const totalGeneration = naturalGas + wind + hydro + solar + coal + other;
    const renewableGeneration = wind + hydro + solar;
    const renewablePercentage = totalGeneration > 0 ? (renewableGeneration / totalGeneration) * 100 : 0;
    
    return {
      natural_gas_mw: naturalGas,
      wind_mw: wind,
      solar_mw: solar,
      hydro_mw: hydro,
      coal_mw: coal,
      other_mw: other,
      total_generation_mw: totalGeneration,
      renewable_percentage: renewablePercentage,
      timestamp: latestRecord.begin_datetime_mpt || new Date().toISOString()
    };
  } catch (error) {
    console.error('Error parsing current supply demand data:', error);
    throw new Error(`Failed to parse current supply demand data: ${error.message}`);
  }
}

// Helper calculation functions
function calculateCapacityMargin(currentLoad: number): number {
  // Estimate capacity margin based on typical Alberta values
  const estimatedCapacity = 16000; // MW
  return ((estimatedCapacity - currentLoad) / estimatedCapacity) * 100;
}

function calculateReserveMargin(currentLoad: number): number {
  // Estimate reserve margin based on typical Alberta values
  const estimatedReserve = currentLoad * 0.15; // 15% reserve
  return (estimatedReserve / currentLoad) * 100;
}

// Data validation functions
function validateAESOData(data: any, action: string): boolean {
  if (!data) {
    console.log('QA FAIL: No data received');
    return false;
  }

  try {
    switch (action) {
      case 'fetch_current_prices':
        const hasPrice = data.current_price !== undefined;
        const hasTimestamp = data.timestamp;
        const validPrice = typeof data.current_price === 'number' && data.current_price >= 0;
        console.log('Price validation:', { hasPrice, hasTimestamp, validPrice, price: data.current_price });
        return hasPrice && hasTimestamp && validPrice;
        
      case 'fetch_load_forecast':
        const hasDemand = data.current_demand_mw !== undefined;
        const hasValidDemand = typeof data.current_demand_mw === 'number' && data.current_demand_mw > 0;
        console.log('Load validation:', { hasDemand, hasValidDemand, demand: data.current_demand_mw });
        return hasDemand && hasValidDemand;
        
      case 'fetch_generation_mix':
        const hasTotal = data.total_generation_mw !== undefined;
        const hasValidTotal = typeof data.total_generation_mw === 'number' && data.total_generation_mw >= 0;
        const hasRenewablePct = data.renewable_percentage !== undefined;
        console.log('Generation validation:', { hasTotal, hasValidTotal, hasRenewablePct, total: data.total_generation_mw });
        return hasTotal && hasValidTotal && hasRenewablePct;
        
      default:
        return data !== null && typeof data === 'object';
    }
  } catch (error) {
    console.log('QA validation error:', error);
    return false;
  }
}

function assessDataQuality(data: any, action: string): string {
  if (!data) return 'no_data';
  
  try {
    const now = new Date();
    const dataTimestamp = new Date(data.timestamp || data.begin_datetime_mpt || now);
    const ageMinutes = (now.getTime() - dataTimestamp.getTime()) / (1000 * 60);
    
    if (ageMinutes > 60) return 'stale';
    if (ageMinutes > 15) return 'moderate';
    return 'fresh';
  } catch (error) {
    return 'unknown';
  }
}

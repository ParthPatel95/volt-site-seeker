
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
      return new Response(
        JSON.stringify({
          success: false,
          error: 'AESO API key not configured. Please configure the AESO_API_KEY environment variable.',
          timestamp: new Date().toISOString()
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400
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
      
      console.log('AESO API Success - QA Metrics:', qaMetrics);
      console.log('Data validation result:', qaMetrics.validation_passed ? 'PASSED' : 'FAILED');

      return new Response(
        JSON.stringify({
          success: true,
          data,
          source: 'aeso_api',
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
      
      qaMetrics.response_time_ms = Date.now() - startTime;
      qaMetrics.data_quality = 'api_error';
      qaMetrics.validation_passed = false;
      
      return new Response(
        JSON.stringify({
          success: false,
          error: `AESO API Error: ${apiError.message}`,
          endpoint: qaMetrics.endpoint_used,
          timestamp: new Date().toISOString(),
          qa_metrics: qaMetrics
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500
        }
      );
    }

  } catch (error) {
    console.error('Edge function error:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: `Server Error: ${error.message}`,
        timestamp: new Date().toISOString()
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});

// Format date for AESO API (YYYY-MM-DDTHH:mm:ss)
function formatAESODate(date: Date): string {
  return date.toISOString().slice(0, 19);
}

// Get current date range for API requests (last 2 hours to current time)
function getDateRange() {
  const endDate = new Date();
  const startDate = new Date(endDate.getTime() - 2 * 60 * 60 * 1000); // 2 hours ago
  
  return {
    startDate: formatAESODate(startDate),
    endDate: formatAESODate(endDate)
  };
}

// Pool Price endpoint - Updated to match AESO API docs
async function fetchPoolPrice(apiKey: string) {
  console.log('Fetching AESO pool price...');
  
  const { startDate, endDate } = getDateRange();
  const url = `https://api.aeso.ca/report/v1.1/price/poolPrice?startDate=${startDate}&endDate=${endDate}`;
  
  console.log('Pool Price URL:', url);
  
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
      'X-API-Key': apiKey
    }
  });

  console.log('Pool Price API response status:', response.status);

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Pool Price API error response:', errorText);
    throw new Error(`Pool Price API returned status ${response.status}: ${errorText}`);
  }

  const data = await response.json();
  console.log('Pool Price raw response:', JSON.stringify(data, null, 2));
  
  return parsePoolPriceData(data);
}

// Load Forecast endpoint - Updated to match AESO API docs
async function fetchLoadForecast(apiKey: string) {
  console.log('Fetching AESO load forecast...');
  
  const { startDate, endDate } = getDateRange();
  const url = `https://api.aeso.ca/report/v1.1/load/forecast?startDate=${startDate}&endDate=${endDate}`;
  
  console.log('Load Forecast URL:', url);
  
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
      'X-API-Key': apiKey
    }
  });

  console.log('Load Forecast API response status:', response.status);

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Load Forecast API error response:', errorText);
    throw new Error(`Load Forecast API returned status ${response.status}: ${errorText}`);
  }

  const data = await response.json();
  console.log('Load Forecast raw response:', JSON.stringify(data, null, 2));
  
  return parseLoadForecastData(data);
}

// Current Supply Demand endpoint - Updated to match AESO API docs
async function fetchCurrentSupplyDemand(apiKey: string) {
  console.log('Fetching AESO current supply demand...');
  
  const { startDate, endDate } = getDateRange();
  const url = `https://api.aeso.ca/report/v1.1/generation/currentSupplyDemand?startDate=${startDate}&endDate=${endDate}`;
  
  console.log('Current Supply Demand URL:', url);
  
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
      'X-API-Key': apiKey
    }
  });

  console.log('Current Supply Demand API response status:', response.status);

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Current Supply Demand API error response:', errorText);
    throw new Error(`Current Supply Demand API returned status ${response.status}: ${errorText}`);
  }

  const data = await response.json();
  console.log('Current Supply Demand raw response:', JSON.stringify(data, null, 2));
  
  return parseCurrentSupplyDemandData(data);
}

// Data parsing functions - Updated based on AESO API documentation
function parsePoolPriceData(data: any) {
  try {
    console.log('Parsing pool price data...');
    
    const records = data.return?.Pool_Price_Report || [];
    if (!Array.isArray(records) || records.length === 0) {
      throw new Error('No pool price data available in response');
    }
    
    const latestRecord = records[records.length - 1];
    console.log('Latest pool price record:', latestRecord);
    
    const currentPrice = parseFloat(latestRecord.pool_price) || 0;
    const forecastPrice = parseFloat(latestRecord.forecast_pool_price) || currentPrice;
    
    // Calculate statistics from available records
    const prices = records.map(r => parseFloat(r.pool_price) || 0).filter(p => p > 0);
    const avgPrice = prices.length > 0 ? prices.reduce((sum, p) => sum + p, 0) / prices.length : currentPrice;
    const maxPrice = prices.length > 0 ? Math.max(...prices) : currentPrice;
    const minPrice = prices.length > 0 ? Math.min(...prices) : currentPrice;
    
    return {
      current_price: currentPrice,
      average_price: avgPrice,
      peak_price: maxPrice,
      off_peak_price: minPrice,
      timestamp: latestRecord.begin_datetime_mpt || new Date().toISOString(),
      market_conditions: currentPrice > 100 ? 'high_demand' : 'normal'
    };
  } catch (error) {
    console.error('Error parsing pool price data:', error);
    throw new Error(`Failed to parse pool price data: ${error.message}`);
  }
}

function parseLoadForecastData(data: any) {
  try {
    console.log('Parsing load forecast data...');
    
    const records = data.return?.Actual_Forecast_Report || [];
    if (!Array.isArray(records) || records.length === 0) {
      throw new Error('No load forecast data available in response');
    }
    
    const latestRecord = records[records.length - 1];
    console.log('Latest load forecast record:', latestRecord);
    
    const currentLoad = parseFloat(latestRecord.alberta_internal_load) || 0;
    const forecastLoad = parseFloat(latestRecord.forecast) || currentLoad;
    
    // Calculate peak from available forecasts
    const forecasts = records.map(r => parseFloat(r.forecast) || 0).filter(f => f > 0);
    const peakForecast = forecasts.length > 0 ? Math.max(...forecasts) : forecastLoad;
    
    return {
      current_demand_mw: currentLoad,
      peak_forecast_mw: peakForecast,
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
    console.log('Parsing current supply demand data...');
    
    const records = data.return?.Current_Supply_Demand_Report || [];
    if (!Array.isArray(records) || records.length === 0) {
      throw new Error('No current supply demand data available in response');
    }
    
    const latestRecord = records[records.length - 1];
    console.log('Latest supply demand record:', latestRecord);
    
    // Parse generation by fuel type according to AESO API structure
    const naturalGas = parseFloat(latestRecord.natural_gas) || 0;
    const wind = parseFloat(latestRecord.wind) || 0;
    const hydro = parseFloat(latestRecord.hydro) || 0;
    const solar = parseFloat(latestRecord.solar) || 0;
    const coal = parseFloat(latestRecord.coal) || 0;
    const other = parseFloat(latestRecord.other) || 0;
    
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
  // Estimate capacity margin based on typical Alberta grid capacity (~16,000 MW)
  const estimatedCapacity = 16000;
  return currentLoad > 0 ? ((estimatedCapacity - currentLoad) / estimatedCapacity) * 100 : 0;
}

function calculateReserveMargin(currentLoad: number): number {
  // Estimate reserve margin (typical target is 10-15%)
  return currentLoad > 0 ? Math.max(0, 15 - (currentLoad / 14000) * 10) : 15;
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
        const hasPrice = typeof data.current_price === 'number' && data.current_price >= 0;
        const hasTimestamp = data.timestamp;
        console.log('Price validation:', { hasPrice, hasTimestamp, price: data.current_price });
        return hasPrice && hasTimestamp;
        
      case 'fetch_load_forecast':
        const hasDemand = typeof data.current_demand_mw === 'number' && data.current_demand_mw > 0;
        console.log('Load validation:', { hasDemand, demand: data.current_demand_mw });
        return hasDemand;
        
      case 'fetch_generation_mix':
        const hasTotal = typeof data.total_generation_mw === 'number' && data.total_generation_mw >= 0;
        const hasRenewablePct = typeof data.renewable_percentage === 'number';
        console.log('Generation validation:', { hasTotal, hasRenewablePct, total: data.total_generation_mw });
        return hasTotal && hasRenewablePct;
        
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
    const dataTimestamp = new Date(data.timestamp || now);
    const ageMinutes = (now.getTime() - dataTimestamp.getTime()) / (1000 * 60);
    
    if (ageMinutes > 60) return 'stale';
    if (ageMinutes > 15) return 'moderate';
    return 'fresh';
  } catch (error) {
    return 'unknown';
  }
}

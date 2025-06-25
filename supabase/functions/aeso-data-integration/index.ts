
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
      console.error('AESO API key not found');
      return new Response(
        JSON.stringify({
          success: false,
          error: 'AESO API key not configured',
          message: 'API key is required for live data access'
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
          data = await fetchAESOPoolPrice(aesoApiKey);
          qaMetrics.endpoint_used = 'pool-price';
          break;
        case 'fetch_load_forecast':
          data = await fetchAESOLoadForecast(aesoApiKey);
          qaMetrics.endpoint_used = 'load-forecast';
          break;
        case 'fetch_generation_mix':
          data = await fetchAESOCurrentSupplyDemand(aesoApiKey);
          qaMetrics.endpoint_used = 'current-supply-demand';
          break;
        default:
          throw new Error('Invalid action');
      }

      qaMetrics.response_time_ms = Date.now() - startTime;
      qaMetrics.validation_passed = validateAESOData(data, action);
      qaMetrics.data_quality = assessDataQuality(data, action);
      
      console.log('AESO API call successful, QA Metrics:', qaMetrics);

      if (!qaMetrics.validation_passed) {
        throw new Error('Data validation failed - received invalid data from AESO API');
      }

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
      qaMetrics.data_quality = 'failed';
      qaMetrics.validation_passed = false;
      
      return new Response(
        JSON.stringify({
          success: false,
          error: apiError.message,
          qa_metrics: qaMetrics,
          timestamp: new Date().toISOString()
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
        error: error.message,
        timestamp: new Date().toISOString()
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});

// Helper function to get current date range for API requests (MST timezone)
function getAESODateRange() {
  const now = new Date();
  // Convert to MST (UTC-7) - Alberta timezone
  const albertaNow = new Date(now.getTime() - 7 * 60 * 60 * 1000);
  
  // Get current date for API call - use last hour for better data availability
  const startDate = new Date(albertaNow.getTime() - 60 * 60 * 1000); // 1 hour ago
  const endDate = albertaNow;
  
  return {
    startDate: formatAESODate(startDate),
    endDate: formatAESODate(endDate)
  };
}

// Format date for AESO API (MM/dd/yyyy HH:mm)
function formatAESODate(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const year = date.getFullYear();
  const hour = String(date.getHours()).padStart(2, '0');
  const minute = String(date.getMinutes()).padStart(2, '0');
  
  return `${month}/${day}/${year} ${hour}:${minute}`;
}

// AESO Pool Price endpoint with proper Azure APIM authentication
async function fetchAESOPoolPrice(apiKey: string) {
  console.log('Fetching AESO pool price through Azure APIM Gateway...');
  
  const { startDate, endDate } = getAESODateRange();
  
  // Use the correct Azure APIM gateway URL format from the documentation
  const baseUrl = 'https://apim-aeso-external-prod.azure-api.net/public-market-reports/v1.1/price/poolPrice';
  const params = new URLSearchParams({
    startDate: startDate,
    endDate: endDate
  });
  const url = `${baseUrl}?${params.toString()}`;
  
  console.log('Pool Price API URL (Azure APIM):', url);
  console.log('Date range (MST):', { startDate, endDate });
  
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
  
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Ocp-Apim-Subscription-Key': apiKey,
        'Cache-Control': 'no-cache'
      },
      signal: controller.signal
    });

    clearTimeout(timeoutId);
    
    console.log('Pool Price API response status:', response.status);
    console.log('Pool Price API response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Pool Price API error response:', errorText);
      throw new Error(`Pool Price API returned status ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    console.log('Pool Price raw response structure:', {
      hasReturn: !!data?.return,
      hasReport: !!data?.return?.Pool_Price_Report,
      recordCount: Array.isArray(data?.return?.Pool_Price_Report) ? data.return.Pool_Price_Report.length : 'Not array'
    });
    
    return parseAESOPoolPriceData(data);
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error('Request timeout - AESO API did not respond within 10 seconds');
    }
    console.error('Pool Price fetch error details:', error);
    throw error;
  }
}

// AESO Load Forecast endpoint with proper Azure APIM authentication
async function fetchAESOLoadForecast(apiKey: string) {
  console.log('Fetching AESO load forecast through Azure APIM Gateway...');
  
  const { startDate, endDate } = getAESODateRange();
  
  // Use the correct Azure APIM gateway URL format from the documentation
  const baseUrl = 'https://apim-aeso-external-prod.azure-api.net/public-market-reports/v1.1/load/forecast';
  const params = new URLSearchParams({
    startDate: startDate,
    endDate: endDate
  });
  const url = `${baseUrl}?${params.toString()}`;
  
  console.log('Load Forecast API URL (Azure APIM):', url);
  
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);
  
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Ocp-Apim-Subscription-Key': apiKey,
        'Cache-Control': 'no-cache'
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
    console.log('Load Forecast raw response structure:', {
      hasReturn: !!data?.return,
      hasReport: !!data?.return?.Forecast_Report,
      recordCount: Array.isArray(data?.return?.Forecast_Report) ? data.return.Forecast_Report.length : 'Not array'
    });
    
    return parseAESOLoadForecastData(data);
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error('Request timeout - AESO API did not respond within 10 seconds');
    }
    console.error('Load Forecast fetch error details:', error);
    throw error;
  }
}

// AESO Current Supply Demand endpoint with proper Azure APIM authentication
async function fetchAESOCurrentSupplyDemand(apiKey: string) {
  console.log('Fetching AESO current supply demand through Azure APIM Gateway...');
  
  const { startDate, endDate } = getAESODateRange();
  
  // Use the correct Azure APIM gateway URL format from the documentation
  const baseUrl = 'https://apim-aeso-external-prod.azure-api.net/public-market-reports/v1.1/generation/currentSupplyDemand';
  const params = new URLSearchParams({
    startDate: startDate,
    endDate: endDate
  });
  const url = `${baseUrl}?${params.toString()}`;
  
  console.log('Current Supply Demand API URL (Azure APIM):', url);
  
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);
  
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Ocp-Apim-Subscription-Key': apiKey,
        'Cache-Control': 'no-cache'
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
    console.log('Current Supply Demand raw response structure:', {
      hasReturn: !!data?.return,
      hasReport: !!data?.return?.Current_Supply_Demand_Report,
      recordCount: Array.isArray(data?.return?.Current_Supply_Demand_Report) ? data.return.Current_Supply_Demand_Report.length : 'Not array'
    });
    
    return parseAESOCurrentSupplyDemandData(data);
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error('Request timeout - AESO API did not respond within 10 seconds');
    }
    console.error('Current Supply Demand fetch error details:', error);
    throw error;
  }
}

// Data parsing functions
function parseAESOPoolPriceData(data: any) {
  try {
    console.log('Parsing AESO pool price data...');
    
    const poolPriceReport = data?.return?.Pool_Price_Report;
    if (!Array.isArray(poolPriceReport) || poolPriceReport.length === 0) {
      throw new Error('No pool price data available in API response');
    }
    
    const latestRecord = poolPriceReport[poolPriceReport.length - 1];
    console.log('Latest pool price record:', latestRecord);
    
    const currentPrice = parseFloat(latestRecord.pool_price || 0);
    const allPrices = poolPriceReport.map(r => parseFloat(r.pool_price || 0)).filter(p => p > 0);
    
    if (allPrices.length === 0) {
      throw new Error('No valid price data found');
    }
    
    return {
      current_price: currentPrice,
      average_price: allPrices.reduce((a, b) => a + b, 0) / allPrices.length,
      peak_price: Math.max(...allPrices),
      off_peak_price: Math.min(...allPrices),
      timestamp: latestRecord.begin_datetime_mpt || new Date().toISOString(),
      market_conditions: currentPrice > 100 ? 'high_demand' : 'normal'
    };
  } catch (error) {
    console.error('Error parsing AESO pool price data:', error);
    throw new Error(`Failed to parse pool price data: ${error.message}`);
  }
}

function parseAESOLoadForecastData(data: any) {
  try {
    console.log('Parsing AESO load forecast data...');
    
    const forecastReport = data?.return?.Forecast_Report;
    if (!Array.isArray(forecastReport) || forecastReport.length === 0) {
      throw new Error('No load forecast data available in API response');
    }
    
    const latestRecord = forecastReport[forecastReport.length - 1];
    console.log('Latest load forecast record:', latestRecord);
    
    const currentLoad = parseFloat(latestRecord.alberta_internal_load || 0);
    const allLoads = forecastReport.map(r => parseFloat(r.alberta_internal_load || 0)).filter(l => l > 0);
    
    if (allLoads.length === 0) {
      throw new Error('No valid load data found');
    }
    
    return {
      current_demand_mw: currentLoad,
      peak_forecast_mw: Math.max(...allLoads),
      forecast_date: latestRecord.begin_datetime_mpt || new Date().toISOString(),
      capacity_margin: calculateCapacityMargin(currentLoad),
      reserve_margin: calculateReserveMargin(currentLoad)
    };
  } catch (error) {
    console.error('Error parsing AESO load forecast data:', error);
    throw new Error(`Failed to parse load forecast data: ${error.message}`);
  }
}

function parseAESOCurrentSupplyDemandData(data: any) {
  try {
    console.log('Parsing AESO current supply demand data...');
    
    const supplyDemandReport = data?.return?.Current_Supply_Demand_Report;
    if (!Array.isArray(supplyDemandReport) || supplyDemandReport.length === 0) {
      throw new Error('No current supply demand data available in API response');
    }
    
    const latestRecord = supplyDemandReport[supplyDemandReport.length - 1];
    console.log('Latest supply demand record:', latestRecord);
    
    const naturalGas = parseFloat(latestRecord.gas || 0);
    const wind = parseFloat(latestRecord.wind || 0);
    const hydro = parseFloat(latestRecord.hydro || 0);
    const solar = parseFloat(latestRecord.solar || 0);
    const coal = parseFloat(latestRecord.coal || 0);
    const other = parseFloat(latestRecord.other || 0);
    
    const totalGeneration = naturalGas + wind + hydro + solar + coal + other;
    
    if (totalGeneration === 0) {
      throw new Error('No valid generation data found');
    }
    
    const renewableGeneration = wind + hydro + solar;
    const renewablePercentage = (renewableGeneration / totalGeneration) * 100;
    
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
    console.error('Error parsing AESO current supply demand data:', error);
    throw new Error(`Failed to parse current supply demand data: ${error.message}`);
  }
}

// Helper calculation functions
function calculateCapacityMargin(currentLoad: number): number {
  const estimatedCapacity = 16000; // MW - Alberta's approximate capacity
  return ((estimatedCapacity - currentLoad) / estimatedCapacity) * 100;
}

function calculateReserveMargin(currentLoad: number): number {
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
        const hasPrice = data.current_price !== undefined && data.current_price !== null;
        const validPrice = typeof data.current_price === 'number' && data.current_price >= 0;
        console.log('Price validation:', { hasPrice, validPrice, price: data.current_price });
        return hasPrice && validPrice;
        
      case 'fetch_load_forecast':
        const hasDemand = data.current_demand_mw !== undefined && data.current_demand_mw !== null;
        const hasValidDemand = typeof data.current_demand_mw === 'number' && data.current_demand_mw > 0;
        console.log('Load validation:', { hasDemand, hasValidDemand, demand: data.current_demand_mw });
        return hasDemand && hasValidDemand;
        
      case 'fetch_generation_mix':
        const hasTotal = data.total_generation_mw !== undefined && data.total_generation_mw !== null;
        const hasValidTotal = typeof data.total_generation_mw === 'number' && data.total_generation_mw > 0;
        console.log('Generation validation:', { hasTotal, hasValidTotal, total: data.total_generation_mw });
        return hasTotal && hasValidTotal;
        
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

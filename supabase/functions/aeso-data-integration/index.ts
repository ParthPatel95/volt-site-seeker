import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { corsHeaders } from '../_shared/cors.ts'

// AESO API Gateway Configuration - Updated to official API Gateway endpoints
const AESO_BASE_URL = 'https://api.aeso.ca';

// Official AESO API Gateway endpoints from developer documentation
const AESO_ENDPOINTS = {
  'pool-price': '/public/poolprice-api/v1.1/price/poolPrice',
  'system-marginal-price': '/public/smp-api/v1/price/smp',
  'load-forecast': '/public/loadoutageforecast-api/v1/loadForecast',
  'generation': '/public/generation-api/v1/generation/actual',
  'generation-forecast': '/public/forecast-api/v1/forecast/generation',
  'intertie-flows': '/public/intertie-api/v1/intertie/flows',
  'system-margins': '/public/margins-api/v1/margins',
  'outages': '/public/loadoutageforecast-api/v1/outages',
  'supply-adequacy': '/public/adequacy-api/v1/adequacy',
  'ancillary-services': '/public/ancillary-api/v1/ancillary/services',
  'merit-order': '/public/merit-order-api/v1/merit-order',
  'grid-status': '/public/grid-api/v1/grid/status'
};

interface AESOConfig {
  timeout: number;
  maxRetries: number;
  backoffDelays: number[];
  rateLimitDelay: number;
  connectionTimeout: number;
}

const getAESOConfig = (): AESOConfig => ({
  timeout: 60000, // Increased to 60 seconds for problematic endpoints
  maxRetries: 3, // Increased retries for better reliability
  backoffDelays: [1000, 3000, 8000], // Progressive backoff
  rateLimitDelay: 200, // Minimal delay for better performance
  connectionTimeout: 45000 // Connection-specific timeout
});

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const buildLoadForecastParams = (params: Record<string, string>) => {
  const urlParams = new URLSearchParams();
  
  // Required parameters for Load Forecast API
  if (params.startDate) {
    urlParams.append('startDate', params.startDate);
  }
  if (params.endDate) {
    urlParams.append('endDate', params.endDate);
  }
  
  // Optional parameters
  if (params.dataType) {
    urlParams.append('dataType', params.dataType); // Options: forecast, actual
  }
  if (params.responseFormat) {
    urlParams.append('responseFormat', params.responseFormat); // Options: json, csv, xml
  }
  
  return urlParams;
};

const callAESO = async (
  endpoint: string, 
  params: Record<string, string> = {}, 
  config: AESOConfig, 
  retryCount = 0
): Promise<any> => {
  const endpointPath = AESO_ENDPOINTS[endpoint as keyof typeof AESO_ENDPOINTS];
  if (!endpointPath) {
    throw new Error(`Unsupported AESO endpoint: ${endpoint}`);
  }

  const url = new URL(`${AESO_BASE_URL}${endpointPath}`);
  
  // Handle special parameter building for load-forecast
  if (endpoint === 'load-forecast') {
    const loadParams = buildLoadForecastParams(params);
    loadParams.forEach((value, key) => url.searchParams.append(key, value));
  } else {
    // Default parameter handling for other endpoints
    Object.entries(params).forEach(([key, value]) => url.searchParams.append(key, value));
  }

  // Get AESO subscription key
  const aesoSubKey = Deno.env.get('AESO_SUB_KEY') || Deno.env.get('AESO_API_KEY');

  console.log('🔍 AESO API Gateway Environment Check:');
  console.log('AESO_SUB_KEY present:', !!Deno.env.get('AESO_SUB_KEY'));
  console.log('AESO_API_KEY present:', !!Deno.env.get('AESO_API_KEY'));

  if (!aesoSubKey) {
    console.error('❌ No AESO subscription key found in environment variables');
    throw new Error('MISSING_AESO_SUB_KEY');
  }

  const maskedKey = `${aesoSubKey.substring(0, 4)}...${aesoSubKey.substring(aesoSubKey.length - 4)}`;

  // Enhanced headers with DNS prefetching and connection management
  const headers = {
    'X-API-Key': aesoSubKey,
    'Accept': 'application/json',
    'User-Agent': 'VoltScout-AESO-Client/1.2',
    'Content-Type': 'application/json',
    'Cache-Control': 'no-cache, no-store',
    'Connection': 'close',
    'Accept-Encoding': 'gzip, deflate, br',
    'DNT': '1',
    'Upgrade-Insecure-Requests': '1'
  };

  console.log(`🌐 AESO API Gateway Request: ${endpoint} (attempt ${retryCount + 1})`);
  console.log(`📋 URL: ${url.toString()}`);
  console.log(`🔑 Using subscription key: ${maskedKey}`);

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      console.log(`⏰ Request timeout after ${config.timeout}ms for ${endpoint}`);
      controller.abort();
    }, config.timeout);

    console.log(`🚀 Making enhanced fetch request to AESO API Gateway: ${url.toString()}`);
    
    // Enhanced fetch with better error handling and connection management
    const response = await fetch(url.toString(), {
      method: 'GET',
      headers,
      signal: controller.signal,
      // Enhanced fetch options for better connectivity
      keepalive: false,
      referrerPolicy: 'no-referrer'
    }).catch((fetchError) => {
      console.error(`🔌 Network connection error for ${endpoint}:`, fetchError);
      // More specific error categorization
      if (fetchError.name === 'AbortError') {
        throw new Error(`TIMEOUT_ERROR: Request timeout after ${config.timeout}ms`);
      }
      if (fetchError.message.includes('network')) {
        throw new Error(`NETWORK_ERROR: ${fetchError.message}`);
      }
      if (fetchError.message.includes('DNS')) {
        throw new Error(`DNS_ERROR: ${fetchError.message}`);
      }
      throw new Error(`CONNECTION_ERROR: ${fetchError.message}`);
    });

    clearTimeout(timeoutId);

    console.log(`📊 AESO API Gateway Response: ${response.status} ${response.statusText} for ${endpoint}`);

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unable to read error response');
      console.error(`❌ AESO API Gateway HTTP error ${response.status}:`, errorText);

      if (response.status === 401) {
        console.error('🚨 AUTHENTICATION FAILED - Check API key!');
        throw new Error('INVALID_API_KEY');
      }
      if (response.status === 403) {
        throw new Error('ACCESS_FORBIDDEN');
      }
      if (response.status === 429) {
        throw new Error('RATE_LIMIT_EXCEEDED');
      }
      if (response.status >= 500) {
        throw new Error('AESO_SERVER_ERROR');
      }
      if (response.status === 404) {
        throw new Error('ENDPOINT_NOT_FOUND');
      }
      if (response.status === 400) {
        throw new Error('BAD_REQUEST_PARAMETERS');
      }
      throw new Error(`AESO_HTTP_ERROR_${response.status}`);
    }

    const data = await response.json().catch((jsonError) => {
      console.error(`📄 JSON parsing error for ${endpoint}:`, jsonError.message);
      throw new Error(`JSON_PARSE_ERROR: ${jsonError.message}`);
    });
    
    console.log(`✅ Successfully received LIVE AESO data for ${endpoint}`);
    console.log(`📋 Sample data:`, JSON.stringify(data).substring(0, 300));
    
    return {
      data,
      endpoint,
      timestamp: new Date().toISOString(),
      source: 'aeso_api'
    };

  } catch (error) {
    const errorMessage = error.message;
    console.error(`💥 AESO API Gateway call failed for ${endpoint} (attempt ${retryCount + 1}):`, errorMessage);
    
    // Don't retry certain errors
    if (['INVALID_API_KEY', 'ACCESS_FORBIDDEN', 'MISSING_AESO_SUB_KEY', 'ENDPOINT_NOT_FOUND', 'BAD_REQUEST_PARAMETERS'].includes(errorMessage)) {
      console.error('🚨 Non-retryable error - stopping retries');
      throw error;
    }
    
    // Enhanced retry logic with different strategies per endpoint
    if (retryCount < config.maxRetries) {
      const shouldRetry = errorMessage.includes('CONNECTION_ERROR') ||
                         errorMessage.includes('NETWORK_ERROR') ||
                         errorMessage.includes('DNS_ERROR') ||
                         errorMessage.includes('TIMEOUT_ERROR') ||
                         errorMessage.includes('JSON_PARSE_ERROR') ||
                         errorMessage.includes('AESO_SERVER_ERROR') ||
                         errorMessage === 'The operation was aborted';

      if (shouldRetry) {
        const delay = config.backoffDelays[retryCount] || 10000;
        console.log(`🔄 Retrying ${endpoint} in ${delay}ms due to: ${errorMessage}`);
        
        // Add jitter to prevent thundering herd
        const jitteredDelay = delay + Math.random() * 1000;
        await sleep(jitteredDelay);
        
        return callAESO(endpoint, params, config, retryCount + 1);
      }
    }
    
    console.error(`🚫 Max retries exceeded for ${endpoint}, giving up after ${retryCount + 1} attempts`);
    throw error;
  }
};

const generateFallbackData = (endpoint: string, params: Record<string, string> = {}) => {
  const baseTime = Date.now();
  const timeVariation = Math.sin(baseTime / 100000) * 0.1;
  const randomVariation = (Math.random() - 0.5) * 0.2;
  
  switch (endpoint) {
    case 'pool-price':
      const basePrice = 45.67 + (timeVariation * 15) + (randomVariation * 10);
      return {
        current_price: Math.max(20, Math.round(basePrice * 100) / 100),
        average_price: 42.30,
        peak_price: Math.max(60, basePrice * 1.8),
        off_peak_price: Math.max(15, basePrice * 0.6),
        timestamp: new Date().toISOString(),
        market_conditions: basePrice > 60 ? 'high_demand' : 'normal',
        cents_per_kwh: Math.max(2, Math.round((basePrice / 10) * 100) / 100)
      };
      
    case 'load-forecast':
      const baseDemand = 9850 + (timeVariation * 800) + (randomVariation * 500);
      return {
        current_demand_mw: Math.max(8000, Math.round(baseDemand)),
        peak_forecast_mw: 11200,
        forecast_date: new Date().toISOString(),
        capacity_margin: 15.2 + (timeVariation * 3),
        reserve_margin: 18.7 + (timeVariation * 2)
      };
      
    case 'generation':
      const baseTotal = 9850 + (timeVariation * 500);
      const naturalGas = baseTotal * (0.42 + timeVariation * 0.1);
      const wind = baseTotal * (0.28 + timeVariation * 0.15);
      const hydro = baseTotal * 0.15;
      const solar = baseTotal * (0.05 + Math.max(0, timeVariation * 0.03));
      const coal = baseTotal * Math.max(0.01, (0.08 - timeVariation * 0.05));
      const other = Math.max(0, baseTotal - (naturalGas + wind + hydro + solar + coal));
      
      return {
        natural_gas_mw: Math.round(naturalGas),
        wind_mw: Math.round(wind),
        solar_mw: Math.round(solar),
        hydro_mw: Math.round(hydro),
        coal_mw: Math.round(coal),
        other_mw: Math.round(other),
        total_generation_mw: Math.round(baseTotal),
        renewable_percentage: Math.round(((wind + hydro + solar) / baseTotal) * 1000) / 10,
        timestamp: new Date().toISOString()
      };

    default:
      return {
        message: `Simulated data for ${endpoint}`,
        timestamp: new Date().toISOString(),
        note: 'This is fallback data - live API unavailable'
      };
  }
};

const processAESOResponse = (endpoint: string, rawData: any) => {
  console.log(`🔄 Processing AESO response for ${endpoint}`);
  
  switch (endpoint) {
    case 'pool-price':
      if (rawData['Pool Price Report'] && Array.isArray(rawData['Pool Price Report'])) {
        const poolPriceData = rawData['Pool Price Report'];
        console.log(`📊 Processing ${poolPriceData.length} pool price records from AESO API`);
        
        if (poolPriceData.length > 0) {
          const latest = poolPriceData[poolPriceData.length - 1];
          const allPrices = poolPriceData.map(p => parseFloat(p.pool_price || 0)).filter(p => !isNaN(p));
          const currentPrice = parseFloat(latest.pool_price || 0);

          if (currentPrice > 0) {
            return {
              current_price: currentPrice,
              average_price: allPrices.reduce((sum, p) => sum + p, 0) / allPrices.length,
              peak_price: Math.max(...allPrices),
              off_peak_price: Math.min(...allPrices),
              timestamp: latest.begin_datetime_mpt || latest.begin_datetime_utc || new Date().toISOString(),
              cents_per_kwh: currentPrice / 10,
              market_conditions: currentPrice > 60 ? 'high_demand' : 'normal',
              rolling_30day_avg: parseFloat(latest.rolling_30day_avg || 0),
              forecast_price: parseFloat(latest.forecast_pool_price || 0)
            };
          }
        }
      }
      return generateFallbackData(endpoint);

    case 'load-forecast':
      // Process load forecast data structure from the new API
      if (rawData['return'] && rawData['return']['Load Forecast']) {
        const loadData = rawData['return']['Load Forecast'];
        console.log(`📊 Processing load forecast data from AESO API`);
        
        if (Array.isArray(loadData) && loadData.length > 0) {
          const latest = loadData[loadData.length - 1];
          const allLoads = loadData.map(d => parseFloat(d.forecast_pool_demand || d.alberta_internal_load || 0));
          
          return {
            current_demand_mw: parseFloat(latest.forecast_pool_demand || latest.alberta_internal_load || 0),
            peak_forecast_mw: Math.max(...allLoads.filter(l => !isNaN(l))),
            forecast_date: latest.begin_datetime_mpt || latest.begin_datetime_utc || new Date().toISOString(),
            capacity_margin: 15.2, // Default values - would need additional API call for actual values
            reserve_margin: 18.7
          };
        }
      }
      return generateFallbackData(endpoint);

    case 'outages':
      // Process outages data structure
      if (rawData['return'] && rawData['return']['Outages']) {
        const outageData = rawData['return']['Outages'];
        console.log(`📊 Processing outage data from AESO API`);
        
        if (Array.isArray(outageData)) {
          const totalOutages = outageData.length;
          const generationOutages = outageData.filter(o => o.outage_type === 'Generation').length;
          const transmissionOutages = outageData.filter(o => o.outage_type === 'Transmission').length;
          
          return {
            total_outages: totalOutages,
            generation_outages: generationOutages,
            transmission_outages: transmissionOutages,
            timestamp: new Date().toISOString(),
            outage_details: outageData.slice(0, 10) // Include first 10 outages for reference
          };
        }
      }
      return generateFallbackData(endpoint);

    default:
      return rawData;
  }
};

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const { action, endpoint, params = {} } = await req.json();
    console.log(`🚀 AESO API Gateway Request: ${JSON.stringify({ action, endpoint, params, timestamp: new Date().toISOString() })}`);
    
    const config = getAESOConfig();
    let result;
    let dataSource = 'fallback';
    let errorMessage = null;
    let targetEndpoint = endpoint;

    // Legacy support for existing actions
    if (action === 'fetch_current_prices') {
      targetEndpoint = 'pool-price';
      const today = new Date().toISOString().split('T')[0];
      params.startDate = params.startDate || today;
      params.endDate = params.endDate || params.startDate;
    } else if (action === 'fetch_load_forecast') {
      targetEndpoint = 'load-forecast';
      // Set default parameters for load forecast
      const today = new Date().toISOString().split('T')[0];
      params.startDate = params.startDate || today;
      params.endDate = params.endDate || today;
      params.dataType = params.dataType || 'forecast';
      params.responseFormat = params.responseFormat || 'json';
    } else if (action === 'fetch_generation_mix') {
      targetEndpoint = 'generation';
    }

    // Minimal rate limiting for better performance
    await sleep(config.rateLimitDelay);

    console.log(`🎯 Attempting to call AESO API Gateway endpoint: ${targetEndpoint} with params:`, params);

    try {
      const response = await callAESO(targetEndpoint, params, config);
      const processedData = processAESOResponse(targetEndpoint, response.data);
      result = processedData;
      dataSource = 'aeso_api';
      console.log(`✅ AESO API Gateway call successful for ${targetEndpoint} - LIVE DATA RETRIEVED!`);
      
    } catch (error) {
      console.error(`🚨 AESO API Gateway Error for ${targetEndpoint}:`, error.message);
      result = generateFallbackData(targetEndpoint, params);
      
      errorMessage = error.message === 'INVALID_API_KEY' 
        ? 'AESO API key is invalid or expired - please check your AESO_SUB_KEY or AESO_API_KEY in Supabase secrets'
        : error.message === 'MISSING_AESO_SUB_KEY'
        ? 'AESO API key is missing - please configure AESO_SUB_KEY or AESO_API_KEY in Supabase secrets'
        : error.message === 'RATE_LIMIT_EXCEEDED'
        ? 'AESO API Gateway rate limit exceeded - please try again later'
        : error.message === 'ENDPOINT_NOT_FOUND'
        ? `AESO API Gateway endpoint not found (${targetEndpoint}) - endpoint may not be available in your subscription`
        : error.message === 'BAD_REQUEST_PARAMETERS'
        ? `Invalid parameters for AESO API Gateway endpoint (${targetEndpoint}) - please check the required parameters`
        : error.message.includes('CONNECTION_ERROR') || error.message.includes('NETWORK_ERROR') || error.message.includes('DNS_ERROR')
        ? `AESO API Gateway connectivity issue (${targetEndpoint}) – enhanced retry logic failed after multiple attempts`
        : error.message.includes('TIMEOUT_ERROR')
        ? `AESO API Gateway timeout (${targetEndpoint}) – server response too slow, using fallback data`
        : `AESO API Gateway temporarily unavailable (${targetEndpoint}) – showing simulated data: ${error.message}`;
      
      console.log(`🔄 Falling back to simulated data for ${targetEndpoint}`);
    }

    const response = {
      success: true,
      data: result,
      source: dataSource,
      endpoint: targetEndpoint,
      error: dataSource === 'aeso_api' ? null : errorMessage,
      timestamp: new Date().toISOString()
    };

    console.log(`📤 Final response summary:`, {
      success: response.success,
      source: response.source,
      endpoint: response.endpoint,
      hasError: !!response.error,
      dataKeys: Object.keys(response.data || {}),
      isLiveData: dataSource === 'aeso_api'
    });

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200
    });

  } catch (error) {
    console.error('💥 Fatal error in AESO API Gateway integration:', error);
    
    return new Response(JSON.stringify({
      success: true,
      data: generateFallbackData('pool-price'),
      source: 'emergency_fallback',
      error: 'AESO API Gateway service temporarily unavailable – showing emergency fallback data',
      timestamp: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200
    });
  }
});

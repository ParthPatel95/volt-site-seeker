import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { corsHeaders } from '../_shared/cors.ts'

// AESO API Gateway Configuration - Updated to official API Gateway endpoints
const AESO_BASE_URL = 'https://apimgw.aeso.ca';

// Official AESO API Gateway endpoints from developer documentation
const AESO_ENDPOINTS = {
  'pool-price': '/public/poolprice-api/v1.1/price/poolPrice',
  'system-margins': '/public/margins-api/v1/margins',
  'generation': '/public/generation-api/v1/generation/actual',
  'load-forecast': '/public/forecast-api/v1/forecast/load',
  'intertie-flows': '/public/intertie-api/v1/intertie/flows',
  'outages': '/public/outage-api/v1/outage/current',
  'supply-adequacy': '/public/adequacy-api/v1/adequacy',
  'ancillary-services': '/public/ancillary-api/v1/ancillary/services',
  'grid-status': '/public/grid-api/v1/grid/status'
};

interface AESOConfig {
  timeout: number;
  maxRetries: number;
  backoffDelays: number[];
  rateLimitDelay: number;
}

const getAESOConfig = (): AESOConfig => ({
  timeout: 30000,
  maxRetries: 3,
  backoffDelays: [1000, 2000, 4000],
  rateLimitDelay: 1000 // Increased to 1 second per AESO guidelines
});

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

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
  Object.entries(params).forEach(([key, value]) => url.searchParams.append(key, value));

  // Get AESO subscription key - only use AESO_SUB_KEY as per official documentation
  const aesoSubKey = Deno.env.get('AESO_SUB_KEY');

  console.log('🔍 AESO API Gateway Environment Check:');
  console.log('AESO_SUB_KEY present:', !!aesoSubKey);

  if (!aesoSubKey) {
    throw new Error('MISSING_AESO_SUB_KEY');
  }

  const maskedKey = `${aesoSubKey.substring(0, 8)}...${aesoSubKey.substring(aesoSubKey.length - 4)}`;

  // Headers according to AESO API Gateway documentation - ONLY use Ocp-Apim-Subscription-Key
  const headers = {
    'Ocp-Apim-Subscription-Key': aesoSubKey,
    'Accept': 'application/json',
    'User-Agent': 'VoltScout-AESO-Client/1.0',
    'Content-Type': 'application/json',
    'Cache-Control': 'no-cache'
  };

  console.log(`🌐 AESO API Gateway Request: ${endpoint}`);
  console.log(`📋 URL: ${url.toString()}`);
  console.log(`🔑 Using subscription key: ${maskedKey}`);
  console.log(`📤 Headers:`, Object.keys(headers));

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), config.timeout);

    console.log(`🚀 Making fetch request to AESO API Gateway: ${url.toString()}`);
    
    const response = await fetch(url.toString(), {
      method: 'GET',
      headers,
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    console.log(`📊 AESO API Gateway Response: ${response.status} ${response.statusText} for ${endpoint}`);
    console.log(`📋 Response headers:`, Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ AESO API Gateway HTTP error ${response.status}:`, errorText);

      // Enhanced error handling for AESO API Gateway specific errors
      let errorDetails = errorText;
      try {
        const errorJson = JSON.parse(errorText);
        errorDetails = errorJson.message || errorJson.error || errorJson.detail || errorText;
      } catch (e) {
        // Keep original error text if not JSON
      }

      if (response.status === 401) {
        throw new Error('INVALID_SUBSCRIPTION_KEY');
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
      throw new Error(`AESO_HTTP_ERROR_${response.status}: ${errorDetails}`);
    }

    const contentType = response.headers.get('content-type');
    console.log(`📋 Content-Type: ${contentType}`);

    let data;
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      const textData = await response.text();
      console.log(`📋 Raw response data: ${textData.substring(0, 200)}...`);
      // Try to parse as JSON anyway
      try {
        data = JSON.parse(textData);
      } catch (e) {
        console.warn('Response is not valid JSON, treating as text');
        data = { raw_data: textData };
      }
    }

    console.log(`✅ Successfully received LIVE AESO data for ${endpoint}:`, Array.isArray(data) ? `${data.length} records` : 'single record');
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
    if (['INVALID_SUBSCRIPTION_KEY', 'ACCESS_FORBIDDEN', 'MISSING_AESO_SUB_KEY', 'ENDPOINT_NOT_FOUND'].includes(errorMessage)) {
      throw error;
    }
    
    if (retryCount < config.maxRetries) {
      const delay = config.backoffDelays[retryCount] || 5000;
      console.log(`🔄 Retrying ${endpoint} in ${delay}ms...`);
      await sleep(delay);
      return callAESO(endpoint, params, config, retryCount + 1);
    }
    
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

    case 'system-margins':
      return {
        operating_reserve: 650 + Math.round(timeVariation * 100),
        contingency_reserve: 450 + Math.round(timeVariation * 50),
        regulation_up: 75 + Math.round(timeVariation * 20),
        regulation_down: 75 + Math.round(timeVariation * 20),
        timestamp: new Date().toISOString()
      };

    case 'intertie-flows':
      return {
        bc_flow_mw: 200 + Math.round(timeVariation * 100),
        saskatchewan_flow_mw: -150 + Math.round(timeVariation * 80),
        montana_flow_mw: 50 + Math.round(timeVariation * 30),
        total_import_mw: 100 + Math.round(timeVariation * 150),
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

    // Legacy support for existing actions - convert to new endpoint format
    if (action === 'fetch_current_prices') {
      targetEndpoint = 'pool-price';
      // Add proper date parameters as required by AESO API Gateway
      const today = new Date().toISOString().split('T')[0];
      params.startDate = params.startDate || today;
      params.endDate = params.endDate || params.startDate;
    } else if (action === 'fetch_load_forecast') {
      targetEndpoint = 'load-forecast';
    } else if (action === 'fetch_generation_mix') {
      targetEndpoint = 'generation';
    }

    // Rate limiting per AESO API Gateway requirements
    await sleep(config.rateLimitDelay);

    console.log(`🎯 Attempting to call AESO API Gateway endpoint: ${targetEndpoint} with params:`, params);

    try {
      const response = await callAESO(targetEndpoint, params, config);
      result = response.data;
      dataSource = 'aeso_api';
      console.log(`✅ AESO API Gateway call successful for ${targetEndpoint} - LIVE DATA RETRIEVED!`);
      console.log(`📊 Data source confirmed: ${dataSource}`);
      
      // Process pool price data for legacy compatibility
      if (targetEndpoint === 'pool-price' && Array.isArray(result) && result.length > 0) {
        const latest = result[result.length - 1];
        const price = parseFloat(latest.pool_price || latest.price || 0);
        const allPrices = result.map(p => parseFloat(p.pool_price || p.price || 0)).filter(p => !isNaN(p));

        if (price > 0) {
          result = {
            current_price: price,
            average_price: allPrices.reduce((sum, p) => sum + p, 0) / allPrices.length,
            peak_price: Math.max(...allPrices),
            off_peak_price: Math.min(...allPrices),
            timestamp: latest.begin_datetime_mpt || latest.timestamp || new Date().toISOString(),
            cents_per_kwh: price / 10,
            market_conditions: price > 60 ? 'high_demand' : 'normal'
          };
          console.log(`💰 Processed LIVE pool price data: $${price}/MWh from AESO API Gateway`);
        }
      }
      
    } catch (error) {
      console.error(`🚨 AESO API Gateway Error for ${targetEndpoint}:`, error.message);
      result = generateFallbackData(targetEndpoint, params);
      
      errorMessage = error.message === 'INVALID_SUBSCRIPTION_KEY' 
        ? 'AESO subscription key is invalid or expired - please check your AESO_SUB_KEY in Supabase secrets'
        : error.message === 'MISSING_AESO_SUB_KEY'
        ? 'AESO subscription key is missing - please configure AESO_SUB_KEY in Supabase secrets'
        : error.message === 'RATE_LIMIT_EXCEEDED'
        ? 'AESO API Gateway rate limit exceeded - please try again later'
        : error.message === 'ENDPOINT_NOT_FOUND'
        ? `AESO API Gateway endpoint not found (${targetEndpoint}) - endpoint may not be available`
        : `AESO API Gateway temporarily unavailable (${targetEndpoint}) – showing simulated data due to transient network issue: ${error.message}`;
      
      console.log(`🔄 Falling back to simulated data for ${targetEndpoint} due to transient issue`);
      console.log(`📊 Fallback data source: ${dataSource}`);
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
      error: 'AESO API Gateway service temporarily unavailable – showing emergency fallback data due to system error',
      timestamp: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200
    });
  }
});

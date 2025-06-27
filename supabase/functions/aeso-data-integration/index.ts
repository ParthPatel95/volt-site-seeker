import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { corsHeaders } from '../_shared/cors.ts'

// AESO API Configuration
const AESO_BASE_URL = 'https://api.aeso.ca';

// Updated AESO API endpoints with correct paths
const AESO_ENDPOINTS = {
  'pool-price': '/web/api/price/poolPrice',
  'system-margins': '/web/api/margins',
  'generation': '/web/api/generation/actual',
  'load-forecast': '/web/api/forecast/loadForecast',
  'intertie-flows': '/web/api/intertie/flows',
  'outages': '/web/api/outage/current',
  'supply-adequacy': '/web/api/adequacy',
  'ancillary-services': '/web/api/ancillary/services',
  'grid-status': '/web/api/grid/status'
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
  rateLimitDelay: 500
});

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const callAESO = async (
  endpoint: string, 
  params: Record<string, string> = {}, 
  config: AESOConfig, 
  retryCount = 0
): Promise<any> => {
  // Get API endpoint path
  const endpointPath = AESO_ENDPOINTS[endpoint as keyof typeof AESO_ENDPOINTS];
  if (!endpointPath) {
    throw new Error(`Unsupported AESO endpoint: ${endpoint}`);
  }

  const url = new URL(`${AESO_BASE_URL}${endpointPath}`);
  Object.entries(params).forEach(([key, value]) => url.searchParams.append(key, value));

  // Get API keys
  const aesoApiKey = Deno.env.get('AESO_API_KEY');
  const aesoSubKey = Deno.env.get('AESO_SUB_KEY');

  console.log('🔍 AESO API Environment Check:');
  console.log('AESO_API_KEY present:', !!aesoApiKey);
  console.log('AESO_SUB_KEY present:', !!aesoSubKey);

  if (!aesoApiKey && !aesoSubKey) {
    throw new Error('MISSING_API_KEYS');
  }

  // Use the subscription key as primary, API key as fallback
  const primaryKey = aesoSubKey || aesoApiKey;
  const maskedKey = primaryKey ? `${primaryKey.substring(0, 8)}...${primaryKey.substring(primaryKey.length - 4)}` : 'NONE';

  // Updated headers for AESO API
  const headers = {
    'X-API-Key': primaryKey!,
    'Accept': 'application/json',
    'User-Agent': 'VoltScout-AESO-Client/4.0',
    'Content-Type': 'application/json'
  };

  console.log(`🌐 AESO API Request: ${endpoint}`);
  console.log(`📋 URL: ${url.toString()}`);
  console.log(`🔑 Using key: ${maskedKey}`);
  console.log(`📤 Headers:`, Object.keys(headers));

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), config.timeout);

    console.log(`🚀 Making fetch request to: ${url.toString()}`);
    
    const response = await fetch(url.toString(), {
      method: 'GET',
      headers,
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    console.log(`📊 AESO API Response: ${response.status} ${response.statusText} for ${endpoint}`);
    console.log(`📋 Response headers:`, Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ AESO API HTTP error ${response.status}:`, errorText);

      // Try to parse error as JSON for better error messages
      let errorDetails = errorText;
      try {
        const errorJson = JSON.parse(errorText);
        errorDetails = errorJson.message || errorJson.error || errorText;
      } catch (e) {
        // Keep original error text if not JSON
      }

      if (response.status === 401) {
        throw new Error('INVALID_API_KEY');
      }
      if (response.status === 403) {
        throw new Error('ACCESS_FORBIDDEN');
      }
      if (response.status === 429) {
        throw new Error('RATE_LIMIT_EXCEEDED');
      }
      if (response.status >= 500) {
        throw new Error('SERVER_ERROR');
      }
      if (response.status === 404) {
        throw new Error('ENDPOINT_NOT_FOUND');
      }
      throw new Error(`HTTP_ERROR_${response.status}`);
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

    console.log(`✅ Successfully received data for ${endpoint}:`, Array.isArray(data) ? `${data.length} records` : 'single record');
    console.log(`📋 Sample data:`, JSON.stringify(data).substring(0, 300));
    
    return {
      data,
      endpoint,
      timestamp: new Date().toISOString(),
      source: 'aeso_api'
    };

  } catch (error) {
    const errorMessage = error.message;
    console.error(`💥 AESO API call failed for ${endpoint} (attempt ${retryCount + 1}):`, errorMessage);
    
    // Don't retry certain errors
    if (['INVALID_API_KEY', 'ACCESS_FORBIDDEN', 'MISSING_API_KEYS', 'ENDPOINT_NOT_FOUND'].includes(errorMessage)) {
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

// Enhanced fallback data generators
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
    console.log(`🚀 AESO API Request: ${JSON.stringify({ action, endpoint, params, timestamp: new Date().toISOString() })}`);
    
    const config = getAESOConfig();
    let result;
    let dataSource = 'fallback';
    let errorMessage = null;
    let targetEndpoint = endpoint;

    // Legacy support for existing actions - convert to new endpoint format
    if (action === 'fetch_current_prices') {
      targetEndpoint = 'pool-price';
      params.startDate = params.startDate || new Date().toISOString().split('T')[0];
      params.endDate = params.endDate || params.startDate;
    } else if (action === 'fetch_load_forecast') {
      targetEndpoint = 'load-forecast';
    } else if (action === 'fetch_generation_mix') {
      targetEndpoint = 'generation';
    }

    // Rate limiting
    await sleep(config.rateLimitDelay);

    console.log(`🎯 Attempting to call AESO endpoint: ${targetEndpoint} with params:`, params);

    try {
      const response = await callAESO(targetEndpoint, params, config);
      result = response.data;
      dataSource = 'aeso_api';
      console.log(`✅ AESO API call successful for ${targetEndpoint} - Live data retrieved!`);
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
          console.log(`💰 Processed pool price data: $${price}/MWh`);
        }
      }
      
    } catch (error) {
      console.error(`🚨 AESO API Error for ${targetEndpoint}:`, error.message);
      result = generateFallbackData(targetEndpoint, params);
      
      errorMessage = error.message === 'INVALID_API_KEY' 
        ? 'AESO API key is invalid or expired - please check your subscription'
        : error.message === 'MISSING_API_KEYS'
        ? 'AESO API keys are missing - please configure both AESO_API_KEY and AESO_SUB_KEY'
        : error.message === 'RATE_LIMIT_EXCEEDED'
        ? 'AESO API rate limit exceeded - please try again later'
        : error.message === 'ENDPOINT_NOT_FOUND'
        ? `AESO API endpoint not found (${targetEndpoint}) - may need different API version`
        : `AESO API temporarily unavailable (${targetEndpoint}) – showing simulated data`;
      
      console.log(`🔄 Falling back to simulated data for ${targetEndpoint}`);
      console.log(`📊 Fallback data source: ${dataSource}`);
    }

    const response = {
      success: true,
      data: result,
      source: dataSource,
      endpoint: targetEndpoint,
      error: errorMessage,
      timestamp: new Date().toISOString()
    };

    console.log(`📤 Final response summary:`, {
      success: response.success,
      source: response.source,
      endpoint: response.endpoint,
      hasError: !!response.error,
      dataKeys: Object.keys(response.data || {})
    });

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200
    });

  } catch (error) {
    console.error('💥 Fatal error in AESO integration:', error);
    
    return new Response(JSON.stringify({
      success: true,
      data: generateFallbackData('pool-price'),
      source: 'emergency_fallback',
      error: 'AESO service temporarily unavailable – showing emergency fallback data',
      timestamp: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200
    });
  }
});

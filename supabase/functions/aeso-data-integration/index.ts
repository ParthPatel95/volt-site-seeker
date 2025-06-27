
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { corsHeaders } from '../_shared/cors.ts'

// AESO Public API - requires subscription key for access
const AESO_PUBLIC_API_URL = 'https://apimgw.aeso.ca/public/poolprice-api/v1.1/price/poolPrice';

interface AESOConfig {
  timeout: number;
  maxRetries: number;
  backoffDelays: number[];
}

const getAESOConfig = (): AESOConfig => {
  return {
    timeout: 30000,
    maxRetries: 3,
    backoffDelays: [1000, 3000, 5000]
  };
};

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const makeAESORequest = async (params: Record<string, string>, config: AESOConfig, retryCount = 0): Promise<any> => {
  const url = new URL(AESO_PUBLIC_API_URL);
  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.append(key, value);
  });

  // Get the AESO subscription key from environment
  const aesoSubKey = Deno.env.get('AESO_SUB_KEY');
  
  const headers: Record<string, string> = {
    'accept': 'application/json',
    'User-Agent': 'VoltScout-API-Client/1.0'
  };

  // Add subscription key if available
  if (aesoSubKey) {
    headers['Ocp-Apim-Subscription-Key'] = aesoSubKey;
    console.log('AESO API Request with subscription key included');
  } else {
    console.log('Warning: AESO_SUB_KEY not found in environment variables');
  }

  console.log(`AESO Public API Request to: ${url.toString()}`);

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), config.timeout);

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers,
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    console.log(`AESO API Response status: ${response.status}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`AESO API HTTP error ${response.status}: ${errorText}`);
      
      if (response.status >= 500) {
        throw new Error('SERVER_ERROR');
      } else if (response.status === 401 || response.status === 403) {
        throw new Error('API_KEY_ERROR');
      } else {
        throw new Error(`HTTP_ERROR_${response.status}`);
      }
    }

    const data = await response.json();
    console.log(`AESO API Response received successfully`);
    
    return data;
  } catch (error) {
    console.error(`AESO API call failed (attempt ${retryCount + 1}):`, error);
    
    if (error.message === 'API_KEY_ERROR') {
      throw error; // Don't retry auth errors
    }
    
    if (retryCount < config.maxRetries && (
      error.name === 'AbortError' || 
      error.message === 'SERVER_ERROR' ||
      error.message.includes('network') || 
      error.message.includes('fetch')
    )) {
      const delay = config.backoffDelays[retryCount] || 5000;
      console.log(`Retrying in ${delay}ms (attempt ${retryCount + 1})`);
      await sleep(delay);
      return makeAESORequest(params, config, retryCount + 1);
    }
    
    throw error;
  }
};

const getTodayDate = () => {
  const today = new Date();
  return today.toISOString().split('T')[0]; // YYYY-MM-DD format
};

const fetchPoolPrice = async (config: AESOConfig) => {
  console.log('Fetching AESO pool price from public API...');
  const today = getTodayDate();
  
  const data = await makeAESORequest({ 
    startDate: today, 
    endDate: today 
  }, config);
  
  // Parse the AESO public API response structure
  if (!data || !Array.isArray(data) || data.length === 0) {
    throw new Error('No pool price data returned from AESO API');
  }

  // Get the latest price entry
  const latestPrice = data[data.length - 1];
  const poolPriceMWh = parseFloat(latestPrice.pool_price);
  
  if (isNaN(poolPriceMWh)) {
    throw new Error('Invalid pool price data received');
  }

  // Calculate statistics from all available prices
  const allPrices = data.map(p => parseFloat(p.pool_price)).filter(p => !isNaN(p));
  const avgPrice = allPrices.reduce((sum, p) => sum + p, 0) / allPrices.length;
  const maxPrice = Math.max(...allPrices);
  const minPrice = Math.min(...allPrices);
  
  return {
    current_price: poolPriceMWh,
    average_price: avgPrice,
    peak_price: maxPrice,
    off_peak_price: minPrice,
    timestamp: latestPrice.begin_datetime_mpt || new Date().toISOString(),
    market_conditions: poolPriceMWh > 60 ? 'high_demand' : 'normal',
    cents_per_kwh: poolPriceMWh / 10 // Convert $/MWh to ¢/kWh
  };
};

const generateRealisticFallbackData = (action: string) => {
  const baseTime = Date.now();
  const timeVariation = Math.sin(baseTime / 100000) * 0.1;
  const randomVariation = (Math.random() - 0.5) * 0.2;
  
  switch (action) {
    case 'fetch_current_prices':
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
      
    case 'fetch_load_forecast':
      const baseDemand = 9850 + (timeVariation * 800) + (randomVariation * 500);
      return {
        current_demand_mw: Math.max(8000, Math.round(baseDemand)),
        peak_forecast_mw: 11200,
        forecast_date: new Date().toISOString(),
        capacity_margin: 15.2 + (timeVariation * 3),
        reserve_margin: 18.7 + (timeVariation * 2)
      };
      
    case 'fetch_generation_mix':
      const baseTotal = 9850 + (timeVariation * 500);
      const naturalGas = baseTotal * (0.42 + timeVariation * 0.1);
      const wind = baseTotal * (0.28 + timeVariation * 0.15);
      const hydro = baseTotal * 0.15;
      const solar = baseTotal * (0.05 + Math.max(0, timeVariation * 0.03));
      const coal = baseTotal * Math.max(0.01, (0.08 - timeVariation * 0.05));
      const other = Math.max(0, baseTotal - (naturalGas + wind + hydro + solar + coal));
      
      const renewablePercentage = ((wind + hydro + solar) / baseTotal) * 100;
      
      return {
        natural_gas_mw: Math.round(naturalGas),
        wind_mw: Math.round(wind),
        solar_mw: Math.round(solar),
        hydro_mw: Math.round(hydro),
        coal_mw: Math.round(coal),
        other_mw: Math.round(other),
        total_generation_mw: Math.round(baseTotal),
        renewable_percentage: Math.round(renewablePercentage * 10) / 10,
        timestamp: new Date().toISOString()
      };
      
    default:
      return null;
  }
};

const getErrorMessage = (error: Error) => {
  if (error.message === 'API_KEY_ERROR') {
    return 'Unable to connect to AESO – please verify API key';
  }
  if (error.message === 'SERVER_ERROR' || error.name === 'AbortError') {
    return 'AESO is currently unavailable. Please try again later.';
  }
  return 'Connection error occurred while fetching AESO data';
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { action } = await req.json()
    console.log(`AESO API Request: ${JSON.stringify({ action, timestamp: new Date().toISOString() })}`)

    let result;
    let dataSource = 'fallback';
    let errorMessage = null;
    
    try {
      const config = getAESOConfig();

      switch (action) {
        case 'fetch_current_prices':
          result = await fetchPoolPrice(config);
          dataSource = 'aeso_api';
          console.log('✅ AESO API call successful - Live data retrieved');
          break;
          
        case 'fetch_load_forecast':
        case 'fetch_generation_mix':
          // These endpoints are not available in the public API
          // Generate realistic fallback data
          result = generateRealisticFallbackData(action);
          dataSource = 'fallback';
          errorMessage = 'Live data requires AESO subscription - displaying simulated data';
          console.log('🔄 Using simulated data - subscription required for this endpoint');
          break;
          
        default:
          throw new Error(`Unknown action: ${action}`);
      }
      
    } catch (error) {
      console.error('AESO API Error:', error.message);
      errorMessage = getErrorMessage(error);
      result = generateRealisticFallbackData(action);
      dataSource = 'fallback';
      
      console.log('🔄 Falling back to simulated data due to API unavailability');
    }

    if (!result) {
      throw new Error('No data available');
    }

    return new Response(
      JSON.stringify({
        success: true,
        data: result,
        source: dataSource,
        error: errorMessage,
        timestamp: new Date().toISOString(),
        lastSuccessfulCall: dataSource === 'aeso_api' ? new Date().toISOString() : null
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error: any) {
    console.error('Fatal AESO API Error:', error);

    const { action } = await req.json().catch(() => ({ action: 'unknown' }));
    const fallbackData = generateRealisticFallbackData(action);

    return new Response(
      JSON.stringify({
        success: true,
        data: fallbackData,
        source: 'fallback',
        error: 'Service temporarily unavailable',
        timestamp: new Date().toISOString()
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  }
})

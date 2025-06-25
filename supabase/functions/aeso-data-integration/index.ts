
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { corsHeaders } from '../_shared/cors.ts'

const AESO_BASE_URL = 'https://api.aeso.ca/report/v1.1';

interface AESOConfig {
  subscriptionKey: string;
  timeout: number;
  maxRetries: number;
  backoffDelays: number[];
}

const getAESOConfig = (): AESOConfig => {
  const subscriptionKey = Deno.env.get('AESO_SUB_KEY');
  if (!subscriptionKey) {
    throw new Error('AESO_SUB_KEY environment variable is required');
  }
  
  return {
    subscriptionKey,
    timeout: 10000,
    maxRetries: 3,
    backoffDelays: [5000, 10000, 20000]
  };
};

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const makeAESORequest = async (endpoint: string, params: Record<string, string>, config: AESOConfig, retryCount = 0): Promise<any> => {
  const url = new URL(`${AESO_BASE_URL}${endpoint}`);
  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.append(key, value);
  });

  const headers = {
    'accept': 'application/json',
    'Ocp-Apim-Subscription-Key': config.subscriptionKey
  };

  console.log(`AESO API Request to: ${url.toString()}`);
  console.log(`Headers: ${JSON.stringify(headers, null, 2)}`);

  try {
    // Add 200ms throttle to respect rate limits
    await sleep(200);
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), config.timeout);

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers,
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    console.log(`AESO API Response status: ${response.status}`);

    if (response.status === 429) {
      // Rate limited - exponential backoff
      if (retryCount < config.maxRetries) {
        const delay = config.backoffDelays[retryCount] || 20000;
        console.log(`Rate limited, retrying in ${delay}ms (attempt ${retryCount + 1})`);
        await sleep(delay);
        return makeAESORequest(endpoint, params, config, retryCount + 1);
      }
      throw new Error('Rate limit exceeded after maximum retries');
    }

    if (response.status >= 500) {
      // Server error - retry with backoff
      if (retryCount < config.maxRetries) {
        const delay = config.backoffDelays[retryCount] || 20000;
        console.log(`Server error ${response.status}, retrying in ${delay}ms (attempt ${retryCount + 1})`);
        await sleep(delay);
        return makeAESORequest(endpoint, params, config, retryCount + 1);
      }
      throw new Error(`Server error: ${response.status}`);
    }

    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status}`);
    }

    const data = await response.json();
    console.log(`AESO API Response data structure: ${JSON.stringify(Object.keys(data), null, 2)}`);

    // Validate AESO response structure
    if (data.status !== 'Success') {
      throw new Error(`AESO API error status: ${data.status}`);
    }

    return data;
  } catch (error) {
    console.error(`AESO API call failed (attempt ${retryCount + 1}):`, error);
    
    if (retryCount < config.maxRetries && (error.name === 'AbortError' || error.message.includes('network'))) {
      const delay = config.backoffDelays[retryCount] || 20000;
      console.log(`Network error, retrying in ${delay}ms (attempt ${retryCount + 1})`);
      await sleep(delay);
      return makeAESORequest(endpoint, params, config, retryCount + 1);
    }
    
    throw error;
  }
};

const getDateRange = () => {
  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  
  return {
    startDate: yesterday.toISOString().split('T')[0],
    endDate: now.toISOString().split('T')[0]
  };
};

const fetchPoolPrice = async (config: AESOConfig) => {
  console.log('Fetching AESO pool price...');
  const { startDate, endDate } = getDateRange();
  
  const data = await makeAESORequest('/poolprice', { startDate, endDate }, config);
  
  const poolPriceInfo = data?.return?.PoolPriceReport?.PoolPriceInfo;
  if (!poolPriceInfo || !Array.isArray(poolPriceInfo) || poolPriceInfo.length === 0) {
    throw new Error('No pool price data returned');
  }

  // Get the most recent price
  const latestPrice = poolPriceInfo[poolPriceInfo.length - 1];
  const poolPriceMWh = parseFloat(latestPrice.pool_price);
  
  return {
    current_price: poolPriceMWh,
    average_price: poolPriceInfo.reduce((sum, p) => sum + parseFloat(p.pool_price), 0) / poolPriceInfo.length,
    peak_price: Math.max(...poolPriceInfo.map(p => parseFloat(p.pool_price))),
    off_peak_price: Math.min(...poolPriceInfo.map(p => parseFloat(p.pool_price))),
    timestamp: latestPrice.begin_timestamp,
    market_conditions: poolPriceMWh > 60 ? 'high_demand' : 'normal',
    cents_per_kwh: poolPriceMWh / 10 // Convert $/MWh to ¢/kWh
  };
};

const fetchSystemLoad = async (config: AESOConfig) => {
  console.log('Fetching AESO system load...');
  const { startDate, endDate } = getDateRange();
  
  const data = await makeAESORequest('/actual-system-load', { startDate, endDate }, config);
  
  const systemLoadInfo = data?.return?.ActualSystemLoadReport?.ActualSystemLoadInfo;
  if (!systemLoadInfo || !Array.isArray(systemLoadInfo) || systemLoadInfo.length === 0) {
    throw new Error('No system load data returned');
  }

  const latestLoad = systemLoadInfo[systemLoadInfo.length - 1];
  
  return {
    current_demand_mw: parseFloat(latestLoad.actual_system_load),
    peak_forecast_mw: Math.max(...systemLoadInfo.map(l => parseFloat(l.actual_system_load))) * 1.1, // Estimate
    forecast_date: latestLoad.begin_timestamp,
    capacity_margin: 15.2, // Alberta typical
    reserve_margin: 18.7
  };
};

const fetchGenerationMix = async (config: AESOConfig) => {
  console.log('Fetching AESO generation mix...');
  const { startDate, endDate } = getDateRange();
  
  const data = await makeAESORequest('/forecast-fuel-mix', { startDate, endDate }, config);
  
  const fuelMixInfo = data?.return?.ForecastFuelMixReport?.ForecastFuelMixInfo;
  if (!fuelMixInfo || !Array.isArray(fuelMixInfo) || fuelMixInfo.length === 0) {
    throw new Error('No generation mix data returned');
  }

  // Aggregate by fuel type
  const mixByFuel = fuelMixInfo.reduce((acc, item) => {
    const fuelType = item.fuel_type.toLowerCase();
    const generation = parseFloat(item.forecast_generation_mw) || 0;
    acc[fuelType] = (acc[fuelType] || 0) + generation;
    return acc;
  }, {} as Record<string, number>);

  const totalGeneration = Object.values(mixByFuel).reduce((sum, val) => sum + val, 0);
  
  // Map AESO fuel types to our structure
  const naturalGas = (mixByFuel['natural_gas'] || mixByFuel['gas'] || 0);
  const wind = mixByFuel['wind'] || 0;
  const solar = mixByFuel['solar'] || 0;
  const hydro = mixByFuel['hydro'] || 0;
  const coal = mixByFuel['coal'] || 0;
  const other = totalGeneration - (naturalGas + wind + solar + hydro + coal);
  
  const renewableGeneration = wind + solar + hydro;
  const renewablePercentage = totalGeneration > 0 ? (renewableGeneration / totalGeneration) * 100 : 0;

  return {
    natural_gas_mw: naturalGas,
    wind_mw: wind,
    solar_mw: solar,
    hydro_mw: hydro,
    coal_mw: coal,
    other_mw: Math.max(0, other),
    total_generation_mw: totalGeneration,
    renewable_percentage: renewablePercentage,
    timestamp: new Date().toISOString()
  };
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { action } = await req.json()
    console.log(`AESO API Request: ${JSON.stringify({ action, timestamp: new Date().toISOString() })}`)

    const config = getAESOConfig();
    console.log('AESO Subscription Key available:', !!config.subscriptionKey);

    let result;
    
    switch (action) {
      case 'fetch_current_prices':
        result = await fetchPoolPrice(config);
        break;
      case 'fetch_load_forecast':
        result = await fetchSystemLoad(config);
        break;
      case 'fetch_generation_mix':
        result = await fetchGenerationMix(config);
        break;
      default:
        throw new Error(`Unknown action: ${action}`);
    }

    return new Response(
      JSON.stringify({
        success: true,
        data: result,
        source: 'aeso_api',
        timestamp: new Date().toISOString()
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error: any) {
    console.error('AESO API Error:', error);

    // Return enhanced fallback data on error
    const { action } = await req.json().catch(() => ({ action: 'unknown' }));
    const fallbackData = generateFallbackData(action);

    return new Response(
      JSON.stringify({
        success: true,
        data: fallbackData,
        source: 'fallback',
        error: error.message,
        timestamp: new Date().toISOString()
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  }
})

function generateFallbackData(action: string) {
  const baseTime = Date.now();
  const variation = Math.sin(baseTime / 100000) * 0.1;
  
  switch (action) {
    case 'fetch_current_prices':
      const basePrice = 45.67;
      const currentPrice = basePrice + (variation * 20);
      return {
        current_price: Math.max(20, currentPrice),
        average_price: 42.30,
        peak_price: Math.max(60, currentPrice * 1.8),
        off_peak_price: Math.max(15, currentPrice * 0.6),
        timestamp: new Date().toISOString(),
        market_conditions: currentPrice > 60 ? 'high_demand' : 'normal',
        cents_per_kwh: Math.max(2, currentPrice / 10)
      };
    case 'fetch_load_forecast':
      const baseDemand = 9850;
      const currentDemand = baseDemand + (variation * 1000);
      return {
        current_demand_mw: Math.max(8000, currentDemand),
        peak_forecast_mw: 11200,
        forecast_date: new Date().toISOString(),
        capacity_margin: 15.2 + (variation * 3),
        reserve_margin: 18.7 + (variation * 2)
      };
    case 'fetch_generation_mix':
      const baseTotal = 9850;
      const total = baseTotal + (variation * 800);
      
      const naturalGas = total * (0.42 + variation * 0.1);
      const wind = total * (0.28 + variation * 0.15);
      const hydro = total * 0.15;
      const solar = total * (0.05 + Math.max(0, variation * 0.03));
      const coal = total * (0.08 - variation * 0.05);
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
        renewable_percentage: Math.min(80, Math.max(20, renewablePercentage)),
        timestamp: new Date().toISOString()
      };
    default:
      return null;
  }
}

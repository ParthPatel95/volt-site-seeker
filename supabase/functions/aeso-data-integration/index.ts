
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
    console.log('AESO API Request:', { action });

    const aesoApiKey = Deno.env.get('AESO_API_KEY');
    
    let data;
    
    switch (action) {
      case 'fetch_current_prices':
        data = await fetchCurrentPrices(aesoApiKey);
        break;
      case 'fetch_load_forecast':
        data = await fetchLoadForecast(aesoApiKey);
        break;
      case 'fetch_generation_mix':
        data = await fetchGenerationMix(aesoApiKey);
        break;
      case 'fetch_system_marginal_price':
        data = await fetchSystemMarginalPrice(aesoApiKey);
        break;
      case 'fetch_operating_reserve':
        data = await fetchOperatingReserve(aesoApiKey);
        break;
      case 'fetch_interchange':
        data = await fetchInterchange(aesoApiKey);
        break;
      case 'fetch_transmission_constraints':
        data = await fetchTransmissionConstraints(aesoApiKey);
        break;
      case 'fetch_energy_storage':
        data = await fetchEnergyStorage(aesoApiKey);
        break;
      default:
        throw new Error('Invalid action');
    }

    return new Response(
      JSON.stringify({
        success: true,
        data,
        source: aesoApiKey ? 'aeso_api' : 'fallback',
        timestamp: new Date().toISOString()
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );

  } catch (error) {
    console.error('AESO API error:', error);
    
    // Return fallback data for demo purposes
    const fallbackData = getFallbackData(await req.json().then(body => body.action).catch(() => 'fetch_current_prices'));
    
    return new Response(
      JSON.stringify({
        success: true,
        data: fallbackData,
        source: 'fallback',
        timestamp: new Date().toISOString(),
        note: 'Using fallback data - check AESO API key configuration'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );
  }
});

async function fetchCurrentPrices(apiKey: string | undefined) {
  console.log('Fetching AESO current prices...');
  
  if (!apiKey) {
    throw new Error('AESO API key not configured');
  }
  
  // AESO System Marginal Price API
  const url = 'https://api.aeso.ca/report/v1.1/price/systemMarginalPrice';
  
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'X-API-Key': apiKey,
        'User-Agent': 'VoltScout-Dashboard/1.0'
      }
    });

    if (!response.ok) {
      throw new Error(`AESO API responded with status: ${response.status}`);
    }

    const data = await response.json();
    console.log('AESO pricing response received');
    
    return parseAESOPricingData(data);
    
  } catch (error) {
    console.error('Error fetching AESO prices:', error);
    throw error;
  }
}

async function fetchLoadForecast(apiKey: string | undefined) {
  console.log('Fetching AESO load forecast...');
  
  if (!apiKey) {
    throw new Error('AESO API key not configured');
  }
  
  const url = 'https://api.aeso.ca/report/v1.1/load/albertaInternalLoad';
  
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'X-API-Key': apiKey,
        'User-Agent': 'VoltScout-Dashboard/1.0'
      }
    });

    if (!response.ok) {
      throw new Error(`AESO Load API responded with status: ${response.status}`);
    }

    const data = await response.json();
    return parseAESOLoadData(data);
    
  } catch (error) {
    console.error('Error fetching AESO load data:', error);
    throw error;
  }
}

async function fetchGenerationMix(apiKey: string | undefined) {
  console.log('Fetching AESO generation mix...');
  
  if (!apiKey) {
    throw new Error('AESO API key not configured');
  }
  
  const url = 'https://api.aeso.ca/report/v1.1/generation/currentSupplyDemand';
  
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'X-API-Key': apiKey,
        'User-Agent': 'VoltScout-Dashboard/1.0'
      }
    });

    if (!response.ok) {
      throw new Error(`AESO Generation API responded with status: ${response.status}`);
    }

    const data = await response.json();
    return parseAESOGenerationData(data);
    
  } catch (error) {
    console.error('Error fetching AESO generation data:', error);
    throw error;
  }
}

async function fetchSystemMarginalPrice(apiKey: string | undefined) {
  if (!apiKey) {
    throw new Error('AESO API key not configured');
  }
  
  const url = 'https://api.aeso.ca/report/v1.1/price/systemMarginalPrice';
  
  const response = await fetch(url, {
    headers: {
      'Accept': 'application/json',
      'X-API-Key': apiKey,
    }
  });

  if (!response.ok) {
    throw new Error(`AESO SMP API responded with status: ${response.status}`);
  }

  return await response.json();
}

async function fetchOperatingReserve(apiKey: string | undefined) {
  if (!apiKey) {
    throw new Error('AESO API key not configured');
  }
  
  const url = 'https://api.aeso.ca/report/v1.1/reserve/operatingReserve';
  
  const response = await fetch(url, {
    headers: {
      'Accept': 'application/json',
      'X-API-Key': apiKey,
    }
  });

  if (!response.ok) {
    throw new Error(`AESO Operating Reserve API responded with status: ${response.status}`);
  }

  return await response.json();
}

async function fetchInterchange(apiKey: string | undefined) {
  if (!apiKey) {
    throw new Error('AESO API key not configured');
  }
  
  const url = 'https://api.aeso.ca/report/v1.1/interchange/currentInterchange';
  
  const response = await fetch(url, {
    headers: {
      'Accept': 'application/json',
      'X-API-Key': apiKey,
    }
  });

  if (!response.ok) {
    throw new Error(`AESO Interchange API responded with status: ${response.status}`);
  }

  return await response.json();
}

async function fetchTransmissionConstraints(apiKey: string | undefined) {
  if (!apiKey) {
    throw new Error('AESO API key not configured');
  }
  
  const url = 'https://api.aeso.ca/report/v1.1/transmission/constraintsAndOutages';
  
  const response = await fetch(url, {
    headers: {
      'Accept': 'application/json',
      'X-API-Key': apiKey,
    }
  });

  if (!response.ok) {
    throw new Error(`AESO Transmission API responded with status: ${response.status}`);
  }

  return await response.json();
}

async function fetchEnergyStorage(apiKey: string | undefined) {
  if (!apiKey) {
    throw new Error('AESO API key not configured');
  }
  
  const url = 'https://api.aeso.ca/report/v1.1/storage/energyStorageData';
  
  const response = await fetch(url, {
    headers: {
      'Accept': 'application/json',
      'X-API-Key': apiKey,
    }
  });

  if (!response.ok) {
    throw new Error(`AESO Energy Storage API responded with status: ${response.status}`);
  }

  return await response.json();
}

function parseAESOPricingData(data: any) {
  try {
    // Parse real AESO pricing data structure
    const latestRecord = data.return?.data?.[0] || {};
    
    return {
      current_price: latestRecord.price || 0,
      average_price: calculateAveragePrice(data.return?.data || []),
      peak_price: findPeakPrice(data.return?.data || []),
      off_peak_price: findOffPeakPrice(data.return?.data || []),
      timestamp: latestRecord.begin_datetime_mpt || new Date().toISOString(),
      market_conditions: determineMarketConditions(latestRecord.price || 0)
    };
  } catch (error) {
    console.error('Error parsing AESO pricing data:', error);
    throw error;
  }
}

function parseAESOLoadData(data: any) {
  try {
    const latestRecord = data.return?.data?.[0] || {};
    
    return {
      current_demand_mw: latestRecord.albertaInternalLoad || 0,
      peak_forecast_mw: calculatePeakForecast(data.return?.data || []),
      forecast_date: latestRecord.begin_datetime_mpt || new Date().toISOString(),
      capacity_margin: calculateCapacityMargin(latestRecord.albertaInternalLoad || 0),
      reserve_margin: calculateReserveMargin(latestRecord.albertaInternalLoad || 0)
    };
  } catch (error) {
    console.error('Error parsing AESO load data:', error);
    throw error;
  }
}

function parseAESOGenerationData(data: any) {
  try {
    const latestRecord = data.return?.data?.[0] || {};
    
    // Extract generation by source
    const naturalGas = latestRecord.gas || 0;
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
    console.error('Error parsing AESO generation data:', error);
    throw error;
  }
}

// Helper functions
function calculateAveragePrice(data: any[]): number {
  if (!data.length) return 0;
  const sum = data.reduce((acc, record) => acc + (record.price || 0), 0);
  return sum / data.length;
}

function findPeakPrice(data: any[]): number {
  if (!data.length) return 0;
  return Math.max(...data.map(record => record.price || 0));
}

function findOffPeakPrice(data: any[]): number {
  if (!data.length) return 0;
  return Math.min(...data.map(record => record.price || 0));
}

function determineMarketConditions(price: number): string {
  if (price > 100) return 'high_demand';
  if (price > 60) return 'elevated';
  return 'normal';
}

function calculatePeakForecast(data: any[]): number {
  if (!data.length) return 0;
  return Math.max(...data.map(record => record.albertaInternalLoad || 0));
}

function calculateCapacityMargin(currentLoad: number): number {
  // Estimated based on Alberta's typical capacity
  const totalCapacity = 16000; // MW approximate
  return ((totalCapacity - currentLoad) / totalCapacity) * 100;
}

function calculateReserveMargin(currentLoad: number): number {
  // Estimated reserve margin
  return calculateCapacityMargin(currentLoad) + 5;
}

function getFallbackData(action: string) {
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
        market_conditions: currentPrice > 60 ? 'high_demand' : 'normal'
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


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
    console.log('AESO API Key available:', aesoApiKey ? 'Yes' : 'No');
    
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
    const requestBody = await req.json().catch(() => ({ action: 'fetch_current_prices' }));
    const fallbackData = getFallbackData(requestBody.action);
    
    return new Response(
      JSON.stringify({
        success: true,
        data: fallbackData,
        source: 'fallback',
        timestamp: new Date().toISOString(),
        note: 'Using fallback data - AESO API error occurred'
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
    console.log('No AESO API key provided, using fallback');
    throw new Error('AESO API key not configured');
  }
  
  // AESO System Marginal Price API
  const url = 'https://api.aeso.ca/report/v1.1/price/systemMarginalPrice';
  
  try {
    console.log('Making request to:', url);
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'X-API-Key': apiKey,
        'User-Agent': 'VoltScout-Dashboard/1.0'
      }
    });

    console.log('AESO API response status:', response.status);

    if (!response.ok) {
      console.log('AESO API response not OK:', response.statusText);
      throw new Error(`AESO API responded with status: ${response.status} - ${response.statusText}`);
    }

    const data = await response.json();
    console.log('AESO pricing response received, processing...');
    
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

  const data = await response.json();
  return parseAESOPricingData(data);
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

  const data = await response.json();
  return parseOperatingReserveData(data);
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

  const data = await response.json();
  return parseInterchangeData(data);
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

  const data = await response.json();
  return parseTransmissionData(data);
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

  const data = await response.json();
  return parseEnergyStorageData(data);
}

function parseAESOPricingData(data: any) {
  try {
    // Parse real AESO pricing data structure
    const records = data.return?.data || [];
    const latestRecord = records[0] || {};
    
    return {
      price: latestRecord.price || 0,
      timestamp: latestRecord.begin_datetime_mpt || new Date().toISOString(),
      forecast_pool_price: latestRecord.forecast_pool_price || latestRecord.price || 0,
      begin_datetime_mpt: latestRecord.begin_datetime_mpt || new Date().toISOString()
    };
  } catch (error) {
    console.error('Error parsing AESO pricing data:', error);
    throw error;
  }
}

function parseAESOLoadData(data: any) {
  try {
    const records = data.return?.data || [];
    const latestRecord = records[0] || {};
    
    return {
      current_demand_mw: latestRecord.albertaInternalLoad || 0,
      peak_forecast_mw: calculatePeakForecast(records),
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
    const records = data.return?.data || [];
    const latestRecord = records[0] || {};
    
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

function parseOperatingReserveData(data: any) {
  try {
    const records = data.return?.data || [];
    const latestRecord = records[0] || {};
    
    return {
      total_reserve_mw: latestRecord.total_reserve || 0,
      spinning_reserve_mw: latestRecord.spinning_reserve || 0,
      supplemental_reserve_mw: latestRecord.supplemental_reserve || 0,
      timestamp: latestRecord.begin_datetime_mpt || new Date().toISOString()
    };
  } catch (error) {
    console.error('Error parsing operating reserve data:', error);
    throw error;
  }
}

function parseInterchangeData(data: any) {
  try {
    const records = data.return?.data || [];
    const latestRecord = records[0] || {};
    
    return {
      alberta_british_columbia: latestRecord.alberta_british_columbia || 0,
      alberta_saskatchewan: latestRecord.alberta_saskatchewan || 0,
      alberta_montana: latestRecord.alberta_montana || 0,
      total_net_interchange: latestRecord.total_net_interchange || 0,
      timestamp: latestRecord.begin_datetime_mpt || new Date().toISOString()
    };
  } catch (error) {
    console.error('Error parsing interchange data:', error);
    throw error;
  }
}

function parseTransmissionData(data: any) {
  try {
    const records = data.return?.data || [];
    
    const constraints = records.map((record: any) => ({
      constraint_name: record.constraint_name || 'Unknown',
      status: record.status || 'Active',
      limit_mw: record.limit_mw || 0,
      flow_mw: record.flow_mw || 0
    }));
    
    return {
      constraints,
      timestamp: records[0]?.begin_datetime_mpt || new Date().toISOString()
    };
  } catch (error) {
    console.error('Error parsing transmission data:', error);
    throw error;
  }
}

function parseEnergyStorageData(data: any) {
  try {
    const records = data.return?.data || [];
    const latestRecord = records[0] || {};
    
    return {
      charging_mw: latestRecord.charging_mw || 0,
      discharging_mw: latestRecord.discharging_mw || 0,
      net_storage_mw: latestRecord.net_storage_mw || 0,
      state_of_charge_percent: latestRecord.state_of_charge_percent || 0,
      timestamp: latestRecord.begin_datetime_mpt || new Date().toISOString()
    };
  } catch (error) {
    console.error('Error parsing energy storage data:', error);
    throw error;
  }
}

// Helper functions
function calculatePeakForecast(data: any[]): number {
  if (!data.length) return 0;
  return Math.max(...data.map(record => record.albertaInternalLoad || 0));
}

function calculateCapacityMargin(currentLoad: number): number {
  const totalCapacity = 16000;
  return ((totalCapacity - currentLoad) / totalCapacity) * 100;
}

function calculateReserveMargin(currentLoad: number): number {
  return calculateCapacityMargin(currentLoad) + 5;
}

function getFallbackData(action: string) {
  const baseTime = Date.now();
  const variation = Math.sin(baseTime / 100000) * 0.1;
  
  switch (action) {
    case 'fetch_current_prices':
    case 'fetch_system_marginal_price':
      const basePrice = 45.67;
      const currentPrice = basePrice + (variation * 20);
      return {
        price: Math.max(20, currentPrice),
        timestamp: new Date().toISOString(),
        forecast_pool_price: Math.max(22, currentPrice * 1.1),
        begin_datetime_mpt: new Date().toISOString()
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
    case 'fetch_operating_reserve':
      return {
        total_reserve_mw: 1200 + (variation * 100),
        spinning_reserve_mw: 800 + (variation * 50),
        supplemental_reserve_mw: 400 + (variation * 50),
        timestamp: new Date().toISOString()
      };
    case 'fetch_interchange':
      return {
        alberta_british_columbia: -150 + (variation * 50),
        alberta_saskatchewan: 75 + (variation * 25),
        alberta_montana: 25 + (variation * 15),
        total_net_interchange: -50 + (variation * 30),
        timestamp: new Date().toISOString()
      };
    case 'fetch_transmission_constraints':
      return {
        constraints: [
          {
            constraint_name: 'Calgary Area Transmission Constraint',
            status: 'Active',
            limit_mw: 500,
            flow_mw: 450 + (variation * 50)
          }
        ],
        timestamp: new Date().toISOString()
      };
    case 'fetch_energy_storage':
      return {
        charging_mw: 25 + (variation * 10),
        discharging_mw: 15 + (variation * 8),
        net_storage_mw: 10 + (variation * 5),
        state_of_charge_percent: 65 + (variation * 10),
        timestamp: new Date().toISOString()
      };
    default:
      return null;
  }
}

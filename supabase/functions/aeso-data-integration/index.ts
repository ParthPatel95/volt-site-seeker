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
    console.log('AESO API Key length:', aesoApiKey ? aesoApiKey.length : 0);
    
    if (!aesoApiKey) {
      console.log('No AESO API key found, using fallback data');
      const fallbackData = getFallbackData(action);
      return new Response(
        JSON.stringify({
          success: true,
          data: fallbackData,
          source: 'fallback',
          timestamp: new Date().toISOString(),
          note: 'AESO API key not configured - using simulated data',
          qa_status: 'fallback_mode'
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
    
    switch (action) {
      case 'fetch_current_prices':
        data = await fetchCurrentPrices(aesoApiKey);
        qaMetrics.endpoint_used = 'systemMarginalPrice';
        break;
      case 'fetch_load_forecast':
        data = await fetchLoadForecast(aesoApiKey);
        qaMetrics.endpoint_used = 'load/forecast';
        break;
      case 'fetch_generation_mix':
        data = await fetchGenerationMix(aesoApiKey);
        qaMetrics.endpoint_used = 'generation/currentSupplyDemand';
        break;
      case 'fetch_system_marginal_price':
        data = await fetchSystemMarginalPrice(aesoApiKey);
        qaMetrics.endpoint_used = 'price/systemMarginalPrice';
        break;
      case 'fetch_operating_reserve':
        data = await fetchOperatingReserve(aesoApiKey);
        qaMetrics.endpoint_used = 'reserve/operatingReserve';
        break;
      case 'fetch_interchange':
        data = await fetchInterchange(aesoApiKey);
        qaMetrics.endpoint_used = 'interchange/currentInterchange';
        break;
      case 'fetch_transmission_constraints':
        data = await fetchTransmissionConstraints(aesoApiKey);
        qaMetrics.endpoint_used = 'transmission/constraintsAndOutages';
        break;
      case 'fetch_energy_storage':
        data = await fetchEnergyStorage(aesoApiKey);
        qaMetrics.endpoint_used = 'storage/energyStorageData';
        break;
      default:
        throw new Error('Invalid action');
    }

    qaMetrics.response_time_ms = Date.now() - startTime;
    qaMetrics.validation_passed = validateAESOData(data, action);
    qaMetrics.data_quality = assessDataQuality(data, action);
    
    console.log('QA Metrics:', qaMetrics);
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

  } catch (error) {
    console.error('AESO API error:', error);
    console.error('Error stack:', error.stack);
    
    // Return fallback data for demo purposes
    const requestBody = await req.json().catch(() => ({ action: 'fetch_current_prices' }));
    const fallbackData = getFallbackData(requestBody.action);
    
    return new Response(
      JSON.stringify({
        success: true,
        data: fallbackData,
        source: 'fallback',
        timestamp: new Date().toISOString(),
        note: 'AESO API error occurred - using simulated data',
        error: error.message,
        qa_status: 'error_fallback'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );
  }
});

async function fetchCurrentPrices(apiKey: string) {
  return await fetchSystemMarginalPrice(apiKey);
}

async function fetchLoadForecast(apiKey: string) {
  console.log('Fetching AESO load forecast...');
  
  // Updated endpoint based on AESO API documentation
  const url = 'https://api.aeso.ca/report/v1.1/load/forecast';
  
  try {
    console.log('Making request to:', url);
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Ocp-Apim-Subscription-Key': apiKey,
        'User-Agent': 'VoltScout-Dashboard/1.0'
      }
    });

    console.log('AESO Load API response status:', response.status);
    console.log('Response headers received:', response.headers.get('content-type'));
    
    if (!response.ok) {
      const errorText = await response.text();
      console.log('AESO Load API error response:', errorText);
      console.log('Trying alternative endpoint...');
      
      // Try alternative endpoint if first fails
      return await fetchAlternativeLoadData(apiKey);
    }

    const data = await response.json();
    console.log('AESO load response received:', JSON.stringify(data, null, 2));
    return parseAESOLoadData(data);
    
  } catch (error) {
    console.error('Error fetching AESO load data:', error);
    // Try alternative endpoint
    return await fetchAlternativeLoadData(apiKey);
  }
}

async function fetchAlternativeLoadData(apiKey: string) {
  console.log('Trying alternative load endpoint...');
  const url = 'https://api.aeso.ca/report/v1.1/load/albertaInternalLoad';
  
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Ocp-Apim-Subscription-Key': apiKey,
        'User-Agent': 'VoltScout-Dashboard/1.0'
      }
    });

    if (!response.ok) {
      throw new Error(`Alternative load API responded with status: ${response.status}`);
    }

    const data = await response.json();
    return parseAESOLoadData(data);
    
  } catch (error) {
    console.error('Alternative load endpoint also failed:', error);
    throw error;
  }
}

async function fetchGenerationMix(apiKey: string) {
  console.log('Fetching AESO generation mix...');
  
  const url = 'https://api.aeso.ca/report/v1.1/generation/currentSupplyDemand';
  
  try {
    console.log('Making request to:', url);
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Ocp-Apim-Subscription-Key': apiKey,
        'User-Agent': 'VoltScout-Dashboard/1.0'
      }
    });

    console.log('AESO Generation API response status:', response.status);
    console.log('Response content-type:', response.headers.get('content-type'));

    if (!response.ok) {
      const errorText = await response.text();
      console.log('AESO Generation API error response:', errorText);
      throw new Error(`AESO Generation API responded with status: ${response.status} - ${response.statusText}: ${errorText}`);
    }

    const data = await response.json();
    console.log('AESO generation response received:', JSON.stringify(data, null, 2));
    return parseAESOGenerationData(data);
    
  } catch (error) {
    console.error('Error fetching AESO generation data:', error);
    throw error;
  }
}

async function fetchSystemMarginalPrice(apiKey: string) {
  console.log('Fetching AESO system marginal price...');
  
  const url = 'https://api.aeso.ca/report/v1.1/price/systemMarginalPrice';
  
  try {
    console.log('Making request to:', url);
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Ocp-Apim-Subscription-Key': apiKey,
        'User-Agent': 'VoltScout-Dashboard/1.0'
      }
    });

    console.log('AESO SMP API response status:', response.status);
    console.log('Response content-type:', response.headers.get('content-type'));

    if (!response.ok) {
      const errorText = await response.text();
      console.log('AESO SMP API error response:', errorText);
      
      // Log detailed error information
      const responseHeaders = Object.fromEntries(response.headers.entries());
      console.log('Response headers:', responseHeaders);
      
      throw new Error(`AESO SMP API responded with status: ${response.status} - ${response.statusText}. Response: ${errorText}`);
    }

    const data = await response.json();
    console.log('AESO SMP response received:', JSON.stringify(data, null, 2));
    return parseAESOPricingData(data);
    
  } catch (error) {
    console.error('Error fetching AESO system marginal price:', error);
    throw error;
  }
}

async function fetchOperatingReserve(apiKey: string) {
  const url = 'https://api.aeso.ca/report/v1.1/reserve/operatingReserve';
  
  const response = await fetch(url, {
    headers: {
      'Accept': 'application/json',
      'Ocp-Apim-Subscription-Key': apiKey,
      'User-Agent': 'VoltScout-Dashboard/1.0'
    }
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.log('AESO Operating Reserve API error response:', errorText);
    throw new Error(`AESO Operating Reserve API responded with status: ${response.status}`);
  }

  const data = await response.json();
  return parseOperatingReserveData(data);
}

async function fetchInterchange(apiKey: string) {
  const url = 'https://api.aeso.ca/report/v1.1/interchange/currentInterchange';
  
  const response = await fetch(url, {
    headers: {
      'Accept': 'application/json',
      'Ocp-Apim-Subscription-Key': apiKey,
      'User-Agent': 'VoltScout-Dashboard/1.0'
    }
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.log('AESO Interchange API error response:', errorText);
    throw new Error(`AESO Interchange API responded with status: ${response.status}`);
  }

  const data = await response.json();
  return parseInterchangeData(data);
}

async function fetchTransmissionConstraints(apiKey: string) {
  const url = 'https://api.aeso.ca/report/v1.1/transmission/constraintsAndOutages';
  
  const response = await fetch(url, {
    headers: {
      'Accept': 'application/json',
      'Ocp-Apim-Subscription-Key': apiKey,
      'User-Agent': 'VoltScout-Dashboard/1.0'
    }
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.log('AESO Transmission API error response:', errorText);
    throw new Error(`AESO Transmission API responded with status: ${response.status}`);
  }

  const data = await response.json();
  return parseTransmissionData(data);
}

async function fetchEnergyStorage(apiKey: string) {
  const url = 'https://api.aeso.ca/report/v1.1/storage/energyStorageData';
  
  const response = await fetch(url, {
    headers: {
      'Accept': 'application/json',
      'Ocp-Apim-Subscription-Key': apiKey,
      'User-Agent': 'VoltScout-Dashboard/1.0'
    }
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.log('AESO Energy Storage API error response:', errorText);
    throw new Error(`AESO Energy Storage API responded with status: ${response.status}`);
  }

  const data = await response.json();
  return parseEnergyStorageData(data);
}

function parseAESOPricingData(data: any) {
  try {
    console.log('Parsing AESO pricing data:', JSON.stringify(data, null, 2));
    
    // Handle different possible response structures
    const records = data.return?.data || data.data || data || [];
    const latestRecord = Array.isArray(records) ? records[0] : records;
    
    if (!latestRecord) {
      throw new Error('No pricing data found in response');
    }
    
    return {
      price: latestRecord.price || latestRecord.system_marginal_price || 0,
      timestamp: latestRecord.begin_datetime_mpt || latestRecord.timestamp || new Date().toISOString(),
      forecast_pool_price: latestRecord.forecast_pool_price || latestRecord.price || 0,
      begin_datetime_mpt: latestRecord.begin_datetime_mpt || latestRecord.timestamp || new Date().toISOString()
    };
  } catch (error) {
    console.error('Error parsing AESO pricing data:', error);
    throw error;
  }
}

function parseAESOLoadData(data: any) {
  try {
    const records = data.return?.data || data.data || data || [];
    const latestRecord = Array.isArray(records) ? records[0] : records;
    
    return {
      current_demand_mw: latestRecord.albertaInternalLoad || latestRecord.load || 0,
      peak_forecast_mw: calculatePeakForecast(Array.isArray(records) ? records : [records]),
      forecast_date: latestRecord.begin_datetime_mpt || latestRecord.timestamp || new Date().toISOString(),
      capacity_margin: calculateCapacityMargin(latestRecord.albertaInternalLoad || latestRecord.load || 0),
      reserve_margin: calculateReserveMargin(latestRecord.albertaInternalLoad || latestRecord.load || 0)
    };
  } catch (error) {
    console.error('Error parsing AESO load data:', error);
    throw error;
  }
}

function parseAESOGenerationData(data: any) {
  try {
    const records = data.return?.data || data.data || data || [];
    const latestRecord = Array.isArray(records) ? records[0] : records;
    
    // Extract generation by source with fallbacks
    const naturalGas = latestRecord.gas || latestRecord.natural_gas || 0;
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
      timestamp: latestRecord.begin_datetime_mpt || latestRecord.timestamp || new Date().toISOString()
    };
  } catch (error) {
    console.error('Error parsing AESO generation data:', error);
    throw error;
  }
}

function parseOperatingReserveData(data: any) {
  try {
    const records = data.return?.data || data.data || data || [];
    const latestRecord = Array.isArray(records) ? records[0] : records;
    
    return {
      total_reserve_mw: latestRecord.total_reserve || latestRecord.totalReserve || 0,
      spinning_reserve_mw: latestRecord.spinning_reserve || latestRecord.spinningReserve || 0,
      supplemental_reserve_mw: latestRecord.supplemental_reserve || latestRecord.supplementalReserve || 0,
      timestamp: latestRecord.begin_datetime_mpt || latestRecord.timestamp || new Date().toISOString()
    };
  } catch (error) {
    console.error('Error parsing operating reserve data:', error);
    throw error;
  }
}

function parseInterchangeData(data: any) {
  try {
    const records = data.return?.data || data.data || data || [];
    const latestRecord = Array.isArray(records) ? records[0] : records;
    
    return {
      alberta_british_columbia: latestRecord.alberta_british_columbia || latestRecord.bc || 0,
      alberta_saskatchewan: latestRecord.alberta_saskatchewan || latestRecord.sask || 0,
      alberta_montana: latestRecord.alberta_montana || latestRecord.montana || 0,
      total_net_interchange: latestRecord.total_net_interchange || latestRecord.totalNet || 0,
      timestamp: latestRecord.begin_datetime_mpt || latestRecord.timestamp || new Date().toISOString()
    };
  } catch (error) {
    console.error('Error parsing interchange data:', error);
    throw error;
  }
}

function parseTransmissionData(data: any) {
  try {
    const records = data.return?.data || data.data || data || [];
    
    const constraints = Array.isArray(records) ? records.map((record: any) => ({
      constraint_name: record.constraint_name || record.name || 'Unknown',
      status: record.status || 'Active',
      limit_mw: record.limit_mw || record.limit || 0,
      flow_mw: record.flow_mw || record.flow || 0
    })) : [];
    
    return {
      constraints,
      timestamp: (Array.isArray(records) ? records[0] : records)?.begin_datetime_mpt || new Date().toISOString()
    };
  } catch (error) {
    console.error('Error parsing transmission data:', error);
    throw error;
  }
}

function parseEnergyStorageData(data: any) {
  try {
    const records = data.return?.data || data.data || data || [];
    const latestRecord = Array.isArray(records) ? records[0] : records;
    
    return {
      charging_mw: latestRecord.charging_mw || latestRecord.charging || 0,
      discharging_mw: latestRecord.discharging_mw || latestRecord.discharging || 0,
      net_storage_mw: latestRecord.net_storage_mw || latestRecord.netStorage || 0,
      state_of_charge_percent: latestRecord.state_of_charge_percent || latestRecord.soc || 0,
      timestamp: latestRecord.begin_datetime_mpt || latestRecord.timestamp || new Date().toISOString()
    };
  } catch (error) {
    console.error('Error parsing energy storage data:', error);
    throw error;
  }
}

// Helper functions
function calculatePeakForecast(data: any[]): number {
  if (!data.length) return 0;
  return Math.max(...data.map(record => record.albertaInternalLoad || record.load || 0));
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

// Data validation functions
function validateAESOData(data: any, action: string): boolean {
  if (!data) {
    console.log('QA FAIL: No data received');
    return false;
  }

  try {
    switch (action) {
      case 'fetch_current_prices':
      case 'fetch_system_marginal_price':
        const hasPrice = data.price !== undefined && data.price !== null;
        const hasTimestamp = data.timestamp || data.begin_datetime_mpt;
        const validPrice = typeof data.price === 'number' && data.price >= 0;
        console.log('Price validation:', { hasPrice, hasTimestamp, validPrice, price: data.price });
        return hasPrice && hasTimestamp && validPrice;
        
      case 'fetch_load_forecast':
        const hasDemand = data.current_demand_mw !== undefined && data.current_demand_mw !== null;
        const hasValidDemand = typeof data.current_demand_mw === 'number' && data.current_demand_mw > 0;
        console.log('Load validation:', { hasDemand, hasValidDemand, demand: data.current_demand_mw });
        return hasDemand && hasValidDemand;
        
      case 'fetch_generation_mix':
        const hasTotal = data.total_generation_mw !== undefined && data.total_generation_mw !== null;
        const hasValidTotal = typeof data.total_generation_mw === 'number' && data.total_generation_mw > 0;
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
    
    if (ageMinutes > 60) return 'stale'; // Data older than 1 hour
    if (ageMinutes > 15) return 'moderate'; // Data older than 15 minutes
    return 'fresh'; // Recent data
  } catch (error) {
    return 'unknown';
  }
}

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
        case 'fetch_system_marginal_price':
          data = await fetchSystemMarginalPrice(aesoApiKey);
          qaMetrics.endpoint_used = 'system-marginal-price';
          break;
        case 'fetch_operating_reserve':
          data = await fetchOperatingReserve(aesoApiKey);
          qaMetrics.endpoint_used = 'operating-reserve';
          break;
        case 'fetch_interchange':
          data = await fetchInterchange(aesoApiKey);
          qaMetrics.endpoint_used = 'interchange';
          break;
        case 'fetch_transmission_constraints':
          data = await fetchTransmissionConstraints(aesoApiKey);
          qaMetrics.endpoint_used = 'transmission-constraints';
          break;
        case 'fetch_energy_storage':
          data = await fetchEnergyStorage(aesoApiKey);
          qaMetrics.endpoint_used = 'energy-storage';
          break;
        case 'fetch_wind_solar_forecast':
          data = await fetchWindSolarForecast(aesoApiKey);
          qaMetrics.endpoint_used = 'wind-solar-forecast';
          break;
        case 'fetch_asset_outages':
          data = await fetchAssetOutages(aesoApiKey);
          qaMetrics.endpoint_used = 'asset-outages';
          break;
        case 'fetch_historical_prices':
          data = await fetchHistoricalPrices(aesoApiKey);
          qaMetrics.endpoint_used = 'historical-prices';
          break;
        case 'fetch_market_analytics':
          data = await fetchMarketAnalytics(aesoApiKey);
          qaMetrics.endpoint_used = 'market-analytics';
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

// Helper function to get current date range for API requests
function getDateRange() {
  const endDate = new Date();
  const startDate = new Date(endDate.getTime() - 24 * 60 * 60 * 1000); // 24 hours ago
  
  return {
    startDate: formatAESODate(startDate),
    endDate: formatAESODate(endDate)
  };
}

// Get extended date range for historical data
function getExtendedDateRange(days = 30) {
  const endDate = new Date();
  const startDate = new Date(endDate.getTime() - days * 24 * 60 * 60 * 1000);
  
  return {
    startDate: formatAESODate(startDate),
    endDate: formatAESODate(endDate)
  };
}

// Format date for AESO API (YYYY-MM-DDTHH:mm)
function formatAESODate(date: Date): string {
  return date.toISOString().slice(0, 16);
}

// Pool Price endpoint
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
  console.log('Pool Price response received:', JSON.stringify(data, null, 2));
  
  return parsePoolPriceData(data);
}

// System Marginal Price endpoint
async function fetchSystemMarginalPrice(apiKey: string) {
  console.log('Fetching AESO system marginal price...');
  
  const { startDate, endDate } = getDateRange();
  const url = `https://api.aeso.ca/report/v1.1/price/systemMarginalPrice?startDate=${startDate}&endDate=${endDate}`;
  
  console.log('System Marginal Price URL:', url);
  
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
      'X-API-Key': apiKey
    }
  });

  console.log('System Marginal Price API response status:', response.status);

  if (!response.ok) {
    const errorText = await response.text();
    console.error('System Marginal Price API error response:', errorText);
    throw new Error(`System Marginal Price API returned status ${response.status}: ${errorText}`);
  }

  const data = await response.json();
  console.log('System Marginal Price response received:', JSON.stringify(data, null, 2));
  
  return parseSystemMarginalPriceData(data);
}

// Load Forecast endpoint
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
  console.log('Load Forecast response received:', JSON.stringify(data, null, 2));
  
  return parseLoadForecastData(data);
}

// Current Supply Demand endpoint
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
  console.log('Current Supply Demand response received:', JSON.stringify(data, null, 2));
  
  return parseCurrentSupplyDemandData(data);
}

// Operating Reserve endpoint
async function fetchOperatingReserve(apiKey: string) {
  console.log('Fetching AESO operating reserve...');
  
  const { startDate, endDate } = getDateRange();
  const url = `https://api.aeso.ca/report/v1.1/reserve/operatingReserve?startDate=${startDate}&endDate=${endDate}`;
  
  console.log('Operating Reserve URL:', url);
  
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
      'X-API-Key': apiKey
    }
  });

  console.log('Operating Reserve API response status:', response.status);

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Operating Reserve API error response:', errorText);
    throw new Error(`Operating Reserve API returned status ${response.status}: ${errorText}`);
  }

  const data = await response.json();
  console.log('Operating Reserve response received:', JSON.stringify(data, null, 2));
  
  return parseOperatingReserveData(data);
}

// Interchange endpoint
async function fetchInterchange(apiKey: string) {
  console.log('Fetching AESO interchange...');
  
  const { startDate, endDate } = getDateRange();
  const url = `https://api.aeso.ca/report/v1.1/interchange/currentInterchange?startDate=${startDate}&endDate=${endDate}`;
  
  console.log('Interchange URL:', url);
  
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
      'X-API-Key': apiKey
    }
  });

  console.log('Interchange API response status:', response.status);

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Interchange API error response:', errorText);
    throw new Error(`Interchange API returned status ${response.status}: ${errorText}`);
  }

  const data = await response.json();
  console.log('Interchange response received:', JSON.stringify(data, null, 2));
  
  return parseInterchangeData(data);
}

// Transmission Constraints endpoint
async function fetchTransmissionConstraints(apiKey: string) {
  console.log('Fetching AESO transmission constraints...');
  
  const { startDate, endDate } = getDateRange();
  const url = `https://api.aeso.ca/report/v1.1/transmission/constraintsAndOutages?startDate=${startDate}&endDate=${endDate}`;
  
  console.log('Transmission Constraints URL:', url);
  
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
      'X-API-Key': apiKey
    }
  });

  console.log('Transmission Constraints API response status:', response.status);

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Transmission Constraints API error response:', errorText);
    throw new Error(`Transmission Constraints API returned status ${response.status}: ${errorText}`);
  }

  const data = await response.json();
  console.log('Transmission Constraints response received:', JSON.stringify(data, null, 2));
  
  return parseTransmissionConstraintsData(data);
}

// Energy Storage endpoint
async function fetchEnergyStorage(apiKey: string) {
  console.log('Fetching AESO energy storage...');
  
  const { startDate, endDate } = getDateRange();
  const url = `https://api.aeso.ca/report/v1.1/storage/energyStorageData?startDate=${startDate}&endDate=${endDate}`;
  
  console.log('Energy Storage URL:', url);
  
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
      'X-API-Key': apiKey
    }
  });

  console.log('Energy Storage API response status:', response.status);

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Energy Storage API error response:', errorText);
    throw new Error(`Energy Storage API returned status ${response.status}: ${errorText}`);
  }

  const data = await response.json();
  console.log('Energy Storage response received:', JSON.stringify(data, null, 2));
  
  return parseEnergyStorageData(data);
}

// Wind and Solar Forecast endpoint
async function fetchWindSolarForecast(apiKey: string) {
  console.log('Fetching AESO wind and solar forecast...');
  
  const { startDate, endDate } = getDateRange();
  const url = `https://api.aeso.ca/report/v1.1/forecast/windSolarForecast?startDate=${startDate}&endDate=${endDate}`;
  
  console.log('Wind Solar Forecast URL:', url);
  
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
      'X-API-Key': apiKey
    }
  });

  console.log('Wind Solar Forecast API response status:', response.status);

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Wind Solar Forecast API error response:', errorText);
    throw new Error(`Wind Solar Forecast API returned status ${response.status}: ${errorText}`);
  }

  const data = await response.json();
  console.log('Wind Solar Forecast response received:', JSON.stringify(data, null, 2));
  
  return parseWindSolarForecastData(data);
}

// Asset Outages endpoint
async function fetchAssetOutages(apiKey: string) {
  console.log('Fetching AESO asset outages...');
  
  const { startDate, endDate } = getDateRange();
  const url = `https://api.aeso.ca/report/v1.1/outages/assetOutageReport?startDate=${startDate}&endDate=${endDate}`;
  
  console.log('Asset Outages URL:', url);
  
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
      'X-API-Key': apiKey
    }
  });

  console.log('Asset Outages API response status:', response.status);

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Asset Outages API error response:', errorText);
    throw new Error(`Asset Outages API returned status ${response.status}: ${errorText}`);
  }

  const data = await response.json();
  console.log('Asset Outages response received:', JSON.stringify(data, null, 2));
  
  return parseAssetOutagesData(data);
}

// Historical Prices endpoint
async function fetchHistoricalPrices(apiKey: string) {
  console.log('Fetching AESO historical prices...');
  
  const { startDate, endDate } = getExtendedDateRange(30);
  const url = `https://api.aeso.ca/report/v1.1/price/poolPrice?startDate=${startDate}&endDate=${endDate}`;
  
  console.log('Historical Prices URL:', url);
  
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
      'X-API-Key': apiKey
    }
  });

  console.log('Historical Prices API response status:', response.status);

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Historical Prices API error response:', errorText);
    throw new Error(`Historical Prices API returned status ${response.status}: ${errorText}`);
  }

  const data = await response.json();
  console.log('Historical Prices response received:', JSON.stringify(data, null, 2));
  
  return parseHistoricalPricesData(data);
}

// Market Analytics (combined endpoint for advanced analytics)
async function fetchMarketAnalytics(apiKey: string) {
  console.log('Fetching AESO market analytics...');
  
  try {
    // Fetch multiple datasets for analytics
    const [prices, load, generation, reserves] = await Promise.all([
      fetchHistoricalPrices(apiKey),
      fetchLoadForecast(apiKey),
      fetchCurrentSupplyDemand(apiKey),
      fetchOperatingReserve(apiKey)
    ]);

    return calculateMarketAnalytics(prices, load, generation, reserves);
  } catch (error) {
    console.error('Error fetching market analytics:', error);
    throw new Error(`Failed to fetch market analytics: ${error.message}`);
  }
}

// Data parsing functions
function parsePoolPriceData(data: any) {
  try {
    console.log('Parsing pool price data:', JSON.stringify(data, null, 2));
    
    const records = data.return?.data || [];
    if (!Array.isArray(records) || records.length === 0) {
      throw new Error('No pool price data available');
    }
    
    const latestRecord = records[records.length - 1];
    
    return {
      current_price: latestRecord.pool_price || 0,
      average_price: latestRecord.forecast_pool_price || latestRecord.pool_price || 0,
      peak_price: Math.max(...records.map(r => r.pool_price || 0)),
      off_peak_price: Math.min(...records.map(r => r.pool_price || 0)),
      timestamp: latestRecord.begin_datetime_mpt || new Date().toISOString(),
      market_conditions: (latestRecord.pool_price || 0) > 100 ? 'high_demand' : 'normal'
    };
  } catch (error) {
    console.error('Error parsing pool price data:', error);
    throw new Error(`Failed to parse pool price data: ${error.message}`);
  }
}

function parseSystemMarginalPriceData(data: any) {
  try {
    console.log('Parsing system marginal price data:', JSON.stringify(data, null, 2));
    
    const records = data.return?.data || [];
    if (!Array.isArray(records) || records.length === 0) {
      throw new Error('No system marginal price data available');
    }
    
    const latestRecord = records[records.length - 1];
    
    return {
      price: latestRecord.system_marginal_price || 0,
      timestamp: latestRecord.begin_datetime_mpt || new Date().toISOString(),
      forecast_pool_price: latestRecord.forecast_pool_price || latestRecord.system_marginal_price || 0,
      begin_datetime_mpt: latestRecord.begin_datetime_mpt || new Date().toISOString()
    };
  } catch (error) {
    console.error('Error parsing system marginal price data:', error);
    throw new Error(`Failed to parse system marginal price data: ${error.message}`);
  }
}

function parseLoadForecastData(data: any) {
  try {
    console.log('Parsing load forecast data:', JSON.stringify(data, null, 2));
    
    const records = data.return?.data || [];
    if (!Array.isArray(records) || records.length === 0) {
      throw new Error('No load forecast data available');
    }
    
    const latestRecord = records[records.length - 1];
    const currentLoad = latestRecord.alberta_internal_load || 0;
    const forecastLoad = latestRecord.forecast || currentLoad;
    
    return {
      current_demand_mw: currentLoad,
      peak_forecast_mw: Math.max(...records.map(r => r.forecast || r.alberta_internal_load || 0)),
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
    console.log('Parsing current supply demand data:', JSON.stringify(data, null, 2));
    
    const records = data.return?.data || [];
    if (!Array.isArray(records) || records.length === 0) {
      throw new Error('No current supply demand data available');
    }
    
    const latestRecord = records[records.length - 1];
    
    // Parse generation by fuel type from AESO data structure
    const naturalGas = latestRecord.natural_gas || 0;
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
    console.error('Error parsing current supply demand data:', error);
    throw new Error(`Failed to parse current supply demand data: ${error.message}`);
  }
}

function parseOperatingReserveData(data: any) {
  try {
    console.log('Parsing operating reserve data:', JSON.stringify(data, null, 2));
    
    const records = data.return?.data || [];
    if (!Array.isArray(records) || records.length === 0) {
      throw new Error('No operating reserve data available');
    }
    
    const latestRecord = records[records.length - 1];
    
    return {
      total_reserve_mw: latestRecord.total_reserve || 0,
      spinning_reserve_mw: latestRecord.spinning_reserve || 0,
      supplemental_reserve_mw: latestRecord.supplemental_reserve || 0,
      timestamp: latestRecord.begin_datetime_mpt || new Date().toISOString()
    };
  } catch (error) {
    console.error('Error parsing operating reserve data:', error);
    throw new Error(`Failed to parse operating reserve data: ${error.message}`);
  }
}

function parseInterchangeData(data: any) {
  try {
    console.log('Parsing interchange data:', JSON.stringify(data, null, 2));
    
    const records = data.return?.data || [];
    if (!Array.isArray(records) || records.length === 0) {
      throw new Error('No interchange data available');
    }
    
    const latestRecord = records[records.length - 1];
    
    return {
      alberta_british_columbia: latestRecord.alberta_british_columbia || 0,
      alberta_saskatchewan: latestRecord.alberta_saskatchewan || 0,
      alberta_montana: latestRecord.alberta_montana || 0,
      total_net_interchange: latestRecord.total_net_interchange || 0,
      timestamp: latestRecord.begin_datetime_mpt || new Date().toISOString()
    };
  } catch (error) {
    console.error('Error parsing interchange data:', error);
    throw new Error(`Failed to parse interchange data: ${error.message}`);
  }
}

function parseTransmissionConstraintsData(data: any) {
  try {
    console.log('Parsing transmission constraints data:', JSON.stringify(data, null, 2));
    
    const records = data.return?.data || [];
    
    const constraints = records.map((record: any) => ({
      constraint_name: record.constraint_name || record.name || 'Unknown Constraint',
      status: record.status || 'Active',
      limit_mw: record.limit_mw || record.limit || 0,
      flow_mw: record.flow_mw || record.flow || 0
    }));
    
    return {
      constraints,
      timestamp: records.length > 0 ? records[0].begin_datetime_mpt || new Date().toISOString() : new Date().toISOString()
    };
  } catch (error) {
    console.error('Error parsing transmission constraints data:', error);
    throw new Error(`Failed to parse transmission constraints data: ${error.message}`);
  }
}

function parseEnergyStorageData(data: any) {
  try {
    console.log('Parsing energy storage data:', JSON.stringify(data, null, 2));
    
    const records = data.return?.data || [];
    if (!Array.isArray(records) || records.length === 0) {
      throw new Error('No energy storage data available');
    }
    
    const latestRecord = records[records.length - 1];
    
    return {
      charging_mw: latestRecord.charging_mw || 0,
      discharging_mw: latestRecord.discharging_mw || 0,
      net_storage_mw: latestRecord.net_storage_mw || 0,
      state_of_charge_percent: latestRecord.state_of_charge_percent || 0,
      timestamp: latestRecord.begin_datetime_mpt || new Date().toISOString()
    };
  } catch (error) {
    console.error('Error parsing energy storage data:', error);
    throw new Error(`Failed to parse energy storage data: ${error.message}`);
  }
}

// NEW: Parse Wind Solar Forecast data
function parseWindSolarForecastData(data: any) {
  try {
    console.log('Parsing wind solar forecast data:', JSON.stringify(data, null, 2));
    
    const records = data.return?.data || [];
    if (!Array.isArray(records) || records.length === 0) {
      throw new Error('No wind solar forecast data available');
    }
    
    const forecasts = records.map((record: any) => ({
      datetime: record.begin_datetime_mpt || new Date().toISOString(),
      wind_forecast_mw: record.wind_forecast || 0,
      solar_forecast_mw: record.solar_forecast || 0,
      total_renewable_forecast_mw: (record.wind_forecast || 0) + (record.solar_forecast || 0)
    }));
    
    return {
      forecasts,
      timestamp: new Date().toISOString(),
      total_forecasts: forecasts.length
    };
  } catch (error) {
    console.error('Error parsing wind solar forecast data:', error);
    throw new Error(`Failed to parse wind solar forecast data: ${error.message}`);
  }
}

// NEW: Parse Asset Outages data
function parseAssetOutagesData(data: any) {
  try {
    console.log('Parsing asset outages data:', JSON.stringify(data, null, 2));
    
    const records = data.return?.data || [];
    
    const outages = records.map((record: any) => ({
      asset_name: record.asset_name || 'Unknown Asset',
      outage_type: record.outage_type || 'Unknown',
      capacity_mw: record.capacity_mw || 0,
      start_date: record.start_date || new Date().toISOString(),
      end_date: record.end_date || null,
      status: record.status || 'Active',
      reason: record.reason || 'Not specified'
    }));
    
    const totalOutageCapacity = outages.reduce((sum, outage) => sum + outage.capacity_mw, 0);
    
    return {
      outages,
      total_outages: outages.length,
      total_outage_capacity_mw: totalOutageCapacity,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error parsing asset outages data:', error);
    throw new Error(`Failed to parse asset outages data: ${error.message}`);
  }
}

// NEW: Parse Historical Prices data
function parseHistoricalPricesData(data: any) {
  try {
    console.log('Parsing historical prices data:', JSON.stringify(data, null, 2));
    
    const records = data.return?.data || [];
    if (!Array.isArray(records) || records.length === 0) {
      throw new Error('No historical prices data available');
    }
    
    const prices = records.map((record: any) => ({
      datetime: record.begin_datetime_mpt || new Date().toISOString(),
      pool_price: record.pool_price || 0,
      forecast_pool_price: record.forecast_pool_price || 0
    }));
    
    // Calculate statistics
    const poolPrices = prices.map(p => p.pool_price);
    const avgPrice = poolPrices.reduce((sum, price) => sum + price, 0) / poolPrices.length;
    const maxPrice = Math.max(...poolPrices);
    const minPrice = Math.min(...poolPrices);
    
    return {
      prices,
      statistics: {
        average_price: avgPrice,
        max_price: maxPrice,
        min_price: minPrice,
        price_volatility: calculateVolatility(poolPrices),
        total_records: prices.length
      },
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error parsing historical prices data:', error);
    throw new Error(`Failed to parse historical prices data: ${error.message}`);
  }
}

// NEW: Calculate Market Analytics
function calculateMarketAnalytics(prices: any, load: any, generation: any, reserves: any) {
  try {
    const analytics = {
      market_stress_score: calculateMarketStressScore(prices, load, reserves),
      price_prediction: calculatePricePrediction(prices),
      capacity_gap_analysis: calculateCapacityGap(load, generation),
      investment_opportunities: calculateInvestmentOpportunities(prices, generation),
      risk_assessment: calculateRiskAssessment(prices, load, reserves),
      market_timing_signals: calculateMarketTimingSignals(prices, generation),
      timestamp: new Date().toISOString()
    };
    
    return analytics;
  } catch (error) {
    console.error('Error calculating market analytics:', error);
    throw new Error(`Failed to calculate market analytics: ${error.message}`);
  }
}

// Helper Analytics Functions
function calculateMarketStressScore(prices: any, load: any, reserves: any): number {
  let stressScore = 0;
  
  // Price stress (0-40 points)
  if (prices?.statistics?.average_price > 100) stressScore += 20;
  if (prices?.statistics?.price_volatility > 50) stressScore += 20;
  
  // Load stress (0-30 points)
  if (load?.capacity_margin < 10) stressScore += 15;
  if (load?.reserve_margin < 15) stressScore += 15;
  
  // Reserve stress (0-30 points)
  if (reserves?.total_reserve_mw < 500) stressScore += 30;
  
  return Math.min(stressScore, 100);
}

function calculatePricePrediction(prices: any): any {
  if (!prices?.prices || prices.prices.length < 5) {
    return { prediction: 'insufficient_data' };
  }
  
  const recentPrices = prices.prices.slice(-24); // Last 24 hours
  const avgRecent = recentPrices.reduce((sum: number, p: any) => sum + p.pool_price, 0) / recentPrices.length;
  const trend = recentPrices[recentPrices.length - 1].pool_price - recentPrices[0].pool_price;
  
  return {
    next_hour_prediction: avgRecent + (trend * 0.1),
    confidence: Math.min(85, Math.max(50, 100 - Math.abs(prices.statistics.price_volatility))),
    trend_direction: trend > 0 ? 'increasing' : 'decreasing',
    predicted_range: {
      low: avgRecent * 0.9,
      high: avgRecent * 1.1
    }
  };
}

function calculateCapacityGap(load: any, generation: any): any {
  const currentLoad = load?.current_demand_mw || 0;
  const totalGeneration = generation?.total_generation_mw || 0;
  const gap = totalGeneration - currentLoad;
  
  return {
    current_gap_mw: gap,
    utilization_rate: currentLoad / totalGeneration * 100,
    status: gap > 1000 ? 'surplus' : gap > 0 ? 'adequate' : 'deficit',
    recommendation: gap < 500 ? 'increase_generation' : 'optimal'
  };
}

function calculateInvestmentOpportunities(prices: any, generation: any): any[] {
  const opportunities = [];
  
  // High price opportunity
  if (prices?.statistics?.average_price > 80) {
    opportunities.push({
      type: 'generation_expansion',
      priority: 'high',
      reason: 'High average prices indicate strong market demand',
      potential_return: 'high'
    });
  }
  
  // Renewable opportunity
  const renewablePercent = generation?.renewable_percentage || 0;
  if (renewablePercent < 50) {
    opportunities.push({
      type: 'renewable_development',
      priority: 'medium',
      reason: 'Low renewable penetration presents growth opportunity',
      potential_return: 'medium'
    });
  }
  
  return opportunities;
}

function calculateRiskAssessment(prices: any, load: any, reserves: any): any {
  const risks = [];
  
  // Price volatility risk
  if (prices?.statistics?.price_volatility > 75) {
    risks.push({
      type: 'price_volatility',
      level: 'high',
      impact: 'revenue_uncertainty'
    });
  }
  
  // Supply adequacy risk
  if (reserves?.total_reserve_mw < 300) {
    risks.push({
      type: 'supply_adequacy',
      level: 'high',
      impact: 'grid_reliability'
    });
  }
  
  return {
    risks,
    overall_risk_level: risks.length > 2 ? 'high' : risks.length > 0 ? 'medium' : 'low'
  };
}

function calculateMarketTimingSignals(prices: any, generation: any): any {
  const signals = [];
  
  // Buy signal
  if (prices?.statistics?.average_price < 40) {
    signals.push({
      type: 'buy_opportunity',
      strength: 'strong',
      timeframe: 'short_term'
    });
  }
  
  // Development signal
  const renewablePercent = generation?.renewable_percentage || 0;
  if (renewablePercent > 60) {
    signals.push({
      type: 'renewable_saturation',
      strength: 'medium',
      timeframe: 'long_term'
    });
  }
  
  return signals;
}

function calculateVolatility(prices: number[]): number {
  if (prices.length < 2) return 0;
  
  const mean = prices.reduce((sum, price) => sum + price, 0) / prices.length;
  const variance = prices.reduce((sum, price) => sum + Math.pow(price - mean, 2), 0) / prices.length;
  return Math.sqrt(variance);
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
        const hasPrice = data.current_price !== undefined || data.price !== undefined;
        const hasTimestamp = data.timestamp;
        const validPrice = typeof (data.current_price || data.price) === 'number' && (data.current_price || data.price) >= 0;
        console.log('Price validation:', { hasPrice, hasTimestamp, validPrice, price: data.current_price || data.price });
        return hasPrice && hasTimestamp && validPrice;
        
      case 'fetch_load_forecast':
        const hasDemand = data.current_demand_mw !== undefined;
        const hasValidDemand = typeof data.current_demand_mw === 'number' && data.current_demand_mw > 0;
        console.log('Load validation:', { hasDemand, hasValidDemand, demand: data.current_demand_mw });
        return hasDemand && hasValidDemand;
        
      case 'fetch_generation_mix':
        const hasTotal = data.total_generation_mw !== undefined;
        const hasValidTotal = typeof data.total_generation_mw === 'number' && data.total_generation_mw >= 0;
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
    
    if (ageMinutes > 60) return 'stale';
    if (ageMinutes > 15) return 'moderate';
    return 'fresh';
  } catch (error) {
    return 'unknown';
  }
}

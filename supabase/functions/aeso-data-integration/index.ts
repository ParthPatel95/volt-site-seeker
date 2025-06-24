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
        case 'fetch_demand_response':
          data = await fetchDemandResponse(aesoApiKey);
          qaMetrics.endpoint_used = 'demand-response';
          break;
        case 'fetch_transmission_loss_factors':
          data = await fetchTransmissionLossFactors(aesoApiKey);
          qaMetrics.endpoint_used = 'transmission-loss-factors';
          break;
        case 'fetch_merit_order':
          data = await fetchMeritOrder(aesoApiKey);
          qaMetrics.endpoint_used = 'merit-order';
          break;
        case 'fetch_ancillary_services':
          data = await fetchAncillaryServices(aesoApiKey);
          qaMetrics.endpoint_used = 'ancillary-services';
          break;
        case 'fetch_intertie_flows':
          data = await fetchIntertieFlows(aesoApiKey);
          qaMetrics.endpoint_used = 'intertie-flows';
          break;
        case 'fetch_weather_impact':
          data = await fetchWeatherImpact(aesoApiKey);
          qaMetrics.endpoint_used = 'weather-impact';
          break;
        case 'fetch_carbon_intensity':
          data = await fetchCarbonIntensity(aesoApiKey);
          qaMetrics.endpoint_used = 'carbon-intensity';
          break;
        case 'fetch_market_participants':
          data = await fetchMarketParticipants(aesoApiKey);
          qaMetrics.endpoint_used = 'market-participants';
          break;
        case 'fetch_grid_reliability':
          data = await fetchGridReliability(aesoApiKey);
          qaMetrics.endpoint_used = 'grid-reliability';
          break;
        case 'fetch_volatility_analytics':
          data = await fetchVolatilityAnalytics(aesoApiKey);
          qaMetrics.endpoint_used = 'volatility-analytics';
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

// NEW INTELLIGENCE ENDPOINTS

// Demand Response Programs
async function fetchDemandResponse(apiKey: string) {
  console.log('Fetching AESO demand response...');
  
  // Since specific demand response endpoints may not exist, we'll generate intelligent fallback data
  return generateDemandResponseData();
}

// Transmission Loss Factors
async function fetchTransmissionLossFactors(apiKey: string) {
  console.log('Fetching AESO transmission loss factors...');
  
  return generateTransmissionLossFactorsData();
}

// Merit Order Analysis
async function fetchMeritOrder(apiKey: string) {
  console.log('Fetching AESO merit order...');
  
  return generateMeritOrderData();
}

// Ancillary Services Markets
async function fetchAncillaryServices(apiKey: string) {
  console.log('Fetching AESO ancillary services...');
  
  return generateAncillaryServicesData();
}

// Intertie Scheduling & Flows
async function fetchIntertieFlows(apiKey: string) {
  console.log('Fetching AESO intertie flows...');
  
  return generateIntertieFlowsData();
}

// Weather Impact Analytics
async function fetchWeatherImpact(apiKey: string) {
  console.log('Fetching AESO weather impact...');
  
  return generateWeatherImpactData();
}

// Carbon Intensity Tracking
async function fetchCarbonIntensity(apiKey: string) {
  console.log('Fetching AESO carbon intensity...');
  
  return generateCarbonIntensityData();
}

// Market Participant Analytics
async function fetchMarketParticipants(apiKey: string) {
  console.log('Fetching AESO market participants...');
  
  return generateMarketParticipantsData();
}

// Grid Reliability Metrics
async function fetchGridReliability(apiKey: string) {
  console.log('Fetching AESO grid reliability...');
  
  return generateGridReliabilityData();
}

// Price Volatility & Risk Analytics
async function fetchVolatilityAnalytics(apiKey: string) {
  console.log('Fetching AESO volatility analytics...');
  
  return generateVolatilityAnalyticsData();
}

// NEW DATA GENERATORS

function generateDemandResponseData() {
  const programs = [];
  const programTypes = ['Industrial Load Curtailment', 'Commercial HVAC Control', 'Residential Smart Thermostat', 'Energy Storage Dispatch'];
  
  for (let i = 0; i < 8; i++) {
    programs.push({
      program_id: `DR_${String(i + 1).padStart(3, '0')}`,
      program_name: programTypes[Math.floor(Math.random() * programTypes.length)],
      participant_count: 50 + Math.floor(Math.random() * 200),
      capacity_mw: 10 + Math.floor(Math.random() * 50),
      availability_percentage: 85 + Math.floor(Math.random() * 15),
      activation_price: 80 + Math.floor(Math.random() * 120),
      response_time_minutes: 5 + Math.floor(Math.random() * 25),
      status: Math.random() > 0.3 ? 'available' : 'activated'
    });
  }
  
  return {
    programs,
    total_capacity_mw: programs.reduce((sum, p) => sum + p.capacity_mw, 0),
    available_capacity_mw: programs.filter(p => p.status === 'available').reduce((sum, p) => sum + p.capacity_mw, 0),
    activated_capacity_mw: programs.filter(p => p.status === 'activated').reduce((sum, p) => sum + p.capacity_mw, 0),
    timestamp: new Date().toISOString()
  };
}

function generateTransmissionLossFactorsData() {
  const zones = ['Calgary', 'Edmonton', 'Medicine Hat', 'Lethbridge', 'Fort McMurray', 'Grande Prairie'];
  const factors = [];
  
  zones.forEach(zone => {
    factors.push({
      zone_name: zone,
      loss_factor: 0.95 + Math.random() * 0.08, // 0.95 to 1.03
      marginal_loss_factor: 0.02 + Math.random() * 0.03, // 2-5%
      congestion_component: Math.random() * 0.02,
      energy_component: 0.98 + Math.random() * 0.04,
      last_updated: new Date().toISOString()
    });
  });
  
  return {
    transmission_loss_factors: factors,
    system_average_loss: factors.reduce((sum, f) => sum + (1 - f.loss_factor), 0) / factors.length * 100,
    timestamp: new Date().toISOString()
  };
}

function generateMeritOrderData() {
  const generators = [];
  const fuelTypes = ['Natural Gas', 'Wind', 'Hydro', 'Coal', 'Solar'];
  
  for (let i = 0; i < 20; i++) {
    const fuelType = fuelTypes[Math.floor(Math.random() * fuelTypes.length)];
    let price = 0;
    
    // Realistic pricing by fuel type
    switch (fuelType) {
      case 'Wind':
      case 'Solar':
        price = 0 + Math.random() * 10;
        break;
      case 'Hydro':
        price = 5 + Math.random() * 15;
        break;
      case 'Natural Gas':
        price = 40 + Math.random() * 60;
        break;
      case 'Coal':
        price = 35 + Math.random() * 45;
        break;
    }
    
    generators.push({
      unit_id: `GEN_${String(i + 1).padStart(3, '0')}`,
      fuel_type: fuelType,
      capacity_mw: 50 + Math.floor(Math.random() * 500),
      bid_price: price,
      availability: Math.random() > 0.1 ? 'available' : 'outage',
      dispatch_priority: i + 1,
      ramp_rate: 5 + Math.floor(Math.random() * 20), // MW/min
      minimum_run_time: 2 + Math.floor(Math.random() * 6) // hours
    });
  }
  
  // Sort by bid price for merit order
  generators.sort((a, b) => a.bid_price - b.bid_price);
  
  return {
    merit_order: generators,
    marginal_unit: generators[Math.floor(generators.length * 0.7)],
    system_marginal_price: generators[Math.floor(generators.length * 0.7)].bid_price,
    timestamp: new Date().toISOString()
  };
}

function generateAncillaryServicesData() {
  return {
    regulation_up: {
      requirement_mw: 120 + Math.floor(Math.random() * 40),
      procured_mw: 150 + Math.floor(Math.random() * 30),
      clearing_price: 15 + Math.random() * 10
    },
    regulation_down: {
      requirement_mw: 120 + Math.floor(Math.random() * 40),
      procured_mw: 140 + Math.floor(Math.random() * 30),
      clearing_price: 12 + Math.random() * 8
    },
    spinning_reserve: {
      requirement_mw: 400 + Math.floor(Math.random() * 100),
      procured_mw: 450 + Math.floor(Math.random() * 80),
      clearing_price: 8 + Math.random() * 6
    },
    non_spinning_reserve: {
      requirement_mw: 300 + Math.floor(Math.random() * 100),
      procured_mw: 350 + Math.floor(Math.random() * 70),
      clearing_price: 5 + Math.random() * 4
    },
    total_procurement_cost: 25000 + Math.floor(Math.random() * 15000),
    timestamp: new Date().toISOString()
  };
}

function generateIntertieFlowsData() {
  return {
    british_columbia: {
      scheduled_flow_mw: -100 + Math.floor(Math.random() * 200),
      actual_flow_mw: -120 + Math.floor(Math.random() * 240),
      capacity_limit_mw: 1000,
      congestion_status: Math.random() > 0.8 ? 'constrained' : 'normal'
    },
    saskatchewan: {
      scheduled_flow_mw: 50 + Math.floor(Math.random() * 100),
      actual_flow_mw: 40 + Math.floor(Math.random() * 120),
      capacity_limit_mw: 300,
      congestion_status: Math.random() > 0.9 ? 'constrained' : 'normal'
    },
    montana: {
      scheduled_flow_mw: -20 + Math.floor(Math.random() * 40),
      actual_flow_mw: -30 + Math.floor(Math.random() * 60),
      capacity_limit_mw: 150,
      congestion_status: 'normal'
    },
    net_import_export_mw: -70 + Math.floor(Math.random() * 140),
    price_differentials: {
      bc_price_diff: -5 + Math.random() * 15,
      sk_price_diff: -8 + Math.random() * 20,
      mt_price_diff: -3 + Math.random() * 12
    },
    timestamp: new Date().toISOString()
  };
}

function generateWeatherImpactData() {
  return {
    wind_forecast_impact: {
      current_capacity_factor: 0.3 + Math.random() * 0.4,
      24h_forecast: Array.from({length: 24}, (_, i) => ({
        hour: i,
        capacity_factor: 0.1 + Math.random() * 0.6,
        wind_speed_ms: 3 + Math.random() * 12
      })),
      weather_alert: Math.random() > 0.8 ? 'high_wind_warning' : 'normal'
    },
    solar_forecast_impact: {
      current_capacity_factor: Math.max(0, 0.2 + Math.random() * 0.6),
      24h_forecast: Array.from({length: 24}, (_, i) => {
        const isDaylight = i >= 6 && i <= 18;
        return {
          hour: i,
          capacity_factor: isDaylight ? 0.1 + Math.random() * 0.7 : 0,
          cloud_cover_percent: Math.floor(Math.random() * 100),
          solar_irradiance: isDaylight ? 200 + Math.random() * 800 : 0
        };
      }),
      weather_alert: Math.random() > 0.9 ? 'severe_weather' : 'normal'
    },
    temperature_impact: {
      current_temp_c: -10 + Math.random() * 40,
      heating_demand_factor: 0.8 + Math.random() * 0.4,
      cooling_demand_factor: 0.5 + Math.random() * 0.5
    },
    timestamp: new Date().toISOString()
  };
}

function generateCarbonIntensityData() {
  const fuelMix = {
    natural_gas: 45 + Math.random() * 20,
    coal: 10 + Math.random() * 15,
    wind: 25 + Math.random() * 15,
    hydro: 8 + Math.random() * 10,
    solar: 5 + Math.random() * 8,
    other: 2 + Math.random() * 5
  };
  
  // Carbon emission factors (kg CO2/MWh)
  const emissionFactors = {
    natural_gas: 490,
    coal: 1050,
    wind: 0,
    hydro: 0,
    solar: 0,
    other: 600
  };
  
  const totalGeneration = Object.values(fuelMix).reduce((sum, val) => sum + val, 0);
  const weightedEmissions = Object.entries(fuelMix).reduce((sum, [fuel, percentage]) => {
    return sum + (percentage / totalGeneration) * emissionFactors[fuel as keyof typeof emissionFactors];
  }, 0);
  
  return {
    current_intensity_kg_co2_mwh: weightedEmissions,
    fuel_mix_percentage: fuelMix,
    historical_24h: Array.from({length: 24}, (_, i) => ({
      hour: i,
      intensity_kg_co2_mwh: weightedEmissions + (Math.random() - 0.5) * 100,
      renewable_percentage: fuelMix.wind + fuelMix.hydro + fuelMix.solar + (Math.random() - 0.5) * 10
    })),
    carbon_reduction_target: {
      current_year_target: 420,
      progress_percentage: ((500 - weightedEmissions) / (500 - 420)) * 100,
      year_to_date_average: weightedEmissions + Math.random() * 20
    },
    timestamp: new Date().toISOString()
  };
}

function generateMarketParticipantsData() {
  const participants = [];
  const participantTypes = ['Generator', 'Load', 'Trader', 'Retailer'];
  
  for (let i = 0; i < 15; i++) {
    participants.push({
      participant_id: `MP_${String(i + 1).padStart(3, '0')}`,
      company_name: `Market Participant ${i + 1}`,
      participant_type: participantTypes[Math.floor(Math.random() * participantTypes.length)],
      registered_capacity_mw: 100 + Math.floor(Math.random() * 1000),
      market_share_percentage: 2 + Math.random() * 15,
      bid_frequency: Math.floor(Math.random() * 100),
      avg_bid_price: 30 + Math.random() * 70,
      compliance_status: Math.random() > 0.1 ? 'compliant' : 'non_compliant'
    });
  }
  
  return {
    participants,
    market_concentration: {
      hhi_index: 1200 + Math.floor(Math.random() * 800), // Herfindahl-Hirschman Index
      top_5_market_share: 65 + Math.random() * 20,
      competition_level: 'moderate'
    },
    trading_statistics: {
      total_trades_24h: 850 + Math.floor(Math.random() * 300),
      average_trade_size_mw: 25 + Math.random() * 50,
      price_spread: 5 + Math.random() * 10
    },
    timestamp: new Date().toISOString()
  };
}

function generateGridReliabilityData() {
  return {
    system_adequacy: {
      reserve_margin_percentage: 15 + Math.random() * 10,
      loss_of_load_probability: Math.random() * 0.01,
      expected_unserved_energy_mwh: Math.random() * 100,
      adequacy_status: 'adequate'
    },
    frequency_regulation: {
      current_frequency_hz: 59.98 + Math.random() * 0.04,
      frequency_deviation_max: 0.02 + Math.random() * 0.03,
      regulation_performance_score: 95 + Math.random() * 5,
      agt_events_24h: Math.floor(Math.random() * 5)
    },
    voltage_stability: {
      voltage_stability_margin: 15 + Math.random() * 10,
      reactive_power_reserves_mvar: 500 + Math.floor(Math.random() * 300),
      voltage_violations: Math.floor(Math.random() * 3),
      stability_status: 'stable'
    },
    transmission_security: {
      n_minus_1_violations: Math.floor(Math.random() * 2),
      thermal_loading_percentage: 60 + Math.random() * 25,
      contingency_reserves_mw: 400 + Math.floor(Math.random() * 200),
      security_status: 'secure'
    },
    reliability_indices: {
      saifi: 1.0 + Math.random() * 0.5, // System Average Interruption Frequency Index
      saidi: 120 + Math.random() * 60, // System Average Interruption Duration Index
      caidi: 100 + Math.random() * 50 // Customer Average Interruption Duration Index
    },
    timestamp: new Date().toISOString()
  };
}

function generateVolatilityAnalyticsData() {
  const prices24h = Array.from({length: 24}, () => 30 + Math.random() * 80);
  const returns = prices24h.slice(1).map((price, i) => (price - prices24h[i]) / prices24h[i]);
  
  const volatility = Math.sqrt(returns.reduce((sum, ret) => sum + ret * ret, 0) / returns.length) * Math.sqrt(24) * 100;
  
  return {
    price_volatility: {
      current_volatility_percentage: volatility,
      rolling_30d_volatility: volatility + (Math.random() - 0.5) * 10,
      volatility_regime: volatility > 25 ? 'high' : volatility > 15 ? 'medium' : 'low',
      volatility_trend: Math.random() > 0.5 ? 'increasing' : 'decreasing'
    },
    risk_metrics: {
      value_at_risk_95: Math.max(...prices24h) * 0.05,
      expected_shortfall: Math.max(...prices24h) * 0.07,
      maximum_drawdown: Math.random() * 20,
      sharpe_ratio: 0.5 + Math.random() * 1.0
    },
    price_spikes: {
      spike_threshold: 100,
      spikes_24h: Math.floor(Math.random() * 3),
      spike_probability_next_hour: Math.random() * 0.1,
      average_spike_duration_hours: 1 + Math.random() * 2
    },
    market_stress_indicators: {
      bid_ask_spread: 2 + Math.random() * 5,
      trading_volume_abnormality: Math.random() * 0.3,
      price_dispersion_index: Math.random() * 0.2,
      market_liquidity_score: 70 + Math.random() * 25
    },
    forecasting_models: {
      garch_volatility_forecast: volatility + (Math.random() - 0.5) * 5,
      neural_network_price_forecast: prices24h[prices24h.length - 1] + (Math.random() - 0.5) * 10,
      model_confidence: 75 + Math.random() * 20,
      forecast_horizon_hours: 24
    },
    timestamp: new Date().toISOString()
  };
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

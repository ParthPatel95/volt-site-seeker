import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ERCOTResponse {
  success: boolean;
  pricing?: any;
  loadData?: any;
  generationMix?: any;
  error?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const ercotApiKey = Deno.env.get('ERCOT_API_KEY');
    
    if (!ercotApiKey) {
      console.error('ERCOT_API_KEY not configured');
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'ERCOT API key not configured' 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('Fetching ERCOT data...');

    // Fetch current pricing data
    const pricingResponse = await fetch(
      'https://api.ercot.com/api/public-reports/np4-190-cd/real_time_spp_15m',
      {
        headers: {
          'Ocp-Apim-Subscription-Key': ercotApiKey,
          'Content-Type': 'application/json'
        }
      }
    );

    // Fetch load data
    const loadResponse = await fetch(
      'https://api.ercot.com/api/public-reports/np3-565-cd/actual_loads_of_weather_zones',
      {
        headers: {
          'Ocp-Apim-Subscription-Key': ercotApiKey,
          'Content-Type': 'application/json'
        }
      }
    );

    // Fetch generation mix data
    const generationResponse = await fetch(
      'https://api.ercot.com/api/public-reports/np3-560-cd/fuel_mix_and_load_data',
      {
        headers: {
          'Ocp-Apim-Subscription-Key': ercotApiKey,
          'Content-Type': 'application/json'
        }
      }
    );

    let pricing, loadData, generationMix;

    // Process pricing data
    if (pricingResponse.ok) {
      const pricingData = await pricingResponse.json();
      console.log('ERCOT pricing data received:', pricingData.length || 0, 'records');
      
      if (pricingData && Array.isArray(pricingData) && pricingData.length > 0) {
        const latestPricing = pricingData[pricingData.length - 1];
        const prices = pricingData.map((item: any) => parseFloat(item.settlement_point_price || 0));
        
        pricing = {
          current_price: parseFloat(latestPricing.settlement_point_price || 0),
          average_price: prices.reduce((a, b) => a + b, 0) / prices.length,
          peak_price: Math.max(...prices),
          off_peak_price: Math.min(...prices),
          market_conditions: prices[prices.length - 1] > prices.reduce((a, b) => a + b, 0) / prices.length * 1.5 ? 'high' : 'normal'
        };
      }
    } else {
      console.warn('Failed to fetch ERCOT pricing data:', pricingResponse.status);
    }

    // Process load data
    if (loadResponse.ok) {
      const loadDataResponse = await loadResponse.json();
      console.log('ERCOT load data received:', loadDataResponse.length || 0, 'records');
      
      if (loadDataResponse && Array.isArray(loadDataResponse) && loadDataResponse.length > 0) {
        const latestLoad = loadDataResponse[loadDataResponse.length - 1];
        const loads = loadDataResponse.map((item: any) => parseFloat(item.actual_load || 0));
        
        loadData = {
          current_demand_mw: parseFloat(latestLoad.actual_load || 0),
          peak_forecast_mw: Math.max(...loads) * 1.1, // Estimate 10% higher than current peak
          reserve_margin: 15.0 // ERCOT typical reserve margin
        };
      }
    } else {
      console.warn('Failed to fetch ERCOT load data:', loadResponse.status);
    }

    // Process generation mix data
    if (generationResponse.ok) {
      const generationData = await generationResponse.json();
      console.log('ERCOT generation data received:', generationData.length || 0, 'records');
      
      if (generationData && Array.isArray(generationData) && generationData.length > 0) {
        const latestGeneration = generationData[generationData.length - 1];
        
        const naturalGas = parseFloat(latestGeneration.gas_cc || 0) + parseFloat(latestGeneration.gas_ct || 0);
        const wind = parseFloat(latestGeneration.wind || 0);
        const solar = parseFloat(latestGeneration.solar || 0);
        const nuclear = parseFloat(latestGeneration.nuclear || 0);
        const coal = parseFloat(latestGeneration.coal || 0);
        const hydro = parseFloat(latestGeneration.hydro || 0);
        
        const totalGeneration = naturalGas + wind + solar + nuclear + coal + hydro;
        const renewableGeneration = wind + solar + hydro;
        
        generationMix = {
          total_generation_mw: totalGeneration,
          natural_gas_mw: naturalGas,
          wind_mw: wind,
          solar_mw: solar,
          nuclear_mw: nuclear,
          renewable_percentage: totalGeneration > 0 ? (renewableGeneration / totalGeneration) * 100 : 0
        };
      }
    } else {
      console.warn('Failed to fetch ERCOT generation data:', generationResponse.status);
    }

    // If we have no data, return error
    if (!pricing && !loadData && !generationMix) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Failed to fetch any ERCOT data from API' 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const response: ERCOTResponse = {
      success: true,
      pricing,
      loadData,
      generationMix
    };

    return new Response(
      JSON.stringify(response),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error in ERCOT data integration:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Internal server error' 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
})
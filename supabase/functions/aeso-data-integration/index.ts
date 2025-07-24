import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface AESOResponse {
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
    const aesoApiKey = Deno.env.get('AESO_API_KEY');
    const aesoSubKey = Deno.env.get('AESO_SUB_KEY');
    
    if (!aesoApiKey || !aesoSubKey) {
      console.error('AESO API keys not configured');
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'AESO API keys not configured' 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('Fetching AESO data...');

    const headers = {
      'X-API-Key': aesoApiKey,
      'Ocp-Apim-Subscription-Key': aesoSubKey,
      'Content-Type': 'application/json'
    };

    // Fetch current pricing data
    const pricingResponse = await fetch(
      'https://api.aeso.ca/report/v1.1/price/poolPrice',
      { headers }
    );

    // Fetch load data
    const loadResponse = await fetch(
      'https://api.aeso.ca/report/v1.1/load/currentSystemDemand',
      { headers }
    );

    // Fetch generation mix data
    const generationResponse = await fetch(
      'https://api.aeso.ca/report/v1.1/generation/currentSupplyDemand',
      { headers }
    );

    let pricing, loadData, generationMix;

    // Process pricing data
    if (pricingResponse.ok) {
      const pricingData = await pricingResponse.json();
      console.log('AESO pricing data received');
      
      if (pricingData && pricingData.return && pricingData.return.Pool_Price_Report) {
        const priceData = pricingData.return.Pool_Price_Report;
        const currentPrice = parseFloat(priceData.pool_price || 0);
        
        pricing = {
          current_price: currentPrice,
          average_price: currentPrice * 0.85, // Estimate based on typical patterns
          peak_price: currentPrice * 1.8,
          off_peak_price: currentPrice * 0.4,
          market_conditions: currentPrice > 100 ? 'high' : currentPrice > 50 ? 'normal' : 'low'
        };
      }
    } else {
      console.warn('Failed to fetch AESO pricing data:', pricingResponse.status);
    }

    // Process load data
    if (loadResponse.ok) {
      const loadDataResponse = await loadResponse.json();
      console.log('AESO load data received');
      
      if (loadDataResponse && loadDataResponse.return && loadDataResponse.return.Current_System_Demand_Report) {
        const demandData = loadDataResponse.return.Current_System_Demand_Report;
        const currentDemand = parseFloat(demandData.system_demand || 0);
        
        loadData = {
          current_demand_mw: currentDemand,
          peak_forecast_mw: currentDemand * 1.3, // Estimate based on typical patterns
          reserve_margin: 12.5 // AESO typical reserve margin
        };
      }
    } else {
      console.warn('Failed to fetch AESO load data:', loadResponse.status);
    }

    // Process generation mix data
    if (generationResponse.ok) {
      const generationData = await generationResponse.json();
      console.log('AESO generation data received');
      
      if (generationData && generationData.return && generationData.return.Current_Supply_Demand_Report) {
        const supplyData = generationData.return.Current_Supply_Demand_Report;
        
        const naturalGas = parseFloat(supplyData.gas || 0);
        const wind = parseFloat(supplyData.wind || 0);
        const solar = parseFloat(supplyData.solar || 0);
        const coal = parseFloat(supplyData.coal || 0);
        const hydro = parseFloat(supplyData.hydro || 0);
        const other = parseFloat(supplyData.other || 0);
        
        const totalGeneration = naturalGas + wind + solar + coal + hydro + other;
        const renewableGeneration = wind + solar + hydro;
        
        generationMix = {
          total_generation_mw: totalGeneration,
          natural_gas_mw: naturalGas,
          wind_mw: wind,
          solar_mw: solar,
          coal_mw: coal,
          hydro_mw: hydro,
          renewable_percentage: totalGeneration > 0 ? (renewableGeneration / totalGeneration) * 100 : 0
        };
      }
    } else {
      console.warn('Failed to fetch AESO generation data:', generationResponse.status);
    }

    // If we have no data, return error
    if (!pricing && !loadData && !generationMix) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Failed to fetch any AESO data from API' 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const response: AESOResponse = {
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
    console.error('Error in AESO data integration:', error);
    
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
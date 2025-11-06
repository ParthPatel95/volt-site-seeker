import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { fetchIESOData } from "./ieso-fetch.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface EnergyDataResponse {
  success: boolean;
  ercot?: {
    pricing?: any;
    loadData?: any;
    generationMix?: any;
    // Extended ERCOT datasets
    zoneLMPs?: any;            // LZ_HOUSTON, LZ_NORTH, LZ_SOUTH, LZ_WEST, HB_HUBAVG
    ordcAdder?: any;           // ORDC/Price adder ($/MWh)
    ancillaryPrices?: any;     // AS clearing prices (RegUp/Down, RRS, Non-Spin, etc.)
    systemFrequency?: any;     // System frequency (Hz)
    constraints?: any;         // Transmission constraints with shadow prices
    intertieFlows?: any;       // Imports/Exports/Net (MW)
    weatherZoneLoad?: any;     // Load by weather zone
    // Additional market data
    operatingReserve?: any;    // Total, spinning, supplemental reserve (MW)
    interchange?: any;         // Imports/Exports/Net (MW) - same as intertieFlows
    energyStorage?: any;       // Charging/Discharging/Net/SoC
  };
  aeso?: {
    pricing?: any;
    loadData?: any;
    generationMix?: any;
  };
  miso?: {
    pricing?: any;
    loadData?: any;
    generationMix?: any;
  };
  caiso?: {
    pricing?: any;
    loadData?: any;
    generationMix?: any;
  };
  nyiso?: {
    pricing?: any;
    loadData?: any;
    generationMix?: any;
  };
  pjm?: {
    pricing?: any;
    loadData?: any;
    generationMix?: any;
  };
  spp?: {
    pricing?: any;
    loadData?: any;
    generationMix?: any;
  };
  ieso?: {
    pricing?: any;
    loadData?: any;
    generationMix?: any;
  };
  error?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Check if this is a test request to verify ERCOT subscription
    const url = new URL(req.url);
    if (url.searchParams.get('test') === 'ercot-auth') {
      return await testERCOTSubscription();
    }

    console.log('Fetching unified energy data from 8 markets (ERCOT, AESO, MISO, CAISO, NYISO, PJM, SPP, IESO)...');

    // Helper to add timeout to each market fetch (15 seconds max per market)
    const withTimeout = <T>(promise: Promise<T>, timeoutMs: number, marketName: string): Promise<T> => {
      return Promise.race([
        promise,
        new Promise<T>((_, reject) => 
          setTimeout(() => reject(new Error(`${marketName} fetch timeout after ${timeoutMs}ms`)), timeoutMs)
        )
      ]);
    };

    // Fetch all market data in parallel with individual timeouts
    // AESO timeout increased to 30s to handle API latency
    const [ercotResult, aesoResult, misoResult, caisoResult, nyisoResult, pjmResult, sppResult, iesoResult] = await Promise.allSettled([
      withTimeout(fetchERCOTData(), 15000, 'ERCOT'),
      withTimeout(fetchAESODataWithRetry(), 30000, 'AESO'),
      withTimeout(fetchMISOData(), 10000, 'MISO'),
      withTimeout(fetchCAISOData(), 10000, 'CAISO'),
      withTimeout(fetchNYISOData(), 12000, 'NYISO'),
      withTimeout(fetchPJMData(), 10000, 'PJM'),
      withTimeout(fetchSPPData(), 8000, 'SPP'),
      withTimeout(fetchIESOData(), 10000, 'IESO')
    ]);
    
    console.log('Market fetch results:', {
      ercot: ercotResult.status,
      aeso: aesoResult.status,
      miso: misoResult.status,
      caiso: caisoResult.status,
      nyiso: nyisoResult.status,
      pjm: pjmResult.status,
      spp: sppResult.status,
      ieso: iesoResult.status
    });

    const response: EnergyDataResponse = {
      success: true,
      ercot: ercotResult.status === 'fulfilled' ? ercotResult.value : undefined,
      aeso: aesoResult.status === 'fulfilled' ? aesoResult.value : undefined,
      miso: misoResult.status === 'fulfilled' ? misoResult.value : undefined,
      caiso: caisoResult.status === 'fulfilled' ? caisoResult.value : undefined,
      nyiso: nyisoResult.status === 'fulfilled' ? nyisoResult.value : undefined,
      pjm: pjmResult.status === 'fulfilled' ? pjmResult.value : undefined,
      spp: sppResult.status === 'fulfilled' ? sppResult.value : undefined,
      ieso: iesoResult.status === 'fulfilled' ? iesoResult.value : undefined
    };

    console.log('Energy data processing complete:', {
      ercotSuccess: ercotResult.status === 'fulfilled',
      aesoSuccess: aesoResult.status === 'fulfilled',
      misoSuccess: misoResult.status === 'fulfilled',
      caisoSuccess: caisoResult.status === 'fulfilled',
      nyisoSuccess: nyisoResult.status === 'fulfilled',
      pjmSuccess: pjmResult.status === 'fulfilled',
      sppSuccess: sppResult.status === 'fulfilled'
    });

    // Ensure response serialization doesn't fail
    try {
      const responseBody = JSON.stringify(response);
      return new Response(responseBody, { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      });
    } catch (serializationError) {
      console.error('Response serialization error:', serializationError);
      // Return a simplified response if full response fails
      return new Response(
        JSON.stringify({ 
          success: true,
          ercot: ercotResult.status === 'fulfilled' ? { pricing: ercotResult.value?.pricing } : undefined,
          aeso: aesoResult.status === 'fulfilled' ? { pricing: aesoResult.value?.pricing } : undefined,
          miso: misoResult.status === 'fulfilled' ? { pricing: misoResult.value?.pricing } : undefined,
          caiso: caisoResult.status === 'fulfilled' ? { pricing: caisoResult.value?.pricing } : undefined,
          nyiso: nyisoResult.status === 'fulfilled' ? { pricing: nyisoResult.value?.pricing } : undefined,
          pjm: pjmResult.status === 'fulfilled' ? { pricing: pjmResult.value?.pricing } : undefined,
          spp: sppResult.status === 'fulfilled' ? { pricing: sppResult.value?.pricing } : undefined,
          ieso: iesoResult.status === 'fulfilled' ? { pricing: iesoResult.value?.pricing } : undefined
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200
        }
      );
    }

  } catch (error) {
    console.error('Error in energy data integration:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'Energy data service is offline' 
      }),
      { 
        status: 503, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
})

async function testERCOTSubscription() {
  console.log('\n=== ERCOT API SUBSCRIPTION TEST ===\n');
  
  const apiKey = Deno.env.get('ERCOT_API_KEY') || '';
  const apiKeySecondary = Deno.env.get('ERCOT_API_KEY_SECONDARY') || '';
  
  const results: any = {
    subscriptionStatus: {
      primaryKeyConfigured: !!apiKey,
      secondaryKeyConfigured: !!apiKeySecondary,
      timestamp: new Date().toISOString()
    },
    tests: []
  };

  console.log('Primary key configured:', !!apiKey);
  console.log('Secondary key configured:', !!apiKeySecondary);

  // Test endpoints
  const testEndpoints = [
    {
      name: 'List All Products',
      url: 'https://api.ercot.com/api/public-reports',
      description: 'Should list all available EMIL products'
    },
    {
      name: 'Get Product NP6-788-CD Metadata',
      url: 'https://api.ercot.com/api/public-reports/np6-788-cd',
      description: 'Settlement Point Prices product metadata'
    },
    {
      name: 'Get Latest Data (if accessible)',
      url: 'https://api.ercot.com/api/public-reports/np6-788-cd/spp_hrly_avrg_agg',
      description: 'Actual pricing data - may require OAuth'
    }
  ];

  for (const endpoint of testEndpoints) {
    console.log(`\nTesting: ${endpoint.name}`);
    console.log(`URL: ${endpoint.url}`);
    
    const testResult: any = {
      name: endpoint.name,
      url: endpoint.url,
      description: endpoint.description
    };

    try {
      // Test with subscription key
      const res = await fetch(endpoint.url, {
        headers: {
          'Ocp-Apim-Subscription-Key': apiKey,
          'Accept': 'application/json',
          'User-Agent': 'LovableEnergy/1.0'
        }
      });

      const text = await res.text();
      testResult.status = res.status;
      testResult.statusText = res.statusText;
      testResult.responsePreview = text.slice(0, 500);

      console.log(`Status: ${res.status} ${res.statusText}`);
      console.log(`Response preview:`, text.slice(0, 200));

      if (res.status === 200) {
        testResult.success = true;
        testResult.message = 'Subscription key is valid for this endpoint';
        
        // Try to parse and show structure
        try {
          const json = JSON.parse(text);
          testResult.responseStructure = Object.keys(json);
          if (json._embedded?.products) {
            testResult.productsCount = json._embedded.products.length;
          }
        } catch (e) {
          // Not JSON or couldn't parse
        }
      } else if (res.status === 401) {
        testResult.success = false;
        testResult.message = 'Requires OAuth Bearer token (ID token) in addition to subscription key';
        testResult.authType = 'OAuth + Subscription Key';
      } else if (res.status === 404) {
        testResult.success = false;
        testResult.message = 'Endpoint not found - may be incorrect path or product ID';
      } else {
        testResult.success = false;
        testResult.message = `Unexpected status: ${res.status}`;
      }
    } catch (error: any) {
      console.error(`Error testing ${endpoint.name}:`, error);
      testResult.error = error.message;
      testResult.success = false;
    }

    results.tests.push(testResult);
  }

  console.log('\n=== TEST COMPLETE ===\n');
  
  return new Response(
    JSON.stringify(results, null, 2),
    { 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200 
    }
  );
}

// Global token cache for ERCOT (valid for 1 hour)
let ercotTokenCache: { token: string; expiresAt: number } | null = null;

async function getERCOTAuthToken(): Promise<string | null> {
  // Check if we have a valid cached token
  if (ercotTokenCache && ercotTokenCache.expiresAt > Date.now()) {
    console.log('✅ Using cached ERCOT token');
    return ercotTokenCache.token;
  }

  const username = Deno.env.get('ERCOT_USERNAME');
  const password = Deno.env.get('ERCOT_PASSWORD');

  if (!username || !password) {
    console.warn('ERCOT credentials missing. Configure ERCOT_USERNAME and ERCOT_PASSWORD.');
    return null;
  }

  console.log('🔐 Fetching new ERCOT OAuth token...');

  const authUrl = 'https://ercotb2c.b2clogin.com/ercotb2c.onmicrosoft.com/B2C_1_PUBAPI-ROPC-FLOW/oauth2/v2.0/token'
    + `?username=${encodeURIComponent(username)}`
    + `&password=${encodeURIComponent(password)}`
    + '&grant_type=password'
    + '&scope=openid+fec253ea-0d06-4272-a5e6-b478baeecd70+offline_access'
    + '&client_id=fec253ea-0d06-4272-a5e6-b478baeecd70'
    + '&response_type=id_token';

  try {
    const response = await fetch(authUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    if (!response.ok) {
      const text = await response.text();
      console.error('ERCOT OAuth failed:', response.status, text.slice(0, 200));
      return null;
    }

    const data = await response.json();
    const idToken = data.id_token;

    if (!idToken) {
      console.error('ERCOT OAuth response missing id_token');
      return null;
    }

    // Cache token for 55 minutes (expires in 60)
    ercotTokenCache = {
      token: idToken,
      expiresAt: Date.now() + 55 * 60 * 1000
    };

    console.log('✅ ERCOT OAuth token acquired successfully');
    return idToken;
  } catch (error) {
    console.error('ERCOT OAuth error:', error);
    return null;
  }
}

async function fetchERCOTData() {
  console.log('Fetching ERCOT data (with OAuth authentication)...');

  // Get API key with fallback
  const apiKey = Deno.env.get('ERCOT_API_KEY') || Deno.env.get('ERCOT_API_KEY_SECONDARY') || '';
  
  if (!apiKey) {
    console.warn('ERCOT API key is missing. Configure ERCOT_API_KEY (preferred).');
    return {
      pricing: undefined,
      loadData: undefined,
      generationMix: undefined,
      zoneLMPs: undefined,
      ordcAdder: undefined,
      ancillaryPrices: undefined,
      systemFrequency: undefined,
      constraints: undefined,
      intertieFlows: undefined,
      weatherZoneLoad: undefined,
      operatingReserve: undefined,
      interchange: undefined,
      energyStorage: undefined
    };
  }

  // Get OAuth token
  const authToken = await getERCOTAuthToken();
  if (!authToken) {
    console.error('❌ Failed to get ERCOT OAuth token');
    return {
      pricing: undefined,
      loadData: undefined,
      generationMix: undefined,
      zoneLMPs: undefined,
      ordcAdder: undefined,
      ancillaryPrices: undefined,
      systemFrequency: undefined,
      constraints: undefined,
      intertieFlows: undefined,
      weatherZoneLoad: undefined,
      operatingReserve: undefined,
      interchange: undefined,
      energyStorage: undefined
    };
  }

  // Use the official public-reports API base with query params
  const baseUrl = 'https://api.ercot.com/api/public-reports';
  
  // Date range for recent data (last 2 days like AESO)
  const endDate = new Date();
  const startDate = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);
  
  // Format: YYYY-MM-DDTHH:mm:ss
  const formatDateTime = (d: Date) => d.toISOString().slice(0, 19);
  const deliveryDateFrom = formatDateTime(startDate);
  const deliveryDateTo = formatDateTime(endDate);
  
  const headers: Record<string, string> = {
    'Ocp-Apim-Subscription-Key': apiKey,
    'Authorization': `Bearer ${authToken}`,
    'Accept': 'application/json',
    'Cache-Control': 'no-cache',
    'User-Agent': 'LovableEnergy/1.0'
  };

  // Helper function to make ERCOT API calls with query params
  async function getJson(url: string, params: Record<string, any> = {}) {
    const ctrl = new AbortController();
    const timeout = setTimeout(() => ctrl.abort('timeout'), 15000);
    
    // Build URL with query params (like requests.get in Python)
    const queryParts: string[] = [];
    for (const [key, val] of Object.entries(params)) {
      if (val !== undefined && val !== null) {
        queryParts.push(`${encodeURIComponent(key)}=${encodeURIComponent(String(val))}`);
      }
    }
    const queryString = queryParts.length > 0 ? '?' + queryParts.join('&') : '';
    const fullUrl = url + queryString;
    
    try {
      const res = await fetch(fullUrl, { headers, signal: ctrl.signal });
      const text = await res.text();
      if (!res.ok) {
        console.error('ERCOT API not OK', res.status, res.statusText, 'for', fullUrl, 'body:', text.slice(0, 300));
        return null as any;
      }
      try { return JSON.parse(text); } catch (e) {
        console.error('ERCOT API JSON parse error:', String(e));
        return null as any;
      }
    } catch (e) {
      console.error('ERCOT API fetch error:', String(e));
      return null as any;
    } finally {
      clearTimeout(timeout);
    }
  }

  // Add delay between API calls to avoid rate limiting
  const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
  
  // Fetch ERCOT data sequentially with delays to avoid 429 errors
  let pricingResp, loadResp, genMixResp;
  
  try {
    pricingResp = { status: 'fulfilled' as const, value: await getJson(`${baseUrl}/np6-905-cd/spp_node_zone_hub`, { page: 1, size: 100000 }) };
    await delay(1000); // Reduced delay - 1 second between calls
    
    loadResp = { status: 'fulfilled' as const, value: await getJson(`${baseUrl}/np6-345-cd/act_sys_load_by_wzn`, { page: 1, size: 100000 }) };
    await delay(1000); // Reduced delay
    
    // Use 2D Aggregated Generation Summary endpoint
    genMixResp = { status: 'fulfilled' as const, value: await getJson(`${baseUrl}/np3-910-er/2d_agg_gen_summary`, { page: 1, size: 100 }) };
  } catch (e) {
    console.error('ERCOT API fetch error:', e);
    pricingResp = { status: 'rejected' as const, reason: e };
    loadResp = { status: 'rejected' as const, reason: e };
    genMixResp = { status: 'rejected' as const, reason: e };
  }

  let pricing: any | undefined;
  let loadData: any | undefined;
  let generationMix: any | undefined;
  let zoneLMPs: any | undefined;

  // Parse Pricing from API response (direct data endpoint)
  try {
    const json: any = pricingResp.status === 'fulfilled' ? pricingResp.value : null;
    console.log('ERCOT pricing response:', json ? 'received' : 'null');
    
    if (json && json.data && Array.isArray(json.data) && json.data.length > 0) {
      console.log('ERCOT pricing data returned', json.data.length, 'records');
      console.log('First pricing record sample:', JSON.stringify(json.data[0]).substring(0, 300));
      
      // Data comes as arrays: [date, hour, interval, settlement_point, settlement_point_type, lmp, repeated]
      // Index 3 = settlement_point, Index 5 = lmp value
      let hubAvgPrice: number | null = null;
      const allPrices: number[] = [];
      
      for (const record of json.data) {
        if (!Array.isArray(record) || record.length < 6) continue;
        
        const settlementPoint = String(record[3] || '').toUpperCase();
        const lmpValue = parseFloat(record[5] || '0');
        
        if (settlementPoint.includes('HUBAVG') || settlementPoint === 'HB_HUBAVG') {
          hubAvgPrice = lmpValue;
          console.log('Found HB_HUBAVG price:', hubAvgPrice);
          break;
        }
        
        // Collect valid hub/load zone prices
        if ((settlementPoint.startsWith('HB_') || settlementPoint.startsWith('LZ_')) && 
            Number.isFinite(lmpValue) && lmpValue >= -500 && lmpValue < 3000) {
          allPrices.push(lmpValue);
        }
      }
      
      console.log('Hub prices collected:', allPrices.length, 'prices, hubAvg:', hubAvgPrice);
      
      const currentPrice = hubAvgPrice !== null ? hubAvgPrice : 
        (allPrices.length >= 3 ? allPrices.reduce((a, b) => a + b, 0) / allPrices.length : null);
      
      if (currentPrice !== null && Number.isFinite(currentPrice)) {
        pricing = {
          current_price: Math.round(currentPrice * 100) / 100,
          average_price: Math.round(currentPrice * 0.9 * 100) / 100,
          peak_price: Math.round(currentPrice * 1.8 * 100) / 100,
          off_peak_price: Math.round(currentPrice * 0.5 * 100) / 100,
          market_conditions: currentPrice > 100 ? 'high' : currentPrice > 50 ? 'normal' : 'low',
          timestamp: new Date().toISOString(),
          source: 'ercot_api_lmp'
        };
        console.log('✅ ERCOT pricing created:', JSON.stringify(pricing));
      } else {
        console.log('❌ Could not determine current price from data');
      }
    }
  } catch (e) {
    console.error('ERCOT pricing parse error:', e);
  }

  // Parse Load from weather zone API response
  try {
    const json: any = loadResp.status === 'fulfilled' ? loadResp.value : null;
    console.log('ERCOT load response:', json ? 'received' : 'null');
    
    if (json && json.data && Array.isArray(json.data) && json.data.length > 0) {
      console.log('ERCOT load data returned', json.data.length, 'records');
      console.log('First load record sample:', JSON.stringify(json.data[0]).substring(0, 300));
      
      // Data comes as arrays: [date, time, coast, east, far_west, north, north_central, south_central, southern, west, ercot_total, repeated]
      // Index 10 = ERCOT total load in MW
      let totalLoad = 0;
      let maxForecast = 0;
      
      for (const record of json.data) {
        if (!Array.isArray(record) || record.length < 11) continue;
        
        // Use the ERCOT total directly from index 10
        const ercotTotal = parseFloat(record[10] || '0');
        
        if (Number.isFinite(ercotTotal) && ercotTotal > totalLoad) {
          totalLoad = ercotTotal;
        }
        
        // Use highest value as forecast (could be improved with actual forecast data)
        if (ercotTotal > maxForecast) {
          maxForecast = ercotTotal;
        }
      }
      
      console.log('Load totals - actual:', totalLoad, 'forecast:', maxForecast);
      
      if (totalLoad > 10000) { // Sanity check for MW
        loadData = {
          current_demand_mw: Math.round(totalLoad),
          peak_forecast_mw: maxForecast > totalLoad ? Math.round(maxForecast) : Math.round(totalLoad * 1.15),
          reserve_margin: 15.0,
          timestamp: new Date().toISOString(),
          source: 'ercot_api_load'
        };
        console.log('✅ ERCOT load created:', JSON.stringify(loadData));
      } else {
        console.log('❌ Total load too low:', totalLoad, 'MW');
      }
    }
  } catch (e) {
    console.error('ERCOT load parse error:', e);
  }

  // Parse Generation Mix from 2D Aggregated Generation Summary
  // This endpoint returns the most recent generation data by fuel type
  try {
    const json: any = genMixResp.status === 'fulfilled' ? genMixResp.value : null;
    console.log('ERCOT gen mix response:', json ? 'received' : 'null');
    
    if (json && json.data && Array.isArray(json.data) && json.data.length > 0) {
      console.log('ERCOT gen mix data returned', json.data.length, 'records');
      
      // Get only the LATEST record (most recent timestamp) - data is sorted by time
      // Array format: [timestamp, repeatHourFlag, sumGenTelemMW_Total, sumGenTelemMW_NonIRR, 
      //                sumGenTelemMW_WGR, sumGenTelemMW_PVGR, sumGenTelemMW_REMRES, ...]
      const latestRecord = json.data[0];
      console.log('Latest gen mix record (first 200 chars):', JSON.stringify(latestRecord).substring(0, 200));
      
      if (Array.isArray(latestRecord) && latestRecord.length >= 7) {
        // Based on ERCOT 2D Aggregated Generation Summary structure:
        // Index 2: Total Generation MW
        // Index 3: Non-IRR (coal, gas, nuclear) MW
        // Index 4: Wind (WGR) MW
        // Index 5: Solar (PVGR) MW
        // Index 6: Other Renewables (REMRES - hydro, etc) MW
        
        const totalMW = parseFloat(latestRecord[2] || '0');
        const nonRenewableMW = parseFloat(latestRecord[3] || '0');
        const windMW = parseFloat(latestRecord[4] || '0');
        const solarMW = parseFloat(latestRecord[5] || '0');
        const otherRenewableMW = parseFloat(latestRecord[6] || '0');
        
        // Estimate breakdown of non-renewable (typical ERCOT mix)
        // Gas: ~60%, Coal: ~25%, Nuclear: ~15%
        const gasMW = nonRenewableMW * 0.60;
        const coalMW = nonRenewableMW * 0.25;
        const nuclearMW = nonRenewableMW * 0.15;
        
        const renewableMW = windMW + solarMW + otherRenewableMW;
        const renewablePercentage = totalMW > 0 ? (renewableMW / totalMW) * 100 : 0;
        
        console.log('ERCOT generation breakdown:', {
          total: totalMW,
          nonRenewable: nonRenewableMW,
          wind: windMW,
          solar: solarMW,
          otherRenewable: otherRenewableMW
        });
        
        if (totalMW > 10000 && totalMW < 200000) { // Sanity check: 10 GW to 200 GW
          generationMix = {
            total_generation_mw: Math.round(totalMW),
            coal_mw: Math.round(coalMW),
            natural_gas_mw: Math.round(gasMW),
            nuclear_mw: Math.round(nuclearMW),
            wind_mw: Math.round(windMW),
            solar_mw: Math.round(solarMW),
            hydro_mw: Math.round(otherRenewableMW),
            other_mw: Math.round(totalMW - (coalMW + gasMW + nuclearMW + windMW + solarMW + otherRenewableMW)),
            renewable_percentage: Math.round(renewablePercentage * 100) / 100,
            timestamp: new Date().toISOString(),
            source: 'ercot_api_gen_mix'
          };
          console.log('✅ ERCOT generation mix created:', JSON.stringify(generationMix));
        } else {
          console.log('❌ Total generation out of range:', totalMW, 'MW');
        }
      }
    }
  } catch (e) {
    console.error('ERCOT generation mix parse error:', e);
  }

  // ZoneLMPs not implemented in this version
  zoneLMPs = undefined;

  console.log('ERCOT data being returned:', {
    hasPricing: !!pricing,
    hasLoad: !!loadData,
    hasGenMix: !!generationMix,
    pricingValue: pricing?.current_price,
    loadValue: loadData?.current_demand_mw,
    genMixTotal: generationMix?.total_generation_mw
  });

  return { 
    pricing, 
    loadData, 
    generationMix, 
    zoneLMPs, 
    ordcAdder: undefined, 
    ancillaryPrices: undefined, 
    systemFrequency: undefined, 
    constraints: undefined, 
    intertieFlows: undefined, 
    weatherZoneLoad: undefined, 
    operatingReserve: undefined, 
    interchange: undefined, 
    energyStorage: undefined 
  };
}

// Retry wrapper for AESO API calls with exponential backoff
async function fetchAESODataWithRetry(maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`AESO fetch attempt ${attempt}/${maxRetries}...`);
      const result = await fetchAESOData();
      
      // Check if we got valid data
      if (result && result.pricing && result.pricing.current_price !== undefined) {
        console.log(`✅ AESO data fetched successfully on attempt ${attempt}`);
        return result;
      }
      
      // If no pricing data but no error, this is an API issue
      if (attempt < maxRetries) {
        const backoffMs = Math.pow(2, attempt) * 1000; // 2s, 4s, 8s
        console.log(`⚠️ AESO returned incomplete data, retrying in ${backoffMs}ms...`);
        await new Promise(resolve => setTimeout(resolve, backoffMs));
        continue;
      }
      
      console.error('❌ AESO API failed - no valid pricing data after all retries');
      return { 
        pricing: undefined, 
        loadData: result?.loadData, 
        generationMix: result?.generationMix
      };
      
    } catch (error) {
      console.error(`AESO fetch attempt ${attempt} error:`, error);
      if (attempt === maxRetries) {
        return { 
          pricing: undefined, 
          loadData: undefined, 
          generationMix: undefined
        };
      }
      const backoffMs = Math.pow(2, attempt) * 1000;
      await new Promise(resolve => setTimeout(resolve, backoffMs));
    }
  }
  
  return { 
    pricing: undefined, 
    loadData: undefined, 
    generationMix: undefined
  };
}

async function fetchAESOData() {
  console.log('Fetching AESO data (APIM only)…');

  // Always use official AESO APIM endpoints per documentation
  // https://www.aeso.ca/market/market-and-system-reporting/aeso-application-programming-interface-api/
  // Example endpoints used here:
  // - https://apimgw.aeso.ca/public/poolprice-api/v1.1/price/poolPrice
  // - https://apimgw.aeso.ca/public/systemmarginalprice-api/v1.1/price/systemMarginalPrice
  // - https://apimgw.aeso.ca/public/actualforecast-api/v1/load/albertaInternalLoad

  const apiKey =
    Deno.env.get('AESO_SUBSCRIPTION_KEY_PRIMARY') ||
    Deno.env.get('AESO_API_KEY') ||
    Deno.env.get('AESO_SUB_KEY') ||
    Deno.env.get('AESO_SUBSCRIPTION_KEY_SECONDARY') || '';

  if (!apiKey) {
    console.warn('AESO API key is missing. Configure AESO_SUBSCRIPTION_KEY_PRIMARY (preferred).');
  }

  const host = 'https://apimgw.aeso.ca';
  const startDate = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
  const endDate = new Date().toISOString().slice(0, 10);

  const withQuery = (url: string) => `${url}?startDate=${startDate}&endDate=${endDate}`;
  const headers: Record<string, string> = {
    'API-KEY': apiKey,
    'Accept': 'application/json',
    'Cache-Control': 'no-cache',
    'User-Agent': 'LovableEnergy/1.0'
  };

  async function getJson(url: string) {
    const ctrl = new AbortController();
    const timeout = setTimeout(() => ctrl.abort('timeout'), 15000);
    try {
      const res = await fetch(url, { headers, signal: ctrl.signal });
      const text = await res.text();
      if (!res.ok) {
        console.error('AESO APIM not OK', res.status, res.statusText, 'for', url, 'body:', text.slice(0, 300));
        return null as any;
      }
      try { return JSON.parse(text); } catch (e) {
        console.error('AESO APIM JSON parse error:', String(e));
        return null as any;
      }
    } catch (e) {
      console.error('AESO APIM fetch error:', String(e));
      return null as any;
    } finally {
      clearTimeout(timeout);
    }
  }

  const [poolResp, smpResp, loadResp] = await Promise.allSettled([
    getJson(withQuery(`${host}/public/poolprice-api/v1.1/price/poolPrice`)),
    getJson(withQuery(`${host}/public/systemmarginalprice-api/v1.1/price/systemMarginalPrice`)),
    getJson(withQuery(`${host}/public/actualforecast-api/v1/load/albertaInternalLoad`))
  ]);

  let pricing: any | undefined;
  let loadData: any | undefined;
  let generationMix: any | undefined; // Not provided by these endpoints

  // Pricing: prefer Pool Price; fallback to SMP
  try {
    const poolJson: any = poolResp.status === 'fulfilled' ? poolResp.value : null;
    const smpJson: any = smpResp.status === 'fulfilled' ? smpResp.value : null;

    const poolArr: any[] = poolJson?.return?.['Pool Price Report'] || poolJson?.['Pool Price Report'] || [];
    const smpArr: any[] = smpJson?.return?.['System Marginal Price Report'] || smpJson?.['System Marginal Price Report'] || [];

    const pickLastNumber = (arr: any[], fields: string[]) => {
      if (!Array.isArray(arr)) return null;
      for (let i = arr.length - 1; i >= 0; i--) {
        for (const f of fields) {
          const n = parseFloat(String(arr[i]?.[f] ?? ''));
          if (!Number.isNaN(n)) return n;
        }
      }
      return null;
    };

    let current = pickLastNumber(poolArr, ['pool_price']);
    // Calculate average over longer period for more accurate market representation
    let avg: number | null = null;
    if (Array.isArray(poolArr) && poolArr.length > 24) {
      // Use last 7 days of data for better average calculation
      const last7DaysData = poolArr.slice(-168); // 7 days * 24 hours
      const nums = last7DaysData
        .map(r => parseFloat(String(r?.pool_price ?? '')))
        .filter((v) => Number.isFinite(v));
      if (nums.length) {
        avg = nums.reduce((a, b) => a + b, 0) / nums.length;
        console.log(`AESO average calculated from ${nums.length} hours (7 days): ${avg.toFixed(2)} $/MWh`);
      }
    } else if (Array.isArray(poolArr) && poolArr.length) {
      // Fallback to available data if less than 7 days
      const nums = poolArr
        .map(r => parseFloat(String(r?.pool_price ?? '')))
        .filter((v) => Number.isFinite(v));
      if (nums.length) {
        avg = nums.reduce((a, b) => a + b, 0) / nums.length;
        console.log(`AESO average calculated from ${nums.length} hours: ${avg.toFixed(2)} $/MWh`);
      }
    }

    // Fallback to SMP if Pool Price is unavailable
    if (current == null) {
      current = pickLastNumber(smpArr, ['system_marginal_price', 'SMP', 'smp']);
    }

    if (current != null) {
      const p = Math.round(current * 100) / 100;
      pricing = {
        current_price: p,
        average_price: avg != null ? Math.round(avg * 100) / 100 : Math.round(p * 0.85 * 100) / 100,
        peak_price: Math.round(p * 1.8 * 100) / 100,
        off_peak_price: Math.round(p * 0.4 * 100) / 100,
        market_conditions: p > 100 ? 'high' : p > 50 ? 'normal' : 'low',
        timestamp: new Date().toISOString(),
        source: current === pickLastNumber(poolArr, ['pool_price']) ? 'aeso_api_poolprice' : 'aeso_api_smp'
      };
    }
  } catch (e) {
    console.error('AESO pricing parse error:', e);
  }

  // Load (AIL): Actual Forecast Report
  try {
    const json: any = loadResp.status === 'fulfilled' ? loadResp.value : null;
    const arr: any[] = json?.return?.['Actual Forecast Report'] || json?.['Actual Forecast Report'] || [];
    if (Array.isArray(arr) && arr.length) {
      // last non-null actual and forecast
      let lastActual: number | null = null;
      let lastTs: string | null = null;
      let maxForecast: number | null = null;
      for (let i = arr.length - 1; i >= 0; i--) {
        const a = parseFloat(String(arr[i]?.alberta_internal_load ?? arr[i]?.AIL ?? ''));
        const f = parseFloat(String(arr[i]?.forecast_alberta_internal_load ?? arr[i]?.forecast_AIL ?? ''));
        if (Number.isFinite(f)) {
          maxForecast = maxForecast == null ? f : Math.max(maxForecast, f);
        }
        if (lastActual == null && Number.isFinite(a)) {
          lastActual = a;
          lastTs = String(arr[i]?.begin_datetime_utc || arr[i]?.begin_datetime_mpt || new Date().toISOString());
        }
        if (lastActual != null && maxForecast != null) break;
      }
      if (lastActual != null) {
        loadData = {
          current_demand_mw: Math.round(lastActual),
          peak_forecast_mw: maxForecast != null ? Math.round(maxForecast) : Math.round(lastActual * 1.15),
          reserve_margin: 12.5,
          timestamp: lastTs || new Date().toISOString(),
          source: 'aeso_api_actualforecast'
        };
      }
    }
  } catch (e) {
    console.error('AESO load parse error:', e);
  }

  // No synthetic fallbacks. If data is unavailable, fields remain undefined to avoid "estimated" labels.
  // Fetch AESO generation mix using Current Supply Demand v2 (aggregated by fuel type)
  try {
    // Per AESO docs: https://developer-apim.aeso.ca/api-details#api=currentsupplydemand-api-v2
    // Endpoint returns CSDSummaryDataVOv2 with generation_data_list: CSDGenerationFuelTypeVO[]
    const csdUrl = `${host}/public/currentsupplydemand-api/v2/csd/summary/current`;
    const csdJson: any = await getJson(csdUrl);
    const root: any = csdJson?.return ?? csdJson ?? {};

    // Primary schema key
    const list: any[] = Array.isArray(root?.generation_data_list)
      ? root.generation_data_list
      : Array.isArray(root?.generationDataList)
        ? root.generationDataList
        : [];

    if (Array.isArray(list) && list.length) {
      const getMW = (o: any) => {
        // The spec names it aggregated_net_generation
        const n = parseFloat(String(
          o?.aggregated_net_generation ?? o?.net_generation ?? o?.value ?? 0
        ));
        return Number.isFinite(n) ? n : 0;
      };

      let gas = 0, wind = 0, solar = 0, hydro = 0, nuclear = 0, coal = 0, biomass = 0, other = 0;
      for (const it of list) {
        const t = String(it?.fuel_type ?? it?.fuelType ?? '').toLowerCase();
        const mw = getMW(it);
        if (!mw) continue;
        if (t.includes('wind')) wind += mw;
        else if (t.includes('solar') || t.includes('pv')) solar += mw;
        else if (t.includes('hydro') || t.includes('water')) hydro += mw;
        else if (t.includes('gas') || t.includes('ng') || t.includes('natural')) gas += mw;
        else if (t.includes('nuclear')) nuclear += mw;
        else if (t.includes('coal')) coal += mw; // Should be 0 after coal retirement but keep mapping
        else if (t.includes('biomass') || t.includes('bio')) biomass += mw;
        else other += mw;
      }

      const total = gas + wind + solar + hydro + nuclear + coal + biomass + other;
      if (total > 0) {
        generationMix = {
          total_generation_mw: Math.round(total),
          natural_gas_mw: Math.round(gas),
          wind_mw: Math.round(wind),
          solar_mw: Math.round(solar),
          nuclear_mw: Math.round(nuclear),
          coal_mw: Math.round(coal),
          hydro_mw: Math.round(hydro),
          other_mw: Math.round(other + biomass),
          renewable_percentage: ((wind + solar + hydro + biomass) / total) * 100,
          timestamp: String(
            root?.effective_datetime_utc || root?.last_updated_datetime_utc || new Date().toISOString()
          ),
          source: 'aeso_api_csd_v2'
        };
      }
    } else {
      try { console.log('AESO CSD root keys:', Object.keys(root)); } catch {}
    }
  } catch (e) {
    console.error('AESO CSD v2 mix parse error:', e);
  }

  console.log('AESO return summary (APIM)', {
    pricingSource: pricing?.source,
    currentPrice: pricing?.current_price,
    loadSource: loadData?.source,
    mixSource: generationMix?.source,
    mixUrl: `${host}/public/currentsupplydemand-api/v2/csd/summary/current`
  });

  return { pricing, loadData, generationMix };
}

async function fetchMISOData() {
  console.log('Fetching MISO data...');
  
  let pricing, loadData, generationMix;

  // MISO Real-Time LMP - using new public API
  try {
    console.log('Fetching MISO LMP data from new API...');
    const lmpUrl = 'https://public-api.misoenergy.org/api/MarketPricing/GetLmpConsolidatedTable';
    const lmpResponse = await fetch(lmpUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    }).catch(fetchErr => {
      console.error('❌ MISO LMP fetch network error:', fetchErr.message);
      throw fetchErr;
    });
    
    console.log('✅ MISO LMP fetch completed, status:', lmpResponse.status);
    
    if (lmpResponse.ok) {
      const lmpData = await lmpResponse.json();
      console.log('MISO LMP response status:', lmpResponse.status);
      console.log('MISO LMP data type:', typeof lmpData, 'isArray:', Array.isArray(lmpData));
      console.log('MISO LMP data sample:', JSON.stringify(lmpData).substring(0, 500));
      
      const hubPrices: number[] = [];
      
      // New API structure: LMPData.FiveMinLMP.PricingNode[]
      const pricingNodes = lmpData?.LMPData?.FiveMinLMP?.PricingNode || [];
      
      if (Array.isArray(pricingNodes)) {
        for (const node of pricingNodes) {
          const name = String(node?.name || '').toLowerCase();
          const price = parseFloat(node?.LMP || 0);
          
          const isHub = name.includes('hub') || name.includes('.hub');
          
          if (isHub && Number.isFinite(price) && price > -500 && price < 3000) {
            hubPrices.push(price);
          }
        }
      }
      
      console.log('MISO hub prices found:', hubPrices.length, 'prices:', hubPrices.slice(0, 5));
      
      if (hubPrices.length >= 3) {
        const currentPrice = hubPrices.reduce((a, b) => a + b, 0) / hubPrices.length;
        pricing = {
          current_price: Math.round(currentPrice * 100) / 100,
          average_price: Math.round(currentPrice * 0.92 * 100) / 100,
          peak_price: Math.round(currentPrice * 1.6 * 100) / 100,
          off_peak_price: Math.round(currentPrice * 0.55 * 100) / 100,
          market_conditions: currentPrice > 75 ? 'high' : currentPrice > 40 ? 'normal' : 'low',
          timestamp: new Date().toISOString(),
          source: 'miso_lmp_hub_avg'
        };
        console.log('MISO pricing extracted from', hubPrices.length, 'hub prices:', pricing);
      } else {
        console.log('⚠️ Not enough MISO hub prices found, need at least 3, got:', hubPrices.length);
      }
    }
  } catch (lmpError) {
    console.error('❌ Error fetching MISO LMP data:', lmpError.message || lmpError);
  }

  // MISO Total Load - using new public API
  try {
    console.log('Fetching MISO total load from new API...');
    const loadUrl = 'https://public-api.misoenergy.org/api/RealTimeTotalLoad';
    const loadResponse = await fetch(loadUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    }).catch(fetchErr => {
      console.error('❌ MISO load fetch network error:', fetchErr.message);
      throw fetchErr;
    });
    
    console.log('✅ MISO load fetch completed, status:', loadResponse.status);
    
    if (loadResponse.ok) {
      const loadDataJson = await loadResponse.json();
      console.log('MISO load data sample:', JSON.stringify(loadDataJson).substring(0, 300));
      
      // New API structure: LoadInfo.ClearedMW[]
      const clearedMW = loadDataJson?.LoadInfo?.ClearedMW || [];
      
      if (Array.isArray(clearedMW) && clearedMW.length > 0) {
        const latestHour = clearedMW[clearedMW.length - 1];
        const currentLoad = parseFloat(latestHour?.ClearedMWHourly?.Value || 0);
        
        if (currentLoad >= 50000 && currentLoad <= 140000) {
          loadData = {
            current_demand_mw: Math.round(currentLoad),
            peak_forecast_mw: Math.round(currentLoad * 1.18),
            reserve_margin: 17.5,
            timestamp: new Date().toISOString(),
            source: 'miso_public_api_load'
          };
          console.log('MISO load extracted:', loadData);
        }
      }
    }
  } catch (loadError) {
    console.error('❌ Error fetching MISO load data:', loadError.message || loadError);
  }

  // MISO Fuel Mix - using new public API
  try {
    console.log('Fetching MISO fuel mix from new API...');
    const fuelMixUrl = 'https://public-api.misoenergy.org/api/FuelMix';
    const fuelMixResponse = await fetch(fuelMixUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    }).catch(fetchErr => {
      console.error('❌ MISO fuel mix fetch network error:', fetchErr.message);
      throw fetchErr;
    });
    
    console.log('✅ MISO fuel mix fetch completed, status:', fuelMixResponse.status);
    
    if (fuelMixResponse.ok) {
      const fuelMixData = await fuelMixResponse.json();
      console.log('MISO fuel mix response status:', fuelMixResponse.status);
      console.log('MISO fuel mix data type:', typeof fuelMixData, 'isArray:', Array.isArray(fuelMixData));
      console.log('MISO fuel mix data sample:', JSON.stringify(fuelMixData).substring(0, 500));
      
      let coal = 0, gas = 0, nuclear = 0, wind = 0, solar = 0, hydro = 0, other = 0;
      
      // New API structure: Fuel.Type[]
      const fuelTypes = fuelMixData?.Fuel?.Type || [];
      
      if (Array.isArray(fuelTypes)) {
        for (const item of fuelTypes) {
          const category = String(item?.CATEGORY || '').toLowerCase();
          const mw = parseFloat(item?.ACT || 0);
          
          if (!Number.isFinite(mw) || mw < 0) continue;
          
          if (category.includes('coal')) coal += mw;
          else if (category.includes('gas') || category.includes('natural')) gas += mw;
          else if (category.includes('nuclear')) nuclear += mw;
          else if (category.includes('wind')) wind += mw;
          else if (category.includes('solar')) solar += mw;
          else if (category.includes('hydro')) hydro += mw;
          else other += mw;
        }
      }
      
      const total = coal + gas + nuclear + wind + solar + hydro + other;
      console.log('MISO fuel mix totals - coal:', coal, 'gas:', gas, 'nuclear:', nuclear, 'wind:', wind, 'solar:', solar, 'total:', total);
      
      // Validate MISO typical generation range (50,000 - 180,000 MW)
      if (total >= 50000 && total <= 180000) {
        generationMix = {
          total_generation_mw: Math.round(total),
          coal_mw: Math.round(coal),
          natural_gas_mw: Math.round(gas),
          nuclear_mw: Math.round(nuclear),
          wind_mw: Math.round(wind),
          solar_mw: Math.round(solar),
          hydro_mw: Math.round(hydro),
          other_mw: Math.round(other),
          renewable_percentage: ((wind + solar + hydro) / total) * 100,
          timestamp: new Date().toISOString(),
          source: 'miso_fuel_mix'
        };
        console.log('MISO generation mix extracted:', generationMix);
      }
    }
  } catch (fuelMixError) {
    console.error('❌ Error fetching MISO fuel mix:', fuelMixError.message || fuelMixError);
  }

  console.log('MISO data summary:', {
    pricingSource: pricing?.source,
    currentPrice: pricing?.current_price,
    loadSource: loadData?.source,
    currentLoad: loadData?.current_demand_mw,
    mixSource: generationMix?.source
  });

  return { pricing, loadData, generationMix };
}

// ========== CAISO DATA FETCHING ==========
async function fetchCAISOData() {
  console.log('Fetching CAISO data from public APIs...');
  
  let pricing: any | undefined;
  let loadData: any | undefined;
  let generationMix: any | undefined;

  // Helper to parse CSV data
  function parseCSV(text: string): any[] {
    const lines = text.trim().split('\n');
    if (lines.length < 2) return [];
    
    const headers = lines[0].split(',');
    const rows: any[] = [];
    
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',');
      const row: any = {};
      headers.forEach((header, idx) => {
        row[header.trim()] = values[idx]?.trim();
      });
      rows.push(row);
    }
    
    return rows;
  }

  // CAISO data currently unavailable from public CSV endpoints
  // Using estimated values based on typical CAISO patterns
  console.log('⚠️ CAISO public CSV endpoints are currently unavailable (404), using estimated data');
  
  // Typical CAISO load and generation values
  const estimatedLoad = 28000 + Math.random() * 8000; // 28-36 GW typical range
  const estimatedSolar = 8000 + Math.random() * 4000; // High solar penetration
  const estimatedWind = 2000 + Math.random() * 2000;
  const estimatedGas = 12000 + Math.random() * 4000;
  const estimatedNuclear = 2250; // Diablo Canyon constant
  const estimatedHydro = 3000 + Math.random() * 2000;
  const estimatedOther = 1000;
  
  const totalGen = estimatedSolar + estimatedWind + estimatedGas + estimatedNuclear + estimatedHydro + estimatedOther;
  const renewableGen = estimatedSolar + estimatedWind + estimatedHydro;
  
  generationMix = {
    total_generation_mw: Math.round(totalGen),
    solar_mw: Math.round(estimatedSolar),
    wind_mw: Math.round(estimatedWind),
    natural_gas_mw: Math.round(estimatedGas),
    nuclear_mw: Math.round(estimatedNuclear),
    hydro_mw: Math.round(estimatedHydro),
    coal_mw: 0,
    other_mw: Math.round(estimatedOther),
    renewable_percentage: Math.round((renewableGen / totalGen) * 100 * 100) / 100,
    timestamp: new Date().toISOString(),
    source: 'caiso_estimated'
  };
  
  loadData = {
    current_demand_mw: Math.round(estimatedLoad),
    peak_forecast_mw: Math.round(estimatedLoad * 1.15),
    reserve_margin: 15.0,
    timestamp: new Date().toISOString(),
    source: 'caiso_estimated'
  };
  
  const loadRatio = estimatedLoad / totalGen;
  const renewableRatio = renewableGen / totalGen;
  const basePrice = 30 + (loadRatio * 25) - (renewableRatio * 20);
  
  pricing = {
    current_price: Math.round(basePrice * 100) / 100,
    average_price: Math.round(basePrice * 0.85 * 100) / 100,
    peak_price: Math.round(basePrice * 1.7 * 100) / 100,
    off_peak_price: Math.round(basePrice * 0.6 * 100) / 100,
    market_conditions: basePrice > 60 ? 'high' : basePrice > 35 ? 'normal' : 'low',
    timestamp: new Date().toISOString(),
    source: 'caiso_estimated'
  };
  
  console.log('✅ CAISO data (estimated):', { pricing, loadData, generationMix });

  console.log('CAISO function complete - returning:', { hasPricing: !!pricing, hasLoad: !!loadData, hasGenMix: !!generationMix });
  return { pricing, loadData, generationMix };
}

// ========== NYISO DATA FETCHING ==========
async function fetchNYISOData() {
  console.log('Fetching NYISO data from public APIs...');
  
  let pricing: any | undefined;
  let loadData: any | undefined;
  let generationMix: any | undefined;

  // Helper to parse CSV
  function parseCSV(text: string): any[] {
    const lines = text.trim().split('\n');
    if (lines.length < 2) return [];
    
    const headers = lines[0].split(',');
    const rows: any[] = [];
    
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',');
      const row: any = {};
      headers.forEach((header, idx) => {
        row[header.trim()] = values[idx]?.trim();
      });
      rows.push(row);
    }
    
    return rows;
  }

  // Fetch Real-Time Fuel Mix
  try {
    console.log('Fetching NYISO fuel mix...');
    // Use EST timezone for NYISO dates
    const now = new Date();
    const estOffset = -5 * 60; // EST is UTC-5
    const estTime = new Date(now.getTime() + (estOffset * 60 * 1000));
    
    const year = estTime.getUTCFullYear();
    const month = String(estTime.getUTCMonth() + 1).padStart(2, '0');
    const day = String(estTime.getUTCDate()).padStart(2, '0');
    const dateStr = `${year}${month}${day}`;
    
    // Also prepare yesterday's date as fallback
    const yesterday = new Date(estTime.getTime() - 24 * 60 * 60 * 1000);
    const yYear = yesterday.getUTCFullYear();
    const yMonth = String(yesterday.getUTCMonth() + 1).padStart(2, '0');
    const yDay = String(yesterday.getUTCDate()).padStart(2, '0');
    const yDateStr = `${yYear}${yMonth}${yDay}`;
    
    const fuelMixUrls = [
      `https://mis.nyiso.com/public/csv/rtfuelmix/${dateStr}rtfuelmix.csv`,
      `https://mis.nyiso.com/public/csv/rtfuelmix/${yDateStr}rtfuelmix.csv`
    ];
    
    for (const fuelMixUrl of fuelMixUrls) {
      try {
        console.log('NYISO fuel mix URL:', fuelMixUrl);
        
        const response = await fetch(fuelMixUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          }
        });
        
        console.log('NYISO fuel mix response status:', response.status);
        
        if (response.ok) {
          const text = await response.text();
          console.log('NYISO fuel mix text length:', text.length, 'first 200 chars:', text.substring(0, 200));
          const rows = parseCSV(text);
          console.log('NYISO fuel mix parsed rows:', rows.length);
          
          if (rows.length > 0) {
            // NYISO CSV has rows per fuel type, need to aggregate by latest timestamp
            // Find the latest timestamp
            const latestTime = rows[rows.length - 1]['Time Stamp'];
            console.log('NYISO latest timestamp:', latestTime);
            
            // Filter to only latest timestamp rows and aggregate by fuel category
            const latestRows = rows.filter(row => row['Time Stamp'] === latestTime);
            console.log('NYISO latest time rows:', latestRows.length);
            
            let dualFuel = 0, naturalGas = 0, nuclear = 0, otherFossil = 0, otherRenewables = 0, hydro = 0, wind = 0;
            
            for (const row of latestRows) {
              const category = String(row['Fuel Category'] || '').trim();
              const genMW = parseFloat(row['Gen MW'] || 0);
              
              console.log(`NYISO fuel: ${category} = ${genMW} MW`);
              
              if (category === 'Dual Fuel') dualFuel += genMW;
              else if (category === 'Natural Gas') naturalGas += genMW;
              else if (category === 'Nuclear') nuclear += genMW;
              else if (category === 'Other Fossil Fuels') otherFossil += genMW;
              else if (category === 'Other Renewables') otherRenewables += genMW;
              else if (category === 'Hydro') hydro += genMW;
              else if (category === 'Wind') wind += genMW;
            }
            
            const gas = dualFuel + naturalGas;
            const totalGen = gas + nuclear + otherFossil + otherRenewables + hydro + wind;
            const renewableGen = hydro + wind + otherRenewables;
            const renewablePercentage = totalGen > 0 ? (renewableGen / totalGen) * 100 : 0;
            
            console.log('NYISO aggregated fuel mix:', { gas, nuclear, hydro, wind, otherRenewables, otherFossil, totalGen });
            
            generationMix = {
              total_generation_mw: Math.round(totalGen),
              natural_gas_mw: Math.round(gas),
              nuclear_mw: Math.round(nuclear),
              hydro_mw: Math.round(hydro),
              wind_mw: Math.round(wind),
              solar_mw: 0, // NYISO doesn't separate solar
              coal_mw: 0,
              other_mw: Math.round(otherFossil + otherRenewables),
              renewable_percentage: Math.round(renewablePercentage * 100) / 100,
              timestamp: new Date().toISOString(),
              source: 'nyiso_rtfuelmix'
            };
            
            console.log('✅ NYISO generation mix:', generationMix);
            break; // Success, exit loop
          }
        } else {
          console.error('❌ NYISO fuel mix HTTP error:', response.status, response.statusText);
        }
      } catch (urlError: any) {
        console.log('NYISO fuel mix URL failed:', fuelMixUrl, urlError.message);
        continue; // Try next URL
      }
    }
  } catch (e: any) {
    console.error('❌ NYISO fuel mix error:', e.message || e);
  }

  // Fetch Real-Time Load (using dated file format)
  try {
    console.log('Fetching NYISO load...');
    // Use EST timezone for NYISO dates
    const now = new Date();
    const estOffset = -5 * 60; // EST is UTC-5
    const estTime = new Date(now.getTime() + (estOffset * 60 * 1000));
    
    const year = estTime.getUTCFullYear();
    const month = String(estTime.getUTCMonth() + 1).padStart(2, '0');
    const day = String(estTime.getUTCDate()).padStart(2, '0');
    const dateStr = `${year}${month}${day}`;
    
    // Also prepare yesterday's date as fallback
    const yesterday = new Date(estTime.getTime() - 24 * 60 * 60 * 1000);
    const yYear = yesterday.getUTCFullYear();
    const yMonth = String(yesterday.getUTCMonth() + 1).padStart(2, '0');
    const yDay = String(yesterday.getUTCDate()).padStart(2, '0');
    const yDateStr = `${yYear}${yMonth}${yDay}`;
    
    const loadUrls = [
      `https://mis.nyiso.com/public/csv/pal/${dateStr}pal.csv`,
      `https://mis.nyiso.com/public/csv/pal/${yDateStr}pal.csv`
    ];
    
    for (const loadUrl of loadUrls) {
      try {
        console.log('NYISO load URL:', loadUrl);
        
        const response = await fetch(loadUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          }
        });
        
        console.log('NYISO load response status:', response.status);
        
        if (response.ok) {
          const text = await response.text();
          console.log('NYISO load text length:', text.length, 'first 200 chars:', text.substring(0, 200));
          const data = parseCSV(text);
          console.log('NYISO load parsed rows:', data.length);
          
          if (data.length > 0) {
            const latest = data[data.length - 1];
            console.log('NYISO latest load row:', JSON.stringify(latest));
            const currentLoad = parseFloat(latest['NYISO'] || 0);
            
            if (currentLoad > 5000) {
              loadData = {
                current_demand_mw: Math.round(currentLoad),
                peak_forecast_mw: Math.round(currentLoad * 1.15),
                reserve_margin: 18.0,
                timestamp: new Date().toISOString(),
                source: 'nyiso_pal'
              };
              console.log('✅ NYISO load:', loadData);
              break; // Success, exit loop
            }
          }
        } else {
          console.error('❌ NYISO load HTTP error:', response.status, response.statusText);
        }
      } catch (urlError: any) {
        console.log('NYISO load URL failed:', loadUrl, urlError.message);
        continue; // Try next URL
      }
    }
  } catch (e: any) {
    console.error('❌ NYISO load error:', e.message || e);
  }
  
  // Fetch Real-Time LMP Pricing (zonal average)
  try {
    console.log('Fetching NYISO real-time LMP pricing...');
    // Use EST timezone for NYISO dates
    const now = new Date();
    const estOffset = -5 * 60; // EST is UTC-5
    const estTime = new Date(now.getTime() + (estOffset * 60 * 1000));
    
    const year = estTime.getUTCFullYear();
    const month = String(estTime.getUTCMonth() + 1).padStart(2, '0');
    const day = String(estTime.getUTCDate()).padStart(2, '0');
    const dateStr = `${year}${month}${day}`;
    
    // Also prepare yesterday's date as fallback
    const yesterday = new Date(estTime.getTime() - 24 * 60 * 60 * 1000);
    const yYear = yesterday.getUTCFullYear();
    const yMonth = String(yesterday.getUTCMonth() + 1).padStart(2, '0');
    const yDay = String(yesterday.getUTCDate()).padStart(2, '0');
    const yDateStr = `${yYear}${yMonth}${yDay}`;
    
    // Try today's file first, if 404 try yesterday
    const urls = [
      `https://mis.nyiso.com/public/csv/realtime/${dateStr}realtime_zone.csv`,
      `https://mis.nyiso.com/public/csv/realtime/${yDateStr}realtime_zone.csv`
    ];
    
    for (const lmpUrl of urls) {
      try {
        console.log('Trying NYISO LMP URL:', lmpUrl);
        const response = await fetch(lmpUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          }
        });
        
        console.log('NYISO LMP response status:', response.status);
        
        if (response.ok) {
          const text = await response.text();
          const data = parseCSV(text);
          console.log('NYISO LMP parsed rows:', data.length);
          
          if (data.length > 0) {
            // Get latest timestamp data and calculate average across zones
            const latestTime = data[data.length - 1]['Time Stamp'];
            const latestRows = data.filter(row => row['Time Stamp'] === latestTime);
            
            const prices = latestRows
              .map(row => parseFloat(row['LBMP ($/MWHr)'] || row['LBMP'] || 0))
              .filter(price => price > 0 && price < 500);
            
            if (prices.length > 0) {
              const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length;
              
              pricing = {
                current_price: Math.round(avgPrice * 100) / 100,
                average_price: Math.round(avgPrice * 0.88 * 100) / 100,
                peak_price: Math.round(avgPrice * 1.8 * 100) / 100,
                off_peak_price: Math.round(avgPrice * 0.55 * 100) / 100,
                market_conditions: avgPrice > 70 ? 'high' : avgPrice > 40 ? 'normal' : 'low',
                timestamp: new Date().toISOString(),
                source: 'nyiso_realtime_lmp'
              };
              
              console.log('✅ NYISO real-time LMP pricing from', prices.length, 'zones:', pricing);
              break; // Success, exit loop
            }
          }
        }
      } catch (urlError: any) {
        console.log('NYISO LMP URL failed:', lmpUrl, urlError.message);
        continue; // Try next URL
      }
    }
  } catch (e: any) {
    console.error('❌ NYISO LMP pricing error:', e.message || e);
  }

  // If load API fails, estimate load based on generation mix
  if (generationMix && !loadData) {
    const estimatedLoad = generationMix.total_generation_mw * 1.02; // Slight overhead
    loadData = {
      current_demand_mw: Math.round(estimatedLoad),
      peak_forecast_mw: Math.round(estimatedLoad * 1.15),
      reserve_margin: 18.0,
      timestamp: new Date().toISOString(),
      source: 'nyiso_estimated_from_gen'
    };
    console.log('✅ NYISO load estimated from generation mix:', loadData);
  }

  // Estimate pricing only if we don't have real pricing data
  if (!pricing && generationMix && loadData) {
    const loadRatio = loadData.current_demand_mw / (generationMix.total_generation_mw || 1);
    const renewableRatio = generationMix.renewable_percentage / 100;
    
    const basePrice = 35 + (loadRatio * 25) - (renewableRatio * 18);
    
    pricing = {
      current_price: Math.round(basePrice * 100) / 100,
      average_price: Math.round(basePrice * 0.88 * 100) / 100,
      peak_price: Math.round(basePrice * 1.8 * 100) / 100,
      off_peak_price: Math.round(basePrice * 0.55 * 100) / 100,
      market_conditions: basePrice > 70 ? 'high' : basePrice > 40 ? 'normal' : 'low',
      timestamp: new Date().toISOString(),
      source: 'nyiso_estimated'
    };
    
    console.log('✅ NYISO pricing (estimated from gen+load):', pricing);
  } else if (!pricing) {
    console.log('⚠️ NYISO: Cannot estimate pricing - missing data (generationMix:', !!generationMix, 'loadData:', !!loadData, ')');
  }

  console.log('NYISO function complete - returning:', { hasPricing: !!pricing, hasLoad: !!loadData, hasGenMix: !!generationMix });
  return { pricing, loadData, generationMix };
}

// ========== PJM DATA FETCHING ==========
async function fetchPJMData() {
  console.log('Fetching PJM data from public APIs...');
  
  let pricing: any | undefined;
  let loadData: any | undefined;
  let generationMix: any | undefined;

  // Fetch Real-Time LMP (using dataminer2)
  try {
    const lmpUrl = 'https://dataminer2.pjm.com/feed/rt_hrl_lmps/definition';
    const response = await fetch(lmpUrl);
    
    if (response.ok) {
      // Check content type before parsing
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        try {
          const data = await response.json();
          
          if (data && Array.isArray(data.items) && data.items.length > 0) {
            const prices = data.items
              .filter((item: any) => item.total_lmp_rt)
              .map((item: any) => parseFloat(item.total_lmp_rt))
              .filter((price: number) => Number.isFinite(price) && price > -100 && price < 1000);
            
            if (prices.length > 0) {
              const avgPrice = prices.reduce((a: number, b: number) => a + b, 0) / prices.length;
              
              pricing = {
                current_price: Math.round(avgPrice * 100) / 100,
                average_price: Math.round(avgPrice * 0.9 * 100) / 100,
                peak_price: Math.round(avgPrice * 1.6 * 100) / 100,
                off_peak_price: Math.round(avgPrice * 0.5 * 100) / 100,
                market_conditions: avgPrice > 80 ? 'high' : avgPrice > 45 ? 'normal' : 'low',
                timestamp: new Date().toISOString(),
                source: 'pjm_dataminer'
              };
              
              console.log('✅ PJM pricing:', pricing);
            }
          }
        } catch (jsonError) {
          console.error('❌ PJM JSON parsing error:', jsonError);
        }
      } else {
        console.log('⚠️ PJM API returned non-JSON content:', contentType);
      }
    }
  } catch (e) {
    console.error('❌ PJM pricing error:', e);
  }
  
  // Always provide fallback if pricing wasn't fetched
  if (!pricing) {
    pricing = {
      current_price: 42.50,
      average_price: 38.80,
      peak_price: 68.00,
      off_peak_price: 21.25,
      market_conditions: 'normal',
      timestamp: new Date().toISOString(),
      source: 'pjm_estimated'
    };
  }

  // PJM doesn't have easily accessible public APIs for real-time generation and load
  // Provide estimated values based on typical PJM market characteristics
  loadData = {
    current_demand_mw: 92000,
    peak_forecast_mw: 105000,
    reserve_margin: 19.5,
    timestamp: new Date().toISOString(),
    source: 'pjm_estimated'
  };

  generationMix = {
    total_generation_mw: 95000,
    natural_gas_mw: 38000,
    coal_mw: 19000,
    nuclear_mw: 32000,
    wind_mw: 3500,
    solar_mw: 800,
    hydro_mw: 1200,
    other_mw: 500,
    renewable_percentage: 5.8,
    timestamp: new Date().toISOString(),
    source: 'pjm_estimated'
  };

  console.log('✅ PJM load and generation (estimated)');

  return { pricing, loadData, generationMix };
}

// ========== SPP DATA FETCHING ==========
async function fetchSPPData() {
  console.log('Fetching SPP data...');
  
  let pricing: any | undefined;
  let loadData: any | undefined;
  let generationMix: any | undefined;

  // SPP has portal.spp.org but most data requires authentication
  // Provide estimated values based on typical SPP market characteristics
  
  pricing = {
    current_price: 28.75,
    average_price: 26.50,
    peak_price: 46.00,
    off_peak_price: 14.40,
    market_conditions: 'low',
    timestamp: new Date().toISOString(),
    source: 'spp_estimated'
  };

  loadData = {
    current_demand_mw: 42000,
    peak_forecast_mw: 48000,
    reserve_margin: 20.0,
    timestamp: new Date().toISOString(),
    source: 'spp_estimated'
  };

  generationMix = {
    total_generation_mw: 44000,
    natural_gas_mw: 15400,
    coal_mw: 13200,
    wind_mw: 12100,
    nuclear_mw: 2200,
    solar_mw: 660,
    hydro_mw: 220,
    other_mw: 220,
    renewable_percentage: 29.5,
    timestamp: new Date().toISOString(),
    source: 'spp_estimated'
  };

  console.log('✅ SPP data (estimated)');

  return { pricing, loadData, generationMix };
}
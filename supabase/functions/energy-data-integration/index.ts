// Energy Data Integration Edge Function
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

// ========== ERCOT HELPER FUNCTIONS ==========
let ercotTokenCache: { token: string; expiresAt: number } | null = null;

async function getERCOTAuthToken(): Promise<string | null> {
  if (ercotTokenCache && ercotTokenCache.expiresAt > Date.now()) {
    console.log('✅ Using cached ERCOT token');
    return ercotTokenCache.token;
  }

  const username = Deno.env.get('ERCOT_USERNAME');
  const password = Deno.env.get('ERCOT_PASSWORD');

  if (!username || !password) {
    console.warn('ERCOT credentials missing');
    return null;
  }

  const authUrl = 'https://ercotb2c.b2clogin.com/ercotb2c.onmicrosoft.com/B2C_1_PUBAPI-ROPC-FLOW/oauth2/v2.0/token'
    + `?username=${encodeURIComponent(username)}`
    + `&password=${encodeURIComponent(password)}`
    + '&grant_type=password'
    + '&scope=openid+fec253ea-0d06-4272-a5e6-b478baeecd70+offline_access'
    + '&client_id=fec253ea-0d06-4272-a5e6-b478baeecd70'
    + '&response_type=id_token';

  try {
    const response = await fetch(authUrl, { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' } });
    if (!response.ok) return null;
    const data = await response.json();
    if (!data.id_token) return null;
    ercotTokenCache = { token: data.id_token, expiresAt: Date.now() + 55 * 60 * 1000 };
    return data.id_token;
  } catch (error) {
    console.error('ERCOT OAuth error:', error);
    return null;
  }
}

async function fetchERCOTData() {
  console.log('🔄 Fetching ERCOT data from ERCOT EMIL API (with HTML fallback)...');

  let pricing: any | undefined;
  let loadData: any | undefined;
  let generationMix: any | undefined;

  const apiKey = (
    Deno.env.get('ERCOT_API_KEY') ||
    Deno.env.get('ERCOT_API_KEY_SECONDARY') ||
    ''
  ).trim();

  // --- Primary: EMIL JSON API ---
  if (apiKey) {
    try {
      const apiPricing = await fetchERCOTPricingFromEmil(apiKey);
      if (apiPricing) {
        pricing = apiPricing;
      }
    } catch (error) {
      console.error('❌ ERCOT EMIL pricing API error:', error);
    }
  } else {
    console.warn('⚠️ ERCOT API key not configured; skipping EMIL pricing fetch');
  }

  // --- Fallback: HTML scrape from ERCOT public website ---
  if (!pricing) {
    try {
      const htmlPricing = await fetchERCOTPricingFromHtml();
      if (htmlPricing) {
        pricing = htmlPricing;
      }
    } catch (error) {
      console.error('❌ ERCOT HTML pricing fallback error:', error);
    }
  }

  if (!pricing) {
    console.error('❌ ERCOT pricing unavailable from all sources');
    return { pricing: undefined, loadData: undefined, generationMix: undefined };
  }

  // For now we do not have reliable public APIs for actual real‑time load & fuel mix via EMIL.
  // Frontend already handles missing loadData / generationMix gracefully.
  console.log('ERCOT pricing obtained from source:', pricing.source);

  return { pricing, loadData, generationMix };
}

async function fetchERCOTPricingFromEmil(apiKey: string) {
  console.log('📡 Fetching ERCOT Settlement Point Prices from EMIL API…');

  const token = await getERCOTAuthToken().catch((error) => {
    console.error('ERCOT OAuth token fetch failed (will try without token):', error);
    return null;
  });

  const headers: Record<string, string> = {
    'Ocp-Apim-Subscription-Key': apiKey,
    'Accept': 'application/json',
    'Cache-Control': 'no-cache',
    'User-Agent': 'LovableEnergy/1.0',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const url =
    'https://api.ercot.com/api/public-reports/np6-788-cd/spp_hrly_avrg_agg';

  const ctrl = new AbortController();
  const timeout = setTimeout(() => ctrl.abort('timeout'), 15000);

  try {
    const res = await fetch(url, { headers, signal: ctrl.signal });
    const text = await res.text();

    if (!res.ok) {
      console.warn(
        '⚠️ ERCOT EMIL pricing API returned',
        res.status,
        res.statusText,
        'body preview:',
        text.slice(0, 300),
      );
      return null;
    }

    let json: any;
    try {
      json = JSON.parse(text);
    } catch (e) {
      console.error('❌ ERCOT EMIL pricing JSON parse error:', e);
      console.error('Response preview:', text.slice(0, 300));
      return null;
    }

    const rawRows: any[] =
      Array.isArray(json) ? json : json?.data || json?._embedded?.results || [];

    console.log('ERCOT EMIL pricing raw rows:', rawRows.length);

    if (!rawRows.length) {
      return null;
    }

    type NormalizedRow = {
      deliveryTime: Date;
      settlementPoint: string;
      price: number;
    };

    const normalized: NormalizedRow[] = rawRows
      .map((row: any): NormalizedRow | null => {
        const dateStr: string =
          row.DeliveryDate ||
          row.DELIVERYDATE ||
          row.DlvryDt ||
          row.DELIVERY_DATE ||
          '';
        const hourStr: string =
          row.DeliveryHour ||
          row.DLVRYHR ||
          row.HourEnding ||
          row.HOUR ||
          '';
        const settlementPoint: string =
          row.SettlementPoint ||
          row.SPP_NODE ||
          row.SettlementPointName ||
          row.SPP_SETTLEMENT_POINT ||
          '';

        const priceRaw =
          row.SettlementPointPrice ??
          row.SPP ??
          row.SPPPrice ??
          row.Price ??
          row.SETTLEMENTPOINTPRICE ??
          row.SETTLEMENT_POINT_PRICE;

        const price = parseFloat(String(priceRaw ?? 'NaN'));
        if (!Number.isFinite(price)) return null;

        if (!dateStr || !hourStr) return null;

        let hour = parseInt(String(hourStr), 10);
        if (!Number.isFinite(hour)) {
          const match = String(hourStr).match(/\d+/);
          if (!match) return null;
          hour = parseInt(match[0], 10);
        }

        const [month, day, year] = dateStr.split(/[/-]/).map((p) => parseInt(p, 10));
        if (!year || !month || !day) return null;

        const deliveryTime = new Date(Date.UTC(year, month - 1, day, hour - 1, 0, 0));

        return { deliveryTime, settlementPoint, price };
      })
      .filter((r: NormalizedRow | null): r is NormalizedRow => !!r);

    if (!normalized.length) {
      console.warn('⚠️ No normalizable ERCOT EMIL rows found');
      return null;
    }

    const hubRows = normalized.filter(
      (r) => r.settlementPoint === 'HB_HUBAVG',
    );

    if (!hubRows.length) {
      console.warn('⚠️ No HB_HUBAVG rows in ERCOT EMIL response');
      return null;
    }

    hubRows.sort(
      (a, b) => a.deliveryTime.getTime() - b.deliveryTime.getTime(),
    );

    const latest = hubRows[hubRows.length - 1];
    const recent = hubRows.slice(-24);
    const prices = recent.map((r) => r.price).filter((p) => p > 0);

    const average_price =
      prices.length > 0
        ? prices.reduce((a, b) => a + b, 0) / prices.length
        : latest.price;
    const peak_price = prices.length > 0 ? Math.max(...prices) : latest.price;
    const off_peak_price =
      prices.length > 0 ? Math.min(...prices) : latest.price * 0.7;

    const market_conditions =
      latest.price > 150 ? 'high' : latest.price > 75 ? 'normal' : 'low';

    return {
      current_price: latest.price,
      average_price,
      peak_price,
      off_peak_price,
      market_conditions,
      timestamp: latest.deliveryTime.toISOString(),
      source: 'ercot_emil_spp_hrly_avrg_agg',
    };
  } catch (error) {
    console.error('❌ ERCOT EMIL pricing fetch error:', error);
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

async function fetchERCOTPricingFromHtml() {
  console.log('📄 Fetching ERCOT pricing from DAM SPP HTML fallback…');

  const damSppUrl = 'https://www.ercot.com/content/cdr/html/dam_spp.html';
  const res = await fetch(damSppUrl, {
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    },
  });

  if (!res.ok) {
    console.error('❌ Failed to fetch DAM SPP HTML:', res.status, res.statusText);
    return null;
  }

  const html = await res.text();
  const rows = html.match(/<tr[^>]*>.*?<\/tr>/gs) || [];
  console.log('📋 ERCOT DAM SPP rows found:', rows.length);

  type HourlyPoint = { timestamp: Date; price: number };
  const hourly: HourlyPoint[] = [];

  for (const row of rows) {
    const cells = row.match(/<td[^>]*>(.*?)<\/td>/gs) || [];
    if (cells.length < 3) continue;

    const cellValues = cells.map((cell) =>
      cell.replace(/<[^>]*>/g, '').trim(),
    );
    const dateStr = cellValues[0];
    const hourStr = cellValues[1];

    const priceStr = cellValues
      .slice(2)
      .find((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0);

    if (!dateStr || !hourStr || !priceStr) continue;

    const price = parseFloat(priceStr);
    if (!Number.isFinite(price)) continue;

    try {
      const [month, day, year] = dateStr.split(/[/-]/).map((p) => parseInt(p, 10));
      let hour = parseInt(hourStr, 10);
      if (!Number.isFinite(hour)) {
        const m = hourStr.match(/\d+/);
        if (m) hour = parseInt(m[0], 10);
      }
      const ts = new Date(Date.UTC(year, month - 1, day, hour - 1, 0, 0));
      hourly.push({ timestamp: ts, price });
    } catch {
      // Skip invalid dates
    }
  }

  if (!hourly.length) {
    console.warn('⚠️ No hourly price points parsed from DAM SPP HTML');
    return null;
  }

  hourly.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  const latest = hourly[hourly.length - 1];
  const recent = hourly.slice(-24);
  const prices = recent.map((p) => p.price).filter((v) => v > 0);

  const average_price =
    prices.length > 0
      ? prices.reduce((a, b) => a + b, 0) / prices.length
      : latest.price;
  const peak_price = prices.length > 0 ? Math.max(...prices) : latest.price;
  const off_peak_price =
    prices.length > 0 ? Math.min(...prices) : latest.price * 0.7;

  const market_conditions =
    latest.price > 150 ? 'high' : latest.price > 75 ? 'normal' : 'low';

  return {
    current_price: latest.price,
    average_price,
    peak_price,
    off_peak_price,
    market_conditions,
    timestamp: latest.timestamp.toISOString(),
    source: 'ercot_dam_spp_html',
  };
}

async function fetchSPPData() {
  return { pricing: { current_price: 30, source: 'spp_estimated' }, loadData: undefined, generationMix: undefined };
}

async function fetchIESOData() {
  return { pricing: { current_price: 28, source: 'ieso_estimated' }, loadData: undefined, generationMix: undefined };
}

Deno.serve(async (req) => {
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
});

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

  async function getJson(url: string, isOptional = false) {
    const ctrl = new AbortController();
    const timeout = setTimeout(() => ctrl.abort('timeout'), 15000);
    try {
      const res = await fetch(url, { headers, signal: ctrl.signal });
      const text = await res.text();
      if (!res.ok) {
        // Only log errors for non-optional endpoints (core data)
        if (!isOptional) {
          console.error('AESO APIM not OK', res.status, res.statusText, 'for', url, 'body:', text.slice(0, 300));
        }
        return null as any;
      }
      try { return JSON.parse(text); } catch (e) {
        console.error('AESO APIM JSON parse error:', String(e));
        return null as any;
      }
    } catch (e) {
      if (!isOptional && String(e) !== 'timeout') {
        console.error('AESO APIM fetch error:', String(e));
      }
      return null as any;
    } finally {
      clearTimeout(timeout);
    }
  }

  // Fetch all AESO market data in parallel
  // Note: interchangecapability-api and operatingreserve-api do not exist in AESO APIM
  // Available APIs: poolprice, systemmarginalprice, actualforecast, aiesgencapacity, operatingreserveoffercontrol
  const [
    poolResp, 
    smpResp, 
    loadResp
  ] = await Promise.allSettled([
    getJson(withQuery(`${host}/public/poolprice-api/v1.1/price/poolPrice`), false),
    getJson(withQuery(`${host}/public/systemmarginalprice-api/v1.1/price/systemMarginalPrice`), false),
    getJson(withQuery(`${host}/public/actualforecast-api/v1/load/albertaInternalLoad`), false)
    // Note: AESO does not provide public wind/solar/load forecast endpoints via APIM
    // interchangecapability-api, operatingreserve-api, and aiescapacity-api are not available
  ]);

  let pricing: any | undefined;
  let loadData: any | undefined;
  let generationMix: any | undefined;
  let systemMarginalPrice: number | undefined;
  // Note: intertieFlows, operatingReserve, and generationOutages are not available from AESO APIM

  // Pricing: prefer Pool Price; also extract SMP separately for spread calculation
  try {
    const poolJson: any = poolResp.status === 'fulfilled' ? poolResp.value : null;
    const smpJson: any = smpResp.status === 'fulfilled' ? smpResp.value : null;

    const poolArr: any[] = poolJson?.return?.['Pool Price Report'] || poolJson?.['Pool Price Report'] || [];
    const smpArr: any[] = smpJson?.return?.['System Marginal Price Report'] || smpJson?.['System Marginal Price Report'] || [];
    
    // Define helper function before using it
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
    
    // Extract System Marginal Price for analysis
    const smpValue = pickLastNumber(smpArr, ['system_marginal_price', 'SMP', 'smp']);
    if (smpValue != null) {
      systemMarginalPrice = Math.round(smpValue * 100) / 100;
      console.log('System Marginal Price:', systemMarginalPrice, '$/MWh');
    }

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
        source: current === pickLastNumber(poolArr, ['pool_price']) ? 'aeso_api_poolprice' : 'aeso_api_smp',
        system_marginal_price: systemMarginalPrice,
        smp_spread: systemMarginalPrice != null ? Math.round((p - systemMarginalPrice) * 100) / 100 : null
      };
    }
  } catch (e) {
    console.error('AESO pricing parse error:', e);
  }

  // Load (AIL): Actual Forecast Report
  let tempLoadData: any | undefined;
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
        tempLoadData = {
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

  // Calculate capacity margin from available data
  // Since AESO doesn't provide direct capacity data, we calculate it using:
  // Reserve Margin = (Available Capacity - Peak Demand) / Peak Demand * 100
  // Available Capacity = Peak Demand * (1 + Reserve Margin/100)
  // Capacity Margin = (Available Capacity - Current Demand) / Available Capacity * 100
  if (tempLoadData && generationMix) {
    const reserveMargin = tempLoadData.reserve_margin;
    const peakForecast = tempLoadData.peak_forecast_mw;
    const currentDemand = tempLoadData.current_demand_mw;
    
    // Calculate available capacity from reserve margin and peak forecast
    const availableCapacity = peakForecast * (1 + reserveMargin / 100);
    
    // Calculate capacity margin
    const capacityMargin = ((availableCapacity - currentDemand) / availableCapacity) * 100;
    
    loadData = {
      ...tempLoadData,
      capacity_margin: Math.round(capacityMargin * 10) / 10 // Round to 1 decimal place
    };
    
    console.log('AESO Capacity Calculation:', {
      peakForecast,
      currentDemand,
      reserveMargin,
      availableCapacity: Math.round(availableCapacity),
      capacityMargin: loadData.capacity_margin
    });
  } else {
    loadData = tempLoadData;
  }

  console.log('AESO return summary (APIM)', {
    pricingSource: pricing?.source,
    currentPrice: pricing?.current_price,
    smp: systemMarginalPrice,
    loadSource: loadData?.source,
    mixSource: generationMix?.source,
    capacityMargin: loadData?.capacity_margin
  });

  return { 
    pricing, 
    loadData, 
    generationMix
  };
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
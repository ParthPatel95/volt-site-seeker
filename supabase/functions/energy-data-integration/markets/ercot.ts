// ERCOT market data fetching logic
export { getERCOTAuthToken, fetchERCOTData };

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

  const apiKey = Deno.env.get('ERCOT_API_KEY') || Deno.env.get('ERCOT_API_KEY_SECONDARY') || '';
  
  if (!apiKey) {
    console.warn('ERCOT API key is missing.');
    return {
      pricing: undefined,
      loadData: undefined,
      generationMix: undefined
    };
  }

  const authToken = await getERCOTAuthToken();
  if (!authToken) {
    console.error('❌ Failed to get ERCOT OAuth token');
    return {
      pricing: undefined,
      loadData: undefined,
      generationMix: undefined
    };
  }

  const baseUrl = 'https://api.ercot.com/api/public-reports';
  
  const headers: Record<string, string> = {
    'Ocp-Apim-Subscription-Key': apiKey,
    'Authorization': `Bearer ${authToken}`,
    'Accept': 'application/json',
    'Cache-Control': 'no-cache',
    'User-Agent': 'LovableEnergy/1.0'
  };

  async function getJson(url: string, params: Record<string, any> = {}) {
    const ctrl = new AbortController();
    const timeout = setTimeout(() => ctrl.abort('timeout'), 15000);
    
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
        console.error('ERCOT API error:', res.status, text.slice(0, 300));
        return null;
      }
      return JSON.parse(text);
    } catch (e) {
      console.error('ERCOT fetch error:', String(e));
      return null;
    } finally {
      clearTimeout(timeout);
    }
  }

  const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
  
  let pricingResp, loadResp, genMixResp;
  
  try {
    pricingResp = { status: 'fulfilled' as const, value: await getJson(`${baseUrl}/np6-905-cd/spp_node_zone_hub`, { page: 1, size: 100000 }) };
    await delay(1000);
    
    loadResp = { status: 'fulfilled' as const, value: await getJson(`${baseUrl}/np6-345-cd/act_sys_load_by_wzn`, { page: 1, size: 100000 }) };
    await delay(1000);
    
    genMixResp = { status: 'fulfilled' as const, value: await getJson(`${baseUrl}/np3-910-er/2d_agg_gen_summary`, { page: 1, size: 100 }) };
  } catch (e) {
    console.error('ERCOT API error:', e);
    return {
      pricing: undefined,
      loadData: undefined,
      generationMix: undefined
    };
  }

  let pricing: any | undefined;
  let loadData: any | undefined;
  let generationMix: any | undefined;

  // Parse pricing
  try {
    const json = pricingResp.status === 'fulfilled' ? pricingResp.value : null;
    if (json?.data && Array.isArray(json.data)) {
      const hubPrices = json.data
        .filter((r: any) => String(r[3] || '').includes('HB_'))
        .map((r: any) => Number(r[5]))
        .filter((p: number) => !isNaN(p) && p > 0);
      
      if (hubPrices.length > 0) {
        const current = hubPrices[hubPrices.length - 1];
        const avg = hubPrices.reduce((a: number, b: number) => a + b, 0) / hubPrices.length;
        const peak = Math.max(...hubPrices);
        const offPeak = Math.min(...hubPrices);
        
        pricing = {
          current_price: current,
          average_price: avg,
          peak_price: peak,
          off_peak_price: offPeak,
          market_conditions: current > avg * 1.5 ? 'high' : current < avg * 0.7 ? 'low' : 'normal',
          timestamp: new Date().toISOString(),
          source: 'ercot_api_lmp'
        };
        
        console.log('✅ ERCOT pricing created:', JSON.stringify(pricing));
      }
    }
  } catch (e) {
    console.error('ERCOT pricing parse error:', e);
  }

  // Parse load
  try {
    const json = loadResp.status === 'fulfilled' ? loadResp.value : null;
    if (json?.data && Array.isArray(json.data)) {
      const latest = json.data[json.data.length - 1];
      const totalActual = latest.slice(2, 10).reduce((sum: number, val: any) => sum + Number(val || 0), 0);
      const totalForecast = latest.slice(2, 10).reduce((sum: number, val: any) => sum + Number(val || 0), 0);
      
      loadData = {
        current_demand_mw: Math.round(totalActual),
        peak_forecast_mw: Math.round(totalForecast * 1.15),
        reserve_margin: 15,
        timestamp: new Date().toISOString(),
        source: 'ercot_api_load'
      };
      
      console.log('✅ ERCOT load created:', JSON.stringify(loadData));
    }
  } catch (e) {
    console.error('ERCOT load parse error:', e);
  }

  // Parse generation mix
  try {
    const json = genMixResp.status === 'fulfilled' ? genMixResp.value : null;
    if (json?.data && Array.isArray(json.data) && json.data.length > 0) {
      const latest = json.data[json.data.length - 1];
      const [, , total, nonRenew, wind, solar, other] = latest;
      
      const coal = Number(nonRenew) * 0.25;
      const gas = Number(nonRenew) * 0.60;
      const nuclear = Number(nonRenew) * 0.15;
      const renewable = Number(wind) + Number(solar) + Number(other);
      
      generationMix = {
        total_generation_mw: Math.round(Number(total)),
        coal_mw: Math.round(coal),
        natural_gas_mw: Math.round(gas),
        nuclear_mw: Math.round(nuclear),
        wind_mw: Math.round(Number(wind)),
        solar_mw: Math.round(Number(solar)),
        hydro_mw: Math.round(Number(other)),
        other_mw: Math.round(Number(total) - Number(nonRenew) - renewable),
        renewable_percentage: Number((renewable / Number(total) * 100).toFixed(2)),
        timestamp: new Date().toISOString(),
        source: 'ercot_api_gen_mix'
      };
      
      console.log('✅ ERCOT generation mix created');
    }
  } catch (e) {
    console.error('ERCOT gen mix parse error:', e);
  }

  return { pricing, loadData, generationMix };
}

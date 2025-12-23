// AESO Market Data - Hardened edge function with cold-start resilience
// Uses Deno.serve (native) instead of remote imports to prevent BOOT_ERROR

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE',
};

// In-memory cache for cold-start resilience
let cachedResponse: { data: any; timestamp: number } | null = null;
const CACHE_TTL_MS = 90_000; // 90 seconds

function toNumber(val: unknown): number | null {
  const n = typeof val === 'number' ? val : parseFloat(String(val));
  return Number.isFinite(n) ? n : null;
}

function getAPIMKey(): string | null {
  return Deno.env.get('AESO_SUBSCRIPTION_KEY_PRIMARY')
    || Deno.env.get('AESO_SUBSCRIPTION_KEY_SECONDARY')
    || Deno.env.get('AESO_SUB_KEY')
    || Deno.env.get('AESO_API_KEY')
    || null;
}

function buildHeaders(key: string): HeadersInit {
  return {
    'Ocp-Apim-Subscription-Key': key,
    'x-api-key': key,
    'Accept': 'application/json',
    'User-Agent': 'LovableEnergy/1.0'
  } as HeadersInit;
}

// Fetch with timeout to prevent hanging
async function fetchWithTimeout(url: string, options: RequestInit, timeoutMs = 10000): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  
  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
    return response;
  } finally {
    clearTimeout(timeout);
  }
}

async function fetchWithKey(url: string, key: string): Promise<Response> {
  // First attempt: header only
  let res = await fetchWithTimeout(url, { headers: buildHeaders(key) });
  if (res.ok) return res;

  // If unauthorized/forbidden, retry with subscription-key as query param
  if (res.status === 401 || res.status === 403) {
    try {
      const u = new URL(url);
      if (!u.searchParams.has('subscription-key')) {
        u.searchParams.set('subscription-key', key);
      }
      res = await fetchWithTimeout(u.toString(), { headers: buildHeaders(key) });
      return res;
    } catch (_) {
      // Fallthrough to return original response
    }
  }
  return res;
}

async function fetchCSDSummary(key: string) {
  const base = 'https://apimgw.aeso.ca/public/currentsupplydemand-api';
  
  // Try v2 then fall back to v1
  for (const ver of ['v2', 'v1']) {
    try {
      const url = `${base}/${ver}/csd/summary/current`;
      const res = await fetchWithKey(url, key);
      if (res.ok) {
        const text = await res.text();
        try {
          return JSON.parse(text);
        } catch (e) {
          console.error(`CSD ${ver} JSON parse failed`);
        }
      } else {
        console.error(`CSD ${ver} fetch failed:`, res.status, res.statusText);
      }
    } catch (e) {
      console.error(`CSD ${ver} fetch error:`, e);
    }
  }
  return null;
}

function buildPayload(csd: any) {
  const ts = csd?.effective_datetime_utc || csd?.effective_datetime_mpt || csd?.timestamp || new Date().toISOString();
  const genList = Array.isArray(csd?.generation_data_list) ? csd.generation_data_list : 
                  Array.isArray(csd?.generationDataList) ? csd.generationDataList :
                  Array.isArray(csd?.generation) ? csd.generation : [];
  const interchangeList = Array.isArray(csd?.interchange_list) ? csd.interchange_list :
                          Array.isArray(csd?.interchangeList) ? csd.interchangeList : [];

  // Interchange mapping
  let bc = 0, sk = 0, mt = 0, total = 0;
  if (Array.isArray(interchangeList)) {
    for (const item of interchangeList) {
      const path: string = (item?.path || '').toString().toUpperCase();
      const flow = toNumber(item?.actual_flow) ?? 0;
      total += flow;
      if (path.includes('BC')) bc = flow;
      else if (path.includes('SK')) sk = flow;
      else if (path.includes('MATL') || path.includes('MONTANA') || path.includes('MT')) mt = flow;
    }
  }

  // Operating reserve from CSD summary
  const dispatchedCR = toNumber(csd?.dispatched_contingency_reserve) ?? 0;
  const dispatchedOther = toNumber(csd?.dispatched_other_operating_reserve) ?? 0;
  const ffrArmed = toNumber(csd?.ffr_armed_dispatch) ?? 0;
  const spinningReserve = dispatchedCR;
  const supplementalReserve = dispatchedOther + ffrArmed;
  const totalReserve = spinningReserve + supplementalReserve;

  // Energy storage from generation fuel types
  let storageNet = 0;
  if (Array.isArray(genList)) {
    for (const g of genList) {
      const fuel: string = (g?.fuel_type || '').toString().toLowerCase();
      const net = toNumber(g?.aggregated_net_generation) ?? 0;
      if (fuel.includes('storage') || fuel.includes('battery') || fuel.includes('bess')) {
        storageNet += net;
      }
    }
  }
  const charging = storageNet < 0 ? Math.abs(storageNet) : 0;
  const discharging = storageNet > 0 ? storageNet : 0;

  return {
    success: true,
    dataAvailable: csd !== null,
    aeso: {
      interchange: {
        alberta_british_columbia: Math.round(bc),
        alberta_saskatchewan: Math.round(sk),
        alberta_montana: Math.round(mt),
        total_net_interchange: Math.round(total),
        timestamp: ts,
        source: csd ? 'aeso_api_csd' : 'fallback_data'
      },
      operatingReserve: {
        total_reserve_mw: Math.round(totalReserve),
        spinning_reserve_mw: Math.round(spinningReserve),
        supplemental_reserve_mw: Math.round(supplementalReserve),
        timestamp: ts,
        source: csd ? 'aeso_api_csd' : 'fallback_data'
      },
      energyStorage: {
        charging_mw: Math.round(charging),
        discharging_mw: Math.round(discharging),
        net_storage_mw: Math.round(storageNet),
        state_of_charge_percent: null,
        timestamp: ts,
        source: csd ? 'aeso_api_csd' : 'fallback_data'
      }
    }
  };
}

// Fallback data when API unavailable
const FALLBACK_PAYLOAD = {
  success: true,
  dataAvailable: false,
  aeso: {
    interchange: {
      alberta_british_columbia: 0,
      alberta_saskatchewan: 100,
      alberta_montana: -50,
      total_net_interchange: 50,
      timestamp: new Date().toISOString(),
      source: 'static_fallback'
    },
    operatingReserve: {
      total_reserve_mw: 500,
      spinning_reserve_mw: 400,
      supplemental_reserve_mw: 100,
      timestamp: new Date().toISOString(),
      source: 'static_fallback'
    },
    energyStorage: {
      charging_mw: 0,
      discharging_mw: 0,
      net_storage_mw: 0,
      state_of_charge_percent: null,
      timestamp: new Date().toISOString(),
      source: 'static_fallback'
    }
  }
};

// Use Deno.serve (native) instead of remote import to prevent BOOT_ERROR
Deno.serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Check cache first for fast responses
    if (cachedResponse && (Date.now() - cachedResponse.timestamp) < CACHE_TTL_MS) {
      console.log('✅ Returning cached AESO market data');
      return new Response(JSON.stringify(cachedResponse.data), {
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    const apiKey = getAPIMKey();
    
    if (!apiKey) {
      console.warn('No AESO API key configured, returning fallback');
      return new Response(JSON.stringify(FALLBACK_PAYLOAD), {
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    console.log('aeso-market-data: fetching CSD summary...');
    const csd = await fetchCSDSummary(apiKey);
    
    if (csd) {
      const payload = buildPayload(csd);
      // Cache successful response
      cachedResponse = { data: payload, timestamp: Date.now() };
      console.log('✅ Returning fresh AESO market data');
      return new Response(JSON.stringify(payload), {
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }
    
    // API failed - use stale cache if available
    if (cachedResponse) {
      console.log('⚠️ API failed, returning stale cache');
      return new Response(JSON.stringify(cachedResponse.data), {
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }
    
    console.log('⚠️ API failed, no cache, returning fallback');
    return new Response(JSON.stringify(FALLBACK_PAYLOAD), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });

  } catch (e: any) {
    console.error('❌ aeso-market-data error:', e);
    
    // Always return 200 with fallback - never crash the client
    const responseData = cachedResponse?.data || FALLBACK_PAYLOAD;
    return new Response(JSON.stringify(responseData), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }
});

// AESO Market Data Proxy - fetches real-time data from AESO APIM endpoints
// and returns normalized objects for Interchange, Operating Reserve and Energy Storage.
// CORS enabled for browser calls.

import { serve } from "../_shared/imports.ts";
import { corsHeaders } from "../_shared/cors.ts";

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

async function fetchWithKey(url: string, key: string): Promise<Response> {
  // First attempt: header only
  let res = await fetch(url, { headers: buildHeaders(key) });
  if (res.ok) return res;

  // If unauthorized/forbidden, retry with subscription-key as query param too
  if (res.status === 401 || res.status === 403) {
    try {
      const u = new URL(url);
      if (!u.searchParams.has('subscription-key')) {
        u.searchParams.set('subscription-key', key);
      }
      res = await fetch(u.toString(), { headers: buildHeaders(key) });
      return res;
    } catch (_) {
      // Fallthrough to return original response
    }
  }
  return res;
}

async function fetchCSDSummary() {
  const key = getAPIMKey();
  if (!key) throw new Error('Missing AESO subscription key');

  const base = 'https://apimgw.aeso.ca/public/currentsupplydemand-api';
  // Try v2 then fall back to v1
  for (const ver of ['v2', 'v1']) {
    const url = `${base}/${ver}/csd/summary/current`;
    const res = await fetchWithKey(url, key);
    if (res.ok) {
      return await res.json();
    } else {
      console.error(`CSD ${ver} fetch failed:`, res.status, res.statusText);
    }
  }
  throw new Error('CSD summary fetch failed for v2 and v1');
}

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: { ...corsHeaders } });
  }

  try {
    console.log('aeso-market-data: fetching CSD summary...');
    let csd: any = null;
    try {
      csd = await fetchCSDSummary();
      console.log('✅ CSD summary fetched successfully');
    } catch (err) {
      console.warn('⚠️ CSD summary fetch failed, continuing with reports only:', err.message);
    }

    // Also fetch additional AESO APIM datasets per official docs
    const apimKey = Deno.env.get('AESO_SUBSCRIPTION_KEY_PRIMARY')
      || Deno.env.get('AESO_SUBSCRIPTION_KEY_SECONDARY')
      || Deno.env.get('AESO_SUB_KEY')
      || Deno.env.get('AESO_API_KEY');

    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    const todayISO = `${yyyy}-${mm}-${dd}`;

    const d60 = new Date(today);
    d60.setDate(d60.getDate() - 60);
    const d60ISO = `${d60.getFullYear()}-${String(d60.getMonth() + 1).padStart(2, '0')}-${String(d60.getDate()).padStart(2, '0')}`;

    const itcStart = new Date(today);
    itcStart.setMonth(itcStart.getMonth() - 12);
    const itcStartStr = `${itcStart.getFullYear()}${String(itcStart.getMonth() + 1).padStart(2, '0')}${String(itcStart.getDate()).padStart(2, '0')}`;
    const itcEndStr = `${yyyy}${mm}${dd}`;

    let energyMeritOrder: any = null;
    let aiesGenCapacity: any = null;
    let assetList: any = null;
    let intertieOutages: any = null;
    let loadOutageForecast: any = null;
    let meteredVolume: any = null;
    let operatingReserveOfferControl: any = null;
    let poolParticipants: any = null;

    if (apimKey) {
      // Energy Merit Order (60 days delay) - API may not be available
      try {
        const res = await fetchWithKey(`https://apimgw.aeso.ca/public/energymeritorder-api/v1/meritOrder/energy?startDate=${encodeURIComponent(d60ISO)}`, apimKey);
        if (res.ok) energyMeritOrder = await res.json();
        // Silent fail - optional data
      } catch (e) { /* Silent - optional data */ }

      // AIES Gen Capacity (today) - Optional endpoint
      try {
        const res = await fetchWithKey(`https://apimgw.aeso.ca/public/aiesgencapacity-api/v1/AIESGenCapacity?startDate=${encodeURIComponent(todayISO)}&endDate=${encodeURIComponent(todayISO)}`, apimKey);
        if (res.ok) aiesGenCapacity = await res.json();
        // Silent fail - optional data
      } catch (e) { /* Silent - optional data */ }

      // Asset List - Optional
      try {
        const res = await fetchWithKey('https://apimgw.aeso.ca/public/assetlist-api/v1/assetlist', apimKey);
        if (res.ok) assetList = await res.json();
        // Silent fail - optional data
      } catch (e) { /* Silent - optional data */ }

      // Intertie Outage Report (13 months window) - Multiple endpoint attempts (most are deprecated)
      try {
        const intertieUrls = [
          `https://apimgw.aeso.ca/public/itc-api/v1/outage?startDate=${itcStartStr}&endDate=${itcEndStr}`,
          `https://apimgw.aeso.ca/public/itc-api/v1/outageReport?startDate=${itcStartStr}&endDate=${itcEndStr}`,
          `https://apimgw.aeso.ca/public/itc-api/v1/intertieOutage?startDate=${itcStartStr}&endDate=${itcEndStr}`,
          `https://apimgw.aeso.ca/public/itc-api/v1/intertie-outage?startDate=${itcStartStr}&endDate=${itcEndStr}`,
          `https://apimgw.aeso.ca/public/itc-api/v1/intertie/outage?startDate=${itcStartStr}&endDate=${itcEndStr}`
        ];
        for (const url of intertieUrls) {
          const res = await fetchWithKey(url, apimKey);
          if (res.ok) { intertieOutages = await res.json(); break; }
          // Silent fail - trying multiple deprecated endpoints
        }
      } catch (e) { /* Silent - optional data */ }

      // Load Outage Forecast (today) - Optional
      try {
        const res = await fetchWithKey(`https://apimgw.aeso.ca/public/loadoutageforecast-api/v1/loadOutageReport?startDate=${encodeURIComponent(todayISO)}&endDate=${encodeURIComponent(todayISO)}`, apimKey);
        if (res.ok) loadOutageForecast = await res.json();
        // Silent fail - optional data
      } catch (e) { /* Silent - optional data */ }

      // Metered Volume (today, limited scope) - Optional
      try {
        const res = await fetchWithKey(`https://apimgw.aeso.ca/public/meteredvolume-api/v1/meteredvolume/details?startDate=${encodeURIComponent(todayISO)}&endDate=${encodeURIComponent(todayISO)}`, apimKey);
        if (res.ok) meteredVolume = await res.json();
        // Silent fail - optional data
      } catch (e) { /* Silent - optional data */ }

      // Operating Reserve Offer Control (60 days delay) - Optional
      try {
        const res = await fetchWithKey(`https://apimgw.aeso.ca/public/operatingreserveoffercontrol-api/v1/operatingReserveOfferControl?startDate=${encodeURIComponent(d60ISO)}&endDate=${encodeURIComponent(todayISO)}`, apimKey);
        if (res.ok) operatingReserveOfferControl = await res.json();
        // Silent fail - optional data
      } catch (e) { /* Silent - optional data */ }

      // Pool Participant list - Optional
      try {
        const res = await fetchWithKey('https://apimgw.aeso.ca/public/poolparticipant-api/v1/poolparticipantlist', apimKey);
        if (res.ok) poolParticipants = await res.json();
        // Silent fail - optional data
      } catch (e) { /* Silent - optional data */ }
    } else {
      console.warn('AESO subscription key not configured for extended datasets');
    }

    // The payload shape per docs exposes fields under a top-level VO or directly.
    // Handle common shapes defensively with fallbacks
    const ts = csd?.effective_datetime_utc || csd?.effective_datetime_mpt || csd?.timestamp || new Date().toISOString();
    const genList = Array.isArray(csd?.generation_data_list) ? csd.generation_data_list : 
                    Array.isArray(csd?.generationDataList) ? csd.generationDataList :
                    Array.isArray(csd?.generation) ? csd.generation : [];
    const interchangeList = Array.isArray(csd?.interchange_list) ? csd.interchange_list :
                            Array.isArray(csd?.interchangeList) ? csd.interchangeList : [];

    // Interchange mapping by path keyword
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

    // Operating reserve from CSD summary (best available real-time proxy)
    const dispatchedCR = toNumber(csd?.dispatched_contingency_reserve) ?? 0;
    const ffrArmed = toNumber(csd?.ffr_armed_dispatch) ?? 0;
    const totalReserve = dispatchedCR + ffrArmed; // conservative sum

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

    const payload = {
      success: true,
      dataAvailable: csd !== null,
      aeso: {
        interchange: {
          alberta_british_columbia: Math.round(bc),
          alberta_saskatchewan: Math.round(sk),
          alberta_montana: Math.round(mt),
          total_net_interchange: Math.round(total),
          timestamp: ts,
          source: csd ? 'aeso_api_csd_v2' : 'fallback_data'
        },
        operatingReserve: {
          total_reserve_mw: Math.round(totalReserve),
          spinning_reserve_mw: 0,
          supplemental_reserve_mw: 0,
          timestamp: ts,
          source: csd ? 'aeso_api_csd_v2' : 'fallback_data'
        },
        energyStorage: {
          charging_mw: Math.round(charging),
          discharging_mw: Math.round(discharging),
          net_storage_mw: Math.round(storageNet),
          state_of_charge_percent: null,
          timestamp: ts,
          source: csd ? 'aeso_api_csd_v2' : 'fallback_data'
        },
        reports: {
          energyMeritOrder: energyMeritOrder || null,
          aiesGenCapacity: aiesGenCapacity || null,
          assetList: assetList || null,
          intertieOutages: intertieOutages || null,
          loadOutageForecast: loadOutageForecast || null,
          meteredVolume: meteredVolume || null,
          operatingReserveOfferControl: operatingReserveOfferControl || null,
          poolParticipants: poolParticipants || null
        }
      }
    };
    
    console.log(`✅ Returning payload with ${csd ? 'live' : 'fallback'} data`);
    
    return new Response(JSON.stringify(payload), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
      status: 200,
    });
  } catch (e: any) {
    console.error('❌ aeso-market-data critical error:', e);
    // Return a safe fallback response even on catastrophic failure
    return new Response(JSON.stringify({ 
      success: false, 
      error: e?.message || String(e),
      timestamp: new Date().toISOString(),
      fallback: true
    }), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
      status: 200,
    });
  }
});

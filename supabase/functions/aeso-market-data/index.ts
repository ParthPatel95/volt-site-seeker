// AESO Market Data Proxy - fetches real-time data from AESO APIM endpoints
// and returns normalized objects for Interchange, Operating Reserve and Energy Storage.
// CORS enabled for browser calls.

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function toNumber(val: unknown): number | null {
  const n = typeof val === 'number' ? val : parseFloat(String(val));
  return Number.isFinite(n) ? n : null;
}

async function fetchCSDSummary() {
  const key = Deno.env.get('AESO_SUBSCRIPTION_KEY_PRIMARY')
    || Deno.env.get('AESO_SUBSCRIPTION_KEY_SECONDARY')
    || Deno.env.get('AESO_SUB_KEY')
    || Deno.env.get('AESO_API_KEY');
  if (!key) throw new Error('Missing AESO subscription key');

  const url = 'https://apimgw.aeso.ca/public/currentsupplydemand-api/v2/csd/summary/current';
  const res = await fetch(url, { headers: { 'Ocp-Apim-Subscription-Key': key } });
  if (!res.ok) throw new Error(`CSD summary status ${res.status}`);
  const json = await res.json();
  return json;
}

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: { ...corsHeaders } });
  }

  try {
    console.log('aeso-market-data: fetching CSD v2 summary...');
    const csd = await fetchCSDSummary();

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
      const headers = { 'Ocp-Apim-Subscription-Key': apimKey } as HeadersInit;
      // Energy Merit Order (60 days delay)
      try {
        const res = await fetch(`https://apimgw.aeso.ca/public/energymeritorder-api/v1/meritOrder/energy?startDate=${encodeURIComponent(d60ISO)}`, { headers });
        if (res.ok) energyMeritOrder = await res.json();
      } catch (e) { console.warn('EMO fetch failed', e); }

      // AIES Gen Capacity (today)
      try {
        const res = await fetch(`https://apimgw.aeso.ca/public/aiesgencapacity-api/v1/AIESGenCapacity?startDate=${encodeURIComponent(todayISO)}`, { headers });
        if (res.ok) aiesGenCapacity = await res.json();
      } catch (e) { console.warn('AIES Gen Capacity fetch failed', e); }

      // Asset List
      try {
        const res = await fetch('https://apimgw.aeso.ca/public/assetlist-api/v1/assetlist', { headers });
        if (res.ok) assetList = await res.json();
      } catch (e) { console.warn('Asset List fetch failed', e); }

      // Intertie Outage Report (13 months window)
      try {
        const res = await fetch(`https://apimgw.aeso.ca/public/itc/v1/outage?startDate=${itcStartStr}&endDate=${itcEndStr}`, { headers });
        if (res.ok) intertieOutages = await res.json();
      } catch (e) { console.warn('Intertie Outage fetch failed', e); }

      // Load Outage Forecast (today)
      try {
        const res = await fetch(`https://apimgw.aeso.ca/public/loadoutageforecast-api/v1/loadOutageReport?startDate=${encodeURIComponent(todayISO)}`, { headers });
        if (res.ok) loadOutageForecast = await res.json();
      } catch (e) { console.warn('Load Outage Forecast fetch failed', e); }

      // Metered Volume (today, limited scope)
      try {
        const res = await fetch(`https://apimgw.aeso.ca/public/meteredvolume-api/v1/meteredvolume/details?startDate=${encodeURIComponent(todayISO)}`, { headers });
        if (res.ok) meteredVolume = await res.json();
      } catch (e) { console.warn('Metered Volume fetch failed', e); }

      // Operating Reserve Offer Control (60 days delay)
      try {
        const res = await fetch(`https://apimgw.aeso.ca/public/operatingreserveoffercontrol-api/v1/operatingReserveOfferControl?startDate=${encodeURIComponent(d60ISO)}`, { headers });
        if (res.ok) operatingReserveOfferControl = await res.json();
      } catch (e) { console.warn('OR Offer Control fetch failed', e); }

      // Pool Participant list
      try {
        const res = await fetch('https://apimgw.aeso.ca/public/PoolParticipant-api/v1/poolparticipantlist', { headers });
        if (res.ok) poolParticipants = await res.json();
      } catch (e) { console.warn('Pool Participant fetch failed', e); }
    } else {
      console.warn('AESO subscription key not configured for extended datasets');
    }

    // The payload shape per docs exposes fields under a top-level VO or directly.
    // Handle common shapes defensively
    const ts = csd?.effective_datetime_utc || csd?.effective_datetime_mpt || csd?.timestamp || new Date().toISOString();
    const genList = csd?.generation_data_list || csd?.generationDataList || csd?.generation || [];
    const interchangeList = csd?.interchange_list || csd?.interchangeList || [];

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
      aeso: {
        interchange: {
          alberta_british_columbia: Math.round(bc),
          alberta_saskatchewan: Math.round(sk),
          alberta_montana: Math.round(mt),
          total_net_interchange: Math.round(total),
          timestamp: ts,
          source: 'aeso_api_csd_v2'
        },
        operatingReserve: {
          total_reserve_mw: Math.round(totalReserve),
          // Detailed split not available in real-time CSD: set to 0 to avoid fabrication
          spinning_reserve_mw: 0,
          supplemental_reserve_mw: 0,
          timestamp: ts,
          source: 'aeso_api_csd_v2'
        },
        energyStorage: {
          charging_mw: Math.round(charging),
          discharging_mw: Math.round(discharging),
          net_storage_mw: Math.round(storageNet),
          state_of_charge_percent: null,
          timestamp: ts,
          source: 'aeso_api_csd_v2'
        },
        reports: {
          energyMeritOrder: energyMeritOrder,
          aiesGenCapacity: aiesGenCapacity,
          assetList: assetList,
          intertieOutages: intertieOutages,
          loadOutageForecast: loadOutageForecast,
          meteredVolume: meteredVolume,
          operatingReserveOfferControl: operatingReserveOfferControl,
          poolParticipants: poolParticipants
        }
      }
    };
    return new Response(JSON.stringify(payload), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
      status: 200,
    });
  } catch (e) {
    console.error('aeso-market-data error:', e);
    return new Response(JSON.stringify({ success: false, error: String(e) }), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
      status: 200,
    });
  }
});

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

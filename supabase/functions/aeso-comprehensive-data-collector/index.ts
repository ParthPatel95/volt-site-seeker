import { corsHeaders } from "../_shared/cors.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";

const AESO_BASE = "https://apimgw.aeso.ca/public";

// Known confirmed endpoints
const ENDPOINTS = {
  poolPrice: "/poolprice-api/v1.1/price/poolPrice?startDate={start}&endDate={end}",
  smp: "/systemmarginalprice-api/v1.1/price/systemMarginalPrice?startDate={start}&endDate={end}",
  ail: "/actualforecast-api/v1/load/albertaInternalLoad?startDate={start}&endDate={end}",
  csd: "/currentsupplydemand-api/v2/csd/summary/current",
  // Discovery endpoints - try multiple path patterns
  genCapacity: [
    "/generationcapacity-api/v1/capacity",
    "/generationcapacity-api/v1/generationCapacity",
    "/generationcapacity-api/v2/capacity",
  ],
  assetList: [
    "/assetlist-api/v1/assetList",
    "/assetlist-api/v1/asset/list",
    "/assetlist-api/v2/assetList",
  ],
  meritOrder: [
    "/energymeritorder-api/v1/meritOrder",
    "/energymeritorder-api/v1/energyMeritOrder",
    "/energymeritorder-api/v2/meritOrder",
  ],
  orReport: [
    "/operatingreserve-api/v1/orReport?startDate={start}&endDate={end}",
    "/operatingreserve-api/v1/operatingReserve?startDate={start}&endDate={end}",
    "/operatingreserve-api/v2/orReport?startDate={start}&endDate={end}",
  ],
  interchangeCapability: [
    "/interchangecapability-api/v1/capability",
    "/interchangecapability-api/v1/interchangeCapability",
    "/interchangecapability-api/v2/capability",
  ],
  loadOutage: [
    "/loadoutage-api/v1/outages",
    "/loadoutage-api/v1/loadOutage",
    "/loadoutage-api/v2/outages",
  ],
  interchangeOutage: [
    "/interchangeoutage-api/v1/outages",
    "/interchangeoutage-api/v1/interchangeOutage",
    "/interchangeoutage-api/v2/outages",
  ],
  poolParticipant: [
    "/poolparticipant-api/v1/poolparticipantlist",
    "/poolparticipant-api/v1/poolParticipant",
  ],
  meteredVolume: [
    "/meteredvolume-api/v1/meteredVolume",
    "/meteredvolume-api/v1/metered-volume",
    "/meteredvolume-api/v2/meteredVolume",
  ],
};

async function fetchAESO(path: string, apiKey: string, timeout = 15000): Promise<any> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);
  try {
    // Try API-KEY header first (works for most endpoints)
    const res = await fetch(`${AESO_BASE}${path}`, {
      headers: { "API-KEY": apiKey, "Accept": "application/json" },
      signal: controller.signal,
    });
    clearTimeout(timer);
    if (res.status === 401) {
      // Try Ocp-Apim-Subscription-Key header as fallback
      const controller2 = new AbortController();
      const timer2 = setTimeout(() => controller2.abort(), timeout);
      const res2 = await fetch(`${AESO_BASE}${path}`, {
        headers: { "Ocp-Apim-Subscription-Key": apiKey, "Accept": "application/json" },
        signal: controller2.signal,
      });
      clearTimeout(timer2);
      if (!res2.ok) {
        const text = await res2.text().catch(() => "");
        return { error: true, status: res2.status, path, body: text.substring(0, 200) };
      }
      return await res2.json();
    }
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      return { error: true, status: res.status, path, body: text.substring(0, 200) };
    }
    return await res.json();
  } catch (e) {
    clearTimeout(timer);
    return { error: true, path, message: e.message };
  }
}

async function tryEndpoints(paths: string[], apiKey: string, dateReplace?: { start: string; end: string }): Promise<{ data: any; path: string } | null> {
  for (let path of paths) {
    if (dateReplace) {
      path = path.replace("{start}", dateReplace.start).replace("{end}", dateReplace.end);
    }
    const result = await fetchAESO(path, apiKey, 10000);
    if (!result.error) {
      return { data: result, path };
    }
    console.log(`[Discovery] ${path} → ${result.status || result.message}`);
  }
  return null;
}

function formatDate(d: Date): string {
  return d.toISOString().split("T")[0];
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();
  const results: Record<string, any> = {};
  const apiKey = Deno.env.get("AESO_SUBSCRIPTION_KEY_PRIMARY") || Deno.env.get("AESO_API_KEY") || Deno.env.get("AESO_SUB_KEY") || Deno.env.get("AESO_SUBSCRIPTION_KEY_SECONDARY") || "";

  if (!apiKey) {
    return new Response(JSON.stringify({ error: "No AESO API key configured" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  const now = new Date();
  const todayStr = formatDate(now);

  // ---- Phase 1: Fetch confirmed endpoints in parallel ----
  const [poolPriceResult, smpResult, ailResult, csdResult] = await Promise.all([
    fetchAESO(ENDPOINTS.poolPrice.replace("{start}", todayStr).replace("{end}", todayStr), apiKey),
    fetchAESO(ENDPOINTS.smp.replace("{start}", todayStr).replace("{end}", todayStr), apiKey),
    fetchAESO(ENDPOINTS.ail.replace("{start}", todayStr).replace("{end}", todayStr), apiKey),
    fetchAESO(ENDPOINTS.csd, apiKey),
  ]);

  results.poolPrice = !poolPriceResult.error;
  results.smp = !smpResult.error;
  results.ail = !ailResult.error;
  results.csd = !csdResult.error;

  // Parse confirmed data
  let latestPoolPrice: number | null = null;
  let latestSMP: number | null = null;
  let latestAIL: number | null = null;
  let forecastAIL: number | null = null;

  if (!poolPriceResult.error) {
    const prices = poolPriceResult?.return?.["Pool Price Report"] || [];
    // Find latest record with actual pool_price (not empty string)
    for (let i = prices.length - 1; i >= 0; i--) {
      const pp = parseFloat(prices[i]?.pool_price);
      if (!isNaN(pp) && pp > 0) { latestPoolPrice = pp; break; }
    }
    // Also grab forecast if no actual
    if (latestPoolPrice === null && prices.length > 0) {
      const fp = parseFloat(prices[prices.length - 1]?.forecast_pool_price);
      if (!isNaN(fp)) latestPoolPrice = fp;
    }
  }

  if (!smpResult.error) {
    // SMP v1.1 may return { return: { timestamp, responseCode, "System Marginal Price Report": [...] } }
    const smpReturn = smpResult?.return;
    const smps = smpReturn?.["System Marginal Price Report"] || (Array.isArray(smpReturn) ? smpReturn : []);
    for (let i = smps.length - 1; i >= 0; i--) {
      const v = parseFloat(smps[i]?.system_marginal_price);
      if (!isNaN(v) && v > 0) { latestSMP = v; break; }
    }
    // If empty array, try parsing responseCode for info
    if (latestSMP === null) {
      console.log("[DEBUG] SMP full response:", JSON.stringify(smpReturn || {}).substring(0, 500));
    }
  }

  if (!ailResult.error) {
    const loads = ailResult?.return?.["Actual Forecast Report"] || [];
    // Find latest with actual AIL value
    for (let i = loads.length - 1; i >= 0; i--) {
      const v = parseFloat(loads[i]?.alberta_internal_load);
      if (!isNaN(v) && v > 0) { latestAIL = v; break; }
    }
    // Get forecast from last record
    if (loads.length > 0) {
      const fv = parseFloat(loads[loads.length - 1]?.forecast_alberta_internal_load);
      if (!isNaN(fv)) forecastAIL = fv;
    }
  }

  // Parse CSD data
  let genGas = null, genWind = null, genSolar = null, genHydro = null, genCoal = null, genOther = null;
  let orDispatched = null, orRegulating = null, orSpinning = null, orSupplemental = null;
  let bcFlow = null, skFlow = null, mtFlow = null;
  let totalInstalled = null, totalAvailable = null;

  if (!csdResult.error) {
    const csd = csdResult?.return || csdResult;
    // Generation by fuel type
    const genSummary = csd?.generationDataList || csd?.generation_data_list || [];
    for (const g of (Array.isArray(genSummary) ? genSummary : [])) {
      const fuel = (g?.fuel_type || g?.fuelType || "").toLowerCase();
      const mw = parseFloat(g?.total_net_generation || g?.totalNetGeneration || g?.aggregated_net_generation || 0);
      const maxCap = parseFloat(g?.total_maximum_capability || g?.totalMaximumCapability || 0);
      if (fuel.includes("gas")) genGas = mw;
      else if (fuel.includes("wind")) genWind = mw;
      else if (fuel.includes("solar")) genSolar = mw;
      else if (fuel.includes("hydro")) genHydro = mw;
      else if (fuel.includes("coal") || fuel.includes("dual")) genCoal = mw;
      else genOther = (genOther || 0) + mw;

      totalInstalled = (totalInstalled || 0) + maxCap;
      totalAvailable = (totalAvailable || 0) + mw;
    }

    // Interchange
    const interchanges = csd?.interchangeList || csd?.interchange_list || [];
    for (const ix of (Array.isArray(interchanges) ? interchanges : [])) {
      const path = (ix?.path || ix?.interchange_path || "").toUpperCase();
      const flow = parseFloat(ix?.actual_flow || ix?.actualFlow || 0);
      if (path.includes("BC")) bcFlow = flow;
      else if (path.includes("SK") || path.includes("SASK")) skFlow = flow;
      else if (path.includes("MT") || path.includes("MONT")) mtFlow = flow;
    }
  }

  // ---- Phase 2: Discovery endpoints (sequential to avoid rate limiting) ----
  const discoveryResults: Record<string, any> = {};

  // Gen Capacity
  const genCapResult = await tryEndpoints(ENDPOINTS.genCapacity, apiKey);
  if (genCapResult) {
    results.genCapacity = true;
    discoveryResults.genCapacity = { path: genCapResult.path, sampleKeys: Object.keys(genCapResult.data?.return || genCapResult.data || {}).slice(0, 5) };

    // Parse outages from gen capacity
    const genData = genCapResult.data?.return || genCapResult.data;
    if (genData && typeof genData === "object") {
      const outages: any[] = [];
      const items = Array.isArray(genData) ? genData : genData?.["Generation Capacity"] || [];
      for (const item of (Array.isArray(items) ? items : [])) {
        const outMW = parseFloat(item?.outage_mw || item?.outageMW || item?.total_outage || 0);
        if (outMW > 0) {
          outages.push({
            outage_type: "generation",
            asset_id: item?.asset_id || item?.assetId || item?.asset || null,
            asset_name: item?.asset_name || item?.assetName || null,
            outage_mw: outMW,
            reason: item?.outage_reason || item?.reason || null,
            status: (item?.outage_type || "").toLowerCase().includes("plan") ? "planned" : "forced",
            source_api: "generationcapacity-api",
            metadata: item,
          });
        }
      }
      if (outages.length > 0) {
        await supabase.from("aeso_outages").upsert(outages, { onConflict: "id" });
        discoveryResults.genCapacity.outagesStored = outages.length;
      }
    }
  } else {
    results.genCapacity = false;
  }

  // Asset List
  const assetResult = await tryEndpoints(ENDPOINTS.assetList, apiKey);
  if (assetResult) {
    results.assetList = true;
    discoveryResults.assetList = { path: assetResult.path };

    const assets = assetResult.data?.return || assetResult.data;
    const assetArr = Array.isArray(assets) ? assets : assets?.["Asset List"] || [];
    const upsertBatch: any[] = [];
    for (const a of (Array.isArray(assetArr) ? assetArr : [])) {
      upsertBatch.push({
        asset_id: a?.asset_id || a?.assetId || a?.asset || `unknown_${Math.random()}`,
        asset_name: a?.asset_name || a?.assetName || null,
        fuel_type: a?.fuel_type || a?.fuelType || null,
        sub_fuel_type: a?.sub_fuel_type || a?.subFuelType || null,
        installed_capacity_mw: parseFloat(a?.installed_capacity || a?.maximum_capability || a?.maxCapability || 0) || null,
        net_to_grid_capacity_mw: parseFloat(a?.net_to_grid || a?.netToGrid || 0) || null,
        owner: a?.owner || a?.company || null,
        operating_status: a?.operating_status || a?.status || null,
        region: a?.region || a?.area || null,
        metadata: a,
      });
    }
    if (upsertBatch.length > 0) {
      // Batch in chunks of 500
      for (let i = 0; i < upsertBatch.length; i += 500) {
        await supabase.from("aeso_assets").upsert(upsertBatch.slice(i, i + 500), { onConflict: "asset_id" });
      }
      discoveryResults.assetList.assetsStored = upsertBatch.length;
    }
  } else {
    results.assetList = false;
  }

  // Merit Order
  const meritResult = await tryEndpoints(ENDPOINTS.meritOrder, apiKey);
  results.meritOrder = !!meritResult;
  if (meritResult) {
    discoveryResults.meritOrder = { path: meritResult.path, sampleKeys: Object.keys(meritResult.data?.return || meritResult.data || {}).slice(0, 5) };
  }

  // OR Report
  const dateReplace = { start: todayStr, end: todayStr };
  const orResult = await tryEndpoints(ENDPOINTS.orReport, apiKey, dateReplace);
  results.orReport = !!orResult;
  if (orResult) {
    discoveryResults.orReport = { path: orResult.path, sampleKeys: Object.keys(orResult.data?.return || orResult.data || {}).slice(0, 5) };
    // Try to extract OR details
    const orData = orResult.data?.return || orResult.data;
    if (orData) {
      orDispatched = parseFloat(orData?.dispatched_mw || orData?.total_dispatched || 0) || null;
      orRegulating = parseFloat(orData?.regulating_mw || 0) || null;
      orSpinning = parseFloat(orData?.spinning_mw || 0) || null;
      orSupplemental = parseFloat(orData?.supplemental_mw || 0) || null;
    }
  }

  // Interchange Capability
  const ixCapResult = await tryEndpoints(ENDPOINTS.interchangeCapability, apiKey);
  results.interchangeCapability = !!ixCapResult;
  let bcCap = null, skCap = null, mtCap = null;
  if (ixCapResult) {
    discoveryResults.interchangeCapability = { path: ixCapResult.path };
    const ixData = ixCapResult.data?.return || ixCapResult.data;
    const ixArr = Array.isArray(ixData) ? ixData : [];
    for (const ix of ixArr) {
      const path = (ix?.path || ix?.interchange || "").toUpperCase();
      const cap = parseFloat(ix?.capability || ix?.ttc || ix?.total_transfer_capability || 0);
      if (path.includes("BC")) bcCap = cap;
      else if (path.includes("SK")) skCap = cap;
      else if (path.includes("MT")) mtCap = cap;
    }
  }

  // Load Outage
  const loadOutResult = await tryEndpoints(ENDPOINTS.loadOutage, apiKey);
  results.loadOutage = !!loadOutResult;
  if (loadOutResult) {
    discoveryResults.loadOutage = { path: loadOutResult.path };
    const outages = loadOutResult.data?.return || loadOutResult.data;
    const arr = Array.isArray(outages) ? outages : [];
    const batch: any[] = [];
    for (const o of arr.slice(0, 100)) {
      batch.push({
        outage_type: "load",
        asset_name: o?.area || o?.name || null,
        outage_mw: parseFloat(o?.outage_mw || o?.mw || 0) || null,
        start_time: o?.start_date || o?.startDate || null,
        end_time: o?.end_date || o?.endDate || null,
        status: "planned",
        source_api: "loadoutage-api",
        metadata: o,
      });
    }
    if (batch.length > 0) {
      await supabase.from("aeso_outages").insert(batch);
      discoveryResults.loadOutage.outagesStored = batch.length;
    }
  }

  // Interchange Outage
  const ixOutResult = await tryEndpoints(ENDPOINTS.interchangeOutage, apiKey);
  results.interchangeOutage = !!ixOutResult;
  if (ixOutResult) {
    discoveryResults.interchangeOutage = { path: ixOutResult.path };
  }

  // Pool Participants
  const ppResult = await tryEndpoints(ENDPOINTS.poolParticipant, apiKey);
  results.poolParticipant = !!ppResult;
  if (ppResult) {
    discoveryResults.poolParticipant = { path: ppResult.path, count: Array.isArray(ppResult.data?.return) ? ppResult.data.return.length : "unknown" };
  }

  // Metered Volume (skip for now as it likely needs date params)
  results.meteredVolume = false;
  discoveryResults.meteredVolume = { skipped: "requires date parameters, will test separately" };

  // ---- Phase 3: Store market snapshot ----
  // Calculate total outage from gen capacity data
  let totalOutage = null, plannedOutage = null, forcedOutage = null;

  // Parse merit order summary
  let meritDepth = null, marginalFuel = null, meritSnapshot = null;
  if (meritResult) {
    const mo = meritResult.data?.return || meritResult.data;
    const moArr = Array.isArray(mo) ? mo : mo?.["Merit Order"] || [];
    if (Array.isArray(moArr) && moArr.length > 0) {
      meritDepth = moArr.length;
      const last = moArr[moArr.length - 1];
      marginalFuel = last?.fuel_type || last?.fuelType || null;
      // Store compressed snapshot (first 20 + last 20 entries)
      meritSnapshot = {
        total_offers: moArr.length,
        bottom: moArr.slice(0, 20).map((m: any) => ({
          price: m?.price || m?.offer_price,
          mw: m?.mw || m?.volume,
          fuel: m?.fuel_type || m?.fuelType,
        })),
        top: moArr.slice(-20).map((m: any) => ({
          price: m?.price || m?.offer_price,
          mw: m?.mw || m?.volume,
          fuel: m?.fuel_type || m?.fuelType,
        })),
      };
    }
  }

  const snapshotTimestamp = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours()).toISOString();

  const snapshot = {
    timestamp: snapshotTimestamp,
    snapshot_type: "realtime",
    pool_price: latestPoolPrice,
    system_marginal_price: latestSMP,
    ail_mw: latestAIL,
    forecast_ail_mw: forecastAIL,
    total_installed_capacity_mw: totalInstalled,
    total_available_capacity_mw: totalAvailable,
    total_outage_mw: totalOutage,
    planned_outage_mw: plannedOutage,
    forced_outage_mw: forcedOutage,
    or_dispatched_mw: orDispatched,
    or_clearing_price: null,
    or_regulating_mw: orRegulating,
    or_spinning_mw: orSpinning,
    or_supplemental_mw: orSupplemental,
    interchange_bc_flow_mw: bcFlow,
    interchange_sk_flow_mw: skFlow,
    interchange_mt_flow_mw: mtFlow,
    interchange_bc_capability_mw: bcCap,
    interchange_sk_capability_mw: skCap,
    interchange_mt_capability_mw: mtCap,
    merit_order_depth: meritDepth,
    marginal_fuel_type: marginalFuel,
    merit_order_snapshot: meritSnapshot,
    generation_gas_mw: genGas,
    generation_wind_mw: genWind,
    generation_solar_mw: genSolar,
    generation_hydro_mw: genHydro,
    generation_coal_mw: genCoal,
    generation_other_mw: genOther,
    data_sources: results,
  };

  const { error: upsertError } = await supabase
    .from("aeso_market_snapshots")
    .upsert(snapshot, { onConflict: "timestamp,snapshot_type" });

  const elapsed = Date.now() - startTime;

  const response = {
    success: !upsertError,
    elapsed_ms: elapsed,
    timestamp: snapshotTimestamp,
    endpoints_tested: Object.keys(results).length,
    endpoints_succeeded: Object.values(results).filter(Boolean).length,
    results,
    discovery: discoveryResults,
    snapshot_stored: !upsertError,
    upsert_error: upsertError?.message || null,
  };

  console.log(`[Comprehensive Collector] ${response.endpoints_succeeded}/${response.endpoints_tested} endpoints succeeded in ${elapsed}ms`);
  console.log("[Discovery Results]", JSON.stringify(discoveryResults, null, 2));

  return new Response(JSON.stringify(response), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});

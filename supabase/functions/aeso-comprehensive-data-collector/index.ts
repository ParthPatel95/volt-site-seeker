import { corsHeaders } from "../_shared/cors.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";

const AESO_BASE = "https://apimgw.aeso.ca/public";

// Known confirmed endpoints
const ENDPOINTS = {
  poolPrice: "/poolprice-api/v1.1/price/poolPrice?startDate={start}&endDate={end}",
  smp: "/systemmarginalprice-api/v1.1/price/systemMarginalPrice?startDate={start}&endDate={end}",
  ail: "/actualforecast-api/v1/load/albertaInternalLoad?startDate={start}&endDate={end}",
  csd: "/currentsupplydemand-api/v2/csd/summary/current",
  // Discovery endpoints
  genCapacity: [
    "/aiesgencapacity-api/v1/AIESGenCapacity?startDate={start}&endDate={end}",
    "/aiesgencapacity-api/v1/aiesgencapacity?startDate={start}&endDate={end}",
    "/generationcapacity-api/v1/capacity?startDate={start}&endDate={end}",
  ],
  assetList: [
    "/assetlist-api/v1/AssetList",
    "/assetlist-api/v1/assetList",
    "/assetlist-api/v1/assetlist",
  ],
  meritOrder: [
    "/energymeritorder-api/v1/meritOrder/energy?startDate={start}",  // Official docs confirmed
    "/energymeritorder-api/v1/energyMeritOrderReport",  // flat fallback
    "/energymeritorder-api/v1/energyMeritOrder",
  ],
  orReport: [
    // Path confirmed WORKING (returns 400 not 404) — try parameter variations
    "/operatingreserveoffercontrol-api/v1/OperatingReserveOfferControl?start_date={start}&end_date={end}",
    "/operatingreserveoffercontrol-api/v1/OperatingReserveOfferControl?date={start}",
    "/operatingreserveoffercontrol-api/v1/OperatingReserveOfferControl?report_date={start}",
    "/operatingreserveoffercontrol-api/v1/OperatingReserveOfferControl",  // no params
    "/operatingreserveoffercontrol-api/v1/offerControl/operatingReserve?startDate={start}",
    "/operatingreserveoffercontrol-api/v1/report/offerControl?startDate={start}",
  ],
  interchangeCapability: [
    // Following category/operation pattern from working endpoints
    "/itc-api/v1/intertie/capability",
    "/itc-api/v1/report/interchangeCapability",
    "/itc-api/v1/capability/interchange",
    "/itc-api/v1/atc/capability",
    "/itc-api/v1/interchangeCapability",  // flat fallback
  ],
  loadOutage: [
    "/loadoutageforecast-api/v1/loadOutageReport?startDate={start}&endDate={end}",
  ],
  interchangeOutage: [
    // Following category/operation pattern
    "/itc-api/v1/intertie/outage",
    "/itc-api/v1/report/interchangeOutage",
    "/itc-api/v1/outage/interchange",
    "/itc-api/v1/interchangeOutage",  // flat fallback
  ],
  poolParticipant: [
    "/poolparticipant-api/v1/poolparticipantlist",
    "/poolparticipant-api/v1/PoolParticipantList",
  ],
  meteredVolume: [
    "/meteredvolume-api/v1/volume/meteredVolume?startDate={start}&endDate={end}",
    "/meteredvolume-api/v1/report/meteredVolume?startDate={start}&endDate={end}",
    "/meteredvolume-api/v1/meter/volume?startDate={start}&endDate={end}",
    "/meteredvolume-api/v1/meteredVolumeReport?startDate={start}&endDate={end}",  // flat fallback
  ],
  unitCommitment: [
    "/unitcommitmentdata-api/v2/unitCommitmentData",
    "/unitcommitmentdata-api/v2/unitCommitment",
    "/unitcommitmentdata-api/v2/UnitCommitment",
  ],
};

// Get all available API keys (they may be different keys)
function getAllApiKeys(): string[] {
  const keys: string[] = [];
  const seen = new Set<string>();
  for (const envVar of ["AESO_SUBSCRIPTION_KEY_PRIMARY", "AESO_API_KEY", "AESO_SUB_KEY", "AESO_SUBSCRIPTION_KEY_SECONDARY"]) {
    const val = Deno.env.get(envVar);
    if (val && !seen.has(val)) {
      seen.add(val);
      keys.push(val);
    }
  }
  return keys;
}

// Raw fetch with a specific header and key — no auth logic magic
async function rawFetchAESO(path: string, headerName: string, apiKey: string, timeout = 15000): Promise<{ ok: boolean; status: number; data?: any; body?: string; error?: string }> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);
  try {
    const res = await fetch(`${AESO_BASE}${path}`, {
      headers: {
        [headerName]: apiKey,
        "Cache-Control": "no-cache",
        "Accept": "application/json",
      },
      signal: controller.signal,
    });
    clearTimeout(timer);
    if (res.ok) {
      try {
        const data = await res.json();
        return { ok: true, status: res.status, data };
      } catch {
        const text = await res.text().catch(() => "");
        return { ok: false, status: res.status, body: text.substring(0, 300), error: "JSON parse failed" };
      }
    }
    const text = await res.text().catch(() => "");
    return { ok: false, status: res.status, body: text.substring(0, 300) };
  } catch (e: any) {
    clearTimeout(timer);
    return { ok: false, status: 0, error: e.message };
  }
}

// Simple fetch using API-KEY header (for confirmed working endpoints)
async function fetchAESO(path: string, apiKey: string, timeout = 15000): Promise<any> {
  const r = await rawFetchAESO(path, "API-KEY", apiKey, timeout);
  if (r.ok) return r.data;
  // Fallback to Ocp-Apim-Subscription-Key on 401/403
  if (r.status === 401 || r.status === 403) {
    const r2 = await rawFetchAESO(path, "Ocp-Apim-Subscription-Key", apiKey, timeout);
    if (r2.ok) return r2.data;
    return { error: true, status: r2.status, path, body: r2.body || r2.error };
  }
  return { error: true, status: r.status, path, body: r.body || r.error };
}

// Enhanced discovery: try ALL combinations of auth headers × API keys for each path
// maxPaths limits how many paths to try (for timeout management)
async function tryEndpointsDualAuth(paths: string[], apiKeys: string[], dateReplace?: { start: string; end: string }, maxPaths = 3): Promise<{ data: any; path: string } | null> {
  const AUTH_HEADERS = ["API-KEY", "Ocp-Apim-Subscription-Key"];
  let tried = 0;
  for (let path of paths) {
    if (tried >= maxPaths) break;
    tried++;
    if (dateReplace) {
      path = path.replace("{start}", dateReplace.start).replace("{end}", dateReplace.end);
    }
    for (const key of apiKeys) {
      for (const hdr of AUTH_HEADERS) {
        const r = await rawFetchAESO(path, hdr, key, 6000);
        if (r.ok) {
          console.log(`[Discovery] ✅ ${path} succeeded with ${hdr} (key ending ...${key.slice(-4)})`);
          return { data: r.data, path };
        }
        // Only log first failure per path to reduce noise
        if (hdr === AUTH_HEADERS[0] && key === apiKeys[0]) {
          console.log(`[Discovery] ${path} → ${r.status} | ${(r.body || r.error || "").substring(0, 80)}`);
        }
      }
    }
  }
  return null;
}

// Simple discovery for confirmed-working endpoints (only needs one key)
async function tryEndpoints(paths: string[], apiKey: string, dateReplace?: { start: string; end: string }): Promise<{ data: any; path: string } | null> {
  for (let path of paths) {
    if (dateReplace) {
      path = path.replace("{start}", dateReplace.start).replace("{end}", dateReplace.end);
    }
    const result = await fetchAESO(path, apiKey, 10000);
    if (!result.error) {
      return { data: result, path };
    }
    console.log(`[Discovery] ${path} → ${result.status || result.message} | ${(result.body || "").substring(0, 150)}`);
  }
  return null;
}

function formatDate(d: Date): string {
  return d.toISOString().split("T")[0];
}

// ========== Diagnostic Mode ==========
async function runDiagnostic(apiKeys: string[]): Promise<any> {
  const AUTH_HEADERS = ["API-KEY", "Ocp-Apim-Subscription-Key"];
  const now = new Date();
  const today = formatDate(now);
  const orEnd = new Date(now); orEnd.setDate(orEnd.getDate() - 61);
  const orStart = new Date(orEnd); orStart.setDate(orStart.getDate() - 7);

  // Define focused probes for just the 5 failing APIs
  const probes: Record<string, string[]> = {
    meritOrder: [
      `/energymeritorder-api/v1/meritOrder/energy?startDate=${formatDate(orStart)}`,
      "/energymeritorder-api/v1/energyMeritOrderReport",
    ],
    orReport: [
      `/operatingreserveoffercontrol-api/v1/OperatingReserveOfferControl?start_date=${formatDate(orStart)}&end_date=${formatDate(orEnd)}`,
      `/operatingreserveoffercontrol-api/v1/OperatingReserveOfferControl?date=${formatDate(orStart)}`,
      `/operatingreserveoffercontrol-api/v1/OperatingReserveOfferControl`,
      `/operatingreserveoffercontrol-api/v1/offerControl/operatingReserve?startDate=${formatDate(orStart)}`,
    ],
    interchangeCapability: [
      "/itc-api/v1/intertie/capability",
      "/itc-api/v1/report/interchangeCapability",
      "/itc-api/v1/capability/interchange",
      "/itc-api/v1/interchangeCapability",
    ],
    interchangeOutage: [
      "/itc-api/v1/intertie/outage",
      "/itc-api/v1/report/interchangeOutage",
      "/itc-api/v1/interchangeOutage",
    ],
    meteredVolume: [
      `/meteredvolume-api/v1/volume/meteredVolume?startDate=${today}&endDate=${today}`,
      `/meteredvolume-api/v1/report/meteredVolume?startDate=${today}&endDate=${today}`,
      `/meteredvolume-api/v1/meteredVolumeReport?startDate=${today}&endDate=${today}`,
    ],
  };

  // Also try without /public/ prefix
  const BASES = [
    "https://apimgw.aeso.ca/public",
    "https://apimgw.aeso.ca",
  ];

  const diagnosticResults: Record<string, any[]> = {};

  for (const [apiName, paths] of Object.entries(probes)) {
    diagnosticResults[apiName] = [];
    for (const path of paths) {
      for (const base of BASES) {
        for (const key of apiKeys) {
          for (const hdr of AUTH_HEADERS) {
            // Try GET
            const controller = new AbortController();
            const timer = setTimeout(() => controller.abort(), 8000);
            try {
              const res = await fetch(`${base}${path}`, {
                method: "GET",
                headers: {
                  [hdr]: key,
                  "Cache-Control": "no-cache",
                  "Accept": "application/json",
                },
                signal: controller.signal,
              });
              clearTimeout(timer);
              const bodyText = await res.text().catch(() => "");
              diagnosticResults[apiName].push({
                url: `${base}${path}`,
                method: "GET",
                header: hdr,
                keyEnding: `...${key.slice(-4)}`,
                status: res.status,
                body: bodyText.substring(0, 300),
              });
              // If we got a non-404 non-401 response, also try POST
              if (res.status !== 404) {
                const ctrl2 = new AbortController();
                const t2 = setTimeout(() => ctrl2.abort(), 8000);
                try {
                  const res2 = await fetch(`${base}${path}`, {
                    method: "POST",
                    headers: {
                      [hdr]: key,
                      "Cache-Control": "no-cache",
                      "Content-Type": "application/json",
                    },
                    body: "{}",
                    signal: ctrl2.signal,
                  });
                  clearTimeout(t2);
                  const body2 = await res2.text().catch(() => "");
                  diagnosticResults[apiName].push({
                    url: `${base}${path}`,
                    method: "POST",
                    header: hdr,
                    keyEnding: `...${key.slice(-4)}`,
                    status: res2.status,
                    body: body2.substring(0, 300),
                  });
                } catch (e2: any) {
                  clearTimeout(t2);
                }
              }
            } catch (e: any) {
              clearTimeout(timer);
              diagnosticResults[apiName].push({
                url: `${base}${path}`,
                method: "GET",
                header: hdr,
                keyEnding: `...${key.slice(-4)}`,
                status: "error",
                body: e.message,
              });
            }
          }
        }
      }
    }
  }

  // Summarize: find any non-404 responses
  const summary: Record<string, any> = {};
  for (const [apiName, results] of Object.entries(diagnosticResults)) {
    const non404 = results.filter((r: any) => r.status !== 404 && r.status !== "error");
    const successes = results.filter((r: any) => r.status >= 200 && r.status < 300);
    summary[apiName] = {
      totalProbes: results.length,
      successes: successes.length,
      non404Responses: non404.length,
      non404Details: non404.slice(0, 5),
      allStatuses: [...new Set(results.map((r: any) => r.status))],
    };
  }

  return { summary, details: diagnosticResults };
}

// ========== Main Handler ==========
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const allApiKeys = getAllApiKeys();
  const apiKey = allApiKeys[0] || "";

  if (!apiKey) {
    return new Response(JSON.stringify({ error: "No AESO API key configured" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Check for diagnostic mode
  let body: any = {};
  try { body = await req.json(); } catch { /* no body */ }

  if (body?.mode === "diagnostic") {
    console.log(`[Diagnostic] Running with ${allApiKeys.length} unique API keys...`);
    const diagResult = await runDiagnostic(allApiKeys);
    console.log("[Diagnostic Summary]", JSON.stringify(diagResult.summary, null, 2));
    return new Response(JSON.stringify(diagResult), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const startTime = Date.now();
  const results: Record<string, any> = {};

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
    for (let i = prices.length - 1; i >= 0; i--) {
      const pp = parseFloat(prices[i]?.pool_price);
      if (!isNaN(pp) && pp > 0) { latestPoolPrice = pp; break; }
    }
    if (latestPoolPrice === null && prices.length > 0) {
      const fp = parseFloat(prices[prices.length - 1]?.forecast_pool_price);
      if (!isNaN(fp)) latestPoolPrice = fp;
    }
  }

  if (!smpResult.error) {
    const smpReturn = smpResult?.return;
    const smps = smpReturn?.["System Marginal Price Report"] || (Array.isArray(smpReturn) ? smpReturn : []);
    for (let i = smps.length - 1; i >= 0; i--) {
      const v = parseFloat(smps[i]?.system_marginal_price);
      if (!isNaN(v) && v > 0) { latestSMP = v; break; }
    }
    if (latestSMP === null) {
      console.log("[DEBUG] SMP full response:", JSON.stringify(smpReturn || {}).slice(0, 500));
    }
  }

  if (!ailResult.error) {
    const loads = ailResult?.return?.["Actual Forecast Report"] || [];
    for (let i = loads.length - 1; i >= 0; i--) {
      const v = parseFloat(loads[i]?.alberta_internal_load);
      if (!isNaN(v) && v > 0) { latestAIL = v; break; }
    }
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

    const interchanges = csd?.interchangeList || csd?.interchange_list || [];
    for (const ix of (Array.isArray(interchanges) ? interchanges : [])) {
      const p = (ix?.path || ix?.interchange_path || "").toUpperCase();
      const flow = parseFloat(ix?.actual_flow || ix?.actualFlow || 0);
      if (p.includes("BC")) bcFlow = flow;
      else if (p.includes("SK") || p.includes("SASK")) skFlow = flow;
      else if (p.includes("MT") || p.includes("MONT")) mtFlow = flow;
    }
  }

  // ---- Phase 2: Discovery endpoints ----
  const discoveryResults: Record<string, any> = {};
  const dateReplace = { start: todayStr, end: todayStr };

  // Gen Capacity (confirmed working — single key)
  const genCapResult = await tryEndpoints(ENDPOINTS.genCapacity, apiKey, dateReplace);
  if (genCapResult) {
    results.genCapacity = true;
    discoveryResults.genCapacity = { path: genCapResult.path, sampleKeys: Object.keys(genCapResult.data?.return || genCapResult.data || {}).slice(0, 5) };

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

  // Asset List (confirmed working — single key)
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
      for (let i = 0; i < upsertBatch.length; i += 500) {
        await supabase.from("aeso_assets").upsert(upsertBatch.slice(i, i + 500), { onConflict: "asset_id" });
      }
      discoveryResults.assetList.assetsStored = upsertBatch.length;
    }
  } else {
    results.assetList = false;
  }

  // Merit Order (FAILING — use dual auth with ALL keys, 60-day delayed dates per AESO policy)
  const moDateEnd = new Date(now); moDateEnd.setDate(moDateEnd.getDate() - 61);
  const moDateStart = new Date(moDateEnd); moDateStart.setDate(moDateStart.getDate() - 1);
  const moDateReplace = { start: formatDate(moDateStart), end: formatDate(moDateEnd) };
  const meritResult = await tryEndpointsDualAuth(ENDPOINTS.meritOrder, allApiKeys, moDateReplace, 5);
  results.meritOrder = !!meritResult;
  if (meritResult) {
    discoveryResults.meritOrder = { path: meritResult.path, sampleKeys: Object.keys(meritResult.data?.return || meritResult.data || {}).slice(0, 5) };
  }

  // OR Report (FAILING — use dual auth with ALL keys, 60-day delayed dates)
  const orDateEnd = new Date(now); orDateEnd.setDate(orDateEnd.getDate() - 61);
  const orDateStart = new Date(orDateEnd); orDateStart.setDate(orDateStart.getDate() - 7);
  const orDateReplace = { start: formatDate(orDateStart), end: formatDate(orDateEnd) };
  const orResult = await tryEndpointsDualAuth(ENDPOINTS.orReport, allApiKeys, orDateReplace, 6);
  results.orReport = !!orResult;
  if (orResult) {
    discoveryResults.orReport = { path: orResult.path, sampleKeys: Object.keys(orResult.data?.return || orResult.data || {}).slice(0, 5) };
    const orData = orResult.data?.return || orResult.data;
    if (orData) {
      orDispatched = parseFloat(orData?.dispatched_mw || orData?.total_dispatched || 0) || null;
      orRegulating = parseFloat(orData?.regulating_mw || 0) || null;
      orSpinning = parseFloat(orData?.spinning_mw || 0) || null;
      orSupplemental = parseFloat(orData?.supplemental_mw || 0) || null;
    }
  }

  // Interchange Capability (FAILING — use dual auth with ALL keys)
  const ixCapResult = await tryEndpointsDualAuth(ENDPOINTS.interchangeCapability, allApiKeys, undefined, 5);
  results.interchangeCapability = !!ixCapResult;
  let bcCap = null, skCap = null, mtCap = null;
  if (ixCapResult) {
    discoveryResults.interchangeCapability = { path: ixCapResult.path };
    const ixData = ixCapResult.data?.return || ixCapResult.data;
    const ixArr = Array.isArray(ixData) ? ixData : [];
    for (const ix of ixArr) {
      const p = (ix?.path || ix?.interchange || "").toUpperCase();
      const cap = parseFloat(ix?.capability || ix?.ttc || ix?.total_transfer_capability || 0);
      if (p.includes("BC")) bcCap = cap;
      else if (p.includes("SK")) skCap = cap;
      else if (p.includes("MT")) mtCap = cap;
    }
  }

  // Load Outage (confirmed working — single key)
  const loadOutResult = await tryEndpoints(ENDPOINTS.loadOutage, apiKey, dateReplace);
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

  // Interchange Outage (FAILING — use dual auth with ALL keys)
  const ixOutResult = await tryEndpointsDualAuth(ENDPOINTS.interchangeOutage, allApiKeys, undefined, 5);
  results.interchangeOutage = !!ixOutResult;
  if (ixOutResult) {
    discoveryResults.interchangeOutage = { path: ixOutResult.path };
  }

  // Pool Participants (confirmed working — single key)
  const ppResult = await tryEndpoints(ENDPOINTS.poolParticipant, apiKey);
  results.poolParticipant = !!ppResult;
  if (ppResult) {
    discoveryResults.poolParticipant = { path: ppResult.path, count: Array.isArray(ppResult.data?.return) ? ppResult.data.return.length : "unknown" };
  }

  // Metered Volume (FAILING — use dual auth with ALL keys)
  const mvResult = await tryEndpointsDualAuth(ENDPOINTS.meteredVolume, allApiKeys, dateReplace, 5);
  results.meteredVolume = !!mvResult;
  if (mvResult) {
    discoveryResults.meteredVolume = { path: mvResult.path, sampleKeys: Object.keys(mvResult.data?.return || mvResult.data || {}).slice(0, 5) };
  } else {
    discoveryResults.meteredVolume = { tried: true, success: false };
  }

  // Unit Commitment (confirmed working — single key)
  const ucResult = await tryEndpoints(ENDPOINTS.unitCommitment, apiKey);
  results.unitCommitment = !!ucResult;
  if (ucResult) {
    discoveryResults.unitCommitment = { path: ucResult.path, sampleKeys: Object.keys(ucResult.data?.return || ucResult.data || {}).slice(0, 5) };
  } else {
    discoveryResults.unitCommitment = { tried: true, success: false };
  }

  // ---- Phase 3: Store market snapshot ----
  let totalOutage = null, plannedOutage = null, forcedOutage = null;
  let meritDepth = null, marginalFuel = null, meritSnapshot = null;
  if (meritResult) {
    const mo = meritResult.data?.return || meritResult.data;
    const moArr = Array.isArray(mo) ? mo : mo?.["Merit Order"] || [];
    if (Array.isArray(moArr) && moArr.length > 0) {
      meritDepth = moArr.length;
      const last = moArr[moArr.length - 1];
      marginalFuel = last?.fuel_type || last?.fuelType || null;
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
    api_keys_available: allApiKeys.length,
  };

  console.log(`[Comprehensive Collector] ${response.endpoints_succeeded}/${response.endpoints_tested} endpoints succeeded in ${elapsed}ms (${allApiKeys.length} API keys available)`);
  console.log("[Discovery Results]", JSON.stringify(discoveryResults, null, 2));

  return new Response(JSON.stringify(response), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});

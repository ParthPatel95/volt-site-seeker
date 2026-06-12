import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';
import { corsHeaders } from '../_shared/cors.ts';

interface ReqBody {
  lat: number;
  lng: number;
  label?: string;
}

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const PEER_HUBS = [
  { code: 'YYC', name: 'Calgary', lat: 51.0447, lng: -114.0719 },
  { code: 'YEG', name: 'Edmonton', lat: 53.5461, lng: -113.4938 },
  { code: 'SEA', name: 'Seattle', lat: 47.6062, lng: -122.3321 },
  { code: 'ORD', name: 'Chicago', lat: 41.8781, lng: -87.6298 },
];

// One-way fiber latency model: speed of light in fiber ≈ 200,000 km/s → 5 µs/km.
// Real-world routing rarely follows great-circle paths; apply a 1.4× routing factor.
const FIBER_LATENCY_MS_PER_KM = 0.005 * 1.4; // ≈7 µs/km one-way
function modelLatencyMs(km: number) {
  return Math.round(km * FIBER_LATENCY_MS_PER_KM * 10) / 10;
}

function hav(lat1: number, lng1: number, lat2: number, lng2: number) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2
    + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180)
    * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

// Perpendicular distance from point to a line segment (great-circle approx via planar in km)
function distanceToSegmentKm(lat: number, lng: number, aLat: number, aLng: number, bLat: number, bLng: number) {
  const toXY = (la: number, lo: number) => {
    const R = 6371;
    const x = R * (lo * Math.PI / 180) * Math.cos(lat * Math.PI / 180);
    const y = R * (la * Math.PI / 180);
    return { x, y };
  };
  const p = toXY(lat, lng);
  const a = toXY(aLat, aLng);
  const b = toXY(bLat, bLng);
  const dx = b.x - a.x, dy = b.y - a.y;
  const len2 = dx * dx + dy * dy;
  let t = len2 === 0 ? 0 : ((p.x - a.x) * dx + (p.y - a.y) * dy) / len2;
  t = Math.max(0, Math.min(1, t));
  const cx = a.x + t * dx, cy = a.y + t * dy;
  return Math.hypot(p.x - cx, p.y - cy);
}

function nearestPoints<T extends { lat: number; lng: number }>(items: T[], lat: number, lng: number, limit = 3) {
  return items
    .map(r => ({ ...r, distance_km: hav(lat, lng, r.lat, r.lng) }))
    .sort((a, b) => a.distance_km - b.distance_km)
    .slice(0, limit);
}

function nearestLines<T extends { start_lat: number; start_lng: number; end_lat: number; end_lng: number }>(
  items: T[], lat: number, lng: number, limit = 3,
) {
  return items
    .map(r => ({ ...r, distance_km: distanceToSegmentKm(lat, lng, r.start_lat, r.start_lng, r.end_lat, r.end_lng) }))
    .sort((a, b) => a.distance_km - b.distance_km)
    .slice(0, limit);
}

function inAlbertaBounds(lat: number, lng: number) {
  return lat >= 48.99 && lat <= 60.01 && lng >= -120.01 && lng <= -109.99;
}

// Rough Texas state bounding box. Used to pick the right fiber/carrier-POP
// reference tables. Tight enough to avoid catching neighboring states for
// most real points; the function still works without disruption if a point
// falls outside (it just gets Alberta tables which will sort as "far").
function inTexasBounds(lat: number, lng: number) {
  return lat >= 25.83 && lat <= 36.51 && lng >= -106.65 && lng <= -93.51;
}

// Which region the point belongs to — drives table selection below.
function detectRegion(lat: number, lng: number): 'alberta' | 'texas' {
  if (inTexasBounds(lat, lng)) return 'texas';
  return 'alberta';
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing authorization' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const body = await req.json() as ReqBody;
    const { lat, lng, label } = body;
    if (typeof lat !== 'number' || typeof lng !== 'number' || Number.isNaN(lat) || Number.isNaN(lng)) {
      return new Response(JSON.stringify({ error: 'lat and lng required as numbers' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    const isAlberta = inAlbertaBounds(lat, lng);

    const admin = createClient(SUPABASE_URL, SERVICE_KEY);
    const userClient = createClient(SUPABASE_URL, Deno.env.get('SUPABASE_ANON_KEY')!, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user } } = await userClient.auth.getUser();
    if (!user) {
      return new Response(JSON.stringify({ error: 'Invalid session' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Pick fiber-related tables by region. Other layers (gas, water,
    // transmission, climate, hazards, incentives, etc.) are still Alberta-only
    // until their TX equivalents are seeded; for TX points they'll return
    // distant matches that the UI shows with the right "far" distance label.
    const region = detectRegion(lat, lng);
    const popsTable   = region === 'texas' ? 'texas_carrier_pops'  : 'alberta_carrier_pops';
    const fiberTable  = region === 'texas' ? 'texas_fiber_routes'  : 'alberta_fiber_routes';

    // Pull all reference layers in parallel
    const [
      pops, fiber, trans, gas, water, parks,
      climate, hazards, waterLic, incentives,
      clouds, ixps, logistics, gen, pop,
      workforce, postSec, epcs, wages, regZones,
      popDetails, lastMile, darkFiber,
    ] = await Promise.all([
      admin.from(popsTable).select('*'),
      admin.from(fiberTable).select('*'),
      admin.from('alberta_transmission_lines').select('*'),
      admin.from('alberta_gas_pipelines').select('*'),
      admin.from('alberta_water_sources').select('*'),
      admin.from('alberta_industrial_parks').select('*'),
      admin.from('alberta_climate_normals').select('*'),
      admin.from('alberta_hazard_grid').select('*'),
      admin.from('alberta_water_licences').select('*'),
      admin.from('alberta_municipal_incentives').select('*'),
      admin.from('cloud_regions').select('*'),
      admin.from('internet_exchanges').select('*'),
      admin.from('alberta_logistics_assets').select('*'),
      admin.from('alberta_generation_assets').select('*'),
      admin.from('alberta_population_centres').select('*'),
      admin.from('alberta_workforce_stats').select('*'),
      admin.from('alberta_post_secondary').select('*'),
      admin.from('alberta_construction_capacity').select('*'),
      admin.from('alberta_construction_wages').select('*'),
      admin.from('alberta_regulatory_zones').select('*'),
      admin.from('alberta_carrier_pop_details').select('*'),
      admin.from('alberta_last_mile_providers').select('*'),
      admin.from('alberta_dark_fiber_inventory').select('*'),
    ]);

    const nearestPops = nearestPoints(pops.data ?? [], lat, lng, 5);
    const nearestFiber = nearestLines(fiber.data ?? [], lat, lng, 4);
    const nearestTrans = nearestLines(trans.data ?? [], lat, lng, 4);
    const nearestGas = nearestLines(gas.data ?? [], lat, lng, 3);
    const nearestWater = nearestPoints(water.data ?? [], lat, lng, 3);
    const nearestParks = nearestPoints(parks.data ?? [], lat, lng, 3);
    const nearestClimate = nearestPoints(climate.data ?? [], lat, lng, 1)[0];
    const nearestHazard = nearestPoints(hazards.data ?? [], lat, lng, 1)[0];
    const nearestWaterLic = nearestPoints(waterLic.data ?? [], lat, lng, 3);
    const nearestIncentive = nearestPoints(incentives.data ?? [], lat, lng, 1)[0];
    const nearestIxps = nearestPoints(ixps.data ?? [], lat, lng, 4);
    const nearestLogistics = nearestPoints(logistics.data ?? [], lat, lng, 8);
    const nearbyGen = nearestPoints(gen.data ?? [], lat, lng, 8).filter((g: any) => g.distance_km <= 150);
    const nearestPopulation = nearestPoints(pop.data ?? [], lat, lng, 3);

    // -------- Fiber Connectivity Score (0-100) --------
    // Sub-scores:
    //   Proximity (35): nearest POP distance (≤2 km = full, ≥75 km = 0)
    //   Carrier diversity (25): unique carriers within 50 km (4+ = full)
    //   Route diversity (20): unique long-haul routes within 25 km of site (3+ = full)
    //   Latency (20): best YYC/YEG one-way latency (≤2 ms = full, ≥25 ms = 0)
    const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
    const lerp = (v: number, lo: number, hi: number) => clamp01((hi - v) / (hi - lo));

    const nearestPopDist = nearestPops[0]?.distance_km ?? 999;
    const proximityScore = lerp(nearestPopDist, 2, 75) * 35;

    const carriersWithin50 = new Set(
      (pops.data ?? [])
        .map((p: any) => ({ ...p, d: hav(lat, lng, p.lat, p.lng) }))
        .filter((p: any) => p.d <= 50)
        .map((p: any) => p.carrier),
    );
    const diversityScore = Math.min(carriersWithin50.size, 4) / 4 * 25;

    const routesWithin25 = (fiber.data ?? [])
      .map((r: any) => ({
        ...r,
        d: distanceToSegmentKm(lat, lng, r.start_lat, r.start_lng, r.end_lat, r.end_lng),
      }))
      .filter((r: any) => r.d <= 25);
    const uniqueRouteKeys = new Set(routesWithin25.map((r: any) => `${r.carrier}|${r.route_name ?? r.id}`));
    const routeDiversityScore = Math.min(uniqueRouteKeys.size, 3) / 3 * 20;

    const bestLocalLatency = Math.min(
      ...nearestPops
        .flatMap(p => [p.latency_to_yyc_ms, p.latency_to_yeg_ms])
        .filter((v: any): v is number => typeof v === 'number'),
      99,
    );
    const latencyScore = lerp(bestLocalLatency, 2, 25) * 20;

    const total = proximityScore + diversityScore + routeDiversityScore + latencyScore;
    const grade = total >= 85 ? 'A' : total >= 70 ? 'B' : total >= 55 ? 'C' : total >= 40 ? 'D' : 'F';
    const fiber_score = {
      total: Math.round(total),
      grade,
      breakdown: {
        proximity: { score: Math.round(proximityScore), max: 35, detail: `Nearest POP ${nearestPopDist.toFixed(1)} km` },
        carrier_diversity: { score: Math.round(diversityScore), max: 25, detail: `${carriersWithin50.size} unique carriers within 50 km` },
        route_diversity: { score: Math.round(routeDiversityScore), max: 20, detail: `${uniqueRouteKeys.size} long-haul routes within 25 km` },
        latency: { score: Math.round(latencyScore), max: 20, detail: bestLocalLatency < 99 ? `Best ${bestLocalLatency} ms to YYC/YEG` : 'No published latency' },
      },
    };

    // -------- Top Routes ranking --------
    // Score each POP × peering-hub combo by latency, then site→POP distance.
    const routeRanking: Array<{
      rank: number; carrier: string; pop: string; pop_city: string;
      site_to_pop_km: number; hub: string; latency_ms: number | null;
      composite: number;
    }> = [];
    for (const p of nearestPops) {
      for (const h of PEER_HUBS) {
        const key = `latency_to_${h.code.toLowerCase()}_ms` as keyof typeof p;
        const latency = (p as any)[key] as number | null;
        if (latency == null) continue;
        // Composite: lower latency + closer POP = higher score
        const latPart = lerp(latency, 1, 60) * 70;
        const distPart = lerp(p.distance_km ?? 999, 2, 75) * 30;
        routeRanking.push({
          rank: 0, carrier: p.carrier, pop: p.facility_name, pop_city: p.city,
          site_to_pop_km: Math.round((p.distance_km ?? 0) * 10) / 10,
          hub: h.name, latency_ms: latency,
          composite: Math.round(latPart + distPart),
        });
      }
    }
    routeRanking.sort((a, b) => b.composite - a.composite);
    routeRanking.forEach((r, i) => { r.rank = i + 1; });
    const top_routes = routeRanking.slice(0, 8);

    // Substations: use existing substations table where lat/lng present
    const { data: subs } = await admin.from('substations').select('id,name,city,state,latitude,longitude,voltage_level,utility_owner');
    const subsAlberta = (subs ?? [])
      .filter((s: any) => typeof s.latitude === 'number' && typeof s.longitude === 'number'
        && inAlbertaBounds(s.latitude, s.longitude))
      .map((s: any) => ({ ...s, lat: s.latitude, lng: s.longitude }));
    const nearestSubs = nearestPoints(subsAlberta, lat, lng, 3);

    // -------- Drive times --------
    const driveTimes = PEER_HUBS.slice(0, 2).map(h => {
      const km = hav(lat, lng, h.lat, h.lng);
      return { hub: h.name, code: h.code, distance_km: Math.round(km), drive_hours_est: Math.round(km / 95 * 10) / 10 };
    });

    // -------- Cloud region modeled latency --------
    const cloudReach = (clouds.data ?? []).map((c: any) => {
      const km = hav(lat, lng, c.lat, c.lng);
      return {
        provider: c.provider, region_code: c.region_code, region_name: c.region_name,
        distance_km: Math.round(km),
        modeled_latency_ms_one_way: modelLatencyMs(km),
        source_url: c.source_url,
      };
    }).sort((a, b) => a.modeled_latency_ms_one_way - b.modeled_latency_ms_one_way);

    // -------- Generation mix within 150 km --------
    const genMix = nearbyGen.reduce((acc: Record<string, { mw: number; count: number }>, g: any) => {
      acc[g.fuel_type] = acc[g.fuel_type] ?? { mw: 0, count: 0 };
      acc[g.fuel_type].mw += Number(g.capacity_mw);
      acc[g.fuel_type].count += 1;
      return acc;
    }, {});
    const renewableMw = (genMix.wind?.mw ?? 0) + (genMix.solar?.mw ?? 0) + (genMix.hydro?.mw ?? 0);
    const totalGenMw = Object.values(genMix).reduce((s, v) => s + v.mw, 0);
    const renewableShare = totalGenMw > 0 ? renewableMw / totalGenMw : 0;
    const ppaCandidates = nearbyGen.filter((g: any) => g.ppa_available).slice(0, 6);

    // -------- Composite Hyperscaler Suitability Score (0-100) --------
    // Fiber 20, Power 25, Climate 15, Water 10, Risk 10, Sustainability 10, Logistics 10
    const fiberSub = Math.round((total / 100) * 20);

    const nearestTransKv = nearestTrans[0]?.voltage_kv ?? 0;
    const nearestSubDist = nearestSubs[0]?.distance_km ?? 999;
    const powerScore = Math.round(
      lerp(nearestSubDist, 2, 50) * 10 +
      lerp(75 / Math.max(nearestTransKv, 25), 0.15, 3) * 15,
    );

    const freeCool = nearestClimate?.free_cooling_hours_below_18c ?? 7000;
    const climateScore = Math.round(clamp01((freeCool - 6500) / 1500) * 15);

    const waterDist = nearestWater[0]?.distance_km ?? 999;
    const waterClosed = nearestWater[0]?.allocation_status === 'closed';
    const waterScore = Math.round(lerp(waterDist, 2, 60) * 10 * (waterClosed ? 0.5 : 1));

    const hazardPenalty = ((): number => {
      const order: Record<string, number> = { 'Very Low': 0, 'Low': 1, 'Low-Moderate': 2, 'Moderate': 3, 'High': 4, 'Severe': 5 };
      const ratings = [nearestHazard?.seismic_rating, nearestHazard?.wildfire_rating, nearestHazard?.flood_rating, nearestHazard?.tornado_rating];
      const max = Math.max(...ratings.map((r: any) => order[r] ?? 1));
      return max; // 0..5
    })();
    const riskScore = Math.round(clamp01(1 - hazardPenalty / 5) * 10);

    const sustainabilityScore = Math.round(
      clamp01(renewableShare) * 6 +
      Math.min(ppaCandidates.length, 4) / 4 * 4,
    );

    const nearestAirportDist = nearestPoints(
      (logistics.data ?? []).filter((l: any) => l.asset_type === 'international_airport'), lat, lng, 1,
    )[0]?.distance_km ?? 999;
    const nearestRailDist = nearestPoints(
      (logistics.data ?? []).filter((l: any) => l.asset_type === 'class_i_rail'), lat, lng, 1,
    )[0]?.distance_km ?? 999;
    const labour = nearestPopulation[0]?.labour_force_2021 ?? 0;
    const logisticsScore = Math.round(
      lerp(nearestAirportDist, 5, 200) * 4 +
      lerp(nearestRailDist, 1, 80) * 3 +
      clamp01(labour / 500000) * 3,
    );

    const hsTotal = fiberSub + powerScore + climateScore + waterScore + riskScore + sustainabilityScore + logisticsScore;
    const hsGrade = hsTotal >= 85 ? 'A' : hsTotal >= 70 ? 'B' : hsTotal >= 55 ? 'C' : hsTotal >= 40 ? 'D' : 'F';

    const hyperscaler_score = {
      total: hsTotal,
      grade: hsGrade,
      breakdown: {
        fiber:           { score: fiberSub,          max: 20, detail: `Fiber sub-score ${total.toFixed(0)}/100 → ${fiberSub}/20` },
        power:           { score: powerScore,        max: 25, detail: `Nearest sub ${nearestSubDist.toFixed(1)} km · highest line ${nearestTransKv} kV` },
        climate:         { score: climateScore,      max: 15, detail: `${freeCool.toLocaleString()} free-cooling hours/yr (${nearestClimate?.station_name ?? 'n/a'})` },
        water:           { score: waterScore,        max: 10, detail: `${nearestWater[0]?.name ?? 'none'} ${waterDist.toFixed(1)} km · basin ${nearestWater[0]?.allocation_status ?? 'unknown'}` },
        risk:            { score: riskScore,         max: 10, detail: `${nearestHazard?.region_name ?? 'n/a'} — seismic ${nearestHazard?.seismic_rating ?? '?'}, wildfire ${nearestHazard?.wildfire_rating ?? '?'}` },
        sustainability:  { score: sustainabilityScore, max: 10, detail: `${Math.round(renewableShare * 100)}% renewable MW within 150 km · ${ppaCandidates.length} PPA-eligible` },
        logistics:       { score: logisticsScore,    max: 10, detail: `Airport ${Math.round(nearestAirportDist)} km · rail ${Math.round(nearestRailDist)} km · ${labour.toLocaleString()} workers nearby` },
      },
    };

    const methodology = {
      hyperscaler_score: 'Weighted 100-pt composite: Fiber(20) Power(25) Climate(15) Water(10) Risk(10) Sustainability(10) Logistics(10).',
      fiber_score: 'Proximity(35) + Carrier diversity(25) + Route diversity(20) + Latency(20).',
      modeled_latency: `One-way fiber latency modeled at 5 µs/km × 1.4 routing factor (≈7 µs/km). Speed of light in single-mode fiber n=1.467 ≈ 200,000 km/s.`,
      distance: 'All distances are great-circle (Haversine) in kilometres — replace with road network for drive-time accuracy.',
      datasets_loaded: {
        carrier_pops: pops.data?.length ?? 0,
        fiber_routes: fiber.data?.length ?? 0,
        transmission_lines: trans.data?.length ?? 0,
        substations: subsAlberta.length,
        gas_pipelines: gas.data?.length ?? 0,
        water_sources: water.data?.length ?? 0,
        water_licences: waterLic.data?.length ?? 0,
        industrial_parks: parks.data?.length ?? 0,
        climate_stations: climate.data?.length ?? 0,
        hazard_regions: hazards.data?.length ?? 0,
        municipal_incentives: incentives.data?.length ?? 0,
        cloud_regions: clouds.data?.length ?? 0,
        internet_exchanges: ixps.data?.length ?? 0,
        logistics_assets: logistics.data?.length ?? 0,
        generation_assets: gen.data?.length ?? 0,
        population_centres: pop.data?.length ?? 0,
      },
    };

    const report = {
      generated_at: new Date().toISOString(),
      location: { lat, lng, label: label ?? null },
      hyperscaler_score,
      methodology,
      fiber: {
        score: fiber_score,
        top_routes,
        nearest_pops: nearestPops,
        nearest_long_haul_routes: nearestFiber,
        nearest_ixps: nearestIxps,
        cloud_reach: cloudReach,
        peering_hubs: PEER_HUBS,
      },
      transmission: {
        nearest_lines: nearestTrans,
        nearest_substations: nearestSubs,
      },
      gas_and_water: {
        nearest_gas_pipelines: nearestGas,
        nearest_water_sources: nearestWater,
        nearest_water_licences: nearestWaterLic,
      },
      climate: nearestClimate ?? null,
      risk: nearestHazard ?? null,
      sustainability: {
        generation_mix: genMix,
        renewable_share_pct: Math.round(renewableShare * 1000) / 10,
        nearby_generation: nearbyGen,
        ppa_candidates: ppaCandidates,
      },
      jurisdiction: nearestIncentive ?? null,
      logistics: {
        nearest_industrial_parks: nearestParks,
        nearest_logistics_assets: nearestLogistics,
        nearest_population_centres: nearestPopulation,
        drive_times: driveTimes,
      },
      workforce: (() => {
        const nearestWf = nearestPoints(workforce.data ?? [], lat, lng, 3);
        const nearestSchools = nearestPoints(postSec.data ?? [], lat, lng, 8)
          .filter((s: any) => s.distance_km <= 200);
        return {
          nearest_centres: nearestWf,
          post_secondary_within_200km: nearestSchools,
        };
      })(),
      construction: {
        epc_firms: epcs.data ?? [],
        union_vs_open_wages: wages.data ?? [],
      },
      regulatory: (() => {
        const nearestZone = nearestPoints(regZones.data ?? [], lat, lng, 1)[0] ?? null;
        return { nearest_zone: nearestZone };
      })(),
      connectivity_depth: (() => {
        const popDet = nearestPoints(popDetails.data ?? [], lat, lng, 6);
        const lm = nearestPoints(lastMile.data ?? [], lat, lng, 1)[0] ?? null;
        const df = nearestLines(darkFiber.data ?? [], lat, lng, 5);
        return {
          carrier_pop_details: popDet,
          last_mile_in_municipality: lm,
          dark_fiber_segments_nearby: df,
        };
      })(),
      data_provenance: {
        sources: [
          'AESO Transmission Map & Asset List — https://www.aeso.ca',
          'Canada Energy Regulator (CER) pipeline data portal — https://www.cer-rec.gc.ca',
          'Alberta Environment & Protected Areas Water Use Reporting — https://www.alberta.ca/water-use-reporting',
          'Environment & Climate Change Canada Climate Normals 1991–2020 — https://climate.weather.gc.ca',
          'NRCan Earthquakes Canada seismic hazard — https://earthquakescanada.nrcan.gc.ca',
          'Alberta Wildfire — https://wildfire.alberta.ca',
          'PeeringDB — https://www.peeringdb.com',
          'Carrier facility/coverage pages (Bell, Telus, Zayo, Cologix, eStruxture, AXIA)',
          'Statistics Canada Census 2021 — https://www12.statcan.gc.ca',
          'Hyperscaler region listings (AWS / Azure / GCP / Oracle)',
          'Alberta Wage & Salary Survey — https://open.alberta.ca/publications/alberta-wage-and-salary-survey',
          'Alberta Labour Force Statistics — https://open.alberta.ca/dataset/labour-force-statistics',
          'CRTC Communications Monitoring & ISED National Broadband Data — https://crtc.gc.ca / https://www.ic.gc.ca',
          'Municipal property tax rates (per-municipality publications)',
          'Post-secondary institution program calendars (SAIT, NAIT, U of C, U of A, polytechnics)',
        ],
        notes: 'Reference layers are curated from primary public sources and refreshed quarterly. Per-row source URL and "as-of" date is returned with every record. Latencies marked "modeled" use the speed-of-light-in-fiber formula; latencies marked "verified" come from carrier-published values.',
      },
    };

    // Cache the report
    await admin.from('alberta_site_reports').insert({
      user_id: user.id, lat, lng, label: label ?? null, report,
    });

    return new Response(JSON.stringify({ report }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('[alberta-site-report] error', err);
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
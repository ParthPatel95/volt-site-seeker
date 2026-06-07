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
    if (!inAlbertaBounds(lat, lng)) {
      return new Response(JSON.stringify({ error: 'Coordinates outside Alberta bounding box' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

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

    // Pull all curated layers in parallel (small tables, fine to load fully)
    const [pops, fiber, trans, gas, water, parks] = await Promise.all([
      admin.from('alberta_carrier_pops').select('*'),
      admin.from('alberta_fiber_routes').select('*'),
      admin.from('alberta_transmission_lines').select('*'),
      admin.from('alberta_gas_pipelines').select('*'),
      admin.from('alberta_water_sources').select('*'),
      admin.from('alberta_industrial_parks').select('*'),
    ]);

    const nearestPops = nearestPoints(pops.data ?? [], lat, lng, 5);
    const nearestFiber = nearestLines(fiber.data ?? [], lat, lng, 4);
    const nearestTrans = nearestLines(trans.data ?? [], lat, lng, 4);
    const nearestGas = nearestLines(gas.data ?? [], lat, lng, 3);
    const nearestWater = nearestPoints(water.data ?? [], lat, lng, 3);
    const nearestParks = nearestPoints(parks.data ?? [], lat, lng, 3);

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

    // Drive times to YYC/YEG (Haversine + avg highway speed 95km/h, MVP)
    const driveTimes = PEER_HUBS.slice(0, 2).map(h => {
      const km = hav(lat, lng, h.lat, h.lng);
      return { hub: h.name, code: h.code, distance_km: Math.round(km), drive_hours_est: Math.round(km / 95 * 10) / 10 };
    });

    const report = {
      generated_at: new Date().toISOString(),
      location: { lat, lng, label: label ?? null },
      fiber: {
        score: fiber_score,
        top_routes,
        nearest_pops: nearestPops,
        nearest_long_haul_routes: nearestFiber,
        peering_hubs: PEER_HUBS,
      },
      transmission: {
        nearest_lines: nearestTrans,
        nearest_substations: nearestSubs,
      },
      gas_and_water: {
        nearest_gas_pipelines: nearestGas,
        nearest_water_sources: nearestWater,
      },
      logistics: {
        nearest_industrial_parks: nearestParks,
        drive_times: driveTimes,
      },
      data_provenance: {
        sources: [
          'AESO Open Data – transmission topology',
          'CRTC fiber infrastructure dataset',
          'CER (Canada Energy Regulator) pipeline GIS',
          'Carrier public coverage pages (Bell/Telus/Zayo/AXIA/Cologix/eStruxture)',
          'Alberta municipal industrial park sites',
        ],
        notes: 'Curated dataset, refreshed quarterly. Distances are straight-line (great circle) in kilometres. Latencies are typical one-way estimates published by carriers.',
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
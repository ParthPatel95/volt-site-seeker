import { corsHeaders } from "../_shared/cors.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

// Hidden Gems: closure-signal monitor.
//
// For each facility, query Sentinel-2 L2A NDVI over a tight footprint bbox
// around the facility coordinates AND over a nearby baseline area (rural
// land, no expected change). Compare how NDVI evolves over the analysis
// window — when vegetation creeps in over a paved/bare plant yard faster
// than the surrounding baseline, that's the visible-from-orbit signature
// of an idled or closed site.
//
// Data policy (same as the rest of Hidden Gems):
//   * Every observation row carries the scene id + cloud cover; nothing is
//     interpolated or guessed.
//   * The trend score is bounded to the analysis window we actually
//     observed; if Sentinel returns fewer than 3 good bins, we record
//     `activity_trend = 'no_data'` instead of inventing a number.
//   * The function REQUIRES Sentinel Hub credentials (free tier works,
//     30k reqs/month). Without them it reports `needs: ['sentinel_creds']`
//     so the caller can surface an actionable setup error instead of a
//     silent failure.
//
// Required Supabase secrets:
//   SENTINEL_HUB_CLIENT_ID
//   SENTINEL_HUB_CLIENT_SECRET
// Free signup at https://www.sentinel-hub.com/.

interface MonitorRequest {
  facility_id?: string;          // monitor one
  all_stale_days?: number;       // or every facility older than N days
  limit?: number;                // batch cap (default 5; Statistical API is rate-limited)
  window_years?: number;         // default 3
  footprint_radius_m?: number;   // default 250
  baseline_offset_m?: number;    // default 1800 (south of the facility)
}

interface MonitorResult {
  facility_id: string;
  name: string;
  observations: number;
  trend: 'rising_vegetation' | 'stable' | 'recovering' | 'no_data' | 'error';
  trend_score?: number;
  evidence?: string;
  error?: string;
  needs?: string[];
}

const OAUTH_URL = 'https://services.sentinel-hub.com/oauth/token';
const STATS_URL = 'https://services.sentinel-hub.com/api/v1/statistics';

const EVALSCRIPT = `//VERSION=3
function setup() {
  return {
    input: [{ bands: ["B04", "B08", "SCL"], units: "DN" }],
    output: [
      { id: "ndvi", bands: 1, sampleType: "FLOAT32" },
      { id: "dataMask", bands: 1 }
    ]
  };
}
function evaluatePixel(s) {
  // SCL: 3=shadow, 7=unclassified, 8=med cloud prob, 9=high cloud prob,
  // 10=thin cirrus, 11=snow/ice. Mask those out of the NDVI mean.
  const bad = s.SCL === 3 || s.SCL === 8 || s.SCL === 9 || s.SCL === 10 || s.SCL === 11;
  const ndvi = (s.B08 - s.B04) / (s.B08 + s.B04 + 1e-6);
  return { ndvi: [ndvi], dataMask: [bad ? 0 : 1] };
}`;

// Lat/lng → square bbox of radiusM around (lat,lng), in WGS84 degrees.
function bboxAround(lat: number, lng: number, radiusM: number): [number, number, number, number] {
  const dLat = radiusM / 111320;
  const dLng = radiusM / (111320 * Math.cos((lat * Math.PI) / 180));
  return [lng - dLng, lat - dLat, lng + dLng, lat + dLat];
}

// Move (lat,lng) by metres on the ground; bearingDeg 0=N, 90=E, 180=S.
function offsetCoord(lat: number, lng: number, metres: number, bearingDeg: number): [number, number] {
  const R = 6371000;
  const δ = metres / R;
  const θ = (bearingDeg * Math.PI) / 180;
  const φ1 = (lat * Math.PI) / 180;
  const λ1 = (lng * Math.PI) / 180;
  const φ2 = Math.asin(Math.sin(φ1) * Math.cos(δ) + Math.cos(φ1) * Math.sin(δ) * Math.cos(θ));
  const λ2 = λ1 + Math.atan2(
    Math.sin(θ) * Math.sin(δ) * Math.cos(φ1),
    Math.cos(δ) - Math.sin(φ1) * Math.sin(φ2),
  );
  return [(φ2 * 180) / Math.PI, (λ2 * 180) / Math.PI];
}

async function getAccessToken(clientId: string, clientSecret: string): Promise<string> {
  const r = await fetch(OAUTH_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: clientId,
      client_secret: clientSecret,
    }),
  });
  if (!r.ok) throw new Error(`sentinel oauth ${r.status}: ${await r.text()}`);
  const j = await r.json();
  if (!j.access_token) throw new Error('sentinel oauth: no access_token');
  return j.access_token as string;
}

type StatsResult = {
  observations: Array<{
    date: string;
    sceneId: string | null;
    cloudCoverPct: number | null;
    ndviMean: number | null;
  }>;
};

async function ndviStats(
  token: string,
  bbox: [number, number, number, number],
  fromISO: string,
  toISO: string,
): Promise<StatsResult> {
  // Statistical API: one mean NDVI per ~90-day bin over the window. Each bin
  // returns the cloud-aware mean across the cleanest scenes inside it.
  const payload = {
    input: {
      bounds: { bbox, properties: { crs: 'http://www.opengis.net/def/crs/EPSG/0/4326' } },
      data: [{
        type: 'sentinel-2-l2a',
        dataFilter: {
          timeRange: { from: fromISO, to: toISO },
          maxCloudCoverage: 60,
          mosaickingOrder: 'leastCC',
        },
      }],
    },
    aggregation: {
      timeRange: { from: fromISO, to: toISO },
      aggregationInterval: { of: 'P90D' },
      evalscript: EVALSCRIPT,
      resx: 10, resy: 10,
    },
    calculations: { ndvi: { statistics: { default: { stats: ['mean'] } } } },
  };
  const r = await fetch(STATS_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload),
  });
  if (!r.ok) throw new Error(`sentinel stats ${r.status}: ${await r.text()}`);
  const j = await r.json();

  // Shape: { data: [{ interval: { from, to }, outputs: { ndvi: { bands: { B0: { stats: { mean } } } } } }, ...] }
  const obs: StatsResult['observations'] = [];
  for (const row of j.data ?? []) {
    const mean = row?.outputs?.ndvi?.bands?.B0?.stats?.mean ?? null;
    obs.push({
      date: row?.interval?.from?.slice(0, 10) ?? '',
      sceneId: null,            // Statistical API doesn't expose per-scene IDs
      cloudCoverPct: null,
      ndviMean: typeof mean === 'number' && Number.isFinite(mean) ? mean : null,
    });
  }
  return { observations: obs };
}

// Linear regression slope of y vs x (years from start) using only non-null y.
function linearSlope(points: { t: number; y: number | null }[]): number | null {
  const xs = points.filter((p) => p.y != null) as { t: number; y: number }[];
  if (xs.length < 3) return null;
  const n = xs.length;
  const meanX = xs.reduce((s, p) => s + p.t, 0) / n;
  const meanY = xs.reduce((s, p) => s + p.y, 0) / n;
  let num = 0, den = 0;
  for (const p of xs) { num += (p.t - meanX) * (p.y - meanY); den += (p.t - meanX) ** 2; }
  return den === 0 ? null : num / den; // NDVI / year
}

function classifyTrend(slopeFootprint: number | null, slopeBaseline: number | null): {
  trend: MonitorResult['trend'];
  score: number;
  evidence: string;
} {
  if (slopeFootprint == null) return { trend: 'no_data', score: 0, evidence: 'too few clear observations' };
  const baseline = slopeBaseline ?? 0;
  const delta = slopeFootprint - baseline; // NDVI/year over baseline
  // Score: 0 at delta <= 0, 100 at delta >= 0.12/yr (very strong vegetation rebound).
  const score = Math.round(Math.max(0, Math.min(100, (delta / 0.12) * 100)));
  let trend: MonitorResult['trend'];
  if (delta >= 0.04) trend = 'rising_vegetation';
  else if (delta >= 0.015) trend = 'recovering';
  else trend = 'stable';
  const evidence = `footprint NDVI slope ${slopeFootprint.toFixed(3)}/yr vs baseline ${baseline.toFixed(3)}/yr (Δ ${delta >= 0 ? '+' : ''}${delta.toFixed(3)})`;
  return { trend, score, evidence };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );
    const clientId = Deno.env.get('SENTINEL_HUB_CLIENT_ID');
    const clientSecret = Deno.env.get('SENTINEL_HUB_CLIENT_SECRET');

    if (!clientId || !clientSecret) {
      return new Response(JSON.stringify({
        success: false,
        needs: ['sentinel_creds'],
        error: 'Set SENTINEL_HUB_CLIENT_ID and SENTINEL_HUB_CLIENT_SECRET as Supabase secrets. Free signup at https://www.sentinel-hub.com/.',
      }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const body: MonitorRequest = req.method === 'POST' ? await req.json().catch(() => ({})) : {};
    const limit = Math.min(20, Math.max(1, body.limit ?? 5));
    const windowYears = Math.max(1, Math.min(5, body.window_years ?? 3));
    const footprintR = Math.max(100, Math.min(1200, body.footprint_radius_m ?? 250));
    const baselineOff = Math.max(800, Math.min(5000, body.baseline_offset_m ?? 1800));

    let q = supabase.from('industrial_facilities').select('*');
    if (body.facility_id) q = q.eq('id', body.facility_id);
    else {
      const staleDays = Math.max(0, body.all_stale_days ?? 30);
      const cutoff = new Date(Date.now() - staleDays * 86400000).toISOString();
      q = q.or(`activity_checked_at.is.null,activity_checked_at.lt.${cutoff}`).limit(limit);
    }
    const { data: facilities, error: fetchErr } = await q;
    if (fetchErr) throw fetchErr;

    const token = await getAccessToken(clientId, clientSecret);
    const now = new Date();
    const fromISO = new Date(now.getFullYear() - windowYears, now.getMonth(), now.getDate()).toISOString();
    const toISO = now.toISOString();

    const results: MonitorResult[] = [];

    for (const f of facilities ?? []) {
      const out: MonitorResult = { facility_id: f.id, name: f.name, observations: 0, trend: 'no_data' };
      try {
        const fpBbox = bboxAround(f.lat, f.lng, footprintR);
        // Baseline area south of the facility (180° bearing) — far enough not
        // to overlap, close enough that climate/season match.
        const [blLat, blLng] = offsetCoord(f.lat, f.lng, baselineOff, 180);
        const blBbox = bboxAround(blLat, blLng, footprintR);

        const [fpStats, blStats] = await Promise.all([
          ndviStats(token, fpBbox, fromISO, toISO),
          ndviStats(token, blBbox, fromISO, toISO),
        ]);

        // Persist footprint observations (the headline series).
        const rows = fpStats.observations.map((o, i) => ({
          facility_id: f.id,
          observed_at: o.date || fromISO.slice(0, 10),
          source: 'sentinel-2-l2a',
          scene_id: o.sceneId,
          cloud_cover_pct: o.cloudCoverPct,
          ndvi_mean_footprint: o.ndviMean,
          ndvi_mean_baseline: blStats.observations[i]?.ndviMean ?? null,
        }));
        if (rows.length) {
          await supabase.from('facility_activity_observations')
            .upsert(rows, { onConflict: 'facility_id,observed_at,source' });
        }
        out.observations = rows.length;

        // Time-series slopes (years since fromISO).
        const fromTs = new Date(fromISO).getTime();
        const yrs = (d: string) => (new Date(d).getTime() - fromTs) / (365.25 * 86400000);
        const fpPts = fpStats.observations.map((o) => ({ t: yrs(o.date), y: o.ndviMean }));
        const blPts = blStats.observations.map((o) => ({ t: yrs(o.date), y: o.ndviMean }));
        const { trend, score, evidence } = classifyTrend(linearSlope(fpPts), linearSlope(blPts));
        out.trend = trend;
        out.trend_score = score;
        out.evidence = evidence;

        await supabase.from('industrial_facilities').update({
          activity_trend: trend,
          activity_trend_score: score,
          activity_window_start: fromISO.slice(0, 10),
          activity_window_end: toISO.slice(0, 10),
          activity_checked_at: new Date().toISOString(),
          activity_evidence: evidence,
        }).eq('id', f.id);
      } catch (e) {
        out.trend = 'error';
        out.error = e instanceof Error ? e.message : String(e);
      }
      results.push(out);
    }

    return new Response(JSON.stringify({
      success: true,
      checked: results.length,
      window: { from: fromISO, to: toISO, years: windowYears },
      results,
    }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (e) {
    return new Response(JSON.stringify({
      success: false,
      error: e instanceof Error ? e.message : String(e),
    }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});

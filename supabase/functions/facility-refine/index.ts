import { corsHeaders } from "../_shared/cors.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";

// Hidden Gems facility refinement v2.
//
// The previous version called Google Geocoding on "{name}, {municipality}, {state}".
// Geocoding API is for ADDRESSES; for named industrial facilities ("Suncor
// Edmonton Refinery") it usually lands on the municipal centroid and we then
// labelled that as "locality" precision — that's the inaccurate-coordinates
// bug the user reported. This rewrite:
//
//   1. Asks Google Places "Find Place from Text" for the facility by NAME —
//      Places is designed for POIs and resolves named industrial sites with
//      site/rooftop precision in the cases Geocoding cannot.
//   2. Independently runs Google Geocoding as a second candidate.
//   3. Queries OSM Overpass for `landuse=industrial`, `man_made=works`, and
//      `industrial=*` polygons within 1.5 km of the best candidate, and
//      snaps to the polygon whose name matches the facility (or to the
//      nearest one if no name match).
//   4. Reports consensus (max distance between candidates) — when the two
//      Google candidates disagree by >2 km, that's a red flag the UI surfaces.
//   5. Picks the BEST candidate by a clear precedence: name-matched OSM
//      parcel > OSM parcel near a Places ROOFTOP/site point > Places site >
//      Geocoding ROOFTOP > nothing-good ('locality' / kept seed).
//
// Every coordinate we store now records the provider, the candidate list,
// and the precision tier — so the UI can show what actually happened, and we
// never silently demote a town centroid into "verified".

interface RefineRequest {
  facility_id?: string;
  all_unverified?: boolean;
  limit?: number;
}

type Candidate = {
  provider: 'google_places' | 'google_geocode' | 'osm_parcel_snap';
  lat: number;
  lng: number;
  label?: string;
  kind?: string;          // ROOFTOP/RANGE_INTERPOLATED/... or OSM polygon kind
  osm_parcel_id?: string;
  osm_parcel_name?: string;
};

interface RefineResult {
  facility_id: string;
  name: string;
  refined: boolean;
  provider?: Candidate['provider'];
  precision?: 'site' | 'parcel' | 'locality' | 'unverified';
  moved_km?: number;
  consensus_km?: number;
  candidates_count?: number;
  osm_substation_km?: number | null;
  osm_max_voltage_kv?: number | null;
  error?: string;
  needs?: string[];       // e.g. ['google_key', 'osm_function']
}

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

function normalise(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9 ]+/g, ' ')
    .replace(/\b(facility|plant|mill|smelter|refinery|works|complex|the)\b/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Loose match: every meaningful token of A appears as a token of B. */
function nameMatches(a: string, b: string): boolean {
  const ta = new Set(normalise(a).split(' ').filter((t) => t.length >= 3));
  const tb = new Set(normalise(b).split(' ').filter((t) => t.length >= 3));
  if (ta.size === 0 || tb.size === 0) return false;
  let hits = 0;
  for (const t of ta) if (tb.has(t)) hits++;
  return hits / ta.size >= 0.6;
}

// ── Google Places: Find Place from Text ──────────────────────────────────────
async function placesFindPlace(
  name: string, municipality: string | null, region: string, key: string,
): Promise<Candidate | null> {
  const query = [name, municipality, region].filter(Boolean).join(', ');
  const url = `https://maps.googleapis.com/maps/api/place/findplacefromtext/json` +
    `?input=${encodeURIComponent(query)}` +
    `&inputtype=textquery` +
    `&fields=geometry,formatted_address,name,place_id` +
    `&key=${key}`;
  const r = await fetch(url);
  const d = await r.json();
  const top = d?.candidates?.[0];
  if (d?.status !== 'OK' || !top?.geometry?.location) return null;
  return {
    provider: 'google_places',
    lat: top.geometry.location.lat,
    lng: top.geometry.location.lng,
    label: top.formatted_address ?? top.name,
    kind: 'place',
  };
}

// ── Google Geocoding (kept as a second opinion) ──────────────────────────────
async function geocode(
  name: string, municipality: string | null, region: string, key: string,
): Promise<Candidate | null> {
  const address = [name, municipality, region].filter(Boolean).join(', ');
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${key}`;
  const r = await fetch(url);
  const d = await r.json();
  const top = d?.results?.[0];
  if (d?.status !== 'OK' || !top?.geometry?.location) return null;
  return {
    provider: 'google_geocode',
    lat: top.geometry.location.lat,
    lng: top.geometry.location.lng,
    label: top.formatted_address,
    kind: top.geometry.location_type, // ROOFTOP | RANGE_INTERPOLATED | GEOMETRIC_CENTER | APPROXIMATE
  };
}

// ── OSM Overpass: industrial parcels near a point ────────────────────────────
type OsmParcel = {
  id: string;
  name: string | null;
  kind: string;
  centroidLat: number;
  centroidLng: number;
};

async function osmIndustrialParcels(
  lat: number, lng: number, radiusM = 1500,
): Promise<OsmParcel[]> {
  // Overpass: industrial land uses, named works, refineries — as polygons.
  const q = `
    [out:json][timeout:25];
    (
      way["landuse"="industrial"](around:${radiusM},${lat},${lng});
      relation["landuse"="industrial"](around:${radiusM},${lat},${lng});
      way["man_made"="works"](around:${radiusM},${lat},${lng});
      relation["man_made"="works"](around:${radiusM},${lat},${lng});
      way["industrial"](around:${radiusM},${lat},${lng});
      relation["industrial"](around:${radiusM},${lat},${lng});
      way["man_made"="petroleum_well"](around:${radiusM},${lat},${lng});
      way["plant:source"](around:${radiusM},${lat},${lng});
    );
    out tags center;
  `;
  const r = await fetch('https://overpass-api.de/api/interpreter', {
    method: 'POST',
    body: 'data=' + encodeURIComponent(q),
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  });
  if (!r.ok) return [];
  const d = await r.json();
  const out: OsmParcel[] = [];
  for (const el of d.elements ?? []) {
    const c = el.center ?? { lat: el.lat, lon: el.lon };
    if (!c?.lat || !c?.lon) continue;
    const tags = el.tags ?? {};
    const kind =
      tags['man_made'] === 'works' ? 'works' :
      tags['landuse'] === 'industrial' ? 'industrial' :
      tags['industrial'] ?? tags['plant:source'] ?? 'industrial';
    out.push({
      id: `${el.type}/${el.id}`,
      name: tags.name ?? tags['name:en'] ?? null,
      kind,
      centroidLat: c.lat,
      centroidLng: c.lon,
    });
  }
  return out;
}

/** Pick the OSM parcel that best matches the facility (name-aware). */
function pickParcel(parcels: OsmParcel[], facilityName: string, seed: Candidate): OsmParcel | null {
  if (parcels.length === 0) return null;
  // 1. Name match wins outright.
  for (const p of parcels) {
    if (p.name && nameMatches(facilityName, p.name)) return p;
  }
  // 2. Otherwise, nearest parcel (with light preference for 'works').
  let best: OsmParcel | null = null;
  let bestScore = Infinity;
  for (const p of parcels) {
    const d = haversineKm(seed.lat, seed.lng, p.centroidLat, p.centroidLng);
    const score = d + (p.kind === 'works' ? -0.1 : 0); // 100 m bonus for named works
    if (score < bestScore) { bestScore = score; best = p; }
  }
  return best;
}

// ── Pick the best overall candidate by precedence ────────────────────────────
function pickBest(
  candidates: Candidate[],
  parcel: { osm: OsmParcel; nearestSeed: Candidate } | null,
  facilityName: string,
): { winner: Candidate; precision: 'site' | 'parcel' | 'locality' } | null {
  // 1. Name-matched OSM parcel = parcel precision.
  if (parcel && parcel.osm.name && nameMatches(facilityName, parcel.osm.name)) {
    return {
      winner: {
        provider: 'osm_parcel_snap',
        lat: parcel.osm.centroidLat,
        lng: parcel.osm.centroidLng,
        label: parcel.osm.name,
        kind: parcel.osm.kind,
        osm_parcel_id: parcel.osm.id,
        osm_parcel_name: parcel.osm.name,
      },
      precision: 'parcel',
    };
  }
  // 2. Places ROOFTOP/geometry near an OSM parcel — snap to the parcel.
  const places = candidates.find((c) => c.provider === 'google_places');
  if (places && parcel) {
    const distKm = haversineKm(places.lat, places.lng, parcel.osm.centroidLat, parcel.osm.centroidLng);
    if (distKm <= 0.6) {
      return {
        winner: {
          provider: 'osm_parcel_snap',
          lat: parcel.osm.centroidLat,
          lng: parcel.osm.centroidLng,
          label: parcel.osm.name ?? places.label,
          kind: parcel.osm.kind,
          osm_parcel_id: parcel.osm.id,
          osm_parcel_name: parcel.osm.name ?? undefined,
        },
        precision: 'parcel',
      };
    }
  }
  // 3. Plain Places candidate = site precision.
  if (places) return { winner: places, precision: 'site' };
  // 4. Geocoding ROOFTOP = site precision; coarser = locality.
  const geo = candidates.find((c) => c.provider === 'google_geocode');
  if (geo) {
    const precision = geo.kind === 'ROOFTOP' ? 'site' : 'locality';
    return { winner: geo, precision };
  }
  return null;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );
    const googleKey = Deno.env.get('GOOGLE_MAPS_API_KEY') ?? Deno.env.get('GOOGLE_PLACES_API_KEY');

    const body: RefineRequest = req.method === 'POST' ? await req.json().catch(() => ({})) : {};
    const limit = Math.min(25, Math.max(1, body.limit ?? 10));

    let q = supabase.from('industrial_facilities').select('*');
    if (body.facility_id) q = q.eq('id', body.facility_id);
    else if (body.all_unverified) q = q.or('coord_provider.is.null,coord_provider.eq.seed').limit(limit);
    else {
      return new Response(JSON.stringify({
        success: false, error: 'Provide facility_id or all_unverified: true',
      }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const { data: facilities, error: fetchErr } = await q;
    if (fetchErr) throw fetchErr;
    if (!facilities?.length) {
      return new Response(JSON.stringify({ success: true, refined: 0, results: [] }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const results: RefineResult[] = [];

    for (const f of facilities) {
      const result: RefineResult = { facility_id: f.id, name: f.name, refined: false, needs: [] };
      const region = f.state === 'TX' ? 'Texas, USA' : 'Alberta, Canada';
      const candidates: Candidate[] = [];

      if (!googleKey) {
        result.needs?.push('google_key');
      } else {
        // Two Google candidates in parallel.
        const [places, geo] = await Promise.all([
          placesFindPlace(f.name, f.municipality, region, googleKey).catch(() => null),
          geocode(f.name, f.municipality, region, googleKey).catch(() => null),
        ]);
        if (places) candidates.push(places);
        if (geo) candidates.push(geo);
      }

      // Sanity-gate the Google candidates against the seed before consulting
      // OSM — a 150 km miss is the operator-HQ collision we caught before.
      const seedLat = f.lat as number;
      const seedLng = f.lng as number;
      const sane = candidates.filter((c) => haversineKm(seedLat, seedLng, c.lat, c.lng) <= 150);
      if (sane.length < candidates.length) {
        result.error = 'one provider landed >150 km from seed (kept seed)';
      }

      // OSM parcel scan at the best available seed point (sane candidate or
      // the row's current coords).
      const probe = sane[0] ?? { provider: 'google_geocode' as const, lat: seedLat, lng: seedLng };
      const parcels = await osmIndustrialParcels(probe.lat, probe.lng, 1500).catch(() => []);
      const parcel = pickParcel(parcels, f.name, probe);

      const picked = pickBest(sane, parcel ? { osm: parcel, nearestSeed: probe } : null, f.name);

      const update: Record<string, unknown> = {};
      if (picked) {
        const movedKm = haversineKm(seedLat, seedLng, picked.winner.lat, picked.winner.lng);
        // Consensus across all collected candidates (Google × N + the chosen).
        const allPts = [...sane.map((c) => [c.lat, c.lng] as [number, number])];
        if (picked.winner.provider === 'osm_parcel_snap') {
          allPts.push([picked.winner.lat, picked.winner.lng]);
        }
        let maxPair = 0;
        for (let i = 0; i < allPts.length; i++) {
          for (let j = i + 1; j < allPts.length; j++) {
            maxPair = Math.max(maxPair, haversineKm(allPts[i][0], allPts[i][1], allPts[j][0], allPts[j][1]));
          }
        }

        update.lat = picked.winner.lat;
        update.lng = picked.winner.lng;
        update.coordinates_precision = picked.precision;
        update.location_method = picked.winner.provider;
        update.coord_provider = picked.winner.provider;
        update.coord_consensus_km = Math.round(maxPair * 100) / 100;
        update.coord_candidates = [
          ...sane.map((c) => ({
            provider: c.provider, lat: c.lat, lng: c.lng, label: c.label ?? null, kind: c.kind ?? null,
          })),
          ...(picked.winner.provider === 'osm_parcel_snap'
            ? [{
                provider: 'osm_parcel_snap', lat: picked.winner.lat, lng: picked.winner.lng,
                label: picked.winner.label ?? null, kind: picked.winner.kind ?? null,
              }]
            : []),
        ];
        if (picked.winner.osm_parcel_id) {
          update.osm_parcel_id = picked.winner.osm_parcel_id;
          update.osm_parcel_name = picked.winner.osm_parcel_name ?? null;
          update.osm_parcel_kind = picked.winner.kind ?? null;
        }
        update.last_verified = new Date().toISOString().slice(0, 10);
        result.refined = true;
        result.provider = picked.winner.provider;
        result.precision = picked.precision;
        result.moved_km = Math.round(movedKm * 10) / 10;
        result.consensus_km = update.coord_consensus_km as number;
        result.candidates_count = (update.coord_candidates as unknown[]).length;
      } else {
        result.precision = 'unverified';
      }

      // ── OSM grid measurement at the (possibly updated) coords ──
      const finalLat = (update.lat ?? seedLat) as number;
      const finalLng = (update.lng ?? seedLng) as number;
      try {
        const { data: osm, error: osmErr } = await supabase.functions.invoke(
          'osm-power-infrastructure',
          { body: { lat: finalLat, lng: finalLng, radius_m: 15000 } },
        );
        if (!osmErr && osm?.summary) {
          update.osm_substation_km = osm.summary.nearest_substation_km ?? null;
          update.osm_max_voltage_kv = osm.summary.max_voltage_kv ?? null;
          update.osm_checked_at = new Date().toISOString();
          result.osm_substation_km = update.osm_substation_km as number | null;
          result.osm_max_voltage_kv = update.osm_max_voltage_kv as number | null;
        } else {
          result.error = [result.error, `osm: ${osmErr?.message ?? osm?.error ?? 'no summary'}`]
            .filter(Boolean).join('; ');
        }
      } catch (e) {
        result.error = [result.error, `osm: ${e instanceof Error ? e.message : String(e)}`]
          .filter(Boolean).join('; ');
      }

      if (Object.keys(update).length > 0) {
        update.updated_at = new Date().toISOString();
        const { error: upErr } = await supabase
          .from('industrial_facilities').update(update).eq('id', f.id);
        if (upErr) {
          result.error = [result.error, `update: ${upErr.message}`].filter(Boolean).join('; ');
        }
      }

      results.push(result);
    }

    return new Response(JSON.stringify({
      success: true,
      refined: results.filter((r) => r.refined).length,
      google_key_present: Boolean(googleKey),
      results,
    }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (e) {
    return new Response(JSON.stringify({
      success: false,
      error: e instanceof Error ? e.message : String(e),
    }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});

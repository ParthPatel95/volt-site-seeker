import { corsHeaders } from "../_shared/cors.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

// OSM heavy-industry discovery. Sweeps OpenStreetMap (via Overpass) for
// named industrial sites in Alberta or Texas — works, refineries, smelters,
// chemical/cement/pulp plants — that aren't yet in industrial_facilities,
// and inserts them as LOW-CONFIDENCE candidates for human review.
//
// Data policy:
//   * We never auto-promote OSM data to high-confidence facts. Every row
//     this function inserts gets confidence='low', status='unknown',
//     coord_provider='osm_parcel_snap', and a note flagging it as
//     OSM-discovered.
//   * Idempotent: skips OSM ids already present (osm_parcel_id) AND skips
//     any unnamed polygon (no name = nothing to verify).
//   * Maps OSM tags to our facility_type taxonomy conservatively: tagged
//     refineries, smelters, plants with a recognizable industrial=* tag.
//     `landuse=industrial` alone (generic industrial parks, warehouses) is
//     intentionally NOT inserted — too noisy without a name signal.

interface DiscoveryRequest {
  region?: 'AB' | 'TX' | 'both';
  bbox?: [number, number, number, number]; // [south, west, north, east] override
  limit?: number;                          // hard cap on candidates to insert
}

interface OsmTags {
  name?: string;
  'name:en'?: string;
  man_made?: string;
  landuse?: string;
  industrial?: string;
  power?: string;
  operator?: string;
  'plant:source'?: string;
  'plant:output:electricity'?: string;
  ref?: string;
  website?: string;
}

interface OsmElement {
  type: 'node' | 'way' | 'relation';
  id: number;
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags?: OsmTags;
}

// Regional bboxes that cover the area our registry tracks. Tight enough to
// keep Overpass response sizes reasonable.
const REGION_BBOX: Record<'AB' | 'TX', [number, number, number, number]> = {
  // [south, west, north, east]
  AB: [48.99, -120.0, 60.0, -110.0],
  TX: [25.84, -106.65, 36.50, -93.51],
};

// OSM tag → our facility_type taxonomy. Only tags with a clean heavy-power
// mapping go here; everything else is dropped.
function mapFacilityType(tags: OsmTags): string | null {
  const ind = tags.industrial;
  const mm = tags.man_made;

  // Explicit industrial=* tags
  if (ind === 'oil_refinery' || mm === 'oil_refinery' || ind === 'refinery') return 'metals_refinery';
  if (ind === 'aluminium_smelter' || ind === 'aluminum_smelter') return 'aluminum_smelter';
  if (ind === 'copper_smelter') return 'copper_smelter';
  if (ind === 'zinc_smelter') return 'zinc_smelter';
  if (ind === 'lead_smelter') return 'lead_smelter';
  if (ind === 'steelworks' || ind === 'steel') return 'eaf_steel';
  if (ind === 'cement') return 'cement';
  if (ind === 'lime_kiln') return 'lime';
  if (ind === 'pulp_mill' || ind === 'paper_mill') return 'pulp_kraft';
  if (ind === 'sawmill') return 'sawmill';
  if (ind === 'glass') return 'glass_float';
  if (ind === 'chemical') return 'chlor_alkali';   // generic chem — pick most common heavy-power class
  if (ind === 'fertilizer') return 'fertilizer_nitrogen';
  if (ind === 'foundry') return 'foundry_ferrous';
  if (ind === 'mineral_extraction' || ind === 'mining') return 'gold_mine_mill';
  if (ind === 'food_processing') return 'food_processing';

  // man_made=works with a heavy-process name hint
  if (mm === 'works') {
    const lc = (tags.name ?? '').toLowerCase();
    if (/refinery/.test(lc)) return 'metals_refinery';
    if (/smelter/.test(lc)) return 'aluminum_smelter';
    if (/steel/.test(lc)) return 'eaf_steel';
    if (/cement/.test(lc)) return 'cement';
    if (/(pulp|paper|kraft|newsprint)/.test(lc)) return 'pulp_kraft';
    if (/(saw|osb|panel)/.test(lc)) return 'sawmill';
    if (/(chemical|chlorate|chlor)/.test(lc)) return 'chlor_alkali';
    if (/(fertilizer|nitrogen|ammonia)/.test(lc)) return 'fertilizer_nitrogen';
    if (/glass/.test(lc)) return 'glass_float';
  }
  return null;
}

function elementCentroid(el: OsmElement): { lat: number; lng: number } | null {
  const c = el.center ?? (el.lat != null && el.lon != null ? { lat: el.lat, lon: el.lon } : null);
  if (!c) return null;
  return { lat: c.lat, lng: c.lon };
}

// Heuristic municipality from name — Overpass doesn't reliably give us the
// admin boundary in the same query without an extra round trip. We leave
// municipality null when we can't tell, and the facility-refine step (run
// separately) will fill it in via reverse geocoding.

async function overpassQuery(bbox: [number, number, number, number]): Promise<OsmElement[]> {
  // Query nodes, ways, and relations with industrial=* or man_made=works
  // inside the bbox. `out tags center` returns the polygon centroid for
  // ways/relations so we don't need a second geometry call.
  const [south, west, north, east] = bbox;
  const q = `
    [out:json][timeout:60];
    (
      node["industrial"](${south},${west},${north},${east});
      way["industrial"](${south},${west},${north},${east});
      relation["industrial"](${south},${west},${north},${east});
      node["man_made"="works"](${south},${west},${north},${east});
      way["man_made"="works"](${south},${west},${north},${east});
      relation["man_made"="works"](${south},${west},${north},${east});
      node["man_made"="oil_refinery"](${south},${west},${north},${east});
      way["man_made"="oil_refinery"](${south},${west},${north},${east});
    );
    out tags center;
  `;
  const r = await fetch('https://overpass-api.de/api/interpreter', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: 'data=' + encodeURIComponent(q),
  });
  if (!r.ok) throw new Error(`overpass ${r.status}: ${await r.text()}`);
  const j = await r.json();
  return (j.elements ?? []) as OsmElement[];
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    const body: DiscoveryRequest = req.method === 'POST' ? await req.json().catch(() => ({})) : {};
    const region = body.region ?? 'AB';
    const limit = Math.min(100, Math.max(1, body.limit ?? 25));

    const regions: ('AB' | 'TX')[] = region === 'both' ? ['AB', 'TX'] : [region];

    let seen = 0;
    let skippedExisting = 0;
    let skippedUnknownType = 0;
    let skippedUnnamed = 0;
    let inserted = 0;
    const errors: string[] = [];
    const candidates: unknown[] = [];

    // Pull every existing osm_parcel_id once so we can skip duplicates fast.
    const { data: existing, error: exErr } = await supabase
      .from('industrial_facilities').select('osm_parcel_id').not('osm_parcel_id', 'is', null);
    if (exErr) throw exErr;
    const existingIds = new Set<string>(
      (existing as Array<{ osm_parcel_id: string | null }> ?? [])
        .map((r) => r.osm_parcel_id).filter((x): x is string => !!x),
    );

    for (const r of regions) {
      const bbox = body.bbox ?? REGION_BBOX[r];
      let elements: OsmElement[] = [];
      try {
        elements = await overpassQuery(bbox);
      } catch (e) {
        errors.push(`${r}: ${e instanceof Error ? e.message : String(e)}`);
        continue;
      }

      for (const el of elements) {
        if (inserted >= limit) break;
        seen++;
        const tags = el.tags ?? {};
        const osmId = `${el.type}/${el.id}`;
        if (existingIds.has(osmId)) { skippedExisting++; continue; }
        const name = (tags.name ?? tags['name:en'] ?? '').trim();
        if (!name) { skippedUnnamed++; continue; }
        const facilityType = mapFacilityType(tags);
        if (!facilityType) { skippedUnknownType++; continue; }
        const centroid = elementCentroid(el);
        if (!centroid) { skippedUnknownType++; continue; }

        const row = {
          name,
          operator: tags.operator ?? null,
          state: r,
          facility_type: facilityType,
          naics_code: null,
          lat: centroid.lat,
          lng: centroid.lng,
          coordinates_precision: 'parcel',
          municipality: null,
          status: 'unknown' as const,
          status_as_of: null,
          status_source_url: null,
          capacity_value: null,
          capacity_unit: null,
          estimated_mw: null,
          estimate_basis: null,
          grid_voltage_kv: null,
          confidence: 'low' as const,
          source_url: tags.website ?? `https://www.openstreetmap.org/${el.type}/${el.id}`,
          source_publisher: 'OpenStreetMap',
          notes: `Discovered via OSM. tags: ${Object.entries(tags).slice(0, 6).map(([k, v]) => `${k}=${v}`).join(' · ')}. Confidence low until reviewed.`,
          last_verified: null,
          location_method: 'osm_parcel_snap',
          coord_provider: 'osm_parcel_snap',
          osm_parcel_id: osmId,
          osm_parcel_name: name,
          osm_parcel_kind: tags.industrial ?? tags.man_made ?? null,
        };
        const { error: insErr } = await supabase.from('industrial_facilities').insert(row);
        if (insErr) {
          errors.push(`insert ${osmId}: ${insErr.message}`);
          continue;
        }
        existingIds.add(osmId);
        inserted++;
        candidates.push({ osm_id: osmId, name, type: facilityType, lat: centroid.lat, lng: centroid.lng });
      }
    }

    return new Response(JSON.stringify({
      success: true,
      region,
      candidates_seen: seen,
      candidates_inserted: inserted,
      skipped_existing: skippedExisting,
      skipped_unknown_type: skippedUnknownType,
      skipped_unnamed: skippedUnnamed,
      candidates,
      errors: errors.length ? errors : undefined,
    }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (e) {
    return new Response(JSON.stringify({
      success: false,
      error: e instanceof Error ? e.message : String(e),
    }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});

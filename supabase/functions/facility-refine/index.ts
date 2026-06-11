import { corsHeaders } from "../_shared/cors.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";

// Hidden Gems facility refinement — replaces desk-research seed coordinates
// with API-verified data, per facility or in batch:
//
//   1. Google Geocoding on "{name}, {municipality}, {state}" → precise
//      lat/lng. location_type ROOFTOP → coordinates_precision 'site';
//      anything coarser stays 'locality'. location_method = 'google_geocode'.
//   2. Live OSM Overpass scan (via the existing osm-power-infrastructure
//      function) at the refined coordinates → measured nearest-substation
//      distance + max voltage, stored on the row with osm_checked_at.
//
// Data policy: rows are only updated from successful API responses. A failed
// geocode leaves the seed coordinates untouched (and reports the failure);
// nothing is interpolated or guessed.

interface RefineRequest {
  facility_id?: string;       // refine one
  all_unverified?: boolean;   // or every row still at location_method='seed'
  limit?: number;             // batch cap (default 10 — geocoding quota care)
}

interface RefineResult {
  facility_id: string;
  name: string;
  geocode: 'updated' | 'failed' | 'skipped_no_key';
  precision?: string;
  moved_km?: number;
  osm: 'updated' | 'failed';
  osm_substation_km?: number | null;
  osm_max_voltage_kv?: number | null;
  error?: string;
}

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
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

    let query = supabase.from('industrial_facilities').select('*');
    if (body.facility_id) {
      query = query.eq('id', body.facility_id);
    } else if (body.all_unverified) {
      query = query.eq('location_method', 'seed').limit(limit);
    } else {
      return new Response(JSON.stringify({
        success: false,
        error: 'Provide facility_id or all_unverified: true',
      }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const { data: facilities, error: fetchErr } = await query;
    if (fetchErr) throw fetchErr;
    if (!facilities?.length) {
      return new Response(JSON.stringify({ success: true, refined: 0, results: [] }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const results: RefineResult[] = [];

    for (const f of facilities) {
      const result: RefineResult = {
        facility_id: f.id, name: f.name, geocode: 'skipped_no_key', osm: 'failed',
      };
      let lat = f.lat as number;
      let lng = f.lng as number;
      const update: Record<string, unknown> = {};

      // ── Step 1: Google geocode ────────────────────────────────────────────
      if (googleKey) {
        try {
          const region = f.state === 'TX' ? 'Texas, USA' : 'Alberta, Canada';
          const address = [f.name, f.municipality, region].filter(Boolean).join(', ');
          const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${googleKey}`;
          const resp = await fetch(url);
          const data = await resp.json();
          const top = data?.results?.[0];
          if (data?.status === 'OK' && top?.geometry?.location) {
            const g = top.geometry.location;
            const movedKm = haversineKm(lat, lng, g.lat, g.lng);
            // Sanity gate: a geocode landing >150 km from the seed is almost
            // certainly a name collision (e.g. matching the operator's HQ).
            // Keep the seed in that case and report it for human review.
            if (movedKm <= 150) {
              lat = g.lat; lng = g.lng;
              update.lat = lat;
              update.lng = lng;
              update.coordinates_precision =
                top.geometry.location_type === 'ROOFTOP' ? 'site' : 'locality';
              update.location_method = 'google_geocode';
              update.last_verified = new Date().toISOString().slice(0, 10);
              result.geocode = 'updated';
              result.precision = update.coordinates_precision as string;
              result.moved_km = Math.round(movedKm * 10) / 10;
            } else {
              result.geocode = 'failed';
              result.error = `geocode landed ${Math.round(movedKm)} km from seed — likely name collision, kept seed coords`;
            }
          } else {
            result.geocode = 'failed';
            result.error = `geocode status ${data?.status ?? resp.status}`;
          }
        } catch (e) {
          result.geocode = 'failed';
          result.error = e instanceof Error ? e.message : String(e);
        }
      }

      // ── Step 2: live OSM grid measurement at the (possibly refined) coords ─
      try {
        const { data: osm, error: osmErr } = await supabase.functions.invoke(
          'osm-power-infrastructure',
          { body: { lat, lng, radius_m: 15000 } },
        );
        if (!osmErr && osm?.summary) {
          update.osm_substation_km = osm.summary.nearest_substation_km ?? null;
          update.osm_max_voltage_kv = osm.summary.max_voltage_kv ?? null;
          update.osm_checked_at = new Date().toISOString();
          result.osm = 'updated';
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
      refined: results.filter((r) => r.geocode === 'updated' || r.osm === 'updated').length,
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

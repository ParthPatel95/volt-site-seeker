// Geocoding edge function: server-side proxy to Nominatim with a Photon fallback.
// Avoids browser CORS / UA-block issues that made client-side geocoding fail.

import { requireCaller } from "../_shared/guard.ts";
import { errorResponse } from '../_shared/http.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

interface GeocodeHit { lat: number; lng: number; label: string }

async function fromNominatim(query: string): Promise<GeocodeHit | null> {
  // Try the raw query first (works for full US/Canada addresses), then add
  // Canada/USA hints for short queries like a city name.
  const variants = [query, `${query}, Canada`, `${query}, USA`];
  for (const q of variants) {
    const urls = [
      // Restrict to Canada + USA first for better disambiguation, then worldwide.
      `https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=ca,us&q=${encodeURIComponent(q)}`,
      `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(q)}`,
    ];
    for (const url of urls) {
    try {
      const res = await fetch(url, {
        headers: {
          'User-Agent': 'WattByte-Site-Intelligence/1.0 (contact: ops@wattbyte.com)',
          'Accept-Language': 'en',
        },
      });
      if (!res.ok) continue;
      const json = await res.json();
      if (Array.isArray(json) && json.length > 0) {
        return {
          lat: parseFloat(json[0].lat),
          lng: parseFloat(json[0].lon),
          label: json[0].display_name ?? q,
        };
      }
    } catch (_) { /* try next variant */ }
    }
  }
  return null;
}

async function fromPhoton(query: string): Promise<GeocodeHit | null> {
  const variants = [query, `${query}, Canada`, `${query}, USA`];
  for (const q of variants) {
    const url = `https://photon.komoot.io/api/?limit=1&lang=en&q=${encodeURIComponent(q)}`;
    try {
      const res = await fetch(url);
      if (!res.ok) continue;
      const json = await res.json();
      const f = json?.features?.[0];
      if (!f) continue;
      const [lng, lat] = f.geometry.coordinates;
      const p = f.properties ?? {};
      const label = [p.name, p.city, p.state, p.country].filter(Boolean).join(', ');
      return { lat, lng, label: label || q };
    } catch { /* try next */ }
  }
  return null;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  // Nominatim/Photon are free but ban heavy anonymous use (could get the
  // project egress IP blocked). Require auth or internal service.
  // (Audit-2026-06-25 PR3.)
  const __gate = await requireCaller(req);
  if (__gate instanceof Response) return __gate;

  try {
    const body = await req.json().catch(() => ({}));
    const query = (body?.query ?? '').toString().trim();
    if (!query) {
      return new Response(JSON.stringify({ error: 'query required' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const hit = (await fromNominatim(query)) ?? (await fromPhoton(query));
    if (!hit) {
      return new Response(JSON.stringify({ error: 'not_found' }), {
        status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify(hit), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    return errorResponse(e, corsHeaders, { status: 500, context: 'geocode-address' });
  }
});
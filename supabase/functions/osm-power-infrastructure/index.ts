import { corsHeaders } from '../_shared/cors.ts';

// Live OpenStreetMap / OpenInfraMap power infrastructure lookup via Overpass API.
// Returns substations, transformers, switchgear, and power lines tagged in OSM
// within a radius around the supplied point. All fields come from real OSM tags;
// no values are invented when tags are missing.

const OVERPASS_ENDPOINTS = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
  'https://overpass.openstreetmap.fr/api/interpreter',
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

async function queryOverpass(query: string): Promise<any> {
  let lastErr: any = null;
  for (const url of OVERPASS_ENDPOINTS) {
    try {
      const r = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent': 'WattByte-SiteIntel/1.0 (https://wattbyte.com; contact: support@wattbyte.com)',
          'Accept': 'application/json',
        },
        body: 'data=' + encodeURIComponent(query),
      });
      if (!r.ok) {
        const body = await r.text();
        lastErr = new Error(`${url} -> ${r.status} ${body.slice(0, 120)}`);
        continue;
      }
      return await r.json();
    } catch (e) { lastErr = e; }
  }
  throw lastErr ?? new Error('All Overpass endpoints failed');
}

function centroidOf(el: any): { lat: number; lng: number } | null {
  if (typeof el.lat === 'number' && typeof el.lon === 'number') return { lat: el.lat, lng: el.lon };
  if (el.center && typeof el.center.lat === 'number') return { lat: el.center.lat, lng: el.center.lon };
  if (Array.isArray(el.geometry) && el.geometry.length) {
    const lat = el.geometry.reduce((s: number, p: any) => s + p.lat, 0) / el.geometry.length;
    const lon = el.geometry.reduce((s: number, p: any) => s + p.lon, 0) / el.geometry.length;
    return { lat, lng: lon };
  }
  return null;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  try {
    const { lat, lng, radius_m = 3000 } = await req.json();
    if (typeof lat !== 'number' || typeof lng !== 'number') {
      return new Response(JSON.stringify({ error: 'lat/lng required' }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
    const r = Math.max(250, Math.min(20000, Math.round(radius_m)));

    // Overpass QL: substations + transformers + switchgear (nodes, ways, relations)
    // and power lines (ways) within radius.
    const q = `
      [out:json][timeout:25];
      (
        nwr["power"="substation"](around:${r},${lat},${lng});
        nwr["power"="transformer"](around:${r},${lat},${lng});
        nwr["power"="switchgear"](around:${r},${lat},${lng});
        way["power"="line"](around:${r},${lat},${lng});
        way["power"="minor_line"](around:${r},${lat},${lng});
      );
      out tags center geom 200;
    `;

    const data = await queryOverpass(q);
    const elements: any[] = Array.isArray(data?.elements) ? data.elements : [];

    type Sub = {
      osm_id: string; osm_type: string; power: string; name: string | null;
      operator: string | null; voltage: string | null; substation: string | null;
      frequency: string | null; lat: number; lng: number; distance_km: number;
      source_url: string;
    };
    type Line = {
      osm_id: string; name: string | null; operator: string | null;
      voltage: string | null; cables: string | null; circuits: string | null;
      distance_km: number; source_url: string;
    };

    const substations: Sub[] = [];
    const lines: Line[] = [];

    for (const el of elements) {
      const tags = el.tags ?? {};
      const power = tags.power as string | undefined;
      const c = centroidOf(el);
      if (!c) continue;
      const distance_km = hav(lat, lng, c.lat, c.lng);
      const source_url = `https://www.openstreetmap.org/${el.type}/${el.id}`;
      if (power === 'substation' || power === 'transformer' || power === 'switchgear') {
        substations.push({
          osm_id: String(el.id), osm_type: el.type, power,
          name: tags.name ?? tags['name:en'] ?? null,
          operator: tags.operator ?? null,
          voltage: tags.voltage ?? null,
          substation: tags.substation ?? null,
          frequency: tags.frequency ?? null,
          lat: c.lat, lng: c.lng,
          distance_km: Math.round(distance_km * 1000) / 1000,
          source_url,
        });
      } else if (power === 'line' || power === 'minor_line') {
        lines.push({
          osm_id: String(el.id),
          name: tags.name ?? tags.ref ?? null,
          operator: tags.operator ?? null,
          voltage: tags.voltage ?? null,
          cables: tags.cables ?? null,
          circuits: tags.circuits ?? null,
          distance_km: Math.round(distance_km * 1000) / 1000,
          source_url,
        });
      }
    }

    substations.sort((a, b) => a.distance_km - b.distance_km);
    lines.sort((a, b) => a.distance_km - b.distance_km);

    return new Response(JSON.stringify({
      lat, lng, radius_m: r,
      queried_at: new Date().toISOString(),
      source: 'OpenStreetMap (Overpass API)',
      attribution: '© OpenStreetMap contributors · openinframap.org',
      substations: substations.slice(0, 20),
      power_lines: lines.slice(0, 20),
      counts: { substations: substations.length, power_lines: lines.length },
    }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (e) {
    return new Response(JSON.stringify({ error: String((e as any)?.message ?? e) }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
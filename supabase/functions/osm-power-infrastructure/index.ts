import { corsHeaders } from '../_shared/cors.ts';

// Live OpenStreetMap / OpenInfraMap power infrastructure lookup via Overpass API.
// Returns substations, transformers, switchgear, generation plants, generators,
// and power lines tagged in OSM around the supplied point. All fields come from
// real OSM tags; missing values stay null (never invented). Includes parsed
// voltage list, bearing from site, perpendicular distance for lines, and an
// aggregated summary used by the UI's analytics panels.

const OVERPASS_ENDPOINTS = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
  'https://overpass.openstreetmap.fr/api/interpreter',
];

function toRad(d: number) { return d * Math.PI / 180; }
function hav(lat1: number, lng1: number, lat2: number, lng2: number) {
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a = Math.sin(dLat / 2) ** 2
    + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}
function bearing(lat1: number, lng1: number, lat2: number, lng2: number) {
  const φ1 = toRad(lat1), φ2 = toRad(lat2);
  const λ1 = toRad(lng1), λ2 = toRad(lng2);
  const y = Math.sin(λ2 - λ1) * Math.cos(φ2);
  const x = Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(λ2 - λ1);
  return (Math.atan2(y, x) * 180 / Math.PI + 360) % 360;
}

async function queryOverpass(query: string): Promise<any> {
  let lastErr: any = null;
  for (const url of OVERPASS_ENDPOINTS) {
    try {
      const r = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent': 'WattByte-SiteIntel/2.0 (https://wattbyte.com; contact: support@wattbyte.com)',
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

// Nearest distance from point to a polyline (km) via vertex sampling.
function nearestVertexKm(lat: number, lng: number, geom: any[]): number {
  let min = Infinity;
  for (const p of geom) {
    const d = hav(lat, lng, p.lat, p.lon);
    if (d < min) min = d;
  }
  return min;
}

// Parse OSM `voltage` tag — strings like "138000", "138000;240000", "240 kV".
// Returns kV numbers sorted desc.
function parseVoltageKv(raw: string | null | undefined): number[] {
  if (!raw) return [];
  const parts = String(raw).split(/[;,/]+/);
  const out: number[] = [];
  for (const p of parts) {
    const m = p.match(/([\d.]+)\s*(kv|k)?/i);
    if (!m) continue;
    let v = parseFloat(m[1]);
    if (!isFinite(v)) continue;
    const unit = (m[2] ?? '').toLowerCase();
    if (!unit && v > 1000) v = v / 1000; // raw volts -> kV
    if (v > 0 && v < 2000) out.push(Math.round(v * 100) / 100);
  }
  return out.sort((a, b) => b - a);
}

// Parse `generator:output:electricity` like "12 MW", "12000 kW", "1.5 GW".
function parseMw(raw: string | null | undefined): number | null {
  if (!raw) return null;
  const m = String(raw).match(/([\d.]+)\s*(g|m|k)?w/i);
  if (!m) return null;
  const v = parseFloat(m[1]);
  const unit = (m[2] ?? 'm').toLowerCase();
  if (!isFinite(v)) return null;
  if (unit === 'g') return v * 1000;
  if (unit === 'k') return v / 1000;
  return v;
}

function classifyVoltage(kv: number): string {
  if (kv >= 240) return '≥240 kV';
  if (kv >= 138) return '138–230 kV';
  if (kv >= 69) return '69–138 kV';
  return '<69 kV';
}

// Warm-instance Overpass cache. Same lat/lng/radius hits within
// CACHE_TTL_MS reuse the previous response body. OSM tags change on
// hours-to-days timescales so a 10-minute window trades a small amount
// of staleness for ~1 fewer external API call per re-open of the panel.
const CACHE_TTL_MS = 10 * 60 * 1000;
const CACHE_MAX_ENTRIES = 256;
const overpassCache = new Map<string, { at: number; body: string }>();

function cacheKey(lat: number, lng: number, r: number): string {
  return `${lat.toFixed(4)}:${lng.toFixed(4)}:${r}`;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  try {
    const { lat, lng, radius_m = 8000 } = await req.json();
    if (typeof lat !== 'number' || typeof lng !== 'number') {
      return new Response(JSON.stringify({ error: 'lat/lng required' }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
    const r = Math.max(500, Math.min(25000, Math.round(radius_m)));

    const key = cacheKey(lat, lng, r);
    const cached = overpassCache.get(key);
    if (cached && Date.now() - cached.at < CACHE_TTL_MS) {
      return new Response(cached.body, {
        headers: { ...corsHeaders, 'Content-Type': 'application/json', 'x-overpass-cache': 'hit' },
      });
    }

    const q = `
      [out:json][timeout:30];
      (
        nwr["power"="substation"](around:${r},${lat},${lng});
        nwr["power"="transformer"](around:${r},${lat},${lng});
        nwr["power"="switchgear"](around:${r},${lat},${lng});
        nwr["power"="compensator"](around:${r},${lat},${lng});
        nwr["power"="converter"](around:${r},${lat},${lng});
        nwr["power"="plant"](around:${r},${lat},${lng});
        nwr["power"="generator"](around:${r},${lat},${lng});
        way["power"="line"](around:${r},${lat},${lng});
        way["power"="minor_line"](around:${r},${lat},${lng});
        way["power"="cable"](around:${r},${lat},${lng});
      );
      out tags center geom 500;
    `;

    const data = await queryOverpass(q);
    const elements: any[] = Array.isArray(data?.elements) ? data.elements : [];

    const substations: any[] = [];
    const generation: any[] = [];
    const lines: any[] = [];

    for (const el of elements) {
      const tags = el.tags ?? {};
      const power = tags.power as string | undefined;
      const c = centroidOf(el);
      if (!c) continue;
      const distance_km = hav(lat, lng, c.lat, c.lng);
      const bearing_deg = bearing(lat, lng, c.lat, c.lng);
      const source_url = `https://www.openstreetmap.org/${el.type}/${el.id}`;
      const openinframap_url = `https://openinframap.org/#13/${c.lat}/${c.lng}`;
      const voltages_kv = parseVoltageKv(tags.voltage);

      if (power === 'substation' || power === 'transformer' || power === 'switchgear' || power === 'compensator' || power === 'converter') {
        substations.push({
          osm_id: String(el.id), osm_type: el.type, power,
          name: tags.name ?? tags['name:en'] ?? null,
          operator: tags.operator ?? tags.owner ?? null,
          voltage_raw: tags.voltage ?? null,
          voltages_kv,
          max_kv: voltages_kv[0] ?? null,
          voltage_class: voltages_kv[0] ? classifyVoltage(voltages_kv[0]) : null,
          substation_type: tags.substation ?? null,
          frequency: tags.frequency ?? null,
          location: tags.location ?? null,
          gas_insulated: tags.gas_insulated ?? null,
          ref: tags.ref ?? null,
          start_date: tags.start_date ?? null,
          wikidata: tags.wikidata ?? null,
          wikipedia: tags.wikipedia ?? null,
          lat: c.lat, lng: c.lng,
          distance_km: Math.round(distance_km * 1000) / 1000,
          bearing_deg: Math.round(bearing_deg),
          source_url, openinframap_url,
        });
      } else if (power === 'plant' || power === 'generator') {
        const mw = parseMw(tags['plant:output:electricity'] ?? tags['generator:output:electricity']);
        generation.push({
          osm_id: String(el.id), osm_type: el.type, power,
          name: tags.name ?? tags['name:en'] ?? null,
          operator: tags.operator ?? tags.owner ?? null,
          source: tags['plant:source'] ?? tags['generator:source'] ?? null,
          method: tags['plant:method'] ?? tags['generator:method'] ?? null,
          output_mw: mw,
          output_raw: tags['plant:output:electricity'] ?? tags['generator:output:electricity'] ?? null,
          start_date: tags.start_date ?? null,
          lat: c.lat, lng: c.lng,
          distance_km: Math.round(distance_km * 1000) / 1000,
          bearing_deg: Math.round(bearing_deg),
          source_url, openinframap_url,
        });
      } else if (power === 'line' || power === 'minor_line' || power === 'cable') {
        const geom = Array.isArray(el.geometry) ? el.geometry : [];
        const nearest_km = geom.length ? nearestVertexKm(lat, lng, geom) : distance_km;
        lines.push({
          osm_id: String(el.id), osm_type: el.type, power,
          name: tags.name ?? tags.ref ?? null,
          operator: tags.operator ?? tags.owner ?? null,
          voltage_raw: tags.voltage ?? null,
          voltages_kv,
          max_kv: voltages_kv[0] ?? null,
          voltage_class: voltages_kv[0] ? classifyVoltage(voltages_kv[0]) : null,
          cables: tags.cables ?? null,
          circuits: tags.circuits ?? null,
          wires: tags.wires ?? null,
          location: tags.location ?? null,
          frequency: tags.frequency ?? null,
          distance_km: Math.round(nearest_km * 1000) / 1000,
          centroid_distance_km: Math.round(distance_km * 1000) / 1000,
          bearing_deg: Math.round(bearing_deg),
          source_url, openinframap_url,
        });
      }
    }

    substations.sort((a, b) => a.distance_km - b.distance_km);
    generation.sort((a, b) => a.distance_km - b.distance_km);
    lines.sort((a, b) => a.distance_km - b.distance_km);

    // Voltage profile across substations + lines.
    const buckets = ['≥240 kV', '138–230 kV', '69–138 kV', '<69 kV'];
    const voltage_profile = buckets.map(b => {
      const subs = substations.filter(s => s.voltage_class === b);
      const ls = lines.filter(l => l.voltage_class === b);
      return {
        bucket: b,
        substations: subs.length,
        lines: ls.length,
        total: subs.length + ls.length,
        nearest_substation_km: subs[0]?.distance_km ?? null,
        nearest_line_km: ls[0]?.distance_km ?? null,
        nearest_substation_name: subs[0]?.name ?? null,
      };
    });

    // 12-sector bearing histogram (transmission ≥69 kV substations + lines).
    const sector_count = 12;
    const bearing_dial = Array.from({ length: sector_count }, (_, i) => ({
      sector: i,
      angle_from: i * 30,
      angle_to: (i + 1) * 30,
      count: 0,
    }));
    const tx_features = [
      ...substations.filter(s => (s.max_kv ?? 0) >= 69),
      ...lines.filter(l => (l.max_kv ?? 0) >= 69),
    ];
    for (const f of tx_features) {
      const idx = Math.floor((f.bearing_deg ?? 0) / 30) % sector_count;
      bearing_dial[idx].count++;
    }

    // Distance decay (substations only).
    function decay(rows: any[]) {
      if (!rows.length) return { nearest_km: null, median_km: null, p90_km: null, count: 0 };
      const ds = rows.map(r => r.distance_km).sort((a, b) => a - b);
      const q = (p: number) => ds[Math.min(ds.length - 1, Math.floor(p * ds.length))];
      return { nearest_km: ds[0], median_km: q(0.5), p90_km: q(0.9), count: ds.length };
    }

    const tx_subs = substations.filter(s => (s.max_kv ?? 0) >= 69);
    const dist_subs = substations.filter(s => (s.max_kv ?? 0) < 69);
    const nearest_tx_sub = tx_subs[0] ?? null;
    const nearest_dist_sub = dist_subs[0] ?? null;

    // Interconnect candidate ranking (top transmission substations).
    const interconnect_candidates = substations
      .filter(s => (s.max_kv ?? 0) >= 69)
      .slice(0, 10)
      .map(s => {
        const kv = s.max_kv ?? 0;
        const distScore = Math.max(0, 40 - s.distance_km * 4);   // closer = better
        const kvScore = Math.min(35, kv / 7);                    // 240 kV ≈ 34
        const typeScore = s.substation_type === 'transmission' ? 15 : (s.substation_type ? 8 : 5);
        const opScore = s.operator ? 10 : 0;
        const score = Math.round(distScore + kvScore + typeScore + opScore);
        const rationale: string[] = [];
        if (s.distance_km < 2) rationale.push('within 2 km');
        else if (s.distance_km < 5) rationale.push('within 5 km');
        if (kv >= 240) rationale.push(`bulk ${kv} kV tie-in`);
        else if (kv >= 138) rationale.push(`${kv} kV transmission`);
        if (s.substation_type === 'transmission') rationale.push('OSM tagged as transmission');
        if (s.operator) rationale.push(`operated by ${s.operator}`);
        return { ...s, score, rationale: rationale.join(' · ') || 'tagged power asset' };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);

    // Data completeness across top 20 features.
    const top = [...substations.slice(0, 10), ...lines.slice(0, 10)];
    const completeness = top.length
      ? Math.round(
          (top.filter((f: any) => f.name).length / top.length * 100 +
           top.filter((f: any) => f.operator).length / top.length * 100 +
           top.filter((f: any) => f.max_kv).length / top.length * 100) / 3,
        )
      : 0;

    const total_generation_mw = generation.reduce((s, g) => s + (g.output_mw ?? 0), 0);

    const body = JSON.stringify({
      lat, lng, radius_m: r,
      queried_at: new Date().toISOString(),
      source: 'OpenStreetMap (Overpass API)',
      attribution: '© OpenStreetMap contributors · openinframap.org',
      substations,
      generation,
      power_lines: lines,
      counts: {
        substations: substations.length,
        transmission_substations: tx_subs.length,
        distribution_substations: dist_subs.length,
        generation: generation.length,
        power_lines: lines.length,
      },
      summary: {
        max_voltage_kv: substations[0]?.max_kv ?? lines[0]?.max_kv ?? null,
        nearest_substation_km: substations[0]?.distance_km ?? null,
        nearest_transmission_substation: nearest_tx_sub ? {
          name: nearest_tx_sub.name, distance_km: nearest_tx_sub.distance_km, max_kv: nearest_tx_sub.max_kv,
          operator: nearest_tx_sub.operator, bearing_deg: nearest_tx_sub.bearing_deg,
        } : null,
        nearest_distribution_substation: nearest_dist_sub ? {
          name: nearest_dist_sub.name, distance_km: nearest_dist_sub.distance_km, max_kv: nearest_dist_sub.max_kv,
          operator: nearest_dist_sub.operator, bearing_deg: nearest_dist_sub.bearing_deg,
        } : null,
        nearest_line_km: lines[0]?.distance_km ?? null,
        total_generation_mw: total_generation_mw > 0 ? Math.round(total_generation_mw) : null,
        data_completeness_pct: completeness,
      },
      voltage_profile,
      bearing_dial,
      distance_decay: {
        transmission_substations: decay(tx_subs),
        distribution_substations: decay(dist_subs),
        power_lines: decay(lines),
        generation: decay(generation),
      },
      interconnect_candidates,
    });

    // Store in cache. Drop the oldest entry when over capacity (cheap LRU).
    if (overpassCache.size >= CACHE_MAX_ENTRIES) {
      const oldest = overpassCache.keys().next().value;
      if (oldest) overpassCache.delete(oldest);
    }
    overpassCache.set(key, { at: Date.now(), body });

    return new Response(body, {
      headers: { ...corsHeaders, 'Content-Type': 'application/json', 'x-overpass-cache': 'miss' },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String((e as any)?.message ?? e) }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';
import { corsHeaders } from '../_shared/cors.ts';

// Live fiber-depth lookup. Aggregates:
//   - PeeringDB (facilities, IXPs, networks)
//   - OpenStreetMap (telecom towers, communication towers, data centers)
//   - ISED National Broadband Internet Service Availability hex (best-effort)
// All values come from the upstream API; missing fields stay null.

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const CACHE_TABLE = 'alberta_fiber_depth_cache';
const CACHE_TTL_HOURS = 24;

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

async function fetchJson(url: string, init?: RequestInit, timeoutMs = 12000): Promise<any> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(url, { ...init, signal: ctrl.signal });
    if (!res.ok) throw new Error(`${url} → ${res.status}`);
    return await res.json();
  } finally {
    clearTimeout(timer);
  }
}

// ───────────────────────────────────────── PeeringDB ─────────────────────────────────────────

async function peeringdbFacilities(lat: number, lng: number) {
  // PeeringDB API supports bounding-box filters via 'distance' isn't standard;
  // use lat range query then haversine-filter client-side.
  const dLat = 75 / 111; // ~75km
  const dLng = 75 / (111 * Math.cos(toRad(lat)));
  const minLat = lat - dLat, maxLat = lat + dLat;
  const minLng = lng - dLng, maxLng = lng + dLng;
  const url = `https://www.peeringdb.com/api/fac?latitude__gte=${minLat}&latitude__lte=${maxLat}&longitude__gte=${minLng}&longitude__lte=${maxLng}`;
  try {
    const j = await fetchJson(url);
    const facs = (j.data ?? []).map((f: any) => ({
      id: f.id,
      name: f.name,
      org: f.org_name,
      city: f.city,
      address: [f.address1, f.address2].filter(Boolean).join(', '),
      country: f.country,
      lat: Number(f.latitude),
      lng: Number(f.longitude),
      net_count: f.net_count,
      ix_count: f.ix_count,
      cross_connects_fee: f.property,
      website: f.website,
      source_url: `https://www.peeringdb.com/fac/${f.id}`,
      distance_km: hav(lat, lng, Number(f.latitude), Number(f.longitude)),
      bearing_deg: bearing(lat, lng, Number(f.latitude), Number(f.longitude)),
    }))
      .filter((f: any) => Number.isFinite(f.distance_km) && f.distance_km <= 100)
      .sort((a: any, b: any) => a.distance_km - b.distance_km);
    return facs;
  } catch (e) {
    console.error('[peeringdb fac]', e);
    return [];
  }
}

async function peeringdbNetsAtFacility(facId: number) {
  try {
    const j = await fetchJson(`https://www.peeringdb.com/api/netfac?fac_id=${facId}&depth=2`);
    return (j.data ?? []).map((nf: any) => ({
      asn: nf.local_asadd ?? nf.asn ?? null,
      name: nf.name ?? null,
    }));
  } catch {
    return [];
  }
}

async function peeringdbIxps(lat: number, lng: number) {
  // PeeringDB ix endpoint exposes city/country; filter by haversine to a few seed lat/lngs in Alberta.
  try {
    const j = await fetchJson('https://www.peeringdb.com/api/ix?country=CA');
    const items = await Promise.all((j.data ?? []).map(async (x: any) => {
      // ix carries no lat/lng, but we can map via fac_set_ids — instead approximate with city match
      const cityLat = ALBERTA_CITY_LATLNG[x.city] ?? null;
      const ixLat = cityLat?.lat ?? null;
      const ixLng = cityLat?.lng ?? null;
      const dist = ixLat != null && ixLng != null ? hav(lat, lng, ixLat, ixLng) : null;
      return {
        id: x.id,
        name: x.name,
        name_long: x.name_long,
        city: x.city,
        country: x.country,
        net_count: x.net_count,
        proto_unicast: x.proto_unicast,
        proto_ipv6: x.proto_ipv6,
        media: x.media,
        url_stats: x.url_stats,
        source_url: `https://www.peeringdb.com/ix/${x.id}`,
        distance_km: dist,
      };
    }));
    return items.filter(i => i.distance_km == null || i.distance_km <= 500)
      .sort((a, b) => (a.distance_km ?? 9999) - (b.distance_km ?? 9999));
  } catch (e) {
    console.error('[peeringdb ix]', e);
    return [];
  }
}

const ALBERTA_CITY_LATLNG: Record<string, { lat: number; lng: number }> = {
  Calgary: { lat: 51.0447, lng: -114.0719 },
  Edmonton: { lat: 53.5461, lng: -113.4938 },
  'Red Deer': { lat: 52.2681, lng: -113.8112 },
  Lethbridge: { lat: 49.6956, lng: -112.8451 },
  'Medicine Hat': { lat: 50.0290, lng: -110.6764 },
  'Fort McMurray': { lat: 56.7268, lng: -111.3790 },
  'Grande Prairie': { lat: 55.1707, lng: -118.7947 },
};

// ───────────────────────────────────────── OSM telecom ─────────────────────────────────────────

async function osmTelecom(lat: number, lng: number, radius_m = 25000) {
  const query = `
[out:json][timeout:25];
(
  node["man_made"="communications_tower"](around:${radius_m},${lat},${lng});
  node["man_made"="tower"]["tower:type"="communication"](around:${radius_m},${lat},${lng});
  node["telecom"](around:${radius_m},${lat},${lng});
  way["telecom"](around:${radius_m},${lat},${lng});
  way["building"="data_center"](around:${radius_m},${lat},${lng});
  node["office"="telecommunication"](around:${radius_m},${lat},${lng});
);
out center tags;`;

  for (const ep of OVERPASS_ENDPOINTS) {
    try {
      const res = await fetch(ep, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain' },
        body: query,
      });
      if (!res.ok) continue;
      const j = await res.json();
      const elements = j.elements ?? [];
      return elements.map((el: any) => {
        const elat = el.lat ?? el.center?.lat;
        const elng = el.lon ?? el.center?.lon;
        if (typeof elat !== 'number' || typeof elng !== 'number') return null;
        const t = el.tags ?? {};
        return {
          osm_id: el.id,
          osm_type: el.type,
          name: t.name ?? null,
          operator: t.operator ?? null,
          kind: t['man_made'] === 'communications_tower' ? 'comms_tower'
              : t['tower:type'] === 'communication' ? 'comms_tower'
              : t['building'] === 'data_center' ? 'data_center'
              : t['office'] === 'telecommunication' ? 'telecom_office'
              : t['telecom'] ? `telecom:${t['telecom']}`
              : 'other',
          height_m: t.height ? Number(String(t.height).replace(/[^\d.]/g, '')) || null : null,
          source_url: `https://www.openstreetmap.org/${el.type}/${el.id}`,
          lat: elat,
          lng: elng,
          distance_km: hav(lat, lng, elat, elng),
          bearing_deg: bearing(lat, lng, elat, elng),
        };
      }).filter(Boolean).sort((a: any, b: any) => a.distance_km - b.distance_km);
    } catch (e) {
      console.error('[osm telecom]', ep, e);
    }
  }
  return [];
}

// ───────────────────────────────────────── ISED Broadband ─────────────────────────────────────────

async function isedBroadband(lat: number, lng: number) {
  // ISED's National Broadband Internet Service Availability map exposes a tile-based
  // service at https://services-eo.canada.ca/. The simplest public endpoint we can
  // hit from the server is the geocoding feature service of the hex grid.
  // Endpoint format chosen for stability; structure is documented at
  // https://open.canada.ca/data/en/dataset/00a331db-121b-445d-b119-35dbbe3eedd9
  const url = `https://services-eo.canada.ca/sied/rest/services/Hosted/National_Broadband_Internet_Service_Availability/MapServer/0/query?` +
    `geometry=${lng},${lat}` +
    `&geometryType=esriGeometryPoint&inSR=4326&spatialRel=esriSpatialRelIntersects` +
    `&outFields=*&returnGeometry=false&f=json`;
  try {
    const j = await fetchJson(url, undefined, 15000);
    const feat = j.features?.[0]?.attributes ?? null;
    if (!feat) return null;
    // Normalize the most commonly-needed fields without inventing missing ones.
    return {
      hex_id: feat.HEXuid_HEXidu ?? feat.HEXID ?? null,
      max_download_mbps: feat.MaxDownload_TelechargementMax ?? feat.MaxDownload ?? null,
      max_upload_mbps: feat.MaxUpload_TeleversementMax ?? feat.MaxUpload ?? null,
      technologies: feat.Technology_Technologie ?? feat.Technologies ?? null,
      providers: feat.ISP_FSI ?? feat.Providers ?? null,
      population_2021: feat.Population_2021 ?? null,
      source_url: 'https://open.canada.ca/data/en/dataset/00a331db-121b-445d-b119-35dbbe3eedd9',
      raw: feat,
    };
  } catch (e) {
    console.error('[ised broadband]', e);
    return null;
  }
}

// ───────────────────────────────────────── Handler ─────────────────────────────────────────

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing authorization' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { lat, lng } = await req.json() as { lat: number; lng: number };
    if (typeof lat !== 'number' || typeof lng !== 'number' || Number.isNaN(lat) || Number.isNaN(lng)) {
      return new Response(JSON.stringify({ error: 'lat and lng required as numbers' }), {
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

    // Cache key: ~1.1 km resolution, daily refresh.
    const day = new Date().toISOString().slice(0, 10);
    const cacheKey = `${lat.toFixed(2)}|${lng.toFixed(2)}|${day}`;
    const cached = await admin.from(CACHE_TABLE).select('payload, created_at').eq('cache_key', cacheKey).maybeSingle();
    if (cached.data?.payload && (Date.now() - new Date(cached.data.created_at).getTime()) < CACHE_TTL_HOURS * 3600_000) {
      return new Response(JSON.stringify({ ...cached.data.payload, cached: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const [facilities, ixps, telecom, ised] = await Promise.all([
      peeringdbFacilities(lat, lng),
      peeringdbIxps(lat, lng),
      osmTelecom(lat, lng, 25000),
      isedBroadband(lat, lng),
    ]);

    // For the closest 3 PeeringDB facilities, fetch the participating networks.
    const facsWithNets = await Promise.all(
      facilities.slice(0, 3).map(async (f: any) => ({
        ...f,
        networks: await peeringdbNetsAtFacility(f.id),
      })),
    );
    const fullFacilities = [...facsWithNets, ...facilities.slice(3)];

    const payload = {
      queried_at: new Date().toISOString(),
      location: { lat, lng },
      peeringdb: {
        facilities: fullFacilities,
        facility_count: fullFacilities.length,
        ixps,
        attribution: 'PeeringDB · https://www.peeringdb.com',
      },
      osm_telecom: {
        items: telecom,
        counts: {
          total: telecom.length,
          comms_towers: telecom.filter((t: any) => t.kind === 'comms_tower').length,
          data_centers: telecom.filter((t: any) => t.kind === 'data_center').length,
          telecom_offices: telecom.filter((t: any) => t.kind === 'telecom_office').length,
        },
        attribution: '© OpenStreetMap contributors',
      },
      ised_broadband: ised,
      sources: [
        'PeeringDB API — https://www.peeringdb.com/apidocs/',
        'OpenStreetMap Overpass API — https://overpass-api.de',
        'ISED National Broadband Internet Service Availability — https://open.canada.ca/data/en/dataset/00a331db-121b-445d-b119-35dbbe3eedd9',
      ],
    };

    await admin.from(CACHE_TABLE).upsert({
      cache_key: cacheKey, lat, lng, payload,
    }, { onConflict: 'cache_key' });

    return new Response(JSON.stringify({ ...payload, cached: false }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('[fiber-depth-lookup] error', err);
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
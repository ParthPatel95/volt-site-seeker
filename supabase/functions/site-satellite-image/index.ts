import { corsHeaders } from '../_shared/cors.ts';

const GOOGLE_KEY = Deno.env.get('GOOGLE_MAPS_API_KEY')!;

async function fetchStaticMap(lat: number, lng: number, zoom: number, size = '640x640') {
  const url = `https://maps.googleapis.com/maps/api/staticmap?center=${lat},${lng}&zoom=${zoom}&size=${size}&scale=2&maptype=hybrid&markers=color:red%7C${lat},${lng}&key=${GOOGLE_KEY}`;
  const r = await fetch(url);
  if (!r.ok) throw new Error(`Google Static Maps ${r.status}: ${await r.text()}`);
  const buf = new Uint8Array(await r.arrayBuffer());
  // base64 encode
  let bin = '';
  for (let i = 0; i < buf.length; i++) bin += String.fromCharCode(buf[i]);
  return btoa(bin);
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  try {
    if (!GOOGLE_KEY) throw new Error('GOOGLE_MAPS_API_KEY not configured');
    const { lat, lng, zoom = 18 } = await req.json();
    if (typeof lat !== 'number' || typeof lng !== 'number') {
      return new Response(JSON.stringify({ error: 'lat/lng required' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
    const z = Math.max(10, Math.min(20, Math.round(zoom)));
    const image_base64 = await fetchStaticMap(lat, lng, z);
    return new Response(JSON.stringify({
      image_base64,
      content_type: 'image/png',
      lat, lng, zoom: z,
      provider: 'Google Static Maps (hybrid)',
      maps_url: `https://www.google.com/maps/@${lat},${lng},${z}z/data=!3m1!1e3`,
    }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e?.message ?? e) }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
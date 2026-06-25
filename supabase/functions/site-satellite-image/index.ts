import { corsHeaders } from '../_shared/cors.ts';
import { requireCaller } from "../_shared/guard.ts";

const GOOGLE_KEY = Deno.env.get('GOOGLE_MAPS_API_KEY')!;

async function fetchStaticMap(lat: number, lng: number, zoom: number, size = '640x640') {
  const url = `https://maps.googleapis.com/maps/api/staticmap?center=${lat},${lng}&zoom=${zoom}&size=${size}&scale=2&maptype=hybrid&markers=color:red%7C${lat},${lng}&key=${GOOGLE_KEY}`;
  const r = await fetch(url);
  if (!r.ok) {
    const body = await r.text();
    let hint = '';
    if (r.status === 403) {
      hint = ' — Google rejected the key. Most commonly the Static Maps API is not enabled or billing is not enabled on the Google Cloud project.';
    } else if (r.status === 400) {
      hint = ' — Bad request (invalid lat/lng or zoom).';
    }
    throw new Error(`Google Static Maps ${r.status}${hint} :: ${body.slice(0, 240)}`);
  }
  const buf = new Uint8Array(await r.arrayBuffer());
  // base64 encode
  let bin = '';
  for (let i = 0; i < buf.length; i++) bin += String.fromCharCode(buf[i]);
  return btoa(bin);
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  // Paid-API (Google Static Maps, expensive per request): require auth or
  // internal service. (Audit-2026-06-25 PR3.)
  const __gate = await requireCaller(req);
  if (__gate instanceof Response) return __gate;

  try {
    if (!GOOGLE_KEY) throw new Error('GOOGLE_MAPS_API_KEY not configured');
    const { lat, lng, zoom = 18 } = await req.json();
    if (typeof lat !== 'number' || typeof lng !== 'number') {
      return new Response(JSON.stringify({ error: 'lat/lng required' }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
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
    // Return 200 so supabase.functions.invoke surfaces the message instead of the
    // generic "Edge Function returned a non-2xx status code" wrapper.
    return new Response(JSON.stringify({ error: String(e?.message ?? e) }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
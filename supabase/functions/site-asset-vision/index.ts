import { corsHeaders } from '../_shared/cors.ts';

const GOOGLE_KEY = Deno.env.get('GOOGLE_MAPS_API_KEY')!;
const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY')!;

async function fetchStaticMapBase64(lat: number, lng: number, zoom: number) {
  const url = `https://maps.googleapis.com/maps/api/staticmap?center=${lat},${lng}&zoom=${zoom}&size=640x640&scale=2&maptype=satellite&key=${GOOGLE_KEY}`;
  const r = await fetch(url);
  if (!r.ok) {
    const body = await r.text();
    let hint = '';
    if (r.status === 403) hint = ' — Google rejected the key (likely Static Maps API or billing not enabled).';
    throw new Error(`Google Static Maps ${r.status}${hint} :: ${body.slice(0, 240)}`);
  }
  const buf = new Uint8Array(await r.arrayBuffer());
  let bin = '';
  for (let i = 0; i < buf.length; i++) bin += String.fromCharCode(buf[i]);
  return btoa(bin);
}

const SYSTEM_PROMPT = `You are an expert infrastructure analyst reviewing a satellite image of a candidate data-center / industrial site in Alberta, Canada. Carefully identify visible assets and respond ONLY with valid JSON matching this schema:
{
  "image_quality": "good" | "cloudy" | "low_detail",
  "summary": string,
  "detections": [
    {
      "type": "substation" | "transmission_line" | "gas_regulator" | "gas_pipeline" | "water_body" | "water_treatment" | "rail" | "road_highway" | "building_industrial" | "building_other" | "solar_array" | "wind_turbine" | "fiber_hut" | "cleared_pad" | "storage_tank" | "parking_lot" | "other",
      "label": string,
      "confidence": "high" | "medium" | "low",
      "approx_bearing_deg": number | null,
      "approx_distance_m": number | null,
      "notes": string
    }
  ]
}
Bearings: 0=N, 90=E, 180=S, 270=W relative to the red center marker (which is the candidate site). Distances are rough estimates from the marker. Only include real, clearly-visible assets. Substations look like fenced rectangular yards with grids of transformers and steel lattice structures connected by transmission lines.`;

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  try {
    if (!GOOGLE_KEY) throw new Error('GOOGLE_MAPS_API_KEY not configured');
    if (!LOVABLE_API_KEY) throw new Error('LOVABLE_API_KEY not configured');
    const { lat, lng, zoom = 18 } = await req.json();
    if (typeof lat !== 'number' || typeof lng !== 'number') {
      return new Response(JSON.stringify({ error: 'lat/lng required' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
    const z = Math.max(13, Math.min(20, Math.round(zoom)));
    const b64 = await fetchStaticMapBase64(lat, lng, z);

    const aiResp = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: [
            { type: 'text', text: `Analyze this satellite image. Center marker is at ${lat.toFixed(5)}, ${lng.toFixed(5)}. Zoom ${z}. List every visible infrastructure asset.` },
            { type: 'image_url', image_url: { url: `data:image/png;base64,${b64}` } },
          ] },
        ],
        response_format: { type: 'json_object' },
      }),
    });
    if (!aiResp.ok) {
      const txt = await aiResp.text();
      return new Response(JSON.stringify({ error: `AI gateway ${aiResp.status}: ${txt}` }), { status: aiResp.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
    const aiJson = await aiResp.json();
    const content = aiJson?.choices?.[0]?.message?.content ?? '{}';
    let parsed: any = {};
    try { parsed = JSON.parse(content); } catch { parsed = { summary: content, detections: [], image_quality: 'low_detail' }; }

    return new Response(JSON.stringify({
      lat, lng, zoom: z,
      analyzed_at: new Date().toISOString(),
      ...parsed,
    }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e?.message ?? e) }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
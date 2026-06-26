
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { HfInference } from 'https://esm.sh/@huggingface/inference@2.3.2'

import { corsHeaders } from "../_shared/cors.ts";
import { errorResponse } from '../_shared/http.ts';
import { enforceRateLimit } from '../_shared/rateLimit.ts';
serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  // Abuse guard: cap image generations per IP (paid inference).
  const limited = await enforceRateLimit(req, { name: 'generate-image', max: 10, windowSeconds: 60, corsHeaders });
  if (limited) return limited;

  try {
    const { prompt } = await req.json()

    const hf = new HfInference(Deno.env.get('HUGGING_FACE_ACCESS_TOKEN'))

    const image = await hf.textToImage({
      inputs: prompt,
      model: 'black-forest-labs/FLUX.1-schnell',
    })

    // Convert the blob to a base64 string
    const arrayBuffer = await image.arrayBuffer()
    const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)))

    return new Response(
      JSON.stringify({ image: `data:image/png;base64,${base64}` }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error:', error)
    return errorResponse(error, corsHeaders, { status: 500, message: 'An unexpected error occurred', context: 'generate-image' })
  }
})

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AutocompleteRequest {
  input: string;
  types?: string;
  components?: string;
}

interface AutocompleteResponse {
  success: boolean;
  predictions?: Array<{
    place_id: string;
    description: string;
    main_text: string;
    secondary_text: string;
  }>;
  error?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get('GOOGLE_PLACES_API_KEY');
    if (!apiKey) {
      throw new Error('Google Places API key not configured');
    }

    const { input, types = 'address', components }: AutocompleteRequest = await req.json();

    if (!input || input.trim().length < 2) {
      return new Response(
        JSON.stringify({ success: false, error: 'Input must be at least 2 characters' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const encodedInput = encodeURIComponent(input.trim());
    let autocompleteUrl = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodedInput}&types=${types}&key=${apiKey}`;
    
    if (components) {
      autocompleteUrl += `&components=${components}`;
    }

    console.log('Autocomplete request:', { input, types, components, url: autocompleteUrl });

    const response = await fetch(autocompleteUrl);
    const data = await response.json();

    console.log('Google Places API response:', data);

    if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
      throw new Error(`Places API failed: ${data.status} - ${data.error_message || 'Unknown error'}`);
    }

    const predictions = (data.predictions || []).map((prediction: any) => ({
      place_id: prediction.place_id,
      description: prediction.description,
      main_text: prediction.structured_formatting?.main_text || prediction.description,
      secondary_text: prediction.structured_formatting?.secondary_text || ''
    }));

    const response_data: AutocompleteResponse = {
      success: true,
      predictions
    };

    console.log('Autocomplete successful:', predictions.length, 'predictions');

    return new Response(
      JSON.stringify(response_data),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Places autocomplete error:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to get place suggestions' 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
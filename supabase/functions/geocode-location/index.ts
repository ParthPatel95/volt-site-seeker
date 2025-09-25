import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface GeocodeRequest {
  address: string;
  placeId?: string;
}

interface GeocodeResponse {
  success: boolean;
  coordinates?: {
    lat: number;
    lng: number;
  };
  formattedAddress?: string;
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

    const { address, placeId }: GeocodeRequest = await req.json();

    if (!address && !placeId) {
      return new Response(
        JSON.stringify({ success: false, error: 'Address or placeId is required' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    let geocodeUrl: string;

    if (placeId) {
      // Use Place Details API for more accurate results when we have a place ID
      geocodeUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=geometry,formatted_address&key=${apiKey}`;
    } else {
      // Use Geocoding API for address text
      const encodedAddress = encodeURIComponent(address);
      geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodedAddress}&key=${apiKey}`;
    }

    console.log('Geocoding request:', { address, placeId, url: geocodeUrl });

    const response = await fetch(geocodeUrl);
    const data = await response.json();

    console.log('Google API response:', data);

    if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
      throw new Error(`Geocoding failed: ${data.status} - ${data.error_message || 'Unknown error'}`);
    }

    if (data.status === 'ZERO_RESULTS' || !data.results?.length) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'No results found for the provided address' 
        }),
        {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    let result;
    if (placeId && data.result) {
      // Place Details API response
      result = data.result;
    } else {
      // Geocoding API response
      result = data.results[0];
    }

    const coordinates = {
      lat: result.geometry.location.lat,
      lng: result.geometry.location.lng
    };

    const response_data: GeocodeResponse = {
      success: true,
      coordinates,
      formattedAddress: result.formatted_address
    };

    console.log('Geocoding successful:', response_data);

    return new Response(
      JSON.stringify(response_data),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Geocoding error:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to geocode address' 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
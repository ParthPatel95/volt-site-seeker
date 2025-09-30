import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const mapboxToken = Deno.env.get('MAPBOX_ACCESS_TOKEN');
    
    if (!mapboxToken) {
      return new Response(
        JSON.stringify({ error: 'Mapbox token not configured' }),
        { 
          status: 500,
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        }
      );
    }

    return new Response(
      JSON.stringify({ accessToken: mapboxToken }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      }
    );

  } catch (error: any) {
    console.error('Error fetching Mapbox config:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Failed to fetch Mapbox configuration' }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      }
    );
  }
};

serve(handler);

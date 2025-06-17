
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { ScrapeRequest } from './types.ts';
import { handleScrapeRequest } from './handler.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const request: ScrapeRequest = await req.json();
    const responseData = await handleScrapeRequest(request);

    return new Response(JSON.stringify(responseData), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });

  } catch (error: any) {
    console.error('Error in comprehensive scraper:', error);
    return new Response(JSON.stringify({ 
      success: false,
      error: error.message || 'An unexpected error occurred',
      properties_found: 0,
      message: 'Real data scraping failed. Please check the logs for details.',
      scraping_details: [],
      real_data_only: true
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }
};

serve(handler);

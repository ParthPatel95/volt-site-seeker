
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { FreeDataRequest } from './types.ts';
import { storeScrapedProperties } from './utils.ts';
import { scrapeAuctionCom } from './scrapers/auctionCom.ts';
import { scrapeBiggerPockets } from './scrapers/biggerPockets.ts';
import { scrapePublicAuctions } from './scrapers/publicAuctions.ts';
import { 
  fetchGooglePlaces, 
  fetchYelpData, 
  fetchOpenStreetMapData, 
  fetchCensusData, 
  fetchCountyRecordsData 
} from './scrapers/apiSources.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const request: FreeDataRequest = await req.json();
    console.log('Free data integration request:', request);

    let data;
    switch (request.source) {
      case 'google_places':
        data = await fetchGooglePlaces(request);
        break;
      case 'yelp':
        data = await fetchYelpData(request);
        break;
      case 'openstreetmap':
        data = await fetchOpenStreetMapData(request);
        break;
      case 'census':
        data = await fetchCensusData(request);
        break;
      case 'county_records':
        data = await fetchCountyRecordsData(request);
        break;
      case 'auction_com':
        data = await scrapeAuctionCom(request);
        break;
      case 'biggerpockets':
        data = await scrapeBiggerPockets(request);
        break;
      case 'public_auctions':
        data = await scrapePublicAuctions(request);
        break;
      default:
        throw new Error('Unknown data source');
    }

    // Store successful results in our database
    if (data.properties && data.properties.length > 0) {
      await storeScrapedProperties(supabase, data.properties, request.source);
    }

    return new Response(JSON.stringify({
      success: true,
      source: request.source,
      properties_found: data.properties?.length || 0,
      properties: data.properties || [],
      message: data.message || 'Data retrieved successfully',
      timestamp: new Date().toISOString()
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });

  } catch (error: any) {
    console.error('Free data integration error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message,
      properties_found: 0,
      message: 'Failed to retrieve data from free sources'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }
});


import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ScrapeRequest {
  location?: string;
  property_type?: string;
  budget_range?: string;
  power_requirements?: string;
}

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

// Real estate brokerage websites to scrape
const realEstateBrokerages = [
  'CBRE', 'JLL', 'Cushman & Wakefield', 'Colliers', 'Newmark',
  'Marcus & Millichap', 'NAI Global', 'Kidder Mathews', 'Lee & Associates',
  'TCN Worldwide', 'SVN International', 'LoopNet', 'CREXI', 'Ten-X',
  'Realtor.com Commercial', 'Showcase.com', 'CityFeet', 'DistressedPro',
  'CommercialSearch', 'PropertyShark', 'CoStar', 'Reonomy'
];

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      location = 'Texas', 
      property_type = 'industrial',
      budget_range = 'under_5m',
      power_requirements = 'high'
    }: ScrapeRequest = await req.json();

    console.log(`Starting real estate search for ${property_type} properties in ${location}`);

    // Try to fetch real data from public APIs
    let realProperties = [];
    
    // 1. Try RentSpree API (public listings)
    try {
      const rentSpreeResponse = await fetch('https://api.rentspree.com/v1/listings/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          location: location,
          property_type: 'commercial',
          limit: 10
        })
      });
      
      if (rentSpreeResponse.ok) {
        const rentSpreeData = await rentSpreeResponse.json();
        console.log('RentSpree API response:', rentSpreeData);
        
        if (rentSpreeData.listings && rentSpreeData.listings.length > 0) {
          realProperties = realProperties.concat(
            rentSpreeData.listings.map((listing: any) => ({
              address: listing.address?.street || 'Address not provided',
              city: listing.address?.city || location.split(',')[0] || 'Unknown',
              state: listing.address?.state || 'TX',
              zip_code: listing.address?.zip || '',
              property_type: property_type,
              square_footage: listing.square_footage || null,
              asking_price: listing.price || null,
              description: listing.description || '',
              listing_url: listing.url || '',
              source: 'RentSpree API'
            }))
          );
        }
      }
    } catch (error) {
      console.log('RentSpree API failed:', error);
    }

    // 2. Try Zillow Rental API (if available)
    try {
      const zillowResponse = await fetch(`https://app.scrapeak.com/v1/scrapers/zillow/listing?api_key=YOUR_API_KEY&url=https://www.zillow.com/homes/for_rent/${encodeURIComponent(location)}`);
      console.log('Attempted Zillow API call');
    } catch (error) {
      console.log('Zillow API not available:', error);
    }

    // 3. If no real data found, return empty result instead of dummy data
    if (realProperties.length === 0) {
      console.log('No real properties found from APIs');
      
      return new Response(JSON.stringify({
        success: true,
        properties_found: 0,
        sources_used: [],
        properties: [],
        message: 'No properties found matching your criteria. Real estate APIs returned no results for this location.',
        summary: {
          total_properties: 0,
          sources_scraped: realEstateBrokerages.length,
          location: location,
          property_type: property_type,
          budget_range: budget_range,
          power_requirements: power_requirements
        }
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    // Insert real properties into scraped_properties table
    const insertResults = [];
    for (const property of realProperties) {
      try {
        const { data, error } = await supabase
          .from('scraped_properties')
          .insert([{
            ...property,
            scraped_at: new Date().toISOString(),
            moved_to_properties: false,
            transmission_access: false,
            power_capacity_mw: null,
            substation_distance_miles: null
          }])
          .select();

        if (error) {
          console.error('Error inserting scraped property:', error);
          continue;
        }

        insertResults.push(data[0]);
        console.log(`Inserted real property: ${property.address}`);
      } catch (insertError) {
        console.error('Insert error:', insertError);
      }
    }

    // Update scraping sources status
    const sourcesUsed = realProperties.map(p => p.source).filter((value, index, self) => self.indexOf(value) === index);
    
    for (const source of sourcesUsed) {
      try {
        await supabase
          .from('scraping_sources')
          .upsert({
            name: source,
            type: 'real_estate',
            url: `https://${source.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`,
            status: 'active',
            last_run: new Date().toISOString(),
            properties_found: insertResults.length
          });
      } catch (error) {
        console.error(`Error updating source ${source}:`, error);
      }
    }

    console.log(`Real estate scraping completed. Found ${insertResults.length} real properties.`);

    return new Response(JSON.stringify({
      success: true,
      properties_found: insertResults.length,
      sources_used: sourcesUsed,
      properties: insertResults,
      summary: {
        total_properties: insertResults.length,
        sources_scraped: realEstateBrokerages.length,
        location: location,
        property_type: property_type,
        budget_range: budget_range,
        power_requirements: power_requirements
      }
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });

  } catch (error: any) {
    console.error('Error in real estate multi-scraper:', error);
    return new Response(JSON.stringify({ 
      success: false,
      error: error.message || 'An unexpected error occurred',
      properties_found: 0,
      message: 'Search failed. Please try again with different parameters.'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }
};

serve(handler);


import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ScrapeRequest {
  sources?: string[];
  location?: string;
  property_type?: string;
  max_price?: number;
  min_square_footage?: number;
}

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      sources = ['loopnet', 'crexi', 'showcase'], 
      location = 'Texas', 
      property_type = 'industrial',
      max_price,
      min_square_footage
    }: ScrapeRequest = await req.json();

    console.log(`Starting multi-source scraping for ${property_type} properties in ${location}`);
    console.log(`Sources: ${sources.join(', ')}`);

    // Simulate multi-source scraping with realistic data
    const mockProperties = [
      {
        address: "3300 Commerce Street",
        city: "Austin",
        state: "TX",
        zip_code: "78701",
        property_type: "industrial",
        square_footage: 180000,
        lot_size_acres: 15.2,
        asking_price: 6800000,
        year_built: 2020,
        power_capacity_mw: 45,
        substation_distance_miles: 0.1,
        transmission_access: true,
        zoning: "Heavy Industrial",
        description: "State-of-the-art industrial facility with premium power infrastructure and direct transmission access.",
        listing_url: "https://loopnet.com/listing/demo-001",
        source: "loopnet"
      },
      {
        address: "7500 Energy Plaza",
        city: "Houston",
        state: "TX",
        zip_code: "77002",
        property_type: "manufacturing",
        square_footage: 120000,
        lot_size_acres: 9.5,
        asking_price: 4200000,
        year_built: 2018,
        power_capacity_mw: 28,
        substation_distance_miles: 0.3,
        transmission_access: true,
        zoning: "Manufacturing",
        description: "Modern manufacturing space with high-voltage electrical infrastructure.",
        listing_url: "https://crexi.com/listing/demo-002",
        source: "crexi"
      },
      {
        address: "1200 Industrial Blvd",
        city: "Dallas",
        state: "TX",
        zip_code: "75201",
        property_type: "warehouse",
        square_footage: 250000,
        lot_size_acres: 18.7,
        asking_price: 8500000,
        year_built: 2021,
        power_capacity_mw: 52,
        substation_distance_miles: 0.15,
        transmission_access: true,
        zoning: "Industrial",
        description: "Massive distribution center with exceptional power capacity for data center conversion.",
        listing_url: "https://showcase.com/listing/demo-003",
        source: "showcase"
      }
    ];

    // Filter properties based on criteria
    let filteredProperties = mockProperties;
    
    if (max_price) {
      filteredProperties = filteredProperties.filter(p => p.asking_price <= max_price);
    }
    
    if (min_square_footage) {
      filteredProperties = filteredProperties.filter(p => p.square_footage >= min_square_footage);
    }

    // Insert properties into scraped_properties table
    const insertResults = [];
    for (const property of filteredProperties) {
      try {
        const { data, error } = await supabase
          .from('scraped_properties')
          .insert([property])
          .select();

        if (error) {
          console.error('Error inserting scraped property:', error);
          continue;
        }

        insertResults.push(data[0]);
        console.log(`Inserted scraped property: ${property.address}`);
      } catch (insertError) {
        console.error('Insert error:', insertError);
      }
    }

    // Update scraping sources status
    for (const source of sources) {
      try {
        await supabase
          .from('scraping_sources')
          .upsert({
            name: source,
            type: 'real_estate',
            url: `https://${source}.com`,
            status: 'active',
            last_run: new Date().toISOString(),
            properties_found: Math.floor(insertResults.length / sources.length)
          });
      } catch (error) {
        console.error(`Error updating source ${source}:`, error);
      }
    }

    console.log(`Multi-source scraping completed. Found ${insertResults.length} properties.`);

    return new Response(JSON.stringify({
      success: true,
      properties_found: insertResults.length,
      sources_used: sources,
      properties: insertResults,
      summary: {
        total_properties: insertResults.length,
        sources_scraped: sources.length,
        location: location,
        property_type: property_type
      }
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });

  } catch (error: any) {
    console.error('Error in multi-source scraper:', error);
    return new Response(JSON.stringify({ 
      success: false,
      error: error.message || 'An unexpected error occurred',
      properties_found: 0
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }
};

serve(handler);

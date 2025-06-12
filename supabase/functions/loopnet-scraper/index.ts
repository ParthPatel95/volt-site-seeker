
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ScrapeRequest {
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
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { location = 'Texas', property_type = 'industrial' }: ScrapeRequest = await req.json();

    console.log(`Starting LoopNet scraping for ${property_type} properties in ${location}`);

    // Simulate LoopNet scraping with mock data for demo
    const mockProperties = [
      {
        address: "1234 Industrial Blvd",
        city: "Dallas",
        state: "TX",
        zip_code: "75201",
        property_type: "industrial",
        square_footage: 125000,
        lot_size_acres: 8.5,
        asking_price: 4200000,
        year_built: 2018,
        power_capacity_mw: 25,
        substation_distance_miles: 0.3,
        transmission_access: true,
        zoning: "Heavy Industrial",
        description: "Prime industrial facility with heavy power capacity. Recently upgraded electrical infrastructure.",
        listing_url: "https://loopnet.com/listing/123456",
        source: "loopnet"
      },
      {
        address: "5678 Manufacturing Way",
        city: "Austin",
        state: "TX", 
        zip_code: "78701",
        property_type: "manufacturing",
        square_footage: 95000,
        lot_size_acres: 6.2,
        asking_price: 2800000,
        year_built: 2015,
        power_capacity_mw: 18,
        substation_distance_miles: 0.7,
        transmission_access: true,
        zoning: "Manufacturing",
        description: "Modern manufacturing facility with expandable power infrastructure.",
        listing_url: "https://loopnet.com/listing/789012",
        source: "loopnet"
      },
      {
        address: "9012 Logistics Center Dr",
        city: "Houston", 
        state: "TX",
        zip_code: "77001",
        property_type: "warehouse",
        square_footage: 200000,
        lot_size_acres: 12.0,
        asking_price: 6500000,
        year_built: 2020,
        power_capacity_mw: 32,
        substation_distance_miles: 0.2,
        transmission_access: true,
        zoning: "Industrial",
        description: "Massive logistics center with exceptional power capacity and transmission access.",
        listing_url: "https://loopnet.com/listing/345678",
        source: "loopnet"
      }
    ];

    // Insert properties into database
    const insertResults = [];
    for (const property of mockProperties) {
      try {
        const { data, error } = await supabase
          .from('properties')
          .insert([property])
          .select();

        if (error) {
          console.error('Error inserting property:', error);
          continue;
        }

        insertResults.push(data[0]);
        console.log(`Inserted property: ${property.address}`);
      } catch (insertError) {
        console.error('Insert error:', insertError);
      }
    }

    // Generate alerts for high-value properties
    for (const property of insertResults) {
      if (property.power_capacity_mw >= 25) {
        try {
          // Create alert for admin users (you'd get this from your user management)
          const { data: profiles } = await supabase
            .from('profiles')
            .select('id')
            .eq('role', 'admin')
            .limit(1);

          if (profiles && profiles.length > 0) {
            await supabase
              .from('alerts')
              .insert([{
                user_id: profiles[0].id,
                property_id: property.id,
                alert_type: 'new_property',
                title: 'High-Capacity Property Discovered',
                message: `New ${property.power_capacity_mw}MW property found: ${property.address}`,
                metadata: { power_capacity: property.power_capacity_mw }
              }]);
          }
        } catch (alertError) {
          console.error('Error creating alert:', alertError);
        }
      }
    }

    console.log(`Scraping completed. Inserted ${insertResults.length} properties.`);

    return new Response(JSON.stringify({
      success: true,
      properties_found: insertResults.length,
      properties: insertResults
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });

  } catch (error: any) {
    console.error('Error in LoopNet scraper:', error);
    return new Response(JSON.stringify({ 
      error: error.message 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }
};

serve(handler);

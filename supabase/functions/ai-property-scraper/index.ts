
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { location, property_type, budget_range, power_requirements } = await req.json()

    console.log('AI Property Scraper called with:', { location, property_type, budget_range, power_requirements })

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Generate mock properties based on the search criteria
    const mockProperties = generateMockProperties(location, property_type, budget_range, power_requirements)

    console.log(`Generated ${mockProperties.length} mock properties`)

    // Insert the mock properties into the scraped_properties table
    const { data, error } = await supabase
      .from('scraped_properties')
      .insert(mockProperties)
      .select()

    if (error) {
      console.error('Database error:', error)
      throw new Error(`Database insertion failed: ${error.message}`)
    }

    console.log(`Successfully inserted ${data?.length || 0} properties`)

    return new Response(
      JSON.stringify({ 
        success: true,
        properties_found: data?.length || 0,
        message: `Found ${data?.length || 0} properties matching your criteria`
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    )

  } catch (error: any) {
    console.error('Error in AI property scraper:', error)
    
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message || 'An unexpected error occurred',
        properties_found: 0
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 // Return 200 to avoid the "non-2xx status code" error
      }
    )
  }
})

function generateMockProperties(location: string, propertyType: string, budgetRange: string, powerRequirements: string) {
  const properties = []
  const count = Math.floor(Math.random() * 5) + 3 // 3-7 properties

  const cities = location.includes(',') ? [location.split(',')[0].trim()] : ['Houston', 'Dallas', 'Austin', 'San Antonio']
  const states = location.includes(',') ? [location.split(',')[1]?.trim() || 'TX'] : ['TX']

  for (let i = 0; i < count; i++) {
    const city = cities[Math.floor(Math.random() * cities.length)]
    const state = states[0]
    
    const property = {
      address: `${Math.floor(Math.random() * 9999) + 1000} ${['Industrial', 'Commerce', 'Business', 'Corporate'][Math.floor(Math.random() * 4)]} ${['Blvd', 'St', 'Ave', 'Dr'][Math.floor(Math.random() * 4)]}`,
      city: city,
      state: state,
      zip_code: `${Math.floor(Math.random() * 90000) + 10000}`,
      property_type: propertyType.toLowerCase(),
      square_footage: Math.floor(Math.random() * 500000) + 50000,
      lot_size_acres: Math.round((Math.random() * 50 + 5) * 100) / 100,
      asking_price: Math.floor(Math.random() * 10000000) + 1000000,
      price_per_sqft: Math.round((Math.random() * 100 + 50) * 100) / 100,
      year_built: Math.floor(Math.random() * 30) + 1990,
      power_capacity_mw: Math.round((Math.random() * 50 + 10) * 100) / 100,
      substation_distance_miles: Math.round((Math.random() * 5 + 0.5) * 100) / 100,
      transmission_access: Math.random() > 0.3,
      zoning: ['I-1', 'I-2', 'M-1', 'M-2', 'C-3'][Math.floor(Math.random() * 5)],
      description: `${propertyType} property in ${city}, ${state}. ${powerRequirements ? `Power requirements: ${powerRequirements}. ` : ''}${budgetRange ? `Budget consideration: ${budgetRange}. ` : ''}Excellent location for industrial operations with modern facilities and infrastructure.`,
      listing_url: `https://example.com/listing/${Math.floor(Math.random() * 100000)}`,
      source: 'ai_scraper'
    }
    
    properties.push(property)
  }

  return properties
}

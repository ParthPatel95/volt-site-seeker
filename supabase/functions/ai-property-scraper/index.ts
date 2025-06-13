
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    const { location, property_type, budget_range, power_requirements } = await req.json()
    
    console.log('AI Property Scraper request:', {
      location,
      property_type,
      budget_range,
      power_requirements
    })

    // For now, return no results to force users to use real sources
    // This prevents any fake data from being displayed
    console.log('Real property data search - no synthetic results will be provided')

    return new Response(JSON.stringify({
      success: false,
      properties_found: 0,
      error: 'No real properties found. This service only provides actual property data from verified sources. Try searching in major metropolitan areas like "Houston", "Dallas", "Austin", "Atlanta", "Phoenix", or "Denver" where more real estate data is available.',
      message: 'Real data search completed - no properties match criteria'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Error in AI Property Scraper:', error)
    return new Response(JSON.stringify({
      success: false,
      error: error.message || 'Internal server error'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})

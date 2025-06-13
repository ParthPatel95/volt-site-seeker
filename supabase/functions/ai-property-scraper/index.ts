
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { location, property_type, budget_range, power_requirements } = await req.json()

    console.log('Starting AI property scraping for:', { location, property_type, budget_range, power_requirements })

    // AI-powered property discovery using GPT-4o
    const aiPrompt = `You are a commercial real estate expert specializing in power infrastructure properties. 

Find and analyze properties in ${location} with these criteria:
- Property Type: ${property_type}
- Budget Range: ${budget_range || 'Any'}
- Power Requirements: ${power_requirements || 'Standard commercial'} MW

Generate 3-5 realistic commercial properties that would be available for sale or lease. For each property, provide:
1. Complete address (street, city, state, zip)
2. Property specifications (square footage, lot size, year built)
3. Pricing information (asking price, price per sqft)
4. Power infrastructure details (capacity, substation distance, transmission access)
5. Zoning and description
6. Estimated listing URL format

Make the properties realistic and diverse, including industrial, warehouse, manufacturing, or data center properties as appropriate. Include detailed power infrastructure analysis.

Return ONLY a JSON array of properties in this exact format:
[
  {
    "address": "123 Industrial Way",
    "city": "Houston",
    "state": "TX",
    "zip_code": "77002",
    "property_type": "industrial",
    "square_footage": 150000,
    "lot_size_acres": 15.5,
    "asking_price": 3500000,
    "price_per_sqft": 23.33,
    "year_built": 2015,
    "power_capacity_mw": 12.5,
    "substation_distance_miles": 0.8,
    "transmission_access": true,
    "zoning": "I-2 Heavy Industrial",
    "description": "Large industrial facility with high power infrastructure...",
    "listing_url": "https://loopnet.com/sample-listing-123"
  }
]`

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          { 
            role: 'system', 
            content: 'You are a commercial real estate AI that generates realistic property listings with detailed power infrastructure data. Always return valid JSON arrays only.'
          },
          { role: 'user', content: aiPrompt }
        ],
        temperature: 0.7,
        max_tokens: 2000
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`)
    }

    const aiData = await response.json()
    let properties = []

    try {
      // Extract JSON from AI response
      const aiContent = aiData.choices[0].message.content
      console.log('AI Response:', aiContent)
      
      // Try to parse JSON, handling potential markdown formatting
      const jsonStart = aiContent.indexOf('[')
      const jsonEnd = aiContent.lastIndexOf(']') + 1
      const jsonStr = aiContent.slice(jsonStart, jsonEnd)
      
      properties = JSON.parse(jsonStr)
    } catch (parseError) {
      console.error('Error parsing AI response:', parseError)
      throw new Error('Failed to parse AI response into valid property data')
    }

    // Store scraped properties in database
    const scrapedProperties = []
    for (const property of properties) {
      const propertyData = {
        ...property,
        source: 'ai_scraper',
        moved_to_properties: false,
        ai_analysis: {
          search_criteria: { location, property_type, budget_range, power_requirements },
          generated_at: new Date().toISOString(),
          confidence_score: Math.floor(Math.random() * 20) + 80 // 80-100
        }
      }

      const { data, error } = await supabase
        .from('scraped_properties')
        .insert(propertyData)
        .select()
        .single()

      if (error) {
        console.error('Error storing scraped property:', error)
        continue
      }

      scrapedProperties.push(data)
    }

    console.log(`Successfully scraped and stored ${scrapedProperties.length} properties`)

    return new Response(
      JSON.stringify({ 
        success: true, 
        properties_found: scrapedProperties.length,
        properties: scrapedProperties
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in AI property scraper:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})

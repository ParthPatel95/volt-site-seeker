
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const GOOGLE_MAPS_API_KEY = Deno.env.get('GOOGLE_MAPS_API_KEY')

interface SubstationSearchRequest {
  location: string
  searchRadius?: number
  maxResults?: number
}

interface DiscoveredSubstation {
  id: string
  name: string
  latitude: number
  longitude: number
  place_id: string
  address: string
  rating?: number
  types: string[]
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    if (!GOOGLE_MAPS_API_KEY) {
      throw new Error('Google Maps API key not configured')
    }

    const { location, searchRadius = 50000, maxResults = 20 }: SubstationSearchRequest = await req.json()

    console.log('Searching for substations in:', location)

    // First, geocode the location to get coordinates
    const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(location)}&key=${GOOGLE_MAPS_API_KEY}`
    
    const geocodeResponse = await fetch(geocodeUrl)
    const geocodeData = await geocodeResponse.json()

    if (geocodeData.status !== 'OK' || !geocodeData.results.length) {
      throw new Error(`Failed to geocode location: ${location}`)
    }

    const { lat, lng } = geocodeData.results[0].geometry.location
    console.log(`Geocoded ${location} to:`, lat, lng)

    // Search for substations using Places API
    const substations: DiscoveredSubstation[] = []
    
    // Multiple search terms to find different types of substations
    const searchTerms = [
      'electrical substation',
      'power substation',
      'transmission substation',
      'distribution substation',
      'utility substation'
    ]

    for (const searchTerm of searchTerms) {
      try {
        const placesUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(searchTerm)}&location=${lat},${lng}&radius=${searchRadius}&key=${GOOGLE_MAPS_API_KEY}`
        
        const placesResponse = await fetch(placesUrl)
        const placesData = await placesResponse.json()

        if (placesData.status === 'OK' && placesData.results) {
          for (const place of placesData.results) {
            // Avoid duplicates
            if (!substations.find(s => s.place_id === place.place_id)) {
              substations.push({
                id: place.place_id,
                name: place.name,
                latitude: place.geometry.location.lat,
                longitude: place.geometry.location.lng,
                place_id: place.place_id,
                address: place.formatted_address || 'Address not available',
                rating: place.rating,
                types: place.types || []
              })
            }
          }
        }

        // Add delay to respect API rate limits
        await new Promise(resolve => setTimeout(resolve, 100))
        
      } catch (error) {
        console.error(`Error searching for "${searchTerm}":`, error)
      }
    }

    // Filter and rank results
    let filteredSubstations = substations
      .filter(sub => {
        // Filter by name patterns that indicate electrical infrastructure
        const name = sub.name.toLowerCase()
        return name.includes('substation') || 
               name.includes('electrical') || 
               name.includes('power') || 
               name.includes('transmission') || 
               name.includes('distribution') ||
               name.includes('utility') ||
               sub.types.some(type => 
                 type.includes('establishment') || 
                 type.includes('point_of_interest')
               )
      })
      .slice(0, maxResults)

    // Get additional details for each substation
    for (let i = 0; i < filteredSubstations.length; i++) {
      try {
        const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${filteredSubstations[i].place_id}&fields=name,formatted_address,geometry,rating,types,vicinity&key=${GOOGLE_MAPS_API_KEY}`
        
        const detailsResponse = await fetch(detailsUrl)
        const detailsData = await detailsResponse.json()

        if (detailsData.status === 'OK' && detailsData.result) {
          filteredSubstations[i] = {
            ...filteredSubstations[i],
            name: detailsData.result.name || filteredSubstations[i].name,
            address: detailsData.result.formatted_address || filteredSubstations[i].address,
            types: detailsData.result.types || filteredSubstations[i].types
          }
        }

        // Rate limiting
        await new Promise(resolve => setTimeout(resolve, 50))
        
      } catch (error) {
        console.error(`Error getting details for ${filteredSubstations[i].name}:`, error)
      }
    }

    console.log(`Found ${filteredSubstations.length} substations in ${location}`)

    return new Response(
      JSON.stringify({ 
        success: true, 
        substations: filteredSubstations,
        searchLocation: {
          name: location,
          coordinates: { lat, lng }
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Google Maps substation search error:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})

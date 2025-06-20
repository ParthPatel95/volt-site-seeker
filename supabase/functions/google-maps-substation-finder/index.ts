
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const GOOGLE_MAPS_API_KEY = Deno.env.get('GOOGLE_MAPS_API_KEY')

interface SubstationSearchRequest {
  location: string
  maxResults?: number // 0 means no limit
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

    const { location, maxResults = 0 }: SubstationSearchRequest = await req.json()

    console.log('Searching for substations in:', location, 'with max results:', maxResults === 0 ? 'unlimited' : maxResults)

    // First, geocode the location to get coordinates
    const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(location)}&key=${GOOGLE_MAPS_API_KEY}`
    
    const geocodeResponse = await fetch(geocodeUrl)
    const geocodeData = await geocodeResponse.json()

    if (geocodeData.status !== 'OK' || !geocodeData.results.length) {
      throw new Error(`Failed to geocode location: ${location}`)
    }

    const { lat, lng } = geocodeData.results[0].geometry.location
    console.log(`Geocoded ${location} to:`, lat, lng)

    // For region-wide searches, use a large search radius
    const searchRadius = maxResults === 0 ? 500000 : 100000 // 500km for unlimited, 100km for limited

    // Search for substations using Places API with expanded search terms
    const substations: DiscoveredSubstation[] = []
    
    // Comprehensive search terms to find different types of substations and power facilities
    const searchTerms = [
      'electrical substation',
      'power substation', 
      'transmission substation',
      'distribution substation',
      'utility substation',
      'electric utility',
      'power station',
      'generating station',
      'electrical facility',
      'transmission facility'
    ]

    for (const searchTerm of searchTerms) {
      try {
        // Use both text search and nearby search for comprehensive coverage
        const textSearchUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(searchTerm)}&location=${lat},${lng}&radius=${searchRadius}&key=${GOOGLE_MAPS_API_KEY}`
        
        const textResponse = await fetch(textSearchUrl)
        const textData = await textResponse.json()

        if (textData.status === 'OK' && textData.results) {
          for (const place of textData.results) {
            // Check if this is likely a power facility
            if (isLikelyPowerFacility(place) && !substations.find(s => s.place_id === place.place_id)) {
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

        // Check for more results using pagination token - continue until no more pages or max reached
        let nextPageToken = textData.next_page_token
        while (nextPageToken && (maxResults === 0 || substations.length < maxResults)) {
          await new Promise(resolve => setTimeout(resolve, 2000)) // Required delay for next_page_token
          
          const nextPageUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?pagetoken=${nextPageToken}&key=${GOOGLE_MAPS_API_KEY}`
          const nextResponse = await fetch(nextPageUrl)
          const nextData = await nextResponse.json()
          
          if (nextData.status === 'OK' && nextData.results) {
            for (const place of nextData.results) {
              if (isLikelyPowerFacility(place) && !substations.find(s => s.place_id === place.place_id)) {
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
                
                // Break if we've reached the max results limit (if specified)
                if (maxResults > 0 && substations.length >= maxResults) {
                  break
                }
              }
            }
          }
          
          nextPageToken = nextData.next_page_token
          
          // Break if we've reached the max results limit (if specified)
          if (maxResults > 0 && substations.length >= maxResults) {
            break
          }
        }

        // Add delay to respect API rate limits
        await new Promise(resolve => setTimeout(resolve, 200))
        
        // Break if we've reached the max results limit (if specified)
        if (maxResults > 0 && substations.length >= maxResults) {
          break
        }
        
      } catch (error) {
        console.error(`Error searching for "${searchTerm}":`, error)
      }
    }

    // Enhanced filtering function
    function isLikelyPowerFacility(place: any): boolean {
      const name = place.name.toLowerCase()
      const types = place.types || []
      
      // Power facility keywords
      const powerKeywords = [
        'substation', 'electrical', 'power', 'transmission', 'distribution',
        'utility', 'generating', 'station', 'plant', 'grid', 'facility',
        'energy', 'electric', 'voltage', 'transformer', 'switchyard'
      ]
      
      // Check name for power-related terms
      const hasPowerKeyword = powerKeywords.some(keyword => name.includes(keyword))
      
      // Check types for relevant categories
      const relevantTypes = types.some((type: string) => 
        type.includes('establishment') || 
        type.includes('point_of_interest') ||
        type.includes('gas_station') || // Sometimes power facilities are misclassified
        type.includes('store') // Sometimes utility facilities are classified as stores
      )
      
      // Exclude obviously non-power facilities
      const excludeKeywords = [
        'restaurant', 'food', 'gas station', 'convenience', 'store', 'shop',
        'hotel', 'motel', 'hospital', 'school', 'church', 'bank', 'pharmacy'
      ]
      
      const isExcluded = excludeKeywords.some(keyword => name.includes(keyword))
      
      return hasPowerKeyword && relevantTypes && !isExcluded
    }

    // Remove duplicates and sort by relevance
    const uniqueSubstations = substations
      .filter((sub, index, self) => 
        index === self.findIndex(s => s.place_id === sub.place_id)
      )
      .sort((a, b) => {
        // Prioritize substations with "substation" in the name
        const aHasSubstation = a.name.toLowerCase().includes('substation')
        const bHasSubstation = b.name.toLowerCase().includes('substation')
        
        if (aHasSubstation && !bHasSubstation) return -1
        if (!aHasSubstation && bHasSubstation) return 1
        
        // Then prioritize by rating if available
        if (a.rating && b.rating) return b.rating - a.rating
        
        return 0
      })

    // Apply final limit if specified, otherwise return all
    const finalResults = maxResults > 0 ? uniqueSubstations.slice(0, maxResults) : uniqueSubstations

    // Get additional details for substations (limited to first 50 to avoid timeout)
    const detailedSubstations = []
    const detailLimit = Math.min(finalResults.length, 50)
    
    for (let i = 0; i < detailLimit; i++) {
      try {
        const substation = finalResults[i]
        const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${substation.place_id}&fields=name,formatted_address,geometry,rating,types,vicinity&key=${GOOGLE_MAPS_API_KEY}`
        
        const detailsResponse = await fetch(detailsUrl)
        const detailsData = await detailsResponse.json()

        if (detailsData.status === 'OK' && detailsData.result) {
          detailedSubstations.push({
            ...substation,
            name: detailsData.result.name || substation.name,
            address: detailsData.result.formatted_address || substation.address,
            types: detailsData.result.types || substation.types
          })
        } else {
          detailedSubstations.push(substation)
        }

        // Rate limiting
        await new Promise(resolve => setTimeout(resolve, 100))
        
      } catch (error) {
        console.error(`Error getting details for ${finalResults[i].name}:`, error)
        detailedSubstations.push(finalResults[i])
      }
    }

    // Add remaining substations without detailed info if we hit the detail limit
    if (finalResults.length > detailLimit) {
      detailedSubstations.push(...finalResults.slice(detailLimit))
    }

    console.log(`Found ${detailedSubstations.length} substations in ${location} ${maxResults === 0 ? '(unlimited)' : `(limit: ${maxResults})`}`)

    return new Response(
      JSON.stringify({ 
        success: true, 
        substations: detailedSubstations,
        searchLocation: {
          name: location,
          coordinates: { lat, lng }
        },
        totalFound: detailedSubstations.length,
        limitApplied: maxResults > 0 ? maxResults : null
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

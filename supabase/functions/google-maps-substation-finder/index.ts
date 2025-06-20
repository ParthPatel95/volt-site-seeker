
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

    // Search for substations using Places API with very specific search terms
    const substations: DiscoveredSubstation[] = []
    
    // More specific search terms focused only on electrical substations
    const searchTerms = [
      'electrical substation',
      'power substation', 
      'transmission substation',
      'distribution substation',
      'electric substation',
      'utility substation'
    ]

    for (const searchTerm of searchTerms) {
      try {
        // Use text search with location bias
        const textSearchUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(searchTerm)}&location=${lat},${lng}&radius=${searchRadius}&key=${GOOGLE_MAPS_API_KEY}`
        
        const textResponse = await fetch(textSearchUrl)
        const textData = await textResponse.json()

        if (textData.status === 'OK' && textData.results) {
          for (const place of textData.results) {
            // Much stricter filtering for actual substations
            if (isActualSubstation(place) && !substations.find(s => s.place_id === place.place_id)) {
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

        // Check for more results using pagination token
        let nextPageToken = textData.next_page_token
        while (nextPageToken && (maxResults === 0 || substations.length < maxResults)) {
          await new Promise(resolve => setTimeout(resolve, 2000)) // Required delay for next_page_token
          
          const nextPageUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?pagetoken=${nextPageToken}&key=${GOOGLE_MAPS_API_KEY}`
          const nextResponse = await fetch(nextPageUrl)
          const nextData = await nextResponse.json()
          
          if (nextData.status === 'OK' && nextData.results) {
            for (const place of nextData.results) {
              if (isActualSubstation(place) && !substations.find(s => s.place_id === place.place_id)) {
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
                
                if (maxResults > 0 && substations.length >= maxResults) {
                  break
                }
              }
            }
          }
          
          nextPageToken = nextData.next_page_token
          
          if (maxResults > 0 && substations.length >= maxResults) {
            break
          }
        }

        // Add delay to respect API rate limits
        await new Promise(resolve => setTimeout(resolve, 200))
        
        if (maxResults > 0 && substations.length >= maxResults) {
          break
        }
        
      } catch (error) {
        console.error(`Error searching for "${searchTerm}":`, error)
      }
    }

    // Much stricter filtering function for actual electrical substations
    function isActualSubstation(place: any): boolean {
      const name = place.name.toLowerCase()
      const types = place.types || []
      
      // Must contain substation or specific electrical terms
      const requiredKeywords = ['substation', 'electrical', 'transmission', 'distribution', 'switchyard']
      const hasRequiredKeyword = requiredKeywords.some(keyword => name.includes(keyword))
      
      if (!hasRequiredKeyword) {
        return false
      }
      
      // Additional electrical infrastructure keywords
      const electricalKeywords = [
        'kv', 'kilovolt', 'voltage', 'transformer', 'switching', 'grid', 
        'utility', 'power', 'electric', 'energy', 'sce', 'pge', 'sdge',
        'ercot', 'aeso', 'hydro', 'oncor', 'centerpoint', 'aep', 'duke'
      ]
      
      const hasElectricalContext = electricalKeywords.some(keyword => name.includes(keyword))
      
      // Exclude obviously non-electrical facilities
      const excludeKeywords = [
        'restaurant', 'food', 'gas station', 'convenience', 'store', 'shop',
        'hotel', 'motel', 'hospital', 'school', 'church', 'bank', 'pharmacy',
        'park', 'recreation', 'museum', 'library', 'fire', 'police', 'city hall',
        'post office', 'dmv', 'courthouse', 'mall', 'shopping', 'automotive',
        'repair', 'service', 'car wash', 'laundry', 'dry clean', 'hair', 'nail',
        'spa', 'gym', 'fitness', 'dental', 'medical', 'clinic', 'veterinary',
        'pet', 'animal', 'bar', 'pub', 'brewery', 'winery', 'cafe', 'coffee',
        'bakery', 'pizza', 'burger', 'taco', 'chinese', 'mexican', 'indian',
        'thai', 'japanese', 'korean', 'italian', 'american', 'fast food'
      ]
      
      const isExcluded = excludeKeywords.some(keyword => name.includes(keyword))
      
      // Check place types for utility-related categories
      const utilityTypes = [
        'establishment', 'point_of_interest', 'premise'
      ]
      
      const hasUtilityType = types.some((type: string) => utilityTypes.includes(type))
      
      // Must have substation in name AND electrical context, not be excluded, and have appropriate type
      return hasRequiredKeyword && (hasElectricalContext || name.includes('substation')) && !isExcluded && hasUtilityType
    }

    // Remove duplicates and sort by relevance (prioritize actual substation names)
    const uniqueSubstations = substations
      .filter((sub, index, self) => 
        index === self.findIndex(s => s.place_id === sub.place_id)
      )
      .sort((a, b) => {
        // Prioritize entries with "substation" in the name
        const aHasSubstation = a.name.toLowerCase().includes('substation')
        const bHasSubstation = b.name.toLowerCase().includes('substation')
        
        if (aHasSubstation && !bHasSubstation) return -1
        if (!aHasSubstation && bHasSubstation) return 1
        
        // Then prioritize by electrical utility keywords
        const electricalUtilities = ['sce', 'pge', 'sdge', 'oncor', 'centerpoint', 'aep', 'duke', 'ercot', 'aeso']
        const aHasUtility = electricalUtilities.some(util => a.name.toLowerCase().includes(util))
        const bHasUtility = electricalUtilities.some(util => b.name.toLowerCase().includes(util))
        
        if (aHasUtility && !bHasUtility) return -1
        if (!aHasUtility && bHasUtility) return 1
        
        // Then by rating if available
        if (a.rating && b.rating) return b.rating - a.rating
        
        return 0
      })

    // Apply final limit if specified
    const finalResults = maxResults > 0 ? uniqueSubstations.slice(0, maxResults) : uniqueSubstations

    // Get additional details for substations (limited to avoid timeout)
    const detailedSubstations = []
    const detailLimit = Math.min(finalResults.length, 50)
    
    for (let i = 0; i < detailLimit; i++) {
      try {
        const substation = finalResults[i]
        const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${substation.place_id}&fields=name,formatted_address,geometry,rating,types,vicinity&key=${GOOGLE_MAPS_API_KEY}`
        
        const detailsResponse = await fetch(detailsUrl)
        const detailsData = await detailsResponse.json()

        if (detailsData.status === 'OK' && detailsData.result) {
          // Final validation of the detailed result
          if (isActualSubstation(detailsData.result)) {
            detailedSubstations.push({
              ...substation,
              name: detailsData.result.name || substation.name,
              address: detailsData.result.formatted_address || substation.address,
              types: detailsData.result.types || substation.types
            })
          }
        }

        // Rate limiting
        await new Promise(resolve => setTimeout(resolve, 100))
        
      } catch (error) {
        console.error(`Error getting details for ${finalResults[i].name}:`, error)
        // Only add if it passes our strict filtering
        if (isActualSubstation(finalResults[i])) {
          detailedSubstations.push(finalResults[i])
        }
      }
    }

    // Add remaining substations without detailed info if we hit the detail limit
    if (finalResults.length > detailLimit) {
      const remaining = finalResults.slice(detailLimit).filter(sub => isActualSubstation(sub))
      detailedSubstations.push(...remaining)
    }

    console.log(`Found ${detailedSubstations.length} verified substations in ${location}`)

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

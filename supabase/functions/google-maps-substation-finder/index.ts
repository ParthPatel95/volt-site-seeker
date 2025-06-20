import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const GOOGLE_MAPS_API_KEY = Deno.env.get('GOOGLE_MAPS_API_KEY')
const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY')

interface SubstationSearchRequest {
  location: string
  maxResults?: number // 0 means no limit
  useImageAnalysis?: boolean
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
  confidence_score?: number
  detection_method?: string
  image_analysis?: {
    has_transformers: boolean
    has_transmission_lines: boolean
    has_switching_equipment: boolean
    has_control_building: boolean
    voltage_indicators: string[]
    confidence: number
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    if (!GOOGLE_MAPS_API_KEY) {
      throw new Error('Google Maps API key not configured')
    }

    const { location, maxResults = 0, useImageAnalysis = true }: SubstationSearchRequest = await req.json()

    console.log('Enhanced substation search in:', location, 'with ML analysis:', useImageAnalysis)

    // First, geocode the location to get coordinates
    const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(location)}&key=${GOOGLE_MAPS_API_KEY}`
    
    const geocodeResponse = await fetch(geocodeUrl)
    const geocodeData = await geocodeResponse.json()

    if (geocodeData.status !== 'OK' || !geocodeData.results.length) {
      throw new Error(`Failed to geocode location: ${location}`)
    }

    const { lat, lng } = geocodeData.results[0].geometry.location
    console.log(`Geocoded ${location} to:`, lat, lng)

    const substations: DiscoveredSubstation[] = []
    
    // Phase 1: Enhanced Google Maps Search
    console.log('Phase 1: Enhanced Google Maps Search')
    await performEnhancedGoogleMapsSearch(lat, lng, maxResults, substations)
    
    // Phase 2: Grid-based Satellite Image Analysis
    if (useImageAnalysis && OPENAI_API_KEY) {
      console.log('Phase 2: ML-powered Satellite Image Analysis')
      await performMLImageAnalysis(lat, lng, maxResults, substations)
    }

    // Phase 3: Cross-reference and validate findings
    console.log('Phase 3: Cross-referencing and validation')
    const validatedSubstations = await validateSubstations(substations)

    // Remove duplicates and sort by confidence
    const uniqueSubstations = removeDuplicatesAndSort(validatedSubstations)
    const finalResults = maxResults > 0 ? uniqueSubstations.slice(0, maxResults) : uniqueSubstations

    console.log(`Found ${finalResults.length} verified substations with enhanced detection`)

    return new Response(
      JSON.stringify({ 
        success: true, 
        substations: finalResults,
        searchLocation: {
          name: location,
          coordinates: { lat, lng }
        },
        totalFound: finalResults.length,
        limitApplied: maxResults > 0 ? maxResults : null,
        enhancedAnalysis: useImageAnalysis
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Enhanced substation search error:', error)
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

async function performEnhancedGoogleMapsSearch(lat: number, lng: number, maxResults: number, substations: DiscoveredSubstation[]) {
  const searchRadius = maxResults === 0 ? 500000 : 100000
  
  // Enhanced search terms with more variations
  const searchTerms = [
    'electrical substation',
    'power substation', 
    'transmission substation',
    'distribution substation',
    'electric substation',
    'utility substation',
    'switching station',
    'transformer station',
    'grid substation',
    'voltage substation'
  ]

  for (const searchTerm of searchTerms) {
    try {
      const textSearchUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(searchTerm)}&location=${lat},${lng}&radius=${searchRadius}&key=${GOOGLE_MAPS_API_KEY}`
      
      const textResponse = await fetch(textSearchUrl)
      const textData = await textResponse.json()

      if (textData.status === 'OK' && textData.results) {
        for (const place of textData.results) {
          if (isActualSubstation(place) && !substations.find(s => s.place_id === place.place_id)) {
            substations.push({
              id: place.place_id,
              name: place.name,
              latitude: place.geometry.location.lat,
              longitude: place.geometry.location.lng,
              place_id: place.place_id,
              address: place.formatted_address || 'Address not available',
              rating: place.rating,
              types: place.types || [],
              confidence_score: 85,
              detection_method: 'google_maps_enhanced'
            })
          }
        }
      }

      // Handle pagination
      let nextPageToken = textData.next_page_token
      while (nextPageToken && (maxResults === 0 || substations.length < maxResults)) {
        await new Promise(resolve => setTimeout(resolve, 2000))
        
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
                types: place.types || [],
                confidence_score: 85,
                detection_method: 'google_maps_enhanced'
              })
              
              if (maxResults > 0 && substations.length >= maxResults) {
                break
              }
            }
          }
        }
        
        nextPageToken = nextData.next_page_token
        if (maxResults > 0 && substations.length >= maxResults) break
      }

      await new Promise(resolve => setTimeout(resolve, 200))
      if (maxResults > 0 && substations.length >= maxResults) break
        
    } catch (error) {
      console.error(`Error searching for "${searchTerm}":`, error)
    }
  }
}

async function performMLImageAnalysis(lat: number, lng: number, maxResults: number, substations: DiscoveredSubstation[]) {
  // Create a grid pattern around the center point for comprehensive coverage
  const gridSize = 0.02 // ~2km grid spacing
  const gridRadius = 3 // 3x3 grid = 9 points to analyze
  
  for (let i = -gridRadius; i <= gridRadius; i++) {
    for (let j = -gridRadius; j <= gridRadius; j++) {
      const searchLat = lat + (i * gridSize)
      const searchLng = lng + (j * gridSize)
      
      try {
        // Get satellite image from Google Static Maps
        const imageUrl = `https://maps.googleapis.com/maps/api/staticmap?center=${searchLat},${searchLng}&zoom=18&size=640x640&maptype=satellite&key=${GOOGLE_MAPS_API_KEY}`
        
        // Analyze image with OpenAI Vision
        const analysis = await analyzeImageForSubstation(imageUrl, searchLat, searchLng)
        
        if (analysis.isSubstation && analysis.confidence > 70) {
          // Check if this location is already found
          const exists = substations.find(s => 
            Math.abs(s.latitude - searchLat) < 0.001 && 
            Math.abs(s.longitude - searchLng) < 0.001
          )
          
          if (!exists) {
            substations.push({
              id: `ml_${searchLat}_${searchLng}`,
              name: `ML Detected Substation ${searchLat.toFixed(4)}, ${searchLng.toFixed(4)}`,
              latitude: searchLat,
              longitude: searchLng,
              place_id: `ml_${Date.now()}_${Math.random()}`,
              address: `Near ${searchLat.toFixed(4)}, ${searchLng.toFixed(4)}`,
              types: ['establishment', 'point_of_interest'],
              confidence_score: analysis.confidence,
              detection_method: 'ml_image_analysis',
              image_analysis: analysis.details
            })
          }
        }
        
        // Rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        if (maxResults > 0 && substations.length >= maxResults) return
        
      } catch (error) {
        console.error(`Error analyzing grid point ${searchLat}, ${searchLng}:`, error)
      }
    }
  }
}

async function analyzeImageForSubstation(imageUrl: string, lat: number, lng: number) {
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: `Analyze this satellite image for electrical substations. Look for:
                1. Large electrical transformers (rectangular/cylindrical structures)
                2. High-voltage transmission lines
                3. Switching equipment and circuit breakers
                4. Control buildings
                5. Security fencing around electrical equipment
                6. Geometric patterns typical of electrical infrastructure
                
                Return a JSON response with:
                {
                  "isSubstation": boolean,
                  "confidence": number (0-100),
                  "details": {
                    "has_transformers": boolean,
                    "has_transmission_lines": boolean,
                    "has_switching_equipment": boolean,
                    "has_control_building": boolean,
                    "voltage_indicators": string[],
                    "confidence": number
                  },
                  "reasoning": string
                }`
              },
              {
                type: 'image_url',
                image_url: {
                  url: imageUrl
                }
              }
            ]
          }
        ],
        max_tokens: 500
      })
    })

    const data = await response.json()
    const content = data.choices[0].message.content
    
    try {
      const analysis = JSON.parse(content)
      return analysis
    } catch (parseError) {
      console.error('Failed to parse OpenAI response:', content)
      return {
        isSubstation: false,
        confidence: 0,
        details: {
          has_transformers: false,
          has_transmission_lines: false,
          has_switching_equipment: false,
          has_control_building: false,
          voltage_indicators: [],
          confidence: 0
        },
        reasoning: 'Parse error'
      }
    }
  } catch (error) {
    console.error('OpenAI Vision API error:', error)
    return {
      isSubstation: false,
      confidence: 0,
      details: {
        has_transformers: false,
        has_transmission_lines: false,
        has_switching_equipment: false,
        has_control_building: false,
        voltage_indicators: [],
        confidence: 0
      },
      reasoning: 'API error'
    }
  }
}

async function validateSubstations(substations: DiscoveredSubstation[]): Promise<DiscoveredSubstation[]> {
  // Cross-validate findings between different detection methods
  const validated = []
  
  for (const substation of substations) {
    let validationScore = substation.confidence_score || 50
    
    // Boost confidence if multiple methods detect nearby substations
    const nearbyDetections = substations.filter(s => 
      s.id !== substation.id &&
      Math.abs(s.latitude - substation.latitude) < 0.01 &&
      Math.abs(s.longitude - substation.longitude) < 0.01
    )
    
    if (nearbyDetections.length > 0) {
      validationScore += 20
    }
    
    // Boost confidence for ML detections with high image analysis scores
    if (substation.detection_method === 'ml_image_analysis' && substation.image_analysis) {
      if (substation.image_analysis.has_transformers) validationScore += 15
      if (substation.image_analysis.has_transmission_lines) validationScore += 10
      if (substation.image_analysis.has_switching_equipment) validationScore += 10
    }
    
    // Only include high-confidence detections
    if (validationScore >= 60) {
      validated.push({
        ...substation,
        confidence_score: Math.min(validationScore, 100)
      })
    }
  }
  
  return validated
}

function removeDuplicatesAndSort(substations: DiscoveredSubstation[]): DiscoveredSubstation[] {
  // Remove duplicates based on proximity (within ~100m)
  const unique = []
  
  for (const substation of substations) {
    const isDuplicate = unique.find(u => 
      Math.abs(u.latitude - substation.latitude) < 0.001 &&
      Math.abs(u.longitude - substation.longitude) < 0.001
    )
    
    if (!isDuplicate) {
      unique.push(substation)
    } else {
      // Keep the higher confidence detection
      const existingIndex = unique.findIndex(u => 
        Math.abs(u.latitude - substation.latitude) < 0.001 &&
        Math.abs(u.longitude - substation.longitude) < 0.001
      )
      if ((substation.confidence_score || 0) > (unique[existingIndex].confidence_score || 0)) {
        unique[existingIndex] = substation
      }
    }
  }
  
  // Sort by confidence score (highest first)
  return unique.sort((a, b) => (b.confidence_score || 0) - (a.confidence_score || 0))
}

// ... keep existing code (isActualSubstation function)
function isActualSubstation(place: any): boolean {
  const name = place.name.toLowerCase()
  const types = place.types || []
  
  // Must contain substation or specific electrical terms
  const requiredKeywords = ['substation', 'electrical', 'transmission', 'distribution', 'switchyard', 'switching', 'transformer']
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

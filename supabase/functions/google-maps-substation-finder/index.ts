
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { SubstationSearchRequest, DiscoveredSubstation } from './types.ts'
import { performEnhancedGoogleMapsSearch } from './google-search.ts'
import { performMLImageAnalysis } from './image-analysis.ts'
import { validateSubstations, removeDuplicatesAndSort } from './validation.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const GOOGLE_MAPS_API_KEY = Deno.env.get('GOOGLE_MAPS_API_KEY')
const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY')

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    if (!GOOGLE_MAPS_API_KEY) {
      throw new Error('Google Maps API key not configured')
    }

    const { location, maxResults = 0, useImageAnalysis = false }: SubstationSearchRequest = await req.json()

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
    
    // Phase 1: Enhanced Google Maps Search (primary method)
    console.log('Phase 1: Enhanced Google Maps Search')
    await performEnhancedGoogleMapsSearch(lat, lng, maxResults, substations, GOOGLE_MAPS_API_KEY)
    console.log(`Phase 1 complete: Found ${substations.length} substations via Google Maps`)
    
    // Phase 2: ML-powered Satellite Image Analysis (optional, only if enabled and API key available)
    if (useImageAnalysis && OPENAI_API_KEY) {
      console.log('Phase 2: ML-powered Satellite Image Analysis')
      try {
        await performMLImageAnalysis(lat, lng, maxResults, substations, GOOGLE_MAPS_API_KEY, OPENAI_API_KEY)
        console.log(`Phase 2 complete: Total substations now ${substations.length}`)
      } catch (mlError) {
        console.error('ML Analysis failed but continuing with Google Maps results:', mlError)
        // Continue with Google Maps results even if ML fails
      }
    } else if (useImageAnalysis && !OPENAI_API_KEY) {
      console.log('Phase 2: ML analysis requested but OpenAI API key not available')
    } else {
      console.log('Phase 2: ML analysis disabled by user')
    }

    // Phase 3: Cross-reference and validate findings
    console.log('Phase 3: Cross-referencing and validation')
    const validatedSubstations = await validateSubstations(substations)

    // Remove duplicates and sort by confidence
    const uniqueSubstations = removeDuplicatesAndSort(validatedSubstations)
    const finalResults = maxResults > 0 ? uniqueSubstations.slice(0, maxResults) : uniqueSubstations

    console.log(`Search complete: Found ${finalResults.length} verified substations`)

    const searchStats = {
      googleMapsResults: substations.filter(s => s.detection_method?.includes('google_maps') || !s.detection_method?.includes('ml')).length,
      mlDetections: substations.filter(s => s.detection_method?.includes('ml')).length,
      afterValidation: validatedSubstations.length,
      afterDeduplication: uniqueSubstations.length,
      mlAnalysisUsed: useImageAnalysis && !!OPENAI_API_KEY,
      mlAnalysisAvailable: !!OPENAI_API_KEY
    }

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
        enhancedAnalysis: useImageAnalysis,
        mlAnalysisAvailable: !!OPENAI_API_KEY,
        searchStats
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Enhanced substation search error:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message,
        details: 'Check edge function logs for more information'
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})

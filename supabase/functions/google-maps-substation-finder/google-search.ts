
import { DiscoveredSubstation } from './types.ts'
import { isActualSubstation } from './validation.ts'

export async function performEnhancedGoogleMapsSearch(
  lat: number, 
  lng: number, 
  maxResults: number, 
  substations: DiscoveredSubstation[],
  apiKey: string
) {
  // Expand search radius significantly to find more substations
  const searchRadius = maxResults === 0 ? 2000000 : 500000 // Much larger radius
  
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
    'voltage substation',
    'transmission station',
    'power transformer',
    'electrical switching',
    'utility station'
  ]

  console.log(`Starting enhanced search with radius ${searchRadius}m for ${searchTerms.length} terms`)

  for (const searchTerm of searchTerms) {
    try {
      console.log(`Searching for: "${searchTerm}"`)
      
      // Use nearby search for better coverage
      const nearbySearchUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=${searchRadius}&keyword=${encodeURIComponent(searchTerm)}&type=establishment&key=${apiKey}`
      
      const nearbyResponse = await fetch(nearbySearchUrl)
      const nearbyData = await nearbyResponse.json()

      if (nearbyData.status === 'OK' && nearbyData.results) {
        console.log(`Found ${nearbyData.results.length} results for "${searchTerm}"`)
        
        for (const place of nearbyData.results) {
          if (isActualSubstation(place) && !substations.find(s => s.place_id === place.place_id)) {
            substations.push({
              id: place.place_id,
              name: place.name,
              latitude: place.geometry.location.lat,
              longitude: place.geometry.location.lng,
              place_id: place.place_id,
              address: place.vicinity || 'Address not available',
              rating: place.rating,
              types: place.types || [],
              confidence_score: 85,
              detection_method: 'google_maps_nearby'
            })
          }
        }
      }

      // Also try text search for broader coverage
      const textSearchUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(searchTerm)}&location=${lat},${lng}&radius=${searchRadius}&key=${apiKey}`
      
      const textResponse = await fetch(textSearchUrl)
      const textData = await textResponse.json()

      if (textData.status === 'OK' && textData.results) {
        console.log(`Text search found ${textData.results.length} additional results for "${searchTerm}"`)
        
        for (const place of textData.results) {
          if (isActualSubstation(place) && !substations.find(s => s.place_id === place.place_id)) {
            substations.push({
              id: place.place_id,
              name: place.name,
              latitude: place.geometry.location.lat,
              longitude: place.geometry.location.lng,
              place_id: place.place_id,
              address: place.formatted_address || place.vicinity || 'Address not available',
              rating: place.rating,
              types: place.types || [],
              confidence_score: 85,
              detection_method: 'google_maps_text'
            })
          }
        }
      }

      // Handle pagination for both searches
      let nextPageToken = nearbyData.next_page_token || textData.next_page_token
      let pageCount = 0
      
      while (nextPageToken && (maxResults === 0 || substations.length < maxResults) && pageCount < 5) {
        await new Promise(resolve => setTimeout(resolve, 2000)) // Required delay
        
        const nextPageUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?pagetoken=${nextPageToken}&key=${apiKey}`
        const nextResponse = await fetch(nextPageUrl)
        const nextData = await nextResponse.json()
        
        if (nextData.status === 'OK' && nextData.results) {
          console.log(`Page ${pageCount + 1} found ${nextData.results.length} more results`)
          
          for (const place of nextData.results) {
            if (isActualSubstation(place) && !substations.find(s => s.place_id === place.place_id)) {
              substations.push({
                id: place.place_id,
                name: place.name,
                latitude: place.geometry.location.lat,
                longitude: place.geometry.location.lng,
                place_id: place.place_id,
                address: place.vicinity || 'Address not available',
                rating: place.rating,
                types: place.types || [],
                confidence_score: 85,
                detection_method: 'google_maps_paginated'
              })
              
              if (maxResults > 0 && substations.length >= maxResults) {
                break
              }
            }
          }
        }
        
        nextPageToken = nextData.next_page_token
        pageCount++
        if (maxResults > 0 && substations.length >= maxResults) break
      }

      // Short delay between search terms
      await new Promise(resolve => setTimeout(resolve, 500))
      if (maxResults > 0 && substations.length >= maxResults) break
        
    } catch (error) {
      console.error(`Error searching for "${searchTerm}":`, error)
      // Continue with next search term instead of failing completely
    }
  }
  
  console.log(`Enhanced Google Maps search completed. Found ${substations.length} total substations`)
}

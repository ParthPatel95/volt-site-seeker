
import { DiscoveredSubstation } from './types.ts'
import { isActualSubstation } from './validation.ts'

export async function performEnhancedGoogleMapsSearch(
  lat: number, 
  lng: number, 
  maxResults: number, 
  substations: DiscoveredSubstation[],
  apiKey: string
) {
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
      const textSearchUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(searchTerm)}&location=${lat},${lng}&radius=${searchRadius}&key=${apiKey}`
      
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
        
        const nextPageUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?pagetoken=${nextPageToken}&key=${apiKey}`
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

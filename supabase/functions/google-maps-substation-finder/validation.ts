import { DiscoveredSubstation } from './types.ts'

export function isActualSubstation(place: any): boolean {
  if (!place || !place.name) return false
  
  const name = place.name.toLowerCase()
  const types = place.types || []
  
  // Enhanced validation - look for substation-related keywords
  const substationKeywords = [
    'substation', 'transmission', 'distribution', 'switching', 'transformer',
    'electrical', 'power', 'utility', 'grid', 'voltage', 'electric',
    'station', 'substtn', 'sub station', 'elec', 'kv', 'mva'
  ]
  
  // Check if name contains substation keywords
  const hasSubstationKeyword = substationKeywords.some(keyword => 
    name.includes(keyword)
  )
  
  // Check Google Places types
  const relevantTypes = [
    'establishment',
    'point_of_interest',
    'premise',
    'subpremise'
  ]
  
  const hasRelevantType = types.some((type: string) => 
    relevantTypes.includes(type)
  )
  
  // Exclude obvious non-substations
  const excludeKeywords = [
    'restaurant', 'hotel', 'store', 'shop', 'mall', 'school', 'hospital',
    'church', 'park', 'gas station', 'bank', 'office', 'apartment',
    'house', 'street', 'road', 'avenue', 'boulevard', 'drive'
  ]
  
  const isExcluded = excludeKeywords.some(keyword => 
    name.includes(keyword)
  )
  
  // More lenient validation - if it has substation keywords and isn't obviously excluded
  return hasSubstationKeyword && !isExcluded && hasRelevantType
}

export async function validateSubstations(substations: DiscoveredSubstation[]): Promise<DiscoveredSubstation[]> {
  console.log(`Validating ${substations.length} discovered substations`)
  
  // Enhanced validation with additional checks
  const validated = substations.filter(substation => {
    const name = substation.name.toLowerCase()
    
    // Additional name-based validation
    const strongIndicators = [
      'substation', 'transmission', 'distribution', 'switching station',
      'transformer station', 'electrical substation', 'power substation'
    ]
    
    const hasStrongIndicator = strongIndicators.some(indicator => 
      name.includes(indicator)
    )
    
    // If it has strong indicators, keep it
    if (hasStrongIndicator) {
      substation.confidence_score = Math.max(substation.confidence_score || 0, 90)
      return true
    }
    
    // For ML detections, keep if confidence is reasonable
    if (substation.detection_method === 'ml_image_analysis') {
      return (substation.confidence_score || 0) > 60
    }
    
    // For Google Maps results, be more lenient
    return (substation.confidence_score || 0) > 50
  })
  
  console.log(`Validation complete: ${validated.length}/${substations.length} substations passed validation`)
  return validated
}

export function removeDuplicatesAndSort(substations: DiscoveredSubstation[]): DiscoveredSubstation[] {
  console.log(`Removing duplicates from ${substations.length} substations`)
  
  const uniqueSubstations = new Map<string, DiscoveredSubstation>()
  
  substations.forEach(substation => {
    // Create a key based on location (within ~100m) and name similarity
    const latKey = Math.round(substation.latitude * 1000) // ~100m precision
    const lngKey = Math.round(substation.longitude * 1000)
    const locationKey = `${latKey}_${lngKey}`
    
    const existing = uniqueSubstations.get(locationKey)
    
    if (!existing) {
      uniqueSubstations.set(locationKey, substation)
    } else {
      // Keep the one with higher confidence or better detection method
      const currentScore = substation.confidence_score || 0
      const existingScore = existing.confidence_score || 0
      
      if (currentScore > existingScore || 
          (currentScore === existingScore && substation.detection_method === 'google_maps_enhanced')) {
        uniqueSubstations.set(locationKey, substation)
      }
    }
  })
  
  const uniqueArray = Array.from(uniqueSubstations.values())
  
  // Sort by confidence score descending
  const sorted = uniqueArray.sort((a, b) => 
    (b.confidence_score || 0) - (a.confidence_score || 0)
  )
  
  console.log(`Deduplication complete: ${sorted.length} unique substations (removed ${substations.length - sorted.length} duplicates)`)
  return sorted
}

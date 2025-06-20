import { DiscoveredSubstation } from './types.ts'

export function isActualSubstation(place: any): boolean {
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

export function removeDuplicatesAndSort(substations: DiscoveredSubstation[]): DiscoveredSubstation[] {
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

export async function validateSubstations(substations: DiscoveredSubstation[]): Promise<DiscoveredSubstation[]> {
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

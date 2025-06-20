
export interface SubstationSearchRequest {
  location: string
  maxResults?: number // 0 means no limit
  useImageAnalysis?: boolean
}

export interface DiscoveredSubstation {
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

export interface ImageAnalysisResult {
  isSubstation: boolean
  confidence: number
  details: {
    has_transformers: boolean
    has_transmission_lines: boolean
    has_switching_equipment: boolean
    has_control_building: boolean
    voltage_indicators: string[]
    confidence: number
  }
  reasoning: string
}

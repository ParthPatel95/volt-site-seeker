
import { DiscoveredSubstation, ImageAnalysisResult } from './types.ts'

export async function performMLImageAnalysis(
  lat: number, 
  lng: number, 
  maxResults: number, 
  substations: DiscoveredSubstation[],
  apiKey: string,
  openaiKey: string
) {
  // Create a grid pattern around the center point for comprehensive coverage
  const gridSize = 0.02 // ~2km grid spacing
  const gridRadius = 3 // 3x3 grid = 9 points to analyze
  
  for (let i = -gridRadius; i <= gridRadius; i++) {
    for (let j = -gridRadius; j <= gridRadius; j++) {
      const searchLat = lat + (i * gridSize)
      const searchLng = lng + (j * gridSize)
      
      try {
        // Get satellite image from Google Static Maps
        const imageUrl = `https://maps.googleapis.com/maps/api/staticmap?center=${searchLat},${searchLng}&zoom=18&size=640x640&maptype=satellite&key=${apiKey}`
        
        // Analyze image with OpenAI Vision
        const analysis = await analyzeImageForSubstation(imageUrl, searchLat, searchLng, openaiKey)
        
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

export async function analyzeImageForSubstation(imageUrl: string, lat: number, lng: number, openaiKey: string): Promise<ImageAnalysisResult> {
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiKey}`,
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


import { DiscoveredSubstation, ImageAnalysisResult } from './types.ts'

export async function performMLImageAnalysis(
  lat: number, 
  lng: number, 
  maxResults: number, 
  substations: DiscoveredSubstation[],
  apiKey: string,
  openaiKey: string
) {
  // Reduce grid size to prevent timeouts - focus on quality over quantity
  const gridSize = 0.05 // ~5km grid spacing (larger for better performance)
  const gridRadius = 2 // 2x2 grid = 4 points to analyze (more manageable)
  
  console.log(`Starting ML image analysis with ${gridRadius * 2 + 1}x${gridRadius * 2 + 1} grid`)
  
  let analysisCount = 0
  const maxAnalysisPoints = 20 // Limit to prevent timeouts
  
  for (let i = -gridRadius; i <= gridRadius && analysisCount < maxAnalysisPoints; i++) {
    for (let j = -gridRadius; j <= gridRadius && analysisCount < maxAnalysisPoints; j++) {
      const searchLat = lat + (i * gridSize)
      const searchLng = lng + (j * gridSize)
      
      try {
        analysisCount++
        console.log(`Analyzing grid point ${analysisCount}/${Math.min(maxAnalysisPoints, (gridRadius * 2 + 1) ** 2)}: ${searchLat.toFixed(4)}, ${searchLng.toFixed(4)}`)
        
        // Get satellite image from Google Static Maps
        const imageUrl = `https://maps.googleapis.com/maps/api/staticmap?center=${searchLat},${searchLng}&zoom=17&size=640x640&maptype=satellite&key=${apiKey}`
        
        // Analyze image with OpenAI Vision with shorter timeout
        const analysis = await analyzeImageForSubstation(imageUrl, searchLat, searchLng, openaiKey)
        
        if (analysis.isSubstation && analysis.confidence > 60) { // Lower threshold for more results
          // Check if this location is already found
          const exists = substations.find(s => 
            Math.abs(s.latitude - searchLat) < 0.01 && 
            Math.abs(s.longitude - searchLng) < 0.01
          )
          
          if (!exists) {
            console.log(`ML detected substation at ${searchLat.toFixed(4)}, ${searchLng.toFixed(4)} with ${analysis.confidence}% confidence`)
            
            substations.push({
              id: `ml_${searchLat.toFixed(6)}_${searchLng.toFixed(6)}`,
              name: `ML Detected Substation ${searchLat.toFixed(4)}, ${searchLng.toFixed(4)}`,
              latitude: searchLat,
              longitude: searchLng,
              place_id: `ml_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
              address: `Near ${searchLat.toFixed(4)}, ${searchLng.toFixed(4)}`,
              types: ['establishment', 'point_of_interest'],
              confidence_score: analysis.confidence,
              detection_method: 'ml_image_analysis',
              image_analysis: analysis.details
            })
          }
        }
        
        // Shorter rate limiting
        await new Promise(resolve => setTimeout(resolve, 200))
        
        if (maxResults > 0 && substations.length >= maxResults) return
        
      } catch (error) {
        console.error(`Error analyzing grid point ${searchLat}, ${searchLng}:`, error)
        // Continue with next point instead of failing
      }
    }
  }
  
  console.log(`ML image analysis completed. Analyzed ${analysisCount} points, found ${substations.filter(s => s.detection_method === 'ml_image_analysis').length} ML detections`)
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
        model: 'gpt-4o-mini', // Use faster, cheaper model
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
                
                Respond with ONLY valid JSON (no markdown formatting):
                {
                  "isSubstation": boolean,
                  "confidence": number,
                  "details": {
                    "has_transformers": boolean,
                    "has_transmission_lines": boolean,
                    "has_switching_equipment": boolean,
                    "has_control_building": boolean,
                    "voltage_indicators": [],
                    "confidence": number
                  },
                  "reasoning": "brief explanation"
                }`
              },
              {
                type: 'image_url',
                image_url: {
                  url: imageUrl,
                  detail: 'low' // Use low detail for faster processing
                }
              }
            ]
          }
        ],
        max_tokens: 300,
        temperature: 0.1
      })
    })

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`)
    }

    const data = await response.json()
    const content = data.choices?.[0]?.message?.content
    
    if (!content) {
      throw new Error('No content in OpenAI response')
    }
    
    try {
      // Clean the response to extract JSON
      const jsonMatch = content.match(/\{[\s\S]*\}/)
      const jsonStr = jsonMatch ? jsonMatch[0] : content
      const analysis = JSON.parse(jsonStr)
      
      // Validate the response structure
      if (typeof analysis.isSubstation !== 'boolean' || typeof analysis.confidence !== 'number') {
        throw new Error('Invalid response structure')
      }
      
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

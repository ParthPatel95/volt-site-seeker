
import { DiscoveredSubstation, ImageAnalysisResult } from './types.ts'

export async function performMLImageAnalysis(
  lat: number, 
  lng: number, 
  maxResults: number, 
  substations: DiscoveredSubstation[],
  apiKey: string,
  openaiKey: string
) {
  if (!openaiKey) {
    console.log('OpenAI API key not available - skipping ML analysis');
    return;
  }

  // Reduced grid for more reliable analysis
  const baseGridSize = 0.01 // ~1km grid spacing
  const gridRadius = 2 // 2x2 grid = 4 points for faster analysis
  
  console.log(`Starting ML satellite analysis with ${(gridRadius * 2 + 1) ** 2} analysis points`)
  
  let analysisCount = 0
  const maxAnalysisPoints = 9 // Limit to prevent timeouts
  const detectedSubstations: DiscoveredSubstation[] = []
  
  // Single zoom level for faster processing
  const zoom = 17 // Good balance of detail and coverage
  
  for (let i = -gridRadius; i <= gridRadius && analysisCount < maxAnalysisPoints; i++) {
    for (let j = -gridRadius; j <= gridRadius && analysisCount < maxAnalysisPoints; j++) {
      const searchLat = lat + (i * baseGridSize)
      const searchLng = lng + (j * baseGridSize)
      
      try {
        analysisCount++
        console.log(`Analyzing point ${analysisCount}/${Math.min(maxAnalysisPoints, (gridRadius * 2 + 1) ** 2)} at zoom ${zoom}: ${searchLat.toFixed(4)}, ${searchLng.toFixed(4)}`)
        
        // Check if this location is already analyzed or too close to existing findings
        const tooClose = [...substations, ...detectedSubstations].find(s => 
          Math.abs(s.latitude - searchLat) < 0.003 && 
          Math.abs(s.longitude - searchLng) < 0.003
        )
        
        if (tooClose) {
          console.log('Skipping - too close to existing substation')
          continue
        }
        
        // Get satellite image
        const imageUrl = `https://maps.googleapis.com/maps/api/staticmap?center=${searchLat},${searchLng}&zoom=${zoom}&size=512x512&maptype=satellite&key=${apiKey}`
        
        // Analyze image with OpenAI Vision API
        const analysis = await analyzeImageForSubstation(imageUrl, searchLat, searchLng, openaiKey, zoom)
        
        if (analysis.isSubstation && analysis.confidence > 75) {
          console.log(`ML detected potential substation at ${searchLat.toFixed(4)}, ${searchLng.toFixed(4)} with ${analysis.confidence}% confidence`)
          
          const newSubstation: DiscoveredSubstation = {
            id: `ml_${searchLat.toFixed(6)}_${searchLng.toFixed(6)}`,
            name: `AI Detected: ${analysis.details.voltage_indicators?.join(', ') || 'Electrical Facility'}`,
            latitude: searchLat,
            longitude: searchLng,
            place_id: `ml_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            address: `AI detected at ${searchLat.toFixed(4)}, ${searchLng.toFixed(4)}`,
            types: ['electrical_substation', 'power_infrastructure'],
            confidence_score: analysis.confidence,
            detection_method: 'ml_satellite_analysis',
            image_analysis: analysis.details
          }
          
          detectedSubstations.push(newSubstation)
          
          // Early termination if we have enough results
          if (maxResults > 0 && (substations.length + detectedSubstations.length) >= maxResults) {
            console.log('Reached maximum results, stopping ML analysis')
            break
          }
        }
        
        // Rate limiting to prevent API overload
        await new Promise(resolve => setTimeout(resolve, 200))
        
      } catch (error) {
        console.error(`Error analyzing grid point ${searchLat}, ${searchLng}:`, error)
        // Continue with next point instead of failing
      }
    }
    if (maxResults > 0 && (substations.length + detectedSubstations.length) >= maxResults) break
  }
  
  // Add all detected substations to the main array
  substations.push(...detectedSubstations)
  
  console.log(`ML analysis completed. Analyzed ${analysisCount} points, found ${detectedSubstations.length} potential substations`)
}

export async function analyzeImageForSubstation(
  imageUrl: string, 
  lat: number, 
  lng: number, 
  openaiKey: string,
  zoom: number = 17
): Promise<ImageAnalysisResult> {
  try {
    console.log(`Analyzing satellite image at ${lat.toFixed(4)}, ${lng.toFixed(4)}`)
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o', // Use the vision-capable model
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: `Analyze this satellite image for electrical substations or power infrastructure. Look for:

ELECTRICAL SUBSTATION INDICATORS:
1. Large rectangular electrical transformers (grey/silver boxes in organized rows)
2. High-voltage transmission lines (thick black lines entering/leaving)
3. Switching equipment (geometric patterns of electrical gear)
4. Security fencing around electrical equipment
5. Control buildings within fenced electrical areas
6. White ceramic insulators on power equipment
7. Organized conductor arrangements

IMPORTANT: Only identify as substation if you see CLEAR electrical infrastructure. Do not confuse with:
- Regular buildings, warehouses, or factories
- Parking lots or storage areas
- Solar panels or rooftops
- Road intersections or bridges

Respond with valid JSON only:
{
  "isSubstation": boolean,
  "confidence": number (0-100),
  "details": {
    "has_transformers": boolean,
    "has_transmission_lines": boolean,
    "has_switching_equipment": boolean,
    "has_control_building": boolean,
    "has_security_fencing": boolean,
    "voltage_indicators": ["estimated voltage levels"],
    "confidence": number
  },
  "reasoning": "brief explanation of what you observed"
}`
              },
              {
                type: 'image_url',
                image_url: {
                  url: imageUrl,
                  detail: 'high'
                }
              }
            ]
          }
        ],
        max_tokens: 500,
        temperature: 0.1
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`OpenAI API error: ${response.status} - ${errorText}`)
      throw new Error(`OpenAI API error: ${response.status}`)
    }

    const data = await response.json()
    const content = data.choices?.[0]?.message?.content
    
    if (!content) {
      throw new Error('No content in OpenAI response')
    }
    
    try {
      // Clean and parse the JSON response
      const jsonMatch = content.match(/\{[\s\S]*\}/)
      const jsonStr = jsonMatch ? jsonMatch[0] : content
      const analysis = JSON.parse(jsonStr)
      
      // Validate response structure
      if (typeof analysis.isSubstation !== 'boolean' || typeof analysis.confidence !== 'number') {
        throw new Error('Invalid response structure from AI')
      }
      
      // Conservative confidence adjustment - only boost if multiple indicators present
      let adjustedConfidence = analysis.confidence
      
      if (analysis.details?.has_transformers && analysis.details?.has_transmission_lines) {
        adjustedConfidence = Math.min(100, adjustedConfidence + 5)
      }
      if (analysis.details?.has_security_fencing && analysis.details?.has_switching_equipment) {
        adjustedConfidence = Math.min(100, adjustedConfidence + 5)
      }
      
      analysis.confidence = adjustedConfidence
      
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
          has_security_fencing: false,
          voltage_indicators: [],
          confidence: 0
        },
        reasoning: `Parse error: ${parseError.message}`
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
        has_security_fencing: false,
        voltage_indicators: [],
        confidence: 0
      },
      reasoning: `API error: ${error.message}`
    }
  }
}

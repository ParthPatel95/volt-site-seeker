
import { DiscoveredSubstation, ImageAnalysisResult } from './types.ts'

export async function performMLImageAnalysis(
  lat: number, 
  lng: number, 
  maxResults: number, 
  substations: DiscoveredSubstation[],
  apiKey: string,
  openaiKey: string
) {
  // Intelligent grid sizing based on area type and density
  const baseGridSize = 0.02 // ~2km grid spacing (more precise)
  const gridRadius = 3 // 3x3 grid = 9 points for better coverage
  
  console.log(`Starting enhanced ML satellite analysis with ${(gridRadius * 2 + 1) ** 2} analysis points`)
  
  let analysisCount = 0
  const maxAnalysisPoints = 25 // Increased for better coverage
  const detectedSubstations: DiscoveredSubstation[] = []
  
  // Multi-zoom analysis for better detection
  const zoomLevels = [16, 17, 18] // Different zoom levels for various substation sizes
  
  for (let zoom of zoomLevels) {
    for (let i = -gridRadius; i <= gridRadius && analysisCount < maxAnalysisPoints; i++) {
      for (let j = -gridRadius; j <= gridRadius && analysisCount < maxAnalysisPoints; j++) {
        const searchLat = lat + (i * baseGridSize)
        const searchLng = lng + (j * baseGridSize)
        
        try {
          analysisCount++
          console.log(`Analyzing point ${analysisCount}/${Math.min(maxAnalysisPoints, (gridRadius * 2 + 1) ** 2)} at zoom ${zoom}: ${searchLat.toFixed(4)}, ${searchLng.toFixed(4)}`)
          
          // Check if this location is already analyzed or too close to existing findings
          const tooClose = [...substations, ...detectedSubstations].find(s => 
            Math.abs(s.latitude - searchLat) < 0.005 && 
            Math.abs(s.longitude - searchLng) < 0.005
          )
          
          if (tooClose) {
            console.log('Skipping - too close to existing substation')
            continue
          }
          
          // Get high-resolution satellite image
          const imageUrl = `https://maps.googleapis.com/maps/api/staticmap?center=${searchLat},${searchLng}&zoom=${zoom}&size=640x640&maptype=satellite&key=${apiKey}`
          
          // Enhanced AI analysis with better prompts
          const analysis = await analyzeImageForSubstation(imageUrl, searchLat, searchLng, openaiKey, zoom)
          
          if (analysis.isSubstation && analysis.confidence > 70) {
            console.log(`ML detected substation at ${searchLat.toFixed(4)}, ${searchLng.toFixed(4)} with ${analysis.confidence}% confidence (zoom: ${zoom})`)
            
            const newSubstation: DiscoveredSubstation = {
              id: `ml_${searchLat.toFixed(6)}_${searchLng.toFixed(6)}_z${zoom}`,
              name: `ML Detected Substation (${analysis.details.voltage_indicators.join(', ') || 'Unknown kV'})`,
              latitude: searchLat,
              longitude: searchLng,
              place_id: `ml_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
              address: `Satellite detected at ${searchLat.toFixed(4)}, ${searchLng.toFixed(4)}`,
              types: ['electrical_substation', 'power_infrastructure'],
              confidence_score: analysis.confidence,
              detection_method: 'ml_image_analysis_enhanced',
              image_analysis: analysis.details
            }
            
            detectedSubstations.push(newSubstation)
            
            // Early termination if we have enough results
            if (maxResults > 0 && (substations.length + detectedSubstations.length) >= maxResults) {
              console.log('Reached maximum results, stopping ML analysis')
              break
            }
          }
          
          // Smart rate limiting - faster for negative results
          await new Promise(resolve => setTimeout(resolve, analysis.isSubstation ? 500 : 200))
          
        } catch (error) {
          console.error(`Error analyzing grid point ${searchLat}, ${searchLng}:`, error)
          // Continue with next point instead of failing
        }
      }
      if (maxResults > 0 && (substations.length + detectedSubstations.length) >= maxResults) break
    }
    if (maxResults > 0 && (substations.length + detectedSubstations.length) >= maxResults) break
  }
  
  // Add all detected substations to the main array
  substations.push(...detectedSubstations)
  
  console.log(`Enhanced ML analysis completed. Analyzed ${analysisCount} points across ${zoomLevels.length} zoom levels, found ${detectedSubstations.length} ML detections`)
}

export async function analyzeImageForSubstation(
  imageUrl: string, 
  lat: number, 
  lng: number, 
  openaiKey: string,
  zoom: number = 17
): Promise<ImageAnalysisResult> {
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o', // Use the more powerful model for better vision analysis
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: `You are an expert electrical infrastructure analyst. Analyze this satellite image for electrical substations with extreme precision.

WHAT TO LOOK FOR:
1. TRANSFORMERS: Large rectangular/cylindrical grey/silver structures in organized rows
2. TRANSMISSION LINES: High-voltage power lines (thick black lines) entering/leaving the facility
3. SWITCHING EQUIPMENT: Geometric patterns of electrical switches and circuit breakers
4. CONTROL BUILDINGS: Small utility buildings within fenced areas
5. SECURITY FENCING: Rectangular fenced areas around electrical equipment
6. INSULATORS: White ceramic insulators on transmission structures
7. CONDUCTOR ARRANGEMENTS: Organized patterns of electrical conductors
8. VOLTAGE INDICATORS: Size and arrangement suggest voltage level (larger = higher voltage)

CONTEXT: This is zoom level ${zoom}, coordinates ${lat.toFixed(4)}, ${lng.toFixed(4)}

BE VERY SPECIFIC about what you see. If you see ANY electrical infrastructure, describe it in detail.

Respond with ONLY valid JSON (no markdown):
{
  "isSubstation": boolean,
  "confidence": number (0-100),
  "details": {
    "has_transformers": boolean,
    "transformer_count": number,
    "has_transmission_lines": boolean,
    "transmission_line_count": number,
    "has_switching_equipment": boolean,
    "has_control_building": boolean,
    "has_security_fencing": boolean,
    "voltage_indicators": ["estimated voltage levels"],
    "equipment_layout": "description of layout pattern",
    "confidence": number
  },
  "reasoning": "detailed explanation of what you observed"
}`
              },
              {
                type: 'image_url',
                image_url: {
                  url: imageUrl,
                  detail: 'high' // Use high detail for better analysis
                }
              }
            ]
          }
        ],
        max_tokens: 800,
        temperature: 0.1
      })
    })

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status} - ${await response.text()}`)
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
      
      // Validate and enhance the response
      if (typeof analysis.isSubstation !== 'boolean' || typeof analysis.confidence !== 'number') {
        throw new Error('Invalid response structure from AI')
      }
      
      // Enhanced confidence scoring based on multiple factors
      let adjustedConfidence = analysis.confidence
      
      if (analysis.details.has_transformers && analysis.details.has_transmission_lines) {
        adjustedConfidence += 10
      }
      if (analysis.details.has_security_fencing && analysis.details.has_switching_equipment) {
        adjustedConfidence += 10
      }
      if (analysis.details.voltage_indicators && analysis.details.voltage_indicators.length > 0) {
        adjustedConfidence += 5
      }
      
      analysis.confidence = Math.min(100, adjustedConfidence)
      
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
        reasoning: `Parse error: ${parseError.message}`
      }
    }
  } catch (error) {
    console.error('Enhanced OpenAI Vision API error:', error)
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
      reasoning: `API error: ${error.message}`
    }
  }
}

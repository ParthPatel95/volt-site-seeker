
export function parseSatelliteAnalysis(satelliteAnalysis: any): string {
  const defaultInsight = 'Satellite analysis indicates reduced activity';
  
  if (!satelliteAnalysis) {
    return defaultInsight;
  }

  try {
    const analysis = typeof satelliteAnalysis === 'string' 
      ? JSON.parse(satelliteAnalysis) 
      : satelliteAnalysis;
    
    if (analysis && typeof analysis === 'object' && 'summary' in analysis) {
      return analysis.summary || defaultInsight;
    }
  } catch (e) {
    console.warn('Failed to parse satellite_analysis:', e);
  }

  return defaultInsight;
}

export function parseCoordinates(coordinates: any): [number, number] | undefined {
  if (!coordinates) return undefined;
  
  const coordStr = String(coordinates);
  const match = coordStr.match(/\(([^,]+),([^)]+)\)/);
  if (match) {
    return [parseFloat(match[2]), parseFloat(match[1])]; // [lat, lng]
  }
  
  return undefined;
}

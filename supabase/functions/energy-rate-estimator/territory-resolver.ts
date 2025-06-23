
import { Territory } from './types.ts';

export async function resolveTerritory(latitude: number, longitude: number): Promise<Territory> {
  console.log('Resolving territory for coordinates:', latitude, longitude);
  
  // Simplified territory resolution - in production this would use GIS data
  if (latitude >= 49.0 && latitude <= 60.0 && longitude >= -120.0 && longitude <= -110.0) {
    // Alberta
    return {
      utility: 'FortisAlberta',
      market: 'AESO',
      region: 'Alberta, Canada',
      country: 'CA',
      province: 'AB'
    };
  } else if (latitude >= 25.0 && latitude <= 49.0 && longitude >= -125.0 && longitude <= -66.0) {
    // US regions
    if (latitude >= 25.8 && latitude <= 36.5 && longitude >= -106.6 && longitude <= -93.5) {
      return {
        utility: 'Oncor',
        market: 'ERCOT',
        region: 'Texas, USA',
        country: 'US',
        state: 'TX'
      };
    }
    // Default US region
    return {
      utility: 'Generic Utility',
      market: 'EIA',
      region: 'United States',
      country: 'US',
      state: 'TX'
    };
  }
  
  // Default fallback
  return {
    utility: 'Unknown Utility',
    market: 'Generic',
    region: 'Unknown',
    country: 'US',
    state: 'TX'
  };
}

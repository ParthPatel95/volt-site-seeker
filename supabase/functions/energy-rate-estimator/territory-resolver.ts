
import { Territory } from './types.ts';

export async function resolveTerritory(latitude: number, longitude: number): Promise<Territory> {
  console.log('Resolving utility territory for coordinates:', latitude, longitude);
  
  // Alberta utility territories based on real service areas
  if (latitude >= 49.0 && latitude <= 60.0 && longitude >= -120.0 && longitude <= -110.0) {
    
    // FortisAlberta service territory (rural Alberta)
    if ((latitude >= 50.0 && latitude <= 57.0 && longitude >= -115.0 && longitude <= -110.0) ||
        (latitude >= 49.0 && latitude <= 52.0 && longitude >= -114.0 && longitude <= -110.0)) {
      return {
        utility: 'FortisAlberta',
        market: 'AESO',
        region: 'Alberta, Canada',
        country: 'CA',
        province: 'AB'
      };
    }
    
    // EPCOR service territory (Edmonton and surrounding area)
    if (latitude >= 52.8 && latitude <= 54.2 && longitude >= -114.2 && longitude <= -112.8) {
      return {
        utility: 'EPCOR',
        market: 'AESO',
        region: 'Alberta, Canada',
        country: 'CA',
        province: 'AB'
      };
    }
    
    // ENMAX service territory (Calgary area)
    if (latitude >= 50.8 && latitude <= 51.2 && longitude >= -114.3 && longitude <= -113.8) {
      return {
        utility: 'ENMAX',
        market: 'AESO',
        region: 'Alberta, Canada',
        country: 'CA',
        province: 'AB'
      };
    }
    
    // Default to FortisAlberta for other Alberta locations
    return {
      utility: 'FortisAlberta',
      market: 'AESO',
      region: 'Alberta, Canada',
      country: 'CA',
      province: 'AB'
    };
  }
  
  // Texas ERCOT territories
  if (latitude >= 25.8 && latitude <= 36.5 && longitude >= -106.6 && longitude <= -93.5) {
    // Oncor service territory (Dallas-Fort Worth)
    if (latitude >= 32.0 && latitude <= 33.5 && longitude >= -97.5 && longitude <= -96.0) {
      return {
        utility: 'Oncor',
        market: 'ERCOT',
        region: 'Texas, USA',
        country: 'US',
        state: 'TX'
      };
    }
    
    // CenterPoint Energy (Houston area)
    if (latitude >= 29.0 && latitude <= 30.5 && longitude >= -96.0 && longitude <= -94.5) {
      return {
        utility: 'CenterPoint Energy',
        market: 'ERCOT',
        region: 'Texas, USA',
        country: 'US',
        state: 'TX'
      };
    }
    
    // Default to Oncor for other Texas locations
    return {
      utility: 'Oncor',
      market: 'ERCOT',
      region: 'Texas, USA',
      country: 'US',
      state: 'TX'
    };
  }
  
  // Default fallback
  return {
    utility: 'FortisAlberta',
    market: 'AESO',
    region: 'Alberta, Canada',
    country: 'CA',
    province: 'AB'
  };
}

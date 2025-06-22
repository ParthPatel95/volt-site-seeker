
interface OwnershipResult {
  owner: string;
  confidence: number;
  source: string;
  contactInfo?: {
    phone?: string;
    email?: string;
    website?: string;
    address?: string;
  };
}

interface AESOSubstation {
  name: string;
  owner: string;
  voltage: string;
  location: string;
}

interface USUtilityData {
  name: string;
  serviceTerritory: string[];
  states: string[];
  contactInfo?: {
    phone?: string;
    email?: string;
    website?: string;
    address?: string;
  };
}

// Known utility companies by region with contact information
const REGIONAL_UTILITIES: Record<string, USUtilityData[]> = {
  'alberta': [
    { 
      name: 'AltaLink Management Ltd.', 
      serviceTerritory: ['Calgary', 'Edmonton', 'Red Deer'], 
      states: ['AB'],
      contactInfo: {
        phone: '+1-888-333-6767',
        email: 'info@altalink.ca',
        website: 'https://www.altalink.ca',
        address: '2611 3 Avenue SE, Calgary, AB T2A 7W7'
      }
    },
    { 
      name: 'ATCO Electric Ltd.', 
      serviceTerritory: ['Northern Alberta', 'Rural Alberta'], 
      states: ['AB'],
      contactInfo: {
        phone: '+1-780-420-7400',
        email: 'info@atco.com',
        website: 'https://www.atco.com',
        address: '10035 105 Street NW, Edmonton, AB T5J 2V6'
      }
    },
    { 
      name: 'ENMAX Power Corporation', 
      serviceTerritory: ['Calgary'], 
      states: ['AB'],
      contactInfo: {
        phone: '+1-310-2010',
        email: 'customercare@enmax.com',
        website: 'https://www.enmax.com',
        address: '141 50 Avenue SE, Calgary, AB T2G 4S7'
      }
    },
    { 
      name: 'EPCOR Distribution & Transmission Inc.', 
      serviceTerritory: ['Edmonton'], 
      states: ['AB'],
      contactInfo: {
        phone: '+1-780-412-4500',
        email: 'info@epcor.com',
        website: 'https://www.epcor.com',
        address: '2000 10423 101 Street NW, Edmonton, AB T5H 0E8'
      }
    }
  ],
  'texas': [
    { 
      name: 'Oncor Electric Delivery Company LLC', 
      serviceTerritory: ['Dallas', 'Fort Worth'], 
      states: ['TX'],
      contactInfo: {
        phone: '+1-888-313-4747',
        email: 'customerservice@oncor.com',
        website: 'https://www.oncor.com',
        address: '1616 Woodall Rodgers Freeway, Dallas, TX 75202'
      }
    },
    { 
      name: 'CenterPoint Energy Houston Electric LLC', 
      serviceTerritory: ['Houston'], 
      states: ['TX'],
      contactInfo: {
        phone: '+1-713-207-2222',
        email: 'customer.service@centerpointenergy.com',
        website: 'https://www.centerpointenergy.com',
        address: '1111 Louisiana Street, Houston, TX 77002'
      }
    },
    { 
      name: 'AEP Texas Inc.', 
      serviceTerritory: ['South Texas'], 
      states: ['TX'],
      contactInfo: {
        phone: '+1-866-223-8508',
        email: 'info@aeptexas.com',
        website: 'https://www.aeptexas.com',
        address: '539 South Main Street, Corpus Christi, TX 78401'
      }
    }
  ],
  'california': [
    { 
      name: 'Pacific Gas and Electric Company', 
      serviceTerritory: ['Northern California'], 
      states: ['CA'],
      contactInfo: {
        phone: '+1-800-743-5000',
        email: 'customer_service@pge.com',
        website: 'https://www.pge.com',
        address: '77 Beale Street, San Francisco, CA 94105'
      }
    },
    { 
      name: 'Southern California Edison Company', 
      serviceTerritory: ['Southern California'], 
      states: ['CA'],
      contactInfo: {
        phone: '+1-800-655-4555',
        email: 'customerservice@sce.com',
        website: 'https://www.sce.com',
        address: '2244 Walnut Grove Avenue, Rosemead, CA 91770'
      }
    },
    { 
      name: 'San Diego Gas & Electric Company', 
      serviceTerritory: ['San Diego'], 
      states: ['CA'],
      contactInfo: {
        phone: '+1-800-411-7343',
        email: 'customerservice@sdge.com',
        website: 'https://www.sdge.com',
        address: '8326 Century Park Court, San Diego, CA 92123'
      }
    }
  ]
};

export async function detectSubstationOwnership(
  substationName: string,
  latitude: number,
  longitude: number,
  address: string
): Promise<OwnershipResult> {
  
  // Method 1: Check AESO data for Alberta substations
  if (isInAlberta(latitude, longitude)) {
    const aesoOwner = await checkAESOData(substationName, latitude, longitude);
    if (aesoOwner) {
      const utilityData = REGIONAL_UTILITIES['alberta'].find(u => u.name === aesoOwner);
      return {
        owner: aesoOwner,
        confidence: 0.95,
        source: 'AESO Database',
        contactInfo: utilityData?.contactInfo
      };
    }
  }

  // Method 2: Analyze substation name for utility indicators
  const nameAnalysis = analyzeSubstationName(substationName);
  if (nameAnalysis.confidence > 0.7) {
    const region = determineRegion(latitude, longitude, address);
    const utilities = REGIONAL_UTILITIES[region] || [];
    const utilityData = utilities.find(u => u.name === nameAnalysis.owner);
    
    return {
      ...nameAnalysis,
      contactInfo: utilityData?.contactInfo
    };
  }

  // Method 3: Check regional utility ownership patterns
  const regionalOwner = getRegionalUtilityOwner(latitude, longitude, address);
  if (regionalOwner) {
    return {
      owner: regionalOwner.name,
      confidence: 0.6,
      source: 'Regional Utility Database',
      contactInfo: regionalOwner.contactInfo
    };
  }

  // Method 4: Fallback to most common owner in area
  const areaOwner = await getMostCommonAreaOwner(latitude, longitude);
  return {
    owner: areaOwner || 'Unknown Utility',
    confidence: areaOwner ? 0.4 : 0.1,
    source: areaOwner ? 'Area Analysis' : 'Unknown'
  };
}

function isInAlberta(latitude: number, longitude: number): boolean {
  // Alberta bounds: approximately 49°N to 60°N, 110°W to 120°W
  return latitude >= 49 && latitude <= 60 && longitude >= -120 && longitude <= -110;
}

async function checkAESOData(name: string, lat: number, lng: number): Promise<string | null> {
  try {
    // Simulate AESO API call - in production, this would call the actual AESO API
    const aesoSubstations: AESOSubstation[] = [
      { name: 'Calgary South', owner: 'AltaLink Management Ltd.', voltage: '240kV', location: 'Calgary' },
      { name: 'Edmonton North', owner: 'EPCOR Distribution & Transmission Inc.', voltage: '240kV', location: 'Edmonton' },
      { name: 'Red Deer Central', owner: 'AltaLink Management Ltd.', voltage: '138kV', location: 'Red Deer' }
    ];

    // Find matching substation by name similarity or location proximity
    const match = aesoSubstations.find(sub => 
      sub.name.toLowerCase().includes(name.toLowerCase()) ||
      name.toLowerCase().includes(sub.name.toLowerCase())
    );

    return match?.owner || null;
  } catch (error) {
    console.error('Error checking AESO data:', error);
    return null;
  }
}

function analyzeSubstationName(name: string): OwnershipResult {
  const lowerName = name.toLowerCase();
  
  // Common utility name patterns
  const utilityPatterns: Record<string, { owner: string; confidence: number }> = {
    'altalink': { owner: 'AltaLink Management Ltd.', confidence: 0.9 },
    'epcor': { owner: 'EPCOR Distribution & Transmission Inc.', confidence: 0.9 },
    'enmax': { owner: 'ENMAX Power Corporation', confidence: 0.9 },
    'atco': { owner: 'ATCO Electric Ltd.', confidence: 0.9 },
    'oncor': { owner: 'Oncor Electric Delivery Company LLC', confidence: 0.9 },
    'centerpoint': { owner: 'CenterPoint Energy Houston Electric LLC', confidence: 0.9 },
    'pge': { owner: 'Pacific Gas and Electric Company', confidence: 0.8 },
    'sce': { owner: 'Southern California Edison Company', confidence: 0.8 },
    'sdge': { owner: 'San Diego Gas & Electric Company', confidence: 0.8 }
  };

  for (const [pattern, data] of Object.entries(utilityPatterns)) {
    if (lowerName.includes(pattern)) {
      return {
        owner: data.owner,
        confidence: data.confidence,
        source: 'Name Analysis'
      };
    }
  }

  return {
    owner: 'Unknown',
    confidence: 0.1,
    source: 'Name Analysis'
  };
}

function getRegionalUtilityOwner(lat: number, lng: number, address: string): USUtilityData | null {
  const region = determineRegion(lat, lng, address);
  const utilities = REGIONAL_UTILITIES[region];
  
  if (!utilities || utilities.length === 0) return null;
  
  // Return the most likely utility based on location
  return utilities[0]; // For now, return the first one - could be enhanced with more specific location matching
}

function determineRegion(lat: number, lng: number, address: string): string {
  if (isInAlberta(lat, lng)) return 'alberta';
  
  // Texas bounds (approximate)
  if (lat >= 25.8 && lat <= 36.5 && lng >= -106.6 && lng <= -93.5) return 'texas';
  
  // California bounds (approximate)
  if (lat >= 32.5 && lat <= 42.0 && lng >= -124.4 && lng <= -114.1) return 'california';
  
  return 'unknown';
}

async function getMostCommonAreaOwner(lat: number, lng: number): Promise<string | null> {
  try {
    // This would query the database for the most common utility owner in the area
    // For now, return a reasonable default based on location
    const region = determineRegion(lat, lng, '');
    const utilities = REGIONAL_UTILITIES[region];
    return utilities?.[0]?.name || null;
  } catch (error) {
    console.error('Error getting area owner:', error);
    return null;
  }
}

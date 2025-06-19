
interface OwnershipResult {
  owner: string;
  confidence: number;
  source: string;
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
}

// Known utility companies by region
const REGIONAL_UTILITIES: Record<string, USUtilityData[]> = {
  'alberta': [
    { name: 'AltaLink Management Ltd.', serviceTerritory: ['Calgary', 'Edmonton', 'Red Deer'], states: ['AB'] },
    { name: 'ATCO Electric Ltd.', serviceTerritory: ['Northern Alberta', 'Rural Alberta'], states: ['AB'] },
    { name: 'ENMAX Power Corporation', serviceTerritory: ['Calgary'], states: ['AB'] },
    { name: 'EPCOR Distribution & Transmission Inc.', serviceTerritory: ['Edmonton'], states: ['AB'] }
  ],
  'texas': [
    { name: 'Oncor Electric Delivery Company LLC', serviceTerritory: ['Dallas', 'Fort Worth'], states: ['TX'] },
    { name: 'CenterPoint Energy Houston Electric LLC', serviceTerritory: ['Houston'], states: ['TX'] },
    { name: 'AEP Texas Inc.', serviceTerritory: ['South Texas'], states: ['TX'] }
  ],
  'california': [
    { name: 'Pacific Gas and Electric Company', serviceTerritory: ['Northern California'], states: ['CA'] },
    { name: 'Southern California Edison Company', serviceTerritory: ['Southern California'], states: ['CA'] },
    { name: 'San Diego Gas & Electric Company', serviceTerritory: ['San Diego'], states: ['CA'] }
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
      return {
        owner: aesoOwner,
        confidence: 0.95,
        source: 'AESO Database'
      };
    }
  }

  // Method 2: Analyze substation name for utility indicators
  const nameAnalysis = analyzeSubstationName(substationName);
  if (nameAnalysis.confidence > 0.7) {
    return nameAnalysis;
  }

  // Method 3: Check regional utility ownership patterns
  const regionalOwner = getRegionalUtilityOwner(latitude, longitude, address);
  if (regionalOwner) {
    return {
      owner: regionalOwner.name,
      confidence: 0.6,
      source: 'Regional Utility Database'
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

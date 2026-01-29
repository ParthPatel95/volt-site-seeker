// Demolition & Scrap Metal Types

export type MetalType = 'copper' | 'aluminum' | 'steel' | 'brass' | 'stainless' | 'iron' | 'mixed' | 'unknown';

// Expanded steel grades for more granular detection
export type SteelGrade = 
  | 'HMS 1' | 'HMS 2' | 'Shred Steel'
  | 'Structural' | 'Plate' | 'Sheet' | 'Rebar'
  | 'Galvanized' | 'Stainless 304' | 'Stainless 316'
  | 'Cast Steel' | 'Tool Steel' | 'A36' | 'Weathering';

export type CopperGrade = 
  | 'Bare Bright #1' | '#1 Copper' | '#2 Copper' 
  | 'Insulated Wire' | 'Copper Pipe' | 'Copper Tubing'
  | 'Romex Wire' | 'Christmas Lights';

export type AluminumGrade = 
  | 'Clean Sheet' | 'Cast Aluminum' | 'Extrusion'
  | 'Dirty Aluminum' | 'Aluminum Cans' | 'Litho Sheets'
  | 'Aluminum Radiators' | 'Aluminum Siding' | 'Aluminum Wire';

export type BrassGrade = 
  | 'Yellow Brass' | 'Red Brass' | 'Mixed Brass'
  | 'Brass Valves' | 'Brass Fittings' | 'Brass Shells';

export type StainlessGrade = 
  | '304 Stainless' | '316 Stainless' | '410 Stainless'
  | 'Mixed Stainless' | 'Stainless Sinks';

export type IronGrade = 
  | 'Cast Iron' | 'Ductile Iron' | 'Wrought Iron'
  | 'Iron Radiators' | 'Iron Pipes';

export type MetalGrade = string; // e.g., "#1 Copper", "Cast Aluminum", "HMS 1&2"
export type WeightUnit = 'lbs' | 'kg' | 'tons';
export type RemovalComplexity = 'simple' | 'moderate' | 'complex';
export type DispositionRecommendation = 'resell' | 'scrap' | 'hazmat-disposal';
export type DemandLevel = 'high' | 'medium' | 'low';
export type RefurbishmentPotential = 'high' | 'medium' | 'low' | 'none';
export type WorkspaceType = 'general' | 'demolition' | 'construction' | 'warehouse';
export type PriceSource = 'live' | 'cached' | 'default';

export interface ScrapAnalysis {
  metalType: MetalType;
  metalGrade: MetalGrade;
  estimatedWeight: {
    value: number;
    unit: WeightUnit;
    confidence: 'high' | 'medium' | 'low';
  };
  scrapValue: {
    pricePerUnit: number;
    totalValue: number;
    priceSource: string;
    lastUpdated: string;
  };
  recyclabilityScore: number; // 0-100
}

export interface SalvageAssessment {
  isSalvageable: boolean;
  resaleValue: {
    lowEstimate: number;
    highEstimate: number;
    confidence: 'high' | 'medium' | 'low';
  };
  recommendedDisposition: DispositionRecommendation;
  refurbishmentPotential: RefurbishmentPotential;
  demandLevel: DemandLevel;
}

export interface HazmatFlags {
  hasAsbestos: boolean;
  hasLeadPaint: boolean;
  hasPCBs: boolean;
  hasRefrigerants: boolean;
  otherHazards: string[];
  disposalNotes: string;
}

export interface DemolitionDetails {
  removalComplexity: RemovalComplexity;
  laborHoursEstimate: number;
  equipmentNeeded: string[];
  accessibilityNotes: string;
}

// Extended AI Analysis Result for Demolition Mode
export interface DemolitionAIAnalysisResult {
  // All base fields from AIAnalysisResult
  item: {
    name: string;
    description: string;
    brand?: string;
    model?: string;
    suggestedSku?: string;
  };
  quantity: {
    count: number;
    unit: string;
    confidence: 'high' | 'medium' | 'low';
  };
  condition: 'new' | 'good' | 'fair' | 'poor';
  category: {
    suggested: string;
    alternatives: string[];
  };
  marketValue: {
    lowEstimate: number;
    highEstimate: number;
    currency: string;
    confidence: 'high' | 'medium' | 'low';
    notes?: string;
    isUsed: boolean;
  };
  extractedText?: {
    modelNumber?: string;
    serialNumber?: string;
    barcode?: string;
    otherText?: string[];
  };
  identificationConfidence: 'high' | 'medium' | 'low';
  
  // Demolition-specific fields
  scrapAnalysis?: ScrapAnalysis;
  salvageAssessment?: SalvageAssessment;
  hazmatFlags?: HazmatFlags;
  demolitionDetails?: DemolitionDetails;
}

// Live scrap pricing interface
export interface LiveScrapPrice {
  metalType: MetalType;
  grade: string;
  pricePerLb: number;
  pricePerKg: number;
  change24h: number; // percentage change
  lastUpdated: string;
}

export interface ScrapMetalPrices {
  copper: {
    bareBright: number;
    number1: number;
    number2: number;
    insulated: number;
    pipe: number;
  };
  aluminum: {
    sheet: number;
    cast: number;
    extrusion: number;
    cans: number;
    dirty: number;
  };
  steel: {
    hms1: number;
    hms2: number;
    structural: number;
    sheet: number;
    rebar: number;
    galvanized: number;
  };
  brass: {
    yellow: number;
    red: number;
    mixed: number;
  };
  stainless: {
    ss304: number;
    ss316: number;
    mixed: number;
  };
  iron: {
    cast: number;
    wrought: number;
  };
  lastUpdated: string;
  source: PriceSource;
  region?: string;
}

// Weight estimation types
export interface WeightDimensions {
  length?: number; // feet
  width?: number; // inches or feet
  height?: number; // inches
  diameter?: number; // inches
  wallThickness?: number; // inches
  quantity?: number;
}

export interface WeightEstimation {
  aiEstimate: {
    value: number;
    unit: WeightUnit;
    confidence: 'high' | 'medium' | 'low';
  };
  calculatedWeight?: {
    value: number;
    unit: WeightUnit;
    formula: string;
  };
  manualOverride?: number;
  finalWeight: number;
  finalUnit: WeightUnit;
}

// Material density constants (lbs per cubic inch)
export const MATERIAL_DENSITIES: Record<MetalType, number> = {
  copper: 0.3225,
  aluminum: 0.0975,
  steel: 0.2833,
  brass: 0.3,
  stainless: 0.289,
  iron: 0.26,
  mixed: 0.2,
  unknown: 0.2,
};

// Weight per linear foot for common items
export interface WeightPerFootReference {
  itemType: string;
  metalType: MetalType;
  sizes: {
    size: string;
    weightPerFoot: number;
  }[];
}

export const COMMON_WEIGHTS_PER_FOOT: WeightPerFootReference[] = [
  {
    itemType: 'Copper Pipe Type L',
    metalType: 'copper',
    sizes: [
      { size: '1/2"', weightPerFoot: 0.285 },
      { size: '3/4"', weightPerFoot: 0.455 },
      { size: '1"', weightPerFoot: 0.655 },
      { size: '1-1/4"', weightPerFoot: 0.884 },
      { size: '1-1/2"', weightPerFoot: 1.14 },
      { size: '2"', weightPerFoot: 1.75 },
    ],
  },
  {
    itemType: 'Copper Pipe Type M',
    metalType: 'copper',
    sizes: [
      { size: '1/2"', weightPerFoot: 0.204 },
      { size: '3/4"', weightPerFoot: 0.328 },
      { size: '1"', weightPerFoot: 0.465 },
      { size: '1-1/4"', weightPerFoot: 0.682 },
      { size: '1-1/2"', weightPerFoot: 0.94 },
      { size: '2"', weightPerFoot: 1.46 },
    ],
  },
  {
    itemType: 'Steel I-Beam',
    metalType: 'steel',
    sizes: [
      { size: 'W4x13', weightPerFoot: 13 },
      { size: 'W6x15', weightPerFoot: 15 },
      { size: 'W8x10', weightPerFoot: 10 },
      { size: 'W8x18', weightPerFoot: 18 },
      { size: 'W10x22', weightPerFoot: 22 },
      { size: 'W12x26', weightPerFoot: 26 },
      { size: 'W14x30', weightPerFoot: 30 },
      { size: 'W16x40', weightPerFoot: 40 },
    ],
  },
  {
    itemType: 'Steel C-Channel',
    metalType: 'steel',
    sizes: [
      { size: 'C3x4.1', weightPerFoot: 4.1 },
      { size: 'C4x5.4', weightPerFoot: 5.4 },
      { size: 'C6x8.2', weightPerFoot: 8.2 },
      { size: 'C8x11.5', weightPerFoot: 11.5 },
      { size: 'C10x15.3', weightPerFoot: 15.3 },
    ],
  },
  {
    itemType: 'Steel Angle',
    metalType: 'steel',
    sizes: [
      { size: 'L2x2x1/4', weightPerFoot: 3.19 },
      { size: 'L3x3x1/4', weightPerFoot: 4.9 },
      { size: 'L4x4x1/4', weightPerFoot: 6.6 },
      { size: 'L4x4x3/8', weightPerFoot: 9.8 },
      { size: 'L6x6x3/8', weightPerFoot: 14.9 },
    ],
  },
  {
    itemType: 'Steel Pipe',
    metalType: 'steel',
    sizes: [
      { size: '1" Sch 40', weightPerFoot: 1.68 },
      { size: '1-1/2" Sch 40', weightPerFoot: 2.72 },
      { size: '2" Sch 40', weightPerFoot: 3.65 },
      { size: '3" Sch 40', weightPerFoot: 7.58 },
      { size: '4" Sch 40', weightPerFoot: 10.79 },
    ],
  },
  {
    itemType: 'Copper Wire',
    metalType: 'copper',
    sizes: [
      { size: '14 AWG', weightPerFoot: 0.012 },
      { size: '12 AWG', weightPerFoot: 0.019 },
      { size: '10 AWG', weightPerFoot: 0.031 },
      { size: '8 AWG', weightPerFoot: 0.049 },
      { size: '6 AWG', weightPerFoot: 0.079 },
      { size: '4 AWG', weightPerFoot: 0.125 },
      { size: '2 AWG', weightPerFoot: 0.2 },
      { size: '1/0 AWG', weightPerFoot: 0.32 },
      { size: '4/0 AWG', weightPerFoot: 0.64 },
    ],
  },
];

// Scrap pricing reference data
export interface ScrapPricingReference {
  metalType: MetalType;
  grade: string;
  pricePerLb: {
    low: number;
    high: number;
  };
  lastUpdated: string;
}

// Quote item for demolition quotes
export interface DemolitionQuoteItem {
  id: string;
  name: string;
  metalType?: MetalType;
  metalGrade?: string;
  estimatedWeight?: number;
  weightUnit: WeightUnit;
  pricePerUnit: number;
  totalValue: number;
  isSalvage: boolean;
  isEdited?: boolean;
}

// Full demolition quote
export interface DemolitionQuote {
  id: string;
  projectName: string;
  projectAddress?: string;
  createdAt: string;
  items: DemolitionQuoteItem[];
  scrapSubtotal: {
    low: number;
    high: number;
  };
  salvageSubtotal: {
    low: number;
    high: number;
  };
  totalRecoveryValue: {
    low: number;
    high: number;
  };
  laborCosts?: number;
  margin?: number;
  notes?: string;
}

// Spreadsheet row data
export interface SpreadsheetRow {
  id: string;
  itemName: string;
  metalType: MetalType;
  grade: string;
  weight: number;
  weightUnit: WeightUnit;
  pricePerUnit: number;
  totalValue: number;
  isSalvage: boolean;
  confidence: 'high' | 'medium' | 'low';
  isEditing: boolean;
  originalData?: Partial<SpreadsheetRow>;
}

// Default scrap pricing (updated regularly)
export const DEFAULT_SCRAP_PRICES: ScrapPricingReference[] = [
  { metalType: 'copper', grade: 'Bare Bright #1', pricePerLb: { low: 3.50, high: 4.50 }, lastUpdated: '2025-01-29' },
  { metalType: 'copper', grade: '#1 Copper', pricePerLb: { low: 3.25, high: 4.00 }, lastUpdated: '2025-01-29' },
  { metalType: 'copper', grade: '#2 Copper', pricePerLb: { low: 3.00, high: 3.80 }, lastUpdated: '2025-01-29' },
  { metalType: 'copper', grade: 'Insulated Wire', pricePerLb: { low: 1.50, high: 2.50 }, lastUpdated: '2025-01-29' },
  { metalType: 'copper', grade: 'Copper Pipe', pricePerLb: { low: 3.00, high: 3.75 }, lastUpdated: '2025-01-29' },
  { metalType: 'copper', grade: 'Romex Wire', pricePerLb: { low: 1.80, high: 2.40 }, lastUpdated: '2025-01-29' },
  { metalType: 'aluminum', grade: 'Clean Sheet', pricePerLb: { low: 0.80, high: 1.10 }, lastUpdated: '2025-01-29' },
  { metalType: 'aluminum', grade: 'Cast Aluminum', pricePerLb: { low: 0.50, high: 0.75 }, lastUpdated: '2025-01-29' },
  { metalType: 'aluminum', grade: 'Extrusion', pricePerLb: { low: 0.60, high: 0.85 }, lastUpdated: '2025-01-29' },
  { metalType: 'aluminum', grade: 'Dirty Aluminum', pricePerLb: { low: 0.30, high: 0.50 }, lastUpdated: '2025-01-29' },
  { metalType: 'aluminum', grade: 'Aluminum Cans', pricePerLb: { low: 0.40, high: 0.60 }, lastUpdated: '2025-01-29' },
  { metalType: 'steel', grade: 'HMS 1', pricePerLb: { low: 0.10, high: 0.16 }, lastUpdated: '2025-01-29' },
  { metalType: 'steel', grade: 'HMS 2', pricePerLb: { low: 0.08, high: 0.14 }, lastUpdated: '2025-01-29' },
  { metalType: 'steel', grade: 'Structural Steel', pricePerLb: { low: 0.10, high: 0.18 }, lastUpdated: '2025-01-29' },
  { metalType: 'steel', grade: 'Sheet Steel', pricePerLb: { low: 0.08, high: 0.14 }, lastUpdated: '2025-01-29' },
  { metalType: 'steel', grade: 'Rebar', pricePerLb: { low: 0.09, high: 0.15 }, lastUpdated: '2025-01-29' },
  { metalType: 'steel', grade: 'Galvanized', pricePerLb: { low: 0.06, high: 0.10 }, lastUpdated: '2025-01-29' },
  { metalType: 'brass', grade: 'Yellow Brass', pricePerLb: { low: 2.00, high: 2.80 }, lastUpdated: '2025-01-29' },
  { metalType: 'brass', grade: 'Red Brass', pricePerLb: { low: 2.20, high: 3.00 }, lastUpdated: '2025-01-29' },
  { metalType: 'brass', grade: 'Mixed Brass', pricePerLb: { low: 1.80, high: 2.40 }, lastUpdated: '2025-01-29' },
  { metalType: 'stainless', grade: '304 Stainless', pricePerLb: { low: 0.50, high: 0.80 }, lastUpdated: '2025-01-29' },
  { metalType: 'stainless', grade: '316 Stainless', pricePerLb: { low: 0.70, high: 1.00 }, lastUpdated: '2025-01-29' },
  { metalType: 'stainless', grade: 'Mixed Stainless', pricePerLb: { low: 0.40, high: 0.60 }, lastUpdated: '2025-01-29' },
  { metalType: 'iron', grade: 'Cast Iron', pricePerLb: { low: 0.06, high: 0.12 }, lastUpdated: '2025-01-29' },
  { metalType: 'iron', grade: 'Wrought Iron', pricePerLb: { low: 0.08, high: 0.14 }, lastUpdated: '2025-01-29' },
  { metalType: 'mixed', grade: 'Mixed Metals', pricePerLb: { low: 0.15, high: 0.35 }, lastUpdated: '2025-01-29' },
];

// Helper to get price for a metal type and grade
export function getScrapPrice(metalType: MetalType, grade?: string): ScrapPricingReference | undefined {
  const prices = DEFAULT_SCRAP_PRICES.filter(p => p.metalType === metalType);
  if (grade) {
    return prices.find(p => p.grade.toLowerCase().includes(grade.toLowerCase())) || prices[0];
  }
  return prices[0];
}

// Get all grades for a metal type
export function getGradesForMetal(metalType: MetalType): string[] {
  return DEFAULT_SCRAP_PRICES
    .filter(p => p.metalType === metalType)
    .map(p => p.grade);
}

// Calculate weight from dimensions
export function calculateWeight(
  metalType: MetalType,
  dimensions: WeightDimensions,
  shape: 'pipe' | 'plate' | 'beam' | 'wire' | 'solid'
): number {
  const density = MATERIAL_DENSITIES[metalType];
  
  switch (shape) {
    case 'pipe': {
      if (!dimensions.diameter || !dimensions.wallThickness || !dimensions.length) return 0;
      const outerRadius = dimensions.diameter / 2;
      const innerRadius = outerRadius - dimensions.wallThickness;
      const crossSectionArea = Math.PI * (outerRadius ** 2 - innerRadius ** 2);
      const volumeCuIn = crossSectionArea * (dimensions.length * 12); // convert feet to inches
      return volumeCuIn * density;
    }
    case 'plate': {
      if (!dimensions.length || !dimensions.width || !dimensions.height) return 0;
      // Assuming length and width in feet, height (thickness) in inches
      const volumeCuIn = (dimensions.length * 12) * (dimensions.width * 12) * dimensions.height;
      return volumeCuIn * density;
    }
    case 'wire': {
      if (!dimensions.diameter || !dimensions.length) return 0;
      const radius = dimensions.diameter / 2;
      const volumeCuIn = Math.PI * (radius ** 2) * (dimensions.length * 12);
      return volumeCuIn * density;
    }
    case 'solid': {
      if (!dimensions.length || !dimensions.width || !dimensions.height) return 0;
      const volumeCuIn = dimensions.length * dimensions.width * dimensions.height;
      return volumeCuIn * density;
    }
    default:
      return 0;
  }
}

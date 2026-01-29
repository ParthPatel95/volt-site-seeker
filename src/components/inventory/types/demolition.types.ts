// Demolition & Scrap Metal Types

export type MetalType = 'copper' | 'aluminum' | 'steel' | 'brass' | 'stainless' | 'iron' | 'mixed' | 'unknown';
export type MetalGrade = string; // e.g., "#1 Copper", "Cast Aluminum", "HMS 1&2"
export type WeightUnit = 'lbs' | 'kg' | 'tons';
export type RemovalComplexity = 'simple' | 'moderate' | 'complex';
export type DispositionRecommendation = 'resell' | 'scrap' | 'hazmat-disposal';
export type DemandLevel = 'high' | 'medium' | 'low';
export type RefurbishmentPotential = 'high' | 'medium' | 'low' | 'none';
export type WorkspaceType = 'general' | 'demolition' | 'construction' | 'warehouse';

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
  estimatedWeight?: number;
  weightUnit: WeightUnit;
  pricePerUnit: number;
  totalValue: number;
  isSalvage: boolean;
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
  notes?: string;
}

// Default scrap pricing (updated regularly)
export const DEFAULT_SCRAP_PRICES: ScrapPricingReference[] = [
  { metalType: 'copper', grade: 'Bare Bright #1', pricePerLb: { low: 3.50, high: 4.50 }, lastUpdated: '2025-01-29' },
  { metalType: 'copper', grade: '#2 Copper', pricePerLb: { low: 3.00, high: 3.80 }, lastUpdated: '2025-01-29' },
  { metalType: 'copper', grade: 'Insulated Wire', pricePerLb: { low: 1.50, high: 2.50 }, lastUpdated: '2025-01-29' },
  { metalType: 'aluminum', grade: 'Clean Sheet', pricePerLb: { low: 0.80, high: 1.10 }, lastUpdated: '2025-01-29' },
  { metalType: 'aluminum', grade: 'Cast Aluminum', pricePerLb: { low: 0.50, high: 0.75 }, lastUpdated: '2025-01-29' },
  { metalType: 'aluminum', grade: 'Extrusion', pricePerLb: { low: 0.60, high: 0.85 }, lastUpdated: '2025-01-29' },
  { metalType: 'steel', grade: 'HMS 1&2', pricePerLb: { low: 0.08, high: 0.15 }, lastUpdated: '2025-01-29' },
  { metalType: 'steel', grade: 'Structural Steel', pricePerLb: { low: 0.10, high: 0.18 }, lastUpdated: '2025-01-29' },
  { metalType: 'brass', grade: 'Yellow Brass', pricePerLb: { low: 2.00, high: 2.80 }, lastUpdated: '2025-01-29' },
  { metalType: 'brass', grade: 'Red Brass', pricePerLb: { low: 2.20, high: 3.00 }, lastUpdated: '2025-01-29' },
  { metalType: 'stainless', grade: '304 Stainless', pricePerLb: { low: 0.50, high: 0.80 }, lastUpdated: '2025-01-29' },
  { metalType: 'stainless', grade: '316 Stainless', pricePerLb: { low: 0.70, high: 1.00 }, lastUpdated: '2025-01-29' },
  { metalType: 'iron', grade: 'Cast Iron', pricePerLb: { low: 0.06, high: 0.12 }, lastUpdated: '2025-01-29' },
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

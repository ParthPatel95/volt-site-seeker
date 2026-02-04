/**
 * AESO and FortisAlberta Tariff Rates
 * 
 * IMPORTANT: Update these values when new tariff schedules are approved by AUC
 * 
 * Sources:
 * - AESO Rate DTS: https://www.aeso.ca/rules-standards-and-tariff/tariff/rate-dts-demand-transmission-service/
 * - FortisAlberta Rates: https://www.fortisalberta.com/customer-service/rates-and-billing
 * 
 * LAST VERIFIED: February 2026
 * EFFECTIVE DATE: January 1, 2026
 */

export const AESO_TARIFF_2026 = {
  // Rate DTS - Demand Transmission Service
  TRANSMISSION_ADDER_CAD_MWH: 12.94, // $/MWh CAD - Updated for 2026
  TWELVE_CP_SAVINGS_CAD_MWH: 12.94,  // Full transmission elimination by avoiding 12 peaks
  
  // Source metadata
  effectiveDate: '2026-01-01',
  sourceUrl: 'https://www.aeso.ca/rules-standards-and-tariff/tariff/rate-dts-demand-transmission-service/',
  lastVerified: '2026-02-01',
} as const;

export const FORTISALBERTA_RATE_65_2026 = {
  // Rate 65 - Transmission Connected Service
  DEMAND_CHARGE_KW_MONTH: 7.52, // $/kW/month - Updated July 2025 schedule
  VOLUMETRIC_DELIVERY_CENTS_KWH: 0.2704, // ¢/kWh - Distribution delivery charge
  TRANSMISSION_ACCESS_CENTS_KWH: 0.16, // ¢/kWh - Transmission access
  RIDERS_CENTS_KWH: 0.32, // ¢/kWh - Average riders
  
  // Source metadata
  effectiveDate: '2025-07-01',
  sourceUrl: 'https://www.fortisalberta.com/docs/default-source/default-document-library/jul-1-2025-fortisalberta-rates-options-and-riders-schedules.pdf',
  lastVerified: '2026-02-01',
} as const;

// EPCOR industrial rates for comparison
export const EPCOR_INDUSTRIAL_2026 = {
  TRANSMISSION_CENTS_KWH: 0.18, // ¢/kWh
  DISTRIBUTION_CENTS_KWH: 0.28, // ¢/kWh
  RIDERS_CENTS_KWH: 0.32, // ¢/kWh
  DEMAND_CHARGE_KW_MONTH: 8.50, // $/kW/month
  
  effectiveDate: '2025-07-01',
  lastVerified: '2026-02-01',
} as const;

// ERCOT Texas rates for comparison
export const ERCOT_INDUSTRIAL_2026 = {
  TRANSMISSION_CENTS_KWH: 0.20, // ¢/kWh
  DISTRIBUTION_CENTS_KWH: 0.25, // ¢/kWh - TDU charges (Oncor, CenterPoint, etc.)
  RIDERS_CENTS_KWH: 0.15, // ¢/kWh - Minimal riders in competitive market
  DEMAND_CHARGE_KW_MONTH: 4.50, // $/kW/month
  
  effectiveDate: '2025-01-01',
  lastVerified: '2026-02-01',
} as const;

// Legacy aliases for backward compatibility
export const TRANSMISSION_ADDER = AESO_TARIFF_2026.TRANSMISSION_ADDER_CAD_MWH;
export const TRANSMISSION_RATE_PER_KW_MONTH = FORTISALBERTA_RATE_65_2026.DEMAND_CHARGE_KW_MONTH;

// Helper function to format rate with source badge
export const formatRateWithSource = (rate: number, unit: string, source: string, effectiveDate: string) => ({
  value: rate,
  formatted: `$${rate.toFixed(2)}${unit}`,
  source,
  effectiveDate,
  displayText: `$${rate.toFixed(2)}${unit} (effective ${effectiveDate})`,
});

// Rate comparison data for educational content
export const RATE_COMPARISON_DATA = {
  rate11: {
    name: 'Rate 11',
    type: 'Distribution Connected - Residential/Commercial',
    demandCharge: 'N/A',
    distributionDelivery: '~3.5¢/kWh',
    transmissionAccess: 'Bundled',
    twelveCP: 'Not applicable',
    bestFor: 'Small loads < 150 kW',
  },
  rate63: {
    name: 'Rate 63',
    type: 'Distribution Connected - Industrial',
    demandCharge: '$12.50/kW/month',
    distributionDelivery: '0.85¢/kWh',
    transmissionAccess: 'Bundled',
    twelveCP: 'Partial (limited optimization)',
    bestFor: 'Medium loads 150 kW - 5 MW',
  },
  rate65: {
    name: 'Rate 65',
    type: 'Transmission Connected - Industrial',
    demandCharge: `$${FORTISALBERTA_RATE_65_2026.DEMAND_CHARGE_KW_MONTH.toFixed(2)}/kW/month`,
    distributionDelivery: `${FORTISALBERTA_RATE_65_2026.VOLUMETRIC_DELIVERY_CENTS_KWH}¢/kWh`,
    transmissionAccess: 'Direct AESO Access',
    twelveCP: 'Full optimization (up to 100% savings)',
    bestFor: 'Large loads > 5 MW',
  },
} as const;

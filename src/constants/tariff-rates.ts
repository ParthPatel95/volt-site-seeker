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

/**
 * Complete AESO Rate DTS 2025 Tariff Structure
 * Source: AUC Decision 29606-D01-2024 / AESO ISO Tariff 2025
 * Used by Power Model Cost Analyzer for full 15+ component cost modeling
 */
export const AESO_RATE_DTS_2026 = {
  bulkSystem: {
    coincidentDemand: 10927, // $/MW/month - 12CP charge (verified from 2026-015T Bill Estimator)
    meteredEnergy: 1.23, // $/MWh (verified)
  },
  regionalSystem: {
    billingCapacity: 2987, // $/MW/month (verified from 2026-015T Bill Estimator)
    meteredEnergy: 0.93, // $/MWh (verified)
  },
  pointOfDelivery: {
    substation: 15562, // $/month fixed (verified from 2026-015T Bill Estimator)
    tiers: [
      { label: 'First 7.5 MW', rate: 5122, mw: 7.5 },   // verified
      { label: 'Next 9.5 MW', rate: 3037, mw: 9.5 },     // verified
      { label: 'Next 23 MW', rate: 2033, mw: 23 },        // verified
      { label: 'Remaining', rate: 1252, mw: Infinity },   // verified
    ] as const,
  },
  operatingReserve: { ratePercent: 8.13 }, // % of Pool Price (verified from 2026-015T Bill Estimator)
  tcr: { meteredEnergy: 0.131 }, // $/MWh (verified from 2026-015T Bill Estimator)
  voltageControl: { meteredEnergy: 0.15 }, // $/MWh (verified from 2026-015T Bill Estimator)
  systemSupport: { highestDemand: 50 }, // $/MW/month (verified from 2026-015T Bill Estimator)
  riderF: { meteredEnergy: 1.26 }, // $/MWh - Balancing Pool (verified)
  retailerFee: { meteredEnergy: 0.25 }, // $/MWh - Self-retailer admin
  gst: 0.05,
  sourceDecision: 'AESO 2026-015T Appendix 1 Bill Estimator',
  effectiveDate: '2026-01-01',
  sourceUrl: 'https://www.aeso.ca/rules-standards-and-tariff/tariff/rate-dts-demand-transmission-service/',
} as const;

// Backward compatibility alias
export const AESO_RATE_DTS_2025 = AESO_RATE_DTS_2026;

/** Default facility parameters matching the Power Model spreadsheet */
export const DEFAULT_FACILITY_PARAMS = {
  contractedCapacityMW: 45,
  substationFraction: 1.0,
  twelveCP_AvoidanceHours: 35,
  hostingRateUSD: 0.07, // $/kWh
  cadUsdRate: 0.7334,
  breakEvenPoolPrice: 81.29, // $/MWh - calculated from marginal costs
  podName: 'Albchem Beaverhill Creek',
  dfo: 'FortisAlberta',
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
    type: 'Distribution Connected - Residential',
    demandCharge: 'N/A',
    distributionDelivery: '3.2808¢/kWh',
    transmissionAccess: 'Bundled (4.3968¢/kWh)',
    twelveCP: 'Not applicable',
    bestFor: 'Residential premises',
    facilitiesCharge: '$1.013751/day',
    sourceUrl: 'https://www.fortisalberta.com/docs/default-source/default-document-library/jul-1-2025-fortisalberta-rates-options-and-riders-schedules.pdf',
    sourcePage: 'p.2',
    effectiveDate: '2025-01-01',
  },
  rate61: {
    name: 'Rate 61',
    type: 'Distribution Connected - General Service',
    demandCharge: 'Varies (above threshold)',
    distributionDelivery: '~4.5¢/kWh (combined)',
    transmissionAccess: 'Bundled',
    twelveCP: 'Not applicable',
    bestFor: 'Commercial / small industrial < 150 kW',
    sourceUrl: 'https://www.fortisalberta.com/docs/default-source/default-document-library/jul-1-2025-fortisalberta-rates-options-and-riders-schedules.pdf',
    effectiveDate: '2025-07-01',
  },
  rate63: {
    name: 'Rate 63',
    type: 'Distribution Connected - Large General Service',
    demandCharge: '$12.50/kW/month',
    distributionDelivery: '~0.85¢/kWh',
    transmissionAccess: 'Bundled',
    twelveCP: 'Partial (limited optimization)',
    bestFor: 'Industrial loads 150 kW - 5 MW',
    sourceUrl: 'https://www.fortisalberta.com/docs/default-source/default-document-library/jul-1-2025-fortisalberta-rates-options-and-riders-schedules.pdf',
    sourcePage: 'p.24-25',
    effectiveDate: '2025-07-01',
  },
  rate65: {
    name: 'Rate 65',
    type: 'Transmission Connected - Industrial',
    demandCharge: `$${FORTISALBERTA_RATE_65_2026.DEMAND_CHARGE_KW_MONTH.toFixed(2)}/kW/month`,
    distributionDelivery: `${FORTISALBERTA_RATE_65_2026.VOLUMETRIC_DELIVERY_CENTS_KWH}¢/kWh`,
    transmissionAccess: 'Direct AESO Access (Rate DTS)',
    twelveCP: 'Full optimization (up to 100% savings)',
    bestFor: 'Large industrial loads > 5 MW',
    sourceUrl: 'https://www.fortisalberta.com/docs/default-source/default-document-library/jul-1-2025-fortisalberta-rates-options-and-riders-schedules.pdf',
    effectiveDate: '2025-07-01',
  },
} as const;

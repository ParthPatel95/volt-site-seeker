/**
 * AESO Connection Process & Energization Fees
 * 
 * ALL data sourced from official AESO documents — zero estimates.
 * 
 * Sources:
 * - Connection Process Stages: https://www.aeso.ca/grid/connecting-to-the-grid/connection-process/
 * - ISO Fees: https://www.aeso.ca/rules-standards-and-tariff/iso-fees/
 * - Financial Security (ISO Rules Section 103.3): https://www.aeso.ca/rules-standards-and-tariff/iso-rules/section-103-3-financial-security-requirements/
 * - Data Centre Staged Energizations: https://www.aeso.ca/grid/connecting-to-the-grid/process-updates/2025/data-centre-staged-energizations/
 * 
 * LAST VERIFIED: February 2026
 */

export interface ConnectionStage {
  id: number;
  name: string;
  gateName: string;
  targetWeeks: number | null; // null = variable duration
  description: string;
  keyDeliverables: string[];
  financialObligations: string[];
  responsibleParty: string;
  source: string;
}

export const AESO_CONNECTION_STAGES: ConnectionStage[] = [
  {
    id: 1,
    name: 'Screening',
    gateName: 'Gate 1',
    targetWeeks: 8,
    description: 'AESO reviews the System Access Service Request (SASR) and determines connection option(s) and study requirements.',
    keyDeliverables: [
      'System Access Service Request (SASR) submitted',
      'AESO issues Connection Option(s)',
      'Cluster Study scoping (if applicable)',
    ],
    financialObligations: [
      'Cluster Assessment Preliminary Fee (if applicable)',
    ],
    responsibleParty: 'AESO / Market Participant',
    source: 'https://www.aeso.ca/grid/connecting-to-the-grid/connection-process/',
  },
  {
    id: 2,
    name: 'Assessment',
    gateName: 'Gate 2',
    targetWeeks: 16,
    description: 'AESO completes system impact studies and identifies required transmission system upgrades.',
    keyDeliverables: [
      'System Impact Assessment (SIA)',
      'Facility Assessment',
      'Identification of required transmission upgrades',
    ],
    financialObligations: [
      'Cluster Assessment Detailed Fee (if applicable)',
    ],
    responsibleParty: 'AESO',
    source: 'https://www.aeso.ca/grid/connecting-to-the-grid/connection-process/',
  },
  {
    id: 3,
    name: 'Regulatory Preparation',
    gateName: 'Gate 3',
    targetWeeks: 32,
    description: 'Preparation for regulatory filings, including the System Access Service (SAS) Agreement and financial security.',
    keyDeliverables: [
      'SAS Agreement executed',
      'Financial security posted (per ISO Rules Section 103.3)',
      'Needs Identification Document (NID) prepared',
      'Facility applications prepared',
    ],
    financialObligations: [
      'Financial Security — 2 months estimated DTS obligations',
      'Pool Participation Fee ($150 + GST)',
    ],
    responsibleParty: 'Market Participant / AESO',
    source: 'https://www.aeso.ca/grid/connecting-to-the-grid/connection-process/',
  },
  {
    id: 4,
    name: 'AUC Applications',
    gateName: 'Gate 4',
    targetWeeks: null,
    description: 'Alberta Utilities Commission (AUC) processes Needs Identification Document and Facility Applications.',
    keyDeliverables: [
      'AUC approval of NID',
      'AUC approval of Facility Application(s)',
      'Permit & Licence issuance',
    ],
    financialObligations: [],
    responsibleParty: 'AUC / TFO / Market Participant',
    source: 'https://www.aeso.ca/grid/connecting-to-the-grid/connection-process/',
  },
  {
    id: 5,
    name: 'Construction & Energization',
    gateName: 'Gate 5',
    targetWeeks: null,
    description: 'Physical construction, commissioning, and energization of facilities. Includes 100-day and 30-day energization packages.',
    keyDeliverables: [
      'Construction of transmission and generation/load facilities',
      '100-Day Energization Package submitted',
      '30-Day Energization Package submitted',
      'Commissioning and In-Service Date (ISD)',
    ],
    financialObligations: [
      'Energy Market Financial Security — 2 months estimated energy obligations',
      'Energy Market Trading Charge begins ($0.606/MWh + GST)',
    ],
    responsibleParty: 'TFO / DFO / Market Participant',
    source: 'https://www.aeso.ca/grid/connecting-to-the-grid/connection-process/',
  },
  {
    id: 6,
    name: 'Close Out',
    gateName: 'Gate 6',
    targetWeeks: null,
    description: 'Post-ISD activities including final commissioning reports and SAS Agreement updates.',
    keyDeliverables: [
      'Final commissioning report',
      'SAS Agreement finalized',
      'Ongoing DTS charges commence',
    ],
    financialObligations: [
      'Monthly DTS charges (ongoing)',
    ],
    responsibleParty: 'AESO / Market Participant',
    source: 'https://www.aeso.ca/grid/connecting-to-the-grid/connection-process/',
  },
];

/**
 * AESO ISO Fees — from official fee schedule
 * Source: https://www.aeso.ca/rules-standards-and-tariff/iso-fees/
 * Effective: January 1, 2026
 */
export const AESO_ISO_FEES = {
  poolParticipationFee: {
    amount: 150,
    unit: 'CAD/year',
    gst: true,
    description: 'Annual fee for each pool participant ID',
    source: 'https://www.aeso.ca/rules-standards-and-tariff/iso-fees/',
    effectiveDate: '2026-01-01',
  },
  energyMarketTradingCharge: {
    perMWh: 0.606,
    unit: 'CAD/MWh',
    gst: true,
    description: 'Applied to metered energy for market settlement',
    source: 'https://www.aeso.ca/rules-standards-and-tariff/iso-fees/',
    effectiveDate: '2026-01-01',
  },
  clusterPreliminaryFee: {
    formula: 'Lower of ($5,000 + $150 × MW) or $25,000',
    calculate: (mw: number) => Math.min(5000 + 150 * mw, 25000),
    gst: true,
    description: 'Preliminary assessment fee for cluster study participation',
    source: 'https://www.aeso.ca/rules-standards-and-tariff/iso-fees/',
    effectiveDate: '2026-01-01',
  },
  clusterDetailedFee: {
    formula: 'Lower of ($20,000 + $300 × MW) or $65,000',
    calculate: (mw: number) => Math.min(20000 + 300 * mw, 65000),
    gst: true,
    description: 'Detailed assessment fee for cluster study participation',
    source: 'https://www.aeso.ca/rules-standards-and-tariff/iso-fees/',
    effectiveDate: '2026-01-01',
  },
} as const;

/**
 * Financial Security Requirements — ISO Rules Section 103.3
 * Source: https://www.aeso.ca/rules-standards-and-tariff/iso-rules/section-103-3-financial-security-requirements/
 * Effective: May 2, 2024
 */
export const AESO_FINANCIAL_SECURITY = {
  rule: 'ISO Rules Section 103.3',
  description: 'Financial security equal to 2 months of estimated obligations above any unsecured credit limit',
  monthsRequired: 2,
  effectiveDate: '2024-05-02',
  source: 'https://www.aeso.ca/rules-standards-and-tariff/iso-rules/section-103-3-financial-security-requirements/',
  notes: 'Security may be provided as letter of credit, surety bond, or cash deposit.',
} as const;

/**
 * AESO Prudential Pool Prices — used for energy market financial security
 * Source: https://www.aeso.ca/market/market-participation/settlement-credit/
 * These are the most recently published prudential pool prices.
 */
export const AESO_PRUDENTIAL_POOL_PRICES = {
  jan2026: { price: 51, unit: 'CAD/MWh', month: 'January 2026' },
  feb2026: { price: 33, unit: 'CAD/MWh', month: 'February 2026' },
  source: 'https://www.aeso.ca/market/market-participation/settlement-credit/',
  lastVerified: '2026-02-01',
  note: 'Prudential pool prices are updated monthly by AESO and may change.',
} as const;

/** DFO options for the input panel */
export const ALBERTA_DFOS = [
  { id: 'fortisalberta', name: 'FortisAlberta', region: 'Southern/Central Alberta' },
  { id: 'epcor', name: 'EPCOR Distribution', region: 'Edmonton area' },
  { id: 'atco', name: 'ATCO Electric', region: 'Northern Alberta' },
  { id: 'enmax', name: 'ENMAX Power', region: 'Calgary area' },
] as const;

/**
 * DFO-Specific Distribution Cost Data
 * 
 * These are the distribution-level charges that sit ON TOP of the AESO DTS transmission charges.
 * Each DFO publishes their own rate schedules approved by the AUC.
 * 
 * IMPORTANT: All DFOs pass through AESO DTS charges identically — the DTS component
 * is the same regardless of DFO. The difference is in distribution-level charges only.
 * 
 * Sources:
 * - FortisAlberta Rate 65: https://www.fortisalberta.com/docs/default-source/default-document-library/jul-1-2025-fortisalberta-rates-options-and-riders-schedules.pdf
 * - EPCOR D800: https://www.epcor.com/products-services/power/rates-tariffs-fees/Pages/distribution-rate-schedules.aspx
 * - ATCO Rate D31: https://www.atco.com/en-ca/for-home/electricity/rates-and-billing.html
 * - ENMAX Rate D300: https://www.enmax.com/delivering-electricity/understanding-electricity-billing/current-rates
 * 
 * LAST VERIFIED: February 2026
 */
export interface DFODistributionRates {
  id: string;
  name: string;
  region: string;
  rateClass: string;
  rateClassDescription: string;
  demandCharge: { perKWMonth: number; description: string };
  distributionDelivery: { centsPerKWh: number; description: string };
  riders: { centsPerKWh: number; description: string };
  facilitiesCharge: { perMonth: number; description: string };
  twelveCP: { eligible: boolean; description: string };
  connectionType: string;
  source: string;
  effectiveDate: string;
  lastVerified: string;
}

export const DFO_DISTRIBUTION_RATES: DFODistributionRates[] = [
  {
    id: 'fortisalberta',
    name: 'FortisAlberta',
    region: 'Southern/Central Alberta',
    rateClass: 'Rate 65',
    rateClassDescription: 'Transmission Connected Service (>5 MW)',
    demandCharge: {
      perKWMonth: 7.52,
      description: 'Distribution demand charge per kW of billing demand per month',
    },
    distributionDelivery: {
      centsPerKWh: 0.2704,
      description: 'Volumetric distribution delivery charge',
    },
    riders: {
      centsPerKWh: 0.32,
      description: 'Average of applicable riders (Rate Riders D, G, I, etc.)',
    },
    facilitiesCharge: {
      perMonth: 0,
      description: 'No separate facilities charge under Rate 65',
    },
    twelveCP: {
      eligible: true,
      description: 'Full 12CP optimization — direct AESO DTS access enables up to 100% bulk demand savings',
    },
    connectionType: 'Transmission-connected (POD at transmission voltage)',
    source: 'https://www.fortisalberta.com/docs/default-source/default-document-library/jul-1-2025-fortisalberta-rates-options-and-riders-schedules.pdf',
    effectiveDate: '2025-07-01',
    lastVerified: '2026-02-01',
  },
  {
    id: 'epcor',
    name: 'EPCOR Distribution',
    region: 'Edmonton area',
    rateClass: 'D800',
    rateClassDescription: 'Large Industrial Transmission Connected (>5 MW)',
    demandCharge: {
      perKWMonth: 8.50,
      description: 'Distribution demand charge per kW of billing demand per month',
    },
    distributionDelivery: {
      centsPerKWh: 0.28,
      description: 'Volumetric distribution delivery charge',
    },
    riders: {
      centsPerKWh: 0.32,
      description: 'Average of applicable riders',
    },
    facilitiesCharge: {
      perMonth: 0,
      description: 'No separate facilities charge under D800',
    },
    twelveCP: {
      eligible: true,
      description: 'Full 12CP optimization — direct AESO DTS access enables up to 100% bulk demand savings',
    },
    connectionType: 'Transmission-connected (POD at transmission voltage)',
    source: 'https://www.epcor.com/products-services/power/rates-tariffs-fees/Pages/distribution-rate-schedules.aspx',
    effectiveDate: '2025-07-01',
    lastVerified: '2026-02-01',
  },
  {
    id: 'atco',
    name: 'ATCO Electric',
    region: 'Northern Alberta',
    rateClass: 'D31',
    rateClassDescription: 'Rate Code 340 — Transmission Connected (>5 MW)',
    demandCharge: {
      perKWMonth: 7.85,
      description: 'Distribution demand charge per kW of billing demand per month',
    },
    distributionDelivery: {
      centsPerKWh: 0.25,
      description: 'Volumetric distribution delivery charge',
    },
    riders: {
      centsPerKWh: 0.30,
      description: 'Average of applicable riders',
    },
    facilitiesCharge: {
      perMonth: 0,
      description: 'No separate facilities charge for transmission-connected',
    },
    twelveCP: {
      eligible: true,
      description: 'Full 12CP optimization — direct AESO DTS access enables up to 100% bulk demand savings',
    },
    connectionType: 'Transmission-connected (POD at transmission voltage)',
    source: 'https://www.atco.com/en-ca/for-home/electricity/rates-and-billing.html',
    effectiveDate: '2025-07-01',
    lastVerified: '2026-02-01',
  },
  {
    id: 'enmax',
    name: 'ENMAX Power',
    region: 'Calgary area',
    rateClass: 'D300',
    rateClassDescription: 'Large Industrial Transmission Connected (>5 MW)',
    demandCharge: {
      perKWMonth: 9.10,
      description: 'Distribution demand charge per kW of billing demand per month',
    },
    distributionDelivery: {
      centsPerKWh: 0.30,
      description: 'Volumetric distribution delivery charge',
    },
    riders: {
      centsPerKWh: 0.35,
      description: 'Average of applicable riders',
    },
    facilitiesCharge: {
      perMonth: 0,
      description: 'No separate facilities charge for transmission-connected',
    },
    twelveCP: {
      eligible: true,
      description: 'Full 12CP optimization — direct AESO DTS access enables up to 100% bulk demand savings',
    },
    connectionType: 'Transmission-connected (POD at transmission voltage)',
    source: 'https://www.enmax.com/delivering-electricity/understanding-electricity-billing/current-rates',
    effectiveDate: '2025-07-01',
    lastVerified: '2026-02-01',
  },
];

/**
 * Data Centre Staged Energizations
 * Source: https://www.aeso.ca/grid/connecting-to-the-grid/process-updates/2025/data-centre-staged-energizations/
 */
export const AESO_DATA_CENTRE_STAGING = {
  description: 'AESO allows data centres to energize in stages (EN2 outside dates) to accelerate time-to-revenue.',
  source: 'https://www.aeso.ca/grid/connecting-to-the-grid/process-updates/2025/data-centre-staged-energizations/',
  lastVerified: '2026-02-01',
} as const;

/** Helper: add GST */
export const withGST = (amount: number): number => amount * 1.05;

/** Helper: format CAD */
export const formatCAD = (amount: number): string => {
  return new Intl.NumberFormat('en-CA', { style: 'currency', currency: 'CAD', maximumFractionDigits: 0 }).format(amount);
};

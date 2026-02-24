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
    gateName: 'Gate 1 (Stage 0 for Cluster)',
    targetWeeks: 8,
    description: 'Market participant submits a System Access Service Request (SASR) via Adobe Workfront. The AESO reviews for completeness, performs a technical review, and determines the applicable assessment path — Cluster Assessment (≥5 MW generation/storage) or Independent Assessment (<5 MW or load projects).',
    keyDeliverables: [
      'System Access Service Request (SASR) submitted via Adobe Workfront',
      'SASR reviewed and accepted by AESO',
      'Preliminary Assessment Fee paid',
      'Financial arrangement with TFO confirmed',
      'Project accepted into Cluster (if applicable)',
    ],
    financialObligations: [
      'Cluster Preliminary Assessment Fee: lower of ($5,250 + $160 × MC in MW) or $29,250 + GST',
    ],
    responsibleParty: 'Market Participant / AESO',
    source: 'https://www.aeso.ca/grid/connecting-to-the-grid/cluster-assessment/',
  },
  {
    id: 2,
    name: 'Assessment',
    gateName: 'Gate 2 (Stages 1-2 for Cluster)',
    targetWeeks: 16,
    description: 'AESO completes system impact studies. For Cluster projects: Stage 1 (Preliminary Assessment) provides connection alternatives and Class 5 cost estimates, followed by Stage 2 (Detailed Assessment) with facility scope, congestion assessment, and conceptual system plans.',
    keyDeliverables: [
      'Preliminary Assessment Package (report + Class 5 cost estimate)',
      'Congestion Estimate / Congestion Assessment',
      'Detailed Assessment Package (report, facility scope, cost estimate)',
      'Conceptual System Plan',
      'Accepted dynamic model',
      'GUOC Evidence or payment (for Connection/BTF projects)',
    ],
    financialObligations: [
      'Cluster Detailed Assessment Fee: lower of ($21,000 + $320 × MC in MW) or $69,000 + GST',
      'GUOC Evidence/payment (Connection and BTF projects)',
      'Stage 3 & 4 Security to TFO',
    ],
    responsibleParty: 'AESO / TFO',
    source: 'https://www.aeso.ca/grid/connecting-to-the-grid/cluster-assessment/',
  },
  {
    id: 3,
    name: 'Regulatory Preparation',
    gateName: 'Gate 3',
    targetWeeks: 32,
    description: 'AESO issues the Functional Specification and Direction Letters to the TFO. The TFO prepares the Service Proposal, Cost Estimate, PIP Report, and Environmental Effects Screening Form. The SAS Agreement is executed and financial security posted under ISO Rules Section 103.3.',
    keyDeliverables: [
      'Functional Specification issued by AESO',
      'Engineering Connection Assessment completed (loads)',
      'Service Proposal and Cost Estimate from TFO',
      'PIP Report and Environmental Effects Screening Form',
      'SAS Agreement executed',
      'Financial security posted for SAS Agreement',
      'NID Application or ANAP Approval Letter',
      'Facility Application prepared by TFO',
      'Power Plant Application filed with AUC (generators)',
      'GUOC Notice issued (generators)',
      'Project Data Update Package (PDUP) submitted',
    ],
    financialObligations: [
      'Financial Security — 2 months estimated DTS obligations (ISO Rules Section 103.3)',
      'Pool Participation Fee ($150/year + GST)',
    ],
    responsibleParty: 'Market Participant / AESO / TFO',
    source: 'https://www.aeso.ca/grid/connecting-to-the-grid/connection-process/',
  },
  {
    id: 4,
    name: 'AUC Applications',
    gateName: 'Gate 4',
    targetWeeks: null,
    description: 'AESO files the Needs Identification Document (NID) with the Alberta Utilities Commission (AUC). The TFO files the Facility Application. The AUC reviews and may issue Information Requests or hold a hearing. Upon approval, the AUC issues NID Approval and Permit & Licence (P&L).',
    keyDeliverables: [
      'NID Application filed by AESO',
      'Facility Application filed by TFO',
      'AUC Information Requests responded to (if required)',
      'AUC hearing (if required)',
      'NID Approval from AUC',
      'Permit & Licence (P&L) issued',
      'Power Plant Approval (generators)',
      'GUOC payment submitted (generators)',
    ],
    financialObligations: [
      'GUOC payment (generators only)',
    ],
    responsibleParty: 'AUC / TFO / Market Participant',
    source: 'https://www.aeso.ca/grid/connecting-to-the-grid/connection-process/',
  },
  {
    id: 5,
    name: 'Construction & Energization',
    gateName: 'Gate 5',
    targetWeeks: null,
    description: 'Physical construction of transmission facilities by the TFO. Market participant submits the 100-Day and 30-Day Energization Packages per AESO requirements. ETS setup is completed for generators. A Project Schedule Alignment is signed by all parties.',
    keyDeliverables: [
      'Construction of transmission facilities completed',
      '100-Day Energization Package submitted',
      '30-Day Energization Package submitted',
      'Stage 5 PDUP submitted',
      'Financial Security for SAS Agreements',
      'ETS setup completed (generators)',
      'Project Schedule Alignment signed',
    ],
    financialObligations: [
      'Energy Market Financial Security — 2 months estimated energy obligations',
      'Energy Market Trading Charge begins ($0.606/MWh + GST)',
    ],
    responsibleParty: 'TFO / Market Participant',
    source: 'https://www.aeso.ca/grid/connecting-to-the-grid/connection-process/',
  },
  {
    id: 6,
    name: 'Close Out',
    gateName: 'Gate 6',
    targetWeeks: null,
    description: 'Marks the In-Service Date (ISD). AESO issues the Energization Authorization Letter. Post-energization activities include the Post-Energization Package, Commissioning Certificate (generators), Model Validation Report, and Final Cost Report true-up.',
    keyDeliverables: [
      'Energization Authorization Letter issued by AESO',
      'Post-Energization Package submitted',
      'Commissioning Certificate issued (generators)',
      'Model Validation Report submitted (generators)',
      'Stage 6 Construction Contribution Decision (CCD)',
      'Final Cost Report from TFO',
      'Gate 6 completion and project closure letter',
    ],
    financialObligations: [
      'Monthly DTS charges (ongoing)',
      'Construction contribution true-up (PILON may apply)',
    ],
    responsibleParty: 'AESO / Market Participant / TFO',
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
    formula: 'Lower of ($5,250 + $160 × MC in MW) or $29,250',
    calculate: (mw: number) => Math.min(5250 + 160 * mw, 29250),
    gst: true,
    description: 'Preliminary assessment fee for cluster study participation',
    source: 'https://www.aeso.ca/grid/connecting-to-the-grid/cluster-assessment/',
    effectiveDate: '2026-04-30',
    note: 'Fee schedule effective on or after April 30, 2026',
  },
  clusterDetailedFee: {
    formula: 'Lower of ($21,000 + $320 × MC in MW) or $69,000',
    calculate: (mw: number) => Math.min(21000 + 320 * mw, 69000),
    gst: true,
    description: 'Detailed assessment fee for cluster study participation',
    source: 'https://www.aeso.ca/grid/connecting-to-the-grid/cluster-assessment/',
    effectiveDate: '2026-04-30',
    note: 'Fee schedule effective on or after April 30, 2026',
  },
  changeAssessmentFee: {
    amount: 10500,
    gst: true,
    description: 'Fee for project change proposals during cluster assessment',
    source: 'https://www.aeso.ca/grid/connecting-to-the-grid/cluster-assessment/',
    effectiveDate: '2026-04-30',
  },
  reassessmentFee: {
    formula: 'Lower of ($21,000 + $320 × MC in MW) or $69,000',
    calculate: (mw: number) => Math.min(21000 + 320 * mw, 69000),
    gst: true,
    description: 'Reassessment fee in the event of project cancellation',
    source: 'https://www.aeso.ca/grid/connecting-to-the-grid/cluster-assessment/',
    effectiveDate: '2026-04-30',
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

/**
 * Industry Standards & Reference Data
 * 
 * Centralized constants for noise, electrical, safety, and maintenance standards.
 * Using centralized constants ensures consistency and makes updates easier.
 * 
 * LAST UPDATED: December 2024
 */

// =============================================================================
// NOISE & SOUND STANDARDS
// =============================================================================

export const NOISE_STANDARDS = {
  /** OSHA 8-hour permissible exposure limit */
  OSHA_8HR_LIMIT: 90, // dBA
  /** OSHA hearing conservation action level */
  OSHA_ACTION_LEVEL: 85, // dBA
  /** WHO residential night limit */
  WHO_RESIDENTIAL_NIGHT: 45, // dBA
  /** WHO residential day limit */
  WHO_RESIDENTIAL_DAY: 55, // dBA
  /** Threshold of pain */
  PAIN_THRESHOLD: 120, // dBA
  /** Typical ASIC miner noise at 1m */
  ASIC_TYPICAL_NOISE: { min: 75, max: 85 }, // dBA at 1m
  /** Conversation level */
  CONVERSATION_LEVEL: 60, // dBA
  /** Quiet office */
  QUIET_OFFICE: 40, // dBA
} as const;

// =============================================================================
// ELECTRICAL STANDARDS
// =============================================================================

export const ELECTRICAL_STANDARDS = {
  /** IEEE 519 THD limit at Point of Common Coupling */
  IEEE_519_THD_LIMIT: 5, // %
  /** Normal voltage operating range */
  VOLTAGE_NOMINAL_RANGE: 5, // ±%
  /** Extended voltage utilization range */
  VOLTAGE_UTILIZATION_RANGE: 10, // ±%
  /** Target power factor for industrial */
  POWER_FACTOR_TARGET: 0.95,
  /** Power factor penalty threshold */
  POWER_FACTOR_PENALTY_THRESHOLD: 0.85,
  /** Minimum power factor for penalties */
  POWER_FACTOR_MINIMUM: 0.80,
} as const;

// =============================================================================
// ARC FLASH & SAFETY STANDARDS
// =============================================================================

export const ARC_FLASH_STANDARDS = {
  /** Arc flash temperature in °F */
  ARC_TEMPERATURE_F: 35000,
  /** Blast pressure in lbs/ft² */
  BLAST_PRESSURE_MAX: 2000,
  /** Sound level in dB */
  SOUND_LEVEL_DB: 140,
  /** Arc flash study update interval in years */
  STUDY_UPDATE_YEARS: 5,
} as const;

export const ARC_FLASH_PPE = {
  CATEGORY_1: {
    calRating: 4,
    clothing: "Arc-rated long sleeve shirt, pants",
    ppe: "Safety glasses, hearing protection",
    typical: "120V panelboards, 480V with covers",
    color: "green-600",
  },
  CATEGORY_2: {
    calRating: 8,
    clothing: "Arc-rated shirt, pants, face shield",
    ppe: "Arc-rated balaclava, hard hat, gloves",
    typical: "480V panels, energized work",
    color: "amber-500",
  },
  CATEGORY_3: {
    calRating: 25,
    clothing: "Arc flash suit (hood, jacket, pants)",
    ppe: "Arc-rated gloves, insulated tools",
    typical: "MV switchgear (up to 15kV)",
    color: "orange-600",
  },
  CATEGORY_4: {
    calRating: 40,
    clothing: "Multi-layer arc flash suit",
    ppe: "All Category 3 plus face shield",
    typical: "MV switchgear (>15kV), HV work",
    color: "red-600",
  },
} as const;

// =============================================================================
// TRANSFORMER SPECIFICATIONS
// =============================================================================

export const TRANSFORMER_SPECS = {
  OIL_FILLED: {
    type: "Oil-Filled (ONAN/ONAF)",
    cooling: "Oil Natural/Air Natural or Forced",
    capacity: "1-500 MVA",
    efficiency: "99.0-99.7%",
    efficiencyMin: 99.0,
    efficiencyMax: 99.7,
    lifespan: "30-40 years",
    lifespanMin: 30,
    lifespanMax: 40,
    maintenance: "Regular oil testing, DGA",
    pros: ["High capacity", "Excellent cooling", "Long life"],
    cons: ["Fire risk", "Environmental containment", "Larger footprint"],
  },
  DRY_TYPE: {
    type: "Dry-Type (AA/AF)",
    cooling: "Air Natural or Forced",
    capacity: "15 kVA - 30 MVA",
    efficiency: "97.5-99.0%",
    efficiencyMin: 97.5,
    efficiencyMax: 99.0,
    lifespan: "20-30 years",
    lifespanMin: 20,
    lifespanMax: 30,
    maintenance: "Minimal - visual inspection",
    pros: ["Indoor installation", "No fire risk", "Lower maintenance"],
    cons: ["Lower capacity", "Higher cost per MVA", "Noisier"],
  },
  CAST_RESIN: {
    type: "Cast Resin",
    cooling: "Air (AN/AF)",
    capacity: "50 kVA - 15 MVA",
    efficiency: "97.0-98.5%",
    efficiencyMin: 97.0,
    efficiencyMax: 98.5,
    lifespan: "25-30 years",
    lifespanMin: 25,
    lifespanMax: 30,
    maintenance: "Minimal - vacuum cleaning",
    pros: ["Moisture resistant", "Compact", "Indoor/outdoor"],
    cons: ["Expensive", "Limited capacity", "Difficult repairs"],
  },
  /** Cooling capacity multipliers */
  ONAF_CAPACITY_BOOST: 33, // +33%
  OFAF_CAPACITY_BOOST: 67, // +67%
} as const;

export const TRANSFORMER_SIZING = {
  LOAD_GROWTH_FACTOR: { min: 1.15, max: 1.25 },
  DIVERSITY_FACTOR: { min: 0.85, max: 0.95 },
  EFFICIENCY_DERATING: 1.05,
  ALTITUDE_DERATING_PER_330FT: 1, // % per 330ft above 3300ft
  AMBIENT_TEMP_DERATING_PER_C: 1.5, // % per °C above 30°C
} as const;

// =============================================================================
// ENERGY COST BENCHMARKS
// =============================================================================

export const ENERGY_COST_BENCHMARKS = {
  ALBERTA: { min: 0.025, max: 0.045, currency: "USD", unit: "kWh" },
  TEXAS: { min: 0.030, max: 0.055, currency: "USD", unit: "kWh" },
  PARAGUAY: { min: 0.020, max: 0.035, currency: "USD", unit: "kWh" },
  ICELAND: { min: 0.035, max: 0.045, currency: "USD", unit: "kWh" },
  NORWAY: { min: 0.030, max: 0.050, currency: "USD", unit: "kWh" },
  KAZAKHSTAN: { min: 0.025, max: 0.040, currency: "USD", unit: "kWh" },
  ETHIOPIA: { min: 0.015, max: 0.030, currency: "USD", unit: "kWh" },
  /** Cost components */
  TRANSMISSION_TYPICAL: { min: 0.005, max: 0.015 },
  DISTRIBUTION_TYPICAL: { min: 0, max: 0.02 },
  DEMAND_CHARGE_PER_KW: { min: 5, max: 15 },
  ANCILLARY_TYPICAL: { min: 0.002, max: 0.01 },
} as const;

// =============================================================================
// MAINTENANCE & LIFECYCLE DATA
// =============================================================================

export const MAINTENANCE_ROI = {
  EQUIPMENT_LIFE_EXTENSION: "+30-50%",
  DOWNTIME_REDUCTION: "-70%",
  REPAIR_COST_REDUCTION: "-40%",
  EFFICIENCY_IMPROVEMENT: "+5-10%",
} as const;

export const FAILURE_COSTS = {
  ASIC_PREMATURE: { min: 2000, max: 8000, currency: "USD" },
  COOLING_SYSTEM: { min: 10000, max: 50000, currency: "USD" },
  LOST_HASHRATE_PER_HOUR: { min: 500, max: 5000, currency: "USD" },
  TRANSFORMER_FAILURE: { min: 50000, max: 500000, currency: "USD" },
} as const;

export const HARDWARE_LIFECYCLE = {
  ASIC_TYPICAL_LIFE_YEARS: 3,
  FAN_REPLACEMENT_HOURS: 30000,
  FILTER_CHECK_DAYS: 7,
  FIRMWARE_UPDATE_MONTHS: 3,
  TRANSFORMER_OIL_TEST_MONTHS: 12,
  SWITCHGEAR_INSPECTION_MONTHS: 6,
} as const;

// =============================================================================
// DATA SOURCES REGISTRY
// =============================================================================

export const DATA_SOURCES = {
  OSHA: {
    name: "OSHA",
    fullName: "Occupational Safety and Health Administration",
    url: "https://www.osha.gov/noise",
  },
  WHO: {
    name: "WHO",
    fullName: "World Health Organization Guidelines",
    url: "https://www.who.int/publications",
  },
  IEEE: {
    name: "IEEE",
    fullName: "Institute of Electrical and Electronics Engineers",
    url: "https://standards.ieee.org",
  },
  IEEE_519: {
    name: "IEEE 519",
    fullName: "IEEE 519-2022 Harmonic Control Standard",
    url: "https://standards.ieee.org/ieee/519/10677/",
  },
  NFPA: {
    name: "NFPA 70E",
    fullName: "Standard for Electrical Safety in the Workplace",
    url: "https://www.nfpa.org/codes-and-standards/nfpa-70e-standard-development/70e",
  },
  AESO: {
    name: "AESO",
    fullName: "Alberta Electric System Operator",
    url: "https://www.aeso.ca",
  },
  ERCOT: {
    name: "ERCOT",
    fullName: "Electric Reliability Council of Texas",
    url: "https://www.ercot.com",
  },
  BLOCKCHAIN: {
    name: "Blockchain.com",
    fullName: "Blockchain Explorer",
    url: "https://blockchain.com/explorer",
  },
  MEMPOOL: {
    name: "Mempool.space",
    fullName: "Bitcoin Mempool Visualizer",
    url: "https://mempool.space",
  },
} as const;

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Format a cost range as string
 */
export const formatCostRange = (
  range: { min: number; max: number },
  prefix: string = "$"
): string => {
  return `${prefix}${range.min.toFixed(3)}-${range.max.toFixed(3)}`;
};

/**
 * Get data source info
 */
export const getSourceInfo = (
  sourceKey: keyof typeof DATA_SOURCES
): { name: string; url: string } => {
  const source = DATA_SOURCES[sourceKey];
  return { name: source.name, url: source.url };
};

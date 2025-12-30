/**
 * Educational Constants for Mining Infrastructure Module
 * 
 * This file contains physics fundamentals, engineering principles, and educational
 * content standards for the university-grade Mining Infrastructure (Datacenters 101) module.
 * 
 * All data is sourced from IEEE, ASHRAE, NFPA standards and verified industry sources.
 * Values include explicit variability ranges and influencing factors.
 * 
 * LAST UPDATED: December 2024
 */

// =============================================================================
// PHYSICS FUNDAMENTALS
// =============================================================================

/**
 * Thermodynamics Constants
 * Based on first law of thermodynamics: Energy cannot be created or destroyed
 */
export const THERMODYNAMICS = {
  /** Every watt of electrical power becomes heat (1 Watt = 3.412 BTU/hr) */
  WATTS_TO_BTU_HR: 3.412,
  
  /** Joules per watt-second (1 W = 1 J/s) */
  JOULES_PER_WATT_SECOND: 1,
  
  /** kW to tons of cooling (1 kW ≈ 0.2843 tons) */
  KW_TO_TONS_COOLING: 0.2843,
  
  /** BTU per ton-hour of cooling */
  BTU_PER_TON_HOUR: 12000,
  
  /** Water specific heat (BTU/lb/°F) */
  WATER_SPECIFIC_HEAT: 1.0,
  
  /** Air specific heat at constant pressure (BTU/lb/°F) */
  AIR_SPECIFIC_HEAT: 0.24,
  
  /** Air density at sea level, 70°F (lb/ft³) */
  AIR_DENSITY_STANDARD: 0.075,
} as const;

/**
 * Heat Transfer Principles
 * Three modes of heat transfer explained with practical relevance
 */
export const HEAT_TRANSFER_MODES = {
  CONDUCTION: {
    name: 'Conduction',
    equation: 'Q = k × A × ΔT / d',
    explanation: 'Heat flows through solid materials from hot to cold. In mining, this is how heat moves from the chip die through thermal interface material to the heatsink.',
    relevance: 'Critical for ASIC chip cooling - thermal interface materials and heatsink design',
    example: 'Heat flowing from a 90°C chip through copper heatsink to ambient air',
  },
  CONVECTION: {
    name: 'Convection',
    equation: 'Q = h × A × (T_surface - T_fluid)',
    explanation: 'Heat transfer between a solid surface and a moving fluid (air or liquid). This is the primary cooling mechanism in datacenter environments.',
    relevance: 'Primary mechanism for air and liquid cooling systems',
    example: 'Cold air flowing across miner heatsinks, absorbing heat',
  },
  RADIATION: {
    name: 'Radiation',
    equation: 'Q = ε × σ × A × (T₁⁴ - T₂⁴)',
    explanation: 'Heat transfer via electromagnetic waves. In datacenters, this is minimal compared to convection but still occurs between surfaces.',
    relevance: 'Minor role in datacenters, but relevant for outdoor equipment exposed to sun',
    example: 'Heat radiating from hot exhaust air to cooler room surfaces',
  },
} as const;

/**
 * Electrical Engineering Fundamentals
 */
export const ELECTRICAL_FUNDAMENTALS = {
  /** Ohm's Law relationships */
  OHMS_LAW: {
    equation: 'V = I × R',
    variants: {
      voltage: 'V = I × R',
      current: 'I = V / R',
      resistance: 'R = V / I',
    },
    explanation: 'Fundamental relationship between voltage, current, and resistance. Higher resistance means more power loss in conductors.',
  },
  
  /** Power calculations */
  POWER_EQUATIONS: {
    dc: 'P = V × I',
    ac_single_phase: 'P = V × I × PF',
    ac_three_phase: 'P = √3 × V × I × PF',
    resistive_loss: 'P_loss = I² × R',
    explanation: 'Power loss in conductors is proportional to current squared. This is why transmission uses high voltage (lower current) to minimize losses.',
  },
  
  /** Why high voltage reduces transmission losses */
  TRANSMISSION_LOSS_PRINCIPLE: {
    principle: 'P = I²R losses decrease as voltage increases (for same power)',
    example: 'Transmitting 100 MW at 138kV vs 480V: At 138kV, current is 418A. At 480V, current would be 120,281A. Power loss ∝ I², so losses at 480V would be ~83,000× higher.',
    conclusion: 'This is why grid transmission uses high voltages (138kV-500kV) and why facilities step down voltage in stages.',
  },
  
  /** Power factor explanation */
  POWER_FACTOR: {
    definition: 'Ratio of real power (kW) to apparent power (kVA). PF = kW / kVA',
    range: { min: 0, max: 1 },
    typical_mining: { min: 0.95, max: 0.99 },
    impact: 'Low power factor means utility delivers more current for same real power. Many utilities charge penalties for PF below 0.90.',
    correction: 'Capacitor banks can correct poor power factor caused by inductive loads.',
  },
} as const;

/**
 * Fluid Dynamics Fundamentals (for airflow calculations)
 */
export const FLUID_DYNAMICS = {
  /** CFM calculation from thermal load */
  CFM_CALCULATION: {
    equation: 'CFM = (BTU/hr) / (1.08 × ΔT)',
    explanation: 'Required airflow in cubic feet per minute based on heat load and temperature rise.',
    example: 'For 3,500W miner with 30°F ΔT: (3,500 × 3.412) / (1.08 × 30) = 368 CFM',
    typical_per_miner: { min: 250, max: 400, unit: 'CFM' },
  },
  
  /** Static pressure and fan curves */
  STATIC_PRESSURE: {
    definition: 'Resistance to airflow in the system, measured in inches water column (in. WC)',
    typical_datacenter: { min: 0.3, max: 0.8, unit: 'in. WC' },
    factors: ['Filters', 'Containment doors', 'Ductwork', 'Equipment density'],
    explanation: 'Higher static pressure requires fans with greater pressure capability, not just higher CFM rating.',
  },
  
  /** Reynolds number for turbulent vs laminar flow */
  REYNOLDS_NUMBER: {
    equation: 'Re = (ρ × v × D) / μ',
    turbulent_threshold: 4000,
    laminar_threshold: 2300,
    explanation: 'Determines whether flow is laminar (smooth) or turbulent (chaotic). Datacenter airflow is almost always turbulent (Re > 4000).',
    relevance: 'Turbulent flow provides better heat transfer but higher pressure drop.',
  },
} as const;

// =============================================================================
// ASHRAE THERMAL GUIDELINES
// =============================================================================

/**
 * ASHRAE Thermal Guidelines for Data Processing Equipment
 * Reference: ASHRAE TC 9.9 (2021 edition)
 */
export const ASHRAE_THERMAL_CLASSES = {
  A1: {
    name: 'Class A1',
    description: 'Tightly controlled environment, typically for mission-critical IT',
    dry_bulb_temp: { min: 15, max: 32, unit: '°C' },
    dew_point: { max: 17, unit: '°C' },
    relative_humidity: { min: 8, max: 80, unit: '%' },
    typical_use: 'Enterprise datacenters, cloud providers',
    relevance_to_mining: 'Not typically required - mining can tolerate wider ranges',
  },
  A2: {
    name: 'Class A2',
    description: 'Some environmental control with modest excursions',
    dry_bulb_temp: { min: 10, max: 35, unit: '°C' },
    dew_point: { max: 21, unit: '°C' },
    relative_humidity: { min: 8, max: 80, unit: '%' },
    typical_use: 'Office buildings, light industrial',
    relevance_to_mining: 'Common for air-cooled mining in moderate climates',
  },
  A3: {
    name: 'Class A3',
    description: 'Allowable envelope for certain equipment with higher temp tolerance',
    dry_bulb_temp: { min: 5, max: 40, unit: '°C' },
    dew_point: { max: 24, unit: '°C' },
    relative_humidity: { min: 8, max: 85, unit: '%' },
    typical_use: 'Industrial environments, mining operations',
    relevance_to_mining: 'Typical for air-cooled mining in hot climates',
  },
  A4: {
    name: 'Class A4',
    description: 'Widest allowable envelope for hardened equipment',
    dry_bulb_temp: { min: 5, max: 45, unit: '°C' },
    dew_point: { max: 24, unit: '°C' },
    relative_humidity: { min: 8, max: 90, unit: '%' },
    typical_use: 'Extreme environments, specialized equipment',
    relevance_to_mining: 'ASIC miners can operate here but lifespan may be reduced',
  },
} as const;

// =============================================================================
// VARIABILITY DISCLAIMERS & DATA QUALITY
// =============================================================================

/**
 * Standard disclaimer templates for different data types
 */
export const DISCLAIMERS = {
  COST_ESTIMATE: {
    severity: 'caution',
    template: 'Cost estimates vary significantly based on location, labor markets, material costs, vendor relationships, and market conditions. Figures shown represent industry ranges as of December 2024.',
    factors: ['Geographic location', 'Labor rates', 'Material availability', 'Vendor relationships', 'Market timing', 'Currency fluctuations'],
  },
  
  TIMELINE_ESTIMATE: {
    severity: 'informational',
    template: 'Project timelines depend on permitting jurisdictions, utility interconnection queues, weather conditions, and supply chain factors. Actual timelines may vary significantly.',
    factors: ['Permitting jurisdiction', 'Utility policies', 'Weather conditions', 'Supply chain delays', 'Regulatory changes'],
  },
  
  PERFORMANCE_METRIC: {
    severity: 'informational',
    template: 'Performance metrics are based on manufacturer specifications and industry benchmarks. Actual results depend on operating conditions, maintenance practices, and equipment age.',
    factors: ['Operating temperature', 'Altitude', 'Humidity', 'Maintenance quality', 'Equipment age', 'Firmware version'],
  },
  
  BITCOIN_ECONOMICS: {
    severity: 'critical',
    template: 'Bitcoin mining economics change rapidly due to price volatility, network difficulty adjustments, and halving events. Historical data is not indicative of future results.',
    factors: ['BTC price', 'Network hashrate', 'Difficulty adjustments', 'Transaction fees', 'Halving events', 'Energy costs'],
  },
  
  REGIONAL_VARIATION: {
    severity: 'caution',
    template: 'Values shown represent typical ranges. Actual values vary by region, climate, utility provider, and local regulations.',
    factors: ['Climate zone', 'Utility provider', 'Local codes', 'Labor availability', 'Supply chain proximity'],
  },
} as const;

/**
 * Data quality levels for transparency
 */
export const DATA_QUALITY_LEVELS = {
  VERIFIED: {
    level: 'verified',
    label: 'Verified Data',
    description: 'Data from IEEE, ASHRAE, NFPA standards or manufacturer specifications',
    color: 'emerald',
  },
  INDUSTRY_ESTIMATE: {
    level: 'estimate',
    label: 'Industry Estimate',
    description: 'Aggregated from multiple industry sources; actual values may vary',
    color: 'amber',
  },
  EDUCATIONAL_EXAMPLE: {
    level: 'example',
    label: 'Educational Example',
    description: 'Simplified for educational purposes; not for actual design decisions',
    color: 'blue',
  },
  VARIABLE: {
    level: 'variable',
    label: 'Highly Variable',
    description: 'Significant variation by region, vendor, or market conditions',
    color: 'orange',
  },
} as const;

// =============================================================================
// CITATION REFERENCES
// =============================================================================

/**
 * Standard references for technical content
 */
export const STANDARD_REFERENCES = {
  ASHRAE: {
    name: 'ASHRAE',
    full_name: 'American Society of Heating, Refrigerating and Air-Conditioning Engineers',
    relevant_standards: ['ASHRAE TC 9.9', 'ASHRAE Guideline 36', 'ASHRAE 90.1'],
    url: 'https://www.ashrae.org',
  },
  IEEE: {
    name: 'IEEE',
    full_name: 'Institute of Electrical and Electronics Engineers',
    relevant_standards: ['IEEE 80 (Grounding)', 'IEEE 1584 (Arc Flash)', 'IEEE C57 (Transformers)'],
    url: 'https://www.ieee.org',
  },
  NFPA: {
    name: 'NFPA',
    full_name: 'National Fire Protection Association',
    relevant_standards: ['NFPA 70 (NEC)', 'NFPA 70E (Electrical Safety)', 'NFPA 855 (Energy Storage)'],
    url: 'https://www.nfpa.org',
  },
  UPTIME_INSTITUTE: {
    name: 'Uptime Institute',
    full_name: 'Uptime Institute LLC',
    relevant_standards: ['Tier Classification', 'PUE Measurement'],
    url: 'https://uptimeinstitute.com',
  },
} as const;

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Calculate CFM required for a given heat load
 * @param watts - Heat load in watts
 * @param deltaT - Temperature rise in °F (default 30°F)
 * @returns Required CFM
 */
export const calculateRequiredCFM = (watts: number, deltaT: number = 30): number => {
  const btuPerHour = watts * THERMODYNAMICS.WATTS_TO_BTU_HR;
  return btuPerHour / (1.08 * deltaT);
};

/**
 * Calculate cooling tons required
 * @param kw - IT load in kW
 * @returns Cooling capacity in tons
 */
export const calculateCoolingTons = (kw: number): number => {
  return kw * THERMODYNAMICS.KW_TO_TONS_COOLING;
};

/**
 * Calculate water flow rate for liquid cooling
 * @param kw - Heat load in kW
 * @param deltaT - Temperature rise in °F (default 10°F)
 * @returns Required GPM (gallons per minute)
 */
export const calculateGPM = (kw: number, deltaT: number = 10): number => {
  const btuPerHour = kw * 1000 * THERMODYNAMICS.WATTS_TO_BTU_HR;
  // GPM = BTU/hr / (500 × ΔT) where 500 = 60 min × 8.33 lb/gal × 1 BTU/lb/°F
  return btuPerHour / (500 * deltaT);
};

/**
 * Calculate transmission line losses
 * @param power_mw - Power in MW
 * @param voltage_kv - Voltage in kV
 * @param resistance_ohms_per_km - Line resistance per km
 * @param distance_km - Line length in km
 * @returns Power loss percentage
 */
export const calculateTransmissionLoss = (
  power_mw: number,
  voltage_kv: number,
  resistance_ohms_per_km: number,
  distance_km: number
): number => {
  // P = I²R, I = P / (√3 × V) for 3-phase
  const current_a = (power_mw * 1000000) / (Math.sqrt(3) * voltage_kv * 1000);
  const total_resistance = resistance_ohms_per_km * distance_km;
  const loss_watts = Math.pow(current_a, 2) * total_resistance * 3; // 3 phases
  const loss_percentage = (loss_watts / (power_mw * 1000000)) * 100;
  return loss_percentage;
};

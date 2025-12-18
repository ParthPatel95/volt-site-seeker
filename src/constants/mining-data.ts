/**
 * Centralized Mining Data Constants
 * 
 * This file contains frequently-changing mining metrics that should be
 * updated periodically. Using centralized constants ensures consistency
 * across the platform and makes updates easier.
 * 
 * LAST UPDATED: December 2024
 * 
 * Data Sources:
 * - BTC Price: Real-time market data
 * - Network Hashrate: blockchain.com, mempool.space
 * - Difficulty: btc.com, blockchain.com
 * - Block Reward: Bitcoin protocol (halving schedule)
 */

// =============================================================================
// BITCOIN NETWORK DATA
// =============================================================================

/**
 * Current Bitcoin price estimate for calculations
 * Note: This is for educational estimates only. Use real-time data for actual decisions.
 */
export const CURRENT_BTC_PRICE = 100000; // USD

/**
 * Network hashrate in EH/s (Exahashes per second)
 * As of December 2024, network hashrate is approximately 700-800 EH/s
 */
export const NETWORK_HASHRATE_EH = 750; // EH/s

/**
 * Current mining difficulty
 * Difficulty adjusts every 2016 blocks (~2 weeks)
 */
export const CURRENT_DIFFICULTY_T = 109; // Trillion

/**
 * Block reward after 2024 halving
 */
export const BLOCK_REWARD_BTC = 3.125;

/**
 * Blocks per day (average)
 */
export const BLOCKS_PER_DAY = 144;

/**
 * Total BTC mined per day
 */
export const BTC_PER_DAY = BLOCKS_PER_DAY * BLOCK_REWARD_BTC; // 450 BTC

// =============================================================================
// PUE (Power Usage Effectiveness) STANDARDS
// =============================================================================

/**
 * Standardized PUE ranges across all cooling methods
 * PUE = Total Facility Power / IT Equipment Power
 * 
 * Lower is better. PUE of 1.0 would mean 100% efficiency (impossible in practice)
 */
export const PUE_RANGES = {
  /** Air-cooled systems (hot/cold aisle containment) */
  AIR_COOLED: {
    min: 1.15,
    max: 1.40,
    typical: 1.25,
    description: 'Air-cooled with hot/cold aisle containment',
    notes: 'Can achieve 1.15 in cold climates like Alberta with free cooling',
  },
  
  /** Hydro-cooled / Rear-Door Heat Exchanger (RDHX) systems */
  HYDRO_COOLED: {
    min: 1.15,
    max: 1.35,
    typical: 1.20,
    description: 'Water-cooled with RDHX or direct liquid cooling',
    notes: 'Chiller adds load; cooling towers can help reduce PUE',
  },
  
  /** Single-phase immersion cooling */
  IMMERSION_SINGLE_PHASE: {
    min: 1.02,
    max: 1.08,
    typical: 1.03,
    description: 'Single-phase immersion cooling',
    notes: 'Near-perfect efficiency, fluid stays liquid',
  },
  
  /** Two-phase immersion cooling */
  IMMERSION_TWO_PHASE: {
    min: 1.01,
    max: 1.03,
    typical: 1.02,
    description: 'Two-phase immersion cooling',
    notes: 'Highest efficiency, more complex systems',
  },
} as const;

/**
 * Get formatted PUE range string
 */
export const formatPueRange = (type: keyof typeof PUE_RANGES): string => {
  const pue = PUE_RANGES[type];
  return `${pue.min.toFixed(2)} - ${pue.max.toFixed(2)}`;
};

// =============================================================================
// ASIC MINER SPECIFICATIONS
// =============================================================================

/**
 * Common ASIC miner specifications for calculations
 * Based on current-generation miners as of December 2024
 */
export const ASIC_SPECS = {
  /** Bitmain Antminer S21 */
  S21: {
    name: 'Antminer S21',
    hashrate: 200, // TH/s
    power: 3500, // Watts
    efficiency: 17.5, // J/TH
  },
  
  /** Bitmain Antminer S21 Pro */
  S21_PRO: {
    name: 'Antminer S21 Pro',
    hashrate: 234, // TH/s
    power: 3531, // Watts
    efficiency: 15.1, // J/TH
  },
  
  /** Bitmain Antminer S21 XP (Hydro) */
  S21_XP_HYDRO: {
    name: 'Antminer S21 XP Hydro',
    hashrate: 473, // TH/s
    power: 5676, // Watts
    efficiency: 12.0, // J/TH
  },
  
  /** MicroBT Whatsminer M60S */
  M60S: {
    name: 'Whatsminer M60S',
    hashrate: 186, // TH/s
    power: 3422, // Watts
    efficiency: 18.4, // J/TH
  },
  
  /** MicroBT Whatsminer M66S */
  M66S: {
    name: 'Whatsminer M66S',
    hashrate: 298, // TH/s
    power: 5348, // Watts
    efficiency: 17.9, // J/TH
  },
} as const;

// =============================================================================
// DISCLAIMER TEXT
// =============================================================================

export const DATA_DISCLAIMER = {
  short: 'Data as of December 2024. For real-time data, consult blockchain explorers.',
  
  full: `The data presented is for educational purposes only and represents estimates 
as of December 2024. Bitcoin mining economics change frequently due to price volatility, 
network difficulty adjustments, and hardware evolution. Always verify current data 
from reliable sources before making investment decisions.`,

  sources: [
    { name: 'Blockchain.com', url: 'https://blockchain.com/explorer' },
    { name: 'Mempool.space', url: 'https://mempool.space' },
    { name: 'BTC.com', url: 'https://btc.com/stats/diff' },
  ],
};

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Calculate daily BTC revenue for a given hashrate
 * @param hashrateTh - Hashrate in TH/s
 * @returns Daily BTC revenue estimate
 */
export const calculateDailyBtc = (hashrateTh: number): number => {
  const networkHashrateTh = NETWORK_HASHRATE_EH * 1e6; // Convert EH to TH
  return (hashrateTh / networkHashrateTh) * BTC_PER_DAY;
};

/**
 * Calculate daily USD revenue for a given hashrate
 * @param hashrateTh - Hashrate in TH/s
 * @param btcPrice - Optional BTC price (defaults to CURRENT_BTC_PRICE)
 * @returns Daily USD revenue estimate
 */
export const calculateDailyRevenue = (
  hashrateTh: number,
  btcPrice: number = CURRENT_BTC_PRICE
): number => {
  return calculateDailyBtc(hashrateTh) * btcPrice;
};

/**
 * Calculate effective power consumption with PUE
 * @param itPower - IT equipment power in kW
 * @param pue - Power Usage Effectiveness
 * @returns Total facility power in kW
 */
export const calculateTotalPower = (itPower: number, pue: number): number => {
  return itPower * pue;
};

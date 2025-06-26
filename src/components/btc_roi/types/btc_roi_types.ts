export interface BTCNetworkData {
  price: number;
  difficulty: number;
  hashrate: number; // in H/s
  blockReward: number;
  avgBlockTime: number; // in minutes
  nextHalvingDays: number;
  lastUpdate: Date;
}

export interface BTCROIFormData {
  asicModel: string;
  hashrate: number; // TH/s
  powerDraw: number; // Watts
  units: number;
  hardwareCost: number; // USD per unit
  hostingRate: number; // USD per kWh (hosting mode)
  powerRate: number; // USD per kWh (self mode)
  hostingFee: number; // USD per month per unit
  poolFee: number; // percentage
  coolingOverhead: number; // percentage
  efficiencyOverride: number; // percentage
  resaleValue: number; // percentage
  maintenancePercent: number; // percentage
  
  // New hosting-specific fields
  hostingFeeRate: number; // USD per kWh charged to clients
  region: 'ERCOT' | 'AESO' | 'Other';
  customElectricityCost: number; // USD per kWh for Other region
  totalLoadKW: number; // Total facility load in kW
  infrastructureCost: number; // Initial CapEx investment
  monthlyOverhead: number; // Fixed monthly operational costs
  powerOverheadPercent: number; // Additional power for cooling/infrastructure
  expectedUptimePercent: number; // Expected uptime percentage
}

export interface BTCROIResults {
  dailyBTCMined: number;
  dailyRevenue: number;
  dailyPowerCost: number;
  dailyPoolFees: number;
  dailyNetProfit: number;
  monthlyRevenue: number;
  monthlyPowerCost: number;
  monthlyPoolFees: number;
  monthlyNetProfit: number;
  yearlyRevenue: number;
  yearlyPowerCost: number;
  yearlyPoolFees: number;
  yearlyNetProfit: number;
  breakEvenDays: number;
  roi12Month: number;
  totalInvestment: number;
}

export interface HostingROIResults {
  totalEnergyUsageKWh: number;
  totalHostingRevenue: number;
  totalElectricityCost: number;
  totalOperationalCost: number;
  grossProfit: number;
  netProfit: number;
  roi12Month: number;
  paybackPeriodYears: number;
  profitMarginPercent: number;
  averageUptimePercent: number;
  curtailedHours: number;
  averageElectricityCost: number; // per kWh
  energyRateBreakdown?: EnergyRateBreakdown;
}

export interface EnergyRateBreakdown {
  region: string;
  totalHours: number;
  operatingHours: number;
  curtailedHours: number;
  averageWholesalePrice: number;
  minWholesalePrice: number;
  maxWholesalePrice: number;
  currencyNote: string;
  curtailmentThreshold: number;
  curtailmentReason: string;
}

export interface RegionalEnergyData {
  region: 'ERCOT' | 'AESO';
  hourlyPrices: HourlyPrice[];
  averagePrice: number; // USD per MWh
  peakPrice: number;
  offPeakPrice: number;
  lastUpdated: Date;
}

export interface HourlyPrice {
  timestamp: Date;
  pricePerMWh: number;
  pricePerKWh: number;
}

export interface ASICModel {
  model: string;
  hashrate: number; // TH/s
  powerDraw: number; // Watts
  price: number; // USD
  efficiency: number; // W/TH
  manufacturer: string;
  releaseDate: string;
  profitabilityRank: number;
}

export interface SensitivityData {
  scenario: string;
  btcPriceChange: number; // percentage
  difficultyChange: number; // percentage
  dailyProfit: number;
  monthlyProfit: number;
  yearlyProfit: number;
  roi12Month: number;
}

export interface HeatmapDataPoint {
  btcPrice: number;
  powerRate: number;
  roi: number;
  dailyProfit: number;
}

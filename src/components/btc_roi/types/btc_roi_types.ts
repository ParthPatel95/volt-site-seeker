
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
  
  // Manual energy cost overrides
  useManualEnergyCosts: boolean;
  manualEnergyRate: number; // USD per kWh - wholesale energy
  manualTransmissionRate: number; // USD per kWh
  manualDistributionRate: number; // USD per kWh
  manualAncillaryRate: number; // USD per kWh
  manualRegulatoryRate: number; // USD per kWh
  
  // Site naming
  siteName?: string; // Optional site name
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
  // Enhanced analytics
  monthlyBreakdown: MonthlyBreakdown[];
  costAnalytics: CostAnalytics;
  competitiveAnalysis: CompetitiveAnalysis;
  taxAnalysis: TaxAnalysis;
}

// New interface for stored calculations
export interface StoredCalculation {
  id: string;
  siteName: string;
  calculationType: 'hosting' | 'self';
  formData: BTCROIFormData;
  networkData: BTCNetworkData;
  results: HostingROIResults | BTCROIResults;
  timestamp: Date;
  notes?: string;
}

export interface MonthlyBreakdown {
  month: number;
  energyUsageKWh: number;
  hostingRevenue: number;
  electricityCost: number;
  operationalCost: number;
  taxes: number;
  netProfit: number;
  uptimePercent: number;
  averageElectricityRate: number;
}

export interface CostAnalytics {
  energyCostPercentage: number;
  operationalCostPercentage: number;
  taxPercentage: number;
  profitPercentage: number;
  breakEvenHostingRate: number;
  marginOfSafety: number;
  sensitivityAnalysis: {
    energyCostImpact: number; // % change in profit per 1% change in energy cost
    hostingRateImpact: number; // % change in profit per 1% change in hosting rate
    uptimeImpact: number; // % change in profit per 1% change in uptime
  };
}

export interface CompetitiveAnalysis {
  marketHostingRates: {
    low: number;
    average: number;
    high: number;
  };
  competitivePosition: 'below_market' | 'at_market' | 'above_market';
  recommendedRate: number;
  profitAdvantage: number; // % advantage over average market rate
}

export interface TaxAnalysis {
  totalAnnualTaxes: number;
  salesTax: number;
  utilityTax: number;
  environmentalFees: number;
  taxRate: number; // effective tax rate as percentage
  taxSavingsOpportunities: string[];
  deductibleExpenses: number;
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
  detailedRateComponents?: {
    energyRate: number;
    transmissionRate: number;
    distributionRate: number;
    ancillaryServicesRate: number;
    regulatoryFeesRate: number;
    totalRate: number;
    breakdown: {
      energy: string;
      transmission: string;
      distribution: string;
      ancillaryServices: string;
      regulatoryFees: string;
    };
  };
  taxBreakdown?: {
    salesTaxRate: number;
    utilityTaxRate: number;
    environmentalFeeRate: number;
    totalTaxRate: number;
    taxableAmount: number;
    totalTaxes: number;
  };
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

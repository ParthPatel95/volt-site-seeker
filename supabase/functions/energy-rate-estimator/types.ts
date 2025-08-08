
export interface EnergyRateInput {
  latitude: number;
  longitude: number;
  contractedLoadMW: number;
  currency: 'CAD' | 'USD';
  customerClass: 'Industrial' | 'Commercial';
  retailAdder?: number;
}

export interface Territory {
  utility: string;
  market: string;
  region: string;
  country: string;
  province?: string;
  state?: string;
}

export interface MarketData {
  month: string;
  marketPrice: number;
}

export interface TariffData {
  transmission: number;
  distribution: number;
  riders: number;
  demandCharge: number;
}

export interface MonthlyData {
  month: string;
  // Energy component breakdown (all values in ¢/kWh unless noted otherwise)
  energyPrice: number; // Energy component including retail adder (¢/kWh)
  transmissionDistribution: number; // Legacy combined T&D (¢/kWh)
  riders: number; // Riders and ancillaries (¢/kWh)
  tax: number; // Taxes (¢/kWh)
  total: number; // All-in total (¢/kWh)
  totalMWh: number; // All-in total ($/MWh)
  // New detailed fields for transparent breakdown
  wholesaleEnergy?: number; // Wholesale market energy only (¢/kWh)
  retailAdder?: number; // Retail adder applied (¢/kWh)
  transmission?: number; // Transmission charges (¢/kWh)
  distribution?: number; // Distribution/volumetric delivery (¢/kWh)
  demandCharge?: number; // Demand charge allocated (¢/kWh)
}



export interface EnergyRateResults {
  monthlyData: MonthlyData[];
  averageAllInPrice: {
    centsPerKWh: number;
    dollarsPerMWh: number;
  };
  territory: Territory;
  dataSourceUrls: string[];
  calculationDate: string;
  currency: string;
  forecasts?: {
    threeYear: MonthlyData[]; // 36 months forward
    fiveYear: MonthlyData[];  // 60 months forward
    methodology: string;
    dataSourceUrls: string[];
  };
}


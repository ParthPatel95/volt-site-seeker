
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
  energyPrice: number;
  transmissionDistribution: number;
  riders: number;
  tax: number;
  total: number;
  totalMWh: number;
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
}

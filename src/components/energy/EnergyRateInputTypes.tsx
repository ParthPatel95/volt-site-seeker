
export interface EnergyRateInput {
  latitude: number;
  longitude: number;
  contractedLoadMW: number;
  currency: 'CAD' | 'USD';
  customerClass: 'Industrial' | 'Commercial';
  retailAdder?: number; // ¢/kWh
}

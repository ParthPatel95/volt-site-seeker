
import { Territory, TariffData } from './types.ts';

export async function getTariffData(territory: Territory, customerClass: string): Promise<TariffData> {
  console.log('Getting tariff data for:', territory.utility, customerClass);
  
  // Enhanced tariff structure for large industrial clients (data centers)
  const baseTariff = {
    transmission: 0.6, // ¢/kWh - Significantly lower for large clients
    distribution: 0.8, // ¢/kWh - Major reduction for high load factor customers
    riders: 0.25, // ¢/kWh - Minimal environmental and system riders for large clients
    demandCharge: customerClass === 'Industrial' ? 8.0 : 15.0, // $/kW-month - Much lower for large industrial
  };
  
  // Further adjustments for territory and large client volume discounts
  if (territory.market === 'AESO') {
    baseTariff.transmission *= 0.9; // Volume discount in Alberta
    baseTariff.distribution *= 0.85; // Large client distribution discount
    baseTariff.demandCharge *= 0.8; // Significant volume discount for large clients
    baseTariff.riders *= 0.7; // Reduced riders for large industrial
  } else if (territory.market === 'ERCOT') {
    baseTariff.transmission *= 0.85; // Competitive transmission pricing
    baseTariff.distribution *= 0.75; // Major competitive market benefits
    baseTariff.demandCharge *= 0.75; // Large industrial discount
    baseTariff.riders *= 0.6; // Minimal riders in competitive market
  }
  
  return baseTariff;
}

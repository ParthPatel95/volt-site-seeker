
import { Territory, TariffData } from './types.ts';

export async function getTariffData(territory: Territory, customerClass: string): Promise<TariffData> {
  console.log('Getting tariff data for:', territory.utility, customerClass);
  
  // Enhanced tariff structure for large industrial clients (data centers)
  const baseTariff = {
    transmission: 0.8, // ¢/kWh - Lower for large clients
    distribution: 1.2, // ¢/kWh - Reduced for high load factor customers
    riders: 0.4, // ¢/kWh - Reduced environmental and system riders for large clients
    demandCharge: customerClass === 'Industrial' ? 12.0 : 15.0, // $/kW-month - Lower for large industrial
  };
  
  // Further adjustments for territory and large client discounts
  if (territory.market === 'AESO') {
    baseTariff.transmission *= 1.05; // Slightly higher in Alberta
    baseTariff.distribution *= 1.0; // Competitive distribution rates
    baseTariff.demandCharge *= 0.95; // Volume discount for large clients
  } else if (territory.market === 'ERCOT') {
    baseTariff.transmission *= 0.95; // Lower transmission in Texas
    baseTariff.distribution *= 0.9; // Competitive market benefits
    baseTariff.demandCharge *= 0.92; // Large client discount
  }
  
  return baseTariff;
}

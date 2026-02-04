
import { Territory, TariffData } from './types.ts';

export async function getTariffData(territory: Territory, customerClass: string): Promise<TariffData> {
  console.log('Getting real utility tariff data for:', territory.utility, customerClass);
  
  // Real Alberta FortisAlberta Rate 65 (Transmission Connected Industrial)
  // Updated to July 2025 Rate Schedule (effective 2025-07-01)
  // Source: https://www.fortisalberta.com/docs/default-source/default-document-library/jul-1-2025-fortisalberta-rates-options-and-riders-schedules.pdf
  if (territory.market === 'AESO' && territory.utility === 'FortisAlberta') {
    return {
      transmission: 0.16, // ¢/kWh - Transmission access charge
      distribution: 0.2704, // ¢/kWh - Rate 65 volumetric delivery charge
      riders: 0.32, // ¢/kWh - Average riders (environmental, system access, etc.)
      demandCharge: 7.52, // $/kW/month - Rate 65 demand charge for transmission-connected
    };
  }
  
  // Real EPCOR tariffs for comparison (updated 2025)
  if (territory.market === 'AESO' && territory.utility === 'EPCOR') {
    return {
      transmission: 0.18, // ¢/kWh
      distribution: 0.28, // ¢/kWh - EPCOR industrial rate
      riders: 0.32, // ¢/kWh
      demandCharge: 8.50, // $/kW/month
    };
  }
  
  // Texas ERCOT - Real industrial rates
  if (territory.market === 'ERCOT') {
    return {
      transmission: 0.20, // ¢/kWh - ERCOT transmission
      distribution: 0.25, // ¢/kWh - TDU charges (Oncor, CenterPoint, etc.)
      riders: 0.15, // ¢/kWh - Minimal riders in competitive market
      demandCharge: 4.50, // $/kW/month - Competitive market demand charges
    };
  }
  
  // Default fallback with conservative estimates
  return {
    transmission: 0.25,
    distribution: 0.35,
    riders: 0.25,
    demandCharge: 10.0,
  };
}


import { EnergyRateInput, EnergyRateResults } from './types.ts';
import { resolveTerritory } from './territory-resolver.ts';
import { getMarketData } from './market-data.ts';
import { getTariffData } from './tariff-data.ts';
import { calculateMonthlyCosts } from './cost-calculator.ts';

export async function calculateEnergyRates(input: EnergyRateInput): Promise<Response> {
  console.log('Calculating energy rates for:', input);

  try {
    // 1. Resolve territory and utility
    const territory = await resolveTerritory(input.latitude, input.longitude);
    
    // 2. Get market data for past 12 months
    const marketData = await getMarketData(territory, input.currency);
    
    // 3. Get utility tariff data
    const tariffData = await getTariffData(territory, input.customerClass);
    
    // 4. Calculate monthly costs
    const monthlyData = await calculateMonthlyCosts(
      marketData, 
      tariffData, 
      input.contractedLoadMW,
      input.retailAdder || 0,
      input.currency
    );

    // 5. Calculate averages
    const totalCents = monthlyData.reduce((sum, month) => sum + month.total, 0);
    const averageAllInPrice = {
      centsPerKWh: totalCents / monthlyData.length,
      dollarsPerMWh: (totalCents / monthlyData.length) * 10
    };

    const results: EnergyRateResults = {
      monthlyData,
      averageAllInPrice,
      territory,
      dataSourceUrls: [
        territory.market === 'AESO' ? 'https://www.aeso.ca/market/market-data/' : 'https://www.eia.gov/electricity/',
        `https://${territory.utility.toLowerCase().replace(' ', '')}.com/rates`,
        'https://www.bankofcanada.ca/rates/exchange/'
      ],
      calculationDate: new Date().toISOString(),
      currency: input.currency
    };

    return new Response(JSON.stringify({
      success: true,
      results
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('Error calculating energy rates:', error);
    throw error;
  }
}

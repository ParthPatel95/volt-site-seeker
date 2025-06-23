
import { EnergyRateInput, EnergyRateResults } from './types.ts';
import { resolveTerritory } from './territory-resolver.ts';
import { getMarketData } from './market-data.ts';
import { getTariffData } from './tariff-data.ts';
import { calculateMonthlyCosts } from './cost-calculator.ts';

export async function calculateEnergyRates(input: EnergyRateInput): Promise<Response> {
  console.log('Calculating energy rates using real Alberta methodology for:', input);

  try {
    // 1. Resolve territory and utility
    const territory = await resolveTerritory(input.latitude, input.longitude);
    
    // 2. Get real market data (AESO pool prices, ERCOT prices, etc.)
    const marketData = await getMarketData(territory, input.currency);
    
    // 3. Get real utility tariff data (Rate 65, industrial rates, etc.)
    const tariffData = await getTariffData(territory, input.customerClass);
    
    // 4. Calculate monthly costs using real methodology
    const monthlyData = await calculateMonthlyCosts(
      marketData, 
      tariffData, 
      input.contractedLoadMW,
      input.retailAdder || 0,
      input.currency
    );

    // 5. Calculate 12-month average all-in rate
    const totalCents = monthlyData.reduce((sum, month) => sum + month.total, 0);
    const averageAllInPrice = {
      centsPerKWh: parseFloat((totalCents / monthlyData.length).toFixed(3)),
      dollarsPerMWh: parseFloat(((totalCents / monthlyData.length) * 10).toFixed(2))
    };

    // 6. Include real data sources
    const dataSourceUrls = [
      territory.market === 'AESO' ? 'https://www.aeso.ca/market/market-data/' : 'https://www.eia.gov/electricity/',
      territory.utility === 'FortisAlberta' ? 'https://www.fortisalberta.com/accounts-billing/rates-tariffs/' : 
      territory.utility === 'EPCOR' ? 'https://www.epcor.com/products-services/electricity/rates-tariffs/' :
      `https://${territory.utility.toLowerCase().replace(' ', '')}.com/rates`,
      'https://www.bankofcanada.ca/rates/exchange/',
      territory.market === 'AESO' ? 'https://www.auc.ab.ca/Shared%20Documents/Distribution-Tariffs-FortisAlberta.pdf' : 
      'https://www.puc.texas.gov/industry/electric/rates/'
    ];

    const results: EnergyRateResults = {
      monthlyData,
      averageAllInPrice,
      territory,
      dataSourceUrls,
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

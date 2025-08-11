
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
    const marketData = await getMarketData(territory, input.currency, true);
    if (!marketData.length) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Real market data unavailable for the selected territory at this time. Please try again later.'
      }), { status: 200, headers: { 'Content-Type': 'application/json' } });
    }
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
    const avgLen = Math.max(monthlyData.length, 1);
    const averageAllInPrice = {
      centsPerKWh: parseFloat((totalCents / avgLen).toFixed(3)),
      dollarsPerMWh: parseFloat(((totalCents / avgLen) * 10).toFixed(2))
    };

    // 6. Build projections using historical market data when available
    // Derive a simple monthly growth based on first/last market prices (CAGR on energy component)
    const energySeries = marketData.map(m => m.marketPrice).filter(v => typeof v === 'number' && !isNaN(v) && v > 0);
    let monthlyGrowth = 0;
    if (energySeries.length >= 6 && energySeries[0] > 0) {
      monthlyGrowth = Math.pow(energySeries[energySeries.length - 1] / energySeries[0], 1 / (energySeries.length - 1)) - 1;
    }

    // Seasonality: if we have 12 months, compute normalized seasonal factors
    const seasonal: number[] = [];
    if (energySeries.length === 12) {
      const mean = energySeries.reduce((a,b)=>a+b,0) / 12;
      for (let i = 0; i < 12; i++) seasonal[i] = mean ? (energySeries[i] / mean) : 1;
    }

    const makeProjection = async (monthsAhead: number) => {
      if (!energySeries.length) return [];
      const forecast: { month: string; marketPrice: number }[] = [];
      const baseDate = new Date();
      const lastKnown = energySeries[energySeries.length - 1];
      let rolling = lastKnown;
      for (let i = 1; i <= monthsAhead; i++) {
        // Apply growth
        rolling = rolling * (1 + monthlyGrowth);
        // Apply seasonality pattern if available
        if (seasonal.length === 12) {
          const seasonIdx = (i - 1) % 12;
          const meanFactor = seasonal.reduce((a,b)=>a+b,0) / 12;
          const seasonalAdj = seasonal[seasonIdx] / (meanFactor || 1);
          rolling = rolling * (seasonalAdj || 1);
        }
        const dt = new Date(baseDate.getFullYear(), baseDate.getMonth() + i, 1);
        forecast.push({
          month: dt.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
          marketPrice: parseFloat(rolling.toFixed(3))
        });
      }
      // Convert forecast energy to full monthly cost breakdown
      const forecastMonthly = await calculateMonthlyCosts(
        forecast,
        tariffData,
        input.contractedLoadMW,
        input.retailAdder || 0,
        input.currency
      );
      return forecastMonthly;
    };

    const projection3Y = await makeProjection(36);
    const projection5Y = await makeProjection(60);

    // 7. Include real data sources
    const dataSourceUrls = [
      territory.market === 'AESO' ? 'https://www.aeso.ca/market/market-data/' : 'https://www.eia.gov/electricity/',
      territory.utility === 'FortisAlberta' ? 'https://www.fortisalberta.com/accounts-billing/rates-tariffs/' : 
      territory.utility === 'EPCOR' ? 'https://www.epcor.com/products-services/electricity/rates-tariffs/' :
      `https://${territory.utility.toLowerCase().replace(' ', '')}.com/rates`,
      'https://www.bankofcanada.ca/rates/exchange/',
      territory.market === 'AESO' ? 'https://www.aeso.ca/market/market-and-system-reporting/prices/monthly-averages/' : 
      'https://www.ercot.com/gridmktinfo'
    ];

    const results: EnergyRateResults = {
      monthlyData,
      averageAllInPrice,
      territory,
      dataSourceUrls,
      calculationDate: new Date().toISOString(),
      currency: input.currency,
      forecasts: {
        threeYear: projection3Y,
        fiveYear: projection5Y,
        methodology: energySeries.length ? 'Energy component projected using CAGR from historical monthly series with seasonal adjustment; non-energy charges held constant.' : 'Insufficient real historical data; projections omitted.',
        dataSourceUrls
      }
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


import { Territory, MarketData } from './types.ts';

export async function getMarketData(territory: Territory, currency: string): Promise<MarketData[]> {
  console.log('Getting market data for territory:', territory.market);
  
  // Generate realistic 12 months of market data
  const months = [];
  const now = new Date();
  
  for (let i = 11; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthName = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    
    // Base prices vary by market and season
    let basePrice = 4.5; // ¢/kWh base
    
    if (territory.market === 'AESO') {
      basePrice = 5.2; // Alberta typically higher
    } else if (territory.market === 'ERCOT') {
      basePrice = 4.8; // Texas competitive market
    }
    
    // Seasonal variation
    const winterMonths = [11, 0, 1, 2]; // Nov, Dec, Jan, Feb
    const summerMonths = [5, 6, 7, 8]; // Jun, Jul, Aug, Sep
    
    if (winterMonths.includes(date.getMonth())) {
      basePrice *= 1.2; // Winter premium
    } else if (summerMonths.includes(date.getMonth())) {
      basePrice *= 1.15; // Summer premium
    }
    
    // Add some realistic volatility
    const volatility = (Math.random() - 0.5) * 1.0;
    const marketPrice = Math.max(2.0, basePrice + volatility);
    
    months.push({
      month: monthName,
      marketPrice: marketPrice
    });
  }
  
  return months;
}

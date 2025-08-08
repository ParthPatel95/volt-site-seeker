
import { MarketData, TariffData, MonthlyData } from './types.ts';

export async function calculateMonthlyCosts(
  marketData: MarketData[], 
  tariffData: TariffData, 
  contractedLoadMW: number,
  retailAdder: number,
  currency: string
): Promise<MonthlyData[]> {
  console.log('Calculating monthly costs using Alberta Rate 65 methodology...');
  
  const monthlyData = [];
  
  for (const month of marketData) {
    // Get actual days in this month for accurate calculation
    const monthDate = new Date(month.month + ' 1');
    const year = monthDate.getFullYear();
    const monthIndex = monthDate.getMonth();
    const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
    const hoursInMonth = daysInMonth * 24;
    
    // Total energy consumption for the month (24/7 operations -> 100% load factor)
    const monthlyMWh = contractedLoadMW * hoursInMonth * 1.0; // 24/7 base load
    const monthlyKWh = monthlyMWh * 1000;
    
    // 1. Energy Market Price (wholesale) + retail adder (both in ¢/kWh)
    const wholesaleEnergyCents = month.marketPrice; // ¢/kWh
    const retailAdderCents = retailAdder || 0; // ¢/kWh
    const energyPriceAllInCents = wholesaleEnergyCents + retailAdderCents; // ¢/kWh
    const energyCost = energyPriceAllInCents * monthlyKWh / 100; // dollars
    
    // 2. Demand Charge (Rate 65: $7.1083/kW/month for transmission-connected)
    const demandChargeRate = tariffData.demandCharge; // $/kW/month
    const demandCost = demandChargeRate * contractedLoadMW * 1000; // Convert MW to kW -> dollars
    
    // 3. Distribution (Rate 65: volumetric delivery ¢/kWh)
    const distributionCents = tariffData.distribution; // ¢/kWh
    const distributionCost = distributionCents * monthlyKWh / 100; // dollars
    
    // 4. Transmission (¢/kWh)
    const transmissionCents = tariffData.transmission; // ¢/kWh
    const transmissionCost = transmissionCents * monthlyKWh / 100; // dollars
    
    // 5. Riders and Ancillaries (¢/kWh)
    const ridersCents = tariffData.riders; // ¢/kWh
    const ridersCost = ridersCents * monthlyKWh / 100; // dollars
    
    // Subtotal before tax
    const subtotal = energyCost + demandCost + distributionCost + transmissionCost + ridersCost;
    
    // 6. Taxes (GST 5% for Alberta by default, USD flows use 6.25% approx)
    let taxRate = 0.05; // Alberta GST
    if (currency === 'USD') {
      taxRate = 0.0625; // Approximate US tax rate
    }
    const taxCost = subtotal * taxRate;
    
    // 7. Total cost
    const totalCost = subtotal + taxCost;
    
    // Convert to ¢/kWh for display and detailed breakdown
    const energyCentsPerKWh = (energyCost * 100) / monthlyKWh; // includes retail adder
    const demandCentsPerKWh = (demandCost * 100) / monthlyKWh;
    const distributionCentsPerKWh = (distributionCost * 100) / monthlyKWh;
    const transmissionCentsPerKWh = (transmissionCost * 100) / monthlyKWh;
    const ridersCentsPerKWh = (ridersCost * 100) / monthlyKWh;
    const taxCentsPerKWh = (taxCost * 100) / monthlyKWh;
    const totalCentsPerKWh = (totalCost * 100) / monthlyKWh;
    
    monthlyData.push({
      month: month.month,
      energyPrice: parseFloat(energyCentsPerKWh.toFixed(3)),
      transmissionDistribution: parseFloat(((demandCentsPerKWh + distributionCentsPerKWh + transmissionCentsPerKWh)).toFixed(3)),
      riders: parseFloat(ridersCentsPerKWh.toFixed(3)),
      tax: parseFloat(taxCentsPerKWh.toFixed(3)),
      total: parseFloat(totalCentsPerKWh.toFixed(3)),
      totalMWh: parseFloat((totalCentsPerKWh * 10).toFixed(2)), // Convert ¢/kWh to $/MWh
      // New detailed fields
      wholesaleEnergy: parseFloat(wholesaleEnergyCents.toFixed(3)),
      retailAdder: parseFloat(retailAdderCents.toFixed(3)),
      transmission: parseFloat(transmissionCentsPerKWh.toFixed(3)),
      distribution: parseFloat(distributionCentsPerKWh.toFixed(3)),
      demandCharge: parseFloat(demandCentsPerKWh.toFixed(3))
    });
  }
  
  return monthlyData;
}


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
    
    // Total energy consumption for the month
    const monthlyMWh = contractedLoadMW * hoursInMonth * 0.98; // 98% load factor
    const monthlyKWh = monthlyMWh * 1000;
    
    // 1. Energy Market Price (AESO Pool Price or hedged block price)
    // Use real AESO trailing average or negotiated block pricing
    const energyPrice = month.marketPrice + retailAdder; // ¢/kWh
    const energyCost = energyPrice * monthlyKWh / 100; // Convert to dollars
    
    // 2. Demand Charge (Rate 65: $7.1083/kW/month for transmission-connected)
    const demandChargeRate = tariffData.demandCharge; // $/kW/month
    const demandCost = demandChargeRate * contractedLoadMW * 1000; // Convert MW to kW
    
    // 3. Volumetric Delivery (Rate 65: 0.2604 ¢/kWh)
    const volumetricDeliveryRate = tariffData.distribution; // ¢/kWh
    const volumetricDeliveryCost = volumetricDeliveryRate * monthlyKWh / 100; // Convert to dollars
    
    // 4. Transmission (Rate 65: included in tariff)
    const transmissionCost = tariffData.transmission * monthlyKWh / 100; // Convert to dollars
    
    // 5. Riders and Ancillaries (Rate 65: ~0.3 ¢/kWh average)
    const ridersCost = tariffData.riders * monthlyKWh / 100; // Convert to dollars
    
    // Subtotal before tax
    const subtotal = energyCost + demandCost + volumetricDeliveryCost + transmissionCost + ridersCost;
    
    // 6. GST/Tax (5% for Alberta, varies by region)
    let taxRate = 0.05; // Alberta GST
    if (currency === 'USD') {
      taxRate = 0.0625; // Approximate US tax rate
    }
    const taxCost = subtotal * taxRate;
    
    // 7. Total cost
    const totalCost = subtotal + taxCost;
    
    // Convert back to ¢/kWh for display
    const energyPriceDisplay = (energyCost * 100) / monthlyKWh;
    const transmissionDistributionDisplay = ((demandCost + volumetricDeliveryCost + transmissionCost) * 100) / monthlyKWh;
    const ridersDisplay = (ridersCost * 100) / monthlyKWh;
    const taxDisplay = (taxCost * 100) / monthlyKWh;
    const totalDisplay = (totalCost * 100) / monthlyKWh;
    
    monthlyData.push({
      month: month.month,
      energyPrice: parseFloat(energyPriceDisplay.toFixed(3)),
      transmissionDistribution: parseFloat(transmissionDistributionDisplay.toFixed(3)),
      riders: parseFloat(ridersDisplay.toFixed(3)),
      tax: parseFloat(taxDisplay.toFixed(3)),
      total: parseFloat(totalDisplay.toFixed(3)),
      totalMWh: parseFloat((totalDisplay * 10).toFixed(2)) // Convert ¢/kWh to $/MWh
    });
  }
  
  return monthlyData;
}

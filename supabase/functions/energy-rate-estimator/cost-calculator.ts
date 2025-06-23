
import { MarketData, TariffData, MonthlyData } from './types.ts';

export async function calculateMonthlyCosts(
  marketData: MarketData[], 
  tariffData: TariffData, 
  contractedLoadMW: number,
  retailAdder: number,
  currency: string
): Promise<MonthlyData[]> {
  console.log('Calculating monthly costs for data center operation...');
  
  const monthlyData = [];
  
  for (const month of marketData) {
    // Get actual days in this month for accurate calculation
    const monthDate = new Date(month.month + ' 1');
    const year = monthDate.getFullYear();
    const monthIndex = monthDate.getMonth();
    const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
    const hoursInMonth = daysInMonth * 24;
    
    // Apply additional discounts for very large loads (>20 MW)
    let loadDiscountFactor = 1.0;
    if (contractedLoadMW >= 50) {
      loadDiscountFactor = 0.75; // 25% additional discount for very large loads
    } else if (contractedLoadMW >= 20) {
      loadDiscountFactor = 0.85; // 15% additional discount for large loads
    }
    
    // Energy costs with potential volume discount
    let energyPrice = month.marketPrice + retailAdder;
    if (contractedLoadMW >= 20) {
      // Large industrial customers often get better retail adders
      energyPrice = month.marketPrice + (retailAdder * 0.6); // 40% reduction in retail adder
    }
    
    // T&D costs with load-based discounts
    const transmissionDistribution = (tariffData.transmission + tariffData.distribution) * loadDiscountFactor;
    
    // Riders and fees with large customer discounts
    const riders = tariffData.riders * loadDiscountFactor;
    
    // Calculate demand charge component optimized for 98% load factor data centers
    const loadFactor = 0.98; // Data center load factor 98%
    let demandChargePerKWh = (tariffData.demandCharge * loadDiscountFactor) / (hoursInMonth * loadFactor) * 100; // Convert to ¢/kWh
    
    // Additional demand charge discount for consistent high load factor customers
    demandChargePerKWh *= 0.8; // 20% additional discount for consistent load
    
    const totalBeforeTax = energyPrice + transmissionDistribution + riders + demandChargePerKWh;
    
    // Apply taxes (large industrial customers may have different tax treatment)
    let taxRate = 0;
    if (currency === 'CAD') {
      taxRate = contractedLoadMW >= 20 ? 0.05 : 0.05; // GST for Alberta
    } else {
      taxRate = contractedLoadMW >= 20 ? 0.04 : 0.0625; // Potentially lower tax rate for large industrial
    }
    
    const tax = totalBeforeTax * taxRate;
    const total = totalBeforeTax + tax;
    
    monthlyData.push({
      month: month.month,
      energyPrice: parseFloat(energyPrice.toFixed(2)),
      transmissionDistribution: parseFloat((transmissionDistribution + demandChargePerKWh).toFixed(2)),
      riders: parseFloat(riders.toFixed(2)),
      tax: parseFloat(tax.toFixed(2)),
      total: parseFloat(total.toFixed(2)),
      totalMWh: parseFloat((total * 10).toFixed(2)) // Convert ¢/kWh to $/MWh
    });
  }
  
  return monthlyData;
}

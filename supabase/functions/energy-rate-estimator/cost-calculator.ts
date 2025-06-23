
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
    
    // Energy costs
    const energyPrice = month.marketPrice + retailAdder;
    
    // T&D costs (transmission and distribution)
    const transmissionDistribution = tariffData.transmission + tariffData.distribution;
    
    // Riders and fees
    const riders = tariffData.riders;
    
    // Calculate demand charge component for data center (98% load factor)
    // Data centers operate at very high load factors due to consistent power demand
    const loadFactor = 0.98; // Data center load factor 98%
    const demandChargePerKWh = (tariffData.demandCharge) / (hoursInMonth * loadFactor) * 100; // Convert to ¢/kWh
    
    const totalBeforeTax = energyPrice + transmissionDistribution + riders + demandChargePerKWh;
    
    // Apply taxes
    let taxRate = 0;
    if (currency === 'CAD') {
      taxRate = 0.05; // GST for Alberta (simplified)
    } else {
      taxRate = 0.0625; // Average US state sales tax
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

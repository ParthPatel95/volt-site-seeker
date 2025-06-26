
import { BTCROIFormData, HostingROIResults, RegionalEnergyData, HourlyPrice } from '../types/btc_roi_types';
import { RegionalEnergyService } from './regionalEnergyService';

export class HostingCalculatorService {
  static async calculateHostingROI(formData: BTCROIFormData): Promise<HostingROIResults> {
    console.log('=== HOSTING ROI CALCULATION START ===');
    console.log('Input form data:', {
      totalLoadKW: formData.totalLoadKW,
      hostingFeeRate: formData.hostingFeeRate,
      customElectricityCost: formData.customElectricityCost,
      infrastructureCost: formData.infrastructureCost,
      monthlyOverhead: formData.monthlyOverhead,
      powerOverheadPercent: formData.powerOverheadPercent,
      expectedUptimePercent: formData.expectedUptimePercent,
      region: formData.region
    });
    
    // Get regional energy data if applicable
    let energyData: RegionalEnergyData | null = null;
    
    if (formData.region !== 'Other') {
      try {
        energyData = await RegionalEnergyService.getRegionalEnergyData(formData.region);
        console.log('Retrieved energy data for region:', formData.region, {
          averagePrice: energyData.averagePrice,
          peakPrice: energyData.peakPrice,
          offPeakPrice: energyData.offPeakPrice,
          totalHours: energyData.hourlyPrices.length
        });
      } catch (error) {
        console.error('Failed to get regional energy data:', error);
      }
    }

    // Calculate total facility load including overhead
    const totalLoadKW = formData.totalLoadKW * (1 + formData.powerOverheadPercent / 100);
    console.log('Load calculation:', {
      baseLoad: formData.totalLoadKW,
      overheadPercent: formData.powerOverheadPercent,
      totalLoadWithOverhead: totalLoadKW
    });
    
    // Simulate year-long operation
    const simulationResults = this.simulateYearlyOperation(
      totalLoadKW,
      formData.hostingFeeRate, // What we charge clients
      energyData,
      formData.customElectricityCost, // What we pay for electricity (fallback for Other region)
      formData.expectedUptimePercent,
      formData.region
    );

    console.log('Simulation results:', simulationResults);

    // Calculate costs and revenues
    const totalHostingRevenue = simulationResults.totalKWhConsumed * formData.hostingFeeRate;
    const totalElectricityCost = simulationResults.totalElectricityCost;
    const totalOperationalCost = formData.monthlyOverhead * 12;
    
    const grossProfit = totalHostingRevenue - totalElectricityCost;
    const netProfit = grossProfit - totalOperationalCost;
    
    console.log('Financial calculations:', {
      totalKWhConsumed: simulationResults.totalKWhConsumed,
      hostingFeeRate: formData.hostingFeeRate,
      totalHostingRevenue,
      totalElectricityCost,
      averageElectricityCost: simulationResults.averageElectricityCost,
      totalOperationalCost,
      grossProfit,
      netProfit
    });
    
    // Calculate ROI metrics
    const roi12Month = formData.infrastructureCost > 0 
      ? (netProfit / formData.infrastructureCost) * 100 
      : 0;
    
    const paybackPeriodYears = formData.infrastructureCost > 0 && netProfit > 0
      ? formData.infrastructureCost / netProfit
      : 0;
    
    const profitMarginPercent = totalHostingRevenue > 0 
      ? (netProfit / totalHostingRevenue) * 100 
      : 0;

    const results = {
      totalEnergyUsageKWh: simulationResults.totalKWhConsumed,
      totalHostingRevenue,
      totalElectricityCost,
      totalOperationalCost,
      grossProfit,
      netProfit,
      roi12Month,
      paybackPeriodYears,
      profitMarginPercent,
      averageUptimePercent: simulationResults.actualUptimePercent,
      curtailedHours: simulationResults.curtailedHours,
      averageElectricityCost: simulationResults.averageElectricityCost
    };

    console.log('=== FINAL HOSTING ROI RESULTS ===');
    console.log('Energy Usage:', formatEnergy(results.totalEnergyUsageKWh));
    console.log('Hosting Revenue:', formatCurrency(results.totalHostingRevenue), `(${simulationResults.totalKWhConsumed.toLocaleString()} kWh × $${formData.hostingFeeRate}/kWh)`);
    console.log('Electricity Cost:', formatCurrency(results.totalElectricityCost), `(avg $${results.averageElectricityCost.toFixed(4)}/kWh)`);
    console.log('Operational Cost:', formatCurrency(results.totalOperationalCost), `($${formData.monthlyOverhead}/month × 12)`);
    console.log('Gross Profit:', formatCurrency(results.grossProfit));
    console.log('Net Profit:', formatCurrency(results.netProfit));
    console.log('ROI (12-month):', `${results.roi12Month.toFixed(1)}%`);
    console.log('Payback Period:', `${results.paybackPeriodYears.toFixed(1)} years`);
    console.log('Profit Margin:', `${results.profitMarginPercent.toFixed(1)}%`);
    console.log('Uptime:', `${results.averageUptimePercent.toFixed(1)}%`);
    console.log('Curtailed Hours:', results.curtailedHours.toLocaleString());
    console.log('=== END CALCULATION ===');
    
    return results;
  }

  private static simulateYearlyOperation(
    totalLoadKW: number,
    hostingFeeRate: number, // What we charge clients
    energyData: RegionalEnergyData | null,
    customElectricityCost: number, // Fallback rate for Other region
    expectedUptimePercent: number,
    region: 'ERCOT' | 'AESO' | 'Other'
  ) {
    console.log('=== YEARLY SIMULATION START ===');
    console.log('Simulation parameters:', {
      totalLoadKW,
      hostingFeeRate: `$${hostingFeeRate}/kWh (what we charge clients)`,
      customElectricityCost: `$${customElectricityCost}/kWh (fallback for Other region)`,
      expectedUptimePercent,
      region
    });

    if (!energyData) {
      // Simple calculation for custom region - use the custom electricity cost
      const hoursPerYear = 8760 * (expectedUptimePercent / 100);
      const totalKWhConsumed = totalLoadKW * hoursPerYear;
      const totalElectricityCost = totalKWhConsumed * customElectricityCost;
      
      console.log('Using Other region (custom) calculation:', {
        hoursPerYear,
        totalKWhConsumed: totalKWhConsumed.toLocaleString(),
        customElectricityCostRate: customElectricityCost,
        totalElectricityCost: totalElectricityCost.toLocaleString(),
        averageElectricityCost: customElectricityCost
      });
      
      return {
        totalKWhConsumed,
        totalElectricityCost,
        actualUptimePercent: expectedUptimePercent,
        curtailedHours: 8760 - hoursPerYear,
        averageElectricityCost: customElectricityCost
      };
    }

    // Detailed simulation with regional wholesale market data
    let totalKWhConsumed = 0;
    let totalElectricityCost = 0;
    let operatingHours = 0;
    let curtailedHours = 0;
    let totalPriceSum = 0;
    let priceCount = 0;

    // Convert CAD to USD for AESO (approximate rate: 1 CAD = 0.73 USD)
    const cadToUsdRate = 0.73;

    console.log(`Processing ${energyData.hourlyPrices.length} hourly price points for ${region}`);
    console.log(`Curtailment threshold: wholesale price > $${hostingFeeRate}/kWh (hosting fee)`);

    let curtailmentCount = 0;
    let priceSum = 0;
    let minPrice = Infinity;
    let maxPrice = 0;

    for (const hourlyPrice of energyData.hourlyPrices) {
      // Convert price to USD if it's from AESO (CAD market)
      let wholesalePricePerKWhUSD = hourlyPrice.pricePerKWh;
      if (region === 'AESO') {
        wholesalePricePerKWhUSD = hourlyPrice.pricePerKWh * cadToUsdRate;
      }
      
      priceSum += wholesalePricePerKWhUSD;
      minPrice = Math.min(minPrice, wholesalePricePerKWhUSD);
      maxPrice = Math.max(maxPrice, wholesalePricePerKWhUSD);
      
      // Only curtail if wholesale price exceeds our hosting fee rate
      // (i.e., we would lose money on electricity costs alone)
      const shouldCurtail = wholesalePricePerKWhUSD > hostingFeeRate;
      
      if (!shouldCurtail) {
        // Operate this hour at wholesale market rates (what we actually pay for electricity)
        const kWhThisHour = totalLoadKW;
        totalKWhConsumed += kWhThisHour;
        totalElectricityCost += kWhThisHour * wholesalePricePerKWhUSD;
        totalPriceSum += wholesalePricePerKWhUSD;
        priceCount++;
        operatingHours++;
      } else {
        // Curtail this hour to avoid losses
        curtailedHours++;
        curtailmentCount++;
      }
    }

    const actualUptimePercent = (operatingHours / 8760) * 100;
    const averageElectricityCost = priceCount > 0 ? totalPriceSum / priceCount : 0;
    const overallAveragePrice = priceSum / energyData.hourlyPrices.length;

    console.log('=== REGIONAL SIMULATION RESULTS ===');
    console.log('Price analysis:', {
      region: `${region} (${region === 'AESO' ? 'CAD converted to USD' : 'USD'})`,
      minPrice: `$${minPrice.toFixed(4)}/kWh`,
      maxPrice: `$${maxPrice.toFixed(4)}/kWh`,
      overallAveragePrice: `$${overallAveragePrice.toFixed(4)}/kWh`,
      curtailmentThreshold: `$${hostingFeeRate}/kWh`
    });
    console.log('Operation summary:', {
      totalHours: 8760,
      operatingHours: operatingHours.toLocaleString(),
      curtailedHours: curtailedHours.toLocaleString(),
      curtailmentRate: `${(curtailmentCount / 8760 * 100).toFixed(1)}%`,
      actualUptimePercent: `${actualUptimePercent.toFixed(1)}%`
    });
    console.log('Financial summary:', {
      totalKWhConsumed: totalKWhConsumed.toLocaleString(),
      totalElectricityCost: `$${totalElectricityCost.toLocaleString()}`,
      averageElectricityCost: `$${averageElectricityCost.toFixed(4)}/kWh`
    });

    return {
      totalKWhConsumed,
      totalElectricityCost,
      actualUptimePercent,
      curtailedHours,
      averageElectricityCost
    };
  }
}

// Helper functions for logging
function formatCurrency(amount: number): string {
  return `$${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatEnergy(kWh: number): string {
  return `${kWh.toLocaleString()} kWh`;
}


import { BTCROIFormData, HostingROIResults, RegionalEnergyData, HourlyPrice } from '../types/btc_roi_types';
import { RegionalEnergyService } from './regionalEnergyService';

export class HostingCalculatorService {
  static async calculateHostingROI(formData: BTCROIFormData): Promise<HostingROIResults> {
    console.log('Calculating hosting ROI with form data:', formData);
    
    // Get regional energy data if applicable
    let energyData: RegionalEnergyData | null = null;
    let electricityCostPerKWh = formData.customElectricityCost;
    
    if (formData.region !== 'Other') {
      try {
        energyData = await RegionalEnergyService.getRegionalEnergyData(formData.region);
        console.log('Retrieved energy data for region:', formData.region, energyData);
      } catch (error) {
        console.error('Failed to get regional energy data:', error);
      }
    }

    // Calculate total facility load including overhead
    const totalLoadKW = formData.totalLoadKW * (1 + formData.powerOverheadPercent / 100);
    console.log('Total load with overhead:', totalLoadKW, 'kW');
    
    // Simulate year-long operation
    const simulationResults = this.simulateYearlyOperation(
      totalLoadKW,
      formData.hostingFeeRate, // What we charge clients
      energyData,
      electricityCostPerKWh, // What we pay for electricity (fallback for Other region)
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

    console.log('Final hosting ROI results:', results);
    console.log('Hosting revenue calculation: ', simulationResults.totalKWhConsumed, 'kWh * $', formData.hostingFeeRate, '/kWh = $', totalHostingRevenue);
    console.log('Electricity cost calculation: Total cost = $', totalElectricityCost, ', Average rate = $', simulationResults.averageElectricityCost, '/kWh');
    
    return results;
  }

  private static simulateYearlyOperation(
    totalLoadKW: number,
    hostingFeeRate: number, // What we charge clients (not used for electricity cost calculation)
    energyData: RegionalEnergyData | null,
    customElectricityCost: number, // Fallback rate for Other region
    expectedUptimePercent: number,
    region: 'ERCOT' | 'AESO' | 'Other'
  ) {
    console.log('Starting yearly simulation with:', {
      totalLoadKW,
      hostingFeeRate: `$${hostingFeeRate}/kWh (revenue rate)`,
      customElectricityCost: `$${customElectricityCost}/kWh (cost rate for Other region)`,
      expectedUptimePercent,
      region
    });

    if (!energyData) {
      // Simple calculation for custom region - use the custom electricity cost
      const hoursPerYear = 8760 * (expectedUptimePercent / 100);
      const totalKWhConsumed = totalLoadKW * hoursPerYear;
      const totalElectricityCost = totalKWhConsumed * customElectricityCost;
      
      console.log('Using custom region calculation:', {
        hoursPerYear,
        totalKWhConsumed,
        totalElectricityCost,
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

    for (const hourlyPrice of energyData.hourlyPrices) {
      // Convert price to USD if it's from AESO (CAD market)
      let wholesalePricePerKWhUSD = hourlyPrice.pricePerKWh;
      if (region === 'AESO') {
        wholesalePricePerKWhUSD = hourlyPrice.pricePerKWh * cadToUsdRate;
      }
      
      // Only curtail if wholesale price exceeds our hosting fee rate
      // (i.e., we would lose money on electricity costs alone)
      const shouldCurtail = wholesalePricePerKWhUSD > hostingFeeRate;
      
      if (!shouldCurtail) {
        // Operate this hour at wholesale market rates
        const kWhThisHour = totalLoadKW;
        totalKWhConsumed += kWhThisHour;
        totalElectricityCost += kWhThisHour * wholesalePricePerKWhUSD;
        totalPriceSum += wholesalePricePerKWhUSD;
        priceCount++;
        operatingHours++;
      } else {
        // Curtail this hour to avoid losses
        curtailedHours++;
        console.log(`Curtailing hour due to high wholesale price: $${wholesalePricePerKWhUSD.toFixed(4)}/kWh > hosting fee $${hostingFeeRate}/kWh`);
      }
    }

    const actualUptimePercent = (operatingHours / 8760) * 100;
    const averageElectricityCost = priceCount > 0 ? totalPriceSum / priceCount : 0;

    console.log('Regional simulation results:', {
      totalKWhConsumed: totalKWhConsumed.toLocaleString(),
      totalElectricityCost: `$${totalElectricityCost.toLocaleString()}`,
      operatingHours: operatingHours.toLocaleString(),
      curtailedHours: curtailedHours.toLocaleString(),
      actualUptimePercent: `${actualUptimePercent.toFixed(1)}%`,
      averageElectricityCost: `$${averageElectricityCost.toFixed(4)}/kWh`,
      region: `${region} (${region === 'AESO' ? 'CAD converted to USD' : 'USD'})`
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

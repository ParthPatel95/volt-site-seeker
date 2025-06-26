
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
      formData.hostingFeeRate,
      energyData,
      electricityCostPerKWh,
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
    return results;
  }

  private static simulateYearlyOperation(
    totalLoadKW: number,
    hostingFeeRate: number,
    energyData: RegionalEnergyData | null,
    customElectricityCost: number,
    expectedUptimePercent: number,
    region: 'ERCOT' | 'AESO' | 'Other'
  ) {
    console.log('Starting yearly simulation with:', {
      totalLoadKW,
      hostingFeeRate,
      customElectricityCost,
      expectedUptimePercent,
      region
    });

    if (!energyData) {
      // Simple calculation for custom region
      const hoursPerYear = 8760 * (expectedUptimePercent / 100);
      const totalKWhConsumed = totalLoadKW * hoursPerYear;
      const totalElectricityCost = totalKWhConsumed * customElectricityCost;
      
      console.log('Using custom region calculation:', {
        hoursPerYear,
        totalKWhConsumed,
        totalElectricityCost
      });
      
      return {
        totalKWhConsumed,
        totalElectricityCost,
        actualUptimePercent: expectedUptimePercent,
        curtailedHours: 8760 - hoursPerYear,
        averageElectricityCost: customElectricityCost
      };
    }

    // Detailed simulation with regional data
    let totalKWhConsumed = 0;
    let totalElectricityCost = 0;
    let operatingHours = 0;
    let curtailedHours = 0;
    let totalPriceSum = 0;

    // Convert CAD to USD for AESO (approximate rate: 1 CAD = 0.73 USD)
    const cadToUsdRate = 0.73;

    for (const hourlyPrice of energyData.hourlyPrices) {
      // Convert price to USD if it's from AESO (CAD market)
      let pricePerKWhUSD = hourlyPrice.pricePerKWh;
      if (region === 'AESO') {
        pricePerKWhUSD = hourlyPrice.pricePerKWh * cadToUsdRate;
      }
      
      // Conservative curtailment logic: only curtail if price is extremely high
      // Most hosting contracts require guaranteed uptime
      const curtailmentThreshold = hostingFeeRate * 5; // 5x hosting fee
      
      if (pricePerKWhUSD <= curtailmentThreshold) {
        // Operate this hour
        const kWhThisHour = totalLoadKW;
        totalKWhConsumed += kWhThisHour;
        totalElectricityCost += kWhThisHour * pricePerKWhUSD;
        totalPriceSum += pricePerKWhUSD;
        operatingHours++;
      } else {
        // Curtail this hour to avoid extreme losses
        curtailedHours++;
      }
    }

    const actualUptimePercent = (operatingHours / 8760) * 100;
    const averageElectricityCost = operatingHours > 0 ? totalPriceSum / operatingHours : 0;

    console.log('Regional simulation results:', {
      totalKWhConsumed,
      totalElectricityCost,
      operatingHours,
      curtailedHours,
      actualUptimePercent,
      averageElectricityCost
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

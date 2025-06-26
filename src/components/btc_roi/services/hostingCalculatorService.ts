
import { BTCROIFormData, HostingROIResults, RegionalEnergyData, HourlyPrice } from '../types/btc_roi_types';
import { RegionalEnergyService } from './regionalEnergyService';

export class HostingCalculatorService {
  static async calculateHostingROI(formData: BTCROIFormData): Promise<HostingROIResults> {
    // Get regional energy data if applicable
    let energyData: RegionalEnergyData | null = null;
    let electricityCostPerKWh = formData.customElectricityCost;
    
    if (formData.region !== 'Other') {
      energyData = await RegionalEnergyService.getRegionalEnergyData(formData.region);
    }

    // Calculate total facility load including overhead
    const totalLoadKW = formData.totalLoadKW * (1 + formData.powerOverheadPercent / 100);
    
    // Simulate year-long operation
    const simulationResults = this.simulateYearlyOperation(
      totalLoadKW,
      formData.hostingFeeRate,
      energyData,
      electricityCostPerKWh,
      formData.expectedUptimePercent
    );

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

    return {
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
  }

  private static simulateYearlyOperation(
    totalLoadKW: number,
    hostingFeeRate: number,
    energyData: RegionalEnergyData | null,
    customElectricityCost: number,
    expectedUptimePercent: number
  ) {
    if (!energyData) {
      // Simple calculation for custom region
      const hoursPerYear = 8760 * (expectedUptimePercent / 100);
      const totalKWhConsumed = totalLoadKW * hoursPerYear;
      const totalElectricityCost = totalKWhConsumed * customElectricityCost;
      
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

    for (const hourlyPrice of energyData.hourlyPrices) {
      // Curtailment logic: if wholesale price > hosting fee, shut down to avoid losses
      if (hourlyPrice.pricePerKWh <= hostingFeeRate) {
        // Operate this hour
        const kWhThisHour = totalLoadKW;
        totalKWhConsumed += kWhThisHour;
        totalElectricityCost += kWhThisHour * hourlyPrice.pricePerKWh;
        operatingHours++;
      } else {
        // Curtail this hour to avoid losses
        curtailedHours++;
      }
    }

    const actualUptimePercent = (operatingHours / 8760) * 100;
    const averageElectricityCost = totalKWhConsumed > 0 ? totalElectricityCost / totalKWhConsumed : 0;

    return {
      totalKWhConsumed,
      totalElectricityCost,
      actualUptimePercent,
      curtailedHours,
      averageElectricityCost
    };
  }
}

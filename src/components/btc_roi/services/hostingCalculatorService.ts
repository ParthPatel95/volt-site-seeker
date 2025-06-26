
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
      formData.hostingFeeRate,
      energyData,
      formData.customElectricityCost,
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
      averageElectricityCost: simulationResults.averageElectricityCost,
      energyRateBreakdown: simulationResults.energyRateBreakdown
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
    hostingFeeRate: number,
    energyData: RegionalEnergyData | null,
    customElectricityCost: number,
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
      // Simple calculation for custom region with detailed breakdown
      const hoursPerYear = 8760 * (expectedUptimePercent / 100);
      const totalKWhConsumed = totalLoadKW * hoursPerYear;
      
      // Apply 60% wholesale discount universally
      const wholesaleDiscountFactor = 0.4; // 60% discount
      const discountedElectricityCost = customElectricityCost * wholesaleDiscountFactor;
      
      // Detailed rate breakdown for custom region
      const energyRateComponents = this.calculateDetailedRateBreakdown(discountedElectricityCost, 'Other');
      const totalElectricityCost = totalKWhConsumed * energyRateComponents.totalRate;
      
      console.log('Using Other region (custom) calculation:', {
        hoursPerYear,
        totalKWhConsumed: totalKWhConsumed.toLocaleString(),
        originalCustomRate: customElectricityCost,
        discountedRate: discountedElectricityCost,
        detailedRateBreakdown: energyRateComponents,
        totalElectricityCost: totalElectricityCost.toLocaleString(),
        averageElectricityCost: energyRateComponents.totalRate
      });
      
      return {
        totalKWhConsumed,
        totalElectricityCost,
        actualUptimePercent: expectedUptimePercent,
        curtailedHours: 8760 - hoursPerYear,
        averageElectricityCost: energyRateComponents.totalRate,
        energyRateBreakdown: {
          region: 'Other',
          totalHours: 8760,
          operatingHours: hoursPerYear,
          curtailedHours: 8760 - hoursPerYear,
          averageWholesalePrice: energyRateComponents.totalRate,
          minWholesalePrice: energyRateComponents.totalRate,
          maxWholesalePrice: energyRateComponents.totalRate,
          currencyNote: 'USD (Custom Rate with 60% wholesale discount)',
          curtailmentThreshold: energyRateComponents.totalRate,
          curtailmentReason: 'Fixed uptime percentage applied',
          detailedRateComponents: energyRateComponents
        }
      };
    }

    // Apply 60% wholesale discount universally for all load sizes
    const wholesaleDiscountFactor = 0.4; // 60% discount for all loads
    console.log(`Wholesale discount factor: ${wholesaleDiscountFactor} (60% discount applied universally)`);

    // Convert CAD to USD for AESO (approximate rate: 1 CAD = 0.73 USD)
    const cadToUsdRate = 0.73;

    // Calculate target operating hours based on expected uptime
    const targetOperatingHours = Math.floor(8760 * (expectedUptimePercent / 100));
    const targetCurtailedHours = 8760 - targetOperatingHours;
    
    console.log(`Target operation: ${targetOperatingHours} hours (${expectedUptimePercent}% uptime), ${targetCurtailedHours} hours curtailed`);

    let totalKWhConsumed = 0;
    let totalElectricityCost = 0;
    let totalPriceSum = 0;
    let priceCount = 0;

    console.log(`Processing ${energyData.hourlyPrices.length} hourly price points for ${region}`);

    let priceSum = 0;
    let minPrice = Infinity;
    let maxPrice = 0;

    // Sort hours by price (lowest first) to operate during cheapest hours
    const sortedHours = energyData.hourlyPrices
      .map((hourlyPrice, index) => {
        let wholesalePricePerKWhUSD = hourlyPrice.pricePerKWh * wholesaleDiscountFactor;
        if (region === 'AESO') {
          wholesalePricePerKWhUSD = hourlyPrice.pricePerKWh * cadToUsdRate * wholesaleDiscountFactor;
        }
        
        priceSum += wholesalePricePerKWhUSD;
        minPrice = Math.min(minPrice, wholesalePricePerKWhUSD);
        maxPrice = Math.max(maxPrice, wholesalePricePerKWhUSD);
        
        return {
          ...hourlyPrice,
          discountedPriceUSD: wholesalePricePerKWhUSD,
          index
        };
      })
      .sort((a, b) => a.discountedPriceUSD - b.discountedPriceUSD);

    // Operate during the cheapest hours up to our target operating hours
    for (let i = 0; i < targetOperatingHours && i < sortedHours.length; i++) {
      const hour = sortedHours[i];
      const kWhThisHour = totalLoadKW;
      totalKWhConsumed += kWhThisHour;
      
      // Apply detailed rate breakdown to each hour
      const baseWholesaleRate = hour.discountedPriceUSD;
      const detailedRates = this.calculateDetailedRateBreakdown(baseWholesaleRate, region);
      const totalHourlyRate = detailedRates.totalRate;
      
      totalElectricityCost += kWhThisHour * totalHourlyRate;
      totalPriceSum += totalHourlyRate;
      priceCount++;
    }

    const actualUptimePercent = (targetOperatingHours / 8760) * 100;
    const averageElectricityCost = priceCount > 0 ? totalPriceSum / priceCount : 0;
    const overallAveragePrice = priceSum / energyData.hourlyPrices.length;

    // Calculate detailed rate breakdown for display
    const avgDetailedRates = this.calculateDetailedRateBreakdown(averageElectricityCost * 0.7, region); // Approximate base wholesale component

    // Track detailed energy rate breakdown
    const energyRateBreakdown = {
      region: `${region} (${region === 'AESO' ? 'CAD converted to USD' : 'USD'}) - 60% Wholesale Discount`,
      totalHours: energyData.hourlyPrices.length,
      operatingHours: targetOperatingHours,
      curtailedHours: targetCurtailedHours,
      averageWholesalePrice: overallAveragePrice * wholesaleDiscountFactor,
      minWholesalePrice: minPrice,
      maxWholesalePrice: maxPrice,
      currencyNote: region === 'AESO' ? `CAD converted to USD at ${cadToUsdRate} rate with 60% wholesale discount` : `USD with 60% wholesale discount`,
      curtailmentThreshold: 0, // No price-based curtailment, only uptime-based
      curtailmentReason: `Curtailment based on expected uptime (${expectedUptimePercent}%) - operating during cheapest ${targetOperatingHours} hours`,
      detailedRateComponents: avgDetailedRates
    };

    console.log('=== DETAILED ENERGY RATE BREAKDOWN ===');
    console.log('Price analysis:', {
      region: energyRateBreakdown.region,
      currencyNote: energyRateBreakdown.currencyNote,
      originalMinPrice: `$${(minPrice/wholesaleDiscountFactor).toFixed(4)}/kWh`,
      originalMaxPrice: `$${(maxPrice/wholesaleDiscountFactor).toFixed(4)}/kWh`,
      discountedMinPrice: `$${minPrice.toFixed(4)}/kWh`,
      discountedMaxPrice: `$${maxPrice.toFixed(4)}/kWh`,
      originalAveragePrice: `$${(overallAveragePrice).toFixed(4)}/kWh`,
      discountedAveragePrice: `$${(overallAveragePrice * wholesaleDiscountFactor).toFixed(4)}/kWh`,
      averageOperatingPrice: `$${averageElectricityCost.toFixed(4)}/kWh`,
      wholesaleDiscount: '60%'
    });
    
    console.log('=== DETAILED RATE COMPONENTS ===');
    console.log('Energy Rate:', `$${avgDetailedRates.energyRate.toFixed(4)}/kWh`);
    console.log('Transmission Rate:', `$${avgDetailedRates.transmissionRate.toFixed(4)}/kWh`);
    console.log('Distribution Rate:', `$${avgDetailedRates.distributionRate.toFixed(4)}/kWh`);
    console.log('Ancillary Services:', `$${avgDetailedRates.ancillaryServicesRate.toFixed(4)}/kWh`);
    console.log('Regulatory Fees:', `$${avgDetailedRates.regulatoryFeesRate.toFixed(4)}/kWh`);
    console.log('Total All-In Rate:', `$${avgDetailedRates.totalRate.toFixed(4)}/kWh`);
    
    console.log('Operation summary:', {
      totalHours: 8760,
      targetOperatingHours: targetOperatingHours.toLocaleString(),
      targetCurtailedHours: targetCurtailedHours.toLocaleString(),
      expectedUptimePercent: `${expectedUptimePercent}%`,
      actualUptimePercent: `${actualUptimePercent.toFixed(1)}%`,
      operatingStrategy: 'Operating during cheapest hours to maximize profitability'
    });
    
    console.log('Financial summary:', {
      totalKWhConsumed: totalKWhConsumed.toLocaleString(),
      totalElectricityCost: `$${totalElectricityCost.toLocaleString()}`,
      averageElectricityCost: `$${averageElectricityCost.toFixed(4)}/kWh`,
      hostingRevenue: `$${(totalKWhConsumed * hostingFeeRate).toLocaleString()}`,
      grossMargin: `$${((totalKWhConsumed * hostingFeeRate) - totalElectricityCost).toLocaleString()}`,
      grossMarginPercent: `${(((totalKWhConsumed * hostingFeeRate) - totalElectricityCost) / (totalKWhConsumed * hostingFeeRate) * 100).toFixed(1)}%`
    });

    console.log('=== UPTIME ANALYSIS ===');
    console.log(`✅ Uptime target achieved: ${actualUptimePercent.toFixed(1)}% (target: ${expectedUptimePercent}%)`);
    console.log(`🎯 Operating during cheapest ${targetOperatingHours} hours to maximize profitability`);
    console.log(`💰 Wholesale discount: 60% off wholesale rates (applied universally)`);

    return {
      totalKWhConsumed,
      totalElectricityCost,
      actualUptimePercent,
      curtailedHours: targetCurtailedHours,
      averageElectricityCost,
      energyRateBreakdown
    };
  }

  private static calculateDetailedRateBreakdown(baseWholesaleRate: number, region: string) {
    // Calculate detailed rate components based on typical utility rate structures
    const energyRate = baseWholesaleRate; // Base wholesale energy cost
    
    // Transmission rates (typically 15-25% of energy rate)
    const transmissionRate = energyRate * 0.20;
    
    // Distribution rates (typically 25-35% of energy rate)
    const distributionRate = energyRate * 0.30;
    
    // Ancillary services (typically 5-10% of energy rate)
    const ancillaryServicesRate = energyRate * 0.08;
    
    // Regulatory fees and other charges (typically 3-7% of energy rate)
    const regulatoryFeesRate = energyRate * 0.05;
    
    const totalRate = energyRate + transmissionRate + distributionRate + ancillaryServicesRate + regulatoryFeesRate;
    
    return {
      energyRate,
      transmissionRate,
      distributionRate,
      ancillaryServicesRate,
      regulatoryFeesRate,
      totalRate,
      breakdown: {
        energy: `${((energyRate / totalRate) * 100).toFixed(1)}%`,
        transmission: `${((transmissionRate / totalRate) * 100).toFixed(1)}%`,
        distribution: `${((distributionRate / totalRate) * 100).toFixed(1)}%`,
        ancillaryServices: `${((ancillaryServicesRate / totalRate) * 100).toFixed(1)}%`,
        regulatoryFees: `${((regulatoryFeesRate / totalRate) * 100).toFixed(1)}%`
      }
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

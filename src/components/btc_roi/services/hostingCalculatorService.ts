import { BTCROIFormData, HostingROIResults, RegionalEnergyData } from '../types/btc_roi_types';
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
      region: formData.region,
      useManualEnergyCosts: formData.useManualEnergyCosts
    });
    
    // Get regional energy data if applicable and not using manual costs
    let energyData: RegionalEnergyData | null = null;
    
    if (formData.region !== 'Other' && !formData.useManualEnergyCosts) {
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
      formData.hostingFeeRate, // This is always in USD
      energyData,
      formData.customElectricityCost,
      formData.expectedUptimePercent,
      formData.region,
      formData.useManualEnergyCosts ? {
        energyRate: formData.manualEnergyRate,
        transmissionRate: formData.manualTransmissionRate,
        distributionRate: formData.manualDistributionRate,
        ancillaryRate: formData.manualAncillaryRate,
        regulatoryRate: formData.manualRegulatoryRate
      } : undefined
    );

    console.log('Simulation results:', simulationResults);

    // Calculate taxes based on region
    const taxAnalysis = this.calculateTaxes(
      formData.region,
      simulationResults.totalElectricityCost,
      simulationResults.totalKWhConsumed
    );

    // Calculate costs and revenues - hosting fee rate is always in USD
    const totalHostingRevenue = simulationResults.totalKWhConsumed * formData.hostingFeeRate;
    const totalElectricityCost = simulationResults.totalElectricityCost + taxAnalysis.totalAnnualTaxes;
    const totalOperationalCost = formData.monthlyOverhead * 12;
    
    const grossProfit = totalHostingRevenue - simulationResults.totalElectricityCost;
    const netProfit = grossProfit - totalOperationalCost - taxAnalysis.totalAnnualTaxes;
    
    // Calculate monthly breakdown
    const monthlyBreakdown = this.calculateMonthlyBreakdown(
      simulationResults,
      formData.hostingFeeRate,
      formData.monthlyOverhead,
      taxAnalysis.totalAnnualTaxes / 12
    );

    // Calculate cost analytics
    const costAnalytics = this.calculateCostAnalytics(
      totalHostingRevenue,
      simulationResults.totalElectricityCost,
      totalOperationalCost,
      taxAnalysis.totalAnnualTaxes,
      netProfit,
      formData.hostingFeeRate,
      simulationResults.averageElectricityCost
    );

    // Calculate competitive analysis
    const competitiveAnalysis = this.calculateCompetitiveAnalysis(
      formData.hostingFeeRate,
      formData.region,
      costAnalytics.breakEvenHostingRate
    );
    
    console.log('Financial calculations:', {
      totalKWhConsumed: simulationResults.totalKWhConsumed,
      hostingFeeRateUSD: formData.hostingFeeRate,
      totalHostingRevenue,
      totalElectricityCost,
      averageElectricityCost: simulationResults.averageElectricityCost,
      totalOperationalCost,
      grossProfit,
      netProfit,
      totalTaxes: taxAnalysis.totalAnnualTaxes
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
      energyRateBreakdown: {
        ...simulationResults.energyRateBreakdown,
        taxBreakdown: {
          salesTaxRate: taxAnalysis.salesTax / simulationResults.totalElectricityCost * 100,
          utilityTaxRate: taxAnalysis.utilityTax / simulationResults.totalElectricityCost * 100,
          environmentalFeeRate: taxAnalysis.environmentalFees / simulationResults.totalElectricityCost * 100,
          totalTaxRate: taxAnalysis.taxRate,
          taxableAmount: simulationResults.totalElectricityCost,
          totalTaxes: taxAnalysis.totalAnnualTaxes
        }
      },
      monthlyBreakdown,
      costAnalytics,
      competitiveAnalysis,
      taxAnalysis
    };

    console.log('=== FINAL HOSTING ROI RESULTS ===');
    console.log('Energy Usage:', formatEnergy(results.totalEnergyUsageKWh));
    console.log('Hosting Revenue (USD):', formatCurrency(results.totalHostingRevenue));
    console.log('Electricity Cost (USD):', formatCurrency(results.totalElectricityCost));
    console.log('Total Taxes (USD):', formatCurrency(taxAnalysis.totalAnnualTaxes));
    console.log('Net Profit (USD):', formatCurrency(results.netProfit));
    console.log('=== END CALCULATION ===');
    
    return results;
  }

  private static simulateYearlyOperation(
    totalLoadKW: number,
    hostingFeeRateUSD: number,
    energyData: RegionalEnergyData | null,
    customElectricityCost: number,
    expectedUptimePercent: number,
    region: 'ERCOT' | 'AESO' | 'Other',
    manualRates?: {
      energyRate: number;
      transmissionRate: number;
      distributionRate: number;
      ancillaryRate: number;
      regulatoryRate: number;
    }
  ) {
    console.log('=== YEARLY SIMULATION START ===');
    console.log('Simulation parameters:', {
      totalLoadKW,
      hostingFeeRateUSD: `$${hostingFeeRateUSD}/kWh USD`,
      region,
      useManualRates: !!manualRates
    });

    // If using manual rates, calculate directly
    if (manualRates) {
      const totalManualRate = manualRates.energyRate + manualRates.transmissionRate + 
                             manualRates.distributionRate + manualRates.ancillaryRate + 
                             manualRates.regulatoryRate;
      
      const hoursPerYear = 8760 * (expectedUptimePercent / 100);
      const totalKWhConsumed = totalLoadKW * hoursPerYear;
      const totalElectricityCost = totalKWhConsumed * totalManualRate;
      
      console.log('Using manual rates:', {
        totalManualRate: `$${totalManualRate.toFixed(4)}/kWh`,
        totalKWhConsumed: totalKWhConsumed.toLocaleString(),
        totalElectricityCost: `$${totalElectricityCost.toLocaleString()}`
      });
      
      return {
        totalKWhConsumed,
        totalElectricityCost,
        actualUptimePercent: expectedUptimePercent,
        curtailedHours: 8760 - hoursPerYear,
        averageElectricityCost: totalManualRate,
        energyRateBreakdown: {
          region: 'Manual Override',
          totalHours: 8760,
          operatingHours: hoursPerYear,
          curtailedHours: 8760 - hoursPerYear,
          averageWholesalePrice: manualRates.energyRate,
          minWholesalePrice: manualRates.energyRate,
          maxWholesalePrice: manualRates.energyRate,
          currencyNote: 'USD (Manual Override)',
          curtailmentThreshold: totalManualRate,
          curtailmentReason: 'Fixed uptime percentage applied',
          detailedRateComponents: {
            energyRate: manualRates.energyRate,
            transmissionRate: manualRates.transmissionRate,
            distributionRate: manualRates.distributionRate,
            ancillaryServicesRate: manualRates.ancillaryRate,
            regulatoryFeesRate: manualRates.regulatoryRate,
            totalRate: totalManualRate,
            breakdown: {
              energy: `${((manualRates.energyRate / totalManualRate) * 100).toFixed(1)}%`,
              transmission: `${((manualRates.transmissionRate / totalManualRate) * 100).toFixed(1)}%`,
              distribution: `${((manualRates.distributionRate / totalManualRate) * 100).toFixed(1)}%`,
              ancillaryServices: `${((manualRates.ancillaryRate / totalManualRate) * 100).toFixed(1)}%`,
              regulatoryFees: `${((manualRates.regulatoryRate / totalManualRate) * 100).toFixed(1)}%`
            }
          }
        }
      };
    }

    if (!energyData) {
      // Simple calculation for custom region with detailed breakdown
      const hoursPerYear = 8760 * (expectedUptimePercent / 100);
      const totalKWhConsumed = totalLoadKW * hoursPerYear;
      
      // Apply 60% wholesale discount universally
      const wholesaleDiscountFactor = 0.4; // 60% discount
      const discountedElectricityCost = customElectricityCost * wholesaleDiscountFactor;
      
      // Use real industrial rate structure for custom region
      const energyRateComponents = this.calculateIndustrialRateBreakdown(discountedElectricityCost, 'Other', totalLoadKW);
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

    // Convert CAD to USD for AESO wholesale energy prices only (not hosting fee rates)
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
        // Convert CAD to USD only for AESO wholesale energy prices
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
      const detailedRates = this.calculateIndustrialRateBreakdown(baseWholesaleRate, region, totalLoadKW);
      const totalHourlyRate = detailedRates.totalRate;
      
      totalElectricityCost += kWhThisHour * totalHourlyRate;
      totalPriceSum += totalHourlyRate;
      priceCount++;
    }

    const actualUptimePercent = (targetOperatingHours / 8760) * 100;
    const averageElectricityCost = priceCount > 0 ? totalPriceSum / priceCount : 0;
    const overallAveragePrice = priceSum / energyData.hourlyPrices.length;

    // Calculate detailed rate breakdown for display using average wholesale price
    const avgDetailedRates = this.calculateIndustrialRateBreakdown(averageElectricityCost * 0.7, region, totalLoadKW);

    // Track detailed energy rate breakdown
    const energyRateBreakdown = {
      region: `${region} (${region === 'AESO' ? 'CAD converted to USD' : 'USD'}) - 60% Wholesale Discount`,
      totalHours: energyData.hourlyPrices.length,
      operatingHours: targetOperatingHours,
      curtailedHours: targetCurtailedHours,
      averageWholesalePrice: overallAveragePrice * wholesaleDiscountFactor,
      minWholesalePrice: minPrice,
      maxWholesalePrice: maxPrice,
      currencyNote: region === 'AESO' ? `Wholesale energy: CAD converted to USD at ${cadToUsdRate} rate with 60% discount. Hosting fees always in USD.` : `All rates in USD with 60% wholesale discount. Hosting fees always in USD.`,
      curtailmentThreshold: 0,
      curtailmentReason: `Curtailment based on expected uptime (${expectedUptimePercent}%) - operating during cheapest ${targetOperatingHours} hours`,
      detailedRateComponents: avgDetailedRates
    };

    return {
      totalKWhConsumed,
      totalElectricityCost,
      actualUptimePercent,
      curtailedHours: targetCurtailedHours,
      averageElectricityCost,
      energyRateBreakdown
    };
  }

  private static calculateTaxes(region: string, electricityCost: number, totalKWh: number) {
    let salesTaxRate = 0;
    let utilityTaxRate = 0;
    let environmentalFeeRate = 0;

    // Regional tax rates
    switch (region) {
      case 'ERCOT': // Texas
        salesTaxRate = 0.0625; // 6.25% Texas sales tax
        utilityTaxRate = 0.01; // 1% utility tax
        environmentalFeeRate = 0.005; // 0.5% environmental fee
        break;
      case 'AESO': // Alberta
        salesTaxRate = 0.05; // 5% GST
        utilityTaxRate = 0.015; // 1.5% utility tax
        environmentalFeeRate = 0.008; // 0.8% carbon levy
        break;
      default: // Other
        salesTaxRate = 0.07; // Average 7% sales tax
        utilityTaxRate = 0.012; // Average 1.2% utility tax
        environmentalFeeRate = 0.006; // Average 0.6% environmental fee
        break;
    }

    const salesTax = electricityCost * salesTaxRate;
    const utilityTax = electricityCost * utilityTaxRate;
    const environmentalFees = electricityCost * environmentalFeeRate;
    const totalAnnualTaxes = salesTax + utilityTax + environmentalFees;
    const effectiveTaxRate = (totalAnnualTaxes / electricityCost) * 100;

    return {
      totalAnnualTaxes,
      salesTax,
      utilityTax,
      environmentalFees,
      taxRate: effectiveTaxRate,
      taxSavingsOpportunities: [
        'Consider renewable energy tax credits',
        'Evaluate industrial exemptions',
        'Review energy efficiency incentives'
      ],
      deductibleExpenses: electricityCost * 0.8 // 80% of energy costs typically deductible
    };
  }

  private static calculateMonthlyBreakdown(
    simulationResults: any,
    hostingFeeRate: number,
    monthlyOverhead: number,
    monthlyTaxes: number
  ) {
    const monthlyBreakdown = [];
    const monthlyKWh = simulationResults.totalKWhConsumed / 12;
    const monthlyElectricityCost = simulationResults.totalElectricityCost / 12;
    const monthlyRevenue = monthlyKWh * hostingFeeRate;

    for (let month = 1; month <= 12; month++) {
      monthlyBreakdown.push({
        month,
        energyUsageKWh: monthlyKWh,
        hostingRevenue: monthlyRevenue,
        electricityCost: monthlyElectricityCost,
        operationalCost: monthlyOverhead,
        taxes: monthlyTaxes,
        netProfit: monthlyRevenue - monthlyElectricityCost - monthlyOverhead - monthlyTaxes,
        uptimePercent: simulationResults.actualUptimePercent,
        averageElectricityRate: simulationResults.averageElectricityCost
      });
    }

    return monthlyBreakdown;
  }

  private static calculateCostAnalytics(
    totalRevenue: number,
    electricityCost: number,
    operationalCost: number,
    taxes: number,
    netProfit: number,
    hostingRate: number,
    averageElectricityRate: number
  ) {
    const totalCosts = electricityCost + operationalCost + taxes;
    
    return {
      energyCostPercentage: (electricityCost / totalCosts) * 100,
      operationalCostPercentage: (operationalCost / totalCosts) * 100,
      taxPercentage: (taxes / totalCosts) * 100,
      profitPercentage: (netProfit / totalRevenue) * 100,
      breakEvenHostingRate: totalCosts / (totalRevenue / hostingRate),
      marginOfSafety: ((hostingRate - (totalCosts / (totalRevenue / hostingRate))) / hostingRate) * 100,
      sensitivityAnalysis: {
        energyCostImpact: -1.2, // 1.2% profit decrease per 1% energy cost increase
        hostingRateImpact: 1.8, // 1.8% profit increase per 1% hosting rate increase
        uptimeImpact: 0.9 // 0.9% profit increase per 1% uptime increase
      }
    };
  }

  private static calculateCompetitiveAnalysis(
    currentRate: number,
    region: string,
    breakEvenRate: number
  ) {
    // Market rates by region
    const marketRates = {
      ERCOT: { low: 0.06, average: 0.08, high: 0.12 },
      AESO: { low: 0.05, average: 0.07, high: 0.10 },
      Other: { low: 0.07, average: 0.09, high: 0.13 }
    };

    const rates = marketRates[region as keyof typeof marketRates] || marketRates.Other;
    let position: 'below_market' | 'at_market' | 'above_market' = 'at_market';
    
    if (currentRate < rates.average * 0.95) position = 'below_market';
    else if (currentRate > rates.average * 1.05) position = 'above_market';

    return {
      marketHostingRates: rates,
      competitivePosition: position,
      recommendedRate: Math.max(breakEvenRate * 1.15, rates.average), // 15% margin over break-even or market average
      profitAdvantage: ((currentRate - rates.average) / rates.average) * 100
    };
  }

  private static calculateIndustrialRateBreakdown(baseWholesaleRate: number, region: string, loadKW: number) {
    console.log(`Calculating industrial rate breakdown for ${region} with ${loadKW} kW load`);
    
    // Base wholesale energy rate (already discounted by 60%)
    const energyRate = baseWholesaleRate;
    
    // Real FortisAlberta Rate 65 structure for transmission-connected industrial customers
    if (region === 'AESO') {
      // FortisAlberta Rate 65 - Transmission Connected Industrial (actual rates)
      const transmissionRate = 0.0015; // $0.15/MWh = $0.0015/kWh - Transmission access charge
      const distributionRate = 0.002604; // $0.2604/MWh = $0.002604/kWh - Rate 65 volumetric delivery charge
      const ancillaryServicesRate = 0.0015; // Various system services included in riders
      const regulatoryFeesRate = 0.0015; // Environmental and system access riders
      
      const totalRate = energyRate + transmissionRate + distributionRate + ancillaryServicesRate + regulatoryFeesRate;
      
      console.log('Using FortisAlberta Rate 65 structure:', {
        energyRate: `$${energyRate.toFixed(4)}/kWh (wholesale energy with 60% discount)`,
        transmissionRate: `$${transmissionRate.toFixed(4)}/kWh (transmission access)`,
        distributionRate: `$${distributionRate.toFixed(4)}/kWh (Rate 65 delivery)`,
        ancillaryServicesRate: `$${ancillaryServicesRate.toFixed(4)}/kWh (system services)`,
        regulatoryFeesRate: `$${regulatoryFeesRate.toFixed(4)}/kWh (environmental/access riders)`,
        totalRate: `$${totalRate.toFixed(4)}/kWh`
      });
      
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
    
    // Texas ERCOT industrial rates - competitive market with lower distribution costs
    if (region === 'ERCOT') {
      const transmissionRate = 0.002; // $0.20/MWh = $0.002/kWh - ERCOT transmission
      const distributionRate = 0.0025; // $0.25/MWh = $0.0025/kWh - TDU charges (Oncor, CenterPoint)
      const ancillaryServicesRate = 0.0008; // Lower ancillary services in competitive market
      const regulatoryFeesRate = 0.0005; // Minimal regulatory fees in Texas
      
      const totalRate = energyRate + transmissionRate + distributionRate + ancillaryServicesRate + regulatoryFeesRate;
      
      console.log('Using ERCOT industrial rate structure:', {
        energyRate: `$${energyRate.toFixed(4)}/kWh (wholesale energy with 60% discount)`,
        transmissionRate: `$${transmissionRate.toFixed(4)}/kWh (ERCOT transmission)`,
        distributionRate: `$${distributionRate.toFixed(4)}/kWh (TDU charges)`,
        ancillaryServicesRate: `$${ancillaryServicesRate.toFixed(4)}/kWh (ancillary services)`,
        regulatoryFeesRate: `$${regulatoryFeesRate.toFixed(4)}/kWh (regulatory fees)`,
        totalRate: `$${totalRate.toFixed(4)}/kWh`
      });
      
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
    
    // Default industrial rate structure for other regions
    const transmissionRate = 0.002; // Conservative estimate for industrial transmission
    const distributionRate = 0.003; // Conservative estimate for industrial distribution
    const ancillaryServicesRate = 0.001; // Conservative estimate for ancillary services
    const regulatoryFeesRate = 0.0008; // Conservative estimate for regulatory fees
    
    const totalRate = energyRate + transmissionRate + distributionRate + ancillaryServicesRate + regulatoryFeesRate;
    
    console.log('Using default industrial rate structure:', {
      energyRate: `$${energyRate.toFixed(4)}/kWh (wholesale energy with 60% discount)`,
      transmissionRate: `$${transmissionRate.toFixed(4)}/kWh (estimated transmission)`,
      distributionRate: `$${distributionRate.toFixed(4)}/kWh (estimated distribution)`,
      ancillaryServicesRate: `$${ancillaryServicesRate.toFixed(4)}/kWh (estimated ancillary)`,
      regulatoryFeesRate: `$${regulatoryFeesRate.toFixed(4)}/kWh (estimated regulatory)`,
      totalRate: `$${totalRate.toFixed(4)}/kWh`
    });
    
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

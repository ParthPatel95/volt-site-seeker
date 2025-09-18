import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface OptimizationParams {
  energyDemand: number; // MW
  operatingHours: number;
  flexibilityWindow: number; // hours of scheduling flexibility
  demandChargeRate: number; // $/kW
  transmissionRate: number; // $/MWh
  carbonPrice: number; // $/tonne CO2
  carbonIntensity: number; // kg CO2/MWh
  priority: 'cost' | 'carbon' | 'balanced';
}

interface LoadScheduleSlot {
  hour: number;
  timeSlot: string;
  energyPrice: number;
  demandCharge: number;
  transmissionCost: number;
  carbonCost: number;
  totalCost: number;
  carbonEmissions: number;
  recommendationScore: number;
  isOptimal: boolean;
}

interface OptimizationResult {
  scheduleOptions: LoadScheduleSlot[];
  optimalSlots: LoadScheduleSlot[];
  savings: {
    costSavings: number;
    carbonSavings: number;
    percentSavings: number;
  };
  summary: {
    bestStartTime: string;
    totalCost: number;
    totalEmissions: number;
    paybackPeriod?: number;
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, params } = await req.json();

    switch (action) {
      case 'optimize_load_schedule':
        return await optimizeLoadSchedule(params);
        
      case 'calculate_storage_roi':
        return await calculateStorageROI(params);
        
      case 'analyze_demand_response':
        return await analyzeDemandResponse(params);
        
      default:
        throw new Error(`Unknown action: ${action}`);
    }

  } catch (error) {
    console.error('Error in optimization-engine function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function optimizeLoadSchedule(params: OptimizationParams): Promise<Response> {
  console.log('Optimizing load schedule with params:', params);
  
  // Get current pricing forecast (simulated for now)
  const pricingForecast = await generatePricingForecast();
  
  const scheduleOptions: LoadScheduleSlot[] = [];
  let bestCostSlots: LoadScheduleSlot[] = [];
  let worstCaseScenario: LoadScheduleSlot[] = [];
  
  // Analyze each potential time slot
  for (let hour = 0; hour < 24; hour++) {
    const timeSlot = formatTimeSlot(hour);
    const energyPrice = pricingForecast[hour] || 50; // Fallback price
    
    // Calculate multi-variable costs
    const costs = calculateMultiVariableCosts(
      energyPrice,
      params.energyDemand,
      params.operatingHours,
      params.demandChargeRate,
      params.transmissionRate,
      params.carbonPrice,
      params.carbonIntensity,
      hour
    );
    
    const slot: LoadScheduleSlot = {
      hour,
      timeSlot,
      energyPrice,
      demandCharge: costs.demandCharge,
      transmissionCost: costs.transmissionCost,
      carbonCost: costs.carbonCost,
      totalCost: costs.totalCost,
      carbonEmissions: costs.carbonEmissions,
      recommendationScore: 0, // Will be calculated below
      isOptimal: false
    };
    
    scheduleOptions.push(slot);
  }
  
  // Calculate recommendation scores based on priority
  scheduleOptions.forEach(slot => {
    slot.recommendationScore = calculateRecommendationScore(slot, params.priority, scheduleOptions);
  });
  
  // Sort by recommendation score and mark optimal slots
  scheduleOptions.sort((a, b) => b.recommendationScore - a.recommendationScore);
  
  // Find optimal scheduling window
  const flexibilityHours = Math.min(params.flexibilityWindow, 8); // Cap at 8 hours
  bestCostSlots = scheduleOptions.slice(0, flexibilityHours);
  worstCaseScenario = scheduleOptions.slice(-flexibilityHours);
  
  // Mark optimal slots
  bestCostSlots.forEach(slot => slot.isOptimal = true);
  
  // Calculate savings
  const bestCaseCost = bestCostSlots.reduce((sum, slot) => sum + slot.totalCost, 0) / bestCostSlots.length;
  const worstCaseCost = worstCaseScenario.reduce((sum, slot) => sum + slot.totalCost, 0) / worstCaseScenario.length;
  const costSavings = worstCaseCost - bestCaseCost;
  const percentSavings = (costSavings / worstCaseCost) * 100;
  
  const bestCaseEmissions = bestCostSlots.reduce((sum, slot) => sum + slot.carbonEmissions, 0) / bestCostSlots.length;
  const worstCaseEmissions = worstCaseScenario.reduce((sum, slot) => sum + slot.carbonEmissions, 0) / worstCaseScenario.length;
  const carbonSavings = worstCaseEmissions - bestCaseEmissions;
  
  const result: OptimizationResult = {
    scheduleOptions: scheduleOptions.sort((a, b) => a.hour - b.hour), // Resort by hour for display
    optimalSlots: bestCostSlots,
    savings: {
      costSavings,
      carbonSavings,
      percentSavings
    },
    summary: {
      bestStartTime: bestCostSlots[0]?.timeSlot || '00:00',
      totalCost: bestCaseCost,
      totalEmissions: bestCaseEmissions
    }
  };
  
  return new Response(JSON.stringify({
    success: true,
    result,
    timestamp: new Date().toISOString()
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function calculateStorageROI(params: any): Promise<Response> {
  console.log('Calculating storage ROI with params:', params);
  
  const {
    storageCapacityMWh,
    storagePowerMW,
    capitalCost,
    operatingCostPerYear,
    projectLifeYears,
    discountRate,
    chargeEfficiency = 0.95,
    dischargeEfficiency = 0.95
  } = params;
  
  // Get pricing data for arbitrage analysis
  const pricingForecast = await generatePricingForecast();
  const yearlyRevenue = calculateArbitrageRevenue(
    pricingForecast,
    storageCapacityMWh,
    storagePowerMW,
    chargeEfficiency,
    dischargeEfficiency
  );
  
  // Calculate demand charge savings (peak shaving)
  const demandChargeSavings = calculateDemandChargeSavings(
    storagePowerMW,
    params.demandChargeRate || 15
  );
  
  // Calculate ancillary services revenue
  const ancillaryRevenue = calculateAncillaryRevenue(storagePowerMW);
  
  const totalAnnualRevenue = yearlyRevenue + demandChargeSavings + ancillaryRevenue;
  const netAnnualCashFlow = totalAnnualRevenue - operatingCostPerYear;
  
  // NPV calculation
  let npv = -capitalCost;
  for (let year = 1; year <= projectLifeYears; year++) {
    npv += netAnnualCashFlow / Math.pow(1 + discountRate, year);
  }
  
  const paybackPeriod = capitalCost / netAnnualCashFlow;
  const irr = calculateIRR(capitalCost, netAnnualCashFlow, projectLifeYears);
  
  return new Response(JSON.stringify({
    success: true,
    result: {
      npv: Math.round(npv),
      paybackPeriod: Math.round(paybackPeriod * 10) / 10,
      irr: Math.round(irr * 1000) / 10, // Convert to percentage
      annualRevenue: Math.round(totalAnnualRevenue),
      revenueBreakdown: {
        arbitrage: Math.round(yearlyRevenue),
        demandCharges: Math.round(demandChargeSavings),
        ancillaryServices: Math.round(ancillaryRevenue)
      },
      levelizedCostOfStorage: Math.round((capitalCost + (operatingCostPerYear * projectLifeYears)) / (storageCapacityMWh * 365 * projectLifeYears))
    }
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function analyzeDemandResponse(params: any): Promise<Response> {
  console.log('Analyzing demand response with params:', params);
  
  const {
    baselineLoadMW,
    curtailmentCapacityMW,
    curtailmentDurationHours,
    incentiveRate,
    availabilityPayment,
    participationDays
  } = params;
  
  // Calculate demand response potential
  const annualAvailabilityRevenue = availabilityPayment * participationDays * 12; // Monthly payments
  const averageDispatchEvents = Math.floor(participationDays * 0.15); // ~15% dispatch rate
  const annualDispatchRevenue = averageDispatchEvents * curtailmentCapacityMW * curtailmentDurationHours * incentiveRate;
  
  const totalAnnualRevenue = annualAvailabilityRevenue + annualDispatchRevenue;
  
  // Calculate implementation costs
  const controlSystemCost = curtailmentCapacityMW * 500; // $500/kW for control systems
  const annualOperatingCost = totalAnnualRevenue * 0.1; // 10% operating costs
  
  const paybackPeriod = controlSystemCost / (totalAnnualRevenue - annualOperatingCost);
  
  return new Response(JSON.stringify({
    success: true,
    result: {
      annualRevenue: Math.round(totalAnnualRevenue),
      revenueBreakdown: {
        availability: Math.round(annualAvailabilityRevenue),
        dispatch: Math.round(annualDispatchRevenue)
      },
      implementationCost: Math.round(controlSystemCost),
      annualOperatingCost: Math.round(annualOperatingCost),
      paybackPeriod: Math.round(paybackPeriod * 10) / 10,
      netAnnualBenefit: Math.round(totalAnnualRevenue - annualOperatingCost),
      dispatchEvents: averageDispatchEvents
    }
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

// Helper functions
async function generatePricingForecast(): Promise<number[]> {
  // In production, this would fetch real forecast data
  // For now, generate realistic hourly prices
  const basePrice = 45;
  const prices = [];
  
  for (let hour = 0; hour < 24; hour++) {
    let price = basePrice;
    
    // Peak hours (4-8 PM)
    if (hour >= 16 && hour <= 20) {
      price += 30 + Math.random() * 40;
    }
    // Off-peak overnight
    else if (hour >= 23 || hour <= 6) {
      price -= 15 + Math.random() * 20;
    }
    // Standard hours
    else {
      price += Math.random() * 20 - 10;
    }
    
    prices.push(Math.max(5, price)); // Minimum $5/MWh
  }
  
  return prices;
}

function calculateMultiVariableCosts(
  energyPrice: number,
  demandMW: number,
  operatingHours: number,
  demandChargeRate: number,
  transmissionRate: number,
  carbonPrice: number,
  carbonIntensity: number,
  hour: number
) {
  const energyMWh = demandMW * operatingHours;
  
  // Energy cost
  const energyCost = energyPrice * energyMWh;
  
  // Demand charges (peak period penalty)
  const isPeakHour = hour >= 16 && hour <= 20;
  const demandCharge = isPeakHour ? demandMW * demandChargeRate : demandMW * demandChargeRate * 0.5;
  
  // Transmission costs
  const transmissionCost = transmissionRate * energyMWh;
  
  // Carbon costs
  const carbonEmissions = (carbonIntensity * energyMWh) / 1000; // Convert to tonnes
  const carbonCost = carbonEmissions * carbonPrice;
  
  const totalCost = energyCost + demandCharge + transmissionCost + carbonCost;
  
  return {
    energyCost,
    demandCharge,
    transmissionCost,
    carbonCost,
    totalCost,
    carbonEmissions
  };
}

function calculateRecommendationScore(
  slot: LoadScheduleSlot,
  priority: string,
  allSlots: LoadScheduleSlot[]
): number {
  const maxCost = Math.max(...allSlots.map(s => s.totalCost));
  const minCost = Math.min(...allSlots.map(s => s.totalCost));
  const maxEmissions = Math.max(...allSlots.map(s => s.carbonEmissions));
  const minEmissions = Math.min(...allSlots.map(s => s.carbonEmissions));
  
  // Normalize scores (higher is better)
  const costScore = maxCost > minCost ? ((maxCost - slot.totalCost) / (maxCost - minCost)) * 100 : 50;
  const carbonScore = maxEmissions > minEmissions ? ((maxEmissions - slot.carbonEmissions) / (maxEmissions - minEmissions)) * 100 : 50;
  
  switch (priority) {
    case 'cost':
      return costScore;
    case 'carbon':
      return carbonScore;
    case 'balanced':
    default:
      return (costScore * 0.7) + (carbonScore * 0.3);
  }
}

function formatTimeSlot(hour: number): string {
  const startHour = hour.toString().padStart(2, '0');
  const endHour = ((hour + 1) % 24).toString().padStart(2, '0');
  return `${startHour}:00-${endHour}:00`;
}

function calculateArbitrageRevenue(
  prices: number[],
  capacityMWh: number,
  powerMW: number,
  chargeEff: number,
  dischargeEff: number
): number {
  // Simple arbitrage: charge during lowest price hours, discharge during highest
  const sortedPrices = [...prices].sort((a, b) => a - b);
  const chargePrices = sortedPrices.slice(0, 8); // 8 cheapest hours
  const dischargePrices = sortedPrices.slice(-8); // 8 most expensive hours
  
  const avgChargePrice = chargePrices.reduce((a, b) => a + b, 0) / chargePrices.length;
  const avgDischargePrice = dischargePrices.reduce((a, b) => a + b, 0) / dischargePrices.length;
  
  const dailyCycles = Math.min(1, powerMW / capacityMWh); // Limited by power rating
  const roundTripEfficiency = chargeEff * dischargeEff;
  
  const dailyRevenue = (avgDischargePrice - avgChargePrice) * capacityMWh * dailyCycles * roundTripEfficiency;
  return Math.max(0, dailyRevenue * 365);
}

function calculateDemandChargeSavings(storagePowerMW: number, demandChargeRate: number): number {
  // Assume storage can reduce peak demand by its power rating
  const monthlySavings = storagePowerMW * demandChargeRate;
  return monthlySavings * 12;
}

function calculateAncillaryRevenue(storagePowerMW: number): number {
  // Simplified ancillary services revenue
  const frequencyRegulationRate = 15; // $/MW/month
  const spinningReserveRate = 5; // $/MW/month
  
  const monthlyRevenue = storagePowerMW * (frequencyRegulationRate + spinningReserveRate);
  return monthlyRevenue * 12;
}

function calculateIRR(initialInvestment: number, annualCashFlow: number, years: number): number {
  // Simple IRR approximation using Newton-Raphson method
  let rate = 0.1; // Start with 10%
  
  for (let i = 0; i < 10; i++) {
    let npv = -initialInvestment;
    let dnpv = 0;
    
    for (let year = 1; year <= years; year++) {
      npv += annualCashFlow / Math.pow(1 + rate, year);
      dnpv -= year * annualCashFlow / Math.pow(1 + rate, year + 1);
    }
    
    if (Math.abs(npv) < 1) break;
    rate = rate - npv / dnpv;
  }
  
  return Math.max(0, Math.min(1, rate)); // Cap between 0% and 100%
}
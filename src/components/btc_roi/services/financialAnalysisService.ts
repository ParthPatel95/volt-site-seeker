// Advanced Financial Analysis Service for BTC Mining ROI
// Provides NPV, IRR, MIRR, Payback Period, and other financial metrics

import { BTCNetworkData, BTCROIFormData } from '../types/btc_roi_types';

export interface FinancialMetrics {
  // Core Investment Metrics
  npv: number; // Net Present Value at 10% discount
  irr: number; // Internal Rate of Return
  mirr: number; // Modified IRR with reinvestment rate
  paybackPeriodMonths: number;
  discountedPaybackMonths: number;
  profitabilityIndex: number;
  
  // Operating Metrics
  ebitda: number; // Earnings before interest, taxes, depreciation
  grossMargin: number; // percentage
  netMargin: number; // percentage
  operatingMargin: number;
  cashOnCashReturn: number; // percentage
  
  // Break-even Analysis
  breakEvenBTCPrice: number;
  breakEvenElectricityRate: number;
  breakEvenDifficulty: number;
  safetyMargin: number; // How far above break-even
  
  // Risk Metrics
  volatilityExposure: number;
  difficultyRiskScore: number;
  priceRiskScore: number;
  operationalRiskScore: number;
  overallRiskScore: number;
  
  // Depreciation
  annualDepreciation: number;
  monthlyDepreciation: number;
  bookValueYear1: number;
  bookValueYear2: number;
  bookValueYear3: number;
  
  // Cash Flow Projections (36 months)
  cashFlowProjections: CashFlowMonth[];
  cumulativeCashFlow: number[];
  
  // Sensitivity Data
  sensitivityMatrix: SensitivityPoint[];
  tornadoData: TornadoItem[];
  
  // Scenario Analysis
  scenarios: ScenarioResult[];
}

export interface CashFlowMonth {
  month: number;
  revenue: number;
  powerCost: number;
  poolFees: number;
  maintenance: number;
  depreciation: number;
  netCashFlow: number;
  cumulativeCashFlow: number;
  btcMined: number;
  btcPrice: number;
  difficulty: number;
}

export interface SensitivityPoint {
  btcPriceChange: number;
  electricityChange: number;
  roi: number;
  npv: number;
  profitable: boolean;
}

export interface TornadoItem {
  variable: string;
  lowCase: number;
  baseCase: number;
  highCase: number;
  impact: number; // absolute impact on profit
  sensitivity: number; // % change in profit per % change in variable
}

export interface ScenarioResult {
  name: string;
  description: string;
  btcPriceGrowth: number;
  difficultyGrowth: number;
  electricityChange: number;
  year1Profit: number;
  year2Profit: number;
  year3Profit: number;
  totalProfit: number;
  roi: number;
  probability: string;
}

export class FinancialAnalysisService {
  static calculateFullAnalysis(
    formData: BTCROIFormData,
    networkData: BTCNetworkData,
    mode: 'self' | 'hosting'
  ): FinancialMetrics {
    const effectiveRate = mode === 'hosting' ? formData.hostingRate : formData.powerRate;
    const totalInvestment = formData.hardwareCost * formData.units;
    
    // Base calculations
    const baseDailyResults = this.calculateDailyResults(formData, networkData, effectiveRate);
    
    // Generate 36-month cash flow projections
    const cashFlowProjections = this.generateCashFlowProjections(
      formData, networkData, effectiveRate, 36
    );
    
    // Calculate NPV, IRR, MIRR
    const monthlyFlows = cashFlowProjections.map(m => m.netCashFlow);
    const npv = this.calculateNPV(monthlyFlows, totalInvestment, 0.10 / 12); // 10% annual
    const irr = this.calculateIRR(monthlyFlows, totalInvestment);
    const mirr = this.calculateMIRR(monthlyFlows, totalInvestment, 0.10, 0.08);
    
    // Payback calculations
    const paybackPeriodMonths = this.calculatePaybackPeriod(cashFlowProjections, totalInvestment);
    const discountedPaybackMonths = this.calculateDiscountedPayback(cashFlowProjections, totalInvestment, 0.10 / 12);
    
    // Operating metrics
    const annualRevenue = baseDailyResults.dailyRevenue * 365;
    const annualPowerCost = baseDailyResults.dailyPowerCost * 365;
    const annualPoolFees = baseDailyResults.dailyPoolFees * 365;
    const annualMaintenance = totalInvestment * (formData.maintenancePercent / 100);
    const annualDepreciation = totalInvestment / 3; // 3-year straight line
    
    const grossProfit = annualRevenue - annualPowerCost - annualPoolFees;
    const ebitda = grossProfit - annualMaintenance;
    const netProfit = ebitda - annualDepreciation;
    
    const grossMargin = (grossProfit / annualRevenue) * 100;
    const operatingMargin = (ebitda / annualRevenue) * 100;
    const netMargin = (netProfit / annualRevenue) * 100;
    const profitabilityIndex = (npv + totalInvestment) / totalInvestment;
    const cashOnCashReturn = (ebitda / totalInvestment) * 100;
    
    // Break-even analysis
    const breakEvenBTCPrice = this.calculateBreakEvenBTCPrice(formData, networkData, effectiveRate);
    const breakEvenElectricityRate = this.calculateBreakEvenElectricityRate(formData, networkData);
    const breakEvenDifficulty = this.calculateBreakEvenDifficulty(formData, networkData, effectiveRate);
    const safetyMargin = ((networkData.price - breakEvenBTCPrice) / networkData.price) * 100;
    
    // Risk scoring
    const riskScores = this.calculateRiskScores(formData, networkData, baseDailyResults, effectiveRate);
    
    // Sensitivity analysis
    const sensitivityMatrix = this.generateSensitivityMatrix(formData, networkData, effectiveRate);
    const tornadoData = this.generateTornadoAnalysis(formData, networkData, effectiveRate);
    
    // Scenario analysis
    const scenarios = this.generateScenarios(formData, networkData, effectiveRate);
    
    // Cumulative cash flow array
    const cumulativeCashFlow = cashFlowProjections.map(m => m.cumulativeCashFlow);
    
    return {
      npv,
      irr,
      mirr,
      paybackPeriodMonths,
      discountedPaybackMonths,
      profitabilityIndex,
      ebitda,
      grossMargin,
      netMargin,
      operatingMargin,
      cashOnCashReturn,
      breakEvenBTCPrice,
      breakEvenElectricityRate,
      breakEvenDifficulty,
      safetyMargin,
      volatilityExposure: riskScores.volatilityExposure,
      difficultyRiskScore: riskScores.difficultyRisk,
      priceRiskScore: riskScores.priceRisk,
      operationalRiskScore: riskScores.operationalRisk,
      overallRiskScore: riskScores.overall,
      annualDepreciation,
      monthlyDepreciation: annualDepreciation / 12,
      bookValueYear1: totalInvestment - annualDepreciation,
      bookValueYear2: totalInvestment - (annualDepreciation * 2),
      bookValueYear3: 0,
      cashFlowProjections,
      cumulativeCashFlow,
      sensitivityMatrix,
      tornadoData,
      scenarios
    };
  }
  
  private static calculateDailyResults(
    formData: BTCROIFormData,
    networkData: BTCNetworkData,
    effectiveRate: number
  ) {
    const totalHashrate = formData.hashrate * formData.units * 1e12;
    const dailyBTC = (totalHashrate / networkData.hashrate) * 144 * networkData.blockReward;
    const dailyRevenue = dailyBTC * networkData.price;
    
    const totalPowerKW = (formData.powerDraw * formData.units) / 1000;
    const dailyPowerCost = totalPowerKW * 24 * effectiveRate;
    const dailyPoolFees = dailyRevenue * (formData.poolFee / 100);
    const dailyNetProfit = dailyRevenue - dailyPowerCost - dailyPoolFees;
    
    return {
      dailyBTC,
      dailyRevenue,
      dailyPowerCost,
      dailyPoolFees,
      dailyNetProfit,
      totalPowerKW
    };
  }
  
  private static generateCashFlowProjections(
    formData: BTCROIFormData,
    networkData: BTCNetworkData,
    effectiveRate: number,
    months: number
  ): CashFlowMonth[] {
    const projections: CashFlowMonth[] = [];
    let cumulativeCashFlow = -(formData.hardwareCost * formData.units);
    
    // USE SIMPLE PROJECTION: Assume current conditions persist
    // This makes NPV/IRR/Payback consistent with the daily profit shown in UI
    // If difficulty grows at same rate as price, they cancel out - so use constant values
    const useSimpleProjection = true;
    
    const totalInvestment = formData.hardwareCost * formData.units;
    const monthlyMaintenance = totalInvestment * (formData.maintenancePercent / 100) / 12;
    const monthlyDepreciation = totalInvestment / 36; // 3-year straight line
    
    // Calculate base monthly values using current network conditions
    const totalHashrate = formData.hashrate * formData.units * 1e12;
    const baseMonthlyBTC = (totalHashrate / networkData.hashrate) * 144 * 30 * networkData.blockReward;
    const baseMonthlyRevenue = baseMonthlyBTC * networkData.price;
    const totalPowerKW = (formData.powerDraw * formData.units) / 1000;
    const basePowerCost = totalPowerKW * 24 * 30 * effectiveRate;
    const basePoolFees = baseMonthlyRevenue * (formData.poolFee / 100);
    const baseNetCashFlow = baseMonthlyRevenue - basePowerCost - basePoolFees - monthlyMaintenance;
    
    for (let month = 1; month <= months; month++) {
      let monthlyBTC: number;
      let revenue: number;
      let powerCost: number;
      let poolFees: number;
      let netCashFlow: number;
      let currentPrice = networkData.price;
      let currentDifficulty = networkData.difficulty;
      
      if (useSimpleProjection) {
        // Simple projection: use constant values each month
        monthlyBTC = baseMonthlyBTC;
        revenue = baseMonthlyRevenue;
        powerCost = basePowerCost;
        poolFees = basePoolFees;
        netCashFlow = baseNetCashFlow;
      } else {
        // Growth model (for future use)
        const monthlyDifficultyGrowth = 1.005; // 0.5% monthly
        const monthlyPriceGrowth = 1.005; // 0.5% monthly
        
        currentDifficulty = networkData.difficulty * Math.pow(monthlyDifficultyGrowth, month - 1);
        currentPrice = networkData.price * Math.pow(monthlyPriceGrowth, month - 1);
        
        // With difficulty growth, our BTC mined decreases proportionally
        monthlyBTC = baseMonthlyBTC * (networkData.difficulty / currentDifficulty);
        revenue = monthlyBTC * currentPrice;
        powerCost = basePowerCost; // Power cost stays constant
        poolFees = revenue * (formData.poolFee / 100);
        netCashFlow = revenue - powerCost - poolFees - monthlyMaintenance;
      }
      
      cumulativeCashFlow += netCashFlow;
      
      projections.push({
        month,
        revenue,
        powerCost,
        poolFees,
        maintenance: monthlyMaintenance,
        depreciation: monthlyDepreciation,
        netCashFlow,
        cumulativeCashFlow,
        btcMined: monthlyBTC,
        btcPrice: currentPrice,
        difficulty: currentDifficulty
      });
    }
    
    return projections;
  }
  
  private static calculateNPV(cashFlows: number[], initialInvestment: number, discountRate: number): number {
    let npv = -initialInvestment;
    for (let i = 0; i < cashFlows.length; i++) {
      npv += cashFlows[i] / Math.pow(1 + discountRate, i + 1);
    }
    return npv;
  }
  
  private static calculateIRR(cashFlows: number[], initialInvestment: number): number {
    // Newton-Raphson method to find IRR with improved convergence
    const allFlows = [-initialInvestment, ...cashFlows];
    
    // Check if total cash flows are positive (IRR exists)
    const totalCashFlow = cashFlows.reduce((a, b) => a + b, 0);
    if (totalCashFlow <= 0) {
      // No positive IRR possible if total cash flows don't exceed investment
      return -100; // Return -100% to indicate negative return
    }
    
    // Better initial guess based on simple payback estimate
    const avgMonthlyCashFlow = totalCashFlow / cashFlows.length;
    const simplePaybackMonths = initialInvestment / avgMonthlyCashFlow;
    let guess = simplePaybackMonths > 0 ? 1 / simplePaybackMonths : 0.05;
    guess = Math.max(0.001, Math.min(guess, 0.5)); // Clamp initial guess
    
    for (let iteration = 0; iteration < 200; iteration++) {
      let npv = 0;
      let npvDerivative = 0;
      
      for (let i = 0; i < allFlows.length; i++) {
        const factor = Math.pow(1 + guess, i);
        if (factor === 0 || !isFinite(factor)) continue;
        npv += allFlows[i] / factor;
        npvDerivative -= i * allFlows[i] / Math.pow(1 + guess, i + 1);
      }
      
      if (Math.abs(npv) < 0.01) break; // Converged
      if (Math.abs(npvDerivative) < 1e-10) break; // Derivative too small
      
      const newGuess = guess - npv / npvDerivative;
      
      // Dampen updates to prevent oscillation
      guess = guess + 0.5 * (newGuess - guess);
      
      // Clamp to reasonable range
      if (guess > 2) guess = 2;
      if (guess < -0.5) guess = -0.5;
    }
    
    // Convert monthly to annual and return as percentage
    const annualIRR = ((1 + guess) ** 12 - 1) * 100;
    
    // Sanity check
    if (!isFinite(annualIRR) || annualIRR < -100 || annualIRR > 1000) {
      return 0;
    }
    
    return annualIRR;
  }
  
  private static calculateMIRR(
    cashFlows: number[], 
    initialInvestment: number, 
    financeRate: number, 
    reinvestRate: number
  ): number {
    const n = cashFlows.length;
    
    // PV of negative cash flows
    let pvNegative = initialInvestment;
    
    // FV of positive cash flows (reinvested)
    let fvPositive = 0;
    for (let i = 0; i < cashFlows.length; i++) {
      if (cashFlows[i] > 0) {
        fvPositive += cashFlows[i] * Math.pow(1 + reinvestRate / 12, n - i - 1);
      } else {
        pvNegative += Math.abs(cashFlows[i]) / Math.pow(1 + financeRate / 12, i + 1);
      }
    }
    
    if (pvNegative === 0) return 0;
    
    const mirr = Math.pow(fvPositive / pvNegative, 1 / n) - 1;
    return mirr * 12 * 100; // Convert to annual percentage
  }
  
  private static calculatePaybackPeriod(projections: CashFlowMonth[], initialInvestment: number): number {
    for (let i = 0; i < projections.length; i++) {
      if (projections[i].cumulativeCashFlow >= 0) {
        // Interpolate for exact month
        if (i === 0) return 1;
        const prevCF = projections[i - 1].cumulativeCashFlow;
        const currCF = projections[i].cumulativeCashFlow;
        const fraction = Math.abs(prevCF) / (currCF - prevCF);
        return i + fraction;
      }
    }
    return Infinity;
  }
  
  private static calculateDiscountedPayback(
    projections: CashFlowMonth[], 
    initialInvestment: number, 
    discountRate: number
  ): number {
    let cumulativeDiscounted = -initialInvestment;
    
    for (let i = 0; i < projections.length; i++) {
      const discountedCF = projections[i].netCashFlow / Math.pow(1 + discountRate, i + 1);
      cumulativeDiscounted += discountedCF;
      
      if (cumulativeDiscounted >= 0) {
        return i + 1;
      }
    }
    return Infinity;
  }
  
  private static calculateBreakEvenBTCPrice(
    formData: BTCROIFormData,
    networkData: BTCNetworkData,
    effectiveRate: number
  ): number {
    const totalHashrate = formData.hashrate * formData.units * 1e12;
    const dailyBTC = (totalHashrate / networkData.hashrate) * 144 * networkData.blockReward;
    
    const totalPowerKW = (formData.powerDraw * formData.units) / 1000;
    const dailyPowerCost = totalPowerKW * 24 * effectiveRate;
    
    // Break-even: dailyBTC * price * (1 - poolFee%) = dailyPowerCost
    const poolFeeMultiplier = 1 - (formData.poolFee / 100);
    const breakEvenPrice = dailyPowerCost / (dailyBTC * poolFeeMultiplier);
    
    return breakEvenPrice;
  }
  
  private static calculateBreakEvenElectricityRate(
    formData: BTCROIFormData,
    networkData: BTCNetworkData
  ): number {
    const totalHashrate = formData.hashrate * formData.units * 1e12;
    const dailyBTC = (totalHashrate / networkData.hashrate) * 144 * networkData.blockReward;
    const dailyRevenue = dailyBTC * networkData.price;
    const dailyPoolFees = dailyRevenue * (formData.poolFee / 100);
    const netRevenueAfterFees = dailyRevenue - dailyPoolFees;
    
    const totalPowerKW = (formData.powerDraw * formData.units) / 1000;
    const dailyKWh = totalPowerKW * 24;
    
    // Break-even: netRevenue = dailyKWh * rate
    return netRevenueAfterFees / dailyKWh;
  }
  
  private static calculateBreakEvenDifficulty(
    formData: BTCROIFormData,
    networkData: BTCNetworkData,
    effectiveRate: number
  ): number {
    const totalHashrate = formData.hashrate * formData.units * 1e12;
    const totalPowerKW = (formData.powerDraw * formData.units) / 1000;
    const dailyPowerCost = totalPowerKW * 24 * effectiveRate;
    
    // Daily revenue at break-even = daily power cost / (1 - poolFee%)
    const poolFeeMultiplier = 1 - (formData.poolFee / 100);
    const requiredRevenue = dailyPowerCost / poolFeeMultiplier;
    const requiredBTC = requiredRevenue / networkData.price;
    
    // BTC = (hashrate / networkHashrate) * 144 * blockReward
    // Solving for difficulty (proportional to network hashrate)
    const currentDailyBTC = (totalHashrate / networkData.hashrate) * 144 * networkData.blockReward;
    const difficultyMultiplier = currentDailyBTC / requiredBTC;
    
    return networkData.difficulty * difficultyMultiplier;
  }
  
  private static calculateRiskScores(
    formData: BTCROIFormData,
    networkData: BTCNetworkData,
    baseDailyResults: any,
    effectiveRate: number
  ) {
    // Price volatility risk (BTC historical volatility is ~60-80% annually)
    const priceRisk = 70; // Base BTC volatility score
    
    // Difficulty risk based on network growth
    const difficultyRisk = 60; // Moderate due to consistent growth
    
    // Operational risk based on equipment age and efficiency
    const efficiency = formData.powerDraw / formData.hashrate;
    const operationalRisk = Math.min(100, Math.max(0, efficiency * 3));
    
    // Electricity cost exposure
    const powerCostRatio = baseDailyResults.dailyPowerCost / baseDailyResults.dailyRevenue;
    const volatilityExposure = powerCostRatio * 100;
    
    // Overall weighted risk
    const overall = (priceRisk * 0.4 + difficultyRisk * 0.3 + operationalRisk * 0.2 + volatilityExposure * 0.1);
    
    return {
      priceRisk,
      difficultyRisk,
      operationalRisk,
      volatilityExposure,
      overall
    };
  }
  
  private static generateSensitivityMatrix(
    formData: BTCROIFormData,
    networkData: BTCNetworkData,
    effectiveRate: number
  ): SensitivityPoint[] {
    const points: SensitivityPoint[] = [];
    const priceChanges = [-50, -30, -20, -10, 0, 10, 20, 30, 50, 100];
    const electricityChanges = [-50, -25, 0, 25, 50, 100];
    
    const totalInvestment = formData.hardwareCost * formData.units;
    
    for (const priceChange of priceChanges) {
      for (const elecChange of electricityChanges) {
        const adjustedPrice = networkData.price * (1 + priceChange / 100);
        const adjustedRate = effectiveRate * (1 + elecChange / 100);
        
        const totalHashrate = formData.hashrate * formData.units * 1e12;
        const dailyBTC = (totalHashrate / networkData.hashrate) * 144 * networkData.blockReward;
        const dailyRevenue = dailyBTC * adjustedPrice;
        
        const totalPowerKW = (formData.powerDraw * formData.units) / 1000;
        const dailyPowerCost = totalPowerKW * 24 * adjustedRate;
        const dailyPoolFees = dailyRevenue * (formData.poolFee / 100);
        const dailyNetProfit = dailyRevenue - dailyPowerCost - dailyPoolFees;
        
        const yearlyNetProfit = dailyNetProfit * 365;
        const roi = (yearlyNetProfit / totalInvestment) * 100;
        const npv = this.calculateNPV(
          Array(12).fill(dailyNetProfit * 30),
          totalInvestment,
          0.10 / 12
        );
        
        points.push({
          btcPriceChange: priceChange,
          electricityChange: elecChange,
          roi,
          npv,
          profitable: dailyNetProfit > 0
        });
      }
    }
    
    return points;
  }
  
  private static generateTornadoAnalysis(
    formData: BTCROIFormData,
    networkData: BTCNetworkData,
    effectiveRate: number
  ): TornadoItem[] {
    const baseDailyResults = this.calculateDailyResults(formData, networkData, effectiveRate);
    const baseAnnualProfit = baseDailyResults.dailyNetProfit * 365;
    
    // Test ±20% change in each variable
    const variables = [
      { 
        name: 'BTC Price', 
        test: (factor: number) => {
          const adjusted = { ...networkData, price: networkData.price * factor };
          return this.calculateDailyResults(formData, adjusted, effectiveRate).dailyNetProfit * 365;
        }
      },
      { 
        name: 'Electricity Rate', 
        test: (factor: number) => {
          return this.calculateDailyResults(formData, networkData, effectiveRate * factor).dailyNetProfit * 365;
        }
      },
      { 
        name: 'Network Difficulty', 
        test: (factor: number) => {
          const adjusted = { ...networkData, hashrate: networkData.hashrate * factor };
          return this.calculateDailyResults(formData, adjusted, effectiveRate).dailyNetProfit * 365;
        }
      },
      { 
        name: 'Pool Fee', 
        test: (factor: number) => {
          const adjusted = { ...formData, poolFee: formData.poolFee * factor };
          return this.calculateDailyResults(adjusted, networkData, effectiveRate).dailyNetProfit * 365;
        }
      },
      { 
        name: 'Hardware Units', 
        test: (factor: number) => {
          const adjusted = { ...formData, units: Math.round(formData.units * factor) };
          return this.calculateDailyResults(adjusted, networkData, effectiveRate).dailyNetProfit * 365;
        }
      }
    ];
    
    const results: TornadoItem[] = [];
    
    for (const variable of variables) {
      const lowCase = variable.test(0.8);
      const highCase = variable.test(1.2);
      const impact = Math.abs(highCase - lowCase);
      const sensitivity = (impact / baseAnnualProfit) * 100 / 40; // per 1% change
      
      results.push({
        variable: variable.name,
        lowCase,
        baseCase: baseAnnualProfit,
        highCase,
        impact,
        sensitivity
      });
    }
    
    // Sort by impact (largest first)
    return results.sort((a, b) => b.impact - a.impact);
  }
  
  private static generateScenarios(
    formData: BTCROIFormData,
    networkData: BTCNetworkData,
    effectiveRate: number
  ): ScenarioResult[] {
    const totalInvestment = formData.hardwareCost * formData.units;
    
    const scenarioConfigs = [
      { 
        name: 'Bull Market', 
        description: 'Strong BTC appreciation, moderate difficulty growth',
        btcPriceGrowth: 50, 
        difficultyGrowth: 40, 
        electricityChange: 5,
        probability: 'Medium'
      },
      { 
        name: 'Bear Market', 
        description: 'Price decline with reduced mining competition',
        btcPriceGrowth: -40, 
        difficultyGrowth: 10, 
        electricityChange: 0,
        probability: 'Medium'
      },
      { 
        name: 'Consolidation', 
        description: 'Sideways price action, steady difficulty increase',
        btcPriceGrowth: 10, 
        difficultyGrowth: 50, 
        electricityChange: 10,
        probability: 'High'
      },
      { 
        name: 'Super Cycle', 
        description: 'Aggressive price appreciation post-halving',
        btcPriceGrowth: 200, 
        difficultyGrowth: 80, 
        electricityChange: 15,
        probability: 'Low'
      },
      { 
        name: 'Mining Exodus', 
        description: 'Major miners exit, difficulty drops',
        btcPriceGrowth: -20, 
        difficultyGrowth: -30, 
        electricityChange: 20,
        probability: 'Low'
      }
    ];
    
    return scenarioConfigs.map(scenario => {
      // Calculate profits for years 1, 2, 3
      const calculateYearProfit = (year: number) => {
        const priceMultiplier = 1 + (scenario.btcPriceGrowth / 100) * (year / 3);
        const diffMultiplier = 1 + (scenario.difficultyGrowth / 100) * (year / 3);
        const elecMultiplier = 1 + (scenario.electricityChange / 100) * (year / 3);
        
        const adjustedPrice = networkData.price * priceMultiplier;
        const adjustedHashrate = networkData.hashrate * diffMultiplier;
        const adjustedRate = effectiveRate * elecMultiplier;
        
        const totalHashrate = formData.hashrate * formData.units * 1e12;
        const dailyBTC = (totalHashrate / adjustedHashrate) * 144 * networkData.blockReward;
        const dailyRevenue = dailyBTC * adjustedPrice;
        
        const totalPowerKW = (formData.powerDraw * formData.units) / 1000;
        const dailyPowerCost = totalPowerKW * 24 * adjustedRate;
        const dailyPoolFees = dailyRevenue * (formData.poolFee / 100);
        
        return (dailyRevenue - dailyPowerCost - dailyPoolFees) * 365;
      };
      
      const year1Profit = calculateYearProfit(1);
      const year2Profit = calculateYearProfit(2);
      const year3Profit = calculateYearProfit(3);
      const totalProfit = year1Profit + year2Profit + year3Profit;
      const roi = (totalProfit / totalInvestment) * 100;
      
      return {
        name: scenario.name,
        description: scenario.description,
        btcPriceGrowth: scenario.btcPriceGrowth,
        difficultyGrowth: scenario.difficultyGrowth,
        electricityChange: scenario.electricityChange,
        year1Profit,
        year2Profit,
        year3Profit,
        totalProfit,
        roi,
        probability: scenario.probability
      };
    });
  }
}

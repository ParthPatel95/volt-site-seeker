import React, { useState, useEffect } from 'react';
import { useCurrencyConversion } from '@/hooks/useCurrencyConversion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown,
  DollarSign, 
  Calendar,
  BarChart3,
  Zap,
  AlertTriangle,
  Calculator,
  CloudRain,
  PieChart,
  Activity,
  Clock,
  Target
} from 'lucide-react';
import { useAESOHistoricalPricing } from '@/hooks/useAESOHistoricalPricing';
import { PriceAlertsPanel } from './PriceAlertsPanel';
import { PredictiveAnalytics } from './PredictiveAnalytics';
import { LoadScheduleOptimizer } from './LoadScheduleOptimizer';
import { CostBenefitCalculator } from './CostBenefitCalculator';
import { WeatherAnalysis } from '@/components/weather/WeatherAnalysis';


export function AESOHistoricalPricing() {
  const { convertCADtoUSD, formatCurrency: formatCurrencyUSD, exchangeRate: liveExchangeRate } = useCurrencyConversion();
  const { 
    monthlyData, 
    yearlyData, 
    peakAnalysis,
    historicalTenYearData,
    loadingMonthly, 
    loadingYearly, 
    loadingPeakAnalysis,
    loadingHistoricalTenYear,
    fetchMonthlyData,
    fetchYearlyData,
    analyzePeakShutdown,
    fetchHistoricalTenYearData
  } = useAESOHistoricalPricing();

  const [uptimePercentage, setUptimePercentage] = useState('95');
  const [timePeriod, setTimePeriod] = useState<'30' | '90' | '180' | '365'>('30');
  const [transmissionAdder, setTransmissionAdder] = useState('11.63');
  const [exchangeRate, setExchangeRate] = useState<number | null>(null);
  const [customAnalysisResult, setCustomAnalysisResult] = useState<any>(null);

  useEffect(() => {
    fetchMonthlyData();
    fetchYearlyData();
    fetchExchangeRate();
  }, []);

  // Re-run analysis when time period changes
  useEffect(() => {
    if (customAnalysisResult && monthlyData && yearlyData) {
      const result = calculateUptimeOptimization();
      setCustomAnalysisResult(result);
    }
  }, [timePeriod, monthlyData, yearlyData]);

  const fetchExchangeRate = async () => {
    try {
      const response = await fetch('https://api.exchangerate-api.io/v4/latest/CAD');
      const data = await response.json();
      if (data.rates?.USD) {
        setExchangeRate(data.rates.USD);
      }
    } catch (error) {
      console.error('Failed to fetch exchange rate:', error);
      setExchangeRate(0.73); // Fallback rate
    }
  };

  const fetchRealHistoricalData = async () => {
    // Call the real API to fetch 10-year historical data
    await fetchHistoricalTenYearData();
  };


  const handleUptimeAnalysis = () => {
    try {
      const result = calculateUptimeOptimization();
      console.log('Uptime optimization result:', result);
      setCustomAnalysisResult(result);
    } catch (error) {
      console.error('Error in uptime analysis:', error);
      setCustomAnalysisResult(null);
    }
  };

  // Enhanced Formula: Hourly Precision Uptime Analysis with Operational Constraints
  const analyzeUptimeOptimized = (targetUptime: number) => {
    try {
      const daysInPeriod = parseInt(timePeriod);
      const sourceData = daysInPeriod > 180 ? yearlyData : monthlyData;
      
      if (!sourceData || !sourceData.chartData || sourceData.chartData.length === 0) {
        console.warn('No data available for uptime analysis');
        return null;
      }

      // Enhanced: Operational constraints configuration
      const operationalConstraints = {
        startupCostPerMW: 50, // $/MW startup cost
        shutdownCostPerMW: 25, // $/MW shutdown cost
        minimumShutdownDuration: 2, // minimum 2 hours shutdown
        maximumShutdownsPerWeek: 3, // operational limit
        rampingTimeMins: 30 // time to ramp up/down
      };

      console.log('=== ENHANCED UPTIME ANALYSIS WITH HOURLY PRECISION ===');
      console.log('Target uptime:', targetUptime);
      console.log('Operational constraints:', operationalConstraints);
      
      // Filter data to exact time period
      const now = new Date();
      const startDate = new Date();
      startDate.setDate(now.getDate() - daysInPeriod);
      
      const filteredData = sourceData.chartData.filter(day => {
        const dayDate = new Date(day.date);
        return dayDate >= startDate && dayDate <= now;
      });

      // Enhanced: Convert daily data to synthetic hourly data using intraday curves
      const hourlyData = generateSyntheticHourlyData(filteredData, sourceData.statistics.average);
      
      // Calculate rolling baseline with seasonal/weekly patterns
      const rollingBaseline = calculateRollingBaseline(hourlyData, 30); // 30-day rolling window
      
      const totalHours = daysInPeriod * 24;
      const maxShutdownHours = totalHours * (1 - targetUptime / 100);
      
      console.log('Total hours in period:', totalHours);
      console.log('Max shutdown hours allowed:', maxShutdownHours);
      console.log('Synthetic hourly data points:', hourlyData.length);
      
      // Enhanced: Smart shutdown optimization with operational constraints
      const optimizedShutdowns = optimizeShutdownSchedule(
        hourlyData, 
        maxShutdownHours, 
        operationalConstraints,
        rollingBaseline
      );
      
      console.log('Optimized shutdown events:', optimizedShutdowns.events.length);
      console.log('Total optimized shutdown hours:', optimizedShutdowns.totalHours);
      console.log('Operational constraint violations:', optimizedShutdowns.violations);
      
      // Calculate enhanced savings with operational costs
    const enhancedSavings = calculateEnhancedSavings(
      optimizedShutdowns, 
      rollingBaseline, 
      operationalConstraints
    );
    
    console.log('=== ENHANCED SAVINGS CALCULATION ===');
    console.log('Gross energy savings:', (enhancedSavings.grossSavings || 0).toFixed(3), '¢');
    console.log('Operational costs:', (enhancedSavings.operationalCosts || 0).toFixed(3), '¢');
    console.log('Net savings:', (enhancedSavings.netSavings || 0).toFixed(3), '¢');
    console.log('Risk adjustment:', (enhancedSavings.riskAdjustment || 0).toFixed(3), '¢');
      
      return {
        totalShutdowns: optimizedShutdowns.events.length,
        totalHours: optimizedShutdowns.totalHours,
        averageSavings: optimizedShutdowns.events.length > 0 ? enhancedSavings.netSavings / optimizedShutdowns.events.length : 0,
        events: optimizedShutdowns.events,
        newAveragePrice: enhancedSavings.newAveragePrice,
        totalSavings: enhancedSavings.netSavings,
        totalAllInSavings: enhancedSavings.netAllInSavings,
        originalAverage: rollingBaseline.average,
        actualUptimeAchieved: ((totalHours - optimizedShutdowns.totalHours) / totalHours * 100),
        // Enhanced metrics
        operationalCosts: enhancedSavings.operationalCosts,
        riskAdjustment: enhancedSavings.riskAdjustment,
        confidenceLevel: enhancedSavings.confidenceLevel,
        projectedROI: enhancedSavings.projectedROI
      };
    } catch (error) {
      console.error('Error in enhanced uptime analysis:', error);
      return null;
    }
  };

  // Enhanced: Generate synthetic hourly data using monthly baseline and hourly patterns
  const generateSyntheticHourlyData = (dailyData: any[], monthlyAverage: number) => {
    // Typical AESO hourly price multipliers (based on historical patterns)
    const hourlyMultipliers = [
      0.85, 0.82, 0.80, 0.78, 0.82, 0.90, // 0-5 AM (low demand)
      1.05, 1.15, 1.20, 1.18, 1.12, 1.08, // 6-11 AM (morning ramp)
      1.10, 1.15, 1.18, 1.22, 1.25, 1.35, // 12-5 PM (peak demand)
      1.40, 1.30, 1.15, 1.05, 0.95, 0.88  // 6-11 PM (evening peak then decline)
    ];

    const hourlyData: any[] = [];
    
    console.log(`Generating hourly data using monthly baseline: $${monthlyAverage.toFixed(2)} CAD/MWh`);
    
    dailyData.forEach(day => {
      hourlyMultipliers.forEach((multiplier, hour) => {
        // Use monthly average as baseline, not daily average
        const hourlyPrice = monthlyAverage * multiplier;
        
        hourlyData.push({
          date: day.date,
          hour: hour,
          datetime: new Date(`${day.date}T${hour.toString().padStart(2, '0')}:00:00`),
          price: hourlyPrice,
          dailyBasePrice: monthlyAverage,
          multiplier: multiplier,
          dayOfWeek: new Date(day.date).getDay(),
          isWeekend: [0, 6].includes(new Date(day.date).getDay())
        });
      });
    });
    
    const avgHourlyPrice = hourlyData.reduce((sum, h) => sum + h.price, 0) / hourlyData.length;
    console.log(`Average of generated hourly prices: $${avgHourlyPrice.toFixed(2)} CAD/MWh (should be close to monthly avg)`);
    
    return hourlyData.sort((a, b) => a.datetime.getTime() - b.datetime.getTime());
  };

  // Enhanced: Calculate rolling baseline with seasonal patterns
  const calculateRollingBaseline = (hourlyData: any[], windowDays: number) => {
    const windowHours = windowDays * 24;
    const rollingAverages: any[] = [];
    
    for (let i = windowHours; i < hourlyData.length; i++) {
      const windowData = hourlyData.slice(i - windowHours, i);
      const average = windowData.reduce((sum, point) => sum + point.price, 0) / windowData.length;
      const volatility = Math.sqrt(windowData.reduce((sum, point) => sum + Math.pow(point.price - average, 2), 0) / windowData.length);
      
      rollingAverages.push({
        datetime: hourlyData[i].datetime,
        average: average,
        volatility: volatility,
        confidence: Math.max(0.6, Math.min(0.95, 1 - (volatility / average)))
      });
    }
    
    const overallAverage = rollingAverages.reduce((sum, point) => sum + point.average, 0) / rollingAverages.length;
    const overallVolatility = Math.sqrt(rollingAverages.reduce((sum, point) => sum + Math.pow(point.average - overallAverage, 2), 0) / rollingAverages.length);
    
    return {
      average: overallAverage,
      volatility: overallVolatility,
      rollingData: rollingAverages,
      confidenceLevel: Math.max(0.7, Math.min(0.95, 1 - (overallVolatility / overallAverage)))
    };
  };

  // Enhanced: Smart shutdown optimization with operational constraints
  const optimizeShutdownSchedule = (hourlyData: any[], maxShutdownHours: number, constraints: any, baseline: any) => {
    // Sort by price premium over rolling baseline
    const priceOpportunities = hourlyData.map(point => {
      const rollingBaseline = baseline.rollingData.find(r => 
        Math.abs(r.datetime.getTime() - point.datetime.getTime()) < 3600000 // within 1 hour
      );
      const baselinePrice = rollingBaseline ? rollingBaseline.average : baseline.average;
      
      return {
        ...point,
        baselinePrice,
        premium: point.price - baselinePrice,
        potentialSavings: (point.price - baselinePrice) * (point.price > baselinePrice ? 1 : 0)
      };
    }).filter(point => point.potentialSavings > 0)
      .sort((a, b) => b.potentialSavings - a.potentialSavings);

    const optimizedEvents: any[] = [];
    let totalShutdownHours = 0;
    let weeklyShutdowns = 0;
    let lastShutdownWeek = -1;
    const violations: string[] = [];

    for (const opportunity of priceOpportunities) {
      if (totalShutdownHours >= maxShutdownHours) break;

      const currentWeek = Math.floor(opportunity.datetime.getTime() / (7 * 24 * 3600 * 1000));
      
      // Reset weekly counter for new week
      if (currentWeek !== lastShutdownWeek) {
        weeklyShutdowns = 0;
        lastShutdownWeek = currentWeek;
      }

      // Check weekly shutdown limit
      if (weeklyShutdowns >= constraints.maximumShutdownsPerWeek) {
        violations.push(`Weekly shutdown limit exceeded in week ${currentWeek}`);
        continue;
      }

      // Find consecutive high-price hours for smart duration
      const shutdownDuration = findOptimalShutdownDuration(
        hourlyData, 
        opportunity, 
        constraints.minimumShutdownDuration,
        baseline
      );

      if (totalShutdownHours + shutdownDuration <= maxShutdownHours) {
        optimizedEvents.push({
          date: opportunity.date,
          startHour: opportunity.hour,
          duration: shutdownDuration,
          price: opportunity.price,
          baselinePrice: opportunity.baselinePrice,
          premium: opportunity.premium,
          savings: opportunity.potentialSavings * shutdownDuration,
          allInSavings: (calculateAllInPrice(opportunity.price) - calculateAllInPrice(opportunity.baselinePrice)) * shutdownDuration,
          operationalCost: (constraints.startupCostPerMW + constraints.shutdownCostPerMW) / 1000 // Convert to ¢/kWh
        });

        totalShutdownHours += shutdownDuration;
        weeklyShutdowns++;
      }
    }

    return {
      events: optimizedEvents,
      totalHours: totalShutdownHours,
      violations
    };
  };

  // Enhanced: Find optimal shutdown duration based on consecutive high prices
  const findOptimalShutdownDuration = (hourlyData: any[], startOpportunity: any, minDuration: number, baseline: any) => {
    const startIndex = hourlyData.findIndex(point => 
      point.datetime.getTime() === startOpportunity.datetime.getTime()
    );
    
    let duration = minDuration;
    let consecutiveHighPriceHours = 0;
    
    // Look ahead for consecutive high prices
    for (let i = startIndex; i < Math.min(startIndex + 12, hourlyData.length); i++) {
      const point = hourlyData[i];
      const rollingBaseline = baseline.rollingData.find(r => 
        Math.abs(r.datetime.getTime() - point.datetime.getTime()) < 3600000
      );
      const baselinePrice = rollingBaseline ? rollingBaseline.average : baseline.average;
      
      if (point.price > baselinePrice * 1.1) { // 10% above baseline
        consecutiveHighPriceHours++;
      } else {
        break;
      }
    }
    
    return Math.max(minDuration, Math.min(8, consecutiveHighPriceHours)); // Max 8 hours
  };

  // Enhanced: Calculate savings with operational costs and risk adjustments
  const calculateEnhancedSavings = (shutdowns: any, baseline: any, constraints: any) => {
    const grossSavings = shutdowns.events.reduce((sum: number, event: any) => sum + event.savings, 0);
    const grossAllInSavings = shutdowns.events.reduce((sum: number, event: any) => sum + event.allInSavings, 0);
    const operationalCosts = shutdowns.events.reduce((sum: number, event: any) => sum + (event.operationalCost || 0), 0);
    
    // Enhanced All-In Cost Modeling: Variable transmission costs based on energy prices
    const transmissionCostVariation = shutdowns.events.reduce((sum: number, event: any) => {
      const priceBasedTransmissionAdder = calculateDynamicTransmissionCost(event.price);
      const standardTransmissionAdder = parseFloat(transmissionAdder);
      return sum + ((priceBasedTransmissionAdder - standardTransmissionAdder) * event.duration);
    }, 0);
    
    // Statistical Validation: Monte Carlo simulation for uncertainty
    const monteCarloResult = runMonteCarloSimulation(shutdowns.events, baseline, 1000);
    
    // Risk adjustment based on baseline confidence and volatility
    const riskAdjustment = grossSavings * (1 - baseline.confidenceLevel) * 0.3; // 30% of uncertain savings
    const volatilityAdjustment = grossSavings * (baseline.volatility || 0.1) * 0.2; // 20% volatility penalty
    
    const netSavings = grossSavings - operationalCosts - riskAdjustment - volatilityAdjustment + transmissionCostVariation;
    const netAllInSavings = grossAllInSavings - operationalCosts - riskAdjustment - volatilityAdjustment;
    
    // Calculate new average price during operational hours
    const operationalHours = (parseInt(timePeriod) * 24) - (shutdowns.totalHours || 0);
    const newAveragePrice = baseline.average * (1 - ((netSavings || 0) / (grossSavings || 1)) * 0.1);
    
    return {
      grossSavings: grossSavings || 0,
      operationalCosts: operationalCosts || 0,
      riskAdjustment: riskAdjustment || 0,
      volatilityAdjustment: volatilityAdjustment || 0,
      transmissionCostVariation: transmissionCostVariation || 0,
      netSavings: netSavings || 0,
      netAllInSavings: netAllInSavings || 0,
      newAveragePrice: newAveragePrice || baseline.average || 0,
      confidenceLevel: baseline.confidenceLevel || 0.5,
      projectedROI: (netSavings || 0) > 0 ? ((netSavings || 0) / (operationalCosts || 1)) * 100 : 0,
      monteCarloConfidenceInterval: monteCarloResult.confidenceInterval,
      probabilityOfProfit: monteCarloResult.probabilityOfProfit || 0,
      expectedValue: monteCarloResult.expectedValue || 0
    };
  };

  // Enhanced All-In Cost Modeling: Dynamic transmission costs based on energy prices
  const calculateDynamicTransmissionCost = (energyPrice: number) => {
    const baseTransmissionAdder = parseFloat(transmissionAdder);
    
    // Transmission costs increase during high-demand periods (when energy prices are high)
    if (energyPrice > 100) { // High price threshold
      return baseTransmissionAdder * 1.3; // 30% increase during peak demand
    } else if (energyPrice > 50) { // Medium price threshold
      return baseTransmissionAdder * 1.15; // 15% increase during moderate demand
    } else if (energyPrice < 10) { // Very low price (possible negative pricing periods)
      return baseTransmissionAdder * 0.8; // 20% decrease during low demand
    }
    
    return baseTransmissionAdder; // Standard transmission cost
  };

  // Statistical Validation: Monte Carlo simulation for uncertainty quantification
  const runMonteCarloSimulation = (events: any[], baseline: any, iterations: number = 1000) => {
    const results: number[] = [];
    
    for (let i = 0; i < iterations; i++) {
      let simulatedSavings = 0;
      
      events.forEach(event => {
        // Add uncertainty to price predictions
        const priceUncertainty = (Math.random() - 0.5) * 2 * 0.2; // ±20% uncertainty
        const baselineUncertainty = (Math.random() - 0.5) * 2 * 0.15; // ±15% uncertainty
        
        const adjustedPrice = event.price * (1 + priceUncertainty);
        const adjustedBaseline = event.baselinePrice * (1 + baselineUncertainty);
        
        // Add operational uncertainty
        const operationalEfficiency = 0.85 + (Math.random() * 0.25); // 85-100% efficiency
        
        simulatedSavings += (adjustedPrice - adjustedBaseline) * event.duration * operationalEfficiency;
      });
      
      results.push(simulatedSavings);
    }
    
    results.sort((a, b) => a - b);
    
    const p5 = results[Math.floor(iterations * 0.05)];
    const p95 = results[Math.floor(iterations * 0.95)];
    const expectedValue = results.reduce((sum, val) => sum + val, 0) / iterations;
    const probabilityOfProfit = results.filter(val => val > 0).length / iterations;
    
    return {
      confidenceInterval: { lower: p5, upper: p95 },
      expectedValue,
      probabilityOfProfit
    };
  };

  // Simplified Uptime Optimization Analysis using REAL AESO data
  const calculateUptimeOptimization = () => {
    const daysInPeriod = parseInt(timePeriod);
    // Always use monthly data for consistency with the 30-day average price display
    const sourceData = monthlyData;
    
    if (!sourceData || !sourceData.rawHourlyData) {
      console.warn('No raw hourly data available for optimization');
      return null;
    }
    
    console.log('=== UPTIME OPTIMIZATION ANALYSIS (REAL AESO DATA) ===');
    console.log('Days in period:', daysInPeriod);
    
    // Use REAL hourly data from AESO (no synthetic generation!)
    const hourlyData = sourceData.rawHourlyData;
    console.log('Total real hourly data points from AESO:', hourlyData.length);
    
    // Debug price data
    const zeroPrices = hourlyData.filter(h => (h.price || 0) === 0);
    const validPrices = hourlyData.filter(h => h.price != null && !isNaN(h.price));
    console.log(`Zero price entries: ${zeroPrices.length}`);
    console.log(`Valid price entries: ${validPrices.length}`);
    
    // Calculate uptime/downtime parameters
    const targetUptime = parseFloat(uptimePercentage) / 100;
    const totalHours = hourlyData.length;
    const allowedDowntimeHours = Math.floor(totalHours * (1 - targetUptime));
    
    console.log('Target uptime:', (targetUptime * 100).toFixed(1) + '%');
    console.log('Total hours in period:', totalHours);
    console.log('Allowed downtime hours:', allowedDowntimeHours);
    
    // Sort all hours by price (highest first) and take the top X hours for shutdown
    const sortedHours = [...hourlyData].sort((a, b) => b.price - a.price);
    const hoursToShutdown = sortedHours.slice(0, allowedDowntimeHours);
    const hoursToKeepRunning = sortedHours.slice(allowedDowntimeHours);
    
    console.log('Hours to shutdown (highest prices):', hoursToShutdown.length);
    console.log('Hours to keep running:', hoursToKeepRunning.length);
    
    // Calculate original and optimized metrics using REAL prices
    const originalTotalCost = hourlyData.reduce((sum, hour) => sum + hour.price, 0);
    const originalAvgPrice = originalTotalCost / totalHours;
    
    // Optimized cost is ONLY for the hours we keep running (excluding shutdown hours)
    const optimizedTotalCost = hoursToKeepRunning.reduce((sum, hour) => sum + hour.price, 0);
    const optimizedAvgPrice = optimizedTotalCost / hoursToKeepRunning.length;
    
    // Total energy savings = sum of all shutdown hour prices
    const totalSavings = hoursToShutdown.reduce((sum, hour) => sum + hour.price, 0);
    const actualDowntimePercent = (allowedDowntimeHours / totalHours) * 100;
    
    // Comprehensive logging
    console.log('=== REAL DATA CALCULATION ===');
    console.log(`Total hours: ${totalHours}`);
    console.log(`Hours to shutdown: ${allowedDowntimeHours}`);
    console.log(`Hours to keep running: ${hoursToKeepRunning.length}`);
    console.log(`Original total cost: ${originalTotalCost.toFixed(2)} CAD (sum of all ${totalHours} hours)`);
    console.log(`Original avg price: ${originalAvgPrice.toFixed(2)} CAD/MWh`);
    console.log(`Optimized total cost: ${optimizedTotalCost.toFixed(2)} CAD (sum of ${hoursToKeepRunning.length} running hours)`);
    console.log(`Optimized avg price: ${optimizedAvgPrice.toFixed(2)} CAD/MWh`);
    console.log(`Total savings: ${totalSavings.toFixed(2)} CAD (sum of ${hoursToShutdown.length} shutdown hours)`);
    console.log(`Avg price of shutdown hours: ${(totalSavings / allowedDowntimeHours).toFixed(2)} CAD/MWh`);
    console.log(`Price reduction: ${(originalAvgPrice - optimizedAvgPrice).toFixed(2)} CAD/MWh`);
    
    // Sanity check
    if (optimizedAvgPrice > originalAvgPrice) {
      console.error('❌ ERROR: Optimized price is HIGHER than original! This should never happen!');
    } else {
      console.log('✅ Optimized price is lower than original - correct!');
    }
    
    // Price distribution analysis using REAL data
    const priceRanges = [
      { min: 0, max: 10, label: '$0-$10/MWh' },
      { min: 11, max: 20, label: '$11-$20/MWh' },
      { min: 21, max: 30, label: '$21-$30/MWh' },
      { min: 31, max: 40, label: '$31-$40/MWh' },
      { min: 41, max: 50, label: '$41-$50/MWh' },
      { min: 51, max: 60, label: '$51-$60/MWh' },
      { min: 61, max: 70, label: '$61-$70/MWh' },
      { min: 71, max: 80, label: '$71-$80/MWh' },
      { min: 81, max: 90, label: '$81-$90/MWh' },
      { min: 91, max: 100, label: '$91-$100/MWh' },
      { min: 101, max: 150, label: '$101-$150/MWh' },
      { min: 151, max: 10000, label: '$151+/MWh' }
    ];
    
    const distributionData = priceRanges.map(range => {
      // Ensure we include zero prices correctly
      const hoursInRange = hourlyData.filter(hour => {
        const price = hour.price || 0; // Handle potential undefined/null prices
        return price >= range.min && price <= range.max;
      }).length;
      
      return {
        range: range.label,
        hours: hoursInRange,
        percentage: (hoursInRange / totalHours) * 100
      };
    });
    
    console.log('=== REAL PRICE DISTRIBUTION DEBUG ===');
    console.log(`Total hours for distribution: ${totalHours}`);
    console.log(`Zero price hours: ${hourlyData.filter(h => (h.price || 0) === 0).length}`);
    console.log(`Price range 0-10: ${hourlyData.filter(h => (h.price || 0) >= 0 && (h.price || 0) <= 10).length}`);
    
    distributionData.forEach(d => {
      console.log(`${d.range}: ${d.hours} hours (${d.percentage.toFixed(1)}%)`);
    });
    
    // Calculate all-in savings (including transmission adder)
    const transmissionAdderValue = parseFloat(transmissionAdder);
    const totalAllInSavings = hoursToShutdown.reduce((sum, hour) => {
      const energyWithAdder = hour.price + transmissionAdderValue;
      return sum + energyWithAdder;
    }, 0);
    
    // Format ALL shutdown hours for display (not just first 50)
    const events = hoursToShutdown.map((hour) => ({
      date: hour.date,
      time: `${hour.hour.toString().padStart(2, '0')}:00`,
      price: hour.price,  // Energy price ONLY, no adder
      allInPrice: hour.price + transmissionAdderValue,
      duration: 1,
      savings: hour.price,  // Energy savings only
      allInSavings: hour.price + transmissionAdderValue
    }));
    
    return {
      totalShutdowns: allowedDowntimeHours,
      totalHours: allowedDowntimeHours,
      downtimePercentage: actualDowntimePercent,
      totalSavings: totalSavings,
      totalAllInSavings: totalAllInSavings,
      newAveragePrice: optimizedAvgPrice,
      originalAverage: originalAvgPrice,
      hourlyData: hourlyData,  // Real AESO data
      distributionData: distributionData,
      events: events
    };
  };

  // Enhanced: Smart price spike detection with variable duration
  const detectSmartPriceSpikes = (hourlyData: any[], threshold: number, constraints: any, baseline: any) => {
    const events: any[] = [];
    const violations: string[] = [];
    let totalHours = 0;
    let i = 0;

    // Debug: Check data distribution
    const prices = hourlyData.map(h => h.price);
    const maxPrice = Math.max(...prices);
    const avgPrice = prices.reduce((sum, p) => sum + p, 0) / prices.length;
    const p90Price = prices.sort((a, b) => b - a)[Math.floor(prices.length * 0.1)]; // 90th percentile
    
    console.log(`=== SMART SPIKE DETECTION DEBUG ===`);
    console.log(`Threshold: ${threshold} ¢/kWh`);
    console.log(`Data range: ${Math.min(...prices).toFixed(2)} - ${maxPrice.toFixed(2)} ¢/kWh`);
    console.log(`Average price: ${avgPrice.toFixed(2)} ¢/kWh`);
    console.log(`90th percentile: ${p90Price.toFixed(2)} ¢/kWh`);
    
    // Adaptive threshold: if user threshold is too high, use 90th percentile
    const effectiveThreshold = threshold > p90Price ? p90Price : threshold;
    console.log(`Effective threshold: ${effectiveThreshold.toFixed(2)} ¢/kWh`);

    while (i < hourlyData.length) {
      const currentHour = hourlyData[i];
      
      // Check if current hour exceeds effective threshold
      if (currentHour.price >= effectiveThreshold) {
        // Find the end of consecutive high prices
        let duration = 0;
        let peakPrice = currentHour.price;
        let totalSpikeCost = 0;
        let j = i;

        // Extend shutdown duration for consecutive high prices
        while (j < hourlyData.length && 
               (hourlyData[j].price >= effectiveThreshold || 
                (duration > 0 && hourlyData[j].price >= effectiveThreshold * constraints.consecutivePriceThresholdMultiplier))) {
          duration++;
          peakPrice = Math.max(peakPrice, hourlyData[j].price);
          totalSpikeCost += hourlyData[j].price;
          j++;
        }

        console.log(`Found potential event: ${currentHour.date} ${currentHour.hour}:00, duration: ${duration}h, peak: ${peakPrice.toFixed(2)}`);

        // Apply minimum duration constraint (make it more lenient for demonstration)
        const effectiveMinDuration = Math.min(constraints.minimumShutdownDuration, 1); // At least 1 hour
        duration = Math.max(duration, effectiveMinDuration);

        // Check daily shutdown limit (more lenient)
        const dayShutdowns = events.filter(e => e.date === currentHour.date).length;
        if (dayShutdowns >= constraints.maximumShutdownsPerDay) {
          violations.push(`Daily shutdown limit exceeded on ${currentHour.date}`);
          console.log(`Skipping event due to daily limit: ${currentHour.date}, existing events: ${dayShutdowns}`);
          i = j;
          continue;
        }

        if (duration >= effectiveMinDuration) {
          console.log(`Creating event: ${currentHour.date} ${currentHour.hour}:00, duration: ${duration}h`);
          const avgSpikePrice = totalSpikeCost / Math.min(duration, j - i);
          const baselinePrice = baseline.rollingData.find(r => 
            Math.abs(r.datetime.getTime() - currentHour.datetime.getTime()) < 3600000
          )?.average || baseline.average;

          events.push({
            date: currentHour.date,
            startHour: currentHour.hour,
            endHour: Math.min(currentHour.hour + duration - 1, 23),
            duration: duration,
            peakPrice: peakPrice,
            avgPrice: avgSpikePrice,
            baselinePrice: baselinePrice,
            savings: (avgSpikePrice - baselinePrice) * duration,
            allInSavings: (calculateAllInPrice(avgSpikePrice) - calculateAllInPrice(baselinePrice)) * duration,
            operationalCost: (constraints.startupCostPerMW + constraints.shutdownCostPerMW) / 1000
          });

          totalHours += duration;
        }

        i = j;
      } else {
        i++;
      }
    }

    const averageDuration = events.length > 0 ? totalHours / events.length : 0;

    return {
      events,
      totalHours,
      averageDuration,
      violations
    };
  };

  // Enhanced: Calculate strike price savings with operational costs
  const calculateStrikePriceSavings = (spikes: any, baseline: any, constraints: any) => {
    const grossSavings = spikes.events.reduce((sum: number, event: any) => sum + (event.savings || 0), 0);
    const grossAllInSavings = spikes.events.reduce((sum: number, event: any) => sum + (event.allInSavings || 0), 0);
    const operationalCosts = spikes.events.reduce((sum: number, event: any) => sum + (event.operationalCost || 0), 0);
    
    // Run Monte Carlo simulation for strike price analysis
    const monteCarloResult = runMonteCarloSimulation(spikes.events, baseline);
    
    // Risk adjustment based on baseline confidence
    const riskAdjustment = grossSavings * (1 - (baseline.confidenceLevel || 0.5)) * 0.25; // 25% of uncertain savings
    const netSavings = grossSavings - operationalCosts - riskAdjustment;
    const netAllInSavings = grossAllInSavings - operationalCosts - riskAdjustment;
    
    // Calculate new average price
    const totalOperationalHours = (parseInt(timePeriod) * 24) - (spikes.totalHours || 0);
    const savingsRatio = (netSavings || 0) / (grossSavings || 1);
    const newAveragePrice = (baseline.average || 0) * (1 - savingsRatio * 0.15);
    
    return {
      grossSavings: grossSavings || 0,
      operationalCosts: operationalCosts || 0,
      riskAdjustment: riskAdjustment || 0,
      netSavings: netSavings || 0,
      netAllInSavings: netAllInSavings || 0,
      newAveragePrice: newAveragePrice || baseline.average || 0,
      confidenceLevel: baseline.confidenceLevel || 0.5,
      projectedROI: (netSavings || 0) > 0 ? ((netSavings || 0) / (operationalCosts || 1)) * 100 : 0,
      monteCarloConfidenceInterval: monteCarloResult.confidenceInterval || { lower: 0, upper: 0 },
      probabilityOfProfit: monteCarloResult.probabilityOfProfit || 0,
      expectedValue: monteCarloResult.expectedValue || 0
    };
  };

  const calculateAllInPrice = (energyPrice: number) => {
    const adder = parseFloat(transmissionAdder);
    const result = energyPrice + adder;
    console.log(`calculateAllInPrice: ${energyPrice} + ${adder} = ${result}`);
    return result;
  };

  // Helper function for seasonal price adjustments
  const calculateSeasonalMultiplier = (date: Date) => {
    const month = date.getMonth(); // 0-11
    const hour = date.getHours(); // 0-23
    
    // Winter months (Dec, Jan, Feb) have higher prices
    if ([11, 0, 1].includes(month)) {
      return 1.2 + (hour >= 16 && hour <= 20 ? 0.3 : 0); // Extra premium during evening peak
    }
    
    // Summer months (Jun, Jul, Aug) have moderate increases
    if ([5, 6, 7].includes(month)) {
      return 1.1 + (hour >= 14 && hour <= 18 ? 0.2 : 0); // Afternoon AC load
    }
    
    // Spring/Fall have lower baseline
    return 0.9 + (hour >= 7 && hour <= 9 || hour >= 17 && hour <= 19 ? 0.15 : 0); // Rush hour peaks
  };


  const convertToUSD = (cadPrice: number) => {
    if (!exchangeRate) return 0;
    return cadPrice * exchangeRate;
  };

  const formatCurrency = (value: number | undefined | null) => {
    if (typeof value !== 'number' || isNaN(value)) return 'CA$0.00';
    return `CA$${value.toFixed(2)}`;
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border rounded-lg p-3 shadow-lg">
          <p className="font-medium">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }}>
              {entry.name}: {formatCurrency(entry.value)}/MWh
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // Get current analysis result
  const getCurrentAnalysis = () => {
    return customAnalysisResult;
  };

  const currentAnalysis = getCurrentAnalysis();

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-foreground flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            Historical Pricing Analysis
          </h2>
          <p className="text-sm text-muted-foreground">
            Advanced pricing analytics and peak shutdown optimization tools
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button 
            onClick={fetchMonthlyData} 
            disabled={loadingMonthly}
            variant="outline"
            size="sm"
          >
            <Calendar className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Refresh Monthly</span>
            <span className="sm:hidden">Monthly</span>
          </Button>
          <Button 
            onClick={fetchYearlyData} 
            disabled={loadingYearly}
            variant="outline"
            size="sm"
          >
            <Calendar className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Refresh Yearly</span>
            <span className="sm:hidden">Yearly</span>
          </Button>
        </div>
      </div>

      <Tabs defaultValue="monthly" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 gap-1 h-auto p-1">
          <TabsTrigger value="monthly" className="flex items-center gap-1.5 px-2 sm:px-4 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Calendar className="w-4 h-4 flex-shrink-0" />
            <span className="text-xs sm:text-sm whitespace-nowrap">Last 30 Days</span>
          </TabsTrigger>
          <TabsTrigger value="yearly" className="flex items-center gap-1.5 px-2 sm:px-4 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Calendar className="w-4 h-4 flex-shrink-0" />
            <span className="text-xs sm:text-sm whitespace-nowrap">Last 12 Months</span>
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-1.5 px-2 sm:px-4 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <BarChart3 className="w-4 h-4 flex-shrink-0" />
            <span className="text-xs sm:text-sm whitespace-nowrap">Uptime Analytics</span>
          </TabsTrigger>
          <TabsTrigger value="weather" className="flex items-center gap-1.5 px-2 sm:px-4 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <CloudRain className="w-4 h-4 flex-shrink-0" />
            <span className="text-xs sm:text-sm whitespace-nowrap">Weather Analysis</span>
          </TabsTrigger>
        </TabsList>

        {/* Monthly Data Tab */}
        <TabsContent value="monthly" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-green-600" />
                  30-Day Statistics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Average Price</span>
                    <span className="font-semibold">
                      {monthlyData?.statistics?.average !== undefined ? formatCurrency(monthlyData.statistics.average) : '—'}/MWh
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Peak Price</span>
                    <span className="font-semibold text-red-600">
                      {monthlyData?.statistics?.peak !== undefined ? formatCurrency(monthlyData.statistics.peak) : '—'}/MWh
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Low Price</span>
                    <span className="font-semibold text-green-600">
                      {monthlyData?.statistics?.low !== undefined ? formatCurrency(monthlyData.statistics.low) : '—'}/MWh
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Volatility</span>
                    <span className="font-semibold">
                      {monthlyData?.statistics?.volatility ? `${monthlyData.statistics.volatility.toFixed(1)}%` : '—'}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-blue-600" />
                  Optimized Pricing by Uptime
                </CardTitle>
                <p className="text-xs text-muted-foreground mt-1">
                  Strategic shutdown during peak prices - showing actual avg cost in CAD & USD
                </p>
              </CardHeader>
              <CardContent>
                {(() => {
                  if (!monthlyData?.rawHourlyData) return <div className="text-sm text-muted-foreground">Loading data...</div>;
                  
                  const uptimeLevels = [85, 90, 95, 97];
                  const transmissionCost = parseFloat(transmissionAdder) || 11.63;
                  const hourlyPrices = monthlyData.rawHourlyData.map(h => h.price);
                  
                  const quickAnalysis = uptimeLevels.map(uptime => {
                    const totalHours = hourlyPrices.length;
                    const operatingHours = Math.floor(totalHours * (uptime / 100));
                    const sortedPrices = [...hourlyPrices].sort((a, b) => a - b);
                    const operatingPrices = sortedPrices.slice(0, operatingHours);
                    const avgEnergyPrice = operatingPrices.reduce((sum, p) => sum + p, 0) / operatingHours;
                    const allInPrice = avgEnergyPrice + transmissionCost;
                    
                    return {
                      uptime,
                      priceInCentsCAD: (allInPrice / 10).toFixed(2),
                      priceInCentsUSD: (convertCADtoUSD(allInPrice) / 10).toFixed(2),
                      avgEnergyCAD: avgEnergyPrice.toFixed(2),
                      avgEnergyUSD: convertCADtoUSD(avgEnergyPrice).toFixed(2)
                    };
                  });
                  
                  return (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {quickAnalysis.map((item) => (
                        <div key={item.uptime} className="bg-muted/30 rounded-lg p-3 border border-border">
                          <div className="text-xs text-muted-foreground mb-1">{item.uptime}% Uptime</div>
                          <div className="space-y-1">
                            <div>
                              <div className="text-lg font-bold text-blue-600">
                                {item.priceInCentsCAD}¢
                              </div>
                              <div className="text-xs text-muted-foreground">
                                CAD per kWh
                              </div>
                            </div>
                            <div>
                              <div className="text-lg font-bold text-green-600">
                                {item.priceInCentsUSD}¢
                              </div>
                              <div className="text-xs text-muted-foreground">
                                USD per kWh
                              </div>
                            </div>
                          </div>
                          <div className="mt-2 pt-2 border-t border-border/50">
                            <div className="text-xs text-muted-foreground mb-1">Energy only:</div>
                            <div className="text-xs font-medium flex flex-wrap gap-x-1 items-center">
                              <span className="text-orange-600 whitespace-nowrap">CA${item.avgEnergyCAD}</span>
                              <span className="text-muted-foreground">/</span>
                              <span className="text-green-600 whitespace-nowrap">US${item.avgEnergyUSD}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </CardContent>
            </Card>
          </div>


          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-blue-600" />
                30-Day Price Trend
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                {loadingMonthly ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                ) : (
                  <ResponsiveContainer>
                    <AreaChart data={monthlyData?.chartData || []}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip content={<CustomTooltip />} />
                      <Area 
                        type="monotone" 
                        dataKey="price" 
                        stroke="#2563eb" 
                        fill="#2563eb20" 
                        name="Price"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Strike Price Analysis Section - 30 Day */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5 text-orange-600" />
                    Strike Price Analysis by Uptime Level
                  </CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    Energy costs and strike prices for different operational uptime percentages over the last 30 days
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {(() => {
                if (!monthlyData?.chartData || !monthlyData?.statistics) return (
                  <div className="flex items-center justify-center h-32 text-muted-foreground">
                    <div className="text-center">
                      <Activity className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p>Loading real AESO market data...</p>
                    </div>
                  </div>
                );
                
                // Use REAL AESO data with strategic shutdown calculation
                const uptimeLevels = [85, 90, 95, 97];
                const transmissionCost = parseFloat(transmissionAdder) || 11.63;
                
                // Get all hourly prices from the raw data
                const hourlyPrices = monthlyData.rawHourlyData?.map(h => h.price) || [];
                
                const uptimeAnalysis = uptimeLevels.map(uptime => {
                  const totalMonthlyHours = hourlyPrices.length || 720;
                  const monthlyOperatingHours = Math.floor(totalMonthlyHours * (uptime / 100));
                  const monthlyShutdownHours = totalMonthlyHours - monthlyOperatingHours;
                  
                  // Sort prices and remove the most expensive hours (strategic shutdown)
                  const sortedPrices = [...hourlyPrices].sort((a, b) => a - b);
                  const operatingHourPrices = sortedPrices.slice(0, monthlyOperatingHours);
                  
                  // Calculate actual average energy price during operating hours
                  const avgEnergyPrice = operatingHourPrices.reduce((sum, price) => sum + price, 0) / monthlyOperatingHours;
                  
                  // Strike price is the threshold above which we shut down
                  const strikePrice = sortedPrices[monthlyOperatingHours - 1] || avgEnergyPrice;
                  const allInStrikePrice = strikePrice + transmissionCost;
                  
                  // Monthly cost calculation
                  const monthlyMWh = monthlyOperatingHours;
                  const monthlyCostCAD = (avgEnergyPrice + transmissionCost) * monthlyMWh;
                  
                  return {
                    uptime,
                    strikePrice: strikePrice.toFixed(2),
                    allInStrikePrice: allInStrikePrice.toFixed(2),
                    avgEnergyPrice: avgEnergyPrice.toFixed(2),
                    monthlyOperatingHours: monthlyOperatingHours.toFixed(0),
                    monthlyShutdownHours: monthlyShutdownHours.toFixed(0),
                    monthlyCostCAD: monthlyCostCAD.toFixed(0)
                  };
                });
                
                return (
                  <div className="space-y-6">
                    {/* Two-Column Layout */}
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                      {/* Strike Price Table */}
                      <div className="space-y-4">
                        <h4 className="font-semibold text-lg flex items-center gap-2">
                          <Calculator className="w-5 h-5 text-orange-600" />
                          Strike Prices & Monthly Costs (1 MW load)
                        </h4>
                        
                        <div className="overflow-x-auto rounded-lg border">
                          <table className="w-full min-w-[800px]">
                            <thead className="bg-muted/50">
                              <tr>
                                <th className="text-left py-3 px-3 sm:px-4 font-semibold text-xs sm:text-sm">Uptime</th>
                                <th className="text-right py-3 px-3 sm:px-4 font-semibold text-xs sm:text-sm">Strike Price<br/>(Threshold)</th>
                                <th className="text-right py-3 px-3 sm:px-4 font-semibold text-xs sm:text-sm">Avg Energy<br/>Price</th>
                                <th className="text-right py-3 px-3 sm:px-4 font-semibold text-xs sm:text-sm">All-In<br/>(¢/kWh)</th>
                                <th className="text-right py-3 px-3 sm:px-4 font-semibold text-xs sm:text-sm">Operating<br/>Hours</th>
                                <th className="text-right py-3 px-3 sm:px-4 font-semibold text-xs sm:text-sm">Shutdown<br/>Hours</th>
                                <th className="text-right py-3 px-3 sm:px-4 font-semibold text-xs sm:text-sm">Monthly<br/>Cost</th>
                              </tr>
                            </thead>
                            <tbody>
                              {uptimeAnalysis.map((analysis, index) => (
                                <tr key={analysis.uptime} className={index % 2 === 0 ? 'bg-background' : 'bg-muted/30'}>
                                  <td className="py-3 px-3 sm:px-4">
                                    <Badge variant={analysis.uptime >= 95 ? 'default' : 'secondary'} className="font-medium text-xs">
                                      {analysis.uptime}%
                                    </Badge>
                                  </td>
                                  <td className="text-right py-3 px-3 sm:px-4 font-mono text-xs sm:text-sm font-semibold text-orange-600">
                                    CA${analysis.strikePrice}/MWh
                                  </td>
                                  <td className="text-right py-3 px-3 sm:px-4 font-mono text-xs sm:text-sm font-semibold text-green-600">
                                    CA${analysis.avgEnergyPrice}/MWh
                                  </td>
                                  <td className="text-right py-3 px-3 sm:px-4 font-mono text-xs sm:text-sm font-semibold text-blue-600">
                                    {((parseFloat(analysis.avgEnergyPrice) + parseFloat(transmissionAdder)) / 10).toFixed(2)}¢
                                  </td>
                                  <td className="text-right py-3 px-3 sm:px-4 font-mono text-xs sm:text-sm">
                                    {analysis.monthlyOperatingHours}h
                                  </td>
                                  <td className="text-right py-3 px-3 sm:px-4 font-mono text-xs sm:text-sm text-amber-600 font-medium">
                                    {analysis.monthlyShutdownHours}h
                                  </td>
                                  <td className="text-right py-3 px-3 sm:px-4 font-mono text-xs sm:text-sm text-green-600 font-semibold">
                                    CA${Number(analysis.monthlyCostCAD).toLocaleString()}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                        
                        <p className="text-xs text-muted-foreground">
                          *Prices calculated by removing the most expensive hours during shutdowns. Strike Price = threshold above which to shut down. Avg Energy Price = actual cost during operating hours.
                        </p>
                      </div>
                      
                    </div>
                  </div>
                );
              })()}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Yearly Data Tab - Completely Redesigned */}
        <TabsContent value="yearly" className="space-y-6">
          {/* Real Data Information Banner */}
          <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <div>
                <h3 className="font-semibold text-blue-900 dark:text-blue-100">Real AESO Market Data</h3>
                <p className="text-sm text-blue-700 dark:text-blue-200">
                  All pricing data is sourced directly from AESO's official API in real-time. 
                  Average price: CA${yearlyData?.statistics?.average?.toFixed(2) || '--'}/MWh based on actual 12-month historical data.
                </p>
              </div>
            </div>
          </div>

          {/* Market Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="border-l-4 border-l-blue-500">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">12-Month Average</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {yearlyData?.statistics?.average ? `CA$${yearlyData.statistics.average.toFixed(2)}` : '--'}
                    </p>
                    <p className="text-xs text-muted-foreground">per MWh</p>
                  </div>
                  <DollarSign className="w-8 h-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-red-500">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Peak Price</p>
                    <p className="text-2xl font-bold text-red-600">
                      {yearlyData?.statistics?.peak ? `CA$${yearlyData.statistics.peak.toFixed(2)}` : '--'}
                    </p>
                    <p className="text-xs text-muted-foreground">highest recorded</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-red-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-green-500">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Low Price</p>
                    <p className="text-2xl font-bold text-green-600">
                      {yearlyData?.statistics?.low !== undefined ? `CA$${yearlyData.statistics.low.toFixed(2)}` : '--'}
                    </p>
                    <p className="text-xs text-muted-foreground">lowest recorded</p>
                  </div>
                  <TrendingDown className="w-8 h-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-purple-500">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Market Volatility</p>
                    <p className="text-2xl font-bold text-purple-600">
                      {yearlyData?.statistics?.volatility ? `${yearlyData.statistics.volatility.toFixed(1)}%` : '--'}
                    </p>
                    <p className="text-xs text-muted-foreground">price variation</p>
                  </div>
                  <Activity className="w-8 h-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Strike Price Analysis Section - Improved Layout */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5 text-orange-600" />
                    Strike Price Analysis by Uptime Level
                  </CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    Energy costs and strike prices for different operational uptime percentages over the last 12 months
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {(() => {
                if (!yearlyData?.chartData || !yearlyData?.statistics) return (
                  <div className="flex items-center justify-center h-32 text-muted-foreground">
                    <div className="text-center">
                      <Activity className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p>Loading real AESO market data...</p>
                    </div>
                  </div>
                );
                
                // Use REAL AESO data with strategic shutdown calculation
                const uptimeLevels = [85, 90, 95, 97];
                const transmissionCost = parseFloat(transmissionAdder) || 11.63;
                
                // Get all hourly prices from the raw data (12 months worth)
                const hourlyPrices = yearlyData.rawHourlyData?.map(h => h.price) || [];
                
                const uptimeAnalysis = uptimeLevels.map(uptime => {
                  const totalMonthlyHours = hourlyPrices.length || 8760;
                  const monthlyOperatingHours = Math.floor(totalMonthlyHours * (uptime / 100));
                  const monthlyShutdownHours = totalMonthlyHours - monthlyOperatingHours;
                  
                  // Sort prices and remove the most expensive hours (strategic shutdown)
                  const sortedPrices = [...hourlyPrices].sort((a, b) => a - b);
                  const operatingHourPrices = sortedPrices.slice(0, monthlyOperatingHours);
                  
                  // Calculate actual average energy price during operating hours
                  const avgEnergyPrice = operatingHourPrices.reduce((sum, price) => sum + price, 0) / monthlyOperatingHours;
                  
                  // Strike price is the threshold above which we shut down
                  const strikePrice = sortedPrices[monthlyOperatingHours - 1] || avgEnergyPrice;
                  const allInStrikePrice = strikePrice + transmissionCost;
                  
                  // Monthly cost calculation (normalized to 30 days)
                  const normalizedHours = 720; // 30 days * 24 hours
                  const normalizedOperatingHours = normalizedHours * (uptime / 100);
                  const monthlyMWh = normalizedOperatingHours;
                  const monthlyCostCAD = (avgEnergyPrice + transmissionCost) * monthlyMWh;
                  
                  return {
                    uptime,
                    strikePrice: strikePrice.toFixed(2),
                    allInStrikePrice: allInStrikePrice.toFixed(2),
                    avgEnergyPrice: avgEnergyPrice.toFixed(2),
                    monthlyOperatingHours: normalizedOperatingHours.toFixed(0),
                    monthlyShutdownHours: (normalizedHours - normalizedOperatingHours).toFixed(0),
                    monthlyCostCAD: monthlyCostCAD.toFixed(0)
                  };
                });
                
                return (
                  <div className="space-y-6">
                    {/* Two-Column Layout */}
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                      {/* Strike Price Table */}
                      <div className="space-y-4">
                        <h4 className="font-semibold text-lg flex items-center gap-2">
                          <Calculator className="w-5 h-5 text-orange-600" />
                          Strike Prices & Monthly Costs (1 MW load)
                        </h4>
                        
                        <div className="overflow-x-auto rounded-lg border">
                          <table className="w-full min-w-[800px]">
                            <thead className="bg-muted/50">
                              <tr>
                                <th className="text-left py-3 px-3 sm:px-4 font-semibold text-xs sm:text-sm">Uptime</th>
                                <th className="text-right py-3 px-3 sm:px-4 font-semibold text-xs sm:text-sm">Strike Price<br/>(Threshold)</th>
                                <th className="text-right py-3 px-3 sm:px-4 font-semibold text-xs sm:text-sm">Avg Energy<br/>Price</th>
                                <th className="text-right py-3 px-3 sm:px-4 font-semibold text-xs sm:text-sm">All-In<br/>(¢/kWh)</th>
                                <th className="text-right py-3 px-3 sm:px-4 font-semibold text-xs sm:text-sm">Operating<br/>Hours</th>
                                <th className="text-right py-3 px-3 sm:px-4 font-semibold text-xs sm:text-sm">Shutdown<br/>Hours</th>
                                <th className="text-right py-3 px-3 sm:px-4 font-semibold text-xs sm:text-sm">Monthly<br/>Cost</th>
                              </tr>
                            </thead>
                            <tbody>
                              {uptimeAnalysis.map((analysis, index) => (
                                <tr key={analysis.uptime} className={index % 2 === 0 ? 'bg-background' : 'bg-muted/30'}>
                                  <td className="py-3 px-3 sm:px-4">
                                    <Badge variant={analysis.uptime >= 95 ? 'default' : 'secondary'} className="font-medium text-xs">
                                      {analysis.uptime}%
                                    </Badge>
                                  </td>
                                  <td className="text-right py-3 px-3 sm:px-4 font-mono text-xs sm:text-sm font-semibold text-orange-600">
                                    CA${analysis.strikePrice}/MWh
                                  </td>
                                  <td className="text-right py-3 px-3 sm:px-4 font-mono text-xs sm:text-sm font-semibold text-green-600">
                                    CA${analysis.avgEnergyPrice}/MWh
                                  </td>
                                  <td className="text-right py-3 px-3 sm:px-4 font-mono text-xs sm:text-sm font-semibold text-blue-600">
                                    {((parseFloat(analysis.avgEnergyPrice) + parseFloat(transmissionAdder)) / 10).toFixed(2)}¢
                                  </td>
                                  <td className="text-right py-3 px-3 sm:px-4 font-mono text-xs sm:text-sm">
                                    {analysis.monthlyOperatingHours}h
                                  </td>
                                  <td className="text-right py-3 px-3 sm:px-4 font-mono text-xs sm:text-sm text-amber-600 font-medium">
                                    {analysis.monthlyShutdownHours}h
                                  </td>
                                  <td className="text-right py-3 px-3 sm:px-4 font-mono text-xs sm:text-sm text-green-600 font-semibold">
                                    CA${Number(analysis.monthlyCostCAD).toLocaleString()}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                        
                        <p className="text-xs text-muted-foreground">
                          *Prices calculated by removing the most expensive hours during shutdowns. Strike Price = threshold above which to shut down. Avg Energy Price = actual cost during operating hours.
                        </p>
                      </div>
                      
                      {/* Uptime vs Cost Visualization */}
                      <div className="space-y-6">
                        <h4 className="font-semibold text-lg flex items-center gap-2">
                          <BarChart3 className="w-5 h-5 text-blue-600" />
                          Uptime vs Monthly Cost Analysis
                        </h4>
                        
                        {/* Chart Container with explicit labels */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-center">
                            <div className="w-full max-w-5xl">
                              {/* Y-axis label */}
                              <div className="flex items-center gap-4">
                                <div className="writing-mode-vertical text-sm font-medium text-muted-foreground whitespace-nowrap" style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>
                                  Monthly Cost (CAD)
                                </div>
                                
                                {/* Chart */}
                                <div className="flex-1 rounded-lg border bg-gradient-to-br from-blue-50/50 to-indigo-50/50 dark:from-blue-950/20 dark:to-indigo-950/20 p-6">
                                  <div className="w-full h-[400px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                      <LineChart data={uptimeAnalysis} margin={{ top: 20, right: 30, left: 60, bottom: 70 }}>
                                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                                        <XAxis 
                                          dataKey="uptime" 
                                          tick={{ fontSize: 12 }}
                                          tickLine={{ stroke: 'currentColor' }}
                                        />
                                        <YAxis 
                                          tick={{ fontSize: 12 }}
                                          tickFormatter={(value) => `$${Math.round(value/1000)}k`}
                                          tickLine={{ stroke: 'currentColor' }}
                                        />
                                        <Tooltip 
                                          formatter={(value) => [`CA$${Number(value).toLocaleString()}`, 'Monthly Cost']}
                                          labelFormatter={(label) => `${label}% Uptime`}
                                          contentStyle={{ 
                                            backgroundColor: 'hsl(var(--background))',
                                            border: '1px solid hsl(var(--border))',
                                            borderRadius: '8px',
                                            fontSize: '12px'
                                          }}
                                        />
                                        <Line 
                                          type="monotone" 
                                          dataKey="monthlyCostCAD" 
                                          stroke="hsl(221, 83%, 53%)" 
                                          strokeWidth={3}
                                          dot={{ fill: 'hsl(221, 83%, 53%)', r: 5, strokeWidth: 2, stroke: '#ffffff' }}
                                          activeDot={{ r: 7 }}
                                        />
                                      </LineChart>
                                    </ResponsiveContainer>
                                  </div>
                                </div>
                              </div>
                              
                              {/* X-axis label */}
                              <div className="text-center text-sm font-medium text-muted-foreground mt-2 pr-12">
                                Uptime (%)
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center text-sm text-muted-foreground">
                          <div className="flex items-center justify-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                            Strike price = threshold above which to shut down
                          </div>
                          <div className="flex items-center justify-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                            Higher uptime = higher strike price (shut down less)
                          </div>
                          <div className="flex items-center justify-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                            Costs based on real AESO market average
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </CardContent>
          </Card>

          {/* 12-Month Price Trend - Completely Redesigned */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-blue-600" />
                12-Month Price Trend Analysis
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Monthly average and peak prices with 95% uptime strike price reference
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {loadingYearly ? (
                  <div className="flex items-center justify-center h-80">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                      <p className="text-muted-foreground">Loading real AESO market data...</p>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Main Chart */}
                    <div className="w-full">
                      <div className="flex items-center gap-4">
                        <div className="hidden sm:block writing-mode-vertical text-sm font-medium text-muted-foreground whitespace-nowrap" style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>
                          Price (CA$/MWh)
                        </div>
                        
                        <div className="flex-1 rounded-lg border bg-gradient-to-br from-gray-50/50 to-blue-50/50 dark:from-gray-950/20 dark:to-blue-950/20 p-4 sm:p-6">
                          <div className="w-full h-[350px] sm:h-[400px]">
                            <ResponsiveContainer width="100%" height="100%">
                              <LineChart data={yearlyData?.chartData || []} margin={{ top: 10, right: 10, left: 10, bottom: 50 }}>
                                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                                <XAxis 
                                  dataKey="month" 
                                  tick={{ fontSize: 11 }}
                                  angle={-45}
                                  textAnchor="end"
                                  height={80}
                                />
                                <YAxis 
                                  tick={{ fontSize: 11 }}
                                  tickFormatter={(value) => `$${Math.round(value)}`}
                                  width={50}
                                />
                                <Tooltip 
                                  content={({ active, payload, label }) => {
                                    if (!active || !payload || !payload.length) return null;
                                    return (
                                      <div className="bg-background border border-border rounded-lg shadow-lg p-3">
                                        <p className="font-semibold text-sm mb-1">{label}</p>
                                        {payload.map((entry, index) => (
                                          <p key={index} style={{ color: entry.color }} className="text-xs">
                                            {entry.name}: CA${Number(entry.value).toFixed(2)}/MWh
                                          </p>
                                        ))}
                                      </div>
                                    );
                                  }}
                                />
                                <Legend 
                                  wrapperStyle={{ paddingTop: '10px', fontSize: '12px' }}
                                  iconType="line"
                                />
                                
                                {/* Average Price Line */}
                                <Line 
                                  type="monotone" 
                                  dataKey="average" 
                                  stroke="hsl(221, 83%, 53%)" 
                                  name="Average Price"
                                  strokeWidth={2.5}
                                  dot={{ fill: 'hsl(221, 83%, 53%)', r: 3, strokeWidth: 2, stroke: '#ffffff' }}
                                  activeDot={{ r: 5 }}
                                />
                                
                                {/* Peak Price Line */}
                                <Line 
                                  type="monotone" 
                                  dataKey="peak" 
                                  stroke="hsl(0, 72%, 51%)" 
                                  name="Peak Price"
                                  strokeWidth={2}
                                  strokeDasharray="6 3"
                                  dot={{ fill: 'hsl(0, 72%, 51%)', r: 2, strokeWidth: 2, stroke: '#ffffff' }}
                                  activeDot={{ r: 4 }}
                                />
                                
                                {/* 95% Uptime Strike Price - Single Reference Line */}
                                <Line 
                                  type="monotone" 
                                  dataKey={() => (yearlyData?.statistics?.average || 60) * 1.075}
                                  stroke="hsl(38, 92%, 50%)" 
                                  name="95% Uptime Strike"
                                  strokeWidth={2}
                                  strokeDasharray="8 4"
                                  dot={false}
                                  activeDot={false}
                                />
                              </LineChart>
                            </ResponsiveContainer>
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-center text-sm font-medium text-muted-foreground mt-2">
                        Month
                      </div>
                    </div>

                    {/* Seasonal Analysis */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      {yearlyData?.seasonalPatterns && Object.entries(yearlyData.seasonalPatterns).map(([season, data]) => (
                        <Card key={season} className="text-center">
                          <CardContent className="p-4">
                            <h4 className="font-semibold capitalize text-sm text-muted-foreground">{season}</h4>
                            <div className="mt-2">
                              <p className="text-lg font-bold text-blue-600">
                                CA${data.average?.toFixed(2) || '--'}
                              </p>
                              <p className="text-xs text-muted-foreground">Avg: CA${data.average?.toFixed(2) || '--'}/MWh</p>
                              <p className="text-xs text-muted-foreground">Peak: CA${data.peak?.toFixed(2) || '--'}/MWh</p>
                              <p className="text-xs text-muted-foreground">95% Strike: CA${((data.average || 0) * 1.075).toFixed(2)}/MWh</p>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Historical 10-Year Comparison Analysis */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">10-Year Real AESO Historical Data Analysis</h3>
                  <p className="text-sm text-muted-foreground">
                    Real historical price data from AESO API (95% uptime analysis)
                  </p>
                </div>
                <Button 
                  onClick={fetchRealHistoricalData} 
                  disabled={loadingHistoricalTenYear}
                  variant="outline"
                  size="sm"
                >
                  {loadingHistoricalTenYear ? "Fetching..." : "Refresh Data"}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {(() => {
                // Show prompt to load data if not loaded yet
                if (!historicalTenYearData && !loadingHistoricalTenYear) {
                  return (
                    <div className="p-8 text-center">
                      <div className="mx-auto w-16 h-16 mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                        <BarChart3 className="w-8 h-8 text-primary" />
                      </div>
                      <h4 className="text-lg font-semibold mb-2">Real 10-Year AESO Historical Data</h4>
                      <p className="text-muted-foreground mb-4 max-w-md mx-auto">
                        Click "Refresh Data" to fetch 10 years of real historical electricity pricing data directly from the AESO API.
                      </p>
                      <Button onClick={fetchRealHistoricalData} variant="default">
                        Load Historical Data
                      </Button>
                    </div>
                  );
                }
                
                // Show loading state
                if (loadingHistoricalTenYear) {
                  return (
                    <div className="p-8">
                      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="flex items-center gap-2">
                          <div className="animate-spin h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full"></div>
                          <span className="text-blue-800 font-medium">Fetching real AESO historical data...</span>
                        </div>
                        <p className="text-blue-600 text-sm mt-1">
                          Retrieving 10 years of real market data from AESO API. This may take 30-60 seconds...
                        </p>
                      </div>
                    </div>
                  );
                }
                
                // Show error or no data state
                if (!historicalTenYearData?.historicalYears || historicalTenYearData.historicalYears.length === 0) {
                  return (
                    <div className="p-8 text-center">
                      <AlertTriangle className="w-12 h-12 text-yellow-600 mx-auto mb-4" />
                      <h4 className="text-lg font-semibold mb-2">No Historical Data Available</h4>
                      <p className="text-muted-foreground mb-4">
                        Unable to retrieve historical data from AESO API. Please try again.
                      </p>
                      <Button onClick={fetchRealHistoricalData} variant="outline">
                        Retry
                      </Button>
                    </div>
                  );
                }
                
                // Process real data from API
                const historicalYears = historicalTenYearData.historicalYears
                  .filter((y: any) => y.average !== null) // Only include years with data
                  .map((y: any) => ({
                    year: y.year,
                    average: y.average,
                    peak: y.peak,
                    low: y.low,
                    volatility: y.volatility,
                    dataPoints: y.dataPoints,
                    isReal: y.isReal
                  }));
                
                if (historicalYears.length === 0) {
                  return (
                    <div className="p-8 text-center">
                      <AlertTriangle className="w-12 h-12 text-yellow-600 mx-auto mb-4" />
                      <p className="text-muted-foreground">No valid data points in historical dataset</p>
                    </div>
                  );
                }
                
                // Calculate trend metrics from REAL DATA
                const currentYear = new Date().getFullYear();
                const currentYearData = historicalYears.find((y: any) => y.year === currentYear);
                const tenYearAgoData = historicalYears[0];
                const currentAverage = currentYearData?.average || historicalYears[historicalYears.length - 1].average;
                const priceIncrease = ((currentAverage - tenYearAgoData.average) / tenYearAgoData.average) * 100;
                const averageVolatility = historicalYears.reduce((sum: number, year: any) => sum + (year.volatility || 0), 0) / historicalYears.length;
                const tenYearAverage = historicalYears.reduce((sum: number, year: any) => sum + year.average, 0) / historicalYears.length;
                const currentVsAverage = ((currentAverage - tenYearAverage) / tenYearAverage) * 100;
                
                return (
                  <div className="space-y-6">
                    
                    {/* Data Source Badge */}
                    <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <div className="w-2 h-2 bg-green-600 rounded-full animate-pulse"></div>
                      <span className="text-sm font-medium text-green-800">
                        Real AESO API Data • {historicalTenYearData.realDataYears} of {historicalTenYearData.totalYears} years with data
                      </span>
                      <span className="text-xs text-green-600 ml-auto">
                        Last updated: {new Date(historicalTenYearData.lastUpdated).toLocaleTimeString()}
                      </span>
                    </div>
                    
                    {/* Historical Metrics Display */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <Card>
                        <CardContent className="p-4">
                          <div className="text-2xl font-bold text-green-600">
                            {historicalYears.length}
                          </div>
                          <p className="text-xs text-muted-foreground">Years with Data</p>
                          <p className="text-xs text-green-600 mt-1">
                            {historicalYears.reduce((sum: number, y: any) => sum + y.dataPoints, 0).toLocaleString()} data points
                          </p>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-4">
                          <div className="text-2xl font-bold text-blue-600">
                            {priceIncrease.toFixed(1)}%
                          </div>
                          <p className="text-xs text-muted-foreground">Price Growth</p>
                          <p className="text-xs text-blue-600 mt-1">
                            {tenYearAgoData.year} to {currentYear}
                          </p>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-4">
                          <div className="text-2xl font-bold text-orange-600">
                            {averageVolatility.toFixed(0)}%
                          </div>
                          <p className="text-xs text-muted-foreground">Avg Volatility</p>
                          <p className="text-xs text-orange-600 mt-1">
                            10-year average
                          </p>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-4">
                          <div className="text-2xl font-bold text-purple-600">
                            CA${currentAverage.toFixed(2)}
                          </div>
                          <p className="text-xs text-muted-foreground">Current Year Avg</p>
                          <p className="text-xs text-purple-600 mt-1">
                            {currentVsAverage > 0 ? '+' : ''}{currentVsAverage.toFixed(1)}% vs 10yr avg
                          </p>
                        </CardContent>
                      </Card>
                    </div>
                    
                    {/* Historical Trend Charts */}
                    <div className="space-y-6">
                      {/* 10-Year Average Price Trend */}
                      <div>
                        <h4 className="font-semibold mb-3 text-sm">10-Year Average Price Trend</h4>
                        <div className="h-72">
                          <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={historicalYears}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="year" />
                              <YAxis 
                                label={{ value: 'Price (CA$/MWh)', angle: -90, position: 'insideLeft' }}
                                tickFormatter={(value) => `${Math.round(value)}`}
                              />
                              <Tooltip 
                                formatter={(value, name) => [
                                  `CA$${Number(value).toFixed(2)}`,
                                  name === 'average' ? 'Average Price' : name
                                ]}
                              />
                              <Area 
                                type="monotone" 
                                dataKey="average" 
                                stroke="#2563eb" 
                                fill="#2563eb20"
                                strokeWidth={2}
                                name="Average Price"
                              />
                            </AreaChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                      
                      {/* Price Range Analysis */}
                      <div>
                        <h4 className="font-semibold mb-3 text-sm">Price Range & Volatility Analysis</h4>
                        <div className="h-64">
                          <ResponsiveContainer>
                            <LineChart data={historicalYears}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="year" />
                              <YAxis label={{ value: 'Price (CA$/MWh)', angle: -90, position: 'insideLeft' }} />
                              <Tooltip 
                                formatter={(value, name) => [
                                  `CA$${Number(value).toFixed(2)}`,
                                  name === 'peak' ? 'Peak Price' : name === 'low' ? 'Low Price' : 'Average Price'
                                ]}
                              />
                              <Line 
                                type="monotone" 
                                dataKey="peak" 
                                stroke="#dc2626" 
                                strokeWidth={2}
                                name="Peak Price"
                                strokeDasharray="3 3"
                              />
                              <Line 
                                type="monotone" 
                                dataKey="average" 
                                stroke="#2563eb" 
                                strokeWidth={3}
                                name="Average Price"
                              />
                              <Line 
                                type="monotone" 
                                dataKey="low" 
                                stroke="#16a34a" 
                                strokeWidth={2}
                                name="Low Price"
                                strokeDasharray="3 3"
                              />
                            </LineChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                    </div>
                    
                    {/* Market Insights */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Market Intelligence & Insights</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div>
                            <h5 className="font-semibold mb-2">Price Trend Analysis</h5>
                            <ul className="space-y-1 text-muted-foreground">
                              <li>• 10-year compound annual growth rate: {(Math.pow(currentAverage / tenYearAgoData.average, 1/10) - 1 * 100).toFixed(2)}%</li>
                              <li>• Current prices are {Math.abs(currentVsAverage).toFixed(1)}% {currentVsAverage > 0 ? 'above' : 'below'} 10-year average</li>
                              <li>• Peak volatility: {Math.max(...historicalYears.map((y: any) => y.volatility || 0)).toFixed(0)}% in {historicalYears.reduce((max: any, year: any) => (year.volatility || 0) > (max.volatility || 0) ? year : max).year}</li>
                              <li>• Most stable year: {historicalYears.reduce((min: any, year: any) => (year.volatility || Infinity) < (min.volatility || Infinity) ? year : min).year} ({historicalYears.reduce((min: any, year: any) => (year.volatility || Infinity) < (min.volatility || Infinity) ? year : min).volatility?.toFixed(0)}% volatility)</li>
                              <li>• Data sourced from AESO API with {historicalYears.reduce((sum: number, y: any) => sum + y.dataPoints, 0).toLocaleString()} total hourly price points</li>
                            </ul>
                          </div>
                          <div>
                            <h5 className="font-semibold mb-2">Strategic Recommendations</h5>
                            <ul className="space-y-1 text-muted-foreground">
                              <li>• Consider {currentVsAverage > 20 ? 'demand response' : 'fixed pricing'} strategies</li>
                              <li>• Optimal uptime target: {currentVsAverage > 10 ? '90-95%' : '95-98%'} based on current market</li>
                              <li>• Price volatility suggests {averageVolatility > 50 ? 'active' : 'passive'} management approach</li>
                              <li>• Historical patterns indicate {priceIncrease > 30 ? 'continued growth' : 'market maturation'}</li>
                            </ul>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                );
              })()}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <DollarSign className="w-4 h-4 text-green-600" />
                  Average Price
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {monthlyData?.statistics?.average !== undefined ? formatCurrency(monthlyData.statistics.average) : '—'}
                </div>
                <p className="text-xs text-muted-foreground">per MWh (30 days)</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <TrendingUp className="w-4 h-4 text-red-600" />
                  Peak Price
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {monthlyData?.statistics?.peak !== undefined ? formatCurrency(monthlyData.statistics.peak) : '—'}
                </div>
                <p className="text-xs text-muted-foreground">highest recorded</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <TrendingDown className="w-4 h-4 text-blue-600" />
                  Low Price
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {monthlyData?.statistics?.low !== undefined ? formatCurrency(monthlyData.statistics.low) : '—'}
                </div>
                <p className="text-xs text-muted-foreground">lowest recorded</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Activity className="w-4 h-4 text-purple-600" />
                  Volatility
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">
                  {monthlyData?.statistics?.volatility ? `${monthlyData.statistics.volatility.toFixed(1)}%` : '—'}
                </div>
                <p className="text-xs text-muted-foreground">price variation</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="w-4 h-4 text-red-600" />
                Peak Hour Shutdown Analyzer
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Calculate energy savings by shutting down operations during high price periods
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Time Period and Adder Configuration */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium">Analysis Period</label>
                    <Select value={timePeriod} onValueChange={(value: '30' | '90' | '180' | '365') => setTimePeriod(value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="30">Last 30 days</SelectItem>
                        <SelectItem value="90">Last 90 days</SelectItem>
                        <SelectItem value="180">Last 180 days</SelectItem>
                        <SelectItem value="365">Last year</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium">Transmission Adder ($/MWh)</label>
                    <input
                      type="number"
                      value={transmissionAdder}
                      onChange={(e) => setTransmissionAdder(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      step="0.01"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Transmission, DTS, and other fees
                    </p>
                  </div>
                  
                    <div>
                      <label className="text-sm font-medium">Exchange Rate</label>
                      <div className="text-sm font-medium text-green-600">
                        {liveExchangeRate ? `1 CAD = ${liveExchangeRate.toFixed(4)} USD` : 'Loading...'}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Live rate from multiple sources
                      </p>
                    </div>
                </div>

                {/* Uptime Analysis Configuration */}
                <div className="p-4 border rounded-lg space-y-4">
                  <h4 className="font-medium text-sm flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Uptime Optimization Analysis
                  </h4>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium">Target Uptime (%)</label>
                      <input
                        type="number"
                        value={uptimePercentage}
                        onChange={(e) => setUptimePercentage(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        min="50"
                        max="99.9"
                        step="0.1"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Automatically shuts down during most expensive {(100 - parseFloat(uptimePercentage)).toFixed(1)}% of hours to maintain {uptimePercentage}% uptime
                      </p>
                    </div>
                    
                    <Button 
                      onClick={handleUptimeAnalysis}
                      disabled={loadingPeakAnalysis || !monthlyData}
                      className="w-full"
                    >
                      {loadingPeakAnalysis ? 'Analyzing...' : 'Calculate Uptime Optimized'}
                    </Button>
                  </div>
                </div>

                {/* Analysis Results */}
                {currentAnalysis && (
                  <div className="space-y-4">
                     <div className="grid grid-cols-1 md:grid-cols-5 gap-4 p-4 bg-muted/50 rounded-lg">
                       <div className="text-center">
                         <div className="text-2xl font-bold text-red-600">{currentAnalysis.totalShutdowns}</div>
                         <p className="text-sm text-muted-foreground">Shutdown Events</p>
                         <p className="text-xs text-muted-foreground">
                           for {uptimePercentage}% uptime
                         </p>
                       </div>
                       
                       <div className="text-center">
                         <div className="text-2xl font-bold text-orange-600">{currentAnalysis.totalHours}</div>
                         <p className="text-sm text-muted-foreground">Total Hours</p>
                         <p className="text-xs text-muted-foreground">of shutdown</p>
                       </div>

                         <div className="text-center">
                           <div className="text-2xl font-bold text-blue-600">
                             {(() => {
                               if (!currentAnalysis?.totalHours) return '0.0';
                               const daysInPeriod = parseInt(timePeriod);
                               const totalHoursInPeriod = daysInPeriod * 24;
                               return ((currentAnalysis.totalHours / totalHoursInPeriod) * 100).toFixed(1);
                             })()}%
                           </div>
                           <p className="text-sm text-muted-foreground">Downtime</p>
                           <p className="text-xs text-muted-foreground">percentage</p>
                         </div>
                      
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">
                          {formatCurrency(currentAnalysis.totalSavings || 0)}
                        </div>
                        <p className="text-sm text-muted-foreground">Energy Savings</p>
                        <p className="text-xs text-muted-foreground">(energy cost only)</p>
                      </div>
                      
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">
                          {formatCurrency(currentAnalysis.newAveragePrice || 0)}
                        </div>
                        <div className="text-sm font-medium text-blue-500">
                          {liveExchangeRate ? formatCurrencyUSD(convertCADtoUSD(currentAnalysis.newAveragePrice || 0), 'USD') : 'Loading USD...'}
                        </div>
                        <p className="text-sm text-muted-foreground">New Avg Price</p>
                        <p className="text-xs text-muted-foreground">energy only</p>
                      </div>
                    </div>
                    
                    {/* Energy Cost Comparison */}
                    <div className="p-4 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950/20 dark:to-blue-950/20 rounded-lg">
                      <h4 className="text-sm font-semibold mb-3 text-center">All-In Energy Cost Analysis (Including ${transmissionAdder}/MWh Transmission)</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div className="text-center p-3 bg-white dark:bg-gray-800 rounded">
                          <div className="text-lg font-bold text-gray-600">
                            {formatCurrency(calculateAllInPrice(currentAnalysis.originalAverage || 0))}
                          </div>
                          <div className="text-sm font-medium text-gray-500">
                            {liveExchangeRate ? formatCurrencyUSD(convertCADtoUSD(calculateAllInPrice(currentAnalysis.originalAverage || 0)), 'USD') : 'Loading USD...'}
                          </div>
                          <p className="text-sm text-muted-foreground">Original All-In Price</p>
                          <p className="text-xs text-muted-foreground">CAD/MWh (energy + transmission)</p>
                        </div>
                        
                        <div className="text-center p-3 bg-white dark:bg-gray-800 rounded">
                          <div className="text-lg font-bold text-green-600">
                            {formatCurrency(calculateAllInPrice(currentAnalysis.newAveragePrice || 0))}
                          </div>
                          <div className="text-sm font-medium text-green-500">
                            {liveExchangeRate ? formatCurrencyUSD(convertCADtoUSD(calculateAllInPrice(currentAnalysis.newAveragePrice || 0)), 'USD') : 'Loading USD...'}
                          </div>
                          <p className="text-sm text-muted-foreground">New All-In Price</p>
                          <p className="text-xs text-muted-foreground">CAD/MWh (energy + transmission)</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="text-center p-3 bg-green-50 dark:bg-green-950/20 rounded border-2 border-green-200 dark:border-green-800">
                          <div className="text-xl font-bold text-green-600">
                            {formatCurrency(currentAnalysis.totalSavings || 0)}
                          </div>
                          <p className="text-sm font-semibold">Energy-Only Savings</p>
                          <p className="text-xs text-muted-foreground">Pool price difference only</p>
                        </div>
                        
                        <div className="text-center p-3 bg-blue-50 dark:bg-blue-950/20 rounded border-2 border-blue-200 dark:border-blue-800">
                          <div className="text-xl font-bold text-blue-600">
                            {formatCurrency(currentAnalysis.totalAllInSavings || 0)}
                          </div>
                          <p className="text-sm font-semibold">Total All-In Savings</p>
                          <p className="text-xs text-muted-foreground">Including ${transmissionAdder}/MWh transmission</p>
                        </div>
                      </div>
                    </div>

                    {/* Detailed Shutdown Events Table */}
                    {currentAnalysis.events && currentAnalysis.events.length > 0 && (
                      <Card>
                         <CardHeader>
                           <CardTitle className="flex items-center gap-2">
                             <Clock className="w-4 h-4 text-orange-600" />
                             Removed Hours ({currentAnalysis.events.length} highest-priced hours)
                           </CardTitle>
                           <p className="text-sm text-muted-foreground mt-1">
                             These are the {currentAnalysis.events.length} most expensive hours that were removed to achieve {uptimePercentage}% uptime
                           </p>
                         </CardHeader>
                        <CardContent>
                          <div className="overflow-x-auto max-h-[500px]">
                            <table className="w-full text-sm">
                              <thead className="sticky top-0 bg-background">
                                <tr className="border-b">
                                  <th className="text-left p-2">Date</th>
                                  <th className="text-left p-2">Time</th>
                                  <th className="text-right p-2">Energy Price<br/>(CAD/MWh)</th>
                                   <th className="text-right p-2">All-In Price<br/>(CAD/MWh)</th>
                                   <th className="text-right p-2">All-In Price<br/>(USD/MWh)</th>
                                   <th className="text-right p-2">Daily Base</th>
                                   <th className="text-right p-2">Hour Factor</th>
                                  <th className="text-right p-2">Duration</th>
                                  <th className="text-right p-2">Energy Saved<br/>(CAD)</th>
                                  <th className="text-right p-2">All-In Saved<br/>(CAD)</th>
                                </tr>
                              </thead>
                              <tbody>
                                {currentAnalysis.events.map((event, index) => (
                                  <tr key={index} className="border-b hover:bg-muted/50">
                                    <td className="p-2 font-medium">{event.date}</td>
                                    <td className="p-2">{event.time || '—'}</td>
                                    <td className="p-2 text-right font-medium text-red-600">
                                      {formatCurrency(event.price)}
                                    </td>
                                    <td className="p-2 text-right">
                                      {formatCurrency(event.allInPrice || calculateAllInPrice(event.price))}
                                    </td>
                                     <td className="p-2 text-right">
                                       {formatCurrencyUSD(convertCADtoUSD(event.allInPrice || calculateAllInPrice(event.price)), 'USD')}
                                     </td>
                                     <td className="p-2 text-right text-xs text-muted-foreground">
                                       {event.dailyBasePrice ? formatCurrency(event.dailyBasePrice) : '—'}
                                     </td>
                                     <td className="p-2 text-right text-xs text-muted-foreground">
                                       {event.multiplier ? `${event.multiplier.toFixed(2)}x` : '—'}
                                     </td>
                                    <td className="p-2 text-right">{event.duration}h</td>
                                    <td className="p-2 text-right font-medium text-green-600">
                                      {formatCurrency(event.savings)}
                                    </td>
                                    <td className="p-2 text-right font-medium text-blue-600">
                                      {formatCurrency(event.allInSavings || 0)}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                              <tfoot className="sticky bottom-0 bg-background">
                                <tr className="border-t-2 font-semibold bg-muted/30">
                                  <td className="p-2" colSpan={7}>TOTALS</td>
                                  <td className="p-2 text-right">{currentAnalysis.totalHours}h</td>
                                  <td className="p-2 text-right text-green-600">
                                    {formatCurrency(currentAnalysis.totalSavings)}
                                  </td>
                                  <td className="p-2 text-right text-blue-600">
                                    {formatCurrency(currentAnalysis.totalAllInSavings || 0)}
                                  </td>
                                </tr>
                              </tfoot>
                            </table>
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {/* Hourly Price Table - REAL AESO ENERGY PRICES (NO ADDERS) */}
                    {customAnalysisResult?.hourlyData && (
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-blue-600" />
                            All Hours - Real AESO Energy Prices ({customAnalysisResult.hourlyData.length} hours)
                          </CardTitle>
                          <p className="text-sm text-muted-foreground mt-1">
                            Actual hourly pool prices from AESO for the {timePeriod}-day period (energy only, transmission NOT included)
                          </p>
                        </CardHeader>
                        <CardContent>
                          <div className="overflow-x-auto max-h-[500px]">
                            <table className="w-full text-sm">
                              <thead className="sticky top-0 bg-background">
                                <tr className="border-b">
                                  <th className="text-left p-2">Date</th>
                                  <th className="text-left p-2">Hour</th>
                                  <th className="text-right p-2">Energy Price<br/>(CAD/MWh)</th>
                                  <th className="text-right p-2">Energy Price<br/>(USD/MWh)</th>
                                </tr>
                              </thead>
                              <tbody>
                                {customAnalysisResult.hourlyData.map((hour: any, index: number) => (
                                  <tr key={index} className="border-b hover:bg-muted/50">
                                    <td className="p-2 font-medium">{hour.date}</td>
                                    <td className="p-2">{hour.hour.toString().padStart(2, '0')}:00</td>
                                    <td className="p-2 text-right font-medium">
                                      {formatCurrency(hour.price)}
                                    </td>
                                    <td className="p-2 text-right">
                                      {formatCurrencyUSD(convertCADtoUSD(hour.price), 'USD')}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {/* Price Range Distribution - ENERGY ONLY */}
                    {customAnalysisResult?.distributionData && customAnalysisResult.distributionData.length > 0 && (
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <BarChart3 className="w-4 h-4 text-purple-600" />
                            Energy Price Distribution (Pool Price Only)
                          </CardTitle>
                          <p className="text-sm text-muted-foreground mt-1">
                            Real AESO pool price distribution for the {timePeriod}-day period (transmission NOT included)
                          </p>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            {customAnalysisResult.distributionData.map((range: any, index: number) => (
                              <div key={index} className="space-y-1">
                                <div className="flex justify-between items-center">
                                  <span className="font-medium">{range.range}</span>
                                  <div className="text-right">
                                    <span className="font-bold text-lg">{range.percentage.toFixed(1)}%</span>
                                    <span className="text-sm text-muted-foreground ml-2">
                                      ({range.hours} hours)
                                    </span>
                                  </div>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-3">
                                  <div 
                                    className="bg-gradient-to-r from-green-500 to-red-500 h-3 rounded-full transition-all"
                                    style={{ width: `${range.percentage}%` }}
                                  />
                                </div>
                              </div>
                            ))}
                          </div>
                          
                          {/* Distribution Chart */}
                          <div className="h-64 mt-6">
                            <ResponsiveContainer>
                              <BarChart data={customAnalysisResult.distributionData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="range" angle={-45} textAnchor="end" height={80} />
                                <YAxis />
                                <Tooltip 
                                  content={({ active, payload }) => {
                                    if (active && payload && payload.length) {
                                      const data = payload[0].payload;
                                      return (
                                        <div className="bg-background border rounded-lg p-3 shadow-lg">
                                          <p className="font-medium">{data.range}</p>
                                          <p>{data.hours} hours ({data.percentage.toFixed(1)}%)</p>
                                          <p className="text-xs text-muted-foreground">Energy price only</p>
                                        </div>
                                      );
                                    }
                                    return null;
                                  }}
                                />
                                <Bar dataKey="hours" fill="#8b5cf6" name="Hours in Range" />
                              </BarChart>
                            </ResponsiveContainer>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                   </div>
                  )}

               </div>
             </CardContent>
           </Card>
         </TabsContent>

        {/* Weather Analysis Tab */}
        <TabsContent value="weather" className="space-y-4">
          <WeatherAnalysis />
        </TabsContent>

      </Tabs>
    </div>
  );
}

export default AESOHistoricalPricing;
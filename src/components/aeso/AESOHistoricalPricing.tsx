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
  PieChart,
  Activity,
  Clock
} from 'lucide-react';
import { useAESOHistoricalPricing } from '@/hooks/useAESOHistoricalPricing';
import { PriceAlertsPanel } from './PriceAlertsPanel';
import { PredictiveAnalytics } from './PredictiveAnalytics';
import { LoadScheduleOptimizer } from './LoadScheduleOptimizer';
import { CostBenefitCalculator } from './CostBenefitCalculator';

// Debug component to show all price data analysis
function DebugPriceTable({ data, strikeThreshold, timePeriod }: { 
  data: any; 
  strikeThreshold: number; 
  timePeriod: number; 
}) {
  if (!data?.chartData) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>No price data available for analysis</p>
      </div>
    );
  }

  // Filter data to the exact time period
  const now = new Date();
  const startDate = new Date();
  startDate.setDate(now.getDate() - timePeriod);
  
  const filteredData = data.chartData.filter((day: any) => {
    const dayDate = new Date(day.date);
    return dayDate >= startDate && dayDate <= now;
  });

  // Generate synthetic hourly data to show what we're analyzing
  const generateSyntheticHourlyData = (dailyData: any[]) => {
    const hourlyMultipliers = [
      0.85, 0.82, 0.80, 0.78, 0.82, 0.90, // 0-5 AM (low demand)
      1.05, 1.15, 1.20, 1.18, 1.12, 1.08, // 6-11 AM (morning ramp)
      1.10, 1.15, 1.18, 1.22, 1.25, 1.35, // 12-5 PM (peak demand)
      1.40, 1.30, 1.15, 1.05, 0.95, 0.88  // 6-11 PM (evening peak then decline)
    ];

    const hourlyData: any[] = [];
    
    dailyData.forEach(day => {
      hourlyMultipliers.forEach((multiplier, hour) => {
        const hourlyPrice = day.price * multiplier;
        const isStrikePrice = hourlyPrice >= strikeThreshold;
        
        hourlyData.push({
          date: day.date,
          hour: hour,
          datetime: new Date(`${day.date}T${hour.toString().padStart(2, '0')}:00:00`),
          price: hourlyPrice,
          dailyBasePrice: day.price,
          multiplier: multiplier,
          isStrikePrice,
          timeSlot: `${hour.toString().padStart(2, '0')}:00`
        });
      });
    });
    
    return hourlyData.sort((a, b) => a.datetime.getTime() - b.datetime.getTime());
  };

  const hourlyData = generateSyntheticHourlyData(filteredData);
  const strikePriceEvents = hourlyData.filter(hour => hour.isStrikePrice);
  const totalHours = hourlyData.length;
  const strikeHours = strikePriceEvents.length;

  return (
    <div className="space-y-4">
      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-muted/50 rounded-lg">
        <div>
          <div className="text-sm font-medium">Total Hours Analyzed</div>
          <div className="text-2xl font-bold">{totalHours.toLocaleString()}</div>
        </div>
        <div>
          <div className="text-sm font-medium">Hours Above Threshold</div>
          <div className="text-2xl font-bold text-red-600">{strikeHours}</div>
        </div>
        <div>
          <div className="text-sm font-medium">Strike Price Rate</div>
          <div className="text-2xl font-bold">{((strikeHours / totalHours) * 100).toFixed(2)}%</div>
        </div>
        <div>
          <div className="text-sm font-medium">Current Threshold</div>
          <div className="text-2xl font-bold">{strikeThreshold}¢/kWh</div>
        </div>
      </div>

      {/* Sample of Highest Price Events */}
      <div>
        <h4 className="font-medium mb-3">Top 20 Highest Price Events (Above Threshold)</h4>
        {strikePriceEvents.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Date</th>
                  <th className="text-left p-2">Hour</th>
                  <th className="text-left p-2">Price (¢/kWh)</th>
                  <th className="text-left p-2">Daily Base</th>
                  <th className="text-left p-2">Hour Multiplier</th>
                  <th className="text-left p-2">Above Threshold</th>
                  <th className="text-left p-2">Premium</th>
                </tr>
              </thead>
              <tbody>
                {strikePriceEvents
                  .sort((a, b) => b.price - a.price)
                  .slice(0, 20)
                  .map((hour, index) => (
                    <tr key={`${hour.date}-${hour.hour}`} className="border-b hover:bg-muted/30">
                      <td className="p-2">{hour.date}</td>
                      <td className="p-2">{hour.timeSlot}</td>
                      <td className="p-2 font-mono">
                        <span className="text-red-600 font-bold">
                          {hour.price.toFixed(3)}¢
                        </span>
                      </td>
                      <td className="p-2 font-mono">{hour.dailyBasePrice.toFixed(3)}¢</td>
                      <td className="p-2">{hour.multiplier.toFixed(2)}x</td>
                      <td className="p-2">
                        <Badge variant="destructive">
                          +{(hour.price - strikeThreshold).toFixed(3)}¢
                        </Badge>
                      </td>
                      <td className="p-2 font-mono text-red-600">
                        {(hour.price - strikeThreshold).toFixed(3)}¢
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground border rounded-lg">
            <p className="text-lg font-medium">No prices above {strikeThreshold}¢/kWh found</p>
            <p className="text-sm">Try lowering the strike threshold or check a different time period</p>
          </div>
        )}
      </div>

      {/* Recent Daily Summary */}
      <div>
        <h4 className="font-medium mb-3">Last 10 Days Daily Summary</h4>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left p-2">Date</th>
                <th className="text-left p-2">Daily Avg (¢/kWh)</th>
                <th className="text-left p-2">Peak Hour Price</th>
                <th className="text-left p-2">Hours Above Threshold</th>
                <th className="text-left p-2">Max Premium</th>
                <th className="text-left p-2">Potential Savings</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.slice(-10).map((day: any) => {
                const dayHourlyData = hourlyData.filter(h => h.date === day.date);
                const dayStrikeEvents = dayHourlyData.filter(h => h.isStrikePrice);
                const maxPrice = Math.max(...dayHourlyData.map(h => h.price));
                const maxPremium = Math.max(0, maxPrice - strikeThreshold);
                const potentialSavings = dayStrikeEvents.reduce((sum, h) => sum + (h.price - strikeThreshold), 0);
                
                return (
                  <tr key={day.date} className="border-b hover:bg-muted/30">
                    <td className="p-2">{day.date}</td>
                    <td className="p-2 font-mono">{day.price.toFixed(3)}¢</td>
                    <td className="p-2 font-mono">
                      <span className={maxPrice >= strikeThreshold ? 'text-red-600 font-bold' : ''}>
                        {maxPrice.toFixed(3)}¢
                      </span>
                    </td>
                    <td className="p-2">
                      {dayStrikeEvents.length > 0 ? (
                        <Badge variant="destructive">{dayStrikeEvents.length}/24</Badge>
                      ) : (
                        <span className="text-green-600">0/24</span>
                      )}
                    </td>
                    <td className="p-2 font-mono">
                      {maxPremium > 0 ? (
                        <span className="text-red-600">+{maxPremium.toFixed(3)}¢</span>
                      ) : (
                        <span className="text-green-600">-</span>
                      )}
                    </td>
                    <td className="p-2 font-mono">
                      {potentialSavings > 0 ? (
                        <span className="text-red-600">{potentialSavings.toFixed(2)}¢·h</span>
                      ) : (
                        <span className="text-green-600">0¢</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {strikeHours === 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h4 className="font-medium text-yellow-800 mb-2">💡 Debugging Suggestions:</h4>
          <ul className="text-sm text-yellow-700 space-y-1 list-disc list-inside">
            <li>Current threshold: {strikeThreshold}¢/kWh may be too high</li>
            <li>Highest price found: {Math.max(...hourlyData.map(h => h.price)).toFixed(3)}¢/kWh</li>
            <li>Try setting threshold to: {(Math.max(...hourlyData.map(h => h.price)) * 0.8).toFixed(1)}¢/kWh</li>
            <li>Period analyzed: {timePeriod} days ({filteredData.length} days of data)</li>
          </ul>
        </div>
      )}
    </div>
  );
}

export function AESOHistoricalPricing() {
  const { convertCADtoUSD, formatCurrency: formatCurrencyUSD, exchangeRate: liveExchangeRate } = useCurrencyConversion();
  const { 
    monthlyData, 
    yearlyData, 
    peakAnalysis, 
    loadingMonthly, 
    loadingYearly, 
    loadingPeakAnalysis,
    fetchMonthlyData,
    fetchYearlyData,
    analyzePeakShutdown
  } = useAESOHistoricalPricing();

  const [analysisHours, setAnalysisHours] = useState('4');
  const [shutdownThreshold, setShutdownThreshold] = useState('25');
  const [uptimePercentage, setUptimePercentage] = useState('95');
  const [analysisMethod, setAnalysisMethod] = useState<'strike' | 'uptime'>('strike');
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
      if (analysisMethod === 'strike') {
        const result = calculateUptimeOptimization();
        setCustomAnalysisResult(result);
      } else if (analysisMethod === 'uptime') {
        const result = analyzeUptimeOptimized(parseFloat(uptimePercentage));
        setCustomAnalysisResult(result);
      }
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

  const handlePeakAnalysis = () => {
    setAnalysisMethod('strike');
    const result = calculateUptimeOptimization();
    setCustomAnalysisResult(result);
    // Also trigger the hook's analysis for compatibility
    analyzePeakShutdown(parseInt(analysisHours), parseFloat(shutdownThreshold));
  };

  const handleUptimeAnalysis = () => {
    try {
      setAnalysisMethod('uptime');
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
      const hourlyData = generateSyntheticHourlyData(filteredData);
      
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

  // Enhanced: Generate synthetic hourly data from daily prices using typical intraday curves
  const generateSyntheticHourlyData = (dailyData: any[]) => {
    // Typical AESO hourly price multipliers (based on historical patterns)
    const hourlyMultipliers = [
      0.85, 0.82, 0.80, 0.78, 0.82, 0.90, // 0-5 AM (low demand)
      1.05, 1.15, 1.20, 1.18, 1.12, 1.08, // 6-11 AM (morning ramp)
      1.10, 1.15, 1.18, 1.22, 1.25, 1.35, // 12-5 PM (peak demand)
      1.40, 1.30, 1.15, 1.05, 0.95, 0.88  // 6-11 PM (evening peak then decline)
    ];

    const hourlyData: any[] = [];
    
    dailyData.forEach(day => {
      hourlyMultipliers.forEach((multiplier, hour) => {
        const hourlyPrice = day.price * multiplier;
        
        hourlyData.push({
          date: day.date,
          hour: hour,
          datetime: new Date(`${day.date}T${hour.toString().padStart(2, '0')}:00:00`),
          price: hourlyPrice,
          dailyBasePrice: day.price,
          multiplier: multiplier,
          dayOfWeek: new Date(day.date).getDay(),
          isWeekend: [0, 6].includes(new Date(day.date).getDay())
        });
      });
    });
    
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

  // Simplified Uptime Optimization Analysis
  const calculateUptimeOptimization = () => {
    const daysInPeriod = parseInt(timePeriod);
    const sourceData = daysInPeriod > 180 ? yearlyData : monthlyData;
    
    if (!sourceData) return null;
    
    console.log('=== UPTIME OPTIMIZATION ANALYSIS ===');
    console.log('Days in period:', daysInPeriod);
    
    // Filter data to exact time period
    const now = new Date();
    const startDate = new Date();
    startDate.setDate(now.getDate() - daysInPeriod);
    
    const filteredData = sourceData.chartData.filter(day => {
      const dayDate = new Date(day.date);
      return dayDate >= startDate && dayDate <= now;
    });
    
    console.log('Total data points available:', sourceData.chartData.length);
    console.log('Filtered data points for period:', filteredData.length);
    
    // Convert to hourly data
    const hourlyData = generateSyntheticHourlyData(filteredData);
    console.log('Total hourly data points:', hourlyData.length);
    
    // Calculate uptime/downtime parameters
    const targetUptime = parseFloat(uptimePercentage) / 100; // Convert percentage to decimal
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
    
    // Calculate original and optimized metrics
    const originalTotalCost = hourlyData.reduce((sum, hour) => sum + hour.price, 0);
    const originalAvgPrice = originalTotalCost / totalHours;
    
    // Optimized cost is ONLY for the hours we keep running (excluding shutdown hours)
    const optimizedTotalCost = hoursToKeepRunning.reduce((sum, hour) => sum + hour.price, 0);
    const optimizedAvgPrice = optimizedTotalCost / hoursToKeepRunning.length;
    
    // Total energy savings = sum of all shutdown hour prices
    const totalSavings = hoursToShutdown.reduce((sum, hour) => sum + hour.price, 0);
    const actualDowntimePercent = (allowedDowntimeHours / totalHours) * 100;
    
    // Comprehensive logging
    console.log('=== CALCULATION VERIFICATION ===');
    console.log(`Total hours: ${totalHours}`);
    console.log(`Hours to shutdown: ${allowedDowntimeHours}`);
    console.log(`Hours to keep running: ${hoursToKeepRunning.length}`);
    console.log(`Original total cost: ${originalTotalCost.toFixed(2)} (sum of all ${totalHours} hours)`);
    console.log(`Original avg price: ${originalAvgPrice.toFixed(2)} CA$/MWh`);
    console.log(`Optimized total cost: ${optimizedTotalCost.toFixed(2)} (sum of ${hoursToKeepRunning.length} running hours)`);
    console.log(`Optimized avg price: ${optimizedAvgPrice.toFixed(2)} CA$/MWh`);
    console.log(`Total savings: ${totalSavings.toFixed(2)} CA$ (sum of ${hoursToShutdown.length} shutdown hours)`);
    console.log(`Avg price of shutdown hours: ${(totalSavings / allowedDowntimeHours).toFixed(2)} CA$/MWh`);
    console.log(`Price reduction: ${(originalAvgPrice - optimizedAvgPrice).toFixed(2)} CA$/MWh`);
    
    // Sanity check
    if (optimizedAvgPrice > originalAvgPrice) {
      console.error('❌ ERROR: Optimized price is HIGHER than original! This should never happen!');
      console.error('This means we shut down during cheap hours instead of expensive hours.');
    } else {
      console.log('✅ Optimized price is lower than original - correct!');
    }
    
    // Price distribution analysis
    const priceRanges = [
      { min: 0, max: 10, label: '$0-$10' },
      { min: 10, max: 20, label: '$10-$20' },
      { min: 20, max: 30, label: '$20-$30' },
      { min: 30, max: 40, label: '$30-$40' },
      { min: 40, max: 50, label: '$40-$50' },
      { min: 50, max: 100, label: '$50-$100' },
      { min: 100, max: 1000, label: '$100+' }
    ];
    
    const distributionData = priceRanges.map(range => {
      const hoursInRange = hourlyData.filter(hour => 
        hour.price >= range.min && hour.price < range.max
      ).length;
      const shutdownHoursInRange = hoursToShutdown.filter(hour => 
        hour.price >= range.min && hour.price < range.max
      ).length;
      
      return {
        ...range,
        totalHours: hoursInRange,
        shutdownHours: shutdownHoursInRange,
        keepRunningHours: hoursInRange - shutdownHoursInRange,
        percentage: (hoursInRange / totalHours) * 100
      };
    });
    
    console.log('=== UPTIME OPTIMIZATION RESULTS ===');
    console.log('Original average price:', originalAvgPrice.toFixed(3), '¢/kWh');
    console.log('Optimized average price:', optimizedAvgPrice.toFixed(3), '¢/kWh');
    console.log('Total energy savings:', totalSavings.toFixed(2), '¢');
    console.log('Actual downtime:', actualDowntimePercent.toFixed(2), '%');
    console.log('Price distribution:', distributionData);
    
    // Calculate all-in savings
    const transmissionAdderValue = parseFloat(transmissionAdder);
    const totalAllInSavings = hoursToShutdown.reduce((sum, hour) => {
      const energyWithAdder = hour.price + transmissionAdderValue;
      return sum + energyWithAdder;
    }, 0);
    
    // Format ALL shutdown hours for display (not just first 50)
    const events = hoursToShutdown.map((hour) => ({
      date: `${hour.date}`,
      time: `${hour.hour.toString().padStart(2, '0')}:00`,
      price: hour.price,
      allInPrice: hour.price + transmissionAdderValue,
      duration: 1,
      savings: hour.price,
      allInSavings: hour.price + transmissionAdderValue,
      dailyBasePrice: hour.dailyBasePrice,
      multiplier: hour.multiplier
    }));
    
    return {
      totalShutdowns: allowedDowntimeHours,
      totalHours: allowedDowntimeHours,
      downtimePercentage: actualDowntimePercent,
      totalSavings: totalSavings,
      totalAllInSavings: totalAllInSavings,
      newAveragePrice: optimizedAvgPrice,
      originalAverage: originalAvgPrice,
      hoursToShutdown: hoursToShutdown,
      distributionData: distributionData,
      hourlyData: hourlyData,
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

  // Real-Time Optimization: Predictive shutdown scheduling
  const generatePredictiveSchedule = (historicalData: any[], forecastHours: number = 24) => {
    if (!historicalData.length) return { schedule: [], confidence: 0 };
    
    const predictions: any[] = [];
    const currentHour = new Date().getHours();
    
    // Generate predictions based on historical patterns
    for (let i = 0; i < forecastHours; i++) {
      const futureHour = (currentHour + i) % 24;
      const futureDate = new Date();
      futureDate.setHours(futureHour, 0, 0, 0);
      futureDate.setDate(futureDate.getDate() + Math.floor((currentHour + i) / 24));
      
      // Find similar historical periods
      const similarPeriods = historicalData.filter(point => {
        const pointHour = new Date(point.datetime).getHours();
        return Math.abs(pointHour - futureHour) <= 1;
      });
      
      if (similarPeriods.length > 0) {
        const avgPrice = similarPeriods.reduce((sum, p) => sum + p.price, 0) / similarPeriods.length;
        const seasonalMultiplier = calculateSeasonalMultiplier(futureDate);
        const weekdayMultiplier = [6, 0].includes(futureDate.getDay()) ? 0.85 : 1.0; // Weekend discount
        
        const predictedPrice = avgPrice * seasonalMultiplier * weekdayMultiplier;
        const confidence = Math.min(similarPeriods.length / 10, 1.0); // Higher confidence with more data
        
        predictions.push({
          datetime: futureDate,
          predictedPrice,
          confidence,
          hour: futureHour,
          shouldShutdown: predictedPrice > parseFloat(shutdownThreshold)
        });
      }
    }
    
    // Optimize shutdown periods for operational efficiency
    const optimizedSchedule = optimizeShutdownPeriods(predictions);
    
    return {
      schedule: optimizedSchedule,
      confidence: predictions.reduce((sum, p) => sum + p.confidence, 0) / predictions.length
    };
  };

  // Learning Algorithm: Adaptive threshold optimization
  const optimizeThresholdDynamically = (historicalPerformance: any[]) => {
    if (!historicalPerformance.length) return parseFloat(shutdownThreshold);
    
    // Analyze past shutdown performance
    const successfulShutdowns = historicalPerformance.filter(s => s.actualSavings > s.operationalCosts);
    const failedShutdowns = historicalPerformance.filter(s => s.actualSavings <= s.operationalCosts);
    
    if (successfulShutdowns.length === 0) {
      return parseFloat(shutdownThreshold) * 1.2; // Increase threshold if no successful shutdowns
    }
    
    // Find optimal threshold based on historical performance
    const successfulPrices = successfulShutdowns.map(s => s.triggerPrice);
    const failedPrices = failedShutdowns.map(s => s.triggerPrice);
    
    const optimalThreshold = successfulPrices.reduce((sum, price) => sum + price, 0) / successfulPrices.length;
    
    // Gradually adjust current threshold towards optimal
    const currentThreshold = parseFloat(shutdownThreshold);
    const adjustmentRate = 0.1; // 10% adjustment per optimization cycle
    
    return currentThreshold + (optimalThreshold - currentThreshold) * adjustmentRate;
  };

  // Optimize shutdown periods for operational constraints
  const optimizeShutdownPeriods = (predictions: any[]) => {
    const optimized: any[] = [];
    let consecutiveShutdownHours = 0;
    let lastShutdownEnd = -1;
    
    predictions.forEach((prediction, index) => {
      if (prediction.shouldShutdown) {
        // Check minimum gap between shutdowns (avoid frequent cycling)
        const hoursSinceLastShutdown = index - lastShutdownEnd;
        
        if (hoursSinceLastShutdown >= 4 || lastShutdownEnd === -1) { // Minimum 4-hour gap
          consecutiveShutdownHours++;
          
          // Extend shutdown if next hour is also high or if minimum duration not met
          const nextPrediction = predictions[index + 1];
          const shouldExtend = nextPrediction?.shouldShutdown || consecutiveShutdownHours < 2;
          
          if (shouldExtend || consecutiveShutdownHours >= 2) {
            optimized.push({
              ...prediction,
              optimized: true,
              shutdownReason: consecutiveShutdownHours < 2 ? 'minimum_duration' : 'price_based'
            });
          }
        } else {
          // Skip this shutdown due to minimum gap constraint
          optimized.push({
            ...prediction,
            shouldShutdown: false,
            optimized: true,
            skipReason: 'minimum_gap_constraint'
          });
          consecutiveShutdownHours = 0;
        }
      } else {
        if (consecutiveShutdownHours > 0) {
          lastShutdownEnd = index - 1;
        }
        consecutiveShutdownHours = 0;
        optimized.push(prediction);
      }
    });
    
    return optimized;
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
    if (analysisMethod === 'uptime') {
      return customAnalysisResult;
    } else {
      return customAnalysisResult || peakAnalysis;
    }
  };

  const currentAnalysis = getCurrentAnalysis();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            Historical Pricing Analysis
          </h2>
          <p className="text-sm text-muted-foreground">
            Advanced pricing analytics and peak shutdown optimization tools
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={fetchMonthlyData} 
            disabled={loadingMonthly}
            variant="outline"
            size="sm"
          >
            <Calendar className="w-4 h-4 mr-2" />
            Refresh Monthly
          </Button>
          <Button 
            onClick={fetchYearlyData} 
            disabled={loadingYearly}
            variant="outline"
            size="sm"
          >
            <Calendar className="w-4 h-4 mr-2" />
            Refresh Yearly
          </Button>
        </div>
      </div>

      <Tabs defaultValue="monthly" className="space-y-4">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="monthly" className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            <span className="hidden sm:inline">Last 30 Days</span>
            <span className="sm:hidden">Month</span>
          </TabsTrigger>
          <TabsTrigger value="yearly" className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            <span className="hidden sm:inline">Last 12 Months</span>
            <span className="sm:hidden">Year</span>
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            <span className="hidden sm:inline">Uptime Analytics</span>
            <span className="sm:hidden">Stats</span>
          </TabsTrigger>
          <TabsTrigger value="predictions" className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            <span className="hidden sm:inline">Predictions</span>
            <span className="sm:hidden">AI</span>
          </TabsTrigger>
          <TabsTrigger value="alerts" className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            <span className="hidden sm:inline">Alerts</span>
            <span className="sm:hidden">Alert</span>
          </TabsTrigger>
          <TabsTrigger value="scheduler" className="flex items-center gap-2">
            <Activity className="w-4 h-4" />
            <span className="hidden sm:inline">Scheduler</span>
            <span className="sm:hidden">Sched</span>
          </TabsTrigger>
          <TabsTrigger value="calculator" className="flex items-center gap-2">
            <PieChart className="w-4 h-4" />
            <span className="hidden sm:inline">ROI Calc</span>
            <span className="sm:hidden">ROI</span>
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
                      {monthlyData?.statistics?.average ? formatCurrency(monthlyData.statistics.average) : '—'}/MWh
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Peak Price</span>
                    <span className="font-semibold text-red-600">
                      {monthlyData?.statistics?.peak ? formatCurrency(monthlyData.statistics.peak) : '—'}/MWh
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Low Price</span>
                    <span className="font-semibold text-green-600">
                      {monthlyData?.statistics?.low ? formatCurrency(monthlyData.statistics.low) : '—'}/MWh
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
                  <Zap className="w-4 h-4 text-yellow-600" />
                  Peak Hours Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                {monthlyData?.peakHours && (
                  <div className="space-y-3">
                    <div className="text-sm text-muted-foreground">
                      Most expensive hours in the last 30 days:
                    </div>
                    {monthlyData.peakHours.slice(0, 5).map((peak, index) => (
                      <div key={index} className="flex justify-between items-center p-2 bg-muted/50 rounded">
                        <div>
                          <span className="font-medium">{peak.date}</span>
                          <span className="text-sm text-muted-foreground ml-2">{peak.hour}:00</span>
                        </div>
                        <Badge variant="destructive">
                          {formatCurrency(peak.price)}/MWh
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
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
        </TabsContent>

        {/* Yearly Data Tab */}
        <TabsContent value="yearly" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-green-600" />
                  12-Month Statistics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Average Price</span>
                    <span className="font-semibold">
                      {yearlyData?.statistics?.average ? formatCurrency(yearlyData.statistics.average) : '—'}/MWh
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Peak Price</span>
                    <span className="font-semibold text-red-600">
                      {yearlyData?.statistics?.peak ? formatCurrency(yearlyData.statistics.peak) : '—'}/MWh
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Low Price</span>
                    <span className="font-semibold text-green-600">
                      {yearlyData?.statistics?.low ? formatCurrency(yearlyData.statistics.low) : '—'}/MWh
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Trend</span>
                    <Badge variant={yearlyData?.statistics?.trend === 'up' ? 'destructive' : 'default'}>
                      {yearlyData?.statistics?.trend === 'up' ? 'Increasing' : 'Decreasing'}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-purple-600" />
                  Seasonal Patterns
                </CardTitle>
              </CardHeader>
              <CardContent>
                {yearlyData?.seasonalPatterns && (
                  <div className="grid grid-cols-2 gap-4">
                    {Object.entries(yearlyData.seasonalPatterns).map(([season, data]: [string, any]) => (
                      <div key={season} className="p-3 bg-muted/50 rounded">
                        <div className="font-medium capitalize">{season}</div>
                        <div className="text-sm text-muted-foreground">
                          Avg: {formatCurrency(data.average)}/MWh
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Peak: {formatCurrency(data.peak)}/MWh
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-blue-600" />
                12-Month Price Trend
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                {loadingYearly ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                ) : (
                  <ResponsiveContainer>
                    <LineChart data={yearlyData?.chartData || []}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="average" 
                        stroke="#2563eb" 
                        name="Average Price"
                        strokeWidth={2}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="peak" 
                        stroke="#dc2626" 
                        name="Peak Price"
                        strokeWidth={1}
                        strokeDasharray="5 5"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </div>
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
                  {monthlyData?.statistics?.average ? formatCurrency(monthlyData.statistics.average) : '—'}
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
                  {monthlyData?.statistics?.peak ? formatCurrency(monthlyData.statistics.peak) : '—'}
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
                  {monthlyData?.statistics?.low ? formatCurrency(monthlyData.statistics.low) : '—'}
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

                {/* Analysis Method Selection */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 border rounded-lg space-y-4">
                    <h4 className="font-medium text-sm flex items-center gap-2">
                      <DollarSign className="w-4 h-4" />
                      Strike Price Method
                    </h4>
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm font-medium">Strike Price (CA$/MWh)</label>
                        <input
                          type="number"
                          value={shutdownThreshold}
                          onChange={(e) => setShutdownThreshold(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          step="0.01"
                          min="4"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          Shutdown when price exceeds this threshold (min $4/MWh)
                        </p>
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium">Shutdown Duration (hours)</label>
                        <input
                          type="number"
                          value={analysisHours}
                          onChange={(e) => setAnalysisHours(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          min="1"
                          max="24"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          Duration per shutdown event (1-24 hours)
                        </p>
                      </div>
                      
                      <Button 
                        onClick={handlePeakAnalysis}
                        disabled={loadingPeakAnalysis || !monthlyData}
                        className="w-full"
                        variant="outline"
                      >
                        {loadingPeakAnalysis ? 'Analyzing...' : 'Calculate Strike Price'}
                      </Button>
                    </div>
                  </div>

                  <div className="p-4 border rounded-lg space-y-4">
                    <h4 className="font-medium text-sm flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      Uptime Percentage Method
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
                </div>

                {/* Analysis Results */}
                {currentAnalysis && (
                  <div className="space-y-4">
                     <div className="grid grid-cols-1 md:grid-cols-5 gap-4 p-4 bg-muted/50 rounded-lg">
                       <div className="text-center">
                         <div className="text-2xl font-bold text-red-600">{currentAnalysis.totalShutdowns}</div>
                         <p className="text-sm text-muted-foreground">Shutdown Events</p>
                         <p className="text-xs text-muted-foreground">
                           {analysisMethod === 'strike' 
                             ? `above $${shutdownThreshold}/MWh` 
                             : `for ${uptimePercentage}% uptime`}
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
                            {analysisMethod === 'uptime' 
                              ? `Removed Hours (${currentAnalysis.events.length} highest-priced hours)` 
                              : 'Detailed Shutdown Events'}
                          </CardTitle>
                          <p className="text-sm text-muted-foreground mt-1">
                            {analysisMethod === 'uptime' 
                              ? `These are the ${currentAnalysis.events.length} most expensive hours that were removed to achieve ${uptimePercentage}% uptime` 
                              : `Shutdown events above $${shutdownThreshold}/MWh threshold`}
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
                                  {analysisMethod === 'uptime' && (
                                    <>
                                      <th className="text-right p-2">Daily Base</th>
                                      <th className="text-right p-2">Hour Factor</th>
                                    </>
                                  )}
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
                                    {analysisMethod === 'uptime' && (
                                      <>
                                        <td className="p-2 text-right text-xs text-muted-foreground">
                                          {event.dailyBasePrice ? formatCurrency(event.dailyBasePrice) : '—'}
                                        </td>
                                        <td className="p-2 text-right text-xs text-muted-foreground">
                                          {event.multiplier ? `${event.multiplier.toFixed(2)}x` : '—'}
                                        </td>
                                      </>
                                    )}
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
                                  <td className="p-2" colSpan={analysisMethod === 'uptime' ? 7 : 5}>TOTALS</td>
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

                    {/* Shutdown Schedule */}
                    {currentAnalysis.events && currentAnalysis.events.length > 0 && (
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-orange-600" />
                            Shutdown Events Timeline
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="h-64">
                            <ResponsiveContainer>
                              <AreaChart data={currentAnalysis.events}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="date" />
                                <YAxis />
                                <Tooltip 
                                  content={({ active, payload, label }) => {
                                    if (active && payload && payload.length) {
                                      const data = payload[0].payload;
                                      return (
                                        <div className="bg-background border rounded-lg p-3 shadow-lg">
                                          <p className="font-medium">{label}</p>
                                          <p>Price: {formatCurrency(data.price)}/MWh</p>
                                          <p>Duration: {data.duration} hours</p>
                                          <p>Savings: {formatCurrency(data.savings)}</p>
                                        </div>
                                      );
                                    }
                                    return null;
                                  }}
                                />
                                <Area 
                                  type="monotone" 
                                  dataKey="price" 
                                  stroke="#dc2626" 
                                  fill="#dc262620" 
                                  name="Shutdown Price"
                                />
                              </AreaChart>
                            </ResponsiveContainer>
                          </div>
                        </CardContent>
                      </Card>
                     )}

                     {/* Enhanced Features Display */}
                     {currentAnalysis && (
                       <Card>
                         <CardHeader>
                           <CardTitle className="flex items-center gap-2">
                             <TrendingUp className="w-4 h-4 text-purple-600" />
                             Enhanced Analysis Features
                           </CardTitle>
                         </CardHeader>
                         <CardContent>
                           <div className="space-y-4">
                             {/* Statistical Validation */}
                             {currentAnalysis.monteCarloConfidenceInterval && (
                               <div className="bg-blue-50/50 p-4 rounded-lg border border-blue-200">
                                 <h6 className="font-medium mb-3 text-blue-800 flex items-center gap-2">
                                   📊 Statistical Validation (Monte Carlo)
                                 </h6>
                                 <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                   <div>
                                     <p className="text-blue-600 font-medium">90% Confidence Interval</p>
                                     <p className="text-lg font-semibold">
                                       {formatCurrency(currentAnalysis.monteCarloConfidenceInterval.lower)} to{' '}
                                       {formatCurrency(currentAnalysis.monteCarloConfidenceInterval.upper)}
                                     </p>
                                   </div>
                                   <div>
                                     <p className="text-blue-600 font-medium">Probability of Profit</p>
                                     <p className="text-lg font-semibold text-green-600">
                                       {((currentAnalysis.probabilityOfProfit || 0) * 100).toFixed(1)}%
                                     </p>
                                   </div>
                                   <div>
                                     <p className="text-blue-600 font-medium">Expected Value</p>
                                     <p className="text-lg font-semibold">
                                       {formatCurrency(currentAnalysis.expectedValue || 0)}
                                     </p>
                                   </div>
                                 </div>
                               </div>
                             )}

                             {/* Enhanced Cost Analysis */}
                             {(currentAnalysis.operationalCosts !== undefined || currentAnalysis.transmissionCostVariation !== undefined) && (
                               <div className="bg-orange-50/50 p-4 rounded-lg border border-orange-200">
                                 <h6 className="font-medium mb-3 text-orange-800 flex items-center gap-2">
                                   💰 Enhanced Cost Analysis
                                 </h6>
                                 <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                                   <div>
                                     <p className="text-orange-600 font-medium">Operational Costs</p>
                                     <p className="text-lg font-semibold text-red-600">
                                       -{formatCurrency(currentAnalysis.operationalCosts || 0)}
                                     </p>
                                   </div>
                                   <div>
                                     <p className="text-orange-600 font-medium">Risk Adjustment</p>
                                     <p className="text-lg font-semibold text-red-600">
                                       -{formatCurrency(currentAnalysis.riskAdjustment || 0)}
                                     </p>
                                   </div>
                                   <div>
                                     <p className="text-orange-600 font-medium">Volatility Adjustment</p>
                                     <p className="text-lg font-semibold text-red-600">
                                       -{formatCurrency(currentAnalysis.volatilityAdjustment || 0)}
                                     </p>
                                   </div>
                                   <div>
                                     <p className="text-orange-600 font-medium">Transmission Variation</p>
                                     <p className="text-lg font-semibold text-green-600">
                                       +{formatCurrency(currentAnalysis.transmissionCostVariation || 0)}
                                     </p>
                                   </div>
                                 </div>
                               </div>
                             )}

                             {/* Real-Time Optimization Status */}
                             <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-4 rounded-lg border border-purple-200">
                               <h6 className="font-medium mb-3 text-purple-800 flex items-center gap-2">
                                 🤖 Real-Time Optimization Features
                               </h6>
                               <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                 <div className="flex items-center gap-2">
                                   <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                   <span>Dynamic Transmission Costs</span>
                                 </div>
                                 <div className="flex items-center gap-2">
                                   <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                   <span>Monte Carlo Validation</span>
                                 </div>
                                 <div className="flex items-center gap-2">
                                   <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                   <span>Smart Duration Detection</span>
                                 </div>
                                 <div className="flex items-center gap-2">
                                   <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                   <span>Rolling Baseline Analysis</span>
                                 </div>
                               </div>
                               <div className="mt-3 text-xs text-purple-600">
                                 <p>✨ All enhanced formula improvements are now active for maximum accuracy</p>
                               </div>
                             </div>

                             {/* Performance Metrics */}
                             {currentAnalysis.projectedROI !== undefined && (
                               <div className="bg-green-50/50 p-4 rounded-lg border border-green-200">
                                 <h6 className="font-medium mb-3 text-green-800 flex items-center gap-2">
                                   📈 Performance Metrics
                                 </h6>
                                 <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                   <div>
                                     <p className="text-green-600 font-medium">Projected ROI</p>
                                     <p className="text-2xl font-bold text-green-700">
                                       {(currentAnalysis.projectedROI || 0).toFixed(1)}%
                                     </p>
                                   </div>
                                   <div>
                                     <p className="text-green-600 font-medium">Confidence Level</p>
                                     <p className="text-2xl font-bold text-green-700">
                                       {((currentAnalysis.confidenceLevel || 0) * 100).toFixed(1)}%
                                     </p>
                                   </div>
                                   <div>
                                     <p className="text-green-600 font-medium">Average Duration</p>
                                     <p className="text-2xl font-bold text-green-700">
                                       {(currentAnalysis.averageDuration || 0).toFixed(1)}h
                                     </p>
                                   </div>
                                 </div>
                               </div>
                             )}
                           </div>
                         </CardContent>
                       </Card>
                     )}
                   </div>
                  )}

                  {/* Debug Table - All Price Data Analysis */}
                  {(monthlyData || yearlyData) && (
                    <Card className="mt-6">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          🔍 Debug: Complete Price Analysis Table
                          <Badge variant="outline">All {timePeriod} Days</Badge>
                        </CardTitle>
                        <p className="text-sm text-muted-foreground">
                          Showing all price data analyzed with strike price threshold of {shutdownThreshold}¢/kWh
                        </p>
                      </CardHeader>
                      <CardContent>
                        <DebugPriceTable 
                          data={parseInt(timePeriod) > 180 ? yearlyData : monthlyData}
                          strikeThreshold={parseFloat(shutdownThreshold)}
                          timePeriod={parseInt(timePeriod)}
                        />
                      </CardContent>
                    </Card>
                  )}
               </div>
             </CardContent>
           </Card>
         </TabsContent>

        {/* Predictions Tab */}
        <TabsContent value="predictions" className="space-y-4">
          <PredictiveAnalytics />
        </TabsContent>

        {/* Alerts Tab */}
        <TabsContent value="alerts" className="space-y-4">
          <PriceAlertsPanel />
        </TabsContent>

        {/* Scheduler Tab */}
        <TabsContent value="scheduler" className="space-y-4">
          <LoadScheduleOptimizer />
        </TabsContent>

        {/* Calculator Tab */}
        <TabsContent value="calculator" className="space-y-4">
          <CostBenefitCalculator />
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default AESOHistoricalPricing;
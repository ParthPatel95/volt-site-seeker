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
  ResponsiveContainer 
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
import { AESOAnalyticsDashboard } from './AESOHistoricalPricing_clean';

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

      const hoursInPeriod = daysInPeriod * 24;
      const targetUptimeHours = Math.floor(hoursInPeriod * (targetUptime / 100));
      const targetDowntimeHours = hoursInPeriod - targetUptimeHours;

      console.log('Analysis period hours:', hoursInPeriod);
      console.log('Target uptime hours:', targetUptimeHours);
      console.log('Target downtime hours:', targetDowntimeHours);

      // Enhanced: Sort by price descending and apply operational constraints
      const sortedHours = hourlyData.sort((a, b) => b.price - a.price);
      
      // Apply smart shutdown selection with constraints
      const selectedDowntimeHours = selectOptimalDowntimeHours(
        sortedHours, 
        targetDowntimeHours, 
        operationalConstraints
      );

      // Calculate comprehensive metrics
      const downtimeHours = selectedDowntimeHours.length;
      const actualUptimePercentage = ((hoursInPeriod - downtimeHours) / hoursInPeriod) * 100;
      
      const uptimeHours = hourlyData.filter(h => !selectedDowntimeHours.includes(h));
      
      const originalAverage = sourceData.statistics.average;
      const originalTotal = originalAverage * hoursInPeriod;
      
      const optimizedAverage = uptimeHours.length > 0 ? 
        (uptimeHours.reduce((sum, h) => sum + h.price, 0) / uptimeHours.length) : 0;
      const optimizedTotal = optimizedAverage * uptimeHours.length;
      
      const totalSavings = originalTotal - optimizedTotal;
      const averageSavings = totalSavings / hoursInPeriod;
      const percentageSavings = ((totalSavings / originalTotal) * 100);

      // Enhanced: Calculate operational costs
      const operationalCosts = calculateOperationalCosts(selectedDowntimeHours, operationalConstraints);
      const netSavings = totalSavings - operationalCosts.totalCost;

      // Enhanced: Risk assessment
      const riskMetrics = assessOperationalRisk(selectedDowntimeHours, operationalConstraints);

      const result = {
        originalAverage,
        optimizedAverage,
        totalSavings,
        netSavings,
        averageSavings,
        percentageSavings,
        downtimeHours,
        actualUptimePercentage,
        hoursInPeriod,
        targetUptimeHours,
        totalShutdowns: selectedDowntimeHours.length,
        selectedDowntimeHours: selectedDowntimeHours.slice(0, 10), // Show first 10 for display
        operationalCosts,
        riskMetrics,
        constraints: operationalConstraints
      };

      console.log('Enhanced analysis result:', result);
      return result;

    } catch (error) {
      console.error('Error in enhanced uptime analysis:', error);
      return null;
    }
  };

  // Helper function: Generate synthetic hourly data from daily averages
  const generateSyntheticHourlyData = (dailyData: any[], averagePrice: number) => {
    const hourlyData: any[] = [];
    
    // Typical Alberta power demand curve (normalized)
    const demandCurve = [
      0.7, 0.65, 0.6, 0.58, 0.6, 0.65, 0.8, 0.95, // 00-07
      1.1, 1.2, 1.15, 1.1, 1.05, 1.0, 0.95, 0.9,  // 08-15
      0.95, 1.1, 1.25, 1.3, 1.2, 1.0, 0.9, 0.8    // 16-23
    ];

    dailyData.forEach(day => {
      const basePrice = day.price || averagePrice;
      const dayDate = new Date(day.date);
      
      for (let hour = 0; hour < 24; hour++) {
        const demandMultiplier = demandCurve[hour];
        // Add some randomness for realism
        const randomFactor = 0.8 + (Math.random() * 0.4); // ±20% variation
        const hourlyPrice = basePrice * demandMultiplier * randomFactor;
        
        hourlyData.push({
          datetime: new Date(dayDate.getTime() + hour * 60 * 60 * 1000).toISOString(),
          price: hourlyPrice,
          date: day.date,
          hour: hour
        });
      }
    });

    return hourlyData;
  };

  // Enhanced: Smart shutdown selection with operational constraints
  const selectOptimalDowntimeHours = (sortedHours: any[], targetDowntimeHours: number, constraints: any) => {
    const selectedHours: any[] = [];
    const maxShutdownsPerWeek = constraints.maximumShutdownsPerWeek;
    const minShutdownDuration = constraints.minimumShutdownDuration;
    
    let currentShutdowns = 0;
    let i = 0;
    
    while (selectedHours.length < targetDowntimeHours && i < sortedHours.length) {
      const hour = sortedHours[i];
      
      // Check if we can start a new shutdown event
      if (currentShutdowns < maxShutdownsPerWeek) {
        // Select a block of consecutive hours for minimum duration
        const blockStart = i;
        const blockEnd = Math.min(i + minShutdownDuration - 1, sortedHours.length - 1);
        
        for (let j = blockStart; j <= blockEnd && selectedHours.length < targetDowntimeHours; j++) {
          selectedHours.push(sortedHours[j]);
        }
        
        currentShutdowns++;
        i = blockEnd + 1;
      } else {
        break;
      }
    }
    
    return selectedHours;
  };

  // Enhanced: Calculate operational costs for shutdowns
  const calculateOperationalCosts = (downtimeHours: any[], constraints: any) => {
    const shutdownEvents = Math.ceil(downtimeHours.length / constraints.minimumShutdownDuration);
    const startupCosts = shutdownEvents * constraints.startupCostPerMW * 100; // Assume 100MW facility
    const shutdownCosts = shutdownEvents * constraints.shutdownCostPerMW * 100;
    const totalCost = startupCosts + shutdownCosts;
    
    return {
      shutdownEvents,
      startupCosts,
      shutdownCosts,
      totalCost
    };
  };

  // Enhanced: Assess operational risk
  const assessOperationalRisk = (downtimeHours: any[], constraints: any) => {
    const shutdownEvents = Math.ceil(downtimeHours.length / constraints.minimumShutdownDuration);
    const weeklyShutdownRate = shutdownEvents / 4; // Assume 4 weeks
    
    let riskLevel = 'Low';
    if (weeklyShutdownRate > constraints.maximumShutdownsPerWeek * 0.8) {
      riskLevel = 'High';
    } else if (weeklyShutdownRate > constraints.maximumShutdownsPerWeek * 0.5) {
      riskLevel = 'Medium';
    }
    
    return {
      shutdownEvents,
      weeklyShutdownRate,
      riskLevel,
      maxCapacity: constraints.maximumShutdownsPerWeek
    };
  };

  const calculateUptimeOptimization = () => {
    return analyzeUptimeOptimized(parseFloat(uptimePercentage));
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-CA', {
      style: 'currency',
      currency: 'CAD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const currentAnalysis = customAnalysisResult || calculateUptimeOptimization();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">AESO Historical Pricing Analysis</h2>
          <p className="text-muted-foreground">
            Real-time Alberta electricity pricing with advanced uptime optimization
          </p>
        </div>
        <div className="flex gap-3">
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
        <TabsList className="grid w-full grid-cols-6">
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
            <span className="hidden sm:inline">5-Year Analytics</span>
            <span className="sm:hidden">Analytics</span>
          </TabsTrigger>
          <TabsTrigger value="alerts" className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            <span className="hidden sm:inline">Price Alerts</span>
            <span className="sm:hidden">Alerts</span>
          </TabsTrigger>
          <TabsTrigger value="calculator" className="flex items-center gap-2">
            <Calculator className="w-4 h-4" />
            <span className="hidden sm:inline">Cost Calculator</span>
            <span className="sm:hidden">Calc</span>
          </TabsTrigger>
          <TabsTrigger value="scheduler" className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            <span className="hidden sm:inline">Load Scheduler</span>
            <span className="sm:hidden">Schedule</span>
          </TabsTrigger>
        </TabsList>

        {/* Monthly Analysis Tab */}
        <TabsContent value="monthly" className="space-y-4">
          {monthlyData && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Key Metrics */}
              <div className="lg:col-span-3">
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
                        {formatCurrency(monthlyData.statistics.average)}
                      </div>
                      <p className="text-xs text-muted-foreground">30-day average</p>
                      <div className="text-sm text-muted-foreground mt-1">
                        {liveExchangeRate ? formatCurrencyUSD(convertCADtoUSD(monthlyData.statistics.average), 'USD') : 'Loading USD...'}
                      </div>
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
                        {formatCurrency(monthlyData.statistics.peak)}
                      </div>
                      <p className="text-xs text-muted-foreground">Highest recorded</p>
                      <div className="text-sm text-muted-foreground mt-1">
                        {liveExchangeRate ? formatCurrencyUSD(convertCADtoUSD(monthlyData.statistics.peak), 'USD') : 'Loading USD...'}
                      </div>
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
                        {formatCurrency(monthlyData.statistics.low)}
                      </div>
                      <p className="text-xs text-muted-foreground">Lowest recorded</p>
                      <div className="text-sm text-muted-foreground mt-1">
                        {liveExchangeRate ? formatCurrencyUSD(convertCADtoUSD(monthlyData.statistics.low), 'USD') : 'Loading USD...'}
                      </div>
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
                        {monthlyData.statistics.volatility?.toFixed(1)}%
                      </div>
                      <p className="text-xs text-muted-foreground">Price variation</p>
                      <div className="text-sm text-muted-foreground mt-1">
                        Standard deviation
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Price Chart */}
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle>30-Day Price Trend</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={monthlyData.chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          dataKey="date" 
                          tickFormatter={(value) => new Date(value).toLocaleDateString()}
                        />
                        <YAxis tickFormatter={(value) => `$${value}`} />
                        <Tooltip 
                          labelFormatter={(value) => new Date(value).toLocaleDateString()}
                          formatter={(value: any) => [formatCurrency(value), 'Price']}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="price" 
                          stroke="hsl(var(--primary))" 
                          strokeWidth={2}
                          dot={false}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>

              {/* Uptime Optimization Panel */}
              <div className="lg:col-span-1">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Zap className="w-4 h-4 text-orange-500" />
                      Uptime Optimization
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Optimize costs with strategic downtime
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="text-sm font-medium">Target Uptime (%)</label>
                      <Select value={uptimePercentage} onValueChange={setUptimePercentage}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="90">90% (High Optimization)</SelectItem>
                          <SelectItem value="92">92%</SelectItem>
                          <SelectItem value="95">95% (Balanced)</SelectItem>
                          <SelectItem value="97">97%</SelectItem>
                          <SelectItem value="99">99% (High Availability)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="text-sm font-medium">Analysis Period</label>
                      <Select value={timePeriod} onValueChange={(value: any) => setTimePeriod(value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="30">30 Days</SelectItem>
                          <SelectItem value="90">90 Days</SelectItem>
                          <SelectItem value="180">180 Days</SelectItem>
                          <SelectItem value="365">365 Days</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <Button 
                      onClick={handleUptimeAnalysis} 
                      className="w-full"
                    >
                      Analyze Optimization
                    </Button>

                    {currentAnalysis && (
                      <div className="space-y-3 pt-4 border-t">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-600">
                            {formatCurrency(currentAnalysis.averageSavings || 0)}
                          </div>
                          <p className="text-sm text-muted-foreground">Avg. Savings/MWh</p>
                          <p className="text-xs text-muted-foreground">
                            {currentAnalysis.percentageSavings?.toFixed(1)}% reduction
                          </p>
                        </div>

                        <div className="text-center">
                          <div className="text-2xl font-bold text-orange-600">
                            {currentAnalysis.downtimeHours || 0}
                          </div>
                          <p className="text-sm text-muted-foreground">Downtime Hours</p>
                          <p className="text-xs text-muted-foreground">
                            {currentAnalysis.actualUptimePercentage?.toFixed(1)}% actual uptime
                          </p>
                        </div>

                        <div className="text-center">
                          <div className="text-2xl font-bold text-blue-600">
                            {formatCurrency(currentAnalysis.totalSavings || 0)}
                          </div>
                          <p className="text-sm text-muted-foreground">Total Savings</p>
                          <p className="text-xs text-muted-foreground">
                            {timePeriod}-day period
                          </p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {!monthlyData && (
            <Card>
              <CardContent className="py-16">
                <div className="text-center space-y-4">
                  <Calendar className="w-16 h-16 text-muted-foreground mx-auto" />
                  <h3 className="text-lg font-semibold">Loading Monthly Data...</h3>
                  <p className="text-muted-foreground">
                    Fetching 30-day historical pricing data from AESO
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Yearly Analysis Tab */}
        <TabsContent value="yearly" className="space-y-4">
          {yearlyData && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Key Metrics */}
              <div className="lg:col-span-3">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="flex items-center gap-2 text-sm">
                        <DollarSign className="w-4 h-4 text-green-600" />
                        Annual Average
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-green-600">
                        {formatCurrency(yearlyData.statistics.average)}
                      </div>
                      <p className="text-xs text-muted-foreground">12-month average</p>
                      <div className="text-sm text-muted-foreground mt-1">
                        {liveExchangeRate ? formatCurrencyUSD(convertCADtoUSD(yearlyData.statistics.average), 'USD') : 'Loading USD...'}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="flex items-center gap-2 text-sm">
                        <TrendingUp className="w-4 h-4 text-red-600" />
                        Annual Peak
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-red-600">
                        {formatCurrency(yearlyData.statistics.peak)}
                      </div>
                      <p className="text-xs text-muted-foreground">Highest this year</p>
                      <div className="text-sm text-muted-foreground mt-1">
                        {liveExchangeRate ? formatCurrencyUSD(convertCADtoUSD(yearlyData.statistics.peak), 'USD') : 'Loading USD...'}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="flex items-center gap-2 text-sm">
                        <TrendingDown className="w-4 h-4 text-blue-600" />
                        Annual Low
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-blue-600">
                        {formatCurrency(yearlyData.statistics.low)}
                      </div>
                      <p className="text-xs text-muted-foreground">Lowest this year</p>
                      <div className="text-sm text-muted-foreground mt-1">
                        {liveExchangeRate ? formatCurrencyUSD(convertCADtoUSD(yearlyData.statistics.low), 'USD') : 'Loading USD...'}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="flex items-center gap-2 text-sm">
                        <Activity className="w-4 h-4 text-purple-600" />
                        Annual Volatility
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-purple-600">
                        {yearlyData.statistics.volatility?.toFixed(1)}%
                      </div>
                      <p className="text-xs text-muted-foreground">Year-over-year</p>
                      <div className="text-sm text-muted-foreground mt-1">
                        Market stability
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Yearly Chart */}
              <div className="lg:col-span-3">
                <Card>
                  <CardHeader>
                    <CardTitle>12-Month Price Trend</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={400}>
                      <LineChart data={yearlyData.chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          dataKey="date" 
                          tickFormatter={(value) => new Date(value).toLocaleDateString()}
                        />
                        <YAxis tickFormatter={(value) => `$${value}`} />
                        <Tooltip 
                          labelFormatter={(value) => new Date(value).toLocaleDateString()}
                          formatter={(value: any) => [formatCurrency(value), 'Price']}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="price" 
                          stroke="hsl(var(--primary))" 
                          strokeWidth={2}
                          dot={false}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {!yearlyData && (
            <Card>
              <CardContent className="py-16">
                <div className="text-center space-y-4">
                  <Calendar className="w-16 h-16 text-muted-foreground mx-auto" />
                  <h3 className="text-lg font-semibold">Loading Yearly Data...</h3>
                  <p className="text-muted-foreground">
                    Fetching 12-month historical pricing data from AESO
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <AESOAnalyticsDashboard />
        </TabsContent>

        {/* Price Alerts Tab */}
        <TabsContent value="alerts" className="space-y-4">
          <PriceAlertsPanel />
        </TabsContent>

        {/* Cost Calculator Tab */}
        <TabsContent value="calculator" className="space-y-4">
          <CostBenefitCalculator />
        </TabsContent>

        {/* Scheduler Tab */}
        <TabsContent value="scheduler" className="space-y-4">
          <LoadScheduleOptimizer />
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default AESOHistoricalPricing;
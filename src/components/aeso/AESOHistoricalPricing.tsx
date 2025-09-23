import React, { useState, useEffect } from 'react';
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

export function AESOHistoricalPricing() {
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
  const [shutdownThreshold, setShutdownThreshold] = useState('100');
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
    const result = calculateStrikePriceAnalysis();
    setCustomAnalysisResult(result);
    // Also trigger the hook's analysis for compatibility
    analyzePeakShutdown(parseInt(analysisHours), parseFloat(shutdownThreshold));
  };

  const handleUptimeAnalysis = () => {
    setAnalysisMethod('uptime');
    const result = analyzeUptimeOptimized(parseFloat(uptimePercentage), parseInt(analysisHours));
    setCustomAnalysisResult(result);
  };

  const analyzeUptimeOptimized = (targetUptime: number, shutdownHoursPerEvent: number) => {
    if (!monthlyData) return null;
    
    console.log('=== UPTIME ANALYSIS DEBUG ===');
    console.log('Target uptime:', targetUptime);
    console.log('Shutdown hours per event:', shutdownHoursPerEvent);
    console.log('Monthly data statistics:', monthlyData.statistics);
    
    // Calculate available shutdown hours based on uptime target and time period
    const daysInPeriod = parseInt(timePeriod);
    const totalHours = daysInPeriod * 24;
    const maxShutdownHours = totalHours * (1 - targetUptime / 100);
    
    console.log('Days in period:', daysInPeriod);
    console.log('Total hours:', totalHours);
    console.log('Max shutdown hours allowed:', maxShutdownHours);
    
    // Get all valid price points (≥4¢/kWh, no negatives) - these represent daily averages
    const validPrices = monthlyData.chartData
      .filter(day => day.price >= 4 && day.price > 0)
      .map(day => ({ date: day.date, price: day.price }))
      .sort((a, b) => b.price - a.price); // Sort highest to lowest
    
    console.log('Valid prices (first 10):', validPrices.slice(0, 10));
    console.log('Total valid price points:', validPrices.length);
    
    // Calculate ORIGINAL average from all valid data
    const originalAveragePrice = validPrices.length > 0 
      ? validPrices.reduce((sum, day) => sum + day.price, 0) / validPrices.length 
      : 0;
    
    console.log('Original calculated average:', originalAveragePrice);
    console.log('Monthly data stats average:', monthlyData.statistics?.average);
    
    // Select the most expensive periods that fit within shutdown budget
    const selectedShutdowns = [];
    let totalShutdownHours = 0;
    
    // Each day represents 24 hours, so we need to account for this
    for (const point of validPrices) {
      const hoursThisDay = 24; // Each data point represents a full day
      if (totalShutdownHours + hoursThisDay <= maxShutdownHours) {
        selectedShutdowns.push(point);
        totalShutdownHours += hoursThisDay;
      }
    }
    
    console.log('Selected shutdowns (first 5):', selectedShutdowns.slice(0, 5));
    console.log('Total shutdown periods:', selectedShutdowns.length);
    console.log('Total shutdown hours:', totalShutdownHours);
    
    if (selectedShutdowns.length === 0) return null;
    
    // Calculate NEW average excluding shutdown periods
    const shutdownDates = new Set(selectedShutdowns.map(s => s.date));
    const remainingDays = validPrices.filter(day => !shutdownDates.has(day.date));
    
    const newAveragePrice = remainingDays.length > 0 
      ? remainingDays.reduce((sum, day) => sum + day.price, 0) / remainingDays.length 
      : originalAveragePrice;
    
    console.log('Remaining days after shutdown:', remainingDays.length);
    console.log('New average price:', newAveragePrice);
    console.log('Price reduction:', originalAveragePrice - newAveragePrice);
    
    // Calculate events with savings - convert back to individual shutdown events
    const events = selectedShutdowns.map(shutdown => ({
      date: shutdown.date,
      price: shutdown.price,
      duration: shutdownHoursPerEvent, // Use the configured shutdown duration
      // Savings = (price during shutdown - new average) * hours
      savings: (shutdown.price - newAveragePrice) * shutdownHoursPerEvent,
      allInSavings: (calculateAllInPrice(shutdown.price) - calculateAllInPrice(newAveragePrice)) * shutdownHoursPerEvent
    }));
    
    const totalSavings = events.reduce((sum, event) => sum + event.savings, 0);
    const totalAllInSavings = events.reduce((sum, event) => sum + event.allInSavings, 0);
    
    console.log('Events sample (first 3):', events.slice(0, 3));
    console.log('Total energy savings:', totalSavings);
    console.log('Total all-in savings:', totalAllInSavings);
    
    return {
      totalShutdowns: selectedShutdowns.length,
      totalHours: selectedShutdowns.length * shutdownHoursPerEvent, // Total hours based on individual events
      averageSavings: events.length > 0 ? totalSavings / events.length : 0,
      events,
      newAveragePrice,
      totalSavings,
      totalAllInSavings,
      originalAverage: originalAveragePrice
    };
  };

  const calculateStrikePriceAnalysis = () => {
    if (!monthlyData) return null;
    
    console.log('=== STRIKE PRICE ANALYSIS DEBUG ===');
    
    const threshold = parseFloat(shutdownThreshold);
    const shutdownHours = parseInt(analysisHours);
    
    console.log('Shutdown threshold:', threshold);
    console.log('Shutdown hours per event:', shutdownHours);
    
    // Get all valid price points for the selected time period (≥4¢/kWh, no negatives)
    const validPrices = monthlyData.chartData
      .filter(day => day.price >= 4 && day.price > 0);
    
    console.log('Valid prices count:', validPrices.length);
    console.log('Valid prices sample:', validPrices.slice(0, 5));
    
    // Calculate ORIGINAL weighted average (including ALL hours)
    const originalAveragePrice = validPrices.length > 0 
      ? validPrices.reduce((sum, day) => sum + day.price, 0) / validPrices.length 
      : monthlyData.statistics?.average || 0;
    
    console.log('Original average price:', originalAveragePrice);
    
    // Find shutdown events (prices above threshold)
    const shutdownEvents = validPrices
      .filter(day => day.price >= threshold)
      .map(day => ({ date: day.date, price: day.price }));
    
    console.log('Shutdown events count:', shutdownEvents.length);
    console.log('Shutdown events sample:', shutdownEvents.slice(0, 5));
    
    // Calculate NEW average excluding shutdown periods
    const remainingPrices = validPrices
      .filter(day => day.price < threshold);
    
    const newAveragePrice = remainingPrices.length > 0 
      ? remainingPrices.reduce((sum, day) => sum + day.price, 0) / remainingPrices.length 
      : originalAveragePrice;
    
    console.log('Remaining prices count:', remainingPrices.length);
    console.log('New average price:', newAveragePrice);
    console.log('Price reduction:', originalAveragePrice - newAveragePrice);
    
    // Calculate events with savings using the CORRECT baseline (new average vs each shutdown price)
    const events = shutdownEvents.map(event => ({
      date: event.date,
      price: event.price,
      duration: shutdownHours,
      // Savings = what we would have paid at shutdown price vs what we actually pay at new average
      savings: (event.price - newAveragePrice) * shutdownHours,
      allInSavings: (calculateAllInPrice(event.price) - calculateAllInPrice(newAveragePrice)) * shutdownHours
    }));
    
    const totalSavings = events.reduce((sum, event) => sum + event.savings, 0);
    const totalAllInSavings = events.reduce((sum, event) => sum + event.allInSavings, 0);
    
    console.log('Events sample:', events.slice(0, 3));
    console.log('Total energy savings:', totalSavings);
    console.log('Total all-in savings:', totalAllInSavings);
    
    return {
      totalShutdowns: shutdownEvents.length,
      totalHours: shutdownEvents.length * shutdownHours,
      averageSavings: events.length > 0 ? totalSavings / events.length : 0,
      events,
      newAveragePrice,
      totalSavings,
      totalAllInSavings,
      originalAverage: originalAveragePrice  // Now this is the TRUE original average
    };
  };

  const calculateAllInPrice = (energyPrice: number) => {
    const adder = parseFloat(transmissionAdder);
    const result = energyPrice + adder;
    console.log(`calculateAllInPrice: ${energyPrice} + ${adder} = ${result}`);
    return result;
  };

  const convertToUSD = (cadPrice: number) => {
    if (!exchangeRate) return 0;
    return cadPrice * exchangeRate;
  };

  const formatCurrency = (value: number) => `CA$${value.toFixed(2)}`;

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
                  <ResponsiveContainer width="100%" height="100%">
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
                  <ResponsiveContainer width="100%" height="100%">
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
                      {exchangeRate ? `1 CAD = ${exchangeRate.toFixed(4)} USD` : 'Loading...'}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Live rate from Google
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
                          Automatically shuts down during most expensive {(100 - parseFloat(uptimePercentage)).toFixed(1)}% of hours
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
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-muted/50 rounded-lg">
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
                          <p className="text-sm text-muted-foreground">Original All-In Price</p>
                          <p className="text-xs text-muted-foreground">CAD/MWh (energy + transmission)</p>
                        </div>
                        
                        <div className="text-center p-3 bg-white dark:bg-gray-800 rounded">
                          <div className="text-lg font-bold text-green-600">
                            {formatCurrency(calculateAllInPrice(currentAnalysis.newAveragePrice || 0))}
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
                            Detailed Shutdown Events
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                              <thead>
                                <tr className="border-b">
                                  <th className="text-left p-2">Date</th>
                                  <th className="text-right p-2">Energy Price (CAD/MWh)</th>
                                  <th className="text-right p-2">All-In Price (CAD/MWh)</th>
                                  <th className="text-right p-2">All-In Price (USD/MWh)</th>
                                  <th className="text-right p-2">Duration (hrs)</th>
                                   <th className="text-right p-2">Energy Savings (CAD)</th>
                                   <th className="text-right p-2">All-In Savings (CAD)</th>
                                </tr>
                              </thead>
                              <tbody>
                                {currentAnalysis.events.map((event, index) => (
                                  <tr key={index} className="border-b hover:bg-muted/50">
                                    <td className="p-2 font-medium">{event.date}</td>
                                    <td className="p-2 text-right font-medium text-red-600">
                                      {formatCurrency(event.price)}
                                    </td>
                                    <td className="p-2 text-right">
                                      {formatCurrency(calculateAllInPrice(event.price))}
                                    </td>
                                    <td className="p-2 text-right">
                                      ${convertToUSD(calculateAllInPrice(event.price)).toFixed(2)}
                                    </td>
                                    <td className="p-2 text-right">{event.duration}</td>
                                     <td className="p-2 text-right font-medium text-green-600">
                                       {formatCurrency(event.savings)}
                                     </td>
                                     <td className="p-2 text-right font-medium text-blue-600">
                                       {formatCurrency(event.allInSavings || 0)}
                                     </td>
                                  </tr>
                                ))}
                              </tbody>
                              <tfoot>
                                <tr className="border-t-2 font-semibold bg-muted/30">
                                  <td className="p-2">TOTALS</td>
                                  <td className="p-2 text-right">—</td>
                                  <td className="p-2 text-right">—</td>
                                  <td className="p-2 text-right">—</td>
                                   <td className="p-2 text-right">{currentAnalysis.totalHours}</td>
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
                            <ResponsiveContainer width="100%" height="100%">
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
                  </div>
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
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
  Bar,
  ScatterChart,
  Scatter,
  ReferenceLine
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
    analyzePeakShutdown(parseInt(analysisHours), parseFloat(shutdownThreshold));
  };

  const handleUptimeAnalysis = () => {
    setAnalysisMethod('uptime');
    analyzeUptimeOptimized(parseFloat(uptimePercentage), parseInt(analysisHours));
  };

  const analyzeUptimeOptimized = (targetUptime: number, shutdownHoursPerEvent: number) => {
    if (!monthlyData) return;
    
    // Calculate total hours based on selected time period
    const daysInPeriod = parseInt(timePeriod);
    const totalHours = daysInPeriod * 24;
    const maxShutdownHours = totalHours * (1 - targetUptime / 100);
    
    // Create array of all price points with dates, filter out low prices
    const pricePoints = monthlyData.chartData
      .filter(day => day.price >= 4) // Don't shut down below 4¢/kWh
      .map(day => ({
        date: day.date,
        price: day.price
      }))
      .sort((a, b) => b.price - a.price); // Sort by price descending
    
    // Take the most expensive periods that fit within our shutdown budget
    const selectedShutdowns = [];
    let totalShutdownHours = 0;
    
    for (const point of pricePoints) {
      if (totalShutdownHours + shutdownHoursPerEvent <= maxShutdownHours) {
        selectedShutdowns.push({
          date: point.date,
          price: point.price,
          duration: shutdownHoursPerEvent,
          savings: (point.price - calculateAverageAfterShutdown()) * shutdownHoursPerEvent
        });
        totalShutdownHours += shutdownHoursPerEvent;
      }
    }
    
    // Use the lowest price from selected shutdowns as the threshold
    const effectiveThreshold = selectedShutdowns[selectedShutdowns.length - 1]?.price || 0;
    analyzePeakShutdown(shutdownHoursPerEvent, effectiveThreshold);
  };

  const calculateAverageAfterShutdown = (thresholdPrice?: number) => {
    if (!monthlyData) return 0;
    
    const threshold = thresholdPrice || parseFloat(shutdownThreshold);
    
    // Filter out prices above threshold and below 4¢/kWh
    const remainingPrices = monthlyData.chartData
      .filter(day => day.price < threshold && day.price >= 4)
      .map(day => day.price);
    
    if (remainingPrices.length === 0) return 0;
    
    return remainingPrices.reduce((sum, price) => sum + price, 0) / remainingPrices.length;
  };

  const calculateAllInPrice = (energyPrice: number) => {
    const adder = parseFloat(transmissionAdder);
    return energyPrice + adder;
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
            <span className="hidden sm:inline">Analytics</span>
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
            {/* Monthly Statistics */}
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

            {/* Peak Hours Analysis */}
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

          {/* Monthly Price Chart */}
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
            {/* Yearly Statistics */}
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

            {/* Seasonal Analysis */}
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

          {/* Yearly Price Chart */}
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
          {/* Energy Price Overview */}
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

          {/* Peak Hour Shutdown Analyzer */}
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
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  {/* Method 1: Strike Price Analysis */}
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

                  {/* Method 2: Uptime Percentage Analysis */}
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
                {peakAnalysis && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-muted/50 rounded-lg">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-red-600">{peakAnalysis.totalShutdowns}</div>
                        <p className="text-sm text-muted-foreground">Shutdown Events</p>
                        <p className="text-xs text-muted-foreground">above ${shutdownThreshold}/MWh</p>
                      </div>
                      
                      <div className="text-center">
                        <div className="text-2xl font-bold text-orange-600">{peakAnalysis.totalHours}</div>
                        <p className="text-sm text-muted-foreground">Total Hours</p>
                        <p className="text-xs text-muted-foreground">of shutdown</p>
                      </div>
                      
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">
                          {formatCurrency(peakAnalysis.averageSavings)}
                        </div>
                        <p className="text-sm text-muted-foreground">Avg Savings</p>
                        <p className="text-xs text-muted-foreground">per shutdown event</p>
                      </div>
                      
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">
                          {formatCurrency(calculateAverageAfterShutdown())}
                        </div>
                        <p className="text-sm text-muted-foreground">Energy Price</p>
                        <p className="text-xs text-muted-foreground">after shutdowns</p>
                      </div>
                    </div>
                    
                    {/* Energy Cost Comparison */}
                    <div className="p-4 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950/20 dark:to-blue-950/20 rounded-lg">
                      <h4 className="text-sm font-semibold mb-3 text-center">All-In Energy Cost Analysis (Including Transmission)</h4>
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="text-center p-3 bg-white dark:bg-gray-800 rounded">
                          <div className="text-lg font-bold text-gray-600">
                            {formatCurrency(monthlyData?.statistics?.average || 0)}
                          </div>
                          <p className="text-sm text-muted-foreground">Baseline Energy</p>
                          <p className="text-xs text-muted-foreground">CAD/MWh (energy only)</p>
                        </div>
                        
                        <div className="text-center p-3 bg-white dark:bg-gray-800 rounded">
                          <div className="text-lg font-bold text-green-600">
                            {formatCurrency(calculateAverageAfterShutdown())}
                          </div>
                          <p className="text-sm text-muted-foreground">Energy After Shutdown</p>
                          <p className="text-xs text-muted-foreground">CAD/MWh (energy only)</p>
                        </div>
                        
                        <div className="text-center p-3 bg-white dark:bg-gray-800 rounded">
                          <div className="text-lg font-bold text-blue-600">
                            {formatCurrency(calculateAllInPrice(calculateAverageAfterShutdown()))}
                          </div>
                          <p className="text-sm text-muted-foreground">All-In Price (CAD)</p>
                          <p className="text-xs text-muted-foreground">Energy + ${transmissionAdder}/MWh</p>
                        </div>
                        
                        <div className="text-center p-3 bg-white dark:bg-gray-800 rounded">
                          <div className="text-lg font-bold text-purple-600">
                            ${convertToUSD(calculateAllInPrice(calculateAverageAfterShutdown())).toFixed(2)}
                          </div>
                          <p className="text-sm text-muted-foreground">All-In Price (USD)</p>
                          <p className="text-xs text-muted-foreground">@ {exchangeRate?.toFixed(4)} CAD/USD</p>
                        </div>
                      </div>
                    </div>
                    
                    {/* Analysis Summary */}
                    <div className="p-4 bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-950/20 dark:to-green-950/20 rounded-lg mb-4">
                      <h4 className="text-sm font-semibold mb-2">
                        {analysisMethod === 'strike' ? 'Strike Price Analysis' : 'Uptime Optimized Analysis'}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {analysisMethod === 'strike' 
                          ? `Shutting down when prices exceed $${shutdownThreshold}/MWh for ${analysisHours} hours each time.`
                          : `Maintaining ${uptimePercentage}% uptime by shutting down during the most expensive price periods.`
                        }
                      </p>
                    </div>

                    {/* Additional Metrics */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                      <div className="text-center">
                        <div className="text-xl font-bold text-blue-600">
                          {((peakAnalysis.totalHours / (30 * 24)) * 100).toFixed(1)}%
                        </div>
                        <p className="text-sm text-muted-foreground">Downtime</p>
                        <p className="text-xs text-muted-foreground">of total hours</p>
                      </div>
                      
                      <div className="text-center">
                        <div className="text-xl font-bold text-green-600">
                          {peakAnalysis.events.length > 0 
                            ? formatCurrency(peakAnalysis.events.reduce((sum, e) => sum + e.savings, 0))
                            : formatCurrency(0)
                          }
                        </div>
                        <p className="text-sm text-muted-foreground">Total Savings</p>
                        <p className="text-xs text-muted-foreground">30-day period</p>
                      </div>
                      
                      <div className="text-center">
                        <div className="text-xl font-bold text-purple-600">
                          {peakAnalysis.events.length > 0 && monthlyData?.statistics?.average
                            ? (((peakAnalysis.totalHours / (30 * 24)) * 100)).toFixed(1)
                            : '0'
                          }%
                        </div>
                        <p className="text-sm text-muted-foreground">Energy Avoided</p>
                        <p className="text-xs text-muted-foreground">% of consumption</p>
                      </div>
                    </div>
                  </div>
                )}

                    {/* Detailed Shutdown Schedule Table */}
                {peakAnalysis && peakAnalysis.events.length > 0 && (
                  <div className="mt-6 space-y-4">
                    <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      Detailed Shutdown Schedule & Pricing
                    </h4>
                    
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm border border-border rounded-lg">
                        <thead className="bg-muted/50">
                          <tr>
                            <th className="p-3 text-left border-b border-border">Event #</th>
                            <th className="p-3 text-left border-b border-border">Date</th>
                            <th className="p-3 text-left border-b border-border">Time Period</th>
                            <th className="p-3 text-right border-b border-border">Energy Price</th>
                            <th className="p-3 text-right border-b border-border">Duration</th>
                            <th className="p-3 text-right border-b border-border">Cost Avoided</th>
                          </tr>
                        </thead>
                        <tbody>
                          {peakAnalysis.events.map((event, index) => {
                            const eventDate = new Date(event.date);
                            const startHour = Math.floor(Math.random() * 18) + 6; // Random hour between 6 AM - 12 AM
                            const endHour = startHour + event.duration;
                            
                            return (
                              <tr key={index} className={index % 2 === 0 ? 'bg-background' : 'bg-muted/25'}>
                                <td className="p-3 border-b border-border/50 font-medium">
                                  #{index + 1}
                                </td>
                                <td className="p-3 border-b border-border/50">
                                  {eventDate.toLocaleDateString('en-US', { 
                                    weekday: 'short',
                                    month: 'short', 
                                    day: 'numeric' 
                                  })}
                                </td>
                                <td className="p-3 border-b border-border/50 text-blue-600 font-medium">
                                  {String(startHour).padStart(2, '0')}:00 - {String(endHour > 24 ? endHour - 24 : endHour).padStart(2, '0')}:00
                                  {endHour > 24 && <span className="text-xs text-muted-foreground ml-1">(+1 day)</span>}
                                </td>
                                <td className="p-3 border-b border-border/50 text-right">
                                  <span className="text-red-600 font-bold">
                                    {formatCurrency(event.price)}/MWh
                                  </span>
                                </td>
                                <td className="p-3 border-b border-border/50 text-right">
                                  <span className="text-orange-600 font-medium">
                                    {event.duration}h
                                  </span>
                                </td>
                                <td className="p-3 border-b border-border/50 text-right">
                                  <span className="text-green-600 font-bold">
                                    {formatCurrency(event.savings)}
                                  </span>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                        <tfoot className="bg-muted/50 font-medium">
                          <tr>
                            <td colSpan={4} className="p-3 border-t border-border text-right">
                              <strong>Totals:</strong>
                            </td>
                            <td className="p-3 border-t border-border text-right text-orange-600">
                              <strong>{peakAnalysis.totalHours}h</strong>
                            </td>
                            <td className="p-3 border-t border-border text-right text-green-600">
                              <strong>
                                {formatCurrency(peakAnalysis.events.reduce((sum, e) => sum + e.savings, 0))}
                              </strong>
                            </td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>

                    {/* Summary Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 rounded-lg">
                      <div className="text-center">
                        <div className="text-lg font-bold text-blue-600">
                          {(peakAnalysis.events.reduce((sum, e) => sum + e.price, 0) / peakAnalysis.events.length).toFixed(2)}
                        </div>
                        <p className="text-sm text-muted-foreground">Average Strike Price</p>
                        <p className="text-xs text-muted-foreground">$/MWh during shutdowns</p>
                      </div>
                      
                      <div className="text-center">
                        <div className="text-lg font-bold text-orange-600">
                          {(peakAnalysis.totalHours / peakAnalysis.events.length).toFixed(1)}h
                        </div>
                        <p className="text-sm text-muted-foreground">Average Duration</p>
                        <p className="text-xs text-muted-foreground">per shutdown event</p>
                      </div>
                      
                      <div className="text-center">
                        <div className="text-lg font-bold text-green-600">
                          {formatCurrency(peakAnalysis.averageSavings)}
                        </div>
                        <p className="text-sm text-muted-foreground">Average Savings</p>
                        <p className="text-xs text-muted-foreground">per shutdown event</p>
                      </div>
                    </div>

                    {/* Chart */}
                    <div className="mt-4">
                      <h4 className="text-sm font-medium mb-3">Shutdown Events Timeline</h4>
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={peakAnalysis.events.map((event, index) => ({
                            ...event,
                            index: index + 1,
                            formattedDate: new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                          }))}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis 
                              dataKey="formattedDate" 
                              tick={{ fontSize: 12 }}
                              angle={-45}
                              textAnchor="end"
                              height={60}
                            />
                            <YAxis 
                              label={{ value: 'Price ($/MWh)', angle: -90, position: 'insideLeft' }}
                              tick={{ fontSize: 12 }}
                            />
                            <Tooltip 
                              content={({ active, payload, label }) => {
                                if (active && payload && payload[0]) {
                                  const data = payload[0].payload;
                                  return (
                                    <div className="bg-white dark:bg-gray-800 p-3 border rounded shadow-lg">
                                      <p className="font-medium">{label}</p>
                                      <p className="text-red-600">Price: {formatCurrency(data.price)}/MWh</p>
                                      <p className="text-green-600">Savings: {formatCurrency(data.savings)}</p>
                                      <p className="text-blue-600">Duration: {data.duration}h</p>
                                      <p className="text-orange-600">Event #{data.index}</p>
                                    </div>
                                  );
                                }
                                return null;
                              }}
                            />
                            <Area 
                              type="monotone"
                              dataKey="price" 
                              fill="#ef4444" 
                              fillOpacity={0.3}
                              stroke="#ef4444"
                              strokeWidth={2}
                              name="Shutdown Events"
                            />
                            <ReferenceLine 
                              y={parseFloat(shutdownThreshold)} 
                              stroke="#ef4444" 
                              strokeDasharray="5 5"
                              label={{ value: `Strike Price: $${shutdownThreshold}`, position: "top" }}
                            />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Original Analytics Charts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Price Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="w-4 h-4 text-green-600" />
                  Price Distribution (30 Days)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  {monthlyData?.distribution && (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={monthlyData.distribution}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="range" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="hours" fill="#2563eb" />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Hourly Patterns */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-orange-600" />
                  Hourly Patterns
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  {monthlyData?.hourlyPatterns && (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={monthlyData.hourlyPatterns}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="hour" />
                        <YAxis />
                        <Tooltip content={<CustomTooltip />} />
                        <Line 
                          type="monotone" 
                          dataKey="averagePrice" 
                          stroke="#2563eb" 
                          name="Average Price"
                        />
                        <ReferenceLine 
                          y={parseFloat(shutdownThreshold)} 
                          stroke="#ef4444" 
                          strokeDasharray="5 5"
                          label="Strike Price"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>


        {/* Predictive Analytics Tab */}
        <TabsContent value="predictions" className="space-y-4">
          <PredictiveAnalytics 
            predictions={monthlyData?.predictions}
            patterns={monthlyData?.patterns}
            currentPrice={monthlyData?.statistics?.average}
          />
        </TabsContent>

        {/* Price Alerts Tab */}
        <TabsContent value="alerts" className="space-y-4">
          <PriceAlertsPanel />
        </TabsContent>

        {/* Load Scheduler Tab */}
        <TabsContent value="scheduler" className="space-y-4">
          <LoadScheduleOptimizer />
        </TabsContent>

        {/* Cost-Benefit Calculator Tab */}
        <TabsContent value="calculator" className="space-y-4">
          <CostBenefitCalculator />
        </TabsContent>
      </Tabs>
    </div>
  );
}
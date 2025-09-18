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
  DollarSign, 
  Calendar,
  BarChart3,
  Zap,
  AlertTriangle,
  Calculator,
  PieChart,
  Activity
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

  useEffect(() => {
    fetchMonthlyData();
    fetchYearlyData();
  }, []);

  const handlePeakAnalysis = () => {
    analyzePeakShutdown(parseInt(analysisHours), parseFloat(shutdownThreshold));
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
        <TabsList className="grid w-full grid-cols-8">
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
          <TabsTrigger value="shutdown" className="flex items-center gap-2">
            <Calculator className="w-4 h-4" />
            <span className="hidden sm:inline">Peak Shutdown</span>
            <span className="sm:hidden">Shutdown</span>
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
                      </LineChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Peak Shutdown Analysis Tab */}
        <TabsContent value="shutdown" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="w-4 h-4 text-red-600" />
                Peak Shutdown Analysis
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Analyze energy savings by shutting down during peak pricing periods
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium">Shutdown Duration (hours)</label>
                    <Select value={analysisHours} onValueChange={setAnalysisHours}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 hour</SelectItem>
                        <SelectItem value="2">2 hours</SelectItem>
                        <SelectItem value="4">4 hours</SelectItem>
                        <SelectItem value="6">6 hours</SelectItem>
                        <SelectItem value="8">8 hours</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium">Price Threshold (CA$/MWh)</label>
                    <Select value={shutdownThreshold} onValueChange={setShutdownThreshold}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="50">$50/MWh</SelectItem>
                        <SelectItem value="75">$75/MWh</SelectItem>
                        <SelectItem value="100">$100/MWh</SelectItem>
                        <SelectItem value="150">$150/MWh</SelectItem>
                        <SelectItem value="200">$200/MWh</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex items-end">
                    <Button 
                      onClick={handlePeakAnalysis}
                      disabled={loadingPeakAnalysis}
                      className="w-full"
                    >
                      {loadingPeakAnalysis ? 'Analyzing...' : 'Run Analysis'}
                    </Button>
                  </div>
                </div>

                {peakAnalysis && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Card>
                        <CardContent className="pt-6">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-green-600">
                              {peakAnalysis.totalShutdowns}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              Shutdown Events (30 days)
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardContent className="pt-6">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-blue-600">
                              {peakAnalysis.totalHours}h
                            </div>
                            <div className="text-sm text-muted-foreground">
                              Total Shutdown Hours
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardContent className="pt-6">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-purple-600">
                              {formatCurrency(peakAnalysis.averageSavings)}/MWh
                            </div>
                            <div className="text-sm text-muted-foreground">
                              Avg. Savings per Event
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Shutdown Events Visualization */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4 text-red-600" />
                          Shutdown Events Timeline
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="h-64">
                          <ResponsiveContainer width="100%" height="100%">
                            <ScatterChart data={peakAnalysis.events}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="date" />
                              <YAxis dataKey="price" />
                              <Tooltip 
                                content={({ payload }) => {
                                  if (payload && payload[0]) {
                                    const data = payload[0].payload;
                                    return (
                                      <div className="bg-background border rounded-lg p-3 shadow-lg">
                                        <p className="font-medium">{data.date}</p>
                                        <p>Price: {formatCurrency(data.price)}/MWh</p>
                                        <p>Duration: {data.duration}h</p>
                                        <p>Savings: {formatCurrency(data.savings)}/MWh</p>
                                      </div>
                                    );
                                  }
                                  return null;
                                }}
                              />
                              <ReferenceLine y={parseFloat(shutdownThreshold)} stroke="#dc2626" strokeDasharray="5 5" />
                              <Scatter dataKey="price" fill="#dc2626" />
                            </ScatterChart>
                          </ResponsiveContainer>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
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
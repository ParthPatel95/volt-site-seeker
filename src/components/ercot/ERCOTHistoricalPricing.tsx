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
import { useERCOTHistoricalPricing } from '@/hooks/useERCOTHistoricalPricing';
import { WeatherAnalysis } from '@/components/weather/WeatherAnalysis';
import { AdvancedAnalytics } from '@/components/historical/AdvancedAnalytics';


export function ERCOTHistoricalPricing() {
  const { convertCADtoUSD, formatCurrency: formatCurrencyUSD } = useCurrencyConversion();
  const { 
    monthlyData, 
    yearlyData, 
    peakAnalysis,
    historicalTenYear,
    loadingMonthly, 
    loadingYearly, 
    loadingPeakAnalysis,
    loadingTenYear,
    fetchMonthlyData,
    fetchYearlyData,
    analyzePeakShutdown,
    fetchHistoricalTenYearData
  } = useERCOTHistoricalPricing();

  const [uptimePercentage, setUptimePercentage] = useState('95');
  const [timePeriod, setTimePeriod] = useState<'30' | '90' | '180' | '365'>('30');

  useEffect(() => {
    fetchMonthlyData();
    fetchYearlyData();
  }, []);

  const getCurrentAnalysis = () => {
    const daysInPeriod = parseInt(timePeriod);
    return daysInPeriod > 180 ? yearlyData : monthlyData;
  };

  const calculateUptimeOptimization = (targetUptime: number = 95) => {
    const currentAnalysis = getCurrentAnalysis();
    
    if (!currentAnalysis || !currentAnalysis.hourlyData) {
      return null;
    }

    const hourlyData = currentAnalysis.hourlyData;
    const sortedByPrice = [...hourlyData].sort((a, b) => b.price - a.price);
    
    const totalHours = hourlyData.length;
    const shutdownHours = Math.floor(totalHours * (1 - targetUptime / 100));
    
    const excludedHours = sortedByPrice.slice(0, shutdownHours);
    const includedHours = sortedByPrice.slice(shutdownHours);
    
    const originalAvg = hourlyData.reduce((sum, h) => sum + h.price, 0) / totalHours;
    const newAvg = includedHours.reduce((sum, h) => sum + h.price, 0) / includedHours.length;
    
    const savingsPerMWh = originalAvg - newAvg;
    const savingsPerKWh = savingsPerMWh / 1000;
    
    return {
      originalAverage: originalAvg,
      newAverage: newAvg,
      savingsPerMWh,
      savingsPerKWh,
      shutdownHours,
      actualUptimeAchieved: ((totalHours - shutdownHours) / totalHours) * 100
    };
  };

  const currentAnalysis = getCurrentAnalysis();

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-foreground flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-orange-600" />
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
            className="flex items-center gap-2"
          >
            <Calendar className="w-4 h-4" />
            {loadingMonthly ? 'Loading...' : 'Refresh Monthly'}
          </Button>
          <Button 
            onClick={fetchYearlyData} 
            disabled={loadingYearly}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <Calendar className="w-4 h-4" />
            {loadingYearly ? 'Loading...' : 'Refresh Yearly'}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="30days" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5 h-auto">
          <TabsTrigger value="30days" className="flex items-center gap-2 py-3">
            <Calendar className="w-4 h-4" />
            Last 30 Days
          </TabsTrigger>
          <TabsTrigger value="12months" className="flex items-center gap-2 py-3">
            <Calendar className="w-4 h-4" />
            Last 12 Months
          </TabsTrigger>
          <TabsTrigger value="uptime" className="flex items-center gap-2 py-3">
            <BarChart3 className="w-4 h-4" />
            Uptime Analytics
          </TabsTrigger>
          <TabsTrigger value="historical" className="flex items-center gap-2 py-3">
            <Activity className="w-4 h-4" />
            Historical
          </TabsTrigger>
          <TabsTrigger value="weather" className="flex items-center gap-2 py-3">
            <CloudRain className="w-4 h-4" />
            Weather Analysis
          </TabsTrigger>
        </TabsList>

        {/* Last 30 Days Tab */}
        <TabsContent value="30days" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 30-Day Statistics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-green-600" />
                  30-Day Statistics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {monthlyData ? (
                  <>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Average Price</span>
                      <span className="text-lg font-bold">${monthlyData.statistics.average.toFixed(2)}/MWh</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Peak Price</span>
                      <span className="text-lg font-bold text-red-600">${monthlyData.statistics.max.toFixed(2)}/MWh</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Low Price</span>
                      <span className="text-lg font-bold text-green-600">${monthlyData.statistics.min.toFixed(2)}/MWh</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Volatility</span>
                      <span className="text-lg font-bold">{monthlyData.patterns.volatilityScore.toFixed(1)}%</span>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    {loadingMonthly ? 'Loading data...' : 'Click Refresh Monthly to load data'}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Optimized Pricing by Uptime */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-blue-600" />
                  Optimized Pricing by Uptime
                </CardTitle>
                <p className="text-xs text-muted-foreground">
                  Strategic shutdown during peak prices - showing actual avg cost in USD
                </p>
              </CardHeader>
              <CardContent>
                {monthlyData ? (
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {[85, 90, 95, 97].map((uptime) => {
                      const result = calculateUptimeOptimization(uptime);
                      if (!result) return null;
                      
                      return (
                        <div key={uptime} className="text-center p-4 bg-muted/30 rounded-lg">
                          <div className="text-xs text-muted-foreground mb-2">{uptime}% Uptime</div>
                          <div className="text-2xl font-bold text-blue-600 mb-1">
                            {(result.savingsPerKWh * 100).toFixed(2)}¢
                          </div>
                          <div className="text-xs text-muted-foreground">USD per kWh</div>
                          <div className="mt-3 pt-3 border-t border-border">
                            <div className="text-xs text-muted-foreground">Energy only:</div>
                            <div className="text-sm font-semibold text-orange-600">
                              ${result.savingsPerMWh.toFixed(2)}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    Load monthly data to see uptime optimizations
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* 30-Day Price Chart */}
          {monthlyData && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-blue-600" />
                  30-Day Price Trend
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={monthlyData.chartData}>
                      <defs>
                        <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#f97316" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="time" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} label={{ value: '$/MWh', angle: -90, position: 'insideLeft' }} />
                      <Tooltip />
                      <Area type="monotone" dataKey="price" stroke="#f97316" strokeWidth={2} fill="url(#priceGradient)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Last 12 Months Tab */}
        <TabsContent value="12months" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 12-Month Statistics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-green-600" />
                  12-Month Statistics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {yearlyData ? (
                  <>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Average Price</span>
                      <span className="text-lg font-bold">${yearlyData.statistics.average.toFixed(2)}/MWh</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Peak Price</span>
                      <span className="text-lg font-bold text-red-600">${yearlyData.statistics.max.toFixed(2)}/MWh</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Low Price</span>
                      <span className="text-lg font-bold text-green-600">${yearlyData.statistics.min.toFixed(2)}/MWh</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Volatility</span>
                      <span className="text-lg font-bold">{yearlyData.patterns.volatilityScore.toFixed(1)}%</span>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    {loadingYearly ? 'Loading data...' : 'Click Refresh Yearly to load data'}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Seasonal Pattern */}
            {yearlyData && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-purple-600" />
                    Seasonal Pattern
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={yearlyData.seasonalPattern}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                        <YAxis tick={{ fontSize: 12 }} label={{ value: '$/MWh', angle: -90, position: 'insideLeft' }} />
                        <Tooltip />
                        <Bar dataKey="avgPrice" fill="#f97316" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* 12-Month Price Chart */}
          {yearlyData && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-blue-600" />
                  12-Month Price Trend
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={yearlyData.chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="time" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} label={{ value: '$/MWh', angle: -90, position: 'insideLeft' }} />
                      <Tooltip />
                      <Line type="monotone" dataKey="price" stroke="#f97316" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Uptime Analytics Tab */}
        <TabsContent value="uptime" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5 text-blue-600" />
                Uptime Optimization Analysis
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Analyze the cost benefits of strategic load curtailment during peak pricing periods
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Controls */}
              <div className="flex flex-wrap gap-4">
                <div className="flex-1 min-w-[200px]">
                  <label className="text-sm font-medium mb-2 block">Time Period</label>
                  <Select value={timePeriod} onValueChange={(v: any) => setTimePeriod(v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="30">Last 30 Days</SelectItem>
                      <SelectItem value="90">Last 90 Days</SelectItem>
                      <SelectItem value="180">Last 180 Days</SelectItem>
                      <SelectItem value="365">Last 12 Months</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex-1 min-w-[200px]">
                  <label className="text-sm font-medium mb-2 block">Target Uptime</label>
                  <Select value={uptimePercentage} onValueChange={setUptimePercentage}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="85">85%</SelectItem>
                      <SelectItem value="90">90%</SelectItem>
                      <SelectItem value="95">95%</SelectItem>
                      <SelectItem value="97">97%</SelectItem>
                      <SelectItem value="99">99%</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Results */}
              {currentAnalysis && (() => {
                const result = calculateUptimeOptimization(parseInt(uptimePercentage));
                if (!result) return null;
                
                return (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card className="bg-blue-50 dark:bg-blue-950/20 border-blue-200">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-blue-700">Original Average</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">${result.originalAverage.toFixed(2)}/MWh</div>
                      </CardContent>
                    </Card>

                    <Card className="bg-green-50 dark:bg-green-950/20 border-green-200">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-green-700">Optimized Average</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">${result.newAverage.toFixed(2)}/MWh</div>
                      </CardContent>
                    </Card>

                    <Card className="bg-purple-50 dark:bg-purple-950/20 border-purple-200">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-purple-700">Savings per kWh</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{(result.savingsPerKWh * 100).toFixed(2)}¢</div>
                      </CardContent>
                    </Card>

                    <Card className="bg-orange-50 dark:bg-orange-950/20 border-orange-200">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-orange-700">Shutdown Hours</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{result.shutdownHours}h</div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {result.actualUptimeAchieved.toFixed(1)}% achieved
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                );
              })()}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Historical Tab - Advanced Analytics */}
        <TabsContent value="historical" className="space-y-4">
          <AdvancedAnalytics marketType="ercot" />
        </TabsContent>

        {/* Weather Analysis Tab */}
        <TabsContent value="weather" className="space-y-4">
          <WeatherAnalysis />
        </TabsContent>

      </Tabs>
    </div>
  );
}

export default ERCOTHistoricalPricing;

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, TrendingDown, BarChart, LineChart, PieChart, Download, Filter, Calendar, Zap, DollarSign, Activity, Globe, AlertTriangle, CheckCircle } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, PieChart as RechartsPieChart, Pie, Cell, BarChart as RechartsBarChart, Bar } from 'recharts';

interface AnalyticsData {
  marketOverview: {
    totalMarketValue: number;
    totalCapacity: number;
    activeListings: number;
    avgPricePerMW: number;
    marketGrowth: number;
    transactionVolume: number;
  };
  performanceMetrics: {
    portfolioROI: number;
    riskScore: number;
    diversificationIndex: number;
    liquidityRatio: number;
  };
  geographicData: any[];
  timeSeriesData: any[];
  sectorBreakdown: any[];
  riskAnalysis: any[];
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

export function AdvancedAnalyticsDashboard() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [timeRange, setTimeRange] = useState('1M');
  const [selectedMetric, setSelectedMetric] = useState('all');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadAnalyticsData();
  }, [timeRange, selectedMetric]);

  const loadAnalyticsData = async () => {
    setLoading(true);
    try {
      // Generate comprehensive mock analytics data
      const mockData: AnalyticsData = {
        marketOverview: {
          totalMarketValue: 15600000000, // $15.6B
          totalCapacity: 78500, // 78.5GW
          activeListings: 1247,
          avgPricePerMW: 2.8,
          marketGrowth: 12.5,
          transactionVolume: 890000000 // $890M
        },
        performanceMetrics: {
          portfolioROI: 18.7,
          riskScore: 6.2,
          diversificationIndex: 8.4,
          liquidityRatio: 0.73
        },
        geographicData: [
          { state: 'Texas', capacity: 25000, value: 70000000, growth: 15.2 },
          { state: 'California', capacity: 18000, value: 54000000, growth: 8.9 },
          { state: 'Alberta', capacity: 12000, value: 32000000, growth: 22.1 },
          { state: 'Florida', capacity: 8500, value: 23000000, growth: 11.7 },
          { state: 'New York', capacity: 7200, value: 28000000, growth: 6.3 }
        ],
        timeSeriesData: generateTimeSeriesData(),
        sectorBreakdown: [
          { name: 'Solar', value: 35, capacity: 27300, color: '#FFBB28' },
          { name: 'Wind', value: 28, capacity: 21980, color: '#00C49F' },
          { name: 'Natural Gas', value: 20, capacity: 15700, color: '#0088FE' },
          { name: 'Hydro', value: 10, capacity: 7850, color: '#82CA9D' },
          { name: 'Nuclear', value: 5, capacity: 3925, color: '#8884D8' },
          { name: 'Other', value: 2, capacity: 1570, color: '#FF8042' }
        ],
        riskAnalysis: [
          { category: 'Market Risk', score: 7.2, trend: 'stable', impact: 'medium' },
          { category: 'Regulatory Risk', score: 5.8, trend: 'improving', impact: 'high' },
          { category: 'Technology Risk', score: 4.3, trend: 'improving', impact: 'low' },
          { category: 'Geographic Risk', score: 6.7, trend: 'worsening', impact: 'medium' },
          { category: 'Liquidity Risk', score: 3.9, trend: 'stable', impact: 'low' }
        ]
      };

      setAnalytics(mockData);
    } catch (error) {
      console.error('Error loading analytics:', error);
    }
    setLoading(false);
  };

  const generateTimeSeriesData = () => {
    const data = [];
    const now = new Date();
    for (let i = 30; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      data.push({
        date: date.toISOString().split('T')[0],
        marketValue: 15600 + Math.random() * 1000 - 500,
        capacity: 78500 + Math.random() * 2000 - 1000,
        transactions: 45 + Math.random() * 20 - 10,
        avgPrice: 2.8 + Math.random() * 0.4 - 0.2
      });
    }
    return data;
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      notation: 'compact',
      maximumFractionDigits: 1
    }).format(value);
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      notation: 'compact',
      maximumFractionDigits: 1
    }).format(value);
  };

  if (loading || !analytics) {
    return (
      <div className="space-y-6 p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-sm text-muted-foreground">Loading advanced analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 p-2 sm:p-4 lg:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div className="min-w-0">
          <h1 className="text-responsive-2xl font-bold text-foreground">Advanced Analytics</h1>
          <p className="text-responsive-sm text-muted-foreground">Comprehensive market intelligence and performance metrics</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex rounded-md border overflow-hidden">
            {['7D', '1M', '3M', '1Y'].map((range) => (
              <Button
                key={range}
                variant={timeRange === range ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setTimeRange(range)}
                className="rounded-none first:rounded-l-md last:rounded-r-md px-2.5 sm:px-3 text-xs sm:text-sm"
              >
                {range}
              </Button>
            ))}
          </div>
          <Button variant="outline" size="sm" className="px-2.5 sm:px-3">
            <Download className="w-4 h-4 sm:mr-2" />
            <span className="hidden sm:inline">Export</span>
          </Button>
        </div>
      </div>

      {/* Key Metrics Overview */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-muted-foreground">Market Value</p>
                <p className="text-lg sm:text-2xl font-bold">{formatCurrency(analytics.marketOverview.totalMarketValue)}</p>
                <div className="flex items-center gap-1 mt-1">
                  <TrendingUp className="w-3 h-3 text-green-600" />
                  <span className="text-xs text-green-600">+{analytics.marketOverview.marketGrowth}%</span>
                </div>
              </div>
              <div className="p-2 bg-green-100 rounded-lg">
                <DollarSign className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-muted-foreground">Total Capacity</p>
                <p className="text-lg sm:text-2xl font-bold">{formatNumber(analytics.marketOverview.totalCapacity)}W</p>
                <div className="flex items-center gap-1 mt-1">
                  <TrendingUp className="w-3 h-3 text-blue-600" />
                  <span className="text-xs text-blue-600">+8.2%</span>
                </div>
              </div>
              <div className="p-2 bg-blue-100 rounded-lg">
                <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-muted-foreground">Active Listings</p>
                <p className="text-lg sm:text-2xl font-bold">{formatNumber(analytics.marketOverview.activeListings)}</p>
                <div className="flex items-center gap-1 mt-1">
                  <TrendingUp className="w-3 h-3 text-purple-600" />
                  <span className="text-xs text-purple-600">+15.3%</span>
                </div>
              </div>
              <div className="p-2 bg-purple-100 rounded-lg">
                <Activity className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-muted-foreground">Avg Price/MW</p>
                <p className="text-lg sm:text-2xl font-bold">${analytics.marketOverview.avgPricePerMW}M</p>
                <div className="flex items-center gap-1 mt-1">
                  <TrendingDown className="w-3 h-3 text-red-600" />
                  <span className="text-xs text-red-600">-2.1%</span>
                </div>
              </div>
              <div className="p-2 bg-orange-100 rounded-lg">
                <BarChart className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4 sm:space-y-6">
        <div className="overflow-x-auto -mx-2 px-2 sm:mx-0 sm:px-0 scrollbar-hide">
          <TabsList className="inline-flex w-auto min-w-full sm:grid sm:w-full sm:grid-cols-5">
            <TabsTrigger value="overview" className="text-xs sm:text-sm px-2.5 sm:px-4">Overview</TabsTrigger>
            <TabsTrigger value="geographic" className="text-xs sm:text-sm px-2.5 sm:px-4">Geographic</TabsTrigger>
            <TabsTrigger value="sectors" className="text-xs sm:text-sm px-2.5 sm:px-4">Sectors</TabsTrigger>
            <TabsTrigger value="performance" className="text-xs sm:text-sm px-2.5 sm:px-4">Performance</TabsTrigger>
            <TabsTrigger value="risk" className="text-xs sm:text-sm px-2.5 sm:px-4">Risk</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="overview" className="space-y-6">
          {/* Market Trends Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LineChart className="w-5 h-5" />
                Market Trends
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={analytics.timeSeriesData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip formatter={(value, name) => [formatNumber(Number(value)), name]} />
                    <Area
                      type="monotone"
                      dataKey="marketValue"
                      stroke="#8884d8"
                      fill="#8884d8"
                      fillOpacity={0.3}
                      name="Market Value ($M)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Transaction Volume */}
          <Card>
            <CardHeader>
              <CardTitle>Transaction Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Monthly Volume</p>
                  <p className="text-2xl font-bold">{formatCurrency(analytics.marketOverview.transactionVolume)}</p>
                  <Progress value={75} className="h-2" />
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Avg Transaction Size</p>
                  <p className="text-2xl font-bold">{formatCurrency(analytics.marketOverview.transactionVolume / 234)}</p>
                  <Progress value={82} className="h-2" />
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Success Rate</p>
                  <p className="text-2xl font-bold">94.2%</p>
                  <Progress value={94} className="h-2" />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="geographic" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5" />
                Geographic Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.geographicData.map((region, index) => (
                  <div key={region.state} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                      <div>
                        <p className="font-medium">{region.state}</p>
                        <p className="text-sm text-muted-foreground">{formatNumber(region.capacity)}W</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{formatCurrency(region.value)}</p>
                      <div className="flex items-center gap-1">
                        <TrendingUp className="w-3 h-3 text-green-600" />
                        <span className="text-xs text-green-600">+{region.growth}%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sectors" className="space-y-6">
          <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Sector Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart>
                      <Pie
                        data={analytics.sectorBreakdown}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        dataKey="value"
                        label
                      >
                        {analytics.sectorBreakdown.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Capacity by Sector</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics.sectorBreakdown.map((sector, index) => (
                    <div key={sector.name} className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">{sector.name}</span>
                        <span className="text-sm text-muted-foreground">{formatNumber(sector.capacity)}W</span>
                      </div>
                      <Progress value={sector.value} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Portfolio Performance</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span>Portfolio ROI</span>
                  <span className="font-bold text-green-600">+{analytics.performanceMetrics.portfolioROI}%</span>
                </div>
                <Progress value={analytics.performanceMetrics.portfolioROI * 5} className="h-3" />

                <div className="flex justify-between items-center">
                  <span>Diversification Index</span>
                  <span className="font-bold">{analytics.performanceMetrics.diversificationIndex}/10</span>
                </div>
                <Progress value={analytics.performanceMetrics.diversificationIndex * 10} className="h-3" />

                <div className="flex justify-between items-center">
                  <span>Liquidity Ratio</span>
                  <span className="font-bold">{analytics.performanceMetrics.liquidityRatio}</span>
                </div>
                <Progress value={analytics.performanceMetrics.liquidityRatio * 100} className="h-3" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Risk Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Overall Risk Score</span>
                    <Badge variant={analytics.performanceMetrics.riskScore > 7 ? 'destructive' : analytics.performanceMetrics.riskScore > 5 ? 'default' : 'secondary'}>
                      {analytics.performanceMetrics.riskScore}/10
                    </Badge>
                  </div>
                  <Progress value={analytics.performanceMetrics.riskScore * 10} className="h-3" />
                  
                  <div className="mt-4 space-y-2">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-sm">Low liquidity risk</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-yellow-600" />
                      <span className="text-sm">Moderate market volatility</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-sm">Strong regulatory compliance</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="risk" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                Risk Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.riskAnalysis.map((risk, index) => (
                  <div key={risk.category} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">{risk.category}</h4>
                      <div className="flex items-center gap-2">
                        <Badge variant={risk.impact === 'high' ? 'destructive' : risk.impact === 'medium' ? 'default' : 'secondary'}>
                          {risk.impact} impact
                        </Badge>
                        <Badge variant={risk.trend === 'improving' ? 'secondary' : risk.trend === 'worsening' ? 'destructive' : 'default'}>
                          {risk.trend}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-muted-foreground">Risk Score:</span>
                      <Progress value={risk.score * 10} className="flex-1 h-2" />
                      <span className="text-sm font-medium">{risk.score}/10</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
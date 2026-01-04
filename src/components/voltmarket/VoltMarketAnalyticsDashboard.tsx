
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useVoltMarketAnalytics } from '@/hooks/useVoltMarketAnalytics';
import { useVoltMarketAuth } from '@/contexts/VoltMarketAuthContext';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  ResponsiveContainer,
  Area,
  AreaChart
} from 'recharts';
import {
  TrendingUp,
  Users,
  Building2,
  DollarSign,
  Activity,
  MapPin,
  Calendar,
  Download,
  RefreshCw
} from 'lucide-react';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export const VoltMarketAnalyticsDashboard: React.FC = () => {
  const { profile } = useVoltMarketAuth();
  const { loading, getDashboardAnalytics } = useVoltMarketAnalytics();
  
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [timeRange, setTimeRange] = useState('30d');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    setRefreshing(true);
    const { data, error } = await getDashboardAnalytics();
    if (error) {
      console.error('Error fetching analytics:', error);
    } else {
      setAnalyticsData(data);
    }
    setRefreshing(false);
  };

  const handleRefresh = () => {
    fetchAnalytics();
  };

  const exportData = () => {
    if (!analyticsData) return;
    
    const dataStr = JSON.stringify(analyticsData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `gridbazaar-analytics-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
  };

  if (loading || !analyticsData) {
    return (
      <div className="min-h-screen bg-muted py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </div>
      </div>
    );
  }

  const kpiCards = [
    {
      title: 'Total Listings',
      value: analyticsData.total_listings,
      change: '+12%',
      trend: 'up',
      icon: Building2,
      color: 'text-blue-600'
    },
    {
      title: 'Active Listings',
      value: analyticsData.active_listings,
      change: '+8%',
      trend: 'up',
      icon: Activity,
      color: 'text-green-600'
    },
    {
      title: 'Total Users',
      value: analyticsData.total_users,
      change: '+23%',
      trend: 'up',
      icon: Users,
      color: 'text-purple-600'
    },
    {
      title: 'Verified Users',
      value: analyticsData.verified_users,
      change: '+15%',
      trend: 'up',
      icon: TrendingUp,
      color: 'text-orange-600'
    },
    {
      title: 'Total Transactions',
      value: analyticsData.total_transactions,
      change: '+31%',
      trend: 'up',
      icon: DollarSign,
      color: 'text-emerald-600'
    },
    {
      title: 'Avg Deal Size',
      value: '$2.4M',
      change: '+18%',
      trend: 'up',
      icon: Building2,
      color: 'text-indigo-600'
    },
    {
      title: 'Monthly Volume',
      value: '$15.2M',
      change: '+45%',
      trend: 'up',
      icon: TrendingUp,
      color: 'text-cyan-600'
    },
    {
      title: 'Conversion Rate',
      value: '14.8%',
      change: '+5.2%',
      trend: 'up',
      icon: Activity,
      color: 'text-rose-600'
    }
  ];

  return (
    <div className="min-h-screen bg-muted py-4 sm:py-8">
      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
        {/* Header */}
        <div className="mb-4 sm:mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="min-w-0 flex-1">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground mb-2 truncate">GridBazaar Dashboard</h1>
            <p className="text-sm sm:text-base text-muted-foreground">Monitor your GridBazaar performance and insights</p>
          </div>
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">7 Days</SelectItem>
                <SelectItem value="30d">30 Days</SelectItem>
                <SelectItem value="90d">90 Days</SelectItem>
                <SelectItem value="1y">1 Year</SelectItem>
              </SelectContent>
            </Select>
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={refreshing}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={exportData}
            >
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-4 sm:mb-8">
          {kpiCards.map((kpi, index) => {
            const IconComponent = kpi.icon;
            return (
              <Card key={index}>
                <CardContent className="p-3 sm:p-4 md:p-6">
                  <div className="flex items-center justify-between">
                    <div className="min-w-0 flex-1">
                      <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">{kpi.title}</p>
                      <p className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 mt-1">
                        {kpi.value.toLocaleString()}
                      </p>
                      <Badge 
                        variant="secondary" 
                        className="mt-1 sm:mt-2 text-green-600 bg-green-50 text-xs"
                      >
                        {kpi.change}
                      </Badge>
                    </div>
                    <div className={`p-2 sm:p-3 rounded-full bg-gray-50 ${kpi.color} flex-shrink-0`}>
                      <IconComponent className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6 mb-4 sm:mb-8">
          {/* Popular Locations */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Popular Locations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={analyticsData.popular_locations}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="location" 
                    angle={-45}
                    textAnchor="end"
                    height={80}
                    fontSize={12}
                  />
                  <YAxis fontSize={12} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#0088FE" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Listing Categories */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="w-5 h-5" />
                Listing Categories
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={analyticsData.listing_categories}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ category, count }) => `${category}: ${count}`}
                    outerRadius={60}
                    fill="#8884d8"
                    dataKey="count"
                    fontSize={12}
                  >
                    {analyticsData.listing_categories.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Revenue Trends */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Revenue Trends
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={[
                  { month: 'Jan', revenue: 1200000, fees: 36000, growth: 12 },
                  { month: 'Feb', revenue: 1350000, fees: 40500, growth: 15 },
                  { month: 'Mar', revenue: 1480000, fees: 44400, growth: 18 },
                  { month: 'Apr', revenue: 1620000, fees: 48600, growth: 22 },
                  { month: 'May', revenue: 1750000, fees: 52500, growth: 25 },
                  { month: 'Jun', revenue: 1890000, fees: 56700, growth: 28 }
                ]}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" fontSize={12} />
                  <YAxis fontSize={12} />
                  <Tooltip formatter={(value, name) => [
                    name === 'revenue' ? `$${(value as number / 1000000).toFixed(1)}M` : 
                    name === 'fees' ? `$${(value as number / 1000).toFixed(0)}K` : 
                    `${value}%`,
                    name
                  ]} />
                  <Line type="monotone" dataKey="revenue" stroke="#8884d8" strokeWidth={2} />
                  <Line type="monotone" dataKey="fees" stroke="#82ca9d" strokeWidth={2} />
                  <Line type="monotone" dataKey="growth" stroke="#ffc658" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Activity and Performance Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6 mb-4 sm:mb-8">
          {/* Platform Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Platform Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={[
                  { name: 'Week 1', listings: 65, users: 28, transactions: 12 },
                  { name: 'Week 2', listings: 78, users: 34, transactions: 18 },
                  { name: 'Week 3', listings: 82, users: 41, transactions: 22 },
                  { name: 'Week 4', listings: 95, users: 48, transactions: 28 }
                ]}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" fontSize={12} />
                  <YAxis fontSize={12} />
                  <Tooltip />
                  <Area type="monotone" dataKey="listings" stackId="1" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                  <Area type="monotone" dataKey="users" stackId="1" stroke="#82ca9d" fill="#82ca9d" fillOpacity={0.6} />
                  <Area type="monotone" dataKey="transactions" stackId="1" stroke="#ffc658" fill="#ffc658" fillOpacity={0.6} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Performance Metrics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Performance Metrics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={[
                  { metric: 'Conversion', value: 14.8, target: 15 },
                  { metric: 'Engagement', value: 78.2, target: 75 },
                  { metric: 'Retention', value: 92.5, target: 90 },
                  { metric: 'Satisfaction', value: 89.3, target: 85 },
                  { metric: 'Growth', value: 23.7, target: 20 }
                ]}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="metric" fontSize={12} />
                  <YAxis fontSize={12} />
                  <Tooltip formatter={(value) => [`${value}%`, 'Performance']} />
                  <Bar dataKey="value" fill="#0088FE" name="Current" />
                  <Bar dataKey="target" fill="#00C49F" name="Target" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Geographic Distribution */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Geographic Distribution & Market Coverage
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart data={[
                    { state: 'Texas', listings: 145, volume: 45.2, growth: 28 },
                    { state: 'California', listings: 123, volume: 38.7, growth: 22 },
                    { state: 'New York', listings: 98, volume: 31.4, growth: 18 },
                    { state: 'Florida', listings: 87, volume: 28.9, growth: 35 },
                    { state: 'Illinois', listings: 76, volume: 24.1, growth: 15 },
                    { state: 'Pennsylvania', listings: 65, volume: 19.8, growth: 12 },
                    { state: 'Ohio', listings: 54, volume: 16.3, growth: 25 }
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="state" angle={-45} textAnchor="end" height={80} fontSize={12} />
                    <YAxis yAxisId="left" orientation="left" fontSize={12} />
                    <YAxis yAxisId="right" orientation="right" fontSize={12} />
                    <Tooltip />
                    <Bar yAxisId="left" dataKey="listings" fill="#8884d8" name="Listings" />
                    <Bar yAxisId="right" dataKey="volume" fill="#82ca9d" name="Volume ($M)" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-800">Top Markets</h4>
                <div className="space-y-3">
                  {[
                    { region: 'Southeast', share: '32%', trend: '+18%' },
                    { region: 'West Coast', share: '28%', trend: '+22%' },
                    { region: 'Northeast', share: '24%', trend: '+15%' },
                    { region: 'Midwest', share: '16%', trend: '+12%' }
                  ].map((market, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-sm">{market.region}</p>
                        <p className="text-xs text-gray-600">{market.share} market share</p>
                      </div>
                      <Badge variant="secondary" className="text-green-600 bg-green-50">
                        {market.trend}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Comprehensive Market Insights */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Market Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Average Listing Price</span>
                  <span className="font-semibold">$2.4M</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Median Time to Close</span>
                  <span className="font-semibold">45 days</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Success Rate</span>
                  <span className="font-semibold text-green-600">78%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Market Velocity</span>
                  <span className="font-semibold text-blue-600">2.3x</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">User Engagement</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Daily Active Users</span>
                  <span className="font-semibold">1,234</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Messages Sent</span>
                  <span className="font-semibold">5,678</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Profile Views</span>
                  <span className="font-semibold">12,345</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Session Duration</span>
                  <span className="font-semibold">18.5 min</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Revenue Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Transaction Volume</span>
                  <span className="font-semibold">$15.2M</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Platform Fees</span>
                  <span className="font-semibold">$456K</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Growth Rate</span>
                  <span className="font-semibold text-green-600">+23%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">ARPU</span>
                  <span className="font-semibold">$3,240</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Operational KPIs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Lead Response Time</span>
                  <span className="font-semibold">2.3 hrs</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Quality Score</span>
                  <span className="font-semibold text-green-600">9.2/10</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Support Tickets</span>
                  <span className="font-semibold">127</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Platform Uptime</span>
                  <span className="font-semibold text-green-600">99.8%</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Advanced Analytics Dashboard */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
          {/* Power Capacity Analytics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Power Capacity Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={[
                  { range: '<1MW', count: 45, percentage: 25 },
                  { range: '1-5MW', count: 67, percentage: 35 },
                  { range: '5-10MW', count: 34, percentage: 20 },
                  { range: '10-25MW', count: 23, percentage: 15 },
                  { range: '>25MW', count: 12, percentage: 5 }
                ]}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="range" fontSize={12} />
                  <YAxis fontSize={12} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#8884d8" name="Listings" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Market Predictions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Market Predictions (6 months)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={[
                  { month: 'Jul', predicted: 180, confidence: 85 },
                  { month: 'Aug', predicted: 195, confidence: 82 },
                  { month: 'Sep', predicted: 210, confidence: 78 },
                  { month: 'Oct', predicted: 225, confidence: 75 },
                  { month: 'Nov', predicted: 240, confidence: 72 },
                  { month: 'Dec', predicted: 255, confidence: 68 }
                ]}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" fontSize={12} />
                  <YAxis yAxisId="left" fontSize={12} />
                  <YAxis yAxisId="right" orientation="right" fontSize={12} />
                  <Tooltip />
                  <Line yAxisId="left" type="monotone" dataKey="predicted" stroke="#8884d8" strokeWidth={3} name="Predicted Listings" />
                  <Line yAxisId="right" type="monotone" dataKey="confidence" stroke="#82ca9d" strokeWidth={2} name="Confidence %" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

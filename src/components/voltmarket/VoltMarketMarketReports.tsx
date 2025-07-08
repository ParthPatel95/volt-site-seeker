import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  FileText,
  Download,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Zap,
  Calendar,
  MapPin,
  BarChart3,
  PieChart,
  Search,
  Filter,
  Brain,
  AlertCircle
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, BarChart, Bar, Tooltip, Legend, PieChart as RechartsPieChart, Pie, Cell, Area, AreaChart } from 'recharts';

interface MarketReport {
  id: string;
  title: string;
  description: string;
  reportType: 'market_overview' | 'sector_analysis' | 'regional_trends' | 'price_analysis' | 'forecast';
  publishedDate: string;
  region: string;
  sector: string;
  keyMetrics: {
    avgPricePerMW: number;
    totalTransactions: number;
    marketGrowth: number;
    capacityAdded: number;
  };
  insights: string[];
  downloadUrl?: string;
}

interface MarketData {
  priceData: Array<{ month: string; avgPrice: number; transactions: number }>;
  sectorData: Array<{ sector: string; value: number; growth: number }>;
  regionalData: Array<{ region: string; deals: number; value: number }>;
  forecastData: Array<{ year: number; predicted: number; actual?: number }>;
  trendsData: Array<{ category: string; trend: 'up' | 'down' | 'stable'; percentage: number }>;
}

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];

export const VoltMarketMarketReports: React.FC = () => {
  const [reports, setReports] = useState<MarketReport[]>([]);
  const [marketData, setMarketData] = useState<MarketData | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterRegion, setFilterRegion] = useState('all');

  useEffect(() => {
    // Mock data - in real implementation, this would fetch from API
    const mockReports: MarketReport[] = [
      {
        id: '1',
        title: 'Q4 2024 Energy Infrastructure Market Overview',
        description: 'Comprehensive analysis of energy infrastructure transactions and market trends',
        reportType: 'market_overview',
        publishedDate: '2024-12-01',
        region: 'North America',
        sector: 'All',
        keyMetrics: {
          avgPricePerMW: 2.4,
          totalTransactions: 156,
          marketGrowth: 15.2,
          capacityAdded: 2840
        },
        insights: [
          'Solar sector showing strongest growth with 23% increase YoY',
          'Texas leads in new capacity additions with 847 MW',
          'Average deal size increased by 18% compared to Q3 2024',
          'Corporate buyers increasingly active in renewable acquisitions'
        ]
      },
      {
        id: '2',
        title: 'Solar Farm Valuation Trends 2024',
        description: 'Deep dive into solar farm pricing and valuation methodologies',
        reportType: 'price_analysis',
        publishedDate: '2024-11-15',
        region: 'Southwest US',
        sector: 'Solar',
        keyMetrics: {
          avgPricePerMW: 1.8,
          totalTransactions: 89,
          marketGrowth: 28.5,
          capacityAdded: 1630
        },
        insights: [
          'Solar farm prices decreased 12% due to improved technology',
          'Utility-scale projects averaging $1.8M per MW installed',
          'Storage integration adding 15-20% premium to valuations',
          'PPAs longer than 15 years commanding price premiums'
        ]
      },
      {
        id: '3',
        title: 'Wind Energy Market Forecast 2025-2030',
        description: 'Five-year outlook for wind energy investments and development',
        reportType: 'forecast',
        publishedDate: '2024-11-30',
        region: 'Midwest US',
        sector: 'Wind',
        keyMetrics: {
          avgPricePerMW: 2.1,
          totalTransactions: 67,
          marketGrowth: 12.8,
          capacityAdded: 1205
        },
        insights: [
          'Offshore wind expected to grow 150% by 2030',
          'Grid interconnection bottlenecks limiting growth',
          'Technology improvements reducing LCOE by 8% annually',
          'State RPS mandates driving 60% of new development'
        ]
      }
    ];

    const mockMarketData: MarketData = {
      priceData: [
        { month: 'Jan', avgPrice: 2.2, transactions: 12 },
        { month: 'Feb', avgPrice: 2.1, transactions: 15 },
        { month: 'Mar', avgPrice: 2.3, transactions: 18 },
        { month: 'Apr', avgPrice: 2.0, transactions: 22 },
        { month: 'May', avgPrice: 1.9, transactions: 28 },
        { month: 'Jun', avgPrice: 2.1, transactions: 25 },
        { month: 'Jul', avgPrice: 2.4, transactions: 30 },
        { month: 'Aug', avgPrice: 2.3, transactions: 27 },
        { month: 'Sep', avgPrice: 2.5, transactions: 24 },
        { month: 'Oct', avgPrice: 2.4, transactions: 26 },
        { month: 'Nov', avgPrice: 2.2, transactions: 31 },
        { month: 'Dec', avgPrice: 2.1, transactions: 33 }
      ],
      sectorData: [
        { sector: 'Solar', value: 45, growth: 23 },
        { sector: 'Wind', value: 32, growth: 15 },
        { sector: 'Battery Storage', value: 12, growth: 67 },
        { sector: 'Transmission', value: 8, growth: 8 },
        { sector: 'Other', value: 3, growth: -5 }
      ],
      regionalData: [
        { region: 'Texas', deals: 47, value: 2.8 },
        { region: 'California', deals: 34, value: 3.1 },
        { region: 'New York', deals: 23, value: 3.4 },
        { region: 'Florida', deals: 19, value: 2.6 },
        { region: 'Illinois', deals: 16, value: 2.9 },
        { region: 'Other', deals: 71, value: 2.7 }
      ],
      forecastData: [
        { year: 2020, actual: 1.8, predicted: 1.9 },
        { year: 2021, actual: 2.0, predicted: 2.1 },
        { year: 2022, actual: 2.3, predicted: 2.2 },
        { year: 2023, actual: 2.1, predicted: 2.0 },
        { year: 2024, actual: 2.4, predicted: 2.3 },
        { year: 2025, predicted: 2.2 },
        { year: 2026, predicted: 2.0 },
        { year: 2027, predicted: 1.9 },
        { year: 2028, predicted: 1.8 },
        { year: 2029, predicted: 1.7 },
        { year: 2030, predicted: 1.6 }
      ],
      trendsData: [
        { category: 'Solar Prices', trend: 'down', percentage: 12 },
        { category: 'Wind Development', trend: 'up', percentage: 15 },
        { category: 'Storage Integration', trend: 'up', percentage: 67 },
        { category: 'Grid Connection Times', trend: 'up', percentage: 8 },
        { category: 'PPA Prices', trend: 'stable', percentage: 2 }
      ]
    };

    setTimeout(() => {
      setReports(mockReports);
      setMarketData(mockMarketData);
      setLoading(false);
    }, 1000);
  }, []);

  const filteredReports = reports.filter(report => {
    const matchesSearch = report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || report.reportType === filterType;
    const matchesRegion = filterRegion === 'all' || report.region.toLowerCase().includes(filterRegion.toLowerCase());
    
    return matchesSearch && matchesType && matchesRegion;
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 1,
      maximumFractionDigits: 1
    }).format(amount);
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'down': return <TrendingDown className="w-4 h-4 text-red-500" />;
      default: return <div className="w-4 h-4 rounded-full bg-gray-400" />;
    }
  };

  const getReportTypeColor = (type: string) => {
    const colors = {
      market_overview: 'bg-blue-100 text-blue-800',
      sector_analysis: 'bg-green-100 text-green-800',
      regional_trends: 'bg-purple-100 text-purple-800',
      price_analysis: 'bg-yellow-100 text-yellow-800',
      forecast: 'bg-red-100 text-red-800'
    };
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <FileText className="w-6 h-6" />
            Market Reports & Analytics
          </h2>
          <p className="text-muted-foreground">
            Comprehensive market intelligence and analysis for energy infrastructure investments
          </p>
        </div>
        <Button variant="outline">
          <Brain className="w-4 h-4 mr-2" />
          Generate Custom Report
        </Button>
      </div>

      <Tabs defaultValue="reports" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="reports">Reports</TabsTrigger>
          <TabsTrigger value="analytics">Market Analytics</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="forecasts">Forecasts</TabsTrigger>
        </TabsList>

        <TabsContent value="reports" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Search reports..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Report Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="market_overview">Market Overview</SelectItem>
                    <SelectItem value="sector_analysis">Sector Analysis</SelectItem>
                    <SelectItem value="regional_trends">Regional Trends</SelectItem>
                    <SelectItem value="price_analysis">Price Analysis</SelectItem>
                    <SelectItem value="forecast">Forecast</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filterRegion} onValueChange={setFilterRegion}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Region" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Regions</SelectItem>
                    <SelectItem value="north america">North America</SelectItem>
                    <SelectItem value="southwest">Southwest US</SelectItem>
                    <SelectItem value="midwest">Midwest US</SelectItem>
                    <SelectItem value="northeast">Northeast US</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Reports Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredReports.map((report) => (
              <Card key={report.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <Badge className={getReportTypeColor(report.reportType)}>
                        {report.reportType.replace('_', ' ').toUpperCase()}
                      </Badge>
                      <h3 className="font-semibold text-lg">{report.title}</h3>
                      <p className="text-sm text-muted-foreground">{report.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      <span>{new Date(report.publishedDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      <span>{report.region}</span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Key Metrics */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Avg Price/MW</p>
                      <p className="font-semibold">{formatCurrency(report.keyMetrics.avgPricePerMW)}M</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Transactions</p>
                      <p className="font-semibold">{report.keyMetrics.totalTransactions}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Market Growth</p>
                      <p className="font-semibold text-green-600">+{report.keyMetrics.marketGrowth}%</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Capacity Added</p>
                      <p className="font-semibold">{report.keyMetrics.capacityAdded} MW</p>
                    </div>
                  </div>

                  {/* Key Insights */}
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Key Insights</h4>
                    <div className="space-y-1">
                      {report.insights.slice(0, 2).map((insight, index) => (
                        <div key={index} className="flex items-start gap-2 text-xs">
                          <div className="w-1 h-1 rounded-full bg-blue-500 mt-1.5 flex-shrink-0" />
                          <span className="text-muted-foreground">{insight}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    <Button size="sm" className="flex-1">
                      View Report
                    </Button>
                    <Button size="sm" variant="outline">
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Price Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={marketData?.priceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Area type="monotone" dataKey="avgPrice" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.3} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Transaction Volume</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={marketData?.priceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="transactions" fill="#10B981" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Market Share by Sector</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsPieChart>
                    <Pie
                      data={marketData?.sectorData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ sector, value }) => `${sector} ${value}%`}
                    >
                      {marketData?.sectorData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Regional Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {marketData?.regionalData.map((region, index) => (
                    <div key={region.region} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-muted-foreground" />
                        <span className="font-medium">{region.region}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-sm text-muted-foreground">{region.deals} deals</span>
                        <Badge variant="outline">{formatCurrency(region.value)}M avg</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="trends" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Market Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {marketData?.trendsData.map((trend, index) => (
                  <div key={trend.category} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      {getTrendIcon(trend.trend)}
                      <span className="font-medium">{trend.category}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-medium ${
                        trend.trend === 'up' ? 'text-green-600' : 
                        trend.trend === 'down' ? 'text-red-600' : 'text-gray-600'
                      }`}>
                        {trend.trend === 'up' ? '+' : trend.trend === 'down' ? '-' : '±'}{trend.percentage}%
                      </span>
                      <Badge variant={trend.trend === 'up' ? 'default' : trend.trend === 'down' ? 'destructive' : 'secondary'}>
                        {trend.trend}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="forecasts" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Price Forecast Through 2030</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={marketData?.forecastData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="year" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="actual" stroke="#3B82F6" strokeWidth={2} name="Historical" />
                  <Line type="monotone" dataKey="predicted" stroke="#10B981" strokeWidth={2} strokeDasharray="5 5" name="Forecast" />
                </LineChart>
              </ResponsiveContainer>
              <div className="mt-4 p-4 bg-amber-50 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium text-amber-800">Forecast Assumptions</p>
                    <p className="text-amber-700">Based on technology cost reductions, policy support, and market maturation trends. Actual results may vary.</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
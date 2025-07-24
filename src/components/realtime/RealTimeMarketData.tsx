import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  DollarSign,
  Zap,
  Globe,
  Clock,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  XCircle
} from 'lucide-react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

interface MarketDataPoint {
  timestamp: string;
  price: number;
  volume: number;
  change: number;
  changePercent: number;
}

interface PowerGrid {
  id: string;
  name: string;
  region: string;
  currentLoad: number;
  capacity: number;
  price: number;
  priceChange: number;
  status: 'normal' | 'warning' | 'critical';
  lastUpdate: string;
}

interface CommodityPrice {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap?: number;
  lastUpdate: string;
}

interface NewsAlert {
  id: string;
  title: string;
  summary: string;
  impact: 'high' | 'medium' | 'low';
  timestamp: string;
  source: string;
}

export function RealTimeMarketData() {
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [selectedRegion, setSelectedRegion] = useState('all');
  const [marketData, setMarketData] = useState<MarketDataPoint[]>([]);
  const [powerGrids, setPowerGrids] = useState<PowerGrid[]>([]);
  const [commodityPrices, setCommodityPrices] = useState<CommodityPrice[]>([]);
  const [newsAlerts, setNewsAlerts] = useState<NewsAlert[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    // Simulate real-time connection
    setIsConnected(true);
    loadInitialData();
    
    if (autoRefresh) {
      const interval = setInterval(() => {
        updateMarketData();
      }, 5000); // Update every 5 seconds
      
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const loadInitialData = () => {
    // Generate mock market data for the last 24 hours
    const now = new Date();
    const data: MarketDataPoint[] = [];
    for (let i = 23; i >= 0; i--) {
      const timestamp = new Date(now.getTime() - i * 60 * 60 * 1000);
      const basePrice = 45.50;
      const variation = (Math.random() - 0.5) * 10;
      const price = Math.max(0, basePrice + variation);
      const change = i === 23 ? 0 : price - data[data.length - 1]?.price || 0;
      
      data.push({
        timestamp: timestamp.toISOString(),
        price: parseFloat(price.toFixed(2)),
        volume: Math.floor(Math.random() * 1000000) + 500000,
        change: parseFloat(change.toFixed(2)),
        changePercent: parseFloat(((change / basePrice) * 100).toFixed(2))
      });
    }
    setMarketData(data);

    // Mock power grid data
    const grids: PowerGrid[] = [
      {
        id: 'ercot',
        name: 'ERCOT',
        region: 'Texas',
        currentLoad: 45000,
        capacity: 85000,
        price: 42.50,
        priceChange: 2.3,
        status: 'normal',
        lastUpdate: now.toISOString()
      },
      {
        id: 'pjm',
        name: 'PJM',
        region: 'Mid-Atlantic',
        currentLoad: 95000,
        capacity: 180000,
        price: 38.75,
        priceChange: -1.8,
        status: 'warning',
        lastUpdate: now.toISOString()
      },
      {
        id: 'caiso',
        name: 'CAISO',
        region: 'California',
        currentLoad: 32000,
        capacity: 55000,
        price: 65.20,
        priceChange: 8.5,
        status: 'critical',
        lastUpdate: now.toISOString()
      },
      {
        id: 'nyiso',
        name: 'NYISO',
        region: 'New York',
        currentLoad: 18000,
        capacity: 35000,
        price: 55.40,
        priceChange: 1.2,
        status: 'normal',
        lastUpdate: now.toISOString()
      }
    ];
    setPowerGrids(grids);

    // Mock commodity prices
    const commodities: CommodityPrice[] = [
      {
        symbol: 'BTC',
        name: 'Bitcoin',
        price: 67890.45,
        change: 1250.30,
        changePercent: 1.88,
        volume: 28500000000,
        marketCap: 1340000000000,
        lastUpdate: now.toISOString()
      },
      {
        symbol: 'ETH',
        name: 'Ethereum',
        price: 3420.15,
        change: -89.25,
        changePercent: -2.54,
        volume: 15200000000,
        marketCap: 411000000000,
        lastUpdate: now.toISOString()
      },
      {
        symbol: 'CRUDE',
        name: 'Crude Oil',
        price: 78.25,
        change: 0.85,
        changePercent: 1.10,
        volume: 825000000,
        lastUpdate: now.toISOString()
      },
      {
        symbol: 'NATGAS',
        name: 'Natural Gas',
        price: 2.85,
        change: -0.12,
        changePercent: -4.04,
        volume: 156000000,
        lastUpdate: now.toISOString()
      }
    ];
    setCommodityPrices(commodities);

    // Mock news alerts
    const alerts: NewsAlert[] = [
      {
        id: '1',
        title: 'ERCOT Issues Grid Emergency Alert',
        summary: 'High demand and reduced renewable generation trigger conservation appeal',
        impact: 'high',
        timestamp: new Date(now.getTime() - 15 * 60 * 1000).toISOString(),
        source: 'ERCOT'
      },
      {
        id: '2',
        title: 'Bitcoin Mining Operation Announces Texas Expansion',
        summary: 'Major cryptocurrency mining company to add 200MW facility in West Texas',
        impact: 'medium',
        timestamp: new Date(now.getTime() - 45 * 60 * 1000).toISOString(),
        source: 'Energy News'
      },
      {
        id: '3',
        title: 'Federal Reserve Maintains Interest Rates',
        summary: 'Decision impacts energy investment and infrastructure financing',
        impact: 'medium',
        timestamp: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(),
        source: 'Reuters'
      }
    ];
    setNewsAlerts(alerts);
  };

  const updateMarketData = () => {
    setMarketData(prev => {
      const latest = prev[prev.length - 1];
      const now = new Date();
      const priceVariation = (Math.random() - 0.5) * 2;
      const newPrice = Math.max(0, latest.price + priceVariation);
      const change = newPrice - latest.price;
      
      const newPoint: MarketDataPoint = {
        timestamp: now.toISOString(),
        price: parseFloat(newPrice.toFixed(2)),
        volume: Math.floor(Math.random() * 1000000) + 500000,
        change: parseFloat(change.toFixed(2)),
        changePercent: parseFloat(((change / latest.price) * 100).toFixed(2))
      };
      
      return [...prev.slice(-23), newPoint];
    });

    // Update power grid prices
    setPowerGrids(prev => prev.map(grid => ({
      ...grid,
      price: Math.max(0, grid.price + (Math.random() - 0.5) * 2),
      priceChange: (Math.random() - 0.5) * 10,
      lastUpdate: new Date().toISOString()
    })));

    // Update commodity prices
    setCommodityPrices(prev => prev.map(commodity => {
      const change = (Math.random() - 0.5) * (commodity.price * 0.05);
      const newPrice = Math.max(0, commodity.price + change);
      return {
        ...commodity,
        price: parseFloat(newPrice.toFixed(2)),
        change: parseFloat(change.toFixed(2)),
        changePercent: parseFloat(((change / commodity.price) * 100).toFixed(2)),
        lastUpdate: new Date().toISOString()
      };
    }));

    setLastUpdate(new Date());
  };

  const manualRefresh = () => {
    updateMarketData();
    toast({
      title: "Data refreshed",
      description: "Market data has been updated"
    });
  };

  const getStatusColor = (status: PowerGrid['status']) => {
    switch (status) {
      case 'normal': return 'secondary';
      case 'warning': return 'secondary';
      case 'critical': return 'destructive';
      default: return 'secondary';
    }
  };

  const getStatusIcon = (status: PowerGrid['status']) => {
    switch (status) {
      case 'normal': return <CheckCircle className="w-4 h-4" />;
      case 'warning': return <AlertTriangle className="w-4 h-4" />;
      case 'critical': return <XCircle className="w-4 h-4" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  const getImpactColor = (impact: NewsAlert['impact']) => {
    switch (impact) {
      case 'high': return 'destructive';
      case 'medium': return 'warning';
      case 'low': return 'secondary';
      default: return 'outline';
    }
  };

  const formatCurrency = (value: number, decimals = 2) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    }).format(value);
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('en-US').format(value);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Real-Time Market Data</h1>
          <p className="text-muted-foreground">Live energy markets and power grid status</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={isConnected ? 'success' : 'destructive'} className="gap-1">
            <Activity className="w-3 h-3" />
            {isConnected ? 'Connected' : 'Disconnected'}
          </Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={manualRefresh}
            className="gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </Button>
          <Button
            variant={autoRefresh ? 'default' : 'outline'}
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
            className="gap-2"
          >
            <Clock className="w-4 h-4" />
            Auto Refresh
          </Button>
        </div>
      </div>

      <div className="text-sm text-muted-foreground">
        Last updated: {lastUpdate.toLocaleTimeString()}
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="power">Power Grids</TabsTrigger>
          <TabsTrigger value="commodities">Commodities</TabsTrigger>
          <TabsTrigger value="charts">Charts</TabsTrigger>
          <TabsTrigger value="news">News</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  Avg. Power Price
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">$47.25</div>
                <div className="text-sm text-green-600 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  +2.8% from yesterday
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Zap className="w-4 h-4" />
                  Total Grid Load
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">190 GW</div>
                <div className="text-sm text-muted-foreground">
                  65% of capacity
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Activity className="w-4 h-4" />
                  Market Volume
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">$2.8B</div>
                <div className="text-sm text-red-600 flex items-center gap-1">
                  <TrendingDown className="w-3 h-3" />
                  -1.2% from yesterday
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Globe className="w-4 h-4" />
                  Active Alerts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">3</div>
                <div className="text-sm text-muted-foreground">
                  2 high, 1 medium
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Grid Status */}
          <Card>
            <CardHeader>
              <CardTitle>Grid Status Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {powerGrids.map((grid) => (
                  <div key={grid.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <div className="font-medium">{grid.name}</div>
                      <div className="text-sm text-muted-foreground">{grid.region}</div>
                      <div className="text-lg font-bold">{formatCurrency(grid.price)}</div>
                    </div>
                    <Badge variant={getStatusColor(grid.status)} className="gap-1">
                      {getStatusIcon(grid.status)}
                      {grid.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="power" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Power Grid Status</h2>
            <Select value={selectedRegion} onValueChange={setSelectedRegion}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Regions</SelectItem>
                <SelectItem value="texas">Texas</SelectItem>
                <SelectItem value="california">California</SelectItem>
                <SelectItem value="northeast">Northeast</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {powerGrids.map((grid) => (
              <Card key={grid.id}>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle>{grid.name}</CardTitle>
                      <p className="text-sm text-muted-foreground">{grid.region}</p>
                    </div>
                    <Badge variant={getStatusColor(grid.status)} className="gap-1">
                      {getStatusIcon(grid.status)}
                      {grid.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-muted-foreground">Current Price</div>
                      <div className="text-xl font-bold">{formatCurrency(grid.price)}</div>
                      <div className={`text-sm ${grid.priceChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {grid.priceChange >= 0 ? '+' : ''}{grid.priceChange.toFixed(2)}%
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Load Factor</div>
                      <div className="text-xl font-bold">
                        {((grid.currentLoad / grid.capacity) * 100).toFixed(1)}%
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {formatNumber(grid.currentLoad)} / {formatNumber(grid.capacity)} MW
                      </div>
                    </div>
                  </div>
                  
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        grid.status === 'critical' ? 'bg-red-600' :
                        grid.status === 'warning' ? 'bg-yellow-600' : 'bg-green-600'
                      }`}
                      style={{ width: `${(grid.currentLoad / grid.capacity) * 100}%` }}
                    />
                  </div>
                  
                  <div className="text-xs text-muted-foreground">
                    Last updated: {new Date(grid.lastUpdate).toLocaleTimeString()}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="commodities" className="space-y-4">
          <h2 className="text-xl font-semibold">Commodity Prices</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {commodityPrices.map((commodity) => (
              <Card key={commodity.symbol}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">{commodity.symbol}</CardTitle>
                  <p className="text-sm text-muted-foreground">{commodity.name}</p>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="text-2xl font-bold">
                    {commodity.symbol === 'BTC' || commodity.symbol === 'ETH' 
                      ? formatCurrency(commodity.price, 2)
                      : formatCurrency(commodity.price)
                    }
                  </div>
                  <div className={`text-sm flex items-center gap-1 ${
                    commodity.change >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {commodity.change >= 0 ? 
                      <TrendingUp className="w-3 h-3" /> : 
                      <TrendingDown className="w-3 h-3" />
                    }
                    {commodity.change >= 0 ? '+' : ''}{formatCurrency(commodity.change)} 
                    ({commodity.changePercent >= 0 ? '+' : ''}{commodity.changePercent}%)
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Volume: {formatCurrency(commodity.volume, 0)}
                  </div>
                  {commodity.marketCap && (
                    <div className="text-xs text-muted-foreground">
                      Market Cap: {formatCurrency(commodity.marketCap, 0)}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="charts" className="space-y-4">
          <h2 className="text-xl font-semibold">Market Charts</h2>
          
          <Card>
            <CardHeader>
              <CardTitle>Energy Price Trend (24 Hours)</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={marketData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="timestamp" 
                    tickFormatter={(value) => new Date(value).toLocaleTimeString([], { hour: '2-digit' })}
                  />
                  <YAxis />
                  <Tooltip 
                    labelFormatter={(value) => new Date(value).toLocaleString()}
                    formatter={(value: number) => [formatCurrency(value), 'Price']}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="price" 
                    stroke="hsl(var(--chart-1))" 
                    strokeWidth={2}
                    name="Energy Price"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Trading Volume (24 Hours)</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={marketData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="timestamp" 
                    tickFormatter={(value) => new Date(value).toLocaleTimeString([], { hour: '2-digit' })}
                  />
                  <YAxis />
                  <Tooltip 
                    labelFormatter={(value) => new Date(value).toLocaleString()}
                    formatter={(value: number) => [formatNumber(value), 'Volume']}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="volume" 
                    stroke="hsl(var(--chart-2))" 
                    fill="hsl(var(--chart-2))"
                    fillOpacity={0.3}
                    name="Trading Volume"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="news" className="space-y-4">
          <h2 className="text-xl font-semibold">Market News & Alerts</h2>
          
          <div className="space-y-4">
            {newsAlerts.map((alert) => (
              <Card key={alert.id}>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{alert.title}</CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">{alert.summary}</p>
                    </div>
                    <Badge variant={getImpactColor(alert.impact)}>
                      {alert.impact} impact
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Source: {alert.source}</span>
                    <span>{new Date(alert.timestamp).toLocaleString()}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
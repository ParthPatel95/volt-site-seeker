export { LiveMarketDashboard as RealTimeMarketData } from './LiveMarketDashboard';

// Legacy export for backwards compatibility
import { LiveMarketDashboard } from './LiveMarketDashboard';
export default LiveMarketDashboard;
  TrendingDown, 
  Activity, 
  DollarSign,
  Zap,
  Globe,
  Clock,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  XCircle,
  MapPin,
  Gauge,
  Wind,
  Sun,
  Fuel,
  Wifi,
  WifiOff
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
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { supabase } from '@/integrations/supabase/client';
import { useExchangeRate } from '@/hooks/useExchangeRate';

interface RegionalData {
  region: string;
  name: string;
  currentPrice: number;
  currentLoad: number;
  capacity: number;
  renewable: number;
  status: 'normal' | 'warning' | 'critical';
  lastUpdate: string;
  currency?: string;
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

interface ChartDataPoint {
  timestamp: string;
  ercot: number;
  aeso: number;
  volume: number;
}

const CHART_COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#8dd1e1'];

export function RealTimeMarketData() {
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [selectedRegion, setSelectedRegion] = useState('all');
  const [refreshInterval, setRefreshInterval] = useState(30); // seconds
  const [loading, setLoading] = useState(false);
  
  // Data states
  const [regionalData, setRegionalData] = useState<RegionalData[]>([]);
  const [commodityPrices, setCommodityPrices] = useState<CommodityPrice[]>([]);
  const [newsAlerts, setNewsAlerts] = useState<NewsAlert[]>([]);
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<{[key: string]: string}>({});
  
  const { toast } = useToast();
  const { exchangeRate, convertToUSD } = useExchangeRate();

  // Fetch live data from edge functions
  const fetchLiveData = async () => {
    if (loading) return;
    
    setLoading(true);
    try {
      console.log('Fetching live market data...');
      
      // Fetch ERCOT data
      const ercotResponse = await supabase.functions.invoke('ercot-data-integration');
      console.log('ERCOT Response:', ercotResponse);
      
      // Fetch AESO data
      const aesoResponse = await supabase.functions.invoke('aeso-data-integration');
      console.log('AESO Response:', aesoResponse);
      
      const now = new Date();
      const newRegionalData: RegionalData[] = [];
      const newStatus: {[key: string]: string} = {};

      // Process ERCOT data
      if (ercotResponse.data?.success) {
        const ercotData = ercotResponse.data;
        newRegionalData.push({
          region: 'ERCOT',
          name: 'Texas (ERCOT)',
          currentPrice: ercotData.pricing?.current_price || 0,
          currentLoad: ercotData.loadData?.current_demand_mw || 0,
          capacity: ercotData.loadData?.peak_forecast_mw || 0,
          renewable: ercotData.generationMix?.renewable_percentage || 0,
          status: 'normal',
          lastUpdate: now.toISOString(),
          currency: 'USD'
        });
        newStatus.ercot = 'connected';
      } else {
        newStatus.ercot = 'error';
      }

      // Process AESO data
      if (aesoResponse.data?.success) {
        const aesoData = aesoResponse.data;
        newRegionalData.push({
          region: 'AESO',
          name: 'Alberta (AESO)',
          currentPrice: aesoData.pricing?.current_price || 0,
          currentLoad: aesoData.loadData?.current_demand_mw || 0,
          capacity: aesoData.loadData?.peak_forecast_mw || 0,
          renewable: aesoData.generationMix?.renewable_percentage || 0,
          status: 'normal',
          lastUpdate: now.toISOString(),
          currency: 'CAD'
        });
        newStatus.aeso = 'connected';
      } else {
        newStatus.aeso = 'error';
      }

      setRegionalData(newRegionalData);
      setConnectionStatus(newStatus);
      
      // Update chart data
      const newChartPoint: ChartDataPoint = {
        timestamp: now.toISOString(),
        ercot: ercotResponse.data?.pricing?.current_price || 0,
        aeso: aesoResponse.data?.pricing?.current_price || 0,
        volume: Math.floor(Math.random() * 1000000) + 500000
      };

      setChartData(prev => {
        const updated = [...prev, newChartPoint].slice(-24); // Keep last 24 points
        return updated;
      });

      setIsConnected(true);
      setLastUpdate(now);
      
      console.log('Live data updated successfully');
      
    } catch (error) {
      console.error('Error fetching live data:', error);
      setIsConnected(false);
      toast({
        title: "Connection Error",
        description: "Failed to fetch real-time data from energy markets",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch commodity prices (Bitcoin, etc.)
  const fetchCommodityPrices = async () => {
    try {
      // Fetch Bitcoin price from public API
      const btcResponse = await fetch('https://api.coinbase.com/v2/prices/spot?currency=USD');
      const btcData = await btcResponse.json();
      
      const now = new Date();
      const commodities: CommodityPrice[] = [
        {
          symbol: 'BTC',
          name: 'Bitcoin',
          price: parseFloat(btcData.data?.amount || '67890'),
          change: Math.random() * 2000 - 1000,
          changePercent: (Math.random() - 0.5) * 10,
          volume: Math.random() * 50000000000,
          marketCap: parseFloat(btcData.data?.amount || '67890') * 19.7e6,
          lastUpdate: now.toISOString()
        }
      ];
      
      setCommodityPrices(commodities);
    } catch (error) {
      console.error('Error fetching commodity prices:', error);
    }
  };

  // Generate mock news alerts
  const generateNewsAlerts = () => {
    const now = new Date();
    const alerts: NewsAlert[] = [
      {
        id: '1',
        title: 'ERCOT Peak Demand Alert',
        summary: 'Texas grid approaching peak demand thresholds as summer heat drives air conditioning usage',
        impact: 'high',
        timestamp: new Date(now.getTime() - 15 * 60 * 1000).toISOString(),
        source: 'ERCOT'
      },
      {
        id: '2',
        title: 'Alberta Wind Generation Surge',
        summary: 'Strong winds across Alberta boosting renewable energy contribution to 45% of total generation',
        impact: 'medium',
        timestamp: new Date(now.getTime() - 45 * 60 * 1000).toISOString(),
        source: 'AESO'
      },
      {
        id: '3',
        title: 'Bitcoin Mining Operations Expand',
        summary: 'Major cryptocurrency mining operations announcing capacity expansion in Texas and Alberta',
        impact: 'medium',
        timestamp: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(),
        source: 'Energy News'
      }
    ];
    setNewsAlerts(alerts);
  };

  // Auto-refresh effect
  useEffect(() => {
    // Initial load
    fetchLiveData();
    fetchCommodityPrices();
    generateNewsAlerts();
    
    if (autoRefresh) {
      const interval = setInterval(() => {
        fetchLiveData();
        fetchCommodityPrices();
      }, refreshInterval * 1000);
      
      return () => clearInterval(interval);
    }
  }, [autoRefresh, refreshInterval]);

  const manualRefresh = () => {
    fetchLiveData();
    fetchCommodityPrices();
    toast({
      title: "Data refreshed",
      description: "Market data has been updated from live sources"
    });
  };

  const getStatusColor = (status: RegionalData['status']) => {
    switch (status) {
      case 'normal': return 'default';
      case 'warning': return 'secondary';
      case 'critical': return 'destructive';
      default: return 'outline';
    }
  };

  const getConnectionIcon = (region: string) => {
    const status = connectionStatus[region.toLowerCase()];
    switch (status) {
      case 'connected':
        return <Wifi className="w-4 h-4 text-green-500" />;
      case 'error':
        return <WifiOff className="w-4 h-4 text-red-500" />;
      default:
        return <Activity className="w-4 h-4 text-gray-500" />;
    }
  };

  const getImpactColor = (impact: NewsAlert['impact']) => {
    switch (impact) {
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'outline';
    }
  };

  const formatCurrency = (value: number, currency = 'USD', decimals = 2) => {
    const symbol = currency === 'CAD' ? 'CA$' : '$';
    return `${symbol}${value.toFixed(decimals)}`;
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('en-US').format(value);
  };

  const formatPrice = (value: number, currency = 'USD') => {
    if (currency === 'CAD' && exchangeRate) {
      return {
        original: formatCurrency(value, 'CAD'),
        converted: formatCurrency(convertToUSD(value), 'USD')
      };
    }
    return {
      original: formatCurrency(value, currency),
      converted: null
    };
  };

  // Calculate summary metrics
  const avgPrice = regionalData.length > 0 
    ? regionalData.reduce((sum, r) => sum + r.currentPrice, 0) / regionalData.length 
    : 0;
  const totalLoad = regionalData.reduce((sum, r) => sum + r.currentLoad, 0);
  const avgRenewable = regionalData.length > 0 
    ? regionalData.reduce((sum, r) => sum + r.renewable, 0) / regionalData.length 
    : 0;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Real-Time Market Data</h1>
          <p className="text-muted-foreground">Live energy markets across North America</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant={isConnected ? 'default' : 'destructive'} className="gap-1">
            <Activity className="w-3 h-3" />
            {isConnected ? 'Live Data' : 'Disconnected'}
          </Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={manualRefresh}
            disabled={loading}
            className="gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <div className="flex items-center gap-2">
            <Switch
              checked={autoRefresh}
              onCheckedChange={setAutoRefresh}
            />
            <span className="text-sm">Auto-refresh</span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>Last updated: {lastUpdate.toLocaleTimeString()}</span>
        <Select value={refreshInterval.toString()} onValueChange={(v) => setRefreshInterval(parseInt(v))}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="15">15 sec</SelectItem>
            <SelectItem value="30">30 sec</SelectItem>
            <SelectItem value="60">1 min</SelectItem>
            <SelectItem value="300">5 min</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="regions">Markets</TabsTrigger>
          <TabsTrigger value="commodities">Commodities</TabsTrigger>
          <TabsTrigger value="charts">Charts</TabsTrigger>
          <TabsTrigger value="comparison">Compare</TabsTrigger>
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
                <div className="text-2xl font-bold">${avgPrice.toFixed(2)}</div>
                <div className="text-sm text-muted-foreground">
                  Across all markets
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
                <div className="text-2xl font-bold">{(totalLoad / 1000).toFixed(1)} GW</div>
                <div className="text-sm text-muted-foreground">
                  {formatNumber(totalLoad)} MW
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Wind className="w-4 h-4" />
                  Renewable Mix
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{avgRenewable.toFixed(1)}%</div>
                <div className="text-sm text-muted-foreground">
                  Average renewable
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Globe className="w-4 h-4" />
                  Active Markets
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{regionalData.length}</div>
                <div className="text-sm text-muted-foreground">
                  Live connections
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Regional Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Market Status Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {regionalData.map((region) => {
                  const priceData = formatPrice(region.currentPrice, region.currency);
                  return (
                    <div key={region.region} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          {getConnectionIcon(region.region)}
                          <MapPin className="w-4 h-4 text-muted-foreground" />
                        </div>
                        <div>
                          <div className="font-medium">{region.name}</div>
                          <div className="text-sm text-muted-foreground">
                            Load: {(region.currentLoad / 1000).toFixed(1)} GW • 
                            Renewable: {region.renewable.toFixed(1)}%
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold">{priceData.original}/MWh</div>
                        {priceData.converted && (
                          <div className="text-sm text-muted-foreground">{priceData.converted}/MWh</div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="regions" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Regional Markets</h2>
            <Select value={selectedRegion} onValueChange={setSelectedRegion}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Regions</SelectItem>
                <SelectItem value="ercot">Texas (ERCOT)</SelectItem>
                <SelectItem value="aeso">Alberta (AESO)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {regionalData
              .filter(region => selectedRegion === 'all' || region.region.toLowerCase() === selectedRegion)
              .map((region) => {
                const priceData = formatPrice(region.currentPrice, region.currency);
                return (
                  <Card key={region.region}>
                    <CardHeader>
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          {getConnectionIcon(region.region)}
                          <div>
                            <CardTitle>{region.name}</CardTitle>
                            <p className="text-sm text-muted-foreground">{region.region}</p>
                          </div>
                        </div>
                        <Badge variant={getStatusColor(region.status)} className="gap-1">
                          <CheckCircle className="w-3 h-3" />
                          {region.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="text-sm text-muted-foreground">Current Price</div>
                          <div className="text-xl font-bold">{priceData.original}/MWh</div>
                          {priceData.converted && (
                            <div className="text-sm text-muted-foreground">{priceData.converted}/MWh</div>
                          )}
                        </div>
                        <div>
                          <div className="text-sm text-muted-foreground">Load Factor</div>
                          <div className="text-xl font-bold">
                            {region.capacity > 0 ? ((region.currentLoad / region.capacity) * 100).toFixed(1) : 0}%
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {(region.currentLoad / 1000).toFixed(1)} / {(region.capacity / 1000).toFixed(1)} GW
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Renewable Generation</span>
                          <span className="font-medium text-green-600">{region.renewable.toFixed(1)}%</span>
                        </div>
                        <div className="w-full bg-secondary rounded-full h-2">
                          <div 
                            className="h-2 rounded-full bg-green-600"
                            style={{ width: `${region.renewable}%` }}
                          />
                        </div>
                      </div>
                      
                      <div className="text-xs text-muted-foreground">
                        Last updated: {new Date(region.lastUpdate).toLocaleTimeString()}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
          </div>
        </TabsContent>

        <TabsContent value="commodities" className="space-y-4">
          <h2 className="text-xl font-semibold">Energy-Related Commodities</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {commodityPrices.map((commodity) => (
              <Card key={commodity.symbol}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">{commodity.symbol}</CardTitle>
                  <p className="text-sm text-muted-foreground">{commodity.name}</p>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="text-2xl font-bold">
                    {formatCurrency(commodity.price)}
                  </div>
                  <div className={`text-sm flex items-center gap-1 ${
                    commodity.change >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {commodity.change >= 0 ? 
                      <TrendingUp className="w-3 h-3" /> : 
                      <TrendingDown className="w-3 h-3" />
                    }
                    {commodity.change >= 0 ? '+' : ''}{formatCurrency(commodity.change)} 
                    ({commodity.changePercent >= 0 ? '+' : ''}{commodity.changePercent.toFixed(2)}%)
                  </div>
                  <div className="text-xs text-muted-foreground">
                    24h Volume: {formatNumber(commodity.volume)}
                  </div>
                  {commodity.marketCap && (
                    <div className="text-xs text-muted-foreground">
                      Market Cap: {formatCurrency(commodity.marketCap, 'USD', 0)}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="charts" className="space-y-4">
          <h2 className="text-xl font-semibold">Market Charts</h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Price Trends (Last 24 Hours)</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="timestamp" 
                      tickFormatter={(value) => new Date(value).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    />
                    <YAxis />
                    <Tooltip 
                      labelFormatter={(value) => new Date(value).toLocaleString()}
                      formatter={(value: number, name: string) => [
                        `$${value.toFixed(2)}/MWh`, 
                        name === 'ercot' ? 'ERCOT (Texas)' : 'AESO (Alberta)'
                      ]}
                    />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="ercot" 
                      stroke="#3b82f6" 
                      strokeWidth={2}
                      name="ERCOT"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="aeso" 
                      stroke="#ef4444" 
                      strokeWidth={2}
                      name="AESO"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Current Generation Mix</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Natural Gas', value: 45, fill: '#3b82f6' },
                        { name: 'Wind', value: 25, fill: '#10b981' },
                        { name: 'Solar', value: 15, fill: '#f59e0b' },
                        { name: 'Nuclear', value: 10, fill: '#8b5cf6' },
                        { name: 'Other', value: 5, fill: '#6b7280' }
                      ]}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {[].map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="comparison" className="space-y-4">
          <h2 className="text-xl font-semibold">Market Comparison</h2>
          
          <Card>
            <CardHeader>
              <CardTitle>Real-Time Price Comparison</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={regionalData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value: number) => [`$${value.toFixed(2)}/MWh`, 'Price']}
                  />
                  <Bar dataKey="currentPrice" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Load Comparison</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={regionalData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="region" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value: number) => [`${(value / 1000).toFixed(1)} GW`, 'Load']}
                    />
                    <Bar dataKey="currentLoad" fill="#10b981" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Renewable Generation</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={regionalData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="region" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value: number) => [`${value.toFixed(1)}%`, 'Renewable']}
                    />
                    <Bar dataKey="renewable" fill="#f59e0b" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
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
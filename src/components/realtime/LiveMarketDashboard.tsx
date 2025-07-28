import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Activity, 
  MapPin, 
  Zap,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Wifi,
  WifiOff,
  AlertCircle,
  DollarSign,
  Gauge,
  Wind
} from 'lucide-react';
import { AESODashboard } from '@/components/power/AESODashboard';
import { ERCOTDashboard } from '@/components/power/ERCOTDashboard';
import { useAESOData } from '@/hooks/useAESOData';
import { useERCOTData } from '@/hooks/useERCOTData';
import { useExchangeRate } from '@/hooks/useExchangeRate';
import { useToast } from '@/hooks/use-toast';

export function LiveMarketDashboard() {
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [autoRefresh, setAutoRefresh] = useState(true);
  
  const aesoData = useAESOData();
  const ercotData = useERCOTData();
  const { exchangeRate, convertToUSD } = useExchangeRate();
  const { toast } = useToast();

  // Auto-refresh data every 30 seconds
  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(() => {
        aesoData.refetch();
        ercotData.refetch();
        setLastUpdate(new Date());
      }, 30000);
      
      return () => clearInterval(interval);
    }
  }, [autoRefresh, aesoData.refetch, ercotData.refetch]);

  const handleManualRefresh = () => {
    aesoData.refetch();
    ercotData.refetch();
    setLastUpdate(new Date());
    toast({
      title: "Data refreshed",
      description: "Market data updated from live sources"
    });
  };

  const getConnectionIcon = (status: string) => {
    switch (status) {
      case 'connected':
        return <Wifi className="w-4 h-4 text-green-500" />;
      case 'fallback':
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      default:
        return <WifiOff className="w-4 h-4 text-red-500" />;
    }
  };

  const formatPrice = (price: number, currency = 'USD') => {
    if (currency === 'CAD' && exchangeRate) {
      return {
        original: `CA$${price.toFixed(2)}`,
        converted: `$${convertToUSD(price).toFixed(2)} USD`
      };
    }
    return {
      original: `$${price.toFixed(2)}`,
      converted: null
    };
  };

  const calculatePriceChange = (current: number, average: number) => {
    const change = current - average;
    const changePercent = (change / average) * 100;
    return { change, changePercent };
  };

  // Calculate summary metrics
  const summaryMetrics = React.useMemo(() => {
    let totalLoad = 0;
    let avgPrice = 0;
    let avgRenewable = 0;
    let connectedMarkets = 0;

    if (ercotData.loadData) {
      totalLoad += ercotData.loadData.current_demand_mw;
      connectedMarkets++;
    }
    if (aesoData.loadData) {
      totalLoad += aesoData.loadData.current_demand_mw;
      connectedMarkets++;
    }

    if (ercotData.pricing && aesoData.pricing) {
      const ercotPriceUSD = ercotData.pricing.current_price;
      const aesoPriceUSD = convertToUSD(aesoData.pricing.current_price);
      avgPrice = (ercotPriceUSD + aesoPriceUSD) / 2;
    } else if (ercotData.pricing) {
      avgPrice = ercotData.pricing.current_price;
    } else if (aesoData.pricing) {
      avgPrice = convertToUSD(aesoData.pricing.current_price);
    }

    if (ercotData.generationMix && aesoData.generationMix) {
      avgRenewable = (ercotData.generationMix.renewable_percentage + aesoData.generationMix.renewable_percentage) / 2;
    } else if (ercotData.generationMix) {
      avgRenewable = ercotData.generationMix.renewable_percentage;
    } else if (aesoData.generationMix) {
      avgRenewable = aesoData.generationMix.renewable_percentage;
    }

    return {
      totalLoad,
      avgPrice,
      avgRenewable,
      connectedMarkets
    };
  }, [ercotData, aesoData, convertToUSD]);

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Live Energy Markets</h1>
          <p className="text-muted-foreground">Real-time data from North American power grids</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleManualRefresh}
            disabled={aesoData.loading || ercotData.loading}
            className="gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${aesoData.loading || ercotData.loading ? 'animate-spin' : ''}`} />
            Refresh All
          </Button>
        </div>
      </div>

      <div className="text-sm text-muted-foreground">
        Last updated: {lastUpdate.toLocaleTimeString()}
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Average Price
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${summaryMetrics.avgPrice.toFixed(2)}</div>
            <div className="text-sm text-muted-foreground">USD/MWh</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Zap className="w-4 h-4" />
              Total Load
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(summaryMetrics.totalLoad / 1000).toFixed(1)} GW</div>
            <div className="text-sm text-muted-foreground">{summaryMetrics.totalLoad.toLocaleString()} MW</div>
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
            <div className="text-2xl font-bold text-green-600">{summaryMetrics.avgRenewable.toFixed(1)}%</div>
            <div className="text-sm text-muted-foreground">Average</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Live Markets
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summaryMetrics.connectedMarkets}</div>
            <div className="text-sm text-muted-foreground">Connected</div>
          </CardContent>
        </Card>
      </div>

      {/* Market Comparison */}
      <Card>
        <CardHeader>
          <CardTitle>Market Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* ERCOT Summary */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-blue-600" />
                  <h3 className="text-lg font-semibold">Texas (ERCOT)</h3>
                  {getConnectionIcon('connected')}
                </div>
                <Badge variant="default">Live Data</Badge>
              </div>
              
              {ercotData.pricing ? (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-muted-foreground">Current Price</div>
                    <div className="text-xl font-bold">${ercotData.pricing.current_price.toFixed(2)}/MWh</div>
                    {(() => {
                      const { change, changePercent } = calculatePriceChange(ercotData.pricing.current_price, ercotData.pricing.average_price);
                      return (
                        <div className={`text-sm flex items-center gap-1 ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {change >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                          {change >= 0 ? '+' : ''}{changePercent.toFixed(1)}%
                        </div>
                      );
                    })()}
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Load</div>
                    <div className="text-xl font-bold">
                      {ercotData.loadData ? (ercotData.loadData.current_demand_mw / 1000).toFixed(1) : 'N/A'} GW
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {ercotData.generationMix ? `${ercotData.generationMix.renewable_percentage.toFixed(1)}% renewable` : ''}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4">
                  <div className="text-muted-foreground">Loading Texas data...</div>
                </div>
              )}
            </div>

            {/* AESO Summary */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-red-600" />
                  <h3 className="text-lg font-semibold">Alberta (AESO)</h3>
                  {getConnectionIcon(aesoData.connectionStatus)}
                </div>
                <Badge variant={aesoData.connectionStatus === 'connected' ? 'default' : 'secondary'}>
                  {aesoData.connectionStatus === 'connected' ? 'Live Data' : 'Simulated'}
                </Badge>
              </div>
              
              {aesoData.pricing ? (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-muted-foreground">Current Price</div>
                    <div className="space-y-1">
                      <div className="text-xl font-bold">CA${aesoData.pricing.current_price.toFixed(2)}/MWh</div>
                      {exchangeRate && (
                        <div className="text-sm text-muted-foreground">
                          ${convertToUSD(aesoData.pricing.current_price).toFixed(2)} USD/MWh
                        </div>
                      )}
                    </div>
                    {(() => {
                      const { change, changePercent } = calculatePriceChange(aesoData.pricing.current_price, aesoData.pricing.average_price);
                      return (
                        <div className={`text-sm flex items-center gap-1 ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {change >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                          {change >= 0 ? '+' : ''}{changePercent.toFixed(1)}%
                        </div>
                      );
                    })()}
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Load</div>
                    <div className="text-xl font-bold">
                      {aesoData.loadData ? (aesoData.loadData.current_demand_mw / 1000).toFixed(1) : 'N/A'} GW
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {aesoData.generationMix ? `${aesoData.generationMix.renewable_percentage.toFixed(1)}% renewable` : ''}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4">
                  <div className="text-muted-foreground">Loading Alberta data...</div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Regional Data */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="texas">Texas (ERCOT)</TabsTrigger>
          <TabsTrigger value="alberta">Alberta (AESO)</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Exchange Rate Info */}
          {exchangeRate && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5" />
                  Currency Exchange
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-lg font-semibold">1 CAD = {exchangeRate.rate.toFixed(4)} USD</div>
                    <div className="text-sm text-muted-foreground">
                      Last updated: {new Date(exchangeRate.lastUpdated).toLocaleString()}
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    This rate is used to convert Alberta prices to USD for comparison
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Market Status Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Market Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span>ERCOT (Texas)</span>
                    <div className="flex items-center gap-2">
                      <Wifi className="w-4 h-4 text-green-500" />
                      <span className="text-sm text-green-600">Live</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>AESO (Alberta)</span>
                    <div className="flex items-center gap-2">
                      {getConnectionIcon(aesoData.connectionStatus)}
                      <span className={`text-sm ${
                        aesoData.connectionStatus === 'connected' ? 'text-green-600' : 'text-yellow-600'
                      }`}>
                        {aesoData.connectionStatus === 'connected' ? 'Live' : 'Simulated'}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Data Sources</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm text-muted-foreground">
                  <div>
                    <strong>ERCOT:</strong> Electric Reliability Council of Texas
                  </div>
                  <div>
                    <strong>AESO:</strong> Alberta Electric System Operator
                  </div>
                  <div>
                    <strong>Exchange Rate:</strong> ECB (European Central Bank)
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="texas">
          <ERCOTDashboard />
        </TabsContent>

        <TabsContent value="alberta">
          <AESODashboard />
        </TabsContent>
      </Tabs>
    </div>
  );
}
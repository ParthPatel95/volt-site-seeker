
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Zap, 
  TrendingUp, 
  Activity,
  Gauge,
  Wind,
  Sun,
  Fuel,
  RefreshCw,
  MapPin,
  DollarSign,
  Wifi,
  WifiOff,
  AlertTriangle,
  Clock,
  BarChart3,
  Signal,
  Power,
  Building
} from 'lucide-react';
import { useAESOData } from '@/hooks/useAESOData';
import { useExchangeRate } from '@/hooks/useExchangeRate';

export function AESODashboard() {
  const { 
    pricing, 
    loadData, 
    generationMix, 
    loading, 
    connectionStatus,
    dataStatus,
    refetch 
  } = useAESOData();

  const { exchangeRate, convertToUSD } = useExchangeRate();

  const getMarketConditionColor = (condition: string) => {
    switch (condition) {
      case 'high_demand': return 'destructive';
      case 'normal': return 'default';
      default: return 'secondary';
    }
  };

  const getConnectionStatusInfo = () => {
    switch (connectionStatus) {
      case 'connected':
        return {
          icon: <Wifi className="w-4 h-4 text-green-500" />,
          text: 'Live AESO Data',
          color: 'text-green-600',
          badge: 'default'
        };
      case 'fallback':
        return {
          icon: <Clock className="w-4 h-4 text-blue-500" />,
          text: dataStatus.errorMessage || 'Live pricing temporarily unavailable',
          color: 'text-blue-600',
          badge: 'secondary'
        };
      case 'error':
        return {
          icon: <AlertTriangle className="w-4 h-4 text-red-500" />,
          text: dataStatus.errorMessage || 'Connection Error',
          color: 'text-red-600',
          badge: 'destructive'
        };
      default:
        return {
          icon: <WifiOff className="w-4 h-4 text-gray-500" />,
          text: 'Connecting...',
          color: 'text-gray-600',
          badge: 'outline'
        };
    }
  };

  const formatPrice = (cadPrice: number) => {
    const usdPrice = convertToUSD(cadPrice);
    return {
      cad: `CA$${cadPrice.toFixed(2)}`,
      usd: `$${usdPrice.toFixed(2)} USD`
    };
  };

  const formatLastUpdate = () => {
    if (!dataStatus.lastUpdate) return '';
    const updateTime = new Date(dataStatus.lastUpdate);
    return `Updated: ${updateTime.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      timeZoneName: 'short'
    })}`;
  };

  const statusInfo = getConnectionStatusInfo();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground flex items-center">
            <MapPin className="w-6 h-6 mr-2 text-red-600" />
            AESO Live Data (Alberta)
            <div className="ml-3 flex items-center space-x-2">
              {statusInfo.icon}
              <Badge variant={statusInfo.badge as any} className="text-xs">
                {dataStatus.isLive ? 'LIVE' : 'FALLBACK'}
              </Badge>
            </div>
          </h2>
          <div className="space-y-1">
            <p className="text-muted-foreground">Real-time Alberta grid operations and electricity market data</p>
            {!dataStatus.isLive && (
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                <span className={statusInfo.color}>{statusInfo.text}</span>
                {dataStatus.lastUpdate && (
                  <span className="text-xs">• {formatLastUpdate()}</span>
                )}
              </p>
            )}
          </div>
        </div>
        <Button 
          onClick={refetch}
          disabled={loading}
          className="bg-gradient-to-r from-red-600 to-red-700"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh Data
        </Button>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="pricing">Pricing</TabsTrigger>
          <TabsTrigger value="generation">Generation</TabsTrigger>
          <TabsTrigger value="system">System</TabsTrigger>
          <TabsTrigger value="markets">Markets</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Key Metrics Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Zap className="w-5 h-5 text-yellow-600" />
                  <span className="text-sm font-medium">Pool Price</span>
                </div>
                <div className="mt-2">
                  <div className="text-2xl font-bold">
                    {pricing ? `CA$${pricing.current_price.toFixed(2)}` : 'Loading...'}
                  </div>
                  <div className="text-sm text-muted-foreground">per MWh</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Gauge className="w-5 h-5 text-blue-600" />
                  <span className="text-sm font-medium">System Load</span>
                </div>
                <div className="mt-2">
                  <div className="text-2xl font-bold">
                    {loadData ? `${(loadData.current_demand_mw / 1000).toFixed(1)} GW` : 'Loading...'}
                  </div>
                  <div className="text-sm text-muted-foreground">Current Demand</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Wind className="w-5 h-5 text-green-600" />
                  <span className="text-sm font-medium">Renewables</span>
                </div>
                <div className="mt-2">
                  <div className="text-2xl font-bold">
                    {generationMix ? `${generationMix.renewable_percentage.toFixed(1)}%` : 'Loading...'}
                  </div>
                  <div className="text-sm text-muted-foreground">Generation Mix</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Activity className="w-5 h-5 text-purple-600" />
                  <span className="text-sm font-medium">Grid Status</span>
                </div>
                <div className="mt-2">
                  <div className="text-2xl font-bold">
                    {dataStatus.isLive ? 'LIVE' : 'FALLBACK'}
                  </div>
                  <div className="text-sm text-muted-foreground">Data Source</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="pricing" className="space-y-6">
          {/* Real-time Pricing */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center">
                  <Zap className="w-5 h-5 mr-2 text-yellow-600" />
                  Real-Time Pool Price
                  {dataStatus.isLive && (
                    <Badge variant="outline" className="ml-2 text-green-600 border-green-600">
                      ✅ LIVE
                    </Badge>
                  )}
                </div>
                {pricing && (
                  <Badge variant="outline" className="text-xs">
                    {formatLastUpdate()}
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {pricing ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">Current Price</p>
                      <div className="space-y-1">
                        <p className="text-2xl font-bold">{formatPrice(pricing.current_price).cad}/MWh</p>
                        <p className="text-lg text-muted-foreground">{formatPrice(pricing.current_price).usd}/MWh</p>
                      </div>
                      <Badge variant={getMarketConditionColor(pricing.market_conditions)}>
                        {pricing.market_conditions.replace('_', ' ').toUpperCase()}
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">Average Price</p>
                      <div className="space-y-1">
                        <p className="text-xl font-semibold">{formatPrice(pricing.average_price).cad}/MWh</p>
                        <p className="text-base text-muted-foreground">{formatPrice(pricing.average_price).usd}/MWh</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">Peak Price</p>
                      <div className="space-y-1">
                        <p className="text-xl font-semibold">{formatPrice(pricing.peak_price).cad}/MWh</p>
                        <p className="text-base text-muted-foreground">{formatPrice(pricing.peak_price).usd}/MWh</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">Off-Peak Price</p>
                      <div className="space-y-1">
                        <p className="text-xl font-semibold">{formatPrice(pricing.off_peak_price).cad}/MWh</p>
                        <p className="text-base text-muted-foreground">{formatPrice(pricing.off_peak_price).usd}/MWh</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Exchange Rate Info */}
                  {exchangeRate && (
                    <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <DollarSign className="w-4 h-4 text-blue-600" />
                          <span className="font-medium">Exchange Rate:</span>
                          <span>1 CAD = {exchangeRate.rate.toFixed(4)} USD</span>
                        </div>
                        <div className="text-muted-foreground">
                          Updated: {new Date(exchangeRate.lastUpdated).toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Activity className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-muted-foreground">Loading pricing data...</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="generation" className="space-y-6">
          {/* Generation Mix */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Activity className="w-5 h-5 mr-2 text-green-600" />
                Generation Mix
                {generationMix && (
                  <Badge variant="outline" className="ml-auto">
                    Updated: {new Date(generationMix.timestamp).toLocaleTimeString()}
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {generationMix ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="flex items-center space-x-2">
                      <Fuel className="w-4 h-4 text-blue-500" />
                      <div>
                        <p className="text-sm text-muted-foreground">Natural Gas</p>
                        <p className="font-semibold">{(generationMix.natural_gas_mw / 1000).toFixed(1)} GW</p>
                        <p className="text-xs text-muted-foreground">{((generationMix.natural_gas_mw / generationMix.total_generation_mw) * 100).toFixed(1)}%</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Wind className="w-4 h-4 text-green-500" />
                      <div>
                        <p className="text-sm text-muted-foreground">Wind</p>
                        <p className="font-semibold">{(generationMix.wind_mw / 1000).toFixed(1)} GW</p>
                        <p className="text-xs text-muted-foreground">{((generationMix.wind_mw / generationMix.total_generation_mw) * 100).toFixed(1)}%</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Sun className="w-4 h-4 text-yellow-500" />
                      <div>
                        <p className="text-sm text-muted-foreground">Solar</p>
                        <p className="font-semibold">{(generationMix.solar_mw / 1000).toFixed(1)} GW</p>
                        <p className="text-xs text-muted-foreground">{((generationMix.solar_mw / generationMix.total_generation_mw) * 100).toFixed(1)}%</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Activity className="w-4 h-4 text-blue-600" />
                      <div>
                        <p className="text-sm text-muted-foreground">Hydro</p>
                        <p className="font-semibold">{(generationMix.hydro_mw / 1000).toFixed(1)} GW</p>
                        <p className="text-xs text-muted-foreground">{((generationMix.hydro_mw / generationMix.total_generation_mw) * 100).toFixed(1)}%</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Fuel className="w-4 h-4 text-gray-600" />
                      <div>
                        <p className="text-sm text-muted-foreground">Coal</p>
                        <p className="font-semibold">{(generationMix.coal_mw / 1000).toFixed(1)} GW</p>
                        <p className="text-xs text-muted-foreground">{((generationMix.coal_mw / generationMix.total_generation_mw) * 100).toFixed(1)}%</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Zap className="w-4 h-4 text-purple-500" />
                      <div>
                        <p className="text-sm text-muted-foreground">Other</p>
                        <p className="font-semibold">{(generationMix.other_mw / 1000).toFixed(1)} GW</p>
                        <p className="text-xs text-muted-foreground">{((generationMix.other_mw / generationMix.total_generation_mw) * 100).toFixed(1)}%</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Renewable Generation</span>
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        {generationMix.renewable_percentage.toFixed(1)}%
                      </Badge>
                    </div>
                    <div className="mt-2 text-xs text-muted-foreground">
                      Total Generation: {(generationMix.total_generation_mw / 1000).toFixed(1)} GW
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Activity className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-muted-foreground">Loading generation data...</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="system" className="space-y-6">
          {/* System Load */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Gauge className="w-5 h-5 mr-2 text-blue-600" />
                System Load & Demand
                {loadData && (
                  <Badge variant="outline" className="ml-auto">
                    Updated: {new Date(loadData.forecast_date).toLocaleTimeString()}
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loadData ? (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Current Demand</p>
                    <p className="text-2xl font-bold">{(loadData.current_demand_mw / 1000).toFixed(1)} GW</p>
                    <p className="text-xs text-muted-foreground">{loadData.current_demand_mw.toFixed(0)} MW</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Peak Forecast</p>
                    <p className="text-xl font-semibold">{(loadData.peak_forecast_mw / 1000).toFixed(1)} GW</p>
                    <p className="text-xs text-muted-foreground">{loadData.peak_forecast_mw.toFixed(0)} MW</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Capacity Margin</p>
                    <p className="text-xl font-semibold">{loadData.capacity_margin.toFixed(1)}%</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Reserve Margin</p>
                    <p className="text-xl font-semibold">{loadData.reserve_margin.toFixed(1)}%</p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <TrendingUp className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-muted-foreground">Loading demand data...</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="markets" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Market Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="w-5 h-5 mr-2 text-purple-600" />
                  Market Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-3 bg-gray-50 dark:bg-gray-900/20 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Market Operator</span>
                      <span className="text-sm">AESO</span>
                    </div>
                  </div>
                  <div className="p-3 bg-gray-50 dark:bg-gray-900/20 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Market Type</span>
                      <span className="text-sm">Energy-Only</span>
                    </div>
                  </div>
                  <div className="p-3 bg-gray-50 dark:bg-gray-900/20 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Settlement Period</span>
                      <span className="text-sm">Hourly</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* API Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Signal className="w-5 h-5 mr-2 text-green-600" />
                  API Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Pool Price API</span>
                    <Badge variant={dataStatus.isLive ? "default" : "secondary"} className={dataStatus.isLive ? "bg-green-100 text-green-800" : ""}>
                      {dataStatus.isLive ? "✅ Live" : "⚠️ Fallback"}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Load Forecast API</span>
                    <Badge variant="secondary">⚠️ Fallback</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Generation API</span>
                    <Badge variant="secondary">⚠️ Fallback</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Last Update</span>
                    <span className="text-sm text-muted-foreground">
                      {dataStatus.lastUpdate ? new Date(dataStatus.lastUpdate).toLocaleTimeString() : 'N/A'}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

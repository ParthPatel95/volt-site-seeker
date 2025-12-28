
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
  AlertCircle
} from 'lucide-react';
import { useAESOData } from '@/hooks/useAESOData';
import { useExchangeRate } from '@/hooks/useExchangeRate';
import { QAStatusIndicator } from '@/components/QAStatusIndicator';

export function AESODashboard() {
  const { 
    pricing, 
    loadData, 
    generationMix, 
    loading, 
    connectionStatus,
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
          color: 'text-green-600'
        };
      case 'cached':
        return {
          icon: <AlertCircle className="w-4 h-4 text-blue-500" />,
          text: 'Cached Data',
          color: 'text-blue-600'
        };
      case 'disconnected':
        return {
          icon: <WifiOff className="w-4 h-4 text-red-500" />,
          text: 'No Data Available',
          color: 'text-red-600'
        };
      default:
        return {
          icon: <WifiOff className="w-4 h-4 text-gray-500" />,
          text: 'Connecting...',
          color: 'text-gray-600'
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
              <span className={`text-sm ${statusInfo.color}`}>
                {statusInfo.text}
              </span>
            </div>
          </h2>
          <p className="text-muted-foreground">Real-time Alberta grid operations and pricing</p>
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

      {/* QA Status Indicators */}
      {pricing && (
        <QAStatusIndicator 
          source="aeso_api"
          qaMetrics={pricing.qa_metadata}
          qaStatus={connectionStatus === 'connected' ? 'success' : 'fallback'}
          timestamp={pricing.timestamp}
        />
      )}

      {/* Connection Status Banner - No Data */}
      {connectionStatus === 'disconnected' && (
        <Card className="border-red-200 bg-red-50 dark:bg-red-900/10">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2 text-red-800 dark:text-red-200">
              <AlertCircle className="w-5 h-5" />
              <p className="text-sm">
                <strong>No Data Available:</strong> Unable to connect to AESO. 
                Please check your connection and try again.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Real-time Pricing */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Zap className="w-5 h-5 mr-2 text-yellow-600" />
            Real-Time Pricing
            {pricing && (
              <Badge variant="outline" className="ml-auto">
                Updated: {new Date(pricing.timestamp).toLocaleTimeString()}
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
    </div>
  );
}

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp,
  TrendingDown, 
  Zap, 
  Activity,
  BarChart3,
  RefreshCw,
  MapPin,
  Wind,
  Sun,
  Fuel,
  Gauge,
  Battery,
  Globe,
  ArrowUpRight,
  ArrowDownRight,
  Clock
} from 'lucide-react';
import { useERCOTData } from '@/hooks/useERCOTData';
import { useAESOData } from '@/hooks/useAESOData';
import { ResponsivePageContainer } from '@/components/ResponsiveContainer';

export const Dashboard = () => {
  const [lastUpdated, setLastUpdated] = useState(new Date());

  // Live data hooks
  const { 
    pricing: ercotPricing, 
    loadData: ercotLoad, 
    generationMix: ercotGeneration,
    loading: ercotLoading 
  } = useERCOTData();

  const { 
    pricing: aesoPricing, 
    loadData: aesoLoad, 
    generationMix: aesoGeneration,
    loading: aesoLoading
  } = useAESOData();
  
  const isLoading = ercotLoading || aesoLoading;

  const refreshData = () => {
    setLastUpdated(new Date());
  };

  // Calculate market insights from real data
  const getMarketTrend = (current: number, average: number) => {
    const diff = ((current - average) / average) * 100;
    return {
      direction: diff > 0 ? 'up' : 'down',
      percentage: Math.abs(diff).toFixed(1),
      color: diff > 0 ? 'text-red-600' : 'text-green-600',
      icon: diff > 0 ? ArrowUpRight : ArrowDownRight
    };
  };

  const getTotalGeneration = () => {
    const ercotTotal = ercotGeneration?.total_generation_mw || 0;
    const aesoTotal = aesoGeneration?.total_generation_mw || 0;
    return (ercotTotal + aesoTotal) / 1000; // Convert to GW
  };

  const getAverageRenewable = () => {
    const ercotRenewable = ercotGeneration?.renewable_percentage || 0;
    const aesoRenewable = aesoGeneration?.renewable_percentage || 0;
    return ((ercotRenewable + aesoRenewable) / 2).toFixed(1);
  };

  if (isLoading) {
    return (
      <ResponsivePageContainer className="min-h-screen bg-gradient-to-br from-background to-muted/20">
        <div className="space-y-6">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-muted rounded w-1/3"></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-muted/50 rounded-lg"></div>
              ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="h-96 bg-muted/50 rounded-lg"></div>
              <div className="h-96 bg-muted/50 rounded-lg"></div>
            </div>
          </div>
        </div>
      </ResponsivePageContainer>
    );
  }

  return (
    <ResponsivePageContainer className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              Energy Market Dashboard
            </h1>
            <p className="text-muted-foreground mt-1 flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Last updated: {lastUpdated.toLocaleTimeString()}
            </p>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={refreshData}
            className="flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh Data
          </Button>
        </div>

        {/* Key Metrics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* ERCOT Price Card */}
          <Card className="border-l-4 border-l-blue-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">ERCOT Price</p>
                  <p className="text-2xl font-bold text-foreground">
                    {ercotPricing ? `$${ercotPricing.current_price.toFixed(2)}` : '--'}
                  </p>
                  <p className="text-xs text-muted-foreground">per MWh</p>
                  {ercotPricing && (
                    <div className="flex items-center gap-1 mt-1">
                      {(() => {
                        const trend = getMarketTrend(ercotPricing.current_price, ercotPricing.average_price);
                        const Icon = trend.icon;
                        return (
                          <>
                            <Icon className={`w-3 h-3 ${trend.color}`} />
                            <span className={`text-xs ${trend.color}`}>
                              {trend.percentage}% vs avg
                            </span>
                          </>
                        );
                      })()}
                    </div>
                  )}
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <Zap className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* AESO Price Card */}
          <Card className="border-l-4 border-l-red-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">AESO Price</p>
                  <p className="text-2xl font-bold text-foreground">
                    {aesoPricing ? `CA$${aesoPricing.current_price.toFixed(2)}` : '--'}
                  </p>
                  <p className="text-xs text-muted-foreground">per MWh</p>
                  {aesoPricing && (
                    <div className="flex items-center gap-1 mt-1">
                      {(() => {
                        const trend = getMarketTrend(aesoPricing.current_price, aesoPricing.average_price);
                        const Icon = trend.icon;
                        return (
                          <>
                            <Icon className={`w-3 h-3 ${trend.color}`} />
                            <span className={`text-xs ${trend.color}`}>
                              {trend.percentage}% vs avg
                            </span>
                          </>
                        );
                      })()}
                    </div>
                  )}
                </div>
                <div className="p-3 bg-red-100 rounded-full">
                  <Globe className="w-6 h-6 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Total Generation */}
          <Card className="border-l-4 border-l-green-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Generation</p>
                  <p className="text-2xl font-bold text-foreground">
                    {getTotalGeneration().toFixed(1)} GW
                  </p>
                  <p className="text-xs text-muted-foreground">Combined regions</p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <Activity className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Renewable Percentage */}
          <Card className="border-l-4 border-l-emerald-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Renewable Mix</p>
                  <p className="text-2xl font-bold text-foreground">
                    {getAverageRenewable()}%
                  </p>
                  <p className="text-xs text-muted-foreground">Average renewable</p>
                </div>
                <div className="p-3 bg-emerald-100 rounded-full">
                  <Wind className="w-6 h-6 text-emerald-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Live Market Data Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* ERCOT Detailed Card */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-blue-600" />
                ERCOT (Texas)
                {ercotLoading && (
                  <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                )}
                <Badge variant={ercotPricing?.market_conditions === 'normal' ? 'default' : 'secondary'} className="ml-auto">
                  {ercotPricing?.market_conditions || 'Loading...'}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Pricing */}
              {ercotPricing && (
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-muted/50 p-3 rounded-lg">
                    <p className="text-sm font-medium text-muted-foreground">Current</p>
                    <p className="text-lg font-bold">${ercotPricing.current_price.toFixed(2)}</p>
                  </div>
                  <div className="bg-muted/50 p-3 rounded-lg">
                    <p className="text-sm font-medium text-muted-foreground">Peak</p>
                    <p className="text-lg font-bold text-red-600">${ercotPricing.peak_price.toFixed(2)}</p>
                  </div>
                </div>
              )}

              {/* Load Information */}
              {ercotLoad && (
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">System Load</span>
                    <span className="font-bold">{(ercotLoad.current_demand_mw / 1000).toFixed(1)} GW</span>
                  </div>
                  <Progress 
                    value={(ercotLoad.current_demand_mw / ercotLoad.peak_forecast_mw) * 100} 
                    className="h-3"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Current</span>
                    <span>Peak: {(ercotLoad.peak_forecast_mw / 1000).toFixed(1)} GW</span>
                  </div>
                </div>
              )}

              {/* Generation Mix */}
              {ercotGeneration && (
                <div className="space-y-3">
                  <p className="text-sm font-medium">Generation Mix</p>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Fuel className="w-4 h-4 text-blue-500" />
                      <span>Gas: {((ercotGeneration.natural_gas_mw / ercotGeneration.total_generation_mw) * 100).toFixed(0)}%</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Wind className="w-4 h-4 text-green-500" />
                      <span>Wind: {((ercotGeneration.wind_mw / ercotGeneration.total_generation_mw) * 100).toFixed(0)}%</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Sun className="w-4 h-4 text-yellow-500" />
                      <span>Solar: {((ercotGeneration.solar_mw / ercotGeneration.total_generation_mw) * 100).toFixed(0)}%</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Battery className="w-4 h-4 text-purple-500" />
                      <span>Nuclear: {((ercotGeneration.nuclear_mw / ercotGeneration.total_generation_mw) * 100).toFixed(0)}%</span>
                    </div>
                  </div>
                  <div className="bg-green-50 p-2 rounded border border-green-200">
                    <p className="text-sm font-medium text-green-700">
                      Renewable: {ercotGeneration.renewable_percentage.toFixed(1)}%
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* AESO Detailed Card */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-red-600" />
                AESO (Alberta)
                {aesoLoading && (
                  <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                )}
                <Badge variant={aesoPricing?.market_conditions === 'low' ? 'default' : 'secondary'} className="ml-auto">
                  {aesoPricing?.market_conditions || 'Loading...'}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Pricing */}
              {aesoPricing ? (
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-muted/50 p-3 rounded-lg">
                    <p className="text-sm font-medium text-muted-foreground">Current</p>
                    <p className="text-lg font-bold">CA${aesoPricing.current_price.toFixed(2)}</p>
                  </div>
                  <div className="bg-muted/50 p-3 rounded-lg">
                    <p className="text-sm font-medium text-muted-foreground">Peak</p>
                    <p className="text-lg font-bold text-red-600">CA${aesoPricing.peak_price.toFixed(2)}</p>
                  </div>
                </div>
              ) : (
                <div className="bg-amber-50 p-3 rounded-lg border border-amber-200">
                  <p className="text-sm text-amber-700">Pricing data temporarily unavailable</p>
                </div>
              )}

              {/* Load Information */}
              {aesoLoad && (
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">System Load</span>
                    <span className="font-bold">{(aesoLoad.current_demand_mw / 1000).toFixed(1)} GW</span>
                  </div>
                  <Progress 
                    value={(aesoLoad.current_demand_mw / aesoLoad.peak_forecast_mw) * 100} 
                    className="h-3"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Current</span>
                    <span>Peak: {(aesoLoad.peak_forecast_mw / 1000).toFixed(1)} GW</span>
                  </div>
                </div>
              )}

              {/* Generation Mix */}
              {aesoGeneration && (
                <div className="space-y-3">
                  <p className="text-sm font-medium">Generation Mix</p>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Fuel className="w-4 h-4 text-blue-500" />
                      <span>Gas: {((aesoGeneration.natural_gas_mw / aesoGeneration.total_generation_mw) * 100).toFixed(0)}%</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Activity className="w-4 h-4 text-blue-600" />
                      <span>Hydro: {((aesoGeneration.hydro_mw / aesoGeneration.total_generation_mw) * 100).toFixed(0)}%</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Wind className="w-4 h-4 text-green-500" />
                      <span>Wind: {((aesoGeneration.wind_mw / aesoGeneration.total_generation_mw) * 100).toFixed(0)}%</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Gauge className="w-4 h-4 text-gray-500" />
                      <span>Coal: {((aesoGeneration.coal_mw / aesoGeneration.total_generation_mw) * 100).toFixed(0)}%</span>
                    </div>
                  </div>
                  <div className="bg-green-50 p-2 rounded border border-green-200">
                    <p className="text-sm font-medium text-green-700">
                      Renewable: {aesoGeneration.renewable_percentage.toFixed(1)}%
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Market Insights */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Market Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-muted/30 rounded-lg">
                <p className="text-lg font-bold text-foreground">
                  {((ercotLoad?.current_demand_mw || 0) + (aesoLoad?.current_demand_mw || 0)) / 1000}
                </p>
                <p className="text-sm text-muted-foreground">Combined Load (GW)</p>
              </div>
              <div className="text-center p-4 bg-muted/30 rounded-lg">
                <p className="text-lg font-bold text-foreground">
                  {ercotPricing && aesoPricing ? 
                    `$${((ercotPricing.current_price + aesoPricing.current_price) / 2).toFixed(2)}` : 
                    '--'
                  }
                </p>
                <p className="text-sm text-muted-foreground">Avg Price (USD/MWh)</p>
              </div>
              <div className="text-center p-4 bg-muted/30 rounded-lg">
                <p className="text-lg font-bold text-green-600">
                  {getAverageRenewable()}%
                </p>
                <p className="text-sm text-muted-foreground">Renewable Generation</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </ResponsivePageContainer>
  );
};

export default Dashboard;
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
import { ResponsivePageContainer, ResponsiveSection } from '@/components/ResponsiveContainer';

export const Dashboard = () => {
  const [lastUpdated, setLastUpdated] = useState(new Date());

  // Live data hooks with refetch functionality
  const { 
    pricing: ercotPricing, 
    loadData: ercotLoad, 
    generationMix: ercotGeneration,
    loading: ercotLoading,
    refetch: refetchERCOT
  } = useERCOTData();

  const { 
    pricing: aesoPricing, 
    loadData: aesoLoad, 
    generationMix: aesoGeneration,
    loading: aesoLoading,
    refetch: refetchAESO
  } = useAESOData();
  
  const isLoading = ercotLoading || aesoLoading;

  const refreshData = async () => {
    setLastUpdated(new Date());
    await Promise.all([refetchERCOT(), refetchAESO()]);
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
    <ResponsivePageContainer className="min-h-screen bg-gradient-to-br from-background to-watt-light/10">
      <div className="space-y-6 animate-fade-in">
        {/* Header with Wattbytes Branding */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-2">
            <h1 className="text-3xl sm:text-4xl font-bold bg-watt-gradient bg-clip-text text-transparent">
              WattBytes Energy Dashboard
            </h1>
            <p className="text-muted-foreground flex items-center gap-2 text-sm sm:text-base">
              <Clock className="w-4 h-4" />
              Last updated: {lastUpdated.toLocaleTimeString()}
            </p>
          </div>
          <Button 
            onClick={refreshData}
            disabled={isLoading}
            className="bg-watt-primary hover:bg-watt-primary/90 text-white shadow-watt-glow transition-all duration-300 hover:shadow-lg"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            {isLoading ? 'Refreshing...' : 'Refresh Data'}
          </Button>
        </div>

        {/* Key Metrics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {/* ERCOT Price Card */}
          <Card className="border-l-4 border-watt-primary hover:shadow-lg transition-all duration-300 group">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-muted-foreground">ERCOT Price</p>
                  <p className="text-2xl sm:text-3xl font-bold text-foreground">
                    {ercotPricing ? `$${ercotPricing.current_price.toFixed(2)}` : (
                      <span className="text-muted-foreground">Loading...</span>
                    )}
                  </p>
                  <p className="text-xs text-muted-foreground">per MWh</p>
                  {ercotPricing && (
                    <div className="flex items-center gap-1 mt-2">
                      {(() => {
                        const trend = getMarketTrend(ercotPricing.current_price, ercotPricing.average_price);
                        const Icon = trend.icon;
                        return (
                          <>
                            <Icon className={`w-3 h-3 ${trend.direction === 'up' ? 'text-watt-warning' : 'text-watt-success'}`} />
                            <span className={`text-xs font-medium ${trend.direction === 'up' ? 'text-watt-warning' : 'text-watt-success'}`}>
                              {trend.percentage}% vs avg
                            </span>
                          </>
                        );
                      })()}
                    </div>
                  )}
                </div>
                <div className="p-3 bg-watt-primary/10 rounded-xl group-hover:bg-watt-primary/20 transition-colors">
                  <Zap className="w-6 h-6 text-watt-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* AESO Price Card */}
          <Card className="border-l-4 border-watt-secondary hover:shadow-lg transition-all duration-300 group">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-muted-foreground">AESO Price</p>
                  <p className="text-2xl sm:text-3xl font-bold text-foreground">
                    {aesoPricing ? `CA$${aesoPricing.current_price.toFixed(2)}` : (
                      <span className="text-muted-foreground">Loading...</span>
                    )}
                  </p>
                  <p className="text-xs text-muted-foreground">per MWh</p>
                  {aesoPricing && (
                    <div className="flex items-center gap-1 mt-2">
                      {(() => {
                        const trend = getMarketTrend(aesoPricing.current_price, aesoPricing.average_price);
                        const Icon = trend.icon;
                        return (
                          <>
                            <Icon className={`w-3 h-3 ${trend.direction === 'up' ? 'text-watt-warning' : 'text-watt-success'}`} />
                            <span className={`text-xs font-medium ${trend.direction === 'up' ? 'text-watt-warning' : 'text-watt-success'}`}>
                              {trend.percentage}% vs avg
                            </span>
                          </>
                        );
                      })()}
                    </div>
                  )}
                </div>
                <div className="p-3 bg-watt-secondary/10 rounded-xl group-hover:bg-watt-secondary/20 transition-colors">
                  <Globe className="w-6 h-6 text-watt-secondary" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Total Generation */}
          <Card className="border-l-4 border-watt-success hover:shadow-lg transition-all duration-300 group">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-muted-foreground">Total Generation</p>
                  <p className="text-2xl sm:text-3xl font-bold text-foreground">
                    {(ercotGeneration && aesoGeneration) ? 
                      `${getTotalGeneration().toFixed(1)} GW` : 
                      <span className="text-muted-foreground">Loading...</span>
                    }
                  </p>
                  <p className="text-xs text-muted-foreground">Combined regions</p>
                </div>
                <div className="p-3 bg-watt-success/10 rounded-xl group-hover:bg-watt-success/20 transition-colors">
                  <Activity className="w-6 h-6 text-watt-success" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Renewable Percentage */}
          <Card className="border-l-4 border-watt-accent hover:shadow-lg transition-all duration-300 group">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-muted-foreground">Renewable Mix</p>
                  <p className="text-2xl sm:text-3xl font-bold text-foreground">
                    {(ercotGeneration && aesoGeneration) ? 
                      `${getAverageRenewable()}%` : 
                      <span className="text-muted-foreground">Loading...</span>
                    }
                  </p>
                  <p className="text-xs text-muted-foreground">Average renewable</p>
                </div>
                <div className="p-3 bg-watt-accent/10 rounded-xl group-hover:bg-watt-accent/20 transition-colors">
                  <Wind className="w-6 h-6 text-watt-accent" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Live Market Data Grid */}
        <ResponsiveSection>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* ERCOT Detailed Card */}
            <Card className="hover:shadow-lg transition-all duration-300 border-watt-primary/20">
              <CardHeader className="pb-3 bg-gradient-to-r from-watt-primary/5 to-transparent">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <MapPin className="w-5 h-5 text-watt-primary" />
                  <span className="text-watt-primary font-bold">ERCOT (Texas)</span>
                  {ercotLoading && (
                    <div className="w-4 h-4 border-2 border-watt-primary border-t-transparent rounded-full animate-spin" />
                  )}
                  <Badge 
                    variant={ercotPricing?.market_conditions === 'normal' ? 'default' : 'secondary'} 
                    className="ml-auto bg-watt-primary/10 text-watt-primary border-watt-primary/20"
                  >
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
            <Card className="hover:shadow-lg transition-all duration-300 border-watt-secondary/20">
              <CardHeader className="pb-3 bg-gradient-to-r from-watt-secondary/5 to-transparent">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <MapPin className="w-5 h-5 text-watt-secondary" />
                  <span className="text-watt-secondary font-bold">AESO (Alberta)</span>
                  {aesoLoading && (
                    <div className="w-4 h-4 border-2 border-watt-secondary border-t-transparent rounded-full animate-spin" />
                  )}
                  <Badge 
                    variant={aesoPricing?.market_conditions === 'low' ? 'default' : 'secondary'} 
                    className="ml-auto bg-watt-secondary/10 text-watt-secondary border-watt-secondary/20"
                  >
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
        </ResponsiveSection>

        {/* Market Insights */}
        <Card className="hover:shadow-lg transition-all duration-300 border-watt-primary/10">
          <CardHeader className="bg-gradient-to-r from-watt-primary/5 to-watt-secondary/5">
            <CardTitle className="flex items-center gap-2 text-xl">
              <BarChart3 className="w-5 h-5 text-watt-primary" />
              <span className="bg-watt-gradient bg-clip-text text-transparent">Market Insights</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-6 bg-gradient-to-br from-watt-primary/10 to-watt-primary/5 rounded-xl border border-watt-primary/20">
                <p className="text-2xl font-bold text-watt-primary">
                  {(ercotLoad && aesoLoad) ? 
                    `${(((ercotLoad.current_demand_mw || 0) + (aesoLoad.current_demand_mw || 0)) / 1000).toFixed(1)} GW` : 
                    'Loading...'
                  }
                </p>
                <p className="text-sm text-muted-foreground mt-1">Combined Load</p>
              </div>
              <div className="text-center p-6 bg-gradient-to-br from-watt-secondary/10 to-watt-secondary/5 rounded-xl border border-watt-secondary/20">
                <p className="text-2xl font-bold text-watt-secondary">
                  {ercotPricing && aesoPricing ? 
                    `$${((ercotPricing.current_price + aesoPricing.current_price) / 2).toFixed(2)}` : 
                    'Loading...'
                  }
                </p>
                <p className="text-sm text-muted-foreground mt-1">Avg Price (USD/MWh)</p>
              </div>
              <div className="text-center p-6 bg-gradient-to-br from-watt-success/10 to-watt-success/5 rounded-xl border border-watt-success/20">
                <p className="text-2xl font-bold text-watt-success">
                  {(ercotGeneration && aesoGeneration) ? 
                    `${getAverageRenewable()}%` : 
                    'Loading...'
                  }
                </p>
                <p className="text-sm text-muted-foreground mt-1">Renewable Generation</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </ResponsivePageContainer>
  );
};

export default Dashboard;
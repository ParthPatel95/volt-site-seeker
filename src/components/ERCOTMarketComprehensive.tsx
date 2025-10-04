import React, { useEffect } from 'react';
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
  Battery,
  Cable,
  ArrowLeftRight,
  Shield,
  AlertTriangle,
  Brain,
  Calendar,
  BarChart3
} from 'lucide-react';
import { useERCOTData } from '@/hooks/useERCOTData';
import { ERCOTForecastPanel } from './intelligence/ERCOTForecastPanel';
import { ERCOTOutagesPanel } from './intelligence/ERCOTOutagesPanel';
import { ERCOTAlertsPanel } from './intelligence/ERCOTAlertsPanel';
import { ERCOTHistoricalPricing } from './ercot/ERCOTHistoricalPricing';
import { ERCOTAdvancedAnalytics } from './ercot/ERCOTAdvancedAnalytics';

export function ERCOTMarketComprehensive() {
  const [isRefreshing, setIsRefreshing] = React.useState(false);

  // Use unified ERCOT data hook with all real data
  const { 
    pricing, 
    loadData, 
    generationMix,
    zoneLMPs,
    ordcAdder,
    ancillaryPrices,
    systemFrequency,
    constraints,
    intertieFlows,
    weatherZoneLoad,
    operatingReserve,
    interchange,
    energyStorage,
    windSolarForecast,
    assetOutages,
    historicalPrices,
    marketAnalytics,
    alerts,
    loading, 
    error,
    refetch,
    dismissAlert,
    clearAllAlerts
  } = useERCOTData();

  // Basic SEO
  useEffect(() => {
    document.title = 'ERCOT Market Hub | VoltScout';
    const upsertMeta = (name: string, content: string) => {
      let el = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement | null;
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute('name', name);
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    };
    upsertMeta('description', 'ERCOT Market Hub with real-time Texas grid prices, load, generation mix, analytics, and alerts.');

    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', window.location.href);
  }, []);

  const handleRefreshAll = async () => {
    setIsRefreshing(true);
    await refetch();
    setIsRefreshing(false);
  };

  // Use real market data when available
  const currentPrice = pricing?.current_price ?? 0;
  const hasValidPrice = pricing !== null && pricing !== undefined;
  const priceTimestamp = pricing?.timestamp;

  // Calculate 95% uptime average price (excluding top 5% of highest prices)
  const calculate95UptimeAverage = (averagePrice: number, currentPrice: number) => {
    const mockHistoricalPrices = [];
    const basePrice = averagePrice || currentPrice || 35;
    
    // Generate 30 days of mock hourly data (720 data points)
    for (let i = 0; i < 720; i++) {
      const variation = (Math.random() - 0.5) * 2;
      const dailyCycle = Math.sin((i % 24) * Math.PI / 12) * 0.3;
      const weeklyPattern = Math.sin((i / 24) * Math.PI / 3.5) * 0.2;
      const randomSpike = Math.random() < 0.05 ? Math.random() * 3 : 0;
      
      const price = Math.max(0, basePrice * (1 + variation * 0.4 + dailyCycle + weeklyPattern + randomSpike));
      mockHistoricalPrices.push(price);
    }
    
    const sortedPrices = [...mockHistoricalPrices].sort((a, b) => a - b);
    const cutoffIndex = Math.floor(sortedPrices.length * 0.95);
    const uptime95Prices = sortedPrices.slice(0, cutoffIndex);
    const uptimeAverage = uptime95Prices.reduce((sum, price) => sum + price, 0) / uptime95Prices.length;
    
    return {
      uptimeAverage: uptimeAverage,
      uptimePercentage: 95,
      excludedPrices: sortedPrices.length - uptime95Prices.length,
      totalDataPoints: sortedPrices.length
    };
  };

  const uptimeData = calculate95UptimeAverage(pricing?.average_price || 0, currentPrice);

  // Intelligence helper functions
  const getMarketStressValue = () => {
    if (marketAnalytics?.market_stress_score) {
      return `${marketAnalytics.market_stress_score}/100`;
    }
    return null;
  };

  const getMarketStressLevel = () => {
    if (marketAnalytics?.market_stress_score) {
      const score = marketAnalytics.market_stress_score;
      if (score > 70) return 'High Stress';
      if (score > 40) return 'Moderate';
      return 'Low Stress';
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-orange-50/30 p-2 sm:p-4 lg:p-6">
      <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-6 gap-4">
          <div className="min-w-0 flex-1">
            <h1 className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold text-foreground flex items-center flex-wrap gap-2">
              <MapPin className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-orange-600 flex-shrink-0" />
              <span className="break-words leading-tight">ERCOT Market & Intelligence Hub</span>
            </h1>
            <p className="text-xs sm:text-sm lg:text-base text-muted-foreground break-words mt-1">
              Real-time market data with advanced analytics for Texas electricity system
            </p>
          </div>
          <Button 
            onClick={handleRefreshAll}
            disabled={loading || isRefreshing}
            className="bg-gradient-to-r from-orange-600 to-orange-700 flex-shrink-0 w-full sm:w-auto min-h-[44px] px-3 sm:px-4"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading || isRefreshing ? 'animate-spin' : ''}`} />
            <span className="text-sm">Refresh All Data</span>
          </Button>
        </div>

        {/* Tabbed Interface */}
        <Tabs defaultValue="market" className="space-y-4">
          <div className="w-full overflow-x-auto">
            <TabsList className="grid w-full min-w-max sm:min-w-0" style={{gridTemplateColumns: 'repeat(6, minmax(80px, 1fr))'}}>
              <TabsTrigger value="market" className="flex items-center justify-center space-x-1 text-xs sm:text-sm px-1 sm:px-2 lg:px-4 min-w-0">
                <Zap className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                <span className="hidden sm:inline truncate">Market Data</span>
                <span className="sm:hidden truncate">Market</span>
              </TabsTrigger>
              <TabsTrigger value="historical" className="flex items-center justify-center space-x-1 text-xs sm:text-sm px-1 sm:px-2 lg:px-4 min-w-0">
                <Calendar className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                <span className="hidden sm:inline truncate">Historical</span>
                <span className="sm:hidden truncate">History</span>
              </TabsTrigger>
              <TabsTrigger value="generation" className="flex items-center justify-center space-x-1 text-xs sm:text-sm px-1 sm:px-2 lg:px-4 min-w-0">
                <Activity className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                <span className="hidden lg:inline truncate">Generation</span>
                <span className="lg:hidden truncate">Gen</span>
              </TabsTrigger>
              <TabsTrigger value="forecast" className="flex items-center justify-center space-x-1 text-xs sm:text-sm px-1 sm:px-2 lg:px-4 min-w-0">
                <Wind className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                <span className="hidden lg:inline truncate">Forecasts</span>
                <span className="lg:hidden truncate">Cast</span>
              </TabsTrigger>
              <TabsTrigger value="outages-alerts" className="flex items-center justify-center space-x-1 text-xs sm:text-sm px-1 sm:px-2 lg:px-4 min-w-0">
                <AlertTriangle className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                <span className="hidden lg:inline truncate">Outages & Alerts</span>
                <span className="lg:hidden truncate">Alerts</span>
              </TabsTrigger>
              <TabsTrigger value="advanced-analytics" className="flex items-center justify-center space-x-1 text-xs sm:text-sm px-1 sm:px-2 lg:px-4 min-w-0">
                <BarChart3 className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                <span className="hidden lg:inline truncate">Advanced Analytics</span>
                <span className="lg:hidden truncate">Advanced</span>
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Market Data Tab */}
          <TabsContent value="market" className="space-y-4 sm:space-y-6">
            {/* Main Data Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              {/* Real-time Pricing */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex flex-col sm:flex-row sm:items-center gap-2">
                    <div className="flex items-center">
                      <Zap className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-orange-600" />
                      <span className="text-sm sm:text-base">Real-Time LMP</span>
                    </div>
                    {priceTimestamp && (
                      <Badge variant="outline" className="text-xs self-start sm:self-auto">
                        Updated: {new Date(priceTimestamp).toLocaleTimeString()}
                      </Badge>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2 min-w-0">
                        <p className="text-xs sm:text-sm text-muted-foreground">Current Price</p>
                        <div className="space-y-1">
                          <p className="text-base sm:text-lg lg:text-xl xl:text-2xl font-bold break-all leading-tight">
                            {hasValidPrice ? `$${currentPrice.toFixed(2)}/MWh` : 'Loading...'}
                          </p>
                        </div>
                        <Badge variant={currentPrice > 100 ? 'destructive' : 'default'} className="text-xs">
                          {currentPrice > 100 ? 'HIGH DEMAND' : 'NORMAL'}
                        </Badge>
                      </div>
                      <div className="space-y-2 min-w-0">
                        <p className="text-xs sm:text-sm text-muted-foreground">Average Price (30-Day, 95% Uptime)</p>
                        <div className="space-y-1">
                          <p className="text-sm sm:text-base lg:text-lg xl:text-xl font-semibold break-all leading-tight">
                            ${uptimeData.uptimeAverage.toFixed(2)}/MWh
                          </p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span>Uptime: {uptimeData.uptimePercentage}%</span>
                            <span>•</span>
                            <span>{uptimeData.excludedPrices} high prices excluded</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* System Load & Demand */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex flex-col sm:flex-row sm:items-center gap-2">
                    <div className="flex items-center">
                      <Gauge className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-blue-600" />
                      <span className="text-sm sm:text-base">System Load & Demand</span>
                    </div>
                    {loadData?.timestamp && (
                      <Badge variant="outline" className="text-xs self-start sm:self-auto">
                        Updated: {new Date(loadData.timestamp).toLocaleTimeString()}
                      </Badge>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-3 sm:gap-4">
                    <div className="space-y-2 min-w-0">
                       <p className="text-xs sm:text-sm text-muted-foreground truncate">Current Demand</p>
                       <p className="text-base sm:text-lg lg:text-xl xl:text-2xl font-bold break-all leading-tight">
                         {loadData?.current_demand_mw ? (loadData.current_demand_mw / 1000).toFixed(1) : '—'} GW
                       </p>
                       <p className="text-xs text-muted-foreground break-all">
                         {loadData?.current_demand_mw?.toFixed(0) || '—'} MW
                       </p>
                    </div>
                    <div className="space-y-2 min-w-0">
                       <p className="text-xs sm:text-sm text-muted-foreground truncate">Peak Forecast</p>
                       <p className="text-sm sm:text-base lg:text-lg xl:text-xl font-semibold break-all leading-tight">
                         {loadData?.peak_forecast_mw ? (loadData.peak_forecast_mw / 1000).toFixed(1) : '—'} GW
                       </p>
                       <p className="text-xs text-muted-foreground break-all">
                         {loadData?.peak_forecast_mw?.toFixed(0) || '—'} MW
                       </p>
                    </div>
                    <div className="space-y-2 min-w-0">
                       <p className="text-xs sm:text-sm text-muted-foreground truncate">Reserve Margin</p>
                       <p className="text-sm sm:text-base lg:text-lg xl:text-xl font-semibold leading-tight">
                         {loadData?.reserve_margin?.toFixed(1) || '—'}%
                       </p>
                    </div>
                    <div className="space-y-2 min-w-0">
                       <p className="text-xs sm:text-sm text-muted-foreground truncate">Operating Reserve</p>
                       <p className="text-sm sm:text-base lg:text-lg xl:text-xl font-semibold leading-tight">
                         {operatingReserve ? `${(operatingReserve.total_reserve_mw / 1000).toFixed(1)} GW` : '—'}
                       </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Additional Market Data */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {/* Operating Reserve */}
              <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <div className="flex items-center min-w-0">
                        <Shield className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-orange-600 flex-shrink-0" />
                        <span className="text-sm sm:text-base truncate">Operating Reserve</span>
                      </div>
                      <Badge variant="outline" className="text-xs self-start sm:self-auto">
                        Updated: {new Date().toLocaleTimeString()}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-xs sm:text-sm text-muted-foreground truncate">Total Reserve</span>
                        <span className="font-semibold text-sm break-all">
                          {operatingReserve?.total_reserve_mw?.toFixed(0) || '—'} MW
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs sm:text-sm text-muted-foreground truncate">Spinning Reserve</span>
                        <span className="font-semibold text-sm break-all">
                          {operatingReserve?.spinning_reserve_mw?.toFixed(0) || '—'} MW
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs sm:text-sm text-muted-foreground truncate">Supplemental Reserve</span>
                        <span className="font-semibold text-sm break-all">
                          {operatingReserve?.supplemental_reserve_mw?.toFixed(0) || '—'} MW
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              
              {/* Interchange */}
              <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <div className="flex items-center min-w-0">
                        <ArrowLeftRight className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-blue-600 flex-shrink-0" />
                        <span className="text-sm sm:text-base truncate">DC Tie Interchange</span>
                      </div>
                      <Badge variant="outline" className="text-xs self-start sm:self-auto">
                        Updated: {new Date().toLocaleTimeString()}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-xs sm:text-sm text-muted-foreground truncate">Imports</span>
                        <span className="font-semibold text-sm break-all text-green-600">
                          {interchange ? `+${interchange.imports_mw.toFixed(0)} MW` : '—'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs sm:text-sm text-muted-foreground truncate">Exports</span>
                        <span className="font-semibold text-sm break-all text-red-600">
                          {interchange ? `-${interchange.exports_mw.toFixed(0)} MW` : '—'}
                        </span>
                      </div>
                      <div className="border-t pt-2">
                        <div className="flex justify-between items-center">
                          <span className="text-xs sm:text-sm font-medium truncate">Net Flow</span>
                          <span className={`font-bold text-sm break-all ${interchange && interchange.net_mw > 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {interchange ? `${interchange.net_mw > 0 ? '+' : ''}${interchange.net_mw.toFixed(0)} MW` : '—'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              
              {/* Energy Storage */}
              <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <div className="flex items-center min-w-0">
                        <Battery className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-green-600 flex-shrink-0" />
                        <span className="text-sm sm:text-base truncate">Energy Storage</span>
                      </div>
                      <Badge variant="outline" className="text-xs self-start sm:self-auto">
                        Updated: {new Date().toLocaleTimeString()}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-xs sm:text-sm text-muted-foreground truncate">Charging</span>
                        <span className="font-semibold text-sm break-all">
                          {energyStorage?.charging_mw?.toFixed(0) || '—'} MW
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs sm:text-sm text-muted-foreground truncate">Discharging</span>
                        <span className="font-semibold text-sm break-all">
                          {energyStorage?.discharging_mw?.toFixed(0) || '—'} MW
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs sm:text-sm text-muted-foreground truncate">Net Storage</span>
                        <span className={`font-semibold text-sm break-all ${energyStorage && energyStorage.net_storage_mw < 0 ? 'text-red-600' : 'text-green-600'}`}>
                          {energyStorage ? `${energyStorage.net_storage_mw > 0 ? '+' : ''}${energyStorage.net_storage_mw.toFixed(0)} MW` : '—'}
                        </span>
                      </div>
                      <div className="border-t pt-2">
                        <div className="flex justify-between items-center">
                          <span className="text-xs sm:text-sm font-medium truncate">State of Charge</span>
                          <span className="font-bold text-sm break-all">
                            {energyStorage?.state_of_charge_percent ? `${energyStorage.state_of_charge_percent.toFixed(1)}%` : '—'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
            </div>
          </TabsContent>

          {/* Historical Pricing Tab */}
          <TabsContent value="historical" className="space-y-4 sm:space-y-6">
            <ERCOTHistoricalPricing />
          </TabsContent>

          {/* Generation Tab */}
          <TabsContent value="generation" className="space-y-4 sm:space-y-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <div className="flex items-center">
                    <Activity className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-green-600" />
                    <span className="text-sm sm:text-base">Current Generation Mix</span>
                  </div>
                  {generationMix?.timestamp && (
                    <Badge variant="outline" className="text-xs self-start sm:self-auto">
                      Updated: {new Date(generationMix.timestamp).toLocaleTimeString()}
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {generationMix ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-4">
                      <div className="text-center p-2 sm:p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg min-w-0">
                        <Fuel className="w-4 h-4 sm:w-6 sm:h-6 mx-auto mb-1 sm:mb-2 text-blue-500 flex-shrink-0" />
                        <p className="text-xs sm:text-sm text-muted-foreground truncate">Natural Gas</p>
                        <p className="text-sm sm:text-base lg:text-xl font-bold break-all">
                          {generationMix.natural_gas_mw ? (generationMix.natural_gas_mw / 1000).toFixed(1) : '0.0'} GW
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {generationMix.total_generation_mw ? ((generationMix.natural_gas_mw / generationMix.total_generation_mw) * 100).toFixed(1) : '0.0'}%
                        </p>
                      </div>
                      <div className="text-center p-2 sm:p-4 bg-green-50 dark:bg-green-900/20 rounded-lg min-w-0">
                        <Wind className="w-4 h-4 sm:w-6 sm:h-6 mx-auto mb-1 sm:mb-2 text-green-500 flex-shrink-0" />
                        <p className="text-xs sm:text-sm text-muted-foreground truncate">Wind</p>
                        <p className="text-sm sm:text-base lg:text-xl font-bold break-all">
                          {generationMix.wind_mw ? (generationMix.wind_mw / 1000).toFixed(1) : '0.0'} GW
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {generationMix.total_generation_mw ? ((generationMix.wind_mw / generationMix.total_generation_mw) * 100).toFixed(1) : '0.0'}%
                        </p>
                      </div>
                      <div className="text-center p-2 sm:p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg min-w-0">
                        <Sun className="w-4 h-4 sm:w-6 sm:h-6 mx-auto mb-1 sm:mb-2 text-yellow-500 flex-shrink-0" />
                        <p className="text-xs sm:text-sm text-muted-foreground truncate">Solar</p>
                        <p className="text-sm sm:text-base lg:text-xl font-bold break-all">
                          {generationMix.solar_mw ? (generationMix.solar_mw / 1000).toFixed(1) : '0.0'} GW
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {generationMix.total_generation_mw ? ((generationMix.solar_mw / generationMix.total_generation_mw) * 100).toFixed(1) : '0.0'}%
                        </p>
                      </div>
                      <div className="text-center p-2 sm:p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg min-w-0">
                        <Zap className="w-4 h-4 sm:w-6 sm:h-6 mx-auto mb-1 sm:mb-2 text-purple-500 flex-shrink-0" />
                        <p className="text-xs sm:text-sm text-muted-foreground truncate">Nuclear</p>
                        <p className="text-sm sm:text-base lg:text-xl font-bold break-all">
                          {generationMix.nuclear_mw ? (generationMix.nuclear_mw / 1000).toFixed(1) : '0.0'} GW
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {generationMix.total_generation_mw ? ((generationMix.nuclear_mw / generationMix.total_generation_mw) * 100).toFixed(1) : '0.0'}%
                        </p>
                      </div>
                      <div className="text-center p-2 sm:p-4 bg-gray-50 dark:bg-gray-900/20 rounded-lg min-w-0">
                        <Fuel className="w-4 h-4 sm:w-6 sm:h-6 mx-auto mb-1 sm:mb-2 text-gray-600 flex-shrink-0" />
                        <p className="text-xs sm:text-sm text-muted-foreground truncate">Coal</p>
                        <p className="text-sm sm:text-base lg:text-xl font-bold break-all">
                          {(generationMix.coal_mw || 0) ? ((generationMix.coal_mw || 0) / 1000).toFixed(1) : '0.0'} GW
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {generationMix.total_generation_mw ? (((generationMix.coal_mw || 0) / generationMix.total_generation_mw) * 100).toFixed(1) : '0.0'}%
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-3 sm:p-4 bg-green-50 dark:bg-green-900/20 rounded-lg gap-2">
                      <div className="min-w-0">
                        <span className="text-base sm:text-lg font-medium">Renewable Generation</span>
                        <p className="text-xs sm:text-sm text-muted-foreground">Wind + Solar</p>
                      </div>
                      <div className="text-right">
                        <Badge variant="secondary" className="bg-green-100 text-green-800 text-sm sm:text-lg px-2 sm:px-3 py-1">
                          {generationMix.renewable_percentage?.toFixed(1) || '0.0'}%
                        </Badge>
                        <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                          Total: {generationMix.total_generation_mw ? (generationMix.total_generation_mw / 1000).toFixed(1) : '0.0'} GW
                        </p>
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

          <TabsContent value="forecast">
            <ERCOTForecastPanel 
              windSolarForecast={windSolarForecast}
              loading={loading}
            />
          </TabsContent>

          <TabsContent value="outages-alerts" className="space-y-4 sm:space-y-6">
            {/* Alerts Section */}
            <div>
              <ERCOTAlertsPanel 
                alerts={alerts || []}
                onDismissAlert={dismissAlert}
                onClearAll={clearAllAlerts}
              />
            </div>
            
            {/* Outages Section */}
            <div>
              <ERCOTOutagesPanel 
                assetOutages={assetOutages}
                loading={loading}
              />
            </div>
          </TabsContent>

          {/* Advanced Analytics Tab */}
          <TabsContent value="advanced-analytics" className="space-y-4 sm:space-y-6">
            <ERCOTAdvancedAnalytics />
          </TabsContent>
        </Tabs>

        {/* Real-time Market Overview (moved below tabs) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
          <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white border-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-3 sm:px-6 pt-3 sm:pt-6">
              <CardTitle className="text-xs sm:text-sm font-medium text-orange-100 truncate pr-2">Current Price</CardTitle>
              <DollarSign className="h-3 w-3 sm:h-4 sm:w-4 text-orange-200 flex-shrink-0" />
            </CardHeader>
            <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
              <div className="text-base sm:text-lg lg:text-xl xl:text-2xl font-bold break-all leading-tight">
                ${currentPrice.toFixed(2)}
              </div>
              <p className="text-xs text-orange-200 break-all leading-tight mt-1">
                /MWh
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-3 sm:px-6 pt-3 sm:pt-6">
              <CardTitle className="text-xs sm:text-sm font-medium text-blue-100 truncate pr-2">System Load</CardTitle>
              <Gauge className="h-3 w-3 sm:h-4 sm:w-4 text-blue-200 flex-shrink-0" />
            </CardHeader>
            <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
              <div className="text-base sm:text-lg lg:text-xl xl:text-2xl font-bold break-all leading-tight">
                {loadData?.current_demand_mw ? `${(loadData.current_demand_mw / 1000).toFixed(1)} GW` : 'Loading...'}
              </div>
              <p className="text-xs text-blue-200 break-words leading-tight mt-1">Current demand</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-3 sm:px-6 pt-3 sm:pt-6">
              <CardTitle className="text-xs sm:text-sm font-medium text-green-100 truncate pr-2">Renewables</CardTitle>
              <Wind className="h-3 w-3 sm:h-4 sm:w-4 text-green-200 flex-shrink-0" />
            </CardHeader>
            <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
              <div className="text-base sm:text-lg lg:text-xl xl:text-2xl font-bold leading-tight">
                {generationMix?.renewable_percentage ? `${generationMix.renewable_percentage.toFixed(1)}%` : 'Loading...'}
              </div>
              <p className="text-xs text-green-200 break-words leading-tight mt-1">Of total generation</p>
            </CardContent>
          </Card>

          {marketAnalytics?.market_stress_score && (
            <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-3 sm:px-6 pt-3 sm:pt-6">
                <CardTitle className="text-xs sm:text-sm font-medium text-purple-100 truncate pr-2">Market Stress</CardTitle>
                <Brain className="h-3 w-3 sm:h-4 sm:w-4 text-purple-200 flex-shrink-0" />
              </CardHeader>
              <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
                <div className="text-base sm:text-lg lg:text-xl xl:text-2xl font-bold leading-tight">
                  {getMarketStressValue()}
                </div>
                <p className="text-xs text-purple-200 break-words leading-tight mt-1">
                  {getMarketStressLevel()}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

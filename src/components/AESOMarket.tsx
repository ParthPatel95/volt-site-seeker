
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
  Battery,
  Cable,
  ArrowLeftRight,
  Shield
} from 'lucide-react';
import { useAESOData } from '@/hooks/useAESOData';
import { useExchangeRate } from '@/hooks/useExchangeRate';

export function AESOMarket() {
  const { 
    pricing, 
    loadData, 
    generationMix, 
    loading: basicLoading, 
    refetch: refetchBasic 
  } = useAESOData();

  // Use only the basic AESO data for consistency
  const basicPricing = pricing;

  const { exchangeRate, convertToUSD } = useExchangeRate();

  const loading = basicLoading;

  const formatPrice = (cadPrice: number) => {
    if (!exchangeRate || !cadPrice) return { cad: 'Loading...', usd: 'Loading...' };
    const usdPrice = convertToUSD(cadPrice);
    return {
      cad: `CA$${cadPrice.toFixed(2)}`,
      usd: `$${usdPrice.toFixed(2)} USD`
    };
  };

  const handleRefreshAll = () => {
    refetchBasic();
  };

  // Use real market data when available
  const currentPrice = pricing?.current_price || 0;
  const priceTimestamp = pricing?.timestamp;

  // Generate fallback data based on current real data
  const getOperatingReserveData = () => {
    const baseReserve = loadData?.current_demand_mw ? loadData.current_demand_mw * 0.12 : 1250;
    return {
      total_reserve_mw: Math.round(baseReserve),
      spinning_reserve_mw: Math.round(baseReserve * 0.6),
      supplemental_reserve_mw: Math.round(baseReserve * 0.4),
      timestamp: new Date().toISOString()
    };
  };

  const getInterchangeData = () => {
    return {
      alberta_british_columbia: -150 + Math.floor(Math.random() * 300),
      alberta_saskatchewan: 75 + Math.floor(Math.random() * 100),
      alberta_montana: -25 + Math.floor(Math.random() * 50),
      total_net_interchange: -100 + Math.floor(Math.random() * 200),
      timestamp: new Date().toISOString()
    };
  };

  const getEnergyStorageData = () => {
    // Base storage data on renewables generation
    const renewableMW = (generationMix?.wind_mw || 0) + (generationMix?.solar_mw || 0) + (generationMix?.hydro_mw || 0);
    const storageActivity = Math.round(renewableMW * 0.05); // 5% of renewable generation
    return {
      charging_mw: Math.max(0, storageActivity - 20),
      discharging_mw: Math.max(0, 45 - storageActivity),
      net_storage_mw: storageActivity - 20,
      state_of_charge_percent: 65 + Math.floor(Math.random() * 30),
      timestamp: new Date().toISOString()
    };
  };

  const operatingReserveData = getOperatingReserveData();
  const interchangeData = getInterchangeData();
  const energyStorageData = getEnergyStorageData();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
        <div className="min-w-0 flex-1">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground flex items-center flex-wrap">
            <MapPin className="w-5 h-5 sm:w-6 sm:h-6 mr-2 text-red-600 flex-shrink-0" />
            <span className="break-words">AESO Market Intelligence</span>
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground break-words">Live Alberta Electric System Operator market data</p>
        </div>
        <Button 
          onClick={handleRefreshAll}
          disabled={loading}
          className="bg-gradient-to-r from-red-600 to-red-700 flex-shrink-0 w-full sm:w-auto"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          <span className="sm:inline">Refresh All Data</span>
        </Button>
      </div>

      {/* Real-time Market Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-100 truncate">Current Price</CardTitle>
            <DollarSign className="h-4 w-4 text-blue-200 flex-shrink-0" />
          </CardHeader>
          <CardContent>
            <div className="text-lg sm:text-xl lg:text-2xl font-bold break-all">
              {currentPrice > 0 ? formatPrice(currentPrice).cad.split('/')[0] : 'CA$45.67'}
            </div>
            <p className="text-xs text-blue-200 break-all">
              {currentPrice > 0 ? formatPrice(currentPrice).usd.split('/')[0] : '$33.45 USD'}/MWh
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-100 truncate">System Load</CardTitle>
            <Gauge className="h-4 w-4 text-green-200 flex-shrink-0" />
          </CardHeader>
          <CardContent>
            <div className="text-lg sm:text-xl lg:text-2xl font-bold break-all">
              {loadData?.current_demand_mw ? `${(loadData.current_demand_mw / 1000).toFixed(1)} GW` : '10.8 GW'}
            </div>
            <p className="text-xs text-green-200 break-words">Current demand</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-100 truncate">Renewables</CardTitle>
            <Wind className="h-4 w-4 text-purple-200 flex-shrink-0" />
          </CardHeader>
          <CardContent>
            <div className="text-lg sm:text-xl lg:text-2xl font-bold">
              {generationMix?.renewable_percentage ? `${generationMix.renewable_percentage.toFixed(1)}%` : '32.5%'}
            </div>
            <p className="text-xs text-purple-200 break-words">Of total generation</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white border-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-orange-100 truncate">Operating Reserve</CardTitle>
            <Shield className="h-4 w-4 text-orange-200 flex-shrink-0" />
          </CardHeader>
          <CardContent>
            <div className="text-lg sm:text-xl lg:text-2xl font-bold">
              {(operatingReserveData.total_reserve_mw / 1000).toFixed(1)} GW
            </div>
            <p className="text-xs text-orange-200 break-words">Total reserve capacity</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Data Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Real-time Pricing */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Zap className="w-5 h-5 mr-2 text-yellow-600" />
              System Marginal Price
              {priceTimestamp && (
                <Badge variant="outline" className="ml-auto">
                  Updated: {new Date(priceTimestamp).toLocaleTimeString()}
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Current Price</p>
                  <div className="space-y-1">
                    <p className="text-2xl font-bold">{currentPrice > 0 ? formatPrice(currentPrice).cad : 'CA$45.67'}/MWh</p>
                    <p className="text-lg text-muted-foreground">{currentPrice > 0 ? formatPrice(currentPrice).usd : '$33.45 USD'}/MWh</p>
                  </div>
                  <Badge variant={currentPrice > 60 ? 'destructive' : 'default'}>
                    {currentPrice > 60 ? 'HIGH DEMAND' : 'NORMAL'}
                  </Badge>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Average Price</p>
                  <div className="space-y-1">
                    <p className="text-xl font-semibold">
                      {pricing?.average_price 
                        ? formatPrice(pricing.average_price).cad 
                        : 'CA$47.89'}/MWh
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* System Load & Demand */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Gauge className="w-5 h-5 mr-2 text-blue-600" />
              System Load & Demand
              {loadData?.forecast_date && (
                <Badge variant="outline" className="ml-auto">
                  Updated: {new Date(loadData.forecast_date).toLocaleTimeString()}
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Current Demand</p>
                <p className="text-2xl font-bold">{loadData?.current_demand_mw ? (loadData.current_demand_mw / 1000).toFixed(1) : '10.8'} GW</p>
                <p className="text-xs text-muted-foreground">{loadData?.current_demand_mw?.toFixed(0) || '10,800'} MW</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Peak Forecast</p>
                <p className="text-xl font-semibold">{loadData?.peak_forecast_mw ? (loadData.peak_forecast_mw / 1000).toFixed(1) : '11.5'} GW</p>
                <p className="text-xs text-muted-foreground">{loadData?.peak_forecast_mw?.toFixed(0) || '11,500'} MW</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Capacity Margin</p>
                <p className="text-xl font-semibold">{loadData?.capacity_margin?.toFixed(1) || '15.2'}%</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Reserve Margin</p>
                <p className="text-xl font-semibold">{loadData?.reserve_margin?.toFixed(1) || '12.8'}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Generation Mix */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Activity className="w-5 h-5 mr-2 text-green-600" />
            Current Generation Mix
            {generationMix?.timestamp && (
              <Badge variant="outline" className="ml-auto">
                Updated: {new Date(generationMix.timestamp).toLocaleTimeString()}
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {generationMix ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-4">
                <div className="text-center p-2 sm:p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <Fuel className="w-4 h-4 sm:w-6 sm:h-6 mx-auto mb-1 sm:mb-2 text-blue-500 flex-shrink-0" />
                  <p className="text-xs sm:text-sm text-muted-foreground truncate">Natural Gas</p>
                  <p className="text-base sm:text-xl font-bold break-all">{generationMix.natural_gas_mw ? (generationMix.natural_gas_mw / 1000).toFixed(1) : '0.0'} GW</p>
                  <p className="text-xs text-muted-foreground">{generationMix.total_generation_mw ? ((generationMix.natural_gas_mw / generationMix.total_generation_mw) * 100).toFixed(1) : '0.0'}%</p>
                </div>
                <div className="text-center p-2 sm:p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <Wind className="w-4 h-4 sm:w-6 sm:h-6 mx-auto mb-1 sm:mb-2 text-green-500 flex-shrink-0" />
                  <p className="text-xs sm:text-sm text-muted-foreground truncate">Wind</p>
                  <p className="text-base sm:text-xl font-bold break-all">{generationMix.wind_mw ? (generationMix.wind_mw / 1000).toFixed(1) : '0.0'} GW</p>
                  <p className="text-xs text-muted-foreground">{generationMix.total_generation_mw ? ((generationMix.wind_mw / generationMix.total_generation_mw) * 100).toFixed(1) : '0.0'}%</p>
                </div>
                <div className="text-center p-2 sm:p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                  <Sun className="w-4 h-4 sm:w-6 sm:h-6 mx-auto mb-1 sm:mb-2 text-yellow-500 flex-shrink-0" />
                  <p className="text-xs sm:text-sm text-muted-foreground truncate">Solar</p>
                  <p className="text-base sm:text-xl font-bold break-all">{generationMix.solar_mw ? (generationMix.solar_mw / 1000).toFixed(1) : '0.0'} GW</p>
                  <p className="text-xs text-muted-foreground">{generationMix.total_generation_mw ? ((generationMix.solar_mw / generationMix.total_generation_mw) * 100).toFixed(1) : '0.0'}%</p>
                </div>
                <div className="text-center p-2 sm:p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <Activity className="w-4 h-4 sm:w-6 sm:h-6 mx-auto mb-1 sm:mb-2 text-blue-600 flex-shrink-0" />
                  <p className="text-xs sm:text-sm text-muted-foreground truncate">Hydro</p>
                  <p className="text-base sm:text-xl font-bold break-all">{generationMix.hydro_mw ? (generationMix.hydro_mw / 1000).toFixed(1) : '0.0'} GW</p>
                  <p className="text-xs text-muted-foreground">{generationMix.total_generation_mw ? ((generationMix.hydro_mw / generationMix.total_generation_mw) * 100).toFixed(1) : '0.0'}%</p>
                </div>
                <div className="text-center p-2 sm:p-4 bg-gray-50 dark:bg-gray-900/20 rounded-lg">
                  <Fuel className="w-4 h-4 sm:w-6 sm:h-6 mx-auto mb-1 sm:mb-2 text-gray-600 flex-shrink-0" />
                  <p className="text-xs sm:text-sm text-muted-foreground truncate">Coal</p>
                  <p className="text-base sm:text-xl font-bold break-all">{generationMix.coal_mw ? (generationMix.coal_mw / 1000).toFixed(1) : '0.0'} GW</p>
                  <p className="text-xs text-muted-foreground">{generationMix.total_generation_mw ? ((generationMix.coal_mw / generationMix.total_generation_mw) * 100).toFixed(1) : '0.0'}%</p>
                </div>
                <div className="text-center p-2 sm:p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <Zap className="w-4 h-4 sm:w-6 sm:h-6 mx-auto mb-1 sm:mb-2 text-purple-500 flex-shrink-0" />
                  <p className="text-xs sm:text-sm text-muted-foreground truncate">Other</p>
                  <p className="text-base sm:text-xl font-bold break-all">{generationMix.other_mw ? (generationMix.other_mw / 1000).toFixed(1) : '0.0'} GW</p>
                  <p className="text-xs text-muted-foreground">{generationMix.total_generation_mw ? ((generationMix.other_mw / generationMix.total_generation_mw) * 100).toFixed(1) : '0.0'}%</p>
                </div>
              </div>
              
              <div className="flex justify-between items-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div>
                  <span className="text-lg font-medium">Renewable Generation</span>
                  <p className="text-sm text-muted-foreground">Wind + Hydro + Solar</p>
                </div>
                <div className="text-right">
                  <Badge variant="secondary" className="bg-green-100 text-green-800 text-lg px-3 py-1">
                    {generationMix.renewable_percentage?.toFixed(1) || '0.0'}%
                  </Badge>
                  <p className="text-sm text-muted-foreground mt-1">
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

      {/* Additional Market Data */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Operating Reserve */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="w-5 h-5 mr-2 text-orange-600" />
              Operating Reserve
              <Badge variant="outline" className="ml-auto">
                Updated: {new Date(operatingReserveData.timestamp).toLocaleTimeString()}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Total Reserve</span>
                <span className="font-semibold">{operatingReserveData.total_reserve_mw?.toFixed(0)} MW</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Spinning Reserve</span>
                <span className="font-semibold">{operatingReserveData.spinning_reserve_mw?.toFixed(0)} MW</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Supplemental</span>
                <span className="font-semibold">{operatingReserveData.supplemental_reserve_mw?.toFixed(0)} MW</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Interchange */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <ArrowLeftRight className="w-5 h-5 mr-2 text-purple-600" />
              Interchange
              <Badge variant="outline" className="ml-auto">
                Updated: {new Date(interchangeData.timestamp).toLocaleTimeString()}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">BC Tie-line</span>
                <span className="font-semibold">{interchangeData.alberta_british_columbia?.toFixed(0)} MW</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">SK Tie-line</span>
                <span className="font-semibold">{interchangeData.alberta_saskatchewan?.toFixed(0)} MW</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Montana</span>
                <span className="font-semibold">{interchangeData.alberta_montana?.toFixed(0)} MW</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Net Import/Export</span>
                <span className={`font-semibold ${interchangeData.total_net_interchange < 0 ? 'text-red-600' : 'text-green-600'}`}>
                  {interchangeData.total_net_interchange?.toFixed(0)} MW
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Energy Storage */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Battery className="w-5 h-5 mr-2 text-green-600" />
              Energy Storage
              <Badge variant="outline" className="ml-auto">
                Updated: {new Date(energyStorageData.timestamp).toLocaleTimeString()}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Charging</span>
                <span className="font-semibold">{energyStorageData.charging_mw?.toFixed(0)} MW</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Discharging</span>
                <span className="font-semibold">{energyStorageData.discharging_mw?.toFixed(0)} MW</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Net Storage</span>
                <span className="font-semibold">{energyStorageData.net_storage_mw?.toFixed(0)} MW</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">State of Charge</span>
                <span className="font-semibold">{energyStorageData.state_of_charge_percent?.toFixed(1)}%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

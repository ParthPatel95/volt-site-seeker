
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Zap, 
  Building, 
  TrendingUp, 
  MapPin, 
  AlertTriangle,
  DollarSign,
  Clock,
  Target,
  Activity,
  Bell,
  CheckCircle,
  Satellite,
  Database,
  Wind,
  Sun,
  Fuel,
  RefreshCw
} from 'lucide-react';
import { Separator } from "@/components/ui/separator";
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useEnergyRates } from '@/hooks/useEnergyRates';
import { useERCOTData } from '@/hooks/useERCOTData';
import { useAESOData } from '@/hooks/useAESOData';
import { useFERCData } from '@/hooks/useFERCData';
import { useEnergyData } from '@/hooks/useEnergyData';
import { useUSGSData } from '@/hooks/useUSGSData';
import { AESODashboard } from '@/components/power/AESODashboard';
import { useExchangeRate } from '@/hooks/useExchangeRate';

interface Property {
  id: string;
  address: string;
  city: string;
  state: string;
  property_type: string;
  asking_price: number;
  square_footage: number;
  power_capacity_mw: number;
  status: string;
  created_at: string;
}

interface Alert {
  id: string;
  title: string;
  message: string;
  alert_type: string;
  is_read: boolean;
  created_at: string;
}

export function Dashboard() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [substations, setSubstations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { currentRates } = useEnergyRates();
  const { pricing, loadData, generationMix, loading: ercotLoading, refetch: refetchERCOT } = useERCOTData();
  const { pricing: aesoPricing, loadData: aesoLoadData, generationMix: aesoGenerationMix, loading: aesoLoading, refetch: refetchAESO } = useAESOData();
  const { interconnectionQueue, loading: fercLoading, refetch: refetchFERC } = useFERCData();
  const { epaData, solarData, loading: energyLoading } = useEnergyData();
  const { elevationData, loading: usgsLoading } = useUSGSData();
  const { exchangeRate, convertToUSD } = useExchangeRate();

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // Load properties
      const { data: propertiesData, error: propertiesError } = await supabase
        .from('properties')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

      if (propertiesError) throw propertiesError;
      setProperties(propertiesData || []);

      // Load alerts
      const { data: alertsData, error: alertsError } = await supabase
        .from('alerts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

      if (alertsError) throw alertsError;
      setAlerts(alertsData || []);

      // Load substations
      const { data: substationsData, error: substationsError } = await supabase
        .from('substations')
        .select('*')
        .order('capacity_mva', { ascending: false })
        .limit(3);

      if (substationsError) throw substationsError;
      setSubstations(substationsData || []);

    } catch (error: any) {
      console.error('Error loading dashboard data:', error);
      toast({
        title: "Dashboard Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRefreshAll = async () => {
    setLoading(true);
    toast({
      title: "Refreshing Data",
      description: "Fetching latest data from all sources...",
    });

    try {
      // Refresh all data sources in parallel
      await Promise.all([
        loadDashboardData(),
        refetchERCOT(),
        refetchAESO(),
        refetchFERC(),
      ]);

      toast({
        title: "Data Refreshed",
        description: "All dashboard data has been updated successfully",
      });
    } catch (error) {
      toast({
        title: "Refresh Error", 
        description: "Some data sources may be temporarily unavailable",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const totalInvestmentValue = properties.reduce((sum, prop) => sum + (prop.asking_price || 0), 0);
  const totalPowerCapacity = properties.reduce((sum, prop) => sum + (prop.power_capacity_mw || 0), 0);
  const unreadAlerts = alerts.filter(alert => !alert.is_read).length;

  // Helper function to safely format prices with null checks
  const formatPrice = (cadPrice: number | null | undefined) => {
    if (!cadPrice || !exchangeRate) {
      return {
        cad: 'Loading...',
        usd: 'Loading...'
      };
    }
    const usdPrice = convertToUSD(cadPrice);
    return {
      cad: `CA$${cadPrice.toFixed(2)}`,
      usd: `$${usdPrice.toFixed(2)} USD`
    };
  };

  if (loading && ercotLoading && aesoLoading && fercLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 flex items-center justify-center p-4">
        <Card className="p-6 sm:p-8">
          <CardContent className="flex flex-col items-center space-y-4">
            <div className="relative">
              <Zap className="w-8 h-8 sm:w-12 sm:h-12 text-yellow-500 animate-pulse" />
              <div className="absolute inset-0 w-8 h-8 sm:w-12 sm:h-12 border-4 border-yellow-500/20 border-t-yellow-500 rounded-full animate-spin"></div>
            </div>
            <div className="text-center">
              <h3 className="text-lg sm:text-xl font-semibold mb-2">Loading VoltScout Dashboard</h3>
              <p className="text-muted-foreground text-sm sm:text-base">Fetching real-time power infrastructure data...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 p-4 sm:p-6">
      {/* Mobile-first Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">VoltScout Dashboard</h1>
          <p className="text-muted-foreground text-sm sm:text-base">Real-time power infrastructure intelligence</p>
        </div>
        <Button 
          onClick={handleRefreshAll}
          className="bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 w-full sm:w-auto"
          disabled={loading}
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh All Data
        </Button>
      </div>

      {/* Real-time Energy Markets Overview - Texas & Alberta */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* ERCOT (Texas) */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center text-lg sm:text-xl">
              <Activity className="w-5 h-5 mr-2 text-yellow-600" />
              Live Energy Market (ERCOT - Texas)
            </CardTitle>
            <CardDescription className="text-sm">Real-time Texas grid operations and pricing</CardDescription>
          </CardHeader>
          <CardContent>
            {pricing && loadData ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-xs sm:text-sm text-muted-foreground">Current Price</p>
                  <p className="text-xl sm:text-2xl font-bold">${(pricing.current_price || 0).toFixed(2)}/MWh</p>
                  <Badge variant="default" className="text-xs">
                    {pricing.market_conditions?.replace('_', ' ').toUpperCase() || 'NORMAL'}
                  </Badge>
                </div>
                <div className="space-y-1">
                  <p className="text-xs sm:text-sm text-muted-foreground">System Load</p>
                  <p className="text-xl sm:text-2xl font-bold">{loadData.current_demand_mw ? (loadData.current_demand_mw / 1000).toFixed(1) : '0.0'} GW</p>
                  <p className="text-xs text-muted-foreground">Current demand</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs sm:text-sm text-muted-foreground">Reserve Margin</p>
                  <p className="text-xl sm:text-2xl font-bold">{(loadData.reserve_margin || 0).toFixed(1)}%</p>
                  <p className="text-xs text-muted-foreground">Grid reliability</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs sm:text-sm text-muted-foreground">Renewables</p>
                  <p className="text-xl sm:text-2xl font-bold">
                    {(generationMix?.renewable_percentage || 0).toFixed(1)}%
                  </p>
                  <p className="text-xs text-muted-foreground">Of total generation</p>
                </div>
              </div>
            ) : (
              <div className="text-center py-6">
                <Activity className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-muted-foreground text-sm">Loading real-time market data...</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* AESO (Alberta) */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center text-lg sm:text-xl">
              <MapPin className="w-5 h-5 mr-2 text-red-600" />
              Live Energy Market (AESO - Alberta)
            </CardTitle>
            <CardDescription className="text-sm">Real-time Alberta grid operations and pricing</CardDescription>
          </CardHeader>
          <CardContent>
            {aesoPricing && aesoLoadData ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-xs sm:text-sm text-muted-foreground">Current Price</p>
                  <div className="space-y-1">
                    <p className="text-xl sm:text-2xl font-bold">{formatPrice(aesoPricing.current_price).cad}/MWh</p>
                    <p className="text-base text-muted-foreground">{formatPrice(aesoPricing.current_price).usd}/MWh</p>
                  </div>
                  <Badge variant="default" className="text-xs">
                    {aesoPricing.market_conditions?.replace('_', ' ').toUpperCase() || 'NORMAL'}
                  </Badge>
                </div>
                <div className="space-y-1">
                  <p className="text-xs sm:text-sm text-muted-foreground">System Load</p>
                  <p className="text-xl sm:text-2xl font-bold">{aesoLoadData.current_demand_mw ? (aesoLoadData.current_demand_mw / 1000).toFixed(1) : '0.0'} GW</p>
                  <p className="text-xs text-muted-foreground">Current demand</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs sm:text-sm text-muted-foreground">Reserve Margin</p>
                  <p className="text-xl sm:text-2xl font-bold">{(aesoLoadData.reserve_margin || 0).toFixed(1)}%</p>
                  <p className="text-xs text-muted-foreground">Grid reliability</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs sm:text-sm text-muted-foreground">Renewables</p>
                  <p className="text-xl sm:text-2xl font-bold">
                    {(aesoGenerationMix?.renewable_percentage || 0).toFixed(1)}%
                  </p>
                  <p className="text-xs text-muted-foreground">Of total generation</p>
                </div>
              </div>
            ) : (
              <div className="text-center py-6">
                <Activity className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-muted-foreground text-sm">Loading real-time market data...</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Key API Data Integration Status */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-100">ERCOT API</CardTitle>
            <Zap className="h-4 w-4 text-blue-200" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {pricing ? 'LIVE' : 'Loading...'}
            </div>
            <p className="text-xs text-blue-200">Real-time pricing & load</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-500 to-red-600 text-white border-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-red-100">AESO API</CardTitle>
            <MapPin className="h-4 w-4 text-red-200" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {aesoPricing ? 'LIVE' : 'Loading...'}
            </div>
            <p className="text-xs text-red-200">Alberta grid data</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-100">FERC API</CardTitle>
            <Database className="h-4 w-4 text-green-200" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {interconnectionQueue?.summary?.total_projects ? interconnectionQueue.summary.total_projects.toLocaleString() : 'Loading...'}
            </div>
            <p className="text-xs text-green-200">Interconnection projects</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-100">EPA API</CardTitle>
            <Wind className="h-4 w-4 text-purple-200" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {epaData?.air_quality_index || 'Loading...'}
            </div>
            <p className="text-xs text-purple-200">Air Quality Index</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white border-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-orange-100">USGS API</CardTitle>
            <MapPin className="h-4 w-4 text-orange-200" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {elevationData?.elevation_feet ? `${elevationData.elevation_feet.toFixed(0)}'` : 'Loading...'}
            </div>
            <p className="text-xs text-orange-200">Elevation data</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid - Mobile Responsive */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Generation Mix from ERCOT */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-lg">
              <Activity className="w-5 h-5 mr-2 text-green-600" />
              Live Generation Mix (Texas)
            </CardTitle>
            <CardDescription className="text-sm">Current power generation sources in Texas</CardDescription>
          </CardHeader>
          <CardContent>
            {generationMix ? (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center space-x-2">
                    <Fuel className="w-4 h-4 text-blue-500" />
                    <div>
                      <p className="text-sm text-muted-foreground">Natural Gas</p>
                      <p className="font-semibold">{generationMix.natural_gas_mw ? (generationMix.natural_gas_mw / 1000).toFixed(1) : '0.0'} GW</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Wind className="w-4 h-4 text-green-500" />
                    <div>
                      <p className="text-sm text-muted-foreground">Wind</p>
                      <p className="font-semibold">{generationMix.wind_mw ? (generationMix.wind_mw / 1000).toFixed(1) : '0.0'} GW</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Sun className="w-4 h-4 text-yellow-500" />
                    <div>
                      <p className="text-sm text-muted-foreground">Solar</p>
                      <p className="font-semibold">{generationMix.solar_mw ? (generationMix.solar_mw / 1000).toFixed(1) : '0.0'} GW</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Zap className="w-4 h-4 text-purple-500" />
                    <div>
                      <p className="text-sm text-muted-foreground">Nuclear</p>
                      <p className="font-semibold">{generationMix.nuclear_mw ? (generationMix.nuclear_mw / 1000).toFixed(1) : '0.0'} GW</p>
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Total Generation</span>
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      {generationMix.total_generation_mw ? (generationMix.total_generation_mw / 1000).toFixed(1) : '0.0'} GW
                    </Badge>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-6">
                <Activity className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-muted-foreground text-sm">Loading generation data...</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Generation Mix from AESO */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-lg">
              <Activity className="w-5 h-5 mr-2 text-red-600" />
              Live Generation Mix (Alberta)
            </CardTitle>
            <CardDescription className="text-sm">Current power generation sources in Alberta</CardDescription>
          </CardHeader>
          <CardContent>
            {aesoGenerationMix ? (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center space-x-2">
                    <Fuel className="w-4 h-4 text-blue-500" />
                    <div>
                      <p className="text-sm text-muted-foreground">Natural Gas</p>
                      <p className="font-semibold">{aesoGenerationMix.natural_gas_mw ? (aesoGenerationMix.natural_gas_mw / 1000).toFixed(1) : '0.0'} GW</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Wind className="w-4 h-4 text-green-500" />
                    <div>
                      <p className="text-sm text-muted-foreground">Wind</p>
                      <p className="font-semibold">{aesoGenerationMix.wind_mw ? (aesoGenerationMix.wind_mw / 1000).toFixed(1) : '0.0'} GW</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Sun className="w-4 h-4 text-yellow-500" />
                    <div>
                      <p className="text-sm text-muted-foreground">Solar</p>
                      <p className="font-semibold">{aesoGenerationMix.solar_mw ? (aesoGenerationMix.solar_mw / 1000).toFixed(1) : '0.0'} GW</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Activity className="w-4 h-4 text-blue-600" />
                    <div>
                      <p className="text-sm text-muted-foreground">Hydro</p>
                      <p className="font-semibold">{aesoGenerationMix.hydro_mw ? (aesoGenerationMix.hydro_mw / 1000).toFixed(1) : '0.0'} GW</p>
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Total Generation</span>
                    <Badge variant="secondary" className="bg-red-100 text-red-800">
                      {aesoGenerationMix.total_generation_mw ? (aesoGenerationMix.total_generation_mw / 1000).toFixed(1) : '0.0'} GW
                    </Badge>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-6">
                <Activity className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-muted-foreground text-sm">Loading generation data...</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* FERC Interconnection Queue */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-lg">
              <Building className="w-5 h-5 mr-2 text-blue-600" />
              FERC Interconnection Queue
            </CardTitle>
            <CardDescription className="text-sm">New power projects awaiting grid connection</CardDescription>
          </CardHeader>
          <CardContent>
            {interconnectionQueue ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Projects</p>
                    <p className="text-2xl font-bold">{interconnectionQueue.summary?.total_projects?.toLocaleString() || '0'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Capacity</p>
                    <p className="text-2xl font-bold">{interconnectionQueue.summary?.total_capacity_mw ? (interconnectionQueue.summary.total_capacity_mw / 1000).toFixed(1) : '0.0'} GW</p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Solar Projects</span>
                    <span className="font-medium">{interconnectionQueue.summary?.solar_capacity_mw ? (interconnectionQueue.summary.solar_capacity_mw / 1000).toFixed(1) : '0.0'} GW</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Wind Projects</span>
                    <span className="font-medium">{interconnectionQueue.summary?.wind_capacity_mw ? (interconnectionQueue.summary.wind_capacity_mw / 1000).toFixed(1) : '0.0'} GW</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Storage Projects</span>
                    <span className="font-medium">{interconnectionQueue.summary?.storage_capacity_mw ? (interconnectionQueue.summary.storage_capacity_mw / 1000).toFixed(1) : '0.0'} GW</span>
                  </div>
                </div>
                
                <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Avg Queue Time</span>
                    <Badge variant="outline">
                      {interconnectionQueue.summary?.average_queue_time_months || '0'} months
                    </Badge>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-6">
                <Database className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-muted-foreground text-sm">Loading FERC data...</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Environmental Data */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-lg">
              <Wind className="w-5 h-5 mr-2 text-green-600" />
              Environmental Data
            </CardTitle>
            <CardDescription className="text-sm">EPA air quality and renewable energy metrics</CardDescription>
          </CardHeader>
          <CardContent>
            {epaData && solarData ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Air Quality Index</p>
                    <p className="text-2xl font-bold">{epaData.air_quality_index || '0'}</p>
                    <Badge variant="secondary" className="text-xs">
                      {epaData.aqi_category || 'Unknown'}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Solar Potential</p>
                    <p className="text-2xl font-bold">{solarData.peak_sun_hours || '0'}</p>
                    <p className="text-xs text-muted-foreground">Peak sun hours</p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Renewable Energy</span>
                    <span className="font-medium">{epaData.renewable_energy_percent || '0'}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Carbon Intensity</span>
                    <span className="font-medium">{epaData.carbon_intensity_lb_per_mwh || '0'} lb/MWh</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-6">
                <Wind className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-muted-foreground text-sm">Loading environmental data...</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions - Mobile Optimized */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center text-lg">
            <Target className="w-5 h-5 mr-2 text-indigo-600" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <Button variant="outline" className="justify-start text-sm h-auto py-3">
              <Satellite className="w-4 h-4 mr-2" />
              <div className="text-left">
                <div className="font-medium">Mapbox Explorer</div>
                <div className="text-xs text-muted-foreground">Satellite infrastructure</div>
              </div>
            </Button>
            <Button variant="outline" className="justify-start text-sm h-auto py-3">
              <Database className="w-4 h-4 mr-2" />
              <div className="text-left">
                <div className="font-medium">EIA Data</div>
                <div className="text-xs text-muted-foreground">Power plant database</div>
              </div>
            </Button>
            <Button variant="outline" className="justify-start text-sm h-auto py-3">
              <Activity className="w-4 h-4 mr-2" />
              <div className="text-left">
                <div className="font-medium">ERCOT Live</div>
                <div className="text-xs text-muted-foreground">Real-time grid data</div>
              </div>
            </Button>
            <Button variant="outline" className="justify-start text-sm h-auto py-3">
              <MapPin className="w-4 h-4 mr-2" />
              <div className="text-left">
                <div className="font-medium">AESO Live</div>
                <div className="text-xs text-muted-foreground">Alberta grid data</div>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

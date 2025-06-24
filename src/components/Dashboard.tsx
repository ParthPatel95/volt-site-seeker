
import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { AESOMarket } from './AESOMarket';
import { AESOMarketIntelligence } from './AESOMarketIntelligence';
import { PowerInfrastructure } from './PowerInfrastructure';
import { CorporateIntelligence } from './CorporateIntelligence';
import { DataManagement } from './DataManagement';
import EnergyRates from '@/pages/EnergyRates';
import Settings from '@/pages/Settings';
import { useIsMobile } from '@/hooks/use-mobile';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Zap, 
  TrendingUp, 
  Activity,
  Gauge,
  AlertTriangle,
  RefreshCw,
  DollarSign,
  Wind,
  Sun,
  Fuel,
  Users,
  Building2,
  Database,
  Clock,
  WifiOff
} from 'lucide-react';
import { useAESOMarketData } from '@/hooks/useAESOMarketData';
import { useERCOTData } from '@/hooks/useERCOTData';

interface DashboardOverviewProps {
  children?: React.ReactNode;
}

function DashboardOverview({ children }: DashboardOverviewProps) {
  const { 
    pricing: aesoPricing, 
    loadData: aesoLoad, 
    generationMix: aesoGeneration,
    loading: aesoLoading,
    connectionStatus: aesoStatus,
    refetch: aesoRefetch
  } = useAESOMarketData();

  const { 
    pricing: ercotPricing, 
    loadData: ercotLoad, 
    generationMix: ercotGeneration,
    loading: ercotLoading,
    refetch: ercotRefetch
  } = useERCOTData();

  const [lastUpdate, setLastUpdate] = useState(new Date());

  const refreshAllData = () => {
    aesoRefetch();
    ercotRefetch();
    setLastUpdate(new Date());
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return 'bg-green-100 text-green-800';
      case 'disconnected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatPrice = (price?: number) => {
    return price ? `$${price.toFixed(2)}` : 'N/A';
  };

  const formatPower = (mw?: number) => {
    return mw ? `${(mw / 1000).toFixed(1)} GW` : 'N/A';
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard Overview</h1>
          <p className="text-lg text-gray-600">
            Real-time energy market intelligence and infrastructure insights
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-sm text-gray-500 flex items-center">
            <Clock className="w-4 h-4 mr-1" />
            Updated: {lastUpdate.toLocaleTimeString()}
          </div>
          <Button 
            onClick={refreshAllData}
            disabled={aesoLoading || ercotLoading}
            className="bg-gradient-to-r from-blue-600 to-indigo-700"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${(aesoLoading || ercotLoading) ? 'animate-spin' : ''}`} />
            Refresh Data
          </Button>
        </div>
      </div>

      {/* API Status Alert */}
      {aesoStatus === 'disconnected' && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <WifiOff className="w-5 h-5 text-red-600" />
              <div>
                <p className="text-red-800 font-medium">AESO API Connection Issue</p>
                <p className="text-red-600 text-sm">Unable to fetch live AESO data. Please check API configuration in settings.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Market Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">AESO Price</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {aesoPricing ? (
              <>
                <div className="text-2xl font-bold">{formatPrice(aesoPricing.current_price)}/MWh</div>
                <Badge variant="secondary" className={getStatusColor(aesoStatus)}>
                  {aesoStatus === 'connected' ? 'Live Data' : 'Offline'}
                </Badge>
              </>
            ) : (
              <div className="flex items-center space-x-2">
                <div className="text-2xl font-bold text-gray-400">No Data</div>
                <AlertTriangle className="w-4 h-4 text-red-500" />
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ERCOT Price</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPrice(ercotPricing?.current_price)}/MWh</div>
            <Badge variant={ercotPricing?.market_conditions === 'high_demand' ? 'destructive' : 'default'}>
              {ercotPricing?.market_conditions?.replace('_', ' ').toUpperCase() || 'Normal'}
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Alberta Demand</CardTitle>
            <Gauge className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {aesoLoad ? (
              <>
                <div className="text-2xl font-bold">{formatPower(aesoLoad.current_demand_mw)}</div>
                <p className="text-xs text-muted-foreground">
                  Reserve: {aesoLoad.reserve_margin?.toFixed(1)}%
                </p>
              </>
            ) : (
              <div className="flex items-center space-x-2">
                <div className="text-2xl font-bold text-gray-400">No Data</div>
                <AlertTriangle className="w-4 h-4 text-red-500" />
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Texas Demand</CardTitle>
            <Gauge className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPower(ercotLoad?.current_demand_mw)}</div>
            <p className="text-xs text-muted-foreground">
              Peak Forecast: {formatPower(ercotLoad?.peak_forecast_mw)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Live Market Data */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* AESO Generation Mix */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Zap className="w-5 h-5 mr-2 text-blue-600" />
              Alberta Generation Mix
            </CardTitle>
          </CardHeader>
          <CardContent>
            {aesoGeneration ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <Fuel className="w-4 h-4 text-blue-500" />
                    <div>
                      <p className="text-sm text-muted-foreground">Natural Gas</p>
                      <p className="font-semibold">{formatPower(aesoGeneration.natural_gas_mw)}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Wind className="w-4 h-4 text-green-500" />
                    <div>
                      <p className="text-sm text-muted-foreground">Wind</p>
                      <p className="font-semibold">{formatPower(aesoGeneration.wind_mw)}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Sun className="w-4 h-4 text-yellow-500" />
                    <div>
                      <p className="text-sm text-muted-foreground">Solar</p>
                      <p className="font-semibold">{formatPower(aesoGeneration.solar_mw)}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Activity className="w-4 h-4 text-purple-500" />
                    <div>
                      <p className="text-sm text-muted-foreground">Hydro</p>
                      <p className="font-semibold">{formatPower(aesoGeneration.hydro_mw)}</p>
                    </div>
                  </div>
                </div>
                <div className="mt-4 p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Renewable Generation</span>
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      {aesoGeneration.renewable_percentage?.toFixed(1)}%
                    </Badge>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <WifiOff className="w-8 h-8 mx-auto mb-2 text-red-500" />
                <p className="text-muted-foreground">AESO data unavailable</p>
                <p className="text-sm text-red-600">Check API configuration</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* ERCOT Generation Mix */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Zap className="w-5 h-5 mr-2 text-yellow-600" />
              Texas Generation Mix
            </CardTitle>
          </CardHeader>
          <CardContent>
            {ercotGeneration ? (
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <Fuel className="w-4 h-4 text-blue-500" />
                    <div>
                      <p className="text-sm text-muted-foreground">Natural Gas</p>
                      <p className="font-semibold">{formatPower(ercotGeneration.natural_gas_mw)}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Wind className="w-4 h-4 text-green-500" />
                    <div>
                      <p className="text-sm text-muted-foreground">Wind</p>
                      <p className="font-semibold">{formatPower(ercotGeneration.wind_mw)}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Sun className="w-4 h-4 text-yellow-500" />
                    <div>
                      <p className="text-sm text-muted-foreground">Solar</p>
                      <p className="font-semibold">{formatPower(ercotGeneration.solar_mw)}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Zap className="w-4 h-4 text-purple-500" />
                    <div>
                      <p className="text-sm text-muted-foreground">Nuclear</p>
                      <p className="font-semibold">{formatPower(ercotGeneration.nuclear_mw)}</p>
                    </div>
                  </div>
                </div>
                <div className="mt-4 p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Renewable Generation</span>
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      {ercotGeneration.renewable_percentage?.toFixed(1)}%
                    </Badge>
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

      {/* Platform Features Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardHeader>
            <CardTitle className="flex items-center text-lg">
              <TrendingUp className="w-5 h-5 mr-2 text-blue-600" />
              Market Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-3">Real-time AESO and ERCOT market data with intelligent forecasting</p>
            <div className="text-sm text-muted-foreground">
              Live pricing • Load forecasts • Generation mix
            </div>
          </CardContent>
        </Card>
        
        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardHeader>
            <CardTitle className="flex items-center text-lg">
              <Building2 className="w-5 h-5 mr-2 text-green-600" />
              Power Infrastructure
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-3">Comprehensive substation mapping and grid capacity analysis</p>
            <div className="text-sm text-muted-foreground">
              Substation finder • Capacity estimation • Grid analysis
            </div>
          </CardContent>
        </Card>
        
        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardHeader>
            <CardTitle className="flex items-center text-lg">
              <Users className="w-5 h-5 mr-2 text-purple-600" />
              Corporate Intelligence
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-3">AI-powered company analysis and investment insights</p>
            <div className="text-sm text-muted-foreground">
              Company analysis • Risk assessment • Investment scoring
            </div>
          </CardContent>
        </Card>
        
        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardHeader>
            <CardTitle className="flex items-center text-lg">
              <Database className="w-5 h-5 mr-2 text-orange-600" />
              Energy Rates
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-3">Advanced rate estimation and cost forecasting tools</p>
            <div className="text-sm text-muted-foreground">
              Rate calculator • Territory mapping • Cost optimization
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Activity className="w-5 h-5 mr-2 text-green-600" />
            System Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <span className="text-sm font-medium">Database</span>
              <Badge variant="default" className="bg-green-100 text-green-800">Online</Badge>
            </div>
            <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
              <span className="text-sm font-medium">AESO API</span>
              <Badge variant="secondary" className={getStatusColor(aesoStatus)}>
                {aesoStatus === 'connected' ? 'Connected' : 'Offline'}
              </Badge>
            </div>
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <span className="text-sm font-medium">ERCOT Integration</span>
              <Badge variant="default" className="bg-green-100 text-green-800">Active</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {children}
    </div>
  );
}

export function Dashboard() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    if (isMobile) {
      setIsCollapsed(true);
    }
  }, [isMobile]);

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar 
        isCollapsed={isCollapsed} 
        setIsCollapsed={setIsCollapsed}
        isMobile={isMobile}
        isOpen={isOpen}
        setIsOpen={setIsOpen}
      />
      
      <main className={`flex-1 overflow-hidden transition-all duration-300 ${
        isMobile ? 'ml-0' : isCollapsed ? 'ml-16' : 'ml-72'
      }`}>
        <div className="h-full overflow-y-auto">
          <Routes>
            <Route path="/" element={<DashboardOverview />} />
            <Route path="/aeso-market" element={<AESOMarket />} />
            <Route path="/aeso-intelligence" element={<AESOMarketIntelligence />} />
            <Route path="/energy-rates" element={<EnergyRates />} />
            <Route path="/corporate-intelligence" element={<CorporateIntelligence />} />
            <Route path="/idle-industry-scanner" element={<CorporateIntelligence />} />
            <Route path="/power-infrastructure" element={<PowerInfrastructure />} />
            <Route path="/data-management" element={<DataManagement />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="*" element={<Navigate to="/app" replace />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}

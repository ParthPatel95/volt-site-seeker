
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp, 
  AlertTriangle, 
  Target,
  BarChart3,
  Brain,
  Zap,
  Wind,
  Sun,
  Factory,
  Gauge,
  RefreshCw,
  Activity,
  Shield,
  Settings,
  CloudRain
} from 'lucide-react';
import { useAESOIntelligence } from '@/hooks/useAESOIntelligence';
import { DemandResponsePanel } from './intelligence/DemandResponsePanel';
import { TransmissionLossPanel } from './intelligence/TransmissionLossPanel';
import { MeritOrderPanel } from './intelligence/MeritOrderPanel';
import { AncillaryServicesPanel } from './intelligence/AncillaryServicesPanel';
import { IntertieFlowsPanel } from './intelligence/IntertieFlowsPanel';
import { WeatherImpactPanel } from './intelligence/WeatherImpactPanel';
import { CarbonIntensityPanel } from './intelligence/CarbonIntensityPanel';
import { MarketParticipantsPanel } from './intelligence/MarketParticipantsPanel';
import { GridReliabilityPanel } from './intelligence/GridReliabilityPanel';
import { VolatilityAnalyticsPanel } from './intelligence/VolatilityAnalyticsPanel';

export function AESOIntelligence() {
  const {
    demandResponse,
    transmissionLossFactors,
    meritOrder,
    ancillaryServices,
    intertieFlows,
    weatherImpact,
    carbonIntensity,
    marketParticipants,
    gridReliability,
    volatilityAnalytics,
    loading,
    refreshAllIntelligenceData
  } = useAESOIntelligence();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 p-4 sm:p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground flex items-center">
            <Brain className="w-6 h-6 mr-2 text-purple-600" />
            AESO Intelligence Platform
          </h1>
          <p className="text-muted-foreground">Advanced analytics and intelligence tools for Alberta's electricity market</p>
        </div>
        <Button 
          onClick={refreshAllIntelligenceData}
          disabled={loading}
          className="bg-gradient-to-r from-purple-600 to-purple-700"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh Intelligence
        </Button>
      </div>

      {/* Intelligence Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-100">Demand Response</CardTitle>
            <Shield className="h-4 w-4 text-green-200" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {demandResponse ? `${(demandResponse.total_capacity_mw / 1000).toFixed(1)} GW` : '1.2 GW'}
            </div>
            <p className="text-xs text-green-200">
              Total DR Capacity
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-100">Grid Reliability</CardTitle>
            <Activity className="h-4 w-4 text-blue-200" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {gridReliability ? `${gridReliability.system_adequacy.reserve_margin_percentage.toFixed(1)}%` : '18.5%'}
            </div>
            <p className="text-xs text-blue-200">
              Reserve Margin
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white border-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-orange-100">Carbon Intensity</CardTitle>
            <CloudRain className="h-4 w-4 text-orange-200" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {carbonIntensity ? `${carbonIntensity.current_intensity_kg_co2_mwh.toFixed(0)}` : '425'} kg
            </div>
            <p className="text-xs text-orange-200">
              CO2/MWh
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-100">Price Volatility</CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-200" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {volatilityAnalytics ? `${volatilityAnalytics.price_volatility.current_volatility_percentage.toFixed(1)}%` : '22.3%'}
            </div>
            <p className="text-xs text-purple-200">Current Volatility</p>
          </CardContent>
        </Card>
      </div>

      {/* Intelligence Tools Tabs */}
      <Tabs defaultValue="demand-response" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5 lg:grid-cols-10">
          <TabsTrigger value="demand-response" className="text-xs">
            <Shield className="w-3 h-3 mr-1" />
            DR
          </TabsTrigger>
          <TabsTrigger value="transmission-loss" className="text-xs">
            <Zap className="w-3 h-3 mr-1" />
            Loss
          </TabsTrigger>
          <TabsTrigger value="merit-order" className="text-xs">
            <BarChart3 className="w-3 h-3 mr-1" />
            Merit
          </TabsTrigger>
          <TabsTrigger value="ancillary-services" className="text-xs">
            <Settings className="w-3 h-3 mr-1" />
            Ancillary
          </TabsTrigger>
          <TabsTrigger value="intertie-flows" className="text-xs">
            <Activity className="w-3 h-3 mr-1" />
            Intertie
          </TabsTrigger>
          <TabsTrigger value="weather-impact" className="text-xs">
            <CloudRain className="w-3 h-3 mr-1" />
            Weather
          </TabsTrigger>
          <TabsTrigger value="carbon-intensity" className="text-xs">
            <Wind className="w-3 h-3 mr-1" />
            Carbon
          </TabsTrigger>
          <TabsTrigger value="market-participants" className="text-xs">
            <Factory className="w-3 h-3 mr-1" />
            Participants
          </TabsTrigger>
          <TabsTrigger value="grid-reliability" className="text-xs">
            <Gauge className="w-3 h-3 mr-1" />
            Reliability
          </TabsTrigger>
          <TabsTrigger value="volatility-analytics" className="text-xs">
            <TrendingUp className="w-3 h-3 mr-1" />
            Volatility
          </TabsTrigger>
        </TabsList>

        <TabsContent value="demand-response">
          <DemandResponsePanel 
            demandResponse={demandResponse}
            loading={loading}
          />
        </TabsContent>

        <TabsContent value="transmission-loss">
          <TransmissionLossPanel 
            transmissionLossFactors={transmissionLossFactors}
            loading={loading}
          />
        </TabsContent>

        <TabsContent value="merit-order">
          <MeritOrderPanel 
            meritOrder={meritOrder}
            loading={loading}
          />
        </TabsContent>

        <TabsContent value="ancillary-services">
          <AncillaryServicesPanel 
            ancillaryServices={ancillaryServices}
            loading={loading}
          />
        </TabsContent>

        <TabsContent value="intertie-flows">
          <IntertieFlowsPanel 
            intertieFlows={intertieFlows}
            loading={loading}
          />
        </TabsContent>

        <TabsContent value="weather-impact">
          <WeatherImpactPanel 
            weatherImpact={weatherImpact}
            loading={loading}
          />
        </TabsContent>

        <TabsContent value="carbon-intensity">
          <CarbonIntensityPanel 
            carbonIntensity={carbonIntensity}
            loading={loading}
          />
        </TabsContent>

        <TabsContent value="market-participants">
          <MarketParticipantsPanel 
            marketParticipants={marketParticipants}
            loading={loading}
          />
        </TabsContent>

        <TabsContent value="grid-reliability">
          <GridReliabilityPanel 
            gridReliability={gridReliability}
            loading={loading}
          />
        </TabsContent>

        <TabsContent value="volatility-analytics">
          <VolatilityAnalyticsPanel 
            volatilityAnalytics={volatilityAnalytics}
            loading={loading}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

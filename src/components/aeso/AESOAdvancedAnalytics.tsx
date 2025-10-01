import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Cable, 
  TrendingUp, 
  Factory, 
  AlertTriangle,
  Battery,
  MapPin,
  Shield,
  Activity,
  Zap
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface TransmissionConstraint {
  constraint_name: string;
  limit_mw: number;
  flow_mw: number;
  utilization_percent: number;
  status: 'normal' | 'warning' | 'critical';
  region: string;
}

interface ForecastData {
  date: string;
  demand_forecast_mw: number;
  wind_forecast_mw: number;
  solar_forecast_mw: number;
  price_forecast: number;
  confidence_level: number;
}

interface MarketParticipant {
  participant_name: string;
  total_capacity_mw: number;
  available_capacity_mw: number;
  generation_type: string;
  market_share_percent: number;
}

interface OutageEvent {
  asset_name: string;
  outage_type: 'planned' | 'forced';
  capacity_mw: number;
  start_time: string;
  end_time: string;
  status: string;
  impact_level: 'low' | 'medium' | 'high';
}

interface StorageMetrics {
  facility_name: string;
  capacity_mw: number;
  state_of_charge_percent: number;
  charging_mw: number;
  discharging_mw: number;
  cycles_today: number;
}

interface GridStabilityMetrics {
  timestamp: string;
  frequency_hz: number;
  spinning_reserve_mw: number;
  supplemental_reserve_mw: number;
  system_inertia: number;
  stability_score: number;
}

export function AESOAdvancedAnalytics() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  
  // State for all analytics data
  const [transmissionConstraints, setTransmissionConstraints] = useState<TransmissionConstraint[]>([]);
  const [sevenDayForecast, setSevenDayForecast] = useState<ForecastData[]>([]);
  const [marketParticipants, setMarketParticipants] = useState<MarketParticipant[]>([]);
  const [outageEvents, setOutageEvents] = useState<OutageEvent[]>([]);
  const [storageMetrics, setStorageMetrics] = useState<StorageMetrics[]>([]);
  const [gridStability, setGridStability] = useState<GridStabilityMetrics | null>(null);

  useEffect(() => {
    fetchAdvancedAnalytics();
  }, []);

  const fetchAdvancedAnalytics = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('aeso-advanced-analytics', {
        body: { action: 'fetch_all' }
      });

      if (error) throw error;

      if (data) {
        setTransmissionConstraints(data.transmission_constraints || []);
        setSevenDayForecast(data.seven_day_forecast || []);
        setMarketParticipants(data.market_participants || []);
        setOutageEvents(data.outage_events || []);
        setStorageMetrics(data.storage_metrics || []);
        setGridStability(data.grid_stability || null);
      }
    } catch (error: any) {
      console.error('Error fetching advanced analytics:', error);
      toast({
        title: 'Error Loading Data',
        description: error.message || 'Failed to fetch advanced analytics data',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'critical': return 'destructive';
      case 'warning': return 'default';
      default: return 'secondary';
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'destructive';
      case 'medium': return 'default';
      default: return 'secondary';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <Activity className="w-12 h-12 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Loading advanced analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="transmission" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-6">
          <TabsTrigger value="transmission" className="text-xs sm:text-sm">
            <Cable className="w-4 h-4 mr-1" />
            Transmission
          </TabsTrigger>
          <TabsTrigger value="forecast" className="text-xs sm:text-sm">
            <TrendingUp className="w-4 h-4 mr-1" />
            7-Day Forecast
          </TabsTrigger>
          <TabsTrigger value="participants" className="text-xs sm:text-sm">
            <Factory className="w-4 h-4 mr-1" />
            Participants
          </TabsTrigger>
          <TabsTrigger value="outages" className="text-xs sm:text-sm">
            <AlertTriangle className="w-4 h-4 mr-1" />
            Outages
          </TabsTrigger>
          <TabsTrigger value="storage" className="text-xs sm:text-sm">
            <Battery className="w-4 h-4 mr-1" />
            Storage
          </TabsTrigger>
          <TabsTrigger value="stability" className="text-xs sm:text-sm">
            <Shield className="w-4 h-4 mr-1" />
            Grid Stability
          </TabsTrigger>
        </TabsList>

        {/* Transmission Constraints Tab */}
        <TabsContent value="transmission" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Cable className="w-5 h-5 mr-2 text-orange-600" />
                Transmission Constraints & Grid Congestion
              </CardTitle>
            </CardHeader>
            <CardContent>
              {transmissionConstraints.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No active transmission constraints</p>
              ) : (
                <div className="space-y-4">
                  {transmissionConstraints.map((constraint, index) => (
                    <div key={index} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold">{constraint.constraint_name}</h3>
                          <p className="text-sm text-muted-foreground">{constraint.region}</p>
                        </div>
                        <Badge variant={getStatusColor(constraint.status)}>
                          {constraint.status.toUpperCase()}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Flow</p>
                          <p className="font-semibold">{constraint.flow_mw.toFixed(0)} MW</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Limit</p>
                          <p className="font-semibold">{constraint.limit_mw.toFixed(0)} MW</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Utilization</p>
                          <p className="font-semibold">{constraint.utilization_percent.toFixed(1)}%</p>
                        </div>
                      </div>
                      <div className="w-full bg-secondary rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${
                            constraint.utilization_percent > 90 ? 'bg-destructive' :
                            constraint.utilization_percent > 75 ? 'bg-yellow-500' :
                            'bg-green-500'
                          }`}
                          style={{ width: `${Math.min(constraint.utilization_percent, 100)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* 7-Day Forecast Tab */}
        <TabsContent value="forecast" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="w-5 h-5 mr-2 text-blue-600" />
                7-Day Market Forecast
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {sevenDayForecast.map((forecast, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-semibold">{new Date(forecast.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</h3>
                        <p className="text-xs text-muted-foreground">Confidence: {forecast.confidence_level}%</p>
                      </div>
                      <Badge variant="outline">CA${forecast.price_forecast.toFixed(2)}/MWh</Badge>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Demand</p>
                        <p className="font-semibold">{(forecast.demand_forecast_mw / 1000).toFixed(1)} GW</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Wind</p>
                        <p className="font-semibold">{(forecast.wind_forecast_mw / 1000).toFixed(1)} GW</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Solar</p>
                        <p className="font-semibold">{forecast.solar_forecast_mw.toFixed(0)} MW</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Market Participants Tab */}
        <TabsContent value="participants" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Factory className="w-5 h-5 mr-2 text-purple-600" />
                Market Participants & Generation Assets
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {marketParticipants.map((participant, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-semibold">{participant.participant_name}</h3>
                        <p className="text-sm text-muted-foreground">{participant.generation_type}</p>
                      </div>
                      <Badge variant="secondary">{participant.market_share_percent.toFixed(1)}% Market Share</Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm mt-3">
                      <div>
                        <p className="text-muted-foreground">Total Capacity</p>
                        <p className="font-semibold">{participant.total_capacity_mw.toFixed(0)} MW</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Available Now</p>
                        <p className="font-semibold">{participant.available_capacity_mw.toFixed(0)} MW</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Outages Tab */}
        <TabsContent value="outages" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <AlertTriangle className="w-5 h-5 mr-2 text-red-600" />
                Generation & Transmission Outages
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {outageEvents.map((outage, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-semibold">{outage.asset_name}</h3>
                        <p className="text-sm text-muted-foreground">{outage.capacity_mw.toFixed(0)} MW</p>
                      </div>
                      <div className="flex gap-2">
                        <Badge variant={getImpactColor(outage.impact_level)}>
                          {outage.impact_level.toUpperCase()} IMPACT
                        </Badge>
                        <Badge variant={outage.outage_type === 'forced' ? 'destructive' : 'secondary'}>
                          {outage.outage_type.toUpperCase()}
                        </Badge>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Start</p>
                        <p className="font-semibold">{new Date(outage.start_time).toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">End</p>
                        <p className="font-semibold">{new Date(outage.end_time).toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Storage Tab */}
        <TabsContent value="storage" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Battery className="w-5 h-5 mr-2 text-green-600" />
                Energy Storage & Grid Flexibility
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {storageMetrics.map((storage, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="font-semibold">{storage.facility_name}</h3>
                      <Badge variant="outline">{storage.capacity_mw.toFixed(0)} MW</Badge>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-muted-foreground">State of Charge</span>
                          <span className="font-semibold">{storage.state_of_charge_percent.toFixed(1)}%</span>
                        </div>
                        <div className="w-full bg-secondary rounded-full h-2">
                          <div 
                            className="h-2 rounded-full bg-green-500"
                            style={{ width: `${storage.state_of_charge_percent}%` }}
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Charging</p>
                          <p className="font-semibold text-green-600">+{storage.charging_mw.toFixed(0)} MW</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Discharging</p>
                          <p className="font-semibold text-orange-600">-{storage.discharging_mw.toFixed(0)} MW</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Cycles Today</p>
                          <p className="font-semibold">{storage.cycles_today}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Grid Stability Tab */}
        <TabsContent value="stability" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="w-5 h-5 mr-2 text-blue-600" />
                Real-time Grid Stability Metrics
              </CardTitle>
            </CardHeader>
            <CardContent>
              {gridStability ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <Zap className="w-8 h-8 mx-auto mb-2 text-yellow-600" />
                          <p className="text-sm text-muted-foreground">Frequency</p>
                          <p className="text-2xl font-bold">{gridStability.frequency_hz.toFixed(3)} Hz</p>
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <Shield className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                          <p className="text-sm text-muted-foreground">Spinning Reserve</p>
                          <p className="text-2xl font-bold">{gridStability.spinning_reserve_mw.toFixed(0)} MW</p>
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <Activity className="w-8 h-8 mx-auto mb-2 text-purple-600" />
                          <p className="text-sm text-muted-foreground">System Inertia</p>
                          <p className="text-2xl font-bold">{gridStability.system_inertia.toFixed(1)} GW·s</p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Grid Stability Score</span>
                          <span className="text-lg font-bold">{gridStability.stability_score.toFixed(1)}/100</span>
                        </div>
                        <div className="w-full bg-secondary rounded-full h-3">
                          <div 
                            className={`h-3 rounded-full ${
                              gridStability.stability_score > 80 ? 'bg-green-500' :
                              gridStability.stability_score > 60 ? 'bg-yellow-500' :
                              'bg-red-500'
                            }`}
                            style={{ width: `${gridStability.stability_score}%` }}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <div className="text-sm text-muted-foreground">
                    <p>Supplemental Reserve: {gridStability.supplemental_reserve_mw.toFixed(0)} MW</p>
                    <p>Last Updated: {new Date(gridStability.timestamp).toLocaleString()}</p>
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-8">No grid stability data available</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

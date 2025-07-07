import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAESOData } from '@/hooks/useAESOData';
import { useERCOTData } from '@/hooks/useERCOTData';
import { 
  TrendingUp, 
  Zap, 
  Activity, 
  DollarSign, 
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Info,
  BarChart3,
  Globe,
  Lightbulb
} from 'lucide-react';

interface MarketAlert {
  id: string;
  market: string;
  type: 'price_spike' | 'high_demand' | 'low_renewables' | 'maintenance';
  message: string;
  severity: 'low' | 'medium' | 'high';
  timestamp: string;
}

export const VoltMarketRealTimeData: React.FC = () => {
  const { pricing: aesoPricing, loadData: aesoLoad, generationMix: aesoGeneration, loading: aesoLoading } = useAESOData();
  const { pricing: ercotPricing, loadData: ercotLoad, generationMix: ercotGeneration, loading: ercotLoading } = useERCOTData();
  
  const [selectedMarket, setSelectedMarket] = useState('overview');
  const [marketAlerts, setMarketAlerts] = useState<MarketAlert[]>([]);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  // Generate market alerts based on current data
  useEffect(() => {
    const alerts: MarketAlert[] = [];
    
    if (aesoPricing && aesoPricing.current_price > 80) {
      alerts.push({
        id: 'aeso-price-high',
        market: 'AESO',
        type: 'price_spike',
        message: `High electricity prices in Alberta: $${aesoPricing.current_price.toFixed(2)}/MWh`,
        severity: 'high',
        timestamp: new Date().toISOString()
      });
    }

    if (ercotPricing && ercotPricing.current_price > 100) {
      alerts.push({
        id: 'ercot-price-high',
        market: 'ERCOT',
        type: 'price_spike',
        message: `High electricity prices in Texas: $${ercotPricing.current_price.toFixed(2)}/MWh`,
        severity: 'high',
        timestamp: new Date().toISOString()
      });
    }

    if (aesoGeneration && aesoGeneration.renewable_percentage < 30) {
      alerts.push({
        id: 'aeso-renewables-low',
        market: 'AESO',
        type: 'low_renewables',
        message: `Low renewable generation in Alberta: ${aesoGeneration.renewable_percentage.toFixed(1)}%`,
        severity: 'medium',
        timestamp: new Date().toISOString()
      });
    }

    setMarketAlerts(alerts);
    setLastUpdate(new Date());
  }, [aesoPricing, ercotPricing, aesoGeneration]);

  const getAlertIcon = (severity: string) => {
    switch (severity) {
      case 'high': return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'medium': return <Info className="w-4 h-4 text-yellow-500" />;
      default: return <CheckCircle className="w-4 h-4 text-green-500" />;
    }
  };

  const getMarketConditionBadge = (price: number, market: string) => {
    const threshold = market === 'AESO' ? 60 : 80;
    if (price > threshold * 1.5) return <Badge variant="destructive">High Demand</Badge>;
    if (price > threshold) return <Badge className="bg-yellow-500">Elevated</Badge>;
    return <Badge className="bg-green-500">Normal</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Market Overview Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Globe className="w-6 h-6 text-blue-600" />
              <CardTitle>Real-Time Energy Markets</CardTitle>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Activity className="w-4 h-4" />
                <span>Last update: {lastUpdate.toLocaleTimeString()}</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setLastUpdate(new Date())}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Market Alerts */}
          {marketAlerts.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-900 mb-3">Market Alerts</h3>
              <div className="space-y-2">
                {marketAlerts.map((alert) => (
                  <div key={alert.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    {getAlertIcon(alert.severity)}
                    <div className="flex-1">
                      <p className="text-sm font-medium">{alert.message}</p>
                      <p className="text-xs text-gray-600">{alert.market} • {new Date(alert.timestamp).toLocaleTimeString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quick Market Summary */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium">AESO Price</span>
              </div>
              <div className="text-xl font-bold text-blue-600">
                ${aesoPricing?.current_price?.toFixed(2) || '0.00'}
              </div>
              <div className="mt-1">
                {aesoPricing && getMarketConditionBadge(aesoPricing.current_price, 'AESO')}
              </div>
            </div>

            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium">ERCOT Price</span>
              </div>
              <div className="text-xl font-bold text-green-600">
                ${ercotPricing?.current_price?.toFixed(2) || '0.00'}
              </div>
              <div className="mt-1">
                {ercotPricing && getMarketConditionBadge(ercotPricing.current_price, 'ERCOT')}
              </div>
            </div>

            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Lightbulb className="w-4 h-4 text-purple-600" />
                <span className="text-sm font-medium">AB Renewables</span>
              </div>
              <div className="text-xl font-bold text-purple-600">
                {aesoGeneration?.renewable_percentage?.toFixed(1) || '0.0'}%
              </div>
            </div>

            <div className="bg-orange-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <BarChart3 className="w-4 h-4 text-orange-600" />
                <span className="text-sm font-medium">TX Demand</span>
              </div>
              <div className="text-xl font-bold text-orange-600">
                {ercotLoad?.current_demand_mw?.toLocaleString() || '0'} MW
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Market Data */}
      <Tabs value={selectedMarket} onValueChange={setSelectedMarket}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Market Overview</TabsTrigger>
          <TabsTrigger value="aeso">AESO (Alberta)</TabsTrigger>
          <TabsTrigger value="ercot">ERCOT (Texas)</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* AESO Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-blue-600" />
                  Alberta (AESO)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Current Price</p>
                    <p className="text-lg font-semibold">${aesoPricing?.current_price?.toFixed(2)}/MWh</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Demand</p>
                    <p className="text-lg font-semibold">{aesoLoad?.current_demand_mw?.toLocaleString()} MW</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Generation</p>
                    <p className="text-lg font-semibold">{aesoGeneration?.total_generation_mw?.toLocaleString()} MW</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Renewables</p>
                    <p className="text-lg font-semibold">{aesoGeneration?.renewable_percentage?.toFixed(1)}%</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* ERCOT Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-green-600" />
                  Texas (ERCOT)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Current Price</p>
                    <p className="text-lg font-semibold">${ercotPricing?.current_price?.toFixed(2)}/MWh</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Demand</p>
                    <p className="text-lg font-semibold">{ercotLoad?.current_demand_mw?.toLocaleString()} MW</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Generation</p>
                    <p className="text-lg font-semibold">{ercotGeneration?.total_generation_mw?.toLocaleString()} MW</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Renewables</p>
                    <p className="text-lg font-semibold">{ercotGeneration?.renewable_percentage?.toFixed(1)}%</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Market Intelligence */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Market Intelligence
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">Price Arbitrage Opportunity</h4>
                  <p className="text-sm text-blue-800">
                    Current price differential between AESO and ERCOT: ${Math.abs((aesoPricing?.current_price || 0) - (ercotPricing?.current_price || 0)).toFixed(2)}/MWh. 
                    Consider market timing for energy-intensive operations.
                  </p>
                </div>
                
                <div className="p-4 bg-green-50 rounded-lg">
                  <h4 className="font-medium text-green-900 mb-2">Renewable Energy Status</h4>
                  <p className="text-sm text-green-800">
                    Alberta currently generating {aesoGeneration?.renewable_percentage?.toFixed(1)}% from renewables, 
                    while Texas is at {ercotGeneration?.renewable_percentage?.toFixed(1)}%. 
                    High renewable periods offer cost advantages for ESG-focused operations.
                  </p>
                </div>

                <div className="p-4 bg-yellow-50 rounded-lg">
                  <h4 className="font-medium text-yellow-900 mb-2">Capacity Insights</h4>
                  <p className="text-sm text-yellow-800">
                    Reserve margins: AESO {aesoLoad?.reserve_margin?.toFixed(1)}%, ERCOT {ercotLoad?.reserve_margin?.toFixed(1)}%. 
                    Lower margins indicate tighter supply and potential for price volatility.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="aeso" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>AESO Pricing</CardTitle>
              </CardHeader>
              <CardContent>
                {aesoLoading ? (
                  <div className="animate-pulse space-y-4">
                    <div className="h-4 bg-gray-200 rounded"></div>
                    <div className="h-4 bg-gray-200 rounded"></div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span>Current</span>
                      <span className="font-semibold">${aesoPricing?.current_price?.toFixed(2)}/MWh</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Average</span>
                      <span>${aesoPricing?.average_price?.toFixed(2)}/MWh</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Peak</span>
                      <span>${aesoPricing?.peak_price?.toFixed(2)}/MWh</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Off-Peak</span>
                      <span>${aesoPricing?.off_peak_price?.toFixed(2)}/MWh</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Generation Mix</CardTitle>
              </CardHeader>
              <CardContent>
                {aesoGeneration && (
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span>Natural Gas</span>
                      <span>{aesoGeneration.natural_gas_mw} MW</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Wind</span>
                      <span className="text-green-600">{aesoGeneration.wind_mw} MW</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Hydro</span>
                      <span className="text-blue-600">{aesoGeneration.hydro_mw} MW</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Solar</span>
                      <span className="text-yellow-600">{aesoGeneration.solar_mw} MW</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Coal</span>
                      <span>{aesoGeneration.coal_mw} MW</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="ercot" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>ERCOT Pricing</CardTitle>
              </CardHeader>
              <CardContent>
                {ercotLoading ? (
                  <div className="animate-pulse space-y-4">
                    <div className="h-4 bg-gray-200 rounded"></div>
                    <div className="h-4 bg-gray-200 rounded"></div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span>Current</span>
                      <span className="font-semibold">${ercotPricing?.current_price?.toFixed(2)}/MWh</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Average</span>
                      <span>${ercotPricing?.average_price?.toFixed(2)}/MWh</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Peak</span>
                      <span>${ercotPricing?.peak_price?.toFixed(2)}/MWh</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Off-Peak</span>
                      <span>${ercotPricing?.off_peak_price?.toFixed(2)}/MWh</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Generation Mix</CardTitle>
              </CardHeader>
              <CardContent>
                {ercotGeneration && (
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span>Natural Gas</span>
                      <span>{ercotGeneration.natural_gas_mw} MW</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Wind</span>
                      <span className="text-green-600">{ercotGeneration.wind_mw} MW</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Solar</span>
                      <span className="text-yellow-600">{ercotGeneration.solar_mw} MW</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Nuclear</span>
                      <span className="text-purple-600">{ercotGeneration.nuclear_mw} MW</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
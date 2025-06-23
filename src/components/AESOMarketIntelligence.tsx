
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
  RefreshCw
} from 'lucide-react';
import { useAESOEnhancedData } from '@/hooks/useAESOEnhancedData';
import { AESOMarketAnalyticsPanel } from './intelligence/AESOMarketAnalyticsPanel';
import { AESOForecastPanel } from './intelligence/AESOForecastPanel';
import { AESOOutagesPanel } from './intelligence/AESOOutagesPanel';
import { AESOAlertsPanel } from './intelligence/AESOAlertsPanel';
import { AESOInvestmentPanel } from './intelligence/AESOInvestmentPanel';

export function AESOMarketIntelligence() {
  const {
    windSolarForecast,
    assetOutages,
    historicalPrices,
    marketAnalytics,
    alerts,
    loading,
    refetchAll,
    dismissAlert,
    clearAllAlerts
  } = useAESOEnhancedData();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 p-4 sm:p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground flex items-center">
            <Brain className="w-6 h-6 mr-2 text-blue-600" />
            AESO Market Intelligence Platform
          </h1>
          <p className="text-muted-foreground">Advanced analytics and forecasting for Alberta's electricity market</p>
        </div>
        <Button 
          onClick={refetchAll}
          disabled={loading}
          className="bg-gradient-to-r from-blue-600 to-blue-700"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh Intelligence
        </Button>
      </div>

      {/* Alerts Panel */}
      {alerts.length > 0 && (
        <AESOAlertsPanel 
          alerts={alerts}
          onDismissAlert={dismissAlert}
          onClearAll={clearAllAlerts}
        />
      )}

      {/* Market Intelligence Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-100">Market Stress</CardTitle>
            <Gauge className="h-4 w-4 text-green-200" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {marketAnalytics?.market_stress_score ? `${marketAnalytics.market_stress_score}/100` : 'Loading...'}
            </div>
            <p className="text-xs text-green-200">
              {marketAnalytics?.market_stress_score > 70 ? 'High Stress' : 
               marketAnalytics?.market_stress_score > 40 ? 'Moderate' : 'Low Stress'}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-100">Price Prediction</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-200" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {marketAnalytics?.price_prediction?.next_hour_prediction ? 
                `$${marketAnalytics.price_prediction.next_hour_prediction.toFixed(0)}` : 'Loading...'}
            </div>
            <p className="text-xs text-blue-200">
              {marketAnalytics?.price_prediction?.confidence ? 
                `${marketAnalytics.price_prediction.confidence}% confidence` : 'Next hour forecast'}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white border-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-orange-100">Asset Outages</CardTitle>
            <Factory className="h-4 w-4 text-orange-200" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {assetOutages?.total_outage_capacity_mw ? 
                `${(assetOutages.total_outage_capacity_mw / 1000).toFixed(1)} GW` : 'Loading...'}
            </div>
            <p className="text-xs text-orange-200">
              {assetOutages?.total_outages ? `${assetOutages.total_outages} outages` : 'Offline capacity'}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-100">Investment Score</CardTitle>
            <Target className="h-4 w-4 text-purple-200" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {marketAnalytics?.investment_opportunities?.length ? 
                `${marketAnalytics.investment_opportunities.filter(op => op.priority === 'high').length}/5` : 'Loading...'}
            </div>
            <p className="text-xs text-purple-200">High priority opportunities</p>
          </CardContent>
        </Card>
      </div>

      {/* Intelligence Tabs */}
      <Tabs defaultValue="analytics" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="analytics" className="flex items-center space-x-2">
            <BarChart3 className="w-4 h-4" />
            <span>Analytics</span>
          </TabsTrigger>
          <TabsTrigger value="forecast" className="flex items-center space-x-2">
            <Wind className="w-4 h-4" />
            <span>Forecasts</span>
          </TabsTrigger>
          <TabsTrigger value="outages" className="flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4" />
            <span>Outages</span>
          </TabsTrigger>
          <TabsTrigger value="investment" className="flex items-center space-x-2">
            <Target className="w-4 h-4" />
            <span>Investment</span>
          </TabsTrigger>
          <TabsTrigger value="alerts" className="flex items-center space-x-2">
            <Zap className="w-4 h-4" />
            <span>Alerts</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="analytics">
          <AESOMarketAnalyticsPanel 
            marketAnalytics={marketAnalytics}
            historicalPrices={historicalPrices}
            loading={loading}
          />
        </TabsContent>

        <TabsContent value="forecast">
          <AESOForecastPanel 
            windSolarForecast={windSolarForecast}
            loading={loading}
          />
        </TabsContent>

        <TabsContent value="outages">
          <AESOOutagesPanel 
            assetOutages={assetOutages}
            loading={loading}
          />
        </TabsContent>

        <TabsContent value="investment">
          <AESOInvestmentPanel 
            marketAnalytics={marketAnalytics}
            historicalPrices={historicalPrices}
            loading={loading}
          />
        </TabsContent>

        <TabsContent value="alerts">
          <AESOAlertsPanel 
            alerts={alerts}
            onDismissAlert={dismissAlert}
            onClearAll={clearAllAlerts}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}


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

  // Calculate real values from the data or use fallback values
  const getMarketStressValue = () => {
    if (marketAnalytics?.market_stress_score) {
      return `${marketAnalytics.market_stress_score}/100`;
    }
    // Default stress level
    return '60/100';
  };

  const getMarketStressLevel = () => {
    const score = marketAnalytics?.market_stress_score || 55;
    if (score > 70) return 'High Stress';
    if (score > 40) return 'Moderate';
    return 'Low Stress';
  };

  const getPricePredictionValue = () => {
    if (marketAnalytics?.price_prediction?.next_hour_prediction) {
      return `$${marketAnalytics.price_prediction.next_hour_prediction.toFixed(0)}`;
    }
    return '$46';
  };

  const getPricePredictionConfidence = () => {
    if (marketAnalytics?.price_prediction?.confidence) {
      return `${marketAnalytics.price_prediction.confidence}% confidence`;
    }
    return '85% confidence';
  };

  const getAssetOutagesValue = () => {
    if (assetOutages?.total_outage_capacity_mw) {
      return `${(assetOutages.total_outage_capacity_mw / 1000).toFixed(1)} GW`;
    }
    // Default outage capacity
    return '1.0 GW';
  };

  const getAssetOutagesCount = () => {
    if (assetOutages?.total_outages) {
      return `${assetOutages.total_outages} outages`;
    }
    return '6 outages';
  };

  const getInvestmentScoreValue = () => {
    if (marketAnalytics?.investment_opportunities?.length) {
      const highPriorityCount = marketAnalytics.investment_opportunities.filter(op => op.priority === 'high').length;
      return `${highPriorityCount}/5`;
    }
    return '2/5';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
        <div className="min-w-0 flex-1">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground flex items-center flex-wrap">
            <Brain className="w-5 h-5 sm:w-6 sm:h-6 mr-2 text-blue-600 flex-shrink-0" />
            <span className="break-words">AESO Market Intelligence Platform</span>
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground break-words">Advanced analytics and forecasting for Alberta's electricity market</p>
        </div>
        <Button 
          onClick={refetchAll}
          disabled={loading}
          className="bg-gradient-to-r from-blue-600 to-blue-700 flex-shrink-0 w-full sm:w-auto"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          <span className="sm:inline">Refresh Intelligence</span>
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-100 truncate">Market Stress</CardTitle>
            <Gauge className="h-4 w-4 text-green-200 flex-shrink-0" />
          </CardHeader>
          <CardContent>
            <div className="text-lg sm:text-xl lg:text-2xl font-bold break-all">
              {getMarketStressValue()}
            </div>
            <p className="text-xs text-green-200 break-words">
              {getMarketStressLevel()}
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
              {getPricePredictionValue()}
            </div>
            <p className="text-xs text-blue-200">
              {getPricePredictionConfidence()}
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
              {getAssetOutagesValue()}
            </div>
            <p className="text-xs text-orange-200">
              {getAssetOutagesCount()}
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
              {getInvestmentScoreValue()}
            </div>
            <p className="text-xs text-purple-200">High priority opportunities</p>
          </CardContent>
        </Card>
      </div>

      {/* Intelligence Tabs */}
      <Tabs defaultValue="analytics" className="space-y-4">
        <div className="w-full overflow-x-auto">
          <TabsList className="grid grid-cols-5 w-full min-w-max sm:min-w-0">
            <TabsTrigger value="analytics" className="flex items-center space-x-1 sm:space-x-2 text-xs sm:text-sm px-2 sm:px-4">
              <BarChart3 className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
              <span className="hidden sm:inline">Analytics</span>
            </TabsTrigger>
            <TabsTrigger value="forecast" className="flex items-center space-x-1 sm:space-x-2 text-xs sm:text-sm px-2 sm:px-4">
              <Wind className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
              <span className="hidden sm:inline">Forecasts</span>
            </TabsTrigger>
            <TabsTrigger value="outages" className="flex items-center space-x-1 sm:space-x-2 text-xs sm:text-sm px-2 sm:px-4">
              <AlertTriangle className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
              <span className="hidden sm:inline">Outages</span>
            </TabsTrigger>
            <TabsTrigger value="investment" className="flex items-center space-x-1 sm:space-x-2 text-xs sm:text-sm px-2 sm:px-4">
              <Target className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
              <span className="hidden sm:inline">Investment</span>
            </TabsTrigger>
            <TabsTrigger value="alerts" className="flex items-center space-x-1 sm:space-x-2 text-xs sm:text-sm px-2 sm:px-4">
              <Zap className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
              <span className="hidden sm:inline">Alerts</span>
            </TabsTrigger>
          </TabsList>
        </div>

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

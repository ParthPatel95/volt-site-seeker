import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Zap, Activity, Gauge, Wind, RefreshCw, MapPin,
  DollarSign, Brain, AlertTriangle, Target,
  Server, MessageSquare, Calculator, Calendar, FileSpreadsheet
} from 'lucide-react';
import { useOptimizedDashboard } from '@/hooks/useOptimizedDashboard';
import { useAESOEnhancedData } from '@/hooks/useAESOEnhancedData';
import { useAESOMarketData } from '@/hooks/useAESOMarketData';
import { useAESOPricePrediction } from '@/hooks/useAESOPricePrediction';
import { useAESOCrossValidation } from '@/hooks/useAESOCrossValidation';
import { useAESOEnsemble } from '@/hooks/useAESOEnsemble';
import { useDatacenterAutomation } from '@/hooks/useDatacenterAutomation';
import { useExchangeRate } from '@/hooks/useExchangeRate';

// Tab components
import { MarketDataTab } from './tabs/MarketDataTab';
import { PowerModelTab } from './tabs/PowerModelTab';
import { TelegramAlertsTab } from './tabs/TelegramAlertsTab';
import { PredictionsTab } from './tabs/PredictionsTab';
import { DatacenterTab } from './tabs/DatacenterTab';
import { HistoricalTab } from './tabs/HistoricalTab';
import { AnalyticsExportTab } from './tabs/AnalyticsExportTab';
import { GenerationTab } from './tabs/GenerationTab';
import { ForecastTab } from './tabs/ForecastTab';
import { OutagesAlertsTab } from './tabs/OutagesAlertsTab';
import { CustomDashboardsTab } from './tabs/CustomDashboardsTab';

export function AESOMarketHub() {
  const [activeTab, setActiveTab] = React.useState('market');

  const {
    aesoPricing: pricing, aesoLoad: loadData, aesoGeneration: generationMix,
    isLoading: basicLoading, refreshData
  } = useOptimizedDashboard();

  const {
    windSolarForecast, assetOutages, historicalPrices, marketAnalytics,
    alerts, loading: enhancedLoading, refetchAll: refetchEnhanced,
    dismissAlert, clearAllAlerts
  } = useAESOEnhancedData();

  const {
    operatingReserve, interchange, energyStorage,
    loading: marketLoading, refetch: refetchMarket
  } = useAESOMarketData();

  const { runCompletePipeline, loading: pipelineLoading } = useAESOPricePrediction();
  const { runCrossValidation, loading: cvLoading, results: cvResults } = useAESOCrossValidation();
  const { generateEnsemblePredictions, loading: ensembleLoading, predictions: ensemblePredictions } = useAESOEnsemble();
  const { exchangeRate, convertToUSD } = useExchangeRate();
  const { rules: datacenterRules } = useDatacenterAutomation();

  const loading = basicLoading || enhancedLoading || marketLoading;

  // Auto-load AI ensemble predictions on mount
  const hasLoadedPredictions = React.useRef(false);
  React.useEffect(() => {
    if (!hasLoadedPredictions.current && (!ensemblePredictions || ensemblePredictions.length === 0)) {
      hasLoadedPredictions.current = true;
      generateEnsemblePredictions(24);
    }
  }, [ensemblePredictions, generateEnsemblePredictions]);

  const currentPrice = pricing?.current_price ?? 0;
  const hasValidPrice = pricing !== null && pricing !== undefined;
  const priceTimestamp = pricing?.timestamp;

  const handleRefreshAll = () => {
    refreshData();
    refetchEnhanced();
    refetchMarket();
    generateEnsemblePredictions(24);
  };

  const formatPrice = (cadPrice: number) => ({
    cad: `CA$${cadPrice.toFixed(2)}`,
    usd: `CA$${cadPrice.toFixed(2)}`
  });

  // 95% uptime average calculation
  const uptimeData = useMemo(() => {
    if (historicalPrices?.prices && historicalPrices.prices.length > 0) {
      const prices = historicalPrices.prices.map((p: any) => p.pool_price).sort((a: number, b: number) => a - b);
      const index95 = Math.floor(prices.length * 0.95);
      const prices95 = prices.slice(0, index95);
      const uptimeAverage = prices95.reduce((sum: number, p: number) => sum + p, 0) / prices95.length;
      return {
        uptimeAverage, uptimePercentage: 95,
        excludedPrices: prices.length - prices95.length, totalDataPoints: prices.length,
        daysOfData: Math.round(prices.length / 24), isLive: true
      };
    }
    return {
      uptimeAverage: pricing?.average_price || 0, uptimePercentage: 95,
      excludedPrices: 0, totalDataPoints: 0, daysOfData: 0, isLive: false
    };
  }, [historicalPrices, pricing]);

  const priceCeilings = useMemo(() => {
    const activeRule = datacenterRules.find((r: any) => r.is_active);
    if (!activeRule) return undefined;
    return {
      hardCeiling: activeRule.price_ceiling_cad,
      softCeiling: activeRule.soft_ceiling_cad || activeRule.price_ceiling_cad * 0.85,
      floor: activeRule.price_floor_cad,
      ruleName: activeRule.name
    };
  }, [datacenterRules]);

  const getMarketStressValue = () => marketAnalytics?.market_stress_score ? `${marketAnalytics.market_stress_score}/100` : null;
  const getMarketStressLevel = () => {
    if (!marketAnalytics?.market_stress_score) return null;
    const score = marketAnalytics.market_stress_score;
    if (score > 70) return 'High Stress';
    if (score > 40) return 'Moderate';
    return 'Low Stress';
  };

  const navigationItems = useMemo(() => [
    { id: 'market', label: 'Market Data', icon: Zap },
    { id: 'power-model', label: 'Power Model', icon: Calculator },
    { id: 'telegram-alerts', label: 'Telegram Alerts', icon: MessageSquare },
    { id: 'predictions', label: 'AI Predictions', icon: Brain },
    { id: 'datacenter', label: 'Datacenter Control', icon: Server },
    { id: 'historical', label: 'Historical', icon: Calendar },
    { id: 'analytics-export', label: 'Analytics Export', icon: FileSpreadsheet },
    { id: 'generation', label: 'Generation', icon: Activity },
    { id: 'forecast', label: 'Forecasts', icon: Wind },
    { id: 'outages-alerts', label: 'Outages & Alerts', icon: AlertTriangle },
    { id: 'custom-dashboards', label: 'Dashboards', icon: Target },
  ], []);

  return (
    <div className="min-h-screen bg-background">
      <div className="container-responsive py-4 sm:py-6 lg:py-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-border">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <MapPin className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-semibold text-foreground">AESO Market Hub</h1>
                <p className="text-sm text-muted-foreground">Alberta electricity market data & analytics</p>
              </div>
            </div>
          </div>
          <Button onClick={handleRefreshAll} disabled={loading} variant="outline" size="sm">
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {/* Navigation */}
        <div className="space-y-6 sm:space-y-8">
          <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border/50 -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 shadow-sm">
            <div className="max-w-7xl mx-auto py-2 overflow-x-auto scrollbar-hide" style={{ WebkitOverflowScrolling: 'touch' }}>
              <div className="flex items-center gap-1 sm:gap-2 min-w-max">
                {navigationItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <Button
                      key={item.id}
                      variant={isActive ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setActiveTab(item.id)}
                      className={`flex items-center gap-1.5 flex-shrink-0 px-3 py-1.5 text-xs sm:text-sm ${
                        isActive ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                      <span className="whitespace-nowrap">{item.label}</span>
                    </Button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Tab Content */}
          {activeTab === 'market' && (
            <MarketDataTab
              pricing={pricing} loadData={loadData} generationMix={generationMix}
              historicalPrices={historicalPrices} operatingReserve={operatingReserve}
              interchange={interchange} energyStorage={energyStorage} marketAnalytics={marketAnalytics}
              currentPrice={currentPrice} hasValidPrice={hasValidPrice} priceTimestamp={priceTimestamp}
              uptimeData={uptimeData} priceCeilings={priceCeilings}
              loading={loading} enhancedLoading={enhancedLoading}
              ensembleLoading={ensembleLoading} ensemblePredictions={ensemblePredictions || []}
              handleRefreshAll={handleRefreshAll} generateEnsemblePredictions={generateEnsemblePredictions}
            />
          )}
          {activeTab === 'power-model' && <PowerModelTab />}
          {activeTab === 'telegram-alerts' && <TelegramAlertsTab />}
          {activeTab === 'predictions' && <PredictionsTab />}
          {activeTab === 'datacenter' && <DatacenterTab currentPrice={currentPrice} />}
          {activeTab === 'historical' && <HistoricalTab />}
          {activeTab === 'analytics-export' && <AnalyticsExportTab />}
          {activeTab === 'generation' && <GenerationTab generationMix={generationMix} />}
          {activeTab === 'forecast' && <ForecastTab windSolarForecast={windSolarForecast} loading={enhancedLoading} />}
          {activeTab === 'outages-alerts' && (
            <OutagesAlertsTab
              alerts={alerts} assetOutages={assetOutages} loading={enhancedLoading}
              onDismissAlert={dismissAlert} onClearAll={clearAllAlerts}
            />
          )}
          {activeTab === 'custom-dashboards' && <CustomDashboardsTab />}
        </div>

        {/* Bottom overview cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-3 sm:px-6 pt-3 sm:pt-6">
              <CardTitle className="text-xs sm:text-sm font-medium text-blue-100 truncate pr-2">Current Price</CardTitle>
              <DollarSign className="h-3 w-3 sm:h-4 sm:w-4 text-blue-200 flex-shrink-0" />
            </CardHeader>
            <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
              <div className="text-base sm:text-lg lg:text-xl xl:text-2xl font-bold break-all leading-tight">
                {formatPrice(currentPrice).cad.split('/')[0]}
              </div>
              <p className="text-xs text-blue-200 break-all leading-tight mt-1">
                {formatPrice(currentPrice).usd.split('/')[0]}/MWh
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-3 sm:px-6 pt-3 sm:pt-6">
              <CardTitle className="text-xs sm:text-sm font-medium text-green-100 truncate pr-2">System Load</CardTitle>
              <Gauge className="h-3 w-3 sm:h-4 sm:w-4 text-green-200 flex-shrink-0" />
            </CardHeader>
            <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
              <div className="text-base sm:text-lg lg:text-xl xl:text-2xl font-bold break-all leading-tight">
                {loadData?.current_demand_mw ? `${(loadData.current_demand_mw / 1000).toFixed(1)} GW` : 'Loading...'}
              </div>
              <p className="text-xs text-green-200 break-words leading-tight mt-1">Current demand</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-3 sm:px-6 pt-3 sm:pt-6">
              <CardTitle className="text-xs sm:text-sm font-medium text-purple-100 truncate pr-2">Renewables</CardTitle>
              <Wind className="h-3 w-3 sm:h-4 sm:w-4 text-purple-200 flex-shrink-0" />
            </CardHeader>
            <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
              <div className="text-base sm:text-lg lg:text-xl xl:text-2xl font-bold leading-tight">
                {generationMix?.renewable_percentage ? `${generationMix.renewable_percentage.toFixed(1)}%` : 'Loading...'}
              </div>
              <p className="text-xs text-purple-200 break-words leading-tight mt-1">Of total generation</p>
            </CardContent>
          </Card>

          {marketAnalytics?.market_stress_score && (
            <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white border-0">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-3 sm:px-6 pt-3 sm:pt-6">
                <CardTitle className="text-xs sm:text-sm font-medium text-orange-100 truncate pr-2">Market Stress</CardTitle>
                <Brain className="h-3 w-3 sm:h-4 sm:w-4 text-orange-200 flex-shrink-0" />
              </CardHeader>
              <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
                <div className="text-base sm:text-lg lg:text-xl xl:text-2xl font-bold leading-tight">
                  {getMarketStressValue()}
                </div>
                <p className="text-xs text-orange-200 break-words leading-tight mt-1">
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

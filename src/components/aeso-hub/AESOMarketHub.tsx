import React, { useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { useOptimizedDashboard } from '@/hooks/useOptimizedDashboard';
import { useAESOEnhancedData } from '@/hooks/useAESOEnhancedData';
import { useAESOMarketData } from '@/hooks/useAESOMarketData';
import { useAESOPricePrediction } from '@/hooks/useAESOPricePrediction';
import { useAESOCrossValidation } from '@/hooks/useAESOCrossValidation';
import { useAESOEnsemble } from '@/hooks/useAESOEnsemble';
import { useDatacenterAutomation } from '@/hooks/useDatacenterAutomation';
import { useExchangeRate } from '@/hooks/useExchangeRate';
import { AESOHubLayout } from './layout/AESOHubLayout';
import type { AESOHubView } from './layout/AESOHubLayout';

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
  const [activeTab, setActiveTab] = React.useState<AESOHubView>('market');

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

  return (
    <AESOHubLayout currentView={activeTab} onViewChange={setActiveTab}>
      <div className="p-4 sm:p-6 lg:p-8 space-y-6">

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
    </AESOHubLayout>
  );
}

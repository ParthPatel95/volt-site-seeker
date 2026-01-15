import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ResponsiveNavigation } from '@/components/ResponsiveNavigation';
import { NavigationItem } from '@/hooks/useResponsiveNavigation';
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
  Shield,
  AlertTriangle,
  Target,
  BarChart3,
  Brain,
  Factory,
  Calendar,
  Settings,
  Server,
  MessageSquare
} from 'lucide-react';
import { useAESOData } from '@/hooks/useAESOData';
import { useExchangeRate } from '@/hooks/useExchangeRate';
import { useOptimizedDashboard } from '@/hooks/useOptimizedDashboard';
import { useAESOEnhancedData } from '@/hooks/useAESOEnhancedData';
import { useAESOMarketData } from '@/hooks/useAESOMarketData';
import { useAESOPricePrediction } from '@/hooks/useAESOPricePrediction';
import { useAESOCrossValidation } from '@/hooks/useAESOCrossValidation';
import { useAESOEnsemble } from '@/hooks/useAESOEnsemble';
import { useDatacenterAutomation } from '@/hooks/useDatacenterAutomation';
import { AESOMarketAnalyticsPanel } from './intelligence/AESOMarketAnalyticsPanel';
import { AESOForecastPanel } from './intelligence/AESOForecastPanel';
import { AESOOutagesPanel } from './intelligence/AESOOutagesPanel';
import { AESOAlertsPanel } from './intelligence/AESOAlertsPanel';
import { AESOInvestmentPanel } from './intelligence/AESOInvestmentPanel';
import { AESOHistoricalPricing } from './aeso/AESOHistoricalPricing';
import { AESOPricePredictionDashboard } from './aeso/AESOPricePredictionDashboard';
import { AESOTrainingManager } from './aeso/AESOTrainingManager';
import { CustomDashboardsPanel } from './aeso/CustomDashboardsPanel';
import { AESOHistoricalAverages } from './aeso/AESOHistoricalAverages';
import { usePermissions } from '@/hooks/usePermissions';
// Phase 1 & 2 Enhanced Components
import { TradingViewChart } from './aeso/TradingViewChart';
import { PriceTicker } from './aeso/PriceTicker';
import { MarketPulse } from './aeso/MarketPulse';
import { HeroPriceCard } from './aeso/HeroPriceCard';
import { LiveConnectionStatus } from './aeso/LiveConnectionStatus';
import { MarketIntelligencePanel } from './aeso/MarketIntelligencePanel';
import { QuickStatsBar } from './aeso/QuickStatsBar';
import { DatacenterControlCenter } from './datacenter';
import { TelegramAlertSettings } from './aeso/TelegramAlertSettings';

export function AESOMarketComprehensive() {
  const { hasPermission } = usePermissions();
  const [activeTab, setActiveTab] = React.useState('market');
  
  // Use working dashboard data source
  const { 
    aesoPricing: pricing, 
    aesoLoad: loadData, 
    aesoGeneration: generationMix, 
    isLoading: basicLoading, 
    refreshData 
  } = useOptimizedDashboard();

  // Enhanced AESO data hook
  const {
    windSolarForecast,
    assetOutages,
    historicalPrices,
    marketAnalytics,
    alerts,
    loading: enhancedLoading,
    refetchAll: refetchEnhanced,
    dismissAlert,
    clearAllAlerts
  } = useAESOEnhancedData();

  // AESO Market data hook for real market data
  const {
    operatingReserve,
    interchange,
    energyStorage,
    loading: marketLoading,
    refetch: refetchMarket
  } = useAESOMarketData();

  // AESO Price Prediction hook for model training
  const {
    runCompletePipeline,
    loading: pipelineLoading
  } = useAESOPricePrediction();

  // AESO Cross-Validation hook
  const {
    runCrossValidation,
    loading: cvLoading,
    results: cvResults
  } = useAESOCrossValidation();

  // AESO Ensemble Predictor hook
  const {
    generateEnsemblePredictions,
    loading: ensembleLoading,
    predictions: ensemblePredictions
  } = useAESOEnsemble();

  const { exchangeRate, convertToUSD } = useExchangeRate();

  // Datacenter automation hook for price ceiling data
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

  const formatPrice = (cadPrice: number) => {
    return {
      cad: `CA$${cadPrice.toFixed(2)}`,
      usd: `CA$${cadPrice.toFixed(2)}`  // Remove USD conversion as requested
    };
  };

  const handleRefreshAll = () => {
    refreshData();
    refetchEnhanced();
    refetchMarket();
    generateEnsemblePredictions(24); // Also refresh AI predictions
  };

  // Use real market data when available - same logic as working Dashboard
  const currentPrice = pricing?.current_price ?? 0;
  const hasValidPrice = pricing !== null && pricing !== undefined;
  const priceTimestamp = pricing?.timestamp;

  // Calculate 95% uptime average price using REAL 30-day historical data
  const calculate95UptimeAverage = (averagePrice: number, currentPrice: number) => {
    // Use real 30-day historical data from historicalPrices if available
    if (historicalPrices?.prices && historicalPrices.prices.length > 0) {
      const prices = historicalPrices.prices.map(p => p.pool_price).sort((a, b) => a - b);
      // Calculate 95th percentile - exclude top 5% (highest price hours)
      const index95 = Math.floor(prices.length * 0.95);
      const prices95 = prices.slice(0, index95);
      const uptimeAverage = prices95.reduce((sum, p) => sum + p, 0) / prices95.length;
      
      // Calculate days covered
      const hoursOfData = prices.length;
      const daysOfData = Math.round(hoursOfData / 24);
      
      return {
        uptimeAverage: uptimeAverage,
        uptimePercentage: 95,
        excludedPrices: prices.length - prices95.length,
        totalDataPoints: prices.length,
        daysOfData: daysOfData,
        isLive: true
      };
    }
    // If no historical data, return the average as best estimate
    return {
      uptimeAverage: averagePrice,
      uptimePercentage: 95,
      excludedPrices: 0,
      totalDataPoints: 0,
      daysOfData: 0,
      isLive: false
    };
  };

  const uptimeData = calculate95UptimeAverage(pricing?.average_price || 0, currentPrice);
  
  // Calculate price ceilings from active datacenter rules for TradingViewChart
  const priceCeilings = React.useMemo(() => {
    const activeRule = datacenterRules.find(r => r.is_active);
    if (!activeRule) return undefined;
    return {
      hardCeiling: activeRule.price_ceiling_cad,
      softCeiling: activeRule.soft_ceiling_cad || activeRule.price_ceiling_cad * 0.85,
      floor: activeRule.price_floor_cad,
      ruleName: activeRule.name
    };
  }, [datacenterRules]);
  
  // Helper to determine data source badge
  const getDataSourceBadge = (isLive: boolean, dataExists: boolean) => {
    if (!dataExists) return { label: 'No Data', variant: 'secondary' as const };
    if (isLive) return { label: 'Live', variant: 'default' as const };
    return { label: 'Calculated', variant: 'outline' as const };
  };

  // Navigation items for responsive tabs
  const navigationItems: NavigationItem[] = [
    { id: 'market', label: 'Market Data', icon: Zap, priority: 1 },
    { id: 'predictions', label: 'AI Predictions', icon: Brain, priority: 2 },
    { id: 'telegram-alerts', label: 'Telegram Alerts', icon: MessageSquare, priority: 3 },
    { id: 'datacenter', label: 'Datacenter Control', icon: Server, priority: 4 },
    { id: 'historical', label: 'Historical', icon: Calendar, priority: 5 },
    { id: 'generation', label: 'Generation', icon: Activity, priority: 6 },
    { id: 'forecast', label: 'Forecasts', icon: Wind, priority: 7 },
    { id: 'outages-alerts', label: 'Outages & Alerts', icon: AlertTriangle, priority: 8 },
    { id: 'custom-dashboards', label: 'Dashboards', icon: Target, priority: 9 },
  ];

  // Intelligence helper functions
  const getMarketStressValue = () => {
    if (marketAnalytics?.market_stress_score) {
      return `${marketAnalytics.market_stress_score}/100`;
    }
    return null;
  };

  const getMarketStressLevel = () => {
    if (marketAnalytics?.market_stress_score) {
      const score = marketAnalytics.market_stress_score;
      if (score > 70) return 'High Stress';
      if (score > 40) return 'Moderate';
      return 'Low Stress';
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container-responsive py-4 sm:py-6 lg:py-8 space-y-6">
        {/* Clean Professional Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-border">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <MapPin className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-semibold text-foreground">
                  AESO Market Hub
                </h1>
                <p className="text-sm text-muted-foreground">
                  Alberta electricity market data & analytics
                </p>
              </div>
            </div>
          </div>
          <Button 
            onClick={handleRefreshAll}
            disabled={loading}
            variant="outline"
            size="sm"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>



        {/* Modern Tabbed Navigation */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6 sm:space-y-8">
          <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border/50 -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 shadow-sm">
            <div className="max-w-7xl mx-auto py-2">
              <ResponsiveNavigation
                items={navigationItems}
                activeItem={activeTab}
                onItemClick={(item) => setActiveTab(item.id)}
              />
            </div>
          </div>

          {/* Market Data Tab */}
          <TabsContent value="market" className="space-y-6 sm:space-y-8 animate-fade-in">
            {/* Live Connection Status */}
            <LiveConnectionStatus
              lastUpdated={priceTimestamp}
              onRefresh={handleRefreshAll}
              isRefreshing={loading}
              dataSource="AESO Market Data"
            />

            {/* Price Ticker Banner */}
            <PriceTicker
              currentPrice={currentPrice}
              previousPrice={pricing?.average_price || currentPrice}
              data={historicalPrices?.prices || []}
              highPrice={historicalPrices?.prices?.length ? Math.max(...historicalPrices.prices.slice(-24).map(p => p.pool_price)) : currentPrice}
              lowPrice={historicalPrices?.prices?.length ? Math.min(...historicalPrices.prices.slice(-24).map(p => p.pool_price)) : currentPrice}
              averagePrice={pricing?.average_price || currentPrice}
              loading={loading}
            />

            {/* Main Data Grid - Hero Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
              {/* Enhanced Hero Price Card */}
              <div className="lg:col-span-2">
                <HeroPriceCard
                  currentPrice={currentPrice}
                  previousHourPrice={historicalPrices?.prices?.length ? historicalPrices.prices[historicalPrices.prices.length - 2]?.pool_price || currentPrice : currentPrice}
                  averagePrice={pricing?.average_price || 0}
                  timestamp={priceTimestamp}
                  percentile={currentPrice && pricing?.average_price ? Math.min(100, Math.max(0, 50 + ((currentPrice - pricing.average_price) / pricing.average_price) * 100)) : 50}
                  uptimeData={uptimeData}
                  loading={!hasValidPrice}
                />
              </div>

              {/* Market Pulse Widget */}
              <MarketPulse
                gridStress={marketAnalytics?.market_stress_score || 25}
                reserveMargin={loadData?.reserve_margin || 15}
                windGeneration={generationMix?.wind_mw || 0}
                solarGeneration={generationMix?.solar_mw || 0}
                totalDemand={loadData?.current_demand_mw || 0}
                netInterchange={(interchange?.alberta_british_columbia || 0) + (interchange?.alberta_saskatchewan || 0) + (interchange?.alberta_montana || 0)}
                loading={loading}
              />
            </div>

            {/* Quick Stats Bar - Real-time market metrics */}
            <QuickStatsBar />

            {/* Trading View Chart - Full trading experience with ticker tape */}
            <TradingViewChart
              data={historicalPrices?.prices || []}
              currentPrice={currentPrice}
              loading={enhancedLoading}
              aiLoading={ensembleLoading}
              aiPredictions={ensemblePredictions?.map(p => ({
                timestamp: p.target_timestamp,
                price: p.ensemble_price,
                confidenceLower: p.confidence_interval_lower,
                confidenceUpper: p.confidence_interval_upper,
                // Calculate confidence from prediction std: lower std = higher confidence
                confidenceScore: p.prediction_std ? Math.max(0.5, Math.min(0.95, 1 - (p.prediction_std / p.ensemble_price) * 2)) : 0.85
              })) || []}
              priceCeilings={priceCeilings}
              onRefresh={handleRefreshAll}
              onGeneratePredictions={() => generateEnsemblePredictions(24)}
            />

            {/* Market Intelligence Panel - Comprehensive market data */}
            <MarketIntelligencePanel className="mt-4" />

            {/* System Load & Demand Card */}
            <Card className="group relative overflow-hidden border-2 hover:border-primary/50 transition-all duration-300 hover:shadow-xl bg-gradient-to-br from-card to-card/50">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <CardHeader className="relative pb-3 space-y-2">
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg">
                      <Gauge className="w-5 h-5 text-primary-foreground" />
                    </div>
                    <CardTitle className="text-lg font-bold">System Load & Demand</CardTitle>
                  </div>
                  {loadData?.forecast_date && (
                    <Badge variant="outline" className="text-xs font-medium">
                      {new Date(loadData.forecast_date).toLocaleTimeString()}
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="relative p-6">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">Current Demand</p>
                    <div className="space-y-1">
                      <p className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent">
                        {loadData?.current_demand_mw ? (loadData.current_demand_mw / 1000).toFixed(1) : '—'}
                      </p>
                      <p className="text-xs text-muted-foreground">GW</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">Peak Forecast</p>
                    <div className="space-y-1">
                      <p className="text-xl sm:text-2xl font-bold text-foreground">
                        {loadData?.peak_forecast_mw ? (loadData.peak_forecast_mw / 1000).toFixed(1) : '—'}
                      </p>
                      <p className="text-xs text-muted-foreground">GW</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">Capacity Margin</p>
                    <p className="text-xl sm:text-2xl font-bold text-foreground">
                      {loadData?.capacity_margin?.toFixed(1) || '—'}%
                    </p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">Reserve Margin</p>
                    <p className="text-xl sm:text-2xl font-bold text-foreground">
                      {loadData?.reserve_margin?.toFixed(1) || '—'}%
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Historical Averages Section */}
            <div className="mt-6">
              <AESOHistoricalAverages />
            </div>

            {/* Additional Market Data - Modern Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mt-6">
              {/* Operating Reserve - Now using REAL data from useAESOMarketData */}
              <Card className="group relative overflow-hidden border hover:border-primary/30 transition-all duration-300 hover:shadow-lg">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-500/10 to-transparent rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <CardHeader className="relative pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="p-1.5 rounded-lg bg-orange-500/10">
                        <Shield className="w-4 h-4 text-orange-600 dark:text-orange-500" />
                      </div>
                      <CardTitle className="text-base font-semibold">Operating Reserve</CardTitle>
                    </div>
                    <Badge 
                      variant={operatingReserve ? 'default' : 'secondary'} 
                      className="text-[10px] px-2 py-0.5"
                    >
                      {operatingReserve ? 'LIVE' : 'N/A'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="relative space-y-3 p-6 pt-2">
                  <div className="flex justify-between items-center py-2 border-b border-border/50">
                    <span className="text-sm text-muted-foreground">Total Reserve</span>
                    <span className="font-bold text-foreground">
                      {operatingReserve?.total_reserve_mw 
                        ? `${Math.round(operatingReserve.total_reserve_mw).toLocaleString()} MW`
                        : '—'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-border/50">
                    <span className="text-sm text-muted-foreground">Spinning</span>
                    <span className="font-semibold text-foreground">
                      {operatingReserve?.spinning_reserve_mw 
                        ? `${Math.round(operatingReserve.spinning_reserve_mw).toLocaleString()} MW`
                        : '—'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-sm text-muted-foreground">Supplemental</span>
                    <span className="font-semibold text-foreground">
                      {operatingReserve?.supplemental_reserve_mw 
                        ? `${Math.round(operatingReserve.supplemental_reserve_mw).toLocaleString()} MW`
                        : '—'}
                    </span>
                  </div>
                </CardContent>
              </Card>
              
              {/* Interchange - Now using REAL data from useAESOMarketData */}
              <Card className="group relative overflow-hidden border hover:border-primary/30 transition-all duration-300 hover:shadow-lg">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/10 to-transparent rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <CardHeader className="relative pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="p-1.5 rounded-lg bg-blue-500/10">
                        <ArrowLeftRight className="w-4 h-4 text-blue-600 dark:text-blue-500" />
                      </div>
                      <CardTitle className="text-base font-semibold">Interchange</CardTitle>
                    </div>
                    <Badge 
                      variant={interchange ? 'default' : 'secondary'} 
                      className="text-[10px] px-2 py-0.5"
                    >
                      {interchange ? 'LIVE' : 'N/A'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="relative space-y-3 p-6 pt-2">
                  <div className="flex justify-between items-center py-2 border-b border-border/50">
                    <span className="text-sm text-muted-foreground">AB-BC</span>
                    <span className={`font-bold ${(interchange?.alberta_british_columbia || 0) < 0 ? 'text-red-600 dark:text-red-500' : 'text-green-600 dark:text-green-500'}`}>
                      {interchange?.alberta_british_columbia !== undefined 
                        ? `${interchange.alberta_british_columbia > 0 ? '+' : ''}${Math.round(interchange.alberta_british_columbia)} MW`
                        : '—'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-border/50">
                    <span className="text-sm text-muted-foreground">AB-SK</span>
                    <span className={`font-semibold ${(interchange?.alberta_saskatchewan || 0) < 0 ? 'text-red-600 dark:text-red-500' : 'text-green-600 dark:text-green-500'}`}>
                      {interchange?.alberta_saskatchewan !== undefined 
                        ? `${interchange.alberta_saskatchewan > 0 ? '+' : ''}${Math.round(interchange.alberta_saskatchewan)} MW`
                        : '—'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-sm text-muted-foreground">AB-MT</span>
                    <span className={`font-semibold ${(interchange?.alberta_montana || 0) !== 0 ? (interchange?.alberta_montana || 0) < 0 ? 'text-red-600 dark:text-red-500' : 'text-green-600 dark:text-green-500' : 'text-foreground'}`}>
                      {interchange?.alberta_montana !== undefined 
                        ? `${interchange.alberta_montana > 0 ? '+' : ''}${Math.round(interchange.alberta_montana)} MW`
                        : '—'}
                    </span>
                  </div>
                </CardContent>
              </Card>
              
              {/* Energy Storage - Now using REAL data from useAESOMarketData */}
              <Card className="group relative overflow-hidden border hover:border-primary/30 transition-all duration-300 hover:shadow-lg">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-500/10 to-transparent rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <CardHeader className="relative pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="p-1.5 rounded-lg bg-green-500/10">
                        <Battery className="w-4 h-4 text-green-600 dark:text-green-500" />
                      </div>
                      <CardTitle className="text-base font-semibold">Energy Storage</CardTitle>
                    </div>
                    <Badge 
                      variant={energyStorage ? 'default' : 'secondary'} 
                      className="text-[10px] px-2 py-0.5"
                    >
                      {energyStorage ? 'LIVE' : 'N/A'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="relative space-y-3 p-6 pt-2">
                  <div className="flex justify-between items-center py-2 border-b border-border/50">
                    <span className="text-sm text-muted-foreground">Net Output</span>
                    <span className="font-bold text-foreground">
                      {energyStorage?.net_storage_mw !== undefined 
                        ? `${Math.round(energyStorage.net_storage_mw)} MW`
                        : '—'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-border/50">
                    <span className="text-sm text-muted-foreground">Charging</span>
                    <span className="font-semibold text-green-600 dark:text-green-500">
                      {energyStorage?.charging_mw !== undefined 
                        ? `+${Math.round(energyStorage.charging_mw)} MW`
                        : '—'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-sm text-muted-foreground">State of Charge</span>
                    <span className="font-semibold text-foreground">
                      {energyStorage?.state_of_charge_percent !== undefined 
                        ? `${Math.round(energyStorage.state_of_charge_percent)}%`
                        : '—'}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Historical Pricing Tab */}
          <TabsContent value="historical" className="space-y-4 sm:space-y-6">
            <AESOHistoricalPricing />
          </TabsContent>

          {/* AI Price Predictions Tab with Sub-tabs */}
          <TabsContent value="predictions" className="space-y-4 sm:space-y-6">
            <Tabs defaultValue="predictions" className="space-y-4">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="predictions" className="flex items-center gap-2">
                  <Brain className="w-4 h-4" />
                  Predictions
                </TabsTrigger>
                <TabsTrigger 
                  value="training" 
                  className="flex items-center gap-2"
                  disabled={!hasPermission('aeso.training-management')}
                >
                  {!hasPermission('aeso.training-management') && (
                    <Shield className="w-4 h-4" />
                  )}
                  {hasPermission('aeso.training-management') && (
                    <Settings className="w-4 h-4" />
                  )}
                  Training & Management
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="predictions">
                <AESOPricePredictionDashboard />
              </TabsContent>
              
              <TabsContent value="training">
                {hasPermission('aeso.training-management') ? (
                  <AESOTrainingManager />
                ) : (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <Shield className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                      <h3 className="text-lg font-semibold mb-2">Access Restricted</h3>
                      <p className="text-muted-foreground">
                        You need "AESO Model Training" permission to access this section.
                        Please contact your administrator.
                      </p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            </Tabs>
          </TabsContent>

          {/* Datacenter Control Tab */}
          <TabsContent value="datacenter" className="space-y-4 sm:space-y-6 animate-fade-in">
            <DatacenterControlCenter currentPrice={currentPrice} />
          </TabsContent>

          {/* Generation Tab */}
          <TabsContent value="generation" className="space-y-4 sm:space-y-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <div className="flex items-center">
                    <Activity className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-green-600" />
                    <span className="text-sm sm:text-base">Current Generation Mix</span>
                  </div>
                  {generationMix?.timestamp && (
                    <Badge variant="outline" className="text-xs self-start sm:self-auto">
                      Updated: {new Date(generationMix.timestamp).toLocaleTimeString()}
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {generationMix ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-4">
                      <div className="text-center p-2 sm:p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg min-w-0">
                        <Fuel className="w-4 h-4 sm:w-6 sm:h-6 mx-auto mb-1 sm:mb-2 text-blue-500 flex-shrink-0" />
                        <p className="text-xs sm:text-sm text-muted-foreground truncate">Natural Gas</p>
                        <p className="text-sm sm:text-base lg:text-xl font-bold break-all">
                          {generationMix.natural_gas_mw ? (generationMix.natural_gas_mw / 1000).toFixed(1) : '0.0'} GW
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {generationMix.total_generation_mw ? ((generationMix.natural_gas_mw / generationMix.total_generation_mw) * 100).toFixed(1) : '0.0'}%
                        </p>
                      </div>
                      <div className="text-center p-2 sm:p-4 bg-green-50 dark:bg-green-900/20 rounded-lg min-w-0">
                        <Wind className="w-4 h-4 sm:w-6 sm:h-6 mx-auto mb-1 sm:mb-2 text-green-500 flex-shrink-0" />
                        <p className="text-xs sm:text-sm text-muted-foreground truncate">Wind</p>
                        <p className="text-sm sm:text-base lg:text-xl font-bold break-all">
                          {generationMix.wind_mw ? (generationMix.wind_mw / 1000).toFixed(1) : '0.0'} GW
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {generationMix.total_generation_mw ? ((generationMix.wind_mw / generationMix.total_generation_mw) * 100).toFixed(1) : '0.0'}%
                        </p>
                      </div>
                      <div className="text-center p-2 sm:p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg min-w-0">
                        <Sun className="w-4 h-4 sm:w-6 sm:h-6 mx-auto mb-1 sm:mb-2 text-yellow-500 flex-shrink-0" />
                        <p className="text-xs sm:text-sm text-muted-foreground truncate">Solar</p>
                        <p className="text-sm sm:text-base lg:text-xl font-bold break-all">
                          {generationMix.solar_mw ? (generationMix.solar_mw / 1000).toFixed(1) : '0.0'} GW
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {generationMix.total_generation_mw ? ((generationMix.solar_mw / generationMix.total_generation_mw) * 100).toFixed(1) : '0.0'}%
                        </p>
                      </div>
                      <div className="text-center p-2 sm:p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg min-w-0">
                        <Activity className="w-4 h-4 sm:w-6 sm:h-6 mx-auto mb-1 sm:mb-2 text-blue-600 flex-shrink-0" />
                        <p className="text-xs sm:text-sm text-muted-foreground truncate">Hydro</p>
                        <p className="text-sm sm:text-base lg:text-xl font-bold break-all">
                          {generationMix.hydro_mw ? (generationMix.hydro_mw / 1000).toFixed(1) : '0.0'} GW
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {generationMix.total_generation_mw ? ((generationMix.hydro_mw / generationMix.total_generation_mw) * 100).toFixed(1) : '0.0'}%
                        </p>
                      </div>
                      <div className="text-center p-2 sm:p-4 bg-gray-50 dark:bg-gray-900/20 rounded-lg min-w-0">
                        <Fuel className="w-4 h-4 sm:w-6 sm:h-6 mx-auto mb-1 sm:mb-2 text-gray-600 flex-shrink-0" />
                        <p className="text-xs sm:text-sm text-muted-foreground truncate">Coal</p>
                        <p className="text-sm sm:text-base lg:text-xl font-bold break-all">
                          {generationMix.coal_mw ? (generationMix.coal_mw / 1000).toFixed(1) : '0.0'} GW
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {generationMix.total_generation_mw ? ((generationMix.coal_mw / generationMix.total_generation_mw) * 100).toFixed(1) : '0.0'}%
                        </p>
                      </div>
                      <div className="text-center p-2 sm:p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg min-w-0">
                        <Zap className="w-4 h-4 sm:w-6 sm:h-6 mx-auto mb-1 sm:mb-2 text-purple-500 flex-shrink-0" />
                        <p className="text-xs sm:text-sm text-muted-foreground truncate">Other</p>
                        <p className="text-sm sm:text-base lg:text-xl font-bold break-all">
                          {generationMix.other_mw ? (generationMix.other_mw / 1000).toFixed(1) : '0.0'} GW
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {generationMix.total_generation_mw ? ((generationMix.other_mw / generationMix.total_generation_mw) * 100).toFixed(1) : '0.0'}%
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-3 sm:p-4 bg-green-50 dark:bg-green-900/20 rounded-lg gap-2">
                      <div className="min-w-0">
                        <span className="text-base sm:text-lg font-medium">Renewable Generation</span>
                        <p className="text-xs sm:text-sm text-muted-foreground">Wind + Hydro + Solar</p>
                      </div>
                      <div className="text-right">
                        <Badge variant="secondary" className="bg-green-100 text-green-800 text-sm sm:text-lg px-2 sm:px-3 py-1">
                          {generationMix.renewable_percentage?.toFixed(1) || '0.0'}%
                        </Badge>
                        <p className="text-xs sm:text-sm text-muted-foreground mt-1">
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
          </TabsContent>

          <TabsContent value="forecast">
            <AESOForecastPanel 
              windSolarForecast={windSolarForecast}
              loading={enhancedLoading}
            />
          </TabsContent>

          <TabsContent value="outages-alerts" className="space-y-4 sm:space-y-6">
            {/* Alerts Section */}
            <div>
              <AESOAlertsPanel 
                alerts={alerts}
                onDismissAlert={dismissAlert}
                onClearAll={clearAllAlerts}
              />
            </div>
            
            {/* Outages Section */}
            <div>
              <AESOOutagesPanel 
                assetOutages={assetOutages}
                loading={enhancedLoading}
              />
            </div>
          </TabsContent>

          <TabsContent value="telegram-alerts" className="space-y-4 sm:space-y-6">
            <TelegramAlertSettings />
          </TabsContent>

          <TabsContent value="custom-dashboards" className="space-y-4 sm:space-y-6">
            <CustomDashboardsPanel />
          </TabsContent>

        </Tabs>

        {/* Real-time Market Overview (moved below tabs) */}
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

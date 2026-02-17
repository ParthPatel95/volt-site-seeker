import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Zap, Gauge, Wind, Sun, Fuel, Activity,
  DollarSign, Battery, ArrowLeftRight, Shield,
  ChevronDown, AlertTriangle
} from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { LiveConnectionStatus } from '@/components/aeso/LiveConnectionStatus';
import { PriceTicker } from '@/components/aeso/PriceTicker';
import { HeroPriceCard } from '@/components/aeso/HeroPriceCard';
import { MarketPulse } from '@/components/aeso/MarketPulse';
import { QuickStatsBar } from '@/components/aeso/QuickStatsBar';
import { TradingViewChart } from '@/components/aeso/TradingViewChart';
import { MarketIntelligencePanel } from '@/components/aeso/MarketIntelligencePanel';
import { AESOHistoricalAverages } from '@/components/aeso/AESOHistoricalAverages';
import { MiningEconomicsCard } from '@/components/aeso/MiningEconomicsCard';
import { AESOForecastPanel } from '@/components/intelligence/AESOForecastPanel';
import { AESOAlertsPanel } from '@/components/intelligence/AESOAlertsPanel';
import { AESOOutagesPanel } from '@/components/intelligence/AESOOutagesPanel';

interface MarketDataTabProps {
  pricing: any;
  loadData: any;
  generationMix: any;
  historicalPrices: any;
  operatingReserve: any;
  interchange: any;
  energyStorage: any;
  marketAnalytics: any;
  currentPrice: number;
  hasValidPrice: boolean;
  priceTimestamp: string | undefined;
  uptimeData: any;
  priceCeilings: any;
  loading: boolean;
  enhancedLoading: boolean;
  ensembleLoading: boolean;
  ensemblePredictions: any[];
  handleRefreshAll: () => void;
  generateEnsemblePredictions: (hours: number) => void;
  windSolarForecast: any;
  alerts: any;
  assetOutages: any;
  onDismissAlert: (id: string) => void;
  onClearAll: () => void;
}

export function MarketDataTab({
  pricing, loadData, generationMix, historicalPrices,
  operatingReserve, interchange, energyStorage, marketAnalytics,
  currentPrice, hasValidPrice, priceTimestamp, uptimeData, priceCeilings,
  loading, enhancedLoading, ensembleLoading, ensemblePredictions,
  handleRefreshAll, generateEnsemblePredictions,
  windSolarForecast, alerts, assetOutages, onDismissAlert, onClearAll,
}: MarketDataTabProps) {
  const [showOutages, setShowOutages] = useState(false);
  const hasAlerts = alerts && alerts.length > 0;
  const hasOutages = assetOutages && assetOutages.length > 0;

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in">
      {/* Alerts Banner - only shows when active */}
      {hasAlerts && (
        <Collapsible defaultOpen>
          <CollapsibleTrigger asChild>
            <Button variant="outline" className="w-full justify-between border-yellow-500/30 bg-yellow-500/5 text-foreground hover:bg-yellow-500/10">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
                <span className="text-sm font-medium">{alerts.length} Active Alert{alerts.length > 1 ? 's' : ''}</span>
              </div>
              <ChevronDown className="w-4 h-4" />
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-2">
            <AESOAlertsPanel alerts={alerts} onDismissAlert={onDismissAlert} onClearAll={onClearAll} />
          </CollapsibleContent>
        </Collapsible>
      )}

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
        highPrice={historicalPrices?.prices?.length ? Math.max(...historicalPrices.prices.slice(-24).map((p: any) => p.pool_price)) : currentPrice}
        lowPrice={historicalPrices?.prices?.length ? Math.min(...historicalPrices.prices.slice(-24).map((p: any) => p.pool_price)) : currentPrice}
        averagePrice={pricing?.average_price || currentPrice}
        loading={loading}
      />

      {/* Main Data Grid - Hero Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
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

      {/* Mining Economics */}
      <MiningEconomicsCard currentAesoPrice={currentPrice} />

      <QuickStatsBar />

      {/* Generation Mix - inline compact bar */}
      {generationMix && (
        <Card className="border hover:border-primary/30 transition-colors">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-green-600 dark:text-green-500" />
                <CardTitle className="text-sm font-semibold">Generation Mix</CardTitle>
              </div>
              {generationMix.timestamp && (
                <Badge variant="outline" className="text-[10px]">
                  {new Date(generationMix.timestamp).toLocaleTimeString()}
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="pb-3">
            {/* Stacked bar */}
            <div className="w-full h-6 rounded-full overflow-hidden flex">
              {[
                { key: 'natural_gas_mw', color: 'bg-blue-500', label: 'Gas' },
                { key: 'wind_mw', color: 'bg-green-500', label: 'Wind' },
                { key: 'solar_mw', color: 'bg-yellow-500', label: 'Solar' },
                { key: 'hydro_mw', color: 'bg-cyan-500', label: 'Hydro' },
                { key: 'coal_mw', color: 'bg-gray-500', label: 'Coal' },
                { key: 'other_mw', color: 'bg-purple-500', label: 'Other' },
              ].map(({ key, color }) => {
                const val = generationMix[key] || 0;
                const total = generationMix.total_generation_mw || 1;
                const pct = (val / total) * 100;
                return pct > 0 ? <div key={key} className={`${color} h-full`} style={{ width: `${pct}%` }} /> : null;
              })}
            </div>
            {/* Legend */}
            <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs text-muted-foreground">
              {[
                { key: 'natural_gas_mw', color: 'bg-blue-500', label: 'Gas' },
                { key: 'wind_mw', color: 'bg-green-500', label: 'Wind' },
                { key: 'solar_mw', color: 'bg-yellow-500', label: 'Solar' },
                { key: 'hydro_mw', color: 'bg-cyan-500', label: 'Hydro' },
                { key: 'coal_mw', color: 'bg-gray-500', label: 'Coal' },
                { key: 'other_mw', color: 'bg-purple-500', label: 'Other' },
              ].map(({ key, color, label }) => {
                const val = generationMix[key] || 0;
                const total = generationMix.total_generation_mw || 1;
                return (
                  <span key={key} className="flex items-center gap-1">
                    <span className={`w-2 h-2 rounded-full ${color}`} />
                    {label} {((val / total) * 100).toFixed(0)}%
                  </span>
                );
              })}
              <span className="font-medium text-foreground ml-auto">
                Total: {(generationMix.total_generation_mw / 1000).toFixed(1)} GW
                {' · '}
                <span className="text-green-600 dark:text-green-400">
                  {generationMix.renewable_percentage?.toFixed(0)}% Renewable
                </span>
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      <TradingViewChart
        data={historicalPrices?.prices || []}
        currentPrice={currentPrice}
        loading={enhancedLoading}
        aiLoading={ensembleLoading}
        aiPredictions={ensemblePredictions?.map((p: any) => ({
          timestamp: p.target_timestamp,
          price: p.ensemble_price,
          confidenceLower: p.confidence_interval_lower,
          confidenceUpper: p.confidence_interval_upper,
          confidenceScore: p.prediction_std ? Math.max(0.5, Math.min(0.95, 1 - (p.prediction_std / p.ensemble_price) * 2)) : 0.85
        })) || []}
        priceCeilings={priceCeilings}
        onRefresh={handleRefreshAll}
        onGeneratePredictions={() => generateEnsemblePredictions(24)}
      />

      {/* Wind/Solar Forecast */}
      <AESOForecastPanel windSolarForecast={windSolarForecast} loading={enhancedLoading} />

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

      <AESOHistoricalAverages />

      {/* Outages - collapsible */}
      {(hasOutages || hasAlerts) && (
        <Collapsible open={showOutages} onOpenChange={setShowOutages}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className="w-full justify-between text-muted-foreground">
              <span className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                Asset Outages {hasOutages && `(${assetOutages.length})`}
              </span>
              <ChevronDown className={`w-4 h-4 transition-transform ${showOutages ? 'rotate-180' : ''}`} />
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <AESOOutagesPanel assetOutages={assetOutages} loading={enhancedLoading} />
          </CollapsibleContent>
        </Collapsible>
      )}

      {/* Operating Reserve / Interchange / Energy Storage */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Operating Reserve */}
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
              <Badge variant={operatingReserve ? 'default' : 'secondary'} className="text-[10px] px-2 py-0.5">
                {operatingReserve ? 'LIVE' : 'N/A'}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="relative space-y-3 p-6 pt-2">
            <div className="flex justify-between items-center py-2 border-b border-border/50">
              <span className="text-sm text-muted-foreground">Total Reserve</span>
              <span className="font-bold text-foreground">
                {operatingReserve?.total_reserve_mw ? `${Math.round(operatingReserve.total_reserve_mw).toLocaleString()} MW` : '—'}
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-border/50">
              <span className="text-sm text-muted-foreground">Spinning</span>
              <span className="font-semibold text-foreground">
                {operatingReserve?.spinning_reserve_mw ? `${Math.round(operatingReserve.spinning_reserve_mw).toLocaleString()} MW` : '—'}
              </span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-sm text-muted-foreground">Supplemental</span>
              <span className="font-semibold text-foreground">
                {operatingReserve?.supplemental_reserve_mw ? `${Math.round(operatingReserve.supplemental_reserve_mw).toLocaleString()} MW` : '—'}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Interchange */}
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
              <Badge variant={interchange ? 'default' : 'secondary'} className="text-[10px] px-2 py-0.5">
                {interchange ? 'LIVE' : 'N/A'}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="relative space-y-3 p-6 pt-2">
            <div className="flex justify-between items-center py-2 border-b border-border/50">
              <span className="text-sm text-muted-foreground">AB-BC</span>
              <span className={`font-bold ${(interchange?.alberta_british_columbia || 0) < 0 ? 'text-red-600 dark:text-red-500' : 'text-green-600 dark:text-green-500'}`}>
                {interchange?.alberta_british_columbia !== undefined ? `${interchange.alberta_british_columbia > 0 ? '+' : ''}${Math.round(interchange.alberta_british_columbia)} MW` : '—'}
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-border/50">
              <span className="text-sm text-muted-foreground">AB-SK</span>
              <span className={`font-semibold ${(interchange?.alberta_saskatchewan || 0) < 0 ? 'text-red-600 dark:text-red-500' : 'text-green-600 dark:text-green-500'}`}>
                {interchange?.alberta_saskatchewan !== undefined ? `${interchange.alberta_saskatchewan > 0 ? '+' : ''}${Math.round(interchange.alberta_saskatchewan)} MW` : '—'}
              </span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-sm text-muted-foreground">AB-MT</span>
              <span className={`font-semibold ${(interchange?.alberta_montana || 0) !== 0 ? (interchange?.alberta_montana || 0) < 0 ? 'text-red-600 dark:text-red-500' : 'text-green-600 dark:text-green-500' : 'text-foreground'}`}>
                {interchange?.alberta_montana !== undefined ? `${interchange.alberta_montana > 0 ? '+' : ''}${Math.round(interchange.alberta_montana)} MW` : '—'}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Energy Storage */}
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
              <Badge variant={energyStorage ? 'default' : 'secondary'} className="text-[10px] px-2 py-0.5">
                {energyStorage ? 'LIVE' : 'N/A'}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="relative space-y-3 p-6 pt-2">
            <div className="flex justify-between items-center py-2 border-b border-border/50">
              <span className="text-sm text-muted-foreground">Net Output</span>
              <span className="font-bold text-foreground">
                {energyStorage?.net_storage_mw !== undefined ? `${Math.round(energyStorage.net_storage_mw)} MW` : '—'}
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-border/50">
              <span className="text-sm text-muted-foreground">Charging</span>
              <span className="font-semibold text-green-600 dark:text-green-500">
                {energyStorage?.charging_mw !== undefined ? `+${Math.round(energyStorage.charging_mw)} MW` : '—'}
              </span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-sm text-muted-foreground">State of Charge</span>
              <span className="font-semibold text-foreground">
                {energyStorage?.state_of_charge_percent !== undefined ? `${Math.round(energyStorage.state_of_charge_percent)}%` : '—'}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

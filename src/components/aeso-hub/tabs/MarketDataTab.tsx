import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Activity, ChevronDown, AlertTriangle
} from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { LiveConnectionStatus } from '@/components/aeso/LiveConnectionStatus';
import { PriceTicker } from '@/components/aeso/PriceTicker';
import { HeroPriceCard } from '@/components/aeso/HeroPriceCard';
import { MarketPulse } from '@/components/aeso/MarketPulse';
import { QuickStatsBar } from '@/components/aeso/QuickStatsBar';
import { TradingViewChart } from '@/components/aeso/TradingViewChart';
import { MarketIntelligencePanel } from '@/components/aeso/MarketIntelligencePanel';
import { AESOHistoricalAverages } from '@/components/aeso/AESOHistoricalAverages';
import { MiningEnergyAnalytics } from '@/components/aeso/MiningEnergyAnalytics';
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

const GEN_MIX_SOURCES = [
  { key: 'natural_gas_mw', color: 'bg-blue-500', label: 'Gas' },
  { key: 'wind_mw', color: 'bg-green-500', label: 'Wind' },
  { key: 'solar_mw', color: 'bg-yellow-500', label: 'Solar' },
  { key: 'hydro_mw', color: 'bg-cyan-500', label: 'Hydro' },
  { key: 'coal_mw', color: 'bg-gray-500', label: 'Coal' },
  { key: 'other_mw', color: 'bg-purple-500', label: 'Other' },
];

function SectionDivider({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 pt-2">
      <div className="h-px flex-1 bg-border" />
      <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest select-none">
        {label}
      </span>
      <div className="h-px flex-1 bg-border" />
    </div>
  );
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
    <div className="space-y-5 animate-fade-in">
      {/* ─── Alerts Banner ─── */}
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

      {/* ═══════════════════ ZONE 1: Price & Status ═══════════════════ */}
      <LiveConnectionStatus
        lastUpdated={priceTimestamp}
        onRefresh={handleRefreshAll}
        isRefreshing={loading}
        dataSource="AESO Market Data"
      />

      <PriceTicker
        currentPrice={currentPrice}
        previousPrice={pricing?.average_price || currentPrice}
        data={historicalPrices?.prices || []}
        highPrice={historicalPrices?.prices?.length ? Math.max(...historicalPrices.prices.slice(-24).map((p: any) => p.pool_price)) : currentPrice}
        lowPrice={historicalPrices?.prices?.length ? Math.min(...historicalPrices.prices.slice(-24).map((p: any) => p.pool_price)) : currentPrice}
        averagePrice={pricing?.average_price || currentPrice}
        loading={loading}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
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

      {/* ═══════════════════ ZONE 2: Market Intelligence ═══════════════════ */}
      <SectionDivider label="Market Intelligence" />

      <QuickStatsBar />

      {/* Generation Mix - compact inline bar */}
      {generationMix && (
        <Card className="border hover:border-primary/30 transition-colors">
          <CardHeader className="pb-2 pt-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-green-600 dark:text-green-500" />
                <CardTitle className="text-sm font-semibold">Generation Mix</CardTitle>
              </div>
              <div className="flex items-center gap-2">
                {generationMix.timestamp && (
                  <Badge variant="outline" className="text-[10px]">
                    {new Date(generationMix.timestamp).toLocaleTimeString()}
                  </Badge>
                )}
                <span className="font-medium text-xs text-foreground">
                  {(generationMix.total_generation_mw / 1000).toFixed(1)} GW
                  {' · '}
                  <span className="text-green-600 dark:text-green-400">
                    {generationMix.renewable_percentage?.toFixed(0)}% Renewable
                  </span>
                </span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pb-3 pt-0">
            <TooltipProvider delayDuration={0}>
              <div className="w-full h-5 rounded-full overflow-hidden flex">
                {GEN_MIX_SOURCES.map(({ key, color, label }) => {
                  const val = generationMix[key] || 0;
                  const total = generationMix.total_generation_mw || 1;
                  const pct = (val / total) * 100;
                  if (pct <= 0) return null;
                  return (
                    <Tooltip key={key}>
                      <TooltipTrigger asChild>
                        <div
                          className={`${color} h-full cursor-default transition-opacity hover:opacity-80`}
                          style={{ width: `${pct}%` }}
                        />
                      </TooltipTrigger>
                      <TooltipContent side="top" className="text-xs">
                        <p className="font-semibold">{label}</p>
                        <p>{Math.round(val).toLocaleString()} MW ({pct.toFixed(1)}%)</p>
                      </TooltipContent>
                    </Tooltip>
                  );
                })}
              </div>
            </TooltipProvider>
            <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs text-muted-foreground">
              {GEN_MIX_SOURCES.map(({ key, color, label }) => {
                const val = generationMix[key] || 0;
                const total = generationMix.total_generation_mw || 1;
                return (
                  <span key={key} className="flex items-center gap-1">
                    <span className={`w-2 h-2 rounded-full ${color}`} />
                    {label} {((val / total) * 100).toFixed(0)}%
                  </span>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Mining & Energy Analytics - full width */}
      <MiningEnergyAnalytics currentAesoPrice={currentPrice} />

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

      {/* ═══════════════════ ZONE 3: Grid & Forecasts ═══════════════════ */}
      <SectionDivider label="Grid & Forecasts" />

      <MarketIntelligencePanel className="mt-0" />

      <AESOForecastPanel windSolarForecast={windSolarForecast} loading={enhancedLoading} />

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
    </div>
  );
}

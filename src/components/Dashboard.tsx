import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp,
  TrendingDown, 
  Zap, 
  Activity,
  RefreshCw,
  MapPin,
  Wind,
  Sun,
  Fuel,
  Gauge,
  Battery,
  Globe,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  AlertCircle
} from 'lucide-react';
import { useOptimizedDashboard } from '@/hooks/useOptimizedDashboard';
import { useExchangeRate } from '@/hooks/useExchangeRate';
import { ResponsivePageContainer, ResponsiveSection } from '@/components/ResponsiveContainer';
import { DataSourceBadge } from '@/components/energy/DataSourceBadge';
import { PageHeader } from '@/components/layout/PageHeader';
import { MarketSummaryBar } from '@/components/ui/market-summary-bar';
import { MetricCard } from '@/components/ui/metric-card';
import { cn } from '@/lib/utils';

export const Dashboard = () => {
  const [lastUpdated, setLastUpdated] = useState(new Date());

  const { 
    ercotPricing, 
    ercotLoad, 
    ercotGeneration,
    aesoPricing, 
    aesoLoad, 
    aesoGeneration,
    misoPricing,
    misoLoad,
    misoGeneration,
    caisoPricing,
    caisoLoad,
    caisoGeneration,
    nyisoPricing,
    nyisoLoad,
    nyisoGeneration,
    pjmPricing,
    pjmLoad,
    pjmGeneration,
    sppPricing,
    sppLoad,
    sppGeneration,
    iesoPricing,
    iesoLoad,
    iesoGeneration,
    isLoading,
    marketMetrics,
    refreshData: refreshDataHook
  } = useOptimizedDashboard();

  const { convertToUSD } = useExchangeRate();

  const refreshData = async () => {
    setLastUpdated(new Date());
    await refreshDataHook();
  };

  // Build market summary data
  const marketSummary = [
    { id: 'ERCOT', name: 'ERCOT', shortName: 'ERCOT', price: ercotPricing?.current_price ?? null, change: parseFloat(marketMetrics.ercotTrend?.percentage) || undefined, isLoading },
    { id: 'MISO', name: 'MISO', shortName: 'MISO', price: misoPricing?.current_price ?? null, change: parseFloat(marketMetrics.misoTrend?.percentage) || undefined, isLoading },
    { id: 'CAISO', name: 'CAISO', shortName: 'CAISO', price: caisoPricing?.current_price ?? null, change: parseFloat(marketMetrics.caisoTrend?.percentage) || undefined, isLoading },
    { id: 'NYISO', name: 'NYISO', shortName: 'NYISO', price: nyisoPricing?.current_price ?? null, change: parseFloat(marketMetrics.nyisoTrend?.percentage) || undefined, isLoading },
    { id: 'PJM', name: 'PJM', shortName: 'PJM', price: pjmPricing?.current_price ?? null, change: parseFloat(marketMetrics.pjmTrend?.percentage) || undefined, isLoading },
    { id: 'SPP', name: 'SPP', shortName: 'SPP', price: sppPricing?.current_price ?? null, change: parseFloat(marketMetrics.sppTrend?.percentage) || undefined, isLoading },
    { id: 'AESO', name: 'AESO', shortName: 'AESO', price: aesoPricing ? convertToUSD(aesoPricing.current_price) : null, change: parseFloat(marketMetrics.aesoTrend?.percentage) || undefined, isLoading },
    { id: 'IESO', name: 'IESO', shortName: 'IESO', price: iesoPricing ? convertToUSD(iesoPricing.current_price) : null, change: parseFloat(marketMetrics.iesoTrend?.percentage) || undefined, isLoading },
  ];

  // Loading skeleton
  if (isLoading) {
    return (
      <ResponsivePageContainer className="min-h-screen bg-background">
        <div className="py-6 space-y-6">
          {/* Header skeleton */}
          <div className="space-y-2">
            <div className="h-8 bg-muted rounded-lg w-64 animate-pulse" />
            <div className="h-4 bg-muted rounded w-40 animate-pulse" />
          </div>
          
          {/* Market bar skeleton */}
          <div className="flex gap-3 overflow-hidden">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-20 w-40 bg-muted rounded-xl animate-pulse flex-shrink-0" />
            ))}
          </div>
          
          {/* Cards skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-64 bg-muted rounded-xl animate-pulse" />
            ))}
          </div>
        </div>
      </ResponsivePageContainer>
    );
  }

  return (
    <ResponsivePageContainer className="min-h-screen bg-background">
      <div className="py-6 space-y-6 animate-fade-in">
        {/* Page Header */}
        <PageHeader
          title="Energy Markets Dashboard"
          subtitle="Real-time pricing and analytics across North American energy markets"
          lastUpdated={lastUpdated}
          isRefreshing={isLoading}
          onRefresh={refreshData}
        />

        {/* Market Summary Bar */}
        <section>
          <MarketSummaryBar markets={marketSummary} />
        </section>

        {/* US Markets Section */}
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">United States Markets</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* ERCOT Card */}
            <MarketDetailCard
              name="ERCOT"
              region="Texas"
              pricing={ercotPricing}
              load={ercotLoad}
              generation={ercotGeneration}
              trend={marketMetrics.ercotTrend}
              accentColor="var(--market-ercot)"
              isLoading={isLoading}
            />

            {/* MISO Card */}
            <MarketDetailCard
              name="MISO"
              region="Midwest"
              pricing={misoPricing}
              load={misoLoad}
              generation={misoGeneration}
              trend={marketMetrics.misoTrend}
              accentColor="var(--market-miso)"
              isLoading={isLoading}
            />

            {/* CAISO Card */}
            <MarketDetailCard
              name="CAISO"
              region="California"
              pricing={caisoPricing}
              load={caisoLoad}
              generation={caisoGeneration}
              trend={marketMetrics.caisoTrend}
              accentColor="var(--market-caiso)"
              isLoading={isLoading}
            />

            {/* NYISO Card */}
            <MarketDetailCard
              name="NYISO"
              region="New York"
              pricing={nyisoPricing}
              load={nyisoLoad}
              generation={nyisoGeneration}
              trend={marketMetrics.nyisoTrend}
              accentColor="var(--market-nyiso)"
              isLoading={isLoading}
            />

            {/* PJM Card */}
            <MarketDetailCard
              name="PJM"
              region="Mid-Atlantic"
              pricing={pjmPricing}
              load={pjmLoad}
              generation={pjmGeneration}
              trend={marketMetrics.pjmTrend}
              accentColor="var(--market-pjm)"
              isLoading={isLoading}
            />

            {/* SPP Card */}
            <MarketDetailCard
              name="SPP"
              region="Southwest"
              pricing={sppPricing}
              load={sppLoad}
              generation={sppGeneration}
              trend={marketMetrics.sppTrend}
              accentColor="var(--market-spp)"
              isLoading={isLoading}
            />
          </div>
        </section>

        {/* Canadian Markets Section */}
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-data-positive" />
            <h2 className="text-lg font-semibold text-foreground">Canadian Markets</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* AESO Card */}
            <MarketDetailCard
              name="AESO"
              region="Alberta"
              pricing={aesoPricing}
              load={aesoLoad}
              generation={aesoGeneration}
              trend={marketMetrics.aesoTrend}
              accentColor="var(--market-aeso)"
              isLoading={isLoading}
              isCad={true}
              convertToUSD={convertToUSD}
            />

            {/* IESO Card */}
            <MarketDetailCard
              name="IESO"
              region="Ontario"
              pricing={iesoPricing}
              load={iesoLoad}
              generation={iesoGeneration}
              trend={marketMetrics.iesoTrend}
              accentColor="var(--market-ieso)"
              isLoading={isLoading}
              isCad={true}
              convertToUSD={convertToUSD}
            />
          </div>
        </section>
      </div>
    </ResponsivePageContainer>
  );
};

// Market Detail Card Component
interface MarketDetailCardProps {
  name: string;
  region: string;
  pricing: any;
  load: any;
  generation: any;
  trend: any;
  accentColor: string;
  isLoading: boolean;
  isCad?: boolean;
  convertToUSD?: (value: number) => number;
}

function MarketDetailCard({
  name,
  region,
  pricing,
  load,
  generation,
  trend,
  accentColor,
  isLoading,
  isCad = false,
  convertToUSD
}: MarketDetailCardProps) {
  const displayPrice = isCad && convertToUSD && pricing 
    ? convertToUSD(pricing.current_price) 
    : pricing?.current_price;

  return (
    <Card className="relative overflow-hidden border border-border hover:shadow-md-soft transition-all duration-200 group">
      {/* Accent Bar */}
      <div 
        className="absolute left-0 top-0 bottom-0 w-1"
        style={{ backgroundColor: `hsl(${accentColor})` }}
      />
      
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4" style={{ color: `hsl(${accentColor})` }} />
            <CardTitle className="text-base font-semibold">
              {name}
              <span className="text-muted-foreground font-normal ml-1.5 text-sm">
                ({region})
              </span>
            </CardTitle>
          </div>
          <Badge 
            variant="secondary" 
            className="text-[10px] uppercase tracking-wide"
          >
            {pricing?.market_conditions || 'Loading'}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Pricing */}
        {pricing ? (
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-muted/50 rounded-lg p-3">
              <p className="text-xs text-muted-foreground font-medium mb-1">Current Price</p>
              <p className="text-xl font-semibold tabular-nums text-foreground">
                ${displayPrice?.toFixed(2)}
              </p>
              {isCad && (
                <p className="text-xs text-muted-foreground">
                  CA${pricing.current_price.toFixed(2)}
                </p>
              )}
              <p className="text-[10px] text-muted-foreground mt-0.5">per MWh</p>
            </div>
            <div className="bg-muted/50 rounded-lg p-3">
              <p className="text-xs text-muted-foreground font-medium mb-1">Peak Price</p>
              <p className="text-xl font-semibold tabular-nums text-data-negative">
                ${pricing.peak_price?.toFixed(2) || '—'}
              </p>
              {trend && (
                <div className={cn(
                  'flex items-center gap-1 mt-1',
                  trend.isPositive ? 'text-data-negative' : 'text-data-positive'
                )}>
                  {trend.isPositive ? (
                    <ArrowUpRight className="w-3 h-3" />
                  ) : (
                    <ArrowDownRight className="w-3 h-3" />
                  )}
                  <span className="text-xs font-medium tabular-nums">
                    {trend.percentage}% vs avg
                  </span>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-muted/50 rounded-lg p-3">
            <div className="flex items-center gap-2 text-muted-foreground">
              <AlertCircle className="w-4 h-4" />
              <span className="text-sm">Pricing data temporarily unavailable</span>
            </div>
          </div>
        )}

        {/* Load Information */}
        {load && (
          <div className="space-y-2">
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground font-medium">System Load</span>
              <span className="font-semibold tabular-nums text-foreground">
                {(load.current_demand_mw / 1000).toFixed(1)} GW
              </span>
            </div>
            <Progress 
              value={(load.current_demand_mw / load.peak_forecast_mw) * 100} 
              className="h-2"
            />
            <div className="flex justify-between text-[10px] text-muted-foreground">
              <span>Current</span>
              <span>Peak: {(load.peak_forecast_mw / 1000).toFixed(1)} GW</span>
            </div>
          </div>
        )}

        {/* Generation Mix */}
        {generation && (
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground font-medium">Generation Mix</p>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
              {generation.natural_gas_mw > 0 && (
                <div className="flex items-center gap-1.5">
                  <Fuel className="w-3.5 h-3.5 text-blue-500" />
                  <span className="text-foreground">
                    Gas: {((generation.natural_gas_mw / generation.total_generation_mw) * 100).toFixed(0)}%
                  </span>
                </div>
              )}
              {generation.wind_mw > 0 && (
                <div className="flex items-center gap-1.5">
                  <Wind className="w-3.5 h-3.5 text-green-500" />
                  <span className="text-foreground">
                    Wind: {((generation.wind_mw / generation.total_generation_mw) * 100).toFixed(0)}%
                  </span>
                </div>
              )}
              {generation.solar_mw > 0 && (
                <div className="flex items-center gap-1.5">
                  <Sun className="w-3.5 h-3.5 text-yellow-500" />
                  <span className="text-foreground">
                    Solar: {((generation.solar_mw / generation.total_generation_mw) * 100).toFixed(0)}%
                  </span>
                </div>
              )}
              {generation.nuclear_mw > 0 && (
                <div className="flex items-center gap-1.5">
                  <Battery className="w-3.5 h-3.5 text-purple-500" />
                  <span className="text-foreground">
                    Nuclear: {((generation.nuclear_mw / generation.total_generation_mw) * 100).toFixed(0)}%
                  </span>
                </div>
              )}
              {generation.coal_mw > 0 && (
                <div className="flex items-center gap-1.5">
                  <Gauge className="w-3.5 h-3.5 text-gray-500" />
                  <span className="text-foreground">
                    Coal: {((generation.coal_mw / generation.total_generation_mw) * 100).toFixed(0)}%
                  </span>
                </div>
              )}
              {generation.hydro_mw > 0 && (
                <div className="flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-cyan-500" />
                  <span className="text-foreground">
                    Hydro: {((generation.hydro_mw / generation.total_generation_mw) * 100).toFixed(0)}%
                  </span>
                </div>
              )}
            </div>
            <div className="bg-data-positive/10 text-data-positive rounded-md px-2.5 py-1.5 text-xs font-medium">
              Renewable: {generation.renewable_percentage?.toFixed(1) || '0'}%
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default Dashboard;

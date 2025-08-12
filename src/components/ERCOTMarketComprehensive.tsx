import React, { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RefreshCw, Zap, Gauge, Activity, MapPin, Sun, Wind } from 'lucide-react';
import { useERCOTData } from '@/hooks/useERCOTData';

export const ERCOTMarketComprehensive: React.FC = () => {
  const { pricing, loadData, generationMix, loading, refetch } = useERCOTData();

  // Basic SEO without extra deps
  useEffect(() => {
    document.title = 'ERCOT Market Hub | VoltScout';
    const upsertMeta = (name: string, content: string) => {
      let el = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement | null;
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute('name', name);
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    };
    upsertMeta('description', 'ERCOT Market Hub with real-time Texas grid prices, load, and generation mix.');

    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', window.location.href);
  }, []);

  const getConditionBadge = () => {
    const condition = pricing?.market_conditions?.toLowerCase();
    if (condition === 'high' || condition === 'extreme') return (
      <Badge variant="destructive" className="text-xs">High Stress</Badge>
    );
    if (condition === 'moderate') return (
      <Badge variant="secondary" className="text-xs">Moderate</Badge>
    );
    return <Badge variant="outline" className="text-xs">Normal</Badge>;
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-background to-muted/30 p-2 sm:p-4 lg:p-6">
      <article className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
        {/* Header */}
        <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="min-w-0 flex-1">
            <h1 className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold text-foreground flex items-center flex-wrap gap-2">
              <MapPin className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-primary" />
              <span>ERCOT Market & Intelligence Hub</span>
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              Real-time market data for the Texas grid: price, load, and generation mix
            </p>
          </div>
          <Button onClick={refetch} disabled={loading} className="flex-shrink-0 w-full sm:w-auto min-h-[44px] px-3 sm:px-4">
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            <span className="text-sm">Refresh Data</span>
          </Button>
        </header>

        {/* Grid */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {/* Pricing */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between gap-2">
                <span className="flex items-center"><Zap className="w-4 h-4 mr-2 text-primary" /> Real-Time Pricing</span>
                {getConditionBadge()}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs sm:text-sm text-muted-foreground">Current Price</p>
                  <p className="text-xl font-bold">
                    {pricing ? `$${pricing.current_price.toFixed(2)}` : '—'}/MWh
                  </p>
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-muted-foreground">Average Price</p>
                  <p className="text-lg font-semibold">
                    {pricing ? `$${pricing.average_price.toFixed(2)}` : '—'}/MWh
                  </p>
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-muted-foreground">Peak</p>
                  <p className="font-medium">{pricing ? `$${pricing.peak_price.toFixed(2)}` : '—'}/MWh</p>
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-muted-foreground">Off-Peak</p>
                  <p className="font-medium">{pricing ? `$${pricing.off_peak_price.toFixed(2)}` : '—'}/MWh</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Load */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center"><Gauge className="w-4 h-4 mr-2 text-primary" /> System Load & Demand</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs sm:text-sm text-muted-foreground">Current Demand</p>
                  <p className="text-xl font-bold">{loadData ? (loadData.current_demand_mw / 1000).toFixed(1) : '—'} GW</p>
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-muted-foreground">Peak Forecast</p>
                  <p className="text-lg font-semibold">{loadData ? (loadData.peak_forecast_mw / 1000).toFixed(1) : '—'} GW</p>
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-muted-foreground">Reserve Margin</p>
                  <p className="font-medium">{loadData ? `${loadData.reserve_margin.toFixed(1)}%` : '—'}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Generation */}
        <section className="grid grid-cols-1 gap-4 sm:gap-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center"><Activity className="w-4 h-4 mr-2 text-primary" /> Generation Mix</CardTitle>
            </CardHeader>
            <CardContent>
              {generationMix ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-xs sm:text-sm text-muted-foreground">Total Generation</p>
                    <p className="text-lg font-semibold">{(generationMix.total_generation_mw / 1000).toFixed(1)} GW</p>
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm text-muted-foreground flex items-center"><Sun className="w-3 h-3 mr-1" /> Solar</p>
                    <p className="font-medium">{generationMix.solar_mw.toFixed(0)} MW</p>
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm text-muted-foreground flex items-center"><Wind className="w-3 h-3 mr-1" /> Wind</p>
                    <p className="font-medium">{generationMix.wind_mw.toFixed(0)} MW</p>
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm text-muted-foreground">Natural Gas</p>
                    <p className="font-medium">{generationMix.natural_gas_mw.toFixed(0)} MW</p>
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm text-muted-foreground">Nuclear</p>
                    <p className="font-medium">{generationMix.nuclear_mw.toFixed(0)} MW</p>
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm text-muted-foreground">Renewables</p>
                    <p className="font-medium">{generationMix.renewable_percentage.toFixed(1)}%</p>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Loading generation mix…</p>
              )}
            </CardContent>
          </Card>
        </section>
      </article>
    </main>
  );
};

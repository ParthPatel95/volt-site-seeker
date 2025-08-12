import React, { useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  RefreshCw,
  Zap,
  Gauge,
  Activity,
  MapPin,
  Sun,
  Wind,
  BarChart3,
  AlertTriangle,
  Target,
  Shield
} from 'lucide-react';
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
    upsertMeta('description', 'ERCOT Market Hub with real-time Texas grid prices, load, generation mix, analytics, and alerts.');

    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', window.location.href);
  }, []);

  const currentPrice = pricing?.current_price ?? 0;
  const avgPrice = pricing?.average_price ?? 0;
  const reserveMargin = loadData?.reserve_margin ?? 0;
  const renewPct = generationMix?.renewable_percentage ?? 0;

  const stressScore = useMemo(() => {
    // Simple composite: price weight 60%, reserve inverse 30%, volatility proxy 10%
    const priceScore = Math.min(100, (currentPrice / Math.max(50, avgPrice || 1)) * 60);
    const reserveScore = Math.min(100, (Math.max(0, 25 - reserveMargin) / 25) * 30);
    const volatilityScore = Math.min(10, Math.abs(currentPrice - avgPrice) / Math.max(1, avgPrice) * 10);
    return Math.round(priceScore + reserveScore + volatilityScore);
  }, [currentPrice, avgPrice, reserveMargin]);

  const nextHourPrediction = useMemo(() => {
    const cond = pricing?.market_conditions?.toLowerCase() || 'normal';
    let delta = 0;
    if (cond.includes('high') || cond.includes('extreme')) delta = Math.max(5, avgPrice * 0.15);
    else if (cond.includes('moderate')) delta = avgPrice * 0.05;
    else delta = -avgPrice * 0.03;
    const predicted = Math.max(0, currentPrice + delta);
    return Number(predicted.toFixed(2));
  }, [pricing?.market_conditions, currentPrice, avgPrice]);

  const shortForecast = useMemo(() => {
    // 6-point simple forecast for the next 3 hours at 30-min steps
    const steps = [0.5, 1, 1.5, 2, 2.5, 3];
    const trend = nextHourPrediction - currentPrice; // simple linear trend
    return steps.map((h, i) => ({
      label: `${h}h`,
      price: Number(Math.max(0, currentPrice + trend * ((i + 1) / steps.length)).toFixed(2))
    }));
  }, [currentPrice, nextHourPrediction]);

  const operatingReserveMW = useMemo(() => {
    if (!loadData) return null;
    // Approximate reserve MW from reserve margin and current demand
    const reserveMW = (loadData.current_demand_mw * reserveMargin) / 100;
    return Math.round(reserveMW);
  }, [loadData, reserveMargin]);

  const investmentScore = useMemo(() => {
    // 1-5: favor low price and high renewables
    let score = 3;
    if (avgPrice < 40) score += 1;
    if (renewPct > 35) score += 1;
    if (reserveMargin < 10) score -= 1;
    return Math.max(1, Math.min(5, score));
  }, [avgPrice, renewPct, reserveMargin]);

  const alerts = useMemo(() => {
    const list: { type: 'warning' | 'critical' | 'info'; message: string }[] = [];
    if (currentPrice > 100) list.push({ type: 'critical', message: `High price alert: $${currentPrice.toFixed(2)}/MWh` });
    if (reserveMargin > 0 && reserveMargin < 10) list.push({ type: 'warning', message: `Low reserve margin: ${reserveMargin.toFixed(1)}%` });
    if (avgPrice > 0 && Math.abs(currentPrice - avgPrice) / avgPrice > 0.5) list.push({ type: 'info', message: 'Price deviates >50% from daily average' });
    return list;
  }, [currentPrice, avgPrice, reserveMargin]);

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
              Real-time market data for the Texas grid with analytics, forecasts and alerts
            </p>
          </div>
          <Button onClick={refetch} disabled={loading} className="flex-shrink-0 w-full sm:w-auto min-h-[44px] px-3 sm:px-4">
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            <span className="text-sm">Refresh All Data</span>
          </Button>
        </header>

        {/* Tabs */}
        <Tabs defaultValue="market" className="space-y-4">
          <div className="w-full overflow-x-auto">
            <TabsList className="grid w-full min-w-max sm:min-w-0" style={{ gridTemplateColumns: 'repeat(6, minmax(100px, 1fr))' }}>
              <TabsTrigger value="market" className="flex items-center justify-center space-x-1 text-xs sm:text-sm px-2">
                <Zap className="w-3 h-3 sm:w-4 sm:h-4" />
                <span>Market</span>
              </TabsTrigger>
              <TabsTrigger value="generation" className="flex items-center justify-center space-x-1 text-xs sm:text-sm px-2">
                <Activity className="w-3 h-3 sm:w-4 sm:h-4" />
                <span>Generation</span>
              </TabsTrigger>
              <TabsTrigger value="analytics" className="flex items-center justify-center space-x-1 text-xs sm:text-sm px-2">
                <BarChart3 className="w-3 h-3 sm:w-4 sm:h-4" />
                <span>Analytics</span>
              </TabsTrigger>
              <TabsTrigger value="forecast" className="flex items-center justify-center space-x-1 text-xs sm:text-sm px-2">
                <Wind className="w-3 h-3 sm:w-4 sm:h-4" />
                <span>Forecast</span>
              </TabsTrigger>
              <TabsTrigger value="investment" className="flex items-center justify-center space-x-1 text-xs sm:text-sm px-2">
                <Target className="w-3 h-3 sm:w-4 sm:h-4" />
                <span>Investment</span>
              </TabsTrigger>
              <TabsTrigger value="alerts" className="flex items-center justify-center space-x-1 text-xs sm:text-sm px-2">
                <AlertTriangle className="w-3 h-3 sm:w-4 sm:h-4" />
                <span>Alerts</span>
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Market Tab */}
          <TabsContent value="market" className="space-y-4 sm:space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
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
                      <p className="text-xl font-bold">{pricing ? `$${currentPrice.toFixed(2)}` : '—'}/MWh</p>
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm text-muted-foreground">Average Price</p>
                      <p className="text-lg font-semibold">{pricing ? `$${avgPrice.toFixed(2)}` : '—'}/MWh</p>
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

              {/* Load & Reserve */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center"><Gauge className="w-4 h-4 mr-2 text-primary" /> System Load & Reserve</CardTitle>
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
                      <p className="font-medium">{loadData ? `${reserveMargin.toFixed(1)}%` : '—'}</p>
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm text-muted-foreground">Approx. Operating Reserve</p>
                      <p className="font-medium">{operatingReserveMW ? `${operatingReserveMW} MW` : '—'}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Generation Tab */}
          <TabsContent value="generation">
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
                      <p className="font-medium">{renewPct.toFixed(1)}%</p>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Loading generation mix…</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
              <Card>
                <CardHeader className="pb-2"><CardTitle className="text-sm">Market Stress</CardTitle></CardHeader>
                <CardContent>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold">{stressScore}</span>
                    <span className="text-sm text-muted-foreground">/ 100</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Derived from price, reserve, and volatility</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2"><CardTitle className="text-sm">Price Prediction (next hour)</CardTitle></CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">${'{'}nextHourPrediction{'}'}</p>
                  <p className="text-xs text-muted-foreground mt-1">Based on current condition: {pricing?.market_conditions || 'normal'}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2"><CardTitle className="text-sm">Key Stats</CardTitle></CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between"><span>Renewables</span><span>{renewPct ? `${renewPct.toFixed(1)}%` : '—'}</span></div>
                    <div className="flex justify-between"><span>Reserve Margin</span><span>{reserveMargin ? `${reserveMargin.toFixed(1)}%` : '—'}</span></div>
                    <div className="flex justify-between"><span>Avg Price</span><span>{avgPrice ? `$${avgPrice.toFixed(2)}` : '—'}</span></div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Forecast Tab */}
          <TabsContent value="forecast">
            <Card>
              <CardHeader className="pb-3"><CardTitle className="flex items-center"><Wind className="w-4 h-4 mr-2 text-primary" /> Short-Term Price Forecast</CardTitle></CardHeader>
              <CardContent>
                {pricing ? (
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                    {shortForecast.map((pt) => (
                      <div key={pt.label} className="p-3 rounded-md border">
                        <p className="text-xs text-muted-foreground">{pt.label}</p>
                        <p className="font-semibold">${'{'}pt.price.toFixed(2){'}'}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Waiting for live pricing…</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Investment Tab */}
          <TabsContent value="investment">
            <Card>
              <CardHeader className="pb-3"><CardTitle className="flex items-center"><Target className="w-4 h-4 mr-2 text-primary" /> Investment Signal</CardTitle></CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="text-sm">Score: {investmentScore}/5</Badge>
                  <span className="text-sm text-muted-foreground">Lower prices and higher renewables improve the score.</span>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Alerts Tab */}
          <TabsContent value="alerts">
            <Card>
              <CardHeader className="pb-3"><CardTitle className="flex items-center"><AlertTriangle className="w-4 h-4 mr-2 text-primary" /> Live Alerts</CardTitle></CardHeader>
              <CardContent>
                {alerts.length ? (
                  <ul className="space-y-2">
                    {alerts.map((a, idx) => (
                      <li key={idx} className={`p-3 rounded-md border flex items-center gap-2 ${a.type === 'critical' ? 'bg-destructive/10' : a.type === 'warning' ? 'bg-yellow-500/10' : 'bg-muted/40'}`}>
                        <Shield className="w-4 h-4" />
                        <span className="text-sm">{a.message}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground">No active alerts based on current data.</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </article>
    </main>
  );
};

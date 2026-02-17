import React, { useState, useEffect, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Activity, 
  Zap, 
  Thermometer, 
  Wind, 
  ArrowLeftRight,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Gauge,
  Cloud,
  Sun,
  Droplets,
  BarChart3
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface MarketData {
  timestamp: string;
  pool_price: number;
  ail_mw: number;
  reserve_margin_percent: number | null;
  spinning_reserve_mw: number | null;
  supplemental_reserve_mw: number | null;
  grid_stress_score: number | null;
  price_spike_probability: number | null;
  market_stress_score: number | null;
  intertie_bc_flow: number | null;
  intertie_sask_flow: number | null;
  intertie_montana_flow: number | null;
  interchange_net: number | null;
  temperature_calgary: number | null;
  temperature_edmonton: number | null;
  wind_speed: number | null;
  cloud_cover: number | null;
  renewable_penetration: number | null;
  generation_wind: number | null;
  generation_solar: number | null;
  generation_gas: number | null;
  price_rolling_avg_24h: number | null;
  price_rolling_std_24h: number | null;
  price_volatility_6h: number | null;
  price_momentum_3h: number | null;
  available_capacity_mw: number | null;
  outage_capacity_mw: number | null;
}

interface MarketIntelligencePanelProps {
  className?: string;
}

interface CalculatedAnalytics {
  rollingAvg24h: number;
  rollingStd24h: number;
  volatility6h: number;
  momentum3h: number;
}

export function MarketIntelligencePanel({ className }: MarketIntelligencePanelProps) {
  const [marketData, setMarketData] = useState<MarketData | null>(null);
  const [loading, setLoading] = useState(true);
  const [calculatedAnalytics, setCalculatedAnalytics] = useState<CalculatedAnalytics | null>(null);

  useEffect(() => {
    const fetchMarketData = async () => {
      try {
        const { data, error } = await supabase
          .from('aeso_training_data')
          .select(`
            timestamp, pool_price, ail_mw, reserve_margin_percent, 
            spinning_reserve_mw, supplemental_reserve_mw, grid_stress_score,
            price_spike_probability, market_stress_score, intertie_bc_flow,
            intertie_sask_flow, intertie_montana_flow, interchange_net,
            temperature_calgary, temperature_edmonton, wind_speed, cloud_cover,
            renewable_penetration, generation_wind, generation_solar, generation_gas,
            price_rolling_avg_24h, price_rolling_std_24h, price_volatility_6h,
            price_momentum_3h, available_capacity_mw, outage_capacity_mw
          `)
          .order('timestamp', { ascending: false })
          .limit(1)
          .single();

        if (error) throw error;
        setMarketData(data);
      } catch (err) {
        console.error('[MarketIntelligencePanel] Fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMarketData();
    const interval = setInterval(fetchMarketData, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, []);

  // Fetch and calculate real-time analytics if database values are null
  useEffect(() => {
    const calculateAnalytics = async () => {
      if (!marketData) return;
      
      // Check if we need to calculate any analytics
      const needsCalculation = 
        marketData.price_rolling_avg_24h === null ||
        marketData.price_rolling_std_24h === null ||
        marketData.price_volatility_6h === null ||
        marketData.price_momentum_3h === null;
      
      if (!needsCalculation) {
        setCalculatedAnalytics(null);
        return;
      }

      try {
        // Fetch last 24 hours of price data
        const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
        const { data: priceHistory, error } = await supabase
          .from('aeso_training_data')
          .select('timestamp, pool_price')
          .gte('timestamp', twentyFourHoursAgo)
          .order('timestamp', { ascending: true });

        if (error || !priceHistory || priceHistory.length < 2) {
          console.warn('[MarketIntelligencePanel] Insufficient price history for analytics');
          return;
        }

        const prices = priceHistory.map(p => p.pool_price);
        
        // Calculate 24h rolling average
        const rollingAvg24h = prices.reduce((a, b) => a + b, 0) / prices.length;
        
        // Calculate 24h standard deviation
        const variance = prices.reduce((sum, p) => sum + Math.pow(p - rollingAvg24h, 2), 0) / prices.length;
        const rollingStd24h = Math.sqrt(variance);
        
        // Calculate 6h volatility (last 6 hours of data)
        const sixHoursAgo = new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString();
        const last6hPrices = priceHistory
          .filter(p => p.timestamp >= sixHoursAgo)
          .map(p => p.pool_price);
        
        let volatility6h = 0;
        if (last6hPrices.length > 1) {
          const min6h = Math.min(...last6hPrices);
          const max6h = Math.max(...last6hPrices);
          const avg6h = last6hPrices.reduce((a, b) => a + b, 0) / last6hPrices.length;
          volatility6h = avg6h > 0 ? ((max6h - min6h) / avg6h) * 100 : 0;
        }
        
        // Calculate 3h momentum (price change over last 3 hours)
        const threeHoursAgo = new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString();
        const last3hPrices = priceHistory
          .filter(p => p.timestamp >= threeHoursAgo)
          .map(p => p.pool_price);
        
        let momentum3h = 0;
        if (last3hPrices.length >= 2) {
          momentum3h = last3hPrices[last3hPrices.length - 1] - last3hPrices[0];
        }

        setCalculatedAnalytics({
          rollingAvg24h,
          rollingStd24h,
          volatility6h,
          momentum3h
        });
        
        console.log('[MarketIntelligencePanel] Calculated real-time analytics:', {
          rollingAvg24h: rollingAvg24h.toFixed(2),
          rollingStd24h: rollingStd24h.toFixed(2),
          volatility6h: volatility6h.toFixed(2),
          momentum3h: momentum3h.toFixed(2),
          dataPoints: prices.length
        });
      } catch (err) {
        console.error('[MarketIntelligencePanel] Analytics calculation error:', err);
      }
    };

    calculateAnalytics();
  }, [marketData]);

  // Calculate fallback values for derived metrics
  const derivedMetrics = useMemo(() => {
    if (!marketData) return null;
    
    // Calculate renewable penetration if DB value is null
    const totalGen = (marketData.generation_wind || 0) + (marketData.generation_solar || 0) + (marketData.generation_gas || 0);
    const renewablePercent = marketData.renewable_penetration ?? 
      (totalGen > 0 ? ((marketData.generation_wind || 0) + (marketData.generation_solar || 0)) / totalGen * 100 : 0);
    
    // Calculate reserve margin fallback (estimate 15% if null)
    const reserveMargin = marketData.reserve_margin_percent ?? 15;
    
    // Calculate spike probability fallback
    const stress = marketData.grid_stress_score || 0;
    let spikeProb = marketData.price_spike_probability;
    if (spikeProb === null || spikeProb === undefined) {
      spikeProb = 10;
      if (marketData.pool_price > 100) spikeProb += 30;
      else if (marketData.pool_price > 50) spikeProb += 15;
      if (stress > 70) spikeProb += 40;
      else if (stress > 40) spikeProb += 20;
      if (reserveMargin < 10) spikeProb += 20;
      else if (reserveMargin < 15) spikeProb += 10;
      spikeProb = Math.min(spikeProb, 95);
    }
    
    // Calculate available capacity as demand + spinning reserves (more accurate)
    const availableCapacity = marketData.available_capacity_mw ?? 
      ((marketData.ail_mw || 0) + (marketData.spinning_reserve_mw || 0));
    
    // Use calculated analytics or database values
    const rollingAvg24h = marketData.price_rolling_avg_24h ?? calculatedAnalytics?.rollingAvg24h ?? marketData.pool_price;
    const rollingStd24h = marketData.price_rolling_std_24h ?? calculatedAnalytics?.rollingStd24h ?? 0;
    const volatility6h = marketData.price_volatility_6h ?? calculatedAnalytics?.volatility6h ?? 0;
    const momentum3h = marketData.price_momentum_3h ?? calculatedAnalytics?.momentum3h ?? 0;
    
    return { 
      renewablePercent, 
      reserveMargin, 
      spikeProb, 
      availableCapacity,
      rollingAvg24h,
      rollingStd24h,
      volatility6h,
      momentum3h,
      hasCalculatedAnalytics: calculatedAnalytics !== null
    };
  }, [marketData, calculatedAnalytics]);

  const gridHealthStatus = useMemo(() => {
    if (!marketData || !derivedMetrics) return { status: 'unknown', color: 'text-muted-foreground' };
    const stress = marketData.grid_stress_score || 0;
    const reserve = derivedMetrics.reserveMargin;
    
    if (stress > 70 || reserve < 10) return { status: 'Critical', color: 'text-destructive' };
    if (stress > 40 || reserve < 15) return { status: 'Warning', color: 'text-amber-500' };
    return { status: 'Healthy', color: 'text-emerald-500' };
  }, [marketData, derivedMetrics]);

  const formatFlow = (flow: number | null) => {
    if (flow === null || flow === undefined) return '—';
    const abs = Math.abs(flow);
    const direction = flow >= 0 ? 'Export' : 'Import';
    return `${direction} ${abs.toFixed(0)}`;
  };

  if (loading) {
    return (
      <div className={cn("animate-pulse space-y-4", className)}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-24 bg-muted rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (!marketData) return null;

  return (
    <div className={cn("space-y-4", className)}>
      <Tabs defaultValue="grid" className="w-full">
        <TabsList className="flex w-full h-8 overflow-x-auto scrollbar-hide">
          <TabsTrigger value="grid" className="text-xs flex-shrink-0">Grid Health</TabsTrigger>
          <TabsTrigger value="interties" className="text-xs flex-shrink-0">Interties</TabsTrigger>
          <TabsTrigger value="supply" className="text-xs flex-shrink-0">Supply</TabsTrigger>
          <TabsTrigger value="weather" className="text-xs flex-shrink-0">Weather</TabsTrigger>
          <TabsTrigger value="analytics" className="text-xs flex-shrink-0">Analytics</TabsTrigger>
        </TabsList>

        {/* Grid Health Panel */}
        <TabsContent value="grid" className="mt-3">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {/* Grid Status */}
            <Card className="p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Grid Status</span>
                <Activity className={cn("w-4 h-4", gridHealthStatus.color)} />
              </div>
              <div className={cn("text-lg font-bold", gridHealthStatus.color)}>
                {gridHealthStatus.status}
              </div>
              <div className="text-[10px] text-muted-foreground">
                Stress: {(marketData.grid_stress_score || 0).toFixed(0)}%
              </div>
            </Card>

            {/* Reserve Margin */}
            <Card className="p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Reserve Margin</span>
                <Gauge className="w-4 h-4 text-primary" />
              </div>
              <div className="text-lg font-bold">
                {(derivedMetrics?.reserveMargin || 0).toFixed(1)}%
              </div>
              <Progress 
                value={Math.min(derivedMetrics?.reserveMargin || 0, 100)} 
                className="h-1.5"
              />
            </Card>

            {/* Spinning Reserve */}
            <Card className="p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Spinning Reserve</span>
                <Zap className="w-4 h-4 text-amber-500" />
              </div>
              <div className="text-lg font-bold">
                {((marketData.spinning_reserve_mw || 0) / 1000).toFixed(1)}K
              </div>
              <div className="text-[10px] text-muted-foreground">MW available</div>
            </Card>

            {/* Spike Probability */}
            <Card className="p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Spike Risk</span>
                <AlertTriangle className={cn(
                  "w-4 h-4",
                  (derivedMetrics?.spikeProb || 0) > 50 ? "text-destructive" : 
                  (derivedMetrics?.spikeProb || 0) > 25 ? "text-amber-500" : "text-emerald-500"
                )} />
              </div>
              <div className={cn(
                "text-lg font-bold",
                (derivedMetrics?.spikeProb || 0) > 50 ? "text-destructive" : 
                (derivedMetrics?.spikeProb || 0) > 25 ? "text-amber-500" : "text-emerald-500"
              )}>
                {(derivedMetrics?.spikeProb || 0).toFixed(0)}%
              </div>
              <div className="text-[10px] text-muted-foreground">probability</div>
            </Card>
          </div>
        </TabsContent>

        {/* Interties Panel */}
        <TabsContent value="interties" className="mt-3">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {/* BC Intertie */}
            <Card className="p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">BC</span>
                <ArrowLeftRight className={cn(
                  "w-4 h-4",
                  (marketData.intertie_bc_flow || 0) >= 0 ? "text-emerald-500" : "text-blue-500"
                )} />
              </div>
              <div className={cn(
                "text-lg font-bold",
                (marketData.intertie_bc_flow || 0) >= 0 ? "text-emerald-500" : "text-blue-500"
              )}>
                {formatFlow(marketData.intertie_bc_flow)}
              </div>
              <div className="text-[10px] text-muted-foreground">
                {Math.abs(marketData.intertie_bc_flow || 0).toFixed(0)} MW
              </div>
            </Card>

            {/* Saskatchewan Intertie */}
            <Card className="p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Saskatchewan</span>
                <ArrowLeftRight className={cn(
                  "w-4 h-4",
                  (marketData.intertie_sask_flow || 0) >= 0 ? "text-emerald-500" : "text-blue-500"
                )} />
              </div>
              <div className={cn(
                "text-lg font-bold",
                (marketData.intertie_sask_flow || 0) >= 0 ? "text-emerald-500" : "text-blue-500"
              )}>
                {formatFlow(marketData.intertie_sask_flow)}
              </div>
              <div className="text-[10px] text-muted-foreground">
                {Math.abs(marketData.intertie_sask_flow || 0).toFixed(0)} MW
              </div>
            </Card>

            {/* Montana Intertie */}
            <Card className="p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Montana</span>
                <ArrowLeftRight className={cn(
                  "w-4 h-4",
                  (marketData.intertie_montana_flow || 0) >= 0 ? "text-emerald-500" : "text-blue-500"
                )} />
              </div>
              <div className={cn(
                "text-lg font-bold",
                (marketData.intertie_montana_flow || 0) >= 0 ? "text-emerald-500" : "text-blue-500"
              )}>
                {formatFlow(marketData.intertie_montana_flow)}
              </div>
              <div className="text-[10px] text-muted-foreground">
                {Math.abs(marketData.intertie_montana_flow || 0).toFixed(0)} MW
              </div>
            </Card>

            {/* Net Interchange */}
            <Card className="p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Net Flow</span>
                {(marketData.interchange_net || 0) >= 0 ? 
                  <TrendingUp className="w-4 h-4 text-emerald-500" /> :
                  <TrendingDown className="w-4 h-4 text-blue-500" />
                }
              </div>
              <div className={cn(
                "text-lg font-bold",
                (marketData.interchange_net || 0) >= 0 ? "text-emerald-500" : "text-blue-500"
              )}>
                {(marketData.interchange_net || 0) >= 0 ? 'Net Export' : 'Net Import'}
              </div>
              <div className="text-[10px] text-muted-foreground">
                {Math.abs(marketData.interchange_net || 0).toFixed(0)} MW
              </div>
            </Card>
          </div>
        </TabsContent>

        {/* Supply Panel */}
        <TabsContent value="supply" className="mt-3">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {/* Current Demand */}
            <Card className="p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Demand</span>
                <Activity className="w-4 h-4 text-primary" />
              </div>
              <div className="text-lg font-bold">
                {((marketData.ail_mw || 0) / 1000).toFixed(1)}K
              </div>
              <div className="text-[10px] text-muted-foreground">MW (AIL)</div>
            </Card>

            {/* Available Capacity */}
            <Card className="p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Capacity</span>
                <Zap className="w-4 h-4 text-emerald-500" />
              </div>
              <div className="text-lg font-bold text-emerald-500">
                {((derivedMetrics?.availableCapacity || 0) / 1000).toFixed(1)}K
              </div>
              <div className="text-[10px] text-muted-foreground">
                MW available
                {!marketData.available_capacity_mw && <span className="ml-1 opacity-60">(calc)</span>}
              </div>
            </Card>

            {/* Outages */}
            <Card className="p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Outages</span>
                <AlertTriangle className="w-4 h-4 text-amber-500" />
              </div>
              <div className="text-lg font-bold text-amber-500">
                {((marketData.outage_capacity_mw || 0) / 1000).toFixed(1)}K
              </div>
              <div className="text-[10px] text-muted-foreground">
                MW offline
                {(marketData.outage_capacity_mw || 0) === 0 && <span className="ml-1 opacity-60">(est)</span>}
              </div>
            </Card>

            {/* Renewable Penetration */}
            <Card className="p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Renewable %</span>
                <Wind className="w-4 h-4 text-emerald-500" />
              </div>
              <div className="text-lg font-bold text-emerald-500">
                {(derivedMetrics?.renewablePercent || 0).toFixed(1)}%
              </div>
              <Progress 
                value={Math.min(derivedMetrics?.renewablePercent || 0, 100)} 
                className="h-1.5"
              />
            </Card>
          </div>
        </TabsContent>

        {/* Weather Panel */}
        <TabsContent value="weather" className="mt-3">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {/* Calgary Temp */}
            <Card className="p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Calgary</span>
                <Thermometer className="w-4 h-4 text-orange-500" />
              </div>
              <div className="text-lg font-bold">
                {(marketData.temperature_calgary || 0).toFixed(1)}°C
              </div>
              <div className="text-[10px] text-muted-foreground">Temperature</div>
            </Card>

            {/* Edmonton Temp */}
            <Card className="p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Edmonton</span>
                <Thermometer className="w-4 h-4 text-orange-500" />
              </div>
              <div className="text-lg font-bold">
                {(marketData.temperature_edmonton || 0).toFixed(1)}°C
              </div>
              <div className="text-[10px] text-muted-foreground">Temperature</div>
            </Card>

            {/* Wind Speed */}
            <Card className="p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Wind</span>
                <Wind className="w-4 h-4 text-blue-500" />
              </div>
              <div className="text-lg font-bold">
                {(marketData.wind_speed || 0).toFixed(1)}
              </div>
              <div className="text-[10px] text-muted-foreground">km/h</div>
            </Card>

            {/* Cloud Cover */}
            <Card className="p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Clouds</span>
                {(marketData.cloud_cover || 0) > 50 ? 
                  <Cloud className="w-4 h-4 text-slate-400" /> :
                  <Sun className="w-4 h-4 text-amber-400" />
                }
              </div>
              <div className="text-lg font-bold">
                {(marketData.cloud_cover || 0).toFixed(0)}%
              </div>
              <Progress 
                value={Math.min(marketData.cloud_cover || 0, 100)} 
                className="h-1.5"
              />
            </Card>
          </div>
        </TabsContent>

        {/* Price Analytics Panel */}
        <TabsContent value="analytics" className="mt-3">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {/* 24h Avg Price */}
            <Card className="p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">24h Avg</span>
                <BarChart3 className="w-4 h-4 text-primary" />
              </div>
              <div className="text-lg font-bold">
                ${(derivedMetrics?.rollingAvg24h || marketData.pool_price || 0).toFixed(2)}
              </div>
              <div className="text-[10px] text-muted-foreground">
                rolling average
                {!marketData.price_rolling_avg_24h && derivedMetrics?.hasCalculatedAnalytics && 
                  <span className="ml-1 opacity-60">(calc)</span>}
              </div>
            </Card>

            {/* Price Std Dev */}
            <Card className="p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Std Dev</span>
                <Activity className="w-4 h-4 text-amber-500" />
              </div>
              <div className="text-lg font-bold">
                ±${(derivedMetrics?.rollingStd24h || 0).toFixed(2)}
              </div>
              <div className="text-[10px] text-muted-foreground">
                24h volatility
                {!marketData.price_rolling_std_24h && derivedMetrics?.hasCalculatedAnalytics && 
                  <span className="ml-1 opacity-60">(calc)</span>}
              </div>
            </Card>

            {/* 6h Volatility */}
            <Card className="p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Volatility 6h</span>
                <TrendingUp className={cn(
                  "w-4 h-4",
                  (derivedMetrics?.volatility6h || 0) > 30 ? "text-destructive" : "text-emerald-500"
                )} />
              </div>
              <div className={cn(
                "text-lg font-bold",
                (derivedMetrics?.volatility6h || 0) > 30 ? "text-destructive" : "text-emerald-500"
              )}>
                {(derivedMetrics?.volatility6h || 0).toFixed(1)}%
              </div>
              <div className="text-[10px] text-muted-foreground">
                price swing
                {!marketData.price_volatility_6h && derivedMetrics?.hasCalculatedAnalytics && 
                  <span className="ml-1 opacity-60">(calc)</span>}
              </div>
            </Card>

            {/* Price Momentum */}
            <Card className="p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Momentum 3h</span>
                {(derivedMetrics?.momentum3h || 0) >= 0 ? 
                  <TrendingUp className="w-4 h-4 text-emerald-500" /> :
                  <TrendingDown className="w-4 h-4 text-destructive" />
                }
              </div>
              <div className={cn(
                "text-lg font-bold",
                (derivedMetrics?.momentum3h || 0) >= 0 ? "text-emerald-500" : "text-destructive"
              )}>
                {(derivedMetrics?.momentum3h || 0) >= 0 ? '+' : ''}{(derivedMetrics?.momentum3h || 0).toFixed(2)}
              </div>
              <div className="text-[10px] text-muted-foreground">
                price trend
                {!marketData.price_momentum_3h && derivedMetrics?.hasCalculatedAnalytics && 
                  <span className="ml-1 opacity-60">(calc)</span>}
              </div>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Last Update Timestamp */}
      <div className="flex items-center justify-between px-1">
        <span className="text-[10px] text-muted-foreground">
          Last Updated: {marketData.timestamp ? format(new Date(marketData.timestamp), 'MMM d, HH:mm') : '—'}
        </span>
        <Badge variant="outline" className="text-[10px]">
          Live Market Data
        </Badge>
      </div>
    </div>
  );
}

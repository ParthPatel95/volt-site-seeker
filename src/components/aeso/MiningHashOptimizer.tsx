import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Zap, TrendingUp, TrendingDown, Activity, Info, RefreshCw, AlertTriangle,
  CheckCircle, XCircle, Calendar, DollarSign, Cpu, BarChart3,
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Cell, Legend } from 'recharts';
import { supabase } from '@/integrations/supabase/client';
import { useBitcoinNetworkStats } from '@/hooks/useBitcoinNetworkStats';
import { useExchangeRate } from '@/hooks/useExchangeRate';
import { DataFreshnessBadge } from '@/components/ui/data-freshness-badge';
import { AESO_TARIFF_2026 } from '@/constants/tariff-rates';
import { ASIC_SPECS, BLOCK_REWARD_BTC, BLOCKS_PER_DAY } from '@/constants/mining-data';
import { cn } from '@/lib/utils';
import { ProfitabilityHeatmap } from './mining-charts/ProfitabilityHeatmap';
import { PriceDurationCurve } from './mining-charts/PriceDurationCurve';
import { CumulativeProfitChart } from './mining-charts/CumulativeProfitChart';
import { BreakEvenSensitivity } from './mining-charts/BreakEvenSensitivity';
import { ASICComparisonTable } from './mining-charts/ASICComparisonTable';
import { SeasonalAnalysis } from './mining-charts/SeasonalAnalysis';

// ── Types ────────────────────────────────────────────────────────────────────
interface HourlyRecord {
  hour: string;
  avg_pool_price: number;
}

interface MonthlyResult {
  month: string;
  avgPrice: number;
  hoursProfitable: number;
  hoursCurtailed: number;
  totalHours: number;
  miningRevenue: number;
  energyCost: number;
  netProfit: number;
  hashPurchaseBtc: number;
  selfMinedBtc: number;
  hashBetter: boolean;
}

interface HeatmapCell {
  hour: number;
  month: string;
  avgMargin: number;
  count: number;
}

type AsicKey = keyof typeof ASIC_SPECS;

// ── Component ────────────────────────────────────────────────────────────────
export function MiningHashOptimizer() {
  // ── Configuration state ──
  const [capacityMW, setCapacityMW] = useState(45);
  const [selectedAsic, setSelectedAsic] = useState<AsicKey>('S21_PRO');
  const [poolFee, setPoolFee] = useState(1.5);
  const [hashPurchasePrice, setHashPurchasePrice] = useState(0.045); // $/TH/day
  const [dateRange, setDateRange] = useState<'6m' | '1y' | '2y' | 'all'>('1y');

  // ── Data hooks ──
  const { stats: btcStats, loading: btcLoading, refetch: refetchBtc } = useBitcoinNetworkStats();
  const { exchangeRate, convertToUSD } = useExchangeRate();

  // ── Historical data ──
  const [historicalData, setHistoricalData] = useState<HourlyRecord[]>([]);
  const [dataLoading, setDataLoading] = useState(false);
  const [dataError, setDataError] = useState<string | null>(null);

  // ── Derived constants ──
  const asic = ASIC_SPECS[selectedAsic];
  const minerEfficiency = asic.efficiency; // J/TH
  const TH_PER_MW = 1_000_000 / minerEfficiency;
  const transmissionAdder = AESO_TARIFF_2026.TRANSMISSION_ADDER_CAD_MWH;
  const cadToUsd = exchangeRate.rate;

  // ── Fetch historical AESO data ──
  const fetchHistorical = useCallback(async () => {
    setDataLoading(true);
    setDataError(null);

    const now = new Date();
    let startDate: Date;
    switch (dateRange) {
      case '6m': startDate = new Date(now.getFullYear(), now.getMonth() - 6, 1); break;
      case '1y': startDate = new Date(now.getFullYear() - 1, now.getMonth(), 1); break;
      case '2y': startDate = new Date(now.getFullYear() - 2, now.getMonth(), 1); break;
      default: startDate = new Date('2022-06-01');
    }

    try {
      // Query in batches to avoid 1000-row limit
      let allRecords: HourlyRecord[] = [];
      let page = 0;
      const pageSize = 1000;
      let hasMore = true;

      while (hasMore) {
        const { data, error } = await supabase
          .from('aeso_training_data')
          .select('timestamp, pool_price')
          .gte('timestamp', startDate.toISOString())
          .not('pool_price', 'is', null)
          .gt('pool_price', 0)
          .order('timestamp', { ascending: true })
          .range(page * pageSize, (page + 1) * pageSize - 1);

        if (error) throw error;
        if (!data || data.length === 0) { hasMore = false; break; }

        const records = data.map((d: any) => ({
          hour: d.timestamp,
          avg_pool_price: Number(d.pool_price),
        }));
        allRecords = [...allRecords, ...records];
        hasMore = data.length === pageSize;
        page++;
      }

      setHistoricalData(allRecords);
    } catch (err: any) {
      console.error('Historical data fetch failed:', err);
      setDataError(err.message || 'Failed to load historical data');
    } finally {
      setDataLoading(false);
    }
  }, [dateRange]);

  useEffect(() => { fetchHistorical(); }, [fetchHistorical]);

  // ── Core mining economics (live BTC data) ──
  const miningEcon = useMemo(() => {
    const networkHashTH = btcStats.hashrate * 1e6; // EH/s → TH/s
    const dailyBtcPerTH = (BLOCKS_PER_DAY * btcStats.blockReward) / networkHashTH;
    const hourlyBtcPerTH = dailyBtcPerTH / 24;
    const hourlyBtcPerMW = hourlyBtcPerTH * TH_PER_MW;
    const hourlyRevenuePerMW_USD = hourlyBtcPerMW * btcStats.price;

    // Break-even: revenue per MWh = energy cost per MWh
    // hourlyRevenuePerMW_USD = breakEvenCAD * cadToUsd (for 1 MWh)
    // But we also need to subtract pool fee and add transmission
    const grossRevenuePerMWh_USD = hourlyRevenuePerMW_USD * (1 - poolFee / 100);
    const breakEvenPoolPriceCAD = (grossRevenuePerMWh_USD / cadToUsd) - transmissionAdder;

    // Self-mining cost per TH/day in USD
    // Energy per TH/day = efficiency * 24 * 3600 J = efficiency * 86400 J → kWh = efficiency * 24 / 1000
    // Actually: 1 TH running for 1 day at `efficiency` J/TH per hash per second
    // Power for 1 TH/s = efficiency watts. Over 24h = efficiency * 24 Wh = efficiency * 0.024 kWh
    const selfMiningCostPerTHDay = (minerEfficiency * 24 / 1_000_000); // MWh per TH/s per day

    // Indifference energy price: where self-mining cost/BTC == hash purchase cost/BTC
    const btcPerTHDay = dailyBtcPerTH;
    // Hash purchase: spend $hashPurchasePrice → get btcPerTHDay BTC
    // Self-mine: spend (poolPrice + transmission) * selfMiningCostPerTHDay * cadToUsd → get btcPerTHDay * (1 - poolFee/100) BTC
    // Indifference: hashPurchasePrice = (poolPrice + transmission) * selfMiningCostPerTHDay * cadToUsd / (1 - poolFee/100)
    const indifferencePriceCAD = hashPurchasePrice > 0
      ? (hashPurchasePrice * (1 - poolFee / 100)) / (selfMiningCostPerTHDay * cadToUsd) - transmissionAdder
      : 0;

    return {
      hourlyBtcPerMW,
      hourlyRevenuePerMW_USD,
      breakEvenPoolPriceCAD,
      dailyBtcPerTH,
      selfMiningCostPerTHDay_MWh: selfMiningCostPerTHDay,
      indifferencePriceCAD,
      networkHashTH,
    };
  }, [btcStats, TH_PER_MW, poolFee, cadToUsd, transmissionAdder, minerEfficiency, hashPurchasePrice]);

  // ── Backtest results ──
  const backtestResults = useMemo(() => {
    if (historicalData.length === 0 || !miningEcon.hourlyBtcPerMW) return null;

    let profitableHours = 0;
    let totalMarginWhenMining = 0;
    let totalRevenue = 0;
    let totalEnergyCost = 0;
    let totalBtcMined = 0;

    // Group by month for monthly table
    const monthMap = new Map<string, {
      prices: number[]; profitableCount: number; curtailedCount: number;
      revenue: number; cost: number; btcMined: number;
    }>();

    // Group by hour×month for heatmap
    const heatmapMap = new Map<string, { totalMargin: number; count: number }>();

    historicalData.forEach((record) => {
      const poolPriceCAD = record.avg_pool_price;
      const allInCostUSD = (poolPriceCAD + transmissionAdder) * cadToUsd;
      const revenueUSD = miningEcon.hourlyRevenuePerMW_USD * (1 - poolFee / 100) * capacityMW;
      const costUSD = allInCostUSD * capacityMW;
      const netMargin = revenueUSD - costUSD;
      const btcThisHour = miningEcon.hourlyBtcPerMW * capacityMW * (1 - poolFee / 100);

      const isProfitable = netMargin > 0;

      if (isProfitable) {
        profitableHours++;
        totalMarginWhenMining += netMargin;
        totalRevenue += revenueUSD;
        totalEnergyCost += costUSD;
        totalBtcMined += btcThisHour;
      }

      // Monthly aggregation
      const d = new Date(record.hour);
      const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const existing = monthMap.get(monthKey) || {
        prices: [], profitableCount: 0, curtailedCount: 0,
        revenue: 0, cost: 0, btcMined: 0,
      };
      existing.prices.push(poolPriceCAD);
      if (isProfitable) {
        existing.profitableCount++;
        existing.revenue += revenueUSD;
        existing.cost += costUSD;
        existing.btcMined += btcThisHour;
      } else {
        existing.curtailedCount++;
      }
      monthMap.set(monthKey, existing);

      // Heatmap
      const hourOfDay = d.getHours();
      const hmKey = `${monthKey}-${hourOfDay}`;
      const hmExisting = heatmapMap.get(hmKey) || { totalMargin: 0, count: 0 };
      hmExisting.totalMargin += netMargin / capacityMW; // per MW for normalization
      hmExisting.count++;
      heatmapMap.set(hmKey, hmExisting);
    });

    // Build monthly results
    const monthlyResults: MonthlyResult[] = [];
    monthMap.forEach((data, month) => {
      const totalHours = data.prices.length;
      const avgPrice = data.prices.reduce((s, p) => s + p, 0) / totalHours;
      // Hash purchase comparison: if we spent the same $ on hash
      const totalCapitalSpent = data.cost;
      const hashPurchaseBtc = hashPurchasePrice > 0
        ? (totalCapitalSpent / hashPurchasePrice) * miningEcon.dailyBtcPerTH / 24 // TH-hours bought → BTC
        : 0;
      // Actually: $totalCapitalSpent buys totalCapitalSpent/hashPurchasePrice TH-days worth
      // Each TH-day earns dailyBtcPerTH BTC
      const hashBtc = hashPurchasePrice > 0
        ? (totalCapitalSpent / hashPurchasePrice) * miningEcon.dailyBtcPerTH
        : 0;

      monthlyResults.push({
        month,
        avgPrice: Math.round(avgPrice * 100) / 100,
        hoursProfitable: data.profitableCount,
        hoursCurtailed: data.curtailedCount,
        totalHours,
        miningRevenue: Math.round(data.revenue),
        energyCost: Math.round(data.cost),
        netProfit: Math.round(data.revenue - data.cost),
        hashPurchaseBtc: hashBtc,
        selfMinedBtc: data.btcMined,
        hashBetter: hashBtc > data.btcMined,
      });
    });
    monthlyResults.sort((a, b) => a.month.localeCompare(b.month));

    // Build heatmap data (simplified: avg margin per hour-of-day across all months)
    const hourlyAvgMargin: { hour: number; avgMargin: number; count: number }[] = [];
    for (let h = 0; h < 24; h++) {
      let totalM = 0; let totalC = 0;
      heatmapMap.forEach((val, key) => {
        const parts = key.split('-');
        const hourNum = parseInt(parts[2]);
        if (hourNum === h) { totalM += val.totalMargin; totalC += val.count; }
      });
      hourlyAvgMargin.push({ hour: h, avgMargin: totalC > 0 ? totalM / totalC : 0, count: totalC });
    }

    return {
      totalHours: historicalData.length,
      profitableHours,
      profitablePercent: (profitableHours / historicalData.length) * 100,
      avgMarginWhenMining: profitableHours > 0 ? totalMarginWhenMining / profitableHours : 0,
      totalProfit: totalRevenue - totalEnergyCost,
      totalBtcMined,
      optimalCurtailmentThreshold: miningEcon.breakEvenPoolPriceCAD,
      monthlyResults,
      hourlyAvgMargin,
    };
  }, [historicalData, miningEcon, capacityMW, poolFee, cadToUsd, transmissionAdder, hashPurchasePrice]);

  const loading = btcLoading || dataLoading;

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* ── Header ── */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Mining vs. Hash Purchase Optimizer</h2>
            <p className="text-muted-foreground mt-1">
              Backtest mining profitability against real AESO energy prices
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => { refetchBtc(); fetchHistorical(); }} disabled={loading}>
              <RefreshCw className={cn("w-4 h-4 mr-1", loading && "animate-spin")} /> Refresh
            </Button>
          </div>
        </div>

        {/* ── Methodology Disclosure ── */}
        <Alert className="border-primary/30 bg-primary/5">
          <Info className="h-4 w-4" />
          <AlertDescription className="text-sm">
            <strong>Methodology:</strong> This tool applies <em>current</em> Bitcoin network conditions
            (hashrate, difficulty, BTC price) against <em>historical</em> AESO pool prices to determine which
            past hours would have been profitable. Historical BTC network data is not available — all BTC economics
            use live data from mempool.space and Coinbase.
          </AlertDescription>
        </Alert>

        {/* ── Section 1: Configuration ── */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <Cpu className="w-5 h-5 text-primary" /> Facility Configuration
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label>Capacity (MW)</Label>
                <div className="flex items-center gap-3">
                  <Slider value={[capacityMW]} onValueChange={([v]) => setCapacityMW(v)} min={5} max={200} step={5} className="flex-1" />
                  <span className="text-sm font-mono w-16 text-right">{capacityMW} MW</span>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Miner Model</Label>
                <Select value={selectedAsic} onValueChange={(v) => setSelectedAsic(v as AsicKey)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(ASIC_SPECS).map(([key, spec]) => (
                      <SelectItem key={key} value={key}>
                        {spec.name} ({spec.efficiency} J/TH)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Pool Fee (%)</Label>
                <Input type="number" value={poolFee} onChange={(e) => setPoolFee(Number(e.target.value))} min={0} max={10} step={0.1} />
              </div>
              <div className="space-y-2">
                <Label>Hash Purchase Price ($/TH/day)</Label>
                <Input type="number" value={hashPurchasePrice} onChange={(e) => setHashPurchasePrice(Number(e.target.value))} min={0} step={0.001} />
                <p className="text-xs text-muted-foreground">NiceHash marketplace reference rate</p>
              </div>
              <div className="space-y-2">
                <Label>Date Range</Label>
                <Select value={dateRange} onValueChange={(v: any) => setDateRange(v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="6m">Last 6 Months</SelectItem>
                    <SelectItem value="1y">Last 1 Year</SelectItem>
                    <SelectItem value="2y">Last 2 Years</SelectItem>
                    <SelectItem value="all">All Data (Jun 2022+)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Facility Hashrate</Label>
                <p className="text-lg font-mono font-semibold text-foreground">
                  {(TH_PER_MW * capacityMW / 1000).toFixed(0)} PH/s
                </p>
                <p className="text-xs text-muted-foreground">{(TH_PER_MW * capacityMW).toLocaleString()} TH/s</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ── Section 2: Break-Even Analysis ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          <StatCard
            title="Break-Even Pool Price"
            value={`$${miningEcon.breakEvenPoolPriceCAD.toFixed(2)}/MWh`}
            subtitle="CAD — max profitable AESO price"
            icon={<Zap className="w-5 h-5" />}
            variant={miningEcon.breakEvenPoolPriceCAD > 60 ? 'success' : 'warning'}
            badges={[
              { label: 'Live from mempool.space', variant: 'outline' as const },
              { label: 'Live from Coinbase', variant: 'outline' as const },
            ]}
          />
          <StatCard
            title="BTC Price"
            value={`$${btcStats.price.toLocaleString()}`}
            subtitle={btcStats.isLive ? 'Live from Coinbase' : 'Fallback estimate'}
            icon={<DollarSign className="w-5 h-5" />}
            variant="default"
            badges={[{ label: btcStats.isLive ? 'Live' : 'Fallback', variant: btcStats.isLive ? 'default' as const : 'destructive' as const }]}
          />
          <StatCard
            title="Network Hashrate"
            value={btcStats.hashrateFormatted}
            subtitle={`Hash price: ${btcStats.hashPriceFormatted}`}
            icon={<Activity className="w-5 h-5" />}
            variant="default"
            badges={[{ label: 'mempool.space', variant: 'outline' as const }]}
          />
          <StatCard
            title="Indifference Price"
            value={miningEcon.indifferencePriceCAD > 0 ? `$${miningEcon.indifferencePriceCAD.toFixed(2)}/MWh` : 'N/A'}
            subtitle="Self-mine vs buy hash breakpoint"
            icon={<BarChart3 className="w-5 h-5" />}
            variant="default"
            badges={[{ label: 'Calculated', variant: 'secondary' as const }]}
          />
        </div>

        {/* ── Data status ── */}
        {dataError && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{dataError}</AlertDescription>
          </Alert>
        )}

        {dataLoading && (
          <Card><CardContent className="py-12 text-center text-muted-foreground">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2" />
            Loading {historicalData.length.toLocaleString()} historical records…
          </CardContent></Card>
        )}

        {backtestResults && (
          <>
            {/* ── Section 3: Backtest Summary ── */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-primary" /> Historical Backtest Results
                </CardTitle>
                <CardDescription>
                  {backtestResults.totalHours.toLocaleString()} hourly records from AESO
                  <Badge variant="outline" className="ml-2">Historical from AESO</Badge>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <MiniStat label="Hours Profitable" value={`${backtestResults.profitablePercent.toFixed(1)}%`}
                    detail={`${backtestResults.profitableHours.toLocaleString()} of ${backtestResults.totalHours.toLocaleString()}`}
                    positive={backtestResults.profitablePercent > 50} />
                  <MiniStat label="Avg Margin (Mining)" value={`$${backtestResults.avgMarginWhenMining.toFixed(0)}/hr`}
                    detail={`${capacityMW} MW facility`} positive />
                  <MiniStat label="Total Net Profit" value={`$${(backtestResults.totalProfit / 1000).toFixed(0)}K`}
                    detail="When mining only profitable hours" positive={backtestResults.totalProfit > 0} />
                  <MiniStat label="Curtailment Threshold" value={`$${backtestResults.optimalCurtailmentThreshold.toFixed(0)}/MWh`}
                    detail="Shut down above this price" positive />
                </div>

                {/* Hourly profitability chart */}
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={backtestResults.hourlyAvgMargin}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                      <XAxis dataKey="hour" tick={{ fontSize: 11 }} label={{ value: 'Hour of Day', position: 'insideBottom', offset: -5 }} />
                      <YAxis tick={{ fontSize: 11 }} label={{ value: 'Avg Margin ($/MWh)', angle: -90, position: 'insideLeft' }} />
                      <RechartsTooltip
                        contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}
                        formatter={(value: number) => [`$${value.toFixed(2)}/MWh`, 'Avg Net Margin']}
                        labelFormatter={(label) => `Hour ${label}:00`}
                      />
                      <Bar dataKey="avgMargin" radius={[2, 2, 0, 0]}>
                        {backtestResults.hourlyAvgMargin.map((entry, i) => (
                          <Cell key={i} fill={entry.avgMargin >= 0 ? 'hsl(var(--primary))' : 'hsl(var(--destructive))'} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <p className="text-xs text-muted-foreground text-center mt-2">
                  Average net margin by hour-of-day across the selected period (current BTC conditions applied to historical AESO prices)
                </p>
              </CardContent>
            </Card>

            {/* ── Enhanced Analytics: Heatmap, Price Duration, Cumulative ── */}
            <ProfitabilityHeatmap
              historicalData={historicalData}
              hourlyRevenuePerMW_USD={miningEcon.hourlyRevenuePerMW_USD}
              poolFee={poolFee}
              cadToUsd={cadToUsd}
              transmissionAdder={transmissionAdder}
              capacityMW={capacityMW}
            />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <PriceDurationCurve
                historicalData={historicalData}
                breakEvenPoolPriceCAD={miningEcon.breakEvenPoolPriceCAD}
              />
              <CumulativeProfitChart monthlyResults={backtestResults.monthlyResults} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <BreakEvenSensitivity
                networkHashTH={miningEcon.networkHashTH}
                blockReward={btcStats.blockReward}
                minerEfficiency={minerEfficiency}
                poolFee={poolFee}
                cadToUsd={cadToUsd}
                transmissionAdder={transmissionAdder}
                currentBtcPrice={btcStats.price}
              />
              <ASICComparisonTable
                networkHashTH={miningEcon.networkHashTH}
                blockReward={btcStats.blockReward}
                btcPrice={btcStats.price}
                poolFee={poolFee}
                cadToUsd={cadToUsd}
                transmissionAdder={transmissionAdder}
              />
            </div>

            <SeasonalAnalysis monthlyResults={backtestResults.monthlyResults} />

            {/* ── Section 4: Mine vs Buy Hash ── */}
            {hashPurchasePrice > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <TrendingDown className="w-5 h-5 text-primary" /> Mine vs. Buy Hash Comparison
                  </CardTitle>
                  <CardDescription>
                    Would purchasing hashrate on the open market have yielded more BTC per dollar?
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-1 p-4 rounded-lg bg-muted/50">
                      <p className="text-sm text-muted-foreground">Self-Mined BTC (profitable hours)</p>
                      <p className="text-2xl font-bold font-mono text-foreground">
                        {backtestResults.totalBtcMined.toFixed(4)} BTC
                      </p>
                      <p className="text-xs text-muted-foreground">Mining only when pool price {'<'} ${backtestResults.optimalCurtailmentThreshold.toFixed(0)}/MWh</p>
                    </div>
                    <div className="space-y-1 p-4 rounded-lg bg-muted/50">
                      <p className="text-sm text-muted-foreground">Hash Purchase BTC (same capital)</p>
                      <p className="text-2xl font-bold font-mono text-foreground">
                        {backtestResults.monthlyResults.reduce((s, m) => s + m.hashPurchaseBtc, 0).toFixed(4)} BTC
                      </p>
                      <p className="text-xs text-muted-foreground">At ${hashPurchasePrice}/TH/day marketplace rate</p>
                    </div>
                    <div className="space-y-1 p-4 rounded-lg bg-muted/50">
                      <p className="text-sm text-muted-foreground">Verdict</p>
                      {(() => {
                        const totalHash = backtestResults.monthlyResults.reduce((s, m) => s + m.hashPurchaseBtc, 0);
                        const better = backtestResults.totalBtcMined > totalHash;
                        return (
                          <>
                            <p className="text-2xl font-bold flex items-center gap-2 text-foreground">
                              {better ? <CheckCircle className="w-6 h-6 text-primary" /> : <XCircle className="w-6 h-6 text-destructive" />}
                              {better ? 'Self-Mine Wins' : 'Buy Hash Wins'}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Delta: {Math.abs(backtestResults.totalBtcMined - totalHash).toFixed(4)} BTC
                            </p>
                          </>
                        );
                      })()}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* ── Section 5: Monthly Summary Table ── */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-primary" /> Monthly Strategy Summary
                </CardTitle>
                <CardDescription>
                  Per-month breakdown of mining vs. curtailment decisions
                </CardDescription>
              </CardHeader>
              <CardContent className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Month</TableHead>
                      <TableHead className="text-right">Avg Price (CAD)</TableHead>
                      <TableHead className="text-right">Mine Hours</TableHead>
                      <TableHead className="text-right">Curtail Hours</TableHead>
                      <TableHead className="text-right">Revenue (USD)</TableHead>
                      <TableHead className="text-right">Energy Cost (USD)</TableHead>
                      <TableHead className="text-right">Net Profit (USD)</TableHead>
                      {hashPurchasePrice > 0 && <TableHead className="text-right">Hash Better?</TableHead>}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {backtestResults.monthlyResults.map((m) => (
                      <TableRow key={m.month}>
                        <TableCell className="font-medium">{m.month}</TableCell>
                        <TableCell className="text-right font-mono">${m.avgPrice.toFixed(2)}</TableCell>
                        <TableCell className="text-right">
                          <span className="text-primary font-medium">{m.hoursProfitable}</span>
                        </TableCell>
                        <TableCell className="text-right">
                          <span className="text-muted-foreground">{m.hoursCurtailed}</span>
                        </TableCell>
                        <TableCell className="text-right font-mono">${m.miningRevenue.toLocaleString()}</TableCell>
                        <TableCell className="text-right font-mono">${m.energyCost.toLocaleString()}</TableCell>
                        <TableCell className={cn("text-right font-mono font-medium", m.netProfit >= 0 ? "text-primary" : "text-destructive")}>
                          ${m.netProfit.toLocaleString()}
                        </TableCell>
                        {hashPurchasePrice > 0 && (
                          <TableCell className="text-right">
                            {m.hashBetter
                              ? <Badge variant="destructive" className="text-xs">Hash</Badge>
                              : <Badge variant="default" className="text-xs">Mine</Badge>}
                          </TableCell>
                        )}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </>
        )}

        {/* ── Section 6: Source Attribution ── */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-muted-foreground">Data Sources & Methodology</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline">Live from mempool.space — Hashrate, Difficulty</Badge>
              <Badge variant="outline">Live from Coinbase — BTC Price</Badge>
              <Badge variant="outline">Historical from AESO — {historicalData.length.toLocaleString()} hourly pool prices</Badge>
              <Badge variant="outline">Verified 2026-015T — DTS Transmission Adder ${transmissionAdder}/MWh</Badge>
              <Badge variant="outline">CAD/USD: {cadToUsd.toFixed(4)}</Badge>
              <DataFreshnessBadge
                updatedAt={exchangeRate.lastUpdated}
                source={exchangeRate.source}
                label="CAD/USD rate"
                // Exchange rates change slowly; live = within 24h, stale to 7d.
                liveThresholdSec={24 * 3600}
                staleThresholdSec={7 * 24 * 3600}
                size="compact"
              />
            </div>
            <p className="text-xs text-muted-foreground mt-3">
              Backtest applies current Bitcoin network conditions to historical energy prices.
              This shows which past hours would have been profitable under today's mining economics.
              Not a guarantee of future performance.
            </p>
          </CardContent>
        </Card>
      </div>
    </TooltipProvider>
  );
}

// ── Sub-components ───────────────────────────────────────────────────────────

function StatCard({ title, value, subtitle, icon, variant, badges }: {
  title: string; value: string; subtitle: string; icon: React.ReactNode;
  variant: 'default' | 'success' | 'warning';
  badges?: { label: string; variant: 'default' | 'secondary' | 'outline' | 'destructive' }[];
}) {
  return (
    <Card className={cn(
      variant === 'success' && 'border-primary/30',
      variant === 'warning' && 'border-destructive/30',
    )}>
      <CardContent className="pt-5 pb-4">
        <div className="flex items-start justify-between mb-2">
          <span className="text-sm text-muted-foreground">{title}</span>
          <span className="text-muted-foreground">{icon}</span>
        </div>
        <p className="text-2xl font-bold font-mono text-foreground">{value}</p>
        <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
        {badges && (
          <div className="flex flex-wrap gap-1 mt-2">
            {badges.map((b, i) => <Badge key={i} variant={b.variant} className="text-[10px]">{b.label}</Badge>)}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function MiniStat({ label, value, detail, positive }: {
  label: string; value: string; detail: string; positive?: boolean;
}) {
  return (
    <div className="space-y-1">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={cn("text-xl font-bold font-mono", positive ? "text-primary" : "text-destructive")}>{value}</p>
      <p className="text-xs text-muted-foreground">{detail}</p>
    </div>
  );
}

import React, { useState, useMemo, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { FileText, TrendingUp, TrendingDown, DollarSign, Scale, Download, Shield } from 'lucide-react';
import { HourlyRecord } from '@/hooks/usePowerModelCalculator';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, Legend, Cell, ReferenceLine, AreaChart, Area,
} from 'recharts';

interface Props {
  hourlyData: HourlyRecord[];
  capacityMW: number;
}

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function PPAvsPoolAnalyzer({ hourlyData, capacityMW }: Props) {
  const [ppaPrice, setPpaPrice] = useState(65);
  const [hedgeRatio, setHedgeRatio] = useState(100); // % hedged with PPA

  // Monthly comparison
  const monthlyComparison = useMemo(() => {
    if (hourlyData.length === 0) return [];
    const months = new Map<string, { poolSum: number; hours: number; prices: number[] }>();

    for (const r of hourlyData) {
      const dt = new Date(`${r.date}T00:00:00`);
      const key = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}`;
      const entry = months.get(key) || { poolSum: 0, hours: 0, prices: [] };
      entry.poolSum += r.poolPrice;
      entry.hours++;
      entry.prices.push(r.poolPrice);
      months.set(key, entry);
    }

    return Array.from(months.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, v]) => {
        const monthIdx = parseInt(key.split('-')[1]) - 1;
        const avgPool = v.poolSum / v.hours;
        const blendedAvg = avgPool * (1 - hedgeRatio / 100) + ppaPrice * (hedgeRatio / 100);
        const settlement = (avgPool - ppaPrice) * capacityMW * (hedgeRatio / 100);
        return {
          month: MONTH_NAMES[monthIdx] || key,
          poolCost: Math.round(avgPool * capacityMW),
          ppaCost: Math.round(ppaPrice * capacityMW),
          blendedCost: Math.round(blendedAvg * capacityMW),
          settlement: Math.round(settlement),
          avgPool: Math.round(avgPool * 100) / 100,
          hours: v.hours,
          prices: v.prices,
        };
      });
  }, [hourlyData, ppaPrice, capacityMW, hedgeRatio]);

  // Cumulative cost curves
  const cumulativeData = useMemo(() => {
    let poolTotal = 0;
    let ppaTotal = 0;
    let blendedTotal = 0;
    return monthlyComparison.map(m => {
      poolTotal += m.poolCost * m.hours;
      ppaTotal += m.ppaCost * m.hours;
      blendedTotal += m.blendedCost * m.hours;
      return {
        month: m.month,
        cumulativePool: Math.round(poolTotal),
        cumulativePPA: Math.round(ppaTotal),
        cumulativeBlended: hedgeRatio < 100 ? Math.round(blendedTotal) : undefined,
      };
    });
  }, [monthlyComparison, hedgeRatio]);

  // Summary KPIs
  const summary = useMemo(() => {
    if (hourlyData.length === 0) return null;
    const totalPoolCost = hourlyData.reduce((s, r) => s + r.poolPrice * capacityMW, 0);
    const totalPPACost = hourlyData.length * ppaPrice * capacityMW;
    const ppaWinHours = hourlyData.filter(r => r.poolPrice > ppaPrice).length;
    const netDifference = totalPoolCost - totalPPACost;
    const avgPoolPrice = hourlyData.reduce((s, r) => s + r.poolPrice, 0) / hourlyData.length;

    // VaR calculation (worst 5% of months)
    const monthlyCosts = monthlyComparison.map(m => m.avgPool);
    const sortedCosts = [...monthlyCosts].sort((a, b) => b - a);
    const var5 = sortedCosts[Math.floor(sortedCosts.length * 0.05)] || 0;
    const varExposure = (var5 - ppaPrice) * capacityMW;

    const worstMonth = monthlyComparison.reduce((worst, m) =>
      m.settlement < (worst?.settlement ?? Infinity) ? m : worst, monthlyComparison[0]);

    return {
      totalPoolCost,
      totalPPACost,
      netDifference,
      ppaWinPct: Math.round(ppaWinHours / hourlyData.length * 100),
      breakeven: Math.round(avgPoolPrice * 100) / 100,
      worstMonth: worstMonth?.month || 'N/A',
      worstExposure: worstMonth?.settlement || 0,
      var5Exposure: Math.round(varExposure),
      var5Price: Math.round(var5 * 100) / 100,
    };
  }, [hourlyData, ppaPrice, capacityMW, monthlyComparison]);

  // Optimal PPA range chart
  const ppaRangeData = useMemo(() => {
    if (hourlyData.length === 0) return [];
    const prices = hourlyData.map(r => r.poolPrice);
    return Array.from({ length: 25 }, (_, i) => {
      const testPPA = 30 + i * 5;
      const winHours = prices.filter(p => p > testPPA).length;
      const winPct = Math.round(winHours / prices.length * 100);
      return { ppa: `$${testPPA}`, winPct, ppaPrice: testPPA };
    });
  }, [hourlyData]);

  // Export report
  const exportReport = useCallback(() => {
    if (!summary) return;
    const lines = [
      'PPA vs Pool Analysis Report',
      '===========================',
      `Date: ${new Date().toISOString().slice(0, 10)}`,
      `PPA Price: $${ppaPrice}/MWh`,
      `Hedge Ratio: ${hedgeRatio}%`,
      `Capacity: ${capacityMW} MW`,
      '',
      'Summary:',
      `  Pool Cost: $${(summary.totalPoolCost / 1000).toFixed(0)}K`,
      `  PPA Cost: $${(summary.totalPPACost / 1000).toFixed(0)}K`,
      `  Net Difference: $${(Math.abs(summary.netDifference) / 1000).toFixed(0)}K ${summary.netDifference > 0 ? '(PPA saves)' : '(Pool cheaper)'}`,
      `  PPA Wins: ${summary.ppaWinPct}% of hours`,
      `  Breakeven PPA: $${summary.breakeven}/MWh`,
      `  VaR (5%): $${summary.var5Price}/MWh peak month`,
      '',
      'Monthly Breakdown:',
      'Month,Avg Pool ($/MWh),PPA ($/MWh),Settlement ($)',
      ...monthlyComparison.map(m => `${m.month},${m.avgPool},${ppaPrice},${m.settlement}`),
    ];
    const blob = new Blob([lines.join('\n')], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ppa_vs_pool_report_${ppaPrice}MWh.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }, [summary, ppaPrice, hedgeRatio, capacityMW, monthlyComparison]);

  if (hourlyData.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center text-muted-foreground text-sm">
          Load hourly data first to use PPA vs Pool analysis
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Controls */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <Scale className="w-4 h-4 text-primary" />
              <CardTitle className="text-base">PPA vs Pool Price Comparison</CardTitle>
            </div>
            <Button variant="outline" size="sm" className="h-7 text-xs gap-1" onClick={exportReport}>
              <Download className="w-3 h-3" />Export Report
            </Button>
          </div>
          <CardDescription className="text-xs">Compare a fixed PPA rate against actual pool exposure using {hourlyData.length.toLocaleString()} hours of real data</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-xs">PPA Fixed Price</Label>
                <Badge variant="outline" className="font-mono text-xs">${ppaPrice}/MWh</Badge>
              </div>
              <Slider value={[ppaPrice]} onValueChange={([v]) => setPpaPrice(v)} min={30} max={150} step={1} />
              <div className="flex justify-between text-[10px] text-muted-foreground">
                <span>$30/MWh</span><span>$150/MWh</span>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-xs">Hedge Ratio (PPA %)</Label>
                <Badge variant="outline" className="font-mono text-xs">{hedgeRatio}% PPA / {100 - hedgeRatio}% Pool</Badge>
              </div>
              <Slider value={[hedgeRatio]} onValueChange={([v]) => setHedgeRatio(v)} min={0} max={100} step={5} />
              <div className="flex justify-between text-[10px] text-muted-foreground">
                <span>100% Pool</span><span>100% PPA</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* KPI Cards */}
      {summary && (
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
          {[
            { label: 'Pool Cost', value: `$${(summary.totalPoolCost / 1000).toFixed(0)}K`, icon: <DollarSign className="w-3 h-3" /> },
            { label: 'PPA Cost', value: `$${(summary.totalPPACost / 1000).toFixed(0)}K`, icon: <FileText className="w-3 h-3" /> },
            { label: 'Net Δ', value: `$${(Math.abs(summary.netDifference) / 1000).toFixed(0)}K`, color: summary.netDifference > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400', sub: summary.netDifference > 0 ? 'PPA saves' : 'Pool cheaper' },
            { label: 'PPA Wins', value: `${summary.ppaWinPct}%`, sub: 'of hours' },
            { label: 'Breakeven', value: `$${summary.breakeven}`, sub: 'PPA rate' },
            { label: 'VaR (5%)', value: `$${summary.var5Price}`, sub: 'worst month avg', color: 'text-red-600 dark:text-red-400', icon: <Shield className="w-3 h-3" /> },
            { label: 'Worst Month', value: summary.worstMonth, sub: `$${(Math.abs(summary.worstExposure)).toFixed(0)} exp` },
          ].map(kpi => (
            <div key={kpi.label} className="p-2.5 rounded-lg border border-border bg-card text-center">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{kpi.label}</p>
              <p className={`text-sm font-bold ${kpi.color || 'text-foreground'}`}>{kpi.value}</p>
              {kpi.sub && <p className="text-[10px] text-muted-foreground">{kpi.sub}</p>}
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Monthly Cost Comparison */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Monthly Cost: PPA vs Pool</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={monthlyComparison}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip formatter={(v: number, name: string) => [`$${v.toLocaleString()}/MWh avg`, name]} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="avgPool" name="Pool Avg" fill="hsl(220, 70%, 55%)" radius={[3, 3, 0, 0]} />
                <ReferenceLine y={ppaPrice} stroke="hsl(25, 80%, 55%)" strokeDasharray="5 5" label={{ value: `PPA: $${ppaPrice}`, fill: 'hsl(25, 80%, 55%)', fontSize: 10 }} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Settlement Waterfall */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Monthly Settlement (Pool - PPA)</CardTitle>
            <CardDescription className="text-xs">Positive = PPA saves money · Negative = Pool was cheaper</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={monthlyComparison}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip formatter={(v: number) => [`$${v.toFixed(0)} settlement`, 'Settlement']} />
                <ReferenceLine y={0} stroke="hsl(220, 30%, 50%)" />
                <Bar dataKey="settlement" radius={[3, 3, 0, 0]}>
                  {monthlyComparison.map((m, i) => (
                    <Cell key={i} fill={m.settlement >= 0 ? 'hsl(150, 60%, 45%)' : 'hsl(0, 60%, 55%)'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Cumulative + PPA Range */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Cumulative Cost Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={cumulativeData}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}K`} />
                <Tooltip formatter={(v: number) => [`$${v.toLocaleString()}`, '']} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Line type="monotone" dataKey="cumulativePool" name="Pool Cost" stroke="hsl(220, 70%, 55%)" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="cumulativePPA" name="PPA Cost" stroke="hsl(25, 80%, 55%)" strokeWidth={2} strokeDasharray="5 5" dot={{ r: 3 }} />
                {hedgeRatio < 100 && (
                  <Line type="monotone" dataKey="cumulativeBlended" name={`Blended (${hedgeRatio}/${100-hedgeRatio})`} stroke="hsl(270, 60%, 55%)" strokeWidth={2} dot={{ r: 3 }} />
                )}
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Optimal PPA Range */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">PPA Win Probability by Price</CardTitle>
            <CardDescription className="text-xs">% of hours where PPA beats pool at each fixed price</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={ppaRangeData}>
                <defs>
                  <linearGradient id="winGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(150, 60%, 45%)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(150, 60%, 45%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="ppa" tick={{ fontSize: 9 }} />
                <YAxis tick={{ fontSize: 10 }} label={{ value: '% Win', angle: -90, position: 'insideLeft', style: { fontSize: 10 } }} domain={[0, 100]} />
                <Tooltip formatter={(v: number) => [`${v}%`, 'PPA Win %']} />
                <ReferenceLine y={50} stroke="hsl(0, 60%, 55%)" strokeDasharray="5 5" label={{ value: '50/50', fill: 'hsl(0, 60%, 55%)', fontSize: 10 }} />
                <ReferenceLine y={80} stroke="hsl(150, 60%, 45%)" strokeDasharray="5 5" label={{ value: '80% confidence', fill: 'hsl(150, 60%, 45%)', fontSize: 10 }} />
                <Area type="monotone" dataKey="winPct" stroke="hsl(150, 60%, 45%)" fill="url(#winGrad)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

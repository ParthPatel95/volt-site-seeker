import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RateSourceBadge } from '@/components/ui/rate-source-badge';
import { TrendingUp, TrendingDown, DollarSign, BarChart3, Zap, ArrowUpDown } from 'lucide-react';
import {
  ComposedChart, Bar, Line, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, ReferenceLine, AreaChart,
} from 'recharts';
import type { MonthlyResult } from '@/hooks/usePowerModelCalculator';
import type { HourlyRecord } from '@/hooks/usePowerModelCalculator';

interface Props {
  monthly: MonthlyResult[];
  breakeven: number;
  hourlyPrices: number[];
  hourlyData?: HourlyRecord[];
  hostingRateCAD?: number;
}

const COLORS = {
  dts: 'hsl(220, 70%, 55%)',
  energy: 'hsl(150, 60%, 45%)',
  fortis: 'hsl(35, 80%, 55%)',
  gst: 'hsl(0, 0%, 60%)',
  total: 'hsl(270, 60%, 55%)',
};

const PIE_COLORS = [
  'hsl(220, 70%, 55%)', 'hsl(200, 60%, 50%)', 'hsl(180, 50%, 50%)',
  'hsl(150, 60%, 45%)', 'hsl(35, 80%, 55%)', 'hsl(0, 65%, 55%)',
  'hsl(270, 60%, 55%)', 'hsl(0, 0%, 60%)',
];

const fmt = (v: number) => `$${(v / 1000).toFixed(0)}k`;
const fmtFull = (v: number) => `$${v.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

export function PowerModelCharts({ monthly, breakeven, hourlyPrices, hourlyData, hostingRateCAD }: Props) {
  if (!monthly.length) return null;

  // === Cost Overview KPIs ===
  const costKPIs = useMemo(() => {
    const costs = monthly.map(m => m.totalAmountDue);
    const avgMonthly = costs.reduce((s, c) => s + c, 0) / costs.length;
    const maxIdx = costs.indexOf(Math.max(...costs));
    const minIdx = costs.indexOf(Math.min(...costs));
    const mean = avgMonthly;
    const variance = costs.reduce((s, c) => s + Math.pow(c - mean, 2), 0) / costs.length;
    const cv = mean > 0 ? (Math.sqrt(variance) / mean) * 100 : 0;
    const volatilityLabel = cv > 30 ? 'High' : cv > 15 ? 'Medium' : 'Low';
    const volatilityColor = cv > 30 ? 'text-red-500' : cv > 15 ? 'text-amber-500' : 'text-emerald-500';

    // MoM deltas
    const deltas = costs.map((c, i) => i > 0 ? ((c - costs[i - 1]) / costs[i - 1]) * 100 : 0);

    return {
      avgMonthly, maxMonth: monthly[maxIdx]?.month?.slice(0, 3), maxCost: costs[maxIdx],
      minMonth: monthly[minIdx]?.month?.slice(0, 3), minCost: costs[minIdx],
      volatilityLabel, volatilityColor, cv, deltas,
    };
  }, [monthly]);

  // === Cost Trend ===
  const costTrend = monthly.map((m, i) => ({
    month: m.month.slice(0, 3),
    DTS: m.totalDTSCharges,
    Energy: m.totalEnergyCharges,
    FortisAlberta: m.totalFortisCharges,
    GST: m.gst,
    Total: m.totalAmountDue,
    delta: costKPIs.deltas[i],
  }));

  // === Pie Data ===
  const annualTotals = monthly.reduce((acc, m) => {
    acc.bulk += m.bulkMeteredEnergy + m.bulkCoincidentDemand;
    acc.regional += m.regionalBillingCapacity + m.regionalMeteredEnergy;
    acc.pod += m.podSubstation + m.podTiered;
    acc.or += m.operatingReserve;
    acc.pool += m.poolEnergy;
    acc.riderF += m.riderF + m.retailerFee;
    acc.fortis += m.totalFortisCharges;
    acc.gst += m.gst;
    return acc;
  }, { bulk: 0, regional: 0, pod: 0, or: 0, pool: 0, riderF: 0, fortis: 0, gst: 0 });

  const pieData = [
    { name: 'Bulk System', value: annualTotals.bulk },
    { name: 'Regional System', value: annualTotals.regional },
    { name: 'POD Charges', value: annualTotals.pod },
    { name: 'Operating Reserve', value: annualTotals.or },
    { name: 'Pool Energy', value: annualTotals.pool },
    { name: 'Rider F + Retailer', value: annualTotals.riderF },
    { name: 'FortisAlberta', value: annualTotals.fortis },
    { name: 'GST', value: annualTotals.gst },
  ].filter(d => d.value > 0);
  const pieTotal = pieData.reduce((s, d) => s + d.value, 0);

  // === Monthly Cost Heatmap ===
  const costHeatmap = useMemo(() => {
    const costs = monthly.map(m => m.totalAmountDue);
    const max = Math.max(...costs);
    const min = Math.min(...costs);
    const range = max - min || 1;
    return monthly.map(m => ({
      month: m.month.slice(0, 3),
      cost: m.totalAmountDue,
      perMwh: m.mwh > 0 ? m.totalAmountDue / m.mwh : 0,
      intensity: (m.totalAmountDue - min) / range,
    }));
  }, [monthly]);

  // === Price Distribution with Breakeven Coloring ===
  const priceStats = useMemo(() => {
    if (!hourlyPrices.length) return null;
    const sorted = [...hourlyPrices].sort((a, b) => a - b);
    const n = sorted.length;
    const p = (pct: number) => sorted[Math.floor(n * pct / 100)] || 0;
    const belowBreakeven = sorted.filter(p => p <= breakeven).length;
    return {
      p50: p(50), p75: p(75), p90: p(90), p95: p(95), p99: p(99),
      belowBreakeven, pctBelow: ((belowBreakeven / n) * 100).toFixed(1),
    };
  }, [hourlyPrices, breakeven]);

  const histData = useMemo(() => {
    const bins = [0, 25, 50, 75, 100, 125, 150, 200, 300, 500, 1000];
    return bins.map((min, i) => {
      const max = i < bins.length - 1 ? bins[i + 1] : Infinity;
      const label = max === Infinity ? `$${min}+` : `$${min}-${max}`;
      const count = hourlyPrices.filter(p => p >= min && p < max).length;
      const belowBE = min < breakeven;
      return { range: label, hours: count, min, fill: belowBE ? 'hsl(150, 60%, 45%)' : 'hsl(0, 65%, 55%)' };
    }).filter(d => d.hours > 0);
  }, [hourlyPrices, breakeven]);

  // === Profitability Heatmap ===
  const profitabilityHeatmap = useMemo(() => {
    if (!hourlyData?.length || !hostingRateCAD || hostingRateCAD <= 0) return null;
    const hostingMWh = hostingRateCAD * 1000; // Convert from $/kWh to $/MWh
    // Group by month (0-11) and hour (0-23)
    const grid: Record<string, { sum: number; count: number }> = {};
    for (const r of hourlyData) {
      const d = new Date(`${r.date}T00:00:00`);
      const m = d.getMonth();
      const h = r.he - 1; // HE 1-24 -> 0-23
      const key = `${m}-${h}`;
      if (!grid[key]) grid[key] = { sum: 0, count: 0 };
      grid[key].sum += r.poolPrice;
      grid[key].count++;
    }
    // Calc profit for each cell
    const cells: { month: number; hour: number; avgPrice: number; profit: number }[] = [];
    let maxProfit = 0;
    for (let m = 0; m < 12; m++) {
      for (let h = 0; h < 24; h++) {
        const g = grid[`${m}-${h}`];
        if (!g || g.count === 0) continue;
        const avgPrice = g.sum / g.count;
        const profit = hostingMWh - avgPrice;
        maxProfit = Math.max(maxProfit, Math.abs(profit));
        cells.push({ month: m, hour: h, avgPrice, profit });
      }
    }
    return { cells, maxProfit };
  }, [hourlyData, hostingRateCAD]);

  const kpiCards = [
    {
      label: 'Avg Monthly Cost',
      value: fmtFull(Math.round(costKPIs.avgMonthly)),
      icon: DollarSign,
      color: 'text-primary',
      bg: 'bg-primary/10',
    },
    {
      label: `Most Expensive (${costKPIs.maxMonth})`,
      value: fmtFull(Math.round(costKPIs.maxCost)),
      icon: TrendingUp,
      color: 'text-red-500',
      bg: 'bg-red-500/10',
    },
    {
      label: `Cheapest (${costKPIs.minMonth})`,
      value: fmtFull(Math.round(costKPIs.minCost)),
      icon: TrendingDown,
      color: 'text-emerald-500',
      bg: 'bg-emerald-500/10',
    },
    {
      label: 'Cost Volatility',
      value: costKPIs.volatilityLabel,
      subValue: `CV: ${costKPIs.cv.toFixed(0)}%`,
      icon: ArrowUpDown,
      color: costKPIs.volatilityColor,
      bg: 'bg-muted/50',
    },
  ];

  return (
    <div className="space-y-4">
      {/* Row 1: Cost Overview KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {kpiCards.map((kpi, i) => {
          const Icon = kpi.icon;
          return (
            <div key={i} className="p-3.5 rounded-xl bg-card border border-border/50 hover:border-border transition-colors">
              <div className="flex items-center gap-2 mb-2">
                <div className={`p-1.5 rounded-lg ${kpi.bg}`}>
                  <Icon className={`w-3.5 h-3.5 ${kpi.color}`} />
                </div>
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider">{kpi.label}</span>
              </div>
              <p className="text-lg font-bold text-foreground">{kpi.value}</p>
              {(kpi as any).subValue && <p className="text-[10px] text-muted-foreground mt-0.5">{(kpi as any).subValue}</p>}
            </div>
          );
        })}
      </div>

      {/* Row 2: Monthly Cost Trend (stacked area) */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <CardTitle className="text-sm">Monthly Cost Trend</CardTitle>
              <CardDescription className="text-xs">Stacked breakdown with month-over-month changes</CardDescription>
            </div>
            <RateSourceBadge source="AESO Rate DTS + aeso_training_data" effectiveDate="2026-01-01" lastVerified="2026-02-01" variant="compact" />
          </div>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={320}>
            <ComposedChart data={costTrend}>
              <defs>
                <linearGradient id="dtsGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={COLORS.dts} stopOpacity={0.8} />
                  <stop offset="100%" stopColor={COLORS.dts} stopOpacity={0.3} />
                </linearGradient>
                <linearGradient id="energyGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={COLORS.energy} stopOpacity={0.8} />
                  <stop offset="100%" stopColor={COLORS.energy} stopOpacity={0.3} />
                </linearGradient>
                <linearGradient id="fortisGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={COLORS.fortis} stopOpacity={0.8} />
                  <stop offset="100%" stopColor={COLORS.fortis} stopOpacity={0.3} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="opacity-20" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tickFormatter={fmt} tick={{ fontSize: 11 }} />
              <Tooltip
                formatter={(v: number, name: string) => [fmtFull(v), name]}
                contentStyle={{ fontSize: 12, borderRadius: 12, border: '1px solid hsl(var(--border))', background: 'hsl(var(--card))' }}
              />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Area type="monotone" dataKey="DTS" stackId="cost" fill="url(#dtsGrad)" stroke={COLORS.dts} strokeWidth={0} />
              <Area type="monotone" dataKey="Energy" stackId="cost" fill="url(#energyGrad)" stroke={COLORS.energy} strokeWidth={0} />
              <Area type="monotone" dataKey="FortisAlberta" stackId="cost" fill="url(#fortisGrad)" stroke={COLORS.fortis} strokeWidth={0} />
              <Area type="monotone" dataKey="GST" stackId="cost" fill={COLORS.gst} fillOpacity={0.3} stroke={COLORS.gst} strokeWidth={0} />
              <Line type="monotone" dataKey="Total" stroke={COLORS.total} strokeWidth={2.5} dot={{ r: 3, fill: COLORS.total }} activeDot={{ r: 5 }} />
            </ComposedChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Row 3: Donut + Cost Heatmap */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Donut with horizontal legend */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Annual Cost Breakdown</CardTitle>
            <CardDescription className="text-xs">By charge component</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={2} dataKey="value" label={false}>
                  {pieData.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v: number) => [`${fmtFull(v)} (${((v / pieTotal) * 100).toFixed(1)}%)`, 'Amount']} />
                <text x="50%" y="46%" textAnchor="middle" dominantBaseline="central" className="fill-foreground text-sm font-bold">{fmtFull(pieTotal)}</text>
                <text x="50%" y="56%" textAnchor="middle" dominantBaseline="central" className="fill-muted-foreground text-[10px]">Total Annual</text>
              </PieChart>
            </ResponsiveContainer>
            {/* Horizontal legend with % bars */}
            <div className="space-y-1.5 mt-2">
              {pieData.map((d, i) => {
                const pct = pieTotal > 0 ? (d.value / pieTotal) * 100 : 0;
                return (
                  <div key={i} className="flex items-center gap-2 text-xs">
                    <div className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                    <span className="text-muted-foreground min-w-[100px] truncate">{d.name}</span>
                    <div className="flex-1 h-1.5 rounded-full bg-muted/50 overflow-hidden">
                      <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: PIE_COLORS[i % PIE_COLORS.length] }} />
                    </div>
                    <span className="text-foreground font-medium w-10 text-right">{pct.toFixed(0)}%</span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Monthly Cost Heatmap */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Monthly Cost Intensity</CardTitle>
            <CardDescription className="text-xs">Cost per month with $/MWh rate</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
              {costHeatmap.map((cell, i) => {
                const r = Math.round(200 * cell.intensity);
                const g = Math.round(200 * (1 - cell.intensity));
                return (
                  <div
                    key={i}
                    className="p-2.5 rounded-lg border border-border/30 text-center transition-all hover:scale-105 cursor-default"
                    style={{ background: `rgba(${r}, ${g}, 80, 0.15)` }}
                    title={`${cell.month}: ${fmtFull(Math.round(cell.cost))} ($${cell.perMwh.toFixed(0)}/MWh)`}
                  >
                    <p className="text-[10px] text-muted-foreground font-medium">{cell.month}</p>
                    <p className="text-sm font-bold text-foreground">{fmt(cell.cost)}</p>
                    <p className="text-[9px] text-muted-foreground">${cell.perMwh.toFixed(0)}/MWh</p>
                  </div>
                );
              })}
            </div>
            {/* Color scale legend */}
            <div className="flex items-center justify-between mt-3 text-[9px] text-muted-foreground">
              <span>Low Cost</span>
              <div className="flex-1 mx-3 h-1.5 rounded-full" style={{ background: 'linear-gradient(to right, rgba(0,200,80,0.3), rgba(200,0,80,0.3))' }} />
              <span>High Cost</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Row 4: Price Distribution */}
      {histData.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <CardTitle className="text-sm">Pool Price Distribution</CardTitle>
                <CardDescription className="text-xs">
                  Breakeven: CA${breakeven.toFixed(0)}/MWh · {priceStats?.pctBelow}% of hours below breakeven
                </CardDescription>
              </div>
              {priceStats && (
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { label: 'P50', value: priceStats.p50 },
                    { label: 'P75', value: priceStats.p75 },
                    { label: 'P90', value: priceStats.p90 },
                    { label: 'P99', value: priceStats.p99 },
                  ].map(p => (
                    <Badge key={p.label} variant="outline" className="text-[9px] px-1.5 h-5">
                      {p.label}: ${p.value.toFixed(0)}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={histData}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-20" />
                <XAxis dataKey="range" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 11 }} label={{ value: 'Hours', angle: -90, position: 'insideLeft', style: { fontSize: 11 } }} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid hsl(var(--border))' }} />
                <Bar dataKey="hours" radius={[4, 4, 0, 0]}>
                  {histData.map((entry, i) => (
                    <Cell key={i} fill={entry.fill} />
                  ))}
                </Bar>
                {(() => {
                  const idx = histData.findIndex((d, i) => d.min <= breakeven && ((histData[i + 1]?.min ?? Infinity) > breakeven));
                  return idx >= 0 ? (
                    <ReferenceLine x={histData[idx].range} stroke="hsl(var(--primary))" strokeWidth={2} strokeDasharray="5 5" label={{ value: `BE $${breakeven.toFixed(0)}`, position: 'top', fontSize: 10, fill: 'hsl(var(--primary))' }} />
                  ) : null;
                })()}
              </BarChart>
            </ResponsiveContainer>
            {priceStats && (
              <div className="flex items-center gap-4 mt-2 text-xs">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-sm" style={{ background: 'hsl(150, 60%, 45%)' }} />
                  <span className="text-muted-foreground">Below Breakeven ({priceStats.belowBreakeven.toLocaleString()} hrs)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-sm" style={{ background: 'hsl(0, 65%, 55%)' }} />
                  <span className="text-muted-foreground">Above Breakeven</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Row 5: Profitability Heatmap */}
      {profitabilityHeatmap && (
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <CardTitle className="text-sm flex items-center gap-2">
                  Profitability Heatmap
                  <Badge variant="info" size="sm">Hour × Month</Badge>
                </CardTitle>
                <CardDescription className="text-xs">
                  Green = profitable hours, Red = unprofitable · Hosting rate: {hostingRateCAD ? `CA$${(hostingRateCAD * 1000).toFixed(0)}/MWh` : 'N/A'}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <div className="min-w-[600px]">
                {/* Month headers */}
                <div className="flex gap-0.5 mb-0.5">
                  <div className="w-12 shrink-0" />
                  {MONTH_NAMES.map(m => (
                    <div key={m} className="flex-1 text-center text-[9px] text-muted-foreground font-medium">{m}</div>
                  ))}
                </div>
                {/* Hour rows */}
                {Array.from({ length: 24 }, (_, h) => (
                  <div key={h} className="flex gap-0.5 mb-0.5">
                    <div className="w-12 shrink-0 text-[9px] text-muted-foreground text-right pr-1.5 leading-5">
                      HE {h + 1}
                    </div>
                    {Array.from({ length: 12 }, (_, m) => {
                      const cell = profitabilityHeatmap.cells.find(c => c.month === m && c.hour === h);
                      if (!cell) return <div key={m} className="flex-1 h-5 rounded-sm bg-muted/20" />;
                      const norm = profitabilityHeatmap.maxProfit > 0 ? cell.profit / profitabilityHeatmap.maxProfit : 0;
                      const intensity = Math.min(Math.abs(norm), 1);
                      const color = cell.profit >= 0
                        ? `rgba(34, 197, 94, ${0.1 + intensity * 0.6})`
                        : `rgba(239, 68, 68, ${0.1 + intensity * 0.6})`;
                      return (
                        <div
                          key={m}
                          className="flex-1 h-5 rounded-sm cursor-default transition-all hover:ring-1 hover:ring-foreground/30"
                          style={{ background: color }}
                          title={`${MONTH_NAMES[m]} HE${h + 1}: $${cell.profit.toFixed(0)}/MWh (Pool: $${cell.avgPrice.toFixed(0)})`}
                        />
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
            <div className="flex items-center justify-between mt-3 text-[9px] text-muted-foreground">
              <span className="flex items-center gap-1"><div className="w-3 h-3 rounded-sm" style={{ background: 'rgba(239, 68, 68, 0.5)' }} /> Unprofitable</span>
              <span className="flex items-center gap-1"><div className="w-3 h-3 rounded-sm" style={{ background: 'rgba(34, 197, 94, 0.5)' }} /> Profitable</span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

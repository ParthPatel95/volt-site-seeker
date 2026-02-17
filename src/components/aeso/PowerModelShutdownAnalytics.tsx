import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { DollarSign, Clock, TrendingUp, Zap, Target, ChevronDown, ChevronUp, Award, Calendar, ArrowRight } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line, Area, AreaChart, ComposedChart, ReferenceLine, Cell,
} from 'recharts';
import type { ShutdownRecord, HourlyRecord, FacilityParams } from '@/hooks/usePowerModelCalculator';
import { PowerModelShutdownLog } from './PowerModelShutdownLog';

interface Props {
  shutdownLog: ShutdownRecord[];
  breakeven: number;
  hourlyData?: HourlyRecord[];
  params?: FacilityParams;
  fixedPriceCAD?: number;
}

const REASON_COLORS: Record<string, string> = {
  '12CP': 'hsl(0, 65%, 55%)',
  'Price': 'hsl(45, 80%, 50%)',
  'UptimeCap': 'hsl(220, 70%, 55%)',
  '12CP+Price': 'hsl(280, 50%, 55%)',
};

const REASON_DOT_COLORS: Record<string, string> = {
  '12CP': 'bg-red-500',
  'Price': 'bg-amber-500',
  'UptimeCap': 'bg-blue-500',
  '12CP+Price': 'bg-purple-500',
};

const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const fmt = (v: number) => `$${(v / 1000).toFixed(0)}k`;
const fmtFull = (v: number) => `$${v.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;

export function PowerModelShutdownAnalytics({ shutdownLog, breakeven, hourlyData, params, fixedPriceCAD = 0 }: Props) {
  const [logOpen, setLogOpen] = useState(false);

  // === Efficiency KPIs ===
  const metrics = useMemo(() => {
    if (!shutdownLog.length) return null;
    const totalSavings = shutdownLog.reduce((s, r) => s + r.costAvoided, 0);
    const totalHours = shutdownLog.length;
    const savingsPerHour = totalHours > 0 ? totalSavings / totalHours : 0;
    const avgPriceAvoided = shutdownLog.reduce((s, r) => s + r.poolPrice, 0) / totalHours;
    const totalPossible = shutdownLog.reduce((s, r) => s + r.poolPrice * (params?.contractedCapacityMW || 25), 0);
    const captureRate = totalPossible > 0 ? (totalSavings / totalPossible) * 100 : 0;
    return { totalSavings, totalHours, savingsPerHour, avgPriceAvoided, captureRate };
  }, [shutdownLog, params]);

  // === Top 10 Most Valuable Hours ===
  const top10 = useMemo(() => {
    return [...shutdownLog].sort((a, b) => b.costAvoided - a.costAvoided).slice(0, 10);
  }, [shutdownLog]);

  // === Curtailment Timeline (by day) ===
  const timeline = useMemo(() => {
    const dayMap: Record<string, { hours: number; savings: number; reasons: Set<string> }> = {};
    for (const r of shutdownLog) {
      if (!dayMap[r.date]) dayMap[r.date] = { hours: 0, savings: 0, reasons: new Set() };
      dayMap[r.date].hours++;
      dayMap[r.date].savings += r.costAvoided;
      dayMap[r.date].reasons.add(r.reason);
    }
    return Object.entries(dayMap).sort(([a], [b]) => a.localeCompare(b)).map(([date, d]) => ({
      date, hours: d.hours, savings: d.savings, reasons: Array.from(d.reasons),
    }));
  }, [shutdownLog]);

  // === Hour Distribution (enhanced) ===
  const byHour = useMemo(() => {
    const hours = Array.from({ length: 24 }, (_, i) => ({ hour: `${i + 1}`, '12CP': 0, Price: 0, UptimeCap: 0, '12CP+Price': 0, total: 0 }));
    for (const r of shutdownLog) {
      const idx = r.he - 1;
      if (idx >= 0 && idx < 24) { hours[idx][r.reason]++; hours[idx].total++; }
    }
    return hours;
  }, [shutdownLog]);

  // === Monthly Breakdown with running savings ===
  const byMonth = useMemo(() => {
    const months: Record<number, { '12CP': number; Price: number; UptimeCap: number; '12CP+Price': number; savings: number }> = {};
    for (const r of shutdownLog) {
      const m = new Date(r.date).getMonth();
      if (!months[m]) months[m] = { '12CP': 0, Price: 0, UptimeCap: 0, '12CP+Price': 0, savings: 0 };
      months[m][r.reason]++;
      months[m].savings += r.costAvoided;
    }
    let cumulative = 0;
    return Object.entries(months).map(([k, v]) => {
      cumulative += v.savings;
      return { month: MONTH_NAMES[parseInt(k)], ...v, cumSavings: cumulative };
    }).sort((a, b) => MONTH_NAMES.indexOf(a.month) - MONTH_NAMES.indexOf(b.month));
  }, [shutdownLog]);

  // === Cumulative Savings Curve ===
  const cumulative = useMemo(() => {
    const sorted = [...shutdownLog].sort((a, b) => a.date.localeCompare(b.date) || a.he - b.he);
    let running = 0;
    const monthAgg: Record<string, number> = {};
    for (const r of sorted) { running += r.costAvoided; monthAgg[MONTH_NAMES[new Date(r.date).getMonth()]] = running; }
    return Object.entries(monthAgg).map(([label, savings]) => ({ label, savings }));
  }, [shutdownLog]);

  // === Optimal Threshold Finder ===
  const thresholdAnalysis = useMemo(() => {
    if (!hourlyData?.length || !params) return null;
    const cap = params.contractedCapacityMW;
    const points: { threshold: number; cost: number }[] = [];
    const totalHours = hourlyData.length;
    
    for (let t = 0; t <= 500; t += 5) {
      let energyCost = 0;
      let runHours = 0;
      for (const r of hourlyData) {
        if (r.poolPrice <= t) {
          energyCost += r.poolPrice * cap;
          runHours++;
        }
      }
      // Rough total cost = energy + fixed costs prorated
      const fixedCostPerHour = (params.contractedCapacityMW * 11131 * 12) / totalHours; // Bulk demand estimate
      const totalCost = energyCost + (runHours * fixedCostPerHour * 0.3);
      points.push({ threshold: t, cost: totalCost });
    }

    const minPoint = points.reduce((min, p) => p.cost < min.cost ? p : min, points[0]);
    return { points, optimal: minPoint, currentBreakeven: breakeven };
  }, [hourlyData, params, breakeven]);

  // === Shutdown Price Distribution ===
  const priceDistribution = useMemo(() => {
    const bins = [0, 25, 50, 75, 100, 150, 200, 300, 500];
    return bins.map((min, i) => {
      const max = i < bins.length - 1 ? bins[i + 1] : Infinity;
      const label = max === Infinity ? `$${min}+` : `$${min}-${max}`;
      const records = shutdownLog.filter(r => r.poolPrice >= min && r.poolPrice < max);
      const savings = records.reduce((s, r) => s + r.costAvoided, 0);
      return { range: label, hours: records.length, savings };
    }).filter(d => d.hours > 0);
  }, [shutdownLog]);

  if (!shutdownLog.length) {
    return (
      <Card>
        <CardContent className="p-8 text-center text-muted-foreground">
          No shutdown data available. Load data and run the model first.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Row 1: Curtailment Scorecard */}
      {metrics && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Hero: Total Saved */}
          <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-500/15 via-emerald-500/5 to-transparent border border-emerald-500/30 sm:col-span-1">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5 rounded-lg bg-emerald-500/20">
                <DollarSign className="w-4 h-4 text-emerald-500" />
              </div>
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Total Saved</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{fmt(metrics.totalSavings)}</p>
            <p className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-1">{fmtFull(Math.round(metrics.totalSavings))} avoided costs</p>
          </div>

          <div className="p-4 rounded-xl bg-card border border-border/50">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5 rounded-lg bg-amber-500/15">
                <Zap className="w-4 h-4 text-amber-500" />
              </div>
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Efficiency</span>
            </div>
            <p className="text-xl font-bold text-foreground">${metrics.savingsPerHour.toFixed(0)}<span className="text-sm font-normal text-muted-foreground">/hr</span></p>
            <p className="text-[10px] text-muted-foreground mt-1">Avg savings per curtailed hour</p>
          </div>

          <div className="p-4 rounded-xl bg-card border border-border/50">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5 rounded-lg bg-blue-500/15">
                <Clock className="w-4 h-4 text-blue-500" />
              </div>
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Hours Curtailed</span>
            </div>
            <p className="text-xl font-bold text-foreground">{metrics.totalHours}</p>
            <p className="text-[10px] text-muted-foreground mt-1">{((metrics.totalHours / 8760) * 100).toFixed(1)}% of year</p>
          </div>

          <div className="p-4 rounded-xl bg-card border border-border/50">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5 rounded-lg bg-red-500/15">
                <TrendingUp className="w-4 h-4 text-red-500" />
              </div>
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Avg Price Avoided</span>
            </div>
            <p className="text-xl font-bold text-foreground">${metrics.avgPriceAvoided.toFixed(0)}<span className="text-sm font-normal text-muted-foreground">/MWh</span></p>
            <p className="text-[10px] text-muted-foreground mt-1">Pool price during shutdowns</p>
          </div>
        </div>
      )}

      {/* Efficiency Bar */}
      {metrics && (
        <div className="p-3 rounded-xl bg-muted/30 border border-border/30 flex items-center gap-3 flex-wrap">
          <span className="text-xs text-muted-foreground">Curtailment Effectiveness:</span>
          <div className="flex-1 h-2.5 rounded-full bg-muted/50 overflow-hidden min-w-[200px]">
            <div className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all" style={{ width: `${Math.min(metrics.captureRate, 100)}%` }} />
          </div>
          <span className="text-xs font-bold text-foreground">{metrics.captureRate.toFixed(1)}% cost captured</span>
        </div>
      )}

      {/* Row 2: Curtailment Timeline */}
      {timeline.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              Curtailment Timeline
              <Badge variant="outline" size="sm">{timeline.length} days</Badge>
            </CardTitle>
            <CardDescription className="text-xs">Daily curtailment events across the year</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto pb-2">
              <div className="flex gap-[2px] min-w-[700px]">
                {timeline.map((day, i) => {
                  const primaryReason = day.reasons[0];
                  const maxHrs = Math.max(...timeline.map(t => t.hours));
                  const height = Math.max(8, (day.hours / maxHrs) * 40);
                  return (
                    <div
                      key={i}
                      className="flex-1 min-w-[3px] max-w-[6px] rounded-t-sm cursor-default transition-all hover:opacity-80"
                      style={{
                        height: `${height}px`,
                        background: REASON_COLORS[primaryReason] || 'hsl(220, 70%, 55%)',
                        alignSelf: 'flex-end',
                      }}
                      title={`${day.date}: ${day.hours}h curtailed, ${fmtFull(Math.round(day.savings))} saved (${day.reasons.join(', ')})`}
                    />
                  );
                })}
              </div>
              <div className="flex justify-between mt-1 text-[9px] text-muted-foreground">
                <span>{timeline[0]?.date}</span>
                <span>{timeline[timeline.length - 1]?.date}</span>
              </div>
            </div>
            <div className="flex items-center gap-4 mt-2 text-[9px]">
              {Object.entries(REASON_DOT_COLORS).map(([reason, color]) => (
                <span key={reason} className="flex items-center gap-1">
                  <div className={`w-2 h-2 rounded-full ${color}`} />
                  <span className="text-muted-foreground">{reason}</span>
                </span>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Row 3: Hour Distribution + Monthly */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Shutdown by Hour of Day</CardTitle>
            <CardDescription className="text-xs">Peak curtailment hours highlighted</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={byHour}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-20" />
                <XAxis dataKey="hour" tick={{ fontSize: 9 }} interval={1} label={{ value: 'Hour Ending', position: 'insideBottom', offset: -2, style: { fontSize: 9 } }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} />
                <Legend wrapperStyle={{ fontSize: 10 }} />
                <Bar dataKey="12CP" stackId="a" fill={REASON_COLORS['12CP']} radius={[0, 0, 0, 0]} />
                <Bar dataKey="Price" stackId="a" fill={REASON_COLORS['Price']} />
                <Bar dataKey="UptimeCap" stackId="a" fill={REASON_COLORS['UptimeCap']} name="Uptime Cap" />
                <Bar dataKey="12CP+Price" stackId="a" fill={REASON_COLORS['12CP+Price']} radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Monthly Breakdown</CardTitle>
            <CardDescription className="text-xs">Curtailed hours with cumulative savings overlay</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <ComposedChart data={byMonth}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-20" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis yAxisId="hrs" tick={{ fontSize: 11 }} />
                <YAxis yAxisId="sav" orientation="right" tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 10 }} />
                <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} />
                <Legend wrapperStyle={{ fontSize: 10 }} />
                <Bar yAxisId="hrs" dataKey="12CP" stackId="a" fill={REASON_COLORS['12CP']} />
                <Bar yAxisId="hrs" dataKey="Price" stackId="a" fill={REASON_COLORS['Price']} />
                <Bar yAxisId="hrs" dataKey="UptimeCap" stackId="a" fill={REASON_COLORS['UptimeCap']} name="Uptime Cap" />
                <Bar yAxisId="hrs" dataKey="12CP+Price" stackId="a" fill={REASON_COLORS['12CP+Price']} />
                <Line yAxisId="sav" type="monotone" dataKey="cumSavings" stroke="hsl(150, 60%, 45%)" strokeWidth={2} name="Cumulative Savings" dot={false} />
              </ComposedChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Row 4: Price Distribution + Cumulative */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Price Distribution During Shutdowns</CardTitle>
            <CardDescription className="text-xs">Pool prices during curtailed hours</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <ComposedChart data={priceDistribution}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-20" />
                <XAxis dataKey="range" tick={{ fontSize: 10 }} />
                <YAxis yAxisId="hrs" tick={{ fontSize: 11 }} />
                <YAxis yAxisId="sav" orientation="right" tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 10 }} />
                <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} />
                <Bar yAxisId="hrs" dataKey="hours" fill="hsl(0, 65%, 55%)" radius={[3, 3, 0, 0]} name="Hours" />
                <Line yAxisId="sav" type="monotone" dataKey="savings" stroke="hsl(150, 60%, 45%)" strokeWidth={2} name="Savings" dot={false} />
              </ComposedChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Cumulative Savings Curve</CardTitle>
            <CardDescription className="text-xs">Running total of cost avoided</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={cumulative}>
                <defs>
                  <linearGradient id="savingsGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(150, 60%, 45%)" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="hsl(150, 60%, 45%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="opacity-20" />
                <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                <YAxis tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v: number) => [fmtFull(v), 'Cumulative Savings']} contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                <Area type="monotone" dataKey="savings" stroke="hsl(150, 60%, 45%)" strokeWidth={2.5} fill="url(#savingsGrad)" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Row 5: Optimal Threshold Finder */}
      {thresholdAnalysis && (
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <CardTitle className="text-sm flex items-center gap-2">
                  <Target className="w-4 h-4 text-primary" />
                  Optimal Curtailment Threshold
                  <Badge variant="info" size="sm">NEW</Badge>
                </CardTitle>
                <CardDescription className="text-xs">
                  Mathematical sweep to find the price point that minimizes total annual cost
                </CardDescription>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <span className="text-muted-foreground">Current: <strong className="text-foreground">${thresholdAnalysis.currentBreakeven.toFixed(0)}/MWh</strong></span>
                <ArrowRight className="w-3 h-3 text-muted-foreground" />
                <span className="text-muted-foreground">Optimal: <strong className="text-emerald-600 dark:text-emerald-400">${thresholdAnalysis.optimal.threshold}/MWh</strong></span>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <ComposedChart data={thresholdAnalysis.points}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-20" />
                <XAxis dataKey="threshold" tick={{ fontSize: 10 }} label={{ value: 'Price Threshold ($/MWh)', position: 'insideBottom', offset: -2, style: { fontSize: 10 } }} />
                <YAxis tickFormatter={(v: number) => `$${(v / 1000000).toFixed(1)}M`} tick={{ fontSize: 10 }} />
                <Tooltip formatter={(v: number) => [fmtFull(Math.round(v)), 'Est. Annual Cost']} contentStyle={{ fontSize: 11, borderRadius: 8 }} />
                <Area type="monotone" dataKey="cost" stroke="hsl(220, 70%, 55%)" fill="hsl(220, 70%, 55%)" fillOpacity={0.1} strokeWidth={2} dot={false} />
                <ReferenceLine x={thresholdAnalysis.currentBreakeven} stroke="hsl(0, 65%, 55%)" strokeWidth={2} strokeDasharray="5 5" label={{ value: 'Current', position: 'top', fontSize: 10, fill: 'hsl(0, 65%, 55%)' }} />
                <ReferenceLine x={thresholdAnalysis.optimal.threshold} stroke="hsl(150, 60%, 45%)" strokeWidth={2} strokeDasharray="5 5" label={{ value: 'Optimal', position: 'top', fontSize: 10, fill: 'hsl(150, 60%, 45%)' }} />
              </ComposedChart>
            </ResponsiveContainer>
            {thresholdAnalysis.optimal.threshold !== Math.round(thresholdAnalysis.currentBreakeven) && (
              <div className="mt-3 p-3 rounded-lg bg-primary/5 border border-primary/20 text-xs text-muted-foreground">
                <strong className="text-foreground">Insight:</strong> Moving your curtailment threshold from ${Math.round(thresholdAnalysis.currentBreakeven)}/MWh to ${thresholdAnalysis.optimal.threshold}/MWh could optimize your annual cost structure. This analysis uses a simplified model — consult with your energy advisor for precise figures.
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Row 6: Top 10 Most Valuable Hours */}
      {top10.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-500" />
              Top 10 Most Valuable Curtailed Hours
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2">
              {top10.map((r, i) => (
                <div key={i} className={`p-3 rounded-lg border border-border/50 ${i === 0 ? 'bg-gradient-to-br from-amber-500/10 to-transparent border-amber-500/30' : 'bg-muted/20'}`}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] text-muted-foreground">#{i + 1}</span>
                    <Badge variant="outline" className="text-[9px] h-4 px-1">{r.reason}</Badge>
                  </div>
                  <p className="text-sm font-bold text-foreground">{fmtFull(Math.round(r.costAvoided))}</p>
                  <p className="text-[10px] text-muted-foreground">{r.date} HE{r.he}</p>
                  <p className="text-[10px] text-muted-foreground">Pool: ${r.poolPrice.toFixed(0)}/MWh</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Row 7: Collapsible Shutdown Log */}
      <Collapsible open={logOpen} onOpenChange={setLogOpen}>
        <Card>
          <CollapsibleTrigger className="w-full">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div className="flex items-center gap-2">
                <CardTitle className="text-sm">Shutdown Log</CardTitle>
                <Badge variant="secondary" size="sm">{shutdownLog.length} hours</Badge>
              </div>
              {logOpen ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="pt-0">
              <PowerModelShutdownLog shutdownLog={shutdownLog} fixedPriceCAD={fixedPriceCAD} />
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>
    </div>
  );
}

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { FileText, TrendingUp, TrendingDown, DollarSign, Scale } from 'lucide-react';
import { HourlyRecord } from '@/hooks/usePowerModelCalculator';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, Legend, Cell, ReferenceLine,
} from 'recharts';

interface Props {
  hourlyData: HourlyRecord[];
  capacityMW: number;
}

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function PPAvsPoolAnalyzer({ hourlyData, capacityMW }: Props) {
  const [ppaPrice, setPpaPrice] = useState(65);

  // Monthly comparison
  const monthlyComparison = useMemo(() => {
    if (hourlyData.length === 0) return [];
    const months = new Map<string, { poolSum: number; hours: number }>();

    for (const r of hourlyData) {
      const dt = new Date(`${r.date}T00:00:00`);
      const key = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}`;
      const entry = months.get(key) || { poolSum: 0, hours: 0 };
      entry.poolSum += r.poolPrice;
      entry.hours++;
      months.set(key, entry);
    }

    return Array.from(months.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, v]) => {
        const monthIdx = parseInt(key.split('-')[1]) - 1;
        const poolCost = (v.poolSum / v.hours) * capacityMW;
        const ppaCost = ppaPrice * capacityMW;
        const settlement = (v.poolSum / v.hours - ppaPrice) * capacityMW;
        return {
          month: MONTH_NAMES[monthIdx] || key,
          poolCost: Math.round(poolCost),
          ppaCost: Math.round(ppaCost),
          settlement: Math.round(settlement),
          avgPool: Math.round(v.poolSum / v.hours * 100) / 100,
          hours: v.hours,
        };
      });
  }, [hourlyData, ppaPrice, capacityMW]);

  // Cumulative cost curves
  const cumulativeData = useMemo(() => {
    let poolTotal = 0;
    let ppaTotal = 0;
    return monthlyComparison.map(m => {
      poolTotal += m.poolCost * m.hours;
      ppaTotal += m.ppaCost * m.hours;
      return {
        month: m.month,
        cumulativePool: Math.round(poolTotal),
        cumulativePPA: Math.round(ppaTotal),
      };
    });
  }, [monthlyComparison]);

  // Summary KPIs
  const summary = useMemo(() => {
    if (hourlyData.length === 0) return null;
    const totalPoolCost = hourlyData.reduce((s, r) => s + r.poolPrice * capacityMW, 0);
    const totalPPACost = hourlyData.length * ppaPrice * capacityMW;
    const ppaWinHours = hourlyData.filter(r => r.poolPrice > ppaPrice).length;
    const netDifference = totalPoolCost - totalPPACost;

    // Breakeven PPA rate
    const avgPoolPrice = hourlyData.reduce((s, r) => s + r.poolPrice, 0) / hourlyData.length;

    // Worst month
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
    };
  }, [hourlyData, ppaPrice, capacityMW, monthlyComparison]);

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
      {/* PPA Price Control */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Scale className="w-4 h-4 text-primary" />
            <CardTitle className="text-base">PPA vs Pool Price Comparison</CardTitle>
          </div>
          <CardDescription className="text-xs">Compare a fixed PPA rate against actual pool exposure using {hourlyData.length.toLocaleString()} hours of real data</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-xs">PPA Fixed Price</Label>
              <Badge variant="outline" className="font-mono text-xs">${ppaPrice}/MWh</Badge>
            </div>
            <Slider
              value={[ppaPrice]}
              onValueChange={([v]) => setPpaPrice(v)}
              min={30}
              max={150}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-[10px] text-muted-foreground">
              <span>$30/MWh</span>
              <span>$150/MWh</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* KPI Cards */}
      {summary && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {[
            { label: 'Pool Cost', value: `$${(summary.totalPoolCost / 1000).toFixed(0)}K`, sub: 'Annual total', icon: <DollarSign className="w-3 h-3" /> },
            { label: 'PPA Cost', value: `$${(summary.totalPPACost / 1000).toFixed(0)}K`, sub: `@$${ppaPrice}/MWh`, icon: <FileText className="w-3 h-3" /> },
            { label: 'Net Difference', value: `$${(Math.abs(summary.netDifference) / 1000).toFixed(0)}K`, sub: summary.netDifference > 0 ? 'PPA saves' : 'Pool cheaper', color: summary.netDifference > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400' },
            { label: 'PPA Wins', value: `${summary.ppaWinPct}%`, sub: 'of hours' },
            { label: 'Breakeven PPA', value: `$${summary.breakeven}`, sub: 'Avg pool price' },
            { label: 'Worst Month', value: summary.worstMonth, sub: `$${(Math.abs(summary.worstExposure)).toFixed(0)} exposure` },
          ].map(kpi => (
            <div key={kpi.label} className="p-2.5 rounded-lg border border-border bg-card text-center">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{kpi.label}</p>
              <p className={`text-sm font-bold ${kpi.color || 'text-foreground'}`}>{kpi.value}</p>
              <p className="text-[10px] text-muted-foreground">{kpi.sub}</p>
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
                <Tooltip formatter={(v: number) => [`$${v.toFixed(0)}/MWh settlement`, 'Settlement']} />
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

      {/* Cumulative Cost Curves */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Cumulative Cost Over Time</CardTitle>
          <CardDescription className="text-xs">Running total comparison — where the lines cross shows the PPA value shift</CardDescription>
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
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}

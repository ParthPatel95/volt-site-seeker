import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line, ComposedChart,
} from 'recharts';
import type { ShutdownRecord } from '@/hooks/usePowerModelCalculator';

interface Props {
  shutdownLog: ShutdownRecord[];
  breakeven: number;
}

const REASON_COLORS: Record<string, string> = {
  '12CP': 'hsl(0, 65%, 55%)',
  'Price': 'hsl(45, 80%, 50%)',
  'UptimeCap': 'hsl(220, 70%, 55%)',
  '12CP+Price': 'hsl(280, 50%, 55%)',
};

const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

export function PowerModelShutdownAnalytics({ shutdownLog, breakeven }: Props) {
  // 1. Shutdown by Hour of Day
  const byHour = useMemo(() => {
    const hours = Array.from({ length: 24 }, (_, i) => ({
      hour: `HE ${i + 1}`,
      '12CP': 0, 'Price': 0, 'UptimeCap': 0, '12CP+Price': 0, total: 0,
    }));
    for (const r of shutdownLog) {
      const idx = r.he - 1;
      if (idx >= 0 && idx < 24) {
        hours[idx][r.reason]++;
        hours[idx].total++;
      }
    }
    return hours;
  }, [shutdownLog]);

  // 2. Monthly Shutdown Breakdown
  const byMonth = useMemo(() => {
    const months: Record<number, { '12CP': number; Price: number; UptimeCap: number; '12CP+Price': number }> = {};
    for (const r of shutdownLog) {
      const m = new Date(r.date).getMonth();
      if (!months[m]) months[m] = { '12CP': 0, Price: 0, UptimeCap: 0, '12CP+Price': 0 };
      months[m][r.reason]++;
    }
    return Object.entries(months)
      .map(([k, v]) => ({ month: MONTH_NAMES[parseInt(k)], ...v }))
      .sort((a, b) => MONTH_NAMES.indexOf(a.month) - MONTH_NAMES.indexOf(b.month));
  }, [shutdownLog]);

  // 3. Price Distribution: Running vs Shutdown
  const priceDistribution = useMemo(() => {
    const bins = [0, 25, 50, 75, 100, 150, 200, 300, 500];
    return bins.map((min, i) => {
      const max = i < bins.length - 1 ? bins[i + 1] : Infinity;
      const label = max === Infinity ? `$${min}+` : `$${min}-${max}`;
      const shutdown = shutdownLog.filter(r => r.poolPrice >= min && r.poolPrice < max).length;
      return { range: label, 'Shutdown Hours': shutdown };
    }).filter(d => d['Shutdown Hours'] > 0);
  }, [shutdownLog]);

  // 4. Cumulative Cost Avoided
  const cumulative = useMemo(() => {
    const sorted = [...shutdownLog].sort((a, b) => a.date.localeCompare(b.date) || a.he - b.he);
    let running = 0;
    const points: { label: string; savings: number }[] = [];
    // Aggregate by month for cleaner chart
    const monthAgg: Record<string, number> = {};
    for (const r of sorted) {
      running += r.costAvoided;
      const d = new Date(r.date);
      const key = `${MONTH_NAMES[d.getMonth()]}`;
      monthAgg[key] = running;
    }
    for (const [label, savings] of Object.entries(monthAgg)) {
      points.push({ label, savings });
    }
    return points;
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
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Shutdown by Hour of Day */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Shutdown by Hour of Day</CardTitle>
          <CardDescription className="text-xs">Which hours get curtailed most frequently</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={byHour}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis dataKey="hour" tick={{ fontSize: 9 }} interval={1} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="12CP" stackId="a" fill={REASON_COLORS['12CP']} />
              <Bar dataKey="Price" stackId="a" fill={REASON_COLORS['Price']} />
              <Bar dataKey="UptimeCap" stackId="a" fill={REASON_COLORS['UptimeCap']} name="Uptime Cap" />
              <Bar dataKey="12CP+Price" stackId="a" fill={REASON_COLORS['12CP+Price']} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Monthly Shutdown Breakdown */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Monthly Shutdown Breakdown</CardTitle>
          <CardDescription className="text-xs">Curtailed hours by reason per month</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={byMonth}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="12CP" stackId="a" fill={REASON_COLORS['12CP']} />
              <Bar dataKey="Price" stackId="a" fill={REASON_COLORS['Price']} />
              <Bar dataKey="UptimeCap" stackId="a" fill={REASON_COLORS['UptimeCap']} name="Uptime Cap" />
              <Bar dataKey="12CP+Price" stackId="a" fill={REASON_COLORS['12CP+Price']} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Price Distribution */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Shutdown Price Distribution</CardTitle>
          <CardDescription className="text-xs">Pool prices during curtailed hours</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={priceDistribution}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis dataKey="range" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="Shutdown Hours" fill="hsl(0, 65%, 55%)" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Cumulative Cost Avoided */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Cumulative Cost Avoided</CardTitle>
          <CardDescription className="text-xs">Running total of estimated savings from all curtailment</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={cumulative}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis dataKey="label" tick={{ fontSize: 11 }} />
              <YAxis tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v: number) => [`$${v.toLocaleString(undefined, { maximumFractionDigits: 0 })}`, 'Cumulative Savings']} />
              <Line type="monotone" dataKey="savings" stroke="hsl(150, 60%, 45%)" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}

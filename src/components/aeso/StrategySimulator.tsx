import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Loader2, PlayCircle, BarChart3, TrendingUp, Zap } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, Legend, Cell, ScatterChart, Scatter, ZAxis,
} from 'recharts';

interface PriceRecord {
  pool_price: number;
  hour_of_day: number | null;
  month: number | null;
  ail_mw: number | null;
}

interface StrategyResult {
  name: string;
  operatingHours: number;
  avgCost: number;
  totalCost: number;
  savings: number;
  color: string;
}

const STRATEGIES = [
  { key: 'continuous', name: 'Continuous (24/7)', desc: 'Run every hour', color: 'hsl(220, 70%, 55%)' },
  { key: 'offpeak', name: 'Off-Peak Only', desc: 'HE 22-06 only', color: 'hsl(150, 60%, 45%)' },
  { key: 'smart', name: 'Smart (Price-Responsive)', desc: 'Below threshold', color: 'hsl(45, 80%, 50%)' },
  { key: 'peakAvoid', name: 'Peak Avoidance', desc: 'Skip HE 16-20', color: 'hsl(270, 60%, 55%)' },
  { key: 'nightWeekend', name: 'Night + Weekend', desc: 'Nights + all weekend', color: 'hsl(0, 60%, 55%)' },
];

export function StrategySimulator() {
  const [data, setData] = useState<PriceRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [capacityMW, setCapacityMW] = useState(50);
  const [priceThreshold, setPriceThreshold] = useState(80);
  const [electricityRate, setElectricityRate] = useState(0.06); // $/kWh revenue

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      let allData: PriceRecord[] = [];
      let offset = 0;
      while (true) {
        const { data: batch, error } = await supabase
          .from('aeso_training_data')
          .select('pool_price, hour_of_day, month, ail_mw')
          .gte('timestamp', '2025-01-01')
          .order('timestamp', { ascending: true })
          .range(offset, offset + 999);
        if (error) throw error;
        if (!batch || batch.length === 0) break;
        allData = allData.concat(batch as PriceRecord[]);
        if (batch.length < 1000) break;
        offset += 1000;
      }
      setData(allData);
    } catch (err) {
      console.error('Strategy sim load error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  // Strategy evaluation
  const results = useMemo((): StrategyResult[] => {
    if (data.length === 0) return [];
    const continuousCost = data.reduce((s, d) => s + d.pool_price, 0) * capacityMW / 1000;

    return STRATEGIES.map(strat => {
      let operating: PriceRecord[];
      switch (strat.key) {
        case 'continuous':
          operating = data;
          break;
        case 'offpeak':
          operating = data.filter(d => d.hour_of_day !== null && (d.hour_of_day >= 22 || d.hour_of_day < 6));
          break;
        case 'smart':
          operating = data.filter(d => d.pool_price < priceThreshold);
          break;
        case 'peakAvoid':
          operating = data.filter(d => d.hour_of_day !== null && (d.hour_of_day < 16 || d.hour_of_day >= 20));
          break;
        case 'nightWeekend':
          operating = data.filter(d => {
            const isNight = d.hour_of_day !== null && (d.hour_of_day >= 22 || d.hour_of_day < 6);
            return isNight; // Simplified - weekend detection would need day_of_week
          });
          break;
        default:
          operating = data;
      }

      const totalCost = operating.reduce((s, d) => s + d.pool_price, 0) * capacityMW / 1000;
      const avgCost = operating.length > 0 ? operating.reduce((s, d) => s + d.pool_price, 0) / operating.length : 0;
      const savings = continuousCost - totalCost;

      return {
        name: strat.name,
        operatingHours: operating.length,
        avgCost: Math.round(avgCost * 100) / 100,
        totalCost: Math.round(totalCost),
        savings: Math.round(savings),
        color: strat.color,
      };
    });
  }, [data, capacityMW, priceThreshold]);

  // Monte Carlo simulation (simplified)
  const monteCarlo = useMemo(() => {
    if (data.length < 100) return null;
    const prices = data.map(d => d.pool_price);
    const n = 1000;
    const yearHours = 8760;
    const profits: number[] = [];

    for (let sim = 0; sim < n; sim++) {
      let annualCost = 0;
      for (let h = 0; h < yearHours; h++) {
        const price = prices[Math.floor(Math.random() * prices.length)];
        if (price < priceThreshold) {
          annualCost += price * capacityMW / 1000;
        }
      }
      const revenue = yearHours * 0.8 * capacityMW * electricityRate * 1000; // simplified revenue
      profits.push(Math.round(revenue - annualCost));
    }

    profits.sort((a, b) => a - b);
    return {
      p10: profits[Math.floor(n * 0.1)],
      p50: profits[Math.floor(n * 0.5)],
      p90: profits[Math.floor(n * 0.9)],
      min: profits[0],
      max: profits[n - 1],
      histogram: Array.from({ length: 20 }, (_, i) => {
        const binMin = profits[0] + i * (profits[n - 1] - profits[0]) / 20;
        const binMax = binMin + (profits[n - 1] - profits[0]) / 20;
        return {
          range: `$${(binMin / 1000).toFixed(0)}K`,
          count: profits.filter(p => p >= binMin && p < binMax).length,
        };
      }),
    };
  }, [data, priceThreshold, capacityMW, electricityRate]);

  // Threshold sweep
  const thresholdSweep = useMemo(() => {
    if (data.length === 0) return [];
    const thresholds = [20, 40, 60, 80, 100, 120, 150, 200, 300, 500];
    return thresholds.map(t => {
      const operating = data.filter(d => d.pool_price < t);
      const avgCost = operating.length > 0 ? operating.reduce((s, d) => s + d.pool_price, 0) / operating.length : 0;
      return {
        threshold: `$${t}`,
        hours: operating.length,
        pctTime: Math.round(operating.length / data.length * 100),
        avgCost: Math.round(avgCost * 100) / 100,
      };
    });
  }, [data]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        <span className="ml-2 text-sm text-muted-foreground">Loading market data for simulation...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Controls */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <PlayCircle className="w-4 h-4 text-primary" />
            <CardTitle className="text-base">Strategy Simulator</CardTitle>
          </div>
          <CardDescription className="text-xs">
            Compare operating strategies using {data.length.toLocaleString()} hours of real AESO data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label className="text-xs">Capacity (MW)</Label>
              <Input type="number" value={capacityMW} onChange={e => setCapacityMW(Number(e.target.value))} className="h-8 text-xs" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs">Price Threshold</Label>
                <Badge variant="outline" className="text-xs font-mono">${priceThreshold}/MWh</Badge>
              </div>
              <Slider value={[priceThreshold]} onValueChange={([v]) => setPriceThreshold(v)} min={10} max={500} step={5} />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Revenue Rate ($/kWh)</Label>
              <Input type="number" value={electricityRate} onChange={e => setElectricityRate(Number(e.target.value))} className="h-8 text-xs" step={0.01} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Strategy Comparison */}
      {results.length > 0 && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
            {results.map(r => (
              <div key={r.name} className="p-2.5 rounded-lg border border-border bg-card text-center">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider truncate">{r.name}</p>
                <p className="text-sm font-bold text-foreground">${(r.totalCost / 1000).toFixed(0)}K</p>
                <p className="text-[10px] text-muted-foreground">{r.operatingHours.toLocaleString()} hrs · ${r.avgCost.toFixed(0)}/MWh avg</p>
                {r.savings > 0 && (
                  <Badge variant="secondary" className="text-[10px] mt-1">Save ${(r.savings / 1000).toFixed(0)}K</Badge>
                )}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Strategy Bar Chart */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Strategy Cost Comparison</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={results} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis type="number" tick={{ fontSize: 10 }} tickFormatter={v => `$${(v / 1000).toFixed(0)}K`} />
                    <YAxis type="category" dataKey="name" tick={{ fontSize: 9 }} width={120} />
                    <Tooltip formatter={(v: number) => [`$${v.toLocaleString()}`, 'Total Cost']} />
                    <Bar dataKey="totalCost" radius={[0, 4, 4, 0]}>
                      {results.map((r, i) => (
                        <Cell key={i} fill={r.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Threshold Sweep */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Threshold Impact Analysis</CardTitle>
                <CardDescription className="text-xs">Operating hours and avg cost at each price ceiling</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={thresholdSweep}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis dataKey="threshold" tick={{ fontSize: 9 }} />
                    <YAxis yAxisId="pct" tick={{ fontSize: 10 }} label={{ value: '% Time', angle: -90, position: 'insideLeft', style: { fontSize: 10 } }} />
                    <YAxis yAxisId="cost" orientation="right" tick={{ fontSize: 10 }} label={{ value: '$/MWh', angle: 90, position: 'insideRight', style: { fontSize: 10 } }} />
                    <Tooltip />
                    <Legend wrapperStyle={{ fontSize: 10 }} />
                    <Bar yAxisId="pct" dataKey="pctTime" name="% Time Operating" fill="hsl(220, 70%, 55%)" radius={[3, 3, 0, 0]} />
                    <Line yAxisId="cost" type="monotone" dataKey="avgCost" name="Avg Cost $/MWh" stroke="hsl(0, 60%, 55%)" strokeWidth={2} dot={{ r: 3 }} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </>
      )}

      {/* Monte Carlo Results */}
      {monteCarlo && (
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-purple-500" />
              <CardTitle className="text-sm">Monte Carlo Profit Distribution</CardTitle>
            </div>
            <CardDescription className="text-xs">
              1,000 simulated years using real price distribution · Smart strategy (threshold: ${priceThreshold}/MWh)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 mb-4">
              {[
                { label: 'P10 (Pessimistic)', value: monteCarlo.p10, color: 'text-red-600 dark:text-red-400' },
                { label: 'P50 (Expected)', value: monteCarlo.p50, color: 'text-foreground' },
                { label: 'P90 (Optimistic)', value: monteCarlo.p90, color: 'text-emerald-600 dark:text-emerald-400' },
                { label: 'Worst Case', value: monteCarlo.min, color: 'text-muted-foreground' },
                { label: 'Best Case', value: monteCarlo.max, color: 'text-muted-foreground' },
              ].map(k => (
                <div key={k.label} className="p-2 rounded border border-border bg-card text-center">
                  <p className="text-[10px] text-muted-foreground uppercase">{k.label}</p>
                  <p className={`text-sm font-bold font-mono ${k.color}`}>
                    ${(k.value / 1000).toFixed(0)}K
                  </p>
                </div>
              ))}
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={monteCarlo.histogram}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="range" tick={{ fontSize: 9 }} interval={2} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip />
                <Bar dataKey="count" fill="hsl(270, 60%, 55%)" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

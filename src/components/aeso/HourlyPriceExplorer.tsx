import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, TrendingUp, TrendingDown, AlertTriangle, Download, Clock, Zap, BarChart3 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Area, AreaChart, ReferenceLine, Legend, Cell,
} from 'recharts';

interface PriceRecord {
  timestamp: string;
  pool_price: number;
  ail_mw: number | null;
}

type TimeRange = '7d' | '30d' | '90d' | '365d' | 'custom';

export function HourlyPriceExplorer() {
  const [data, setData] = useState<PriceRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [timeRange, setTimeRange] = useState<TimeRange>('30d');
  const [spikeThreshold, setSpikeThreshold] = useState(200);
  const [activeView, setActiveView] = useState<'timeline' | 'duration' | 'heatmap' | 'spikes'>('timeline');

  const getDaysFromRange = (range: TimeRange) => {
    switch (range) {
      case '7d': return 7;
      case '30d': return 30;
      case '90d': return 90;
      case '365d': return 365;
      default: return 30;
    }
  };

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const days = getDaysFromRange(timeRange);
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      let allData: PriceRecord[] = [];
      let offset = 0;
      const batchSize = 1000;

      while (true) {
        const { data: batch, error } = await supabase
          .from('aeso_training_data')
          .select('timestamp, pool_price, ail_mw')
          .gte('timestamp', startDate.toISOString())
          .order('timestamp', { ascending: true })
          .range(offset, offset + batchSize - 1);

        if (error) throw error;
        if (!batch || batch.length === 0) break;
        allData = allData.concat(batch as PriceRecord[]);
        if (batch.length < batchSize) break;
        offset += batchSize;
      }

      setData(allData);
    } catch (err) {
      console.error('Failed to load price data:', err);
    } finally {
      setLoading(false);
    }
  }, [timeRange]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Statistics
  const stats = useMemo(() => {
    if (data.length === 0) return null;
    const prices = data.map(d => d.pool_price).sort((a, b) => a - b);
    const n = prices.length;
    const sum = prices.reduce((s, p) => s + p, 0);
    const mean = sum / n;
    const median = n % 2 === 0 ? (prices[n / 2 - 1] + prices[n / 2]) / 2 : prices[Math.floor(n / 2)];
    const variance = prices.reduce((s, p) => s + (p - mean) ** 2, 0) / n;
    const stdDev = Math.sqrt(variance);
    const spikes = prices.filter(p => p > spikeThreshold).length;
    const belowZero = prices.filter(p => p < 0).length;
    const p10 = prices[Math.floor(n * 0.1)];
    const p50 = prices[Math.floor(n * 0.5)];
    const p90 = prices[Math.floor(n * 0.9)];
    const p95 = prices[Math.floor(n * 0.95)];
    const p99 = prices[Math.floor(n * 0.99)];

    return {
      min: prices[0], max: prices[n - 1], mean, median, stdDev,
      spikes, belowZero, count: n, p10, p50, p90, p95, p99,
    };
  }, [data, spikeThreshold]);

  // Aggregate for chart
  const chartData = useMemo(() => {
    if (data.length === 0) return [];
    const days = getDaysFromRange(timeRange);
    if (days > 90) {
      const dayMap = new Map<string, { sum: number; count: number; max: number; min: number }>();
      for (const d of data) {
        const key = d.timestamp.slice(0, 10);
        const entry = dayMap.get(key) || { sum: 0, count: 0, max: -Infinity, min: Infinity };
        entry.sum += d.pool_price;
        entry.count++;
        entry.max = Math.max(entry.max, d.pool_price);
        entry.min = Math.min(entry.min, d.pool_price);
        dayMap.set(key, entry);
      }
      return Array.from(dayMap.entries()).map(([date, v]) => ({
        time: date,
        price: Math.round(v.sum / v.count * 100) / 100,
        max: Math.round(v.max * 100) / 100,
        min: Math.round(v.min * 100) / 100,
      }));
    }
    const step = Math.max(1, Math.floor(data.length / 1000));
    return data.filter((_, i) => i % step === 0).map(d => ({
      time: d.timestamp.slice(0, 16).replace('T', ' '),
      price: d.pool_price,
      spike: d.pool_price > spikeThreshold ? d.pool_price : undefined,
    }));
  }, [data, timeRange, spikeThreshold]);

  // Hour-of-day profile
  const hourProfile = useMemo(() => {
    const hours = Array.from({ length: 24 }, () => ({ sum: 0, count: 0 }));
    for (const d of data) {
      const h = new Date(d.timestamp).getHours();
      hours[h].sum += d.pool_price;
      hours[h].count++;
    }
    return hours.map((h, i) => ({
      hour: `${String(i).padStart(2, '0')}:00`,
      avgPrice: h.count > 0 ? Math.round(h.sum / h.count * 100) / 100 : 0,
    }));
  }, [data]);

  // Price Duration Curve
  const durationCurve = useMemo(() => {
    if (data.length === 0) return [];
    const sorted = data.map(d => d.pool_price).sort((a, b) => b - a);
    const step = Math.max(1, Math.floor(sorted.length / 200));
    return sorted.filter((_, i) => i % step === 0).map((price, idx) => ({
      pctHours: Math.round((idx * step) / sorted.length * 100),
      price: Math.round(price * 100) / 100,
    }));
  }, [data]);

  // Day-of-week x Hour heatmap
  const dowHeatmap = useMemo(() => {
    const grid: { sum: number; count: number }[][] = Array.from({ length: 7 }, () =>
      Array.from({ length: 24 }, () => ({ sum: 0, count: 0 }))
    );
    for (const d of data) {
      const dt = new Date(d.timestamp);
      const dow = dt.getDay();
      const hour = dt.getHours();
      grid[dow][hour].sum += d.pool_price;
      grid[dow][hour].count++;
    }
    const DOW_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const cells: { dow: string; hour: number; avgPrice: number; dowIdx: number }[] = [];
    for (let d = 0; d < 7; d++) {
      for (let h = 0; h < 24; h++) {
        const g = grid[d][h];
        cells.push({
          dow: DOW_NAMES[d],
          hour: h,
          avgPrice: g.count > 0 ? Math.round(g.sum / g.count * 100) / 100 : 0,
          dowIdx: d,
        });
      }
    }
    return cells;
  }, [data]);

  // Spike events table
  const spikeEvents = useMemo(() => {
    if (data.length === 0) return [];
    const events: { start: string; duration: number; peak: number; avgPrice: number; totalCost: number }[] = [];
    let inSpike = false;
    let startIdx = 0;
    
    for (let i = 0; i <= data.length; i++) {
      const isSpike = i < data.length && data[i].pool_price > spikeThreshold;
      if (isSpike && !inSpike) {
        inSpike = true;
        startIdx = i;
      } else if (!isSpike && inSpike) {
        inSpike = false;
        const spikeData = data.slice(startIdx, i);
        const peak = Math.max(...spikeData.map(d => d.pool_price));
        const avg = spikeData.reduce((s, d) => s + d.pool_price, 0) / spikeData.length;
        events.push({
          start: spikeData[0].timestamp.slice(0, 16).replace('T', ' '),
          duration: spikeData.length,
          peak: Math.round(peak * 100) / 100,
          avgPrice: Math.round(avg * 100) / 100,
          totalCost: Math.round(spikeData.reduce((s, d) => s + d.pool_price, 0)),
        });
      }
    }
    return events.sort((a, b) => b.peak - a.peak).slice(0, 20);
  }, [data, spikeThreshold]);

  // Export CSV
  const exportCSV = useCallback(() => {
    if (data.length === 0) return;
    const header = 'timestamp,pool_price,ail_mw\n';
    const rows = data.map(d => `${d.timestamp},${d.pool_price},${d.ail_mw ?? ''}`).join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `aeso_hourly_prices_${timeRange}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [data, timeRange]);

  // Heatmap color
  const getHeatColor = (price: number, maxPrice: number) => {
    const ratio = Math.min(price / Math.max(maxPrice, 1), 1);
    if (ratio < 0.3) return 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-400';
    if (ratio < 0.5) return 'bg-emerald-500/40 text-emerald-800 dark:text-emerald-300';
    if (ratio < 0.7) return 'bg-amber-500/40 text-amber-800 dark:text-amber-300';
    if (ratio < 0.85) return 'bg-orange-500/50 text-orange-800 dark:text-orange-300';
    return 'bg-red-500/60 text-red-800 dark:text-red-200';
  };

  return (
    <div className="space-y-4">
      {/* Controls */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-primary" />
              <CardTitle className="text-base">Hourly Price Explorer</CardTitle>
            </div>
            <Badge variant="outline" className="text-xs">
              {data.length.toLocaleString()} records loaded
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-end gap-3">
            <div>
              <Label className="text-xs">Time Range</Label>
              <Select value={timeRange} onValueChange={(v) => setTimeRange(v as TimeRange)}>
                <SelectTrigger className="h-8 w-32 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="7d">7 Days</SelectItem>
                  <SelectItem value="30d">30 Days</SelectItem>
                  <SelectItem value="90d">90 Days</SelectItem>
                  <SelectItem value="365d">1 Year</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Spike Threshold ($/MWh)</Label>
              <Input type="number" value={spikeThreshold} onChange={e => setSpikeThreshold(Number(e.target.value))} className="h-8 w-28 text-xs" />
            </div>
            <Button variant="outline" size="sm" className="h-8 text-xs gap-1" onClick={exportCSV} disabled={data.length === 0}>
              <Download className="w-3 h-3" />CSV
            </Button>
          </div>
          {/* View tabs */}
          <div className="flex flex-wrap gap-1.5 mt-3">
            {[
              { key: 'timeline', label: 'Timeline' },
              { key: 'duration', label: 'Duration Curve' },
              { key: 'heatmap', label: 'Day×Hour Heatmap' },
              { key: 'spikes', label: `Spike Events (${spikeEvents.length})` },
            ].map(v => (
              <Button
                key={v.key}
                variant={activeView === v.key ? 'default' : 'outline'}
                size="sm"
                className="h-7 text-xs"
                onClick={() => setActiveView(v.key as any)}
              >
                {v.label}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {loading && (
        <div className="flex items-center justify-center p-8">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      )}

      {!loading && stats && (
        <>
          {/* Stats Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
            {[
              { label: 'Min', value: `$${stats.min.toFixed(0)}`, color: 'text-emerald-600 dark:text-emerald-400' },
              { label: 'Max', value: `$${stats.max.toFixed(0)}`, color: 'text-red-600 dark:text-red-400' },
              { label: 'Mean', value: `$${stats.mean.toFixed(1)}`, color: 'text-foreground' },
              { label: 'Median', value: `$${stats.median.toFixed(1)}`, color: 'text-foreground' },
              { label: 'Std Dev', value: `$${stats.stdDev.toFixed(1)}`, color: 'text-muted-foreground' },
              { label: `Spikes (>${spikeThreshold})`, value: String(stats.spikes), color: 'text-red-600 dark:text-red-400' },
              { label: 'Below $0', value: String(stats.belowZero), color: 'text-blue-600 dark:text-blue-400' },
            ].map(s => (
              <div key={s.label} className="p-2.5 rounded-lg border border-border bg-card text-center">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{s.label}</p>
                <p className={`text-sm font-bold ${s.color}`}>{s.value}</p>
              </div>
            ))}
          </div>

          {/* Percentile Badges */}
          <div className="flex flex-wrap gap-2">
            {[
              { label: 'P10', value: stats.p10 },
              { label: 'P50', value: stats.p50 },
              { label: 'P90', value: stats.p90 },
              { label: 'P95', value: stats.p95 },
              { label: 'P99', value: stats.p99 },
            ].map(p => (
              <Badge key={p.label} variant="secondary" className="text-xs font-mono">
                {p.label}: ${p.value.toFixed(0)}/MWh
              </Badge>
            ))}
          </div>

          {/* Timeline View */}
          {activeView === 'timeline' && (
            <>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Pool Price Timeline</CardTitle>
                  <CardDescription className="text-xs">
                    {getDaysFromRange(timeRange) > 90 ? 'Daily averages' : 'Hourly prices'} · Red markers = spikes above ${spikeThreshold}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={chartData}>
                      <defs>
                        <linearGradient id="priceGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(220, 70%, 55%)" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="hsl(220, 70%, 55%)" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                      <XAxis dataKey="time" tick={{ fontSize: 9 }} interval="preserveStartEnd" />
                      <YAxis tick={{ fontSize: 10 }} label={{ value: '$/MWh', angle: -90, position: 'insideLeft', style: { fontSize: 10 } }} />
                      <Tooltip formatter={(v: number) => [`$${v.toFixed(2)}/MWh`, 'Price']} />
                      <ReferenceLine y={spikeThreshold} stroke="hsl(0, 70%, 55%)" strokeDasharray="5 5" label={{ value: `Spike: $${spikeThreshold}`, fill: 'hsl(0, 70%, 55%)', fontSize: 10 }} />
                      <ReferenceLine y={0} stroke="hsl(220, 30%, 50%)" strokeDasharray="3 3" />
                      <Area type="monotone" dataKey="price" stroke="hsl(220, 70%, 55%)" fill="url(#priceGrad)" strokeWidth={1.5} dot={false} />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Hour-of-Day Profile */}
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-purple-500" />
                    <CardTitle className="text-sm">Average Price by Hour of Day</CardTitle>
                  </div>
                  <CardDescription className="text-xs">Identifies optimal operating windows</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={hourProfile}>
                      <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                      <XAxis dataKey="hour" tick={{ fontSize: 9 }} interval={1} />
                      <YAxis tick={{ fontSize: 10 }} />
                      <Tooltip formatter={(v: number) => [`$${v.toFixed(2)}/MWh`, 'Avg Price']} />
                      <Bar dataKey="avgPrice" radius={[3, 3, 0, 0]}>
                        {hourProfile.map((h, i) => (
                          <Cell key={i} fill={h.avgPrice > (stats?.mean || 0) ? 'hsl(0, 60%, 55%)' : 'hsl(150, 60%, 45%)'} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </>
          )}

          {/* Price Duration Curve */}
          {activeView === 'duration' && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Price Duration Curve</CardTitle>
                <CardDescription className="text-xs">
                  Industry-standard view: X% of hours had prices at or below $Y/MWh
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <AreaChart data={durationCurve}>
                    <defs>
                      <linearGradient id="durationGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(270, 60%, 55%)" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="hsl(270, 60%, 55%)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis dataKey="pctHours" tick={{ fontSize: 10 }} label={{ value: '% of Hours', position: 'insideBottom', offset: -5, style: { fontSize: 10 } }} />
                    <YAxis tick={{ fontSize: 10 }} label={{ value: '$/MWh', angle: -90, position: 'insideLeft', style: { fontSize: 10 } }} />
                    <Tooltip formatter={(v: number, name: string) => [name === 'price' ? `$${v.toFixed(2)}/MWh` : `${v}%`, name === 'price' ? 'Price' : '% Hours']} />
                    <ReferenceLine y={spikeThreshold} stroke="hsl(0, 70%, 55%)" strokeDasharray="5 5" />
                    <Area type="stepAfter" dataKey="price" stroke="hsl(270, 60%, 55%)" fill="url(#durationGrad)" strokeWidth={2} dot={false} />
                  </AreaChart>
                </ResponsiveContainer>
                <div className="flex flex-wrap gap-2 mt-2">
                  {stats && [
                    { label: 'Below $0', pct: Math.round(stats.belowZero / stats.count * 100) },
                    { label: `Below $${stats.mean.toFixed(0)} (mean)`, pct: Math.round(data.filter(d => d.pool_price < stats.mean).length / stats.count * 100) },
                    { label: `Below $${spikeThreshold} (threshold)`, pct: Math.round((stats.count - stats.spikes) / stats.count * 100) },
                  ].map(s => (
                    <Badge key={s.label} variant="outline" className="text-xs">{s.label}: {s.pct}%</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Day-of-Week Heatmap */}
          {activeView === 'heatmap' && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Day-of-Week × Hour Price Heatmap</CardTitle>
                <CardDescription className="text-xs">Average pool price by day and hour — green = low, red = high</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <div className="min-w-[600px]">
                    <div className="grid grid-cols-[60px_repeat(24,1fr)] gap-0.5 text-[9px]">
                      <div />
                      {Array.from({ length: 24 }, (_, h) => (
                        <div key={h} className="text-center text-muted-foreground font-mono">{String(h).padStart(2, '0')}</div>
                      ))}
                      {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((dayName, dayDisplayIdx) => {
                        const dowIdx = dayDisplayIdx === 5 ? 6 : dayDisplayIdx === 6 ? 0 : dayDisplayIdx + 1;
                        const maxPrice = Math.max(...dowHeatmap.map(c => c.avgPrice), 1);
                        return (
                          <React.Fragment key={dayName}>
                            <div className="text-right pr-2 text-muted-foreground flex items-center justify-end font-medium">{dayName}</div>
                            {Array.from({ length: 24 }, (_, h) => {
                              const cell = dowHeatmap.find(c => c.dowIdx === dowIdx && c.hour === h);
                              const price = cell?.avgPrice || 0;
                              return (
                                <div
                                  key={h}
                                  className={`rounded-sm p-0.5 text-center font-mono ${getHeatColor(price, maxPrice)}`}
                                  title={`${dayName} ${String(h).padStart(2, '0')}:00 — $${price.toFixed(1)}/MWh`}
                                >
                                  {price.toFixed(0)}
                                </div>
                              );
                            })}
                          </React.Fragment>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Spike Events Table */}
          {activeView === 'spikes' && (
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-500" />
                  <CardTitle className="text-sm">Spike Events (Top 20)</CardTitle>
                </div>
                <CardDescription className="text-xs">
                  Consecutive hours above ${spikeThreshold}/MWh threshold
                </CardDescription>
              </CardHeader>
              <CardContent>
                {spikeEvents.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-6">No spike events detected above ${spikeThreshold}/MWh</p>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="text-xs">Start Time</TableHead>
                          <TableHead className="text-xs text-right">Duration</TableHead>
                          <TableHead className="text-xs text-right">Peak Price</TableHead>
                          <TableHead className="text-xs text-right">Avg Price</TableHead>
                          <TableHead className="text-xs text-right">Total Cost Impact</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {spikeEvents.map((e, i) => (
                          <TableRow key={i}>
                            <TableCell className="text-xs font-mono">{e.start}</TableCell>
                            <TableCell className="text-xs text-right">{e.duration}h</TableCell>
                            <TableCell className="text-xs text-right font-bold text-red-600 dark:text-red-400">${e.peak.toFixed(0)}</TableCell>
                            <TableCell className="text-xs text-right">${e.avgPrice.toFixed(0)}</TableCell>
                            <TableCell className="text-xs text-right">${e.totalCost.toLocaleString()}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}

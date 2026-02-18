import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, TrendingUp, TrendingDown, AlertTriangle, Download, Clock, Zap, BarChart3 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
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

  // Aggregate for chart (daily avg if > 90 days, hourly otherwise)
  const chartData = useMemo(() => {
    if (data.length === 0) return [];
    const days = getDaysFromRange(timeRange);

    if (days > 90) {
      // Daily aggregation
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

    // Use every nth point to cap at ~1000 points
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
                <SelectTrigger className="h-8 w-32 text-xs">
                  <SelectValue />
                </SelectTrigger>
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
              <Download className="w-3 h-3" />
              CSV
            </Button>
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

          {/* Price Time Series */}
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
    </div>
  );
}

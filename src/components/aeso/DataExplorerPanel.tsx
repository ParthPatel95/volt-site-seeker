import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Search, BarChart3, ScatterChart as ScatterIcon, TrendingUp } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import {
  ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  ZAxis, LineChart, Line, BarChart, Bar, Cell,
} from 'recharts';

type FieldKey = 'pool_price' | 'ail_mw' | 'temperature_edmonton' | 'temperature_calgary' | 'wind_speed' | 'gas_price_aeco' | 'cloud_cover';
type ChartType = 'scatter' | 'line' | 'histogram';
type ColorBy = 'none' | 'season' | 'hour' | 'month';
type Aggregation = 'raw' | 'daily' | 'weekly' | 'monthly';

const FIELDS: { key: FieldKey; label: string; unit: string }[] = [
  { key: 'pool_price', label: 'Pool Price', unit: '$/MWh' },
  { key: 'ail_mw', label: 'Demand (AIL)', unit: 'MW' },
  { key: 'temperature_edmonton', label: 'Temperature (Edmonton)', unit: '°C' },
  { key: 'temperature_calgary', label: 'Temperature (Calgary)', unit: '°C' },
  { key: 'wind_speed', label: 'Wind Speed', unit: 'km/h' },
  { key: 'gas_price_aeco', label: 'Gas Price (AECO)', unit: '$/GJ' },
  { key: 'cloud_cover', label: 'Cloud Cover', unit: '%' },
];

const SEASON_COLORS: Record<string, string> = {
  winter: 'hsl(210, 70%, 55%)',
  spring: 'hsl(120, 50%, 50%)',
  summer: 'hsl(40, 80%, 55%)',
  fall: 'hsl(25, 70%, 50%)',
};

function getSeason(month: number): string {
  if (month <= 2 || month === 12) return 'winter';
  if (month <= 5) return 'spring';
  if (month <= 8) return 'summer';
  return 'fall';
}

function pearsonCorrelation(xs: number[], ys: number[]): { r: number; rSquared: number; slope: number; intercept: number } {
  const n = xs.length;
  if (n < 3) return { r: 0, rSquared: 0, slope: 0, intercept: 0 };
  const meanX = xs.reduce((s, v) => s + v, 0) / n;
  const meanY = ys.reduce((s, v) => s + v, 0) / n;
  let num = 0, denX = 0, denY = 0;
  for (let i = 0; i < n; i++) {
    const dx = xs[i] - meanX;
    const dy = ys[i] - meanY;
    num += dx * dy;
    denX += dx * dx;
    denY += dy * dy;
  }
  const r = denX > 0 && denY > 0 ? num / Math.sqrt(denX * denY) : 0;
  const slope = denX > 0 ? num / denX : 0;
  const intercept = meanY - slope * meanX;
  return { r, rSquared: r * r, slope, intercept };
}

export function DataExplorerPanel() {
  const [xField, setXField] = useState<FieldKey>('ail_mw');
  const [yField, setYField] = useState<FieldKey>('pool_price');
  const [chartType, setChartType] = useState<ChartType>('scatter');
  const [colorBy, setColorBy] = useState<ColorBy>('none');
  const [aggregation, setAggregation] = useState<Aggregation>('raw');
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const fields = new Set([xField, yField, 'timestamp']);
      const selectStr = Array.from(fields).join(', ');

      // For raw, sample randomly using offset trick; for aggregated, fetch more
      const limit = aggregation === 'raw' ? 2000 : 5000;

      const { data: result, error } = await supabase
        .from('aeso_training_data')
        .select(selectStr)
        .not(xField, 'is', null)
        .not(yField, 'is', null)
        .order('timestamp', { ascending: true })
        .limit(limit);

      if (error) throw error;

      // For raw scatter, subsample to 2000
      let processed = result || [];
      if (aggregation === 'raw' && processed.length > 2000) {
        const step = Math.floor(processed.length / 2000);
        processed = processed.filter((_: any, i: number) => i % step === 0);
      }

      setData(processed.map((d: any) => ({
        x: d[xField],
        y: d[yField],
        timestamp: d.timestamp,
        season: getSeason(new Date(d.timestamp).getMonth() + 1),
        hour: new Date(d.timestamp).getHours(),
        month: new Date(d.timestamp).getMonth() + 1,
      })));
    } catch (err) {
      console.error('Data Explorer fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [xField, yField, aggregation]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const xLabel = FIELDS.find(f => f.key === xField)?.label || xField;
  const yLabel = FIELDS.find(f => f.key === yField)?.label || yField;
  const xUnit = FIELDS.find(f => f.key === xField)?.unit || '';
  const yUnit = FIELDS.find(f => f.key === yField)?.unit || '';

  // Stats
  const stats = useMemo(() => {
    if (data.length < 3) return null;
    const xs = data.map(d => d.x);
    const ys = data.map(d => d.y);
    return pearsonCorrelation(xs, ys);
  }, [data]);

  // Histogram data (for Y field)
  const histogramData = useMemo(() => {
    if (chartType !== 'histogram' || data.length === 0) return [];
    const values = data.map(d => d.y);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const binCount = 30;
    const binWidth = (max - min) / binCount || 1;
    const bins = Array.from({ length: binCount }, (_, i) => ({
      range: `${(min + i * binWidth).toFixed(0)}`,
      count: 0,
      start: min + i * binWidth,
    }));
    for (const v of values) {
      const idx = Math.min(Math.floor((v - min) / binWidth), binCount - 1);
      if (idx >= 0 && idx < binCount) bins[idx].count++;
    }
    return bins;
  }, [data, chartType]);

  return (
    <div className="space-y-4">
      {/* Controls */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Search className="w-4 h-4 text-primary" />
            <CardTitle className="text-base">Interactive Data Explorer</CardTitle>
          </div>
          <CardDescription className="text-xs">
            Explore relationships between variables from {data.length.toLocaleString()} real AESO records
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <Label className="text-xs">X Axis</Label>
              <Select value={xField} onValueChange={(v) => setXField(v as FieldKey)}>
                <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {FIELDS.map(f => <SelectItem key={f.key} value={f.key}>{f.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Y Axis</Label>
              <Select value={yField} onValueChange={(v) => setYField(v as FieldKey)}>
                <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {FIELDS.map(f => <SelectItem key={f.key} value={f.key}>{f.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Chart Type</Label>
              <Select value={chartType} onValueChange={(v) => setChartType(v as ChartType)}>
                <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="scatter">Scatter Plot</SelectItem>
                  <SelectItem value="line">Line Chart</SelectItem>
                  <SelectItem value="histogram">Histogram</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Color By</Label>
              <Select value={colorBy} onValueChange={(v) => setColorBy(v as ColorBy)}>
                <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  <SelectItem value="season">Season</SelectItem>
                  <SelectItem value="hour">Hour of Day</SelectItem>
                  <SelectItem value="month">Month</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <div className="flex items-center justify-center p-8">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <>
          {/* Statistics Panel */}
          {stats && chartType !== 'histogram' && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <div className="p-2.5 rounded-lg border border-border bg-card text-center">
                <p className="text-[10px] text-muted-foreground uppercase">Pearson r</p>
                <p className="text-sm font-bold font-mono text-foreground">{stats.r.toFixed(3)}</p>
              </div>
              <div className="p-2.5 rounded-lg border border-border bg-card text-center">
                <p className="text-[10px] text-muted-foreground uppercase">R²</p>
                <p className="text-sm font-bold font-mono text-foreground">{stats.rSquared.toFixed(3)}</p>
              </div>
              <div className="p-2.5 rounded-lg border border-border bg-card text-center">
                <p className="text-[10px] text-muted-foreground uppercase">Slope</p>
                <p className="text-sm font-bold font-mono text-foreground">{stats.slope.toFixed(4)}</p>
              </div>
              <div className="p-2.5 rounded-lg border border-border bg-card text-center">
                <p className="text-[10px] text-muted-foreground uppercase">Intercept</p>
                <p className="text-sm font-bold font-mono text-foreground">{stats.intercept.toFixed(2)}</p>
              </div>
            </div>
          )}

          {/* Chart */}
          <Card>
            <CardContent className="pt-4">
              <ResponsiveContainer width="100%" height={350}>
                {chartType === 'scatter' ? (
                  <ScatterChart>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis dataKey="x" name={xLabel} tick={{ fontSize: 10 }} label={{ value: `${xLabel} (${xUnit})`, position: 'insideBottom', offset: -5, style: { fontSize: 10 } }} />
                    <YAxis dataKey="y" name={yLabel} tick={{ fontSize: 10 }} label={{ value: `${yLabel} (${yUnit})`, angle: -90, position: 'insideLeft', style: { fontSize: 10 } }} />
                    <ZAxis range={[8, 8]} />
                    <Tooltip formatter={(v: number, name: string) => [v.toFixed(2), name]} />
                    {colorBy === 'season' ? (
                      Object.entries(SEASON_COLORS).map(([season, color]) => (
                        <Scatter key={season} name={season} data={data.filter(d => d.season === season)} fill={color} fillOpacity={0.4} />
                      ))
                    ) : (
                      <Scatter data={data} fill="hsl(220, 70%, 55%)" fillOpacity={0.3} />
                    )}
                  </ScatterChart>
                ) : chartType === 'histogram' ? (
                  <BarChart data={histogramData}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis dataKey="range" tick={{ fontSize: 9 }} label={{ value: `${yLabel} (${yUnit})`, position: 'insideBottom', offset: -5, style: { fontSize: 10 } }} />
                    <YAxis tick={{ fontSize: 10 }} label={{ value: 'Count', angle: -90, position: 'insideLeft', style: { fontSize: 10 } }} />
                    <Tooltip />
                    <Bar dataKey="count" fill="hsl(220, 70%, 55%)" radius={[2, 2, 0, 0]} />
                  </BarChart>
                ) : (
                  <LineChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis dataKey="x" tick={{ fontSize: 10 }} label={{ value: `${xLabel} (${xUnit})`, position: 'insideBottom', offset: -5, style: { fontSize: 10 } }} />
                    <YAxis tick={{ fontSize: 10 }} label={{ value: `${yLabel} (${yUnit})`, angle: -90, position: 'insideLeft', style: { fontSize: 10 } }} />
                    <Tooltip />
                    <Line type="monotone" dataKey="y" stroke="hsl(220, 70%, 55%)" dot={false} strokeWidth={1.5} />
                  </LineChart>
                )}
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Legend for color-by */}
          {colorBy === 'season' && (
            <div className="flex flex-wrap gap-3 px-2">
              {Object.entries(SEASON_COLORS).map(([season, color]) => (
                <div key={season} className="flex items-center gap-1.5 text-xs">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
                  <span className="capitalize text-muted-foreground">{season}</span>
                </div>
              ))}
            </div>
          )}

          <p className="text-xs text-muted-foreground px-1">
            Data sampled to {data.length.toLocaleString()} points for performance. All values from real AESO training data.
          </p>
        </>
      )}
    </div>
  );
}

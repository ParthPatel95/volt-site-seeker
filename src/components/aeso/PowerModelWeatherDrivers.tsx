import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, Thermometer, Wind, Flame, Calendar } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  ScatterChart, Scatter, ZAxis, LineChart, Line, Legend,
} from 'recharts';

interface WeatherRecord {
  timestamp: string;
  pool_price: number;
  ail_mw: number | null;
  temperature_edmonton: number | null;
  wind_speed: number | null;
  gas_price_aeco: number | null;
}

interface Props {
  selectedYear: number;
}

export function PowerModelWeatherDrivers({ selectedYear }: Props) {
  const [data, setData] = useState<WeatherRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const loadWeatherData = async () => {
    setLoading(true);
    try {
      const startDate = `${selectedYear}-01-01`;
      const endDate = `${selectedYear}-12-31T23:59:59`;
      let allData: WeatherRecord[] = [];
      let offset = 0;
      const batchSize = 1000;

      while (true) {
        const { data: batch, error } = await supabase
          .from('aeso_training_data')
          .select('timestamp, pool_price, ail_mw, temperature_edmonton, wind_speed, gas_price_aeco')
          .gte('timestamp', startDate)
          .lte('timestamp', endDate)
          .not('ail_mw', 'is', null)
          .order('timestamp', { ascending: true })
          .range(offset, offset + batchSize - 1);

        if (error) throw error;
        if (!batch || batch.length === 0) break;
        allData = allData.concat(batch as WeatherRecord[]);
        if (batch.length < batchSize) break;
        offset += batchSize;
      }

      setData(allData);
      setLoaded(true);
    } catch (err) {
      console.error('Failed to load weather data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Auto-load on mount
  useEffect(() => {
    if (!loaded) loadWeatherData();
  }, [selectedYear]);

  // 1. Temperature-Cost Analysis
  const tempAnalysis = useMemo(() => {
    const buckets = [
      { min: -40, max: -25, label: '<-25°C' },
      { min: -25, max: -15, label: '-25 to -15°C' },
      { min: -15, max: -5, label: '-15 to -5°C' },
      { min: -5, max: 5, label: '-5 to 5°C' },
      { min: 5, max: 15, label: '5 to 15°C' },
      { min: 15, max: 25, label: '15 to 25°C' },
      { min: 25, max: 45, label: '>25°C' },
    ];
    return buckets.map(b => {
      const matching = data.filter(d => d.temperature_edmonton !== null && d.temperature_edmonton >= b.min && d.temperature_edmonton < b.max);
      const avgPrice = matching.length > 0 ? matching.reduce((s, d) => s + d.pool_price, 0) / matching.length : 0;
      const avgDemand = matching.length > 0 ? matching.reduce((s, d) => s + (d.ail_mw || 0), 0) / matching.length : 0;
      return { range: b.label, avgPrice: Math.round(avgPrice * 100) / 100, hours: matching.length, avgDemand: Math.round(avgDemand) };
    }).filter(b => b.hours > 0);
  }, [data]);

  // 2. Wind Speed vs Pool Price (downsampled scatter)
  const windScatter = useMemo(() => {
    const valid = data.filter(d => d.wind_speed !== null && d.pool_price >= 0 && d.pool_price < 500);
    const step = Math.max(1, Math.floor(valid.length / 400));
    return valid.filter((_, i) => i % step === 0).map(d => ({
      wind: Math.round((d.wind_speed || 0) * 10) / 10,
      price: Math.round(d.pool_price * 100) / 100,
    }));
  }, [data]);

  // 3. Gas Price vs Pool Price (monthly averages)
  const gasCorrelation = useMemo(() => {
    const monthMap = new Map<string, { gasPrices: number[]; poolPrices: number[] }>();
    for (const d of data) {
      if (d.gas_price_aeco === null) continue;
      const key = d.timestamp.slice(0, 7); // YYYY-MM
      if (!monthMap.has(key)) monthMap.set(key, { gasPrices: [], poolPrices: [] });
      const m = monthMap.get(key)!;
      m.gasPrices.push(d.gas_price_aeco);
      m.poolPrices.push(d.pool_price);
    }
    const result = Array.from(monthMap.entries()).map(([month, v]) => ({
      month: month.slice(5), // MM
      avgGas: Math.round(v.gasPrices.reduce((s, p) => s + p, 0) / v.gasPrices.length * 100) / 100,
      avgPool: Math.round(v.poolPrices.reduce((s, p) => s + p, 0) / v.poolPrices.length * 100) / 100,
    })).sort((a, b) => a.month.localeCompare(b.month));

    // Pearson correlation
    if (result.length >= 3) {
      const gas = result.map(r => r.avgGas);
      const pool = result.map(r => r.avgPool);
      const n = gas.length;
      const meanG = gas.reduce((s, v) => s + v, 0) / n;
      const meanP = pool.reduce((s, v) => s + v, 0) / n;
      let num = 0, denG = 0, denP = 0;
      for (let i = 0; i < n; i++) {
        num += (gas[i] - meanG) * (pool[i] - meanP);
        denG += (gas[i] - meanG) ** 2;
        denP += (pool[i] - meanP) ** 2;
      }
      const r = denG > 0 && denP > 0 ? num / Math.sqrt(denG * denP) : 0;
      return { data: result, correlation: Math.round(r * 100) / 100 };
    }
    return { data: result, correlation: 0 };
  }, [data]);

  // 4. Seasonal Cost Profile (hour-of-day averages)
  const hourlyProfile = useMemo(() => {
    const hours = Array.from({ length: 24 }, () => ({ sum: 0, count: 0 }));
    for (const d of data) {
      const h = new Date(d.timestamp).getHours();
      hours[h].sum += d.pool_price;
      hours[h].count++;
    }
    return hours.map((h, i) => ({
      hour: `${String(i).padStart(2, '0')}:00`,
      avgPrice: h.count > 0 ? Math.round(h.sum / h.count * 100) / 100 : 0,
      hours: h.count,
    }));
  }, [data]);

  if (!loaded && !loading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Button onClick={loadWeatherData} disabled={loading}>
            Load Weather & Driver Data
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8 text-center text-muted-foreground">
          <Loader2 className="w-8 h-8 mx-auto mb-3 animate-spin opacity-40" />
          <p className="text-sm">Loading weather correlation data...</p>
        </CardContent>
      </Card>
    );
  }

  const MONTH_LABELS: Record<string, string> = {
    '01': 'Jan', '02': 'Feb', '03': 'Mar', '04': 'Apr', '05': 'May', '06': 'Jun',
    '07': 'Jul', '08': 'Aug', '09': 'Sep', '10': 'Oct', '11': 'Nov', '12': 'Dec',
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Temperature-Cost Analysis */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <Thermometer className="w-4 h-4 text-red-500" />
            <CardTitle className="text-sm">Temperature vs Pool Price</CardTitle>
          </div>
          <CardDescription className="text-xs">
            Average pool price by temperature range — {data.filter(d => d.temperature_edmonton !== null).length.toLocaleString()} hours
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={tempAnalysis}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis dataKey="range" tick={{ fontSize: 9 }} />
              <YAxis tick={{ fontSize: 11 }} label={{ value: '$/MWh', angle: -90, position: 'insideLeft', style: { fontSize: 10 } }} />
              <Tooltip
                formatter={(v: number, name: string) => [
                  name === 'avgPrice' ? `$${v.toFixed(2)}/MWh` : `${v.toLocaleString()} MW`,
                  name === 'avgPrice' ? 'Avg Pool Price' : 'Avg Demand'
                ]}
              />
              <Bar dataKey="avgPrice" fill="hsl(0, 65%, 55%)" name="Avg Pool Price" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
          <div className="mt-2 text-[10px] text-muted-foreground flex items-center gap-1">
            <Badge variant="outline" className="text-[9px]">Source: aeso_training_data</Badge>
            Extreme cold (&lt;-25°C) correlates with highest pool prices
          </div>
        </CardContent>
      </Card>

      {/* Wind Speed vs Pool Price */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <Wind className="w-4 h-4 text-blue-500" />
            <CardTitle className="text-sm">Wind Speed vs Pool Price</CardTitle>
          </div>
          <CardDescription className="text-xs">
            Higher wind generation tends to suppress pool prices — {windScatter.length} sampled points
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={260}>
            <ScatterChart>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis dataKey="wind" name="Wind Speed" unit=" km/h" tick={{ fontSize: 10 }} />
              <YAxis dataKey="price" name="Pool Price" unit=" $/MWh" tick={{ fontSize: 10 }} domain={[0, 'auto']} />
              <ZAxis range={[8, 8]} />
              <Tooltip
                formatter={(v: number, name: string) => [
                  name === 'Wind Speed' ? `${v} km/h` : `$${v}/MWh`,
                  name
                ]}
              />
              <Scatter data={windScatter} fill="hsl(220, 70%, 55%)" fillOpacity={0.4} />
            </ScatterChart>
          </ResponsiveContainer>
          <div className="mt-2 text-[10px] text-muted-foreground">
            <Badge variant="outline" className="text-[9px]">Source: aeso_training_data</Badge>
            {' '}Wind generation reduces marginal cost by displacing gas-fired units
          </div>
        </CardContent>
      </Card>

      {/* Gas Price vs Pool Price */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-amber-500" />
            <CardTitle className="text-sm">Natural Gas (AECO) vs Pool Price</CardTitle>
            <Badge variant={gasCorrelation.correlation > 0.5 ? 'default' : 'secondary'} className="text-[9px] px-1.5 h-4">
              r = {gasCorrelation.correlation.toFixed(2)}
            </Badge>
          </div>
          <CardDescription className="text-xs">
            Monthly average gas price vs pool price — gas sets marginal price most hours
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={gasCorrelation.data}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis dataKey="month" tickFormatter={m => MONTH_LABELS[m] || m} tick={{ fontSize: 10 }} />
              <YAxis yAxisId="gas" tick={{ fontSize: 10 }} label={{ value: '$/GJ', angle: -90, position: 'insideLeft', style: { fontSize: 10 } }} />
              <YAxis yAxisId="pool" orientation="right" tick={{ fontSize: 10 }} label={{ value: '$/MWh', angle: 90, position: 'insideRight', style: { fontSize: 10 } }} />
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Line yAxisId="gas" type="monotone" dataKey="avgGas" name="AECO Gas ($/GJ)" stroke="hsl(35, 80%, 55%)" strokeWidth={2} dot={{ r: 3 }} />
              <Line yAxisId="pool" type="monotone" dataKey="avgPool" name="Pool Price ($/MWh)" stroke="hsl(220, 70%, 55%)" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
          <div className="mt-2 text-[10px] text-muted-foreground">
            <Badge variant="outline" className="text-[9px]">Source: aeso_training_data gas_price_aeco</Badge>
            {' '}Pearson correlation: <strong>{gasCorrelation.correlation.toFixed(2)}</strong>
            {gasCorrelation.correlation > 0.5 && ' — strong positive correlation'}
          </div>
        </CardContent>
      </Card>

      {/* Hourly Price Profile */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-purple-500" />
            <CardTitle className="text-sm">Hourly Price Profile</CardTitle>
          </div>
          <CardDescription className="text-xs">
            Average pool price by hour of day — identifies optimal operating windows
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={hourlyProfile}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis dataKey="hour" tick={{ fontSize: 9 }} interval={1} />
              <YAxis tick={{ fontSize: 10 }} label={{ value: '$/MWh', angle: -90, position: 'insideLeft', style: { fontSize: 10 } }} />
              <Tooltip formatter={(v: number) => [`$${v.toFixed(2)}/MWh`, 'Avg Price']} />
              <Bar dataKey="avgPrice" fill="hsl(270, 60%, 55%)" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
          <div className="mt-2 text-[10px] text-muted-foreground">
            <Badge variant="outline" className="text-[9px]">Source: aeso_training_data</Badge>
            {' '}Off-peak hours (01:00–06:00) show lowest average prices
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

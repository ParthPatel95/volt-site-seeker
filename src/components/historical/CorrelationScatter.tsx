import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Target } from 'lucide-react';
import { HourlyDataPoint } from '@/services/historicalDataService';
import { calculateCorrelation } from '@/utils/aggregations';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Props {
  data: HourlyDataPoint[];
  unit: 'mwh' | 'kwh';
}

export function CorrelationScatter({ data, unit }: Props) {
  const [mode, setMode] = React.useState<'ail' | 'generation'>('ail');

  const { chartData, correlation } = useMemo(() => {
    // Downsample for performance (max 2000 points)
    const step = Math.max(1, Math.ceil(data.length / 2000));
    const sampled = data.filter((_, i) => i % step === 0);

    const prices = sampled.map(d => d.price);
    const xValues = mode === 'ail' ? sampled.map(d => d.ail) : sampled.map(d => d.generation);
    const correlation = calculateCorrelation(prices, xValues);

    const chartData = sampled.map(d => ({
      x: mode === 'ail' ? d.ail : d.generation,
      y: unit === 'kwh' ? d.price * 0.1 : d.price,
    }));

    return { chartData, correlation };
  }, [data, mode, unit]);

  const formatPrice = (value: number) => {
    if (unit === 'kwh') {
      return `${value.toFixed(2)}¢`;
    }
    return `$${value.toFixed(2)}`;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5 text-red-600" />
              Price Correlation
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-1">
              Pearson r: {correlation.toFixed(3)}
            </p>
          </div>
          <Select value={mode} onValueChange={(v: any) => setMode(v)}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ail">Price vs AIL</SelectItem>
              <SelectItem value="generation">Price vs Generation</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="x"
                name={mode === 'ail' ? 'AIL' : 'Generation'}
                label={{
                  value: `${mode === 'ail' ? 'AIL' : 'Generation'} (MW)`,
                  position: 'insideBottom',
                  offset: -5,
                }}
              />
              <YAxis
                dataKey="y"
                name="Price"
                label={{
                  value: unit === 'kwh' ? 'Price (¢/kWh)' : 'Price ($/MWh)',
                  angle: -90,
                  position: 'insideLeft',
                }}
              />
              <Tooltip
                formatter={(value: any, name: string) => {
                  if (name === 'Price') return [formatPrice(value), name];
                  return [`${Math.round(value)} MW`, name];
                }}
                contentStyle={{
                  backgroundColor: 'hsl(var(--background))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
              />
              <Scatter
                data={chartData}
                fill="hsl(var(--primary))"
                fillOpacity={0.3}
              />
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

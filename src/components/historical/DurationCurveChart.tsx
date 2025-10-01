import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { BarChart3 } from 'lucide-react';
import { DurationCurvePoint } from '@/utils/aggregations';

interface Props {
  data: DurationCurvePoint[];
  unit: 'mwh' | 'kwh';
}

export function DurationCurveChart({ data, unit }: Props) {
  const formatPrice = (value: number) => {
    if (unit === 'kwh') {
      return `${(value * 0.1).toFixed(2)}¢`;
    }
    return `$${value.toFixed(2)}`;
  };

  // Downsample for performance (every 100th point for large datasets)
  const displayData = data.length > 1000
    ? data.filter((_, i) => i % Math.ceil(data.length / 1000) === 0)
    : data;

  const chartData = displayData.map(d => ({
    percentile: d.percentile.toFixed(1),
    price: unit === 'kwh' ? d.price * 0.1 : d.price,
    hours: d.hours,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-orange-600" />
          Price Duration Curve
        </CardTitle>
        <p className="text-xs text-muted-foreground mt-1">
          Shows prices sorted from highest to lowest
        </p>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="percentile"
                label={{ value: '% of Hours', position: 'insideBottom', offset: -5 }}
              />
              <YAxis
                label={{
                  value: unit === 'kwh' ? 'Price (¢/kWh)' : 'Price ($/MWh)',
                  angle: -90,
                  position: 'insideLeft',
                }}
              />
              <Tooltip
                formatter={(value: any, name: string, props: any) => {
                  if (name === 'price') {
                    return [
                      `${formatPrice(value)} at ${props.payload.percentile}% (${props.payload.hours} hours)`,
                      'Price'
                    ];
                  }
                  return [value, name];
                }}
                contentStyle={{
                  backgroundColor: 'hsl(var(--background))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
              />
              <Line
                type="monotone"
                dataKey="price"
                stroke="hsl(var(--chart-1))"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

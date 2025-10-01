import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { TrendingUp } from 'lucide-react';
import { RollingStatsPoint } from '@/utils/aggregations';

interface Props {
  data: RollingStatsPoint[];
  unit: 'mwh' | 'kwh';
}

export function RollingStatsChart({ data, unit }: Props) {
  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-indigo-600" />
            30-Day Rolling Statistics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Requires at least 30 days of data
          </p>
        </CardContent>
      </Card>
    );
  }

  const formatPrice = (value: number) => {
    if (unit === 'kwh') {
      return `${(value * 0.1).toFixed(2)}¢`;
    }
    return `$${value.toFixed(2)}`;
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const chartData = data.map(d => ({
    date: d.date,
    mean: unit === 'kwh' ? d.rollingMean * 0.1 : d.rollingMean,
    stdev: unit === 'kwh' ? d.rollingStdev * 0.1 : d.rollingStdev,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-indigo-600" />
          30-Day Rolling Statistics
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                tickFormatter={formatDate}
                angle={-45}
                textAnchor="end"
                height={80}
                interval="preserveStartEnd"
              />
              <YAxis
                label={{
                  value: unit === 'kwh' ? 'Price (¢/kWh)' : 'Price ($/MWh)',
                  angle: -90,
                  position: 'insideLeft',
                }}
              />
              <Tooltip
                formatter={(value: any, name: string) => {
                  if (name === 'mean') return [formatPrice(value), '30-Day Mean'];
                  if (name === 'stdev') return [formatPrice(value), '30-Day Std Dev'];
                  return [value, name];
                }}
                labelFormatter={formatDate}
                contentStyle={{
                  backgroundColor: 'hsl(var(--background))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="mean"
                stroke="hsl(var(--chart-1))"
                strokeWidth={2}
                dot={false}
                name="30-Day Mean"
              />
              <Line
                type="monotone"
                dataKey="stdev"
                stroke="hsl(var(--chart-2))"
                strokeWidth={2}
                dot={false}
                strokeDasharray="5 5"
                name="30-Day Std Dev"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

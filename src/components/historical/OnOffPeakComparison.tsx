import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Clock } from 'lucide-react';
import { OnOffPeakStats } from '@/utils/aggregations';

interface Props {
  stats: OnOffPeakStats;
  unit: 'mwh' | 'kwh';
  onPeakStart: number;
  onPeakEnd: number;
}

export function OnOffPeakComparison({ stats, unit, onPeakStart, onPeakEnd }: Props) {
  const formatPrice = (value: number) => {
    if (unit === 'kwh') {
      return `${(value * 0.1).toFixed(2)}¢`;
    }
    return `$${value.toFixed(2)}`;
  };

  const chartData = [
    {
      period: 'On-Peak',
      price: unit === 'kwh' ? stats.onPeakAvg * 0.1 : stats.onPeakAvg,
      hours: stats.onPeakHours,
    },
    {
      period: 'Off-Peak',
      price: unit === 'kwh' ? stats.offPeakAvg * 0.1 : stats.offPeakAvg,
      hours: stats.offPeakHours,
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-amber-600" />
          On-Peak vs Off-Peak Pricing
        </CardTitle>
        <p className="text-xs text-muted-foreground mt-1">
          On-peak hours: {onPeakStart}:00 - {onPeakEnd}:00
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="bg-muted/30 rounded-lg p-4 border border-border">
            <div className="text-xs text-muted-foreground mb-1">On-Peak Average</div>
            <div className="text-2xl font-bold text-orange-600">
              {formatPrice(unit === 'kwh' ? stats.onPeakAvg * 0.1 : stats.onPeakAvg)}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {stats.onPeakHours.toLocaleString()} hours
            </div>
          </div>
          <div className="bg-muted/30 rounded-lg p-4 border border-border">
            <div className="text-xs text-muted-foreground mb-1">Off-Peak Average</div>
            <div className="text-2xl font-bold text-blue-600">
              {formatPrice(unit === 'kwh' ? stats.offPeakAvg * 0.1 : stats.offPeakAvg)}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {stats.offPeakHours.toLocaleString()} hours
            </div>
          </div>
        </div>

        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="period" />
              <YAxis
                label={{
                  value: unit === 'kwh' ? 'Avg Price (¢/kWh)' : 'Avg Price ($/MWh)',
                  angle: -90,
                  position: 'insideLeft',
                }}
              />
              <Tooltip
                formatter={(value: any) => [formatPrice(value), 'Avg Price']}
                contentStyle={{
                  backgroundColor: 'hsl(var(--background))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
              />
              <Bar dataKey="price" fill="hsl(var(--primary))" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

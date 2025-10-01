import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Activity, ZoomIn, ZoomOut } from 'lucide-react';
import { HourlyDataPoint } from '@/services/historicalDataService';
import { DailyAggregation } from '@/utils/aggregations';
import { Button } from '@/components/ui/button';

interface Props {
  hourlyData?: HourlyDataPoint[];
  dailyData?: DailyAggregation[];
  granularity: 'hourly' | 'daily';
  unit: 'mwh' | 'kwh';
  showAIL: boolean;
  showGeneration: boolean;
}

export function TimeSeriesChart({ hourlyData, dailyData, granularity, unit, showAIL, showGeneration }: Props) {
  const [zoomRange, setZoomRange] = useState<{ start: number; end: number } | null>(null);

  const formatPrice = (value: number) => {
    if (unit === 'kwh') {
      return `${(value * 0.1).toFixed(2)}¢`;
    }
    return `$${value.toFixed(2)}`;
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    if (granularity === 'hourly') {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit' });
    }
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  let chartData: any[] = [];

  if (granularity === 'hourly' && hourlyData) {
    chartData = hourlyData.map(d => ({
      timestamp: d.ts,
      price: unit === 'kwh' ? d.price * 0.1 : d.price,
      generation: d.generation,
      ail: d.ail,
    }));
  } else if (granularity === 'daily' && dailyData) {
    chartData = dailyData.map(d => ({
      timestamp: d.date,
      price: unit === 'kwh' ? d.avgPrice * 0.1 : d.avgPrice,
      generation: d.avgGeneration,
      ail: d.avgAIL,
    }));
  }

  // Apply zoom if set
  const displayData = zoomRange
    ? chartData.slice(zoomRange.start, zoomRange.end)
    : chartData;

  const handleResetZoom = () => {
    setZoomRange(null);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-green-600" />
            Price Time Series ({granularity === 'hourly' ? 'Hourly' : 'Daily'})
          </CardTitle>
          {zoomRange && (
            <Button variant="outline" size="sm" onClick={handleResetZoom}>
              <ZoomOut className="w-4 h-4 mr-2" />
              Reset Zoom
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-96">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={displayData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="timestamp"
                tickFormatter={formatDate}
                angle={-45}
                textAnchor="end"
                height={80}
                interval="preserveStartEnd"
              />
              <YAxis
                yAxisId="price"
                label={{
                  value: unit === 'kwh' ? 'Price (¢/kWh)' : 'Price ($/MWh)',
                  angle: -90,
                  position: 'insideLeft',
                }}
              />
              {(showAIL || showGeneration) && (
                <YAxis
                  yAxisId="power"
                  orientation="right"
                  label={{
                    value: 'Power (MW)',
                    angle: 90,
                    position: 'insideRight',
                  }}
                />
              )}
              <Tooltip
                formatter={(value: any, name: string) => {
                  if (name === 'price') return [formatPrice(value), 'Price'];
                  if (name === 'generation') return [`${Math.round(value)} MW`, 'Generation'];
                  if (name === 'ail') return [`${Math.round(value)} MW`, 'AIL'];
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
                yAxisId="price"
                type="monotone"
                dataKey="price"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                dot={false}
                name="Price"
              />
              {showAIL && (
                <Line
                  yAxisId="power"
                  type="monotone"
                  dataKey="ail"
                  stroke="hsl(var(--chart-2))"
                  strokeWidth={2}
                  dot={false}
                  strokeDasharray="5 5"
                  name="AIL"
                />
              )}
              {showGeneration && (
                <Line
                  yAxisId="power"
                  type="monotone"
                  dataKey="generation"
                  stroke="hsl(var(--chart-3))"
                  strokeWidth={2}
                  dot={false}
                  strokeDasharray="3 3"
                  name="Generation"
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

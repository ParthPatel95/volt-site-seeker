import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Activity, ZoomOut } from 'lucide-react';
import { HourlyDataPoint } from '@/services/historicalDataService';
import { DailyAggregation } from '@/utils/aggregations';
import { Button } from '@/components/ui/button';

interface Props {
  hourlyData?: HourlyDataPoint[];
  dailyData?: DailyAggregation[];
  originalHourlyData?: HourlyDataPoint[];
  originalDailyData?: DailyAggregation[];
  granularity: 'hourly' | 'daily';
  unit: 'mwh' | 'kwh';
  showAIL: boolean;
  showGeneration: boolean;
  showComparison?: boolean;
}

export function TimeSeriesChart({ 
  hourlyData, 
  dailyData, 
  originalHourlyData,
  originalDailyData,
  granularity, 
  unit, 
  showAIL, 
  showGeneration,
  showComparison 
}: Props) {
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
    chartData = hourlyData.map((d, index) => {
      const baseData: any = {
        timestamp: d.ts,
        price: unit === 'kwh' ? d.price * 0.1 : d.price,
        generation: d.generation,
        ail: d.ail,
      };
      
      if (showComparison && originalHourlyData && originalHourlyData[index]) {
        baseData.originalPrice = unit === 'kwh' ? originalHourlyData[index].price * 0.1 : originalHourlyData[index].price;
      }
      
      return baseData;
    });
  } else if (granularity === 'daily' && dailyData) {
    chartData = dailyData.map((d, index) => {
      const baseData: any = {
        timestamp: d.date,
        price: unit === 'kwh' ? d.avgPrice * 0.1 : d.avgPrice,
        generation: d.avgGeneration,
        ail: d.avgAIL,
      };
      
      if (showComparison && originalDailyData && originalDailyData[index]) {
        baseData.originalPrice = unit === 'kwh' ? originalDailyData[index].avgPrice * 0.1 : originalDailyData[index].avgPrice;
      }
      
      return baseData;
    });
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
            {showComparison && (
              <span className="ml-2 text-xs font-normal text-green-600 bg-green-100 dark:bg-green-900/30 px-2 py-0.5 rounded">
                With Credits
              </span>
            )}
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
                  if (name === 'price') return [formatPrice(value), showComparison ? 'With Credits' : 'Price'];
                  if (name === 'originalPrice') return [formatPrice(value), 'Original Price'];
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
              {showComparison && (
                <Line
                  yAxisId="price"
                  type="monotone"
                  dataKey="originalPrice"
                  stroke="hsl(var(--muted-foreground))"
                  strokeWidth={1.5}
                  strokeDasharray="5 5"
                  dot={false}
                  name="Original Price"
                />
              )}
              <Line
                yAxisId="price"
                type="monotone"
                dataKey="price"
                stroke={showComparison ? "hsl(142, 76%, 36%)" : "hsl(var(--primary))"}
                strokeWidth={2}
                dot={false}
                name={showComparison ? "With Credits" : "Price"}
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
                  connectNulls
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
                  connectNulls
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

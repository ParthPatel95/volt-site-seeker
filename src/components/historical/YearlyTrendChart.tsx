import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { TrendingUp } from 'lucide-react';
import { YearlyAggregation } from '@/utils/aggregations';

interface Props {
  data: YearlyAggregation[];
  unit: 'mwh' | 'kwh';
  originalData?: YearlyAggregation[];
  showComparison?: boolean;
}

export function YearlyTrendChart({ data, unit, originalData, showComparison }: Props) {
  const formatPrice = (value: number) => {
    if (unit === 'kwh') {
      return `${(value * 0.1).toFixed(2)}¢`;
    }
    return `$${value.toFixed(2)}`;
  };

  const chartData = data.map((d, index) => {
    const baseData: any = {
      year: d.year.toString(),
      price: unit === 'kwh' ? d.avgPrice * 0.1 : d.avgPrice,
    };
    
    if (showComparison && originalData && originalData[index]) {
      baseData.originalPrice = unit === 'kwh' ? originalData[index].avgPrice * 0.1 : originalData[index].avgPrice;
    }
    
    return baseData;
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-blue-600" />
          Yearly Price Trend
          {showComparison && (
            <span className="ml-2 text-xs font-normal text-green-600 bg-green-100 dark:bg-green-900/30 px-2 py-0.5 rounded">
              With Credits
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="year"
                label={{ value: 'Year', position: 'insideBottom', offset: -5 }}
              />
              <YAxis
                label={{
                  value: unit === 'kwh' ? 'Price (¢/kWh)' : 'Price ($/MWh)',
                  angle: -90,
                  position: 'insideLeft',
                }}
              />
              <Tooltip
                formatter={(value: any, name: string) => [
                  formatPrice(value), 
                  name === 'originalPrice' ? 'Original Price' : 'Effective Price'
                ]}
                contentStyle={{
                  backgroundColor: 'hsl(var(--background))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
              />
              {showComparison && <Legend />}
              {showComparison && (
                <Line
                  type="monotone"
                  dataKey="originalPrice"
                  stroke="hsl(var(--muted-foreground))"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={{ r: 3 }}
                  name="Original Price"
                />
              )}
              <Line
                type="monotone"
                dataKey="price"
                stroke={showComparison ? "hsl(142, 76%, 36%)" : "hsl(var(--primary))"}
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
                name={showComparison ? "With Credits" : "Avg Price"}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

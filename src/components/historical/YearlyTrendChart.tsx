import React, { useMemo } from 'react';
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

  // Create year-based lookup map for safer matching
  const originalYearMap = useMemo(() => {
    if (!originalData) return new Map<number, YearlyAggregation>();
    return new Map(originalData.map(d => [d.year, d]));
  }, [originalData]);

  const chartData = data.map((d) => {
    const baseData: any = {
      year: d.year.toString(),
      price: unit === 'kwh' ? d.avgPrice * 0.1 : d.avgPrice,
    };
    
    // Use year-based lookup for safer matching
    if (showComparison) {
      const original = originalYearMap.get(d.year);
      if (original) {
        baseData.originalPrice = unit === 'kwh' ? original.avgPrice * 0.1 : original.avgPrice;
      }
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

import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine } from 'recharts';
import { TrendingDown } from 'lucide-react';

interface Props {
  historicalData: { hour: string; avg_pool_price: number }[];
  breakEvenPoolPriceCAD: number;
}

export function PriceDurationCurve({ historicalData, breakEvenPoolPriceCAD }: Props) {
  const { data, profitablePercent } = useMemo(() => {
    const sorted = [...historicalData].sort((a, b) => a.avg_pool_price - b.avg_pool_price);
    const total = sorted.length;

    // Sample to ~200 points for performance
    const step = Math.max(1, Math.floor(total / 200));
    const data = sorted
      .filter((_, i) => i % step === 0 || i === total - 1)
      .map((record, idx) => ({
        percentile: ((sorted.indexOf(record)) / total) * 100,
        price: record.avg_pool_price,
      }));

    const belowBreakEven = sorted.filter(r => r.avg_pool_price <= breakEvenPoolPriceCAD).length;
    const profitablePercent = (belowBreakEven / total) * 100;

    return { data, profitablePercent };
  }, [historicalData, breakEvenPoolPriceCAD]);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <TrendingDown className="w-4 h-4" />
          Price Duration Curve
        </CardTitle>
        <CardDescription>
          {profitablePercent.toFixed(1)}% of hours are below break-even (${breakEvenPoolPriceCAD.toFixed(0)}/MWh) — profitable for mining
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis
                dataKey="percentile"
                tick={{ fontSize: 11 }}
                label={{ value: '% of Hours', position: 'insideBottom', offset: -5 }}
                tickFormatter={(v) => `${v.toFixed(0)}%`}
              />
              <YAxis
                tick={{ fontSize: 11 }}
                label={{ value: '$/MWh (CAD)', angle: -90, position: 'insideLeft' }}
                domain={[0, 'auto']}
              />
              <Tooltip
                contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}
                formatter={(value: number) => [`$${value.toFixed(2)}/MWh`, 'Pool Price']}
                labelFormatter={(label) => `${Number(label).toFixed(1)}% of hours`}
              />
              <defs>
                <linearGradient id="priceGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <Area type="monotone" dataKey="price" stroke="hsl(var(--primary))" fill="url(#priceGrad)" strokeWidth={2} />
              <ReferenceLine
                y={breakEvenPoolPriceCAD}
                stroke="hsl(var(--destructive))"
                strokeWidth={2}
                strokeDasharray="6 3"
                label={{ value: `Break-even $${breakEvenPoolPriceCAD.toFixed(0)}`, position: 'right', fontSize: 11, fill: 'hsl(var(--destructive))' }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

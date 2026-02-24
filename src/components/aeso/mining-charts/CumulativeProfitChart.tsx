import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine } from 'recharts';
import { TrendingUp } from 'lucide-react';

interface MonthlyResult {
  month: string;
  netProfit: number;
}

interface Props {
  monthlyResults: MonthlyResult[];
}

export function CumulativeProfitChart({ monthlyResults }: Props) {
  const data = useMemo(() => {
    let cumulative = 0;
    return monthlyResults.map((m) => {
      cumulative += m.netProfit;
      return {
        month: m.month,
        cumulative: Math.round(cumulative),
        monthly: m.netProfit,
      };
    });
  }, [monthlyResults]);

  const finalValue = data[data.length - 1]?.cumulative || 0;
  const isPositive = finalValue >= 0;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <TrendingUp className="w-4 h-4" />
          Cumulative Net Profit
        </CardTitle>
        <CardDescription>
          Profit trajectory over the backtest period — final: ${(finalValue / 1000).toFixed(0)}K USD
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="month" tick={{ fontSize: 10 }} angle={-45} textAnchor="end" height={50} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}K`} />
              <Tooltip
                contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}
                formatter={(value: number, name: string) => [
                  `$${value.toLocaleString()}`,
                  name === 'cumulative' ? 'Cumulative Profit' : 'Monthly Profit',
                ]}
              />
              <ReferenceLine y={0} stroke="hsl(var(--muted-foreground))" strokeDasharray="3 3" />
              <defs>
                <linearGradient id="cumGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={isPositive ? 'hsl(var(--primary))' : 'hsl(var(--destructive))'} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={isPositive ? 'hsl(var(--primary))' : 'hsl(var(--destructive))'} stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <Area
                type="monotone"
                dataKey="cumulative"
                stroke={isPositive ? 'hsl(var(--primary))' : 'hsl(var(--destructive))'}
                fill="url(#cumGrad)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

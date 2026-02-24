import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine } from 'recharts';
import { Activity } from 'lucide-react';
import { BLOCKS_PER_DAY } from '@/constants/mining-data';

interface Props {
  networkHashTH: number;
  blockReward: number;
  minerEfficiency: number;
  poolFee: number;
  cadToUsd: number;
  transmissionAdder: number;
  currentBtcPrice: number;
}

export function BreakEvenSensitivity({
  networkHashTH, blockReward, minerEfficiency, poolFee, cadToUsd, transmissionAdder, currentBtcPrice,
}: Props) {
  const data = useMemo(() => {
    const TH_PER_MW = 1_000_000 / minerEfficiency;
    const dailyBtcPerTH = (BLOCKS_PER_DAY * blockReward) / networkHashTH;
    const hourlyBtcPerTH = dailyBtcPerTH / 24;

    return Array.from({ length: 16 }, (_, i) => {
      const btcPrice = 50_000 + i * 10_000;
      const hourlyRevenuePerMW = hourlyBtcPerTH * TH_PER_MW * btcPrice;
      const grossRevenue = hourlyRevenuePerMW * (1 - poolFee / 100);
      const breakEvenCAD = (grossRevenue / cadToUsd) - transmissionAdder;

      return {
        btcPrice: btcPrice / 1000,
        btcPriceLabel: `$${(btcPrice / 1000).toFixed(0)}K`,
        breakEven: Math.round(breakEvenCAD),
      };
    });
  }, [networkHashTH, blockReward, minerEfficiency, poolFee, cadToUsd, transmissionAdder]);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Activity className="w-4 h-4" />
          Break-Even Sensitivity vs. BTC Price
        </CardTitle>
        <CardDescription>
          How the maximum profitable AESO pool price changes across BTC price scenarios
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis
                dataKey="btcPrice"
                tick={{ fontSize: 11 }}
                label={{ value: 'BTC Price ($K USD)', position: 'insideBottom', offset: -5 }}
                tickFormatter={(v) => `$${v}K`}
              />
              <YAxis
                tick={{ fontSize: 11 }}
                label={{ value: 'Break-even ($/MWh CAD)', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip
                contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}
                formatter={(value: number) => [`$${value}/MWh CAD`, 'Break-even Price']}
                labelFormatter={(label) => `BTC @ $${label}K`}
              />
              <Line type="monotone" dataKey="breakEven" stroke="hsl(var(--primary))" strokeWidth={3} dot={{ r: 3 }} />
              <ReferenceLine
                x={currentBtcPrice / 1000}
                stroke="hsl(var(--chart-4))"
                strokeDasharray="4 4"
                label={{ value: 'Current', position: 'top', fontSize: 10, fill: 'hsl(var(--chart-4))' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

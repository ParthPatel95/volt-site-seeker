import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RateSourceBadge } from '@/components/ui/rate-source-badge';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
import type { MonthlyResult } from '@/hooks/usePowerModelCalculator';
import type { FacilityParams } from '@/hooks/usePowerModelCalculator';

interface Props {
  monthly: MonthlyResult[];
  params: FacilityParams;
}

const fmtFull = (v: number) => `$${v.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
const fmt = (v: number) => `$${(v / 1000).toFixed(0)}k`;

export function PowerModelRevenueAnalysis({ monthly, params }: Props) {
  if (!monthly.length) return null;

  const hostingRateCAD = params.hostingRateUSD / params.cadUsdRate;

  const revenueData = monthly.map(m => {
    const revenue = m.kwh * hostingRateCAD; // CA$
    const cost = m.totalAmountDue;
    const margin = revenue - cost;
    return {
      month: m.month.slice(0, 3),
      Revenue: Math.round(revenue),
      Cost: Math.round(cost),
      'Net Margin': Math.round(margin),
    };
  });

  const annualRevenue = revenueData.reduce((s, d) => s + d.Revenue, 0);
  const annualCost = revenueData.reduce((s, d) => s + d.Cost, 0);
  const annualMargin = annualRevenue - annualCost;
  const marginPct = annualRevenue > 0 ? (annualMargin / annualRevenue * 100) : 0;

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <CardTitle className="text-sm">Revenue vs Cost Analysis</CardTitle>
            <CardDescription className="text-xs">
              Hosting revenue at US${params.hostingRateUSD}/kWh (CA${(hostingRateCAD * 100).toFixed(2)}¢/kWh) vs total energy cost
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={annualMargin >= 0 ? 'default' : 'destructive'} className="text-xs">
              {annualMargin >= 0 ? 'Profitable' : 'Unprofitable'} — {marginPct.toFixed(1)}% margin
            </Badge>
            <RateSourceBadge source="User hosting rate + calculator output" effectiveDate="2025-01-01" variant="compact" />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-4 mb-4 text-center">
          <div>
            <p className="text-xs text-muted-foreground">Annual Revenue</p>
            <p className="text-lg font-bold text-emerald-600">{fmtFull(annualRevenue)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Annual Cost</p>
            <p className="text-lg font-bold text-red-500">{fmtFull(annualCost)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Net Margin</p>
            <p className={`text-lg font-bold ${annualMargin >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
              {fmtFull(annualMargin)}
            </p>
          </div>
        </div>

        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={revenueData}>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis dataKey="month" tick={{ fontSize: 11 }} />
            <YAxis tickFormatter={fmt} tick={{ fontSize: 11 }} />
            <Tooltip formatter={(v: number) => fmtFull(v)} />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Bar dataKey="Revenue" fill="hsl(150, 60%, 45%)" />
            <Bar dataKey="Cost" fill="hsl(0, 65%, 55%)" />
            <ReferenceLine y={0} stroke="hsl(0, 0%, 50%)" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

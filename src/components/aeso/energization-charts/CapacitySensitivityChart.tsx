import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { TrendingUp } from 'lucide-react';
import { AESO_ISO_FEES, AESO_FINANCIAL_SECURITY, withGST } from '@/constants/energization-fees';

interface Props {
  loadFactor: number;
  poolPrice: number;
  substationFraction: number;
  calculateMonthlyDTS: (mw: number, lf: number, pp: number, sf: number) => { total: number };
}

export function CapacitySensitivityChart({ loadFactor, poolPrice, substationFraction, calculateMonthlyDTS }: Props) {
  const data = useMemo(() => {
    return Array.from({ length: 20 }, (_, i) => {
      const mw = (i + 1) * 10;
      const clusterPrelim = withGST(AESO_ISO_FEES.clusterPreliminaryFee.calculate(mw));
      const clusterDetailed = withGST(AESO_ISO_FEES.clusterDetailedFee.calculate(mw));
      const poolPart = withGST(AESO_ISO_FEES.poolParticipationFee.amount);
      const upfront = clusterPrelim + clusterDetailed + poolPart;

      const monthlyDTS = calculateMonthlyDTS(mw, loadFactor, poolPrice, substationFraction);
      const dtsSecurityDeposit = monthlyDTS.total * AESO_FINANCIAL_SECURITY.monthsRequired;
      const monthlyEnergy = mw * loadFactor * 730 * poolPrice;
      const energySecurity = monthlyEnergy * AESO_FINANCIAL_SECURITY.monthsRequired;
      const refundable = dtsSecurityDeposit + energySecurity;

      return {
        capacity: mw,
        upfront: Math.round(upfront),
        refundable: Math.round(refundable),
        total: Math.round(upfront + refundable + monthlyDTS.total),
      };
    });
  }, [loadFactor, poolPrice, substationFraction, calculateMonthlyDTS]);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <TrendingUp className="w-4 h-4" />
          Capital-at-Risk vs. Facility Size
        </CardTitle>
        <CardDescription>How total capital requirements scale from 10 MW to 200 MW</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="capacity" tick={{ fontSize: 11 }} label={{ value: 'Capacity (MW)', position: 'insideBottom', offset: -5 }} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `$${(v / 1e6).toFixed(1)}M`} />
              <Tooltip
                contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}
                formatter={(value: number, name: string) => [`$${value.toLocaleString()}`, name]}
                labelFormatter={(label) => `${label} MW`}
              />
              <Legend />
              <Line type="monotone" dataKey="upfront" name="Upfront Fees" stroke="hsl(var(--chart-1))" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="refundable" name="Refundable Security" stroke="hsl(var(--chart-2))" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="total" name="Total Capital" stroke="hsl(var(--primary))" strokeWidth={3} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

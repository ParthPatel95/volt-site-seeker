import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell, ReferenceLine } from 'recharts';
import { BarChart3 } from 'lucide-react';
import { withGST } from '@/constants/energization-fees';

interface Props {
  calculations: {
    clusterPreliminary: number;
    clusterDetailed: number;
    poolParticipation: number;
    financialSecurityDTS: number;
    financialSecurityEnergy: number;
    monthlyDTS: { total: number };
    totalCapitalAtRisk: number;
  };
}

export function CashFlowWaterfall({ calculations }: Props) {
  const items = [
    { name: 'Cluster\nPrelim', value: withGST(calculations.clusterPreliminary), type: 'nonrefundable' },
    { name: 'Cluster\nDetailed', value: withGST(calculations.clusterDetailed), type: 'nonrefundable' },
    { name: 'Pool\nParticipation', value: withGST(calculations.poolParticipation), type: 'nonrefundable' },
    { name: 'DTS\nSecurity', value: calculations.financialSecurityDTS, type: 'refundable' },
    { name: 'Energy\nSecurity', value: calculations.financialSecurityEnergy, type: 'refundable' },
    { name: 'First Month\nDTS', value: calculations.monthlyDTS.total, type: 'ongoing' },
    { name: 'TOTAL', value: calculations.totalCapitalAtRisk, type: 'total' },
  ];

  // Build waterfall: each bar starts where previous ended, except TOTAL which starts at 0
  let cumulative = 0;
  const data = items.map((item) => {
    if (item.type === 'total') {
      return { ...item, invisible: 0, visible: item.value };
    }
    const entry = { ...item, invisible: cumulative, visible: item.value };
    cumulative += item.value;
    return entry;
  });

  const colorMap: Record<string, string> = {
    nonrefundable: 'hsl(var(--chart-4))',
    refundable: 'hsl(var(--chart-2))',
    ongoing: 'hsl(var(--chart-3))',
    total: 'hsl(var(--primary))',
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <BarChart3 className="w-4 h-4" />
          Capital Requirements Waterfall
        </CardTitle>
        <CardDescription>Step-by-step build-up of pre-energization capital</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-3 mb-3">
          <span className="flex items-center gap-1 text-xs"><span className="w-3 h-3 rounded" style={{ backgroundColor: colorMap.nonrefundable }} /> Non-refundable</span>
          <span className="flex items-center gap-1 text-xs"><span className="w-3 h-3 rounded" style={{ backgroundColor: colorMap.refundable }} /> Refundable</span>
          <span className="flex items-center gap-1 text-xs"><span className="w-3 h-3 rounded" style={{ backgroundColor: colorMap.ongoing }} /> Ongoing</span>
          <span className="flex items-center gap-1 text-xs"><span className="w-3 h-3 rounded" style={{ backgroundColor: colorMap.total }} /> Total</span>
        </div>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} barSize={40}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} interval={0} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `$${(v / 1e6).toFixed(1)}M`} />
              <Tooltip
                contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}
                formatter={(value: number, name: string) => {
                  if (name === 'invisible') return [null, null];
                  return [`$${value.toLocaleString()}`, 'Amount'];
                }}
              />
              <Bar dataKey="invisible" stackId="a" fill="transparent" />
              <Bar dataKey="visible" stackId="a" radius={[4, 4, 0, 0]}>
                {data.map((entry, i) => (
                  <Cell key={i} fill={colorMap[entry.type]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

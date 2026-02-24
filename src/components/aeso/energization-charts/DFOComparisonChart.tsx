import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { BarChart3 } from 'lucide-react';
import { DFO_DISTRIBUTION_RATES } from '@/constants/energization-fees';

interface Props {
  capacityMW: number;
  monthlyMWh: number;
}

export function DFOComparisonChart({ capacityMW, monthlyMWh }: Props) {
  const data = useMemo(() => {
    const capacityKW = capacityMW * 1000;
    const monthlyKWh = monthlyMWh * 1000;

    return DFO_DISTRIBUTION_RATES.map((dfo) => {
      const demand = capacityKW * dfo.demandCharge.perKWMonth;
      const delivery = monthlyKWh * (dfo.distributionDelivery.centsPerKWh / 100);
      const riders = monthlyKWh * (dfo.riders.centsPerKWh / 100);

      return {
        name: dfo.name.replace(' Distribution', '').replace(' Electric', '').replace(' Power', ''),
        Demand: Math.round(demand),
        Delivery: Math.round(delivery),
        Riders: Math.round(riders),
      };
    });
  }, [capacityMW, monthlyMWh]);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <BarChart3 className="w-4 h-4" />
          DFO Distribution Charges Comparison
        </CardTitle>
        <CardDescription>Stacked distribution-level charges by DFO (excludes common AESO DTS)</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} barSize={50}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}K`} />
              <Tooltip
                contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}
                formatter={(value: number, name: string) => [`$${value.toLocaleString()}`, name]}
              />
              <Legend />
              <Bar dataKey="Demand" stackId="a" fill="hsl(var(--chart-1))" radius={[0, 0, 0, 0]} />
              <Bar dataKey="Delivery" stackId="a" fill="hsl(var(--chart-2))" radius={[0, 0, 0, 0]} />
              <Bar dataKey="Riders" stackId="a" fill="hsl(var(--chart-3))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

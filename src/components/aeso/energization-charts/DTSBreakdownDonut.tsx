import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import { PieChart as PieIcon } from 'lucide-react';
import { formatCAD } from '@/constants/energization-fees';

interface Props {
  monthlyDTS: {
    bulkDemand: number;
    bulkEnergy: number;
    regionalCapacity: number;
    regionalEnergy: number;
    podSubstation: number;
    podDemand: number;
    operatingReserve: number;
    tcr: number;
    voltageControl: number;
    systemSupport: number;
    riderF: number;
    retailerFee: number;
  };
}

export function DTSBreakdownDonut({ monthlyDTS }: Props) {
  const data = [
    { name: 'Bulk Demand (12CP)', value: monthlyDTS.bulkDemand },
    { name: 'Bulk Energy', value: monthlyDTS.bulkEnergy },
    { name: 'Regional Capacity', value: monthlyDTS.regionalCapacity },
    { name: 'Regional Energy', value: monthlyDTS.regionalEnergy },
    { name: 'POD Substation', value: monthlyDTS.podSubstation },
    { name: 'POD Demand', value: monthlyDTS.podDemand },
    { name: 'Operating Reserve', value: monthlyDTS.operatingReserve },
    { name: 'TCR + Voltage + System', value: monthlyDTS.tcr + monthlyDTS.voltageControl + monthlyDTS.systemSupport },
    { name: 'Rider F', value: monthlyDTS.riderF },
    { name: 'Retailer Fee', value: monthlyDTS.retailerFee },
  ].filter(d => d.value > 0);

  const colors = [
    'hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))',
    'hsl(var(--chart-4))', 'hsl(var(--chart-5))', 'hsl(var(--primary))',
    'hsl(var(--accent))', 'hsl(var(--muted-foreground))',
    'hsl(var(--chart-1) / 0.6)', 'hsl(var(--chart-2) / 0.6)',
  ];

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <PieIcon className="w-4 h-4" />
          Monthly DTS Cost Breakdown
        </CardTitle>
        <CardDescription>Proportional breakdown of monthly transmission charges</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius="45%"
                outerRadius="75%"
                paddingAngle={2}
                dataKey="value"
              >
                {data.map((_, i) => (
                  <Cell key={i} fill={colors[i % colors.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}
                formatter={(value: number) => [formatCAD(value), 'Monthly Cost']}
              />
              <Legend
                formatter={(value) => <span className="text-xs">{value}</span>}
                wrapperStyle={{ fontSize: '11px' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

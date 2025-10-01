import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface MarketParticipant {
  participant_name: string;
  total_capacity_mw: number;
  available_capacity_mw: number;
  generation_type: string;
  market_share_percent: number;
}

interface Props {
  participants: MarketParticipant[];
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

export function MarketSharePieChart({ participants }: Props) {
  const chartData = participants.map(item => ({
    name: item.participant_name,
    value: item.market_share_percent,
    type: item.generation_type
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Market Share by Participant</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, value }: any) => `${name}: ${Number(value).toFixed(1)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(value: any) => `${Number(value).toFixed(1)}%`} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

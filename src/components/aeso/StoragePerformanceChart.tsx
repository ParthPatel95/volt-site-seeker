import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface StorageMetrics {
  facility_name: string;
  capacity_mw: number;
  state_of_charge_percent: number;
  charging_mw: number;
  discharging_mw: number;
  cycles_today: number;
}

interface Props {
  storage: StorageMetrics[];
}

export function StoragePerformanceChart({ storage }: Props) {
  const chartData = storage.map(item => ({
    name: item.facility_name,
    'Charging': item.charging_mw,
    'Discharging': -item.discharging_mw, // Negative for visual distinction
    'State of Charge %': item.state_of_charge_percent,
    'Capacity (MW)': item.capacity_mw
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Energy Storage Performance</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <ComposedChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis yAxisId="left" />
            <YAxis yAxisId="right" orientation="right" />
            <Tooltip />
            <Legend />
            <Bar yAxisId="left" dataKey="Charging" fill="#82ca9d" />
            <Bar yAxisId="left" dataKey="Discharging" fill="#ff7300" />
            <Line yAxisId="right" type="monotone" dataKey="State of Charge %" stroke="#8884d8" strokeWidth={2} />
          </ComposedChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface TransmissionConstraint {
  constraint_name: string;
  limit_mw: number;
  flow_mw: number;
  utilization_percent: number;
  status: 'normal' | 'warning' | 'critical';
  region: string;
}

interface Props {
  constraints: TransmissionConstraint[];
}

export function TransmissionConstraintChart({ constraints }: Props) {
  const chartData = constraints.map(constraint => ({
    name: constraint.constraint_name.substring(0, 20) + '...',
    'Flow (MW)': constraint.flow_mw,
    'Limit (MW)': constraint.limit_mw,
    'Utilization %': constraint.utilization_percent
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Transmission Utilization Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
            <YAxis yAxisId="left" />
            <YAxis yAxisId="right" orientation="right" />
            <Tooltip />
            <Legend />
            <Line yAxisId="left" type="monotone" dataKey="Flow (MW)" stroke="#8884d8" strokeWidth={2} />
            <Line yAxisId="left" type="monotone" dataKey="Limit (MW)" stroke="#82ca9d" strokeWidth={2} />
            <Line yAxisId="right" type="monotone" dataKey="Utilization %" stroke="#ff7300" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface RegionalPrice {
  region: string;
  current_price: number;
  average_price: number;
  peak_price: number;
  price_trend: string;
}

interface Props {
  regionalPrices: RegionalPrice[];
}

export function RegionalPriceChart({ regionalPrices }: Props) {
  const chartData = regionalPrices.map(item => ({
    region: item.region,
    'Current ($/MWh)': item.current_price,
    'Average ($/MWh)': item.average_price,
    'Peak ($/MWh)': item.peak_price
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Regional Price Comparison</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="region" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Area type="monotone" dataKey="Current ($/MWh)" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
            <Area type="monotone" dataKey="Average ($/MWh)" stroke="#82ca9d" fill="#82ca9d" fillOpacity={0.6} />
            <Area type="monotone" dataKey="Peak ($/MWh)" stroke="#ffc658" fill="#ffc658" fillOpacity={0.6} />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

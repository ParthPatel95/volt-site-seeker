import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface ForecastData {
  date: string;
  demand_forecast_mw: number;
  wind_forecast_mw: number;
  solar_forecast_mw: number;
  price_forecast: number;
  confidence_level: number;
}

interface Props {
  forecast: ForecastData[];
}

export function ForecastAccuracyChart({ forecast }: Props) {
  const chartData = forecast.map(item => ({
    date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    'Demand (GW)': (item.demand_forecast_mw / 1000).toFixed(1),
    'Wind (GW)': (item.wind_forecast_mw / 1000).toFixed(1),
    'Solar (MW)': item.solar_forecast_mw.toFixed(0),
    'Confidence %': item.confidence_level
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>7-Day Generation Forecast</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="Demand (GW)" fill="#8884d8" />
            <Bar dataKey="Wind (GW)" fill="#82ca9d" />
            <Bar dataKey="Solar (MW)" fill="#ffc658" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

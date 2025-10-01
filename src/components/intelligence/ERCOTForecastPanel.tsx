import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Wind, Sun, Zap, TrendingUp } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

interface ERCOTForecastPanelProps {
  windSolarForecast: any;
  loading: boolean;
}

export function ERCOTForecastPanel({ windSolarForecast, loading }: ERCOTForecastPanelProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[...Array(2)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-6 bg-gray-200 rounded w-3/4"></div>
            </CardHeader>
            <CardContent>
              <div className="h-64 bg-gray-100 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!windSolarForecast) {
    return (
      <Card>
        <CardContent className="p-8 text-center text-muted-foreground">
          No forecast data available
        </CardContent>
      </Card>
    );
  }

  const windData = windSolarForecast.wind_forecast?.map((item: any) => ({
    time: new Date(item.time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    mw: item.mw
  })) || [];

  const solarData = windSolarForecast.solar_forecast?.map((item: any) => ({
    time: new Date(item.time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    mw: item.mw
  })) || [];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Wind className="w-5 h-5 text-green-600" />
              <span>Wind Generation Forecast</span>
            </div>
            <Badge variant="outline">Next 24h</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={windData}>
                <defs>
                  <linearGradient id="windGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 12 }} label={{ value: 'MW', angle: -90, position: 'insideLeft' }} />
                <Tooltip formatter={(value: number) => [`${value.toFixed(0)} MW`, 'Wind']} />
                <Area type="monotone" dataKey="mw" stroke="#10b981" fill="url(#windGradient)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-muted-foreground">Average Forecast</p>
              <p className="text-lg font-semibold">
                {windData.length > 0 ? (windData.reduce((sum: number, d: any) => sum + d.mw, 0) / windData.length / 1000).toFixed(1) : '0.0'} GW
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Peak Forecast</p>
              <p className="text-lg font-semibold text-green-600">
                {windData.length > 0 ? (Math.max(...windData.map((d: any) => d.mw)) / 1000).toFixed(1) : '0.0'} GW
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sun className="w-5 h-5 text-yellow-600" />
              <span>Solar Generation Forecast</span>
            </div>
            <Badge variant="outline">Next 24h</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={solarData}>
                <defs>
                  <linearGradient id="solarGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 12 }} label={{ value: 'MW', angle: -90, position: 'insideLeft' }} />
                <Tooltip formatter={(value: number) => [`${value.toFixed(0)} MW`, 'Solar']} />
                <Area type="monotone" dataKey="mw" stroke="#f59e0b" fill="url(#solarGradient)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-muted-foreground">Average Forecast</p>
              <p className="text-lg font-semibold">
                {solarData.length > 0 ? (solarData.reduce((sum: number, d: any) => sum + d.mw, 0) / solarData.length / 1000).toFixed(1) : '0.0'} GW
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Peak Forecast</p>
              <p className="text-lg font-semibold text-yellow-600">
                {solarData.length > 0 ? (Math.max(...solarData.map((d: any) => d.mw)) / 1000).toFixed(1) : '0.0'} GW
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

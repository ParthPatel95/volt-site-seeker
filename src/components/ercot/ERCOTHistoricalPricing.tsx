import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, TrendingUp, BarChart3, Clock } from 'lucide-react';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export function ERCOTHistoricalPricing() {
  const [hourlyData, setHourlyData] = useState<Array<{ time: string; price: number }>>([]);
  const [dailyData, setDailyData] = useState<Array<{ date: string; avg: number; max: number; min: number }>>([]);

  useEffect(() => {
    // Generate mock 24-hour data
    const now = new Date();
    const hourly = Array.from({ length: 24 }, (_, i) => {
      const hour = (now.getHours() - 23 + i) % 24;
      const isPeak = hour >= 14 && hour <= 19;
      const basePrice = isPeak ? 45 : 30;
      return {
        time: `${hour.toString().padStart(2, '0')}:00`,
        price: Math.round((basePrice + Math.random() * 20 - 10) * 100) / 100
      };
    });
    setHourlyData(hourly);

    // Generate mock 30-day data
    const daily = Array.from({ length: 30 }, (_, i) => {
      const date = new Date(now.getTime() - (29 - i) * 86400000);
      const avg = 35 + Math.random() * 15;
      return {
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        avg: Math.round(avg * 100) / 100,
        max: Math.round((avg + 10 + Math.random() * 20) * 100) / 100,
        min: Math.round((avg - 10 - Math.random() * 10) * 100) / 100
      };
    });
    setDailyData(daily);
  }, []);

  return (
    <div className="space-y-4 sm:space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-600" />
            Historical Pricing Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="24h" className="space-y-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="24h" className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>Last 24 Hours</span>
              </TabsTrigger>
              <TabsTrigger value="30d" className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>Last 30 Days</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="24h" className="space-y-4">
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={hourlyData}>
                    <defs>
                      <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis 
                      dataKey="time" 
                      tick={{ fontSize: 12 }}
                      stroke="#6b7280"
                    />
                    <YAxis 
                      tick={{ fontSize: 12 }}
                      stroke="#6b7280"
                      label={{ value: '$/MWh', angle: -90, position: 'insideLeft', style: { fontSize: 12 } }}
                    />
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                      formatter={(value: number) => [`$${value.toFixed(2)}/MWh`, 'Price']}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="price" 
                      stroke="#3b82f6" 
                      strokeWidth={2}
                      fill="url(#priceGradient)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                <div className="text-center">
                  <p className="text-xs text-muted-foreground">Average</p>
                  <p className="text-lg font-semibold">${(hourlyData.reduce((sum, d) => sum + d.price, 0) / hourlyData.length).toFixed(2)}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-muted-foreground">Peak</p>
                  <p className="text-lg font-semibold text-red-600">${Math.max(...hourlyData.map(d => d.price)).toFixed(2)}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-muted-foreground">Off-Peak</p>
                  <p className="text-lg font-semibold text-green-600">${Math.min(...hourlyData.map(d => d.price)).toFixed(2)}</p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="30d" className="space-y-4">
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dailyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis 
                      dataKey="date" 
                      tick={{ fontSize: 10 }}
                      stroke="#6b7280"
                      angle={-45}
                      textAnchor="end"
                      height={80}
                    />
                    <YAxis 
                      tick={{ fontSize: 12 }}
                      stroke="#6b7280"
                      label={{ value: '$/MWh', angle: -90, position: 'insideLeft', style: { fontSize: 12 } }}
                    />
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                      formatter={(value: number, name: string) => {
                        const labels = { avg: 'Average', max: 'Maximum', min: 'Minimum' };
                        return [`$${value.toFixed(2)}/MWh`, labels[name as keyof typeof labels]];
                      }}
                    />
                    <Bar dataKey="avg" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="max" fill="#ef4444" radius={[4, 4, 0, 0]} opacity={0.5} />
                    <Bar dataKey="min" fill="#10b981" radius={[4, 4, 0, 0]} opacity={0.5} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                <div className="text-center">
                  <p className="text-xs text-muted-foreground">30-Day Average</p>
                  <p className="text-lg font-semibold">${(dailyData.reduce((sum, d) => sum + d.avg, 0) / dailyData.length).toFixed(2)}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-muted-foreground">Period High</p>
                  <p className="text-lg font-semibold text-red-600">${Math.max(...dailyData.map(d => d.max)).toFixed(2)}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-muted-foreground">Period Low</p>
                  <p className="text-lg font-semibold text-green-600">${Math.min(...dailyData.map(d => d.min)).toFixed(2)}</p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

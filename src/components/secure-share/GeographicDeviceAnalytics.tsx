import { memo, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from 'recharts';
import { Monitor, Smartphone, Chrome, MapPin } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useSecureShareAnalytics } from '@/contexts/SecureShareAnalyticsContext';
import { ChartSkeleton } from './analytics/AnalyticsSkeleton';

const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))', '#8884d8', '#82ca9d', '#ffc658'];

export const GeographicDeviceAnalytics = memo(function GeographicDeviceAnalytics() {
  const { analytics, isLoading } = useSecureShareAnalytics();

  // Memoize device engagement data transformation
  const deviceEngagementData = useMemo(() => {
    return analytics?.deviceData?.map(d => ({
      device: d.name,
      engagement: d.avgEngagement,
      timeMinutes: Math.round(d.avgTime / 60)
    })) || [];
  }, [analytics?.deviceData]);

  // Use CSS media query approach instead of window.innerWidth
  const pieRadius = 70; // Fixed reasonable size, responsive via container

  if (isLoading) {
    return (
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
        <ChartSkeleton />
        <ChartSkeleton />
        <ChartSkeleton />
        <ChartSkeleton />
      </div>
    );
  }

  return (
    <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
      <Card className="border-primary/20 hover:border-primary/40 transition-all shadow-lg">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Monitor className="h-5 w-5 text-primary" />
            <CardTitle className="text-base sm:text-lg">Device Distribution</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {analytics?.deviceData && analytics.deviceData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={analytics.deviceData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry: any) => `${entry.name}: ${(entry.percent * 100).toFixed(0)}%`}
                  outerRadius={pieRadius}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {analytics.deviceData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }} 
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[280px] flex items-center justify-center text-muted-foreground text-sm">
              No device data available
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border-secondary/20 hover:border-secondary/40 transition-all shadow-lg">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Smartphone className="h-5 w-5 text-secondary" />
            <CardTitle className="text-base sm:text-lg">Device Engagement</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {deviceEngagementData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={deviceEngagementData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="device" tick={{ fontSize: 12 }} />
                <YAxis yAxisId="left" tick={{ fontSize: 12 }} />
                <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12 }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }} 
                />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Bar yAxisId="left" dataKey="engagement" fill="hsl(var(--primary))" name="Engagement" radius={[4, 4, 0, 0]} />
                <Bar yAxisId="right" dataKey="timeMinutes" fill="hsl(var(--secondary))" name="Time (min)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[280px] flex items-center justify-center text-muted-foreground text-sm">
              No engagement data available
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border-accent/20 hover:border-accent/40 transition-all shadow-lg">
        <CardHeader>
          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-accent" />
            <CardTitle className="text-base sm:text-lg">Top Locations</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {analytics?.locationData && analytics.locationData.length > 0 ? (
            <div className="overflow-auto max-h-[280px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]">#</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead className="text-right">Views</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {analytics.locationData.map((location, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium text-muted-foreground">
                        {index + 1}
                      </TableCell>
                      <TableCell className="font-medium">{location.location}</TableCell>
                      <TableCell className="text-right font-semibold text-accent">
                        {location.count}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="h-[280px] flex items-center justify-center text-muted-foreground text-sm">
              No location data available
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border-green-500/20 hover:border-green-500/40 transition-all shadow-lg">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Chrome className="h-5 w-5 text-green-500" />
            <CardTitle className="text-base sm:text-lg">Browser Distribution</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {analytics?.browserData && analytics.browserData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={analytics.browserData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry: any) => `${entry.name}: ${(entry.percent * 100).toFixed(0)}%`}
                  outerRadius={pieRadius}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {analytics.browserData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }} 
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[280px] flex items-center justify-center text-muted-foreground text-sm">
              No browser data available
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
});

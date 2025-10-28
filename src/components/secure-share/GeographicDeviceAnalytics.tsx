import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Monitor, Smartphone, Globe, Chrome } from 'lucide-react';
import { DateRange } from 'react-day-picker';

interface GeographicDeviceAnalyticsProps {
  dateRange?: DateRange;
}

const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))', '#8884d8', '#82ca9d', '#ffc658'];

export function GeographicDeviceAnalytics({ dateRange }: GeographicDeviceAnalyticsProps) {
  const { data, isLoading } = useQuery({
    queryKey: ['geographic-device-analytics', dateRange],
    queryFn: async () => {
      let query = supabase
        .from('viewer_activity')
        .select('device_type, viewer_location, engagement_score, browser, total_time_seconds');

      if (dateRange?.from) {
        query = query.gte('opened_at', dateRange.from.toISOString());
      }
      if (dateRange?.to) {
        query = query.lte('opened_at', dateRange.to.toISOString());
      }

      const { data: activity, error } = await query;
      if (error) throw error;

      // Device breakdown
      const deviceCounts: Record<string, { count: number; engagement: number; time: number }> = {};
      activity?.forEach(a => {
        const device = a.device_type || 'Unknown';
        if (!deviceCounts[device]) {
          deviceCounts[device] = { count: 0, engagement: 0, time: 0 };
        }
        deviceCounts[device].count += 1;
        deviceCounts[device].engagement += a.engagement_score || 0;
        deviceCounts[device].time += a.total_time_seconds || 0;
      });

      const deviceData = Object.entries(deviceCounts).map(([name, stats]) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1),
        value: stats.count,
        avgEngagement: stats.count > 0 ? Math.round(stats.engagement / stats.count) : 0,
        avgTime: stats.count > 0 ? Math.round(stats.time / stats.count) : 0
      }));

      // Location breakdown
      const locationCounts: Record<string, number> = {};
      activity?.forEach(a => {
        const loc = a.viewer_location || 'Unknown';
        locationCounts[loc] = (locationCounts[loc] || 0) + 1;
      });

      const locationData = Object.entries(locationCounts)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 10);

      // Browser breakdown
      const browserCounts: Record<string, number> = {};
      activity?.forEach(a => {
        const browser = a.browser || 'Unknown';
        browserCounts[browser] = (browserCounts[browser] || 0) + 1;
      });

      const browserData = Object.entries(browserCounts)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 5);

      // Device engagement comparison
      const deviceEngagementData = Object.entries(deviceCounts).map(([name, stats]) => ({
        device: name.charAt(0).toUpperCase() + name.slice(1),
        engagement: stats.count > 0 ? Math.round(stats.engagement / stats.count) : 0,
        timeMinutes: stats.count > 0 ? Math.round(stats.time / stats.count / 60) : 0
      }));

      return {
        deviceData,
        locationData,
        browserData,
        deviceEngagementData
      };
    }
  });

  if (isLoading) {
    return (
      <Card>
        <CardContent className="h-64 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Monitor className="h-5 w-5 text-primary" />
            <CardTitle>Device Distribution</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {data?.deviceData && data.deviceData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={data.deviceData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry: any) => `${entry.name}: ${(entry.percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {data.deviceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-muted-foreground">
              No device data available
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Smartphone className="h-5 w-5 text-primary" />
            <CardTitle>Device Engagement Comparison</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {data?.deviceEngagementData && data.deviceEngagementData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.deviceEngagementData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="device" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Legend />
                <Bar yAxisId="left" dataKey="engagement" fill="hsl(var(--primary))" name="Engagement Score" />
                <Bar yAxisId="right" dataKey="timeMinutes" fill="hsl(var(--secondary))" name="Avg. Time (min)" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-muted-foreground">
              No engagement data available
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-primary" />
            <CardTitle>Top Locations</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {data?.locationData && data.locationData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.locationData} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={100} />
                <Tooltip />
                <Bar dataKey="value" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-muted-foreground">
              No location data available
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Chrome className="h-5 w-5 text-primary" />
            <CardTitle>Browser Distribution</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {data?.browserData && data.browserData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={data.browserData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry: any) => `${entry.name}: ${(entry.percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {data.browserData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-muted-foreground">
              No browser data available
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

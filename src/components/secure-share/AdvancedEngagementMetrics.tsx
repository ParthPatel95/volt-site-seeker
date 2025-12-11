import { memo, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { TrendingUp, TrendingDown, Users, Clock } from 'lucide-react';
import { useSecureShareAnalytics } from '@/contexts/SecureShareAnalyticsContext';
import { ChartSkeleton, KPICardSkeleton } from './analytics/AnalyticsSkeleton';

export const AdvancedEngagementMetrics = memo(function AdvancedEngagementMetrics() {
  const { analytics, isLoading } = useSecureShareAnalytics();

  const maxViews = useMemo(() => {
    return Math.max(...(analytics?.timeOfDayData?.map(d => d.views) || [1]));
  }, [analytics?.timeOfDayData]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <KPICardSkeleton />
          <KPICardSkeleton />
          <KPICardSkeleton />
          <KPICardSkeleton />
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <ChartSkeleton />
          <ChartSkeleton />
        </div>
      </div>
    );
  }

  const mostCommonDropoff = analytics?.dropoffData?.[0]?.page || 'N/A';

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Completion</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics?.avgCompletionRate || 0}%</div>
            <Progress value={analytics?.avgCompletionRate || 0} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Re-engagement Rate</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics?.reEngagementRate || 0}%</div>
            <p className="text-xs text-muted-foreground mt-2">
              {analytics?.repeatViewers || 0} of {analytics?.uniqueViewers || 0} viewers returned
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Time/Page</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics?.avgTimePerPage || 0}s</div>
            <Badge 
              variant={(analytics?.avgTimePerPage || 0) > 30 ? "default" : "secondary"} 
              className="mt-2"
            >
              {(analytics?.avgTimePerPage || 0) > 30 ? "Good engagement" : "Quick scans"}
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Drop-off Points</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mostCommonDropoff}</div>
            <p className="text-xs text-muted-foreground mt-2">
              Most common exit point
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Activity by Time of Day</CardTitle>
          </CardHeader>
          <CardContent>
            {analytics?.timeOfDayData && analytics.timeOfDayData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analytics.timeOfDayData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="hour" 
                    angle={-45}
                    textAnchor="end"
                    height={80}
                    interval={2}
                    tick={{ fontSize: 11 }}
                  />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }} 
                  />
                  <Bar dataKey="views" radius={[4, 4, 0, 0]}>
                    {analytics.timeOfDayData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`}
                        fill={entry.views > maxViews * 0.7 ? "hsl(var(--primary))" : "hsl(var(--primary) / 0.5)"}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground text-sm">
                No time data available
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Page Drop-off Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            {analytics?.dropoffData && analytics.dropoffData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analytics.dropoffData} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis type="number" tick={{ fontSize: 12 }} />
                  <YAxis dataKey="page" type="category" width={80} tick={{ fontSize: 11 }} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }} 
                  />
                  <Bar dataKey="dropoffs" fill="hsl(var(--destructive))" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground text-sm">
                No drop-off data available
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
});

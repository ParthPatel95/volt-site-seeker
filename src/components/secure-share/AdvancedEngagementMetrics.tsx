import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { TrendingUp, TrendingDown, Users, Clock } from 'lucide-react';
import { DateRange } from 'react-day-picker';

interface AdvancedEngagementMetricsProps {
  dateRange?: DateRange;
}

export function AdvancedEngagementMetrics({ dateRange }: AdvancedEngagementMetricsProps) {
  const { data, isLoading } = useQuery({
    queryKey: ['advanced-engagement-metrics', dateRange],
    queryFn: async () => {
      let query = supabase
        .from('viewer_activity')
        .select(`
          *,
          document:secure_documents(file_name, id)
        `);

      if (dateRange?.from) {
        query = query.gte('opened_at', dateRange.from.toISOString());
      }
      if (dateRange?.to) {
        query = query.lte('opened_at', dateRange.to.toISOString());
      }

      const { data: activity, error } = await query;
      if (error) throw error;

      // Calculate completion rates
      const completionRates = activity?.map(a => {
        const pagesViewed = Array.isArray(a.pages_viewed) ? a.pages_viewed.length : 0;
        // Assume average document has 10 pages (we don't store total pages)
        const estimatedTotalPages = 10;
        return (pagesViewed / estimatedTotalPages) * 100;
      }) || [];

      const avgCompletionRate = completionRates.length 
        ? completionRates.reduce((sum, rate) => sum + rate, 0) / completionRates.length 
        : 0;

      // Drop-off analysis by page
      const pageDropoffs: Record<number, number> = {};
      activity?.forEach(a => {
        if (Array.isArray(a.pages_viewed)) {
          const lastPage = a.pages_viewed.length;
          pageDropoffs[lastPage] = (pageDropoffs[lastPage] || 0) + 1;
        }
      });

      const dropoffData = Object.entries(pageDropoffs)
        .map(([page, count]) => ({
          page: `Page ${page}`,
          dropoffs: count
        }))
        .sort((a, b) => parseInt(a.page.split(' ')[1]) - parseInt(b.page.split(' ')[1]))
        .slice(0, 10);

      // Re-engagement rate (viewers who came back)
      const viewerCounts: Record<string, number> = {};
      activity?.forEach(a => {
        if (a.viewer_email) {
          viewerCounts[a.viewer_email] = (viewerCounts[a.viewer_email] || 0) + 1;
        }
      });

      const repeatViewers = Object.values(viewerCounts).filter(count => count > 1).length;
      const totalViewers = Object.keys(viewerCounts).length;
      const reEngagementRate = totalViewers > 0 ? (repeatViewers / totalViewers) * 100 : 0;

      // Time of day analysis
      const timeOfDayViews: Record<number, number> = {};
      activity?.forEach(a => {
        const hour = new Date(a.opened_at).getHours();
        timeOfDayViews[hour] = (timeOfDayViews[hour] || 0) + 1;
      });

      const timeData = Array.from({ length: 24 }, (_, hour) => ({
        hour: hour === 0 ? '12 AM' : hour < 12 ? `${hour} AM` : hour === 12 ? '12 PM' : `${hour - 12} PM`,
        views: timeOfDayViews[hour] || 0
      }));

      // Average time per page
      const pageTimes: number[] = [];
      activity?.forEach(a => {
        if (Array.isArray(a.pages_viewed)) {
          a.pages_viewed.forEach((p: any) => {
            if (p.time_spent) {
              pageTimes.push(p.time_spent);
            }
          });
        }
      });

      const avgTimePerPage = pageTimes.length 
        ? pageTimes.reduce((sum, time) => sum + time, 0) / pageTimes.length 
        : 0;

      return {
        avgCompletionRate,
        dropoffData,
        reEngagementRate,
        repeatViewers,
        totalViewers,
        timeData,
        avgTimePerPage
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

  const maxViews = Math.max(...(data?.timeData.map(d => d.views) || [1]));

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Completion</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data?.avgCompletionRate.toFixed(1)}%</div>
            <Progress value={data?.avgCompletionRate} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Re-engagement Rate</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data?.reEngagementRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground mt-2">
              {data?.repeatViewers} of {data?.totalViewers} viewers returned
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Time/Page</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(data?.avgTimePerPage || 0)}s</div>
            <Badge variant={data?.avgTimePerPage && data.avgTimePerPage > 30 ? "success" : "warning"} className="mt-2">
              {data?.avgTimePerPage && data.avgTimePerPage > 30 ? "Good engagement" : "Quick scans"}
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Drop-off Points</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data?.dropoffData[0]?.page || 'N/A'}
            </div>
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
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data?.timeData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="hour" 
                  angle={-45}
                  textAnchor="end"
                  height={80}
                  interval={2}
                />
                <YAxis />
                <Tooltip />
                <Bar dataKey="views" radius={[4, 4, 0, 0]}>
                  {data?.timeData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`}
                      fill={entry.views > maxViews * 0.7 ? "hsl(var(--primary))" : "hsl(var(--primary) / 0.5)"}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Page Drop-off Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data?.dropoffData} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="page" type="category" width={80} />
                <Tooltip />
                <Bar dataKey="dropoffs" fill="hsl(var(--destructive))" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

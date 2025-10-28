import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { BarChart3, Eye, Clock, TrendingUp, Users } from 'lucide-react';
import { EngagementChart } from './EngagementChart';
import { TopDocumentsChart } from './TopDocumentsChart';
import { ViewerActivityTable } from './ViewerActivityTable';
import { AnalyticsDateRangePicker } from './AnalyticsDateRangePicker';
import { ExportControls } from './ExportControls';
import { EnhancedKPICard } from './EnhancedKPICard';
import { useState } from 'react';
import { DateRange } from 'react-day-picker';
import { subDays } from 'date-fns';

export function AnalyticsTab() {
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: subDays(new Date(), 30),
    to: new Date()
  });

  const { data: analytics, isLoading } = useQuery({
    queryKey: ['secure-share-analytics', dateRange],
    queryFn: async () => {
      let query = supabase
        .from('viewer_activity')
        .select(`
          *,
          document:secure_documents(file_name),
          link:secure_links(recipient_email)
        `)
        .order('opened_at', { ascending: false });

      // Apply date range filter
      if (dateRange?.from) {
        query = query.gte('opened_at', dateRange.from.toISOString());
      }
      if (dateRange?.to) {
        query = query.lte('opened_at', dateRange.to.toISOString());
      }

      const { data: activity, error } = await query;

      if (error) throw error;

      const totalViews = activity?.length || 0;
      const totalEngagementTime = activity?.reduce((sum, v) => sum + (v.total_time_seconds || 0), 0) || 0;
      const avgEngagementScore = activity?.length 
        ? activity.reduce((sum, v) => sum + (v.engagement_score || 0), 0) / activity.length 
        : 0;
      const uniqueViewers = new Set(activity?.map(v => v.viewer_email).filter(Boolean)).size;

      // Fetch comparison data for previous period
      let comparisonData = null;
      if (dateRange?.from && dateRange?.to) {
        const periodLength = dateRange.to.getTime() - dateRange.from.getTime();
        const prevFrom = new Date(dateRange.from.getTime() - periodLength);
        const prevTo = new Date(dateRange.from.getTime());

        const { data: prevActivity } = await supabase
          .from('viewer_activity')
          .select('*')
          .gte('opened_at', prevFrom.toISOString())
          .lte('opened_at', prevTo.toISOString());

        if (prevActivity) {
          comparisonData = {
            totalViews: prevActivity.length,
            totalEngagementTime: prevActivity.reduce((sum, v) => sum + (v.total_time_seconds || 0), 0),
            avgEngagementScore: prevActivity.length
              ? prevActivity.reduce((sum, v) => sum + (v.engagement_score || 0), 0) / prevActivity.length
              : 0,
            uniqueViewers: new Set(prevActivity.map(v => v.viewer_email).filter(Boolean)).size
          };
        }
      }

      // Transform the data to match the Activity interface
      const transformedActivity = activity?.slice(0, 10).map(a => ({
        ...a,
        pages_viewed: Array.isArray(a.pages_viewed) 
          ? a.pages_viewed as Array<{ page: number; time_spent: number; viewed_at: string }>
          : [],
        scroll_depth: typeof a.scroll_depth === 'object' && a.scroll_depth !== null
          ? a.scroll_depth as Record<string, number>
          : {}
      })) || [];

      return {
        totalViews,
        totalEngagementTime,
        avgEngagementScore,
        uniqueViewers,
        recentActivity: transformedActivity,
        comparisonData
      };
    }
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const hasData = analytics && analytics.totalViews > 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Analytics & Engagement</h2>
          <p className="text-muted-foreground">
            Track document views, engagement, and viewer activity
          </p>
        </div>
        {hasData && (
          <ExportControls data={analytics} dateRange={dateRange} />
        )}
      </div>

      {hasData && (
        <AnalyticsDateRangePicker 
          dateRange={dateRange} 
          onDateRangeChange={setDateRange} 
        />
      )}

      {!hasData ? (
        <Card className="p-12 text-center">
          <div className="flex flex-col items-center gap-4">
            <div className="p-4 rounded-full bg-muted">
              <BarChart3 className="w-12 h-12 text-muted-foreground" />
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">No analytics data yet</h3>
              <p className="text-muted-foreground max-w-md">
                Analytics will appear here once you share documents and viewers start engaging with them
              </p>
            </div>
          </div>
        </Card>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <EnhancedKPICard
              title="Total Views"
              value={analytics.totalViews}
              icon={Eye}
              currentValue={analytics.totalViews}
              previousValue={analytics.comparisonData?.totalViews || 0}
            />

            <EnhancedKPICard
              title="Avg. Engagement"
              value={Math.round(analytics.avgEngagementScore)}
              icon={TrendingUp}
              currentValue={analytics.avgEngagementScore}
              previousValue={analytics.comparisonData?.avgEngagementScore || 0}
            />

            <EnhancedKPICard
              title="Total Time"
              value={`${Math.round(analytics.totalEngagementTime / 60)}m`}
              icon={Clock}
              currentValue={analytics.totalEngagementTime}
              previousValue={analytics.comparisonData?.totalEngagementTime || 0}
              formatter={(val) => `${Math.round(val / 60)}m`}
            />

            <EnhancedKPICard
              title="Unique Viewers"
              value={analytics.uniqueViewers}
              icon={Users}
              currentValue={analytics.uniqueViewers}
              previousValue={analytics.comparisonData?.uniqueViewers || 0}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <EngagementChart />
            <TopDocumentsChart />
          </div>

          <ViewerActivityTable activities={analytics.recentActivity} />
        </>
      )}
    </div>
  );
}

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { BarChart3, Eye, Clock, TrendingUp, Users } from 'lucide-react';
import { EngagementChart } from './EngagementChart';
import { TopDocumentsChart } from './TopDocumentsChart';
import { ViewerActivityTable } from './ViewerActivityTable';

export function AnalyticsTab() {
  const { data: analytics, isLoading } = useQuery({
    queryKey: ['secure-share-analytics'],
    queryFn: async () => {
      const { data: activity, error } = await supabase
        .from('viewer_activity')
        .select(`
          *,
          document:secure_documents(file_name),
          link:secure_links(recipient_email)
        `)
        .order('opened_at', { ascending: false });

      if (error) throw error;

      const totalViews = activity?.length || 0;
      const totalEngagementTime = activity?.reduce((sum, v) => sum + (v.total_time_seconds || 0), 0) || 0;
      const avgEngagementScore = activity?.length 
        ? activity.reduce((sum, v) => sum + (v.engagement_score || 0), 0) / activity.length 
        : 0;
      const uniqueViewers = new Set(activity?.map(v => v.viewer_email).filter(Boolean)).size;

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
        recentActivity: transformedActivity
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
      <div>
        <h2 className="text-2xl font-bold">Analytics & Engagement</h2>
        <p className="text-muted-foreground">
          Track document views, engagement, and viewer activity
        </p>
      </div>

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
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Views</CardTitle>
                <Eye className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics.totalViews}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg. Engagement</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{Math.round(analytics.avgEngagementScore)}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Time</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {Math.round(analytics.totalEngagementTime / 60)}m
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Unique Viewers</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics.uniqueViewers}</div>
              </CardContent>
            </Card>
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

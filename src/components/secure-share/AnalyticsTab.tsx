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
import { AdvancedEngagementMetrics } from './AdvancedEngagementMetrics';
import { DocumentLeaderboard } from './DocumentLeaderboard';
import { GeographicDeviceAnalytics } from './GeographicDeviceAnalytics';
import { PredictiveInsights } from './PredictiveInsights';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
      <div className="flex items-center justify-center py-12 sm:py-16">
        <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-3 border-watt-primary border-t-transparent shadow-watt-glow"></div>
      </div>
    );
  }

  const hasData = analytics && analytics.totalViews > 0;

  return (
    <div className="space-y-4 sm:space-y-6 px-2 sm:px-4 lg:px-0">
      {/* Header with controls - mobile optimized */}
      <div className="flex flex-col space-y-3 sm:space-y-0 sm:flex-row sm:justify-between sm:items-start gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-watt-primary to-watt-secondary bg-clip-text text-transparent">
            Analytics & Engagement
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">
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
        <Card className="border-watt-primary/20 bg-gradient-to-br from-card to-watt-primary/5 shadow-lg">
          <CardContent className="p-8 sm:p-12 text-center">
            <div className="flex flex-col items-center gap-4 animate-fade-in">
              <div className="p-4 sm:p-6 rounded-full bg-gradient-to-br from-watt-primary/10 to-watt-secondary/10 shadow-watt-glow">
                <BarChart3 className="w-10 h-10 sm:w-12 sm:h-12 text-watt-primary" />
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-semibold mb-2">No analytics data yet</h3>
                <p className="text-sm sm:text-base text-muted-foreground max-w-md">
                  Analytics will appear here once you share documents and viewers start engaging with them
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Key Metrics - Mobile optimized grid */}
          <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
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

          {/* Tabs for different analytics views - Mobile optimized */}
          <Tabs defaultValue="overview" className="space-y-4">
            <TabsList className="grid w-full grid-cols-2 xs:grid-cols-3 sm:grid-cols-5 h-auto p-1 bg-gradient-to-r from-watt-primary/10 to-watt-secondary/10 backdrop-blur-sm">
              <TabsTrigger 
                value="overview" 
                className="text-xs sm:text-sm data-[state=active]:bg-gradient-to-r data-[state=active]:from-watt-primary data-[state=active]:to-watt-primary/90 data-[state=active]:text-white transition-all"
              >
                Overview
              </TabsTrigger>
              <TabsTrigger 
                value="engagement" 
                className="text-xs sm:text-sm data-[state=active]:bg-gradient-to-r data-[state=active]:from-watt-primary data-[state=active]:to-watt-primary/90 data-[state=active]:text-white transition-all"
              >
                Engagement
              </TabsTrigger>
              <TabsTrigger 
                value="documents" 
                className="text-xs sm:text-sm data-[state=active]:bg-gradient-to-r data-[state=active]:from-watt-primary data-[state=active]:to-watt-primary/90 data-[state=active]:text-white transition-all"
              >
                Documents
              </TabsTrigger>
              <TabsTrigger 
                value="audience" 
                className="text-xs sm:text-sm data-[state=active]:bg-gradient-to-r data-[state=active]:from-watt-primary data-[state=active]:to-watt-primary/90 data-[state=active]:text-white transition-all"
              >
                Audience
              </TabsTrigger>
              <TabsTrigger 
                value="insights" 
                className="text-xs sm:text-sm data-[state=active]:bg-gradient-to-r data-[state=active]:from-watt-primary data-[state=active]:to-watt-primary/90 data-[state=active]:text-white transition-all col-span-2 xs:col-span-1"
              >
                Insights
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4 animate-fade-in">
              <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
                <EngagementChart />
                <TopDocumentsChart />
              </div>
              <ViewerActivityTable activities={analytics.recentActivity} />
            </TabsContent>

        <TabsContent value="engagement" className="space-y-4 animate-fade-in">
          <AdvancedEngagementMetrics dateRange={dateRange} />
        </TabsContent>

        <TabsContent value="documents" className="space-y-4 animate-fade-in">
          <DocumentLeaderboard dateRange={dateRange} />
        </TabsContent>

        <TabsContent value="audience" className="space-y-4 animate-fade-in">
          <GeographicDeviceAnalytics dateRange={dateRange} />
        </TabsContent>

        <TabsContent value="insights" className="space-y-4 animate-fade-in">
          <PredictiveInsights dateRange={dateRange} />
        </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
}

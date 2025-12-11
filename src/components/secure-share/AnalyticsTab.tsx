import { Card, CardContent } from '@/components/ui/card';
import { Eye, Clock, TrendingUp, Users, BarChart3 } from 'lucide-react';
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
import { SecureShareAnalyticsProvider, useSecureShareAnalytics } from '@/contexts/SecureShareAnalyticsContext';
import { AnalyticsPageSkeleton } from './analytics/AnalyticsSkeleton';
import { AnalyticsError } from './analytics/AnalyticsError';

function AnalyticsContent() {
  const { analytics, isLoading, error, refetch } = useSecureShareAnalytics();

  if (error) {
    return <AnalyticsError error={error} onRetry={refetch} />;
  }

  const hasData = analytics && analytics.totalViews > 0;

  return (
    <>
      {!hasData && !isLoading ? (
        <Card className="border-primary/20 bg-gradient-to-br from-card to-primary/5 shadow-lg">
          <CardContent className="p-8 sm:p-12 text-center">
            <div className="flex flex-col items-center gap-4 animate-fade-in">
              <div className="p-4 sm:p-6 rounded-full bg-gradient-to-br from-primary/10 to-secondary/10">
                <BarChart3 className="w-10 h-10 sm:w-12 sm:h-12 text-primary" />
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
          {/* Key Metrics */}
          <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <EnhancedKPICard
              title="Total Views"
              value={analytics?.totalViews || 0}
              icon={Eye}
              currentValue={analytics?.totalViews || 0}
              previousValue={analytics?.comparisonData?.totalViews || 0}
            />

            <EnhancedKPICard
              title="Avg. Engagement"
              value={analytics?.avgEngagementScore || 0}
              icon={TrendingUp}
              currentValue={analytics?.avgEngagementScore || 0}
              previousValue={analytics?.comparisonData?.avgEngagementScore || 0}
            />

            <EnhancedKPICard
              title="Total Time"
              value={`${Math.round((analytics?.totalEngagementTime || 0) / 60)}m`}
              icon={Clock}
              currentValue={analytics?.totalEngagementTime || 0}
              previousValue={analytics?.comparisonData?.totalEngagementTime || 0}
              formatter={(val) => `${Math.round(val / 60)}m`}
            />

            <EnhancedKPICard
              title="Unique Viewers"
              value={analytics?.uniqueViewers || 0}
              icon={Users}
              currentValue={analytics?.uniqueViewers || 0}
              previousValue={analytics?.comparisonData?.uniqueViewers || 0}
            />
          </div>

          {/* Tabs for different analytics views */}
          <Tabs defaultValue="overview" className="space-y-4">
            <TabsList className="grid w-full grid-cols-2 xs:grid-cols-3 sm:grid-cols-5 h-auto p-1 bg-gradient-to-r from-primary/10 to-secondary/10 backdrop-blur-sm">
              <TabsTrigger 
                value="overview" 
                className="text-xs sm:text-sm data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-primary/90 data-[state=active]:text-primary-foreground transition-all"
              >
                Overview
              </TabsTrigger>
              <TabsTrigger 
                value="engagement" 
                className="text-xs sm:text-sm data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-primary/90 data-[state=active]:text-primary-foreground transition-all"
              >
                Engagement
              </TabsTrigger>
              <TabsTrigger 
                value="documents" 
                className="text-xs sm:text-sm data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-primary/90 data-[state=active]:text-primary-foreground transition-all"
              >
                Documents
              </TabsTrigger>
              <TabsTrigger 
                value="audience" 
                className="text-xs sm:text-sm data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-primary/90 data-[state=active]:text-primary-foreground transition-all"
              >
                Audience
              </TabsTrigger>
              <TabsTrigger 
                value="insights" 
                className="text-xs sm:text-sm data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-primary/90 data-[state=active]:text-primary-foreground transition-all col-span-2 xs:col-span-1"
              >
                Insights
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4 animate-fade-in">
              <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
                <EngagementChart />
                <TopDocumentsChart />
              </div>
              <ViewerActivityTable activities={analytics?.recentActivity || []} />
            </TabsContent>

            <TabsContent value="engagement" className="space-y-4 animate-fade-in">
              <AdvancedEngagementMetrics />
            </TabsContent>

            <TabsContent value="documents" className="space-y-4 animate-fade-in">
              <DocumentLeaderboard />
            </TabsContent>

            <TabsContent value="audience" className="space-y-4 animate-fade-in">
              <GeographicDeviceAnalytics />
            </TabsContent>

            <TabsContent value="insights" className="space-y-4 animate-fade-in">
              <PredictiveInsights />
            </TabsContent>
          </Tabs>
        </>
      )}
    </>
  );
}

export function AnalyticsTab() {
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: subDays(new Date(), 30),
    to: new Date()
  });

  return (
    <SecureShareAnalyticsProvider dateRange={dateRange}>
      <AnalyticsTabInner dateRange={dateRange} setDateRange={setDateRange} />
    </SecureShareAnalyticsProvider>
  );
}

function AnalyticsTabInner({ 
  dateRange, 
  setDateRange 
}: { 
  dateRange: DateRange | undefined;
  setDateRange: (range: DateRange | undefined) => void;
}) {
  const { analytics, isLoading } = useSecureShareAnalytics();

  if (isLoading) {
    return <AnalyticsPageSkeleton />;
  }

  const hasData = analytics && analytics.totalViews > 0;

  return (
    <div className="space-y-4 sm:space-y-6 px-2 sm:px-4 lg:px-0">
      {/* Header with controls */}
      <div className="flex flex-col space-y-3 sm:space-y-0 sm:flex-row sm:justify-between sm:items-start gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
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

      <AnalyticsContent />
    </div>
  );
}

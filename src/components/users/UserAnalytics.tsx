import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { 
  Activity, 
  Clock, 
  Eye, 
  MousePointerClick, 
  TrendingUp,
  Calendar,
  BarChart3
} from 'lucide-react';
import { format } from 'date-fns';

interface UserAnalyticsProps {
  userId: string;
}

interface AnalyticsSummary {
  total_sessions: number;
  total_login_count: number;
  avg_session_duration_minutes: number;
  total_page_visits: number;
  unique_pages_visited: number;
  total_feature_uses: number;
  unique_features_used: number;
  last_login: string | null;
  most_visited_pages: Array<{ page: string; visits: number }>;
  most_used_features: Array<{ feature: string; uses: number }>;
}

export function UserAnalytics({ userId }: UserAnalyticsProps) {
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, [userId]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .rpc('get_user_analytics_summary', { target_user_id: userId });

      if (error) throw error;
      
      if (data && data.length > 0) {
        const rawData = data[0];
        setAnalytics({
          ...rawData,
          most_visited_pages: Array.isArray(rawData.most_visited_pages) 
            ? (rawData.most_visited_pages as Array<{ page: string; visits: number }>)
            : [],
          most_used_features: Array.isArray(rawData.most_used_features) 
            ? (rawData.most_used_features as Array<{ feature: string; uses: number }>)
            : []
        });
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!analytics) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-muted-foreground text-center">No analytics data available</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Activity className="w-4 h-4 text-blue-600" />
              Total Sessions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.total_sessions}</div>
            <p className="text-xs text-muted-foreground mt-1">Login events</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Clock className="w-4 h-4 text-green-600" />
              Avg Session
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics.avg_session_duration_minutes.toFixed(1)}m
            </div>
            <p className="text-xs text-muted-foreground mt-1">Average duration</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Eye className="w-4 h-4 text-purple-600" />
              Page Visits
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.total_page_visits}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {analytics.unique_pages_visited} unique pages
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <MousePointerClick className="w-4 h-4 text-orange-600" />
              Feature Uses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.total_feature_uses}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {analytics.unique_features_used} features used
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Last Login */}
      {analytics.last_login && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Last Login
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">{format(new Date(analytics.last_login), 'PPpp')}</p>
          </CardContent>
        </Card>
      )}

      {/* Detailed Analytics */}
      <Tabs defaultValue="pages" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="pages">
            <Eye className="w-4 h-4 mr-2" />
            Top Pages
          </TabsTrigger>
          <TabsTrigger value="features">
            <BarChart3 className="w-4 h-4 mr-2" />
            Top Features
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pages">
          <Card>
            <CardHeader>
              <CardTitle>Most Visited Pages</CardTitle>
              <CardDescription>Pages this user visits most frequently</CardDescription>
            </CardHeader>
            <CardContent>
              {analytics.most_visited_pages.length > 0 ? (
                <div className="space-y-3">
                  {analytics.most_visited_pages.map((page, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <Badge variant="outline" className="shrink-0">#{index + 1}</Badge>
                        <span className="text-sm truncate">{page.page}</span>
                      </div>
                      <Badge>{page.visits} visits</Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No page visit data available</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="features">
          <Card>
            <CardHeader>
              <CardTitle>Most Used Features</CardTitle>
              <CardDescription>Features this user interacts with most</CardDescription>
            </CardHeader>
            <CardContent>
              {analytics.most_used_features.length > 0 ? (
                <div className="space-y-3">
                  {analytics.most_used_features.map((feature, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <Badge variant="outline" className="shrink-0">#{index + 1}</Badge>
                        <span className="text-sm truncate">{feature.feature}</span>
                      </div>
                      <Badge>{feature.uses} uses</Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No feature usage data available</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

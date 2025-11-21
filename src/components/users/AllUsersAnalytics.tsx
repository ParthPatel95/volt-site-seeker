import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { 
  Activity, 
  Clock, 
  Eye, 
  MousePointerClick, 
  TrendingUp,
  Users
} from 'lucide-react';
import { format } from 'date-fns';

interface UserAnalytics {
  user_id: string;
  email: string;
  full_name: string;
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

export function AllUsersAnalytics() {
  const [allAnalytics, setAllAnalytics] = useState<UserAnalytics[]>([]);
  const [loading, setLoading] = useState(true);
  const [totals, setTotals] = useState({
    totalUsers: 0,
    totalSessions: 0,
    totalPageVisits: 0,
    totalFeatureUses: 0,
    avgSessionDuration: 0
  });

  useEffect(() => {
    fetchAllAnalytics();
  }, []);

  const fetchAllAnalytics = async () => {
    try {
      setLoading(true);
      
      // Get all users who have logged in
      const { data: sessions, error: sessionsError } = await supabase
        .from('user_sessions')
        .select('user_id')
        .order('session_start', { ascending: false });

      if (sessionsError) throw sessionsError;

      // Get unique user IDs
      const uniqueUserIds = [...new Set(sessions?.map(s => s.user_id) || [])];

      // Fetch analytics for each user
      const analyticsPromises = uniqueUserIds.map(async (userId) => {
        const { data, error } = await supabase
          .rpc('get_user_analytics_summary', { target_user_id: userId });

        if (error) {
          console.error(`Error fetching analytics for user ${userId}:`, error);
          return null;
        }

        if (data && data.length > 0) {
          const rawData = data[0];
          
          // Get user info
          const { data: userData } = await supabase
            .from('profiles')
            .select('email, full_name')
            .eq('id', userId)
            .single();

          return {
            user_id: userId,
            email: userData?.email || 'Unknown',
            full_name: userData?.full_name || 'Unknown User',
            ...rawData,
            most_visited_pages: Array.isArray(rawData.most_visited_pages) 
              ? rawData.most_visited_pages 
              : [],
            most_used_features: Array.isArray(rawData.most_used_features) 
              ? rawData.most_used_features 
              : []
          };
        }
        return null;
      });

      const results = await Promise.all(analyticsPromises);
      const validAnalytics = results.filter(a => a !== null) as UserAnalytics[];
      
      // Sort by most recent activity
      validAnalytics.sort((a, b) => {
        if (!a.last_login) return 1;
        if (!b.last_login) return -1;
        return new Date(b.last_login).getTime() - new Date(a.last_login).getTime();
      });

      setAllAnalytics(validAnalytics);

      // Calculate totals
      const totals = validAnalytics.reduce((acc, curr) => ({
        totalUsers: acc.totalUsers + 1,
        totalSessions: acc.totalSessions + curr.total_sessions,
        totalPageVisits: acc.totalPageVisits + curr.total_page_visits,
        totalFeatureUses: acc.totalFeatureUses + curr.total_feature_uses,
        avgSessionDuration: acc.avgSessionDuration + curr.avg_session_duration_minutes
      }), {
        totalUsers: 0,
        totalSessions: 0,
        totalPageVisits: 0,
        totalFeatureUses: 0,
        avgSessionDuration: 0
      });

      totals.avgSessionDuration = totals.avgSessionDuration / validAnalytics.length || 0;

      setTotals(totals);
    } catch (error) {
      console.error('Error fetching all analytics:', error);
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

  if (allAnalytics.length === 0) {
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
      {/* Overall Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="w-4 h-4 text-purple-600" />
              Active Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totals.totalUsers}</div>
            <p className="text-xs text-muted-foreground mt-1">Users tracked</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Activity className="w-4 h-4 text-blue-600" />
              Total Sessions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totals.totalSessions}</div>
            <p className="text-xs text-muted-foreground mt-1">All logins</p>
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
              {totals.avgSessionDuration.toFixed(1)}m
            </div>
            <p className="text-xs text-muted-foreground mt-1">Average duration</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Eye className="w-4 h-4 text-orange-600" />
              Page Views
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totals.totalPageVisits}</div>
            <p className="text-xs text-muted-foreground mt-1">All visits</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <MousePointerClick className="w-4 h-4 text-red-600" />
              Feature Uses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totals.totalFeatureUses}</div>
            <p className="text-xs text-muted-foreground mt-1">All interactions</p>
          </CardContent>
        </Card>
      </div>

      {/* Individual User Analytics */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Individual User Activity</h3>
        <div className="grid grid-cols-1 gap-4">
          {allAnalytics.map((userAnalytics) => (
            <Card key={userAnalytics.user_id} className="overflow-hidden">
              <CardHeader className="bg-muted/50 pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base">{userAnalytics.full_name}</CardTitle>
                    <p className="text-sm text-muted-foreground">{userAnalytics.email}</p>
                  </div>
                  {userAnalytics.last_login && (
                    <Badge variant="outline">
                      Last seen: {format(new Date(userAnalytics.last_login), 'MMM d, yyyy HH:mm')}
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="p-4">
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">Sessions</div>
                    <div className="text-lg font-semibold">{userAnalytics.total_sessions}</div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">Logins</div>
                    <div className="text-lg font-semibold">{userAnalytics.total_login_count}</div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">Avg Duration</div>
                    <div className="text-lg font-semibold">
                      {userAnalytics.avg_session_duration_minutes.toFixed(1)}m
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">Page Visits</div>
                    <div className="text-lg font-semibold">{userAnalytics.total_page_visits}</div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">Unique Pages</div>
                    <div className="text-lg font-semibold">{userAnalytics.unique_pages_visited}</div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">Feature Uses</div>
                    <div className="text-lg font-semibold">{userAnalytics.total_feature_uses}</div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">Unique Features</div>
                    <div className="text-lg font-semibold">{userAnalytics.unique_features_used}</div>
                  </div>
                </div>

                {/* Most Visited Pages and Features */}
                {(userAnalytics.most_visited_pages.length > 0 || userAnalytics.most_used_features.length > 0) && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 pt-4 border-t">
                    {userAnalytics.most_visited_pages.length > 0 && (
                      <div>
                        <div className="text-xs font-medium text-muted-foreground mb-2">
                          Top Pages
                        </div>
                        <div className="space-y-1">
                          {userAnalytics.most_visited_pages.slice(0, 3).map((page, idx) => (
                            <div key={idx} className="flex items-center justify-between text-sm">
                              <span className="truncate">{page.page}</span>
                              <Badge variant="secondary" className="ml-2">{page.visits}</Badge>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {userAnalytics.most_used_features.length > 0 && (
                      <div>
                        <div className="text-xs font-medium text-muted-foreground mb-2">
                          Top Features
                        </div>
                        <div className="space-y-1">
                          {userAnalytics.most_used_features.slice(0, 3).map((feature, idx) => (
                            <div key={idx} className="flex items-center justify-between text-sm">
                              <span className="truncate">{feature.feature}</span>
                              <Badge variant="secondary" className="ml-2">{feature.uses}</Badge>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

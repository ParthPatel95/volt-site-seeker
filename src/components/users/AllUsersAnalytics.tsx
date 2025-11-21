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
  Users,
  Calendar,
  Globe,
  Smartphone,
  BarChart3
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';

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

interface PageActivity {
  page: string;
  visits: number;
  uniqueUsers: number;
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
  const [topPages, setTopPages] = useState<PageActivity[]>([]);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [expandedUser, setExpandedUser] = useState<string | null>(null);
  const [userDetails, setUserDetails] = useState<any>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  const parseUserAgent = (userAgent: string) => {
    if (!userAgent) return { browser: 'Unknown', os: 'Unknown', device: 'Desktop' };
    
    let browser = 'Unknown';
    let os = 'Unknown';
    let device = 'Desktop';

    // Browser detection
    if (userAgent.includes('Chrome')) browser = 'Chrome';
    else if (userAgent.includes('Firefox')) browser = 'Firefox';
    else if (userAgent.includes('Safari')) browser = 'Safari';
    else if (userAgent.includes('Edge')) browser = 'Edge';

    // OS detection
    if (userAgent.includes('Windows')) os = 'Windows';
    else if (userAgent.includes('Mac')) os = 'macOS';
    else if (userAgent.includes('Linux')) os = 'Linux';
    else if (userAgent.includes('Android')) os = 'Android';
    else if (userAgent.includes('iOS')) os = 'iOS';

    // Device detection
    if (userAgent.includes('Mobile') || userAgent.includes('Android') || userAgent.includes('iOS')) {
      device = 'Mobile';
    }

    return { browser, os, device };
  };

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

      // Fetch global page activity
      const { data: pageData } = await supabase
        .from('user_page_visits')
        .select('page_path, user_id');

      if (pageData) {
        const pageMap = new Map<string, Set<string>>();
        pageData.forEach(visit => {
          if (!pageMap.has(visit.page_path)) {
            pageMap.set(visit.page_path, new Set());
          }
          pageMap.get(visit.page_path)!.add(visit.user_id);
        });

        const pages: PageActivity[] = Array.from(pageMap.entries()).map(([page, users]) => ({
          page,
          visits: pageData.filter(v => v.page_path === page).length,
          uniqueUsers: users.size
        }));

        pages.sort((a, b) => b.visits - a.visits);
        setTopPages(pages.slice(0, 10));
      }

      // Fetch recent activity grouped by user
      const { data: recentSessions } = await supabase
        .from('user_sessions')
        .select(`
          id,
          user_id,
          session_start,
          session_end,
          duration_seconds,
          user_agent
        `)
        .order('session_start', { ascending: false })
        .limit(50);

      if (recentSessions) {
        // Group by user
        const userSessionMap = new Map<string, any[]>();
        recentSessions.forEach(session => {
          if (!userSessionMap.has(session.user_id)) {
            userSessionMap.set(session.user_id, []);
          }
          userSessionMap.get(session.user_id)!.push(session);
        });

        // Get user data for each unique user
        const groupedActivity = await Promise.all(
          Array.from(userSessionMap.entries()).map(async ([userId, sessions]) => {
            const { data: userData } = await supabase
              .from('profiles')
              .select('email, full_name')
              .eq('id', userId)
              .single();

            const latestSession = sessions[0];
            const totalSessions = sessions.length;
            const { browser, os, device } = parseUserAgent(latestSession.user_agent || '');

            return {
              user_id: userId,
              user: userData,
              sessions,
              latestSession,
              totalSessions,
              browser,
              os,
              device
            };
          })
        );

        // Sort by most recent activity
        groupedActivity.sort((a, b) => 
          new Date(b.latestSession.session_start).getTime() - new Date(a.latestSession.session_start).getTime()
        );

        setRecentActivity(groupedActivity.slice(0, 10));
      }
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

  const fetchUserDetails = async (userId: string) => {
    setLoadingDetails(true);
    try {
      // Fetch all sessions for this user
      const { data: sessions } = await supabase
        .from('user_sessions')
        .select('*')
        .eq('user_id', userId)
        .order('session_start', { ascending: false });

      // Fetch page visits
      const { data: pageVisits } = await supabase
        .from('user_page_visits')
        .select('*')
        .eq('user_id', userId)
        .order('visited_at', { ascending: false })
        .limit(20);

      // Fetch feature usage
      const { data: featureUsage } = await supabase
        .from('user_feature_usage')
        .select('*')
        .eq('user_id', userId)
        .order('used_at', { ascending: false })
        .limit(20);

      setUserDetails({
        sessions: sessions || [],
        pageVisits: pageVisits || [],
        featureUsage: featureUsage || []
      });
    } catch (error) {
      console.error('Error fetching user details:', error);
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleUserClick = (userId: string) => {
    if (expandedUser === userId) {
      setExpandedUser(null);
      setUserDetails(null);
    } else {
      setExpandedUser(userId);
      fetchUserDetails(userId);
    }
  };

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

      {/* Global Activity Insights */}
      <div>
        {/* Top Pages Across All Users */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5 text-blue-600" />
              Most Visited Pages
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topPages.length > 0 ? (
                topPages.map((page, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{page.page}</div>
                      <div className="text-xs text-muted-foreground">
                        {page.uniqueUsers} {page.uniqueUsers === 1 ? 'user' : 'users'}
                      </div>
                    </div>
                    <Badge variant="secondary" className="ml-2">
                      {page.visits} visits
                    </Badge>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground text-center py-4">No page visits recorded</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity Log */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-purple-600" />
            Recent User Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentActivity.length > 0 ? (
              recentActivity.map((userActivity) => {
                const isExpanded = expandedUser === userActivity.user_id;
                return (
                  <div key={userActivity.user_id} className="border rounded-lg overflow-hidden">
                    <div 
                      className="flex items-center justify-between p-3 bg-muted/50 hover:bg-muted/70 cursor-pointer transition-colors"
                      onClick={() => handleUserClick(userActivity.user_id)}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="font-medium">{userActivity.user?.full_name || userActivity.user?.email || 'Unknown User'}</div>
                        <div className="text-xs text-muted-foreground flex items-center gap-2 mt-1 flex-wrap">
                          <Calendar className="w-3 h-3" />
                          {formatDistanceToNow(new Date(userActivity.latestSession.session_start), { addSuffix: true })}
                          <span className="mx-1">•</span>
                          <Badge variant="outline" className="text-xs">
                            {userActivity.totalSessions} {userActivity.totalSessions === 1 ? 'session' : 'sessions'}
                          </Badge>
                        </div>
                        <div className="text-xs text-muted-foreground flex items-center gap-2 mt-1">
                          <Globe className="w-3 h-3" />
                          {userActivity.browser} on {userActivity.os}
                          <span className="mx-1">•</span>
                          <Smartphone className="w-3 h-3" />
                          {userActivity.device}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={userActivity.latestSession.session_end ? 'secondary' : 'default'}>
                          {userActivity.latestSession.session_end ? 'Inactive' : 'Active'}
                        </Badge>
                        <div className={`transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </div>
                    </div>
                    
                    {isExpanded && (
                      <div className="p-4 bg-background border-t">
                        {loadingDetails ? (
                          <div className="flex items-center justify-center py-4">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                          </div>
                        ) : userDetails ? (
                          <div className="space-y-4">
                            {/* Login Sessions */}
                            <div>
                              <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                                <Clock className="w-4 h-4" />
                                Login Sessions ({userDetails.sessions.length})
                              </h4>
                              <div className="space-y-2 max-h-40 overflow-y-auto">
                                {userDetails.sessions.map((session: any) => (
                                  <div key={session.id} className="text-xs p-2 bg-muted/30 rounded flex items-center justify-between">
                                    <span>{format(new Date(session.session_start), 'MMM d, yyyy h:mm a')}</span>
                                    {session.duration_seconds && (
                                      <span className="text-muted-foreground">
                                        {Math.floor(session.duration_seconds / 60)}m {session.duration_seconds % 60}s
                                      </span>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Pages Visited */}
                            <div>
                              <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                                <Eye className="w-4 h-4" />
                                Pages Visited ({userDetails.pageVisits.length})
                              </h4>
                              <div className="space-y-2 max-h-40 overflow-y-auto">
                                {userDetails.pageVisits.length > 0 ? (
                                  userDetails.pageVisits.map((visit: any) => (
                                    <div key={visit.id} className="text-xs p-2 bg-muted/30 rounded flex items-center justify-between">
                                      <span className="font-mono truncate flex-1">{visit.page_path}</span>
                                      <span className="text-muted-foreground ml-2">
                                        {format(new Date(visit.visited_at), 'MMM d, h:mm a')}
                                      </span>
                                    </div>
                                  ))
                                ) : (
                                  <p className="text-xs text-muted-foreground">No pages visited</p>
                                )}
                              </div>
                            </div>

                            {/* Features Used */}
                            <div>
                              <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                                <MousePointerClick className="w-4 h-4" />
                                Features Used ({userDetails.featureUsage.length})
                              </h4>
                              <div className="space-y-2 max-h-40 overflow-y-auto">
                                {userDetails.featureUsage.length > 0 ? (
                                  userDetails.featureUsage.map((usage: any) => (
                                    <div key={usage.id} className="text-xs p-2 bg-muted/30 rounded flex items-center justify-between">
                                      <span className="font-medium">{usage.feature_name}</span>
                                      <span className="text-muted-foreground ml-2">
                                        {format(new Date(usage.used_at), 'MMM d, h:mm a')}
                                      </span>
                                    </div>
                                  ))
                                ) : (
                                  <p className="text-xs text-muted-foreground">No features used</p>
                                )}
                              </div>
                            </div>
                          </div>
                        ) : null}
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <p className="text-muted-foreground text-center py-4">No recent activity</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Individual User Analytics */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Individual User Activity</h3>
        <div className="grid grid-cols-1 gap-4">
          {allAnalytics.map((userAnalytics) => (
            <Card key={userAnalytics.user_id} className="overflow-hidden">
              <CardHeader className="bg-muted/50 pb-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <CardTitle className="text-base">{userAnalytics.full_name}</CardTitle>
                    <p className="text-sm text-muted-foreground">{userAnalytics.email}</p>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    {userAnalytics.last_login ? (
                      <Badge variant="outline">
                        <Calendar className="w-3 h-3 mr-1" />
                        {formatDistanceToNow(new Date(userAnalytics.last_login), { addSuffix: true })}
                      </Badge>
                    ) : (
                      <Badge variant="secondary">Never logged in</Badge>
                    )}
                    <Badge variant={userAnalytics.total_sessions > 0 ? 'default' : 'secondary'}>
                      {userAnalytics.total_sessions > 0 ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
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

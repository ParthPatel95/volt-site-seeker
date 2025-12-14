import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Eye, Users, Clock, TrendingUp, Link as LinkIcon, Activity } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useRealTimeViewerTracking } from '@/hooks/useRealTimeViewerTracking';
import { subDays } from 'date-fns';

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ElementType;
  trend?: number;
  color: string;
  bgColor: string;
}

function StatsCard({ title, value, subtitle, icon: Icon, trend, color, bgColor }: StatsCardProps) {
  return (
    <Card className="p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className={`p-2.5 rounded-lg ${bgColor}`}>
          <Icon className={`w-5 h-5 ${color}`} />
        </div>
        {trend !== undefined && (
          <Badge 
            variant="secondary" 
            className={`text-xs ${trend >= 0 ? 'bg-green-500/10 text-green-600' : 'bg-red-500/10 text-red-600'}`}
          >
            {trend >= 0 ? '+' : ''}{trend}%
          </Badge>
        )}
      </div>
      <div className="mt-3">
        <p className="text-2xl font-bold">{value}</p>
        <p className="text-sm text-muted-foreground">{title}</p>
        {subtitle && (
          <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
        )}
      </div>
    </Card>
  );
}

export function LinkStatsOverview() {
  const { totalActiveViewers } = useRealTimeViewerTracking();

  const { data: stats } = useQuery({
    queryKey: ['link-stats-overview'],
    queryFn: async () => {
      const now = new Date();
      const last7Days = subDays(now, 7);
      const last14Days = subDays(now, 14);

      // Get all links
      const { data: links } = await supabase
        .from('secure_links')
        .select('id, status, expires_at, created_at');

      // Get viewer activity
      const { data: activity } = await supabase
        .from('viewer_activity')
        .select('id, opened_at, total_time_seconds, engagement_score, viewer_email, viewer_name')
        .gte('opened_at', last14Days.toISOString());

      const recentActivity = activity?.filter(a => new Date(a.opened_at) >= last7Days) || [];
      const previousActivity = activity?.filter(a => 
        new Date(a.opened_at) < last7Days && new Date(a.opened_at) >= last14Days
      ) || [];

      const activeLinks = links?.filter(l => 
        l.status === 'active' && (!l.expires_at || new Date(l.expires_at) > now)
      ).length || 0;

      const totalViews = recentActivity.length;
      const previousViews = previousActivity.length;
      const viewsTrend = previousViews > 0 
        ? Math.round(((totalViews - previousViews) / previousViews) * 100)
        : totalViews > 0 ? 100 : 0;

      const uniqueViewers = new Set(recentActivity.map(a => a.viewer_email || a.viewer_name)).size;
      const previousUniqueViewers = new Set(previousActivity.map(a => a.viewer_email || a.viewer_name)).size;
      const viewersTrend = previousUniqueViewers > 0
        ? Math.round(((uniqueViewers - previousUniqueViewers) / previousUniqueViewers) * 100)
        : uniqueViewers > 0 ? 100 : 0;

      const avgEngagement = recentActivity.length > 0
        ? Math.round(recentActivity.reduce((sum, a) => sum + (a.engagement_score || 0), 0) / recentActivity.length)
        : 0;

      const totalTime = recentActivity.reduce((sum, a) => sum + (a.total_time_seconds || 0), 0);
      const totalTimeMinutes = Math.round(totalTime / 60);

      return {
        totalLinks: links?.length || 0,
        activeLinks,
        totalViews,
        viewsTrend,
        uniqueViewers,
        viewersTrend,
        avgEngagement,
        totalTimeMinutes
      };
    },
    refetchInterval: 30000 // Refresh every 30 seconds
  });

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <StatsCard
        title="Active Links"
        value={stats?.activeLinks || 0}
        subtitle={`${stats?.totalLinks || 0} total`}
        icon={LinkIcon}
        color="text-primary"
        bgColor="bg-primary/10"
      />
      
      <StatsCard
        title="Views (7 days)"
        value={stats?.totalViews || 0}
        icon={Eye}
        trend={stats?.viewsTrend}
        color="text-blue-500"
        bgColor="bg-blue-500/10"
      />
      
      <StatsCard
        title="Unique Viewers"
        value={stats?.uniqueViewers || 0}
        icon={Users}
        trend={stats?.viewersTrend}
        color="text-green-500"
        bgColor="bg-green-500/10"
      />
      
      <StatsCard
        title="Avg Engagement"
        value={`${stats?.avgEngagement || 0}%`}
        subtitle={`${stats?.totalTimeMinutes || 0}m total time`}
        icon={TrendingUp}
        color="text-purple-500"
        bgColor="bg-purple-500/10"
      />

      {totalActiveViewers > 0 && (
        <Card className="col-span-2 lg:col-span-4 p-4 bg-green-500/5 border-green-500/20">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-green-500/20 animate-pulse">
              <Activity className="w-5 h-5 text-green-500" />
            </div>
            <div>
              <p className="font-semibold text-green-600">
                {totalActiveViewers} viewer{totalActiveViewers !== 1 ? 's' : ''} active now
              </p>
              <p className="text-sm text-muted-foreground">
                Someone is viewing your documents right now
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}

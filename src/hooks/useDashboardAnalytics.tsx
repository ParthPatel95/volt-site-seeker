import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface DashboardViewAnalytics {
  total_views: number;
  unique_viewers: number;
  avg_session_duration: number;
  views_by_date: { date: string; views: number }[];
  top_viewers: { viewer_email: string; view_count: number }[];
  recent_views: {
    id: string;
    viewed_at: string;
    viewer_email: string | null;
    viewer_name: string | null;
    session_duration: number | null;
    viewer_ip: string | null;
  }[];
}

export function useDashboardAnalytics(dashboardId: string) {
  const [analytics, setAnalytics] = useState<DashboardViewAnalytics | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (dashboardId) {
      fetchAnalytics();
    }
  }, [dashboardId]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);

      // First, get the share links for this dashboard
      const { data: shares, error: sharesError } = await supabase
        .from('aeso_shared_dashboards')
        .select('id')
        .eq('dashboard_id', dashboardId);

      if (sharesError) throw sharesError;

      if (!shares || shares.length === 0) {
        setAnalytics({
          total_views: 0,
          unique_viewers: 0,
          avg_session_duration: 0,
          views_by_date: [],
          top_viewers: [],
          recent_views: []
        });
        return;
      }

      const shareIds = shares.map(s => s.id);

      // Fetch all views for these shares
      const { data: views, error: viewsError } = await supabase
        .from('aeso_dashboard_views')
        .select('*')
        .in('shared_dashboard_id', shareIds)
        .order('viewed_at', { ascending: false });

      if (viewsError) throw viewsError;

      // Calculate analytics
      const totalViews = views?.length || 0;
      const uniqueViewers = new Set(views?.map(v => v.viewer_email || v.viewer_ip).filter(Boolean)).size;
      const avgDuration = views?.reduce((sum, v) => sum + (v.session_duration || 0), 0) / (totalViews || 1);

      // Views by date (last 30 days)
      const viewsByDate = views?.reduce((acc, view) => {
        const date = new Date(view.viewed_at).toISOString().split('T')[0];
        acc[date] = (acc[date] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const viewsByDateArray = Object.entries(viewsByDate || {})
        .map(([date, views]) => ({ date, views }))
        .sort((a, b) => a.date.localeCompare(b.date))
        .slice(-30);

      // Top viewers
      const viewerCounts = views?.reduce((acc, view) => {
        const email = view.viewer_email || 'Anonymous';
        acc[email] = (acc[email] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const topViewers = Object.entries(viewerCounts || {})
        .map(([viewer_email, view_count]) => ({ viewer_email, view_count }))
        .sort((a, b) => b.view_count - a.view_count)
        .slice(0, 10);

      setAnalytics({
        total_views: totalViews,
        unique_viewers: uniqueViewers,
        avg_session_duration: Math.round(avgDuration),
        views_by_date: viewsByDateArray,
        top_viewers: topViewers,
        recent_views: views?.slice(0, 20) || []
      });
    } catch (error: any) {
      console.error('Error fetching analytics:', error);
      toast({
        title: 'Error loading analytics',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return { analytics, loading, refetch: fetchAnalytics };
}

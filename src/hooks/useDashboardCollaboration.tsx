import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Comment {
  id: string;
  dashboard_id: string;
  widget_id: string | null;
  user_id: string;
  comment_text: string;
  mentioned_users: string[];
  parent_comment_id: string | null;
  created_at: string;
  updated_at: string;
  is_resolved: boolean;
  user_email?: string;
  user_name?: string;
}

interface DashboardVersion {
  id: string;
  dashboard_id: string;
  version_number: number;
  created_by: string;
  created_at: string;
  dashboard_snapshot: any;
  widgets_snapshot: any;
  change_description: string | null;
  user_email?: string;
}

interface Activity {
  id: string;
  dashboard_id: string;
  user_id: string;
  activity_type: string;
  activity_data: any;
  created_at: string;
  user_email?: string;
}

interface PresenceState {
  user_id: string;
  user_email: string;
  viewing_widget_id?: string;
  last_seen: string;
}

export function useDashboardCollaboration(dashboardId: string) {
  const { toast } = useToast();
  const [comments, setComments] = useState<Comment[]>([]);
  const [versions, setVersions] = useState<DashboardVersion[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [activeUsers, setActiveUsers] = useState<PresenceState[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch comments
  const fetchComments = async () => {
    try {
      const { data, error } = await supabase
        .from('dashboard_comments')
        .select(`
          *,
          profiles:user_id (email, full_name)
        `)
        .eq('dashboard_id', dashboardId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const commentsWithUser = (data || []).map((c: any) => ({
        ...c,
        user_email: c.profiles?.email,
        user_name: c.profiles?.full_name,
      }));

      setComments(commentsWithUser);
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  };

  // Fetch versions
  const fetchVersions = async () => {
    try {
      const { data, error } = await supabase
        .from('dashboard_versions')
        .select(`
          *,
          profiles:created_by (email)
        `)
        .eq('dashboard_id', dashboardId)
        .order('version_number', { ascending: false })
        .limit(20);

      if (error) throw error;

      const versionsWithUser = (data || []).map((v: any) => ({
        ...v,
        user_email: v.profiles?.email,
      }));

      setVersions(versionsWithUser);
    } catch (error) {
      console.error('Error fetching versions:', error);
    }
  };

  // Fetch activity log
  const fetchActivities = async () => {
    try {
      const { data, error } = await supabase
        .from('dashboard_activity_log')
        .select(`
          *,
          profiles:user_id (email)
        `)
        .eq('dashboard_id', dashboardId)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      const activitiesWithUser = (data || []).map((a: any) => ({
        ...a,
        user_email: a.profiles?.email,
      }));

      setActivities(activitiesWithUser);
    } catch (error) {
      console.error('Error fetching activities:', error);
    }
  };

  // Add comment
  const addComment = async (
    commentText: string,
    widgetId?: string,
    mentionedUsers: string[] = [],
    parentCommentId?: string
  ) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('dashboard_comments')
        .insert({
          dashboard_id: dashboardId,
          widget_id: widgetId || null,
          user_id: user.id,
          comment_text: commentText,
          mentioned_users: mentionedUsers,
          parent_comment_id: parentCommentId || null,
        });

      if (error) throw error;

      // Log activity
      await logActivity('comment_added', { 
        comment_text: commentText.substring(0, 100),
        widget_id: widgetId 
      });

      toast({
        title: 'Comment added',
        description: 'Your comment has been posted',
      });

      await fetchComments();
    } catch (error) {
      console.error('Error adding comment:', error);
      toast({
        title: 'Error',
        description: 'Failed to add comment',
        variant: 'destructive',
      });
    }
  };

  // Resolve comment
  const resolveComment = async (commentId: string) => {
    try {
      const { error } = await supabase
        .from('dashboard_comments')
        .update({ is_resolved: true })
        .eq('id', commentId);

      if (error) throw error;

      await fetchComments();
    } catch (error) {
      console.error('Error resolving comment:', error);
    }
  };

  // Delete comment
  const deleteComment = async (commentId: string) => {
    try {
      const { error } = await supabase
        .from('dashboard_comments')
        .delete()
        .eq('id', commentId);

      if (error) throw error;

      await fetchComments();
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  };

  // Log activity
  const logActivity = async (activityType: string, activityData: any = {}) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await supabase
        .from('dashboard_activity_log')
        .insert({
          dashboard_id: dashboardId,
          user_id: user.id,
          activity_type: activityType,
          activity_data: activityData,
        });
    } catch (error) {
      console.error('Error logging activity:', error);
    }
  };

  // Setup realtime subscriptions
  useEffect(() => {
    fetchComments();
    fetchVersions();
    fetchActivities();

    // Subscribe to realtime comments
    const commentsChannel = supabase
      .channel('dashboard-comments')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'dashboard_comments',
          filter: `dashboard_id=eq.${dashboardId}`,
        },
        () => {
          fetchComments();
        }
      )
      .subscribe();

    // Subscribe to realtime activities
    const activityChannel = supabase
      .channel('dashboard-activity')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'dashboard_activity_log',
          filter: `dashboard_id=eq.${dashboardId}`,
        },
        () => {
          fetchActivities();
        }
      )
      .subscribe();

    // Setup presence tracking
    const presenceChannel = supabase.channel(`dashboard-presence:${dashboardId}`, {
      config: { presence: { key: dashboardId } },
    });

    presenceChannel
      .on('presence', { event: 'sync' }, () => {
        const state = presenceChannel.presenceState();
        const users: PresenceState[] = [];
        Object.keys(state).forEach(key => {
          const presences = state[key] as any[];
          presences.forEach(presence => {
            users.push(presence as PresenceState);
          });
        });
        setActiveUsers(users);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            await presenceChannel.track({
              user_id: user.id,
              user_email: user.email,
              last_seen: new Date().toISOString(),
            });
          }
        }
      });

    return () => {
      supabase.removeChannel(commentsChannel);
      supabase.removeChannel(activityChannel);
      supabase.removeChannel(presenceChannel);
    };
  }, [dashboardId]);

  return {
    comments,
    versions,
    activities,
    activeUsers,
    loading,
    addComment,
    resolveComment,
    deleteComment,
    logActivity,
    fetchComments,
    fetchVersions,
    fetchActivities,
  };
}

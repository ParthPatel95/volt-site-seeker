import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Activity, MessageSquare, Edit, Trash2, Plus, Eye, Share2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useDashboardCollaboration } from '@/hooks/useDashboardCollaboration';

interface DashboardActivityFeedProps {
  dashboardId: string;
}

const ACTIVITY_ICONS: Record<string, any> = {
  comment_added: MessageSquare,
  dashboard_updated: Edit,
  widget_added: Plus,
  widget_deleted: Trash2,
  dashboard_viewed: Eye,
  dashboard_shared: Share2,
};

const ACTIVITY_COLORS: Record<string, string> = {
  comment_added: 'text-blue-500',
  dashboard_updated: 'text-yellow-500',
  widget_added: 'text-green-500',
  widget_deleted: 'text-red-500',
  dashboard_viewed: 'text-purple-500',
  dashboard_shared: 'text-indigo-500',
};

export function DashboardActivityFeed({ dashboardId }: DashboardActivityFeedProps) {
  const { activities } = useDashboardCollaboration(dashboardId);

  const getActivityIcon = (type: string) => {
    return ACTIVITY_ICONS[type] || Activity;
  };

  const getActivityColor = (type: string) => {
    return ACTIVITY_COLORS[type] || 'text-muted-foreground';
  };

  const getActivityDescription = (activity: any) => {
    const user = activity.user_email?.split('@')[0] || 'Someone';
    
    switch (activity.activity_type) {
      case 'comment_added':
        return `${user} added a comment`;
      case 'dashboard_updated':
        return `${user} updated the dashboard`;
      case 'widget_added':
        return `${user} added a widget`;
      case 'widget_deleted':
        return `${user} removed a widget`;
      case 'dashboard_viewed':
        return `${user} viewed the dashboard`;
      case 'dashboard_shared':
        return `${user} shared the dashboard`;
      default:
        return `${user} performed an action`;
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-primary" />
          <div>
            <CardTitle className="text-lg">Activity Feed</CardTitle>
            <CardDescription>
              Recent dashboard activity
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px]">
          {activities.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Activity className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No activity yet</p>
              <p className="text-sm">Activity will appear here as you work</p>
            </div>
          ) : (
            <div className="space-y-3 pr-4">
              {activities.map((activity) => {
                const Icon = getActivityIcon(activity.activity_type);
                const colorClass = getActivityColor(activity.activity_type);
                
                return (
                  <div key={activity.id} className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg bg-muted ${colorClass}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium">
                        {getActivityDescription(activity)}
                      </p>
                      
                      {activity.activity_data && (
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {JSON.stringify(activity.activity_data).substring(0, 100)}
                        </p>
                      )}
                      
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

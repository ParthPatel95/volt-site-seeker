import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { User, Eye, Clock, FileText, ArrowRight } from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';

interface ViewerTimelineProps {
  activities: any[];
  compact?: boolean;
}

export function ViewerTimeline({ activities, compact = false }: ViewerTimelineProps) {
  if (!activities || activities.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <div className="p-3 rounded-full bg-muted mb-3">
          <Eye className="w-6 h-6 text-muted-foreground" />
        </div>
        <p className="text-sm text-muted-foreground">No viewer activity yet</p>
      </div>
    );
  }

  const displayActivities = compact ? activities.slice(0, 5) : activities;

  return (
    <ScrollArea className={compact ? "max-h-64" : "max-h-96"}>
      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border" />
        
        <div className="space-y-4">
          {displayActivities.map((activity, index) => {
            const pagesViewed = activity.pages_viewed?.length || 0;
            const timeSpent = activity.total_time_seconds || 0;
            const timeSpentMinutes = Math.round(timeSpent / 60);
            
            return (
              <div key={activity.id} className="relative pl-10">
                {/* Timeline dot */}
                <div className={`absolute left-2.5 w-3 h-3 rounded-full border-2 border-background ${
                  index === 0 ? 'bg-primary' : 'bg-muted-foreground/40'
                }`} />
                
                <Card className={`p-3 ${index === 0 ? 'border-primary/30 bg-primary/5' : ''}`}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <User className="w-4 h-4 text-primary" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-sm truncate">
                          {activity.viewer_name || activity.viewer_email || 'Anonymous'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(activity.opened_at), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                    
                    {activity.engagement_score > 0 && (
                      <Badge 
                        variant="outline" 
                        className={`shrink-0 text-xs ${
                          activity.engagement_score >= 70 ? 'border-green-500 text-green-600' :
                          activity.engagement_score >= 40 ? 'border-amber-500 text-amber-600' :
                          'border-muted'
                        }`}
                      >
                        {activity.engagement_score}%
                      </Badge>
                    )}
                  </div>
                  
                  {/* Activity metrics */}
                  <div className="flex flex-wrap gap-2 mt-2">
                    {timeSpent > 0 && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        {timeSpentMinutes > 0 ? `${timeSpentMinutes}m` : `${timeSpent}s`}
                      </div>
                    )}
                    {pagesViewed > 0 && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <FileText className="w-3 h-3" />
                        {pagesViewed} page{pagesViewed !== 1 ? 's' : ''}
                      </div>
                    )}
                    {activity.device_type && (
                      <Badge variant="secondary" className="text-xs h-5">
                        {activity.device_type}
                      </Badge>
                    )}
                  </div>
                  
                  {/* Page journey for non-compact view */}
                  {!compact && activity.pages_viewed && activity.pages_viewed.length > 1 && (
                    <div className="flex items-center gap-1 mt-2 overflow-x-auto">
                      {activity.pages_viewed.slice(0, 8).map((page: any, pageIndex: number) => (
                        <div key={pageIndex} className="flex items-center">
                          <Badge variant="outline" className="text-xs h-5 px-1.5 shrink-0">
                            P{page.page}
                          </Badge>
                          {pageIndex < Math.min(activity.pages_viewed.length - 1, 7) && (
                            <ArrowRight className="w-3 h-3 text-muted-foreground mx-0.5 shrink-0" />
                          )}
                        </div>
                      ))}
                      {activity.pages_viewed.length > 8 && (
                        <span className="text-xs text-muted-foreground ml-1">
                          +{activity.pages_viewed.length - 8} more
                        </span>
                      )}
                    </div>
                  )}
                </Card>
              </div>
            );
          })}
        </div>
      </div>
    </ScrollArea>
  );
}

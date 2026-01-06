import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';
import { 
  CheckCircle2, 
  AlertTriangle, 
  Plus, 
  Edit3, 
  Clock,
  Activity
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface ActivityItem {
  id: string;
  type: 'task_completed' | 'risk_added' | 'task_added' | 'status_changed' | 'milestone';
  title: string;
  timestamp: Date;
  user?: string;
}

interface RecentActivityFeedProps {
  activities: ActivityItem[];
  maxItems?: number;
}

const activityIcons = {
  task_completed: { icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
  risk_added: { icon: AlertTriangle, color: 'text-amber-500', bg: 'bg-amber-500/10' },
  task_added: { icon: Plus, color: 'text-blue-500', bg: 'bg-blue-500/10' },
  status_changed: { icon: Edit3, color: 'text-purple-500', bg: 'bg-purple-500/10' },
  milestone: { icon: Clock, color: 'text-primary', bg: 'bg-primary/10' },
};

export function RecentActivityFeed({ activities, maxItems = 5 }: RecentActivityFeedProps) {
  const displayedActivities = activities.slice(0, maxItems);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 }
  };

  return (
    <Card className="p-4 sm:p-6">
      <div className="flex items-center gap-2 mb-4">
        <Activity className="w-5 h-5 text-primary" />
        <h3 className="text-sm font-semibold text-foreground">Recent Activity</h3>
      </div>
      
      {displayedActivities.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No recent activity</p>
        </div>
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-3"
        >
          {displayedActivities.map((activity) => {
            const config = activityIcons[activity.type];
            const Icon = config.icon;
            
            return (
              <motion.div
                key={activity.id}
                variants={itemVariants}
                className="flex items-start gap-3"
              >
                <div className={cn(
                  "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center",
                  config.bg
                )}>
                  <Icon className={cn("w-4 h-4", config.color)} />
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground truncate">
                    {activity.title}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatDistanceToNow(activity.timestamp, { addSuffix: true })}
                    {activity.user && ` • ${activity.user}`}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      )}
    </Card>
  );
}

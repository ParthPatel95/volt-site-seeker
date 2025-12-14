import { Badge } from '@/components/ui/badge';
import { Flame, Thermometer, Snowflake, Activity } from 'lucide-react';

interface LinkHeatIndicatorProps {
  totalViews: number;
  recentViews: number; // Views in last 24 hours
  avgEngagement: number;
  isActive?: boolean;
}

export function LinkHeatIndicator({ 
  totalViews, 
  recentViews, 
  avgEngagement,
  isActive 
}: LinkHeatIndicatorProps) {
  // Calculate heat score based on recent activity and engagement
  const heatScore = (recentViews * 3) + (avgEngagement / 10) + (totalViews * 0.5);
  
  if (isActive) {
    return (
      <Badge className="gap-1 bg-green-500/20 text-green-600 border-green-500/30 animate-pulse">
        <Activity className="w-3 h-3" />
        Live
      </Badge>
    );
  }

  if (heatScore >= 20) {
    return (
      <Badge className="gap-1 bg-red-500/20 text-red-600 border-red-500/30">
        <Flame className="w-3 h-3" />
        Hot
      </Badge>
    );
  }
  
  if (heatScore >= 10) {
    return (
      <Badge className="gap-1 bg-amber-500/20 text-amber-600 border-amber-500/30">
        <Thermometer className="w-3 h-3" />
        Warm
      </Badge>
    );
  }
  
  if (totalViews === 0) {
    return (
      <Badge className="gap-1 bg-muted text-muted-foreground">
        <Snowflake className="w-3 h-3" />
        New
      </Badge>
    );
  }

  return (
    <Badge className="gap-1 bg-blue-500/20 text-blue-600 border-blue-500/30">
      <Snowflake className="w-3 h-3" />
      Cool
    </Badge>
  );
}

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Lightbulb, TrendingUp, AlertTriangle, Clock, FileText, Target } from 'lucide-react';
import { DateRange } from 'react-day-picker';

interface PredictiveInsightsProps {
  dateRange?: DateRange;
}

export function PredictiveInsights({ dateRange }: PredictiveInsightsProps) {
  const { data, isLoading } = useQuery({
    queryKey: ['predictive-insights', dateRange],
    queryFn: async () => {
      let query = supabase
        .from('viewer_activity')
        .select(`
          *,
          document:secure_documents(file_name, file_type)
        `);

      if (dateRange?.from) {
        query = query.gte('opened_at', dateRange.from.toISOString());
      }
      if (dateRange?.to) {
        query = query.lte('opened_at', dateRange.to.toISOString());
      }

      const { data: activity, error } = await query;
      if (error) throw error;

      const insights: Array<{
        type: 'success' | 'warning' | 'info';
        icon: any;
        title: string;
        description: string;
        metric?: string;
      }> = [];

      // Best time to share analysis
      const hourlyEngagement: Record<number, { count: number; totalEngagement: number }> = {};
      activity?.forEach(a => {
        const hour = new Date(a.opened_at).getHours();
        if (!hourlyEngagement[hour]) {
          hourlyEngagement[hour] = { count: 0, totalEngagement: 0 };
        }
        hourlyEngagement[hour].count += 1;
        hourlyEngagement[hour].totalEngagement += a.engagement_score || 0;
      });

      const hourlyAvg = Object.entries(hourlyEngagement).map(([hour, stats]) => ({
        hour: parseInt(hour),
        avgEngagement: stats.count > 0 ? stats.totalEngagement / stats.count : 0
      }));

      const bestHour = hourlyAvg.sort((a, b) => b.avgEngagement - a.avgEngagement)[0];
      if (bestHour && bestHour.avgEngagement > 0) {
        const timeStr = bestHour.hour === 0 ? '12 AM' : bestHour.hour < 12 ? `${bestHour.hour} AM` : bestHour.hour === 12 ? '12 PM' : `${bestHour.hour - 12} PM`;
        insights.push({
          type: 'success',
          icon: Clock,
          title: 'Best Time to Share',
          description: `Documents shared around ${timeStr} get ${Math.round(bestHour.avgEngagement)}% higher engagement on average.`,
          metric: timeStr
        });
      }

      // File type performance analysis
      const fileTypeStats: Record<string, { count: number; totalEngagement: number }> = {};
      activity?.forEach(a => {
        const fileType = a.document?.file_type || 'unknown';
        if (!fileTypeStats[fileType]) {
          fileTypeStats[fileType] = { count: 0, totalEngagement: 0 };
        }
        fileTypeStats[fileType].count += 1;
        fileTypeStats[fileType].totalEngagement += a.engagement_score || 0;
      });

      const fileTypeAvg = Object.entries(fileTypeStats)
        .map(([type, stats]) => ({
          type,
          avgEngagement: stats.count > 0 ? stats.totalEngagement / stats.count : 0,
          count: stats.count
        }))
        .filter(f => f.count >= 2);

      if (fileTypeAvg.length >= 2) {
        const sorted = fileTypeAvg.sort((a, b) => b.avgEngagement - a.avgEngagement);
        const best = sorted[0];
        const worst = sorted[sorted.length - 1];
        const diff = ((best.avgEngagement - worst.avgEngagement) / worst.avgEngagement) * 100;
        
        if (diff > 20) {
          insights.push({
            type: 'info',
            icon: FileText,
            title: 'Document Type Performance',
            description: `Your ${best.type.toUpperCase()} files get ${diff.toFixed(0)}% more engagement than ${worst.type.toUpperCase()} files.`,
            metric: `+${diff.toFixed(0)}%`
          });
        }
      }

      // At-risk viewer identification
      const lowEngagementViewers = activity?.filter(a => 
        a.engagement_score && a.engagement_score < 30 && a.viewer_email
      );

      if (lowEngagementViewers && lowEngagementViewers.length > 0) {
        const uniqueLowEngagement = new Set(lowEngagementViewers.map(a => a.viewer_email));
        insights.push({
          type: 'warning',
          icon: AlertTriangle,
          title: 'Low Engagement Viewers',
          description: `${uniqueLowEngagement.size} viewer${uniqueLowEngagement.size > 1 ? 's' : ''} showed low engagement. Consider follow-up outreach or simplified content.`,
          metric: `${uniqueLowEngagement.size}`
        });
      }

      // Document effectiveness prediction
      const avgEngagement = activity?.length 
        ? activity.reduce((sum, a) => sum + (a.engagement_score || 0), 0) / activity.length 
        : 0;

      if (avgEngagement > 70) {
        insights.push({
          type: 'success',
          icon: Target,
          title: 'High Effectiveness Score',
          description: `Your documents have an average engagement of ${Math.round(avgEngagement)}. This is excellent! Keep using similar content strategies.`,
          metric: `${Math.round(avgEngagement)}/100`
        });
      } else if (avgEngagement < 40 && activity && activity.length > 5) {
        insights.push({
          type: 'warning',
          icon: Target,
          title: 'Effectiveness Needs Improvement',
          description: `Average engagement is ${Math.round(avgEngagement)}. Consider shorter documents, better formatting, or more interactive content.`,
          metric: `${Math.round(avgEngagement)}/100`
        });
      }

      // Repeat viewer trend
      const viewerCounts: Record<string, number> = {};
      activity?.forEach(a => {
        if (a.viewer_email) {
          viewerCounts[a.viewer_email] = (viewerCounts[a.viewer_email] || 0) + 1;
        }
      });

      const repeatViewers = Object.values(viewerCounts).filter(count => count > 2).length;
      const totalViewers = Object.keys(viewerCounts).length;

      if (repeatViewers > totalViewers * 0.3) {
        insights.push({
          type: 'success',
          icon: TrendingUp,
          title: 'Strong Repeat Engagement',
          description: `${repeatViewers} viewers returned multiple times. Your content is building lasting interest!`,
          metric: `${Math.round((repeatViewers / totalViewers) * 100)}%`
        });
      }

      return insights;
    }
  });

  if (isLoading) {
    return (
      <Card>
        <CardContent className="h-64 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-primary" />
          <CardTitle>AI-Powered Insights & Recommendations</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        {!data || data.length === 0 ? (
          <Alert>
            <Lightbulb className="h-4 w-4" />
            <AlertDescription>
              Not enough data yet to generate insights. Share more documents and check back soon!
            </AlertDescription>
          </Alert>
        ) : (
          <div className="space-y-4">
            {data.map((insight, index) => {
              const Icon = insight.icon;
              return (
                <Alert key={index} variant={insight.type === 'warning' ? 'destructive' : 'default'}>
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${
                      insight.type === 'success' ? 'bg-green-100 dark:bg-green-900' : 
                      insight.type === 'warning' ? 'bg-yellow-100 dark:bg-yellow-900' : 
                      'bg-blue-100 dark:bg-blue-900'
                    }`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-semibold">{insight.title}</h4>
                        {insight.metric && (
                          <Badge variant={insight.type === 'warning' ? 'destructive' : 'default'}>
                            {insight.metric}
                          </Badge>
                        )}
                      </div>
                      <AlertDescription>{insight.description}</AlertDescription>
                    </div>
                  </div>
                </Alert>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

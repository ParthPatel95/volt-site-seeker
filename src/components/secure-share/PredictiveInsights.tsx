import { memo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Lightbulb, TrendingUp, AlertTriangle, Clock, Target } from 'lucide-react';
import { useSecureShareAnalytics } from '@/contexts/SecureShareAnalyticsContext';
import { ChartSkeleton } from './analytics/AnalyticsSkeleton';

const ICON_MAP: Record<string, any> = {
  'Best Time to Share': Clock,
  'Low Engagement Viewers': AlertTriangle,
  'High Effectiveness': Target,
  'Strong Repeat Engagement': TrendingUp,
  'Effectiveness Needs Improvement': Target
};

export const PredictiveInsights = memo(function PredictiveInsights() {
  const { analytics, isLoading } = useSecureShareAnalytics();

  if (isLoading) {
    return <ChartSkeleton title="AI-Powered Insights" />;
  }

  const insights = analytics?.insights || [];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-primary" />
          <CardTitle>AI-Powered Insights & Recommendations</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        {insights.length === 0 ? (
          <Alert>
            <Lightbulb className="h-4 w-4" />
            <AlertDescription>
              Not enough data yet to generate insights. Share more documents and check back soon!
            </AlertDescription>
          </Alert>
        ) : (
          <div className="space-y-4">
            {insights.map((insight, index) => {
              const Icon = ICON_MAP[insight.title] || Lightbulb;
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
});

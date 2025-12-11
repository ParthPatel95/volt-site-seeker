import { memo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';
import { useSecureShareAnalytics } from '@/contexts/SecureShareAnalyticsContext';
import { ChartSkeleton } from './analytics/AnalyticsSkeleton';

export const EngagementChart = memo(function EngagementChart() {
  const { analytics, isLoading } = useSecureShareAnalytics();

  if (isLoading) {
    return <ChartSkeleton title="Engagement Over Time" />;
  }

  const data = analytics?.engagementOverTime?.map(item => ({
    day: format(new Date(item.date), 'MMM dd'),
    engagement: item.engagement
  })) || [];

  return (
    <Card className="border-border/50 hover:border-primary/30 transition-colors">
      <CardHeader>
        <CardTitle>Engagement Over Time</CardTitle>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className="h-[300px] flex items-center justify-center text-muted-foreground text-sm">
            No engagement data available
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="day" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))', 
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }} 
              />
              <Line 
                type="monotone" 
                dataKey="engagement" 
                stroke="hsl(var(--primary))" 
                strokeWidth={2}
                dot={{ fill: 'hsl(var(--primary))' }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
});

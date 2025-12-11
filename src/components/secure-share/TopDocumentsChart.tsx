import { memo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useSecureShareAnalytics } from '@/contexts/SecureShareAnalyticsContext';
import { ChartSkeleton } from './analytics/AnalyticsSkeleton';

export const TopDocumentsChart = memo(function TopDocumentsChart() {
  const { analytics, isLoading } = useSecureShareAnalytics();

  if (isLoading) {
    return <ChartSkeleton title="Top Documents" />;
  }

  const data = analytics?.topDocuments?.slice(0, 5).map(doc => ({
    name: doc.name,
    views: doc.views
  })) || [];

  return (
    <Card className="border-border/50 hover:border-primary/30 transition-colors">
      <CardHeader>
        <CardTitle>Top Documents</CardTitle>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className="h-[300px] flex items-center justify-center text-muted-foreground text-sm">
            No document data available
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))', 
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }} 
              />
              <Bar 
                dataKey="views" 
                fill="hsl(var(--primary))" 
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
});

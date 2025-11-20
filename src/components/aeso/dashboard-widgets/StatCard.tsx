import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { useAESODashboardData, WidgetConfig } from '@/hooks/useAESODashboardData';

interface StatCardProps {
  config: WidgetConfig;
}

export function StatCard({ config }: StatCardProps) {
  const { data, loading, error } = useAESODashboardData(config);

  if (loading) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="text-sm">{config.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-2">
            <div className="h-8 bg-muted rounded w-3/4" />
            <div className="h-4 bg-muted rounded w-1/2" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="text-sm">{config.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-destructive">Failed to load data</p>
        </CardContent>
      </Card>
    );
  }

  const value = data?.currentPrice || data?.statistics?.average || 0;
  const change = data?.change || 0;
  const isPositive = change >= 0;

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {config.title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-1">
          <div className="text-2xl font-bold">
            ${value.toFixed(2)}
          </div>
          <div className={`flex items-center text-sm ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
            {isPositive ? (
              <TrendingUp className="w-4 h-4 mr-1" />
            ) : (
              <TrendingDown className="w-4 h-4 mr-1" />
            )}
            <span>{Math.abs(change).toFixed(1)}% from avg</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

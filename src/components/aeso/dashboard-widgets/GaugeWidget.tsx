import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAESODashboardData, WidgetConfig } from '@/hooks/useAESODashboardData';
import { Progress } from '@/components/ui/progress';

interface GaugeWidgetProps {
  config: WidgetConfig;
}

export function GaugeWidget({ config }: GaugeWidgetProps) {
  const { data, loading, error } = useAESODashboardData(config);

  if (loading) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="text-sm">{config.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded" />
            <div className="h-8 bg-muted rounded" />
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

  const value = data?.currentLoad || data?.currentPrice || 0;
  const max = (config.dataFilters as any)?.max || 12000;
  const percentage = Math.min((value / max) * 100, 100);

  const getColorClass = () => {
    if (percentage < 50) return 'text-green-600';
    if (percentage < 80) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {config.title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className={`text-3xl font-bold ${getColorClass()}`}>
          {value.toFixed(0)}
        </div>
        <div className="space-y-2">
          <Progress value={percentage} className="h-3" />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>0</span>
            <span>{percentage.toFixed(0)}%</span>
            <span>{max}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

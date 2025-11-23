import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Activity, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { useAESODashboardData, WidgetConfig } from '@/hooks/useAESODashboardData';
import { LineChart, Line, ResponsiveContainer } from 'recharts';
import { useMemo } from 'react';

interface EnhancedStatCardProps {
  config: WidgetConfig;
}

export function EnhancedStatCard({ config }: EnhancedStatCardProps) {
  const { data, loading, error } = useAESODashboardData(config);

  // Create sparkline data
  const sparklineData = useMemo(() => {
    if (!data?.chartData || !Array.isArray(data.chartData)) return [];
    return data.chartData.slice(-20).map((item: any) => ({
      value: item.price || item.value || 0
    }));
  }, [data?.chartData]);

  const statistics = useMemo(() => {
    if (!sparklineData.length) return null;
    
    const values = sparklineData.map(d => d.value);
    const current = values[values.length - 1];
    const previous = values[values.length - 2] || current;
    const min = Math.min(...values);
    const max = Math.max(...values);
    const avg = values.reduce((sum, v) => sum + v, 0) / values.length;
    const change = ((current - previous) / previous) * 100;
    const trend = values.slice(-5).reduce((sum, v, i, arr) => {
      if (i === 0) return 0;
      return sum + (v - arr[i - 1]);
    }, 0);
    
    return {
      current,
      previous,
      min,
      max,
      avg,
      change,
      trending: trend > 0 ? 'up' : trend < 0 ? 'down' : 'neutral',
    };
  }, [sparklineData]);

  if (loading) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="text-sm">{config.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            <div className="h-10 bg-muted rounded w-3/4" />
            <div className="h-16 bg-muted rounded" />
            <div className="h-4 bg-muted rounded w-1/2" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !statistics) {
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

  const value = data?.currentPrice || data?.statistics?.average || statistics.current || 0;
  const changeValue = data?.change !== undefined ? data.change : statistics.change;
  const isPositive = changeValue >= 0;
  const isIncreasing = statistics.trending === 'up';

  return (
    <Card className="h-full hover:shadow-lg transition-shadow">
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {config.title}
        </CardTitle>
        <div className={`rounded-full p-2 ${
          isIncreasing 
            ? 'bg-green-100 dark:bg-green-950/30' 
            : statistics.trending === 'down' 
            ? 'bg-red-100 dark:bg-red-950/30' 
            : 'bg-muted'
        }`}>
          {isIncreasing ? (
            <ArrowUpRight className="w-4 h-4 text-green-600 dark:text-green-400" />
          ) : statistics.trending === 'down' ? (
            <ArrowDownRight className="w-4 h-4 text-red-600 dark:text-red-400" />
          ) : (
            <Activity className="w-4 h-4 text-muted-foreground" />
          )}
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-3">
          {/* Main Value */}
          <div className="flex items-baseline gap-2">
            <div className="text-3xl font-bold">
              ${value.toFixed(2)}
            </div>
            <div className={`flex items-center text-sm font-medium ${
              isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
            }`}>
              {isPositive ? (
                <TrendingUp className="w-4 h-4 mr-1" />
              ) : (
                <TrendingDown className="w-4 h-4 mr-1" />
              )}
              <span>{Math.abs(changeValue).toFixed(1)}%</span>
            </div>
          </div>

          {/* Sparkline */}
          <div className="h-16 -mx-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={sparklineData}>
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke={isIncreasing ? 'hsl(142 76% 36%)' : 'hsl(0 84% 60%)'}
                  strokeWidth={2}
                  dot={false}
                  animationDuration={300}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Statistics */}
          <div className="flex items-center justify-between text-xs pt-2 border-t">
            <div className="space-y-1">
              <div className="text-muted-foreground">Range</div>
              <div className="font-medium">
                ${statistics.min.toFixed(0)} - ${statistics.max.toFixed(0)}
              </div>
            </div>
            <div className="space-y-1 text-right">
              <div className="text-muted-foreground">Avg</div>
              <div className="font-medium">${statistics.avg.toFixed(2)}</div>
            </div>
          </div>

          {/* Badges */}
          <div className="flex flex-wrap gap-1">
            {value > statistics.avg * 1.1 && (
              <Badge variant="destructive" className="text-xs">
                Above Avg
              </Badge>
            )}
            {value < statistics.avg * 0.9 && (
              <Badge variant="default" className="text-xs bg-green-600">
                Below Avg
              </Badge>
            )}
            {Math.abs(changeValue) > 10 && (
              <Badge variant="outline" className="text-xs">
                High Volatility
              </Badge>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

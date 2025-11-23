import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAESODashboardData, WidgetConfig } from '@/hooks/useAESODashboardData';
import { RefreshCw, Calendar } from 'lucide-react';
import { useMemo } from 'react';

interface HeatmapWidgetProps {
  config: WidgetConfig;
}

export function HeatmapWidget({ config }: HeatmapWidgetProps) {
  const { data, loading, error, refetch } = useAESODashboardData(config);

  // Transform data into heatmap format (hour vs day of week)
  const heatmapData = useMemo(() => {
    if (!data?.chartData || !Array.isArray(data.chartData)) return null;
    
    const grid: number[][] = Array(7).fill(null).map(() => Array(24).fill(0));
    const counts: number[][] = Array(7).fill(null).map(() => Array(24).fill(0));
    
    data.chartData.forEach((item: any) => {
      const date = new Date(item.date || item.time || Date.now());
      const dayOfWeek = date.getDay(); // 0 = Sunday
      const hour = date.getHours();
      const value = item.price || item.value || 0;
      
      if (value > 0) {
        grid[dayOfWeek][hour] += value;
        counts[dayOfWeek][hour]++;
      }
    });
    
    // Calculate averages
    for (let day = 0; day < 7; day++) {
      for (let hour = 0; hour < 24; hour++) {
        if (counts[day][hour] > 0) {
          grid[day][hour] /= counts[day][hour];
        }
      }
    }
    
    // Find min and max for color scaling
    const allValues = grid.flat().filter(v => v > 0);
    const min = Math.min(...allValues);
    const max = Math.max(...allValues);
    
    return { grid, min, max };
  }, [data?.chartData]);

  const getColor = (value: number, min: number, max: number) => {
    if (value === 0) return 'hsl(var(--muted))';
    
    const ratio = (value - min) / (max - min);
    
    // Color scale from green (low) to yellow (medium) to red (high)
    if (ratio < 0.5) {
      const greenToYellow = ratio * 2;
      return `hsl(${120 - greenToYellow * 60} 70% ${65 - greenToYellow * 15}%)`;
    } else {
      const yellowToRed = (ratio - 0.5) * 2;
      return `hsl(${60 - yellowToRed * 60} ${70 + yellowToRed * 15}% ${50 - yellowToRed * 10}%)`;
    }
  };

  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const hours = Array.from({ length: 24 }, (_, i) => i);

  if (loading) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            {config.title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse h-80 bg-muted rounded" />
        </CardContent>
      </Card>
    );
  }

  if (error || !heatmapData) {
    return (
      <Card className="h-full">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm">{config.title}</CardTitle>
          <Button size="icon" variant="ghost" onClick={refetch}>
            <RefreshCw className="w-4 h-4" />
          </Button>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-80">
          <p className="text-sm text-muted-foreground">Failed to load heatmap data</p>
        </CardContent>
      </Card>
    );
  }

  const { grid, min, max } = heatmapData;

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            {config.title}
          </CardTitle>
          <p className="text-xs text-muted-foreground mt-1">
            Price patterns by hour and day
          </p>
        </div>
        <Button size="icon" variant="outline" onClick={refetch}>
          <RefreshCw className="w-4 h-4" />
        </Button>
      </CardHeader>
      
      <CardContent className="flex-1 min-h-0 overflow-auto">
        <div className="min-w-max">
          {/* Hour labels */}
          <div className="flex mb-1">
            <div className="w-12" />
            {hours.map(hour => (
              <div 
                key={hour} 
                className="w-8 text-xs text-center text-muted-foreground"
              >
                {hour}
              </div>
            ))}
          </div>
          
          {/* Heatmap grid */}
          {days.map((day, dayIndex) => (
            <div key={day} className="flex items-center mb-1">
              <div className="w-12 text-xs font-medium text-muted-foreground pr-2 text-right">
                {day}
              </div>
              {hours.map(hour => {
                const value = grid[dayIndex][hour];
                const color = getColor(value, min, max);
                
                return (
                  <div
                    key={hour}
                    className="w-8 h-8 m-0.5 rounded transition-all hover:ring-2 hover:ring-primary cursor-pointer group relative"
                    style={{ backgroundColor: color }}
                    title={`${day} ${hour}:00 - $${value.toFixed(2)}`}
                  >
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-xs font-semibold text-white drop-shadow">
                        ${value > 0 ? value.toFixed(0) : '-'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
          
          {/* Legend */}
          <div className="flex items-center gap-2 mt-4 pt-4 border-t">
            <span className="text-xs text-muted-foreground">Low</span>
            <div className="flex-1 h-4 rounded" style={{
              background: `linear-gradient(to right, 
                hsl(120 70% 65%),
                hsl(90 70% 57%),
                hsl(60 70% 50%),
                hsl(30 85% 45%),
                hsl(0 85% 40%)
              )`
            }} />
            <span className="text-xs text-muted-foreground">High</span>
            <span className="text-xs font-medium ml-2">
              ${min.toFixed(0)} - ${max.toFixed(0)}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

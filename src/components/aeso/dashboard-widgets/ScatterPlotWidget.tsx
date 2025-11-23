import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, ZAxis, Cell, ReferenceLine
} from 'recharts';
import { useAESODashboardData, WidgetConfig } from '@/hooks/useAESODashboardData';
import { RefreshCw, GitCompare } from 'lucide-react';
import { useMemo } from 'react';

interface ScatterPlotWidgetProps {
  config: WidgetConfig;
}

export function ScatterPlotWidget({ config }: ScatterPlotWidgetProps) {
  const { data, loading, error, refetch } = useAESODashboardData(config);

  // Transform data for scatter plot and calculate correlation
  const scatterData = useMemo(() => {
    if (!data?.chartData || !Array.isArray(data.chartData)) return null;
    
    const points = data.chartData
      .map((item: any) => {
        // Extract two numeric variables for scatter plot
        const keys = Object.keys(item).filter(k => typeof item[k] === 'number');
        if (keys.length >= 2) {
          return {
            x: item[keys[0]] || 0,
            y: item[keys[1]] || 0,
            label: item.time || item.date,
            size: Math.abs(item[keys[1]] - item[keys[0]]) || 10,
          };
        }
        return null;
      })
      .filter(Boolean);
    
    if (points.length === 0) return null;
    
    // Calculate correlation coefficient
    const n = points.length;
    const sumX = points.reduce((sum, p) => sum + p.x, 0);
    const sumY = points.reduce((sum, p) => sum + p.y, 0);
    const sumXY = points.reduce((sum, p) => sum + p.x * p.y, 0);
    const sumX2 = points.reduce((sum, p) => sum + p.x * p.x, 0);
    const sumY2 = points.reduce((sum, p) => sum + p.y * p.y, 0);
    
    const correlation = (n * sumXY - sumX * sumY) / 
      Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));
    
    // Calculate trendline
    const meanX = sumX / n;
    const meanY = sumY / n;
    const slope = points.reduce((sum, p) => sum + (p.x - meanX) * (p.y - meanY), 0) /
                  points.reduce((sum, p) => sum + Math.pow(p.x - meanX, 2), 0);
    const intercept = meanY - slope * meanX;
    
    return { points, correlation, slope, intercept };
  }, [data?.chartData]);

  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload || !payload.length) return null;
    
    const point = payload[0].payload;
    return (
      <Card className="border-primary/20 bg-background/95 backdrop-blur-sm p-3 shadow-lg">
        <div className="space-y-1 text-xs">
          <div className="font-medium">{point.label}</div>
          <div className="flex justify-between gap-4">
            <span className="text-muted-foreground">X:</span>
            <span className="font-semibold">{point.x.toFixed(2)}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-muted-foreground">Y:</span>
            <span className="font-semibold">{point.y.toFixed(2)}</span>
          </div>
        </div>
      </Card>
    );
  };

  const getColor = (correlation: number) => {
    if (correlation > 0.7) return 'hsl(142 76% 36%)'; // Strong positive
    if (correlation > 0.3) return 'hsl(38 92% 50%)';  // Moderate positive
    if (correlation > -0.3) return 'hsl(var(--muted-foreground))'; // Weak
    if (correlation > -0.7) return 'hsl(25 95% 53%)'; // Moderate negative
    return 'hsl(0 84% 60%)'; // Strong negative
  };

  const getCorrelationLabel = (correlation: number) => {
    const abs = Math.abs(correlation);
    if (abs > 0.7) return 'Strong';
    if (abs > 0.3) return 'Moderate';
    return 'Weak';
  };

  if (loading) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="text-sm">{config.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse h-80 bg-muted rounded" />
        </CardContent>
      </Card>
    );
  }

  if (error || !scatterData) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="text-sm">{config.title}</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-80">
          <p className="text-sm text-muted-foreground">Failed to load scatter plot data</p>
        </CardContent>
      </Card>
    );
  }

  const { points, correlation, slope, intercept } = scatterData;
  const minX = Math.min(...points.map(p => p.x));
  const maxX = Math.max(...points.map(p => p.x));

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex-1">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <GitCompare className="w-5 h-5" />
            {config.title}
          </CardTitle>
          <div className="flex flex-wrap gap-2 mt-2">
            <Badge 
              variant="outline" 
              className="text-xs"
              style={{ borderColor: getColor(correlation), color: getColor(correlation) }}
            >
              {getCorrelationLabel(correlation)} Correlation
            </Badge>
            <Badge variant="outline" className="text-xs">
              r = {correlation.toFixed(3)}
            </Badge>
            <Badge variant="outline" className="text-xs">
              {points.length} points
            </Badge>
          </div>
        </div>
        <Button size="icon" variant="outline" onClick={refetch}>
          <RefreshCw className="w-4 h-4" />
        </Button>
      </CardHeader>
      
      <CardContent className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 5, right: 20, bottom: 5, left: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis 
              type="number" 
              dataKey="x" 
              name="X"
              fontSize={11}
              stroke="hsl(var(--muted-foreground))"
            />
            <YAxis 
              type="number" 
              dataKey="y" 
              name="Y"
              fontSize={11}
              stroke="hsl(var(--muted-foreground))"
            />
            <ZAxis type="number" dataKey="size" range={[50, 400]} />
            <Tooltip content={<CustomTooltip />} />
            
            {/* Trendline */}
            <ReferenceLine
              segment={[
                { x: minX, y: slope * minX + intercept },
                { x: maxX, y: slope * maxX + intercept }
              ]}
              stroke={getColor(correlation)}
              strokeWidth={2}
              strokeDasharray="5 5"
              label={{ 
                value: `y = ${slope.toFixed(2)}x + ${intercept.toFixed(2)}`, 
                position: 'top',
                fontSize: 10
              }}
            />
            
            <Scatter data={points} fill={getColor(correlation)}>
              {points.map((entry, index) => (
                <Cell 
                  key={index} 
                  fill={getColor(correlation)}
                  fillOpacity={0.6}
                />
              ))}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

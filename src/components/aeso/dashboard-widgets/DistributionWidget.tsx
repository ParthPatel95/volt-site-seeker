import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, Cell, ReferenceLine
} from 'recharts';
import { useAESODashboardData, WidgetConfig } from '@/hooks/useAESODashboardData';
import { RefreshCw, BarChart3 } from 'lucide-react';
import { useMemo } from 'react';

interface DistributionWidgetProps {
  config: WidgetConfig;
}

export function DistributionWidget({ config }: DistributionWidgetProps) {
  const { data, loading, error, refetch } = useAESODashboardData(config);

  // Create histogram/distribution data
  const distribution = useMemo(() => {
    if (!data?.chartData || !Array.isArray(data.chartData)) return null;
    
    // Extract all numeric values
    const values = data.chartData
      .map((item: any) => {
        const keys = Object.keys(item).filter(k => typeof item[k] === 'number');
        return item[keys[0]] || 0;
      })
      .filter((v: number) => v > 0);
    
    if (values.length === 0) return null;
    
    // Calculate statistics
    const sorted = [...values].sort((a, b) => a - b);
    const n = values.length;
    const sum = values.reduce((acc, v) => acc + v, 0);
    const mean = sum / n;
    const variance = values.reduce((acc, v) => acc + Math.pow(v - mean, 2), 0) / n;
    const stdDev = Math.sqrt(variance);
    const median = sorted[Math.floor(n / 2)];
    const q1 = sorted[Math.floor(n * 0.25)];
    const q3 = sorted[Math.floor(n * 0.75)];
    const iqr = q3 - q1;
    
    // Create histogram bins
    const min = Math.min(...values);
    const max = Math.max(...values);
    const binCount = Math.min(20, Math.ceil(Math.sqrt(n)));
    const binWidth = (max - min) / binCount;
    
    const bins = Array.from({ length: binCount }, (_, i) => ({
      range: `${(min + i * binWidth).toFixed(0)}-${(min + (i + 1) * binWidth).toFixed(0)}`,
      rangeStart: min + i * binWidth,
      rangeEnd: min + (i + 1) * binWidth,
      count: 0,
      percentage: 0,
    }));
    
    values.forEach(v => {
      const binIndex = Math.min(Math.floor((v - min) / binWidth), binCount - 1);
      bins[binIndex].count++;
    });
    
    bins.forEach(bin => {
      bin.percentage = (bin.count / n) * 100;
    });
    
    return {
      bins,
      statistics: {
        mean: mean.toFixed(2),
        median: median.toFixed(2),
        stdDev: stdDev.toFixed(2),
        min: min.toFixed(2),
        max: max.toFixed(2),
        q1: q1.toFixed(2),
        q3: q3.toFixed(2),
        iqr: iqr.toFixed(2),
        count: n,
      },
    };
  }, [data?.chartData]);

  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload || !payload.length) return null;
    
    const bin = payload[0].payload;
    return (
      <Card className="border-primary/20 bg-background/95 backdrop-blur-sm p-3 shadow-lg">
        <div className="space-y-1 text-xs">
          <div className="font-medium">${bin.range}</div>
          <div className="flex justify-between gap-4">
            <span className="text-muted-foreground">Count:</span>
            <span className="font-semibold">{bin.count}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-muted-foreground">Percentage:</span>
            <span className="font-semibold">{bin.percentage.toFixed(1)}%</span>
          </div>
        </div>
      </Card>
    );
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

  if (error || !distribution) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="text-sm">{config.title}</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-80">
          <p className="text-sm text-muted-foreground">Failed to load distribution data</p>
        </CardContent>
      </Card>
    );
  }

  const { bins, statistics } = distribution;

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex-1">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            {config.title}
          </CardTitle>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
            <Badge variant="outline" className="text-xs">
              μ: ${statistics.mean}
            </Badge>
            <Badge variant="outline" className="text-xs">
              σ: ${statistics.stdDev}
            </Badge>
            <Badge variant="outline" className="text-xs">
              Median: ${statistics.median}
            </Badge>
            <Badge variant="outline" className="text-xs">
              IQR: ${statistics.iqr}
            </Badge>
          </div>
        </div>
        <Button size="icon" variant="outline" onClick={refetch}>
          <RefreshCw className="w-4 h-4" />
        </Button>
      </CardHeader>
      
      <CardContent className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={bins} margin={{ top: 5, right: 20, bottom: 5, left: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis 
              dataKey="range" 
              fontSize={10}
              angle={-45}
              textAnchor="end"
              height={60}
              stroke="hsl(var(--muted-foreground))"
            />
            <YAxis 
              fontSize={11}
              stroke="hsl(var(--muted-foreground))"
              label={{ value: 'Frequency', angle: -90, position: 'insideLeft', fontSize: 11 }}
            />
            <Tooltip content={<CustomTooltip />} />
            
            {/* Mean line */}
            <ReferenceLine
              x={bins.find(b => 
                parseFloat(statistics.mean) >= b.rangeStart && 
                parseFloat(statistics.mean) <= b.rangeEnd
              )?.range}
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              strokeDasharray="5 5"
              label={{ value: 'Mean', position: 'top', fontSize: 10 }}
            />
            
            {/* Median line */}
            <ReferenceLine
              x={bins.find(b => 
                parseFloat(statistics.median) >= b.rangeStart && 
                parseFloat(statistics.median) <= b.rangeEnd
              )?.range}
              stroke="hsl(var(--accent))"
              strokeWidth={2}
              strokeDasharray="3 3"
              label={{ value: 'Median', position: 'top', fontSize: 10 }}
            />
            
            <Bar dataKey="count" radius={[4, 4, 0, 0]}>
              {bins.map((entry, index) => {
                // Color based on how far from mean
                const meanVal = parseFloat(statistics.mean);
                const binMid = (entry.rangeStart + entry.rangeEnd) / 2;
                const distance = Math.abs(binMid - meanVal);
                const maxDistance = Math.max(
                  meanVal - parseFloat(statistics.min),
                  parseFloat(statistics.max) - meanVal
                );
                const ratio = distance / maxDistance;
                
                const hue = 220 - ratio * 100; // Blue to purple gradient
                return (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={`hsl(${hue} 70% 60%)`}
                  />
                );
              })}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        
        {/* Box plot summary */}
        <div className="mt-4 pt-4 border-t">
          <div className="text-xs text-muted-foreground mb-2">Box Plot Summary</div>
          <div className="flex items-center gap-2">
            <div className="flex-1 h-12 relative">
              <div 
                className="absolute h-2 bg-muted rounded"
                style={{
                  left: '0%',
                  right: '0%',
                  top: '50%',
                  transform: 'translateY(-50%)'
                }}
              />
              <div 
                className="absolute h-12 border-2 border-primary bg-primary/10 rounded"
                style={{
                  left: `${((parseFloat(statistics.q1) - parseFloat(statistics.min)) / 
                    (parseFloat(statistics.max) - parseFloat(statistics.min))) * 100}%`,
                  right: `${100 - ((parseFloat(statistics.q3) - parseFloat(statistics.min)) / 
                    (parseFloat(statistics.max) - parseFloat(statistics.min))) * 100}%`,
                }}
              />
              <div 
                className="absolute w-0.5 h-12 bg-accent"
                style={{
                  left: `${((parseFloat(statistics.median) - parseFloat(statistics.min)) / 
                    (parseFloat(statistics.max) - parseFloat(statistics.min))) * 100}%`,
                }}
              />
              <div className="absolute -bottom-5 left-0 text-xs">${statistics.min}</div>
              <div className="absolute -bottom-5 right-0 text-xs">${statistics.max}</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

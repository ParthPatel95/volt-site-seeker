import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Brush, CartesianGrid } from 'recharts';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface ZoomPanChartProps {
  config: any;
}

export function ZoomPanChart({ config }: ZoomPanChartProps) {
  const [zoomDomain, setZoomDomain] = useState<{ startIndex?: number; endIndex?: number }>({});

  const { data, isLoading } = useQuery({
    queryKey: ['zoom-pan-data'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('aeso_training_data')
        .select('timestamp, pool_price, ail_mw')
        .order('timestamp', { ascending: false })
        .limit(200);

      if (error) throw error;
      return data?.reverse();
    }
  });

  const handleZoomIn = () => {
    const totalPoints = data?.length || 0;
    const currentRange = (zoomDomain.endIndex || totalPoints) - (zoomDomain.startIndex || 0);
    const newRange = Math.floor(currentRange * 0.7);
    const center = ((zoomDomain.startIndex || 0) + (zoomDomain.endIndex || totalPoints)) / 2;
    
    setZoomDomain({
      startIndex: Math.floor(center - newRange / 2),
      endIndex: Math.floor(center + newRange / 2)
    });
  };

  const handleZoomOut = () => {
    const totalPoints = data?.length || 0;
    const currentRange = (zoomDomain.endIndex || totalPoints) - (zoomDomain.startIndex || 0);
    const newRange = Math.min(Math.floor(currentRange * 1.3), totalPoints);
    const center = ((zoomDomain.startIndex || 0) + (zoomDomain.endIndex || totalPoints)) / 2;
    
    setZoomDomain({
      startIndex: Math.max(0, Math.floor(center - newRange / 2)),
      endIndex: Math.min(totalPoints, Math.floor(center + newRange / 2))
    });
  };

  const handleReset = () => {
    setZoomDomain({});
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-[400px]">Loading...</div>;
  }

  return (
    <Card className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Zoom & Pan Enabled Chart</h3>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={handleZoomIn}>
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={handleZoomOut}>
            <ZoomOut className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={handleReset}>
            <Maximize2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={350}>
        <LineChart 
          data={data}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis 
            dataKey="timestamp" 
            stroke="hsl(var(--foreground))"
            tick={{ fontSize: 12 }}
            tickFormatter={(value) => new Date(value).toLocaleTimeString()}
            domain={[zoomDomain.startIndex || 0, zoomDomain.endIndex || 'dataMax']}
          />
          <YAxis stroke="hsl(var(--foreground))" />
          <Tooltip 
            contentStyle={{
              backgroundColor: 'hsl(var(--background))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '6px'
            }}
          />
          <Line 
            type="monotone" 
            dataKey="pool_price" 
            stroke="hsl(var(--primary))" 
            strokeWidth={2}
            dot={false}
            name="Pool Price"
          />
          <Line 
            type="monotone" 
            dataKey="ail_mw" 
            stroke="hsl(0, 84%, 60%)" 
            strokeWidth={2}
            dot={false}
            name="Demand"
          />
          <Brush 
            dataKey="timestamp" 
            height={30} 
            stroke="hsl(var(--primary))"
            tickFormatter={(value) => new Date(value).toLocaleDateString()}
          />
        </LineChart>
      </ResponsiveContainer>

      <div className="text-xs text-muted-foreground">
        Use zoom controls or drag the brush below the chart to navigate
      </div>
    </Card>
  );
}

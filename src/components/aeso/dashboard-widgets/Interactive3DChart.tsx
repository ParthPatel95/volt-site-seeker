import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Loader2, Maximize2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ScatterChart, Scatter, XAxis, YAxis, ZAxis, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';

interface Interactive3DChartProps {
  config: any;
}

export function Interactive3DChart({ config }: Interactive3DChartProps) {
  const [xAxis, setXAxis] = useState('pool_price');
  const [yAxis, setYAxis] = useState('ail_mw');
  const [zAxis, setZAxis] = useState('generation_wind');
  const [colorBy, setColorBy] = useState('hour_of_day');

  const { data, isLoading } = useQuery({
    queryKey: ['3d-chart-data', xAxis, yAxis, zAxis, colorBy],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('aeso_training_data')
        .select(`${xAxis}, ${yAxis}, ${zAxis}, ${colorBy}, timestamp`)
        .not(xAxis, 'is', null)
        .not(yAxis, 'is', null)
        .not(zAxis, 'is', null)
        .order('timestamp', { ascending: false })
        .limit(500);

      if (error) throw error;
      return data;
    }
  });

  const metrics = [
    { value: 'pool_price', label: 'Pool Price' },
    { value: 'ail_mw', label: 'Demand (MW)' },
    { value: 'generation_wind', label: 'Wind Generation' },
    { value: 'generation_solar', label: 'Solar Generation' },
    { value: 'generation_gas', label: 'Gas Generation' },
    { value: 'temperature_calgary', label: 'Temperature' },
    { value: 'hour_of_day', label: 'Hour of Day' },
    { value: 'renewable_penetration', label: 'Renewable %' }
  ];

  const getColorScale = (value: number, min: number, max: number) => {
    const normalized = (value - min) / (max - min);
    const hue = (1 - normalized) * 240; // Blue to Red
    return `hsl(${hue}, 70%, 50%)`;
  };

  const chartData = data?.map(d => ({
    x: d[xAxis],
    y: d[yAxis],
    z: d[zAxis],
    color: d[colorBy]
  })) || [];

  const minColor = Math.min(...chartData.map(d => d.color));
  const maxColor = Math.max(...chartData.map(d => d.color));

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <Card className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">3D Market Visualization</h3>
        <Maximize2 className="h-4 w-4 text-muted-foreground cursor-pointer" />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="space-y-2">
          <Label>X-Axis</Label>
          <Select value={xAxis} onValueChange={setXAxis}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {metrics.map(m => (
                <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Y-Axis</Label>
          <Select value={yAxis} onValueChange={setYAxis}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {metrics.map(m => (
                <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Z-Axis (Size)</Label>
          <Select value={zAxis} onValueChange={setZAxis}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {metrics.map(m => (
                <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Color By</Label>
          <Select value={colorBy} onValueChange={setColorBy}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {metrics.map(m => (
                <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={400}>
        <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
          <XAxis 
            type="number" 
            dataKey="x" 
            name={metrics.find(m => m.value === xAxis)?.label}
            stroke="hsl(var(--foreground))"
          />
          <YAxis 
            type="number" 
            dataKey="y" 
            name={metrics.find(m => m.value === yAxis)?.label}
            stroke="hsl(var(--foreground))"
          />
          <ZAxis 
            type="number" 
            dataKey="z" 
            range={[50, 400]} 
            name={metrics.find(m => m.value === zAxis)?.label}
          />
          <Tooltip 
            cursor={{ strokeDasharray: '3 3' }}
            contentStyle={{
              backgroundColor: 'hsl(var(--background))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '6px'
            }}
          />
          <Legend />
          <Scatter 
            name="Data Points" 
            data={chartData} 
            fill="hsl(var(--primary))"
            animationDuration={1000}
            animationBegin={0}
          >
            {chartData.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={getColorScale(entry.color, minColor, maxColor)} 
              />
            ))}
          </Scatter>
        </ScatterChart>
      </ResponsiveContainer>

      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>Bubble size: {metrics.find(m => m.value === zAxis)?.label}</span>
        <span>Color: {metrics.find(m => m.value === colorBy)?.label}</span>
      </div>
    </Card>
  );
}

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface InteractiveLegendChartProps {
  config: any;
}

export function InteractiveLegendChart({ config }: InteractiveLegendChartProps) {
  const [visibleSeries, setVisibleSeries] = useState({
    pool_price: true,
    ail_mw: true,
    generation_wind: true,
    generation_solar: true,
    generation_gas: true,
    generation_hydro: true
  });

  const { data, isLoading } = useQuery({
    queryKey: ['interactive-legend-data'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('aeso_training_data')
        .select('timestamp, pool_price, ail_mw, generation_wind, generation_solar, generation_gas, generation_hydro')
        .order('timestamp', { ascending: false })
        .limit(50);

      if (error) throw error;
      return data?.reverse();
    }
  });

  const series = [
    { key: 'pool_price', label: 'Pool Price', color: 'hsl(var(--primary))' },
    { key: 'ail_mw', label: 'Demand', color: 'hsl(0, 84%, 60%)' },
    { key: 'generation_wind', label: 'Wind', color: 'hsl(142, 71%, 45%)' },
    { key: 'generation_solar', label: 'Solar', color: 'hsl(48, 96%, 53%)' },
    { key: 'generation_gas', label: 'Gas', color: 'hsl(24, 95%, 53%)' },
    { key: 'generation_hydro', label: 'Hydro', color: 'hsl(199, 89%, 48%)' }
  ];

  const toggleSeries = (key: string) => {
    setVisibleSeries(prev => ({ ...prev, [key]: !prev[key as keyof typeof prev] }));
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-[400px]">Loading...</div>;
  }

  return (
    <Card className="p-6 space-y-4">
      <h3 className="font-semibold">Interactive Multi-Series Chart</h3>

      <div className="flex flex-wrap gap-4">
        {series.map(s => (
          <div key={s.key} className="flex items-center space-x-2">
            <Checkbox
              id={s.key}
              checked={visibleSeries[s.key as keyof typeof visibleSeries]}
              onCheckedChange={() => toggleSeries(s.key)}
            />
            <Label htmlFor={s.key} className="flex items-center gap-2 cursor-pointer">
              <div 
                className="w-4 h-4 rounded" 
                style={{ backgroundColor: s.color }}
              />
              {s.label}
            </Label>
          </div>
        ))}
      </div>

      <ResponsiveContainer width="100%" height={350}>
        <LineChart data={data}>
          <XAxis 
            dataKey="timestamp" 
            stroke="hsl(var(--foreground))"
            tick={{ fontSize: 12 }}
            tickFormatter={(value) => new Date(value).toLocaleTimeString()}
          />
          <YAxis stroke="hsl(var(--foreground))" />
          <Tooltip 
            contentStyle={{
              backgroundColor: 'hsl(var(--background))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '6px'
            }}
          />
          {series.map(s => (
            visibleSeries[s.key as keyof typeof visibleSeries] && (
              <Line
                key={s.key}
                type="monotone"
                dataKey={s.key}
                stroke={s.color}
                strokeWidth={2}
                dot={false}
                name={s.label}
                animationDuration={500}
              />
            )
          ))}
        </LineChart>
      </ResponsiveContainer>

      <div className="text-xs text-muted-foreground">
        Click legend items to show/hide series
      </div>
    </Card>
  );
}

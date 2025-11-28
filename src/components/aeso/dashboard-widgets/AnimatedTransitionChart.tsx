import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, Pause, RotateCcw } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface AnimatedTransitionChartProps {
  config: any;
}

export function AnimatedTransitionChart({ config }: AnimatedTransitionChartProps) {
  const [playing, setPlaying] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [displayData, setDisplayData] = useState<any[]>([]);

  const { data: fullData, isLoading } = useQuery({
    queryKey: ['animated-chart-data'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('aeso_training_data')
        .select('timestamp, pool_price, ail_mw, generation_wind, generation_solar')
        .order('timestamp', { ascending: true })
        .limit(100);

      if (error) throw error;
      return data;
    }
  });

  useEffect(() => {
    if (playing && fullData && currentIndex < fullData.length) {
      const timer = setTimeout(() => {
        setDisplayData(fullData.slice(0, currentIndex + 1));
        setCurrentIndex(prev => prev + 1);
      }, 100);
      return () => clearTimeout(timer);
    } else if (currentIndex >= (fullData?.length || 0)) {
      setPlaying(false);
    }
  }, [playing, currentIndex, fullData]);

  const handleReset = () => {
    setCurrentIndex(0);
    setDisplayData([]);
    setPlaying(false);
  };

  const handlePlayPause = () => {
    if (currentIndex >= (fullData?.length || 0)) {
      handleReset();
      setPlaying(true);
    } else {
      setPlaying(!playing);
    }
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-[400px]">Loading...</div>;
  }

  return (
    <Card className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Time-Series Animation</h3>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={handlePlayPause}>
            {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </Button>
          <Button variant="outline" size="icon" onClick={handleReset}>
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="text-sm text-muted-foreground">
        Progress: {currentIndex} / {fullData?.length || 0} data points
      </div>

      <ResponsiveContainer width="100%" height={350}>
        <LineChart data={displayData}>
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
          <Legend />
          <Line 
            type="monotone" 
            dataKey="pool_price" 
            stroke="hsl(var(--primary))" 
            strokeWidth={2}
            dot={false}
            name="Price"
            isAnimationActive={true}
            animationDuration={300}
          />
          <Line 
            type="monotone" 
            dataKey="generation_wind" 
            stroke="hsl(142, 71%, 45%)" 
            strokeWidth={2}
            dot={false}
            name="Wind"
            isAnimationActive={true}
            animationDuration={300}
          />
          <Line 
            type="monotone" 
            dataKey="generation_solar" 
            stroke="hsl(48, 96%, 53%)" 
            strokeWidth={2}
            dot={false}
            name="Solar"
            isAnimationActive={true}
            animationDuration={300}
          />
        </LineChart>
      </ResponsiveContainer>
    </Card>
  );
}

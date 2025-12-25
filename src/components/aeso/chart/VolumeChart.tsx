import React from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  ResponsiveContainer, 
  ReferenceLine,
  Cell 
} from 'recharts';

interface VolumeDataPoint {
  timestamp: string;
  volume: number;
  priceUp?: boolean;
}

interface VolumeChartProps {
  data: VolumeDataPoint[];
  nowTimestamp?: string;
}

export function VolumeChart({ data, nowTimestamp }: VolumeChartProps) {
  if (!data || data.length === 0) {
    return null;
  }

  const maxVolume = Math.max(...data.map(d => d.volume || 0));
  
  return (
    <div className="h-[60px] w-full border-t border-border bg-muted/10">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart 
          data={data} 
          margin={{ top: 5, right: 5, left: 0, bottom: 0 }}
          barCategoryGap="10%"
        >
          <XAxis 
            dataKey="timestamp" 
            hide 
          />
          <YAxis 
            domain={[0, maxVolume * 1.1]}
            hide
          />
          {nowTimestamp && (
            <ReferenceLine 
              x={nowTimestamp} 
              stroke="hsl(var(--muted-foreground))" 
              strokeDasharray="3 3"
              strokeWidth={1}
            />
          )}
          <Bar 
            dataKey="volume" 
            radius={[2, 2, 0, 0]}
            maxBarSize={8}
          >
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`}
                fill={entry.priceUp === undefined 
                  ? 'hsl(var(--muted-foreground))' 
                  : entry.priceUp 
                    ? 'hsl(142 76% 36% / 0.6)' // emerald when price down (good)
                    : 'hsl(0 84% 60% / 0.6)'   // red when price up (bad for energy)
                }
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

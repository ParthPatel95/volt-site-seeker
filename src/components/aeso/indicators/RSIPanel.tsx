import React, { useMemo } from 'react';
import { 
  ResponsiveContainer, 
  ComposedChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid,
  ReferenceLine,
  Area
} from 'recharts';
import { format } from 'date-fns';

interface RSIPanelProps {
  data: { timestamp: string; actual?: number }[];
  period?: number;
  height?: number;
}

function calculateRSI(prices: number[], period: number = 14): (number | null)[] {
  const result: (number | null)[] = [];
  
  if (prices.length < period + 1) {
    return prices.map(() => null);
  }

  let gains: number[] = [];
  let losses: number[] = [];

  for (let i = 1; i < prices.length; i++) {
    const change = prices[i] - prices[i - 1];
    gains.push(change > 0 ? change : 0);
    losses.push(change < 0 ? Math.abs(change) : 0);
  }

  // First RSI calculation (SMA of gains/losses)
  for (let i = 0; i < period; i++) {
    result.push(null);
  }

  let avgGain = gains.slice(0, period).reduce((a, b) => a + b, 0) / period;
  let avgLoss = losses.slice(0, period).reduce((a, b) => a + b, 0) / period;

  const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
  result.push(100 - (100 / (1 + rs)));

  // Subsequent RSI calculations (Wilder's smoothing)
  for (let i = period; i < gains.length; i++) {
    avgGain = ((avgGain * (period - 1)) + gains[i]) / period;
    avgLoss = ((avgLoss * (period - 1)) + losses[i]) / period;
    const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
    result.push(100 - (100 / (1 + rs)));
  }

  return result;
}

export function RSIPanel({ data, period = 14, height = 100 }: RSIPanelProps) {
  const rsiData = useMemo(() => {
    const prices = data
      .filter(d => d.actual !== undefined)
      .map(d => d.actual as number);
    
    const rsiValues = calculateRSI(prices, period);
    
    let rsiIndex = 0;
    return data.map(point => {
      if (point.actual === undefined) {
        return { ...point, rsi: null };
      }
      return { ...point, rsi: rsiValues[rsiIndex++] };
    });
  }, [data, period]);

  const formatXAxis = (value: string) => {
    try {
      return format(new Date(value), 'HH:mm');
    } catch {
      return '';
    }
  };

  return (
    <div className="border-t border-border/50">
      <div className="flex items-center justify-between px-3 py-1.5 bg-muted/30">
        <span className="text-xs font-medium text-muted-foreground">RSI ({period})</span>
        <div className="flex items-center gap-3 text-[10px]">
          <span className="text-red-500">Overbought &gt;70</span>
          <span className="text-green-500">Oversold &lt;30</span>
        </div>
      </div>
      <div style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={rsiData} margin={{ top: 5, right: 60, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="rsiOverboughtGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#ef4444" stopOpacity={0.3}/>
                <stop offset="100%" stopColor="#ef4444" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="rsiOversoldGradient" x1="0" y1="1" x2="0" y2="0">
                <stop offset="0%" stopColor="#22c55e" stopOpacity={0.3}/>
                <stop offset="100%" stopColor="#22c55e" stopOpacity={0}/>
              </linearGradient>
            </defs>
            
            <CartesianGrid 
              strokeDasharray="3 3" 
              stroke="hsl(var(--border))" 
              opacity={0.3}
              vertical={false}
            />
            
            <XAxis 
              dataKey="timestamp" 
              tickFormatter={formatXAxis}
              tick={{ fontSize: 9, fill: 'hsl(var(--muted-foreground))' }}
              stroke="hsl(var(--border))"
              axisLine={false}
              tickLine={false}
              minTickGap={80}
            />
            
            <YAxis 
              orientation="right"
              domain={[0, 100]}
              ticks={[0, 30, 50, 70, 100]}
              tick={{ fontSize: 9, fill: 'hsl(var(--muted-foreground))' }}
              stroke="hsl(var(--border))"
              axisLine={false}
              tickLine={false}
              width={30}
            />

            {/* Overbought zone */}
            <ReferenceLine y={70} stroke="#ef4444" strokeDasharray="3 3" strokeWidth={1} />
            <ReferenceLine y={30} stroke="#22c55e" strokeDasharray="3 3" strokeWidth={1} />
            <ReferenceLine y={50} stroke="hsl(var(--muted-foreground))" strokeDasharray="2 4" strokeWidth={0.5} />

            <Line 
              type="monotone" 
              dataKey="rsi" 
              stroke="#8b5cf6" 
              strokeWidth={1.5}
              dot={false}
              connectNulls={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

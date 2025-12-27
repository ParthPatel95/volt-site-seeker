import React, { useMemo } from 'react';
import { 
  ResponsiveContainer, 
  ComposedChart, 
  Line, 
  Bar,
  XAxis, 
  YAxis, 
  CartesianGrid,
  ReferenceLine,
  Cell
} from 'recharts';
import { format } from 'date-fns';

interface MACDPanelProps {
  data: { timestamp: string; actual?: number }[];
  fastPeriod?: number;
  slowPeriod?: number;
  signalPeriod?: number;
  height?: number;
}

function calculateEMA(prices: number[], period: number): number[] {
  const result: number[] = [];
  const multiplier = 2 / (period + 1);
  
  // First EMA is SMA
  let ema = prices.slice(0, period).reduce((a, b) => a + b, 0) / period;
  
  for (let i = 0; i < period - 1; i++) {
    result.push(ema); // Use initial SMA for first values
  }
  result.push(ema);
  
  for (let i = period; i < prices.length; i++) {
    ema = (prices[i] - ema) * multiplier + ema;
    result.push(ema);
  }
  
  return result;
}

interface MACDValues {
  macd: number | null;
  signal: number | null;
  histogram: number | null;
}

function calculateMACD(
  prices: number[], 
  fastPeriod: number = 12, 
  slowPeriod: number = 26, 
  signalPeriod: number = 9
): MACDValues[] {
  if (prices.length < slowPeriod) {
    return prices.map(() => ({ macd: null, signal: null, histogram: null }));
  }

  const fastEMA = calculateEMA(prices, fastPeriod);
  const slowEMA = calculateEMA(prices, slowPeriod);
  
  // MACD line = Fast EMA - Slow EMA
  const macdLine = fastEMA.map((fast, i) => fast - slowEMA[i]);
  
  // Signal line = EMA of MACD line
  const signalLine = calculateEMA(macdLine.slice(slowPeriod - 1), signalPeriod);
  
  const result: MACDValues[] = [];
  
  for (let i = 0; i < slowPeriod - 1; i++) {
    result.push({ macd: null, signal: null, histogram: null });
  }
  
  for (let i = slowPeriod - 1; i < prices.length; i++) {
    const macdValue = macdLine[i];
    const signalIdx = i - (slowPeriod - 1);
    const signalValue = signalIdx < signalPeriod - 1 ? null : signalLine[signalIdx];
    const histogramValue = signalValue !== null ? macdValue - signalValue : null;
    
    result.push({
      macd: macdValue,
      signal: signalValue,
      histogram: histogramValue
    });
  }
  
  return result;
}

export function MACDPanel({ 
  data, 
  fastPeriod = 12, 
  slowPeriod = 26, 
  signalPeriod = 9,
  height = 120 
}: MACDPanelProps) {
  const macdData = useMemo(() => {
    const prices = data
      .filter(d => d.actual !== undefined)
      .map(d => d.actual as number);
    
    const macdValues = calculateMACD(prices, fastPeriod, slowPeriod, signalPeriod);
    
    let macdIndex = 0;
    return data.map(point => {
      if (point.actual === undefined) {
        return { ...point, macd: null, signal: null, histogram: null };
      }
      const values = macdValues[macdIndex++] || { macd: null, signal: null, histogram: null };
      return { ...point, ...values };
    });
  }, [data, fastPeriod, slowPeriod, signalPeriod]);

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
        <span className="text-xs font-medium text-muted-foreground">
          MACD ({fastPeriod}, {slowPeriod}, {signalPeriod})
        </span>
        <div className="flex items-center gap-3 text-[10px]">
          <div className="flex items-center gap-1">
            <div className="w-2 h-0.5 bg-blue-500" />
            <span className="text-muted-foreground">MACD</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-0.5 bg-orange-500" />
            <span className="text-muted-foreground">Signal</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-emerald-500/50" />
            <span className="text-muted-foreground">Histogram</span>
          </div>
        </div>
      </div>
      <div style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={macdData} margin={{ top: 5, right: 60, left: 0, bottom: 0 }}>
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
              tick={{ fontSize: 9, fill: 'hsl(var(--muted-foreground))' }}
              stroke="hsl(var(--border))"
              axisLine={false}
              tickLine={false}
              width={40}
              tickFormatter={(v) => v.toFixed(1)}
            />

            <ReferenceLine y={0} stroke="hsl(var(--muted-foreground))" strokeWidth={0.5} />

            {/* Histogram bars */}
            <Bar dataKey="histogram" radius={[1, 1, 0, 0]} maxBarSize={4}>
              {macdData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`}
                  fill={(entry.histogram ?? 0) >= 0 ? 'hsl(142 76% 36% / 0.7)' : 'hsl(0 84% 60% / 0.7)'}
                />
              ))}
            </Bar>

            {/* MACD Line */}
            <Line 
              type="monotone" 
              dataKey="macd" 
              stroke="#3b82f6" 
              strokeWidth={1.5}
              dot={false}
              connectNulls={false}
            />

            {/* Signal Line */}
            <Line 
              type="monotone" 
              dataKey="signal" 
              stroke="#f97316" 
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

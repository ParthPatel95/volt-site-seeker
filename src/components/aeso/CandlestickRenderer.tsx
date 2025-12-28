import React from 'react';
import { Cell } from 'recharts';

interface CandlestickData {
  timestamp: string;
  open: number;
  high: number;
  low: number;
  close: number;
}

interface CandlestickRendererProps {
  data: CandlestickData[];
  x: number;
  y: number;
  width: number;
  height: number;
  index: number;
}

// Custom Candlestick shape for recharts Bar component
export function CandlestickShape({ 
  x, 
  y, 
  width, 
  height, 
  payload,
  yAxisScale
}: any) {
  if (!payload || payload.open === undefined) return null;

  const { open, high, low, close } = payload;
  const isUp = close >= open;
  const color = isUp ? '#10b981' : '#ef4444';
  
  // Calculate positions using yAxis scale
  const openY = yAxisScale(open);
  const closeY = yAxisScale(close);
  const highY = yAxisScale(high);
  const lowY = yAxisScale(low);
  
  const bodyTop = Math.min(openY, closeY);
  const bodyHeight = Math.abs(closeY - openY) || 2;
  const wickX = x + width / 2;

  return (
    <g>
      {/* Wick (high to low line) */}
      <line
        x1={wickX}
        y1={highY}
        x2={wickX}
        y2={lowY}
        stroke={color}
        strokeWidth={1}
      />
      {/* Body (open to close rectangle) */}
      <rect
        x={x + 1}
        y={bodyTop}
        width={Math.max(width - 2, 3)}
        height={Math.max(bodyHeight, 2)}
        fill={isUp ? color : color}
        stroke={color}
        strokeWidth={1}
      />
    </g>
  );
}

// Aggregate hourly data into OHLC candles
export function aggregateToCandles(
  data: { timestamp: string; actual?: number }[],
  intervalHours: number = 4
): CandlestickData[] {
  const candles: CandlestickData[] = [];
  
  const sortedData = data
    .filter(d => d.actual !== undefined)
    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  
  if (sortedData.length === 0) return [];
  
  let currentCandle: CandlestickData | null = null;
  let candleStartTime = 0;
  const intervalMs = intervalHours * 60 * 60 * 1000;

  sortedData.forEach((point) => {
    const pointTime = new Date(point.timestamp).getTime();
    const price = point.actual!;
    
    // Start a new candle if needed
    if (!currentCandle || pointTime >= candleStartTime + intervalMs) {
      if (currentCandle) {
        candles.push(currentCandle);
      }
      
      candleStartTime = Math.floor(pointTime / intervalMs) * intervalMs;
      currentCandle = {
        timestamp: new Date(candleStartTime).toISOString(),
        open: price,
        high: price,
        low: price,
        close: price,
      };
    } else {
      // Update existing candle
      currentCandle.high = Math.max(currentCandle.high, price);
      currentCandle.low = Math.min(currentCandle.low, price);
      currentCandle.close = price;
    }
  });
  
  // Don't forget the last candle
  if (currentCandle) {
    candles.push(currentCandle);
  }
  
  return candles;
}

// Calculate candle color for Cell component
export function getCandleColor(candle: CandlestickData): string {
  return candle.close >= candle.open ? '#10b981' : '#ef4444';
}

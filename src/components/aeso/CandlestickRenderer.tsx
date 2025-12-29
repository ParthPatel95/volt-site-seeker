import React from 'react';

export interface CandlestickData {
  timestamp: string;
  open: number;
  high: number;
  low: number;
  close: number;
  isLive?: boolean;      // Current hour candle
  isForecast?: boolean;  // Future projection
  confidenceScore?: number;
  confidenceLower?: number;
  confidenceUpper?: number;
}

// Custom Candlestick shape for recharts Bar component
export function CandlestickShape({ 
  x, 
  width, 
  payload,
  chartHeight = 300,
  chartTop = 10,
  priceMin,
  priceMax
}: {
  x: number;
  width: number;
  payload: CandlestickData;
  chartHeight?: number;
  chartTop?: number;
  priceMin: number;
  priceMax: number;
}) {
  if (!payload || payload.open === undefined) return null;

  const { open, high, low, close, isLive, isForecast } = payload;
  const isUp = close >= open;
  
  // Different colors for different candle types
  let color: string;
  let opacity = 1;
  let strokeDash = '';
  
  if (isForecast) {
    // Forecast candles: semi-transparent with distinct color
    color = isUp ? '#06b6d4' : '#f97316'; // cyan/orange for forecast
    opacity = 0.6;
    strokeDash = '3 2';
  } else {
    color = isUp ? '#10b981' : '#ef4444'; // green/red for actual
  }
  
  // Create Y scale function based on price domain and chart dimensions
  const priceRange = priceMax - priceMin || 1;
  
  // Scale: converts price to Y pixel (higher prices = lower Y values)
  const yScale = (price: number) => {
    const normalized = (price - priceMin) / priceRange;
    return chartTop + chartHeight - (normalized * chartHeight);
  };
  
  const openY = yScale(open);
  const closeY = yScale(close);
  const highY = yScale(high);
  const lowY = yScale(low);
  
  const bodyTop = Math.min(openY, closeY);
  const bodyHeight = Math.max(Math.abs(closeY - openY), 2);
  const wickX = x + width / 2;
  const candleWidth = Math.max(width - 4, 4);

  return (
    <g opacity={opacity}>
      {/* Wick line (high to low) */}
      <line
        x1={wickX}
        y1={highY}
        x2={wickX}
        y2={lowY}
        stroke={color}
        strokeWidth={isForecast ? 1 : 1.5}
        strokeDasharray={strokeDash}
      />
      {/* Body rectangle (open to close) */}
      <rect
        x={x + (width - candleWidth) / 2}
        y={bodyTop}
        width={candleWidth}
        height={bodyHeight}
        fill={isForecast ? 'transparent' : color}
        stroke={color}
        strokeWidth={isForecast ? 1.5 : 1}
        strokeDasharray={isForecast ? '3 2' : ''}
        rx={1}
        ry={1}
      />
      {/* Live candle pulsing border */}
      {isLive && (
        <>
          <rect
            x={x + (width - candleWidth) / 2 - 2}
            y={bodyTop - 2}
            width={candleWidth + 4}
            height={bodyHeight + 4}
            fill="none"
            stroke="#f59e0b"
            strokeWidth={2}
            rx={2}
            ry={2}
            className="animate-pulse"
          />
          {/* Live indicator dot */}
          <circle
            cx={x + width / 2}
            cy={bodyTop - 8}
            r={3}
            fill="#f59e0b"
            className="animate-pulse"
          />
        </>
      )}
      {/* Forecast indicator hatching pattern */}
      {isForecast && (
        <line
          x1={x + (width - candleWidth) / 2}
          y1={bodyTop + bodyHeight / 2}
          x2={x + (width - candleWidth) / 2 + candleWidth}
          y2={bodyTop + bodyHeight / 2}
          stroke={color}
          strokeWidth={0.5}
          strokeDasharray="2 2"
        />
      )}
    </g>
  );
}

// Aggregate hourly data into OHLC candles
export function aggregateToCandles(
  data: { timestamp: string; actual?: number }[],
  intervalHours: number = 1,
  currentTime?: Date
): CandlestickData[] {
  const candles: CandlestickData[] = [];
  
  const sortedData = data
    .filter(d => d.actual !== undefined)
    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  
  if (sortedData.length === 0) return [];
  
  let currentCandle: CandlestickData | null = null;
  let candleStartTime = 0;
  const intervalMs = intervalHours * 60 * 60 * 1000;
  const now = currentTime || new Date();
  const currentHourStart = Math.floor(now.getTime() / intervalMs) * intervalMs;

  sortedData.forEach((point) => {
    const pointTime = new Date(point.timestamp).getTime();
    const price = point.actual!;
    
    // Start a new candle if needed
    if (!currentCandle || pointTime >= candleStartTime + intervalMs) {
      if (currentCandle) {
        candles.push(currentCandle);
      }
      
      candleStartTime = Math.floor(pointTime / intervalMs) * intervalMs;
      const isCurrentInterval = candleStartTime === currentHourStart;
      
      currentCandle = {
        timestamp: new Date(candleStartTime).toISOString(),
        open: price,
        high: price,
        low: price,
        close: price,
        isLive: isCurrentInterval,
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

// Generate forecast candles from AI predictions
export function generateForecastCandles(
  aiPredictions: Array<{
    timestamp: string;
    price: number;
    confidenceLower?: number;
    confidenceUpper?: number;
    confidenceScore?: number;
  }>,
  lastActualPrice: number,
  intervalHours: number = 1
): CandlestickData[] {
  if (!aiPredictions || aiPredictions.length === 0) return [];
  
  const sorted = [...aiPredictions].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );
  
  const forecastCandles: CandlestickData[] = [];
  let previousClose = lastActualPrice;
  
  sorted.forEach((pred, index) => {
    const predPrice = pred.price;
    const lower = pred.confidenceLower ?? predPrice * 0.95;
    const upper = pred.confidenceUpper ?? predPrice * 1.05;
    
    // For forecast candles: open = previous close, close = predicted price
    const open = previousClose;
    const close = predPrice;
    
    // High/low from confidence bounds
    const high = Math.max(open, close, upper);
    const low = Math.min(open, close, lower);
    
    forecastCandles.push({
      timestamp: pred.timestamp,
      open,
      high,
      low,
      close,
      isForecast: true,
      confidenceScore: pred.confidenceScore,
      confidenceLower: lower,
      confidenceUpper: upper,
    });
    
    previousClose = close;
  });
  
  return forecastCandles;
}

// Calculate candle color for Cell component
export function getCandleColor(candle: CandlestickData): string {
  if (candle.isForecast) {
    return candle.close >= candle.open ? '#06b6d4' : '#f97316';
  }
  return candle.close >= candle.open ? '#10b981' : '#ef4444';
}

// Get live candle animation class
export function getLiveCandleClass(candle: CandlestickData): string {
  return candle.isLive ? 'animate-pulse' : '';
}

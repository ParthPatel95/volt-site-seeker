import React from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  TrendingDown, 
  Brain, 
  Building2, 
  Activity,
  Zap,
  BarChart2,
  Gauge
} from 'lucide-react';

interface TickerItem {
  label: string;
  value: number | null;
  change?: number;
  icon?: React.ElementType;
  type?: 'price' | 'high' | 'low' | 'ai' | 'aeso' | 'normal' | 'volume' | 'volatility';
  suffix?: string;
}

interface TickerTapeProps {
  currentPrice: number;
  changePercent: number;
  high: number;
  low: number;
  average: number;
  aiPrediction?: number;
  aesoForecast?: number;
  negativeHours?: number;
  volume?: number;
  volatility?: number;
}

export function TickerTape({
  currentPrice,
  changePercent,
  high,
  low,
  average,
  aiPrediction,
  aesoForecast,
  negativeHours = 0,
  volume,
  volatility
}: TickerTapeProps) {
  // Calculate volatility from price range if not provided
  const calcVolatility = volatility ?? ((high - low) / average * 100);
  
  const items: TickerItem[] = [
    { label: 'AESO Pool', value: currentPrice, change: changePercent, type: 'price', icon: Zap },
    { label: 'Session High', value: high, type: 'high' },
    { label: 'Session Low', value: low, type: 'low' },
    { label: 'VWAP', value: average, type: 'normal' },
    ...(volume ? [{ label: 'Volume', value: volume, type: 'volume' as const, icon: BarChart2, suffix: ' MW' }] : []),
    ...(calcVolatility > 0 ? [{ label: 'Volatility', value: calcVolatility, type: 'volatility' as const, icon: Gauge, suffix: '%' }] : []),
    ...(aiPrediction ? [{ label: 'AI Forecast', value: aiPrediction, type: 'ai' as const, icon: Brain }] : []),
    ...(aesoForecast ? [{ label: 'AESO Forecast', value: aesoForecast, type: 'aeso' as const, icon: Building2 }] : []),
    ...(negativeHours > 0 ? [{ label: 'Neg Hours', value: negativeHours, type: 'low' as const, suffix: 'h' }] : []),
  ];

  const getValueColor = (type?: string, change?: number) => {
    if (type === 'high') return 'text-red-500';
    if (type === 'low') return 'text-emerald-500';
    if (type === 'ai') return 'text-emerald-500';
    if (type === 'aeso') return 'text-blue-500';
    if (type === 'volume') return 'text-foreground';
    if (type === 'volatility') return calcVolatility > 20 ? 'text-amber-500' : 'text-foreground';
    if (type === 'price' && change !== undefined) {
      return change >= 0 ? 'text-red-500' : 'text-emerald-500';
    }
    return 'text-foreground';
  };

  const getBackgroundColor = (type?: string, change?: number) => {
    if (type === 'price') {
      return change !== undefined && change >= 0 
        ? 'bg-red-500/5' 
        : 'bg-emerald-500/5';
    }
    return 'bg-transparent';
  };

  const renderTickerItem = (item: TickerItem, index: number) => (
    <div 
      key={`${item.label}-${index}`}
      className={`flex items-center gap-2 px-4 py-1 whitespace-nowrap rounded ${getBackgroundColor(item.type, item.change)}`}
    >
      {item.icon && <item.icon className="w-3.5 h-3.5 text-muted-foreground" />}
      <span className="text-muted-foreground text-sm font-medium">{item.label}</span>
      <span className={`font-bold text-sm ${getValueColor(item.type, item.change)}`}>
        {item.suffix && !item.suffix.includes('$')
          ? `${item.value?.toFixed(item.type === 'volatility' ? 1 : 0) || '--'}${item.suffix}`
          : `$${item.value?.toFixed(2) || '--'}`}
      </span>
      {item.change !== undefined && (
        <span className={`flex items-center gap-0.5 text-xs font-semibold px-1.5 py-0.5 rounded ${
          item.change >= 0 
            ? 'text-red-600 bg-red-500/10' 
            : 'text-emerald-600 bg-emerald-500/10'
        }`}>
          {item.change >= 0 ? (
            <TrendingUp className="w-3 h-3" />
          ) : (
            <TrendingDown className="w-3 h-3" />
          )}
          {item.change >= 0 ? '+' : ''}{item.change.toFixed(2)}%
        </span>
      )}
      <span className="text-border mx-2">│</span>
    </div>
  );

  // Duplicate items for seamless loop
  const duplicatedItems = [...items, ...items, ...items];

  return (
    <div className="overflow-hidden bg-card border-b border-border py-2">
      <motion.div
        className="flex items-center"
        animate={{ x: ['0%', '-33.333%'] }}
        transition={{
          duration: 40,
          repeat: Infinity,
          ease: 'linear',
        }}
      >
        {duplicatedItems.map((item, index) => renderTickerItem(item, index))}
      </motion.div>
    </div>
  );
}

import React from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  TrendingDown, 
  Brain, 
  Building2, 
  Activity,
  Zap
} from 'lucide-react';

interface TickerItem {
  label: string;
  value: number | null;
  change?: number;
  icon?: React.ElementType;
  type?: 'price' | 'high' | 'low' | 'ai' | 'aeso' | 'normal';
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
}

export function TickerTape({
  currentPrice,
  changePercent,
  high,
  low,
  average,
  aiPrediction,
  aesoForecast,
  negativeHours = 0
}: TickerTapeProps) {
  const items: TickerItem[] = [
    { label: 'AESO Pool', value: currentPrice, change: changePercent, type: 'price', icon: Zap },
    { label: 'High', value: high, type: 'high' },
    { label: 'Low', value: low, type: 'low' },
    { label: 'Avg', value: average, type: 'normal' },
    ...(aiPrediction ? [{ label: 'AI Forecast', value: aiPrediction, type: 'ai' as const, icon: Brain }] : []),
    ...(aesoForecast ? [{ label: 'AESO Forecast', value: aesoForecast, type: 'aeso' as const, icon: Building2 }] : []),
    ...(negativeHours > 0 ? [{ label: 'Negative Hours', value: negativeHours, type: 'low' as const }] : []),
  ];

  const getValueColor = (type?: string, change?: number) => {
    if (type === 'high') return 'text-red-400';
    if (type === 'low') return 'text-emerald-400';
    if (type === 'ai') return 'text-emerald-400';
    if (type === 'aeso') return 'text-blue-400';
    if (type === 'price' && change !== undefined) {
      return change >= 0 ? 'text-green-400' : 'text-red-400';
    }
    return 'text-white';
  };

  const renderTickerItem = (item: TickerItem, index: number) => (
    <div 
      key={`${item.label}-${index}`}
      className="flex items-center gap-2 px-4 whitespace-nowrap"
    >
      {item.icon && <item.icon className="w-3.5 h-3.5 text-slate-400" />}
      <span className="text-slate-400 text-sm">{item.label}:</span>
      <span className={`font-semibold text-sm ${getValueColor(item.type, item.change)}`}>
        {item.type === 'low' && item.label === 'Negative Hours' 
          ? `${item.value}h` 
          : `$${item.value?.toFixed(2) || '--'}`}
      </span>
      {item.change !== undefined && (
        <span className={`flex items-center gap-0.5 text-xs ${item.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
          {item.change >= 0 ? (
            <TrendingUp className="w-3 h-3" />
          ) : (
            <TrendingDown className="w-3 h-3" />
          )}
          {item.change >= 0 ? '+' : ''}{item.change.toFixed(1)}%
        </span>
      )}
      <span className="text-slate-600 ml-2">│</span>
    </div>
  );

  // Duplicate items for seamless loop
  const duplicatedItems = [...items, ...items, ...items];

  return (
    <div className="overflow-hidden bg-slate-900/95 border-b border-slate-700/50 py-2">
      <motion.div
        className="flex"
        animate={{ x: ['0%', '-33.333%'] }}
        transition={{
          duration: 30,
          repeat: Infinity,
          ease: 'linear',
        }}
      >
        {duplicatedItems.map((item, index) => renderTickerItem(item, index))}
      </motion.div>
    </div>
  );
}

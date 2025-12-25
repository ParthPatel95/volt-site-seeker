import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface OHLCHeaderProps {
  open: number;
  high: number;
  low: number;
  close: number;
  change: number;
  changePercent: number;
  currentPrice: number;
}

export function OHLCHeader({
  open,
  high,
  low,
  close,
  change,
  changePercent,
  currentPrice
}: OHLCHeaderProps) {
  const isPositive = change >= 0;

  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 px-3 py-2 border-b border-border bg-card">
      {/* OHLC Values - Inline like TradingView */}
      <div className="flex items-center gap-3 text-xs">
        <span className="text-muted-foreground">
          O <span className="font-mono font-semibold text-foreground">${open.toFixed(2)}</span>
        </span>
        <span className="text-muted-foreground">
          H <span className="font-mono font-semibold text-red-500">${high.toFixed(2)}</span>
        </span>
        <span className="text-muted-foreground">
          L <span className="font-mono font-semibold text-emerald-500">${low.toFixed(2)}</span>
        </span>
        <span className="text-muted-foreground">
          C <span className="font-mono font-semibold text-foreground">${close.toFixed(2)}</span>
        </span>
      </div>

      <div className="h-4 w-px bg-border hidden sm:block" />

      {/* Price Change */}
      <motion.div 
        className={`flex items-center gap-1.5 text-sm font-semibold ${
          isPositive ? 'text-red-500' : 'text-emerald-500'
        }`}
        key={change}
        initial={{ scale: 1.05 }}
        animate={{ scale: 1 }}
      >
        {isPositive ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
        <span>{isPositive ? '+' : ''}${change.toFixed(2)}</span>
        <span className="text-xs">({isPositive ? '+' : ''}{changePercent.toFixed(2)}%)</span>
      </motion.div>
    </div>
  );
}

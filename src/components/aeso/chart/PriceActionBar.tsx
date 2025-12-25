import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { BarChart2, TrendingDown, TrendingUp } from 'lucide-react';

interface PriceActionBarProps {
  currentPrice: number;
  high: number;
  low: number;
  volume?: number;
  onSellClick?: () => void;
  onBuyClick?: () => void;
}

export function PriceActionBar({
  currentPrice,
  high,
  low,
  volume,
  onSellClick,
  onBuyClick
}: PriceActionBarProps) {
  return (
    <div className="flex items-center justify-between px-3 py-2 border-b border-border bg-muted/20">
      {/* SELL/BUY Buttons */}
      <div className="flex items-center gap-2">
        {/* SELL at Low */}
        <Button
          variant="outline"
          size="sm"
          onClick={onSellClick}
          className="h-8 gap-1.5 border-red-500/50 text-red-600 hover:bg-red-500/10 hover:text-red-600 font-mono"
        >
          <TrendingDown className="w-3.5 h-3.5" />
          <span className="font-bold">${low.toFixed(2)}</span>
          <span className="text-[10px] font-normal">SELL</span>
        </Button>

        <span className="text-muted-foreground text-xs">|</span>

        {/* BUY at Current */}
        <Button
          variant="outline"
          size="sm"
          onClick={onBuyClick}
          className="h-8 gap-1.5 border-emerald-500/50 text-emerald-600 hover:bg-emerald-500/10 hover:text-emerald-600 font-mono"
        >
          <TrendingUp className="w-3.5 h-3.5" />
          <span className="font-bold">${currentPrice.toFixed(2)}</span>
          <span className="text-[10px] font-normal">BUY</span>
        </Button>
      </div>

      {/* Volume/Load Indicator */}
      {volume !== undefined && volume > 0 && (
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="h-6 gap-1 text-xs font-normal">
            <BarChart2 className="w-3 h-3" />
            <span className="text-muted-foreground">Vol</span>
            <span className="font-mono font-semibold text-foreground">
              {volume >= 1000 ? `${(volume / 1000).toFixed(1)}K` : volume.toFixed(0)} MW
            </span>
          </Badge>
        </div>
      )}

      {/* Price Range Indicator */}
      <div className="hidden sm:flex items-center gap-2">
        <div className="text-[10px] text-muted-foreground">Range</div>
        <div className="relative w-24 h-1.5 bg-muted rounded-full overflow-hidden">
          <div 
            className="absolute h-full bg-gradient-to-r from-emerald-500 via-amber-500 to-red-500 opacity-40" 
            style={{ width: '100%' }}
          />
          <motion.div 
            className="absolute w-2 h-2 -top-0.5 bg-foreground rounded-full shadow ring-1 ring-background"
            style={{
              left: `calc(${Math.max(0, Math.min(100, ((currentPrice - low) / (high - low || 1)) * 100))}% - 4px)`
            }}
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </div>
        <div className="flex items-center gap-1 text-[10px]">
          <span className="text-emerald-500">${low.toFixed(0)}</span>
          <span className="text-muted-foreground">-</span>
          <span className="text-red-500">${high.toFixed(0)}</span>
        </div>
      </div>
    </div>
  );
}

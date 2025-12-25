import React from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';

interface FloatingPriceBadgeProps {
  price: number;
  yPosition: number; // percentage from top
  isUp?: boolean;
}

export function FloatingPriceBadge({ price, yPosition, isUp }: FloatingPriceBadgeProps) {
  return (
    <motion.div
      className={`absolute right-0 z-20 px-2 py-1 rounded-l-md text-white text-xs font-bold shadow-lg ${
        isUp ? 'bg-red-500' : 'bg-emerald-500'
      }`}
      style={{ 
        top: `${Math.max(5, Math.min(85, yPosition))}%`,
        transform: 'translateY(-50%)'
      }}
      initial={{ x: 10, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex flex-col items-end">
        <span className="tabular-nums">${price.toFixed(2)}</span>
        <span className="text-[9px] opacity-80">{format(new Date(), 'HH:mm')}</span>
      </div>
      {/* Arrow pointing to chart */}
      <div 
        className={`absolute left-0 top-1/2 -translate-x-1 -translate-y-1/2 w-0 h-0 
          border-t-[5px] border-t-transparent 
          border-b-[5px] border-b-transparent 
          ${isUp ? 'border-r-[5px] border-r-red-500' : 'border-r-[5px] border-r-emerald-500'}`}
      />
    </motion.div>
  );
}

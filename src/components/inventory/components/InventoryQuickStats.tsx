import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Package, 
  TrendingUp, 
  AlertTriangle, 
  PackageX,
  DollarSign
} from 'lucide-react';
import { InventoryStats } from '../types/inventory.types';
import { cn } from '@/lib/utils';

interface InventoryQuickStatsProps {
  stats: InventoryStats;
  className?: string;
}

interface StatItemProps {
  icon: React.ElementType;
  iconColor: string;
  bgColor: string;
  value: string | number;
  label: string;
  isFirst?: boolean;
  isLast?: boolean;
}

function StatItem({ icon: Icon, iconColor, bgColor, value, label, isFirst, isLast }: StatItemProps) {
  return (
    <motion.div
      whileTap={{ scale: 0.98 }}
      className={cn(
        "flex-shrink-0 w-[130px] snap-center",
        isFirst && "ml-4",
        isLast && "mr-4"
      )}
    >
      <Card className="h-full border-border/50 hover:border-border transition-colors">
        <CardContent className="p-3">
          <div className="flex items-center gap-2.5">
            <div className={cn(
              "w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0",
              bgColor
            )}>
              <Icon className={cn("w-4 h-4", iconColor)} />
            </div>
            <div className="min-w-0">
              <p className="text-lg font-bold tabular-nums leading-none text-foreground">
                {value}
              </p>
              <p className="text-[10px] text-muted-foreground mt-0.5 truncate">
                {label}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export function InventoryQuickStats({ stats, className }: InventoryQuickStatsProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const statItems = [
    {
      icon: Package,
      iconColor: 'text-primary',
      bgColor: 'bg-primary/10',
      value: stats.totalItems,
      label: 'Total Items',
    },
    {
      icon: TrendingUp,
      iconColor: 'text-emerald-600',
      bgColor: 'bg-emerald-500/10',
      value: stats.inStockCount,
      label: 'In Stock',
    },
    {
      icon: AlertTriangle,
      iconColor: 'text-amber-600',
      bgColor: 'bg-amber-500/10',
      value: stats.lowStockCount,
      label: 'Low Stock',
    },
    {
      icon: PackageX,
      iconColor: 'text-red-600',
      bgColor: 'bg-red-500/10',
      value: stats.outOfStockCount,
      label: 'Out of Stock',
    },
    {
      icon: DollarSign,
      iconColor: 'text-blue-600',
      bgColor: 'bg-blue-500/10',
      value: `$${(stats.totalValue / 1000).toFixed(1)}K`,
      label: 'Total Value',
    },
  ];

  return (
    <div className={cn("relative", className)}>
      {/* Horizontal scrollable container */}
      <div 
        ref={scrollRef}
        className="flex gap-3 overflow-x-auto scrollbar-hide snap-x snap-mandatory py-1 -mx-4"
        style={{ 
          scrollbarWidth: 'none', 
          msOverflowStyle: 'none',
          WebkitOverflowScrolling: 'touch'
        }}
      >
        {statItems.map((item, index) => (
          <StatItem
            key={item.label}
            {...item}
            isFirst={index === 0}
            isLast={index === statItems.length - 1}
          />
        ))}
      </div>

      {/* Scroll indicators */}
      <div className="flex justify-center gap-1.5 mt-3">
        {statItems.map((_, index) => (
          <div
            key={index}
            className="w-1.5 h-1.5 rounded-full bg-muted-foreground/20"
          />
        ))}
      </div>
    </div>
  );
}

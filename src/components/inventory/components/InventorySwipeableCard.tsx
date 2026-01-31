import React, { useState } from 'react';
import { motion, useMotionValue, useTransform, PanInfo } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Package, 
  MapPin, 
  AlertTriangle, 
  Plus, 
  Minus,
  ChevronRight
} from 'lucide-react';
import { InventoryItem } from '../types/inventory.types';
import { cn } from '@/lib/utils';

interface InventorySwipeableCardProps {
  item: InventoryItem;
  onClick?: () => void;
  onAddStock?: () => void;
  onRemoveStock?: () => void;
}

const getStatusColor = (status: InventoryItem['status']) => {
  switch (status) {
    case 'in_stock':
      return 'bg-emerald-500/15 text-emerald-600 border-emerald-500/30';
    case 'low_stock':
      return 'bg-amber-500/15 text-amber-600 border-amber-500/30';
    case 'out_of_stock':
      return 'bg-red-500/15 text-red-600 border-red-500/30';
    case 'on_order':
      return 'bg-blue-500/15 text-blue-600 border-blue-500/30';
    case 'discontinued':
      return 'bg-muted text-muted-foreground';
    default:
      return 'bg-muted text-muted-foreground';
  }
};

const getStatusLabel = (status: InventoryItem['status']) => {
  switch (status) {
    case 'in_stock': return 'In Stock';
    case 'low_stock': return 'Low Stock';
    case 'out_of_stock': return 'Out of Stock';
    case 'on_order': return 'On Order';
    case 'discontinued': return 'Discontinued';
    default: return status;
  }
};

const SWIPE_THRESHOLD = 80;

export function InventorySwipeableCard({
  item,
  onClick,
  onAddStock,
  onRemoveStock,
}: InventorySwipeableCardProps) {
  const [isSwipedOpen, setIsSwipedOpen] = useState(false);
  const x = useMotionValue(0);
  
  const isLowStock = item.quantity <= item.min_stock_level && item.quantity > 0;
  const isOutOfStock = item.quantity === 0;
  const totalValue = item.quantity * item.unit_cost;

  // Transform for background action indicators
  const leftBgOpacity = useTransform(x, [0, SWIPE_THRESHOLD], [0, 1]);
  const rightBgOpacity = useTransform(x, [-SWIPE_THRESHOLD, 0], [1, 0]);
  const leftScale = useTransform(x, [0, SWIPE_THRESHOLD], [0.8, 1]);
  const rightScale = useTransform(x, [-SWIPE_THRESHOLD, 0], [1, 0.8]);

  const handleDragEnd = (_: any, info: PanInfo) => {
    const offset = info.offset.x;
    const velocity = info.velocity.x;
    
    if (offset > SWIPE_THRESHOLD || velocity > 500) {
      // Swiped right - Add stock
      onAddStock?.();
      x.set(0);
    } else if (offset < -SWIPE_THRESHOLD || velocity < -500) {
      // Swiped left - Remove stock
      if (item.quantity > 0) {
        onRemoveStock?.();
      }
      x.set(0);
    } else {
      x.set(0);
    }
    setIsSwipedOpen(false);
  };

  return (
    <div className="relative overflow-hidden rounded-xl">
      {/* Left action background - Add Stock */}
      <motion.div 
        className="absolute inset-y-0 left-0 w-24 bg-emerald-500 flex items-center justify-center rounded-l-xl"
        style={{ opacity: leftBgOpacity }}
      >
        <motion.div style={{ scale: leftScale }}>
          <Plus className="w-6 h-6 text-white" />
        </motion.div>
      </motion.div>

      {/* Right action background - Remove Stock */}
      <motion.div 
        className="absolute inset-y-0 right-0 w-24 bg-red-500 flex items-center justify-center rounded-r-xl"
        style={{ opacity: rightBgOpacity }}
      >
        <motion.div style={{ scale: rightScale }}>
          <Minus className="w-6 h-6 text-white" />
        </motion.div>
      </motion.div>

      {/* Swipeable card */}
      <motion.div
        drag="x"
        dragConstraints={{ left: -100, right: 100 }}
        dragElastic={0.1}
        onDragEnd={handleDragEnd}
        style={{ x }}
        whileTap={{ cursor: 'grabbing' }}
        className="relative touch-pan-y"
      >
        <Card 
          className={cn(
            "transition-shadow cursor-pointer active:scale-[0.99]",
            "border-border/50 hover:border-border",
            isOutOfStock && "opacity-75"
          )}
          onClick={onClick}
        >
          <CardContent className="p-3">
            <div className="flex gap-3">
              {/* Image */}
              <div className="w-14 h-14 rounded-lg bg-muted flex items-center justify-center flex-shrink-0 overflow-hidden">
                {item.primary_image_url ? (
                  <img
                    src={item.primary_image_url}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Package className="w-5 h-5 text-muted-foreground" />
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm font-medium truncate">{item.name}</h3>
                    <p className="text-xs text-muted-foreground truncate">
                      {item.sku && `SKU: ${item.sku}`}
                    </p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                </div>

                {/* Stats Row */}
                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  <Badge variant="outline" className={cn(getStatusColor(item.status), "text-[10px] h-5")}>
                    {getStatusLabel(item.status)}
                  </Badge>

                  <div className="flex items-center gap-1 text-xs">
                    <span className={cn(
                      "font-semibold",
                      isLowStock && "text-amber-600",
                      isOutOfStock && "text-red-600"
                    )}>
                      {item.quantity}
                    </span>
                    <span className="text-muted-foreground">{item.unit}</span>
                  </div>

                  {item.unit_cost > 0 && (
                    <span className="text-xs text-muted-foreground">
                      ${totalValue.toFixed(0)}
                    </span>
                  )}
                </div>

                {/* Location & Alerts */}
                <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                  {item.location && (
                    <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                      <MapPin className="w-3 h-3" />
                      <span className="truncate max-w-[100px]">{item.location}</span>
                    </div>
                  )}

                  {isLowStock && (
                    <div className="flex items-center gap-1 text-[11px] text-amber-600">
                      <AlertTriangle className="w-3 h-3" />
                      <span>Low</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Swipe hint on first load - could be removed after user has swiped */}
      <div className="absolute inset-y-0 right-1 flex items-center pointer-events-none opacity-0">
        <div className="w-1 h-8 rounded-full bg-muted-foreground/20" />
      </div>
    </div>
  );
}

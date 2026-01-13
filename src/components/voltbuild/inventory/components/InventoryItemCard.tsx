import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  MoreVertical, 
  Package, 
  MapPin, 
  AlertTriangle, 
  Plus, 
  Minus,
  Edit,
  Trash2,
  Eye,
  ChevronRight
} from 'lucide-react';
import { InventoryItem } from '../types/inventory.types';
import { cn } from '@/lib/utils';

interface InventoryItemCardProps {
  item: InventoryItem;
  onClick?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onAdjust?: (type: 'in' | 'out') => void;
  isMobile?: boolean;
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
    case 'in_stock':
      return 'In Stock';
    case 'low_stock':
      return 'Low Stock';
    case 'out_of_stock':
      return 'Out of Stock';
    case 'on_order':
      return 'On Order';
    case 'discontinued':
      return 'Discontinued';
    default:
      return status;
  }
};

export function InventoryItemCard({
  item,
  onClick,
  onEdit,
  onDelete,
  onAdjust,
  isMobile = false,
}: InventoryItemCardProps) {
  const isLowStock = item.quantity <= item.min_stock_level && item.quantity > 0;
  const isOutOfStock = item.quantity === 0;
  const totalValue = item.quantity * item.unit_cost;

  return (
    <Card 
      className={cn(
        "group transition-all cursor-pointer active:scale-[0.99]",
        !isMobile && "hover:shadow-md",
        isOutOfStock && "opacity-75"
      )}
      onClick={onClick}
    >
      <CardContent className={cn("p-4", isMobile && "p-3")}>
        <div className="flex gap-3 sm:gap-4">
          {/* Image */}
          <div className={cn(
            "rounded-lg bg-muted flex items-center justify-center flex-shrink-0 overflow-hidden",
            isMobile ? "w-14 h-14" : "w-16 h-16"
          )}>
            {item.primary_image_url ? (
              <img
                src={item.primary_image_url}
                alt={item.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <Package className={cn("text-muted-foreground", isMobile ? "w-5 h-5" : "w-6 h-6")} />
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <h3 className={cn("font-medium truncate", isMobile && "text-sm")}>{item.name}</h3>
                <p className="text-xs sm:text-sm text-muted-foreground truncate">
                  {item.sku && `SKU: ${item.sku}`}
                  {item.sku && item.barcode && ' • '}
                  {item.barcode && `Barcode: ${item.barcode}`}
                </p>
              </div>

              {/* Action Menu - Always visible on mobile, hover on desktop */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className={cn(
                      "h-8 w-8 flex-shrink-0",
                      isMobile ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                    )}
                  >
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onClick?.(); }}>
                    <Eye className="w-4 h-4 mr-2" />
                    View Details
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEdit?.(); }}>
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onAdjust?.('in'); }}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Stock
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onAdjust?.('out'); }}>
                    <Minus className="w-4 h-4 mr-2" />
                    Remove Stock
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    className="text-destructive"
                    onClick={(e) => { e.stopPropagation(); onDelete?.(); }}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Mobile: Show chevron indicator */}
              {isMobile && (
                <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0 ml-1" />
              )}
            </div>

            {/* Stats */}
            <div className="flex items-center gap-2 sm:gap-3 mt-2 sm:mt-3 flex-wrap">
              <Badge variant="outline" className={cn(getStatusColor(item.status), "text-xs")}>
                {getStatusLabel(item.status)}
              </Badge>

              <div className="flex items-center gap-1 sm:gap-1.5 text-xs sm:text-sm">
                <span className={cn(
                  "font-medium",
                  isLowStock && "text-amber-600",
                  isOutOfStock && "text-red-600"
                )}>
                  {item.quantity}
                </span>
                <span className="text-muted-foreground">{item.unit}</span>
              </div>

              {item.unit_cost > 0 && !isMobile && (
                <span className="text-sm text-muted-foreground">
                  ${totalValue.toFixed(2)}
                </span>
              )}
            </div>

            {/* Location & Alerts */}
            <div className="flex items-center gap-2 sm:gap-3 mt-1.5 sm:mt-2 flex-wrap">
              {item.location && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <MapPin className="w-3 h-3" />
                  <span className="truncate max-w-[100px] sm:max-w-none">
                    {item.location}
                    {item.bin_number && !isMobile && ` • ${item.bin_number}`}
                  </span>
                </div>
              )}

              {isLowStock && (
                <div className="flex items-center gap-1 text-xs text-amber-600">
                  <AlertTriangle className="w-3 h-3" />
                  <span className={isMobile ? "sr-only" : ""}>Low stock</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

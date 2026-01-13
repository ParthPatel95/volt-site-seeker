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
  Eye
} from 'lucide-react';
import { InventoryItem } from '../types/inventory.types';
import { cn } from '@/lib/utils';

interface InventoryItemCardProps {
  item: InventoryItem;
  onClick?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onAdjust?: (type: 'in' | 'out') => void;
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
}: InventoryItemCardProps) {
  const isLowStock = item.quantity <= item.min_stock_level && item.quantity > 0;
  const isOutOfStock = item.quantity === 0;
  const totalValue = item.quantity * item.unit_cost;

  return (
    <Card 
      className={cn(
        "group hover:shadow-md transition-shadow cursor-pointer",
        isOutOfStock && "opacity-75"
      )}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex gap-4">
          {/* Image */}
          <div className="w-16 h-16 rounded-lg bg-muted flex items-center justify-center flex-shrink-0 overflow-hidden">
            {item.primary_image_url ? (
              <img
                src={item.primary_image_url}
                alt={item.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <Package className="w-6 h-6 text-muted-foreground" />
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <h3 className="font-medium truncate">{item.name}</h3>
                <p className="text-sm text-muted-foreground truncate">
                  {item.sku && `SKU: ${item.sku}`}
                  {item.sku && item.barcode && ' • '}
                  {item.barcode && `Barcode: ${item.barcode}`}
                </p>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                  <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100">
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
            </div>

            {/* Stats */}
            <div className="flex items-center gap-3 mt-3">
              <Badge variant="outline" className={cn(getStatusColor(item.status))}>
                {getStatusLabel(item.status)}
              </Badge>

              <div className="flex items-center gap-1.5 text-sm">
                <span className={cn(
                  "font-medium",
                  isLowStock && "text-amber-600",
                  isOutOfStock && "text-red-600"
                )}>
                  {item.quantity}
                </span>
                <span className="text-muted-foreground">{item.unit}</span>
              </div>

              {item.unit_cost > 0 && (
                <span className="text-sm text-muted-foreground">
                  ${totalValue.toFixed(2)}
                </span>
              )}
            </div>

            {/* Location & Alerts */}
            <div className="flex items-center gap-3 mt-2">
              {item.location && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <MapPin className="w-3 h-3" />
                  {item.location}
                  {item.bin_number && ` • ${item.bin_number}`}
                </div>
              )}

              {isLowStock && (
                <div className="flex items-center gap-1 text-xs text-amber-600">
                  <AlertTriangle className="w-3 h-3" />
                  Low stock
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

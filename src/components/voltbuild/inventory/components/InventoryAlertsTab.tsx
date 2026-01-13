import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  AlertTriangle,
  PackageX,
  Clock,
  Package,
  Plus,
  ArrowRight,
  Calendar,
} from 'lucide-react';
import { InventoryItem } from '../types/inventory.types';
import { cn } from '@/lib/utils';
import { format, differenceInDays } from 'date-fns';

interface InventoryAlertsTabProps {
  lowStockItems: InventoryItem[];
  outOfStockItems: InventoryItem[];
  expiringItems: InventoryItem[];
  onItemClick: (item: InventoryItem) => void;
  onAddStock: (item: InventoryItem) => void;
}

interface AlertItemCardProps {
  item: InventoryItem;
  alertType: 'low' | 'out' | 'expiring';
  onClick: () => void;
  onAction?: () => void;
  actionLabel?: string;
}

function AlertItemCard({ item, alertType, onClick, onAction, actionLabel }: AlertItemCardProps) {
  const daysUntilExpiry = item.expiry_date
    ? differenceInDays(new Date(item.expiry_date), new Date())
    : null;

  return (
    <div
      className="flex items-center gap-3 p-3 rounded-lg bg-card border hover:bg-muted/50 transition-colors cursor-pointer"
      onClick={onClick}
    >
      <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center flex-shrink-0 overflow-hidden">
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

      <div className="flex-1 min-w-0">
        <p className="font-medium truncate">{item.name}</p>
        <div className="flex items-center gap-2 mt-1">
          {alertType === 'low' && (
            <span className="text-sm text-amber-600">
              {item.quantity} / {item.min_stock_level} {item.unit}
            </span>
          )}
          {alertType === 'out' && (
            <span className="text-sm text-red-600">Out of stock</span>
          )}
          {alertType === 'expiring' && daysUntilExpiry !== null && (
            <span className={cn(
              "text-sm",
              daysUntilExpiry < 0 ? "text-red-600" : "text-orange-600"
            )}>
              {daysUntilExpiry < 0
                ? `Expired ${Math.abs(daysUntilExpiry)} days ago`
                : daysUntilExpiry === 0
                ? 'Expires today'
                : `Expires in ${daysUntilExpiry} days`}
            </span>
          )}
        </div>
      </div>

      {onAction && actionLabel && (
        <Button
          variant="outline"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            onAction();
          }}
        >
          {actionLabel}
        </Button>
      )}
      
      <ArrowRight className="w-4 h-4 text-muted-foreground" />
    </div>
  );
}

export function InventoryAlertsTab({
  lowStockItems,
  outOfStockItems,
  expiringItems,
  onItemClick,
  onAddStock,
}: InventoryAlertsTabProps) {
  const totalAlerts = lowStockItems.length + outOfStockItems.length + expiringItems.length;

  if (totalAlerts === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <div className="w-16 h-16 mx-auto rounded-full bg-emerald-500/10 flex items-center justify-center mb-4">
            <Package className="w-8 h-8 text-emerald-500" />
          </div>
          <h3 className="text-lg font-semibold mb-2">All Clear!</h3>
          <p className="text-muted-foreground">
            No inventory alerts at this time. All items are well-stocked.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        <Card className={cn(outOfStockItems.length > 0 && "border-red-500/50")}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-red-500/10">
                <PackageX className="w-5 h-5 text-red-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{outOfStockItems.length}</p>
                <p className="text-xs text-muted-foreground">Out of Stock</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={cn(lowStockItems.length > 0 && "border-amber-500/50")}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-500/10">
                <AlertTriangle className="w-5 h-5 text-amber-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{lowStockItems.length}</p>
                <p className="text-xs text-muted-foreground">Low Stock</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={cn(expiringItems.length > 0 && "border-orange-500/50")}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-orange-500/10">
                <Clock className="w-5 h-5 text-orange-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{expiringItems.length}</p>
                <p className="text-xs text-muted-foreground">Expiring Soon</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Out of Stock */}
      {outOfStockItems.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <PackageX className="w-5 h-5 text-red-500" />
              Out of Stock
              <Badge variant="destructive" className="ml-auto">
                {outOfStockItems.length}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2">
              {outOfStockItems.map((item) => (
                <AlertItemCard
                  key={item.id}
                  item={item}
                  alertType="out"
                  onClick={() => onItemClick(item)}
                  onAction={() => onAddStock(item)}
                  actionLabel="Restock"
                />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Low Stock */}
      {lowStockItems.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              Low Stock
              <Badge variant="secondary" className="ml-auto bg-amber-500/15 text-amber-600">
                {lowStockItems.length}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2">
              {lowStockItems.map((item) => (
                <AlertItemCard
                  key={item.id}
                  item={item}
                  alertType="low"
                  onClick={() => onItemClick(item)}
                  onAction={() => onAddStock(item)}
                  actionLabel="Add Stock"
                />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Expiring Soon */}
      {expiringItems.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Clock className="w-5 h-5 text-orange-500" />
              Expiring Soon
              <Badge variant="secondary" className="ml-auto bg-orange-500/15 text-orange-600">
                {expiringItems.length}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2">
              {expiringItems.map((item) => (
                <AlertItemCard
                  key={item.id}
                  item={item}
                  alertType="expiring"
                  onClick={() => onItemClick(item)}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

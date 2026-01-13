import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Package,
  DollarSign,
  AlertTriangle,
  PackageX,
  Clock,
  TrendingUp,
  Plus,
  ScanBarcode,
  Camera,
} from 'lucide-react';
import { InventoryStats, InventoryItem } from '../types/inventory.types';
import { cn } from '@/lib/utils';
import { format, differenceInDays } from 'date-fns';

interface InventoryDashboardProps {
  stats: InventoryStats;
  lowStockItems: InventoryItem[];
  expiringItems: InventoryItem[];
  outOfStockItems: InventoryItem[];
  onAddItem: () => void;
  onScan: () => void;
  onItemClick: (item: InventoryItem) => void;
}

export function InventoryDashboard({
  stats,
  lowStockItems,
  expiringItems,
  outOfStockItems,
  onAddItem,
  onScan,
  onItemClick,
}: InventoryDashboardProps) {
  return (
    <div className="space-y-6">
      {/* Quick Actions */}
      <div className="flex flex-wrap gap-3">
        <Button onClick={onAddItem}>
          <Plus className="w-4 h-4 mr-2" />
          Add Item
        </Button>
        <Button variant="outline" onClick={onScan}>
          <ScanBarcode className="w-4 h-4 mr-2" />
          Scan Barcode
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Package className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.totalItems}</p>
                <p className="text-xs text-muted-foreground">Total Items</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-500/10">
                <TrendingUp className="w-5 h-5 text-emerald-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.inStockCount}</p>
                <p className="text-xs text-muted-foreground">In Stock</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-500/10">
                <AlertTriangle className="w-5 h-5 text-amber-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.lowStockCount}</p>
                <p className="text-xs text-muted-foreground">Low Stock</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-red-500/10">
                <PackageX className="w-5 h-5 text-red-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.outOfStockCount}</p>
                <p className="text-xs text-muted-foreground">Out of Stock</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <DollarSign className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  ${stats.totalValue.toLocaleString(undefined, { 
                    minimumFractionDigits: 0, 
                    maximumFractionDigits: 0 
                  })}
                </p>
                <p className="text-xs text-muted-foreground">Total Value</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alerts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Low Stock Alert */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              Low Stock Items
              {lowStockItems.length > 0 && (
                <Badge variant="secondary" className="ml-auto">
                  {lowStockItems.length}
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            {lowStockItems.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No low stock items
              </p>
            ) : (
              <ScrollArea className="h-[200px]">
                <div className="space-y-2">
                  {lowStockItems.slice(0, 5).map(item => (
                    <button
                      key={item.id}
                      onClick={() => onItemClick(item)}
                      className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-muted text-left transition-colors"
                    >
                      <div className="w-10 h-10 rounded bg-muted flex items-center justify-center flex-shrink-0">
                        {item.primary_image_url ? (
                          <img
                            src={item.primary_image_url}
                            alt={item.name}
                            className="w-full h-full object-cover rounded"
                          />
                        ) : (
                          <Package className="w-4 h-4 text-muted-foreground" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{item.name}</p>
                        <p className="text-xs text-amber-600">
                          {item.quantity} / {item.min_stock_level} {item.unit}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>

        {/* Out of Stock */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <PackageX className="w-4 h-4 text-red-500" />
              Out of Stock
              {outOfStockItems.length > 0 && (
                <Badge variant="secondary" className="ml-auto">
                  {outOfStockItems.length}
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            {outOfStockItems.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                All items in stock
              </p>
            ) : (
              <ScrollArea className="h-[200px]">
                <div className="space-y-2">
                  {outOfStockItems.slice(0, 5).map(item => (
                    <button
                      key={item.id}
                      onClick={() => onItemClick(item)}
                      className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-muted text-left transition-colors"
                    >
                      <div className="w-10 h-10 rounded bg-muted flex items-center justify-center flex-shrink-0">
                        {item.primary_image_url ? (
                          <img
                            src={item.primary_image_url}
                            alt={item.name}
                            className="w-full h-full object-cover rounded"
                          />
                        ) : (
                          <Package className="w-4 h-4 text-muted-foreground" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{item.name}</p>
                        <p className="text-xs text-red-600">Out of stock</p>
                      </div>
                    </button>
                  ))}
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>

        {/* Expiring Soon */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Clock className="w-4 h-4 text-orange-500" />
              Expiring Soon
              {expiringItems.length > 0 && (
                <Badge variant="secondary" className="ml-auto">
                  {expiringItems.length}
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            {expiringItems.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No items expiring soon
              </p>
            ) : (
              <ScrollArea className="h-[200px]">
                <div className="space-y-2">
                  {expiringItems.slice(0, 5).map(item => {
                    const daysUntilExpiry = item.expiry_date 
                      ? differenceInDays(new Date(item.expiry_date), new Date())
                      : null;

                    return (
                      <button
                        key={item.id}
                        onClick={() => onItemClick(item)}
                        className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-muted text-left transition-colors"
                      >
                        <div className="w-10 h-10 rounded bg-muted flex items-center justify-center flex-shrink-0">
                          {item.primary_image_url ? (
                            <img
                              src={item.primary_image_url}
                              alt={item.name}
                              className="w-full h-full object-cover rounded"
                            />
                          ) : (
                            <Package className="w-4 h-4 text-muted-foreground" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{item.name}</p>
                          <p className="text-xs text-orange-600">
                            {daysUntilExpiry !== null && daysUntilExpiry >= 0
                              ? `Expires in ${daysUntilExpiry} days`
                              : 'Expired'}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

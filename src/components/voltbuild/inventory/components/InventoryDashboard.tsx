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
  Boxes,
} from 'lucide-react';
import { InventoryStats, InventoryItem } from '../types/inventory.types';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import { differenceInDays } from 'date-fns';

interface InventoryDashboardProps {
  stats: InventoryStats;
  lowStockItems: InventoryItem[];
  expiringItems: InventoryItem[];
  outOfStockItems: InventoryItem[];
  onAddItem: () => void;
  onScan: () => void;
  onItemClick: (item: InventoryItem) => void;
}

interface StatCardProps {
  icon: React.ElementType;
  iconColor: string;
  iconBgColor: string;
  value: string | number;
  label: string;
  trend?: { value: number; positive: boolean };
}

function StatCard({ icon: Icon, iconColor, iconBgColor, value, label, trend }: StatCardProps) {
  return (
    <Card className="group hover:shadow-md transition-all duration-200 border-border/50 hover:border-border">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className={cn(
            "w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0",
            "bg-gradient-to-br",
            iconBgColor
          )}>
            <Icon className={cn("w-5 h-5", iconColor)} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-2xl font-bold tabular-nums tracking-tight text-foreground">
              {value}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5 truncate">{label}</p>
            {trend && (
              <div className={cn(
                "text-xs mt-1 flex items-center gap-1",
                trend.positive ? "text-emerald-600" : "text-red-600"
              )}>
                <TrendingUp className={cn("w-3 h-3", !trend.positive && "rotate-180")} />
                {trend.value}%
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface AlertCardProps {
  icon: React.ElementType;
  iconColor: string;
  title: string;
  items: InventoryItem[];
  emptyMessage: string;
  onItemClick: (item: InventoryItem) => void;
  renderItemStatus: (item: InventoryItem) => React.ReactNode;
  isMobile: boolean;
}

function AlertCard({ 
  icon: Icon, 
  iconColor, 
  title, 
  items, 
  emptyMessage, 
  onItemClick, 
  renderItemStatus,
  isMobile 
}: AlertCardProps) {
  return (
    <Card className="border-border/50 hover:border-border transition-colors">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Icon className={cn("w-4 h-4", iconColor)} />
          <span>{title}</span>
          {items.length > 0 && (
            <Badge 
              variant="secondary" 
              className="ml-auto h-5 min-w-[1.25rem] px-1.5 text-xs font-medium"
            >
              {items.length}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <div className="w-10 h-10 rounded-full bg-muted/50 flex items-center justify-center mb-2">
              <Boxes className="w-5 h-5 text-muted-foreground/50" />
            </div>
            <p className="text-sm text-muted-foreground">{emptyMessage}</p>
          </div>
        ) : (
          <ScrollArea className={isMobile ? "h-[180px]" : "h-[220px]"}>
            <div className="space-y-1">
              {items.slice(0, 5).map(item => (
                <button
                  key={item.id}
                  onClick={() => onItemClick(item)}
                  className="w-full flex items-center gap-3 p-2.5 rounded-lg hover:bg-accent/50 text-left transition-colors group"
                >
                  <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {item.primary_image_url ? (
                      <img
                        src={item.primary_image_url}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Package className="w-4 h-4 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate group-hover:text-primary transition-colors">
                      {item.name}
                    </p>
                    {renderItemStatus(item)}
                  </div>
                </button>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
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
  const isMobile = useIsMobile();

  return (
    <div className="space-y-6">
      {/* Quick Actions - Desktop only */}
      {!isMobile && (
        <div className="flex flex-wrap gap-3">
          <Button onClick={onAddItem} size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Add Item
          </Button>
          <Button variant="outline" size="sm" onClick={onScan}>
            <ScanBarcode className="w-4 h-4 mr-2" />
            Scan Barcode
          </Button>
        </div>
      )}

      {/* Stats Cards - Responsive Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          icon={Package}
          iconColor="text-primary"
          iconBgColor="from-primary/20 to-primary/5"
          value={stats.totalItems}
          label="Total Items"
        />
        <StatCard
          icon={TrendingUp}
          iconColor="text-emerald-600"
          iconBgColor="from-emerald-500/20 to-emerald-500/5"
          value={stats.inStockCount}
          label="In Stock"
        />
        <StatCard
          icon={AlertTriangle}
          iconColor="text-amber-600"
          iconBgColor="from-amber-500/20 to-amber-500/5"
          value={stats.lowStockCount}
          label="Low Stock"
        />
        <StatCard
          icon={PackageX}
          iconColor="text-red-600"
          iconBgColor="from-red-500/20 to-red-500/5"
          value={stats.outOfStockCount}
          label="Out of Stock"
        />
        <StatCard
          icon={DollarSign}
          iconColor="text-blue-600"
          iconBgColor="from-blue-500/20 to-blue-500/5"
          value={`$${stats.totalValue.toLocaleString(undefined, { 
            minimumFractionDigits: 0, 
            maximumFractionDigits: 0 
          })}`}
          label="Total Value"
        />
      </div>

      {/* Alerts Section */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 px-1">
          <AlertTriangle className="w-4 h-4 text-amber-500" />
          <h2 className="text-sm font-semibold text-foreground">Stock Alerts</h2>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <AlertCard
            icon={AlertTriangle}
            iconColor="text-amber-500"
            title="Low Stock"
            items={lowStockItems}
            emptyMessage="No low stock items"
            onItemClick={onItemClick}
            isMobile={isMobile}
            renderItemStatus={(item) => (
              <p className="text-xs text-amber-600">
                {item.quantity} / {item.min_stock_level} {item.unit}
              </p>
            )}
          />

          <AlertCard
            icon={PackageX}
            iconColor="text-red-500"
            title="Out of Stock"
            items={outOfStockItems}
            emptyMessage="All items in stock"
            onItemClick={onItemClick}
            isMobile={isMobile}
            renderItemStatus={() => (
              <p className="text-xs text-red-600">Out of stock</p>
            )}
          />

          <AlertCard
            icon={Clock}
            iconColor="text-orange-500"
            title="Expiring Soon"
            items={expiringItems}
            emptyMessage="No items expiring soon"
            onItemClick={onItemClick}
            isMobile={isMobile}
            renderItemStatus={(item) => {
              const daysUntilExpiry = item.expiry_date 
                ? differenceInDays(new Date(item.expiry_date), new Date())
                : null;
              return (
                <p className="text-xs text-orange-600">
                  {daysUntilExpiry !== null && daysUntilExpiry >= 0
                    ? `Expires in ${daysUntilExpiry} days`
                    : 'Expired'}
                </p>
              );
            }}
          />
        </div>
      </div>
    </div>
  );
}

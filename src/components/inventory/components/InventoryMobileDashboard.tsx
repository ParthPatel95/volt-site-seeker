import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Plus, 
  ScanBarcode, 
  AlertTriangle, 
  PackageX, 
  Clock,
  ChevronRight,
  Package,
  Sparkles
} from 'lucide-react';
import { InventoryStats, InventoryItem } from '../types/inventory.types';
import { InventoryQuickStats } from './InventoryQuickStats';
import { cn } from '@/lib/utils';
import { differenceInDays } from 'date-fns';

interface InventoryMobileDashboardProps {
  stats: InventoryStats;
  lowStockItems: InventoryItem[];
  expiringItems: InventoryItem[];
  outOfStockItems: InventoryItem[];
  onAddItem: () => void;
  onScan: () => void;
  onSmartScan?: () => void;
  onItemClick: (item: InventoryItem) => void;
  onViewAlerts: () => void;
}

interface AlertPreviewProps {
  icon: React.ElementType;
  iconColor: string;
  bgColor: string;
  title: string;
  count: number;
  items: InventoryItem[];
  onItemClick: (item: InventoryItem) => void;
}

function AlertPreview({ icon: Icon, iconColor, bgColor, title, count, items, onItemClick }: AlertPreviewProps) {
  if (count === 0) return null;

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <div className={cn("w-6 h-6 rounded-md flex items-center justify-center", bgColor)}>
          <Icon className={cn("w-3.5 h-3.5", iconColor)} />
        </div>
        <span className="text-sm font-medium">{title}</span>
        <Badge variant="secondary" className="h-5 text-[10px] ml-auto">
          {count}
        </Badge>
      </div>
      <div className="space-y-1">
        {items.slice(0, 2).map(item => (
          <button
            key={item.id}
            onClick={() => onItemClick(item)}
            className="w-full flex items-center gap-2.5 p-2 rounded-lg hover:bg-accent/50 text-left transition-colors"
          >
            <div className="w-8 h-8 rounded-md bg-muted flex items-center justify-center flex-shrink-0 overflow-hidden">
              {item.primary_image_url ? (
                <img src={item.primary_image_url} alt="" className="w-full h-full object-cover" />
              ) : (
                <Package className="w-3.5 h-3.5 text-muted-foreground" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{item.name}</p>
              <p className={cn("text-[11px]", iconColor)}>
                {item.quantity} {item.unit}
              </p>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </button>
        ))}
      </div>
    </div>
  );
}

export function InventoryMobileDashboard({
  stats,
  lowStockItems,
  expiringItems,
  outOfStockItems,
  onAddItem,
  onScan,
  onSmartScan,
  onItemClick,
  onViewAlerts,
}: InventoryMobileDashboardProps) {
  const totalAlerts = lowStockItems.length + outOfStockItems.length + expiringItems.length;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-5"
    >
      {/* Quick Stats - Horizontal Scroll */}
      <motion.div variants={itemVariants}>
        <InventoryQuickStats stats={stats} />
      </motion.div>

      {/* Quick Actions */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 gap-3">
        <Button 
          variant="outline" 
          className="h-14 flex-col gap-1 border-dashed"
          onClick={onAddItem}
        >
          <Plus className="w-5 h-5" />
          <span className="text-xs">Add Item</span>
        </Button>
        <Button 
          variant="outline" 
          className="h-14 flex-col gap-1 border-dashed"
          onClick={onScan}
        >
          <ScanBarcode className="w-5 h-5" />
          <span className="text-xs">Scan Barcode</span>
        </Button>
      </motion.div>

      {/* Smart Scan CTA */}
      {onSmartScan && (
        <motion.div variants={itemVariants}>
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="p-4">
              <button 
                onClick={onSmartScan}
                className="w-full flex items-center gap-3 text-left"
              >
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-foreground">Smart Scan with AI</p>
                  <p className="text-xs text-muted-foreground">Take a photo and let AI identify your items</p>
                </div>
                <ChevronRight className="w-5 h-5 text-primary" />
              </button>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Alerts Preview */}
      {totalAlerts > 0 && (
        <motion.div variants={itemVariants}>
          <Card className="border-border/50">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                  Stock Alerts
                </CardTitle>
                <Button variant="ghost" size="sm" onClick={onViewAlerts} className="h-7 text-xs">
                  View All
                  <ChevronRight className="w-3.5 h-3.5 ml-1" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-0 space-y-4">
              <AlertPreview
                icon={AlertTriangle}
                iconColor="text-amber-600"
                bgColor="bg-amber-500/10"
                title="Low Stock"
                count={lowStockItems.length}
                items={lowStockItems}
                onItemClick={onItemClick}
              />
              <AlertPreview
                icon={PackageX}
                iconColor="text-red-600"
                bgColor="bg-red-500/10"
                title="Out of Stock"
                count={outOfStockItems.length}
                items={outOfStockItems}
                onItemClick={onItemClick}
              />
              <AlertPreview
                icon={Clock}
                iconColor="text-orange-600"
                bgColor="bg-orange-500/10"
                title="Expiring Soon"
                count={expiringItems.length}
                items={expiringItems}
                onItemClick={onItemClick}
              />
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* All Clear State */}
      {totalAlerts === 0 && (
        <motion.div variants={itemVariants}>
          <Card className="border-emerald-500/20 bg-emerald-500/5">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-3">
                <Package className="w-6 h-6 text-emerald-600" />
              </div>
              <p className="font-medium text-emerald-600">All items at healthy levels</p>
              <p className="text-sm text-muted-foreground mt-1">No stock alerts at this time</p>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </motion.div>
  );
}

import React, { useState } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { useIsMobile } from '@/hooks/use-mobile';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Package,
  MapPin,
  Calendar,
  DollarSign,
  User,
  Edit,
  Trash2,
  Plus,
  Minus,
  History,
  AlertTriangle,
  Barcode,
  Tag,
} from 'lucide-react';
import { InventoryItem } from '../types/inventory.types';
import { useInventoryTransactions } from '../hooks/useInventoryTransactions';
import { InventoryAdjustDialog } from './InventoryAdjustDialog';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface InventoryItemDetailProps {
  item: InventoryItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit: () => void;
  onDelete: () => void;
  onAdjust: (type: 'in' | 'out', quantity: number, reason?: string) => void;
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
    default:
      return 'bg-muted text-muted-foreground';
  }
};

const getConditionLabel = (condition: InventoryItem['condition']) => {
  switch (condition) {
    case 'new': return 'New';
    case 'good': return 'Good';
    case 'fair': return 'Fair';
    case 'poor': return 'Poor';
    default: return condition;
  }
};

const getTransactionIcon = (type: string) => {
  switch (type) {
    case 'in': return <Plus className="w-3 h-3 text-emerald-500" />;
    case 'out': return <Minus className="w-3 h-3 text-red-500" />;
    case 'adjustment': return <Edit className="w-3 h-3 text-blue-500" />;
    case 'transfer': return <MapPin className="w-3 h-3 text-purple-500" />;
    case 'count': return <Package className="w-3 h-3 text-amber-500" />;
    default: return <History className="w-3 h-3" />;
  }
};

export function InventoryItemDetail({
  item,
  open,
  onOpenChange,
  onEdit,
  onDelete,
  onAdjust,
}: InventoryItemDetailProps) {
  const isMobile = useIsMobile();
  const [showAdjustDialog, setShowAdjustDialog] = useState<'in' | 'out' | null>(null);
  const { transactions, isLoading: transactionsLoading } = useInventoryTransactions(item?.id || null);

  if (!item) return null;

  const totalValue = item.quantity * item.unit_cost;
  const isLowStock = item.quantity <= item.min_stock_level && item.quantity > 0;
  const isOutOfStock = item.quantity === 0;

  const handleAdjust = (quantity: number, reason?: string) => {
    if (showAdjustDialog) {
      onAdjust(showAdjustDialog, quantity, reason);
      setShowAdjustDialog(null);
    }
  };

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className={cn("w-full p-0 flex flex-col", isMobile ? "max-w-full" : "sm:max-w-lg")}>
          <SheetHeader className="p-6 pb-0">
            <div className="flex items-start gap-4">
              {/* Image */}
              <div className="w-20 h-20 rounded-lg bg-muted flex items-center justify-center flex-shrink-0 overflow-hidden">
                {item.primary_image_url ? (
                  <img
                    src={item.primary_image_url}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Package className="w-8 h-8 text-muted-foreground" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <SheetTitle className="text-left truncate">{item.name}</SheetTitle>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline" className={cn(getStatusColor(item.status))}>
                    {item.status.replace('_', ' ')}
                  </Badge>
                  <Badge variant="outline">{getConditionLabel(item.condition)}</Badge>
                </div>
              </div>
            </div>
          </SheetHeader>

          <ScrollArea className="flex-1">
            <Tabs defaultValue="details" className="p-6 pt-4">
              <TabsList className="w-full">
                <TabsTrigger value="details" className="flex-1">Details</TabsTrigger>
                <TabsTrigger value="history" className="flex-1">History</TabsTrigger>
              </TabsList>

              <TabsContent value="details" className="mt-4 space-y-6">
                {/* Quick Actions */}
                <div className="flex gap-2">
                  <Button 
                    size={isMobile ? "default" : "sm"}
                    variant="outline"
                    className="flex-1"
                    onClick={() => setShowAdjustDialog('in')}
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Add Stock
                  </Button>
                  <Button 
                    size={isMobile ? "default" : "sm"}
                    variant="outline"
                    className="flex-1"
                    onClick={() => setShowAdjustDialog('out')}
                    disabled={item.quantity === 0}
                  >
                    <Minus className="w-4 h-4 mr-1" />
                    Remove
                  </Button>
                </div>

                {/* Alerts */}
                {(isLowStock || isOutOfStock) && (
                  <div className={cn(
                    "flex items-center gap-2 p-3 rounded-lg",
                    isOutOfStock ? "bg-red-500/10 text-red-600" : "bg-amber-500/10 text-amber-600"
                  )}>
                    <AlertTriangle className="w-4 h-4" />
                    <span className="text-sm font-medium">
                      {isOutOfStock ? 'Out of stock' : `Low stock - ${item.quantity} remaining`}
                    </span>
                  </div>
                )}

                {/* Quantity & Value */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-lg bg-muted/50">
                    <p className="text-sm text-muted-foreground">Quantity</p>
                    <p className="text-2xl font-bold">
                      {item.quantity} <span className="text-sm font-normal text-muted-foreground">{item.unit}</span>
                    </p>
                    {item.min_stock_level > 0 && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Min: {item.min_stock_level} {item.unit}
                      </p>
                    )}
                  </div>
                  <div className="p-4 rounded-lg bg-muted/50">
                    <p className="text-sm text-muted-foreground">Total Value</p>
                    <p className="text-2xl font-bold">${totalValue.toFixed(2)}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      ${item.unit_cost.toFixed(2)} per {item.unit}
                    </p>
                  </div>
                </div>

                <Separator />

                {/* Identification */}
                <div className="space-y-3">
                  <h4 className="text-sm font-medium">Identification</h4>
                  <div className="grid grid-cols-2 gap-y-3 text-sm">
                    {item.sku && (
                      <>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Tag className="w-4 h-4" />
                          SKU
                        </div>
                        <div>{item.sku}</div>
                      </>
                    )}
                    {item.barcode && (
                      <>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Barcode className="w-4 h-4" />
                          Barcode
                        </div>
                        <div className="font-mono">{item.barcode}</div>
                      </>
                    )}
                    {item.category && (
                      <>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Package className="w-4 h-4" />
                          Category
                        </div>
                        <div>{item.category.name}</div>
                      </>
                    )}
                  </div>
                </div>

                {/* Location */}
                {(item.location || item.storage_zone || item.bin_number) && (
                  <>
                    <Separator />
                    <div className="space-y-3">
                      <h4 className="text-sm font-medium">Location</h4>
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="w-4 h-4 text-muted-foreground" />
                        <span>
                          {[item.location, item.storage_zone, item.bin_number].filter(Boolean).join(' • ')}
                        </span>
                      </div>
                    </div>
                  </>
                )}

                {/* Supplier */}
                {item.supplier_name && (
                  <>
                    <Separator />
                    <div className="space-y-3">
                      <h4 className="text-sm font-medium">Supplier</h4>
                      <div className="grid grid-cols-2 gap-y-2 text-sm">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <User className="w-4 h-4" />
                          Name
                        </div>
                        <div>{item.supplier_name}</div>
                        {item.supplier_contact && (
                          <>
                            <div className="text-muted-foreground">Contact</div>
                            <div>{item.supplier_contact}</div>
                          </>
                        )}
                      </div>
                    </div>
                  </>
                )}

                {/* Dates */}
                <Separator />
                <div className="space-y-3">
                  <h4 className="text-sm font-medium">Dates</h4>
                  <div className="grid grid-cols-2 gap-y-2 text-sm">
                    {item.received_date && (
                      <>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Calendar className="w-4 h-4" />
                          Received
                        </div>
                        <div>{format(new Date(item.received_date), 'MMM d, yyyy')}</div>
                      </>
                    )}
                    {item.expiry_date && (
                      <>
                        <div className="text-muted-foreground">Expires</div>
                        <div className={cn(
                          new Date(item.expiry_date) < new Date() && "text-red-600"
                        )}>
                          {format(new Date(item.expiry_date), 'MMM d, yyyy')}
                        </div>
                      </>
                    )}
                    <div className="text-muted-foreground">Added</div>
                    <div>{format(new Date(item.created_at), 'MMM d, yyyy')}</div>
                  </div>
                </div>

                {/* Notes */}
                {item.notes && (
                  <>
                    <Separator />
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium">Notes</h4>
                      <p className="text-sm text-muted-foreground">{item.notes}</p>
                    </div>
                  </>
                )}

                {/* Description */}
                {item.description && (
                  <>
                    <Separator />
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium">Description</h4>
                      <p className="text-sm text-muted-foreground">{item.description}</p>
                    </div>
                  </>
                )}
              </TabsContent>

              <TabsContent value="history" className="mt-4">
                {transactionsLoading ? (
                  <div className="text-center py-8 text-muted-foreground">
                    Loading history...
                  </div>
                ) : transactions.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No transaction history
                  </div>
                ) : (
                  <div className="space-y-3">
                    {transactions.map((tx) => (
                      <div key={tx.id} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                        <div className="mt-0.5">
                          {getTransactionIcon(tx.transaction_type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium capitalize">
                              {tx.transaction_type === 'in' ? 'Stock In' :
                               tx.transaction_type === 'out' ? 'Stock Out' :
                               tx.transaction_type}
                            </span>
                            <span className={cn(
                              "text-sm font-medium",
                              tx.quantity_change > 0 ? "text-emerald-600" : "text-red-600"
                            )}>
                              {tx.quantity_change > 0 ? '+' : ''}{tx.quantity_change}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {tx.quantity_before} → {tx.quantity_after} {item.unit}
                          </p>
                          {tx.reason && (
                            <p className="text-xs text-muted-foreground mt-1">{tx.reason}</p>
                          )}
                          <p className="text-xs text-muted-foreground mt-1">
                            {format(new Date(tx.performed_at), 'MMM d, yyyy h:mm a')}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </ScrollArea>

          {/* Footer Actions */}
          <div className="p-4 border-t flex gap-2">
            <Button variant="outline" className="flex-1" onClick={onEdit}>
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </Button>
            <Button variant="destructive" size="icon" onClick={onDelete}>
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      <InventoryAdjustDialog
        open={showAdjustDialog !== null}
        onOpenChange={(open) => !open && setShowAdjustDialog(null)}
        type={showAdjustDialog || 'in'}
        itemName={item.name}
        currentQuantity={item.quantity}
        unit={item.unit}
        onSubmit={handleAdjust}
      />
    </>
  );
}

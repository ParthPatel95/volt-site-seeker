import React, { forwardRef } from 'react';
import QRCode from 'react-qr-code';
import { InventoryGroupWithItems } from '../types/group.types';
import { generateGroupQRData } from '@/utils/codeGenerator';
import { cn } from '@/lib/utils';
import { Package, MapPin, DollarSign } from 'lucide-react';

interface InventoryGroupLabelProps {
  group: InventoryGroupWithItems;
  className?: string;
}

export const InventoryGroupLabel = forwardRef<HTMLDivElement, InventoryGroupLabelProps>(
  ({ group, className }, ref) => {
    const qrData = generateGroupQRData({
      id: group.id,
      name: group.name,
      group_code: group.group_code,
      itemCount: group.total_items,
      totalValue: group.total_value,
    });

    // Get top items to display (max 5)
    const displayItems = group.items.slice(0, 5);
    const remainingCount = group.items.length - displayItems.length;

    return (
      <div
        ref={ref}
        className={cn(
          'w-[6in] h-[4in] bg-white border-2 border-black p-4 print:border-black',
          className
        )}
      >
        {/* Header */}
        <div className="flex items-start gap-4 border-b border-border pb-3">
          <div className="flex-shrink-0">
            <QRCode value={qrData} size={100} level="M" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-bold truncate">{group.name}</h2>
            <p className="text-sm font-mono text-muted-foreground">{group.group_code}</p>
            <div className="flex items-center gap-1 mt-1 text-sm text-muted-foreground capitalize">
              <Package className="w-4 h-4" />
              <span>{group.container_type}</span>
            </div>
          </div>
        </div>

        {/* Contents */}
        <div className="mt-3">
          <h3 className="text-sm font-semibold mb-2">Contents:</h3>
          <div className="space-y-1">
            {displayItems.map((groupItem) => (
              <div key={groupItem.id} className="flex items-center justify-between text-sm">
                <span className="truncate flex-1">
                  {groupItem.quantity}× {groupItem.item?.name || 'Unknown Item'}
                </span>
                {groupItem.item?.sku && (
                  <span className="text-xs text-muted-foreground ml-2">
                    {groupItem.item.sku}
                  </span>
                )}
              </div>
            ))}
            {remainingCount > 0 && (
              <p className="text-xs text-muted-foreground">
                + {remainingCount} more item{remainingCount > 1 ? 's' : ''}...
              </p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="absolute bottom-4 left-4 right-4 border-t border-border pt-3">
          <div className="flex items-center justify-between text-sm">
            {group.location && (
              <div className="flex items-center gap-1">
                <MapPin className="w-4 h-4 text-muted-foreground" />
                <span>
                  {group.location}
                  {group.bin_number && ` • ${group.bin_number}`}
                </span>
              </div>
            )}
            <div className="flex items-center gap-4 ml-auto">
              <div className="flex items-center gap-1">
                <Package className="w-4 h-4 text-muted-foreground" />
                <span className="font-medium">{group.total_items} items</span>
              </div>
              <div className="flex items-center gap-1">
                <DollarSign className="w-4 h-4 text-muted-foreground" />
                <span className="font-medium">${group.total_value.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
);

InventoryGroupLabel.displayName = 'InventoryGroupLabel';

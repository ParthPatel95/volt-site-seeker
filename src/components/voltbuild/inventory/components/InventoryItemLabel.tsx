import React, { forwardRef } from 'react';
import QRCode from 'react-qr-code';
import Barcode from 'react-barcode';
import { InventoryItem } from '../types/inventory.types';
import { generateItemQRData } from '@/utils/codeGenerator';
import { cn } from '@/lib/utils';
import { LabelSize } from '../types/group.types';

interface InventoryItemLabelProps {
  item: InventoryItem;
  size?: LabelSize;
  showQR?: boolean;
  showBarcode?: boolean;
  className?: string;
}

export const InventoryItemLabel = forwardRef<HTMLDivElement, InventoryItemLabelProps>(
  ({ item, size = 'medium', showQR = true, showBarcode = true, className }, ref) => {
    const qrData = generateItemQRData({
      id: item.id,
      name: item.name,
      sku: item.sku,
      barcode: item.barcode,
    });

    const barcodeValue = item.barcode || item.sku || item.id.substring(0, 12);

    // Size-specific styling
    const sizeStyles = {
      small: {
        container: 'w-[2in] h-[1in] p-1',
        qrSize: 48,
        title: 'text-[8px] font-semibold truncate',
        subtitle: 'text-[6px] text-muted-foreground truncate',
        barcodeHeight: 20,
        barcodeFontSize: 6,
        layout: 'flex-row gap-1',
      },
      medium: {
        container: 'w-[3in] h-[2in] p-2',
        qrSize: 80,
        title: 'text-sm font-semibold truncate',
        subtitle: 'text-xs text-muted-foreground',
        barcodeHeight: 30,
        barcodeFontSize: 10,
        layout: 'flex-col gap-1',
      },
      large: {
        container: 'w-[6in] h-[4in] p-4',
        qrSize: 120,
        title: 'text-lg font-bold',
        subtitle: 'text-sm text-muted-foreground',
        barcodeHeight: 50,
        barcodeFontSize: 14,
        layout: 'flex-col gap-2',
      },
    };

    const styles = sizeStyles[size];

    return (
      <div
        ref={ref}
        className={cn(
          'bg-white border border-border rounded print:border-black print:rounded-none',
          styles.container,
          className
        )}
      >
        {size === 'small' ? (
          // Small label layout - horizontal
          <div className="flex items-center gap-1 h-full">
            {showQR && (
              <div className="flex-shrink-0">
                <QRCode value={qrData} size={styles.qrSize} level="M" />
              </div>
            )}
            <div className="flex-1 min-w-0 flex flex-col justify-center">
              <p className={styles.title}>{item.name}</p>
              {item.sku && <p className={styles.subtitle}>SKU: {item.sku}</p>}
              {item.location && <p className={styles.subtitle}>{item.location}</p>}
            </div>
          </div>
        ) : (
          // Medium/Large label layout - vertical
          <div className={cn('flex h-full', styles.layout)}>
            <div className="flex items-start gap-2">
              {showQR && (
                <div className="flex-shrink-0">
                  <QRCode value={qrData} size={styles.qrSize} level="M" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className={styles.title}>{item.name}</p>
                {item.sku && (
                  <p className={styles.subtitle}>SKU: {item.sku}</p>
                )}
                {item.location && (
                  <p className={styles.subtitle}>📍 {item.location}</p>
                )}
                <p className={styles.subtitle}>
                  Qty: {item.quantity} {item.unit}
                </p>
              </div>
            </div>

            {showBarcode && (
              <div className="flex justify-center mt-auto">
                <Barcode
                  value={barcodeValue}
                  width={1}
                  height={styles.barcodeHeight}
                  fontSize={styles.barcodeFontSize}
                  margin={0}
                  displayValue={true}
                />
              </div>
            )}
          </div>
        )}
      </div>
    );
  }
);

InventoryItemLabel.displayName = 'InventoryItemLabel';

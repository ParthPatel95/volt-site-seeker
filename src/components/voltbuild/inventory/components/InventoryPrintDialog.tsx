import React, { useState, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Printer, Download, QrCode, Barcode } from 'lucide-react';
import { InventoryItem } from '../types/inventory.types';
import { InventoryGroupWithItems, LabelSize, LABEL_SIZES } from '../types/group.types';
import { InventoryItemLabel } from './InventoryItemLabel';
import { InventoryGroupLabel } from './InventoryGroupLabel';

interface InventoryPrintDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item?: InventoryItem | null;
  group?: InventoryGroupWithItems | null;
  items?: InventoryItem[];
}

export function InventoryPrintDialog({
  open,
  onOpenChange,
  item,
  group,
  items,
}: InventoryPrintDialogProps) {
  const [labelSize, setLabelSize] = useState<LabelSize>('medium');
  const [showQR, setShowQR] = useState(true);
  const [showBarcode, setShowBarcode] = useState(true);
  const [copies, setCopies] = useState(1);
  const [isPrinting, setIsPrinting] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  const isGroupLabel = !!group;
  const isBatchPrint = items && items.length > 0;

  const handlePrint = () => {
    if (!printRef.current) return;
    setIsPrinting(true);

    const printContent = printRef.current.innerHTML;
    const printWindow = window.open('', '_blank');
    
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Print Labels</title>
          <style>
            @page { margin: 0.5in; }
            body { margin: 0; padding: 0; }
            .label-container { 
              page-break-inside: avoid;
              margin-bottom: 0.25in;
            }
            @media print {
              body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            }
          </style>
        </head>
        <body>
          ${printContent}
        </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.focus();
      
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
        setIsPrinting(false);
      }, 250);
    } else {
      setIsPrinting(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!printRef.current) return;
    setIsPrinting(true);

    try {
      const { exportToPDF } = await import('@/utils/pdfExport');
      
      const filename = isGroupLabel 
        ? `group-label-${group?.group_code}.pdf` 
        : item 
          ? `item-label-${item.sku || item.id}.pdf`
          : 'inventory-labels.pdf';

      await exportToPDF(printRef.current, {
        filename,
        margin: 15,
        orientation: 'portrait',
        format: 'letter',
        imageQuality: 0.98,
        scale: 2,
      });
    } catch (error) {
      console.error('PDF generation error:', error);
    } finally {
      setIsPrinting(false);
    }
  };

  const renderLabels = () => {
    const labelElements: React.ReactNode[] = [];

    for (let i = 0; i < copies; i++) {
      if (isGroupLabel && group) {
        labelElements.push(
          <div key={`group-${i}`} className="label-container mb-4">
            <InventoryGroupLabel group={group} />
          </div>
        );
      } else if (isBatchPrint && items) {
        items.forEach((batchItem, idx) => {
          labelElements.push(
            <div key={`batch-${idx}-${i}`} className="label-container mb-4">
              <InventoryItemLabel
                item={batchItem}
                size={labelSize}
                showQR={showQR}
                showBarcode={showBarcode}
              />
            </div>
          );
        });
      } else if (item) {
        labelElements.push(
          <div key={`item-${i}`} className="label-container mb-4">
            <InventoryItemLabel
              item={item}
              size={labelSize}
              showQR={showQR}
              showBarcode={showBarcode}
            />
          </div>
        );
      }
    }

    return labelElements;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>
            Print {isGroupLabel ? 'Container' : 'Item'} Label{isBatchPrint ? 's' : ''}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col md:flex-row gap-4">
          {/* Options Panel */}
          <div className="md:w-64 space-y-4 flex-shrink-0">
            {!isGroupLabel && (
              <>
                <div className="space-y-2">
                  <Label>Label Size</Label>
                  <Select value={labelSize} onValueChange={(v) => setLabelSize(v as LabelSize)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {LABEL_SIZES.map((size) => (
                        <SelectItem key={size.value} value={size.value}>
                          {size.label} ({size.dimensions})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <QrCode className="w-4 h-4 text-muted-foreground" />
                      <Label>Show QR Code</Label>
                    </div>
                    <Switch checked={showQR} onCheckedChange={setShowQR} />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Barcode className="w-4 h-4 text-muted-foreground" />
                      <Label>Show Barcode</Label>
                    </div>
                    <Switch checked={showBarcode} onCheckedChange={setShowBarcode} />
                  </div>
                </div>
              </>
            )}

            <div className="space-y-2">
              <Label>Number of Copies</Label>
              <Input
                type="number"
                min={1}
                max={100}
                value={copies}
                onChange={(e) => setCopies(Math.max(1, parseInt(e.target.value) || 1))}
              />
            </div>

            {isBatchPrint && (
              <p className="text-sm text-muted-foreground">
                {items?.length} item{items && items.length !== 1 ? 's' : ''} selected
              </p>
            )}
          </div>

          {/* Preview Panel */}
          <div className="flex-1 min-h-0">
            <Label className="mb-2 block">Preview</Label>
            <ScrollArea className="h-[350px] border rounded-lg bg-muted/30 p-4">
              <div ref={printRef} className="space-y-4">
                {renderLabels()}
              </div>
            </ScrollArea>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={handleDownloadPDF} disabled={isPrinting}>
            <Download className="w-4 h-4 mr-2" />
            Download PDF
          </Button>
          <Button onClick={handlePrint} disabled={isPrinting}>
            <Printer className="w-4 h-4 mr-2" />
            {isPrinting ? 'Printing...' : 'Print'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

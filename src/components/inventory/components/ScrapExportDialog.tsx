import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Download, 
  FileSpreadsheet, 
  Building2,
  DollarSign,
  Scale,
  AlertTriangle,
  Loader2,
  Printer,
} from 'lucide-react';
import { InventoryItem } from '../types/inventory.types';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface ScrapExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  items: InventoryItem[];
  workspaceName: string;
}

export function ScrapExportDialog({
  open,
  onOpenChange,
  items,
  workspaceName,
}: ScrapExportDialogProps) {
  const [projectAddress, setProjectAddress] = useState('');
  const [contactName, setContactName] = useState('');
  const [notes, setNotes] = useState('');
  const [isExporting, setIsExporting] = useState(false);

  // Filter items that have scrap data
  const scrapItems = useMemo(() => 
    items.filter(item => item.metal_type || item.estimated_weight || item.scrap_price_per_unit),
    [items]
  );

  // Calculate totals
  const totals = useMemo(() => {
    let totalWeight = 0;
    let totalScrapValue = 0;
    let totalSalvageValue = 0;
    let hazmatCount = 0;

    scrapItems.forEach(item => {
      const weight = item.estimated_weight || 0;
      const price = item.scrap_price_per_unit || 0;
      totalWeight += weight;
      totalScrapValue += weight * price;
      
      if (item.is_salvageable && item.salvage_value) {
        totalSalvageValue += item.salvage_value;
      }
      
      if (item.has_hazmat_flags) {
        hazmatCount++;
      }
    });

    return {
      totalWeight,
      totalScrapValue,
      totalSalvageValue,
      totalRecoveryValue: totalScrapValue + totalSalvageValue,
      hazmatCount,
      itemCount: scrapItems.length,
    };
  }, [scrapItems]);

  const exportSpreadsheet = () => {
    if (scrapItems.length === 0) {
      toast.error('No scrap items to export');
      return;
    }

    const headers = [
      'Item Name',
      'Metal Type',
      'Metal Grade',
      'Quantity',
      'Est. Weight (lbs)',
      'Weight Confidence',
      'Price/lb ($)',
      'Total Scrap Value ($)',
      'Salvageable',
      'Salvage Value ($)',
      'Disposition',
      'Hazmat Flags',
      'Removal Complexity',
      'Labor Hours',
      'Description',
    ];

    const rows = scrapItems.map(item => {
      const weight = item.estimated_weight || 0;
      const price = item.scrap_price_per_unit || 0;
      const scrapValue = weight * price;
      
      const hazmatFlags = [];
      if (item.hazmat_details?.hasAsbestos) hazmatFlags.push('Asbestos');
      if (item.hazmat_details?.hasLeadPaint) hazmatFlags.push('Lead Paint');
      if (item.hazmat_details?.hasPCBs) hazmatFlags.push('PCBs');
      if (item.hazmat_details?.hasRefrigerants) hazmatFlags.push('Refrigerants');
      if (item.hazmat_details?.otherHazards?.length) {
        hazmatFlags.push(...item.hazmat_details.otherHazards);
      }

      let disposition = 'Scrap';
      if (item.has_hazmat_flags) {
        disposition = 'Hazmat Disposal';
      } else if (item.is_salvageable) {
        disposition = 'Resell/Salvage';
      }

      return [
        item.name,
        item.metal_type || 'Unknown',
        item.metal_grade || '',
        item.quantity,
        weight.toFixed(2),
        'Medium', // Default confidence since we don't store this
        price.toFixed(2),
        scrapValue.toFixed(2),
        item.is_salvageable ? 'Yes' : 'No',
        item.salvage_value?.toFixed(2) || '',
        disposition,
        hazmatFlags.join('; ') || 'None',
        item.removal_complexity || '',
        item.labor_hours_estimate || '',
        item.description || '',
      ];
    });

    // Add summary rows
    rows.push([]);
    rows.push(['SUMMARY']);
    rows.push(['Total Items:', totals.itemCount.toString()]);
    rows.push(['Total Weight:', `${totals.totalWeight.toFixed(2)} lbs`]);
    rows.push(['Total Scrap Value:', `$${totals.totalScrapValue.toFixed(2)}`]);
    rows.push(['Total Salvage Value:', `$${totals.totalSalvageValue.toFixed(2)}`]);
    rows.push(['Total Recovery Value:', `$${totals.totalRecoveryValue.toFixed(2)}`]);
    rows.push(['Items with Hazmat:', totals.hazmatCount.toString()]);
    rows.push([]);
    rows.push(['Quote Details']);
    rows.push(['Project:', workspaceName]);
    rows.push(['Address:', projectAddress]);
    rows.push(['Contact:', contactName]);
    rows.push(['Generated:', format(new Date(), 'PPP')]);
    if (notes) {
      rows.push(['Notes:', notes]);
    }

    // Generate CSV
    const csvRows = [
      headers.join(','),
      ...rows.map((row) =>
        row.map((cell) => {
          const value = String(cell);
          if (value.includes(',') || value.includes('\n') || value.includes('"')) {
            return `"${value.replace(/"/g, '""')}"`;
          }
          return value;
        }).join(',')
      ),
    ];

    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${workspaceName.replace(/\s+/g, '-')}-scrap-quote-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      exportSpreadsheet();
      toast.success(`Exported ${scrapItems.length} scrap items`);
      onOpenChange(false);
    } catch (error) {
      toast.error('Export failed');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-orange-500" />
            Export Scrap Quote
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh]">
          <div className="space-y-6 pr-2">
            {/* Summary Stats */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-lg bg-muted/50 border">
                <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
                  <Scale className="w-3 h-3" />
                  Total Weight
                </div>
                <p className="font-semibold">
                  {totals.totalWeight.toLocaleString(undefined, { maximumFractionDigits: 0 })} lbs
                </p>
              </div>
              <div className="p-3 rounded-lg bg-muted/50 border">
                <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
                  <DollarSign className="w-3 h-3" />
                  Scrap Value
                </div>
                <p className="font-semibold text-green-600">
                  ${totals.totalScrapValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-muted/50 border">
                <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
                  <Building2 className="w-3 h-3" />
                  Salvage Value
                </div>
                <p className="font-semibold text-blue-600">
                  ${totals.totalSalvageValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-muted/50 border">
                <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
                  <DollarSign className="w-3 h-3" />
                  Total Recovery
                </div>
                <p className="font-bold text-lg">
                  ${totals.totalRecoveryValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                </p>
              </div>
            </div>

            {/* Hazmat Warning */}
            {totals.hazmatCount > 0 && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                <AlertTriangle className="w-4 h-4 text-destructive" />
                <span className="text-sm">
                  <strong>{totals.hazmatCount}</strong> item(s) flagged for hazardous materials
                </span>
              </div>
            )}

            <Separator />

            {/* Quote Details */}
            <div className="space-y-4">
              <h4 className="font-medium text-sm">Quote Details (Optional)</h4>
              
              <div className="space-y-2">
                <Label htmlFor="address">Project Address</Label>
                <Input
                  id="address"
                  value={projectAddress}
                  onChange={(e) => setProjectAddress(e.target.value)}
                  placeholder="123 Main St, City, State"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contact">Contact Name</Label>
                <Input
                  id="contact"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  placeholder="John Smith"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Additional notes for the quote..."
                  rows={2}
                />
              </div>
            </div>

            {/* Items Preview */}
            <div className="space-y-2">
              <h4 className="font-medium text-sm">
                Items to Export ({scrapItems.length})
              </h4>
              <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto">
                {scrapItems.slice(0, 10).map(item => (
                  <Badge key={item.id} variant="secondary" className="text-xs">
                    {item.name}
                    {item.metal_type && ` (${item.metal_type})`}
                  </Badge>
                ))}
                {scrapItems.length > 10 && (
                  <Badge variant="outline" className="text-xs">
                    +{scrapItems.length - 10} more
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </ScrollArea>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleExport}
            disabled={isExporting || scrapItems.length === 0}
            className="bg-orange-500 hover:bg-orange-600"
          >
            {isExporting ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Download className="w-4 h-4 mr-2" />
            )}
            Export Quote CSV
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  Download, 
  Mail, 
  Printer,
  Package,
  Recycle,
  DollarSign,
  Building2,
  MapPin
} from 'lucide-react';
import { InventoryItem } from '../types/inventory.types';
import { cn } from '@/lib/utils';

interface DemolitionQuoteGeneratorProps {
  items: InventoryItem[];
  workspaceName?: string;
  onClose?: () => void;
  className?: string;
}

interface QuoteSummary {
  scrapItems: {
    item: InventoryItem;
    value: { low: number; high: number };
  }[];
  salvageItems: {
    item: InventoryItem;
    value: { low: number; high: number };
  }[];
  totalScrap: { low: number; high: number };
  totalSalvage: { low: number; high: number };
  grandTotal: { low: number; high: number };
}

export function DemolitionQuoteGenerator({
  items,
  workspaceName,
  onClose,
  className,
}: DemolitionQuoteGeneratorProps) {
  const [projectName, setProjectName] = useState(workspaceName || '');
  const [projectAddress, setProjectAddress] = useState('');

  const quoteSummary = useMemo<QuoteSummary>(() => {
    const scrapItems: QuoteSummary['scrapItems'] = [];
    const salvageItems: QuoteSummary['salvageItems'] = [];

    items.forEach(item => {
      const weight = item.estimated_weight || 0;
      const pricePerUnit = item.scrap_price_per_unit || 0;
      
      if (item.is_salvageable && item.salvage_value) {
        // Salvage item - use salvage value with ±20% range
        salvageItems.push({
          item,
          value: {
            low: item.salvage_value * 0.8,
            high: item.salvage_value * 1.2,
          },
        });
      } else if (weight > 0 && pricePerUnit > 0) {
        // Scrap item
        const baseValue = weight * pricePerUnit;
        scrapItems.push({
          item,
          value: {
            low: baseValue * 0.9,
            high: baseValue * 1.1,
          },
        });
      } else if (item.unit_cost > 0) {
        // Fallback to unit cost if no scrap data
        const baseValue = item.unit_cost * item.quantity;
        scrapItems.push({
          item,
          value: {
            low: baseValue * 0.1, // Scrap is usually 10-30% of retail
            high: baseValue * 0.3,
          },
        });
      }
    });

    const totalScrap = scrapItems.reduce(
      (acc, { value }) => ({
        low: acc.low + value.low,
        high: acc.high + value.high,
      }),
      { low: 0, high: 0 }
    );

    const totalSalvage = salvageItems.reduce(
      (acc, { value }) => ({
        low: acc.low + value.low,
        high: acc.high + value.high,
      }),
      { low: 0, high: 0 }
    );

    return {
      scrapItems,
      salvageItems,
      totalScrap,
      totalSalvage,
      grandTotal: {
        low: totalScrap.low + totalSalvage.low,
        high: totalScrap.high + totalSalvage.high,
      },
    };
  }, [items]);

  const handleDownloadPDF = () => {
    // TODO: Implement PDF generation
    console.log('Download PDF', { projectName, projectAddress, quoteSummary });
  };

  const handleEmailQuote = () => {
    // TODO: Implement email functionality
    console.log('Email quote', { projectName, projectAddress, quoteSummary });
  };

  const handlePrint = () => {
    window.print();
  };

  const formatCurrency = (value: number) => {
    return `$${value.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  };

  return (
    <Card className={cn("w-full max-w-2xl", className)}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-primary" />
          Demolition Quote Generator
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Project Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="project-name" className="flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5" />
              Project Name
            </Label>
            <Input
              id="project-name"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              placeholder="e.g., 123 Main Street Warehouse"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="project-address" className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5" />
              Address
            </Label>
            <Input
              id="project-address"
              value={projectAddress}
              onChange={(e) => setProjectAddress(e.target.value)}
              placeholder="e.g., 123 Main St, City, State"
            />
          </div>
        </div>

        <Separator />

        {/* Scrap Metal Summary */}
        {quoteSummary.scrapItems.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Recycle className="w-4 h-4 text-amber-600" />
              <h3 className="font-medium">Scrap Metal Summary</h3>
              <Badge variant="secondary" className="ml-auto">
                {quoteSummary.scrapItems.length} items
              </Badge>
            </div>
            <ScrollArea className="h-[120px]">
              <div className="space-y-1.5 pr-3">
                {quoteSummary.scrapItems.map(({ item, value }) => (
                  <div 
                    key={item.id}
                    className="flex items-center justify-between text-sm py-1.5 px-2 rounded bg-muted/50"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="truncate">{item.name}</span>
                      {item.metal_type && (
                        <Badge variant="outline" className="text-[10px] shrink-0">
                          {item.metal_type}
                        </Badge>
                      )}
                      {item.estimated_weight && (
                        <span className="text-xs text-muted-foreground shrink-0">
                          ({item.estimated_weight} {item.weight_unit || 'lbs'})
                        </span>
                      )}
                    </div>
                    <span className="font-medium shrink-0 ml-2">
                      {formatCurrency(value.low)} - {formatCurrency(value.high)}
                    </span>
                  </div>
                ))}
              </div>
            </ScrollArea>
            <div className="flex justify-between font-medium text-amber-700 dark:text-amber-400 pt-2 border-t">
              <span>Scrap Subtotal:</span>
              <span>
                {formatCurrency(quoteSummary.totalScrap.low)} - {formatCurrency(quoteSummary.totalScrap.high)}
              </span>
            </div>
          </div>
        )}

        {/* Salvage Items Summary */}
        {quoteSummary.salvageItems.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Package className="w-4 h-4 text-green-600" />
              <h3 className="font-medium">Salvage Items</h3>
              <Badge variant="secondary" className="ml-auto">
                {quoteSummary.salvageItems.length} items
              </Badge>
            </div>
            <ScrollArea className="h-[120px]">
              <div className="space-y-1.5 pr-3">
                {quoteSummary.salvageItems.map(({ item, value }) => (
                  <div 
                    key={item.id}
                    className="flex items-center justify-between text-sm py-1.5 px-2 rounded bg-muted/50"
                  >
                    <span className="truncate">{item.name}</span>
                    <span className="font-medium shrink-0 ml-2">
                      {formatCurrency(value.low)} - {formatCurrency(value.high)}
                    </span>
                  </div>
                ))}
              </div>
            </ScrollArea>
            <div className="flex justify-between font-medium text-green-700 dark:text-green-400 pt-2 border-t">
              <span>Salvage Subtotal:</span>
              <span>
                {formatCurrency(quoteSummary.totalSalvage.low)} - {formatCurrency(quoteSummary.totalSalvage.high)}
              </span>
            </div>
          </div>
        )}

        <Separator />

        {/* Grand Total */}
        <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-primary" />
              <span className="font-semibold">Estimated Total Recovery</span>
            </div>
            <span className="text-xl font-bold text-primary">
              {formatCurrency(quoteSummary.grandTotal.low)} - {formatCurrency(quoteSummary.grandTotal.high)}
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            * Estimates based on current market prices and visual assessment. 
            Actual values may vary based on metal quality, market conditions, and processing costs.
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-2 pt-2">
          <Button onClick={handleDownloadPDF} className="flex-1 sm:flex-none">
            <Download className="w-4 h-4 mr-2" />
            Download PDF
          </Button>
          <Button variant="outline" onClick={handleEmailQuote} className="flex-1 sm:flex-none">
            <Mail className="w-4 h-4 mr-2" />
            Email Quote
          </Button>
          <Button variant="outline" onClick={handlePrint} className="flex-1 sm:flex-none">
            <Printer className="w-4 h-4 mr-2" />
            Print
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

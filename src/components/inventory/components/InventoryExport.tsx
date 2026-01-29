import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Download, FileText, Table, Loader2 } from 'lucide-react';
import { InventoryItem } from '../types/inventory.types';
import { toast } from 'sonner';

interface InventoryExportProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  items: InventoryItem[];
  projectName: string;
}

const EXPORT_COLUMNS = [
  { key: 'name', label: 'Name', default: true },
  { key: 'sku', label: 'SKU', default: true },
  { key: 'barcode', label: 'Barcode', default: true },
  { key: 'quantity', label: 'Quantity', default: true },
  { key: 'unit', label: 'Unit', default: true },
  { key: 'unit_cost', label: 'Unit Cost', default: true },
  { key: 'total_value', label: 'Total Value', default: true },
  { key: 'category', label: 'Category', default: true },
  { key: 'location', label: 'Location', default: true },
  { key: 'status', label: 'Status', default: true },
  { key: 'condition', label: 'Condition', default: false },
  { key: 'supplier_name', label: 'Supplier', default: false },
  { key: 'expiry_date', label: 'Expiry Date', default: false },
  { key: 'notes', label: 'Notes', default: false },
];

export function InventoryExport({
  open,
  onOpenChange,
  items,
  projectName,
}: InventoryExportProps) {
  const [format, setFormat] = useState<'csv' | 'json'>('csv');
  const [selectedColumns, setSelectedColumns] = useState<string[]>(
    EXPORT_COLUMNS.filter((c) => c.default).map((c) => c.key)
  );
  const [isExporting, setIsExporting] = useState(false);

  const toggleColumn = (key: string) => {
    setSelectedColumns((prev) =>
      prev.includes(key) ? prev.filter((c) => c !== key) : [...prev, key]
    );
  };

  const selectAll = () => {
    setSelectedColumns(EXPORT_COLUMNS.map((c) => c.key));
  };

  const selectNone = () => {
    setSelectedColumns([]);
  };

  const getExportData = () => {
    return items.map((item) => {
      const row: Record<string, any> = {};
      
      selectedColumns.forEach((col) => {
        switch (col) {
          case 'name':
            row['Name'] = item.name;
            break;
          case 'sku':
            row['SKU'] = item.sku || '';
            break;
          case 'barcode':
            row['Barcode'] = item.barcode || '';
            break;
          case 'quantity':
            row['Quantity'] = item.quantity;
            break;
          case 'unit':
            row['Unit'] = item.unit;
            break;
          case 'unit_cost':
            row['Unit Cost'] = item.unit_cost;
            break;
          case 'total_value':
            row['Total Value'] = item.quantity * item.unit_cost;
            break;
          case 'category':
            row['Category'] = item.category?.name || '';
            break;
          case 'location':
            row['Location'] = [item.location, item.storage_zone, item.bin_number]
              .filter(Boolean)
              .join(' / ');
            break;
          case 'status':
            row['Status'] = item.status.replace('_', ' ');
            break;
          case 'condition':
            row['Condition'] = item.condition;
            break;
          case 'supplier_name':
            row['Supplier'] = item.supplier_name || '';
            break;
          case 'expiry_date':
            row['Expiry Date'] = item.expiry_date || '';
            break;
          case 'notes':
            row['Notes'] = item.notes || '';
            break;
        }
      });
      
      return row;
    });
  };

  const exportCSV = () => {
    const data = getExportData();
    if (data.length === 0) {
      toast.error('No data to export');
      return;
    }

    const headers = Object.keys(data[0]);
    const csvRows = [
      headers.join(','),
      ...data.map((row) =>
        headers
          .map((header) => {
            const value = row[header];
            // Escape quotes and wrap in quotes if contains comma or newline
            if (typeof value === 'string' && (value.includes(',') || value.includes('\n') || value.includes('"'))) {
              return `"${value.replace(/"/g, '""')}"`;
            }
            return value;
          })
          .join(',')
      ),
    ];

    const csvContent = csvRows.join('\n');
    downloadFile(csvContent, `${projectName}-inventory.csv`, 'text/csv');
  };

  const exportJSON = () => {
    const data = getExportData();
    if (data.length === 0) {
      toast.error('No data to export');
      return;
    }

    const jsonContent = JSON.stringify(data, null, 2);
    downloadFile(jsonContent, `${projectName}-inventory.json`, 'application/json');
  };

  const downloadFile = (content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleExport = async () => {
    if (selectedColumns.length === 0) {
      toast.error('Select at least one column to export');
      return;
    }

    setIsExporting(true);
    try {
      if (format === 'csv') {
        exportCSV();
      } else {
        exportJSON();
      }
      toast.success(`Exported ${items.length} items`);
      onOpenChange(false);
    } catch (error) {
      toast.error('Export failed');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="w-5 h-5" />
            Export Inventory
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Format Selection */}
          <div className="space-y-3">
            <Label>Export Format</Label>
            <RadioGroup
              value={format}
              onValueChange={(v) => setFormat(v as 'csv' | 'json')}
              className="flex gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="csv" id="csv" />
                <Label htmlFor="csv" className="flex items-center gap-2 cursor-pointer">
                  <Table className="w-4 h-4" />
                  CSV
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="json" id="json" />
                <Label htmlFor="json" className="flex items-center gap-2 cursor-pointer">
                  <FileText className="w-4 h-4" />
                  JSON
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Column Selection */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Columns to Export</Label>
              <div className="flex gap-2">
                <Button variant="link" size="sm" className="h-auto p-0" onClick={selectAll}>
                  Select All
                </Button>
                <span className="text-muted-foreground">|</span>
                <Button variant="link" size="sm" className="h-auto p-0" onClick={selectNone}>
                  None
                </Button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 max-h-[200px] overflow-y-auto">
              {EXPORT_COLUMNS.map((col) => (
                <div key={col.key} className="flex items-center space-x-2">
                  <Checkbox
                    id={col.key}
                    checked={selectedColumns.includes(col.key)}
                    onCheckedChange={() => toggleColumn(col.key)}
                  />
                  <Label htmlFor={col.key} className="text-sm cursor-pointer">
                    {col.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Summary */}
          <div className="p-3 rounded-lg bg-muted text-sm">
            <p className="text-muted-foreground">
              Exporting <span className="font-medium text-foreground">{items.length}</span> items
              with <span className="font-medium text-foreground">{selectedColumns.length}</span> columns
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleExport}
            disabled={isExporting || selectedColumns.length === 0}
          >
            {isExporting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

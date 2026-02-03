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
import { Download, FileText, Table, Loader2, HardHat } from 'lucide-react';
import { InventoryItem } from '../types/inventory.types';
import { toast } from 'sonner';

interface InventoryExportProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  items: InventoryItem[];
  projectName: string;
}

const EXPORT_COLUMNS = [
  // Standard columns
  { key: 'name', label: 'Name', default: true, group: 'standard' },
  { key: 'sku', label: 'SKU', default: true, group: 'standard' },
  { key: 'barcode', label: 'Barcode', default: true, group: 'standard' },
  { key: 'quantity', label: 'Quantity', default: true, group: 'standard' },
  { key: 'unit', label: 'Unit', default: true, group: 'standard' },
  { key: 'unit_cost', label: 'Unit Cost', default: true, group: 'standard' },
  { key: 'total_value', label: 'Total Value', default: true, group: 'standard' },
  { key: 'category', label: 'Category', default: true, group: 'standard' },
  { key: 'location', label: 'Location', default: true, group: 'standard' },
  { key: 'status', label: 'Status', default: true, group: 'standard' },
  { key: 'condition', label: 'Condition', default: false, group: 'standard' },
  { key: 'supplier_name', label: 'Supplier', default: false, group: 'standard' },
  { key: 'expiry_date', label: 'Expiry Date', default: false, group: 'standard' },
  { key: 'notes', label: 'Notes', default: false, group: 'standard' },
  // Scrap/Demolition columns
  { key: 'metal_type', label: 'Metal Type', default: false, group: 'demolition' },
  { key: 'metal_grade', label: 'Metal Grade', default: false, group: 'demolition' },
  { key: 'estimated_weight', label: 'Est. Weight', default: false, group: 'demolition' },
  { key: 'weight_unit', label: 'Weight Unit', default: false, group: 'demolition' },
  { key: 'scrap_price_per_unit', label: 'Price/lb', default: false, group: 'demolition' },
  { key: 'scrap_value', label: 'Scrap Value', default: false, group: 'demolition' },
  { key: 'is_salvageable', label: 'Salvageable', default: false, group: 'demolition' },
  { key: 'salvage_value', label: 'Salvage Value', default: false, group: 'demolition' },
  { key: 'has_hazmat', label: 'Has Hazmat', default: false, group: 'demolition' },
  { key: 'hazmat_details', label: 'Hazmat Details', default: false, group: 'demolition' },
  { key: 'removal_complexity', label: 'Removal Complexity', default: false, group: 'demolition' },
  { key: 'labor_hours', label: 'Labor Hours', default: false, group: 'demolition' },
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

  const selectDemolitionPreset = () => {
    // Select standard defaults + all demolition columns
    const demolitionColumns = EXPORT_COLUMNS.filter(c => c.group === 'demolition').map(c => c.key);
    const standardDefaults = EXPORT_COLUMNS.filter(c => c.default).map(c => c.key);
    setSelectedColumns([...new Set([...standardDefaults, ...demolitionColumns])]);
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
          // Demolition columns
          case 'metal_type':
            row['Metal Type'] = item.metal_type || '';
            break;
          case 'metal_grade':
            row['Metal Grade'] = item.metal_grade || '';
            break;
          case 'estimated_weight':
            row['Est. Weight'] = item.estimated_weight || '';
            break;
          case 'weight_unit':
            row['Weight Unit'] = item.weight_unit || 'lbs';
            break;
          case 'scrap_price_per_unit':
            row['Price/lb'] = item.scrap_price_per_unit || '';
            break;
          case 'scrap_value':
            row['Scrap Value'] = item.estimated_weight && item.scrap_price_per_unit 
              ? (item.estimated_weight * item.scrap_price_per_unit).toFixed(2)
              : '';
            break;
          case 'is_salvageable':
            row['Salvageable'] = item.is_salvageable ? 'Yes' : 'No';
            break;
          case 'salvage_value':
            row['Salvage Value'] = item.salvage_value || '';
            break;
          case 'has_hazmat':
            row['Has Hazmat'] = item.has_hazmat_flags ? 'Yes' : 'No';
            break;
          case 'hazmat_details':
            if (item.hazmat_details) {
              const details = [];
              if (item.hazmat_details.hasAsbestos) details.push('Asbestos');
              if (item.hazmat_details.hasLeadPaint) details.push('Lead Paint');
              if (item.hazmat_details.hasPCBs) details.push('PCBs');
              if (item.hazmat_details.hasRefrigerants) details.push('Refrigerants');
              if (item.hazmat_details.otherHazards?.length) {
                details.push(...item.hazmat_details.otherHazards);
              }
              row['Hazmat Details'] = details.join(', ');
            } else {
              row['Hazmat Details'] = '';
            }
            break;
          case 'removal_complexity':
            row['Removal Complexity'] = item.removal_complexity || '';
            break;
          case 'labor_hours':
            row['Labor Hours'] = item.labor_hours_estimate || '';
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

  const standardColumns = EXPORT_COLUMNS.filter(c => c.group === 'standard');
  const demolitionColumns = EXPORT_COLUMNS.filter(c => c.group === 'demolition');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
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
                  All
                </Button>
                <span className="text-muted-foreground">|</span>
                <Button variant="link" size="sm" className="h-auto p-0" onClick={selectNone}>
                  None
                </Button>
                <span className="text-muted-foreground">|</span>
                <Button 
                  variant="link" 
                  size="sm" 
                  className="h-auto p-0 text-orange-500 hover:text-orange-600" 
                  onClick={selectDemolitionPreset}
                >
                  <HardHat className="w-3 h-3 mr-1" />
                  Demolition
                </Button>
              </div>
            </div>
            
            {/* Standard Columns */}
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground font-medium">Standard</p>
              <div className="grid grid-cols-2 gap-2 max-h-[120px] overflow-y-auto">
                {standardColumns.map((col) => (
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

            {/* Demolition Columns */}
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground font-medium flex items-center gap-1">
                <HardHat className="w-3 h-3" />
                Scrap & Demolition
              </p>
              <div className="grid grid-cols-2 gap-2 max-h-[120px] overflow-y-auto">
                {demolitionColumns.map((col) => (
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
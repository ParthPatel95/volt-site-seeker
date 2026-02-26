import React, { useState, useMemo, useCallback } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowUpDown, ArrowUp, ArrowDown, Sparkles, Pencil, Trash2, Package, Download, X } from 'lucide-react';
import { InventoryItem } from '../types/inventory.types';
import { cn } from '@/lib/utils';

interface InventorySpreadsheetProps {
  items: InventoryItem[];
  onItemClick: (item: InventoryItem) => void;
  onEdit: (item: InventoryItem) => void;
  onDelete: (item: InventoryItem) => void;
  onAnalyze?: (item: InventoryItem) => void;
  onInlineUpdate?: (id: string, updates: Partial<InventoryItem>) => void;
  onBulkDelete?: (ids: string[]) => void;
  onBulkExport?: (items: InventoryItem[]) => void;
}

type SortField = 'name' | 'sku' | 'quantity' | 'unit_cost' | 'total_value' | 'location' | 'status' | 'condition';
type SortDir = 'asc' | 'desc';

const STATUS_COLORS: Record<string, string> = {
  in_stock: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400',
  low_stock: 'bg-amber-500/15 text-amber-700 dark:text-amber-400',
  out_of_stock: 'bg-red-500/15 text-red-700 dark:text-red-400',
  on_order: 'bg-blue-500/15 text-blue-700 dark:text-blue-400',
  discontinued: 'bg-muted text-muted-foreground',
};

const STATUS_LABELS: Record<string, string> = {
  in_stock: 'In Stock',
  low_stock: 'Low Stock',
  out_of_stock: 'Out of Stock',
  on_order: 'On Order',
  discontinued: 'Discontinued',
};

const CONDITION_LABELS: Record<string, string> = {
  new: 'New',
  good: 'Good',
  fair: 'Fair',
  poor: 'Poor',
};

export function InventorySpreadsheet({
  items,
  onItemClick,
  onEdit,
  onDelete,
  onAnalyze,
  onInlineUpdate,
  onBulkDelete,
  onBulkExport,
}: InventorySpreadsheetProps) {
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortDir, setSortDir] = useState<SortDir>('asc');
  const [editingCell, setEditingCell] = useState<{ id: string; field: 'quantity' | 'unit_cost' } | null>(null);
  const [editValue, setEditValue] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir(d => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDir('asc');
    }
  };

  const sortedItems = useMemo(() => {
    return [...items].sort((a, b) => {
      let aVal: any, bVal: any;
      switch (sortField) {
        case 'name': aVal = a.name.toLowerCase(); bVal = b.name.toLowerCase(); break;
        case 'sku': aVal = (a.sku || '').toLowerCase(); bVal = (b.sku || '').toLowerCase(); break;
        case 'quantity': aVal = a.quantity; bVal = b.quantity; break;
        case 'unit_cost': aVal = a.unit_cost; bVal = b.unit_cost; break;
        case 'total_value': aVal = a.quantity * a.unit_cost; bVal = b.quantity * b.unit_cost; break;
        case 'location': aVal = (a.location || '').toLowerCase(); bVal = (b.location || '').toLowerCase(); break;
        case 'status': aVal = a.status; bVal = b.status; break;
        case 'condition': aVal = a.condition; bVal = b.condition; break;
        default: aVal = a.name; bVal = b.name;
      }
      if (aVal < bVal) return sortDir === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
  }, [items, sortField, sortDir]);

  const totals = useMemo(() => ({
    totalItems: items.reduce((s, i) => s + i.quantity, 0),
    totalValue: items.reduce((s, i) => s + i.quantity * i.unit_cost, 0),
  }), [items]);

  const allSelected = items.length > 0 && selectedIds.size === items.length;
  const someSelected = selectedIds.size > 0 && selectedIds.size < items.length;

  const toggleAll = useCallback(() => {
    if (allSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(items.map(i => i.id)));
    }
  }, [items, allSelected]);

  const toggleOne = useCallback((id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }, []);

  const clearSelection = useCallback(() => setSelectedIds(new Set()), []);

  const selectedItems = useMemo(
    () => items.filter(i => selectedIds.has(i.id)),
    [items, selectedIds]
  );

  const startEdit = (id: string, field: 'quantity' | 'unit_cost', currentValue: number) => {
    setEditingCell({ id, field });
    setEditValue(String(currentValue));
  };

  const commitEdit = () => {
    if (!editingCell || !onInlineUpdate) return;
    const num = editingCell.field === 'quantity' ? parseInt(editValue) : parseFloat(editValue);
    if (!isNaN(num) && num >= 0) {
      onInlineUpdate(editingCell.id, { [editingCell.field]: num });
    }
    setEditingCell(null);
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ArrowUpDown className="w-3 h-3 ml-1 opacity-40" />;
    return sortDir === 'asc'
      ? <ArrowUp className="w-3 h-3 ml-1 text-primary" />
      : <ArrowDown className="w-3 h-3 ml-1 text-primary" />;
  };

  return (
    <div className="space-y-2">
      {/* Bulk action bar */}
      {selectedIds.size > 0 && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-primary/10 border border-primary/20">
          <span className="text-sm font-medium text-primary">
            {selectedIds.size} selected
          </span>
          <div className="flex-1" />
          {onBulkExport && (
            <Button
              variant="outline"
              size="sm"
              className="h-7 text-xs"
              onClick={() => onBulkExport(selectedItems)}
            >
              <Download className="w-3.5 h-3.5 mr-1" />
              Export
            </Button>
          )}
          {onBulkDelete && (
            <Button
              variant="destructive"
              size="sm"
              className="h-7 text-xs"
              onClick={() => {
                onBulkDelete(Array.from(selectedIds));
                clearSelection();
              }}
            >
              <Trash2 className="w-3.5 h-3.5 mr-1" />
              Delete
            </Button>
          )}
          <Button variant="ghost" size="icon-sm" onClick={clearSelection} title="Clear selection">
            <X className="w-3.5 h-3.5" />
          </Button>
        </div>
      )}

      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              {/* Select-all checkbox */}
              <TableHead className="w-[40px] px-2" onClick={(e) => e.stopPropagation()}>
                <Checkbox
                  checked={allSelected ? true : someSelected ? 'indeterminate' : false}
                  onCheckedChange={toggleAll}
                  aria-label="Select all"
                />
              </TableHead>
              <TableHead className="w-[50px]"></TableHead>
              <TableHead className="cursor-pointer select-none" onClick={() => handleSort('name')}>
                <span className="flex items-center">Name <SortIcon field="name" /></span>
              </TableHead>
              <TableHead className="cursor-pointer select-none hidden md:table-cell" onClick={() => handleSort('sku')}>
                <span className="flex items-center">SKU <SortIcon field="sku" /></span>
              </TableHead>
              <TableHead className="cursor-pointer select-none text-right w-[80px]" onClick={() => handleSort('quantity')}>
                <span className="flex items-center justify-end">Qty <SortIcon field="quantity" /></span>
              </TableHead>
              <TableHead className="cursor-pointer select-none text-right w-[100px] hidden sm:table-cell" onClick={() => handleSort('unit_cost')}>
                <span className="flex items-center justify-end">Cost <SortIcon field="unit_cost" /></span>
              </TableHead>
              <TableHead className="cursor-pointer select-none text-right w-[110px] hidden sm:table-cell" onClick={() => handleSort('total_value')}>
                <span className="flex items-center justify-end">Total <SortIcon field="total_value" /></span>
              </TableHead>
              <TableHead className="cursor-pointer select-none hidden lg:table-cell" onClick={() => handleSort('location')}>
                <span className="flex items-center">Location <SortIcon field="location" /></span>
              </TableHead>
              <TableHead className="cursor-pointer select-none w-[100px]" onClick={() => handleSort('status')}>
                <span className="flex items-center">Status <SortIcon field="status" /></span>
              </TableHead>
              <TableHead className="cursor-pointer select-none hidden lg:table-cell w-[80px]" onClick={() => handleSort('condition')}>
                <span className="flex items-center">Cond. <SortIcon field="condition" /></span>
              </TableHead>
              <TableHead className="w-[110px] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedItems.map((item) => {
              const isSelected = selectedIds.has(item.id);
              return (
                <TableRow
                  key={item.id}
                  className={cn(
                    'cursor-pointer hover:bg-muted/30',
                    isSelected && 'bg-primary/5'
                  )}
                  onClick={() => onItemClick(item)}
                >
                  {/* Row checkbox */}
                  <TableCell className="px-2" onClick={(e) => e.stopPropagation()}>
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => toggleOne(item.id)}
                      aria-label={`Select ${item.name}`}
                    />
                  </TableCell>

                  {/* Thumbnail */}
                  <TableCell className="p-2">
                    <div className="w-9 h-9 rounded bg-muted flex items-center justify-center overflow-hidden">
                      {item.primary_image_url ? (
                        <img src={item.primary_image_url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <Package className="w-4 h-4 text-muted-foreground" />
                      )}
                    </div>
                  </TableCell>

                  {/* Name */}
                  <TableCell className="font-medium max-w-[200px] truncate">
                    {item.name}
                  </TableCell>

                  {/* SKU */}
                  <TableCell className="text-muted-foreground hidden md:table-cell">
                    {item.sku || '—'}
                  </TableCell>

                  {/* Quantity (inline editable) */}
                  <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                    {editingCell?.id === item.id && editingCell.field === 'quantity' ? (
                      <Input
                        type="number"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onBlur={commitEdit}
                        onKeyDown={(e) => { if (e.key === 'Enter') commitEdit(); if (e.key === 'Escape') setEditingCell(null); }}
                        className="h-7 w-16 text-right ml-auto"
                        autoFocus
                        min={0}
                      />
                    ) : (
                      <span
                        className="cursor-text hover:bg-muted px-1.5 py-0.5 rounded text-sm"
                        onDoubleClick={() => onInlineUpdate && startEdit(item.id, 'quantity', item.quantity)}
                      >
                        {item.quantity} <span className="text-muted-foreground text-xs">{item.unit}</span>
                      </span>
                    )}
                  </TableCell>

                  {/* Unit Cost (inline editable) */}
                  <TableCell className="text-right hidden sm:table-cell" onClick={(e) => e.stopPropagation()}>
                    {editingCell?.id === item.id && editingCell.field === 'unit_cost' ? (
                      <Input
                        type="number"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onBlur={commitEdit}
                        onKeyDown={(e) => { if (e.key === 'Enter') commitEdit(); if (e.key === 'Escape') setEditingCell(null); }}
                        className="h-7 w-20 text-right ml-auto"
                        autoFocus
                        min={0}
                        step={0.01}
                      />
                    ) : (
                      <span
                        className="cursor-text hover:bg-muted px-1.5 py-0.5 rounded text-sm"
                        onDoubleClick={() => onInlineUpdate && startEdit(item.id, 'unit_cost', item.unit_cost)}
                      >
                        ${item.unit_cost.toFixed(2)}
                      </span>
                    )}
                  </TableCell>

                  {/* Total Value */}
                  <TableCell className="text-right font-medium hidden sm:table-cell">
                    ${(item.quantity * item.unit_cost).toFixed(2)}
                  </TableCell>

                  {/* Location */}
                  <TableCell className="text-muted-foreground hidden lg:table-cell">
                    {item.location || '—'}
                  </TableCell>

                  {/* Status */}
                  <TableCell>
                    <Badge variant="secondary" className={cn('text-xs font-medium', STATUS_COLORS[item.status])}>
                      {STATUS_LABELS[item.status] || item.status}
                    </Badge>
                  </TableCell>

                  {/* Condition */}
                  <TableCell className="text-muted-foreground text-sm hidden lg:table-cell">
                    {CONDITION_LABELS[item.condition] || item.condition}
                  </TableCell>

                  {/* Actions */}
                  <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-1">
                      {onAnalyze && item.primary_image_url && (
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => onAnalyze(item)}
                          title="AI Analyze"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => onEdit(item)}
                        title="Edit"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => onDelete(item)}
                        title="Delete"
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
          <TableFooter>
            <TableRow>
              <TableCell />
              <TableCell colSpan={3} className="font-medium">
                {items.length} items
              </TableCell>
              <TableCell className="text-right font-medium">{totals.totalItems}</TableCell>
              <TableCell className="hidden sm:table-cell" />
              <TableCell className="text-right font-bold hidden sm:table-cell">
                ${totals.totalValue.toFixed(2)}
              </TableCell>
              <TableCell colSpan={4} />
            </TableRow>
          </TableFooter>
        </Table>
      </div>
    </div>
  );
}
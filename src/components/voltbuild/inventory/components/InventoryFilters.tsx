import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, Filter } from 'lucide-react';
import { InventoryCategory, InventoryFilters as Filters, InventoryItem } from '../types/inventory.types';
import { cn } from '@/lib/utils';

interface InventoryFiltersProps {
  filters: Filters;
  onFiltersChange: (filters: Filters) => void;
  categories: InventoryCategory[];
  locations: string[];
}

const STATUS_OPTIONS: { value: InventoryItem['status']; label: string }[] = [
  { value: 'in_stock', label: 'In Stock' },
  { value: 'low_stock', label: 'Low Stock' },
  { value: 'out_of_stock', label: 'Out of Stock' },
  { value: 'on_order', label: 'On Order' },
  { value: 'discontinued', label: 'Discontinued' },
];

export function InventoryFiltersComponent({
  filters,
  onFiltersChange,
  categories,
  locations,
}: InventoryFiltersProps) {
  const activeFilterCount = [
    filters.categoryId,
    filters.status,
    filters.location,
    filters.lowStockOnly,
    filters.expiringOnly,
  ].filter(Boolean).length;

  const handleClear = () => {
    onFiltersChange({
      search: filters.search,
    });
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        {/* Category Filter */}
        <Select
          value={filters.categoryId || 'all'}
          onValueChange={(value) =>
            onFiltersChange({
              ...filters,
              categoryId: value === 'all' ? undefined : value,
            })
          }
        >
          <SelectTrigger className="w-[160px] h-9">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat.id} value={cat.id}>
                <div className="flex items-center gap-2">
                  {cat.color && (
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: cat.color }}
                    />
                  )}
                  {cat.name}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Status Filter */}
        <Select
          value={filters.status || 'all'}
          onValueChange={(value) =>
            onFiltersChange({
              ...filters,
              status: value === 'all' ? undefined : (value as InventoryItem['status']),
            })
          }
        >
          <SelectTrigger className="w-[140px] h-9">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            {STATUS_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Location Filter */}
        {locations.length > 0 && (
          <Select
            value={filters.location || 'all'}
            onValueChange={(value) =>
              onFiltersChange({
                ...filters,
                location: value === 'all' ? undefined : value,
              })
            }
          >
            <SelectTrigger className="w-[140px] h-9">
              <SelectValue placeholder="Location" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Locations</SelectItem>
              {locations.map((loc) => (
                <SelectItem key={loc} value={loc}>
                  {loc}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {/* Quick Filters */}
        <Button
          variant={filters.lowStockOnly ? 'default' : 'outline'}
          size="sm"
          className="h-9"
          onClick={() =>
            onFiltersChange({
              ...filters,
              lowStockOnly: !filters.lowStockOnly,
            })
          }
        >
          Low Stock
        </Button>

        <Button
          variant={filters.expiringOnly ? 'default' : 'outline'}
          size="sm"
          className="h-9"
          onClick={() =>
            onFiltersChange({
              ...filters,
              expiringOnly: !filters.expiringOnly,
            })
          }
        >
          Expiring Soon
        </Button>

        {/* Clear Filters */}
        {activeFilterCount > 0 && (
          <Button variant="ghost" size="sm" className="h-9" onClick={handleClear}>
            <X className="w-4 h-4 mr-1" />
            Clear ({activeFilterCount})
          </Button>
        )}
      </div>

      {/* Active Filters Display */}
      {activeFilterCount > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-muted-foreground">Active filters:</span>
          
          {filters.categoryId && (
            <Badge variant="secondary" className="gap-1">
              Category: {categories.find((c) => c.id === filters.categoryId)?.name}
              <X
                className="w-3 h-3 cursor-pointer"
                onClick={() => onFiltersChange({ ...filters, categoryId: undefined })}
              />
            </Badge>
          )}
          
          {filters.status && (
            <Badge variant="secondary" className="gap-1">
              Status: {STATUS_OPTIONS.find((s) => s.value === filters.status)?.label}
              <X
                className="w-3 h-3 cursor-pointer"
                onClick={() => onFiltersChange({ ...filters, status: undefined })}
              />
            </Badge>
          )}
          
          {filters.location && (
            <Badge variant="secondary" className="gap-1">
              Location: {filters.location}
              <X
                className="w-3 h-3 cursor-pointer"
                onClick={() => onFiltersChange({ ...filters, location: undefined })}
              />
            </Badge>
          )}
          
          {filters.lowStockOnly && (
            <Badge variant="secondary" className="gap-1">
              Low Stock Only
              <X
                className="w-3 h-3 cursor-pointer"
                onClick={() => onFiltersChange({ ...filters, lowStockOnly: false })}
              />
            </Badge>
          )}
          
          {filters.expiringOnly && (
            <Badge variant="secondary" className="gap-1">
              Expiring Only
              <X
                className="w-3 h-3 cursor-pointer"
                onClick={() => onFiltersChange({ ...filters, expiringOnly: false })}
              />
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}

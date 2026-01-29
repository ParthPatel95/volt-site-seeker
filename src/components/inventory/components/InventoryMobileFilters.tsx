import React from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Filter, X, Check } from 'lucide-react';
import { InventoryCategory, InventoryFilters, InventoryItem } from '../types/inventory.types';
import { cn } from '@/lib/utils';

interface InventoryMobileFiltersProps {
  filters: InventoryFilters;
  onFiltersChange: (filters: InventoryFilters) => void;
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

export function InventoryMobileFilters({
  filters,
  onFiltersChange,
  categories,
  locations,
}: InventoryMobileFiltersProps) {
  const [open, setOpen] = React.useState(false);

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

  const handleApply = () => {
    setOpen(false);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="h-10 gap-2">
          <Filter className="w-4 h-4" />
          Filters
          {activeFilterCount > 0 && (
            <Badge variant="secondary" className="h-5 min-w-5 px-1.5 text-xs">
              {activeFilterCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent side="bottom" className="h-[85vh] rounded-t-xl">
        <SheetHeader className="pb-4">
          <div className="flex items-center justify-between">
            <SheetTitle>Filters</SheetTitle>
            {activeFilterCount > 0 && (
              <Button variant="ghost" size="sm" onClick={handleClear}>
                Clear all
              </Button>
            )}
          </div>
        </SheetHeader>

        <div className="space-y-6 pb-24">
          {/* Category Filter */}
          <div className="space-y-3">
            <label className="text-sm font-medium">Category</label>
            <Select
              value={filters.categoryId || 'all'}
              onValueChange={(value) =>
                onFiltersChange({
                  ...filters,
                  categoryId: value === 'all' ? undefined : value,
                })
              }
            >
              <SelectTrigger className="w-full h-12">
                <SelectValue placeholder="All Categories" />
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
          </div>

          {/* Status Filter */}
          <div className="space-y-3">
            <label className="text-sm font-medium">Status</label>
            <Select
              value={filters.status || 'all'}
              onValueChange={(value) =>
                onFiltersChange({
                  ...filters,
                  status: value === 'all' ? undefined : (value as InventoryItem['status']),
                })
              }
            >
              <SelectTrigger className="w-full h-12">
                <SelectValue placeholder="All Status" />
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
          </div>

          {/* Location Filter */}
          {locations.length > 0 && (
            <div className="space-y-3">
              <label className="text-sm font-medium">Location</label>
              <Select
                value={filters.location || 'all'}
                onValueChange={(value) =>
                  onFiltersChange({
                    ...filters,
                    location: value === 'all' ? undefined : value,
                  })
                }
              >
                <SelectTrigger className="w-full h-12">
                  <SelectValue placeholder="All Locations" />
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
            </div>
          )}

          <Separator />

          {/* Quick Filters */}
          <div className="space-y-3">
            <label className="text-sm font-medium">Quick Filters</label>
            <div className="flex flex-col gap-2">
              <button
                onClick={() =>
                  onFiltersChange({
                    ...filters,
                    lowStockOnly: !filters.lowStockOnly,
                  })
                }
                className={cn(
                  "flex items-center justify-between p-4 rounded-lg border transition-colors",
                  filters.lowStockOnly 
                    ? "bg-primary/10 border-primary" 
                    : "bg-card hover:bg-muted"
                )}
              >
                <span className="font-medium">Low Stock Only</span>
                {filters.lowStockOnly && <Check className="w-5 h-5 text-primary" />}
              </button>

              <button
                onClick={() =>
                  onFiltersChange({
                    ...filters,
                    expiringOnly: !filters.expiringOnly,
                  })
                }
                className={cn(
                  "flex items-center justify-between p-4 rounded-lg border transition-colors",
                  filters.expiringOnly 
                    ? "bg-primary/10 border-primary" 
                    : "bg-card hover:bg-muted"
                )}
              >
                <span className="font-medium">Expiring Soon</span>
                {filters.expiringOnly && <Check className="w-5 h-5 text-primary" />}
              </button>
            </div>
          </div>
        </div>

        {/* Apply Button */}
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-background border-t pb-safe">
          <Button className="w-full h-12" onClick={handleApply}>
            Apply Filters
            {activeFilterCount > 0 && ` (${activeFilterCount})`}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

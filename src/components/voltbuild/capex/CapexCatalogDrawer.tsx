import React, { useState, useMemo } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search, Plus } from 'lucide-react';
import { useCapexCatalog } from './hooks/useCapexCatalog';
import { CapexCatalogItem, CapexCategory, CAPEX_CATEGORY_CONFIG } from '../types/voltbuild-advanced.types';

interface CapexCatalogDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectItem: (item: CapexCatalogItem) => void;
  onAddCustom: () => void;
}

export function CapexCatalogDrawer({
  open,
  onOpenChange,
  onSelectItem,
  onAddCustom,
}: CapexCatalogDrawerProps) {
  const { data: catalogItems, isLoading } = useCapexCatalog();
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<CapexCategory | 'All'>('All');

  const filteredItems = useMemo(() => {
    if (!catalogItems) return [];
    
    return catalogItems.filter(item => {
      const matchesSearch = search === '' || 
        item.item_name.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = selectedCategory === 'All' || 
        item.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [catalogItems, search, selectedCategory]);

  const categories: (CapexCategory | 'All')[] = ['All', 'Civil', 'Electrical', 'Mechanical', 'IT', 'Other'];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>CAPEX Catalog</SheetTitle>
        </SheetHeader>

        <div className="mt-4 space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search items..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <Button
                key={cat}
                variant={selectedCategory === cat ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory(cat)}
              >
                {cat}
              </Button>
            ))}
          </div>

          {/* Items List */}
          <ScrollArea className="h-[calc(100vh-280px)]">
            <div className="space-y-2 pr-4">
              {isLoading ? (
                <div className="text-center py-8 text-muted-foreground">
                  Loading catalog...
                </div>
              ) : filteredItems.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No items found
                </div>
              ) : (
                filteredItems.map((item) => {
                  const config = CAPEX_CATEGORY_CONFIG[item.category];
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        onSelectItem(item);
                        onOpenChange(false);
                      }}
                      className="w-full text-left p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="font-medium truncate">{item.item_name}</div>
                          <div className="text-sm text-muted-foreground mt-1">
                            {formatCurrency(item.default_unit_cost)} / {item.unit}
                          </div>
                        </div>
                        <Badge className={`${config.bgColor} ${config.color} border-0 shrink-0`}>
                          {item.category}
                        </Badge>
                      </div>
                      {item.source_note && (
                        <div className="text-xs text-muted-foreground mt-2">
                          Source: {item.source_note}
                        </div>
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </ScrollArea>

          {/* Add Custom Button */}
          <Button
            variant="outline"
            className="w-full"
            onClick={() => {
              onAddCustom();
              onOpenChange(false);
            }}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Custom Item
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

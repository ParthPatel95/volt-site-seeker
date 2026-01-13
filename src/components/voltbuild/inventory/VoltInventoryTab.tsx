import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2, Search, Plus, ScanBarcode, LayoutGrid, List } from 'lucide-react';
import { useInventoryItems } from './hooks/useInventoryItems';
import { useInventoryCategories } from './hooks/useInventoryCategories';
import { useInventoryStats } from './hooks/useInventoryStats';
import { InventoryDashboard } from './components/InventoryDashboard';
import { InventoryItemCard } from './components/InventoryItemCard';
import { InventoryAddDialog } from './components/InventoryAddDialog';
import { InventoryBarcodeScanner } from './components/InventoryBarcodeScanner';
import { InventoryItem, InventoryFilters } from './types/inventory.types';
import { toast } from 'sonner';

interface VoltInventoryTabProps {
  project: { id: string; name: string };
}

export function VoltInventoryTab({ project }: VoltInventoryTabProps) {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [initialBarcode, setInitialBarcode] = useState<string>('');

  const filters: InventoryFilters = {
    search: searchQuery || undefined,
  };

  const { items, isLoading, createItem, deleteItem, findByBarcode, isCreating } = useInventoryItems(project.id, filters);
  const { categories } = useInventoryCategories(project.id);
  const { stats, lowStockItems, expiringItems, outOfStockItems, isLoading: statsLoading } = useInventoryStats(project.id);

  const handleScan = async (barcode: string) => {
    const existingItem = await findByBarcode(barcode);
    
    if (existingItem) {
      setSelectedItem(existingItem);
      setShowScanner(false);
      toast.success(`Found: ${existingItem.name}`);
    } else {
      setInitialBarcode(barcode);
      setShowScanner(false);
      setShowAddDialog(true);
      toast.info('Item not found. Create a new entry.');
    }
  };

  const handleAddItem = (item: any) => {
    createItem(item);
    setShowAddDialog(false);
    setInitialBarcode('');
  };

  if (isLoading || statsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <TabsList>
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="items">Items ({items.length})</TabsTrigger>
            <TabsTrigger value="categories">Categories</TabsTrigger>
          </TabsList>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setShowScanner(true)}>
              <ScanBarcode className="w-4 h-4 mr-2" />
              Scan
            </Button>
            <Button size="sm" onClick={() => setShowAddDialog(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Item
            </Button>
          </div>
        </div>

        <TabsContent value="dashboard" className="mt-6">
          <InventoryDashboard
            stats={stats}
            lowStockItems={lowStockItems}
            expiringItems={expiringItems}
            outOfStockItems={outOfStockItems}
            onAddItem={() => setShowAddDialog(true)}
            onScan={() => setShowScanner(true)}
            onItemClick={setSelectedItem}
          />
        </TabsContent>

        <TabsContent value="items" className="mt-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex border rounded-lg">
              <Button
                variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                size="icon"
                className="h-9 w-9 rounded-r-none"
                onClick={() => setViewMode('grid')}
              >
                <LayoutGrid className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                size="icon"
                className="h-9 w-9 rounded-l-none"
                onClick={() => setViewMode('list')}
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {items.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">No inventory items yet</p>
              <Button onClick={() => setShowAddDialog(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add First Item
              </Button>
            </div>
          ) : (
            <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4' : 'space-y-3'}>
              {items.map(item => (
                <InventoryItemCard
                  key={item.id}
                  item={item}
                  onClick={() => setSelectedItem(item)}
                  onDelete={() => deleteItem(item.id)}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="categories" className="mt-6">
          <div className="text-center py-12 text-muted-foreground">
            Category management coming soon
          </div>
        </TabsContent>
      </Tabs>

      <InventoryAddDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        onSubmit={handleAddItem}
        categories={categories}
        projectId={project.id}
        isLoading={isCreating}
        initialBarcode={initialBarcode}
      />

      <InventoryBarcodeScanner
        open={showScanner}
        onOpenChange={setShowScanner}
        onScan={handleScan}
      />
    </div>
  );
}

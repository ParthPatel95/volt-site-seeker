import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Loader2, Search, Plus, ScanBarcode, LayoutGrid, List, Download, Settings, ChevronDown } from 'lucide-react';
import { useInventoryItems } from './hooks/useInventoryItems';
import { useInventoryCategories } from './hooks/useInventoryCategories';
import { useInventoryStats } from './hooks/useInventoryStats';
import { useIsMobile } from '@/hooks/use-mobile';
import { InventoryDashboard } from './components/InventoryDashboard';
import { InventoryItemCard } from './components/InventoryItemCard';
import { InventoryAddDialog } from './components/InventoryAddDialog';
import { InventoryEditDialog } from './components/InventoryEditDialog';
import { InventoryItemDetail } from './components/InventoryItemDetail';
import { InventoryBarcodeScanner } from './components/InventoryBarcodeScanner';
import { InventoryCategoryManager } from './components/InventoryCategoryManager';
import { InventoryFiltersComponent } from './components/InventoryFilters';
import { InventoryMobileFilters } from './components/InventoryMobileFilters';
import { InventoryTransactionsTab } from './components/InventoryTransactionsTab';
import { InventoryAlertsTab } from './components/InventoryAlertsTab';
import { InventoryExport } from './components/InventoryExport';
import { InventoryAdjustDialog } from './components/InventoryAdjustDialog';
import { InventoryScannerSettings, ScannerSettings, defaultScannerSettings } from './components/InventoryScannerSettings';
import { InventoryFAB } from './components/InventoryFAB';
import { InventoryGroupManager } from './components/InventoryGroupManager';
import { useHardwareBarcodeScanner } from './hooks/useHardwareBarcodeScanner';
import { InventoryItem, InventoryFilters } from './types/inventory.types';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface VoltInventoryTabProps {
  project: { id: string; name: string };
}

const TAB_OPTIONS = [
  { value: 'dashboard', label: 'Dashboard' },
  { value: 'items', label: 'Items' },
  { value: 'groups', label: 'Groups' },
  { value: 'transactions', label: 'Transactions' },
  { value: 'alerts', label: 'Alerts' },
  { value: 'categories', label: 'Categories' },
];

export function VoltInventoryTab({ project }: VoltInventoryTabProps) {
  const isMobile = useIsMobile();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDetailSheet, setShowDetailSheet] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [showAdjustDialog, setShowAdjustDialog] = useState<'in' | 'out' | null>(null);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [initialBarcode, setInitialBarcode] = useState<string>('');
  const [filters, setFilters] = useState<InventoryFilters>({});
  const [showScannerSettings, setShowScannerSettings] = useState(false);
  const [scannerSettings, setScannerSettings] = useState<ScannerSettings>(() => {
    const saved = localStorage.getItem('inventory-scanner-settings');
    return saved ? JSON.parse(saved) : defaultScannerSettings;
  });

  // Persist scanner settings to localStorage
  useEffect(() => {
    localStorage.setItem('inventory-scanner-settings', JSON.stringify(scannerSettings));
  }, [scannerSettings]);

  const filtersWithSearch: InventoryFilters = {
    ...filters,
    search: searchQuery || undefined,
  };

  const { 
    items, 
    isLoading, 
    createItem, 
    updateItem,
    deleteItem, 
    adjustQuantity,
    findByBarcode, 
    isCreating,
    isUpdating,
    isDeleting,
    isAdjusting,
  } = useInventoryItems(project.id, filtersWithSearch);
  
  const { categories } = useInventoryCategories(project.id);
  const { stats, lowStockItems, expiringItems, outOfStockItems, isLoading: statsLoading } = useInventoryStats(project.id);

  // Hardware barcode scanner handler
  const handleHardwareScan = useCallback(async (barcode: string) => {
    toast.info(`Scanned: ${barcode}`);
    
    const existingItem = await findByBarcode(barcode);
    
    if (existingItem) {
      setSelectedItem(existingItem);
      setShowDetailSheet(true);
      toast.success(`Found: ${existingItem.name}`);
    } else {
      setInitialBarcode(barcode);
      setShowAddDialog(true);
      toast.info('Item not found. Create a new entry.');
    }
  }, [findByBarcode]);

  // Hardware barcode scanner hook
  const { isListening, lastScan } = useHardwareBarcodeScanner({
    enabled: scannerSettings.enabled && !showScanner && !showAddDialog && !showEditDialog,
    maxKeystrokeDelay: scannerSettings.maxKeystrokeDelay,
    minBarcodeLength: scannerSettings.minBarcodeLength,
    terminatorKey: scannerSettings.terminatorKey,
    audioFeedback: scannerSettings.audioFeedback,
    onScan: handleHardwareScan,
  });

  // Extract unique locations for filters
  const locations = useMemo(() => {
    const locs = items
      .map((item) => item.location)
      .filter((loc): loc is string => !!loc);
    return [...new Set(locs)];
  }, [items]);

  // Calculate total alerts
  const totalAlerts = lowStockItems.length + outOfStockItems.length + expiringItems.length;

  const handleScan = async (barcode: string) => {
    const existingItem = await findByBarcode(barcode);
    
    if (existingItem) {
      setSelectedItem(existingItem);
      setShowScanner(false);
      setShowDetailSheet(true);
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

  const handleUpdateItem = (updates: Partial<InventoryItem>) => {
    if (selectedItem) {
      updateItem({ id: selectedItem.id, ...updates });
      setShowEditDialog(false);
    }
  };

  const handleDeleteItem = () => {
    if (selectedItem) {
      deleteItem(selectedItem.id);
      setShowDeleteConfirm(false);
      setShowDetailSheet(false);
      setSelectedItem(null);
    }
  };

  const handleAdjustQuantity = (type: 'in' | 'out', quantity: number, reason?: string) => {
    if (selectedItem) {
      adjustQuantity({
        itemId: selectedItem.id,
        quantityChange: quantity,
        type: type === 'in' ? 'in' : 'out',
        reason,
      });
    }
  };

  const handleAdjustFromDialog = (quantity: number, reason?: string) => {
    if (selectedItem && showAdjustDialog) {
      adjustQuantity({
        itemId: selectedItem.id,
        quantityChange: quantity,
        type: showAdjustDialog,
        reason,
      });
      setShowAdjustDialog(null);
    }
  };

  const handleItemClick = (item: InventoryItem) => {
    setSelectedItem(item);
    setShowDetailSheet(true);
  };

  const handleAddStockFromAlert = (item: InventoryItem) => {
    setSelectedItem(item);
    setShowAdjustDialog('in');
  };

  if (isLoading || statsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 pb-24 sm:pb-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        {/* Header Section - Mobile Optimized */}
        <div className="flex flex-col gap-4">
          {/* Tab Navigation */}
          {isMobile ? (
            // Mobile: Dropdown selector for tabs
            <div className="flex items-center justify-between gap-3">
              <Select value={activeTab} onValueChange={setActiveTab}>
                <SelectTrigger className="w-[180px] h-10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TAB_OPTIONS.map((tab) => (
                    <SelectItem key={tab.value} value={tab.value}>
                      <div className="flex items-center gap-2">
                        {tab.label}
                        {tab.value === 'items' && (
                          <Badge variant="secondary" className="ml-1 h-5 px-1.5">
                            {items.length}
                          </Badge>
                        )}
                        {tab.value === 'alerts' && totalAlerts > 0 && (
                          <Badge variant="destructive" className="ml-1 h-5 px-1.5">
                            {totalAlerts}
                          </Badge>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Scanner Status & Settings */}
              <div className="flex items-center gap-2">
                {scannerSettings.enabled && (
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <div className={`w-2 h-2 rounded-full ${isListening ? 'bg-green-500 animate-pulse' : 'bg-muted-foreground'}`} />
                  </div>
                )}
                <Button variant="ghost" size="icon" className="h-10 w-10" onClick={() => setShowScannerSettings(true)}>
                  <Settings className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ) : (
            // Desktop: Full TabsList
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <TabsList>
                <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
                <TabsTrigger value="items">Items ({items.length})</TabsTrigger>
                <TabsTrigger value="groups">Groups</TabsTrigger>
                <TabsTrigger value="transactions">Transactions</TabsTrigger>
                <TabsTrigger value="alerts" className="relative">
                  Alerts
                  {totalAlerts > 0 && (
                    <Badge 
                      variant="destructive" 
                      className="ml-1.5 h-5 min-w-5 px-1.5"
                    >
                      {totalAlerts}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="categories">Categories</TabsTrigger>
              </TabsList>

              <div className="flex items-center gap-2">
                {/* Scanner Status Indicator */}
                {scannerSettings.enabled && (
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground px-2">
                    <div className={`w-2 h-2 rounded-full ${isListening ? 'bg-green-500 animate-pulse' : 'bg-muted-foreground'}`} />
                    <span className="hidden sm:inline">Scanner {isListening ? 'Active' : 'Ready'}</span>
                  </div>
                )}
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setShowScannerSettings(true)}>
                  <Settings className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={() => setShowExport(true)}>
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
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
          )}
        </div>

        <TabsContent value="dashboard" className="mt-4 sm:mt-6">
          <InventoryDashboard
            stats={stats}
            lowStockItems={lowStockItems}
            expiringItems={expiringItems}
            outOfStockItems={outOfStockItems}
            onAddItem={() => setShowAddDialog(true)}
            onScan={() => setShowScanner(true)}
            onItemClick={handleItemClick}
          />
        </TabsContent>

        <TabsContent value="items" className="mt-4 sm:mt-6 space-y-4">
          <div className="flex flex-col gap-4">
            {/* Search and View Toggle */}
            <div className="flex items-center gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search items..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={cn("pl-9", isMobile ? "h-10" : "h-9")}
                />
              </div>
              
              {/* Mobile: Filter Sheet, Desktop: View Toggle */}
              {isMobile ? (
                <InventoryMobileFilters
                  filters={filters}
                  onFiltersChange={setFilters}
                  categories={categories}
                  locations={locations}
                />
              ) : (
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
              )}
            </div>

            {/* Desktop Filters */}
            {!isMobile && (
              <InventoryFiltersComponent
                filters={filters}
                onFiltersChange={setFilters}
                categories={categories}
                locations={locations}
              />
            )}
          </div>

          {items.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">
                {searchQuery || Object.keys(filters).length > 1
                  ? 'No items match your filters'
                  : 'No inventory items yet'}
              </p>
              {!searchQuery && Object.keys(filters).length <= 1 && (
                <Button onClick={() => setShowAddDialog(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add First Item
                </Button>
              )}
            </div>
          ) : (
            <div className={cn(
              isMobile 
                ? 'space-y-3' 
                : viewMode === 'grid' 
                  ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4' 
                  : 'space-y-3'
            )}>
              {items.map(item => (
                <InventoryItemCard
                  key={item.id}
                  item={item}
                  onClick={() => handleItemClick(item)}
                  onEdit={() => {
                    setSelectedItem(item);
                    setShowEditDialog(true);
                  }}
                  onDelete={() => {
                    setSelectedItem(item);
                    setShowDeleteConfirm(true);
                  }}
                  onAdjust={(type) => {
                    setSelectedItem(item);
                    setShowDetailSheet(true);
                  }}
                  isMobile={isMobile}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="transactions" className="mt-4 sm:mt-6">
          <InventoryTransactionsTab
            projectId={project.id}
            onItemClick={handleItemClick}
          />
        </TabsContent>

        <TabsContent value="alerts" className="mt-4 sm:mt-6">
          <InventoryAlertsTab
            lowStockItems={lowStockItems}
            outOfStockItems={outOfStockItems}
            expiringItems={expiringItems}
            onItemClick={handleItemClick}
            onAddStock={handleAddStockFromAlert}
          />
        </TabsContent>

        <TabsContent value="categories" className="mt-4 sm:mt-6">
          <InventoryCategoryManager
            projectId={project.id}
            categories={categories}
          />
        </TabsContent>
      </Tabs>

      {/* Mobile FAB */}
      {isMobile && (
        <InventoryFAB
          onAdd={() => setShowAddDialog(true)}
          onScan={() => setShowScanner(true)}
          onSmartScan={() => setShowAddDialog(true)}
        />
      )}

      <InventoryAddDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        onSubmit={handleAddItem}
        categories={categories}
        projectId={project.id}
        isLoading={isCreating}
        initialBarcode={initialBarcode}
      />

      <InventoryEditDialog
        item={selectedItem}
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        onSubmit={handleUpdateItem}
        categories={categories}
        isLoading={isUpdating}
      />

      <InventoryItemDetail
        item={selectedItem}
        open={showDetailSheet}
        onOpenChange={setShowDetailSheet}
        onEdit={() => {
          setShowDetailSheet(false);
          setShowEditDialog(true);
        }}
        onDelete={() => {
          setShowDetailSheet(false);
          setShowDeleteConfirm(true);
        }}
        onAdjust={handleAdjustQuantity}
      />

      <InventoryBarcodeScanner
        open={showScanner}
        onOpenChange={setShowScanner}
        onScan={handleScan}
      />

      <InventoryExport
        open={showExport}
        onOpenChange={setShowExport}
        items={items}
        projectName={project.name}
      />

      {selectedItem && showAdjustDialog && (
        <InventoryAdjustDialog
          open={showAdjustDialog !== null}
          onOpenChange={(open) => !open && setShowAdjustDialog(null)}
          type={showAdjustDialog}
          itemName={selectedItem.name}
          currentQuantity={selectedItem.quantity}
          unit={selectedItem.unit}
          onSubmit={handleAdjustFromDialog}
        />
      )}

      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Item</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{selectedItem?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteItem}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <InventoryScannerSettings
        open={showScannerSettings}
        onOpenChange={setShowScannerSettings}
        settings={scannerSettings}
        onSettingsChange={setScannerSettings}
        isConnected={isListening}
        lastScan={lastScan}
      />
    </div>
  );
}

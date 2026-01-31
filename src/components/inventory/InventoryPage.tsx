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
import { Loader2, Search, Plus, ScanBarcode, LayoutGrid, List, Download, Settings, Package } from 'lucide-react';
import { useInventoryItems } from './hooks/useInventoryItems';
import { useInventoryCategories } from './hooks/useInventoryCategories';
import { useInventoryStats } from './hooks/useInventoryStats';
import { useInventoryWorkspaces } from './hooks/useInventoryWorkspaces';
import { useAllMetalPrices } from './hooks/useAllMetalPrices';
import { useIsMobile } from '@/hooks/use-mobile';
import { InventoryDashboard } from './components/InventoryDashboard';
import { InventoryMobileDashboard } from './components/InventoryMobileDashboard';
import { InventoryItemCard } from './components/InventoryItemCard';
import { InventorySwipeableCard } from './components/InventorySwipeableCard';
import { InventoryEmptyState } from './components/InventoryEmptyState';
import { InventoryBottomNav, InventoryTab } from './components/InventoryBottomNav';
import { InventoryMobileHeader } from './components/InventoryMobileHeader';
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
import { InventoryGroupManager } from './components/InventoryGroupManager';
import { MetalsMarketTicker } from './components/MetalsMarketTicker';
import { useHardwareBarcodeScanner } from './hooks/useHardwareBarcodeScanner';
import { InventoryItem, InventoryFilters } from './types/inventory.types';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { CreateWorkspaceDialog } from './components/CreateWorkspaceDialog';
import { motion, AnimatePresence } from 'framer-motion';

const TAB_OPTIONS = [
  { value: 'dashboard', label: 'Dashboard' },
  { value: 'items', label: 'Items' },
  { value: 'groups', label: 'Groups' },
  { value: 'transactions', label: 'Transactions' },
  { value: 'alerts', label: 'Alerts' },
  { value: 'categories', label: 'Categories' },
];

export function InventoryPage() {
  const isMobile = useIsMobile();
  const [activeTab, setActiveTab] = useState<InventoryTab>('dashboard');
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
  const [showCreateWorkspace, setShowCreateWorkspace] = useState(false);
  const [scannerSettings, setScannerSettings] = useState<ScannerSettings>(() => {
    const saved = localStorage.getItem('inventory-scanner-settings');
    return saved ? JSON.parse(saved) : defaultScannerSettings;
  });

  // Workspace management
  const { workspaces, isLoading: workspacesLoading, createWorkspace, isCreating: isCreatingWorkspace } = useInventoryWorkspaces();
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState<string | null>(null);

  // Auto-select first workspace or show create dialog
  useEffect(() => {
    if (!workspacesLoading && workspaces.length > 0 && !selectedWorkspaceId) {
      setSelectedWorkspaceId(workspaces[0].id);
    }
  }, [workspaces, workspacesLoading, selectedWorkspaceId]);

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
    createMultipleItems,
    updateItem,
    deleteItem, 
    adjustQuantity,
    findByBarcode, 
    isCreating,
    isCreatingMultiple,
    isUpdating,
    isDeleting,
    isAdjusting,
  } = useInventoryItems(selectedWorkspaceId, filtersWithSearch);
  
  const { categories } = useInventoryCategories(selectedWorkspaceId);
  const { stats, lowStockItems, expiringItems, outOfStockItems, isLoading: statsLoading } = useInventoryStats(selectedWorkspaceId);
  
  // Metal prices for ticker
  const { metals, isLoading: metalsLoading, source: metalsSource, lastUpdated: metalsLastUpdated, refetch: refetchMetals, isRefetching: isRefetchingMetals } = useAllMetalPrices();

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

  const handleBatchAddItems = (items: any[]) => {
    createMultipleItems(items);
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

  const handleCreateWorkspace = (data: { name: string; description?: string }) => {
    createWorkspace(data);
    setShowCreateWorkspace(false);
  };

  const handleMobileTabChange = (tab: InventoryTab) => {
    if (tab === 'scan') {
      setShowScanner(true);
    } else {
      setActiveTab(tab);
    }
  };

  // Show workspace selector or create prompt if no workspaces
  if (workspacesLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (workspaces.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center px-4">
        <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-6">
          <Package className="w-10 h-10 text-primary" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Welcome to Inventory</h2>
        <p className="text-muted-foreground mb-6 max-w-md">
          Create your first workspace to start managing inventory items, categories, and groups.
        </p>
        <Button size="lg" onClick={() => setShowCreateWorkspace(true)}>
          <Plus className="w-5 h-5 mr-2" />
          Create Workspace
        </Button>
        
        <CreateWorkspaceDialog
          open={showCreateWorkspace}
          onOpenChange={setShowCreateWorkspace}
          onSubmit={handleCreateWorkspace}
          isLoading={isCreatingWorkspace}
        />
      </div>
    );
  }

  if (!selectedWorkspaceId) {
    return null;
  }

  const selectedWorkspace = workspaces.find(w => w.id === selectedWorkspaceId);

  if (isLoading || statsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Mobile Layout
  if (isMobile) {
    return (
      <div className="pb-24">
        {/* Mobile Header */}
        <InventoryMobileHeader
          workspaces={workspaces}
          selectedWorkspaceId={selectedWorkspaceId}
          onWorkspaceChange={setSelectedWorkspaceId}
          onCreateWorkspace={() => setShowCreateWorkspace(true)}
          onSettings={() => setShowScannerSettings(true)}
          scannerActive={scannerSettings.enabled && isListening}
        />

        {/* Mobile Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 'dashboard' && (
              <InventoryMobileDashboard
                stats={stats}
                lowStockItems={lowStockItems}
                expiringItems={expiringItems}
                outOfStockItems={outOfStockItems}
                onAddItem={() => setShowAddDialog(true)}
                onScan={() => setShowScanner(true)}
                onItemClick={handleItemClick}
                onViewAlerts={() => setActiveTab('alerts')}
              />
            )}

            {activeTab === 'items' && (
              <div className="space-y-4">
                {/* Search & Filters */}
                <div className="flex items-center gap-3">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Search items..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9 h-11 bg-background"
                    />
                  </div>
                  <InventoryMobileFilters
                    filters={filters}
                    onFiltersChange={setFilters}
                    categories={categories}
                    locations={locations}
                  />
                </div>

                {/* Items List */}
                {items.length === 0 ? (
                  <InventoryEmptyState
                    type={searchQuery || Object.keys(filters).length > 0 ? 'no-results' : 'no-items'}
                    onAddItem={() => setShowAddDialog(true)}
                    onScan={() => setShowScanner(true)}
                    searchQuery={searchQuery}
                  />
                ) : (
                  <div className="space-y-3">
                    {items.map(item => (
                      <InventorySwipeableCard
                        key={item.id}
                        item={item}
                        onClick={() => handleItemClick(item)}
                        onAddStock={() => {
                          setSelectedItem(item);
                          setShowAdjustDialog('in');
                        }}
                        onRemoveStock={() => {
                          setSelectedItem(item);
                          setShowAdjustDialog('out');
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'groups' && (
              <InventoryGroupManager workspaceId={selectedWorkspaceId} />
            )}

            {activeTab === 'transactions' && (
              <InventoryTransactionsTab
                workspaceId={selectedWorkspaceId}
                onItemClick={handleItemClick}
              />
            )}

            {activeTab === 'alerts' && (
              <InventoryAlertsTab
                lowStockItems={lowStockItems}
                outOfStockItems={outOfStockItems}
                expiringItems={expiringItems}
                onItemClick={handleItemClick}
                onAddStock={handleAddStockFromAlert}
              />
            )}

            {activeTab === 'categories' && (
              <InventoryCategoryManager
                workspaceId={selectedWorkspaceId}
                categories={categories}
              />
            )}
          </motion.div>
        </AnimatePresence>

        {/* Bottom Navigation */}
        <InventoryBottomNav
          activeTab={activeTab}
          onTabChange={handleMobileTabChange}
          alertsCount={totalAlerts}
          itemsCount={items.length}
          onScan={() => setShowScanner(true)}
        />

        {/* Dialogs */}
        <InventoryAddDialog
          open={showAddDialog}
          onOpenChange={setShowAddDialog}
          onSubmit={handleAddItem}
          onBatchSubmit={handleBatchAddItems}
          isLoading={isCreating || isCreatingMultiple}
          workspaceId={selectedWorkspaceId}
          categories={categories}
          initialBarcode={initialBarcode}
        />

        {selectedItem && (
          <>
            <InventoryEditDialog
              open={showEditDialog}
              onOpenChange={setShowEditDialog}
              item={selectedItem}
              onSubmit={handleUpdateItem}
              isLoading={isUpdating}
              categories={categories}
            />

            <InventoryItemDetail
              item={selectedItem}
              open={showDetailSheet}
              onOpenChange={setShowDetailSheet}
              onEdit={() => {
                setShowDetailSheet(false);
                setShowEditDialog(true);
              }}
              onDelete={() => setShowDeleteConfirm(true)}
              onAdjust={handleAdjustQuantity}
            />
          </>
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
                {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Delete'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {showAdjustDialog && selectedItem && (
          <InventoryAdjustDialog
            open={!!showAdjustDialog}
            onOpenChange={() => setShowAdjustDialog(null)}
            type={showAdjustDialog}
            itemName={selectedItem.name}
            currentQuantity={selectedItem.quantity}
            unit={selectedItem.unit || 'units'}
            onSubmit={handleAdjustFromDialog}
            isLoading={isAdjusting}
          />
        )}

        <InventoryBarcodeScanner
          open={showScanner}
          onOpenChange={setShowScanner}
          onScan={handleScan}
        />

        <InventoryScannerSettings
          open={showScannerSettings}
          onOpenChange={setShowScannerSettings}
          settings={scannerSettings}
          onSettingsChange={setScannerSettings}
          isConnected={isListening}
          lastScan={lastScan}
        />

        <CreateWorkspaceDialog
          open={showCreateWorkspace}
          onOpenChange={setShowCreateWorkspace}
          onSubmit={handleCreateWorkspace}
          isLoading={isCreatingWorkspace}
        />
      </div>
    );
  }

  // Desktop Layout
  return (
    <div className="space-y-4 sm:space-y-6 pb-6">
      {/* Live Metals Ticker */}
      <MetalsMarketTicker
        metals={metals}
        isLoading={metalsLoading}
        source={metalsSource}
        lastUpdated={metalsLastUpdated}
        onRefresh={refetchMetals}
        isRefreshing={isRefetchingMetals}
      />

      {/* Workspace Selector Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Select value={selectedWorkspaceId} onValueChange={setSelectedWorkspaceId}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select workspace" />
            </SelectTrigger>
            <SelectContent>
              {workspaces.map(ws => (
                <SelectItem key={ws.id} value={ws.id}>
                  {ws.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon" onClick={() => setShowCreateWorkspace(true)}>
            <Plus className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as InventoryTab)}>
        {/* Header Section */}
        <div className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <TabsList className="h-10">
              <TabsTrigger value="dashboard" className="px-4">Dashboard</TabsTrigger>
              <TabsTrigger value="items" className="px-4">
                Items
                <Badge variant="secondary" className="ml-1.5 h-5 px-1.5 text-xs">
                  {items.length}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="groups" className="px-4">Groups</TabsTrigger>
              <TabsTrigger value="transactions" className="px-4">Transactions</TabsTrigger>
              <TabsTrigger value="alerts" className="px-4 relative">
                Alerts
                {totalAlerts > 0 && (
                  <Badge variant="destructive" className="ml-1.5 h-5 min-w-5 px-1.5 text-xs">
                    {totalAlerts}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="categories" className="px-4">Categories</TabsTrigger>
            </TabsList>

            <div className="flex items-center gap-2">
              {scannerSettings.enabled && (
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground px-2 py-1 rounded-md bg-muted/50">
                  <div className={cn(
                    "w-2 h-2 rounded-full",
                    isListening ? "bg-emerald-500 animate-pulse" : "bg-muted-foreground"
                  )} />
                  <span>{isListening ? 'Scanner Active' : 'Scanner Ready'}</span>
                </div>
              )}
              <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => setShowScannerSettings(true)}>
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
            <div className="flex items-center gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search items..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 h-9 bg-background"
                />
              </div>
              
              <div className="flex border rounded-lg border-border">
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

            <InventoryFiltersComponent
              filters={filters}
              onFiltersChange={setFilters}
              categories={categories}
              locations={locations}
            />
          </div>

          {items.length === 0 ? (
            <InventoryEmptyState
              type={searchQuery || Object.keys(filters).length > 0 ? 'no-results' : 'no-items'}
              onAddItem={() => setShowAddDialog(true)}
              onScan={() => setShowScanner(true)}
              searchQuery={searchQuery}
            />
          ) : (
            <div className={cn(
              viewMode === 'grid' 
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
                    setShowAdjustDialog(type);
                  }}
                  isMobile={false}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="groups" className="mt-4 sm:mt-6">
          <InventoryGroupManager workspaceId={selectedWorkspaceId} />
        </TabsContent>

        <TabsContent value="transactions" className="mt-4 sm:mt-6">
          <InventoryTransactionsTab
            workspaceId={selectedWorkspaceId}
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
            workspaceId={selectedWorkspaceId}
            categories={categories}
          />
        </TabsContent>
      </Tabs>

      {/* Add Item Dialog */}
      <InventoryAddDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        onSubmit={handleAddItem}
        onBatchSubmit={handleBatchAddItems}
        isLoading={isCreating || isCreatingMultiple}
        workspaceId={selectedWorkspaceId}
        categories={categories}
        initialBarcode={initialBarcode}
      />

      {/* Edit Item Dialog */}
      {selectedItem && (
        <InventoryEditDialog
          open={showEditDialog}
          onOpenChange={setShowEditDialog}
          item={selectedItem}
          onSubmit={handleUpdateItem}
          isLoading={isUpdating}
          categories={categories}
        />
      )}

      {/* Item Detail Sheet */}
      {selectedItem && (
        <InventoryItemDetail
          item={selectedItem}
          open={showDetailSheet}
          onOpenChange={setShowDetailSheet}
          onEdit={() => {
            setShowDetailSheet(false);
            setShowEditDialog(true);
          }}
          onDelete={() => {
            setShowDeleteConfirm(true);
          }}
          onAdjust={handleAdjustQuantity}
        />
      )}

      {/* Delete Confirmation */}
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
              {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Adjust Quantity Dialog */}
      {showAdjustDialog && selectedItem && (
        <InventoryAdjustDialog
          open={!!showAdjustDialog}
          onOpenChange={() => setShowAdjustDialog(null)}
          type={showAdjustDialog}
          itemName={selectedItem.name}
          currentQuantity={selectedItem.quantity}
          unit={selectedItem.unit || 'units'}
          onSubmit={handleAdjustFromDialog}
          isLoading={isAdjusting}
        />
      )}

      {/* Barcode Scanner */}
      <InventoryBarcodeScanner
        open={showScanner}
        onOpenChange={setShowScanner}
        onScan={handleScan}
      />

      {/* Export Dialog */}
      <InventoryExport
        open={showExport}
        onOpenChange={setShowExport}
        items={items}
        projectName={selectedWorkspace?.name || 'Inventory'}
      />

      {/* Scanner Settings */}
      <InventoryScannerSettings
        open={showScannerSettings}
        onOpenChange={setShowScannerSettings}
        settings={scannerSettings}
        onSettingsChange={setScannerSettings}
        isConnected={isListening}
        lastScan={lastScan}
      />

      {/* Create Workspace Dialog */}
      <CreateWorkspaceDialog
        open={showCreateWorkspace}
        onOpenChange={setShowCreateWorkspace}
        onSubmit={handleCreateWorkspace}
        isLoading={isCreatingWorkspace}
      />
    </div>
  );
}

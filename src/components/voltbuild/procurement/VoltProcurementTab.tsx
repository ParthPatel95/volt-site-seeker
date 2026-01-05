import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Plus, Package, FileText, AlertTriangle, Filter, Truck, CheckCircle, Clock, Trash2 } from 'lucide-react';
import { useProcurementItems } from './hooks/useProcurementItems';
import { usePurchaseOrders } from './hooks/usePurchaseOrders';
import { 
  ProcurementItem, 
  PurchaseOrder,
  PROCUREMENT_CATEGORIES, 
  ProcurementCategory,
  ProcurementStatus,
  PROCUREMENT_STATUS_CONFIG,
  PURCHASE_ORDER_STATUS_CONFIG,
  PurchaseOrderStatus,
} from '../types/voltbuild-phase2.types';
import { VoltBuildProject } from '../types/voltbuild.types';
import { format, differenceInDays } from 'date-fns';

interface VoltProcurementTabProps {
  project: VoltBuildProject;
  phases: { id: string; name: string }[];
  leadTimeInputs?: { transformer_required?: boolean; switchgear_required?: boolean };
}

export function VoltProcurementTab({ project, phases, leadTimeInputs }: VoltProcurementTabProps) {
  const [activeTab, setActiveTab] = useState<'items' | 'orders'>('items');
  const [categoryFilter, setCategoryFilter] = useState<ProcurementCategory | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<ProcurementStatus | 'all'>('all');
  
  // Dialogs
  const [itemDialogOpen, setItemDialogOpen] = useState(false);
  const [poDialogOpen, setPODialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ProcurementItem | null>(null);
  const [itemDetailOpen, setItemDetailOpen] = useState(false);

  // Form states
  const [itemForm, setItemForm] = useState({
    category: 'Other' as ProcurementCategory,
    item_name: '',
    vendor: '',
    qty: '1',
    unit_cost: '',
    order_date: '',
    promised_ship_date: '',
    expected_delivery_date: '',
    linked_phase_id: '',
    notes: '',
  });

  const [poForm, setPOForm] = useState({
    po_number: '',
    vendor: '',
    amount: '',
    notes: '',
  });

  // Hooks
  const { 
    procurementItems, 
    createProcurementItem, 
    updateProcurementStatus,
    deleteProcurementItem,
    getStats, 
    getMissingCriticalItems,
    isCreating: isCreatingItem 
  } = useProcurementItems(project.id);
  
  const { 
    purchaseOrders, 
    createPurchaseOrder, 
    updatePurchaseOrderStatus,
    deletePurchaseOrder,
    generatePONumber,
    getTotalsByStatus,
    isCreating: isCreatingPO 
  } = usePurchaseOrders(project.id);

  const stats = getStats();
  const poTotals = getTotalsByStatus();
  const missingItems = getMissingCriticalItems(leadTimeInputs);

  const filteredItems = procurementItems.filter(item => {
    if (categoryFilter !== 'all' && item.category !== categoryFilter) return false;
    if (statusFilter !== 'all' && item.status !== statusFilter) return false;
    return true;
  });

  const handleCreateItem = () => {
    createProcurementItem({
      project_id: project.id,
      category: itemForm.category,
      item_name: itemForm.item_name,
      vendor: itemForm.vendor || null,
      qty: parseFloat(itemForm.qty) || 1,
      unit_cost: parseFloat(itemForm.unit_cost) || 0,
      order_date: itemForm.order_date || null,
      promised_ship_date: itemForm.promised_ship_date || null,
      expected_delivery_date: itemForm.expected_delivery_date || null,
      actual_delivery_date: null,
      status: 'planned',
      linked_phase_id: itemForm.linked_phase_id || null,
      linked_task_id: null,
      notes: itemForm.notes || null,
    });
    setItemDialogOpen(false);
    setItemForm({
      category: 'Other',
      item_name: '',
      vendor: '',
      qty: '1',
      unit_cost: '',
      order_date: '',
      promised_ship_date: '',
      expected_delivery_date: '',
      linked_phase_id: '',
      notes: '',
    });
  };

  const handleCreatePO = () => {
    createPurchaseOrder({
      project_id: project.id,
      po_number: poForm.po_number || generatePONumber(),
      vendor: poForm.vendor,
      amount: parseFloat(poForm.amount) || 0,
      currency: 'USD',
      po_doc_url: null,
      status: 'draft',
      notes: poForm.notes || null,
    });
    setPODialogOpen(false);
    setPOForm({ po_number: '', vendor: '', amount: '', notes: '' });
  };

  const getDeliveryStatus = (item: ProcurementItem) => {
    if (!item.expected_delivery_date) return null;
    const today = new Date();
    const delivery = new Date(item.expected_delivery_date);
    const days = differenceInDays(delivery, today);
    
    if (days < 0) return { text: `${Math.abs(days)} days overdue`, color: 'text-destructive' };
    if (days <= 7) return { text: `${days} days`, color: 'text-amber-500' };
    return { text: `${days} days`, color: 'text-muted-foreground' };
  };

  return (
    <div className="space-y-6">
      {/* Lead Time Risk Alerts */}
      {missingItems.length > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Long-Lead Items Required</AlertTitle>
          <AlertDescription>
            The following items are required but not yet ordered: {missingItems.join(', ')}
          </AlertDescription>
        </Alert>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">Total Items</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-blue-500">{stats.ordered}</div>
            <p className="text-xs text-muted-foreground">Ordered</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-amber-500">{stats.inTransit}</div>
            <p className="text-xs text-muted-foreground">In Transit</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-green-500">{stats.delivered}</div>
            <p className="text-xs text-muted-foreground">Delivered</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-destructive">{stats.delayed}</div>
            <p className="text-xs text-muted-foreground">Delayed</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
        <TabsList>
          <TabsTrigger value="items" className="gap-2">
            <Package className="w-4 h-4" />
            <span className="hidden sm:inline">Procurement Items</span>
          </TabsTrigger>
          <TabsTrigger value="orders" className="gap-2">
            <FileText className="w-4 h-4" />
            <span className="hidden sm:inline">Purchase Orders</span>
          </TabsTrigger>
        </TabsList>

        {/* Items Tab */}
        <TabsContent value="items" className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4 justify-between">
            <div className="flex flex-col sm:flex-row gap-2">
              <Select value={categoryFilter} onValueChange={(v) => setCategoryFilter(v as typeof categoryFilter)}>
                <SelectTrigger className="w-full sm:w-[150px]">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {PROCUREMENT_CATEGORIES.map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as typeof statusFilter)}>
                <SelectTrigger className="w-full sm:w-[150px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  {Object.entries(PROCUREMENT_STATUS_CONFIG).map(([key, config]) => (
                    <SelectItem key={key} value={key}>{config.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={() => setItemDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Item
            </Button>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Vendor</TableHead>
                  <TableHead className="text-right">Qty</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead>Delivery</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredItems.map(item => {
                  const deliveryStatus = getDeliveryStatus(item);
                  return (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.item_name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{item.category}</Badge>
                      </TableCell>
                      <TableCell>{item.vendor || '-'}</TableCell>
                      <TableCell className="text-right">{item.qty}</TableCell>
                      <TableCell className="text-right font-mono">
                        ${(item.total_cost || 0).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        {item.expected_delivery_date ? (
                          <div>
                            <p className="text-sm">{format(new Date(item.expected_delivery_date), 'MMM d, yyyy')}</p>
                            {deliveryStatus && (
                              <p className={`text-xs ${deliveryStatus.color}`}>{deliveryStatus.text}</p>
                            )}
                          </div>
                        ) : '-'}
                      </TableCell>
                      <TableCell>
                        <Select 
                          value={item.status} 
                          onValueChange={(v) => updateProcurementStatus(item.id, v as ProcurementStatus)}
                        >
                          <SelectTrigger className="h-8 w-[120px]">
                            <Badge variant={PROCUREMENT_STATUS_CONFIG[item.status].variant}>
                              {PROCUREMENT_STATUS_CONFIG[item.status].label}
                            </Badge>
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(PROCUREMENT_STATUS_CONFIG).map(([key, config]) => (
                              <SelectItem key={key} value={key}>{config.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => deleteProcurementItem(item.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {filteredItems.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      No procurement items found. Add items to track equipment and materials.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        {/* Purchase Orders Tab */}
        <TabsContent value="orders" className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="text-sm text-muted-foreground">
              Total PO Value: <span className="font-bold">${poTotals.total.toLocaleString()}</span>
            </div>
            <Button onClick={() => {
              setPOForm(f => ({ ...f, po_number: generatePONumber() }));
              setPODialogOpen(true);
            }}>
              <Plus className="w-4 h-4 mr-2" />
              New PO
            </Button>
          </div>

          <div className="space-y-4">
            {purchaseOrders.map(po => (
              <Card key={po.id}>
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{po.po_number}</CardTitle>
                      <CardDescription>{po.vendor}</CardDescription>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">${po.amount.toLocaleString()}</p>
                      <Select 
                        value={po.status} 
                        onValueChange={(v) => updatePurchaseOrderStatus(po.id, v as PurchaseOrderStatus)}
                      >
                        <SelectTrigger className="h-8 w-[100px] mt-1">
                          <Badge variant={PURCHASE_ORDER_STATUS_CONFIG[po.status].variant}>
                            {PURCHASE_ORDER_STATUS_CONFIG[po.status].label}
                          </Badge>
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(PURCHASE_ORDER_STATUS_CONFIG).map(([key, config]) => (
                            <SelectItem key={key} value={key}>{config.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">
                    Created: {format(new Date(po.created_at), 'MMM d, yyyy')}
                  </span>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => deletePurchaseOrder(po.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </CardContent>
              </Card>
            ))}
            {purchaseOrders.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No purchase orders yet. Create your first PO to track vendor orders.
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Add Item Dialog */}
      <Dialog open={itemDialogOpen} onOpenChange={setItemDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add Procurement Item</DialogTitle>
            <DialogDescription>Track a new equipment or material item.</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Item Name *</Label>
              <Input 
                value={itemForm.item_name}
                onChange={(e) => setItemForm(f => ({ ...f, item_name: e.target.value }))}
                placeholder="e.g., 2MW Transformer"
              />
            </div>
            <div className="space-y-2">
              <Label>Category *</Label>
              <Select 
                value={itemForm.category} 
                onValueChange={(v) => setItemForm(f => ({ ...f, category: v as ProcurementCategory }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PROCUREMENT_CATEGORIES.map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Vendor</Label>
              <Input 
                value={itemForm.vendor}
                onChange={(e) => setItemForm(f => ({ ...f, vendor: e.target.value }))}
                placeholder="Vendor name"
              />
            </div>
            <div className="space-y-2">
              <Label>Linked Phase</Label>
              <Select 
                value={itemForm.linked_phase_id} 
                onValueChange={(v) => setItemForm(f => ({ ...f, linked_phase_id: v }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select phase" />
                </SelectTrigger>
                <SelectContent>
                  {phases.map(phase => (
                    <SelectItem key={phase.id} value={phase.id}>{phase.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Quantity</Label>
              <Input 
                type="number"
                value={itemForm.qty}
                onChange={(e) => setItemForm(f => ({ ...f, qty: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Unit Cost (USD)</Label>
              <Input 
                type="number"
                value={itemForm.unit_cost}
                onChange={(e) => setItemForm(f => ({ ...f, unit_cost: e.target.value }))}
                placeholder="0.00"
              />
            </div>
            <div className="space-y-2">
              <Label>Order Date</Label>
              <Input 
                type="date"
                value={itemForm.order_date}
                onChange={(e) => setItemForm(f => ({ ...f, order_date: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Expected Delivery</Label>
              <Input 
                type="date"
                value={itemForm.expected_delivery_date}
                onChange={(e) => setItemForm(f => ({ ...f, expected_delivery_date: e.target.value }))}
              />
            </div>
            <div className="col-span-2 space-y-2">
              <Label>Notes</Label>
              <Textarea 
                value={itemForm.notes}
                onChange={(e) => setItemForm(f => ({ ...f, notes: e.target.value }))}
                placeholder="Additional notes..."
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setItemDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleCreateItem} disabled={!itemForm.item_name || isCreatingItem}>
              Add Item
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* New PO Dialog */}
      <Dialog open={poDialogOpen} onOpenChange={setPODialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New Purchase Order</DialogTitle>
            <DialogDescription>Create a new purchase order for tracking.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>PO Number</Label>
                <Input 
                  value={poForm.po_number}
                  onChange={(e) => setPOForm(f => ({ ...f, po_number: e.target.value }))}
                  placeholder="Auto-generated"
                />
              </div>
              <div className="space-y-2">
                <Label>Amount (USD) *</Label>
                <Input 
                  type="number"
                  value={poForm.amount}
                  onChange={(e) => setPOForm(f => ({ ...f, amount: e.target.value }))}
                  placeholder="0.00"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Vendor *</Label>
              <Input 
                value={poForm.vendor}
                onChange={(e) => setPOForm(f => ({ ...f, vendor: e.target.value }))}
                placeholder="Vendor name"
              />
            </div>
            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea 
                value={poForm.notes}
                onChange={(e) => setPOForm(f => ({ ...f, notes: e.target.value }))}
                placeholder="PO notes..."
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPODialogOpen(false)}>Cancel</Button>
            <Button onClick={handleCreatePO} disabled={!poForm.vendor || !poForm.amount || isCreatingPO}>
              Create PO
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, FileEdit, DollarSign, Clock, CheckCircle, XCircle, AlertTriangle, Trash2, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { useChangeOrders } from './hooks/useChangeOrders';
import { 
  ChangeOrder,
  ChangeOrderStatus,
  CHANGE_ORDER_STATUS_CONFIG,
} from '../types/voltbuild-phase2.types';
import { VoltBuildProject } from '../types/voltbuild.types';
import { format } from 'date-fns';

interface VoltChangeOrdersTabProps {
  project: VoltBuildProject;
  phases: { id: string; name: string }[];
}

export function VoltChangeOrdersTab({ project, phases }: VoltChangeOrdersTabProps) {
  const [statusFilter, setStatusFilter] = useState<ChangeOrderStatus | 'all'>('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [approvalDialogOpen, setApprovalDialogOpen] = useState(false);
  const [selectedCO, setSelectedCO] = useState<ChangeOrder | null>(null);
  const [approverName, setApproverName] = useState('');

  const [form, setForm] = useState({
    title: '',
    description: '',
    reason: '',
    requested_by: '',
    phase_id: '',
    cost_delta: '',
    schedule_delta_days: '',
  });

  const { 
    changeOrders, 
    createChangeOrder, 
    approveChangeOrder, 
    rejectChangeOrder,
    implementChangeOrder,
    deleteChangeOrder,
    getImpactSummary,
    filterByStatus,
    isCreating 
  } = useChangeOrders(project.id);

  const impact = getImpactSummary();
  const filteredOrders = statusFilter === 'all' ? changeOrders : filterByStatus(statusFilter);

  const handleCreate = () => {
    createChangeOrder({
      project_id: project.id,
      title: form.title,
      description: form.description || null,
      reason: form.reason || null,
      requested_by: form.requested_by || null,
      phase_id: form.phase_id || null,
      task_id: null,
      cost_delta: parseFloat(form.cost_delta) || 0,
      schedule_delta_days: parseInt(form.schedule_delta_days) || 0,
      status: 'draft',
      attachments: [],
      approved_by: null,
      approved_at: null,
      implemented_at: null,
    });
    setDialogOpen(false);
    setForm({
      title: '',
      description: '',
      reason: '',
      requested_by: '',
      phase_id: '',
      cost_delta: '',
      schedule_delta_days: '',
    });
  };

  const handleApprove = () => {
    if (!selectedCO) return;
    approveChangeOrder(selectedCO.id, approverName);
    setApprovalDialogOpen(false);
    setApproverName('');
  };

  const getCostDeltaDisplay = (delta: number) => {
    if (delta === 0) return { text: '$0', color: 'text-muted-foreground', icon: null };
    if (delta > 0) return { 
      text: `+$${delta.toLocaleString()}`, 
      color: 'text-destructive',
      icon: <ArrowUpRight className="w-3 h-3" />
    };
    return { 
      text: `-$${Math.abs(delta).toLocaleString()}`, 
      color: 'text-green-500',
      icon: <ArrowDownRight className="w-3 h-3" />
    };
  };

  const getScheduleDeltaDisplay = (delta: number) => {
    if (delta === 0) return { text: '0 days', color: 'text-muted-foreground' };
    if (delta > 0) return { text: `+${delta} days`, color: 'text-destructive' };
    return { text: `${delta} days`, color: 'text-green-500' };
  };

  return (
    <div className="space-y-6">
      {/* Impact Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold">{impact.totalChangeOrders}</div>
            <p className="text-xs text-muted-foreground">Total Change Orders</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-amber-500">{impact.pendingCount}</div>
            <p className="text-xs text-muted-foreground">Pending Approval</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className={`text-2xl font-bold ${impact.totalCostDelta >= 0 ? 'text-destructive' : 'text-green-500'}`}>
              {impact.totalCostDelta >= 0 ? '+' : ''}${impact.totalCostDelta.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Net Cost Impact</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className={`text-2xl font-bold ${impact.totalScheduleDelta >= 0 ? 'text-destructive' : 'text-green-500'}`}>
              {impact.totalScheduleDelta >= 0 ? '+' : ''}{impact.totalScheduleDelta} days
            </div>
            <p className="text-xs text-muted-foreground">Net Schedule Impact</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Actions */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <Tabs value={statusFilter} onValueChange={(v) => setStatusFilter(v as typeof statusFilter)}>
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="draft">Draft</TabsTrigger>
            <TabsTrigger value="submitted">Submitted</TabsTrigger>
            <TabsTrigger value="approved">Approved</TabsTrigger>
            <TabsTrigger value="rejected">Rejected</TabsTrigger>
          </TabsList>
        </Tabs>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          New Change Order
        </Button>
      </div>

      {/* Change Orders List */}
      <div className="space-y-4">
        {filteredOrders.map(co => {
          const costDisplay = getCostDeltaDisplay(co.cost_delta);
          const scheduleDisplay = getScheduleDeltaDisplay(co.schedule_delta_days);
          
          return (
            <Card key={co.id}>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{co.change_order_number}</Badge>
                      <CardTitle className="text-lg">{co.title}</CardTitle>
                    </div>
                    <CardDescription>
                      {co.requested_by && <span>Requested by {co.requested_by} • </span>}
                      {format(new Date(co.created_at), 'MMM d, yyyy')}
                    </CardDescription>
                  </div>
                  <Badge variant={CHANGE_ORDER_STATUS_CONFIG[co.status].variant}>
                    {CHANGE_ORDER_STATUS_CONFIG[co.status].label}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                {co.description && (
                  <p className="text-sm text-muted-foreground mb-4">{co.description}</p>
                )}
                
                <div className="flex flex-wrap gap-4 mb-4">
                  <div className="flex items-center gap-1">
                    <DollarSign className="w-4 h-4 text-muted-foreground" />
                    <span className={`font-mono ${costDisplay.color}`}>
                      {costDisplay.text}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <span className={`${scheduleDisplay.color}`}>
                      {scheduleDisplay.text}
                    </span>
                  </div>
                  {co.reason && (
                    <div className="flex items-center gap-1">
                      <AlertTriangle className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">{co.reason}</span>
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  {co.status === 'draft' && (
                    <Button 
                      size="sm"
                      onClick={() => {
                        // Submit for approval
                        setSelectedCO(co);
                        setApprovalDialogOpen(true);
                      }}
                    >
                      Submit for Approval
                    </Button>
                  )}
                  {co.status === 'submitted' && (
                    <>
                      <Button 
                        size="sm"
                        onClick={() => {
                          setSelectedCO(co);
                          setApprovalDialogOpen(true);
                        }}
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Approve
                      </Button>
                      <Button 
                        size="sm" 
                        variant="destructive"
                        onClick={() => rejectChangeOrder(co.id)}
                      >
                        <XCircle className="w-4 h-4 mr-2" />
                        Reject
                      </Button>
                    </>
                  )}
                  {co.status === 'approved' && (
                    <Button 
                      size="sm"
                      onClick={() => implementChangeOrder(co.id)}
                    >
                      Mark Implemented
                    </Button>
                  )}
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => deleteChangeOrder(co.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>

                {co.approved_at && (
                  <p className="text-xs text-muted-foreground mt-4">
                    Approved by {co.approved_by} on {format(new Date(co.approved_at), 'MMM d, yyyy')}
                  </p>
                )}
              </CardContent>
            </Card>
          );
        })}
        {filteredOrders.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            No change orders found. Create a change order to track scope, budget, or schedule changes.
          </div>
        )}
      </div>

      {/* New Change Order Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>New Change Order</DialogTitle>
            <DialogDescription>Document a scope, budget, or schedule change.</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 space-y-2">
              <Label>Title *</Label>
              <Input 
                value={form.title}
                onChange={(e) => setForm(f => ({ ...f, title: e.target.value }))}
                placeholder="e.g., Additional Cooling Units Required"
              />
            </div>
            <div className="space-y-2">
              <Label>Requested By</Label>
              <Input 
                value={form.requested_by}
                onChange={(e) => setForm(f => ({ ...f, requested_by: e.target.value }))}
                placeholder="Name"
              />
            </div>
            <div className="space-y-2">
              <Label>Phase</Label>
              <Select 
                value={form.phase_id} 
                onValueChange={(v) => setForm(f => ({ ...f, phase_id: v }))}
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
              <Label>Cost Impact (USD)</Label>
              <Input 
                type="number"
                value={form.cost_delta}
                onChange={(e) => setForm(f => ({ ...f, cost_delta: e.target.value }))}
                placeholder="0 (positive = increase)"
              />
            </div>
            <div className="space-y-2">
              <Label>Schedule Impact (Days)</Label>
              <Input 
                type="number"
                value={form.schedule_delta_days}
                onChange={(e) => setForm(f => ({ ...f, schedule_delta_days: e.target.value }))}
                placeholder="0 (positive = delay)"
              />
            </div>
            <div className="col-span-2 space-y-2">
              <Label>Reason</Label>
              <Input 
                value={form.reason}
                onChange={(e) => setForm(f => ({ ...f, reason: e.target.value }))}
                placeholder="Brief reason for the change"
              />
            </div>
            <div className="col-span-2 space-y-2">
              <Label>Description</Label>
              <Textarea 
                value={form.description}
                onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))}
                placeholder="Detailed description of the change..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={!form.title || isCreating}>
              Create Change Order
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Approval Dialog */}
      <AlertDialog open={approvalDialogOpen} onOpenChange={setApprovalDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Approve Change Order</AlertDialogTitle>
            <AlertDialogDescription>
              This will approve {selectedCO?.change_order_number} with a cost impact of ${selectedCO?.cost_delta.toLocaleString()} and schedule impact of {selectedCO?.schedule_delta_days} days.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-2">
            <Label>Approver Name</Label>
            <Input 
              value={approverName}
              onChange={(e) => setApproverName(e.target.value)}
              placeholder="Your name"
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleApprove} disabled={!approverName}>
              Approve
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

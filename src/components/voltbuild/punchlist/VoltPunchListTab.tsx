import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Plus, CheckSquare, MapPin, User, Trash2, CheckCircle } from 'lucide-react';
import { usePunchList, PunchItem, PunchPriority, PunchStatus, PUNCH_PRIORITY_CONFIG, PUNCH_STATUS_CONFIG } from './hooks/usePunchList';
import { VoltBuildProject } from '../types/voltbuild.types';
import { format } from 'date-fns';

interface VoltPunchListTabProps {
  project: VoltBuildProject;
  phases: { id: string; name: string }[];
}

export function VoltPunchListTab({ project, phases }: VoltPunchListTabProps) {
  const [statusFilter, setStatusFilter] = useState<PunchStatus | 'all'>('all');
  const [priorityFilter, setPriorityFilter] = useState<PunchPriority | 'all'>('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [verifyDialogOpen, setVerifyDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<PunchItem | null>(null);
  const [verifierName, setVerifierName] = useState('');

  const [form, setForm] = useState({
    description: '',
    location: '',
    responsible_party: '',
    priority: 'B' as PunchPriority,
    due_date: '',
    phase_id: '',
    notes: '',
  });

  const { 
    punchItems, 
    createPunchItem, 
    updatePunchItem, 
    deletePunchItem,
    generateItemNumber,
    getStats,
    isCreating,
    isLoading 
  } = usePunchList(project.id);

  const stats = getStats();
  const completionRate = stats.total > 0 
    ? Math.round((stats.verified / stats.total) * 100) 
    : 0;

  const filteredItems = punchItems.filter(item => {
    if (statusFilter !== 'all' && item.status !== statusFilter) return false;
    if (priorityFilter !== 'all' && item.priority !== priorityFilter) return false;
    return true;
  });

  const handleCreate = () => {
    createPunchItem({
      project_id: project.id,
      item_number: generateItemNumber(),
      description: form.description,
      location: form.location || null,
      responsible_party: form.responsible_party || null,
      priority: form.priority,
      status: 'open',
      identified_date: new Date().toISOString().split('T')[0],
      due_date: form.due_date || null,
      completed_date: null,
      verified_by: null,
      verified_date: null,
      phase_id: form.phase_id || null,
      photos: [],
      notes: form.notes || null,
    });
    setDialogOpen(false);
    setForm({
      description: '',
      location: '',
      responsible_party: '',
      priority: 'B',
      due_date: '',
      phase_id: '',
      notes: '',
    });
  };

  const handleVerify = () => {
    if (!selectedItem) return;
    updatePunchItem({
      id: selectedItem.id,
      status: 'verified',
      verified_by: verifierName,
      verified_date: new Date().toISOString().split('T')[0],
    });
    setVerifyDialogOpen(false);
    setVerifierName('');
    setSelectedItem(null);
  };

  const handleStatusChange = (id: string, status: PunchStatus) => {
    const updates: Partial<PunchItem> = { status };
    if (status === 'complete') {
      updates.completed_date = new Date().toISOString().split('T')[0];
    }
    updatePunchItem({ id, ...updates });
  };

  return (
    <div className="space-y-6">
      {/* Progress Overview */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Punch List Completion</CardTitle>
          <CardDescription>
            {stats.verified} of {stats.total} items verified ({completionRate}%)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Progress value={completionRate} className="h-3" />
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-4">
            <div className="text-center">
              <p className="text-2xl font-bold">{stats.total}</p>
              <p className="text-xs text-muted-foreground">Total</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-destructive">{stats.open}</p>
              <p className="text-xs text-muted-foreground">Open</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-500">{stats.inProgress}</p>
              <p className="text-xs text-muted-foreground">In Progress</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-amber-500">{stats.complete}</p>
              <p className="text-xs text-muted-foreground">Complete</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-500">{stats.verified}</p>
              <p className="text-xs text-muted-foreground">Verified</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Priority A Warning */}
      {stats.priorityA > 0 && (
        <Card className="border-destructive/50 bg-destructive/5">
          <CardContent className="py-4">
            <div className="flex items-center gap-2 text-destructive">
              <CheckSquare className="w-5 h-5" />
              <span className="font-medium">{stats.priorityA} Priority A items require immediate attention</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters and Actions */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="flex gap-2 flex-wrap">
          <Tabs value={statusFilter} onValueChange={(v) => setStatusFilter(v as typeof statusFilter)}>
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="open">Open</TabsTrigger>
              <TabsTrigger value="in_progress">In Progress</TabsTrigger>
              <TabsTrigger value="complete">Complete</TabsTrigger>
              <TabsTrigger value="verified">Verified</TabsTrigger>
            </TabsList>
          </Tabs>
          <Select value={priorityFilter} onValueChange={(v) => setPriorityFilter(v as typeof priorityFilter)}>
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priorities</SelectItem>
              <SelectItem value="A">A - Critical</SelectItem>
              <SelectItem value="B">B - Functional</SelectItem>
              <SelectItem value="C">C - Cosmetic</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Item
        </Button>
      </div>

      {/* Punch List Items */}
      <div className="space-y-3">
        {filteredItems.map(item => (
          <Card key={item.id} className={item.priority === 'A' ? 'border-destructive/50' : ''}>
            <CardContent className="py-4">
              <div className="flex items-start gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap mb-2">
                    <Badge variant="outline">{item.item_number}</Badge>
                    <Badge variant={PUNCH_PRIORITY_CONFIG[item.priority].variant}>
                      {PUNCH_PRIORITY_CONFIG[item.priority].label}
                    </Badge>
                    <Badge variant={PUNCH_STATUS_CONFIG[item.status].variant}>
                      {PUNCH_STATUS_CONFIG[item.status].label}
                    </Badge>
                  </div>
                  <p className="font-medium">{item.description}</p>
                  <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                    {item.location && (
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {item.location}
                      </span>
                    )}
                    {item.responsible_party && (
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        {item.responsible_party}
                      </span>
                    )}
                    <span>Identified: {format(new Date(item.identified_date), 'MMM d')}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  {item.status === 'open' && (
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleStatusChange(item.id, 'in_progress')}
                    >
                      Start
                    </Button>
                  )}
                  {item.status === 'in_progress' && (
                    <Button 
                      size="sm"
                      onClick={() => handleStatusChange(item.id, 'complete')}
                    >
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Complete
                    </Button>
                  )}
                  {item.status === 'complete' && (
                    <Button 
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setSelectedItem(item);
                        setVerifyDialogOpen(true);
                      }}
                    >
                      Verify
                    </Button>
                  )}
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => deletePunchItem(item.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              {item.verified_by && item.verified_date && (
                <p className="text-xs text-green-600 mt-2">
                  Verified by {item.verified_by} on {format(new Date(item.verified_date), 'MMM d, yyyy')}
                </p>
              )}
            </CardContent>
          </Card>
        ))}
        {filteredItems.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            No punch list items found. Add items to track deficiencies and incomplete work.
          </div>
        )}
      </div>

      {/* New Item Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>New Punch List Item</DialogTitle>
            <DialogDescription>Document an item requiring correction.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Description *</Label>
              <Textarea 
                value={form.description}
                onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))}
                placeholder="Describe the issue..."
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Location</Label>
                <Input 
                  value={form.location}
                  onChange={(e) => setForm(f => ({ ...f, location: e.target.value }))}
                  placeholder="e.g., Room 101"
                />
              </div>
              <div className="space-y-2">
                <Label>Responsible Party</Label>
                <Input 
                  value={form.responsible_party}
                  onChange={(e) => setForm(f => ({ ...f, responsible_party: e.target.value }))}
                  placeholder="Contractor name"
                />
              </div>
              <div className="space-y-2">
                <Label>Priority</Label>
                <Select 
                  value={form.priority} 
                  onValueChange={(v) => setForm(f => ({ ...f, priority: v as PunchPriority }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(PUNCH_PRIORITY_CONFIG).map(([key, config]) => (
                      <SelectItem key={key} value={key}>{config.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Due Date</Label>
                <Input 
                  type="date"
                  value={form.due_date}
                  onChange={(e) => setForm(f => ({ ...f, due_date: e.target.value }))}
                />
              </div>
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
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={!form.description || isCreating}>
              Add Item
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Verify Dialog */}
      <Dialog open={verifyDialogOpen} onOpenChange={setVerifyDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Verify Punch Item</DialogTitle>
            <DialogDescription>
              Confirm that {selectedItem?.item_number} has been corrected.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-muted/50 p-3 rounded-lg">
              <p className="text-sm">{selectedItem?.description}</p>
            </div>
            <div className="space-y-2">
              <Label>Verified By *</Label>
              <Input 
                value={verifierName}
                onChange={(e) => setVerifierName(e.target.value)}
                placeholder="Your name"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setVerifyDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleVerify} disabled={!verifierName}>
              Verify Complete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

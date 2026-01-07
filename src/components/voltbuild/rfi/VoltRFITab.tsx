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
import { Plus, MessageSquare, Clock, AlertTriangle, Trash2, Send } from 'lucide-react';
import { useRFIs, RFI, RFIStatus, RFIPriority, RFIDiscipline, RFI_STATUS_CONFIG, RFI_PRIORITY_CONFIG, RFI_DISCIPLINES } from './hooks/useRFIs';
import { VoltBuildProject } from '../types/voltbuild.types';
import { format, differenceInDays } from 'date-fns';

interface VoltRFITabProps {
  project: VoltBuildProject;
  phases: { id: string; name: string }[];
}

export function VoltRFITab({ project, phases }: VoltRFITabProps) {
  const [statusFilter, setStatusFilter] = useState<RFIStatus | 'all'>('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [responseDialogOpen, setResponseDialogOpen] = useState(false);
  const [selectedRFI, setSelectedRFI] = useState<RFI | null>(null);
  const [responseText, setResponseText] = useState('');

  const [form, setForm] = useState({
    subject: '',
    question: '',
    submitted_by: '',
    assigned_to: '',
    due_date: '',
    priority: 'normal' as RFIPriority,
    discipline: '' as RFIDiscipline | '',
    phase_id: '',
  });

  const { 
    rfis, 
    createRFI, 
    updateRFI, 
    deleteRFI,
    generateRFINumber,
    getStats,
    isCreating,
    isLoading 
  } = useRFIs(project.id);

  const stats = getStats();
  const filteredRFIs = statusFilter === 'all' ? rfis : rfis.filter(r => r.status === statusFilter);

  const handleCreate = () => {
    createRFI({
      project_id: project.id,
      rfi_number: generateRFINumber(),
      subject: form.subject,
      question: form.question,
      submitted_by: form.submitted_by || null,
      submitted_date: new Date().toISOString().split('T')[0],
      due_date: form.due_date || null,
      assigned_to: form.assigned_to || null,
      response: null,
      response_date: null,
      status: 'open',
      priority: form.priority,
      discipline: form.discipline || null,
      phase_id: form.phase_id || null,
      cost_impact: null,
      schedule_impact_days: null,
      attachments: [],
    });
    setDialogOpen(false);
    setForm({
      subject: '',
      question: '',
      submitted_by: '',
      assigned_to: '',
      due_date: '',
      priority: 'normal',
      discipline: '',
      phase_id: '',
    });
  };

  const handleRespond = () => {
    if (!selectedRFI) return;
    updateRFI({
      id: selectedRFI.id,
      response: responseText,
      response_date: new Date().toISOString().split('T')[0],
      status: 'answered',
    });
    setResponseDialogOpen(false);
    setResponseText('');
    setSelectedRFI(null);
  };

  const getDaysOverdue = (rfi: RFI) => {
    if (!rfi.due_date || rfi.status !== 'open') return null;
    const days = differenceInDays(new Date(), new Date(rfi.due_date));
    return days > 0 ? days : null;
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">Total RFIs</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-destructive">{stats.open}</div>
            <p className="text-xs text-muted-foreground">Open</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-blue-500">{stats.answered}</div>
            <p className="text-xs text-muted-foreground">Answered</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-green-500">{stats.closed}</div>
            <p className="text-xs text-muted-foreground">Closed</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-amber-500">{stats.overdue}</div>
            <p className="text-xs text-muted-foreground">Overdue</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Actions */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <Tabs value={statusFilter} onValueChange={(v) => setStatusFilter(v as typeof statusFilter)}>
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="open">Open</TabsTrigger>
            <TabsTrigger value="answered">Answered</TabsTrigger>
            <TabsTrigger value="closed">Closed</TabsTrigger>
          </TabsList>
        </Tabs>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          New RFI
        </Button>
      </div>

      {/* RFI List */}
      <div className="space-y-4">
        {filteredRFIs.map(rfi => {
          const daysOverdue = getDaysOverdue(rfi);
          
          return (
            <Card key={rfi.id}>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="outline">{rfi.rfi_number}</Badge>
                      <Badge variant={RFI_STATUS_CONFIG[rfi.status].variant}>
                        {RFI_STATUS_CONFIG[rfi.status].label}
                      </Badge>
                      <span className={`text-xs font-medium ${RFI_PRIORITY_CONFIG[rfi.priority].color}`}>
                        {RFI_PRIORITY_CONFIG[rfi.priority].label}
                      </span>
                      {daysOverdue && (
                        <Badge variant="destructive" className="gap-1">
                          <AlertTriangle className="w-3 h-3" />
                          {daysOverdue} days overdue
                        </Badge>
                      )}
                    </div>
                    <CardTitle className="text-lg mt-2">{rfi.subject}</CardTitle>
                    <CardDescription>
                      {rfi.submitted_by && <span>From: {rfi.submitted_by} • </span>}
                      {rfi.discipline && <span>{rfi.discipline} • </span>}
                      {format(new Date(rfi.submitted_date), 'MMM d, yyyy')}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="bg-muted/50 p-3 rounded-lg">
                    <p className="text-sm font-medium mb-1">Question:</p>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">{rfi.question}</p>
                  </div>

                  {rfi.response && (
                    <div className="bg-green-500/10 p-3 rounded-lg border border-green-500/20">
                      <p className="text-sm font-medium mb-1 text-green-600">Response:</p>
                      <p className="text-sm whitespace-pre-wrap">{rfi.response}</p>
                      {rfi.response_date && (
                        <p className="text-xs text-muted-foreground mt-2">
                          Answered on {format(new Date(rfi.response_date), 'MMM d, yyyy')}
                        </p>
                      )}
                    </div>
                  )}

                  <div className="flex gap-2 flex-wrap">
                    {rfi.status === 'open' && (
                      <Button 
                        size="sm"
                        onClick={() => {
                          setSelectedRFI(rfi);
                          setResponseDialogOpen(true);
                        }}
                      >
                        <Send className="w-4 h-4 mr-2" />
                        Respond
                      </Button>
                    )}
                    {rfi.status === 'answered' && (
                      <Button 
                        size="sm"
                        variant="outline"
                        onClick={() => updateRFI({ id: rfi.id, status: 'closed' })}
                      >
                        Close RFI
                      </Button>
                    )}
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => deleteRFI(rfi.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
        {filteredRFIs.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            No RFIs found. Create an RFI to track questions and clarifications.
          </div>
        )}
      </div>

      {/* New RFI Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>New Request for Information</DialogTitle>
            <DialogDescription>Submit a question for clarification.</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 space-y-2">
              <Label>Subject *</Label>
              <Input 
                value={form.subject}
                onChange={(e) => setForm(f => ({ ...f, subject: e.target.value }))}
                placeholder="Brief subject line"
              />
            </div>
            <div className="space-y-2">
              <Label>Submitted By</Label>
              <Input 
                value={form.submitted_by}
                onChange={(e) => setForm(f => ({ ...f, submitted_by: e.target.value }))}
                placeholder="Your name"
              />
            </div>
            <div className="space-y-2">
              <Label>Assigned To</Label>
              <Input 
                value={form.assigned_to}
                onChange={(e) => setForm(f => ({ ...f, assigned_to: e.target.value }))}
                placeholder="Reviewer name"
              />
            </div>
            <div className="space-y-2">
              <Label>Priority</Label>
              <Select 
                value={form.priority} 
                onValueChange={(v) => setForm(f => ({ ...f, priority: v as RFIPriority }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="critical">Critical</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
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
            <div className="space-y-2">
              <Label>Discipline</Label>
              <Select 
                value={form.discipline} 
                onValueChange={(v) => setForm(f => ({ ...f, discipline: v as RFIDiscipline }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select discipline" />
                </SelectTrigger>
                <SelectContent>
                  {RFI_DISCIPLINES.map(d => (
                    <SelectItem key={d} value={d}>{d.charAt(0).toUpperCase() + d.slice(1)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
            <div className="col-span-2 space-y-2">
              <Label>Question *</Label>
              <Textarea 
                value={form.question}
                onChange={(e) => setForm(f => ({ ...f, question: e.target.value }))}
                placeholder="Describe your question or clarification request..."
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={!form.subject || !form.question || isCreating}>
              Submit RFI
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Response Dialog */}
      <Dialog open={responseDialogOpen} onOpenChange={setResponseDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Respond to RFI</DialogTitle>
            <DialogDescription>
              {selectedRFI?.rfi_number}: {selectedRFI?.subject}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-muted/50 p-3 rounded-lg">
              <p className="text-sm font-medium mb-1">Question:</p>
              <p className="text-sm text-muted-foreground">{selectedRFI?.question}</p>
            </div>
            <div className="space-y-2">
              <Label>Response *</Label>
              <Textarea 
                value={responseText}
                onChange={(e) => setResponseText(e.target.value)}
                placeholder="Provide your response..."
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setResponseDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleRespond} disabled={!responseText}>
              Submit Response
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

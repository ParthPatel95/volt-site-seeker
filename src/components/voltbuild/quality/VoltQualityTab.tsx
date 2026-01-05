import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Plus, ClipboardCheck, Zap, FileCheck, Upload, CheckCircle, XCircle, AlertCircle, Trash2, FileText } from 'lucide-react';
import { useCommissioningChecklists } from './hooks/useCommissioningChecklists';
import { useEnergizationGates } from './hooks/useEnergizationGates';
import { 
  CommissioningChecklist,
  EnergizationGate,
  ChecklistItem,
  COMMISSIONING_STATUS_CONFIG,
  ENERGIZATION_GATE_STATUS_CONFIG,
  CHECKLIST_TEMPLATES,
} from '../types/voltbuild-phase2.types';
import { VoltBuildProject } from '../types/voltbuild.types';

interface VoltQualityTabProps {
  project: VoltBuildProject;
  phases: { id: string; name: string }[];
}

export function VoltQualityTab({ project, phases }: VoltQualityTabProps) {
  const [activeTab, setActiveTab] = useState<'checklists' | 'gates'>('checklists');
  const [templateDialogOpen, setTemplateDialogOpen] = useState(false);
  const [gateDialogOpen, setGateDialogOpen] = useState(false);
  const [selectedPhase, setSelectedPhase] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('');
  
  const [gateForm, setGateForm] = useState({
    gate_name: '',
    required_checklists: [] as string[],
  });

  const { 
    checklists, 
    createFromTemplate, 
    updateChecklistItem,
    deleteChecklist,
    getStats,
    templates,
    isCreating 
  } = useCommissioningChecklists(project.id);
  
  const { 
    gates, 
    createGate, 
    deleteGate,
    getGateDetails,
    isCreating: isCreatingGate 
  } = useEnergizationGates(project.id);

  const stats = getStats();

  const handleCreateFromTemplate = () => {
    if (!selectedTemplate) return;
    createFromTemplate(selectedTemplate, selectedPhase || undefined);
    setTemplateDialogOpen(false);
    setSelectedTemplate('');
    setSelectedPhase('');
  };

  const handleCreateGate = () => {
    createGate({
      project_id: project.id,
      gate_name: gateForm.gate_name,
      required_checklists: gateForm.required_checklists,
      status: 'blocked',
      notes: null,
    });
    setGateDialogOpen(false);
    setGateForm({ gate_name: '', required_checklists: [] });
  };

  const getChecklistProgress = (checklist: CommissioningChecklist) => {
    const total = checklist.items.length;
    const completed = checklist.items.filter(i => i.completed).length;
    return total > 0 ? Math.round((completed / total) * 100) : 0;
  };

  const toggleChecklistSelection = (checklistId: string) => {
    setGateForm(f => ({
      ...f,
      required_checklists: f.required_checklists.includes(checklistId)
        ? f.required_checklists.filter(id => id !== checklistId)
        : [...f.required_checklists, checklistId]
    }));
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">Total Checklists</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-muted-foreground">{stats.notStarted}</div>
            <p className="text-xs text-muted-foreground">Not Started</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-blue-500">{stats.inProgress}</div>
            <p className="text-xs text-muted-foreground">In Progress</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-green-500">{stats.complete}</div>
            <p className="text-xs text-muted-foreground">Complete</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
        <TabsList>
          <TabsTrigger value="checklists" className="gap-2">
            <ClipboardCheck className="w-4 h-4" />
            <span className="hidden sm:inline">Checklists</span>
          </TabsTrigger>
          <TabsTrigger value="gates" className="gap-2">
            <Zap className="w-4 h-4" />
            <span className="hidden sm:inline">Energization Gates</span>
          </TabsTrigger>
        </TabsList>

        {/* Checklists Tab */}
        <TabsContent value="checklists" className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={() => setTemplateDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              New Checklist
            </Button>
          </div>

          <div className="space-y-4">
            {checklists.map(checklist => {
              const progress = getChecklistProgress(checklist);
              return (
                <Card key={checklist.id}>
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{checklist.checklist_name}</CardTitle>
                        <CardDescription>
                          {checklist.phase_id && <span>Phase: {checklist.phase_id} • </span>}
                          {checklist.items.filter(i => i.completed).length} / {checklist.items.length} items complete
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={COMMISSIONING_STATUS_CONFIG[checklist.status].variant}>
                          {COMMISSIONING_STATUS_CONFIG[checklist.status].label}
                        </Badge>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => deleteChecklist(checklist.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    <Progress value={progress} className="h-2 mt-2" />
                  </CardHeader>
                  <CardContent>
                    <Accordion type="single" collapsible>
                      <AccordionItem value="items" className="border-none">
                        <AccordionTrigger className="py-2 text-sm">
                          View Checklist Items
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="space-y-2">
                            {checklist.items.map((item, index) => (
                              <div 
                                key={index}
                                className="flex items-start gap-3 p-2 rounded-md hover:bg-muted/50"
                              >
                                <Checkbox 
                                  checked={item.completed}
                                  onCheckedChange={(checked) => 
                                    updateChecklistItem(checklist.id, index, !!checked)
                                  }
                                />
                                <div className="flex-1">
                                  <p className={`text-sm ${item.completed ? 'line-through text-muted-foreground' : ''}`}>
                                    {item.description}
                                  </p>
                                  <div className="flex gap-2 mt-1">
                                    {item.required && (
                                      <Badge variant="outline" className="text-xs">Required</Badge>
                                    )}
                                    {item.requires_evidence && (
                                      <Badge variant="secondary" className="text-xs">
                                        <Upload className="w-3 h-3 mr-1" />
                                        Evidence
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  </CardContent>
                </Card>
              );
            })}
            {checklists.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No checklists yet. Create from a template to get started with commissioning.
              </div>
            )}
          </div>
        </TabsContent>

        {/* Energization Gates Tab */}
        <TabsContent value="gates" className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={() => setGateDialogOpen(true)} disabled={checklists.length === 0}>
              <Plus className="w-4 h-4 mr-2" />
              New Gate
            </Button>
          </div>

          <div className="space-y-4">
            {gates.map(gate => {
              const details = getGateDetails(gate.id, checklists);
              if (!details) return null;

              return (
                <Card key={gate.id} className={details.isReady ? 'border-green-500/50' : ''}>
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        {details.isReady ? (
                          <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                            <Zap className="w-5 h-5 text-green-500" />
                          </div>
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-destructive/20 flex items-center justify-center">
                            <AlertCircle className="w-5 h-5 text-destructive" />
                          </div>
                        )}
                        <div>
                          <CardTitle className="text-lg">{gate.gate_name}</CardTitle>
                          <CardDescription>
                            {details.completedCount} / {details.totalRequired} checklists complete
                          </CardDescription>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={ENERGIZATION_GATE_STATUS_CONFIG[details.isReady ? 'ready' : 'blocked'].variant}>
                          {details.isReady ? 'Ready' : 'Blocked'}
                        </Badge>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => deleteGate(gate.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground mb-2">Required Checklists:</p>
                      {details.checklistDetails.map(cl => (
                        <div key={cl.id} className="flex items-center gap-2">
                          {cl.isComplete ? (
                            <CheckCircle className="w-4 h-4 text-green-500" />
                          ) : (
                            <XCircle className="w-4 h-4 text-destructive" />
                          )}
                          <span className="text-sm">{cl.name}</span>
                          <Badge variant={COMMISSIONING_STATUS_CONFIG[cl.status].variant} className="ml-auto text-xs">
                            {COMMISSIONING_STATUS_CONFIG[cl.status].label}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
            {gates.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No energization gates defined. Create a gate to track readiness for energization.
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* New Checklist from Template Dialog */}
      <Dialog open={templateDialogOpen} onOpenChange={setTemplateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Checklist</DialogTitle>
            <DialogDescription>Select a template and optionally assign to a phase.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Template *</Label>
              <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                <SelectTrigger>
                  <SelectValue placeholder="Select template" />
                </SelectTrigger>
                <SelectContent>
                  {templates.map(template => (
                    <SelectItem key={template.name} value={template.name}>
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        {template.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Assign to Phase (Optional)</Label>
              <Select value={selectedPhase} onValueChange={setSelectedPhase}>
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
            <Button variant="outline" onClick={() => setTemplateDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleCreateFromTemplate} disabled={!selectedTemplate || isCreating}>
              Create Checklist
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* New Energization Gate Dialog */}
      <Dialog open={gateDialogOpen} onOpenChange={setGateDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>New Energization Gate</DialogTitle>
            <DialogDescription>Define a gate and select required checklists.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Gate Name *</Label>
              <Input 
                value={gateForm.gate_name}
                onChange={(e) => setGateForm(f => ({ ...f, gate_name: e.target.value }))}
                placeholder="e.g., Ready for Energization"
              />
            </div>
            <div className="space-y-2">
              <Label>Required Checklists</Label>
              <ScrollArea className="h-[200px] border rounded-md p-4">
                {checklists.map(cl => (
                  <div key={cl.id} className="flex items-center gap-3 py-2">
                    <Checkbox 
                      checked={gateForm.required_checklists.includes(cl.id)}
                      onCheckedChange={() => toggleChecklistSelection(cl.id)}
                    />
                    <div className="flex-1">
                      <p className="text-sm font-medium">{cl.checklist_name}</p>
                      <p className="text-xs text-muted-foreground">
                        {cl.items.filter(i => i.completed).length} / {cl.items.length} complete
                      </p>
                    </div>
                    <Badge variant={COMMISSIONING_STATUS_CONFIG[cl.status].variant}>
                      {COMMISSIONING_STATUS_CONFIG[cl.status].label}
                    </Badge>
                  </div>
                ))}
                {checklists.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No checklists available. Create checklists first.
                  </p>
                )}
              </ScrollArea>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setGateDialogOpen(false)}>Cancel</Button>
            <Button 
              onClick={handleCreateGate} 
              disabled={!gateForm.gate_name || gateForm.required_checklists.length === 0 || isCreatingGate}
            >
              Create Gate
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

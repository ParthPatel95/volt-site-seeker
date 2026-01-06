import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CheckSquare, Upload, FileCheck, Check, X, Eye, Plus } from 'lucide-react';
import { format } from 'date-fns';
import { VoltBuildProject, VoltBuildPhase, VoltBuildTask } from '../types/voltbuild.types';
import { 
  TaskVerification, 
  VerificationStatus, 
  VerificationType, 
  VERIFICATION_STATUS_CONFIG 
} from '../types/voltbuild-phase3.types';
import { useTaskVerifications } from './hooks/useTaskVerifications';
import { cn } from '@/lib/utils';

interface VoltVerificationTabProps {
  project: VoltBuildProject;
  phases: VoltBuildPhase[];
  tasks: VoltBuildTask[];
}

export function VoltVerificationTab({ project, phases, tasks }: VoltVerificationTabProps) {
  const [selectedPhaseId, setSelectedPhaseId] = useState<string | null>(null);
  const [isSubmitOpen, setIsSubmitOpen] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [newEvidence, setNewEvidence] = useState({
    file_url: '',
    verification_type: 'photo' as VerificationType,
    notes: '',
  });

  const { verifications, isLoading, submitVerification, approveVerification, rejectVerification, isSubmitting } = useTaskVerifications(project.id);

  // Calculate verification score per phase
  const getPhaseVerificationScore = (phaseId: string) => {
    const phaseTasks = tasks.filter(t => t.phase_id === phaseId);
    if (phaseTasks.length === 0) return 0;

    const tasksWithApprovedVerification = phaseTasks.filter(task => 
      verifications.some(v => v.task_id === task.id && v.status === 'approved')
    );

    return Math.round((tasksWithApprovedVerification.length / phaseTasks.length) * 100);
  };

  // Get verifications for selected phase
  const phaseVerifications = selectedPhaseId 
    ? verifications.filter(v => v.phase_id === selectedPhaseId)
    : verifications;

  const handleSubmitEvidence = async () => {
    if (!selectedTaskId || !newEvidence.file_url) return;
    
    const task = tasks.find(t => t.id === selectedTaskId);
    await submitVerification({
      task_id: selectedTaskId,
      phase_id: task?.phase_id,
      verification_type: newEvidence.verification_type,
      file_url: newEvidence.file_url,
      notes: newEvidence.notes,
    });

    setNewEvidence({ file_url: '', verification_type: 'photo', notes: '' });
    setSelectedTaskId(null);
    setIsSubmitOpen(false);
  };

  return (
    <div className="p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Progress Verification</h1>
          <p className="text-muted-foreground mt-1">
            Submit and approve evidence for task completion
          </p>
        </div>
        <Dialog open={isSubmitOpen} onOpenChange={setIsSubmitOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Submit Evidence
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Submit Verification Evidence</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Task</Label>
                <Select value={selectedTaskId || ''} onValueChange={setSelectedTaskId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a task" />
                  </SelectTrigger>
                  <SelectContent>
                    {phases.map(phase => (
                      <React.Fragment key={phase.id}>
                        <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                          {phase.name}
                        </div>
                        {tasks.filter(t => t.phase_id === phase.id).map(task => (
                          <SelectItem key={task.id} value={task.id}>
                            {task.name}
                          </SelectItem>
                        ))}
                      </React.Fragment>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Evidence Type</Label>
                <Select 
                  value={newEvidence.verification_type}
                  onValueChange={(v) => setNewEvidence(prev => ({ ...prev, verification_type: v as VerificationType }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="photo">Photo</SelectItem>
                    <SelectItem value="video">Video</SelectItem>
                    <SelectItem value="document">Document</SelectItem>
                    <SelectItem value="inspection">Inspection Report</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>File URL</Label>
                <Input
                  placeholder="https://..."
                  value={newEvidence.file_url}
                  onChange={(e) => setNewEvidence(prev => ({ ...prev, file_url: e.target.value }))}
                />
                <p className="text-xs text-muted-foreground">
                  Paste a URL to the evidence file. File upload coming soon.
                </p>
              </div>

              <div className="space-y-2">
                <Label>Notes</Label>
                <Textarea
                  placeholder="Add any notes about this evidence..."
                  value={newEvidence.notes}
                  onChange={(e) => setNewEvidence(prev => ({ ...prev, notes: e.target.value }))}
                  rows={3}
                />
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setIsSubmitOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleSubmitEvidence}
                  disabled={!selectedTaskId || !newEvidence.file_url || isSubmitting}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Submit
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Phase Verification Scores */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {phases.map(phase => {
          const score = getPhaseVerificationScore(phase.id);
          return (
            <Card 
              key={phase.id}
              className={cn(
                "cursor-pointer transition-all hover:ring-2 hover:ring-primary/50",
                selectedPhaseId === phase.id && "ring-2 ring-primary"
              )}
              onClick={() => setSelectedPhaseId(selectedPhaseId === phase.id ? null : phase.id)}
            >
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-3">
                  <p className="font-medium truncate">{phase.name}</p>
                  <Badge variant={score === 100 ? "default" : "secondary"}>
                    {score}%
                  </Badge>
                </div>
                <Progress value={score} className="h-2" />
                <p className="text-xs text-muted-foreground mt-2">
                  {tasks.filter(t => t.phase_id === phase.id).length} tasks
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Verifications Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileCheck className="w-5 h-5" />
            {selectedPhaseId ? `Verifications - ${phases.find(p => p.id === selectedPhaseId)?.name}` : 'All Verifications'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Loading...</div>
          ) : phaseVerifications.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No verifications submitted yet
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Task</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {phaseVerifications.map(verification => {
                  const task = tasks.find(t => t.id === verification.task_id);
                  const statusConfig = VERIFICATION_STATUS_CONFIG[verification.status];
                  
                  return (
                    <TableRow key={verification.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{task?.name || 'Unknown Task'}</p>
                          {verification.notes && (
                            <p className="text-sm text-muted-foreground truncate max-w-[200px]">
                              {verification.notes}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {verification.verification_type}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {format(new Date(verification.submitted_at), 'MMM d, yyyy')}
                      </TableCell>
                      <TableCell>
                        <Badge className={statusConfig.color}>
                          {statusConfig.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => window.open(verification.file_url, '_blank')}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          {verification.status === 'submitted' && (
                            <>
                              <Button 
                                variant="ghost" 
                                size="icon"
                                className="text-emerald-600"
                                onClick={() => approveVerification(verification.id)}
                              >
                                <Check className="w-4 h-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon"
                                className="text-destructive"
                                onClick={() => rejectVerification({ id: verification.id, reason: 'Does not meet requirements' })}
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

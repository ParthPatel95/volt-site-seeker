import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { AlertTriangle, Plus, Shield, User, Trash2, Edit2 } from 'lucide-react';
import {
  VoltBuildRisk,
  VoltBuildPhase,
  RiskSeverity,
  RiskStatus,
  RISK_SEVERITY_CONFIG,
} from './types/voltbuild.types';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface VoltBuildRisksProps {
  risks: VoltBuildRisk[];
  phases: VoltBuildPhase[];
  projectId: string;
  onCreateRisk: (risk: {
    project_id: string;
    phase_id?: string;
    title: string;
    description?: string;
    severity: RiskSeverity;
    mitigation_plan?: string;
    owner?: string;
  }) => void;
  onUpdateRisk: (id: string, updates: Partial<VoltBuildRisk>) => void;
  onDeleteRisk: (id: string) => void;
}

export function VoltBuildRisks({
  risks,
  phases,
  projectId,
  onCreateRisk,
  onUpdateRisk,
  onDeleteRisk,
}: VoltBuildRisksProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRisk, setEditingRisk] = useState<VoltBuildRisk | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    severity: 'medium' as RiskSeverity,
    phase_id: '',
    mitigation_plan: '',
    owner: '',
  });

  const openRisks = risks.filter((r) => r.status === 'open');
  const mitigatedRisks = risks.filter((r) => r.status === 'mitigated');
  const closedRisks = risks.filter((r) => r.status === 'closed');

  const handleSubmit = () => {
    if (!formData.title.trim()) return;

    if (editingRisk) {
      onUpdateRisk(editingRisk.id, {
        title: formData.title,
        description: formData.description || null,
        severity: formData.severity,
        phase_id: formData.phase_id || null,
        mitigation_plan: formData.mitigation_plan || null,
        owner: formData.owner || null,
      });
    } else {
      onCreateRisk({
        project_id: projectId,
        title: formData.title,
        description: formData.description || undefined,
        severity: formData.severity,
        phase_id: formData.phase_id || undefined,
        mitigation_plan: formData.mitigation_plan || undefined,
        owner: formData.owner || undefined,
      });
    }

    resetForm();
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      severity: 'medium',
      phase_id: '',
      mitigation_plan: '',
      owner: '',
    });
    setEditingRisk(null);
    setIsDialogOpen(false);
  };

  const openEditDialog = (risk: VoltBuildRisk) => {
    setEditingRisk(risk);
    setFormData({
      title: risk.title,
      description: risk.description || '',
      severity: risk.severity,
      phase_id: risk.phase_id || '',
      mitigation_plan: risk.mitigation_plan || '',
      owner: risk.owner || '',
    });
    setIsDialogOpen(true);
  };

  const RiskCard = ({ risk }: { risk: VoltBuildRisk }) => {
    const severityConfig = RISK_SEVERITY_CONFIG[risk.severity];
    const phase = phases.find((p) => p.id === risk.phase_id);

    return (
      <div className="p-3 space-y-2 border rounded-lg border-border">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-start gap-2 min-w-0">
            <AlertTriangle
              className={cn(
                'w-4 h-4 mt-0.5 flex-shrink-0',
                severityConfig.color
              )}
            />
            <div className="min-w-0">
              <h4 className="font-medium truncate text-foreground">
                {risk.title}
              </h4>
              {phase && (
                <p className="text-xs text-muted-foreground">{phase.name}</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1 flex-shrink-0">
            <Badge
              variant="outline"
              className={cn('text-xs', severityConfig.bgColor, severityConfig.color)}
            >
              {severityConfig.label}
            </Badge>
            <Button
              size="icon"
              variant="ghost"
              className="w-6 h-6"
              onClick={() => openEditDialog(risk)}
            >
              <Edit2 className="w-3 h-3" />
            </Button>
          </div>
        </div>

        {risk.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {risk.description}
          </p>
        )}

        {risk.mitigation_plan && (
          <div className="p-2 text-xs rounded bg-muted">
            <div className="flex items-center gap-1 mb-1 font-medium text-foreground">
              <Shield className="w-3 h-3" />
              Mitigation
            </div>
            <p className="text-muted-foreground line-clamp-2">
              {risk.mitigation_plan}
            </p>
          </div>
        )}

        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-2">
            {risk.owner && (
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <User className="w-3 h-3" />
                {risk.owner}
              </span>
            )}
          </div>

          <Select
            value={risk.status}
            onValueChange={(value) =>
              onUpdateRisk(risk.id, { status: value as RiskStatus })
            }
          >
            <SelectTrigger className="w-24 h-6 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="open">Open</SelectItem>
              <SelectItem value="mitigated">Mitigated</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    );
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <AlertTriangle className="w-4 h-4" />
            Risk Tracking
            {openRisks.length > 0 && (
              <Badge variant="destructive" className="ml-1">
                {openRisks.length} open
              </Badge>
            )}
          </CardTitle>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline">
                <Plus className="w-4 h-4 mr-1" />
                Add Risk
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingRisk ? 'Edit Risk' : 'Add Risk'}
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Title *</Label>
                  <Input
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    placeholder="Risk title"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    placeholder="Describe the risk"
                    rows={2}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Severity</Label>
                    <Select
                      value={formData.severity}
                      onValueChange={(value) =>
                        setFormData({
                          ...formData,
                          severity: value as RiskSeverity,
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Affected Phase</Label>
                    <Select
                      value={formData.phase_id}
                      onValueChange={(value) =>
                        setFormData({ ...formData, phase_id: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select phase" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">All phases</SelectItem>
                        {phases.map((phase) => (
                          <SelectItem key={phase.id} value={phase.id}>
                            {phase.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Mitigation Plan</Label>
                  <Textarea
                    value={formData.mitigation_plan}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        mitigation_plan: e.target.value,
                      })
                    }
                    placeholder="How will this risk be mitigated?"
                    rows={2}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Owner</Label>
                  <Input
                    value={formData.owner}
                    onChange={(e) =>
                      setFormData({ ...formData, owner: e.target.value })
                    }
                    placeholder="Who is responsible?"
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={resetForm}>
                    Cancel
                  </Button>
                  <Button onClick={handleSubmit} disabled={!formData.title.trim()}>
                    {editingRisk ? 'Update' : 'Add'} Risk
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>

      <CardContent>
        {risks.length === 0 ? (
          <p className="py-8 text-sm text-center text-muted-foreground">
            No risks identified yet
          </p>
        ) : (
          <div className="space-y-4">
            {openRisks.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-muted-foreground">
                  Open Risks ({openRisks.length})
                </h4>
                <div className="space-y-2">
                  {openRisks.map((risk) => (
                    <RiskCard key={risk.id} risk={risk} />
                  ))}
                </div>
              </div>
            )}

            {mitigatedRisks.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-muted-foreground">
                  Mitigated ({mitigatedRisks.length})
                </h4>
                <div className="space-y-2">
                  {mitigatedRisks.map((risk) => (
                    <RiskCard key={risk.id} risk={risk} />
                  ))}
                </div>
              </div>
            )}

            {closedRisks.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-muted-foreground">
                  Closed ({closedRisks.length})
                </h4>
                <div className="space-y-2 opacity-60">
                  {closedRisks.map((risk) => (
                    <RiskCard key={risk.id} risk={risk} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

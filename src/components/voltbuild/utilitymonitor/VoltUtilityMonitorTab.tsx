import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plug, AlertTriangle, Plus, Upload, Bell, Check, X, Clock } from 'lucide-react';
import { format, differenceInDays } from 'date-fns';
import { VoltBuildProject } from '../types/voltbuild.types';
import { 
  UtilityStatus, 
  UtilityStatusUpdate,
  UtilityAlert,
  UTILITY_STATUS_CONFIG, 
  ALERT_SEVERITY_CONFIG 
} from '../types/voltbuild-phase3.types';
import { useUtilityMonitor } from './hooks/useUtilityMonitor';
import { cn } from '@/lib/utils';

interface VoltUtilityMonitorTabProps {
  project: VoltBuildProject;
}

const COMMON_UTILITIES = [
  'AESO',
  'ENMAX',
  'EPCOR',
  'ATCO Electric',
  'FortisAlberta',
  'SaskPower',
  'BC Hydro',
  'Hydro One',
  'Manitoba Hydro',
];

const COMMON_MILESTONES = [
  'Application Submitted',
  'Study Initiated',
  'Facilities Study Complete',
  'Connection Agreement Received',
  'Connection Agreement Signed',
  'Construction Permit Issued',
  'Interconnection Complete',
  'Commercial Operation Date',
];

export function VoltUtilityMonitorTab({ project }: VoltUtilityMonitorTabProps) {
  const [isNewMilestoneOpen, setIsNewMilestoneOpen] = useState(false);
  const [newMilestone, setNewMilestone] = useState({
    utility: '',
    milestone: '',
    status: 'not_started' as UtilityStatus,
    notes: '',
  });

  const { 
    utilityStatuses, 
    alerts, 
    isLoading, 
    createStatus, 
    updateStatus, 
    resolveAlert,
    isCreating 
  } = useUtilityMonitor(project.id);

  // Group statuses by utility
  const statusesByUtility = utilityStatuses.reduce((acc, status) => {
    if (!acc[status.utility]) acc[status.utility] = [];
    acc[status.utility].push(status);
    return acc;
  }, {} as Record<string, UtilityStatusUpdate[]>);

  // Unresolved alerts
  const unresolvedAlerts = alerts.filter(a => !a.resolved_at);

  const handleCreateMilestone = async () => {
    if (!newMilestone.utility || !newMilestone.milestone) return;
    await createStatus(newMilestone);
    setNewMilestone({ utility: '', milestone: '', status: 'not_started', notes: '' });
    setIsNewMilestoneOpen(false);
  };

  return (
    <div className="p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Utility Monitor</h1>
          <p className="text-muted-foreground mt-1">
            Track interconnection progress and utility milestones
          </p>
        </div>
        <Dialog open={isNewMilestoneOpen} onOpenChange={setIsNewMilestoneOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Milestone
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Utility Milestone</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Utility</Label>
                <Select 
                  value={newMilestone.utility}
                  onValueChange={(v) => setNewMilestone(prev => ({ ...prev, utility: v }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select utility" />
                  </SelectTrigger>
                  <SelectContent>
                    {COMMON_UTILITIES.map(utility => (
                      <SelectItem key={utility} value={utility}>{utility}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Milestone</Label>
                <Select 
                  value={newMilestone.milestone}
                  onValueChange={(v) => setNewMilestone(prev => ({ ...prev, milestone: v }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select milestone" />
                  </SelectTrigger>
                  <SelectContent>
                    {COMMON_MILESTONES.map(milestone => (
                      <SelectItem key={milestone} value={milestone}>{milestone}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Status</Label>
                <Select 
                  value={newMilestone.status}
                  onValueChange={(v) => setNewMilestone(prev => ({ ...prev, status: v as UtilityStatus }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(UTILITY_STATUS_CONFIG).map(([key, config]) => (
                      <SelectItem key={key} value={key}>{config.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Notes</Label>
                <Textarea
                  placeholder="Any notes..."
                  value={newMilestone.notes}
                  onChange={(e) => setNewMilestone(prev => ({ ...prev, notes: e.target.value }))}
                  rows={3}
                />
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setIsNewMilestoneOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleCreateMilestone}
                  disabled={!newMilestone.utility || !newMilestone.milestone || isCreating}
                >
                  Add Milestone
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Active Alerts */}
      {unresolvedAlerts.length > 0 && (
        <Card className="border-amber-500/50 bg-amber-500/5">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-amber-600">
              <Bell className="w-5 h-5" />
              Active Alerts ({unresolvedAlerts.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {unresolvedAlerts.map(alert => {
                const severityConfig = ALERT_SEVERITY_CONFIG[alert.severity];
                return (
                  <div 
                    key={alert.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-background border"
                  >
                    <div className="flex items-center gap-3">
                      <AlertTriangle className={cn(
                        "w-5 h-5",
                        alert.severity === 'high' ? "text-red-500" :
                        alert.severity === 'medium' ? "text-amber-500" : "text-blue-500"
                      )} />
                      <div>
                        <p className="font-medium">{alert.message}</p>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(alert.created_at), 'MMM d, yyyy')}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={severityConfig.color}>{severityConfig.label}</Badge>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => resolveAlert(alert.id)}
                      >
                        <Check className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Utility Status Cards */}
      {isLoading ? (
        <div className="text-center py-8 text-muted-foreground">Loading...</div>
      ) : Object.keys(statusesByUtility).length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Plug className="w-12 h-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium mb-2">No utility milestones</p>
            <p className="text-muted-foreground mb-4">
              Add milestones to track interconnection progress
            </p>
            <Button onClick={() => setIsNewMilestoneOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add First Milestone
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {Object.entries(statusesByUtility).map(([utility, statuses]) => (
            <Card key={utility}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plug className="w-5 h-5" />
                  {utility}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Milestone</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Last Update</TableHead>
                      <TableHead>Notes</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {statuses.map(status => {
                      const statusConfig = UTILITY_STATUS_CONFIG[status.status];
                      const daysSinceUpdate = status.last_update_date 
                        ? differenceInDays(new Date(), new Date(status.last_update_date))
                        : null;

                      return (
                        <TableRow key={status.id}>
                          <TableCell className="font-medium">{status.milestone}</TableCell>
                          <TableCell>
                            <Badge className={statusConfig.color}>
                              {statusConfig.label}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {status.last_update_date ? (
                              <div className="flex items-center gap-2">
                                <span>{format(new Date(status.last_update_date), 'MMM d')}</span>
                                {daysSinceUpdate && daysSinceUpdate > 30 && (
                                  <Badge variant="destructive" className="text-xs">
                                    {daysSinceUpdate}d ago
                                  </Badge>
                                )}
                              </div>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </TableCell>
                          <TableCell className="max-w-[200px] truncate">
                            {status.notes || '-'}
                          </TableCell>
                          <TableCell className="text-right">
                            <Select
                              value={status.status}
                              onValueChange={(v) => updateStatus({ 
                                id: status.id, 
                                status: v as UtilityStatus,
                                last_update_date: new Date().toISOString().split('T')[0]
                              })}
                            >
                              <SelectTrigger className="w-[140px]">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {Object.entries(UTILITY_STATUS_CONFIG).map(([key, config]) => (
                                  <SelectItem key={key} value={key}>{config.label}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

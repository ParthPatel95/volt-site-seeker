import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ShieldCheck, AlertTriangle, FileText, Plus, Calendar, Users, Download } from 'lucide-react';
import { format, addDays, isBefore } from 'date-fns';
import { VoltBuildProject } from '../types/voltbuild.types';
import { 
  INCIDENT_SEVERITY_CONFIG, 
  PERMIT_STATUS_CONFIG,
  IncidentSeverity,
  PermitStatus 
} from '../types/voltbuild-phase3.types';
import { useSafety } from './hooks/useSafety';

interface VoltSafetyTabProps {
  project: VoltBuildProject;
}

export function VoltSafetyTab({ project }: VoltSafetyTabProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const { toolboxTalks, incidents, permits, isLoading, createToolboxTalk, createIncident, createPermit } = useSafety(project.id);

  const openIncidents = incidents.filter(i => i.status === 'open');
  const expiringPermits = permits.filter(p => 
    p.expiry_date && isBefore(new Date(p.expiry_date), addDays(new Date(), 30))
  );

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Compliance & Safety</h1>
          <p className="text-muted-foreground mt-1">
            Toolbox talks, incident reports, and permit tracking
          </p>
        </div>
        <Button variant="outline" size="sm">
          <Download className="w-4 h-4 mr-2" />
          Export Package
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/20">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Toolbox Talks</p>
                <p className="text-2xl font-bold">{toolboxTalks.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className={openIncidents.length > 0 ? "border-amber-500/50" : ""}>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${openIncidents.length > 0 ? "bg-amber-500/20" : "bg-muted"}`}>
                <AlertTriangle className={`w-5 h-5 ${openIncidents.length > 0 ? "text-amber-600" : "text-muted-foreground"}`} />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Open Incidents</p>
                <p className="text-2xl font-bold">{openIncidents.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className={expiringPermits.length > 0 ? "border-red-500/50" : ""}>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${expiringPermits.length > 0 ? "bg-red-500/20" : "bg-muted"}`}>
                <FileText className={`w-5 h-5 ${expiringPermits.length > 0 ? "text-red-600" : "text-muted-foreground"}`} />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Expiring Permits</p>
                <p className="text-2xl font-bold">{expiringPermits.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="toolbox">Toolbox Talks</TabsTrigger>
          <TabsTrigger value="incidents">Incidents</TabsTrigger>
          <TabsTrigger value="permits">Permits</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <p className="text-muted-foreground">Loading...</p>
              ) : (
                <div className="space-y-3">
                  {toolboxTalks.slice(0, 3).map(talk => (
                    <div key={talk.id} className="flex items-center gap-3 p-3 rounded-lg border">
                      <Users className="w-5 h-5 text-blue-500" />
                      <div>
                        <p className="font-medium">{talk.topic}</p>
                        <p className="text-sm text-muted-foreground">{format(new Date(talk.date), 'MMM d, yyyy')}</p>
                      </div>
                    </div>
                  ))}
                  {toolboxTalks.length === 0 && incidents.length === 0 && (
                    <p className="text-center py-8 text-muted-foreground">No safety records yet</p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="toolbox" className="mt-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Toolbox Talks</CardTitle>
              <Button size="sm" onClick={() => createToolboxTalk({ date: new Date().toISOString().split('T')[0], topic: 'Safety Briefing' })}>
                <Plus className="w-4 h-4 mr-2" />
                New Talk
              </Button>
            </CardHeader>
            <CardContent>
              {toolboxTalks.length === 0 ? (
                <p className="text-center py-8 text-muted-foreground">No toolbox talks recorded</p>
              ) : (
                <div className="space-y-2">
                  {toolboxTalks.map(talk => (
                    <div key={talk.id} className="flex items-center justify-between p-3 rounded-lg border">
                      <div>
                        <p className="font-medium">{talk.topic}</p>
                        <p className="text-sm text-muted-foreground">{format(new Date(talk.date), 'MMM d, yyyy')}</p>
                      </div>
                      <Badge variant="outline">{(talk.attendees as any[])?.length || 0} attendees</Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="incidents" className="mt-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Incident Reports</CardTitle>
              <Button size="sm" onClick={() => createIncident({ date: new Date().toISOString().split('T')[0], severity: 'near_miss', description: 'New incident' })}>
                <Plus className="w-4 h-4 mr-2" />
                Report Incident
              </Button>
            </CardHeader>
            <CardContent>
              {incidents.length === 0 ? (
                <p className="text-center py-8 text-muted-foreground">No incidents reported</p>
              ) : (
                <div className="space-y-2">
                  {incidents.map(incident => (
                    <div key={incident.id} className="flex items-center justify-between p-3 rounded-lg border">
                      <div>
                        <p className="font-medium">{incident.description}</p>
                        <p className="text-sm text-muted-foreground">{format(new Date(incident.date), 'MMM d, yyyy')}</p>
                      </div>
                      <div className="flex gap-2">
                        <Badge className={INCIDENT_SEVERITY_CONFIG[incident.severity].color}>
                          {INCIDENT_SEVERITY_CONFIG[incident.severity].label}
                        </Badge>
                        <Badge variant={incident.status === 'open' ? 'destructive' : 'secondary'}>
                          {incident.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="permits" className="mt-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Permit Logs</CardTitle>
              <Button size="sm" onClick={() => createPermit({ permit_name: 'New Permit' })}>
                <Plus className="w-4 h-4 mr-2" />
                Add Permit
              </Button>
            </CardHeader>
            <CardContent>
              {permits.length === 0 ? (
                <p className="text-center py-8 text-muted-foreground">No permits logged</p>
              ) : (
                <div className="space-y-2">
                  {permits.map(permit => (
                    <div key={permit.id} className="flex items-center justify-between p-3 rounded-lg border">
                      <div>
                        <p className="font-medium">{permit.permit_name}</p>
                        <p className="text-sm text-muted-foreground">{permit.authority || 'No authority specified'}</p>
                      </div>
                      <Badge className={PERMIT_STATUS_CONFIG[permit.status].color}>
                        {PERMIT_STATUS_CONFIG[permit.status].label}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

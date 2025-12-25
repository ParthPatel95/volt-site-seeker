import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { 
  Plus, 
  Power, 
  PowerOff,
  Trash2,
  Edit,
  Server,
  Wifi,
  AlertCircle
} from 'lucide-react';
import { usePDUController, PDUDevice } from '@/hooks/usePDUController';
import { cn } from '@/lib/utils';

export function PDUDeviceManager() {
  const { 
    pdus, 
    loading, 
    actionLoading,
    stats,
    fetchPDUs, 
    registerPDU, 
    shutdownPDUs, 
    powerOnPDUs,
    deletePDU 
  } = usePDUController();

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedPDUs, setSelectedPDUs] = useState<string[]>([]);
  const [newPDU, setNewPDU] = useState({
    name: '',
    ip_address: '',
    protocol: 'rest',
    api_endpoint: '',
    priority_group: 'medium',
    location: '',
    total_outlets: 8,
    max_capacity_kw: 10,
  });

  useEffect(() => {
    fetchPDUs();
  }, [fetchPDUs]);

  const handleAddPDU = async () => {
    await registerPDU(newPDU);
    setIsAddDialogOpen(false);
    setNewPDU({
      name: '',
      ip_address: '',
      protocol: 'rest',
      api_endpoint: '',
      priority_group: 'medium',
      location: '',
      total_outlets: 8,
      max_capacity_kw: 10,
    });
  };

  const handleBulkShutdown = async () => {
    if (selectedPDUs.length > 0) {
      await shutdownPDUs(selectedPDUs, 'Manual bulk shutdown');
      setSelectedPDUs([]);
    }
  };

  const handleBulkPowerOn = async () => {
    if (selectedPDUs.length > 0) {
      await powerOnPDUs(selectedPDUs, 'Manual bulk power on');
      setSelectedPDUs([]);
    }
  };

  const togglePDUSelection = (pduId: string) => {
    setSelectedPDUs(prev => 
      prev.includes(pduId) 
        ? prev.filter(id => id !== pduId)
        : [...prev, pduId]
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'offline': return 'bg-muted-foreground';
      case 'shutting_down': return 'bg-yellow-500';
      case 'starting_up': return 'bg-blue-500';
      case 'error': return 'bg-destructive';
      default: return 'bg-muted';
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'critical': return <Badge variant="destructive">Critical</Badge>;
      case 'high': return <Badge className="bg-orange-500">High</Badge>;
      case 'medium': return <Badge variant="secondary">Medium</Badge>;
      case 'low': return <Badge variant="outline">Low</Badge>;
      default: return <Badge variant="outline">{priority}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold">PDU Device Registry</h3>
          <p className="text-sm text-muted-foreground">
            {stats.total} devices • {stats.online} online • {stats.totalLoadKw.toFixed(1)} kW active
          </p>
        </div>
        <div className="flex gap-2">
          {selectedPDUs.length > 0 && (
            <>
              <Button 
                variant="destructive" 
                size="sm"
                onClick={handleBulkShutdown}
                disabled={actionLoading}
              >
                <PowerOff className="w-4 h-4 mr-1" />
                Shutdown ({selectedPDUs.length})
              </Button>
              <Button 
                variant="default" 
                size="sm"
                onClick={handleBulkPowerOn}
                disabled={actionLoading}
              >
                <Power className="w-4 h-4 mr-1" />
                Power On ({selectedPDUs.length})
              </Button>
            </>
          )}
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add PDU
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Register New PDU Device</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Device Name</Label>
                    <Input 
                      placeholder="Rack-A1-PDU"
                      value={newPDU.name}
                      onChange={e => setNewPDU({...newPDU, name: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>IP Address</Label>
                    <Input 
                      placeholder="192.168.1.100"
                      value={newPDU.ip_address}
                      onChange={e => setNewPDU({...newPDU, ip_address: e.target.value})}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Protocol</Label>
                    <Select value={newPDU.protocol} onValueChange={v => setNewPDU({...newPDU, protocol: v})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="rest">REST API</SelectItem>
                        <SelectItem value="snmp">SNMP</SelectItem>
                        <SelectItem value="modbus">Modbus</SelectItem>
                        <SelectItem value="webhook">Webhook</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Priority Group</Label>
                    <Select value={newPDU.priority_group} onValueChange={v => setNewPDU({...newPDU, priority_group: v})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="critical">Critical (Never Shutdown)</SelectItem>
                        <SelectItem value="high">High Priority</SelectItem>
                        <SelectItem value="medium">Medium Priority</SelectItem>
                        <SelectItem value="low">Low Priority (First to Shutdown)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>API Endpoint (optional)</Label>
                  <Input 
                    placeholder="https://pdu.example.com/api"
                    value={newPDU.api_endpoint}
                    onChange={e => setNewPDU({...newPDU, api_endpoint: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Location</Label>
                  <Input 
                    placeholder="Data Hall A, Row 3"
                    value={newPDU.location}
                    onChange={e => setNewPDU({...newPDU, location: e.target.value})}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Total Outlets</Label>
                    <Input 
                      type="number"
                      value={newPDU.total_outlets}
                      onChange={e => setNewPDU({...newPDU, total_outlets: parseInt(e.target.value)})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Max Capacity (kW)</Label>
                    <Input 
                      type="number"
                      value={newPDU.max_capacity_kw}
                      onChange={e => setNewPDU({...newPDU, max_capacity_kw: parseFloat(e.target.value)})}
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleAddPDU} disabled={!newPDU.name || actionLoading}>
                  Register PDU
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Priority Groups Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {(['critical', 'high', 'medium', 'low'] as const).map(priority => {
          const groupPdus = stats.byPriority[priority];
          const onlineCount = groupPdus.filter(p => p.current_status === 'online').length;
          return (
            <Card key={priority} className="border">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    {getPriorityBadge(priority)}
                    <p className="text-2xl font-bold mt-2">{groupPdus.length}</p>
                    <p className="text-xs text-muted-foreground">{onlineCount} online</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* PDU List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {pdus.map(pdu => (
          <Card 
            key={pdu.id} 
            className={cn(
              "border-2 cursor-pointer transition-all",
              selectedPDUs.includes(pdu.id) && "border-primary bg-primary/5",
              pdu.current_status === 'error' && "border-destructive"
            )}
            onClick={() => togglePDUSelection(pdu.id)}
          >
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={cn("w-2 h-2 rounded-full", getStatusColor(pdu.current_status))} />
                  <CardTitle className="text-base">{pdu.name}</CardTitle>
                </div>
                {getPriorityBadge(pdu.priority_group)}
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <p className="text-muted-foreground">Status</p>
                  <p className="font-medium capitalize">{pdu.current_status.replace('_', ' ')}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Load</p>
                  <p className="font-medium">{pdu.current_load_kw?.toFixed(1) || 0} kW</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Outlets</p>
                  <p className="font-medium">{pdu.active_outlets}/{pdu.total_outlets}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Protocol</p>
                  <p className="font-medium uppercase">{pdu.protocol}</p>
                </div>
              </div>
              
              {pdu.location && (
                <p className="text-xs text-muted-foreground">{pdu.location}</p>
              )}

              <div className="flex gap-2 pt-2 border-t" onClick={e => e.stopPropagation()}>
                {pdu.current_status === 'online' ? (
                  <Button 
                    variant="destructive" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => shutdownPDUs([pdu.id], 'Manual shutdown')}
                    disabled={actionLoading || pdu.priority_group === 'critical'}
                  >
                    <PowerOff className="w-3 h-3 mr-1" />
                    Shutdown
                  </Button>
                ) : (
                  <Button 
                    variant="default" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => powerOnPDUs([pdu.id], 'Manual power on')}
                    disabled={actionLoading}
                  >
                    <Power className="w-3 h-3 mr-1" />
                    Power On
                  </Button>
                )}
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => deletePDU(pdu.id)}
                  disabled={actionLoading}
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}

        {pdus.length === 0 && !loading && (
          <Card className="col-span-full border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Server className="w-12 h-12 text-muted-foreground mb-4" />
              <p className="text-lg font-medium">No PDU Devices Registered</p>
              <p className="text-sm text-muted-foreground mb-4">Add your first PDU to start managing power</p>
              <Button onClick={() => setIsAddDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add PDU
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

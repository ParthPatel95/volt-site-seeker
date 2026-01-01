import React, { useEffect, useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Plus, 
  Moon, 
  Power,
  RefreshCw,
  Search,
  Filter,
  Cpu,
  AlertTriangle,
  LayoutGrid,
  List
} from 'lucide-react';
import { useMinerController } from '@/hooks/useMinerController';
import { MinerCard } from './MinerCard';
import { MinerRegistrationDialog, MinerFormData } from './MinerRegistrationDialog';
import { FleetStatsHeader } from './FleetStatsHeader';
import { cn } from '@/lib/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type PriorityFilter = 'all' | 'critical' | 'high' | 'medium' | 'low' | 'curtailable';
type StatusFilter = 'all' | 'mining' | 'sleeping' | 'offline' | 'error';

export function MinerFleetManager() {
  const { 
    miners, 
    loading, 
    actionLoading,
    fetchMiners, 
    registerMiner, 
    sleepMiners,
    wakeupMiners,
    rebootMiners,
    sleepByPriority,
    deleteMiner 
  } = useMinerController();

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedMiners, setSelectedMiners] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<PriorityFilter>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    fetchMiners();
  }, [fetchMiners]);

  // Compute fleet stats
  const fleetStats = useMemo(() => {
    const miningMiners = miners.filter(m => m.current_status === 'mining');
    const totalHashrate = miners.reduce((sum, m) => sum + (m.current_hashrate_th || 0), 0);
    const totalPower = miners.reduce((sum, m) => sum + ((m.power_consumption_w || 0) / 1000), 0);
    
    // Calculate average efficiency (J/TH)
    const avgEfficiency = totalHashrate > 0 
      ? (totalPower * 1000) / totalHashrate 
      : 0;
    
    // Calculate health percentage (miners at >= 90% of target hashrate)
    const healthyMiners = miners.filter(m => {
      if (m.current_status !== 'mining') return false;
      const targetHash = m.target_hashrate_th || 0;
      return targetHash > 0 && (m.current_hashrate_th || 0) >= targetHash * 0.9;
    });
    const healthPercent = miningMiners.length > 0 
      ? (healthyMiners.length / miningMiners.length) * 100 
      : 0;

    return {
      total: miners.length,
      mining: miningMiners.length,
      sleeping: miners.filter(m => m.current_status === 'sleeping' || m.current_status === 'idle').length,
      offline: miners.filter(m => m.current_status === 'offline').length,
      error: miners.filter(m => m.current_status === 'error').length,
      totalHashrateTh: totalHashrate,
      totalPowerKw: totalPower,
      avgEfficiency,
      healthPercent,
    };
  }, [miners]);

  // Filter miners
  const filteredMiners = useMemo(() => {
    return miners.filter(miner => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesSearch = 
          miner.name.toLowerCase().includes(query) ||
          miner.ip_address.toLowerCase().includes(query) ||
          miner.model.toLowerCase().includes(query) ||
          miner.location?.toLowerCase().includes(query);
        if (!matchesSearch) return false;
      }

      // Priority filter
      if (priorityFilter !== 'all' && miner.priority_group !== priorityFilter) {
        return false;
      }

      // Status filter
      if (statusFilter !== 'all') {
        if (statusFilter === 'sleeping' && miner.current_status !== 'sleeping' && miner.current_status !== 'idle') {
          return false;
        } else if (statusFilter !== 'sleeping' && miner.current_status !== statusFilter) {
          return false;
        }
      }

      return true;
    });
  }, [miners, searchQuery, priorityFilter, statusFilter]);

  // Priority group counts
  const priorityCounts = useMemo(() => ({
    all: miners.length,
    critical: miners.filter(m => m.priority_group === 'critical').length,
    high: miners.filter(m => m.priority_group === 'high').length,
    medium: miners.filter(m => m.priority_group === 'medium').length,
    low: miners.filter(m => m.priority_group === 'low').length,
    curtailable: miners.filter(m => m.priority_group === 'curtailable').length,
  }), [miners]);

  const handleAddMiner = async (data: MinerFormData) => {
    await registerMiner({
      name: data.name,
      model: data.model,
      ip_address: data.ip_address,
      mac_address: data.mac_address,
      api_port: data.api_port,
      http_port: data.http_port,
      firmware_type: data.firmware_type,
      api_credentials: data.api_username || data.api_password ? {
        username: data.api_username,
        password: data.api_password,
      } : undefined,
      priority_group: data.priority_group,
      location: data.location,
      target_hashrate_th: data.target_hashrate_th,
    });
    setIsAddDialogOpen(false);
  };

  const handleSelectMiner = (id: string) => {
    setSelectedMiners(prev => 
      prev.includes(id) 
        ? prev.filter(i => i !== id)
        : [...prev, id]
    );
  };

  const handleBatchSleep = async () => {
    if (selectedMiners.length > 0) {
      await sleepMiners(selectedMiners, 'Manual batch sleep');
      setSelectedMiners([]);
    }
  };

  const handleBatchWake = async () => {
    if (selectedMiners.length > 0) {
      await wakeupMiners(selectedMiners, 'Manual batch wake');
      setSelectedMiners([]);
    }
  };

  const handleSleepAllLowPriority = async () => {
    await sleepByPriority(['low', 'curtailable'], 'Sleep all low priority miners');
  };

  const handleSelectAll = () => {
    if (selectedMiners.length === filteredMiners.length) {
      setSelectedMiners([]);
    } else {
      setSelectedMiners(filteredMiners.map(m => m.id));
    }
  };

  return (
    <div className="space-y-6">
      {/* Fleet Stats Header */}
      <FleetStatsHeader stats={fleetStats} loading={loading} />

      {/* Toolbar */}
      <div className="flex flex-col gap-4">
        {/* Primary Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="relative flex-1 sm:flex-none sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder="Search miners..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as StatusFilter)}>
              <SelectTrigger className="w-[130px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="mining">Mining</SelectItem>
                <SelectItem value="sleeping">Sleeping</SelectItem>
                <SelectItem value="offline">Offline</SelectItem>
                <SelectItem value="error">Error</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center gap-2">
            {selectedMiners.length > 0 && (
              <>
                <Button 
                  variant="outline"
                  size="sm"
                  className="border-blue-500/50 text-blue-500 hover:bg-blue-500/10"
                  onClick={handleBatchSleep}
                  disabled={actionLoading}
                >
                  <Moon className="w-4 h-4 mr-1.5" />
                  Sleep ({selectedMiners.length})
                </Button>
                <Button 
                  variant="default"
                  size="sm"
                  onClick={handleBatchWake}
                  disabled={actionLoading}
                >
                  <Power className="w-4 h-4 mr-1.5" />
                  Wake ({selectedMiners.length})
                </Button>
              </>
            )}
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Filter className="w-4 h-4 mr-1.5" />
                  Quick Actions
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Batch Operations</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSelectAll}>
                  {selectedMiners.length === filteredMiners.length ? 'Deselect All' : 'Select All Visible'}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleSleepAllLowPriority}>
                  <Moon className="w-4 h-4 mr-2" />
                  Sleep All Low Priority
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => fetchMiners()}>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh Fleet Status
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button onClick={() => setIsAddDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Miner
            </Button>
          </div>
        </div>

        {/* Priority Filter Tabs */}
        <Tabs value={priorityFilter} onValueChange={(v) => setPriorityFilter(v as PriorityFilter)}>
          <TabsList className="w-full justify-start overflow-x-auto">
            <TabsTrigger value="all" className="gap-2">
              All
              <Badge variant="secondary" className="ml-1">{priorityCounts.all}</Badge>
            </TabsTrigger>
            <TabsTrigger value="critical" className="gap-2">
              <span className="text-destructive">Critical</span>
              <Badge variant="secondary" className="ml-1">{priorityCounts.critical}</Badge>
            </TabsTrigger>
            <TabsTrigger value="high" className="gap-2">
              <span className="text-orange-500">High</span>
              <Badge variant="secondary" className="ml-1">{priorityCounts.high}</Badge>
            </TabsTrigger>
            <TabsTrigger value="medium" className="gap-2">
              Medium
              <Badge variant="secondary" className="ml-1">{priorityCounts.medium}</Badge>
            </TabsTrigger>
            <TabsTrigger value="low" className="gap-2">
              Low
              <Badge variant="secondary" className="ml-1">{priorityCounts.low}</Badge>
            </TabsTrigger>
            <TabsTrigger value="curtailable" className="gap-2">
              Curtailable
              <Badge variant="secondary" className="ml-1">{priorityCounts.curtailable}</Badge>
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Miner Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredMiners.map(miner => (
          <MinerCard
            key={miner.id}
            miner={miner}
            selected={selectedMiners.includes(miner.id)}
            onSelect={handleSelectMiner}
            onSleep={(id) => sleepMiners([id], 'Manual sleep')}
            onWake={(id) => wakeupMiners([id], 'Manual wake')}
            onReboot={(id) => rebootMiners([id])}
            disabled={actionLoading}
          />
        ))}

        {/* Empty State */}
        {filteredMiners.length === 0 && !loading && (
          <Card className="col-span-full border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <div className="p-4 rounded-full bg-muted mb-4">
                <Cpu className="w-10 h-10 text-muted-foreground" />
              </div>
              {miners.length === 0 ? (
                <>
                  <h3 className="text-lg font-semibold">No Miners Registered</h3>
                  <p className="text-sm text-muted-foreground mb-6 text-center max-w-sm">
                    Add your first Bitmain Hydro miner to start managing your fleet remotely.
                  </p>
                  <Button onClick={() => setIsAddDialogOpen(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Your First Miner
                  </Button>
                </>
              ) : (
                <>
                  <h3 className="text-lg font-semibold">No Miners Found</h3>
                  <p className="text-sm text-muted-foreground text-center max-w-sm">
                    No miners match your current search or filter criteria.
                  </p>
                  <Button 
                    variant="outline" 
                    className="mt-4"
                    onClick={() => {
                      setSearchQuery('');
                      setPriorityFilter('all');
                      setStatusFilter('all');
                    }}
                  >
                    Clear Filters
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        )}

        {/* Loading State */}
        {loading && miners.length === 0 && (
          <>
            {[1, 2, 3, 4].map(i => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-4 space-y-4">
                  <div className="flex justify-between">
                    <div className="h-4 w-16 bg-muted rounded" />
                    <div className="h-4 w-20 bg-muted rounded" />
                  </div>
                  <div className="h-6 w-32 bg-muted rounded" />
                  <div className="grid grid-cols-2 gap-3">
                    <div className="h-12 bg-muted rounded" />
                    <div className="h-12 bg-muted rounded" />
                    <div className="h-12 bg-muted rounded" />
                    <div className="h-12 bg-muted rounded" />
                  </div>
                  <div className="h-8 bg-muted rounded" />
                </CardContent>
              </Card>
            ))}
          </>
        )}
      </div>

      {/* Add Miner Dialog */}
      <MinerRegistrationDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onSubmit={handleAddMiner}
        loading={actionLoading}
      />
    </div>
  );
}

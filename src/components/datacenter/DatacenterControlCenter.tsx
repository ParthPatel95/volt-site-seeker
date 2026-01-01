import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Power, 
  Zap, 
  AlertTriangle,
  Shield,
  Activity,
  Settings,
  BarChart3,
  RefreshCw,
  Cpu,
  Gauge,
  Thermometer
} from 'lucide-react';
import { useMinerController } from '@/hooks/useMinerController';
import { useDatacenterAutomation } from '@/hooks/useDatacenterAutomation';
import { MinerFleetManager } from './MinerFleetManager';
import { ShutdownRulesPanel } from './ShutdownRulesPanel';
import { AutomationStatusPanel } from './AutomationStatusPanel';
import { RealTimeAnalytics } from './RealTimeAnalytics';
import { ShutdownTimeline } from './ShutdownTimeline';
import { WhatIfAnalysis } from './WhatIfAnalysis';
import { NotificationSettings } from './NotificationSettings';
import { cn } from '@/lib/utils';

interface DatacenterControlCenterProps {
  currentPrice?: number;
  predictedPrice?: number;
}

export function DatacenterControlCenter({ currentPrice = 0, predictedPrice = 0 }: DatacenterControlCenterProps) {
  const [activeTab, setActiveTab] = useState('status');
  
  const { 
    miners, 
    loading: minerLoading, 
    stats, 
    fetchMiners,
    sleepMiners,
    wakeupMiners
  } = useMinerController();

  const {
    rules,
    analytics,
    latestDecision,
    loading: automationLoading,
    evaluating,
    fetchRules,
    fetchAnalytics,
    evaluateAutomation,
    executeDecision
  } = useDatacenterAutomation();

  useEffect(() => {
    fetchMiners();
    fetchRules();
    fetchAnalytics();
    evaluateAutomation();
  }, []);

  const handleRefreshAll = () => {
    fetchMiners();
    fetchRules();
    fetchAnalytics();
    evaluateAutomation();
  };

  // Find the most restrictive active rule
  const activeRule = rules.find(r => r.is_active);
  const ceilingBuffer = activeRule ? activeRule.price_ceiling_cad - currentPrice : 0;
  const isNearCeiling = activeRule && currentPrice >= (activeRule.soft_ceiling_cad || activeRule.price_ceiling_cad * 0.85);
  const isCeilingBreached = activeRule && currentPrice >= activeRule.price_ceiling_cad;

  const getSystemStatus = () => {
    if (isCeilingBreached) return { label: 'CEILING BREACH', color: 'bg-destructive text-destructive-foreground', icon: AlertTriangle };
    if (isNearCeiling) return { label: 'WARNING', color: 'bg-yellow-500 text-white', icon: AlertTriangle };
    if (stats.sleeping > 0) return { label: 'CURTAILED', color: 'bg-blue-500 text-white', icon: Power };
    return { label: 'OPERATIONAL', color: 'bg-green-500 text-white', icon: Shield };
  };

  const systemStatus = getSystemStatus();
  const StatusIcon = systemStatus.icon;

  const getGridStressColor = (level: string) => {
    switch (level) {
      case 'critical': return 'text-destructive';
      case 'high': return 'text-orange-500';
      case 'elevated': return 'text-yellow-500';
      default: return 'text-green-500';
    }
  };

  // Calculate efficiency
  const avgEfficiency = stats.totalHashrateTH > 0 
    ? ((stats.totalPowerKW * 1000) / stats.totalHashrateTH).toFixed(1)
    : '--';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 shadow-lg">
            <Cpu className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Datacenter Control Center</h2>
            <p className="text-sm text-muted-foreground">Miner Fleet Management & Automated Price Response</p>
          </div>
        </div>
        <Button onClick={handleRefreshAll} disabled={minerLoading || automationLoading}>
          <RefreshCw className={cn("w-4 h-4 mr-2", (minerLoading || automationLoading) && "animate-spin")} />
          Refresh
        </Button>
      </div>

      {/* Status Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* System Status */}
        <Card className="border-2">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">System Status</p>
                <Badge className={cn("text-sm font-bold", systemStatus.color)}>
                  <StatusIcon className="w-3 h-3 mr-1" />
                  {systemStatus.label}
                </Badge>
              </div>
              <div className="p-3 rounded-full bg-muted">
                <Activity className="w-5 h-5 text-muted-foreground" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Current Price vs Ceiling */}
        <Card className="border-2">
          <CardContent className="p-4">
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Price vs Ceiling</p>
              <div className="flex items-end gap-2">
                <span className={cn(
                  "text-2xl font-bold",
                  isCeilingBreached ? "text-destructive" : isNearCeiling ? "text-yellow-500" : "text-foreground"
                )}>
                  CA${currentPrice.toFixed(2)}
                </span>
                <span className="text-sm text-muted-foreground mb-1">
                  / {activeRule ? `CA$${activeRule.price_ceiling_cad}` : 'No ceiling'}
                </span>
              </div>
              {activeRule && (
                <div className="flex items-center gap-2 text-xs">
                  <span className={cn(
                    ceilingBuffer > 50 ? "text-green-500" : ceilingBuffer > 20 ? "text-yellow-500" : "text-destructive"
                  )}>
                    Buffer: CA${ceilingBuffer.toFixed(2)}
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Miner Fleet Status */}
        <Card className="border-2">
          <CardContent className="p-4">
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Miner Fleet</p>
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-500">{stats.mining}</p>
                  <p className="text-xs text-muted-foreground">Mining</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-500">{stats.sleeping}</p>
                  <p className="text-xs text-muted-foreground">Sleeping</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-muted-foreground">{stats.offline}</p>
                  <p className="text-xs text-muted-foreground">Offline</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Hashrate & Power */}
        <Card className="border-2">
          <CardContent className="p-4">
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Active Hashrate</p>
              <div className="flex items-end gap-2">
                <span className="text-2xl font-bold font-mono">{stats.totalHashrateTH.toFixed(1)}</span>
                <span className="text-sm text-muted-foreground mb-1">TH/s</span>
              </div>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Power className="w-3 h-3" />
                  {stats.totalPowerKW.toFixed(1)} kW
                </span>
                <span className="flex items-center gap-1">
                  <Gauge className="w-3 h-3" />
                  {avgEfficiency} J/TH
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Decision Panel */}
      {latestDecision && (
        <Card className={cn(
          "border-2",
          latestDecision.decision === 'shutdown' && "border-destructive bg-destructive/5",
          latestDecision.decision === 'prepare_shutdown' && "border-yellow-500 bg-yellow-500/5",
          latestDecision.decision === 'resume' && "border-green-500 bg-green-500/5"
        )}>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <Gauge className="w-5 h-5" />
                AI Decision Engine
              </CardTitle>
              <Badge variant={evaluating ? "outline" : "secondary"}>
                {evaluating ? "Evaluating..." : "Last updated: " + new Date(latestDecision.timestamp).toLocaleTimeString()}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Decision</p>
                <p className={cn(
                  "text-lg font-bold capitalize",
                  latestDecision.decision === 'shutdown' && "text-destructive",
                  latestDecision.decision === 'prepare_shutdown' && "text-yellow-500",
                  latestDecision.decision === 'resume' && "text-green-500"
                )}>
                  {latestDecision.decision === 'shutdown' ? 'Sleep Miners' : 
                   latestDecision.decision === 'resume' ? 'Wake Miners' :
                   latestDecision.decision.replace('_', ' ')}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Grid Stress</p>
                <p className={cn("text-lg font-bold capitalize", getGridStressColor(latestDecision.grid_stress_level))}>
                  {latestDecision.grid_stress_level}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Confidence</p>
                <p className="text-lg font-bold">{(latestDecision.confidence_score * 100).toFixed(0)}%</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Est. Savings</p>
                <p className="text-lg font-bold text-green-500">CA${latestDecision.estimated_savings.toFixed(2)}/hr</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mt-3 border-t pt-3">{latestDecision.reason}</p>
            
            {(latestDecision.decision === 'shutdown' || latestDecision.decision === 'resume') && (
              <div className="flex gap-2 mt-4">
                <Button 
                  variant={latestDecision.decision === 'shutdown' ? 'destructive' : 'default'}
                  onClick={() => executeDecision(latestDecision)}
                >
                  Execute {latestDecision.decision === 'shutdown' ? 'Sleep' : 'Wake'}
                </Button>
                <Button variant="outline">
                  Override
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="status" className="flex items-center gap-2">
            <Activity className="w-4 h-4" />
            <span className="hidden sm:inline">Status</span>
          </TabsTrigger>
          <TabsTrigger value="miners" className="flex items-center gap-2">
            <Cpu className="w-4 h-4" />
            <span className="hidden sm:inline">Miners</span>
          </TabsTrigger>
          <TabsTrigger value="rules" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            <span className="hidden sm:inline">Rules</span>
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            <span className="hidden sm:inline">Analytics</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Zap className="w-4 h-4" />
            <span className="hidden sm:inline">Alerts</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="status" className="mt-6 space-y-6">
          <AutomationStatusPanel 
            latestDecision={latestDecision}
            analytics={analytics}
            onRefresh={handleRefreshAll}
          />
          <WhatIfAnalysis 
            currentPrice={currentPrice}
            pdus={miners.map(m => ({
              id: m.id,
              name: m.name,
              location: m.location || '',
              priority_group: m.priority_group === 'curtailable' ? 'low' : m.priority_group,
              max_capacity_kw: (m.target_hashrate_th || 0) * 0.015,
              current_load_kw: (m.power_consumption_w || 0) / 1000,
              current_status: m.current_status === 'mining' ? 'online' : m.current_status === 'sleeping' ? 'offline' : m.current_status
            }))}
            rules={rules.map(r => ({
              id: r.id,
              name: r.name,
              price_ceiling_cad: r.price_ceiling_cad,
              soft_ceiling_cad: r.soft_ceiling_cad,
              price_floor_cad: r.price_floor_cad,
              affected_priority_groups: r.affected_priority_groups,
              is_active: r.is_active
            }))}
          />
        </TabsContent>

        <TabsContent value="miners" className="mt-6">
          <MinerFleetManager />
        </TabsContent>

        <TabsContent value="rules" className="mt-6">
          <ShutdownRulesPanel />
        </TabsContent>

        <TabsContent value="analytics" className="mt-6 space-y-6">
          <RealTimeAnalytics analytics={analytics} onRefresh={(days) => fetchAnalytics(days)} />
          <ShutdownTimeline logs={analytics?.recent_logs || []} />
        </TabsContent>

        <TabsContent value="notifications" className="mt-6">
          <NotificationSettings 
            rules={rules.map(r => ({
              id: r.id,
              rule_name: r.name
            }))}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

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
  Server,
  Gauge
} from 'lucide-react';
import { usePDUController } from '@/hooks/usePDUController';
import { useDatacenterAutomation } from '@/hooks/useDatacenterAutomation';
import { PDUDeviceManager } from './PDUDeviceManager';
import { ShutdownRulesPanel } from './ShutdownRulesPanel';
import { AutomationStatusPanel } from './AutomationStatusPanel';
import { CostSavingsAnalytics } from './CostSavingsAnalytics';
import { cn } from '@/lib/utils';

interface DatacenterControlCenterProps {
  currentPrice?: number;
  predictedPrice?: number;
}

export function DatacenterControlCenter({ currentPrice = 0, predictedPrice = 0 }: DatacenterControlCenterProps) {
  const [activeTab, setActiveTab] = useState('status');
  
  const { 
    pdus, 
    loading: pduLoading, 
    stats, 
    fetchPDUs,
    shutdownPDUs,
    powerOnPDUs
  } = usePDUController();

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
    fetchPDUs();
    fetchRules();
    fetchAnalytics();
    evaluateAutomation();
  }, []);

  const handleRefreshAll = () => {
    fetchPDUs();
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
    if (stats.offline > 0) return { label: 'CURTAILED', color: 'bg-orange-500 text-white', icon: Power };
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg">
            <Server className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Datacenter Control Center</h2>
            <p className="text-sm text-muted-foreground">PDU Management & Automated Price Response</p>
          </div>
        </div>
        <Button onClick={handleRefreshAll} disabled={pduLoading || automationLoading}>
          <RefreshCw className={cn("w-4 h-4 mr-2", (pduLoading || automationLoading) && "animate-spin")} />
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

        {/* PDU Status */}
        <Card className="border-2">
          <CardContent className="p-4">
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">PDU Fleet</p>
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-500">{stats.online}</p>
                  <p className="text-xs text-muted-foreground">Online</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-muted-foreground">{stats.offline}</p>
                  <p className="text-xs text-muted-foreground">Offline</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-yellow-500">{stats.shuttingDown + stats.startingUp}</p>
                  <p className="text-xs text-muted-foreground">Transitioning</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Current Load */}
        <Card className="border-2">
          <CardContent className="p-4">
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Active Load</p>
              <div className="flex items-end gap-2">
                <span className="text-2xl font-bold">{stats.totalLoadKw.toFixed(1)}</span>
                <span className="text-sm text-muted-foreground mb-1">kW</span>
              </div>
              {stats.totalCapacityKw > 0 && (
                <div className="w-full bg-muted rounded-full h-2">
                  <div 
                    className="bg-primary h-2 rounded-full transition-all"
                    style={{ width: `${Math.min(100, (stats.totalLoadKw / stats.totalCapacityKw) * 100)}%` }}
                  />
                </div>
              )}
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
                  {latestDecision.decision.replace('_', ' ')}
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
                  Execute {latestDecision.decision === 'shutdown' ? 'Shutdown' : 'Resume'}
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
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="status" className="flex items-center gap-2">
            <Activity className="w-4 h-4" />
            <span className="hidden sm:inline">Status</span>
          </TabsTrigger>
          <TabsTrigger value="pdus" className="flex items-center gap-2">
            <Server className="w-4 h-4" />
            <span className="hidden sm:inline">PDU Devices</span>
          </TabsTrigger>
          <TabsTrigger value="rules" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            <span className="hidden sm:inline">Rules</span>
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            <span className="hidden sm:inline">Analytics</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="status" className="mt-6">
          <AutomationStatusPanel 
            latestDecision={latestDecision}
            analytics={analytics}
            onRefresh={handleRefreshAll}
          />
        </TabsContent>

        <TabsContent value="pdus" className="mt-6">
          <PDUDeviceManager />
        </TabsContent>

        <TabsContent value="rules" className="mt-6">
          <ShutdownRulesPanel />
        </TabsContent>

        <TabsContent value="analytics" className="mt-6">
          <CostSavingsAnalytics analytics={analytics} onRefresh={() => fetchAnalytics()} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

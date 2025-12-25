import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Activity, 
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingDown,
  TrendingUp,
  Zap
} from 'lucide-react';
import { AutomationDecision, AutomationAnalytics, PriceCeilingAlert } from '@/hooks/useDatacenterAutomation';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface AutomationStatusPanelProps {
  latestDecision: AutomationDecision | null;
  analytics: AutomationAnalytics | null;
  onRefresh: () => void;
}

export function AutomationStatusPanel({ latestDecision, analytics, onRefresh }: AutomationStatusPanelProps) {
  
  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'ceiling_breach': return <AlertTriangle className="w-4 h-4 text-destructive" />;
      case 'ceiling_warning': return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'floor_breach': return <TrendingDown className="w-4 h-4 text-green-500" />;
      case 'grid_stress': return <Zap className="w-4 h-4 text-orange-500" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  const getActionBadge = (type: string) => {
    switch (type) {
      case 'shutdown': return <Badge variant="destructive">Shutdown</Badge>;
      case 'resume': return <Badge className="bg-green-500">Resume</Badge>;
      case 'warning': return <Badge className="bg-yellow-500">Warning</Badge>;
      case 'manual_override': return <Badge variant="outline">Manual</Badge>;
      default: return <Badge variant="secondary">{type}</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed': return <Badge className="bg-green-500">Completed</Badge>;
      case 'executing': return <Badge className="bg-blue-500">Executing</Badge>;
      case 'failed': return <Badge variant="destructive">Failed</Badge>;
      case 'cancelled': return <Badge variant="outline">Cancelled</Badge>;
      default: return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      {analytics && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Shutdowns</p>
                  <p className="text-2xl font-bold">{analytics.total_shutdowns}</p>
                </div>
                <div className="p-2 rounded-full bg-destructive/10">
                  <AlertTriangle className="w-5 h-5 text-destructive" />
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">Last {analytics.period_days} days</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Savings</p>
                  <p className="text-2xl font-bold text-green-500">CA${analytics.total_savings_cad.toFixed(0)}</p>
                </div>
                <div className="p-2 rounded-full bg-green-500/10">
                  <TrendingUp className="w-5 h-5 text-green-500" />
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">Estimated from curtailment</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Curtailment Hours</p>
                  <p className="text-2xl font-bold">{analytics.total_curtailment_hours.toFixed(1)}</p>
                </div>
                <div className="p-2 rounded-full bg-muted">
                  <Clock className="w-5 h-5 text-muted-foreground" />
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">Total downtime</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Avg Price Avoided</p>
                  <p className="text-2xl font-bold">CA${analytics.average_price_avoided_cad.toFixed(0)}</p>
                </div>
                <div className="p-2 rounded-full bg-primary/10">
                  <Activity className="w-5 h-5 text-primary" />
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">Per shutdown event</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Active Alerts */}
      {analytics?.active_alerts && analytics.active_alerts.length > 0 && (
        <Card className="border-2 border-yellow-500/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-yellow-500" />
              Active Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analytics.active_alerts.map((alert: PriceCeilingAlert) => (
                <div 
                  key={alert.id}
                  className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    {getAlertIcon(alert.alert_type)}
                    <div>
                      <p className="font-medium capitalize">{alert.alert_type.replace('_', ' ')}</p>
                      <p className="text-sm text-muted-foreground">
                        CA${alert.current_price.toFixed(2)} → Threshold: CA${alert.threshold_price.toFixed(2)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(alert.created_at), 'HH:mm')}
                    </p>
                    {alert.grid_stress_level && (
                      <Badge variant="outline" className="text-xs capitalize">
                        {alert.grid_stress_level}
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Activity Log */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Recent Automation Activity</CardTitle>
            <Button variant="outline" size="sm" onClick={onRefresh}>
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {analytics?.recent_logs && analytics.recent_logs.length > 0 ? (
            <div className="space-y-2">
              {analytics.recent_logs.slice(0, 10).map((log) => (
                <div 
                  key={log.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    {getActionBadge(log.action_type)}
                    <div>
                      <p className="text-sm">
                        {log.affected_pdu_count} PDU(s) • {log.total_load_affected_kw.toFixed(1)} kW
                      </p>
                      {log.trigger_price && (
                        <p className="text-xs text-muted-foreground">
                          Trigger: CA${log.trigger_price.toFixed(2)} → Threshold: CA${log.threshold_price?.toFixed(2)}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    {getStatusBadge(log.status)}
                    <p className="text-xs text-muted-foreground mt-1">
                      {format(new Date(log.executed_at), 'MMM d, HH:mm')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <CheckCircle className="w-12 h-12 text-green-500 mb-4" />
              <p className="text-lg font-medium">No Recent Activity</p>
              <p className="text-sm text-muted-foreground">
                Automation system is monitoring prices
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

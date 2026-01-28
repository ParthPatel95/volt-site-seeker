import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  AlertTriangle, 
  CheckCircle2, 
  RefreshCw, 
  Bell, 
  Shield,
  Clock,
  Activity,
  Zap,
  ExternalLink,
  Rss
} from 'lucide-react';
import { GridAlert, GridRiskLevel, GridAlertStatus } from '@/hooks/useAESOGridAlerts';
import { RealtimeReserves } from '@/hooks/useAESORealtimeReserves';
import { RefreshCountdown } from './RefreshCountdown';

interface GridAlertStatusCardProps {
  alerts: GridAlert[];
  currentStatus: GridAlertStatus | null;
  reserves: RealtimeReserves | null;
  riskLevel: GridRiskLevel;
  loading: boolean;
  onRefresh: () => void;
  lastFetched: Date | null;
  nextRefresh?: Date | null;
}

export function GridAlertStatusCard({
  alerts,
  currentStatus,
  reserves,
  riskLevel,
  loading,
  onRefresh,
  lastFetched,
  nextRefresh
}: GridAlertStatusCardProps) {
  const activeAlerts = alerts.filter(a => a.status === 'active');
  const recentAlerts = alerts.slice(0, 5);

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  const getRiskIcon = () => {
    switch (riskLevel.level) {
      case 'critical':
        return <AlertTriangle className="w-6 h-6 text-red-600 animate-pulse" />;
      case 'high':
        return <AlertTriangle className="w-6 h-6 text-orange-600" />;
      case 'elevated':
        return <Bell className="w-6 h-6 text-yellow-600" />;
      default:
        return <CheckCircle2 className="w-6 h-6 text-green-600" />;
    }
  };

  const getRiskLabel = () => {
    switch (riskLevel.level) {
      case 'critical':
        return 'CRITICAL';
      case 'high':
        return 'HIGH RISK';
      case 'elevated':
        return 'ELEVATED';
      default:
        return 'NORMAL';
    }
  };

  return (
    <div className="space-y-4">
      {/* Main Status Banner */}
      <Card className={`${riskLevel.bgColor} ${riskLevel.borderColor} border-2`}>
        <CardContent className="py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {getRiskIcon()}
              <div>
                <div className="flex items-center gap-2">
                  <span className={`font-bold text-lg ${riskLevel.color}`}>
                    Grid Status: {getRiskLabel()}
                  </span>
                  {currentStatus?.hasActiveAlert && (
                    <Badge variant="destructive" className="animate-pulse">
                      {currentStatus.activeAlertCount} Active Alert{currentStatus.activeAlertCount !== 1 ? 's' : ''}
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  {riskLevel.reason}
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={onRefresh}
              disabled={loading}
              className="shrink-0"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
          
          {/* Auto-refresh countdown and status */}
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-current/10">
            <RefreshCountdown 
              nextRefresh={nextRefresh || null} 
              isLoading={loading} 
              lastFetched={lastFetched}
            />
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Rss className="w-3 h-3" />
              <span>AESO Grid Alert RSS</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Real-time Reserve Risk Indicator */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Reserve Risk Indicator
            </CardTitle>
          </CardHeader>
          <CardContent>
            {reserves ? (
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Total Reserves</span>
                  <span className="font-semibold">{reserves.total_mw.toLocaleString()} MW</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Required</span>
                  <span className="font-semibold">{reserves.required_mw.toLocaleString()} MW</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Margin</span>
                  <Badge variant="outline" className={riskLevel.color}>
                    {reserves.margin_percent > 0 ? '+' : ''}{reserves.margin_percent.toFixed(1)}%
                  </Badge>
                </div>
                
                {/* Visual margin bar */}
                <div className="mt-2">
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-500 ${
                        riskLevel.level === 'critical' ? 'bg-red-500' :
                        riskLevel.level === 'high' ? 'bg-orange-500' :
                        riskLevel.level === 'elevated' ? 'bg-yellow-500' :
                        'bg-green-500'
                      }`}
                      style={{ 
                        width: `${Math.min(100, Math.max(0, (reserves.total_mw / (reserves.required_mw * 1.5)) * 100))}%` 
                      }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>0%</span>
                    <span className="text-center">Required</span>
                    <span>150%</span>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Reserve data loading...
              </p>
            )}
          </CardContent>
        </Card>

        {/* Alert Statistics */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Alert History
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Active Alerts</span>
                <Badge variant={activeAlerts.length > 0 ? 'destructive' : 'secondary'}>
                  {activeAlerts.length}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Alerts (Last 30 Days)</span>
                <span className="font-semibold">{alerts.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">EEA Events</span>
                <span className="font-semibold">
                  {alerts.filter(a => a.alert_type === 'eea').length}
                </span>
              </div>
              {lastFetched && (
                <div className="flex justify-between items-center text-xs text-muted-foreground pt-2 border-t">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Last Updated
                  </span>
                  <span>{formatTimeAgo(lastFetched)}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Alerts Timeline */}
      {recentAlerts.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Zap className="w-4 h-4" />
              Recent Grid Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentAlerts.map((alert, index) => (
                <div 
                  key={alert.id} 
                  className={`flex items-start gap-3 p-3 rounded-lg ${
                    alert.status === 'active' 
                      ? 'bg-red-50 border border-red-200' 
                      : 'bg-muted/50'
                  }`}
                >
                  <div className={`mt-0.5 ${
                    alert.status === 'active' ? 'text-red-600' : 'text-muted-foreground'
                  }`}>
                    {alert.status === 'active' ? (
                      <AlertTriangle className="w-4 h-4" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm truncate">{alert.title}</span>
                      <Badge 
                        variant={alert.status === 'active' ? 'destructive' : 'secondary'}
                        className="text-xs shrink-0"
                      >
                        {alert.status === 'active' ? 'Active' : 'Ended'}
                      </Badge>
                    </div>
                    {alert.description && (
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {alert.description}
                      </p>
                    )}
                    <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                      <span>{new Date(alert.published_at).toLocaleDateString()}</span>
                      {alert.alert_type && (
                        <Badge variant="outline" className="text-xs">
                          {alert.alert_type.toUpperCase()}
                        </Badge>
                      )}
                      {alert.link && (
                        <a 
                          href={alert.link} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 hover:text-primary"
                        >
                          <ExternalLink className="w-3 h-3" />
                          Details
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* No Alerts State */}
      {recentAlerts.length === 0 && !loading && (
        <Card>
          <CardContent className="py-8 text-center">
            <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-3" />
            <h3 className="font-medium text-lg">No Recent Grid Alerts</h3>
            <p className="text-sm text-muted-foreground mt-1">
              The Alberta grid is operating normally with no active alerts.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

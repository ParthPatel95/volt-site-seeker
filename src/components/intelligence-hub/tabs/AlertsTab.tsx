
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { 
  Bell, 
  BellOff, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Settings,
  Plus,
  Trash2,
  Eye
} from 'lucide-react';
import { useIntelligenceHub } from '../hooks/useIntelligenceHub';
import { IntelAlert } from '../types/intelligence-hub.types';

export function AlertsTab() {
  const { state, markAlertRead } = useIntelligenceHub();
  const { alerts, watchlist } = state;
  const [showSettings, setShowSettings] = useState(false);

  const unreadAlerts = alerts.filter(a => !a.isRead);
  const readAlerts = alerts.filter(a => a.isRead);

  const severityConfig = {
    critical: { color: 'bg-red-500', label: 'Critical', icon: AlertTriangle },
    high: { color: 'bg-orange-500', label: 'High', icon: AlertTriangle },
    medium: { color: 'bg-yellow-500', label: 'Medium', icon: Clock },
    low: { color: 'bg-blue-500', label: 'Low', icon: Bell }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Alerts & Monitoring</h2>
          <p className="text-sm text-muted-foreground">
            {unreadAlerts.length} unread alert{unreadAlerts.length !== 1 ? 's' : ''} • {watchlist.length} items watched
          </p>
        </div>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => setShowSettings(!showSettings)}
        >
          <Settings className="w-4 h-4 mr-2" />
          Settings
        </Button>
      </div>

      {/* Alert Settings Panel */}
      {showSettings && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Alert Configuration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="space-y-0.5">
                  <Label>New Opportunity Alerts</Label>
                  <p className="text-xs text-muted-foreground">Notify when new sites found</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="space-y-0.5">
                  <Label>Distress Signal Alerts</Label>
                  <p className="text-xs text-muted-foreground">Corporate distress indicators</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="space-y-0.5">
                  <Label>Price Change Alerts</Label>
                  <p className="text-xs text-muted-foreground">Asset valuation changes</p>
                </div>
                <Switch />
              </div>
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="space-y-0.5">
                  <Label>Email Notifications</Label>
                  <p className="text-xs text-muted-foreground">Send to registered email</p>
                </div>
                <Switch />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Watchlist */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base">
              <Eye className="w-4 h-4" />
              Watchlist
            </CardTitle>
            <Badge variant="secondary">{watchlist.length} items</Badge>
          </div>
        </CardHeader>
        <CardContent>
          {watchlist.length > 0 ? (
            <div className="space-y-2">
              {watchlist.slice(0, 5).map(id => {
                const opp = state.opportunities.find(o => o.id === id) || state.savedOpportunities.find(o => o.id === id);
                return opp ? (
                  <div key={id} className="flex items-center justify-between p-2 bg-muted/50 rounded-lg">
                    <span className="text-sm font-medium truncate">{opp.name}</span>
                    <Badge variant="outline" className="text-xs">{opp.type.replace('_', ' ')}</Badge>
                  </div>
                ) : null;
              })}
              {watchlist.length > 5 && (
                <p className="text-xs text-muted-foreground text-center">
                  +{watchlist.length - 5} more items
                </p>
              )}
            </div>
          ) : (
            <div className="text-center py-6 text-muted-foreground">
              <BellOff className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No items in watchlist</p>
              <p className="text-xs">Add opportunities to monitor changes</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Unread Alerts */}
      {unreadAlerts.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <AlertTriangle className="w-4 h-4 text-yellow-500" />
              New Alerts
              <Badge variant="destructive" className="ml-2">{unreadAlerts.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {unreadAlerts.map(alert => (
              <AlertCard 
                key={alert.id} 
                alert={alert} 
                onMarkRead={() => markAlertRead(alert.id)}
                severityConfig={severityConfig}
              />
            ))}
          </CardContent>
        </Card>
      )}

      {/* Read Alerts */}
      {readAlerts.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base text-muted-foreground">
              <CheckCircle2 className="w-4 h-4" />
              Previous Alerts
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {readAlerts.slice(0, 5).map(alert => (
              <AlertCard 
                key={alert.id} 
                alert={alert} 
                severityConfig={severityConfig}
                muted
              />
            ))}
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {alerts.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Bell className="w-16 h-16 text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No Alerts Yet</h3>
            <p className="text-sm text-muted-foreground max-w-md">
              Add opportunities to your watchlist to receive alerts about status changes, price updates, and new distress signals.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

interface AlertCardProps {
  alert: IntelAlert;
  onMarkRead?: () => void;
  severityConfig: Record<string, { color: string; label: string; icon: React.ElementType }>;
  muted?: boolean;
}

function AlertCard({ alert, onMarkRead, severityConfig, muted }: AlertCardProps) {
  const config = severityConfig[alert.severity];
  const Icon = config.icon;

  return (
    <div className={`flex items-start gap-3 p-3 rounded-lg ${muted ? 'bg-muted/30' : 'bg-muted/50'}`}>
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${config.color}/20`}>
        <Icon className={`w-4 h-4 ${config.color.replace('bg-', 'text-')}`} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h4 className={`text-sm font-medium ${muted ? 'text-muted-foreground' : 'text-foreground'}`}>
            {alert.title}
          </h4>
          <Badge variant="outline" className="text-[10px]">{config.label}</Badge>
        </div>
        <p className="text-xs text-muted-foreground line-clamp-2">{alert.description}</p>
        <p className="text-[10px] text-muted-foreground mt-1">
          {new Date(alert.createdAt).toLocaleDateString()}
        </p>
      </div>
      {onMarkRead && (
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={onMarkRead}>
          <CheckCircle2 className="w-4 h-4" />
        </Button>
      )}
    </div>
  );
}

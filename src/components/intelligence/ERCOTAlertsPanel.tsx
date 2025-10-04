import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  AlertTriangle, 
  X, 
  Trash2, 
  Bell,
  TrendingUp,
  Zap,
  Activity
} from 'lucide-react';

interface Alert {
  id: string;
  type: string;
  severity: string;
  message: string;
  timestamp: string;
}

interface ERCOTAlertsPanelProps {
  alerts?: Alert[];
  onDismissAlert?: (alertId: string) => void;
  onClearAll?: () => void;
}

export function ERCOTAlertsPanel({ alerts = [], onDismissAlert, onClearAll }: ERCOTAlertsPanelProps) {
  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'price_volatility':
      case 'historical_prices':
        return TrendingUp;
      case 'outage':
        return AlertTriangle;
      case 'market_stress':
        return Activity;
      default:
        return Zap;
    }
  };

  const getAlertColor = (severity: string) => {
    switch (severity) {
      case 'high':
      case 'critical':
        return 'bg-red-50 dark:bg-red-900/20 border-red-200';
      case 'medium':
        return 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200';
      default:
        return 'bg-blue-50 dark:bg-blue-900/20 border-blue-200';
    }
  };

  const getBadgeVariant = (severity: string) => {
    switch (severity) {
      case 'high':
      case 'critical':
        return 'destructive';
      case 'medium':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  if (alerts.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-green-600" />
            <span>System Alerts</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Bell className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="font-medium text-lg mb-2">All Clear!</h3>
            <p className="text-sm text-muted-foreground">
              No active alerts at this time. The ERCOT system is operating normally.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-orange-600" />
            <span>System Alerts</span>
            <Badge variant="destructive">{alerts.length}</Badge>
          </CardTitle>
          {alerts.length > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onClearAll}
              className="text-xs"
            >
              <Trash2 className="w-4 h-4 mr-1" />
              Clear All
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {alerts.map((alert) => {
            const Icon = getAlertIcon(alert.type);
            return (
              <div 
                key={alert.id}
                className={`p-4 rounded-lg border ${getAlertColor(alert.severity)} transition-all`}
              >
                <div className="flex items-start gap-3">
                  <Icon className="w-5 h-5 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant={getBadgeVariant(alert.severity)} className="text-xs">
                        {alert.severity.toUpperCase()}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {new Date(alert.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="text-sm font-medium">{alert.message}</p>
                  </div>
                  {onDismissAlert && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDismissAlert(alert.id)}
                      className="flex-shrink-0"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

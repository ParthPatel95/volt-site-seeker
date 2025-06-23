
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  AlertTriangle, 
  X, 
  Trash2, 
  Bell,
  TrendingUp,
  Zap,
  Activity
} from 'lucide-react';

interface AESOAlertsPanelProps {
  alerts: Array<{
    id: string;
    type: string;
    severity: string;
    message: string;
    timestamp: string;
  }>;
  onDismissAlert: (alertId: string) => void;
  onClearAll: () => void;
}

export function AESOAlertsPanel({ alerts, onDismissAlert, onClearAll }: AESOAlertsPanelProps) {
  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'price_volatility':
      case 'historical_prices':
        return TrendingUp;
      case 'outage':
        return AlertTriangle;
      case 'market_stress':
        return Activity;
      case 'risk':
        return Zap;
      default:
        return Bell;
    }
  };

  const getAlertColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'destructive';
      case 'medium':
        return 'default';
      case 'low':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  return (
    <div className="space-y-6">
      {/* Alert Summary */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center">
              <Bell className="w-5 h-5 mr-2 text-orange-600" />
              Market Alerts
              {alerts.length > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {alerts.length}
                </Badge>
              )}
            </CardTitle>
            {alerts.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={onClearAll}
                className="flex items-center"
              >
                <Trash2 className="w-4 h-4 mr-1" />
                Clear All
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {alerts.length > 0 ? (
            <div className="space-y-4">
              {alerts.map((alert) => {
                const AlertIcon = getAlertIcon(alert.type);
                return (
                  <Alert 
                    key={alert.id} 
                    className={`border-l-4 ${
                      alert.severity === 'high' ? 'border-l-red-500 bg-red-50' :
                      alert.severity === 'medium' ? 'border-l-yellow-500 bg-yellow-50' :
                      'border-l-blue-500 bg-blue-50'
                    }`}
                  >
                    <div className="flex items-start justify-between w-full">
                      <div className="flex items-start space-x-3">
                        <AlertIcon className={`h-5 w-5 mt-0.5 ${
                          alert.severity === 'high' ? 'text-red-600' :
                          alert.severity === 'medium' ? 'text-yellow-600' :
                          'text-blue-600'
                        }`} />
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <Badge variant={getAlertColor(alert.severity) as any}>
                              {alert.severity} priority
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {alert.type.replace('_', ' ')}
                            </Badge>
                          </div>
                          <AlertDescription className="text-sm font-medium">
                            {alert.message}
                          </AlertDescription>
                          <p className="text-xs text-muted-foreground mt-1">
                            {new Date(alert.timestamp).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDismissAlert(alert.id)}
                        className="flex-shrink-0 h-8 w-8 p-0"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </Alert>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-muted-foreground">No active alerts</p>
              <p className="text-sm text-muted-foreground mt-1">
                You'll be notified of important market events and conditions
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Alert Statistics */}
      {alerts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Activity className="w-5 h-5 mr-2 text-blue-600" />
              Alert Statistics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-3 bg-red-50 rounded-lg">
                <div className="text-2xl font-bold text-red-600">
                  {alerts.filter(a => a.severity === 'high').length}
                </div>
                <div className="text-sm text-red-700">High Priority</div>
              </div>
              <div className="text-center p-3 bg-yellow-50 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600">
                  {alerts.filter(a => a.severity === 'medium').length}
                </div>
                <div className="text-sm text-yellow-700">Medium Priority</div>
              </div>
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {alerts.filter(a => a.severity === 'low').length}
                </div>
                <div className="text-sm text-blue-700">Low Priority</div>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-gray-600">
                  {alerts.length}
                </div>
                <div className="text-sm text-gray-700">Total Alerts</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Alert Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Bell className="w-5 h-5 mr-2 text-green-600" />
            Alert Configuration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Alerts are automatically generated based on market conditions and thresholds:
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <h4 className="font-semibold text-sm">Price Alerts</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>High volatility</span>
                    <Badge variant="outline">&gt; 75 points</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Price spikes</span>
                    <Badge variant="outline">&gt; $150/MWh</Badge>
                  </div>
                </div>
              </div>
              
              <div className="space-y-3">
                <h4 className="font-semibold text-sm">System Alerts</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Market stress</span>
                    <Badge variant="outline">&gt; 70/100</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Major outages</span>
                    <Badge variant="outline">&gt; 1 GW</Badge>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

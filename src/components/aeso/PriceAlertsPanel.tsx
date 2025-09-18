import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { 
  Bell, 
  Plus, 
  Trash2, 
  TrendingUp, 
  TrendingDown, 
  Zap,
  AlertTriangle,
  Settings
} from 'lucide-react';
import { usePriceAlerts, PriceAlert } from '@/hooks/usePriceAlerts';

export function PriceAlertsPanel() {
  const { alerts, loading, currentPrice, createAlert, deleteAlert, updateAlert, createQuickAlert } = usePriceAlerts();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newAlert, setNewAlert] = useState<Partial<PriceAlert>>({
    alert_type: 'price_threshold',
    threshold_value: 100,
    condition: 'above',
    is_active: true,
    notification_method: 'app'
  });

  const handleCreateAlert = async () => {
    try {
      await createAlert(newAlert as Omit<PriceAlert, 'id' | 'user_id' | 'created_at'>);
      setShowCreateForm(false);
      setNewAlert({
        alert_type: 'price_threshold',
        threshold_value: 100,
        condition: 'above',
        is_active: true,
        notification_method: 'app'
      });
    } catch (error) {
      // Error handled in hook
    }
  };

  const handleToggleAlert = async (alert: PriceAlert) => {
    try {
      await updateAlert({
        ...alert,
        is_active: !alert.is_active
      });
    } catch (error) {
      // Error handled in hook
    }
  };

  const getAlertIcon = (alertType: string, condition: string) => {
    if (alertType === 'spike_detection') return <Zap className="w-4 h-4 text-yellow-500" />;
    if (condition === 'above') return <TrendingUp className="w-4 h-4 text-red-500" />;
    if (condition === 'below') return <TrendingDown className="w-4 h-4 text-green-500" />;
    return <Bell className="w-4 h-4" />;
  };

  const getAlertDescription = (alert: PriceAlert) => {
    if (alert.alert_type === 'spike_detection') {
      return `Price spike alert (${alert.threshold_value}% threshold)`;
    }
    return `${alert.condition === 'above' ? 'Above' : 'Below'} CA$${alert.threshold_value}/MWh`;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-blue-600" />
            Price Alerts
            {currentPrice && (
              <Badge variant="outline" className="ml-2">
                Current: CA${currentPrice.toFixed(2)}/MWh
              </Badge>
            )}
          </CardTitle>
          <Button 
            onClick={() => setShowCreateForm(true)} 
            size="sm"
            disabled={loading}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Alert
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Quick Alert Actions */}
        <div className="flex flex-wrap gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => createQuickAlert('spike')}
            className="flex items-center gap-1"
          >
            <Zap className="w-3 h-3" />
            Spike Alert
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => createQuickAlert('high', 100)}
            className="flex items-center gap-1"
          >
            <TrendingUp className="w-3 h-3" />
            High Price ($100)
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => createQuickAlert('low', 30)}
            className="flex items-center gap-1"
          >
            <TrendingDown className="w-3 h-3" />
            Low Price ($30)
          </Button>
        </div>

        {/* Create Alert Form */}
        {showCreateForm && (
          <div className="p-4 border rounded-lg space-y-3 bg-muted/50">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Create New Alert</h4>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setShowCreateForm(false)}
              >
                Cancel
              </Button>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium">Alert Type</label>
                <Select 
                  value={newAlert.alert_type} 
                  onValueChange={(value) => setNewAlert({...newAlert, alert_type: value as any})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="price_threshold">Price Threshold</SelectItem>
                    <SelectItem value="spike_detection">Spike Detection</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium">Condition</label>
                <Select 
                  value={newAlert.condition} 
                  onValueChange={(value) => setNewAlert({...newAlert, condition: value as any})}
                  disabled={newAlert.alert_type === 'spike_detection'}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="above">Above</SelectItem>
                    <SelectItem value="below">Below</SelectItem>
                    <SelectItem value="spike">Spike</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium">
                  {newAlert.alert_type === 'spike_detection' ? 'Spike % Threshold' : 'Price Threshold (CAD/MWh)'}
                </label>
                <Input
                  type="number"
                  value={newAlert.threshold_value}
                  onChange={(e) => setNewAlert({...newAlert, threshold_value: parseFloat(e.target.value)})}
                  placeholder={newAlert.alert_type === 'spike_detection' ? '50' : '100'}
                />
              </div>

              <div>
                <label className="text-sm font-medium">Notification</label>
                <Select 
                  value={newAlert.notification_method} 
                  onValueChange={(value) => setNewAlert({...newAlert, notification_method: value as any})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="app">App Notification</SelectItem>
                    <SelectItem value="email">Email</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button onClick={handleCreateAlert} className="w-full">
              Create Alert
            </Button>
          </div>
        )}

        {/* Existing Alerts */}
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          </div>
        ) : alerts.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <AlertTriangle className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>No price alerts configured</p>
            <p className="text-sm">Create alerts to monitor AESO pricing</p>
          </div>
        ) : (
          <div className="space-y-2">
            {alerts.map((alert) => (
              <div 
                key={alert.id} 
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div className="flex items-center gap-3">
                  {getAlertIcon(alert.alert_type, alert.condition)}
                  <div>
                    <div className="font-medium text-sm">
                      {getAlertDescription(alert)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {alert.notification_method === 'email' ? 'Email notification' : 'App notification'}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Switch
                    checked={alert.is_active}
                    onCheckedChange={() => handleToggleAlert(alert)}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => deleteAlert(alert.id!)}
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

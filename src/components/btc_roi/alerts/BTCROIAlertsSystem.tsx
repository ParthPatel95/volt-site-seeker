
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Bell, Plus, Trash2, TrendingUp, TrendingDown, AlertTriangle, DollarSign, Zap } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Alert {
  id: string;
  name: string;
  type: 'price_above' | 'price_below' | 'profitability_above' | 'profitability_below' | 'network_difficulty';
  value: number;
  isActive: boolean;
  triggered: boolean;
  lastTriggered?: Date;
  description: string;
}

interface BTCROIAlertsSystemProps {
  currentBTCPrice?: number;
  currentProfitability?: number;
  networkDifficulty?: number;
}

export const BTCROIAlertsSystem: React.FC<BTCROIAlertsSystemProps> = ({
  currentBTCPrice = 0,
  currentProfitability = 0,
  networkDifficulty = 0
}) => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [newAlert, setNewAlert] = useState({
    name: '',
    type: 'price_above' as Alert['type'],
    value: 0,
    description: ''
  });
  const { toast } = useToast();

  // Load alerts from localStorage on mount
  useEffect(() => {
    const savedAlerts = localStorage.getItem('btc-roi-alerts');
    if (savedAlerts) {
      setAlerts(JSON.parse(savedAlerts));
    }
  }, []);

  // Save alerts to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('btc-roi-alerts', JSON.stringify(alerts));
  }, [alerts]);

  // Check alerts against current values
  useEffect(() => {
    alerts.forEach(alert => {
      if (!alert.isActive || alert.triggered) return;

      let shouldTrigger = false;
      let currentValue = 0;

      switch (alert.type) {
        case 'price_above':
          currentValue = currentBTCPrice;
          shouldTrigger = currentBTCPrice >= alert.value;
          break;
        case 'price_below':
          currentValue = currentBTCPrice;
          shouldTrigger = currentBTCPrice <= alert.value;
          break;
        case 'profitability_above':
          currentValue = currentProfitability;
          shouldTrigger = currentProfitability >= alert.value;
          break;
        case 'profitability_below':
          currentValue = currentProfitability;
          shouldTrigger = currentProfitability <= alert.value;
          break;
        case 'network_difficulty':
          currentValue = networkDifficulty;
          shouldTrigger = Math.abs(networkDifficulty - alert.value) / alert.value > 0.05; // 5% change
          break;
      }

      if (shouldTrigger) {
        triggerAlert(alert, currentValue);
      }
    });
  }, [currentBTCPrice, currentProfitability, networkDifficulty, alerts]);

  const triggerAlert = (alert: Alert, currentValue: number) => {
    setAlerts(prev => prev.map(a => 
      a.id === alert.id 
        ? { ...a, triggered: true, lastTriggered: new Date() }
        : a
    ));

    toast({
      title: `🚨 Alert: ${alert.name}`,
      description: `${alert.description} (Current: ${formatValue(alert.type, currentValue)})`,
      variant: "default"
    });
  };

  const formatValue = (type: Alert['type'], value: number) => {
    switch (type) {
      case 'price_above':
      case 'price_below':
        return `$${value.toLocaleString()}`;
      case 'profitability_above':
      case 'profitability_below':
        return `${value.toFixed(2)}%`;
      case 'network_difficulty':
        return `${(value / 1e12).toFixed(2)}T`;
      default:
        return value.toString();
    }
  };

  const getAlertIcon = (type: Alert['type']) => {
    switch (type) {
      case 'price_above':
      case 'price_below':
        return <DollarSign className="w-4 h-4" />;
      case 'profitability_above':
      case 'profitability_below':
        return <TrendingUp className="w-4 h-4" />;
      case 'network_difficulty':
        return <Zap className="w-4 h-4" />;
      default:
        return <Bell className="w-4 h-4" />;
    }
  };

  const getAlertTypeLabel = (type: Alert['type']) => {
    const labels = {
      price_above: 'BTC Price Above',
      price_below: 'BTC Price Below',
      profitability_above: 'Profitability Above',
      profitability_below: 'Profitability Below',
      network_difficulty: 'Network Difficulty Change'
    };
    return labels[type];
  };

  const handleCreateAlert = () => {
    if (!newAlert.name || !newAlert.value) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    const alert: Alert = {
      id: Date.now().toString(),
      name: newAlert.name,
      type: newAlert.type,
      value: newAlert.value,
      isActive: true,
      triggered: false,
      description: newAlert.description || `Alert when ${getAlertTypeLabel(newAlert.type).toLowerCase()} ${formatValue(newAlert.type, newAlert.value)}`
    };

    setAlerts(prev => [...prev, alert]);
    setNewAlert({ name: '', type: 'price_above', value: 0, description: '' });
    setIsCreating(false);

    toast({
      title: "Alert Created",
      description: `"${alert.name}" alert has been set up successfully`,
      variant: "default"
    });
  };

  const handleDeleteAlert = (id: string) => {
    setAlerts(prev => prev.filter(a => a.id !== id));
    toast({
      title: "Alert Deleted",
      description: "Alert has been removed",
      variant: "default"
    });
  };

  const handleToggleAlert = (id: string, isActive: boolean) => {
    setAlerts(prev => prev.map(a => 
      a.id === id 
        ? { ...a, isActive, triggered: false } // Reset triggered state when reactivating
        : a
    ));
  };

  const resetTriggeredAlert = (id: string) => {
    setAlerts(prev => prev.map(a => 
      a.id === id 
        ? { ...a, triggered: false }
        : a
    ));
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Smart Alerts System
          </CardTitle>
          <Button 
            onClick={() => setIsCreating(true)}
            size="sm"
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            New Alert
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Values Display */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-muted rounded-lg">
          <div className="text-center">
            <div className="text-sm text-muted-foreground">BTC Price</div>
            <div className="text-lg font-semibold">${currentBTCPrice.toLocaleString()}</div>
          </div>
          <div className="text-center">
            <div className="text-sm text-muted-foreground">Current Profitability</div>
            <div className="text-lg font-semibold">{currentProfitability.toFixed(2)}%</div>
          </div>
          <div className="text-center">
            <div className="text-sm text-muted-foreground">Network Difficulty</div>
            <div className="text-lg font-semibold">{(networkDifficulty / 1e12).toFixed(2)}T</div>
          </div>
        </div>

        {/* Create New Alert Form */}
        {isCreating && (
          <Card className="border-primary/20 bg-primary/5">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Create New Alert</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="alertName">Alert Name</Label>
                  <Input
                    id="alertName"
                    value={newAlert.name}
                    onChange={(e) => setNewAlert(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., High BTC Price Alert"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="alertType">Alert Type</Label>
                  <Select value={newAlert.type} onValueChange={(value: Alert['type']) => setNewAlert(prev => ({ ...prev, type: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="price_above">BTC Price Above</SelectItem>
                      <SelectItem value="price_below">BTC Price Below</SelectItem>
                      <SelectItem value="profitability_above">Profitability Above</SelectItem>
                      <SelectItem value="profitability_below">Profitability Below</SelectItem>
                      <SelectItem value="network_difficulty">Network Difficulty Change</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="alertValue">Trigger Value</Label>
                <Input
                  id="alertValue"
                  type="number"
                  value={newAlert.value}
                  onChange={(e) => setNewAlert(prev => ({ ...prev, value: parseFloat(e.target.value) || 0 }))}
                  placeholder={
                    newAlert.type.includes('price') ? 'e.g., 100000' :
                    newAlert.type.includes('profitability') ? 'e.g., 25' :
                    'e.g., 50000000000000'
                  }
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="alertDescription">Description (Optional)</Label>
                <Input
                  id="alertDescription"
                  value={newAlert.description}
                  onChange={(e) => setNewAlert(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Custom alert description..."
                />
              </div>
              
              <div className="flex gap-2">
                <Button onClick={handleCreateAlert}>Create Alert</Button>
                <Button variant="outline" onClick={() => setIsCreating(false)}>Cancel</Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Alerts List */}
        <div className="space-y-3">
          {alerts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Bell className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No alerts configured yet</p>
              <p className="text-sm">Create your first alert to get notified of important changes</p>
            </div>
          ) : (
            alerts.map(alert => (
                <Card key={alert.id} className={`${alert.triggered ? 'border-orange-500/30 bg-orange-500/5' : ''}`}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-full ${alert.isActive ? 'bg-primary/10' : 'bg-muted'}`}>
                        {getAlertIcon(alert.type)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium">{alert.name}</h3>
                          <Badge variant={alert.isActive ? 'default' : 'secondary'}>
                            {alert.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                          {alert.triggered && (
                            <Badge variant="destructive" className="flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3" />
                              Triggered
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {getAlertTypeLabel(alert.type)} {formatValue(alert.type, alert.value)}
                        </p>
                        {alert.lastTriggered && (
                          <p className="text-xs text-muted-foreground">
                            Last triggered: {alert.lastTriggered.toLocaleString()}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {alert.triggered && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => resetTriggeredAlert(alert.id)}
                        >
                          Reset
                        </Button>
                      )}
                      <Switch
                        checked={alert.isActive}
                        onCheckedChange={(checked) => handleToggleAlert(alert.id, checked)}
                      />
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDeleteAlert(alert.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};

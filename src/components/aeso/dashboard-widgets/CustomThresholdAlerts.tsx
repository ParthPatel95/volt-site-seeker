import { useState, useEffect } from 'react';
import { Bell, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

export interface ThresholdAlert {
  id: string;
  metric: 'price' | 'demand' | 'renewable_percentage';
  condition: 'above' | 'below';
  value: number;
  label: string;
}

interface CustomThresholdAlertsProps {
  currentData?: {
    price?: number;
    demand?: number;
    renewable_percentage?: number;
  };
}

export function CustomThresholdAlerts({ currentData }: CustomThresholdAlertsProps) {
  const [alerts, setAlerts] = useState<ThresholdAlert[]>([]);
  const [open, setOpen] = useState(false);
  const [newAlert, setNewAlert] = useState<Partial<ThresholdAlert>>({
    metric: 'price',
    condition: 'above',
    value: 0,
    label: ''
  });
  const { toast } = useToast();

  useEffect(() => {
    // Check alerts against current data
    if (!currentData) return;

    alerts.forEach(alert => {
      let currentValue: number | undefined;
      
      switch (alert.metric) {
        case 'price':
          currentValue = currentData.price;
          break;
        case 'demand':
          currentValue = currentData.demand;
          break;
        case 'renewable_percentage':
          currentValue = currentData.renewable_percentage;
          break;
      }

      if (currentValue === undefined) return;

      const triggered = alert.condition === 'above' 
        ? currentValue > alert.value 
        : currentValue < alert.value;

      if (triggered) {
        toast({
          title: `Alert: ${alert.label}`,
          description: `${alert.metric} is ${alert.condition} ${alert.value} (current: ${currentValue.toFixed(2)})`,
          variant: 'destructive'
        });
      }
    });
  }, [currentData, alerts, toast]);

  const addAlert = () => {
    if (!newAlert.label || newAlert.value === undefined) return;

    const alert: ThresholdAlert = {
      id: Date.now().toString(),
      metric: newAlert.metric as any,
      condition: newAlert.condition as any,
      value: newAlert.value,
      label: newAlert.label
    };

    setAlerts([...alerts, alert]);
    setNewAlert({ metric: 'price', condition: 'above', value: 0, label: '' });
    setOpen(false);
    
    toast({
      title: 'Alert Created',
      description: `Alert "${alert.label}" has been created`
    });
  };

  const removeAlert = (id: string) => {
    setAlerts(alerts.filter(a => a.id !== id));
    toast({
      title: 'Alert Removed',
      description: 'The alert has been removed'
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          <span className="font-medium">Custom Alerts</span>
          <Badge variant="secondary">{alerts.length}</Badge>
        </div>
        
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Alert
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Threshold Alert</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Alert Label</Label>
                <Input
                  placeholder="e.g., High Price Warning"
                  value={newAlert.label || ''}
                  onChange={(e) => setNewAlert({ ...newAlert, label: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>Metric</Label>
                <Select
                  value={newAlert.metric}
                  onValueChange={(value: any) => setNewAlert({ ...newAlert, metric: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="price">Price ($/MWh)</SelectItem>
                    <SelectItem value="demand">Demand (MW)</SelectItem>
                    <SelectItem value="renewable_percentage">Renewable %</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Condition</Label>
                  <Select
                    value={newAlert.condition}
                    onValueChange={(value: any) => setNewAlert({ ...newAlert, condition: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="above">Above</SelectItem>
                      <SelectItem value="below">Below</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Value</Label>
                  <Input
                    type="number"
                    value={newAlert.value || 0}
                    onChange={(e) => setNewAlert({ ...newAlert, value: parseFloat(e.target.value) })}
                  />
                </div>
              </div>

              <Button onClick={addAlert} className="w-full">
                Create Alert
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-2">
        {alerts.map(alert => (
          <Card key={alert.id} className="p-3">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="font-medium">{alert.label}</div>
                <div className="text-sm text-muted-foreground">
                  {alert.metric} {alert.condition} {alert.value}
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => removeAlert(alert.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </Card>
        ))}
        
        {alerts.length === 0 && (
          <div className="text-center text-muted-foreground py-8">
            No alerts configured. Click "Add Alert" to create one.
          </div>
        )}
      </div>
    </div>
  );
}

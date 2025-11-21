import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Bell, Plus, Trash2, AlertTriangle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface AlertCondition {
  id: string;
  field: string;
  operator: '>' | '<' | '=' | '>=' | '<=' | '!=';
  value: number;
  logic?: 'AND' | 'OR';
}

interface AlertConfig {
  enabled: boolean;
  name: string;
  conditions: AlertCondition[];
  notification: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
  snoozeUntil?: Date;
}

interface AlertConfigurationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  widgetId: string;
  currentConfig?: AlertConfig;
  onSave: (config: AlertConfig) => void;
}

export function AlertConfigurationModal({
  open,
  onOpenChange,
  widgetId,
  currentConfig,
  onSave
}: AlertConfigurationModalProps) {
  const [config, setConfig] = useState<AlertConfig>(currentConfig || {
    enabled: true,
    name: 'New Alert',
    conditions: [],
    notification: { email: true, push: false, sms: false }
  });

  const addCondition = () => {
    const newCondition: AlertCondition = {
      id: Math.random().toString(36).substr(2, 9),
      field: 'pool_price',
      operator: '>',
      value: 100,
      logic: config.conditions.length > 0 ? 'AND' : undefined
    };
    setConfig({
      ...config,
      conditions: [...config.conditions, newCondition]
    });
  };

  const removeCondition = (id: string) => {
    setConfig({
      ...config,
      conditions: config.conditions.filter(c => c.id !== id)
    });
  };

  const updateCondition = (id: string, updates: Partial<AlertCondition>) => {
    setConfig({
      ...config,
      conditions: config.conditions.map(c => 
        c.id === id ? { ...c, ...updates } : c
      )
    });
  };

  const handleSave = () => {
    onSave(config);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-primary" />
            Configure Alert
          </DialogTitle>
          <DialogDescription>
            Set up conditions and notifications for this widget
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Alert Name & Status */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="alert-name">Alert Name</Label>
              <div className="flex items-center gap-2">
                <Label htmlFor="alert-enabled" className="text-sm text-muted-foreground">
                  Enabled
                </Label>
                <Switch
                  id="alert-enabled"
                  checked={config.enabled}
                  onCheckedChange={(enabled) => setConfig({ ...config, enabled })}
                />
              </div>
            </div>
            <Input
              id="alert-name"
              value={config.name}
              onChange={(e) => setConfig({ ...config, name: e.target.value })}
              placeholder="e.g., High Price Alert"
            />
          </div>

          {/* Conditions */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Conditions</Label>
              <Button size="sm" variant="outline" onClick={addCondition}>
                <Plus className="h-4 w-4 mr-1" />
                Add Condition
              </Button>
            </div>

            {config.conditions.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-8 text-center">
                  <AlertTriangle className="h-8 w-8 text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">
                    No conditions set. Add a condition to trigger alerts.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {config.conditions.map((condition, index) => (
                  <Card key={condition.id}>
                    <CardContent className="pt-4">
                      <div className="space-y-3">
                        {/* Logic Operator */}
                        {index > 0 && (
                          <div className="flex items-center gap-2">
                            <Select
                              value={condition.logic}
                              onValueChange={(value: 'AND' | 'OR') =>
                                updateCondition(condition.id, { logic: value })
                              }
                            >
                              <SelectTrigger className="w-24">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="AND">AND</SelectItem>
                                <SelectItem value="OR">OR</SelectItem>
                              </SelectContent>
                            </Select>
                            <div className="h-px flex-1 bg-border" />
                          </div>
                        )}

                        {/* Condition Fields */}
                        <div className="flex items-center gap-2">
                          <Select
                            value={condition.field}
                            onValueChange={(value) =>
                              updateCondition(condition.id, { field: value })
                            }
                          >
                            <SelectTrigger className="flex-1">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pool_price">Pool Price</SelectItem>
                              <SelectItem value="ail_mw">Demand (AIL)</SelectItem>
                              <SelectItem value="generation_wind">Wind Generation</SelectItem>
                              <SelectItem value="generation_solar">Solar Generation</SelectItem>
                              <SelectItem value="renewable_penetration">Renewable %</SelectItem>
                            </SelectContent>
                          </Select>

                          <Select
                            value={condition.operator}
                            onValueChange={(value: AlertCondition['operator']) =>
                              updateCondition(condition.id, { operator: value })
                            }
                          >
                            <SelectTrigger className="w-24">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value=">">Greater than</SelectItem>
                              <SelectItem value="<">Less than</SelectItem>
                              <SelectItem value="=">Equal to</SelectItem>
                              <SelectItem value=">=">Greater or equal</SelectItem>
                              <SelectItem value="<=">Less or equal</SelectItem>
                              <SelectItem value="!=">Not equal</SelectItem>
                            </SelectContent>
                          </Select>

                          <Input
                            type="number"
                            value={condition.value}
                            onChange={(e) =>
                              updateCondition(condition.id, { value: parseFloat(e.target.value) })
                            }
                            className="w-32"
                          />

                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => removeCondition(condition.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Notification Settings */}
          <div className="space-y-3">
            <Label>Notifications</Label>
            <div className="space-y-2">
              <div className="flex items-center justify-between rounded-lg border p-3">
                <div className="space-y-0.5">
                  <Label htmlFor="notif-email">Email</Label>
                  <p className="text-xs text-muted-foreground">Send alert via email</p>
                </div>
                <Switch
                  id="notif-email"
                  checked={config.notification.email}
                  onCheckedChange={(email) =>
                    setConfig({
                      ...config,
                      notification: { ...config.notification, email }
                    })
                  }
                />
              </div>
              <div className="flex items-center justify-between rounded-lg border p-3">
                <div className="space-y-0.5">
                  <Label htmlFor="notif-push">Push Notification</Label>
                  <p className="text-xs text-muted-foreground">Browser push alerts</p>
                </div>
                <Switch
                  id="notif-push"
                  checked={config.notification.push}
                  onCheckedChange={(push) =>
                    setConfig({
                      ...config,
                      notification: { ...config.notification, push }
                    })
                  }
                />
              </div>
              <div className="flex items-center justify-between rounded-lg border p-3">
                <div className="space-y-0.5">
                  <Label htmlFor="notif-sms">SMS</Label>
                  <p className="text-xs text-muted-foreground">Text message alerts</p>
                </div>
                <Switch
                  id="notif-sms"
                  checked={config.notification.sms}
                  onCheckedChange={(sms) =>
                    setConfig({
                      ...config,
                      notification: { ...config.notification, sms }
                    })
                  }
                />
              </div>
            </div>
          </div>

          {/* Snooze Status */}
          {config.snoozeUntil && (
            <div className="rounded-lg border border-warning/50 bg-warning/10 p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="border-warning text-warning">
                    Snoozed
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    Until {config.snoozeUntil.toLocaleString()}
                  </span>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setConfig({ ...config, snoozeUntil: undefined })}
                >
                  Clear Snooze
                </Button>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Alert</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, BellOff, Clock, Check, Eye, MoreVertical } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Progress } from "@/components/ui/progress";

interface Alert {
  id: string;
  widgetId: string;
  widgetName: string;
  name: string;
  status: 'active' | 'triggered' | 'snoozed' | 'acknowledged';
  triggeredAt?: Date;
  acknowledgedAt?: Date;
  snoozeUntil?: Date;
  triggerCount: number;
  lastTriggerValue: number;
  threshold: number;
  accuracy: number;
}

export function AlertManagementPanel() {
  const { toast } = useToast();
  const [alerts, setAlerts] = useState<Alert[]>([
    {
      id: '1',
      widgetId: 'w1',
      widgetName: 'Pool Price Monitor',
      name: 'High Price Alert',
      status: 'triggered',
      triggeredAt: new Date(),
      triggerCount: 12,
      lastTriggerValue: 450,
      threshold: 400,
      accuracy: 94.5
    },
    {
      id: '2',
      widgetId: 'w2',
      widgetName: 'Demand Tracker',
      name: 'Peak Demand Warning',
      status: 'active',
      triggerCount: 8,
      lastTriggerValue: 11800,
      threshold: 12000,
      accuracy: 91.2
    },
    {
      id: '3',
      widgetId: 'w3',
      widgetName: 'Renewable Generation',
      name: 'Low Wind Alert',
      status: 'snoozed',
      snoozeUntil: new Date(Date.now() + 2 * 60 * 60 * 1000),
      triggerCount: 5,
      lastTriggerValue: 450,
      threshold: 500,
      accuracy: 88.7
    }
  ]);

  const acknowledgeAlert = (id: string) => {
    setAlerts(alerts.map(alert =>
      alert.id === id
        ? { ...alert, status: 'acknowledged' as const, acknowledgedAt: new Date() }
        : alert
    ));
    toast({
      title: "Alert Acknowledged",
      description: "Alert has been marked as acknowledged",
    });
  };

  const snoozeAlert = (id: string, hours: number) => {
    const snoozeUntil = new Date(Date.now() + hours * 60 * 60 * 1000);
    setAlerts(alerts.map(alert =>
      alert.id === id
        ? { ...alert, status: 'snoozed' as const, snoozeUntil }
        : alert
    ));
    toast({
      title: "Alert Snoozed",
      description: `Alert snoozed for ${hours} hour(s)`,
    });
  };

  const clearSnooze = (id: string) => {
    setAlerts(alerts.map(alert =>
      alert.id === id
        ? { ...alert, status: 'active' as const, snoozeUntil: undefined }
        : alert
    ));
    toast({
      title: "Snooze Cleared",
      description: "Alert is now active",
    });
  };

  const getStatusColor = (status: Alert['status']) => {
    switch (status) {
      case 'triggered': return 'destructive';
      case 'active': return 'default';
      case 'snoozed': return 'secondary';
      case 'acknowledged': return 'outline';
    }
  };

  const getStatusIcon = (status: Alert['status']) => {
    switch (status) {
      case 'triggered': return <Bell className="h-4 w-4" />;
      case 'active': return <Eye className="h-4 w-4" />;
      case 'snoozed': return <Clock className="h-4 w-4" />;
      case 'acknowledged': return <Check className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Active Alerts</h3>
          <p className="text-sm text-muted-foreground">
            Manage and track alert performance
          </p>
        </div>
        <Badge variant="outline" className="text-lg px-3 py-1">
          {alerts.filter(a => a.status === 'triggered').length} Active
        </Badge>
      </div>

      {/* Alert Summary Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">
              {alerts.reduce((sum, a) => sum + a.triggerCount, 0)}
            </div>
            <p className="text-xs text-muted-foreground">Total Triggers</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">
              {(alerts.reduce((sum, a) => sum + a.accuracy, 0) / alerts.length).toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">Avg Accuracy</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">
              {alerts.filter(a => a.status === 'active').length}
            </div>
            <p className="text-xs text-muted-foreground">Active Alerts</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">
              {alerts.filter(a => a.status === 'snoozed').length}
            </div>
            <p className="text-xs text-muted-foreground">Snoozed</p>
          </CardContent>
        </Card>
      </div>

      {/* Alert List */}
      <div className="space-y-3">
        {alerts.map(alert => (
          <Card key={alert.id}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-base">{alert.name}</CardTitle>
                    <Badge variant={getStatusColor(alert.status)}>
                      {getStatusIcon(alert.status)}
                      <span className="ml-1 capitalize">{alert.status}</span>
                    </Badge>
                  </div>
                  <CardDescription className="text-xs">
                    {alert.widgetName}
                  </CardDescription>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {alert.status === 'triggered' && (
                      <DropdownMenuItem onClick={() => acknowledgeAlert(alert.id)}>
                        <Check className="h-4 w-4 mr-2" />
                        Acknowledge
                      </DropdownMenuItem>
                    )}
                    {alert.status !== 'snoozed' && (
                      <>
                        <DropdownMenuItem onClick={() => snoozeAlert(alert.id, 1)}>
                          <Clock className="h-4 w-4 mr-2" />
                          Snooze 1 hour
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => snoozeAlert(alert.id, 4)}>
                          <Clock className="h-4 w-4 mr-2" />
                          Snooze 4 hours
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => snoozeAlert(alert.id, 24)}>
                          <Clock className="h-4 w-4 mr-2" />
                          Snooze 24 hours
                        </DropdownMenuItem>
                      </>
                    )}
                    {alert.status === 'snoozed' && (
                      <DropdownMenuItem onClick={() => clearSnooze(alert.id)}>
                        <BellOff className="h-4 w-4 mr-2" />
                        Clear Snooze
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Current:</span>
                  <span className="ml-2 font-medium">{alert.lastTriggerValue.toFixed(1)}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Threshold:</span>
                  <span className="ml-2 font-medium">{alert.threshold.toFixed(1)}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Triggers:</span>
                  <span className="ml-2 font-medium">{alert.triggerCount}</span>
                </div>
              </div>

              {alert.snoozeUntil && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  Snoozed until {alert.snoozeUntil.toLocaleString()}
                </div>
              )}

              {alert.triggeredAt && (
                <div className="text-xs text-muted-foreground">
                  Last triggered: {alert.triggeredAt.toLocaleString()}
                </div>
              )}

              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Alert Accuracy</span>
                  <span className="font-medium">{alert.accuracy}%</span>
                </div>
                <Progress value={alert.accuracy} className="h-2" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

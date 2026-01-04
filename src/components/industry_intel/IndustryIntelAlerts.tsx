
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, Bell } from 'lucide-react';

interface IndustryIntelAlertsProps {
  alerts: any[];
  onAlertsUpdate: (alerts: any[]) => void;
}

export function IndustryIntelAlerts({ alerts, onAlertsUpdate }: IndustryIntelAlertsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="w-5 h-5 text-yellow-600" />
          Smart Alerts & Monitoring
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8">
          <AlertTriangle className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <h3 className="text-lg font-medium text-foreground mb-2">No active alerts</h3>
          <p className="text-muted-foreground">Configure watchlists to receive real-time intelligence alerts</p>
        </div>
      </CardContent>
    </Card>
  );
}

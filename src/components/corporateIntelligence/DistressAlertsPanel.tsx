
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, DollarSign, Zap } from 'lucide-react';
import { DistressAlert } from '@/types/corporateIntelligence';
import { getDistressColor } from '@/utils/corporateIntelligence';

interface DistressAlertsPanelProps {
  alerts: DistressAlert[];
  onInvestigate: (alert: DistressAlert) => void;
}

export function DistressAlertsPanel({ alerts, onInvestigate }: DistressAlertsPanelProps) {
  if (alerts.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <AlertTriangle className="w-5 h-5 mr-2 text-red-500" />
          High Priority Distress Alerts
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {alerts.slice(0, 5).map((alert) => (
            <div key={alert.id} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <h4 className="font-medium">{alert.company_name}</h4>
                  <Badge className={`text-white ${getDistressColor(alert.distress_level)}`}>
                    {alert.distress_level}% Distress
                  </Badge>
                </div>
                <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                  <div className="flex items-center">
                    <Zap className="w-3 h-3 mr-1" />
                    {alert.power_capacity} MW
                  </div>
                  <div className="flex items-center">
                    <DollarSign className="w-3 h-3 mr-1" />
                    ${(alert.potential_value / 1000000).toFixed(1)}M value
                  </div>
                </div>
                <div className="flex flex-wrap gap-1">
                  {alert.signals.map((signal, idx) => (
                    <Badge key={idx} variant="outline" className="text-xs">
                      {signal}
                    </Badge>
                  ))}
                </div>
              </div>
              <Button size="sm" variant="outline" onClick={() => onInvestigate(alert)}>
                Investigate
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

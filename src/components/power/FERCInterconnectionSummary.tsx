
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, Database } from 'lucide-react';

interface FERCInterconnectionSummaryProps {
  interconnectionQueue: any;
}

export function FERCInterconnectionSummary({ interconnectionQueue }: FERCInterconnectionSummaryProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Activity className="w-5 h-5 mr-2 text-blue-600" />
          Interconnection Queue Summary
        </CardTitle>
      </CardHeader>
      <CardContent>
        {interconnectionQueue ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Total Projects</p>
              <p className="text-2xl font-bold">{interconnectionQueue.summary.total_projects.toLocaleString()}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Total Capacity</p>
              <p className="text-2xl font-bold">{(interconnectionQueue.summary.total_capacity_mw / 1000).toFixed(1)} GW</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Average Queue Time</p>
              <p className="text-2xl font-bold">{interconnectionQueue.summary.average_queue_time_months}</p>
              <p className="text-xs text-muted-foreground">months</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Solar Projects</p>
              <p className="text-2xl font-bold">{(interconnectionQueue.summary.solar_capacity_mw / 1000).toFixed(1)} GW</p>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <Database className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-muted-foreground">Loading interconnection queue data...</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

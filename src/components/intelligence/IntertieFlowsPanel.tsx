
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity } from 'lucide-react';

export function IntertieFlowsPanel({ intertieFlows, loading }: any) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Activity className="w-5 h-5 mr-2 text-green-600" />
          Intertie Flows
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">Intertie flows analysis coming soon...</p>
      </CardContent>
    </Card>
  );
}

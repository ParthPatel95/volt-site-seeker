
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Settings } from 'lucide-react';

export function AncillaryServicesPanel({ ancillaryServices, loading }: any) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Settings className="w-5 h-5 mr-2 text-purple-600" />
          Ancillary Services
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">Ancillary services analysis coming soon...</p>
      </CardContent>
    </Card>
  );
}

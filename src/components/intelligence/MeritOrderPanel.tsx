
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3 } from 'lucide-react';

export function MeritOrderPanel({ meritOrder, loading }: any) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <BarChart3 className="w-5 h-5 mr-2 text-blue-600" />
          Merit Order Analysis
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">Merit order analysis coming soon...</p>
      </CardContent>
    </Card>
  );
}

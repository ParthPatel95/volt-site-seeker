
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CloudRain } from 'lucide-react';

export function WeatherImpactPanel({ weatherImpact, loading }: any) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <CloudRain className="w-5 h-5 mr-2 text-blue-600" />
          Weather Impact
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">Weather impact analysis coming soon...</p>
      </CardContent>
    </Card>
  );
}

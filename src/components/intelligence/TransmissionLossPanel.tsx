
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Zap } from 'lucide-react';

export function TransmissionLossPanel({ transmissionLossFactors, loading }: any) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Zap className="w-5 h-5 mr-2 text-yellow-600" />
          Transmission Loss Factors
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">Transmission loss factor analysis coming soon...</p>
      </CardContent>
    </Card>
  );
}

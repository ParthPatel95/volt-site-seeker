
import React from 'react';
import { AppLayout } from '@/components/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart } from 'lucide-react';

export default function EnergyRates() {
  return (
    <AppLayout>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <BarChart className="w-6 h-6 mr-2" />
            Energy Rates
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Energy rates analysis and comparison tools.</p>
        </CardContent>
      </Card>
    </AppLayout>
  );
}

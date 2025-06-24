
import { AppLayout } from '@/components/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Zap } from 'lucide-react';

export function AESOMarket() {
  return (
    <AppLayout>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Zap className="w-6 h-6 mr-2" />
            AESO Market Data
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Real-time Alberta electricity market data and analytics.</p>
        </CardContent>
      </Card>
    </AppLayout>
  );
}

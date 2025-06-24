
import { AppLayout } from '@/components/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Brain } from 'lucide-react';

export function AESOMarketIntelligence() {
  return (
    <AppLayout>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Brain className="w-6 h-6 mr-2" />
            AESO Market Intelligence
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Advanced market intelligence and predictive analytics for Alberta's electricity market.</p>
        </CardContent>
      </Card>
    </AppLayout>
  );
}

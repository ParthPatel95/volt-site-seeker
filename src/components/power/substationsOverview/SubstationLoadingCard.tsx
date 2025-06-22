
import { Card, CardContent } from '@/components/ui/card';
import { Zap } from 'lucide-react';

export function SubstationLoadingCard() {
  return (
    <Card>
      <CardContent className="p-12 text-center">
        <Zap className="w-8 h-8 animate-spin mx-auto mb-4" />
        <p className="text-muted-foreground">Loading substations data...</p>
      </CardContent>
    </Card>
  );
}

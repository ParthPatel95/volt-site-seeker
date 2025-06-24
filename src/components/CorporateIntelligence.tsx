
import { AppLayout } from '@/components/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2 } from 'lucide-react';

export function CorporateIntelligence() {
  return (
    <AppLayout>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Building2 className="w-6 h-6 mr-2" />
            Corporate Intelligence
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Corporate intelligence and business analytics platform.</p>
        </CardContent>
      </Card>
    </AppLayout>
  );
}

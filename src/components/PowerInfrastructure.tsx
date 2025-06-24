
import { AppLayout } from '@/components/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Factory } from 'lucide-react';

export function PowerInfrastructure() {
  return (
    <AppLayout>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Factory className="w-6 h-6 mr-2" />
            Power Infrastructure
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Power infrastructure analysis and monitoring tools.</p>
        </CardContent>
      </Card>
    </AppLayout>
  );
}

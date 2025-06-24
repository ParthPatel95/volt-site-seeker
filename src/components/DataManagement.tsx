
import { AppLayout } from '@/components/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Database } from 'lucide-react';

export function DataManagement() {
  return (
    <AppLayout>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Database className="w-6 h-6 mr-2" />
            Data Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Comprehensive data management and integration platform.</p>
        </CardContent>
      </Card>
    </AppLayout>
  );
}

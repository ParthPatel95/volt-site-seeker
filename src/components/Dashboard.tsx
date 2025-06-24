
import { AppLayout } from '@/components/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LayoutDashboard } from 'lucide-react';

export function Dashboard() {
  return (
    <AppLayout>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <LayoutDashboard className="w-6 h-6 mr-2" />
            VoltScout Dashboard
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Welcome to VoltScout - Your comprehensive energy market intelligence platform.</p>
        </CardContent>
      </Card>
    </AppLayout>
  );
}


import React from 'react';
import { AppLayout } from '@/components/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { HelpCircle } from 'lucide-react';

export default function Help() {
  return (
    <AppLayout>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <HelpCircle className="w-6 h-6 mr-2" />
            Help & Support
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Help and support page coming soon...</p>
        </CardContent>
      </Card>
    </AppLayout>
  );
}

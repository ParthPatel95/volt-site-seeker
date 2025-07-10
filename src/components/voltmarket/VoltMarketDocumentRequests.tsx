import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { FileCheck } from 'lucide-react';
import { VoltMarketAccessRequests } from './VoltMarketAccessRequests';
import { useVoltMarketAuth } from '@/contexts/VoltMarketAuthContext';

export const VoltMarketDocumentRequests: React.FC = () => {
  const { profile } = useVoltMarketAuth();

  if (!profile) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="flex items-center justify-center py-8">
            <p className="text-muted-foreground">Please log in to view document requests.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <FileCheck className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Document Requests</h1>
        </div>
        <p className="text-muted-foreground">
          Manage access requests for your confidential documents and due diligence materials.
        </p>
      </div>

      <VoltMarketAccessRequests sellerId={profile.id} />
    </div>
  );
};
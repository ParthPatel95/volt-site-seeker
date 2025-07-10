import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { FileCheck, Shield, Users, AlertCircle } from 'lucide-react';
import { VoltMarketAccessRequests } from './VoltMarketAccessRequests';
import { useVoltMarketAuth } from '@/contexts/VoltMarketAuthContext';

export const VoltMarketDocumentRequests: React.FC = () => {
  const { profile } = useVoltMarketAuth();

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
        <div className="container mx-auto px-4 py-8 sm:py-12 lg:py-16">
          <Card className="max-w-md mx-auto">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Shield className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Authentication Required</h3>
              <p className="text-muted-foreground text-center">
                Please log in to view and manage document access requests.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      <div className="container mx-auto px-4 py-6 sm:py-8 lg:py-12 max-w-7xl">
        {/* Header Section */}
        <div className="mb-8 lg:mb-12">
          <div className="flex flex-col sm:flex-row sm:items-start gap-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-primary/10">
                <FileCheck className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight">
                  Document Requests
                </h1>
                <p className="text-muted-foreground mt-1">
                  Manage access to your confidential documents
                </p>
              </div>
            </div>
          </div>

          {/* Info Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
            <Card className="border-l-4 border-l-primary">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Users className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm font-medium">Access Control</p>
                    <p className="text-xs text-muted-foreground">
                      Review and approve document access
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-orange-500">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Shield className="h-5 w-5 text-orange-500" />
                  <div>
                    <p className="text-sm font-medium">Secure Sharing</p>
                    <p className="text-xs text-muted-foreground">
                      Protected due diligence materials
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-green-500 sm:col-span-2 lg:col-span-1">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <AlertCircle className="h-5 w-5 text-green-500" />
                  <div>
                    <p className="text-sm font-medium">Real-time Updates</p>
                    <p className="text-xs text-muted-foreground">
                      Instant notifications for new requests
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Main Content */}
        <VoltMarketAccessRequests sellerId={profile.id} />
      </div>
    </div>
  );
};
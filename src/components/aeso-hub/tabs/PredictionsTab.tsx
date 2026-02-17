import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Brain, Shield, Settings } from 'lucide-react';
import { AESOPricePredictionDashboard } from '@/components/aeso/AESOPricePredictionDashboard';
import { AESOTrainingManager } from '@/components/aeso/AESOTrainingManager';
import { usePermissions } from '@/hooks/usePermissions';

export function PredictionsTab() {
  const { hasPermission } = usePermissions();

  return (
    <div className="space-y-4 sm:space-y-6">
      <Tabs defaultValue="predictions" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="predictions" className="flex items-center gap-2">
            <Brain className="w-4 h-4" />
            Predictions
          </TabsTrigger>
          <TabsTrigger
            value="training"
            className="flex items-center gap-2"
            disabled={!hasPermission('aeso.training-management')}
          >
            {!hasPermission('aeso.training-management') ? (
              <Shield className="w-4 h-4" />
            ) : (
              <Settings className="w-4 h-4" />
            )}
            Training & Management
          </TabsTrigger>
        </TabsList>

        <TabsContent value="predictions">
          <AESOPricePredictionDashboard />
        </TabsContent>

        <TabsContent value="training">
          {hasPermission('aeso.training-management') ? (
            <AESOTrainingManager />
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <Shield className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">Access Restricted</h3>
                <p className="text-muted-foreground">
                  You need "AESO Model Training" permission to access this section.
                  Please contact your administrator.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

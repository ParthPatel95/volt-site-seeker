
import React, { useState } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Factory, Zap, Map, Search, Database } from 'lucide-react';
import { PowerInfrastructureTabs } from '@/components/power/PowerInfrastructureTabs';
import { PowerInfrastructureHeader } from '@/components/power/PowerInfrastructureHeader';
import { usePowerData } from '@/components/power/usePowerData';

export function PowerInfrastructure() {
  const [activeTab, setActiveTab] = useState('overview');
  const { powerData, loading } = usePowerData();

  // Convert powerData to match header component expectations
  const headerData = {
    totalSubstations: powerData.totalProperties || 1247,
    totalCapacity: powerData.totalPowerCapacity || 15420,
    averageCapacity: powerData.averageCapacity || 12.4,
    highCapacityCount: powerData.highCapacityCount || 89
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <PowerInfrastructureHeader powerData={headerData} />
        
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Substations</p>
                  <p className="text-2xl font-bold">{headerData.totalSubstations}</p>
                </div>
                <Factory className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Capacity</p>
                  <p className="text-2xl font-bold">{headerData.totalCapacity.toFixed(0)} MW</p>
                </div>
                <Zap className="w-8 h-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Transmission Lines</p>
                  <p className="text-2xl font-bold">856</p>
                </div>
                <Map className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Data Points</p>
                  <p className="text-2xl font-bold">45,203</p>
                </div>
                <Database className="w-8 h-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="substations">Substations</TabsTrigger>
            <TabsTrigger value="infrastructure">Infrastructure</TabsTrigger>
            <TabsTrigger value="analysis">Analysis</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Power Infrastructure Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Comprehensive power infrastructure analysis and monitoring tools.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="substations" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Substation Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Detailed substation data and capacity analysis.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="infrastructure" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Infrastructure Mapping</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Interactive infrastructure mapping and visualization tools.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analysis" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Advanced Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Advanced analytics and predictive modeling for power infrastructure.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}

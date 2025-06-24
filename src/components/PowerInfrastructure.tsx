
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
  const { stats, loading } = usePowerData();

  return (
    <AppLayout>
      <div className="space-y-6">
        <PowerInfrastructureHeader stats={stats} loading={loading} />
        
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Substations</p>
                  <p className="text-2xl font-bold">{stats?.totalSubstations || 1247}</p>
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
                  <p className="text-2xl font-bold">{stats?.totalCapacity || '15,420'} MW</p>
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
                  <p className="text-2xl font-bold">{stats?.transmissionLines || 856}</p>
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
                  <p className="text-2xl font-bold">{stats?.dataPoints || '45,203'}</p>
                </div>
                <Database className="w-8 h-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Tabs */}
        <PowerInfrastructureTabs 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
        />
      </div>
    </AppLayout>
  );
}

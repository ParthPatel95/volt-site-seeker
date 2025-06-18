
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SubstationsOverview } from './SubstationsOverview';
import { EIADataPanel } from './EIADataPanel';
import { FERCDashboard } from './FERCDashboard';
import { MapboxPowerInfrastructure } from './MapboxPowerInfrastructure';
import { EnvironmentalDashboard } from './EnvironmentalDashboard';
import { SubstationCapacityEstimator } from './SubstationCapacityEstimator';
import { 
  Building2, 
  Database, 
  FileText, 
  Satellite,
  Leaf,
  Zap
} from 'lucide-react';

export function PowerInfrastructureTabs() {
  return (
    <Tabs defaultValue="overview" className="space-y-6">
      <TabsList className="grid w-full grid-cols-6">
        <TabsTrigger value="overview" className="flex items-center space-x-2">
          <Building2 className="w-4 h-4" />
          <span className="hidden sm:inline">Substations</span>
        </TabsTrigger>
        <TabsTrigger value="capacity-estimator" className="flex items-center space-x-2">
          <Zap className="w-4 h-4" />
          <span className="hidden sm:inline">Capacity Estimator</span>
        </TabsTrigger>
        <TabsTrigger value="eia" className="flex items-center space-x-2">
          <Database className="w-4 h-4" />
          <span className="hidden sm:inline">EIA Data</span>
        </TabsTrigger>
        <TabsTrigger value="ferc" className="flex items-center space-x-2">
          <FileText className="w-4 h-4" />
          <span className="hidden sm:inline">FERC</span>
        </TabsTrigger>
        <TabsTrigger value="mapbox" className="flex items-center space-x-2">
          <Satellite className="w-4 h-4" />
          <span className="hidden sm:inline">Satellite</span>
        </TabsTrigger>
        <TabsTrigger value="environmental" className="flex items-center space-x-2">
          <Leaf className="w-4 h-4" />
          <span className="hidden sm:inline">Environmental</span>
        </TabsTrigger>
      </TabsList>

      <TabsContent value="overview">
        <SubstationsOverview />
      </TabsContent>

      <TabsContent value="capacity-estimator">
        <SubstationCapacityEstimator />
      </TabsContent>

      <TabsContent value="eia">
        <EIADataPanel />
      </TabsContent>

      <TabsContent value="ferc">
        <FERCDashboard />
      </TabsContent>

      <TabsContent value="mapbox">
        <MapboxPowerInfrastructure />
      </TabsContent>

      <TabsContent value="environmental">
        <EnvironmentalDashboard />
      </TabsContent>
    </Tabs>
  );
}

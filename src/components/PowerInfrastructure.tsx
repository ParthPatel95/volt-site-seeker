
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { PowerInfrastructureHeader } from './power/PowerInfrastructureHeader';
import { PowerInfrastructureTabs } from './power/PowerInfrastructureTabs';
import { PowerInfrastructureLoading } from './power/PowerInfrastructureLoading';
import { CityPowerAnalysis } from './power/CityPowerAnalysis';
import { PowerOverviewCards } from './power/PowerOverviewCards';
import { PowerCapacityDistribution } from './power/PowerCapacityDistribution';
import { PowerPropertiesList } from './power/PowerPropertiesList';
import { InterconnectionQueue } from './power/InterconnectionQueue';
import { SubstationsOverview } from './power/SubstationsOverview';
import { SubstationDataCollector } from './power/SubstationDataCollector';
import { AutomatedSubstationFinder } from './power/AutomatedSubstationFinder';
import { StarlightIndustrialFinder } from './power/StarlightIndustrialFinder';
import { usePowerData } from './power/usePowerData';
import { EIADataPanel } from './power/EIADataPanel';
import { MapboxPowerInfrastructure } from './power/MapboxPowerInfrastructure';
import { ERCOTDashboard } from './power/ERCOTDashboard';
import { FERCDashboard } from './power/FERCDashboard';
import { USGSDashboard } from './power/USGSDashboard';
import { EnvironmentalDashboard } from './power/EnvironmentalDashboard';

export function PowerInfrastructure() {
  const { powerData, properties, loading, getStatusColor } = usePowerData();

  if (loading) {
    return <PowerInfrastructureLoading />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <PowerInfrastructureHeader powerData={powerData} />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <Tabs defaultValue="overview" className="space-y-6">
          <PowerInfrastructureTabs />

          <TabsContent value="overview" className="space-y-6">
            <PowerOverviewCards powerData={powerData} />
            <PowerCapacityDistribution properties={properties} getStatusColor={getStatusColor} />
          </TabsContent>

          <TabsContent value="ercot-live">
            <ERCOTDashboard />
          </TabsContent>

          <TabsContent value="ferc-data">
            <FERCDashboard />
          </TabsContent>

          <TabsContent value="usgs-data">
            <USGSDashboard />
          </TabsContent>

          <TabsContent value="environmental">
            <EnvironmentalDashboard />
          </TabsContent>

          <TabsContent value="mapbox-explorer">
            <MapboxPowerInfrastructure />
          </TabsContent>

          <TabsContent value="eia-data">
            <EIADataPanel />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}


import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Zap, 
  Activity,
  Search,
  Database
} from 'lucide-react';
import { CityPowerAnalysis } from './power/CityPowerAnalysis';
import { PowerOverviewCards } from './power/PowerOverviewCards';
import { PowerCapacityDistribution } from './power/PowerCapacityDistribution';
import { PowerPropertiesList } from './power/PowerPropertiesList';
import { InterconnectionQueuePlaceholder } from './power/InterconnectionQueuePlaceholder';
import { SubstationsOverview } from './power/SubstationsOverview';
import { SubstationDataCollector } from './power/SubstationDataCollector';
import { AutomatedSubstationFinder } from './power/AutomatedSubstationFinder';
import { usePowerData } from './power/usePowerData';

export function PowerInfrastructure() {
  const { powerData, properties, loading, getStatusColor } = usePowerData();

  if (loading) {
    return (
      <div className="h-screen overflow-hidden bg-background flex items-center justify-center">
        <div className="text-center">
          <Activity className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading power infrastructure data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen overflow-hidden bg-background">
      <div className="p-6 border-b">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-lg">
            <Zap className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Power Infrastructure</h1>
            <p className="text-muted-foreground">Grid connectivity and transmission analysis</p>
          </div>
        </div>
      </div>

      <div className="p-6 h-full overflow-y-auto">
        <Tabs defaultValue="overview" className="h-full">
          <TabsList className="grid w-full grid-cols-7">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="substations">Substations</TabsTrigger>
            <TabsTrigger value="data-collection">Data Collection</TabsTrigger>
            <TabsTrigger value="ai-discovery">AI Discovery</TabsTrigger>
            <TabsTrigger value="city-analysis">City Analysis</TabsTrigger>
            <TabsTrigger value="properties">Properties</TabsTrigger>
            <TabsTrigger value="interconnection">Interconnection Queue</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6 space-y-6">
            <PowerOverviewCards powerData={powerData} />
            <PowerCapacityDistribution properties={properties} getStatusColor={getStatusColor} />
          </TabsContent>

          <TabsContent value="substations" className="mt-6">
            <SubstationsOverview />
          </TabsContent>

          <TabsContent value="data-collection" className="mt-6">
            <SubstationDataCollector />
          </TabsContent>

          <TabsContent value="ai-discovery" className="mt-6">
            <AutomatedSubstationFinder />
          </TabsContent>

          <TabsContent value="city-analysis" className="mt-6">
            <CityPowerAnalysis />
          </TabsContent>

          <TabsContent value="properties" className="mt-6 space-y-6">
            <PowerPropertiesList properties={properties} getStatusColor={getStatusColor} />
          </TabsContent>

          <TabsContent value="interconnection" className="mt-6 space-y-6">
            <InterconnectionQueuePlaceholder />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

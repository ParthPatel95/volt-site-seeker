
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Zap, 
  Activity,
  Search,
  Database,
  MapPin,
  Building2,
  TrendingUp,
  Cpu
} from 'lucide-react';
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

export function PowerInfrastructure() {
  const { powerData, properties, loading, getStatusColor } = usePowerData();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center">
        <Card className="p-8">
          <CardContent className="flex flex-col items-center space-y-4">
            <div className="relative">
              <Zap className="w-12 h-12 text-yellow-500 animate-pulse" />
              <div className="absolute inset-0 w-12 h-12 border-4 border-yellow-500/20 border-t-yellow-500 rounded-full animate-spin"></div>
            </div>
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">Loading Power Infrastructure</h3>
              <p className="text-muted-foreground">Analyzing grid connectivity and transmission data...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* Header Section */}
      <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 shadow-sm">
        <div className="container-responsive py-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="flex items-start space-x-4">
              <div className="p-3 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-xl shadow-lg">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
                  Power Infrastructure
                </h1>
                <p className="text-lg text-slate-600 dark:text-slate-300 mb-3">
                  Grid connectivity and transmission analysis
                </p>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary" className="text-xs">
                    <Activity className="w-3 h-3 mr-1" />
                    Real-time monitoring
                  </Badge>
                  <Badge variant="secondary" className="text-xs">
                    <Database className="w-3 h-3 mr-1" />
                    Live data feeds
                  </Badge>
                </div>
              </div>
            </div>
            
            {/* Quick Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:min-w-[400px]">
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {powerData.totalProperties}
                </div>
                <div className="text-xs text-blue-600/80 dark:text-blue-400/80 font-medium">
                  Properties
                </div>
              </div>
              <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                  {powerData.totalPowerCapacity.toFixed(0)}
                </div>
                <div className="text-xs text-yellow-600/80 dark:text-yellow-400/80 font-medium">
                  Total MW
                </div>
              </div>
              <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {powerData.averageCapacity.toFixed(1)}
                </div>
                <div className="text-xs text-green-600/80 dark:text-green-400/80 font-medium">
                  Avg MW
                </div>
              </div>
              <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {powerData.highCapacityCount}
                </div>
                <div className="text-xs text-purple-600/80 dark:text-purple-400/80 font-medium">
                  High Cap
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container-responsive py-8">
        <Tabs defaultValue="overview" className="space-y-6">
          {/* Enhanced Tab Navigation */}
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-2 shadow-sm">
            <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8 gap-1 bg-transparent h-auto">
              <TabsTrigger 
                value="overview" 
                className="flex flex-col lg:flex-row items-center gap-1 lg:gap-2 p-3 data-[state=active]:bg-blue-100 dark:data-[state=active]:bg-blue-900/30"
              >
                <TrendingUp className="w-4 h-4" />
                <span className="text-xs lg:text-sm font-medium">Overview</span>
              </TabsTrigger>
              <TabsTrigger 
                value="substations"
                className="flex flex-col lg:flex-row items-center gap-1 lg:gap-2 p-3 data-[state=active]:bg-yellow-100 dark:data-[state=active]:bg-yellow-900/30"
              >
                <Zap className="w-4 h-4" />
                <span className="text-xs lg:text-sm font-medium">Substations</span>
              </TabsTrigger>
              <TabsTrigger 
                value="data-collection"
                className="flex flex-col lg:flex-row items-center gap-1 lg:gap-2 p-3 data-[state=active]:bg-green-100 dark:data-[state=active]:bg-green-900/30"
              >
                <Database className="w-4 h-4" />
                <span className="text-xs lg:text-sm font-medium">Collection</span>
              </TabsTrigger>
              <TabsTrigger 
                value="ai-discovery"
                className="flex flex-col lg:flex-row items-center gap-1 lg:gap-2 p-3 data-[state=active]:bg-purple-100 dark:data-[state=active]:bg-purple-900/30"
              >
                <Cpu className="w-4 h-4" />
                <span className="text-xs lg:text-sm font-medium">AI Discovery</span>
              </TabsTrigger>
              <TabsTrigger 
                value="industrial-finder"
                className="flex flex-col lg:flex-row items-center gap-1 lg:gap-2 p-3 data-[state=active]:bg-orange-100 dark:data-[state=active]:bg-orange-900/30"
              >
                <Building2 className="w-4 h-4" />
                <span className="text-xs lg:text-sm font-medium">Industrial</span>
              </TabsTrigger>
              <TabsTrigger 
                value="city-analysis"
                className="flex flex-col lg:flex-row items-center gap-1 lg:gap-2 p-3 data-[state=active]:bg-teal-100 dark:data-[state=active]:bg-teal-900/30"
              >
                <MapPin className="w-4 h-4" />
                <span className="text-xs lg:text-sm font-medium">Cities</span>
              </TabsTrigger>
              <TabsTrigger 
                value="properties"
                className="flex flex-col lg:flex-row items-center gap-1 lg:gap-2 p-3 data-[state=active]:bg-indigo-100 dark:data-[state=active]:bg-indigo-900/30"
              >
                <Building2 className="w-4 h-4" />
                <span className="text-xs lg:text-sm font-medium">Properties</span>
              </TabsTrigger>
              <TabsTrigger 
                value="interconnection"
                className="flex flex-col lg:flex-row items-center gap-1 lg:gap-2 p-3 data-[state=active]:bg-pink-100 dark:data-[state=active]:bg-pink-900/30"
              >
                <Activity className="w-4 h-4" />
                <span className="text-xs lg:text-sm font-medium">Queue</span>
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Tab Content */}
          <TabsContent value="overview" className="space-y-6">
            <PowerOverviewCards powerData={powerData} />
            <PowerCapacityDistribution properties={properties} getStatusColor={getStatusColor} />
          </TabsContent>

          <TabsContent value="substations">
            <SubstationsOverview />
          </TabsContent>

          <TabsContent value="data-collection">
            <SubstationDataCollector />
          </TabsContent>

          <TabsContent value="ai-discovery">
            <AutomatedSubstationFinder />
          </TabsContent>

          <TabsContent value="industrial-finder">
            <StarlightIndustrialFinder />
          </TabsContent>

          <TabsContent value="city-analysis">
            <CityPowerAnalysis />
          </TabsContent>

          <TabsContent value="properties">
            <PowerPropertiesList properties={properties} getStatusColor={getStatusColor} />
          </TabsContent>

          <TabsContent value="interconnection">
            <InterconnectionQueue />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

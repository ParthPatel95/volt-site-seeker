
import { TabsList, TabsTrigger } from '@/components/ui/tabs';

export function PowerInfrastructureTabs() {
  return (
    <div className="w-full overflow-x-auto">
      <TabsList className="grid w-full min-w-max grid-cols-9 h-auto p-1">
        <TabsTrigger value="overview" className="text-xs sm:text-sm px-2 py-2 sm:px-3 whitespace-nowrap">
          Overview
        </TabsTrigger>
        <TabsTrigger value="capacity-estimator" className="text-xs sm:text-sm px-2 py-2 sm:px-3 whitespace-nowrap">
          Capacity AI
        </TabsTrigger>
        <TabsTrigger value="comprehensive-finder" className="text-xs sm:text-sm px-2 py-2 sm:px-3 whitespace-nowrap">
          Complete Finder
        </TabsTrigger>
        <TabsTrigger value="ercot-live" className="text-xs sm:text-sm px-2 py-2 sm:px-3 whitespace-nowrap">
          ERCOT Live
        </TabsTrigger>
        <TabsTrigger value="ferc-data" className="text-xs sm:text-sm px-2 py-2 sm:px-3 whitespace-nowrap">
          FERC Data
        </TabsTrigger>
        <TabsTrigger value="usgs-data" className="text-xs sm:text-sm px-2 py-2 sm:px-3 whitespace-nowrap">
          USGS Data
        </TabsTrigger>
        <TabsTrigger value="environmental" className="text-xs sm:text-sm px-2 py-2 sm:px-3 whitespace-nowrap">
          Environmental
        </TabsTrigger>
        <TabsTrigger value="mapbox-explorer" className="text-xs sm:text-sm px-2 py-2 sm:px-3 whitespace-nowrap">
          Mapbox Explorer
        </TabsTrigger>
        <TabsTrigger value="eia-data" className="text-xs sm:text-sm px-2 py-2 sm:px-3 whitespace-nowrap">
          EIA Data
        </TabsTrigger>
      </TabsList>
    </div>
  );
}

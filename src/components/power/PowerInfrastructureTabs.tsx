
import { TabsList, TabsTrigger } from '@/components/ui/tabs';

export function PowerInfrastructureTabs() {
  return (
    <div className="w-full overflow-x-auto">
      <TabsList className="grid w-full min-w-max grid-cols-10 h-auto p-1">
        <TabsTrigger value="overview" className="text-xs sm:text-sm px-2 py-2 sm:px-3">
          Overview
        </TabsTrigger>
        <TabsTrigger value="capacity-estimator" className="text-xs sm:text-sm px-2 py-2 sm:px-3">
          Capacity AI
        </TabsTrigger>
        <TabsTrigger value="google-finder" className="text-xs sm:text-sm px-2 py-2 sm:px-3">
          Google Finder
        </TabsTrigger>
        <TabsTrigger value="map-finder" className="text-xs sm:text-sm px-2 py-2 sm:px-3">
          Map Finder
        </TabsTrigger>
        <TabsTrigger value="ercot-live" className="text-xs sm:text-sm px-2 py-2 sm:px-3">
          ERCOT Live
        </TabsTrigger>
        <TabsTrigger value="ferc-data" className="text-xs sm:text-sm px-2 py-2 sm:px-3">
          FERC Data
        </TabsTrigger>
        <TabsTrigger value="usgs-data" className="text-xs sm:text-sm px-2 py-2 sm:px-3">
          USGS Data
        </TabsTrigger>
        <TabsTrigger value="environmental" className="text-xs sm:text-sm px-2 py-2 sm:px-3">
          Environmental
        </TabsTrigger>
        <TabsTrigger value="mapbox-explorer" className="text-xs sm:text-sm px-2 py-2 sm:px-3">
          Mapbox Explorer
        </TabsTrigger>
        <TabsTrigger value="eia-data" className="text-xs sm:text-sm px-2 py-2 sm:px-3">
          EIA Data
        </TabsTrigger>
      </TabsList>
    </div>
  );
}


import { TabsList, TabsTrigger } from '@/components/ui/tabs';

export function PowerInfrastructureTabs() {
  return (
    <div className="w-full overflow-x-auto scrollbar-thin">
      <TabsList className="grid w-full min-w-[800px] grid-cols-9 h-auto p-1 gap-1">
        <TabsTrigger 
          value="overview" 
          className="text-xs sm:text-sm px-1.5 py-2 sm:px-2 md:px-3 whitespace-nowrap min-w-0 flex-shrink-0"
        >
          <span className="truncate">Overview</span>
        </TabsTrigger>
        <TabsTrigger 
          value="ultimate-finder" 
          className="text-xs sm:text-sm px-1.5 py-2 sm:px-2 md:px-3 whitespace-nowrap min-w-0 flex-shrink-0"
        >
          <span className="truncate">Ultimate Finder</span>
        </TabsTrigger>
        <TabsTrigger 
          value="capacity-estimator" 
          className="text-xs sm:text-sm px-1.5 py-2 sm:px-2 md:px-3 whitespace-nowrap min-w-0 flex-shrink-0"
        >
          <span className="truncate">Capacity AI</span>
        </TabsTrigger>
        <TabsTrigger 
          value="energy-rates" 
          className="text-xs sm:text-sm px-1.5 py-2 sm:px-2 md:px-3 whitespace-nowrap min-w-0 flex-shrink-0"
        >
          <span className="truncate">Energy Rates</span>
        </TabsTrigger>
        <TabsTrigger 
          value="ercot-live" 
          className="text-xs sm:text-sm px-1.5 py-2 sm:px-2 md:px-3 whitespace-nowrap min-w-0 flex-shrink-0"
        >
          <span className="truncate">ERCOT Live</span>
        </TabsTrigger>
        <TabsTrigger 
          value="ferc-data" 
          className="text-xs sm:text-sm px-1.5 py-2 sm:px-2 md:px-3 whitespace-nowrap min-w-0 flex-shrink-0"
        >
          <span className="truncate">FERC Data</span>
        </TabsTrigger>
        <TabsTrigger 
          value="usgs-data" 
          className="text-xs sm:text-sm px-1.5 py-2 sm:px-2 md:px-3 whitespace-nowrap min-w-0 flex-shrink-0"
        >
          <span className="truncate">USGS Data</span>
        </TabsTrigger>
        <TabsTrigger 
          value="environmental" 
          className="text-xs sm:text-sm px-1.5 py-2 sm:px-2 md:px-3 whitespace-nowrap min-w-0 flex-shrink-0"
        >
          <span className="truncate">Environmental</span>
        </TabsTrigger>
        <TabsTrigger 
          value="eia-data" 
          className="text-xs sm:text-sm px-1.5 py-2 sm:px-2 md:px-3 whitespace-nowrap min-w-0 flex-shrink-0"
        >
          <span className="truncate">EIA Data</span>
        </TabsTrigger>
      </TabsList>
    </div>
  );
}

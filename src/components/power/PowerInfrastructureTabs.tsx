
import React from 'react';
import { TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp,
  BarChart3,
  Building2,
  MapPin,
  Leaf,
  Satellite,
  Database
} from 'lucide-react';

export function PowerInfrastructureTabs() {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-2 shadow-sm">
      <div className="overflow-x-auto">
        <TabsList className="inline-flex w-max min-w-full gap-1 bg-transparent h-auto">
          <TabsTrigger 
            value="overview" 
            className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 p-2 sm:p-3 data-[state=active]:bg-blue-100 dark:data-[state=active]:bg-blue-900/30 whitespace-nowrap"
          >
            <TrendingUp className="w-4 h-4" />
            <span className="text-xs sm:text-sm font-medium">Overview</span>
          </TabsTrigger>
          <TabsTrigger 
            value="ercot-live"
            className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 p-2 sm:p-3 data-[state=active]:bg-red-100 dark:data-[state=active]:bg-red-900/30 whitespace-nowrap"
          >
            <BarChart3 className="w-4 h-4" />
            <span className="text-xs sm:text-sm font-medium">ERCOT</span>
          </TabsTrigger>
          <TabsTrigger 
            value="ferc-data"
            className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 p-2 sm:p-3 data-[state=active]:bg-green-100 dark:data-[state=active]:bg-green-900/30 whitespace-nowrap"
          >
            <Building2 className="w-4 h-4" />
            <span className="text-xs sm:text-sm font-medium">FERC</span>
          </TabsTrigger>
          <TabsTrigger 
            value="usgs-data"
            className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 p-2 sm:p-3 data-[state=active]:bg-orange-100 dark:data-[state=active]:bg-orange-900/30 whitespace-nowrap"
          >
            <MapPin className="w-4 h-4" />
            <span className="text-xs sm:text-sm font-medium">USGS</span>
          </TabsTrigger>
          <TabsTrigger 
            value="environmental"
            className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 p-2 sm:p-3 data-[state=active]:bg-emerald-100 dark:data-[state=active]:bg-emerald-900/30 whitespace-nowrap"
          >
            <Leaf className="w-4 h-4" />
            <span className="text-xs sm:text-sm font-medium">Environment</span>
          </TabsTrigger>
          <TabsTrigger 
            value="mapbox-explorer"
            className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 p-2 sm:p-3 data-[state=active]:bg-green-100 dark:data-[state=active]:bg-green-900/30 whitespace-nowrap"
          >
            <Satellite className="w-4 h-4" />
            <span className="text-xs sm:text-sm font-medium">Mapbox</span>
          </TabsTrigger>
          <TabsTrigger 
            value="eia-data"
            className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 p-2 sm:p-3 data-[state=active]:bg-emerald-100 dark:data-[state=active]:bg-emerald-900/30 whitespace-nowrap"
          >
            <Database className="w-4 h-4" />
            <span className="text-xs sm:text-sm font-medium">EIA Data</span>
          </TabsTrigger>
        </TabsList>
      </div>
    </div>
  );
}

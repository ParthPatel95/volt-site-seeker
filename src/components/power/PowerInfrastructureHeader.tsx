
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { 
  Zap, 
  Activity,
  Database,
  Satellite,
  BarChart3
} from 'lucide-react';

interface PowerInfrastructureHeaderProps {
  powerData: {
    totalProperties: number;
    totalPowerCapacity: number;
    averageCapacity: number;
    highCapacityCount: number;
  };
}

export function PowerInfrastructureHeader({ powerData }: PowerInfrastructureHeaderProps) {
  return (
    <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 shadow-sm">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        <div className="flex flex-col space-y-4 lg:space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-start space-y-4 sm:space-y-0 sm:space-x-4">
            <div className="p-3 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-xl shadow-lg flex-shrink-0">
              <Zap className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-900 dark:text-white mb-2">
                Power Infrastructure
              </h1>
              <p className="text-sm sm:text-base lg:text-lg text-slate-600 dark:text-slate-300 mb-3">
                Enhanced with real-time APIs: ERCOT, FERC, USGS, EPA, NREL & NOAA
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
                <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                  <Satellite className="w-3 h-3 mr-1" />
                  Mapbox satellite
                </Badge>
                <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                  <BarChart3 className="w-3 h-3 mr-1" />
                  Federal APIs
                </Badge>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 w-full">
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 text-center">
              <div className="text-lg sm:text-xl lg:text-2xl font-bold text-blue-600 dark:text-blue-400">
                {powerData.totalProperties}
              </div>
              <div className="text-xs text-blue-600/80 dark:text-blue-400/80 font-medium">
                Properties
              </div>
            </div>
            <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-3 text-center">
              <div className="text-lg sm:text-xl lg:text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                {powerData.totalPowerCapacity.toFixed(0)}
              </div>
              <div className="text-xs text-yellow-600/80 dark:text-yellow-400/80 font-medium">
                Total MW
              </div>
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3 text-center">
              <div className="text-lg sm:text-xl lg:text-2xl font-bold text-green-600 dark:text-green-400">
                {powerData.averageCapacity.toFixed(1)}
              </div>
              <div className="text-xs text-green-600/80 dark:text-green-400/80 font-medium">
                Avg MW
              </div>
            </div>
            <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-3 text-center">
              <div className="text-lg sm:text-xl lg:text-2xl font-bold text-purple-600 dark:text-purple-400">
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
  );
}

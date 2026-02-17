import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Activity, Wind, Sun, Fuel, Zap } from 'lucide-react';

interface GenerationTabProps {
  generationMix: any;
}

export function GenerationTab({ generationMix }: GenerationTabProps) {
  return (
    <div className="space-y-4 sm:space-y-6">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex flex-col sm:flex-row sm:items-center gap-2">
            <div className="flex items-center">
              <Activity className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-green-600" />
              <span className="text-sm sm:text-base">Current Generation Mix</span>
            </div>
            {generationMix?.timestamp && (
              <Badge variant="outline" className="text-xs self-start sm:self-auto">
                Updated: {new Date(generationMix.timestamp).toLocaleTimeString()}
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {generationMix ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-4">
                <div className="text-center p-2 sm:p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg min-w-0">
                  <Fuel className="w-4 h-4 sm:w-6 sm:h-6 mx-auto mb-1 sm:mb-2 text-blue-500 flex-shrink-0" />
                  <p className="text-xs sm:text-sm text-muted-foreground truncate">Natural Gas</p>
                  <p className="text-sm sm:text-base lg:text-xl font-bold break-all">
                    {generationMix.natural_gas_mw ? (generationMix.natural_gas_mw / 1000).toFixed(1) : '0.0'} GW
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {generationMix.total_generation_mw ? ((generationMix.natural_gas_mw / generationMix.total_generation_mw) * 100).toFixed(1) : '0.0'}%
                  </p>
                </div>
                <div className="text-center p-2 sm:p-4 bg-green-50 dark:bg-green-900/20 rounded-lg min-w-0">
                  <Wind className="w-4 h-4 sm:w-6 sm:h-6 mx-auto mb-1 sm:mb-2 text-green-500 flex-shrink-0" />
                  <p className="text-xs sm:text-sm text-muted-foreground truncate">Wind</p>
                  <p className="text-sm sm:text-base lg:text-xl font-bold break-all">
                    {generationMix.wind_mw ? (generationMix.wind_mw / 1000).toFixed(1) : '0.0'} GW
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {generationMix.total_generation_mw ? ((generationMix.wind_mw / generationMix.total_generation_mw) * 100).toFixed(1) : '0.0'}%
                  </p>
                </div>
                <div className="text-center p-2 sm:p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg min-w-0">
                  <Sun className="w-4 h-4 sm:w-6 sm:h-6 mx-auto mb-1 sm:mb-2 text-yellow-500 flex-shrink-0" />
                  <p className="text-xs sm:text-sm text-muted-foreground truncate">Solar</p>
                  <p className="text-sm sm:text-base lg:text-xl font-bold break-all">
                    {generationMix.solar_mw ? (generationMix.solar_mw / 1000).toFixed(1) : '0.0'} GW
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {generationMix.total_generation_mw ? ((generationMix.solar_mw / generationMix.total_generation_mw) * 100).toFixed(1) : '0.0'}%
                  </p>
                </div>
                <div className="text-center p-2 sm:p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg min-w-0">
                  <Activity className="w-4 h-4 sm:w-6 sm:h-6 mx-auto mb-1 sm:mb-2 text-blue-600 flex-shrink-0" />
                  <p className="text-xs sm:text-sm text-muted-foreground truncate">Hydro</p>
                  <p className="text-sm sm:text-base lg:text-xl font-bold break-all">
                    {generationMix.hydro_mw ? (generationMix.hydro_mw / 1000).toFixed(1) : '0.0'} GW
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {generationMix.total_generation_mw ? ((generationMix.hydro_mw / generationMix.total_generation_mw) * 100).toFixed(1) : '0.0'}%
                  </p>
                </div>
                <div className="text-center p-2 sm:p-4 bg-gray-50 dark:bg-gray-900/20 rounded-lg min-w-0">
                  <Fuel className="w-4 h-4 sm:w-6 sm:h-6 mx-auto mb-1 sm:mb-2 text-gray-600 flex-shrink-0" />
                  <p className="text-xs sm:text-sm text-muted-foreground truncate">Coal</p>
                  <p className="text-sm sm:text-base lg:text-xl font-bold break-all">
                    {generationMix.coal_mw ? (generationMix.coal_mw / 1000).toFixed(1) : '0.0'} GW
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {generationMix.total_generation_mw ? ((generationMix.coal_mw / generationMix.total_generation_mw) * 100).toFixed(1) : '0.0'}%
                  </p>
                </div>
                <div className="text-center p-2 sm:p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg min-w-0">
                  <Zap className="w-4 h-4 sm:w-6 sm:h-6 mx-auto mb-1 sm:mb-2 text-purple-500 flex-shrink-0" />
                  <p className="text-xs sm:text-sm text-muted-foreground truncate">Other</p>
                  <p className="text-sm sm:text-base lg:text-xl font-bold break-all">
                    {generationMix.other_mw ? (generationMix.other_mw / 1000).toFixed(1) : '0.0'} GW
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {generationMix.total_generation_mw ? ((generationMix.other_mw / generationMix.total_generation_mw) * 100).toFixed(1) : '0.0'}%
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-3 sm:p-4 bg-green-50 dark:bg-green-900/20 rounded-lg gap-2">
                <div className="min-w-0">
                  <span className="text-base sm:text-lg font-medium">Renewable Generation</span>
                  <p className="text-xs sm:text-sm text-muted-foreground">Wind + Hydro + Solar</p>
                </div>
                <div className="text-right">
                  <Badge variant="secondary" className="bg-green-100 text-green-800 text-sm sm:text-lg px-2 sm:px-3 py-1">
                    {generationMix.renewable_percentage?.toFixed(1) || '0.0'}%
                  </Badge>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                    Total: {generationMix.total_generation_mw ? (generationMix.total_generation_mw / 1000).toFixed(1) : '0.0'} GW
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <Activity className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-muted-foreground">Loading generation data...</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

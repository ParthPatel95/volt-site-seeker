import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Factory, MapPin, Zap, Search, Eye, Download, AlertTriangle } from 'lucide-react';
import { IdleIndustryScanControls } from './idleScanner/IdleIndustryScanControls';
import { IdleIndustryScanResults } from './idleScanner/IdleIndustryScanResults';
import { IdleIndustryScanMap } from './idleScanner/IdleIndustryScanMap';
import { IdleIndustryScanStats } from './idleScanner/IdleIndustryScanStats';
import { useIdleIndustryScanner } from './idleScanner/useIdleIndustryScanner';
import { RealDataVerifiedSitesPanel } from './idleScanner/RealDataVerifiedSitesPanel';

export function IdleIndustryScanner() {
  const {
    selectedJurisdiction,
    setSelectedJurisdiction,
    selectedCity,
    setSelectedCity,
    scanning,
    progress,
    currentPhase,
    results,
    scanStats,
    filters,
    setFilters,
    executeScan,
    exportToCsv,
    exportToPdf
  } = useIdleIndustryScanner();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Factory className="w-6 h-6 text-orange-600" />
            High Power Industry Map
            <Badge variant="outline" className="ml-auto">AI-Powered Analysis</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="scanner" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="scanner">🏭 Idle Industry Scanner</TabsTrigger>
              <TabsTrigger value="verified">✅ Verified Heavy Power Sites</TabsTrigger>
              <TabsTrigger value="map">🗺️ Interactive Map</TabsTrigger>
            </TabsList>

            <TabsContent value="scanner" className="space-y-6">
              <IdleIndustryScanControls
                selectedJurisdiction={selectedJurisdiction}
                setSelectedJurisdiction={setSelectedJurisdiction}
                selectedCity={selectedCity}
                setSelectedCity={setSelectedCity}
                scanning={scanning}
                progress={progress}
                currentPhase={currentPhase}
                executeScan={executeScan}
                exportToCsv={exportToCsv}
                exportToPdf={exportToPdf}
              />

              {scanStats && (
                <IdleIndustryScanStats stats={scanStats} />
              )}

              {results.length > 0 && (
                <IdleIndustryScanResults
                  results={results}
                  filters={filters}
                  setFilters={setFilters}
                />
              )}
            </TabsContent>

            <TabsContent value="verified">
              <RealDataVerifiedSitesPanel />
            </TabsContent>

            <TabsContent value="map" className="space-y-4">
              {results.length > 0 ? (
                <IdleIndustryScanMap 
                  sites={results.filter(site => 
                    site.idleScore >= filters.minIdleScore &&
                    site.estimatedFreeMW >= filters.minFreeMW &&
                    site.substationDistanceKm <= filters.maxSubstationDistance
                  )}
                />
              ) : (
                <div className="text-center py-12">
                  <Factory className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-600 mb-2">No scan results yet</h3>
                  <p className="text-gray-500">Run a scan to see sites on the interactive map</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

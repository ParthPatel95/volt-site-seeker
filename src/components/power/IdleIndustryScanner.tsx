
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
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
              <Factory className="w-6 h-6 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <CardTitle className="text-xl">Idle Industry Scanner</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Discover underutilized industrial facilities with high power capacity potential for data center conversion
              </p>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Scan Controls */}
      <IdleIndustryScanControls
        selectedJurisdiction={selectedJurisdiction}
        setSelectedJurisdiction={setSelectedJurisdiction}
        selectedCity={selectedCity}
        setSelectedCity={setSelectedCity}
        scanning={scanning}
        progress={progress}
        currentPhase={currentPhase}
        onExecuteScan={executeScan}
      />

      {/* Results Section */}
      {results.length > 0 && (
        <>
          {/* Stats Overview */}
          <IdleIndustryScanStats 
            scanStats={scanStats}
            results={results}
            onExportCsv={exportToCsv}
            onExportPdf={exportToPdf}
          />

          {/* Results Tabs */}
          <Tabs defaultValue="table" className="space-y-4">
            <TabsList>
              <TabsTrigger value="table" className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                Results Table
              </TabsTrigger>
              <TabsTrigger value="map" className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Interactive Map
              </TabsTrigger>
            </TabsList>

            <TabsContent value="table">
              <IdleIndustryScanResults
                results={results}
                filters={filters}
                setFilters={setFilters}
              />
            </TabsContent>

            <TabsContent value="map">
              <IdleIndustryScanMap
                results={results}
                filters={filters}
              />
            </TabsContent>
          </Tabs>
        </>
      )}

      {/* Empty State */}
      {!scanning && results.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <Factory className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Ready to Scan for Idle Industries</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Select a jurisdiction and optionally a specific city to discover underutilized industrial facilities 
              with high power capacity potential for data center conversion.
            </p>
            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex items-center justify-center gap-2">
                <Eye className="w-4 h-4" />
                <span>AI-powered satellite analysis</span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <Zap className="w-4 h-4" />
                <span>Power capacity estimation</span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <MapPin className="w-4 h-4" />
                <span>Substation proximity analysis</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

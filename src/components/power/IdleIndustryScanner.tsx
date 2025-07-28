
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Factory, MapPin, Zap, Search, Eye, Download, AlertTriangle, CheckCircle, Satellite, Database, Settings } from 'lucide-react';
import { useEnhancedIdleScanner } from './idleScanner/useEnhancedIdleScanner';
import { EnhancedInteractiveMap } from './idleScanner/EnhancedInteractiveMap';
import { EnhancedResultsPanel } from './idleScanner/EnhancedResultsPanel';
import { EnhancedScanConfig, EnhancedVerifiedSite } from './idleScanner/enhanced_types';
import { TEXAS_CITIES, ALBERTA_CITIES } from './ultimateFinder/UltimateFinderTypes';

const JURISDICTIONS = [
  'Texas', 'California', 'Florida', 'New York', 'Pennsylvania', 'Illinois', 'Ohio', 'Georgia', 'North Carolina', 'Michigan',
  'Alberta', 'British Columbia', 'Ontario', 'Quebec'
];

export function IdleIndustryScanner() {
  const {
    sites,
    selectedSites,
    currentScan,
    scanHistory,
    scanStats,
    filters,
    loading,
    setSelectedSites,
    setFilters,
    startEnhancedScan,
    loadSites,
    deleteSite,
    bulkDeleteSites,
    deleteAllSites,
    exportSites
  } = useEnhancedIdleScanner();

  const [scanConfig, setScanConfig] = useState<EnhancedScanConfig>({
    jurisdiction: '',
    city: '',
    includeConfidenceThreshold: 50,
    enableSatelliteAnalysis: true,
    enableGPTValidation: true,
    enableEPAData: true,
    enableFERCData: true,
    enableBusinessRegistry: true,
    enableGooglePlaces: true,
    enableCommercialRealEstate: true,
    maxResults: 100
  });

  const [selectedSite, setSelectedSite] = useState<EnhancedVerifiedSite | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  const getCitiesForJurisdiction = (jurisdiction: string) => {
    switch (jurisdiction) {
      case 'Texas':
        return TEXAS_CITIES;
      case 'Alberta':
        return ALBERTA_CITIES;
      default:
        return [];
    }
  };

  const availableCities = getCitiesForJurisdiction(scanConfig.jurisdiction);

  const handleStartScan = () => {
    startEnhancedScan(scanConfig);
  };

  const handleSiteSelect = (siteId: string) => {
    setSelectedSites(prev => 
      prev.includes(siteId) 
        ? prev.filter(id => id !== siteId)
        : [...prev, siteId]
    );
  };

  const handleBulkSelect = (siteIds: string[]) => {
    setSelectedSites(siteIds);
  };

  const handleViewDetails = (site: EnhancedVerifiedSite) => {
    setSelectedSite(site);
    setShowDetails(true);
  };

  const handleDeleteAll = () => {
    if (confirm('Are you sure you want to delete ALL discovered sites? This action cannot be undone.')) {
      deleteAllSites();
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-4 sm:space-y-6 p-4 sm:p-6">
      <Card className="w-full overflow-hidden">
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 min-w-0">
              <div className="flex items-center gap-2 min-w-0">
                <Factory className="w-5 h-5 sm:w-6 sm:h-6 text-orange-600 flex-shrink-0" />
                <span className="text-lg sm:text-xl font-bold truncate">Enhanced Idle Industry Scanner</span>
              </div>
              <Badge variant="outline" className="self-start sm:ml-2 text-xs sm:text-sm whitespace-nowrap">AI-Powered Multi-Source</Badge>
            </div>
            {scanStats && (
              <Badge variant="secondary" className="text-xs sm:text-sm whitespace-nowrap">
                <span className="hidden sm:inline">{scanStats.totalSitesFound} sites • {Math.round(scanStats.totalEstimatedFreeMW)}MW available</span>
                <span className="sm:hidden">{scanStats.totalSitesFound} sites • {Math.round(scanStats.totalEstimatedFreeMW)}MW</span>
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          <Tabs defaultValue="scanner" className="w-full">
            <div className="w-full overflow-x-auto">
              <TabsList className="inline-flex h-auto min-w-full p-1">
                <TabsTrigger value="scanner" className="flex items-center gap-1 sm:gap-2 py-2 px-2 sm:px-3 text-xs sm:text-sm min-w-0 flex-1">
                  <Search className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                  <span className="hidden sm:inline truncate">🔍 Enhanced Scanner</span>
                  <span className="sm:hidden truncate">Scanner</span>
                </TabsTrigger>
                <TabsTrigger value="results" className="flex items-center gap-1 sm:gap-2 py-2 px-2 sm:px-3 text-xs sm:text-sm min-w-0 flex-1">
                  <Database className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                  <span className="hidden sm:inline truncate">📊 Results ({sites.length})</span>
                  <span className="sm:hidden truncate">Results</span>
                </TabsTrigger>
                <TabsTrigger value="map" className="flex items-center gap-1 sm:gap-2 py-2 px-2 sm:px-3 text-xs sm:text-sm min-w-0 flex-1">
                  <MapPin className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                  <span className="hidden sm:inline truncate">🗺️ Interactive Map</span>
                  <span className="sm:hidden truncate">Map</span>
                </TabsTrigger>
                <TabsTrigger value="analytics" className="flex items-center gap-1 sm:gap-2 py-2 px-2 sm:px-3 text-xs sm:text-sm min-w-0 flex-1">
                  <Eye className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                  <span className="hidden sm:inline truncate">📈 Analytics</span>
                  <span className="sm:hidden truncate">Analytics</span>
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="scanner" className="space-y-4 sm:space-y-6">
              {/* Enhanced Scan Configuration */}
              <Card>
                <CardHeader className="p-4 sm:p-6">
                  <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                    <Settings className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span className="hidden sm:inline">Multi-Source Scan Configuration</span>
                    <span className="sm:hidden">Scan Configuration</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 p-4 sm:p-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Jurisdiction *</label>
                      <select
                        value={scanConfig.jurisdiction}
                        onChange={(e) => setScanConfig({
                          ...scanConfig,
                          jurisdiction: e.target.value,
                          city: '' // Reset city when jurisdiction changes
                        })}
                        disabled={currentScan?.status === 'processing'}
                        className="w-full p-2 sm:p-3 border rounded-md text-sm sm:text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">Select state or province</option>
                        {JURISDICTIONS.map(jurisdiction => (
                          <option key={jurisdiction} value={jurisdiction}>
                            {jurisdiction}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">City (Optional)</label>
                      <select
                        value={scanConfig.city}
                        onChange={(e) => setScanConfig({...scanConfig, city: e.target.value})}
                        disabled={currentScan?.status === 'processing' || !scanConfig.jurisdiction || availableCities.length === 0}
                        className="w-full p-2 sm:p-3 border rounded-md text-sm sm:text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">All cities</option>
                        {availableCities.map(city => (
                          <option key={city} value={city}>
                            {city}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Data Source Configuration */}
                  <div className="space-y-3">
                    <label className="text-sm font-medium">Data Sources (Select Multiple)</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3">
                      <div className="flex items-center space-x-2 p-2 sm:p-3 border rounded-md">
                        <input
                          type="checkbox"
                          checked={scanConfig.enableEPAData}
                          onChange={(e) => setScanConfig({...scanConfig, enableEPAData: e.target.checked})}
                          className="rounded flex-shrink-0"
                        />
                        <span className="text-xs sm:text-sm truncate">EPA Facility Registry</span>
                      </div>
                      <div className="flex items-center space-x-2 p-2 sm:p-3 border rounded-md">
                        <input
                          type="checkbox"
                          checked={scanConfig.enableFERCData}
                          onChange={(e) => setScanConfig({...scanConfig, enableFERCData: e.target.checked})}
                          className="rounded flex-shrink-0"
                        />
                        <span className="text-xs sm:text-sm truncate">FERC Generator DB</span>
                      </div>
                      <div className="flex items-center space-x-2 p-2 sm:p-3 border rounded-md">
                        <input
                          type="checkbox"
                          checked={scanConfig.enableBusinessRegistry}
                          onChange={(e) => setScanConfig({...scanConfig, enableBusinessRegistry: e.target.checked})}
                          className="rounded flex-shrink-0"
                        />
                        <span className="text-xs sm:text-sm truncate">Business Registrations</span>
                      </div>
                      <div className="flex items-center space-x-2 p-2 sm:p-3 border rounded-md">
                        <input
                          type="checkbox"
                          checked={scanConfig.enableGooglePlaces}
                          onChange={(e) => setScanConfig({...scanConfig, enableGooglePlaces: e.target.checked})}
                          className="rounded flex-shrink-0"
                        />
                        <span className="text-xs sm:text-sm truncate">Google Places API</span>
                      </div>
                      <div className="flex items-center space-x-2 p-2 sm:p-3 border rounded-md">
                        <input
                          type="checkbox"
                          checked={scanConfig.enableCommercialRealEstate}
                          onChange={(e) => setScanConfig({...scanConfig, enableCommercialRealEstate: e.target.checked})}
                          className="rounded flex-shrink-0"
                        />
                        <span className="text-xs sm:text-sm truncate">Commercial Real Estate</span>
                      </div>
                      <div className="flex items-center space-x-2 p-2 sm:p-3 border rounded-md">
                        <input
                          type="checkbox"
                          checked={scanConfig.enableSatelliteAnalysis}
                          onChange={(e) => setScanConfig({...scanConfig, enableSatelliteAnalysis: e.target.checked})}
                          className="rounded flex-shrink-0"
                        />
                        <span className="text-xs sm:text-sm truncate">Satellite Analysis</span>
                      </div>
                    </div>
                  </div>

                  {/* Advanced Options */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">
                        Confidence Threshold: {scanConfig.includeConfidenceThreshold}%
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        step="10"
                        value={scanConfig.includeConfidenceThreshold}
                        onChange={(e) => setScanConfig({
                          ...scanConfig, 
                          includeConfidenceThreshold: parseInt(e.target.value)
                        })}
                        className="w-full"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Max Results</label>
                      <select
                        value={scanConfig.maxResults}
                        onChange={(e) => setScanConfig({...scanConfig, maxResults: parseInt(e.target.value)})}
                        className="w-full p-2 border rounded-md text-sm sm:text-base"
                      >
                        <option value={50}>50</option>
                        <option value={100}>100</option>
                        <option value={200}>200</option>
                        <option value={500}>500</option>
                      </select>
                    </div>
                  </div>

                  {/* Current Scan Status */}
                  {currentScan && currentScan.status === 'processing' && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>{currentScan.current_phase}</span>
                        <span>{currentScan.progress}%</span>
                      </div>
                      <Progress value={currentScan.progress} className="w-full" />
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
                    <Button 
                      onClick={handleStartScan}
                      disabled={currentScan?.status === 'processing' || !scanConfig.jurisdiction}
                      className="flex-1 text-sm sm:text-base"
                      size="lg"
                    >
                      {currentScan?.status === 'processing' ? (
                        <>
                          <Search className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 animate-spin" />
                          <span className="hidden sm:inline">Scanning... ({currentScan.progress}%)</span>
                          <span className="sm:hidden">Scanning... {currentScan.progress}%</span>
                        </>
                      ) : (
                        <>
                          <Search className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                          <span className="hidden sm:inline">Start Enhanced Multi-Source Scan</span>
                          <span className="sm:hidden">Start Scan</span>
                        </>
                      )}
                    </Button>

                    {sites.length > 0 && (
                      <>
                        <Button 
                          variant="outline"
                          onClick={() => exportSites('csv')}
                          className="text-sm sm:text-base"
                        >
                          <Download className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                          <span className="hidden sm:inline">Export CSV</span>
                          <span className="sm:hidden">Export</span>
                        </Button>
                        <Button 
                          variant="destructive"
                          onClick={handleDeleteAll}
                          className="text-sm sm:text-base"
                        >
                          <Factory className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                          <span className="hidden sm:inline">Delete All</span>
                          <span className="sm:hidden">Delete</span>
                        </Button>
                      </>
                    )}
                  </div>

                  {/* Information */}
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Enhanced Multi-Source Discovery:</strong> This scanner uses 6+ data sources including 
                      EPA registries, FERC databases, business registrations, Google Places, commercial real estate 
                      listings, and satellite imagery analysis for comprehensive site discovery.
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>

              {/* Scan Statistics */}
              {scanStats && (
                <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                          <Database className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Total Sites</p>
                          <p className="text-2xl font-bold">{scanStats.totalSitesFound}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                          <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Verified Sites</p>
                          <p className="text-2xl font-bold">{scanStats.verifiedSites}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
                          <Zap className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Available Power</p>
                          <p className="text-2xl font-bold">{Math.round(scanStats.totalEstimatedFreeMW)}MW</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                          <Eye className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Data Sources</p>
                          <p className="text-2xl font-bold">{scanStats.dataSourcesUsed.length}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </TabsContent>

            <TabsContent value="results">
              <EnhancedResultsPanel
                sites={sites}
                selectedSites={selectedSites}
                filters={filters}
                loading={loading}
                onSiteSelect={handleSiteSelect}
                onBulkSelect={handleBulkSelect}
                onFiltersChange={setFilters}
                onDeleteSite={deleteSite}
                onBulkDelete={bulkDeleteSites}
                onExport={exportSites}
                onViewDetails={handleViewDetails}
              />
            </TabsContent>

            <TabsContent value="map">
              <EnhancedInteractiveMap
                sites={sites}
                selectedSites={selectedSites}
                onSiteSelect={handleSiteSelect}
                onSitesSelect={handleBulkSelect}
                filters={filters}
                onFilterChange={setFilters}
              />
            </TabsContent>

            <TabsContent value="analytics" className="space-y-4">
              {scanStats ? (
                <div className="grid gap-6">
                  <div className="grid gap-4 md:grid-cols-3">
                    <Card>
                      <CardContent className="p-4">
                        <div className="text-2xl font-bold text-green-600">{scanStats.highConfidenceSites}</div>
                        <div className="text-sm text-gray-600">High Confidence Sites</div>
                        <div className="text-xs text-gray-500">
                          {((scanStats.highConfidenceSites / scanStats.totalSitesFound) * 100).toFixed(1)}% of total
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <div className="text-2xl font-bold text-yellow-600">{scanStats.mediumConfidenceSites}</div>
                        <div className="text-sm text-gray-600">Medium Confidence Sites</div>
                        <div className="text-xs text-gray-500">
                          {((scanStats.mediumConfidenceSites / scanStats.totalSitesFound) * 100).toFixed(1)}% of total
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <div className="text-2xl font-bold">{scanStats.averageConfidenceScore}</div>
                        <div className="text-sm text-gray-600">Average Confidence Score</div>
                        <div className="text-xs text-gray-500">
                          Across all discovered sites
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <Card>
                    <CardHeader>
                      <CardTitle>Data Sources Used</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid gap-2 md:grid-cols-2">
                        {scanStats.dataSourcesUsed.map(source => (
                          <div key={source} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            <span className="text-sm">{source.replace(/_/g, ' ')}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <div className="text-center py-12">
                  <Satellite className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-600 mb-2">No analytics available</h3>
                  <p className="text-gray-500">Run an enhanced scan to see detailed analytics</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}


import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Search, Satellite, Database, Building, Factory, Zap, AlertTriangle, Clock } from 'lucide-react';
import { useIndustryIntelSearch } from './hooks/useIndustryIntelSearch';

interface IndustryIntelSearchEngineProps {
  onOpportunitiesFound: (opportunities: any[]) => void;
}

const JURISDICTIONS = [
  'Alberta', 'British Columbia', 'Ontario', 'Quebec', 'Newfoundland',
  'Texas', 'California', 'Florida', 'New York', 'Pennsylvania'
];

export function IndustryIntelSearchEngine({ onOpportunitiesFound }: IndustryIntelSearchEngineProps) {
  const [searchConfig, setSearchConfig] = useState({
    jurisdiction: '',
    enableIdleProperties: true,
    enableCorporateDistress: true,
    enableSatelliteAnalysis: true,
    enableSECFilings: true,
    enableBankruptcyData: true,
    enableNewsIntelligence: true,
    maxResults: 100
  });

  const {
    opportunities,
    scanProgress,
    isScanning,
    scanStats,
    currentPhase,
    startUnifiedScan,
    error
  } = useIndustryIntelSearch();

  const handleStartScan = () => {
    if (!searchConfig.jurisdiction) return;
    startUnifiedScan(searchConfig);
  };

  React.useEffect(() => {
    if (opportunities.length > 0) {
      onOpportunitiesFound(opportunities);
    }
  }, [opportunities, onOpportunitiesFound]);

  return (
    <div className="space-y-6">
      {/* Search Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="w-5 h-5 text-blue-600" />
            Unified Intelligence Search Engine
            <Badge variant="outline" className="ml-auto">Real-Time Data</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Jurisdiction Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Target Jurisdiction *</label>
            <select
              value={searchConfig.jurisdiction}
              onChange={(e) => setSearchConfig({...searchConfig, jurisdiction: e.target.value})}
              disabled={isScanning}
              className="w-full p-3 border rounded-md"
            >
              <option value="">Select state or province</option>
              {JURISDICTIONS.map(jurisdiction => (
                <option key={jurisdiction} value={jurisdiction}>
                  {jurisdiction}
                </option>
              ))}
            </select>
          </div>

          {/* Data Source Configuration */}
          <div className="space-y-3">
            <label className="text-sm font-medium">Intelligence Sources</label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="flex items-center space-x-3 p-3 border rounded-md">
                <input
                  type="checkbox"
                  checked={searchConfig.enableIdleProperties}
                  onChange={(e) => setSearchConfig({...searchConfig, enableIdleProperties: e.target.checked})}
                  className="rounded"
                />
                <div className="flex items-center gap-2">
                  <Factory className="w-4 h-4 text-orange-600" />
                  <span className="text-sm">Idle Properties</span>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-3 border rounded-md">
                <input
                  type="checkbox"
                  checked={searchConfig.enableCorporateDistress}
                  onChange={(e) => setSearchConfig({...searchConfig, enableCorporateDistress: e.target.checked})}
                  className="rounded"
                />
                <div className="flex items-center gap-2">
                  <Building className="w-4 h-4 text-red-600" />
                  <span className="text-sm">Corporate Distress</span>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-3 border rounded-md">
                <input
                  type="checkbox"
                  checked={searchConfig.enableSatelliteAnalysis}
                  onChange={(e) => setSearchConfig({...searchConfig, enableSatelliteAnalysis: e.target.checked})}
                  className="rounded"
                />
                <div className="flex items-center gap-2">
                  <Satellite className="w-4 h-4 text-purple-600" />
                  <span className="text-sm">Satellite Analysis</span>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-3 border rounded-md">
                <input
                  type="checkbox"
                  checked={searchConfig.enableSECFilings}
                  onChange={(e) => setSearchConfig({...searchConfig, enableSECFilings: e.target.checked})}
                  className="rounded"
                />
                <div className="flex items-center gap-2">
                  <Database className="w-4 h-4 text-blue-600" />
                  <span className="text-sm">SEC/SEDAR Filings</span>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-3 border rounded-md">
                <input
                  type="checkbox"
                  checked={searchConfig.enableBankruptcyData}
                  onChange={(e) => setSearchConfig({...searchConfig, enableBankruptcyData: e.target.checked})}
                  className="rounded"
                />
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-yellow-600" />
                  <span className="text-sm">Bankruptcy Courts</span>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-3 border rounded-md">
                <input
                  type="checkbox"
                  checked={searchConfig.enableNewsIntelligence}
                  onChange={(e) => setSearchConfig({...searchConfig, enableNewsIntelligence: e.target.checked})}
                  className="rounded"
                />
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-green-600" />
                  <span className="text-sm">News Intelligence</span>
                </div>
              </div>
            </div>
          </div>

          {/* Scan Controls */}
          <div className="flex gap-4 pt-4">
            <Button 
              onClick={handleStartScan}
              disabled={isScanning || !searchConfig.jurisdiction}
              className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600"
              size="lg"
            >
              {isScanning ? (
                <>
                  <Search className="w-4 h-4 mr-2 animate-spin" />
                  Scanning... ({scanProgress}%)
                </>
              ) : (
                <>
                  <Search className="w-4 h-4 mr-2" />
                  Start Unified Intelligence Scan
                </>
              )}
            </Button>
          </div>

          {/* Scan Progress */}
          {isScanning && (
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">{currentPhase}</span>
                <span className="font-medium">{scanProgress}%</span>
              </div>
              <Progress value={scanProgress} className="w-full" />
            </div>
          )}

          {/* Error Display */}
          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Scan Results Summary */}
          {scanStats && (
            <div className="grid gap-4 md:grid-cols-4 pt-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-red-100 rounded-lg">
                      <AlertTriangle className="w-4 h-4 text-red-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Distressed Sites</p>
                      <p className="text-xl font-bold">{scanStats.distressedSites}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-orange-100 rounded-lg">
                      <Factory className="w-4 h-4 text-orange-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Idle Properties</p>
                      <p className="text-xl font-bold">{scanStats.idleProperties}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <Zap className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Power Potential</p>
                      <p className="text-xl font-bold">{scanStats.totalMW}MW</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Database className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Data Sources</p>
                      <p className="text-xl font-bold">{scanStats.sourcesUsed}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Information Alert */}
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Real-Time Intelligence:</strong> This scanner combines 6+ live data sources including 
              SEC/SEDAR filings, bankruptcy courts, satellite imagery, news intelligence, and regulatory 
              databases for comprehensive distressed asset discovery.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
}

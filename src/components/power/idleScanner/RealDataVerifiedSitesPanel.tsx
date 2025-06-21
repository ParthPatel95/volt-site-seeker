
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  Search, 
  Satellite, 
  Brain, 
  Shield, 
  Download, 
  RefreshCw,
  MapPin,
  Zap,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Eye
} from 'lucide-react';
import { useRealDataVerifiedSites } from './useRealDataVerifiedSites';
import { RealDataSiteDetailsModal } from './RealDataSiteDetailsModal';
import { VerifiedHeavyPowerSite, RealDataScanConfig } from './realdata_types';

export function RealDataVerifiedSitesPanel() {
  const [scanConfig, setScanConfig] = useState<RealDataScanConfig>({
    jurisdiction: '',
    city: '',
    includeConfidenceThreshold: 50,
    enableSatelliteAnalysis: true,
    enableGPTValidation: true,
    maxResults: 50
  });

  const [selectedSite, setSelectedSite] = useState<VerifiedHeavyPowerSite | null>(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);

  const {
    sites,
    scanning,
    progress,
    currentPhase,
    scanStats,
    executeScan,
    exportToCsv
  } = useRealDataVerifiedSites(scanConfig);

  const handleScanNow = () => {
    if (!scanConfig.jurisdiction) return;
    executeScan();
  };

  const handleViewDetails = (site: VerifiedHeavyPowerSite) => {
    setSelectedSite(site);
    setDetailsModalOpen(true);
  };

  const getConfidenceBadge = (score: number, level: string) => {
    const colors = {
      'High': 'bg-green-100 text-green-800',
      'Medium': 'bg-yellow-100 text-yellow-800',
      'Low': 'bg-red-100 text-red-800'
    };
    return (
      <Badge className={colors[level as keyof typeof colors]}>
        {level} ({score})
      </Badge>
    );
  };

  const getVisualStatusIcon = (status: string) => {
    switch (status) {
      case 'Active':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'Idle':
        return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
      case 'Likely Abandoned':
        return <XCircle className="w-4 h-4 text-red-600" />;
      default:
        return <AlertTriangle className="w-4 h-4 text-gray-600" />;
    }
  };

  const filteredSites = sites.filter(site => 
    site.confidenceScore.total >= scanConfig.includeConfidenceThreshold
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-blue-600" />
            Verified Heavy Power Sites
            <Badge variant="outline" className="ml-auto">Real-Time Validation</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="scan" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="scan">🔍 Scan Configuration</TabsTrigger>
              <TabsTrigger value="results">📊 Results ({filteredSites.length})</TabsTrigger>
              <TabsTrigger value="analytics">📈 Analytics</TabsTrigger>
            </TabsList>

            <TabsContent value="scan" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Jurisdiction</label>
                  <Select 
                    value={scanConfig.jurisdiction} 
                    onValueChange={(value) => setScanConfig({...scanConfig, jurisdiction: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select jurisdiction" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Texas">Texas</SelectItem>
                      <SelectItem value="Alberta">Alberta</SelectItem>
                      <SelectItem value="California">California</SelectItem>
                      <SelectItem value="Pennsylvania">Pennsylvania</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium">City (Optional)</label>
                  <Input
                    placeholder="Enter city name"
                    value={scanConfig.city}
                    onChange={(e) => setScanConfig({...scanConfig, city: e.target.value})}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">
                    Confidence Threshold: {scanConfig.includeConfidenceThreshold}%
                  </label>
                  <div className="mt-2">
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
                </div>

                <div>
                  <label className="text-sm font-medium">Max Results</label>
                  <Select 
                    value={scanConfig.maxResults.toString()} 
                    onValueChange={(value) => setScanConfig({...scanConfig, maxResults: parseInt(value)})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="25">25</SelectItem>
                      <SelectItem value="50">50</SelectItem>
                      <SelectItem value="100">100</SelectItem>
                      <SelectItem value="200">200</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={scanConfig.enableSatelliteAnalysis}
                    onCheckedChange={(checked) => setScanConfig({
                      ...scanConfig, 
                      enableSatelliteAnalysis: checked
                    })}
                  />
                  <div className="flex items-center gap-2">
                    <Satellite className="w-4 h-4" />
                    <span className="text-sm">Satellite Image Analysis</span>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    checked={scanConfig.enableGPTValidation}
                    onCheckedChange={(checked) => setScanConfig({
                      ...scanConfig, 
                      enableGPTValidation: checked
                    })}
                  />
                  <div className="flex items-center gap-2">
                    <Brain className="w-4 h-4" />
                    <span className="text-sm">GPT-4 Validation</span>
                  </div>
                </div>
              </div>

              <div className="flex space-x-4">
                <Button 
                  onClick={handleScanNow}
                  disabled={!scanConfig.jurisdiction || scanning}
                  className="flex-1"
                >
                  {scanning ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Scanning... ({progress}%)
                    </>
                  ) : (
                    <>
                      <Search className="w-4 h-4 mr-2" />
                      Scan Now - Multi-Source Validation
                    </>
                  )}
                </Button>

                <Button 
                  variant="outline" 
                  onClick={exportToCsv}
                  disabled={filteredSites.length === 0}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export CSV
                </Button>
              </div>

              {scanning && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>{currentPhase}</span>
                    <span>{progress}%</span>
                  </div>
                  <Progress value={progress} className="w-full" />
                </div>
              )}
            </TabsContent>

            <TabsContent value="results" className="space-y-4">
              {filteredSites.length > 0 ? (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Site Name</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Confidence</TableHead>
                        <TableHead>Verified</TableHead>
                        <TableHead>Visual Status</TableHead>
                        <TableHead>Power Potential</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredSites.map((site) => (
                        <TableRow key={site.id}>
                          <TableCell className="font-medium">
                            <div>
                              <div className="font-semibold">{site.name}</div>
                              <div className="text-xs text-gray-600">
                                {site.sources.length} sources
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              <span className="text-sm">{site.city}, {site.state}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            {getConfidenceBadge(
                              site.confidenceScore.total, 
                              site.confidenceScore.level
                            )}
                          </TableCell>
                          <TableCell>
                            {site.validation.isVerified ? (
                              <CheckCircle className="w-4 h-4 text-green-600" />
                            ) : (
                              <XCircle className="w-4 h-4 text-red-600" />
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {getVisualStatusIcon(site.satelliteAnalysis.visualStatus)}
                              <span className="text-sm">{site.satelliteAnalysis.visualStatus}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={
                              site.gptAnalysis.powerPotential === 'High' ? 'default' :
                              site.gptAnalysis.powerPotential === 'Medium' ? 'secondary' : 
                              'outline'
                            }>
                              {site.gptAnalysis.powerPotential}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleViewDetails(site)}
                            >
                              <Eye className="w-3 h-3 mr-1" />
                              Details
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No verified sites found. Try adjusting your scan configuration.</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="analytics" className="space-y-4">
              {scanStats && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-2xl font-bold">{scanStats.totalScanned}</div>
                      <div className="text-sm text-gray-600">Total Sites Scanned</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-2xl font-bold">{scanStats.verifiedSites}</div>
                      <div className="text-sm text-gray-600">Verified Sites</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-2xl font-bold">{scanStats.averageConfidence}%</div>
                      <div className="text-sm text-gray-600">Avg Confidence</div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <RealDataSiteDetailsModal
        site={selectedSite}
        open={detailsModalOpen}
        onOpenChange={setDetailsModalOpen}
      />
    </div>
  );
}

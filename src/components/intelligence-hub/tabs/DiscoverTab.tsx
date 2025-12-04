
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Play, Square, Sparkles } from 'lucide-react';
import { IntelSourceSelector } from '../components/IntelSourceSelector';
import { LiveScanProgress } from '../components/LiveScanProgress';
import { IntelResultCard } from '../components/IntelResultCard';
import { IntelDetailsModal } from '../components/IntelDetailsModal';
import { useUnifiedScan } from '../hooks/useUnifiedScan';
import { useIntelligenceHub } from '../hooks/useIntelligenceHub';
import { ScanConfig, IntelOpportunity } from '../types/intelligence-hub.types';

const jurisdictions = [
  { value: 'alberta', label: 'Alberta, Canada' },
  { value: 'texas', label: 'Texas, USA' },
  { value: 'california', label: 'California, USA' },
  { value: 'pjm', label: 'PJM Interconnection' },
  { value: 'miso', label: 'MISO' },
  { value: 'nyiso', label: 'NYISO' },
  { value: 'ontario', label: 'Ontario, Canada' },
];

export function DiscoverTab() {
  const { isScanning, startScan, stopScan, opportunities } = useUnifiedScan();
  const { state } = useIntelligenceHub();
  
  const [jurisdiction, setJurisdiction] = useState('alberta');
  const [city, setCity] = useState('');
  const [selectedSources, setSelectedSources] = useState(['idle', 'distress', 'satellite', 'sec']);
  const [maxResults, setMaxResults] = useState(50);
  const [selectedOpportunity, setSelectedOpportunity] = useState<IntelOpportunity | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const handleViewDetails = (opportunity: IntelOpportunity) => {
    setSelectedOpportunity(opportunity);
    setDetailsOpen(true);
  };

  const handleStartScan = () => {
    const config: ScanConfig = {
      jurisdiction,
      city: city || undefined,
      enableIdleProperties: selectedSources.includes('idle'),
      enableCorporateDistress: selectedSources.includes('distress'),
      enableSatelliteAnalysis: selectedSources.includes('satellite'),
      enableSECFilings: selectedSources.includes('sec'),
      enableBankruptcyData: selectedSources.includes('bankruptcy'),
      enableNewsIntelligence: selectedSources.includes('news'),
      enableFERCData: selectedSources.includes('ferc'),
      enableEPARegistry: selectedSources.includes('epa'),
      maxResults
    };
    startScan(config);
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Search Configuration */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <Search className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
            Intelligence Search Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Location Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="jurisdiction">Jurisdiction / Market</Label>
              <Select value={jurisdiction} onValueChange={setJurisdiction} disabled={isScanning}>
                <SelectTrigger id="jurisdiction">
                  <SelectValue placeholder="Select jurisdiction" />
                </SelectTrigger>
                <SelectContent>
                  {jurisdictions.map(j => (
                    <SelectItem key={j.value} value={j.value}>{j.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="city">City (Optional)</Label>
              <Input 
                id="city"
                placeholder="Enter city name..."
                value={city}
                onChange={(e) => setCity(e.target.value)}
                disabled={isScanning}
              />
            </div>
          </div>

          {/* Intelligence Sources */}
          <div className="space-y-2">
            <Label>Intelligence Sources</Label>
            <IntelSourceSelector 
              selected={selectedSources} 
              onChange={setSelectedSources}
              disabled={isScanning}
            />
          </div>

          {/* Quick Presets */}
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedSources(['idle', 'satellite', 'epa'])}
              disabled={isScanning}
              className="text-xs"
            >
              <Sparkles className="w-3 h-3 mr-1" />
              Idle Sites Focus
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedSources(['distress', 'sec', 'bankruptcy', 'news'])}
              disabled={isScanning}
              className="text-xs"
            >
              <Sparkles className="w-3 h-3 mr-1" />
              Corporate Distress Focus
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedSources(['idle', 'distress', 'satellite', 'sec', 'news', 'epa'])}
              disabled={isScanning}
              className="text-xs"
            >
              <Sparkles className="w-3 h-3 mr-1" />
              Full Scan
            </Button>
          </div>

          {/* Action Button */}
          <div className="flex gap-3 pt-2">
            {isScanning ? (
              <Button 
                variant="destructive" 
                onClick={stopScan}
                className="flex-1 sm:flex-none"
              >
                <Square className="w-4 h-4 mr-2" />
                Stop Scan
              </Button>
            ) : (
              <Button 
                onClick={handleStartScan}
                disabled={selectedSources.length === 0}
                className="flex-1 sm:flex-none"
              >
                <Play className="w-4 h-4 mr-2" />
                Start Intelligence Scan
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Scan Progress */}
      <LiveScanProgress />

      {/* Results Grid */}
      {opportunities.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-foreground">
              Found {opportunities.length} Opportunities
            </h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {opportunities.map((opportunity) => (
              <IntelResultCard 
                key={opportunity.id} 
                opportunity={opportunity}
                onViewDetails={handleViewDetails}
              />
            ))}
          </div>
        </div>
      )}

      {/* Details Modal */}
      <IntelDetailsModal
        opportunity={selectedOpportunity}
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
      />

      {/* Empty State */}
      {!isScanning && opportunities.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
              <Search className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium text-foreground mb-2">Ready to Discover</h3>
            <p className="text-sm text-muted-foreground max-w-md">
              Configure your search parameters and intelligence sources above, then click "Start Intelligence Scan" to find opportunities.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

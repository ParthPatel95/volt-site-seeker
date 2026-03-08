import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Flame, Search, Loader2, Zap, MapPin, DollarSign, Building, BarChart3, Bell } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { PowerInfraAnalysis } from './PowerInfraAnalysis';
import { PropertySatelliteCard } from './PropertySatelliteCard';
import { PropertyMiningProjection } from './PropertyMiningProjection';
import { PropertyComparisonTable } from './PropertyComparisonTable';
import { ScanWatchlistManager } from './ScanWatchlistManager';
import { ScanReportPDF } from './ScanReportPDF';

interface FirecrawlPropertyScannerProps {
  onPropertiesFound: (count: number) => void;
}

type ScanStage = 'idle' | 'searching' | 'scraping' | 'analyzing' | 'saving' | 'done';

export function FirecrawlPropertyScanner({ onPropertiesFound }: FirecrawlPropertyScannerProps) {
  const [location, setLocation] = useState('Texas');
  const [propertyType, setPropertyType] = useState('industrial');
  const [minPowerMw, setMinPowerMw] = useState('');
  const [budgetMax, setBudgetMax] = useState('');
  const [stage, setStage] = useState<ScanStage>('idle');
  const [results, setResults] = useState<any[]>([]);
  const [activeView, setActiveView] = useState<'cards' | 'table'>('cards');
  const { toast } = useToast();

  const stageLabels: Record<ScanStage, string> = {
    idle: 'Start Scan',
    searching: 'Searching LoopNet, Crexi & more...',
    scraping: 'Scraping listing details...',
    analyzing: 'AI analyzing power infrastructure...',
    saving: 'Saving properties...',
    done: 'Scan Complete',
  };

  const handleScan = async () => {
    setStage('searching');
    setResults([]);

    try {
      setStage('scraping');

      const { data, error } = await supabase.functions.invoke('firecrawl-property-scanner', {
        body: {
          location,
          property_type: propertyType,
          min_power_mw: minPowerMw ? parseFloat(minPowerMw) : undefined,
          budget_max: budgetMax ? parseFloat(budgetMax) : undefined,
        }
      });

      if (error) throw new Error(error.message);

      setStage('analyzing');

      if (data?.success && data?.properties_found > 0) {
        setResults(data.properties || []);
        onPropertiesFound(data.properties_found);
        setStage('done');

        toast({
          title: 'Scan Complete!',
          description: `Found ${data.properties_found} mining-suitable properties from ${data.total_results_searched} listings searched.`,
        });
      } else {
        setStage('done');
        toast({
          title: 'Scan Complete',
          description: data?.message || 'No properties found matching criteria. Try a different location.',
        });
      }
    } catch (err: any) {
      console.error('Firecrawl scan error:', err);
      setStage('idle');
      toast({
        title: 'Scan Failed',
        description: err.message || 'Failed to scan properties.',
        variant: 'destructive',
      });
    }
  };

  const isScanning = stage !== 'idle' && stage !== 'done';

  return (
    <div className="space-y-6">
      <Card className="border-orange-200 bg-gradient-to-r from-orange-50 to-amber-50">
        <CardHeader>
          <CardTitle className="flex items-center text-orange-700">
            <Flame className="w-5 h-5 mr-2" />
            Firecrawl Property Scanner
          </CardTitle>
          <p className="text-sm text-orange-600">
            AI-powered web scraping across LoopNet, Crexi, LandSearch &amp; more — finds properties with detailed power infrastructure analysis, live BTC profitability projections, and satellite mapping.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-medium text-foreground">Location</label>
              <Input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Texas, Wyoming, Ohio"
                disabled={isScanning}
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-foreground">Property Type</label>
              <Select value={propertyType} onValueChange={setPropertyType} disabled={isScanning}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="industrial">Industrial</SelectItem>
                  <SelectItem value="warehouse">Warehouse</SelectItem>
                  <SelectItem value="data_center">Data Center</SelectItem>
                  <SelectItem value="manufacturing">Manufacturing</SelectItem>
                  <SelectItem value="land">Land / Vacant</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-foreground">Min Power (MW)</label>
              <Input
                value={minPowerMw}
                onChange={(e) => setMinPowerMw(e.target.value)}
                placeholder="e.g. 5"
                type="number"
                disabled={isScanning}
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-foreground">Max Budget ($)</label>
              <Input
                value={budgetMax}
                onChange={(e) => setBudgetMax(e.target.value)}
                placeholder="e.g. 5000000"
                type="number"
                disabled={isScanning}
              />
            </div>
          </div>

          {/* Progress indicator */}
          {isScanning && (
            <div className="flex items-center gap-3 p-3 bg-orange-100 rounded-lg">
              <Loader2 className="w-5 h-5 animate-spin text-orange-600" />
              <div>
                <p className="font-medium text-orange-800">{stageLabels[stage]}</p>
                <p className="text-xs text-orange-600">This may take 30-60 seconds depending on results</p>
              </div>
            </div>
          )}

          <Button
            onClick={handleScan}
            disabled={isScanning || !location}
            className="w-full bg-orange-600 hover:bg-orange-700"
            size="lg"
          >
            {isScanning ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> {stageLabels[stage]}</>
            ) : (
              <><Search className="w-4 h-4 mr-2" /> Scan for Mining-Suitable Properties</>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Watch Alerts */}
      <ScanWatchlistManager />

      {/* Results */}
      {results.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <Zap className="w-5 h-5 text-[hsl(var(--chart-4))]" />
              {results.length} Properties Found
            </h3>
            <div className="flex items-center gap-2">
              <ScanReportPDF properties={results} location={location} />
              <div className="flex border border-border rounded-md">
                <Button
                  variant={activeView === 'cards' ? 'default' : 'ghost'}
                  size="sm"
                  className="h-7 rounded-r-none"
                  onClick={() => setActiveView('cards')}
                >
                  Cards
                </Button>
                <Button
                  variant={activeView === 'table' ? 'default' : 'ghost'}
                  size="sm"
                  className="h-7 rounded-l-none"
                  onClick={() => setActiveView('table')}
                >
                  <BarChart3 className="w-3 h-3 mr-1" />
                  Compare
                </Button>
              </div>
            </div>
          </div>

          {/* Comparison table view */}
          {activeView === 'table' && (
            <PropertyComparisonTable properties={results} />
          )}

          {/* Card view */}
          {activeView === 'cards' && results.map((prop, idx) => (
            <Card key={idx} className="border-l-4 border-l-orange-500 hover:shadow-lg transition-shadow">
              <CardContent className="p-5 space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-lg font-bold flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                      {prop.address || `${prop.city}, ${prop.state}`}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {prop.city}, {prop.state} {prop.zip_code || ''}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {prop.eia_electricity_rate && (
                      <Badge variant="outline" className="text-xs">
                        EIA: {(prop.eia_electricity_rate * 100).toFixed(1)}¢/kWh
                      </Badge>
                    )}
                    {prop.bitcoin_mining_suitability?.score && (
                      <Badge
                        variant={prop.bitcoin_mining_suitability.score >= 7 ? 'default' : prop.bitcoin_mining_suitability.score >= 4 ? 'secondary' : 'outline'}
                        className={
                          prop.bitcoin_mining_suitability.score >= 7
                            ? 'bg-[hsl(var(--data-positive))]'
                            : prop.bitcoin_mining_suitability.score >= 4
                            ? 'bg-[hsl(var(--data-warning))]'
                            : ''
                        }
                      >
                        Mining Score: {prop.bitcoin_mining_suitability.score}/10
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Quick stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {prop.asking_price && (
                    <div className="flex items-center gap-2 p-2 bg-[hsl(var(--data-positive)/0.1)] rounded">
                      <DollarSign className="w-4 h-4 text-[hsl(var(--data-positive))]" />
                      <div>
                        <p className="font-bold text-[hsl(var(--data-positive))]">${(prop.asking_price / 1000000).toFixed(1)}M</p>
                        <p className="text-xs text-muted-foreground">Price</p>
                      </div>
                    </div>
                  )}
                  {prop.square_footage && (
                    <div className="flex items-center gap-2 p-2 bg-[hsl(var(--data-info)/0.1)] rounded">
                      <Building className="w-4 h-4 text-[hsl(var(--data-info))]" />
                      <div>
                        <p className="font-bold text-[hsl(var(--data-info))]">{prop.square_footage.toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground">Sq Ft</p>
                      </div>
                    </div>
                  )}
                  {prop.power_infrastructure?.estimated_power_capacity_mw && (
                    <div className="flex items-center gap-2 p-2 bg-[hsl(var(--chart-4)/0.1)] rounded">
                      <Zap className="w-4 h-4 text-[hsl(var(--chart-4))]" />
                      <div>
                        <p className="font-bold text-[hsl(var(--chart-4))]">{prop.power_infrastructure.estimated_power_capacity_mw} MW</p>
                        <p className="text-xs text-muted-foreground">Power</p>
                      </div>
                    </div>
                  )}
                  {prop.lot_size_acres && (
                    <div className="flex items-center gap-2 p-2 bg-[hsl(var(--chart-2)/0.1)] rounded">
                      <MapPin className="w-4 h-4 text-[hsl(var(--chart-2))]" />
                      <div>
                        <p className="font-bold text-[hsl(var(--chart-2))]">{prop.lot_size_acres}</p>
                        <p className="text-xs text-muted-foreground">Acres</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Description */}
                {prop.description && (
                  <p className="text-sm text-muted-foreground">{prop.description}</p>
                )}

                {/* Live Mining Projection */}
                <PropertyMiningProjection
                  powerCapacityMw={prop.power_infrastructure?.estimated_power_capacity_mw}
                  electricityRate={prop.eia_electricity_rate || null}
                  askingPrice={prop.asking_price}
                />

                {/* Satellite Map + Substations */}
                <PropertySatelliteCard property={prop} />

                {/* Power Infrastructure Analysis */}
                {prop.power_infrastructure && (
                  <PowerInfraAnalysis analysis={prop.power_infrastructure} />
                )}

                {/* Mining suitability */}
                {prop.bitcoin_mining_suitability && (
                  <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                    <h5 className="font-semibold text-sm">⛏️ Bitcoin Mining Suitability</h5>
                    {prop.bitcoin_mining_suitability.strengths?.length > 0 && (
                      <div>
                        <span className="text-xs font-medium text-[hsl(var(--data-positive))]">Strengths:</span>
                        <ul className="list-disc list-inside text-xs text-muted-foreground ml-2">
                          {prop.bitcoin_mining_suitability.strengths.map((s: string, i: number) => (
                            <li key={i}>{s}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {prop.bitcoin_mining_suitability.weaknesses?.length > 0 && (
                      <div>
                        <span className="text-xs font-medium text-[hsl(var(--data-negative))]">Weaknesses:</span>
                        <ul className="list-disc list-inside text-xs text-muted-foreground ml-2">
                          {prop.bitcoin_mining_suitability.weaknesses.map((w: string, i: number) => (
                            <li key={i}>{w}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {prop.bitcoin_mining_suitability.estimated_hashrate_capacity && (
                      <p className="text-xs"><span className="font-medium">Est. Hashrate:</span> {prop.bitcoin_mining_suitability.estimated_hashrate_capacity}</p>
                    )}
                    {prop.bitcoin_mining_suitability.recommended_setup && (
                      <p className="text-xs"><span className="font-medium">Recommendation:</span> {prop.bitcoin_mining_suitability.recommended_setup}</p>
                    )}
                  </div>
                )}

                {/* Link */}
                {prop.listing_url && (
                  <a
                    href={prop.listing_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline"
                  >
                    View Original Listing →
                  </a>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

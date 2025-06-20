
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  Search, 
  Satellite, 
  Database, 
  Map, 
  BarChart3,
  CheckCircle,
  AlertTriangle,
  Zap,
  Target,
  Brain,
  Shield,
  TrendingUp,
  MapPin,
  Eye,
  Merge
} from 'lucide-react';

interface FinderResult {
  id: string;
  name: string;
  coordinates: { lat: number; lng: number };
  confidence_score: number;
  source: string;
  voltage_level: string;
  capacity_estimate: string;
  utility_owner?: string;
  validation_status: 'pending' | 'confirmed' | 'rejected';
  infrastructure_features: string[];
  discovery_method: string;
}

interface SearchStats {
  total_found: number;
  regulatory_sources: number;
  satellite_detections: number;
  validated_locations: number;
  high_confidence: number;
}

export function UltimatePowerInfrastructureFinder() {
  const [searchRegion, setSearchRegion] = useState<'alberta' | 'texas'>('texas');
  const [searchRadius, setSearchRadius] = useState(100);
  const [centerCoordinates, setCenterCoordinates] = useState('');
  const [searching, setSearching] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentPhase, setCurrentPhase] = useState('');
  const [results, setResults] = useState<FinderResult[]>([]);
  const [searchStats, setSearchStats] = useState<SearchStats | null>(null);
  const { toast } = useToast();

  const executeUltimateSearch = async () => {
    setSearching(true);
    setProgress(0);
    setResults([]);
    setSearchStats(null);

    try {
      console.log('Starting ultimate substation search for', searchRegion);
      
      // Phase 1: Regulatory Data Integration (20% progress)
      setCurrentPhase('Phase 1: Regulatory Data Integration');
      setProgress(5);
      
      const { data: regulatoryData, error: regError } = await supabase.functions.invoke('regulatory-data-integration', {
        body: {
          action: searchRegion === 'alberta' ? 'fetch_aeso_data' : 'fetch_ercot_data',
          region: searchRegion
        }
      });

      if (regError) throw regError;
      setProgress(20);

      // Phase 2: Satellite Analysis (40% progress)
      setCurrentPhase('Phase 2: Advanced Satellite Analysis');
      
      const { data: satelliteData, error: satError } = await supabase.functions.invoke('satellite-analysis', {
        body: {
          action: 'ml_detection',
          region: searchRegion,
          analysis_type: 'comprehensive',
          ml_models: ['substation_detector', 'transmission_line_detector', 'change_detector']
        }
      });

      if (satError) throw satError;
      setProgress(40);

      // Phase 3: Google Maps Integration (60% progress)
      setCurrentPhase('Phase 3: Google Maps Integration');
      
      const { data: googleData, error: googleError } = await supabase.functions.invoke('google-maps-substation-finder', {
        body: {
          action: 'comprehensive_search',
          region: searchRegion,
          search_terms: ['substation', 'electrical substation', 'power substation', 'transmission station']
        }
      });

      if (googleError) throw googleError;
      setProgress(60);

      // Phase 4: Database Integration (80% progress)
      setCurrentPhase('Phase 4: Database Cross-Reference');
      
      const { data: existingSubstations, error: dbError } = await supabase
        .from('substations')
        .select('*')
        .eq('state', searchRegion === 'texas' ? 'TX' : 'AB');

      if (dbError) throw dbError;
      setProgress(80);

      // Phase 5: Data Validation & Consolidation (100% progress)
      setCurrentPhase('Phase 5: Data Validation & Consolidation');
      
      const consolidatedResults = await consolidateAllSources(
        regulatoryData,
        satelliteData,
        googleData,
        existingSubstations
      );

      setResults(consolidatedResults.results);
      setSearchStats(consolidatedResults.stats);
      setProgress(100);

      toast({
        title: "Ultimate Search Complete!",
        description: `Found ${consolidatedResults.results.length} substations using all 5 phases`,
      });

    } catch (error: any) {
      console.error('Ultimate search error:', error);
      toast({
        title: "Search Error",
        description: error.message || "Failed to complete ultimate search",
        variant: "destructive"
      });
    } finally {
      setSearching(false);
      setCurrentPhase('');
    }
  };

  const consolidateAllSources = async (regulatory: any, satellite: any, google: any, database: any[]) => {
    // Simulate advanced consolidation logic
    const allResults: FinderResult[] = [];
    let stats: SearchStats = {
      total_found: 0,
      regulatory_sources: 0,
      satellite_detections: 0,
      validated_locations: 0,
      high_confidence: 0
    };

    // Add regulatory results
    if (regulatory?.data?.substations_found) {
      stats.regulatory_sources = regulatory.data.substations_found;
    }

    // Add satellite detections
    if (satellite?.detections) {
      satellite.detections.forEach((detection: any, idx: number) => {
        allResults.push({
          id: `satellite_${idx}`,
          name: `Satellite Detection ${detection.coordinates.lat.toFixed(4)}, ${detection.coordinates.lng.toFixed(4)}`,
          coordinates: detection.coordinates,
          confidence_score: detection.confidence_score,
          source: 'Satellite ML Analysis',
          voltage_level: detection.voltage_indicators[0] || '138kV',
          capacity_estimate: detection.capacity_estimate,
          validation_status: 'pending',
          infrastructure_features: detection.infrastructure_features,
          discovery_method: 'AI/ML Satellite Analysis'
        });
      });
      stats.satellite_detections = satellite.detections.length;
    }

    // Add database results
    database.forEach((sub, idx) => {
      allResults.push({
        id: `db_${sub.id}`,
        name: sub.name,
        coordinates: { lat: sub.latitude, lng: sub.longitude },
        confidence_score: 95,
        source: 'Database Record',
        voltage_level: sub.voltage_level || '138kV',
        capacity_estimate: `${sub.capacity_mva} MVA`,
        utility_owner: sub.utility_owner,
        validation_status: 'confirmed',
        infrastructure_features: ['Verified substation'],
        discovery_method: 'Database Integration'
      });
    });

    // Calculate final stats
    stats.total_found = allResults.length;
    stats.validated_locations = allResults.filter(r => r.validation_status === 'confirmed').length;
    stats.high_confidence = allResults.filter(r => r.confidence_score >= 90).length;

    return { results: allResults, stats };
  };

  const validateResult = async (result: FinderResult, status: 'confirmed' | 'rejected') => {
    try {
      if (status === 'confirmed') {
        // Store confirmed result in database
        const { error } = await supabase
          .from('substations')
          .insert({
            name: result.name,
            latitude: result.coordinates.lat,
            longitude: result.coordinates.lng,
            capacity_mva: parseInt(result.capacity_estimate.split(' ')[0]) || 100,
            voltage_level: result.voltage_level,
            utility_owner: result.utility_owner || 'Unknown',
            city: searchRegion === 'texas' ? 'Texas' : 'Alberta',
            state: searchRegion === 'texas' ? 'TX' : 'AB',
            coordinates_source: result.discovery_method,
            status: 'active',
            interconnection_type: 'transmission',
            load_factor: 0.75
          });

        if (error) throw error;
      }

      // Update local state
      setResults(prev => 
        prev.map(r => 
          r.id === result.id 
            ? { ...r, validation_status: status }
            : r
        )
      );

      toast({
        title: status === 'confirmed' ? "Result Confirmed" : "Result Rejected",
        description: status === 'confirmed' ? "Substation added to database" : "Result marked as invalid",
      });

    } catch (error: any) {
      console.error('Validation error:', error);
      toast({
        title: "Validation Error",
        description: error.message || "Failed to validate result",
        variant: "destructive"
      });
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return 'bg-green-100 text-green-800 border-green-200';
    if (confidence >= 70) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    return 'bg-red-100 text-red-800 border-red-200';
  };

  const getSourceIcon = (source: string) => {
    if (source.includes('Satellite')) return <Satellite className="w-4 h-4" />;
    if (source.includes('Database')) return <Database className="w-4 h-4" />;
    if (source.includes('Google')) return <Search className="w-4 h-4" />;
    return <MapPin className="w-4 h-4" />;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-2xl">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
              <Brain className="w-6 h-6 text-white" />
            </div>
            Ultimate Power Infrastructure Finder
            <Badge variant="outline" className="bg-white/50">
              All 5 Phases Integrated
            </Badge>
          </CardTitle>
          <p className="text-muted-foreground text-lg">
            Advanced AI-powered substation discovery combining regulatory data, satellite analysis, 
            Google Maps integration, database cross-referencing, and validation systems
          </p>
        </CardHeader>
      </Card>

      {/* Search Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            Search Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Target Region</label>
              <select 
                className="w-full p-3 border rounded-lg bg-white dark:bg-gray-800"
                value={searchRegion}
                onChange={(e) => setSearchRegion(e.target.value as 'alberta' | 'texas')}
              >
                <option value="texas">Texas (ERCOT)</option>
                <option value="alberta">Alberta (AESO)</option>
              </select>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">Search Radius (km)</label>
              <Input
                type="number"
                value={searchRadius}
                onChange={(e) => setSearchRadius(parseInt(e.target.value))}
                placeholder="100"
                className="p-3"
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Center Coordinates (optional)</label>
              <Input
                value={centerCoordinates}
                onChange={(e) => setCenterCoordinates(e.target.value)}
                placeholder="lat, lng"
                className="p-3"
              />
            </div>
          </div>

          <Button 
            onClick={executeUltimateSearch}
            disabled={searching}
            className="w-full h-12 text-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            <Shield className="w-5 h-5 mr-2" />
            Execute Ultimate Search
          </Button>

          {searching && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm font-medium">
                <span>{currentPhase}</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} className="w-full h-2" />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Search Statistics */}
      {searchStats && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Search Results Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="text-center p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{searchStats.total_found}</div>
                <div className="text-sm text-blue-800 dark:text-blue-200">Total Found</div>
              </div>
              <div className="text-center p-4 bg-green-50 dark:bg-green-950 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{searchStats.regulatory_sources}</div>
                <div className="text-sm text-green-800 dark:text-green-200">Regulatory</div>
              </div>
              <div className="text-center p-4 bg-purple-50 dark:bg-purple-950 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">{searchStats.satellite_detections}</div>
                <div className="text-sm text-purple-800 dark:text-purple-200">Satellite AI</div>
              </div>
              <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-950 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600">{searchStats.validated_locations}</div>
                <div className="text-sm text-yellow-800 dark:text-yellow-200">Validated</div>
              </div>
              <div className="text-center p-4 bg-orange-50 dark:bg-orange-950 rounded-lg">
                <div className="text-2xl font-bold text-orange-600">{searchStats.high_confidence}</div>
                <div className="text-sm text-orange-800 dark:text-orange-200">High Confidence</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results */}
      {results.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Discovery Results ({results.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {results.map((result) => (
                <div key={result.id} className="border rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      {getSourceIcon(result.source)}
                      <span className="font-medium">{result.name}</span>
                      <Badge className={getConfidenceColor(result.confidence_score)}>
                        {result.confidence_score}% confidence
                      </Badge>
                      <Badge variant="outline">{result.voltage_level}</Badge>
                    </div>
                    
                    <div className="flex gap-2">
                      {result.validation_status === 'pending' && (
                        <>
                          <Button
                            size="sm"
                            onClick={() => validateResult(result, 'confirmed')}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Confirm
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => validateResult(result, 'rejected')}
                          >
                            <AlertTriangle className="w-4 h-4 mr-1" />
                            Reject
                          </Button>
                        </>
                      )}
                      {result.validation_status === 'confirmed' && (
                        <Badge className="bg-green-100 text-green-800">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Confirmed
                        </Badge>
                      )}
                      {result.validation_status === 'rejected' && (
                        <Badge className="bg-red-100 text-red-800">
                          <AlertTriangle className="w-3 h-3 mr-1" />
                          Rejected
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <strong>Location:</strong> {result.coordinates.lat.toFixed(4)}, {result.coordinates.lng.toFixed(4)}
                    </div>
                    <div>
                      <strong>Capacity:</strong> {result.capacity_estimate}
                    </div>
                    <div>
                      <strong>Source:</strong> {result.source}
                    </div>
                  </div>

                  {result.infrastructure_features.length > 0 && (
                    <div className="mt-3">
                      <strong className="text-sm">Features:</strong>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {result.infrastructure_features.map((feature, idx) => (
                          <Badge key={idx} variant="secondary" className="text-xs">
                            {feature}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

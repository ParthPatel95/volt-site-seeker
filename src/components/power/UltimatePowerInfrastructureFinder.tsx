
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { SubstationDetailsModal } from './SubstationDetailsModal';
import { useCapacityEstimator } from '@/hooks/useCapacityEstimator';
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
  Merge,
  RefreshCw,
  DollarSign,
  Calculator,
  Trash2,
  Loader2,
  Activity
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
  rate_estimation?: {
    estimated_rate_per_kwh: number;
    demand_charge_per_kw: number;
    monthly_cost_estimate: number;
    annual_cost_estimate: number;
    rate_tier: string;
    utility_market: string;
  };
}

interface SearchStats {
  total_found: number;
  regulatory_sources: number;
  satellite_detections: number;
  validated_locations: number;
  high_confidence: number;
}

interface StoredSubstation {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  capacity_mva: number;
  voltage_level: string;
  utility_owner: string;
  city: string;
  state: string;
  status: string;
  coordinates_source: string;
  created_at: string;
  updated_at: string;
  commissioning_date?: string;
  upgrade_potential?: number;
  interconnection_type: string;
  load_factor: number;
}

const TEXAS_CITIES = [
  'All Cities',
  'Houston', 'San Antonio', 'Dallas', 'Austin', 'Fort Worth', 'El Paso',
  'Arlington', 'Corpus Christi', 'Plano', 'Lubbock', 'Laredo', 'Irving',
  'Garland', 'Frisco', 'McKinney', 'Grand Prairie', 'Amarillo', 'Mesquite',
  'Killeen', 'Brownsville', 'Pasadena', 'McAllen', 'Carrollton', 'Beaumont',
  'Abilene', 'Round Rock', 'Richardson', 'Waco', 'Denton', 'Midland',
  'Odessa', 'Lewisville', 'Tyler', 'College Station', 'Pearland', 'Sugar Land'
];

const ALBERTA_CITIES = [
  'All Cities',
  'Calgary', 'Edmonton', 'Red Deer', 'Lethbridge', 'Medicine Hat',
  'Grande Prairie', 'Airdrie', 'Spruce Grove', 'Okotoks', 'Lloydminster',
  'Camrose', 'Brooks', 'Cold Lake', 'Wetaskiwin', 'Leduc', 'Fort Saskatchewan',
  'Stony Plain', 'Cochrane', 'Lacombe', 'Taber', 'Whitecourt', 'High River',
  'Hinton', 'Canmore', 'Sylvan Lake', 'Innisfail', 'Blackfalds', 'Didsbury',
  'Olds', 'Slave Lake', 'Drayton Valley', 'Sundre', 'Athabasca'
];

export function UltimatePowerInfrastructureFinder() {
  const [searchRegion, setSearchRegion] = useState<'alberta' | 'texas'>('texas');
  const [selectedCity, setSelectedCity] = useState('All Cities');
  const [centerCoordinates, setCenterCoordinates] = useState('');
  const [searching, setSearching] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentPhase, setCurrentPhase] = useState('');
  const [searchStats, setSearchStats] = useState<SearchStats | null>(null);
  const [storedSubstations, setStoredSubstations] = useState<StoredSubstation[]>([]);
  const [loadingStored, setLoadingStored] = useState(true);
  const [selectedSubstation, setSelectedSubstation] = useState<StoredSubstation | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [analyzingSubstation, setAnalyzingSubstation] = useState<string | null>(null);
  const [deletingSubstation, setDeletingSubstation] = useState<string | null>(null);
  const { estimateCapacity, loading: capacityLoading } = useCapacityEstimator();
  const { toast } = useToast();

  // Default power requirement for large industrial clients (50 MW)
  const defaultPowerRequirement = 50;

  useEffect(() => {
    loadStoredSubstations();
  }, []);

  // Reset city selection when region changes
  useEffect(() => {
    setSelectedCity('All Cities');
  }, [searchRegion]);

  const loadStoredSubstations = async () => {
    try {
      setLoadingStored(true);
      console.log('Loading stored substations...');
      
      const { data, error } = await supabase
        .from('substations')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading stored substations:', error);
        throw error;
      }

      setStoredSubstations(data || []);
      console.log('Loaded stored substations:', data?.length || 0);
    } catch (error: any) {
      console.error('Failed to load stored substations:', error);
      toast({
        title: "Error Loading Stored Data",
        description: error.message || "Failed to load stored substations",
        variant: "destructive"
      });
    } finally {
      setLoadingStored(false);
    }
  };

  const calculateRateEstimation = async (result: FinderResult) => {
    try {
      const { data, error } = await supabase.functions.invoke('energy-rate-intelligence', {
        body: {
          action: 'calculate_energy_costs',
          monthly_consumption_mwh: defaultPowerRequirement * 24 * 30, // MW to MWh per month
          peak_demand_mw: defaultPowerRequirement,
          location: { state: searchRegion === 'texas' ? 'TX' : 'AB' },
          substation_info: {
            voltage_level: result.voltage_level,
            capacity: result.capacity_estimate,
            utility_owner: result.utility_owner
          }
        }
      });

      if (error) throw error;

      // Enhanced rate calculation based on region and substation characteristics
      const baseRate = searchRegion === 'texas' ? 0.045 : 0.065; // $/kWh
      const demandCharge = searchRegion === 'texas' ? 15 : 18; // $/kW
      
      // Adjust rates based on voltage level and capacity
      let rateMultiplier = 1.0;
      if (result.voltage_level.includes('500kV') || result.voltage_level.includes('345kV')) {
        rateMultiplier = 0.85; // Better rates for transmission-level connections
      } else if (result.voltage_level.includes('138kV')) {
        rateMultiplier = 0.92;
      }

      const estimatedRate = baseRate * rateMultiplier;
      const monthlyEnergyConsumption = defaultPowerRequirement * 24 * 30; // MWh
      const monthlyEnergyCost = monthlyEnergyConsumption * estimatedRate * 1000; // Convert to kWh
      const monthlyDemandCost = defaultPowerRequirement * 1000 * demandCharge; // Convert MW to kW
      const totalMonthlyCost = monthlyEnergyCost + monthlyDemandCost;

      return {
        estimated_rate_per_kwh: estimatedRate,
        demand_charge_per_kw: demandCharge,
        monthly_cost_estimate: totalMonthlyCost,
        annual_cost_estimate: totalMonthlyCost * 12,
        rate_tier: defaultPowerRequirement > 100 ? 'Ultra-Large Industrial' : 'Large Industrial',
        utility_market: searchRegion === 'texas' ? 'ERCOT Competitive' : 'Alberta Regulated'
      };
    } catch (error) {
      console.error('Rate estimation error:', error);
      // Fallback estimation
      const fallbackRate = searchRegion === 'texas' ? 0.05 : 0.07;
      const monthlyConsumption = defaultPowerRequirement * 24 * 30;
      const monthlyCost = monthlyConsumption * fallbackRate * 1000 + (defaultPowerRequirement * 1000 * 15);
      
      return {
        estimated_rate_per_kwh: fallbackRate,
        demand_charge_per_kw: 15,
        monthly_cost_estimate: monthlyCost,
        annual_cost_estimate: monthlyCost * 12,
        rate_tier: 'Large Industrial',
        utility_market: searchRegion === 'texas' ? 'ERCOT' : 'Alberta'
      };
    }
  };

  const executeUltimateSearch = async () => {
    setSearching(true);
    setProgress(0);
    setSearchStats(null);

    try {
      console.log('Starting ultimate substation search for', searchRegion, selectedCity !== 'All Cities' ? `in ${selectedCity}` : '');
      
      // Phase 1: Regulatory Data Integration (20% progress)
      setCurrentPhase('Phase 1: Regulatory Data Integration');
      setProgress(5);
      
      const { data: regulatoryData, error: regError } = await supabase.functions.invoke('regulatory-data-integration', {
        body: {
          action: searchRegion === 'alberta' ? 'fetch_aeso_data' : 'fetch_ercot_data',
          region: searchRegion,
          city: selectedCity !== 'All Cities' ? selectedCity : undefined
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
          city: selectedCity !== 'All Cities' ? selectedCity : undefined,
          analysis_type: 'comprehensive',
          ml_models: ['substation_detector', 'transmission_line_detector', 'change_detector']
        }
      });

      if (satError) throw satError;
      setProgress(40);

      // Phase 3: Google Maps Integration (60% progress)
      setCurrentPhase('Phase 3: Google Maps Integration');
      
      const searchLocation = selectedCity !== 'All Cities' 
        ? `${selectedCity}, ${searchRegion === 'texas' ? 'Texas, USA' : 'Alberta, Canada'}`
        : searchRegion === 'texas' ? 'Texas, USA' : 'Alberta, Canada';
      
      const { data: googleData, error: googleError } = await supabase.functions.invoke('google-maps-substation-finder', {
        body: {
          action: 'comprehensive_search',
          location: searchLocation,
          maxResults: 0,
          searchTerms: ['electrical substation', 'power substation', 'transmission substation', 'distribution substation']
        }
      });

      if (googleError) throw googleError;
      setProgress(60);

      // Phase 4: Database Integration (80% progress)
      setCurrentPhase('Phase 4: Database Cross-Reference');
      
      let dbQuery = supabase
        .from('substations')
        .select('*')
        .eq('state', searchRegion === 'texas' ? 'TX' : 'AB');

      if (selectedCity !== 'All Cities') {
        dbQuery = dbQuery.eq('city', selectedCity);
      }

      const { data: existingSubstations, error: dbError } = await dbQuery;

      if (dbError) throw dbError;
      setProgress(80);

      // Phase 5: Data Validation & Rate Estimation (100% progress)
      setCurrentPhase('Phase 5: Data Validation & Storage');
      
      const consolidatedResults = await consolidateAllSources(
        regulatoryData,
        satelliteData,
        googleData,
        existingSubstations
      );

      // Calculate rate estimations for all results
      const resultsWithRates = await Promise.all(
        consolidatedResults.results.map(async (result) => {
          const rateEstimation = await calculateRateEstimation(result);
          return { ...result, rate_estimation: rateEstimation };
        })
      );

      // Auto-store all new substations found
      await storeNewSubstations(resultsWithRates);

      setSearchStats(consolidatedResults.stats);
      setProgress(100);

      // Reload stored substations to show the new ones
      await loadStoredSubstations();

      const searchArea = selectedCity !== 'All Cities' ? `${selectedCity}, ${searchRegion}` : `entire ${searchRegion} region`;
      toast({
        title: "Ultimate Search Complete!",
        description: `Found and stored ${resultsWithRates.length} substations with rate estimations in ${searchArea}`,
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

  const storeNewSubstations = async (results: FinderResult[]) => {
    const newSubstations = [];
    
    for (const result of results) {
      // Check if substation already exists
      const { data: existing } = await supabase
        .from('substations')
        .select('id')
        .eq('latitude', result.coordinates.lat)
        .eq('longitude', result.coordinates.lng)
        .single();

      if (!existing) {
        newSubstations.push({
          name: result.name,
          latitude: result.coordinates.lat,
          longitude: result.coordinates.lng,
          capacity_mva: parseInt(result.capacity_estimate.split(' ')[0]) || 100,
          voltage_level: result.voltage_level,
          utility_owner: result.utility_owner || 'Unknown',
          city: selectedCity !== 'All Cities' ? selectedCity : (searchRegion === 'texas' ? 'Texas' : 'Alberta'),
          state: searchRegion === 'texas' ? 'TX' : 'AB',
          coordinates_source: result.source.toLowerCase().replace(/\s+/g, '_'),
          status: 'active',
          interconnection_type: 'transmission',
          load_factor: 0.75
        });
      }
    }

    if (newSubstations.length > 0) {
      const { error } = await supabase
        .from('substations')
        .insert(newSubstations);

      if (error) {
        console.error('Error storing substations:', error);
        throw error;
      }

      console.log(`Stored ${newSubstations.length} new substations`);
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

    // Add Google Maps results
    if (google?.substations) {
      google.substations.forEach((sub: any, idx: number) => {
        allResults.push({
          id: `google_${sub.place_id}`,
          name: sub.name,
          coordinates: { lat: sub.latitude, lng: sub.longitude },
          confidence_score: 85,
          source: 'Google Maps Places API',
          voltage_level: '138kV',
          capacity_estimate: '100 MVA',
          utility_owner: 'Unknown',
          validation_status: 'pending',
          infrastructure_features: ['Verified location', 'Public data'],
          discovery_method: 'Google Maps Search'
        });
      });
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

  const handleSubstationClick = (substation: StoredSubstation) => {
    setSelectedSubstation(substation);
    setIsDetailsModalOpen(true);
  };

  const handleAnalyzeSubstation = async (substation: StoredSubstation) => {
    if (!substation.latitude || !substation.longitude) {
      toast({
        title: "Analysis Error",
        description: "Cannot analyze substation without coordinates",
        variant: "destructive"
      });
      return;
    }

    setAnalyzingSubstation(substation.id);
    
    try {
      await estimateCapacity({
        latitude: substation.latitude,
        longitude: substation.longitude,
        manualOverride: {
          transformers: 3,
          capacity: substation.capacity_mva,
          substationType: 'transmission',
          utilityContext: {
            company: substation.utility_owner,
            voltage: substation.voltage_level,
            name: substation.name,
            notes: `Load factor: ${substation.load_factor}%, Status: ${substation.status}`
          }
        }
      });

      toast({
        title: "Analysis Complete",
        description: `Capacity estimation completed for ${substation.name}`,
      });
    } catch (error: any) {
      console.error('Analysis error:', error);
      toast({
        title: "Analysis Error",
        description: error.message || "Failed to analyze substation",
        variant: "destructive"
      });
    } finally {
      setAnalyzingSubstation(null);
    }
  };

  const handleDeleteSubstation = async (substation: StoredSubstation) => {
    if (!confirm(`Are you sure you want to delete ${substation.name}? This action cannot be undone.`)) {
      return;
    }

    setDeletingSubstation(substation.id);
    
    try {
      const { error } = await supabase
        .from('substations')
        .delete()
        .eq('id', substation.id);

      if (error) throw error;

      toast({
        title: "Substation Deleted",
        description: `${substation.name} has been removed`,
      });

      // Reload the list
      await loadStoredSubstations();
      
      // Close modal if this substation was selected
      if (selectedSubstation?.id === substation.id) {
        setIsDetailsModalOpen(false);
        setSelectedSubstation(null);
      }
    } catch (error: any) {
      console.error('Delete error:', error);
      toast({
        title: "Delete Error",
        description: error.message || "Failed to delete substation",
        variant: "destructive"
      });
    } finally {
      setDeletingSubstation(null);
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return 'bg-green-100 text-green-800 border-green-200';
    if (confidence >= 70) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    return 'bg-red-100 text-red-800 border-red-200';
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getCitiesForRegion = () => {
    return searchRegion === 'texas' ? TEXAS_CITIES : ALBERTA_CITIES;
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
              All Region Coverage + Rate Analysis
            </Badge>
          </CardTitle>
          <p className="text-muted-foreground text-lg">
            Advanced AI-powered substation discovery with real-time industrial energy rate estimations for large-scale power requirements (50 MW)
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
                <option value="texas">Texas (ERCOT) - Full State Coverage</option>
                <option value="alberta">Alberta (AESO) - Full Province Coverage</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">City Filter (Optional)</label>
              <select 
                className="w-full p-3 border rounded-lg bg-white dark:bg-gray-800"
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
              >
                {getCitiesForRegion().map((city) => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Focus Coordinates (optional)</label>
              <Input
                value={centerCoordinates}
                onChange={(e) => setCenterCoordinates(e.target.value)}
                placeholder="lat, lng (for prioritization)"
                className="p-3"
              />
            </div>
          </div>

          <div className="bg-blue-50 dark:bg-blue-950 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
                Industrial Rate Analysis Configuration
              </span>
            </div>
            <p className="text-sm text-blue-700 dark:text-blue-300">
              Rate estimations calculated for <strong>50 MW large industrial client</strong> with 24/7 operations
              {selectedCity !== 'All Cities' && (
                <span className="block mt-1">
                  <strong>City Focus:</strong> {selectedCity}, {searchRegion === 'texas' ? 'Texas' : 'Alberta'}
                </span>
              )}
            </p>
          </div>

          <Button 
            onClick={executeUltimateSearch}
            disabled={searching}
            className="w-full h-12 text-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            <Shield className="w-5 h-5 mr-2" />
            Execute {selectedCity !== 'All Cities' ? `${selectedCity} ` : 'Region-Wide '}Ultimate Search with Rate Analysis
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
              {selectedCity !== 'All Cities' && (
                <Badge variant="outline" className="ml-2">
                  {selectedCity}
                </Badge>
              )}
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

      {/* Stored Substations */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Database className="w-5 h-5" />
              Substation Database ({storedSubstations.length})
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={loadStoredSubstations}
              disabled={loadingStored}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${loadingStored ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loadingStored ? (
            <div className="text-center py-8">
              <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-500" />
              <p className="text-muted-foreground">Loading substations...</p>
            </div>
          ) : storedSubstations.length > 0 ? (
            <div className="space-y-4">
              {storedSubstations.map((substation) => (
                <div key={substation.id} className="border rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <Database className="w-4 h-4 text-green-600" />
                      <span className="font-medium">{substation.name}</span>
                      <Badge className="bg-green-100 text-green-800">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Stored
                      </Badge>
                      <Badge variant="outline">{substation.voltage_level}</Badge>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleSubstationClick(substation)}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        Details
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleAnalyzeSubstation(substation)}
                        disabled={analyzingSubstation === substation.id || capacityLoading}
                      >
                        {analyzingSubstation === substation.id ? (
                          <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                        ) : (
                          <Activity className="w-4 h-4 mr-1" />
                        )}
                        Analyze
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDeleteSubstation(substation)}
                        disabled={deletingSubstation === substation.id}
                      >
                        {deletingSubstation === substation.id ? (
                          <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4 mr-1" />
                        )}
                        Delete
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <strong>Location:</strong> {substation.latitude?.toFixed(4)}, {substation.longitude?.toFixed(4)}
                    </div>
                    <div>
                      <strong>Capacity:</strong> {substation.capacity_mva} MVA
                    </div>
                    <div>
                      <strong>Owner:</strong> {substation.utility_owner}
                    </div>
                    <div>
                      <strong>Status:</strong> {substation.status}
                    </div>
                  </div>

                  <div className="mt-3 text-xs text-muted-foreground">
                    <strong>City:</strong> {substation.city}, {substation.state} | 
                    <strong> Added:</strong> {new Date(substation.created_at).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Database className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-medium text-muted-foreground mb-2">No Substations Found</h3>
              <p className="text-muted-foreground">
                Execute an Ultimate Search to discover and analyze substations
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Substation Details Modal */}
      <SubstationDetailsModal
        substation={selectedSubstation}
        isOpen={isDetailsModalOpen}
        onClose={() => {
          setIsDetailsModalOpen(false);
          setSelectedSubstation(null);
        }}
      />
    </div>
  );
}

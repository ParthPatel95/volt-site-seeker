
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Search, 
  MapPin, 
  Zap, 
  Activity,
  TrendingUp,
  Building2,
  AlertTriangle,
  CheckCircle,
  DollarSign,
  BarChart3
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Substation {
  id: string;
  name: string;
  city: string;
  state: string;
  voltage_level: string;
  capacity_mva: number;
  utility_owner: string;
  interconnection_type: string;
  load_factor: number;
  upgrade_potential?: number;
}

interface CityAnalysis {
  id: string;
  city: string;
  state: string;
  total_substation_capacity_mva: number;
  available_capacity_mva: number;
  average_load_factor: number;
  peak_demand_estimate_mw: number;
  energy_rate_estimate_per_mwh: number;
  utility_companies: any;
  grid_reliability_score: number;
  market_conditions: any;
  expansion_opportunities: any;
  analysis_date: string;
}

export function CityPowerAnalysis() {
  const [searchCity, setSearchCity] = useState('');
  const [searchState, setSearchState] = useState('TX');
  const [substations, setSubstations] = useState<Substation[]>([]);
  const [cityAnalysis, setCityAnalysis] = useState<CityAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const { toast } = useToast();

  const searchSubstations = async () => {
    if (!searchCity.trim()) {
      toast({
        title: "City Required",
        description: "Please enter a city name to search",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      console.log('Searching for substations in:', searchCity, searchState);
      
      const { data: substationData, error: substationError } = await supabase
        .from('substations')
        .select('*')
        .ilike('city', `%${searchCity.trim()}%`)
        .eq('state', searchState.toUpperCase())
        .order('capacity_mva', { ascending: false });

      if (substationError) {
        console.error('Error loading substations:', substationError);
        toast({
          title: "Error Loading Substations",
          description: substationError.message,
          variant: "destructive"
        });
        return;
      }

      setSubstations(substationData || []);

      // Check if we have existing analysis for this city
      const { data: analysisData, error: analysisError } = await supabase
        .from('city_power_analysis')
        .select('*')
        .ilike('city', `%${searchCity.trim()}%`)
        .eq('state', searchState.toUpperCase())
        .order('analysis_date', { ascending: false })
        .limit(1);

      if (analysisError) {
        console.error('Error loading city analysis:', analysisError);
      } else if (analysisData && analysisData.length > 0) {
        setCityAnalysis(analysisData[0]);
      } else {
        setCityAnalysis(null);
      }

      console.log('Found substations:', substationData?.length || 0);
      
      if (!substationData || substationData.length === 0) {
        toast({
          title: "No Substations Found",
          description: `No substations found for ${searchCity}, ${searchState}. Try a different city or state.`,
          variant: "default"
        });
      }

    } catch (error) {
      console.error('Error searching substations:', error);
      toast({
        title: "Search Error",
        description: "Failed to search for substations",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const generateAIAnalysis = async () => {
    if (!substations.length) {
      toast({
        title: "No Data Available",
        description: "Please search for substations first",
        variant: "destructive"
      });
      return;
    }

    setAnalyzing(true);
    try {
      console.log('Generating AI analysis for:', searchCity, searchState);
      
      // Calculate basic metrics from substation data
      const totalCapacity = substations.reduce((sum, sub) => sum + sub.capacity_mva, 0);
      const avgLoadFactor = substations.reduce((sum, sub) => sum + (sub.load_factor || 0), 0) / substations.length;
      const availableCapacity = totalCapacity * (1 - avgLoadFactor / 100);
      const peakDemandEstimate = totalCapacity * 0.8; // Estimate 80% of capacity as peak demand
      
      // Estimate energy rates based on market conditions and capacity
      const baseRate = 35; // Base rate per MWh
      const capacityFactor = Math.min(1.2, totalCapacity / 1000); // Higher capacity = slightly higher rates
      const demandFactor = Math.min(1.3, avgLoadFactor / 70); // Higher demand = higher rates
      const energyRateEstimate = baseRate * capacityFactor * demandFactor;

      // Create utility companies list
      const utilities = [...new Set(substations.map(sub => sub.utility_owner))];
      
      // Generate market conditions analysis
      const marketConditions = {
        demand_level: avgLoadFactor > 75 ? 'High' : avgLoadFactor > 50 ? 'Moderate' : 'Low',
        price_volatility: 'Moderate',
        renewable_integration: 'Increasing',
        grid_congestion: avgLoadFactor > 80 ? 'High' : 'Low'
      };

      // Generate expansion opportunities
      const expansionOpportunities = {
        substation_upgrades: substations.filter(sub => (sub.load_factor || 0) > 80).length,
        new_transmission_potential: totalCapacity < 2000 ? 'High' : 'Moderate',
        renewable_connection_capacity: availableCapacity * 0.6,
        data_center_readiness: totalCapacity > 1000 ? 'Excellent' : 'Good'
      };

      const analysisData = {
        city: searchCity,
        state: searchState.toUpperCase(),
        total_substation_capacity_mva: totalCapacity,
        available_capacity_mva: availableCapacity,
        average_load_factor: avgLoadFactor,
        peak_demand_estimate_mw: peakDemandEstimate,
        energy_rate_estimate_per_mwh: energyRateEstimate,
        utility_companies: utilities,
        market_conditions: marketConditions,
        grid_reliability_score: Math.round(95 - (avgLoadFactor - 50) * 0.5), // Simple reliability score
        expansion_opportunities: expansionOpportunities,
        regulatory_environment: {
          interconnection_queue: 'Active',
          renewable_incentives: 'Available',
          permitting_timeline: '6-12 months'
        }
      };

      // Save analysis to database
      const { data: savedAnalysis, error: saveError } = await supabase
        .from('city_power_analysis')
        .insert(analysisData)
        .select()
        .single();

      if (saveError) {
        console.error('Error saving analysis:', saveError);
        // Still show the analysis even if save fails
        setCityAnalysis(analysisData as any);
      } else {
        setCityAnalysis(savedAnalysis);
      }

      toast({
        title: "Analysis Complete",
        description: `Generated comprehensive power analysis for ${searchCity}, ${searchState}`,
      });

    } catch (error) {
      console.error('Error generating analysis:', error);
      toast({
        title: "Analysis Error",
        description: "Failed to generate city power analysis",
        variant: "destructive"
      });
    } finally {
      setAnalyzing(false);
    }
  };

  const getLoadFactorColor = (loadFactor: number) => {
    if (loadFactor >= 80) return 'destructive';
    if (loadFactor >= 60) return 'secondary';
    return 'default';
  };

  const getReliabilityColor = (score: number) => {
    if (score >= 90) return 'default';
    if (score >= 75) return 'secondary';
    return 'destructive';
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            City Power Infrastructure Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-4">
            <div className="flex-1">
              <Input
                placeholder="Enter city name (e.g., Houston, Dallas, Austin)"
                value={searchCity}
                onChange={(e) => setSearchCity(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && searchSubstations()}
              />
            </div>
            <div className="w-20">
              <Input
                placeholder="State"
                value={searchState}
                onChange={(e) => setSearchState(e.target.value)}
                maxLength={2}
              />
            </div>
            <Button onClick={searchSubstations} disabled={loading}>
              <Search className="w-4 h-4 mr-2" />
              {loading ? 'Searching...' : 'Search'}
            </Button>
            {substations.length > 0 && (
              <Button onClick={generateAIAnalysis} disabled={analyzing} variant="outline">
                <Activity className="w-4 h-4 mr-2" />
                {analyzing ? 'Analyzing...' : 'AI Analysis'}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {substations.length > 0 && (
        <Tabs defaultValue="substations" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="substations">Substations ({substations.length})</TabsTrigger>
            <TabsTrigger value="analysis">City Analysis</TabsTrigger>
            <TabsTrigger value="opportunities">Opportunities</TabsTrigger>
          </TabsList>

          <TabsContent value="substations" className="space-y-4">
            <div className="grid gap-4">
              {substations.map((substation) => (
                <Card key={substation.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">{substation.name}</h4>
                          <Badge variant="outline">{substation.voltage_level}</Badge>
                          <Badge variant={substation.interconnection_type === 'transmission' ? 'default' : 'secondary'}>
                            {substation.interconnection_type}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                          <div>Utility: {substation.utility_owner}</div>
                          <div>Capacity: {substation.capacity_mva} MVA</div>
                          <div className="flex items-center gap-1">
                            Load Factor: 
                            <Badge variant={getLoadFactorColor(substation.load_factor || 0)} className="ml-1">
                              {substation.load_factor?.toFixed(1) || 'N/A'}%
                            </Badge>
                          </div>
                          <div>Available: {((substation.capacity_mva * (1 - (substation.load_factor || 0) / 100))).toFixed(0)} MVA</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-green-600">
                          {substation.capacity_mva} MVA
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {substation.city}, {substation.state}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="analysis" className="space-y-6">
            {cityAnalysis ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2">
                      <Zap className="w-5 h-5 text-yellow-500" />
                      <div>
                        <p className="text-sm font-medium">Total Capacity</p>
                        <p className="text-2xl font-bold">{cityAnalysis.total_substation_capacity_mva.toFixed(0)} MVA</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2">
                      <Activity className="w-5 h-5 text-green-500" />
                      <div>
                        <p className="text-sm font-medium">Available Capacity</p>
                        <p className="text-2xl font-bold">{cityAnalysis.available_capacity_mva.toFixed(0)} MVA</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2">
                      <DollarSign className="w-5 h-5 text-blue-500" />
                      <div>
                        <p className="text-sm font-medium">Estimated Rate</p>
                        <p className="text-2xl font-bold">${cityAnalysis.energy_rate_estimate_per_mwh.toFixed(0)}/MWh</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-5 h-5 text-purple-500" />
                      <div>
                        <p className="text-sm font-medium">Grid Reliability</p>
                        <div className="flex items-center gap-2">
                          <p className="text-2xl font-bold">{cityAnalysis.grid_reliability_score}</p>
                          <Badge variant={getReliabilityColor(cityAnalysis.grid_reliability_score)}>
                            {cityAnalysis.grid_reliability_score >= 90 ? 'Excellent' : 
                             cityAnalysis.grid_reliability_score >= 75 ? 'Good' : 'Fair'}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="md:col-span-2">
                  <CardHeader>
                    <CardTitle className="text-lg">Market Conditions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium">Demand Level</p>
                        <Badge variant="outline">{cityAnalysis.market_conditions?.demand_level}</Badge>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Grid Congestion</p>
                        <Badge variant="outline">{cityAnalysis.market_conditions?.grid_congestion}</Badge>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Price Volatility</p>
                        <Badge variant="outline">{cityAnalysis.market_conditions?.price_volatility}</Badge>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Renewable Integration</p>
                        <Badge variant="outline">{cityAnalysis.market_conditions?.renewable_integration}</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="md:col-span-2">
                  <CardHeader>
                    <CardTitle className="text-lg">Utility Companies</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {cityAnalysis.utility_companies?.map((utility: string, index: number) => (
                        <div key={index} className="flex items-center gap-2">
                          <Building2 className="w-4 h-4" />
                          <span>{utility}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <BarChart3 className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-medium text-muted-foreground mb-2">No Analysis Available</h3>
                  <p className="text-muted-foreground mb-4">Click "AI Analysis" to generate comprehensive city power analysis</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="opportunities" className="space-y-6">
            {cityAnalysis?.expansion_opportunities ? (
              <div className="grid gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="w-5 h-5" />
                      Expansion Opportunities
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 border rounded-lg">
                        <h4 className="font-medium mb-2">Substation Upgrades</h4>
                        <p className="text-2xl font-bold text-orange-600">{cityAnalysis.expansion_opportunities.substation_upgrades}</p>
                        <p className="text-sm text-muted-foreground">Substations at >80% capacity</p>
                      </div>
                      <div className="p-4 border rounded-lg">
                        <h4 className="font-medium mb-2">Renewable Capacity</h4>
                        <p className="text-2xl font-bold text-green-600">
                          {cityAnalysis.expansion_opportunities.renewable_connection_capacity?.toFixed(0)} MVA
                        </p>
                        <p className="text-sm text-muted-foreground">Available for renewable connections</p>
                      </div>
                      <div className="p-4 border rounded-lg">
                        <h4 className="font-medium mb-2">Data Center Readiness</h4>
                        <Badge variant="default" className="text-lg px-3 py-1">
                          {cityAnalysis.expansion_opportunities.data_center_readiness}
                        </Badge>
                        <p className="text-sm text-muted-foreground mt-1">Infrastructure suitability</p>
                      </div>
                      <div className="p-4 border rounded-lg">
                        <h4 className="font-medium mb-2">Transmission Potential</h4>
                        <Badge variant="secondary" className="text-lg px-3 py-1">
                          {cityAnalysis.expansion_opportunities.new_transmission_potential}
                        </Badge>
                        <p className="text-sm text-muted-foreground mt-1">New transmission lines</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <AlertTriangle className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-medium text-muted-foreground mb-2">No Opportunities Analysis</h3>
                  <p className="text-muted-foreground">Generate AI analysis to see expansion opportunities</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}

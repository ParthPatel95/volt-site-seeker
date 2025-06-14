
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  Search, 
  MapPin, 
  Building, 
  Zap, 
  Target,
  Satellite,
  Factory,
  TrendingUp,
  AlertCircle
} from 'lucide-react';

interface IndustrialSite {
  id: string;
  company_name: string;
  facility_type: string;
  address: string;
  city: string;
  state: string;
  estimated_power_mw: number;
  building_area_sqft: number;
  nearest_substation_distance: number;
  industrial_classification: string;
  confidence_score: number;
  satellite_analysis_date: string;
}

export function StarlightIndustrialFinder() {
  const [searchCity, setSearchCity] = useState('');
  const [searchState, setSearchState] = useState('');
  const [industryFilter, setIndustryFilter] = useState('all');
  const [minPowerMW, setMinPowerMW] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<IndustrialSite[]>([]);
  const { toast } = useToast();

  const searchIndustrialSites = async () => {
    if (!searchCity || !searchState) {
      toast({
        title: "Search Parameters Required",
        description: "Please enter both city and state to search for industrial sites.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    console.log('Searching for industrial sites:', { searchCity, searchState, industryFilter, minPowerMW });

    try {
      // Simulate Starlight API integration
      // In production, this would call the actual Starlight API
      const mockResults: IndustrialSite[] = [
        {
          id: '1',
          company_name: 'Tesla Gigafactory',
          facility_type: 'Manufacturing',
          address: '1 Electric Ave',
          city: searchCity,
          state: searchState,
          estimated_power_mw: 50,
          building_area_sqft: 5400000,
          nearest_substation_distance: 2.1,
          industrial_classification: 'Electric Vehicle Manufacturing',
          confidence_score: 95,
          satellite_analysis_date: '2024-06-01'
        },
        {
          id: '2',
          company_name: 'Data Center Complex',
          facility_type: 'Data Center',
          address: '500 Server St',
          city: searchCity,
          state: searchState,
          estimated_power_mw: 75,
          building_area_sqft: 2200000,
          nearest_substation_distance: 0.8,
          industrial_classification: 'Cloud Computing',
          confidence_score: 88,
          satellite_analysis_date: '2024-06-01'
        },
        {
          id: '3',
          company_name: 'Steel Processing Plant',
          facility_type: 'Heavy Manufacturing',
          address: '1200 Industrial Blvd',
          city: searchCity,
          state: searchState,
          estimated_power_mw: 120,
          building_area_sqft: 3800000,
          nearest_substation_distance: 1.5,
          industrial_classification: 'Steel Production',
          confidence_score: 92,
          satellite_analysis_date: '2024-06-01'
        },
        {
          id: '4',
          company_name: 'Semiconductor Fab',
          facility_type: 'High-Tech Manufacturing',
          address: '300 Silicon Way',
          city: searchCity,
          state: searchState,
          estimated_power_mw: 200,
          building_area_sqft: 1800000,
          nearest_substation_distance: 1.2,
          industrial_classification: 'Semiconductor Manufacturing',
          confidence_score: 97,
          satellite_analysis_date: '2024-06-01'
        }
      ];

      // Apply filters
      let filteredResults = mockResults;
      
      if (industryFilter !== 'all') {
        filteredResults = filteredResults.filter(site => 
          site.industrial_classification.toLowerCase().includes(industryFilter.toLowerCase())
        );
      }

      if (minPowerMW) {
        const minPower = parseFloat(minPowerMW);
        filteredResults = filteredResults.filter(site => site.estimated_power_mw >= minPower);
      }

      setResults(filteredResults);
      
      toast({
        title: "Search Complete",
        description: `Found ${filteredResults.length} industrial sites in ${searchCity}, ${searchState}`,
      });

    } catch (error) {
      console.error('Error searching industrial sites:', error);
      toast({
        title: "Search Error",
        description: "Failed to search for industrial sites. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getConfidenceColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 75) return 'text-yellow-600';
    return 'text-red-600';
  };

  const industryTypes = [
    'Manufacturing',
    'Data Center',
    'Steel',
    'Semiconductor',
    'Chemical',
    'Automotive',
    'Aerospace'
  ];

  return (
    <div className="space-y-6">
      {/* Search Interface */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Satellite className="w-5 h-5 mr-2 text-blue-600" />
            Starlight Industrial Site Finder
          </CardTitle>
          <CardDescription>
            Discover large industrial facilities using satellite imagery analysis
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <Input
              placeholder="City"
              value={searchCity}
              onChange={(e) => setSearchCity(e.target.value)}
            />

            <Input
              placeholder="State"
              value={searchState}
              onChange={(e) => setSearchState(e.target.value)}
            />

            <Select value={industryFilter} onValueChange={setIndustryFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Industry Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Industries</SelectItem>
                {industryTypes.map(type => (
                  <SelectItem key={type} value={type.toLowerCase()}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Input
              placeholder="Min Power (MW)"
              type="number"
              value={minPowerMW}
              onChange={(e) => setMinPowerMW(e.target.value)}
            />

            <Button onClick={searchIndustrialSites} disabled={loading}>
              {loading ? (
                <Search className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Search className="w-4 h-4 mr-2" />
              )}
              Search
            </Button>
          </div>

          <div className="text-sm text-muted-foreground">
            <AlertCircle className="w-4 h-4 inline mr-1" />
            Starlight uses satellite imagery and AI to identify industrial facilities with high power consumption
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {results.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Industrial Sites Found ({results.length})</CardTitle>
            <CardDescription>
              High-power industrial facilities identified through satellite analysis
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {results.map((site) => (
                <div key={site.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-lg">{site.company_name}</h3>
                      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                        <MapPin className="w-4 h-4" />
                        <span>{site.address}, {site.city}, {site.state}</span>
                        <Badge variant="outline">{site.facility_type}</Badge>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-sm font-medium ${getConfidenceColor(site.confidence_score)}`}>
                        {site.confidence_score}% confidence
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Analyzed: {new Date(site.satellite_analysis_date).toLocaleDateString()}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <div className="text-sm text-muted-foreground">Estimated Power</div>
                      <div className="font-medium text-lg">{site.estimated_power_mw} MW</div>
                      <div className="text-xs text-muted-foreground">High consumption facility</div>
                    </div>

                    <div>
                      <div className="text-sm text-muted-foreground">Facility Size</div>
                      <div className="font-medium">{(site.building_area_sqft / 1000000).toFixed(1)}M sq ft</div>
                      <div className="text-xs text-muted-foreground">Building footprint</div>
                    </div>

                    <div>
                      <div className="text-sm text-muted-foreground">Substation Distance</div>
                      <div className="font-medium">{site.nearest_substation_distance} miles</div>
                      <div className="text-xs text-muted-foreground">
                        {site.nearest_substation_distance < 2 ? (
                          <span className="text-green-600">Excellent access</span>
                        ) : site.nearest_substation_distance < 5 ? (
                          <span className="text-yellow-600">Good access</span>
                        ) : (
                          <span className="text-red-600">Limited access</span>
                        )}
                      </div>
                    </div>

                    <div>
                      <div className="text-sm text-muted-foreground">Industry</div>
                      <div className="font-medium">{site.industrial_classification}</div>
                      <div className="text-xs text-muted-foreground">Primary activity</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t">
                    <div className="flex items-center space-x-2">
                      <Factory className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        Satellite-verified industrial facility
                      </span>
                    </div>
                    <Button variant="outline" size="sm">
                      <Target className="w-4 h-4 mr-1" />
                      View Details
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search Tips */}
      <Card>
        <CardHeader>
          <CardTitle>Search Tips</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="text-sm">
            <strong>Best Results:</strong> Search major industrial cities like Houston, Detroit, Chicago
          </div>
          <div className="text-sm">
            <strong>Power Range:</strong> Most heavy industrial sites consume 20-500 MW
          </div>
          <div className="text-sm">
            <strong>Proximity:</strong> Sites within 2 miles of substations have optimal grid access
          </div>
          <div className="text-sm">
            <strong>Industries:</strong> Data centers, manufacturing, steel, chemicals typically have highest consumption
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

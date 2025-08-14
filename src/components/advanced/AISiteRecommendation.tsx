import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { MapPin, Star, Zap, TrendingUp, Filter, RefreshCw } from 'lucide-react';

interface SiteRecommendation {
  id: string;
  location: string;
  coordinates: { lat: number; lng: number };
  suitability_score: number;
  energy_cost_kwh: number;
  distance_to_substation_km: number;
  grid_capacity_mw: number;
  recommended_use: string;
  advantages: string[];
  considerations: string[];
  investment_potential: number;
}

interface AIRecommendationProps {
  searchCriteria?: {
    powerRequirement?: number;
    maxEnergyRate?: number;
    preferredRegions?: string[];
    projectType?: string;
  };
}

export const AISiteRecommendation: React.FC<AIRecommendationProps> = ({ searchCriteria }) => {
  const [recommendations, setRecommendations] = useState<SiteRecommendation[]>([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    minScore: 7.0,
    maxEnergyRate: 0.08,
    minGridCapacity: 50,
    projectType: 'all'
  });
  const { toast } = useToast();

  const generateRecommendations = async () => {
    setLoading(true);
    try {
      // Simulate AI-powered site recommendation logic
      const mockRecommendations: SiteRecommendation[] = [
        {
          id: '1',
          location: 'West Texas Energy Corridor',
          coordinates: { lat: 31.7619, lng: -106.4850 },
          suitability_score: 9.2,
          energy_cost_kwh: 0.045,
          distance_to_substation_km: 1.2,
          grid_capacity_mw: 500,
          recommended_use: 'Large-scale Bitcoin Mining',
          advantages: [
            'Extremely low energy costs (bottom 5% in US)',
            'High grid stability and capacity',
            'Favorable regulatory environment',
            'Excellent fiber connectivity infrastructure',
            'Proximity to renewable energy sources'
          ],
          considerations: [
            'High summer temperatures require enhanced cooling',
            'Potential for extreme weather events',
            'Limited local technical workforce'
          ],
          investment_potential: 8.8
        },
        {
          id: '2',
          location: 'Alberta Industrial District',
          coordinates: { lat: 53.5461, lng: -113.4938 },
          suitability_score: 8.7,
          energy_cost_kwh: 0.038,
          distance_to_substation_km: 0.8,
          grid_capacity_mw: 350,
          recommended_use: 'Data Center Complex',
          advantages: [
            'World-class energy rates',
            'Natural cooling climate reduces HVAC costs',
            'Stable political and regulatory environment',
            'Strong renewable energy integration',
            'Skilled technical workforce available'
          ],
          considerations: [
            'Currency exchange considerations',
            'Winter weather preparation required',
            'Cross-border operational complexities'
          ],
          investment_potential: 8.4
        },
        {
          id: '3',
          location: 'East Texas Manufacturing Zone',
          coordinates: { lat: 32.3513, lng: -94.7302 },
          suitability_score: 8.1,
          energy_cost_kwh: 0.052,
          distance_to_substation_km: 2.1,
          grid_capacity_mw: 275,
          recommended_use: 'Solar Panel Manufacturing',
          advantages: [
            'Competitive energy pricing',
            'Established manufacturing infrastructure',
            'Good transportation access',
            'Available industrial workforce',
            'Tax incentives for green manufacturing'
          ],
          considerations: [
            'Moderate energy costs vs other regions',
            'Seasonal demand fluctuations',
            'Infrastructure upgrades may be needed'
          ],
          investment_potential: 7.6
        }
      ];

      setRecommendations(mockRecommendations);
      
      toast({
        title: "Recommendations Generated",
        description: `Found ${mockRecommendations.length} optimal sites based on AI analysis`,
      });
    } catch (error) {
      console.error('Error generating recommendations:', error);
      toast({
        title: "Error",
        description: "Failed to generate site recommendations",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    generateRecommendations();
  }, [searchCriteria]);

  const getScoreColor = (score: number) => {
    if (score >= 9) return 'text-green-600';
    if (score >= 8) return 'text-blue-600';
    if (score >= 7) return 'text-yellow-600';
    return 'text-gray-600';
  };

  const getScoreBadge = (score: number) => {
    if (score >= 9) return 'bg-green-100 text-green-800';
    if (score >= 8) return 'bg-blue-100 text-blue-800';
    if (score >= 7) return 'bg-yellow-100 text-yellow-800';
    return 'bg-gray-100 text-gray-800';
  };

  const getAvgScore = () => {
    if (recommendations.length === 0) return 0;
    return (recommendations.reduce((sum, r) => sum + r.suitability_score, 0) / recommendations.length).toFixed(1);
  };

  const getAvgEnergyCost = () => {
    if (recommendations.length === 0) return 0;
    return (recommendations.reduce((sum, r) => sum + r.energy_cost_kwh, 0) / recommendations.length).toFixed(3);
  };

  const getAvgGridCapacity = () => {
    if (recommendations.length === 0) return 0;
    return Math.round(recommendations.reduce((sum, r) => sum + r.grid_capacity_mw, 0) / recommendations.length);
  };

  const getBestSite = () => {
    if (recommendations.length === 0) return 'No data';
    return recommendations.reduce((max, r) => r.suitability_score > max.suitability_score ? r : max, recommendations[0]).location;
  };

  const getLowestCost = () => {
    if (recommendations.length === 0) return 'No data';
    const lowest = recommendations.reduce((min, r) => r.energy_cost_kwh < min.energy_cost_kwh ? r : min, recommendations[0]);
    return `$${lowest.energy_cost_kwh.toFixed(3)}/kWh`;
  };

  const getHighestCapacity = () => {
    if (recommendations.length === 0) return 'No data';
    const highest = recommendations.reduce((max, r) => r.grid_capacity_mw > max.grid_capacity_mw ? r : max, recommendations[0]);
    return `${highest.grid_capacity_mw} MW`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">AI Site Recommendation Engine</h2>
          <p className="text-muted-foreground">Intelligent location analysis for optimal power infrastructure placement</p>
        </div>
        <Button onClick={generateRecommendations} disabled={loading} className="flex items-center gap-2">
          <RefreshCw className="w-4 h-4" />
          Refresh Recommendations
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : (
        <Tabs defaultValue="recommendations" className="space-y-6">
          <TabsList>
            <TabsTrigger value="recommendations">Top Recommendations</TabsTrigger>
            <TabsTrigger value="filters">Search Filters</TabsTrigger>
            <TabsTrigger value="analytics">Site Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="recommendations" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {recommendations.map((site) => (
                <Card key={site.id} className="relative">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <MapPin className="w-5 h-5" />
                        {site.location}
                      </CardTitle>
                      <div className="flex items-center gap-2">
                        <Badge className={getScoreBadge(site.suitability_score)}>
                          <Star className="w-3 h-3 mr-1" />
                          {site.suitability_score}/10
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* Key Metrics */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="text-sm text-muted-foreground">Energy Cost</div>
                          <div className="font-semibold text-green-600">
                            ${site.energy_cost_kwh.toFixed(3)}/kWh
                          </div>
                        </div>
                        <div>
                          <div className="text-sm text-muted-foreground">Grid Capacity</div>
                          <div className="font-semibold">{site.grid_capacity_mw} MW</div>
                        </div>
                        <div>
                          <div className="text-sm text-muted-foreground">Substation Distance</div>
                          <div className="font-semibold">{site.distance_to_substation_km} km</div>
                        </div>
                        <div>
                          <div className="text-sm text-muted-foreground">Investment Score</div>
                          <div className={`font-semibold ${getScoreColor(site.investment_potential)}`}>
                            {site.investment_potential}/10
                          </div>
                        </div>
                      </div>

                      {/* Recommended Use */}
                      <div>
                        <div className="text-sm text-muted-foreground mb-1">Recommended Use</div>
                        <Badge variant="outline" className="font-medium">
                          {site.recommended_use}
                        </Badge>
                      </div>

                      {/* Advantages */}
                      <div>
                        <div className="text-sm font-medium mb-2 text-green-700">Key Advantages</div>
                        <div className="space-y-1">
                          {site.advantages.slice(0, 3).map((advantage, index) => (
                            <div key={index} className="flex items-start gap-2 text-sm">
                              <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                              <span>{advantage}</span>
                            </div>
                          ))}
                          {site.advantages.length > 3 && (
                            <div className="text-sm text-muted-foreground">
                              +{site.advantages.length - 3} more advantages
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Considerations */}
                      <div>
                        <div className="text-sm font-medium mb-2 text-orange-700">Key Considerations</div>
                        <div className="space-y-1">
                          {site.considerations.map((consideration, index) => (
                            <div key={index} className="flex items-start gap-2 text-sm">
                              <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                              <span>{consideration}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2 pt-4">
                        <Button size="sm" className="flex-1">
                          View Details
                        </Button>
                        <Button size="sm" variant="outline">
                          Save Site
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="filters">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="w-5 h-5" />
                  Search Filters & Criteria
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Minimum Suitability Score</label>
                    <div className="text-lg font-semibold text-primary">{filters.minScore}/10</div>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Max Energy Rate</label>
                    <div className="text-lg font-semibold text-green-600">${filters.maxEnergyRate}/kWh</div>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Min Grid Capacity</label>
                    <div className="text-lg font-semibold">{filters.minGridCapacity} MW</div>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Project Type</label>
                    <div className="text-lg font-semibold capitalize">{filters.projectType}</div>
                  </div>
                </div>

                <div className="mt-6">
                  <Button onClick={generateRecommendations} className="flex items-center gap-2">
                    <Zap className="w-4 h-4" />
                    Apply Filters & Regenerate
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Average Metrics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm">Avg Suitability Score</span>
                      <span className="font-semibold">{getAvgScore()}/10</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Avg Energy Cost</span>
                      <span className="font-semibold text-green-600">${getAvgEnergyCost()}/kWh</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Avg Grid Capacity</span>
                      <span className="font-semibold">{getAvgGridCapacity()} MW</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Best Opportunities</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <div className="text-sm text-muted-foreground">Highest Rated Site</div>
                      <div className="font-semibold">{getBestSite()}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Lowest Energy Cost</div>
                      <div className="font-semibold text-green-600">{getLowestCost()}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Highest Capacity</div>
                      <div className="font-semibold">{getHighestCapacity()}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Search Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm">Total Sites Found</span>
                      <span className="font-semibold">{recommendations.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">High Score Sites (8+)</span>
                      <span className="font-semibold text-green-600">
                        {recommendations.filter(r => r.suitability_score >= 8).length}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Low Cost Sites (&lt;$0.05)</span>
                      <span className="font-semibold text-blue-600">
                        {recommendations.filter(r => r.energy_cost_kwh < 0.05).length}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};
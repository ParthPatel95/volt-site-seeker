import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { PieChart, Briefcase, MapPin } from 'lucide-react';
import { PieChart as Chart, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface PortfolioRecommendation {
  id: string;
  user_id: string;
  recommendation_type: string;
  target_companies: string[];
  diversification_score: number;
  risk_adjusted_return: number;
  geographic_allocation: Record<string, number>;
  sector_allocation: Record<string, number>;
  timing_recommendations: Record<string, string | number>;
  investment_thesis: string;
  created_at: string;
}

export function PortfolioOptimizerPanel() {
  const [recommendations, setRecommendations] = useState<PortfolioRecommendation[]>([]);
  const [loading, setLoading] = useState(false);
  const [optimizing, setOptimizing] = useState(false);
  const [portfolioSize, setPortfolioSize] = useState('10');
  const [riskTolerance, setRiskTolerance] = useState('moderate');
  const { toast } = useToast();

  useEffect(() => {
    loadRecommendations();
  }, []);

  const loadRecommendations = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('portfolio_recommendations')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Transform the data to match our interface
      const transformedData = (data || []).map(item => ({
        ...item,
        geographic_allocation: (item.geographic_allocation as Record<string, number>) || {},
        sector_allocation: (item.sector_allocation as Record<string, number>) || {},
        timing_recommendations: (item.timing_recommendations as Record<string, string | number>) || {}
      }));
      
      setRecommendations(transformedData);
    } catch (error) {
      console.error('Error loading portfolio recommendations:', error);
      toast({
        title: "Error",
        description: "Failed to load portfolio recommendations",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const optimizePortfolio = async () => {
    setOptimizing(true);
    try {
      const { data, error } = await supabase.functions.invoke('corporate-intelligence', {
        body: { 
          action: 'optimize_portfolio',
          portfolio_size: parseInt(portfolioSize),
          risk_tolerance: riskTolerance
        },
      });

      if (error) throw error;

      if (data?.success) {
        toast({
          title: "Portfolio Optimized",
          description: `Generated optimized portfolio recommendations`,
        });
        loadRecommendations();
      }
    } catch (error: any) {
      console.error('Error optimizing portfolio:', error);
      toast({
        title: "Optimization Error",
        description: error.message || "Failed to optimize portfolio",
        variant: "destructive"
      });
    } finally {
      setOptimizing(false);
    }
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  const getDiversificationColor = (score: number) => {
    if (score >= 80) return 'default';
    if (score >= 60) return 'secondary';
    return 'destructive';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Briefcase className="w-6 h-6" />
            Portfolio Optimization
          </h2>
          <p className="text-muted-foreground">
            AI-driven portfolio construction and diversification analysis
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Generate Portfolio Recommendations</CardTitle>
          <CardDescription>
            Optimize your investment portfolio using AI-powered analysis
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Portfolio Size</label>
              <Input
                type="number"
                placeholder="Number of companies"
                value={portfolioSize}
                onChange={(e) => setPortfolioSize(e.target.value)}
                min="5"
                max="50"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Risk Tolerance</label>
              <select 
                className="w-full p-2 border rounded-md"
                value={riskTolerance}
                onChange={(e) => setRiskTolerance(e.target.value)}
              >
                <option value="conservative">Conservative</option>
                <option value="moderate">Moderate</option>
                <option value="aggressive">Aggressive</option>
              </select>
            </div>
            <div className="flex items-end">
              <Button onClick={optimizePortfolio} disabled={optimizing} className="w-full">
                {optimizing ? 'Optimizing...' : 'Optimize Portfolio'}
                <PieChart className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading portfolio recommendations...</p>
        </div>
      ) : recommendations.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Briefcase className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-medium text-muted-foreground mb-2">
              No Portfolio Recommendations
            </h3>
            <p className="text-muted-foreground">
              Generate portfolio recommendations to see optimized allocations
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {recommendations.slice(0, 5).map((recommendation) => (
            <Card key={recommendation.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg capitalize">
                      {recommendation.recommendation_type.replace('_', ' ')} Portfolio
                    </CardTitle>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant={getDiversificationColor(recommendation.diversification_score)}>
                        Diversification: {recommendation.diversification_score}/100
                      </Badge>
                      <Badge variant="outline">
                        {recommendation.target_companies.length} Companies
                      </Badge>
                      {recommendation.risk_adjusted_return && (
                        <Badge variant="secondary">
                          Expected Return: {(recommendation.risk_adjusted_return * 100).toFixed(1)}%
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium mb-3 flex items-center gap-2">
                      <PieChart className="w-4 h-4" />
                      Sector Allocation
                    </h4>
                    {recommendation.sector_allocation && (
                      <ResponsiveContainer width="100%" height={200}>
                        <Chart data={Object.entries(recommendation.sector_allocation).map(([key, value]) => ({
                          name: key,
                          value: Number(value)
                        }))}>
                          <Tooltip formatter={(value) => `${value}%`} />
                          {Object.entries(recommendation.sector_allocation).map((_, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Chart>
                      </ResponsiveContainer>
                    )}
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-3 flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      Geographic Distribution
                    </h4>
                    <div className="space-y-2">
                      {recommendation.geographic_allocation && Object.entries(recommendation.geographic_allocation).map(([region, percentage]) => (
                        <div key={region} className="flex justify-between items-center">
                          <span className="text-sm capitalize">{region.replace('_', ' ')}</span>
                          <Badge variant="outline">{Number(percentage)}%</Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {recommendation.investment_thesis && (
                  <div className="mt-4">
                    <h4 className="font-medium mb-2">Investment Thesis</h4>
                    <p className="text-sm text-muted-foreground">
                      {recommendation.investment_thesis}
                    </p>
                  </div>
                )}

                {recommendation.timing_recommendations && (
                  <div className="mt-4">
                    <h4 className="font-medium mb-2">Timing Recommendations</h4>
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(recommendation.timing_recommendations).map(([key, value]) => (
                        <Badge key={key} variant="secondary" className="text-xs">
                          {key.replace('_', ' ')}: {String(value)}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

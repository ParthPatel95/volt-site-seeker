import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Zap, MapPin, TrendingUp, DollarSign, AlertTriangle, CheckCircle } from 'lucide-react';

interface GridAnalysis {
  location: string;
  capacity_mva: number;
  utilization_percent: number;
  expansion_potential: number;
  investment_score: number;
  risk_level: 'low' | 'medium' | 'high';
  estimated_cost: number;
  roi_projection: number;
  timeline_months: number;
}

interface InvestmentRecommendation {
  type: 'transmission' | 'distribution' | 'generation' | 'storage';
  priority: 'high' | 'medium' | 'low';
  investment_thesis: string;
  target_capacity: number;
  estimated_return: number;
  payback_period: number;
}

interface SmartGridAdvisorProps {
  selectedLocation?: { lat: number; lng: number; name: string };
}

export const SmartGridAdvisor: React.FC<SmartGridAdvisorProps> = ({ selectedLocation }) => {
  const [analysis, setAnalysis] = useState<GridAnalysis[]>([]);
  const [recommendations, setRecommendations] = useState<InvestmentRecommendation[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const analyzeGridInvestments = async () => {
    setLoading(true);
    try {
      // Simulate grid analysis data since we don't have a specific edge function yet
      const mockAnalysis: GridAnalysis[] = [
        {
          location: selectedLocation?.name || "Houston Metro Area",
          capacity_mva: 2500,
          utilization_percent: 87,
          expansion_potential: 8.5,
          investment_score: 9.2,
          risk_level: 'low',
          estimated_cost: 45000000,
          roi_projection: 14.2,
          timeline_months: 18
        },
        {
          location: "Austin Energy District",
          capacity_mva: 1800,
          utilization_percent: 92,
          expansion_potential: 9.1,
          investment_score: 8.8,
          risk_level: 'low',
          estimated_cost: 32000000,
          roi_projection: 16.7,
          timeline_months: 14
        },
        {
          location: "Dallas-Fort Worth Grid",
          capacity_mva: 3200,
          utilization_percent: 84,
          expansion_potential: 7.8,
          investment_score: 8.1,
          risk_level: 'medium',
          estimated_cost: 62000000,
          roi_projection: 12.4,
          timeline_months: 24
        }
      ];

      const mockRecommendations: InvestmentRecommendation[] = [
        {
          type: 'transmission',
          priority: 'high',
          investment_thesis: 'Critical transmission bottleneck causing frequent congestion and price spikes during peak demand periods.',
          target_capacity: 500,
          estimated_return: 18.5,
          payback_period: 6.2
        },
        {
          type: 'storage',
          priority: 'high',
          investment_thesis: 'Grid-scale battery storage to capture arbitrage opportunities and provide ancillary services.',
          target_capacity: 200,
          estimated_return: 22.1,
          payback_period: 4.8
        },
        {
          type: 'distribution',
          priority: 'medium',
          investment_thesis: 'Smart grid upgrades to reduce losses and improve reliability in high-growth suburbs.',
          target_capacity: 150,
          estimated_return: 13.7,
          payback_period: 8.1
        }
      ];

      setAnalysis(mockAnalysis);
      setRecommendations(mockRecommendations);
      
      toast({
        title: "Analysis Complete",
        description: `Analyzed ${mockAnalysis.length} grid investment opportunities`,
      });
    } catch (error) {
      console.error('Error analyzing grid investments:', error);
      toast({
        title: "Error",
        description: "Failed to analyze grid investments",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    analyzeGridInvestments();
  }, [selectedLocation]);

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'bg-green-500/10 text-green-700 dark:text-green-400';
      case 'high': return 'bg-red-500/10 text-red-700 dark:text-red-400';
      default: return 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-500/10 text-red-700 dark:text-red-400';
      case 'medium': return 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400';
      case 'low': return 'bg-green-500/10 text-green-700 dark:text-green-400';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Smart Grid Investment Advisor</h2>
          <p className="text-muted-foreground">AI-powered grid capacity analysis and investment recommendations</p>
        </div>
        <Button onClick={analyzeGridInvestments} disabled={loading} className="flex items-center gap-2">
          <Zap className="w-4 h-4" />
          Refresh Analysis
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Grid Analysis */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Grid Investment Opportunities
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analysis.map((item, index) => (
                    <div key={index} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold">{item.location}</h4>
                        <div className="flex items-center gap-2">
                          <Badge className={getRiskColor(item.risk_level)}>
                            {item.risk_level} risk
                          </Badge>
                          <div className="text-sm font-semibold text-primary">
                            Score: {item.investment_score.toFixed(1)}/10
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                        <div>
                          <div className="text-sm text-muted-foreground">Capacity</div>
                          <div className="font-semibold">{item.capacity_mva} MVA</div>
                        </div>
                        <div>
                          <div className="text-sm text-muted-foreground">Utilization</div>
                          <div className="font-semibold">{item.utilization_percent}%</div>
                        </div>
                        <div>
                          <div className="text-sm text-muted-foreground">ROI Projection</div>
                          <div className="font-semibold text-green-600">{item.roi_projection}%</div>
                        </div>
                        <div>
                          <div className="text-sm text-muted-foreground">Timeline</div>
                          <div className="font-semibold">{item.timeline_months} months</div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="text-sm text-muted-foreground">
                          Investment: {formatCurrency(item.estimated_cost)}
                        </div>
                        <div className="text-sm">
                          Expansion Potential: <span className="font-semibold">{item.expansion_potential}/10</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Investment Recommendations */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Priority Investments
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recommendations.map((rec, index) => (
                    <div key={index} className="p-3 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <Badge className={getPriorityColor(rec.priority)}>
                          {rec.priority} priority
                        </Badge>
                        <Badge variant="outline">
                          {rec.type}
                        </Badge>
                      </div>

                      <p className="text-sm text-muted-foreground mb-3">{rec.investment_thesis}</p>

                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Target Capacity:</span>
                          <span className="font-semibold">{rec.target_capacity} MW</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Expected Return:</span>
                          <span className="font-semibold text-green-600">{rec.estimated_return}%</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Payback Period:</span>
                          <span className="font-semibold">{rec.payback_period} years</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5" />
                  Investment Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm">Total Opportunities:</span>
                    <span className="font-semibold">{analysis.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Avg ROI:</span>
                    <span className="font-semibold text-green-600">
                      {analysis.length > 0 ? (analysis.reduce((sum, a) => sum + a.roi_projection, 0) / analysis.length).toFixed(1) : 0}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Total Investment:</span>
                    <span className="font-semibold">
                      {formatCurrency(analysis.reduce((sum, a) => sum + a.estimated_cost, 0))}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">High Priority:</span>
                    <span className="font-semibold text-red-600">
                      {recommendations.filter(r => r.priority === 'high').length}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};
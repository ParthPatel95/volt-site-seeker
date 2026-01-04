
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Briefcase, TrendingUp, Target } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export function PortfolioOptimizerPanel() {
  const [riskTolerance, setRiskTolerance] = useState('');
  const [investmentAmount, setInvestmentAmount] = useState('');
  const [geographicPreference, setGeographicPreference] = useState('');
  const [loading, setLoading] = useState(false);
  const [recommendation, setRecommendation] = useState<any>(null);
  const { toast } = useToast();

  const optimizePortfolio = async () => {
    if (!riskTolerance || !investmentAmount || !geographicPreference) {
      toast({
        title: "Missing Information",
        description: "Please fill in all fields to generate portfolio optimization",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('corporate-intelligence', {
        body: {
          action: 'portfolio_optimization',
          risk_tolerance: riskTolerance,
          investment_amount: parseFloat(investmentAmount),
          geographic_preference: geographicPreference
        }
      });

      if (error) {
        throw error;
      }

      if (data?.success) {
        setRecommendation(data.recommendation);
        toast({
          title: "Portfolio Optimization Complete",
          description: "Your personalized investment recommendation is ready",
        });
      } else {
        throw new Error(data?.error || 'Failed to optimize portfolio');
      }
    } catch (error: any) {
      console.error('Error optimizing portfolio:', error);
      toast({
        title: "Optimization Error",
        description: error.message || "Failed to optimize portfolio. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Briefcase className="w-5 h-5 mr-2" />
            Portfolio Optimizer
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium">Risk Tolerance</label>
              <Select value={riskTolerance} onValueChange={setRiskTolerance}>
                <SelectTrigger>
                  <SelectValue placeholder="Select risk level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="conservative">Conservative</SelectItem>
                  <SelectItem value="moderate">Moderate</SelectItem>
                  <SelectItem value="aggressive">Aggressive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium">Investment Amount ($)</label>
              <Input
                type="number"
                placeholder="e.g., 1000000"
                value={investmentAmount}
                onChange={(e) => setInvestmentAmount(e.target.value)}
              />
            </div>

            <div>
              <label className="text-sm font-medium">Geographic Preference</label>
              <Select value={geographicPreference} onValueChange={setGeographicPreference}>
                <SelectTrigger>
                  <SelectValue placeholder="Select region" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="texas">Texas</SelectItem>
                  <SelectItem value="california">California</SelectItem>
                  <SelectItem value="northeast">Northeast US</SelectItem>
                  <SelectItem value="southeast">Southeast US</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button 
            onClick={optimizePortfolio} 
            disabled={loading}
            className="w-full"
          >
            {loading ? 'Optimizing Portfolio...' : 'Optimize Portfolio'}
          </Button>

          {recommendation && (
            <Card className="border-green-200 bg-green-50">
              <CardContent className="p-4">
                <div className="flex items-center mb-3">
                  <Target className="w-5 h-5 mr-2 text-green-600" />
                  <h3 className="font-semibold text-green-800">Portfolio Recommendation</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <span className="text-sm text-muted-foreground">Diversification Score</span>
                    <div className="font-bold text-lg">{recommendation.diversification_score}/100</div>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">Risk-Adjusted Return</span>
                    <div className="font-bold text-lg flex items-center">
                      {recommendation.risk_adjusted_return}%
                      <TrendingUp className="w-4 h-4 ml-1 text-green-600" />
                    </div>
                  </div>
                </div>

                <div className="mb-4">
                  <h4 className="font-medium mb-2">Sector Allocation</h4>
                  <div className="space-y-1">
                    {Object.entries(recommendation.sector_allocation || {}).map(([sector, percentage]: [string, any]) => (
                      <div key={sector} className="flex justify-between text-sm">
                        <span>{sector}</span>
                        <span className="font-medium">{percentage}%</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mb-4">
                  <h4 className="font-medium mb-2">Geographic Allocation</h4>
                  <div className="space-y-1">
                    {Object.entries(recommendation.geographic_allocation || {}).map(([region, percentage]: [string, any]) => (
                      <div key={region} className="flex justify-between text-sm">
                        <span>{region}</span>
                        <span className="font-medium">{percentage}%</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-card p-3 rounded border">
                  <h4 className="font-medium mb-1">Investment Thesis</h4>
                  <p className="text-sm text-foreground">{recommendation.investment_thesis}</p>
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

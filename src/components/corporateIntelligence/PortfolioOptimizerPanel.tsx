
import { useState, useEffect } from 'react';
import { Briefcase } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { PortfolioOptimizationForm } from './PortfolioOptimizationForm';
import { PortfolioRecommendationCard } from './PortfolioRecommendationCard';
import { PortfolioEmptyState } from './PortfolioEmptyState';
import { PortfolioLoadingState } from './PortfolioLoadingState';
import { transformPortfolioRecommendationData } from '@/utils/portfolioRecommendationUtils';

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
      
      const transformedData = transformPortfolioRecommendationData(data);
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

  const optimizePortfolio = async (portfolioSize: number, riskTolerance: string) => {
    setOptimizing(true);
    try {
      const { data, error } = await supabase.functions.invoke('corporate-intelligence', {
        body: { 
          action: 'optimize_portfolio',
          portfolio_size: portfolioSize,
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

      <PortfolioOptimizationForm onOptimize={optimizePortfolio} isOptimizing={optimizing} />

      {loading ? (
        <PortfolioLoadingState />
      ) : recommendations.length === 0 ? (
        <PortfolioEmptyState />
      ) : (
        <div className="grid gap-6">
          {recommendations.slice(0, 5).map((recommendation) => (
            <PortfolioRecommendationCard 
              key={recommendation.id} 
              recommendation={recommendation} 
            />
          ))}
        </div>
      )}
    </div>
  );
}

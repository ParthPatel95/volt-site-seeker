
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PieChart, MapPin } from 'lucide-react';
import { PieChart as Chart, Cell, ResponsiveContainer, Tooltip } from 'recharts';

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

interface PortfolioRecommendationCardProps {
  recommendation: PortfolioRecommendation;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

const getDiversificationColor = (score: number) => {
  if (score >= 80) return 'default';
  if (score >= 60) return 'secondary';
  return 'destructive';
};

export function PortfolioRecommendationCard({ recommendation }: PortfolioRecommendationCardProps) {
  return (
    <Card>
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
  );
}


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

export function transformPortfolioRecommendationData(data: any[]): PortfolioRecommendation[] {
  return (data || []).map(item => ({
    ...item,
    geographic_allocation: (item.geographic_allocation as Record<string, number>) || {},
    sector_allocation: (item.sector_allocation as Record<string, number>) || {},
    timing_recommendations: (item.timing_recommendations as Record<string, string | number>) || {}
  }));
}

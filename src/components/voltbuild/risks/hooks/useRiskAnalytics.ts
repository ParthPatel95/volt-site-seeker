import { useMemo } from 'react';
import type { 
  EnhancedRisk, 
  RiskAnalytics, 
  RiskMatrixCell,
  RiskProbability,
  RiskImpact,
  RiskCategory
} from '../types/voltbuild-risks.types';
import { getRiskLevel, PROBABILITY_CONFIG, IMPACT_CONFIG } from '../types/voltbuild-risks.types';

const PROBABILITIES: RiskProbability[] = ['low', 'medium', 'high', 'very_high'];
const IMPACTS: RiskImpact[] = ['low', 'medium', 'high', 'critical'];
const CATEGORIES: RiskCategory[] = ['technical', 'schedule', 'financial', 'regulatory', 'utility', 'supply_chain', 'weather', 'other'];

export function useRiskAnalytics(risks: EnhancedRisk[]) {
  const analytics = useMemo((): RiskAnalytics => {
    const now = new Date();
    const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

    const openRisks = risks.filter(r => r.status === 'open');
    const mitigatedRisks = risks.filter(r => r.status === 'mitigated');
    const closedRisks = risks.filter(r => r.status === 'closed');
    
    const criticalRisks = risks.filter(r => r.risk_score >= 12 && r.status !== 'closed');
    const highRisks = risks.filter(r => r.risk_score >= 9 && r.risk_score < 12 && r.status !== 'closed');
    
    const activeRisks = risks.filter(r => r.status !== 'closed');
    const averageRiskScore = activeRisks.length > 0
      ? activeRisks.reduce((sum, r) => sum + r.risk_score, 0) / activeRisks.length
      : 0;

    const risksWithoutMitigation = risks.filter(
      r => r.status === 'open' && (!r.mitigation_plan || r.mitigation_plan.trim() === '')
    ).length;

    const overdueReviews = risks.filter(r => {
      if (r.status === 'closed') return false;
      if (!r.last_review_date) return true;
      return new Date(r.last_review_date) < fourteenDaysAgo;
    }).length;

    const totalCostImpact = risks
      .filter(r => r.status !== 'closed' && r.estimated_cost_impact)
      .reduce((sum, r) => sum + (r.estimated_cost_impact || 0), 0);

    const totalDaysDelay = risks
      .filter(r => r.status !== 'closed' && r.estimated_days_delay)
      .reduce((sum, r) => sum + (r.estimated_days_delay || 0), 0);

    // Count by category
    const risksByCategory = CATEGORIES.reduce((acc, cat) => {
      acc[cat] = risks.filter(r => r.category === cat).length;
      return acc;
    }, {} as Record<RiskCategory, number>);

    // Count by phase
    const risksByPhase: Record<string, number> = {};
    risks.forEach(r => {
      if (r.phase_id) {
        risksByPhase[r.phase_id] = (risksByPhase[r.phase_id] || 0) + 1;
      }
    });

    // Trend data (last 30 days by week)
    const riskTrend: { date: string; count: number; avgScore: number }[] = [];
    for (let i = 4; i >= 0; i--) {
      const weekStart = new Date(now.getTime() - i * 7 * 24 * 60 * 60 * 1000);
      const weekEnd = new Date(now.getTime() - (i - 1) * 7 * 24 * 60 * 60 * 1000);
      
      const weekRisks = risks.filter(r => {
        const created = new Date(r.created_at);
        return created <= weekEnd;
      });
      
      const activeWeekRisks = weekRisks.filter(r => {
        if (r.status === 'closed' && r.actual_resolution_date) {
          return new Date(r.actual_resolution_date) > weekStart;
        }
        return true;
      });

      riskTrend.push({
        date: weekStart.toISOString().split('T')[0],
        count: activeWeekRisks.length,
        avgScore: activeWeekRisks.length > 0
          ? activeWeekRisks.reduce((sum, r) => sum + r.risk_score, 0) / activeWeekRisks.length
          : 0,
      });
    }

    return {
      totalRisks: risks.length,
      openRisks: openRisks.length,
      mitigatedRisks: mitigatedRisks.length,
      closedRisks: closedRisks.length,
      criticalRisks: criticalRisks.length,
      highRisks: highRisks.length,
      averageRiskScore,
      risksWithoutMitigation,
      overdueReviews,
      totalCostImpact,
      totalDaysDelay,
      risksByCategory,
      risksByPhase,
      riskTrend,
    };
  }, [risks]);

  // Build risk matrix data
  const riskMatrix = useMemo((): RiskMatrixCell[][] => {
    const matrix: RiskMatrixCell[][] = [];

    // Build matrix with impact as rows (critical at top) and probability as columns
    IMPACTS.slice().reverse().forEach(impact => {
      const row: RiskMatrixCell[] = [];
      PROBABILITIES.forEach(probability => {
        const score = PROBABILITY_CONFIG[probability].value * IMPACT_CONFIG[impact].value;
        const cellRisks = risks.filter(
          r => r.probability === probability && 
               r.impact === impact && 
               r.status !== 'closed'
        );
        
        row.push({
          probability,
          impact,
          risks: cellRisks,
          score,
          level: getRiskLevel(score),
        });
      });
      matrix.push(row);
    });

    return matrix;
  }, [risks]);

  return {
    analytics,
    riskMatrix,
  };
}

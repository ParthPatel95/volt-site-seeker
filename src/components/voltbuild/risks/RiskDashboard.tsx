import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, TrendingUp, DollarSign, Clock, AlertCircle } from 'lucide-react';
import { RiskMatrix } from './RiskMatrix';
import type { RiskAnalytics, RiskMatrixCell, EnhancedRisk, RiskCategory } from './types/voltbuild-risks.types';
import { cn } from '@/lib/utils';

interface RiskDashboardProps {
  analytics: RiskAnalytics;
  riskMatrix: RiskMatrixCell[][];
  onCellClick?: (risks: EnhancedRisk[]) => void;
}

export function RiskDashboard({ analytics, riskMatrix, onCellClick }: RiskDashboardProps) {
  const formatCurrency = (value: number) => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`;
    }
    if (value >= 1000) {
      return `$${(value / 1000).toFixed(0)}K`;
    }
    return `$${value.toFixed(0)}`;
  };

  return (
    <div className="space-y-6">
      {/* Metrics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <MetricCard
          title="Total Risks"
          value={analytics.totalRisks}
          subtitle={`${analytics.openRisks} open`}
          icon={AlertTriangle}
          iconColor="text-muted-foreground"
        />
        <MetricCard
          title="Critical"
          value={analytics.criticalRisks}
          subtitle="score ≥12"
          icon={AlertCircle}
          iconColor="text-red-500"
          valueColor={analytics.criticalRisks > 0 ? 'text-red-500' : undefined}
        />
        <MetricCard
          title="Avg Score"
          value={analytics.averageRiskScore.toFixed(1)}
          subtitle="of 16 max"
          icon={TrendingUp}
          iconColor="text-primary"
        />
        <MetricCard
          title="No Mitigation"
          value={analytics.risksWithoutMitigation}
          subtitle="need plans"
          icon={AlertTriangle}
          iconColor="text-yellow-500"
          valueColor={analytics.risksWithoutMitigation > 0 ? 'text-yellow-500' : undefined}
        />
        <MetricCard
          title="Cost Impact"
          value={formatCurrency(analytics.totalCostImpact)}
          subtitle="potential"
          icon={DollarSign}
          iconColor="text-green-500"
        />
        <MetricCard
          title="Schedule Risk"
          value={`${analytics.totalDaysDelay}d`}
          subtitle="delay risk"
          icon={Clock}
          iconColor="text-primary"
        />
      </div>

      {/* Matrix and Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RiskMatrix matrix={riskMatrix} onCellClick={onCellClick} />
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Risk Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <StatusBar 
                label="Open" 
                count={analytics.openRisks} 
                total={analytics.totalRisks}
                color="bg-red-500"
              />
              <StatusBar 
                label="Mitigated" 
                count={analytics.mitigatedRisks} 
                total={analytics.totalRisks}
                color="bg-yellow-500"
              />
              <StatusBar 
                label="Closed" 
                count={analytics.closedRisks} 
                total={analytics.totalRisks}
                color="bg-muted-foreground"
              />
            </div>

            {analytics.overdueReviews > 0 && (
              <div className="mt-6 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                <div className="flex items-center gap-2 text-yellow-600 dark:text-yellow-400">
                  <Clock className="w-4 h-4" />
                  <span className="text-sm font-medium">
                    {analytics.overdueReviews} risk{analytics.overdueReviews !== 1 ? 's' : ''} need review
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Last reviewed over 14 days ago
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Category Breakdown */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Risks by Category</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {(Object.entries(analytics.risksByCategory) as [RiskCategory, number][])
              .filter(([_, count]) => count > 0)
              .sort((a, b) => b[1] - a[1])
              .map(([category, count]) => (
                <div key={category} className="p-3 rounded-lg bg-muted/50">
                  <div className="text-lg font-semibold">{count}</div>
                  <div className="text-xs text-muted-foreground capitalize">
                    {category.replace('_', ' ')}
                  </div>
                </div>
              ))}
            {Object.values(analytics.risksByCategory).every(c => c === 0) && (
              <div className="col-span-full text-center text-muted-foreground text-sm py-4">
                No categorized risks yet
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle: string;
  icon: React.ElementType;
  iconColor?: string;
  valueColor?: string;
}

function MetricCard({ title, value, subtitle, icon: Icon, iconColor, valueColor }: MetricCardProps) {
  return (
    <Card>
      <CardContent className="pt-4 pb-3">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs text-muted-foreground">{title}</p>
            <p className={cn('text-2xl font-bold mt-0.5', valueColor)}>{value}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>
          </div>
          <Icon className={cn('w-5 h-5', iconColor || 'text-muted-foreground')} />
        </div>
      </CardContent>
    </Card>
  );
}

interface StatusBarProps {
  label: string;
  count: number;
  total: number;
  color: string;
}

function StatusBar({ label, count, total, color }: StatusBarProps) {
  const percentage = total > 0 ? (count / total) * 100 : 0;
  
  return (
    <div>
      <div className="flex items-center justify-between text-sm mb-1">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium">{count}</span>
      </div>
      <div className="h-2 rounded-full bg-muted overflow-hidden">
        <div 
          className={cn('h-full rounded-full transition-all', color)}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

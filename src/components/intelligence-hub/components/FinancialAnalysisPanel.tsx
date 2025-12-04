
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingDown, TrendingUp, DollarSign, PieChart, BarChart3, AlertTriangle } from 'lucide-react';

interface FinancialAnalysisPanelProps {
  analysisResult: any;
}

export function FinancialAnalysisPanel({ analysisResult }: FinancialAnalysisPanelProps) {
  const financials = analysisResult?.financialMetrics || analysisResult?.financials || {};
  const hasData = Object.keys(financials).length > 0 || analysisResult?.marketCap;

  if (!hasData) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <DollarSign className="w-12 h-12 mx-auto mb-3 opacity-50" />
        <p className="font-medium">No Financial Data Available</p>
        <p className="text-sm">Financial metrics will appear here when available</p>
      </div>
    );
  }

  const metrics = [
    { label: 'Revenue', value: financials.revenue, format: 'currency', icon: DollarSign },
    { label: 'Net Income', value: financials.netIncome, format: 'currency', icon: TrendingUp },
    { label: 'Market Cap', value: analysisResult?.marketCap || financials.marketCap, format: 'currency', icon: PieChart },
    { label: 'Debt to Equity', value: financials.debtToEquity, format: 'ratio', icon: BarChart3 },
    { label: 'Current Ratio', value: financials.currentRatio, format: 'ratio', icon: BarChart3 },
    { label: 'ROE', value: financials.roe, format: 'percent', icon: TrendingUp },
    { label: 'ROA', value: financials.roa, format: 'percent', icon: TrendingUp },
    { label: 'Gross Margin', value: financials.grossMargin, format: 'percent', icon: PieChart },
  ].filter(m => m.value !== undefined && m.value !== null);

  const formatValue = (value: number, format: string) => {
    switch (format) {
      case 'currency':
        if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
        if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`;
        return `$${value.toLocaleString()}`;
      case 'percent':
        return `${(value * 100).toFixed(1)}%`;
      case 'ratio':
        return value.toFixed(2);
      default:
        return value.toString();
    }
  };

  const getHealthIndicator = (metric: string, value: number) => {
    const thresholds: Record<string, { good: number; warning: number; reverse?: boolean }> = {
      'Current Ratio': { good: 1.5, warning: 1.0 },
      'Debt to Equity': { good: 0.5, warning: 1.5, reverse: true },
      'ROE': { good: 0.15, warning: 0.08 },
      'ROA': { good: 0.1, warning: 0.05 },
      'Gross Margin': { good: 0.3, warning: 0.15 },
    };

    const threshold = thresholds[metric];
    if (!threshold) return null;

    const isGood = threshold.reverse ? value < threshold.good : value > threshold.good;
    const isWarning = threshold.reverse ? value < threshold.warning : value > threshold.warning;

    if (isGood) return 'good';
    if (isWarning) return 'warning';
    return 'danger';
  };

  return (
    <div className="space-y-4">
      {/* Key Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {metrics.slice(0, 8).map((metric) => {
          const health = getHealthIndicator(metric.label, metric.value);
          const Icon = metric.icon;
          
          return (
            <Card key={metric.label}>
              <CardContent className="p-3">
                <div className="flex items-center gap-2 mb-1">
                  <Icon className="w-4 h-4 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">{metric.label}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-semibold">{formatValue(metric.value, metric.format)}</span>
                  {health && (
                    <Badge 
                      variant="outline" 
                      className={`text-[10px] ${
                        health === 'good' ? 'bg-green-500/10 text-green-600 border-green-500/30' :
                        health === 'warning' ? 'bg-yellow-500/10 text-yellow-600 border-yellow-500/30' :
                        'bg-red-500/10 text-red-600 border-red-500/30'
                      }`}
                    >
                      {health === 'good' ? '✓' : health === 'warning' ? '!' : '⚠'}
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Risk Indicators */}
      {analysisResult?.riskFactors && analysisResult.riskFactors.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="w-4 h-4 text-yellow-600" />
              <span className="text-sm font-medium">Risk Factors</span>
            </div>
            <div className="space-y-2">
              {analysisResult.riskFactors.map((risk: string, i: number) => (
                <div key={i} className="flex items-start gap-2 text-sm">
                  <span className="text-yellow-600">•</span>
                  <span className="text-muted-foreground">{risk}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* SEC Filings */}
      {analysisResult?.secFilings && analysisResult.secFilings.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <span className="text-sm font-medium">Recent SEC Filings</span>
            <div className="mt-2 space-y-2">
              {analysisResult.secFilings.slice(0, 5).map((filing: any, i: number) => (
                <div key={i} className="flex items-center justify-between text-sm p-2 bg-muted/50 rounded">
                  <span className="text-muted-foreground">{filing.type || filing.form}</span>
                  <span className="text-xs">{filing.date}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

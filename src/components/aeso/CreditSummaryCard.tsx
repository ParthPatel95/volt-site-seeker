import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingDown, DollarSign, Zap, Shield, ArrowDown } from 'lucide-react';
import { CreditSummary } from '@/hooks/useEnergyCredits';

interface Props {
  summary: CreditSummary;
  unit: 'mwh' | 'kwh';
}

export function CreditSummaryCard({ summary, unit }: Props) {
  const formatPrice = (value: number) => {
    if (unit === 'kwh') {
      return `${(value * 0.1).toFixed(2)}¢ CAD/kWh`;
    }
    return `$${value.toFixed(2)} CAD/MWh`;
  };

  const formatCredit = (value: number) => {
    if (unit === 'kwh') {
      return `-${(value * 0.1).toFixed(2)}¢ CAD`;
    }
    return `-$${value.toFixed(2)} CAD`;
  };

  return (
    <Card className="border-green-500/30 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
            <TrendingDown className="w-5 h-5 text-green-600" />
          </div>
          Credit-Adjusted Pricing
          <Badge className="ml-auto bg-green-600 hover:bg-green-600 text-white">
            ↓{summary.savingsPercentage.toFixed(1)}% savings
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Base Price */}
          <div className="p-4 rounded-lg bg-white/60 dark:bg-background/40 border border-border/50">
            <div className="flex items-center gap-2 mb-1">
              <DollarSign className="w-4 h-4 text-muted-foreground" />
              <span className="text-xs font-medium text-muted-foreground">Base Pool Price</span>
            </div>
            <p className="text-xl font-bold text-foreground">
              {formatPrice(summary.baseAvgPrice)}
            </p>
          </div>

          {/* 12CP Credit */}
          <div className="p-4 rounded-lg bg-white/60 dark:bg-background/40 border border-amber-200 dark:border-amber-800/50">
            <div className="flex items-center gap-2 mb-1">
              <Zap className="w-4 h-4 text-amber-500" />
              <span className="text-xs font-medium text-muted-foreground">12CP Credit</span>
            </div>
            <p className="text-xl font-bold text-amber-600 dark:text-amber-400">
              {summary.twelveCPCredit > 0 ? formatCredit(summary.twelveCPCredit) : '—'}
            </p>
            {summary.twelveCPCredit > 0 && (
              <p className="text-xs text-muted-foreground mt-1">Transmission savings</p>
            )}
          </div>

          {/* OR Credit */}
          <div className="p-4 rounded-lg bg-white/60 dark:bg-background/40 border border-blue-200 dark:border-blue-800/50">
            <div className="flex items-center gap-2 mb-1">
              <Shield className="w-4 h-4 text-blue-500" />
              <span className="text-xs font-medium text-muted-foreground">OR Credit</span>
            </div>
            <p className="text-xl font-bold text-blue-600 dark:text-blue-400">
              {summary.orCredit > 0 ? formatCredit(summary.orCredit) : '—'}
            </p>
            {summary.orCredit > 0 && (
              <p className="text-xs text-muted-foreground mt-1">Reserve revenue</p>
            )}
          </div>

          {/* Effective Price */}
          <div className="p-4 rounded-lg bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/40 dark:to-emerald-900/40 border border-green-300 dark:border-green-700">
            <div className="flex items-center gap-2 mb-1">
              <ArrowDown className="w-4 h-4 text-green-600" />
              <span className="text-xs font-medium text-green-700 dark:text-green-300">Effective Price</span>
            </div>
            <p className="text-2xl font-bold text-green-700 dark:text-green-400">
              {formatPrice(summary.effectivePrice)}
            </p>
            <p className="text-xs text-green-600 dark:text-green-400 mt-1">
              After all credits
            </p>
          </div>
        </div>

        {/* Annual Savings Estimate */}
        {summary.estimatedAnnualSavings > 0 && (
          <div className="mt-4 p-3 rounded-lg bg-green-100/50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
            <p className="text-sm text-green-700 dark:text-green-300">
              <strong>Estimated Annual Savings:</strong>{' '}
              ${(summary.estimatedAnnualSavings / 1000).toFixed(0)}k per MW of load
              <span className="text-xs text-muted-foreground ml-2">
                (based on {summary.totalHours.toLocaleString()} hours analyzed)
              </span>
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

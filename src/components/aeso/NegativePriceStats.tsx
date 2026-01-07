import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingDown, Zap, Clock, DollarSign, Percent, Gift } from 'lucide-react';
import { NegativePriceStats as NegativePriceStatsType } from '@/utils/aggregations';

interface NegativePriceStatsProps {
  stats: NegativePriceStatsType;
  formatCurrency: (value: number) => string;
}

export function NegativePriceStats({ stats, formatCurrency }: NegativePriceStatsProps) {
  // Don't render if no negative prices were found
  if (stats.negativeHours === 0) {
    return null;
  }

  return (
    <Card className="border-l-4 border-l-emerald-500 bg-gradient-to-r from-emerald-50/50 to-transparent dark:from-emerald-950/20">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Gift className="w-5 h-5 text-emerald-600" />
          Negative Price Credits
          <Badge variant="secondary" className="ml-2 bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300">
            Consumer Savings
          </Badge>
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          During oversupply conditions (typically high wind + low demand), AESO prices can go negative — 
          meaning you earn credits for consuming electricity.
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {/* Negative Hours Count */}
          <div className="bg-white/50 dark:bg-white/5 rounded-lg p-3 border border-emerald-200 dark:border-emerald-800">
            <div className="flex items-center gap-2 mb-1">
              <Clock className="w-4 h-4 text-emerald-600" />
              <span className="text-xs font-medium text-muted-foreground">Negative Hours</span>
            </div>
            <p className="text-xl font-bold text-emerald-600">{stats.negativeHours}</p>
            <p className="text-xs text-muted-foreground">hours with credits</p>
          </div>

          {/* Percentage of Total */}
          <div className="bg-white/50 dark:bg-white/5 rounded-lg p-3 border border-emerald-200 dark:border-emerald-800">
            <div className="flex items-center gap-2 mb-1">
              <Percent className="w-4 h-4 text-emerald-600" />
              <span className="text-xs font-medium text-muted-foreground">Of Total</span>
            </div>
            <p className="text-xl font-bold text-emerald-600">{stats.negativePercentage.toFixed(2)}%</p>
            <p className="text-xs text-muted-foreground">of all hours</p>
          </div>

          {/* Average Negative Price */}
          <div className="bg-white/50 dark:bg-white/5 rounded-lg p-3 border border-emerald-200 dark:border-emerald-800">
            <div className="flex items-center gap-2 mb-1">
              <TrendingDown className="w-4 h-4 text-emerald-600" />
              <span className="text-xs font-medium text-muted-foreground">Avg Credit</span>
            </div>
            <p className="text-xl font-bold text-emerald-600">{formatCurrency(Math.abs(stats.avgNegativePrice))}</p>
            <p className="text-xs text-muted-foreground">per MWh earned</p>
          </div>

          {/* Total Credits Earned */}
          <div className="bg-white/50 dark:bg-white/5 rounded-lg p-3 border border-emerald-200 dark:border-emerald-800">
            <div className="flex items-center gap-2 mb-1">
              <DollarSign className="w-4 h-4 text-emerald-600" />
              <span className="text-xs font-medium text-muted-foreground">Total Credits</span>
            </div>
            <p className="text-xl font-bold text-emerald-600">{formatCurrency(stats.totalSavingsFromNegatives)}</p>
            <p className="text-xs text-muted-foreground">per MWh consumed</p>
          </div>

          {/* Net Average Price */}
          <div className="bg-white/50 dark:bg-white/5 rounded-lg p-3 border border-blue-200 dark:border-blue-800">
            <div className="flex items-center gap-2 mb-1">
              <Zap className="w-4 h-4 text-blue-600" />
              <span className="text-xs font-medium text-muted-foreground">Net Average</span>
            </div>
            <p className="text-xl font-bold text-blue-600">{formatCurrency(stats.netAveragePrice)}</p>
            <p className="text-xs text-muted-foreground">incl. negatives</p>
          </div>

          {/* Positive Price Avg (comparison) */}
          <div className="bg-white/50 dark:bg-white/5 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2 mb-1">
              <Zap className="w-4 h-4 text-gray-500" />
              <span className="text-xs font-medium text-muted-foreground">Positive Only</span>
            </div>
            <p className="text-xl font-bold text-gray-600 dark:text-gray-400">{formatCurrency(stats.avgPositivePrice)}</p>
            <p className="text-xs text-muted-foreground">excl. negatives</p>
          </div>
        </div>

        {/* Insight message */}
        <div className="mt-4 p-3 bg-emerald-50 dark:bg-emerald-950/30 rounded-lg border border-emerald-200 dark:border-emerald-800">
          <p className="text-sm text-emerald-800 dark:text-emerald-200">
            <strong>💡 Insight:</strong> You could have earned{' '}
            <span className="font-bold">{formatCurrency(stats.totalSavingsFromNegatives)}</span> in credits 
            per MWh during {stats.negativeHours} negative price hours. 
            These typically occur during overnight hours with high wind generation and low demand.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

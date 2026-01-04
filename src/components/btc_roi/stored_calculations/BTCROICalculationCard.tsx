
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Eye, Trash2, Building2, Zap, Calendar, TrendingUp, DollarSign } from 'lucide-react';
import { StoredCalculation, HostingROIResults, BTCROIResults } from '../types/btc_roi_types';

interface BTCROICalculationCardProps {
  calculation: StoredCalculation;
  onView: (calculation: StoredCalculation) => void;
  onDelete: (id: string) => void;
}

export const BTCROICalculationCard: React.FC<BTCROICalculationCardProps> = ({
  calculation,
  onView,
  onDelete
}) => {
  const formatCurrency = (amount: number) => `$${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  const formatPercent = (percent: number) => `${percent.toFixed(1)}%`;
  
  const isHosting = calculation.calculationType === 'hosting';
  const results = calculation.results as HostingROIResults | BTCROIResults;

  const renderQuickStats = () => {
    if (isHosting) {
      const hostingResults = results as HostingROIResults;
      return (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
          <div className="text-center p-2 bg-green-50 rounded">
            <div className="font-bold text-green-700">{formatCurrency(hostingResults.netProfit)}</div>
            <div className="text-green-600">Net Profit</div>
          </div>
          <div className="text-center p-2 bg-blue-50 rounded">
            <div className="font-bold text-blue-700">{formatPercent(hostingResults.roi12Month)}</div>
            <div className="text-blue-600">12M ROI</div>
          </div>
          <div className="text-center p-2 bg-purple-50 rounded">
            <div className="font-bold text-purple-700">{formatPercent(hostingResults.profitMarginPercent)}</div>
            <div className="text-purple-600">Margin</div>
          </div>
          <div className="text-center p-2 bg-orange-50 rounded">
            <div className="font-bold text-orange-700">{hostingResults.paybackPeriodYears.toFixed(1)}y</div>
            <div className="text-orange-600">Payback</div>
          </div>
        </div>
      );
    } else {
      const miningResults = results as BTCROIResults;
      return (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
          <div className="text-center p-2 bg-green-50 rounded">
            <div className="font-bold text-green-700">{formatCurrency(miningResults.dailyNetProfit)}</div>
            <div className="text-green-600">Daily Profit</div>
          </div>
          <div className="text-center p-2 bg-blue-50 rounded">
            <div className="font-bold text-blue-700">{formatPercent(miningResults.roi12Month)}</div>
            <div className="text-blue-600">12M ROI</div>
          </div>
          <div className="text-center p-2 bg-purple-50 rounded">
            <div className="font-bold text-purple-700">{miningResults.breakEvenDays.toFixed(0)} days</div>
            <div className="text-purple-600">Break Even</div>
          </div>
          <div className="text-center p-2 bg-orange-50 rounded">
            <div className="font-bold text-orange-700">{formatCurrency(miningResults.totalInvestment)}</div>
            <div className="text-orange-600">Investment</div>
          </div>
        </div>
      );
    }
  };

  return (
    <Card className="relative hover:shadow-md transition-shadow duration-200">
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div className="flex items-center gap-2">
              {isHosting ? (
                <Building2 className="w-4 h-4 text-blue-500" />
              ) : (
                <Zap className="w-4 h-4 text-orange-500" />
              )}
              <span className="font-medium text-sm">{calculation.siteName}</span>
              <Badge variant={isHosting ? "default" : "secondary"} className="text-xs">
                {isHosting ? 'Hosting' : 'Self Mining'}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Calendar className="w-3 h-3" />
                {calculation.timestamp.toLocaleDateString()}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onView(calculation)}
                className="flex items-center gap-1"
              >
                <Eye className="w-3 h-3" />
                View
              </Button>
              <Button
                onClick={() => onDelete(calculation.id)}
                variant="outline"
                size="sm"
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="w-3 h-3" />
              </Button>
            </div>
          </div>
          
          {/* Quick Stats */}
          {renderQuickStats()}

          {/* Additional Info */}
          <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              {calculation.formData.units} units
            </span>
            <span className="flex items-center gap-1">
              <DollarSign className="w-3 h-3" />
              {formatCurrency(calculation.networkData.price)} BTC
            </span>
            <span>{calculation.formData.asicModel}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

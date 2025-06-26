
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, DollarSign, Bitcoin, Clock, Target } from 'lucide-react';
import { BTCROIResults } from './types/btc_roi_types';

interface BTCROIOutputTableProps {
  roiResults: BTCROIResults | null;
}

export const BTCROIOutputTable: React.FC<BTCROIOutputTableProps> = ({ roiResults }) => {
  if (!roiResults) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            ROI Results
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <TrendingUp className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">
              Configure your mining setup and click "Calculate My ROI" to see detailed results
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const formatCurrency = (amount: number) => `$${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  const formatBTC = (amount: number) => `${amount.toFixed(8)} BTC`;
  const formatPercent = (percent: number) => `${percent.toFixed(1)}%`;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          ROI Results
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Key Metrics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg">
            <Bitcoin className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <div className="text-xl font-bold text-green-800">
              {formatBTC(roiResults.dailyBTCMined)}
            </div>
            <div className="text-sm text-green-600">Daily BTC Mined</div>
          </div>

          <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
            <DollarSign className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <div className="text-xl font-bold text-blue-800">
              {formatCurrency(roiResults.dailyRevenue)}
            </div>
            <div className="text-sm text-blue-600">Daily Revenue</div>
          </div>

          <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg">
            <Clock className="w-8 h-8 text-orange-600 mx-auto mb-2" />
            <div className="text-xl font-bold text-orange-800">
              {roiResults.breakEvenDays.toFixed(0)}
            </div>
            <div className="text-sm text-orange-600">Break-even Days</div>
          </div>

          <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg">
            <Target className="w-8 h-8 text-purple-600 mx-auto mb-2" />
            <div className="text-xl font-bold text-purple-800">
              {formatPercent(roiResults.roi12Month)}
            </div>
            <div className="text-sm text-purple-600">12-Month ROI</div>
          </div>
        </div>

        {/* Detailed Results Table */}
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Metric</TableHead>
                <TableHead className="text-right">Daily</TableHead>
                <TableHead className="text-right">Monthly</TableHead>
                <TableHead className="text-right">Yearly</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">BTC Mined</TableCell>
                <TableCell className="text-right">{formatBTC(roiResults.dailyBTCMined)}</TableCell>
                <TableCell className="text-right">{formatBTC(roiResults.dailyBTCMined * 30)}</TableCell>
                <TableCell className="text-right">{formatBTC(roiResults.dailyBTCMined * 365)}</TableCell>
              </TableRow>
              
              <TableRow>
                <TableCell className="font-medium">Gross Revenue</TableCell>
                <TableCell className="text-right">{formatCurrency(roiResults.dailyRevenue)}</TableCell>
                <TableCell className="text-right">{formatCurrency(roiResults.monthlyRevenue)}</TableCell>
                <TableCell className="text-right">{formatCurrency(roiResults.yearlyRevenue)}</TableCell>
              </TableRow>
              
              <TableRow>
                <TableCell className="font-medium">Power Costs</TableCell>
                <TableCell className="text-right text-red-600">-{formatCurrency(roiResults.dailyPowerCost)}</TableCell>
                <TableCell className="text-right text-red-600">-{formatCurrency(roiResults.monthlyPowerCost)}</TableCell>
                <TableCell className="text-right text-red-600">-{formatCurrency(roiResults.yearlyPowerCost)}</TableCell>
              </TableRow>
              
              <TableRow>
                <TableCell className="font-medium">Pool Fees</TableCell>
                <TableCell className="text-right text-red-600">-{formatCurrency(roiResults.dailyPoolFees)}</TableCell>
                <TableCell className="text-right text-red-600">-{formatCurrency(roiResults.monthlyPoolFees)}</TableCell>
                <TableCell className="text-right text-red-600">-{formatCurrency(roiResults.yearlyPoolFees)}</TableCell>
              </TableRow>
              
              <TableRow className="border-t-2">
                <TableCell className="font-bold">Net Profit</TableCell>
                <TableCell className={`text-right font-bold ${roiResults.dailyNetProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {roiResults.dailyNetProfit >= 0 ? '' : '-'}{formatCurrency(Math.abs(roiResults.dailyNetProfit))}
                </TableCell>
                <TableCell className={`text-right font-bold ${roiResults.monthlyNetProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {roiResults.monthlyNetProfit >= 0 ? '' : '-'}{formatCurrency(Math.abs(roiResults.monthlyNetProfit))}
                </TableCell>
                <TableCell className={`text-right font-bold ${roiResults.yearlyNetProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {roiResults.yearlyNetProfit >= 0 ? '' : '-'}{formatCurrency(Math.abs(roiResults.yearlyNetProfit))}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>

        {/* ROI Summary */}
        <div className="pt-4 border-t">
          <div className="flex flex-wrap gap-4 justify-center">
            <Badge variant="outline" className="px-4 py-2">
              <span className="text-sm">Total Hardware Investment: {formatCurrency(roiResults.totalInvestment)}</span>
            </Badge>
            <Badge 
              variant={roiResults.roi12Month >= 0 ? "default" : "destructive"} 
              className="px-4 py-2"
            >
              <span className="text-sm">
                12-Month ROI: {formatPercent(roiResults.roi12Month)}
                {roiResults.roi12Month >= 0 ? <TrendingUp className="w-4 h-4 ml-1 inline" /> : <TrendingDown className="w-4 h-4 ml-1 inline" />}
              </span>
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

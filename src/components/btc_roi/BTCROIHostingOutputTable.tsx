
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Building2, TrendingUp, TrendingDown, DollarSign, Zap, Clock, Target, AlertTriangle } from 'lucide-react';
import { HostingROIResults } from './types/btc_roi_types';

interface BTCROIHostingOutputTableProps {
  hostingResults: HostingROIResults | null;
}

export const BTCROIHostingOutputTable: React.FC<BTCROIHostingOutputTableProps> = ({ hostingResults }) => {
  if (!hostingResults) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5" />
            Hosting Profitability Results
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">
              Configure your hosting setup and click "Calculate Hosting Profitability" to see detailed results
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const formatCurrency = (amount: number) => `$${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  const formatPercent = (percent: number) => `${percent.toFixed(1)}%`;
  const formatEnergy = (kWh: number) => `${kWh.toLocaleString()} kWh`;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="w-5 h-5" />
          Hosting Profitability Results
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Key Metrics Cards - Fixed responsive layout */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg min-h-[120px] flex flex-col justify-center">
            <DollarSign className="w-6 h-6 text-green-600 mx-auto mb-2" />
            <div className="text-lg font-bold text-green-800 break-words leading-tight">
              {formatCurrency(hostingResults.totalHostingRevenue)}
            </div>
            <div className="text-sm text-green-600 mt-1">Annual Revenue</div>
          </div>

          <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg min-h-[120px] flex flex-col justify-center">
            <Zap className="w-6 h-6 text-blue-600 mx-auto mb-2" />
            <div className="text-lg font-bold text-blue-800 break-words leading-tight">
              {formatEnergy(hostingResults.totalEnergyUsageKWh)}
            </div>
            <div className="text-sm text-blue-600 mt-1">Energy Consumed</div>
          </div>

          <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg min-h-[120px] flex flex-col justify-center">
            <Target className="w-6 h-6 text-orange-600 mx-auto mb-2" />
            <div className="text-lg font-bold text-orange-800 break-words leading-tight">
              {formatPercent(hostingResults.roi12Month)}
            </div>
            <div className="text-sm text-orange-600 mt-1">12-Month ROI</div>
          </div>

          <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg min-h-[120px] flex flex-col justify-center">
            <Clock className="w-6 h-6 text-purple-600 mx-auto mb-2" />
            <div className="text-lg font-bold text-purple-800 break-words leading-tight">
              {hostingResults.paybackPeriodYears > 0 ? hostingResults.paybackPeriodYears.toFixed(1) : 'N/A'}
            </div>
            <div className="text-sm text-purple-600 mt-1">Payback (Years)</div>
          </div>
        </div>

        {/* Detailed Financial Table - Improved responsiveness */}
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[150px]">Financial Metric</TableHead>
                <TableHead className="text-right min-w-[120px]">Amount</TableHead>
                <TableHead className="text-right min-w-[100px]">Per kWh</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">Hosting Revenue</TableCell>
                <TableCell className="text-right break-words">{formatCurrency(hostingResults.totalHostingRevenue)}</TableCell>
                <TableCell className="text-right break-words">
                  {formatCurrency(hostingResults.totalHostingRevenue / hostingResults.totalEnergyUsageKWh)}
                </TableCell>
              </TableRow>
              
              <TableRow>
                <TableCell className="font-medium">Electricity Cost</TableCell>
                <TableCell className="text-right text-red-600 break-words">-{formatCurrency(hostingResults.totalElectricityCost)}</TableCell>
                <TableCell className="text-right text-red-600 break-words">
                  -{formatCurrency(hostingResults.averageElectricityCost)}
                </TableCell>
              </TableRow>
              
              <TableRow>
                <TableCell className="font-medium">Operational Overhead</TableCell>
                <TableCell className="text-right text-red-600 break-words">-{formatCurrency(hostingResults.totalOperationalCost)}</TableCell>
                <TableCell className="text-right text-red-600 break-words">
                  -{formatCurrency(hostingResults.totalOperationalCost / hostingResults.totalEnergyUsageKWh)}
                </TableCell>
              </TableRow>
              
              <TableRow className="border-t-2">
                <TableCell className="font-bold">Gross Profit (Before Overhead)</TableCell>
                <TableCell className={`text-right font-bold break-words ${hostingResults.grossProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {hostingResults.grossProfit >= 0 ? '' : '-'}{formatCurrency(Math.abs(hostingResults.grossProfit))}
                </TableCell>
                <TableCell className={`text-right font-bold break-words ${hostingResults.grossProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {hostingResults.grossProfit >= 0 ? '' : '-'}{formatCurrency(Math.abs(hostingResults.grossProfit) / hostingResults.totalEnergyUsageKWh)}
                </TableCell>
              </TableRow>
              
              <TableRow className="border-t-2">
                <TableCell className="font-bold">Net Profit (After All Costs)</TableCell>
                <TableCell className={`text-right font-bold break-words ${hostingResults.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {hostingResults.netProfit >= 0 ? '' : '-'}{formatCurrency(Math.abs(hostingResults.netProfit))}
                </TableCell>
                <TableCell className={`text-right font-bold break-words ${hostingResults.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {hostingResults.netProfit >= 0 ? '' : '-'}{formatCurrency(Math.abs(hostingResults.netProfit) / hostingResults.totalEnergyUsageKWh)}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>

        {/* Operational Metrics - Improved layout */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t">
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-xl font-bold text-gray-800 break-words">
              {formatPercent(hostingResults.averageUptimePercent)}
            </div>
            <div className="text-sm text-gray-600">Average Uptime</div>
          </div>
          
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-xl font-bold text-gray-800 break-words">
              {hostingResults.curtailedHours.toLocaleString()}
            </div>
            <div className="text-sm text-gray-600">Curtailed Hours</div>
          </div>
          
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-xl font-bold text-gray-800 break-words">
              {formatPercent(hostingResults.profitMarginPercent)}
            </div>
            <div className="text-sm text-gray-600">Profit Margin</div>
          </div>
        </div>

        {/* Summary and Warnings */}
        <div className="pt-4 border-t">
          <div className="flex flex-wrap gap-4 justify-center mb-4">
            <Badge 
              variant={hostingResults.netProfit >= 0 ? "default" : "destructive"} 
              className="px-4 py-2 text-sm"
            >
              <span className="break-words">
                Annual Profit: {formatCurrency(hostingResults.netProfit)}
                {hostingResults.netProfit >= 0 ? <TrendingUp className="w-4 h-4 ml-1 inline" /> : <TrendingDown className="w-4 h-4 ml-1 inline" />}
              </span>
            </Badge>
            
            {hostingResults.paybackPeriodYears > 0 && (
              <Badge variant="outline" className="px-4 py-2 text-sm">
                <span className="break-words">Investment Recovery: {hostingResults.paybackPeriodYears.toFixed(1)} years</span>
              </Badge>
            )}
          </div>

          {/* Warnings */}
          {hostingResults.curtailedHours > 1000 && (
            <div className="flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg mb-2">
              <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0" />
              <span className="text-sm text-yellow-800">
                High curtailment ({hostingResults.curtailedHours} hours) - consider reviewing hosting fee rates or energy costs
              </span>
            </div>
          )}

          {hostingResults.profitMarginPercent < 10 && (
            <div className="flex items-center gap-2 p-3 bg-orange-50 border border-orange-200 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-orange-600 flex-shrink-0" />
              <span className="text-sm text-orange-800">
                Low profit margin ({formatPercent(hostingResults.profitMarginPercent)}) - review pricing strategy
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

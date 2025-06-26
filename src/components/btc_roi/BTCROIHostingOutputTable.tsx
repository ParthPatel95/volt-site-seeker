
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Building2, TrendingUp, TrendingDown, DollarSign, Zap, Clock, Target, AlertTriangle, Info } from 'lucide-react';
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
  const formatRate = (rate: number) => `$${rate.toFixed(4)}/kWh`;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="w-5 h-5" />
          Hosting Profitability Results
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Key Metrics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="text-center p-3 bg-gradient-to-br from-green-50 to-green-100 rounded-lg min-h-[100px] flex flex-col justify-center">
            <DollarSign className="w-5 h-5 text-green-600 mx-auto mb-1" />
            <div className="text-sm font-bold text-green-800 leading-tight">
              {formatCurrency(hostingResults.totalHostingRevenue)}
            </div>
            <div className="text-xs text-green-600">Annual Revenue</div>
          </div>

          <div className="text-center p-3 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg min-h-[100px] flex flex-col justify-center">
            <Zap className="w-5 h-5 text-blue-600 mx-auto mb-1" />
            <div className="text-sm font-bold text-blue-800 leading-tight">
              {formatEnergy(hostingResults.totalEnergyUsageKWh)}
            </div>
            <div className="text-xs text-blue-600">Energy Consumed</div>
          </div>

          <div className="text-center p-3 bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg min-h-[100px] flex flex-col justify-center">
            <Target className="w-5 h-5 text-orange-600 mx-auto mb-1" />
            <div className="text-sm font-bold text-orange-800 leading-tight">
              {formatPercent(hostingResults.roi12Month)}
            </div>
            <div className="text-xs text-orange-600">12-Month ROI</div>
          </div>

          <div className="text-center p-3 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg min-h-[100px] flex flex-col justify-center">
            <Clock className="w-5 h-5 text-purple-600 mx-auto mb-1" />
            <div className="text-sm font-bold text-purple-800 leading-tight">
              {hostingResults.paybackPeriodYears > 0 ? hostingResults.paybackPeriodYears.toFixed(1) : 'N/A'}
            </div>
            <div className="text-xs text-purple-600">Payback (Years)</div>
          </div>
        </div>

        {/* Energy Rate Breakdown */}
        {hostingResults.energyRateBreakdown && (
          <Card className="border-blue-200 bg-blue-50/30">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Info className="w-4 h-4 text-blue-600" />
                Energy Rate Analysis - {hostingResults.energyRateBreakdown.region}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 text-sm">
                <div className="text-center p-2 bg-white rounded border">
                  <div className="font-semibold text-gray-800">
                    {formatRate(hostingResults.energyRateBreakdown.averageWholesalePrice)}
                  </div>
                  <div className="text-xs text-gray-600">Avg Wholesale</div>
                </div>
                <div className="text-center p-2 bg-white rounded border">
                  <div className="font-semibold text-gray-800">
                    {formatRate(hostingResults.energyRateBreakdown.minWholesalePrice)} - {formatRate(hostingResults.energyRateBreakdown.maxWholesalePrice)}
                  </div>
                  <div className="text-xs text-gray-600">Price Range</div>
                </div>
                <div className="text-center p-2 bg-white rounded border">
                  <div className="font-semibold text-gray-800">
                    {formatRate(hostingResults.energyRateBreakdown.curtailmentThreshold)}
                  </div>
                  <div className="text-xs text-gray-600">Curtailment Threshold</div>
                </div>
                <div className="text-center p-2 bg-white rounded border">
                  <div className="font-semibold text-gray-800">
                    {hostingResults.energyRateBreakdown.operatingHours.toLocaleString()} / {hostingResults.energyRateBreakdown.totalHours.toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-600">Operating Hours</div>
                </div>
              </div>
              <div className="mt-2 text-xs text-gray-600 text-center">
                {hostingResults.energyRateBreakdown.currencyNote} • {hostingResults.energyRateBreakdown.curtailmentReason}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Financial Table */}
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[140px]">Financial Metric</TableHead>
                <TableHead className="text-right min-w-[100px]">Amount</TableHead>
                <TableHead className="text-right min-w-[80px]">Per kWh</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium text-sm">Hosting Revenue</TableCell>
                <TableCell className="text-right text-sm">{formatCurrency(hostingResults.totalHostingRevenue)}</TableCell>
                <TableCell className="text-right text-sm">
                  {formatCurrency(hostingResults.totalHostingRevenue / hostingResults.totalEnergyUsageKWh)}
                </TableCell>
              </TableRow>
              
              <TableRow>
                <TableCell className="font-medium text-sm">Electricity Cost</TableCell>
                <TableCell className="text-right text-red-600 text-sm">-{formatCurrency(hostingResults.totalElectricityCost)}</TableCell>
                <TableCell className="text-right text-red-600 text-sm">
                  -{formatCurrency(hostingResults.averageElectricityCost)}
                </TableCell>
              </TableRow>
              
              <TableRow>
                <TableCell className="font-medium text-sm">Operational Overhead</TableCell>
                <TableCell className="text-right text-red-600 text-sm">-{formatCurrency(hostingResults.totalOperationalCost)}</TableCell>
                <TableCell className="text-right text-red-600 text-sm">
                  -{formatCurrency(hostingResults.totalOperationalCost / hostingResults.totalEnergyUsageKWh)}
                </TableCell>
              </TableRow>
              
              <TableRow className="border-t-2">
                <TableCell className="font-bold text-sm">Gross Profit</TableCell>
                <TableCell className={`text-right font-bold text-sm ${hostingResults.grossProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {hostingResults.grossProfit >= 0 ? '' : '-'}{formatCurrency(Math.abs(hostingResults.grossProfit))}
                </TableCell>
                <TableCell className={`text-right font-bold text-sm ${hostingResults.grossProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {hostingResults.grossProfit >= 0 ? '' : '-'}{formatCurrency(Math.abs(hostingResults.grossProfit) / hostingResults.totalEnergyUsageKWh)}
                </TableCell>
              </TableRow>
              
              <TableRow className="border-t-2">
                <TableCell className="font-bold text-sm">Net Profit</TableCell>
                <TableCell className={`text-right font-bold text-sm ${hostingResults.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {hostingResults.netProfit >= 0 ? '' : '-'}{formatCurrency(Math.abs(hostingResults.netProfit))}
                </TableCell>
                <TableCell className={`text-right font-bold text-sm ${hostingResults.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {hostingResults.netProfit >= 0 ? '' : '-'}{formatCurrency(Math.abs(hostingResults.netProfit) / hostingResults.totalEnergyUsageKWh)}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>

        {/* Operational Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t">
          <div className="text-center p-3 bg-gray-50 rounded">
            <div className="text-lg font-bold text-gray-800">
              {formatPercent(hostingResults.averageUptimePercent)}
            </div>
            <div className="text-xs text-gray-600">Actual Uptime</div>
          </div>
          
          <div className="text-center p-3 bg-gray-50 rounded">
            <div className="text-lg font-bold text-gray-800">
              {hostingResults.curtailedHours.toLocaleString()}
            </div>
            <div className="text-xs text-gray-600">Curtailed Hours</div>
          </div>
          
          <div className="text-center p-3 bg-gray-50 rounded">
            <div className="text-lg font-bold text-gray-800">
              {formatPercent(hostingResults.profitMarginPercent)}
            </div>
            <div className="text-xs text-gray-600">Profit Margin</div>
          </div>
        </div>

        {/* Summary and Warnings */}
        <div className="pt-3 border-t">
          <div className="flex flex-wrap gap-3 justify-center mb-3">
            <Badge 
              variant={hostingResults.netProfit >= 0 ? "default" : "destructive"} 
              className="px-3 py-1 text-xs"
            >
              Annual Profit: {formatCurrency(hostingResults.netProfit)}
              {hostingResults.netProfit >= 0 ? <TrendingUp className="w-3 h-3 ml-1 inline" /> : <TrendingDown className="w-3 h-3 ml-1 inline" />}
            </Badge>
            
            {hostingResults.paybackPeriodYears > 0 && (
              <Badge variant="outline" className="px-3 py-1 text-xs">
                Investment Recovery: {hostingResults.paybackPeriodYears.toFixed(1)} years
              </Badge>
            )}
          </div>

          {/* Warnings */}
          {hostingResults.curtailedHours > 1000 && (
            <div className="flex items-center gap-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs mb-2">
              <AlertTriangle className="w-4 h-4 text-yellow-600 flex-shrink-0" />
              <span className="text-yellow-800">
                High curtailment ({hostingResults.curtailedHours} hours) due to expensive wholesale electricity prices
              </span>
            </div>
          )}

          {hostingResults.profitMarginPercent < 10 && (
            <div className="flex items-center gap-2 p-2 bg-orange-50 border border-orange-200 rounded text-xs">
              <AlertTriangle className="w-4 h-4 text-orange-600 flex-shrink-0" />
              <span className="text-orange-800">
                Low profit margin ({formatPercent(hostingResults.profitMarginPercent)}) - consider reviewing pricing strategy
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

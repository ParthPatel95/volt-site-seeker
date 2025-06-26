
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
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
            <Building2 className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
            <span className="truncate">Hosting Profitability Results</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 sm:py-12">
            <Building2 className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mx-auto mb-4 flex-shrink-0" />
            <p className="text-gray-500 text-sm sm:text-base px-2 leading-relaxed">
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
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
          <Building2 className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
          <span className="truncate">Hosting Profitability Results</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 sm:space-y-6 p-3 sm:p-6">
        {/* Key Metrics Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
          <div className="text-center p-2 sm:p-3 bg-gradient-to-br from-green-50 to-green-100 rounded-lg min-h-[80px] sm:min-h-[100px] flex flex-col justify-center">
            <DollarSign className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 mx-auto mb-1 flex-shrink-0" />
            <div className="text-xs sm:text-sm font-bold text-green-800 leading-tight break-words">
              {formatCurrency(hostingResults.totalHostingRevenue)}
            </div>
            <div className="text-xs text-green-600 truncate">Annual Revenue</div>
          </div>

          <div className="text-center p-2 sm:p-3 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg min-h-[80px] sm:min-h-[100px] flex flex-col justify-center">
            <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 mx-auto mb-1 flex-shrink-0" />
            <div className="text-xs sm:text-sm font-bold text-blue-800 leading-tight break-words">
              {formatEnergy(hostingResults.totalEnergyUsageKWh)}
            </div>
            <div className="text-xs text-blue-600 truncate">Energy Consumed</div>
          </div>

          <div className="text-center p-2 sm:p-3 bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg min-h-[80px] sm:min-h-[100px] flex flex-col justify-center">
            <Target className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600 mx-auto mb-1 flex-shrink-0" />
            <div className="text-xs sm:text-sm font-bold text-orange-800 leading-tight">
              {formatPercent(hostingResults.roi12Month)}
            </div>
            <div className="text-xs text-orange-600 truncate">12-Month ROI</div>
          </div>

          <div className="text-center p-2 sm:p-3 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg min-h-[80px] sm:min-h-[100px] flex flex-col justify-center">
            <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600 mx-auto mb-1 flex-shrink-0" />
            <div className="text-xs sm:text-sm font-bold text-purple-800 leading-tight">
              {hostingResults.paybackPeriodYears > 0 ? hostingResults.paybackPeriodYears.toFixed(1) : 'N/A'}
            </div>
            <div className="text-xs text-purple-600 truncate">Payback (Years)</div>
          </div>
        </div>

        {/* Enhanced Energy Rate Breakdown */}
        {hostingResults.energyRateBreakdown && (
          <Card className="border-blue-200 bg-blue-50/30 w-full">
            <CardHeader className="pb-2 sm:pb-3">
              <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
                <Info className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600 flex-shrink-0" />
                <span className="truncate">Energy Rate Analysis - {hostingResults.energyRateBreakdown.region}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 space-y-3 sm:space-y-4 p-3 sm:p-6">
              {/* Summary Stats */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 text-xs sm:text-sm">
                <div className="text-center p-2 bg-white rounded border min-w-0">
                  <div className="font-semibold text-gray-800 break-words">
                    {formatRate(hostingResults.energyRateBreakdown.averageWholesalePrice)}
                  </div>
                  <div className="text-xs text-gray-600 truncate">Avg Wholesale</div>
                </div>
                <div className="text-center p-2 bg-white rounded border min-w-0">
                  <div className="font-semibold text-gray-800 break-words leading-tight">
                    {formatRate(hostingResults.energyRateBreakdown.minWholesalePrice)} - {formatRate(hostingResults.energyRateBreakdown.maxWholesalePrice)}
                  </div>
                  <div className="text-xs text-gray-600 truncate">Price Range</div>
                </div>
                <div className="text-center p-2 bg-white rounded border min-w-0">
                  <div className="font-semibold text-gray-800 break-words">
                    {formatRate(hostingResults.averageElectricityCost)}
                  </div>
                  <div className="text-xs text-gray-600 truncate">All-In Rate</div>
                </div>
                <div className="text-center p-2 bg-white rounded border min-w-0">
                  <div className="font-semibold text-gray-800 break-words leading-tight">
                    {hostingResults.energyRateBreakdown.operatingHours.toLocaleString()} / {hostingResults.energyRateBreakdown.totalHours.toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-600 truncate">Operating Hours</div>
                </div>
              </div>

              {/* Detailed Rate Components */}
              {hostingResults.energyRateBreakdown.detailedRateComponents && (
                <div className="bg-white rounded-lg border p-3 sm:p-4 w-full overflow-hidden">
                  <h4 className="font-semibold text-gray-800 mb-3 text-xs sm:text-sm">Detailed Rate Breakdown (per kWh)</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-3 text-xs sm:text-sm">
                    <div className="flex justify-between items-center py-1 border-b border-gray-100 min-w-0">
                      <span className="text-gray-600 truncate mr-2">Energy (Wholesale):</span>
                      <div className="text-right min-w-0 flex-shrink-0">
                        <span className="font-semibold">{formatRate(hostingResults.energyRateBreakdown.detailedRateComponents.energyRate)}</span>
                        <span className="text-xs text-gray-500 ml-1 hidden sm:inline">({hostingResults.energyRateBreakdown.detailedRateComponents.breakdown.energy})</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center py-1 border-b border-gray-100 min-w-0">
                      <span className="text-gray-600 truncate mr-2">Transmission:</span>
                      <div className="text-right min-w-0 flex-shrink-0">
                        <span className="font-semibold">{formatRate(hostingResults.energyRateBreakdown.detailedRateComponents.transmissionRate)}</span>
                        <span className="text-xs text-gray-500 ml-1 hidden sm:inline">({hostingResults.energyRateBreakdown.detailedRateComponents.breakdown.transmission})</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center py-1 border-b border-gray-100 min-w-0">
                      <span className="text-gray-600 truncate mr-2">Distribution:</span>
                      <div className="text-right min-w-0 flex-shrink-0">
                        <span className="font-semibold">{formatRate(hostingResults.energyRateBreakdown.detailedRateComponents.distributionRate)}</span>
                        <span className="text-xs text-gray-500 ml-1 hidden sm:inline">({hostingResults.energyRateBreakdown.detailedRateComponents.breakdown.distribution})</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center py-1 border-b border-gray-100 min-w-0">
                      <span className="text-gray-600 truncate mr-2">Ancillary Services:</span>
                      <div className="text-right min-w-0 flex-shrink-0">
                        <span className="font-semibold">{formatRate(hostingResults.energyRateBreakdown.detailedRateComponents.ancillaryServicesRate)}</span>
                        <span className="text-xs text-gray-500 ml-1 hidden sm:inline">({hostingResults.energyRateBreakdown.detailedRateComponents.breakdown.ancillaryServices})</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center py-1 border-b border-gray-100 min-w-0">
                      <span className="text-gray-600 truncate mr-2">Regulatory Fees:</span>
                      <div className="text-right min-w-0 flex-shrink-0">
                        <span className="font-semibold">{formatRate(hostingResults.energyRateBreakdown.detailedRateComponents.regulatoryFeesRate)}</span>
                        <span className="text-xs text-gray-500 ml-1 hidden sm:inline">({hostingResults.energyRateBreakdown.detailedRateComponents.breakdown.regulatoryFees})</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center py-2 border-t-2 border-blue-200 font-bold col-span-1 md:col-span-2 min-w-0">
                      <span className="text-blue-800 truncate mr-2">Total All-In Rate:</span>
                      <span className="text-blue-800 flex-shrink-0">{formatRate(hostingResults.energyRateBreakdown.detailedRateComponents.totalRate)}</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="text-xs text-gray-600 text-center px-2 leading-relaxed">
                {hostingResults.energyRateBreakdown.currencyNote} • {hostingResults.energyRateBreakdown.curtailmentReason}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Financial Table */}
        <div className="w-full overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[120px] text-xs sm:text-sm">Financial Metric</TableHead>
                <TableHead className="text-right min-w-[80px] text-xs sm:text-sm">Amount</TableHead>
                <TableHead className="text-right min-w-[70px] text-xs sm:text-sm">Per kWh</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium text-xs sm:text-sm">Hosting Revenue</TableCell>
                <TableCell className="text-right text-xs sm:text-sm break-words">{formatCurrency(hostingResults.totalHostingRevenue)}</TableCell>
                <TableCell className="text-right text-xs sm:text-sm break-words">
                  {formatCurrency(hostingResults.totalHostingRevenue / hostingResults.totalEnergyUsageKWh)}
                </TableCell>
              </TableRow>
              
              <TableRow>
                <TableCell className="font-medium text-xs sm:text-sm">Electricity Cost</TableCell>
                <TableCell className="text-right text-red-600 text-xs sm:text-sm break-words">-{formatCurrency(hostingResults.totalElectricityCost)}</TableCell>
                <TableCell className="text-right text-red-600 text-xs sm:text-sm break-words">
                  -{formatCurrency(hostingResults.averageElectricityCost)}
                </TableCell>
              </TableRow>
              
              <TableRow>
                <TableCell className="font-medium text-xs sm:text-sm">Operational Overhead</TableCell>
                <TableCell className="text-right text-red-600 text-xs sm:text-sm break-words">-{formatCurrency(hostingResults.totalOperationalCost)}</TableCell>
                <TableCell className="text-right text-red-600 text-xs sm:text-sm break-words">
                  -{formatCurrency(hostingResults.totalOperationalCost / hostingResults.totalEnergyUsageKWh)}
                </TableCell>
              </TableRow>
              
              <TableRow className="border-t-2">
                <TableCell className="font-bold text-xs sm:text-sm">Gross Profit</TableCell>
                <TableCell className={`text-right font-bold text-xs sm:text-sm break-words ${hostingResults.grossProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {hostingResults.grossProfit >= 0 ? '' : '-'}{formatCurrency(Math.abs(hostingResults.grossProfit))}
                </TableCell>
                <TableCell className={`text-right font-bold text-xs sm:text-sm break-words ${hostingResults.grossProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {hostingResults.grossProfit >= 0 ? '' : '-'}{formatCurrency(Math.abs(hostingResults.grossProfit) / hostingResults.totalEnergyUsageKWh)}
                </TableCell>
              </TableRow>
              
              <TableRow className="border-t-2">
                <TableCell className="font-bold text-xs sm:text-sm">Net Profit</TableCell>
                <TableCell className={`text-right font-bold text-xs sm:text-sm break-words ${hostingResults.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {hostingResults.netProfit >= 0 ? '' : '-'}{formatCurrency(Math.abs(hostingResults.netProfit))}
                </TableCell>
                <TableCell className={`text-right font-bold text-xs sm:text-sm break-words ${hostingResults.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {hostingResults.netProfit >= 0 ? '' : '-'}{formatCurrency(Math.abs(hostingResults.netProfit) / hostingResults.totalEnergyUsageKWh)}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>

        {/* Operational Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3 pt-3 border-t">
          <div className="text-center p-2 sm:p-3 bg-gray-50 rounded min-w-0">
            <div className="text-base sm:text-lg font-bold text-gray-800 break-words">
              {formatPercent(hostingResults.averageUptimePercent)}
            </div>
            <div className="text-xs text-gray-600 truncate">Actual Uptime</div>
          </div>
          
          <div className="text-center p-2 sm:p-3 bg-gray-50 rounded min-w-0">
            <div className="text-base sm:text-lg font-bold text-gray-800 break-words">
              {hostingResults.curtailedHours.toLocaleString()}
            </div>
            <div className="text-xs text-gray-600 truncate">Curtailed Hours</div>
          </div>
          
          <div className="text-center p-2 sm:p-3 bg-gray-50 rounded min-w-0">
            <div className="text-base sm:text-lg font-bold text-gray-800">
              {formatPercent(hostingResults.profitMarginPercent)}
            </div>
            <div className="text-xs text-gray-600 truncate">Profit Margin</div>
          </div>
        </div>

        {/* Summary and Warnings */}
        <div className="pt-3 border-t">
          <div className="flex flex-wrap gap-2 sm:gap-3 justify-center mb-3">
            <Badge 
              variant={hostingResults.netProfit >= 0 ? "default" : "destructive"} 
              className="px-2 sm:px-3 py-1 text-xs flex items-center gap-1"
            >
              <span className="truncate">Annual Profit: {formatCurrency(hostingResults.netProfit)}</span>
              {hostingResults.netProfit >= 0 ? 
                <TrendingUp className="w-3 h-3 flex-shrink-0" /> : 
                <TrendingDown className="w-3 h-3 flex-shrink-0" />
              }
            </Badge>
            
            {hostingResults.paybackPeriodYears > 0 && (
              <Badge variant="outline" className="px-2 sm:px-3 py-1 text-xs">
                <span className="truncate">Investment Recovery: {hostingResults.paybackPeriodYears.toFixed(1)} years</span>
              </Badge>
            )}
          </div>

          {/* Warnings */}
          {hostingResults.curtailedHours > 1000 && (
            <div className="flex items-start gap-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs mb-2">
              <AlertTriangle className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" />
              <span className="text-yellow-800 leading-relaxed">
                High curtailment ({hostingResults.curtailedHours} hours) due to expensive wholesale electricity prices
              </span>
            </div>
          )}

          {hostingResults.profitMarginPercent < 10 && (
            <div className="flex items-start gap-2 p-2 bg-orange-50 border border-orange-200 rounded text-xs">
              <AlertTriangle className="w-4 h-4 text-orange-600 flex-shrink-0 mt-0.5" />
              <span className="text-orange-800 leading-relaxed">
                Low profit margin ({formatPercent(hostingResults.profitMarginPercent)}) - consider reviewing pricing strategy
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

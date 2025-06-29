
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Save, 
  History, 
  Trash2, 
  Eye, 
  Calendar, 
  TrendingUp, 
  DollarSign,
  Zap,
  Building2,
  Calculator,
  AlertTriangle,
  Settings,
  BarChart3,
  PieChart
} from 'lucide-react';
import { StoredCalculation, HostingROIResults, BTCROIResults } from './types/btc_roi_types';
import { useStoredCalculationsDB } from './hooks/useStoredCalculationsDB';

interface BTCROIStoredCalculationsProps {
  currentCalculationType: 'hosting' | 'self';
  currentResults: HostingROIResults | BTCROIResults | null;
  onSaveCalculation: (siteName?: string) => void;
}

export const BTCROIStoredCalculations: React.FC<BTCROIStoredCalculationsProps> = ({
  currentCalculationType,
  currentResults,
  onSaveCalculation
}) => {
  const { storedCalculations, deleteCalculation, clearAllCalculations, loading } = useStoredCalculationsDB();
  const [siteName, setSiteName] = useState('');
  const [selectedCalculation, setSelectedCalculation] = useState<StoredCalculation | null>(null);

  const formatCurrency = (amount: number) => `$${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  const formatPercent = (percent: number) => `${percent.toFixed(1)}%`;
  const formatNumber = (num: number) => num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const handleSave = () => {
    onSaveCalculation(siteName.trim() || undefined);
    setSiteName('');
  };

  const renderResultsSummary = (calc: StoredCalculation) => {
    const isHosting = calc.calculationType === 'hosting';
    const results = calc.results as HostingROIResults | BTCROIResults;

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

  const renderDetailedView = (calc: StoredCalculation) => {
    const isHosting = calc.calculationType === 'hosting';
    
    return (
      <div className="space-y-4 max-h-[80vh] overflow-y-auto">
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="financial">Financial</TabsTrigger>
            <TabsTrigger value="technical">Technical</TabsTrigger>
            <TabsTrigger value="config">Config</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Calculation Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Date:</span>
                    <span>{calc.timestamp.toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Time:</span>
                    <span>{calc.timestamp.toLocaleTimeString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Type:</span>
                    <Badge variant={isHosting ? "default" : "secondary"}>
                      {isHosting ? 'Hosting' : 'Self Mining'}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Region:</span>
                    <span>{calc.formData.region}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>ASIC Model:</span>
                    <span>{calc.formData.asicModel}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Units:</span>
                    <span>{calc.formData.units.toLocaleString()}</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <DollarSign className="w-4 h-4" />
                    Network Data
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>BTC Price:</span>
                    <span>{formatCurrency(calc.networkData.price)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Difficulty:</span>
                    <span>{(calc.networkData.difficulty / 1e12).toFixed(2)}T</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Block Reward:</span>
                    <span>{calc.networkData.blockReward} BTC</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Network Hashrate:</span>
                    <span>{(calc.networkData.hashrate / 1e18).toFixed(0)} EH/s</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Avg Block Time:</span>
                    <span>{calc.networkData.avgBlockTime} min</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Next Halving:</span>
                    <span>{calc.networkData.nextHalvingDays} days</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Results Summary */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Results Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                {renderResultsSummary(calc)}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="financial" className="space-y-4">
            {/* Detailed Financial Breakdown */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">
                  {isHosting ? 'Hosting Financial Analysis' : 'Mining Financial Analysis'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-xs">Metric</TableHead>
                        <TableHead className="text-xs text-right">Value</TableHead>
                        <TableHead className="text-xs text-right">Details</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {isHosting ? (
                        <>
                          <TableRow>
                            <TableCell className="text-xs font-medium">Total Investment</TableCell>
                            <TableCell className="text-xs text-right">{formatCurrency((calc.results as HostingROIResults).totalInvestment)}</TableCell>
                            <TableCell className="text-xs text-right">Hardware + Infrastructure</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className="text-xs font-medium">Annual Revenue</TableCell>
                            <TableCell className="text-xs text-right">{formatCurrency((calc.results as HostingROIResults).totalHostingRevenue)}</TableCell>
                            <TableCell className="text-xs text-right">Client hosting fees</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className="text-xs font-medium">Energy Costs</TableCell>
                            <TableCell className="text-xs text-right">{formatCurrency((calc.results as HostingROIResults).totalElectricityCost)}</TableCell>
                            <TableCell className="text-xs text-right">{formatNumber((calc.results as HostingROIResults).totalEnergyUsageKWh)} kWh</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className="text-xs font-medium">Operational Costs</TableCell>
                            <TableCell className="text-xs text-right">{formatCurrency((calc.results as HostingROIResults).totalOperationalCost)}</TableCell>
                            <TableCell className="text-xs text-right">Maintenance + Overhead</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className="text-xs font-medium">Annual Taxes</TableCell>
                            <TableCell className="text-xs text-right">{formatCurrency((calc.results as HostingROIResults).taxAnalysis.totalAnnualTaxes)}</TableCell>
                            <TableCell className="text-xs text-right">Income + Property</TableCell>
                          </TableRow>
                          <TableRow className="border-t-2">
                            <TableCell className="text-xs font-bold">Net Annual Profit</TableCell>
                            <TableCell className="text-xs text-right font-bold text-green-600">{formatCurrency((calc.results as HostingROIResults).netProfit)}</TableCell>
                            <TableCell className="text-xs text-right">{formatPercent((calc.results as HostingROIResults).profitMarginPercent)} margin</TableCell>
                          </TableRow>
                        </>
                      ) : (
                        <>
                          <TableRow>
                            <TableCell className="text-xs font-medium">Hardware Investment</TableCell>
                            <TableCell className="text-xs text-right">{formatCurrency((calc.results as BTCROIResults).totalInvestment)}</TableCell>
                            <TableCell className="text-xs text-right">{calc.formData.units} units × {formatCurrency(calc.formData.hardwareCost)}</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className="text-xs font-medium">Daily BTC Mined</TableCell>
                            <TableCell className="text-xs text-right">{(calc.results as BTCROIResults).dailyBTCMined.toFixed(6)} BTC</TableCell>
                            <TableCell className="text-xs text-right">{formatNumber(calc.formData.hashrate)} TH/s total</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className="text-xs font-medium">Daily Revenue</TableCell>
                            <TableCell className="text-xs text-right">{formatCurrency((calc.results as BTCROIResults).dailyRevenue)}</TableCell>
                            <TableCell className="text-xs text-right">@ {formatCurrency(calc.networkData.price)} BTC</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className="text-xs font-medium">Daily Power Cost</TableCell>
                            <TableCell className="text-xs text-right">{formatCurrency((calc.results as BTCROIResults).dailyPowerCost)}</TableCell>
                            <TableCell className="text-xs text-right">{formatNumber((calc.formData.powerDraw * calc.formData.units) / 1000)} kW</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className="text-xs font-medium">Pool Fees</TableCell>
                            <TableCell className="text-xs text-right">{formatCurrency((calc.results as BTCROIResults).dailyPoolFees)}</TableCell>
                            <TableCell className="text-xs text-right">{formatPercent(calc.formData.poolFee)} of revenue</TableCell>
                          </TableRow>
                          <TableRow className="border-t-2">
                            <TableCell className="text-xs font-bold">Daily Net Profit</TableCell>
                            <TableCell className="text-xs text-right font-bold text-green-600">{formatCurrency((calc.results as BTCROIResults).dailyNetProfit)}</TableCell>
                            <TableCell className="text-xs text-right">{formatCurrency((calc.results as BTCROIResults).monthlyNetProfit)} monthly</TableCell>
                          </TableRow>
                        </>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>

            {/* ROI Analysis */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">ROI Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {isHosting ? (
                    <>
                      <div className="text-center p-3 bg-blue-50 rounded-lg">
                        <div className="text-lg font-bold text-blue-700">{formatPercent((calc.results as HostingROIResults).roi12Month)}</div>
                        <div className="text-xs text-blue-600">12-Month ROI</div>
                      </div>
                      <div className="text-center p-3 bg-green-50 rounded-lg">
                        <div className="text-lg font-bold text-green-700">{(calc.results as HostingROIResults).paybackPeriodYears.toFixed(1)}</div>
                        <div className="text-xs text-green-600">Payback Years</div>
                      </div>
                      <div className="text-center p-3 bg-purple-50 rounded-lg">
                        <div className="text-lg font-bold text-purple-700">{formatPercent((calc.results as HostingROIResults).profitMarginPercent)}</div>
                        <div className="text-xs text-purple-600">Profit Margin</div>
                      </div>
                      <div className="text-center p-3 bg-orange-50 rounded-lg">
                        <div className="text-lg font-bold text-orange-700">{formatCurrency((calc.results as HostingROIResults).breakEvenPoint)}</div>
                        <div className="text-xs text-orange-600">Break Even</div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="text-center p-3 bg-blue-50 rounded-lg">
                        <div className="text-lg font-bold text-blue-700">{formatPercent((calc.results as BTCROIResults).roi12Month)}</div>
                        <div className="text-xs text-blue-600">12-Month ROI</div>
                      </div>
                      <div className="text-center p-3 bg-green-50 rounded-lg">
                        <div className="text-lg font-bold text-green-700">{(calc.results as BTCROIResults).breakEvenDays.toFixed(0)}</div>
                        <div className="text-xs text-green-600">Break Even Days</div>
                      </div>
                      <div className="text-center p-3 bg-purple-50 rounded-lg">
                        <div className="text-lg font-bold text-purple-700">{formatCurrency((calc.results as BTCROIResults).yearlyNetProfit)}</div>
                        <div className="text-xs text-purple-600">Annual Profit</div>
                      </div>
                      <div className="text-center p-3 bg-orange-50 rounded-lg">
                        <div className="text-lg font-bold text-orange-700">{((calc.results as BTCROIResults).yearlyNetProfit / (calc.results as BTCROIResults).totalInvestment * 100).toFixed(1)}%</div>
                        <div className="text-xs text-orange-600">Annual Return</div>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="technical" className="space-y-4">
            {/* Technical Specifications */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Settings className="w-4 h-4" />
                    Hardware Specs
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>ASIC Model:</span>
                    <span>{calc.formData.asicModel}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Hashrate per Unit:</span>
                    <span>{calc.formData.hashrate} TH/s</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Power Draw per Unit:</span>
                    <span>{calc.formData.powerDraw} W</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Units:</span>
                    <span>{calc.formData.units.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Hashrate:</span>
                    <span>{(calc.formData.hashrate * calc.formData.units).toLocaleString()} TH/s</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Power Draw:</span>
                    <span>{((calc.formData.powerDraw * calc.formData.units) / 1000).toFixed(2)} kW</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Efficiency:</span>
                    <span>{(calc.formData.powerDraw / calc.formData.hashrate).toFixed(2)} W/TH</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Zap className="w-4 h-4" />
                    Power & Costs
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Power Rate:</span>
                    <span>${calc.formData.powerRate.toFixed(4)}/kWh</span>
                  </div>
                  {calc.formData.useManualEnergyCosts && (
                    <>
                      <div className="flex justify-between">
                        <span>Energy Rate:</span>
                        <span>${calc.formData.manualEnergyRate?.toFixed(4)}/kWh</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Transmission:</span>
                        <span>${calc.formData.manualTransmissionRate?.toFixed(4)}/kWh</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Distribution:</span>
                        <span>${calc.formData.manualDistributionRate?.toFixed(4)}/kWh</span>
                      </div>
                    </>
                  )}
                  <div className="flex justify-between">
                    <span>Pool Fee:</span>
                    <span>{calc.formData.poolFee}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Cooling Overhead:</span>
                    <span>{calc.formData.coolingOverhead}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Hardware Cost/Unit:</span>
                    <span>{formatCurrency(calc.formData.hardwareCost)}</span>
                  </div>
                  {isHosting && (
                    <>
                      <div className="flex justify-between">
                        <span>Hosting Fee Rate:</span>
                        <span>${calc.formData.hostingFeeRate.toFixed(4)}/kWh</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Infrastructure Cost:</span>
                        <span>{formatCurrency(calc.formData.infrastructureCost)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Monthly Overhead:</span>
                        <span>{formatCurrency(calc.formData.monthlyOverhead)}</span>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Efficiency Metrics */}
            {isHosting && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Hosting Efficiency</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <div className="text-lg font-bold text-blue-700">{calc.formData.expectedUptimePercent}%</div>
                      <div className="text-xs text-blue-600">Expected Uptime</div>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <div className="text-lg font-bold text-green-700">{formatNumber((calc.results as HostingROIResults).totalEnergyUsageKWh / 8760)}</div>
                      <div className="text-xs text-green-600">Avg kW Usage</div>
                    </div>
                    <div className="text-center p-3 bg-purple-50 rounded-lg">
                      <div className="text-lg font-bold text-purple-700">{calc.formData.powerOverheadPercent}%</div>
                      <div className="text-xs text-purple-600">Power Overhead</div>
                    </div>
                    <div className="text-center p-3 bg-orange-50 rounded-lg">
                      <div className="text-lg font-bold text-orange-700">{calc.formData.maintenancePercent}%</div>
                      <div className="text-xs text-orange-600">Maintenance</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="config" className="space-y-4">
            {/* Configuration Details */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Complete Configuration</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-xs">Parameter</TableHead>
                        <TableHead className="text-xs text-right">Value</TableHead>
                        <TableHead className="text-xs">Category</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell className="text-xs">ASIC Model</TableCell>
                        <TableCell className="text-xs text-right">{calc.formData.asicModel}</TableCell>
                        <TableCell className="text-xs text-gray-500">Hardware</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="text-xs">Units</TableCell>
                        <TableCell className="text-xs text-right">{calc.formData.units}</TableCell>
                        <TableCell className="text-xs text-gray-500">Hardware</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="text-xs">Region</TableCell>
                        <TableCell className="text-xs text-right">{calc.formData.region}</TableCell>
                        <TableCell className="text-xs text-gray-500">Location</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="text-xs">Power Rate</TableCell>
                        <TableCell className="text-xs text-right">${calc.formData.powerRate}/kWh</TableCell>
                        <TableCell className="text-xs text-gray-500">Energy</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="text-xs">Pool Fee</TableCell>
                        <TableCell className="text-xs text-right">{calc.formData.poolFee}%</TableCell>
                        <TableCell className="text-xs text-gray-500">Mining</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="text-xs">Efficiency Override</TableCell>
                        <TableCell className="text-xs text-right">{calc.formData.efficiencyOverride}%</TableCell>
                        <TableCell className="text-xs text-gray-500">Performance</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="text-xs">Resale Value</TableCell>
                        <TableCell className="text-xs text-right">{calc.formData.resaleValue}%</TableCell>
                        <TableCell className="text-xs text-gray-500">Financial</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="text-xs">Maintenance</TableCell>
                        <TableCell className="text-xs text-right">{calc.formData.maintenancePercent}%</TableCell>
                        <TableCell className="text-xs text-gray-500">Operational</TableCell>
                      </TableRow>
                      {isHosting && (
                        <>
                          <TableRow>
                            <TableCell className="text-xs">Hosting Fee Rate</TableCell>
                            <TableCell className="text-xs text-right">${calc.formData.hostingFeeRate}/kWh</TableCell>
                            <TableCell className="text-xs text-gray-500">Hosting</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className="text-xs">Infrastructure Cost</TableCell>
                            <TableCell className="text-xs text-right">{formatCurrency(calc.formData.infrastructureCost)}</TableCell>
                            <TableCell className="text-xs text-gray-500">Hosting</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className="text-xs">Monthly Overhead</TableCell>
                            <TableCell className="text-xs text-right">{formatCurrency(calc.formData.monthlyOverhead)}</TableCell>
                            <TableCell className="text-xs text-gray-500">Hosting</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className="text-xs">Expected Uptime</TableCell>
                            <TableCell className="text-xs text-right">{calc.formData.expectedUptimePercent}%</TableCell>
                            <TableCell className="text-xs text-gray-500">Hosting</TableCell>
                          </TableRow>
                        </>
                      )}
                      {calc.formData.useManualEnergyCosts && (
                        <>
                          <TableRow>
                            <TableCell className="text-xs">Manual Energy Rate</TableCell>
                            <TableCell className="text-xs text-right">${calc.formData.manualEnergyRate}/kWh</TableCell>
                            <TableCell className="text-xs text-gray-500">Manual Energy</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className="text-xs">Transmission Rate</TableCell>
                            <TableCell className="text-xs text-right">${calc.formData.manualTransmissionRate}/kWh</TableCell>
                            <TableCell className="text-xs text-gray-500">Manual Energy</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className="text-xs">Distribution Rate</TableCell>
                            <TableCell className="text-xs text-right">${calc.formData.manualDistributionRate}/kWh</TableCell>
                            <TableCell className="text-xs text-gray-500">Manual Energy</TableCell>
                          </TableRow>
                        </>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    );
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="flex justify-center items-center space-x-2">
            <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <span>Loading calculations...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <History className="w-5 h-5" />
          Stored Calculations
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Save Current Calculation */}
        {currentResults && (
          <div className="space-y-3 p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center gap-2">
              <Save className="w-4 h-4 text-blue-600" />
              <span className="font-medium text-blue-800">Save Current Calculation</span>
            </div>
            <div className="space-y-2">
              <Label htmlFor="siteName" className="text-sm">Site Name (Optional)</Label>
              <Input
                id="siteName"
                value={siteName}
                onChange={(e) => setSiteName(e.target.value)}
                placeholder="Leave blank for auto-generated name"
                className="text-sm"
              />
            </div>
            <Button onClick={handleSave} size="sm" className="w-full sm:w-auto">
              <Save className="w-4 h-4 mr-2" />
              Save Calculation
            </Button>
          </div>
        )}

        {/* Stored Calculations List */}
        {storedCalculations.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Calculator className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p className="text-sm">No saved calculations yet</p>
            <p className="text-xs mt-1">Run a calculation above and save it to view history</p>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
              <span className="text-sm font-medium">
                {storedCalculations.length} Saved Calculation{storedCalculations.length !== 1 ? 's' : ''}
              </span>
              {storedCalculations.length > 0 && (
                <Button
                  onClick={clearAllCalculations}
                  variant="outline"
                  size="sm"
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Clear All
                </Button>
              )}
            </div>

            <ScrollArea className="h-96">
              <div className="space-y-3">
                {storedCalculations.map((calc) => (
                  <Card key={calc.id} className="relative">
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                          <div className="flex items-center gap-2">
                            {calc.calculationType === 'hosting' ? (
                              <Building2 className="w-4 h-4 text-blue-500" />
                            ) : (
                              <Zap className="w-4 h-4 text-orange-500" />
                            )}
                            <span className="font-medium text-sm">{calc.siteName}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-500">
                              {calc.timestamp.toLocaleDateString()}
                            </span>
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setSelectedCalculation(calc)}
                                >
                                  <Eye className="w-4 h-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
                                <DialogHeader>
                                  <DialogTitle className="flex items-center gap-2">
                                    {calc.calculationType === 'hosting' ? (
                                      <Building2 className="w-5 h-5" />
                                    ) : (
                                      <Zap className="w-5 h-5" />
                                    )}
                                    {calc.siteName}
                                  </DialogTitle>
                                  <DialogDescription>
                                    Detailed analysis for {calc.calculationType === 'hosting' ? 'hosting' : 'self-mining'} calculation from {calc.timestamp.toLocaleDateString()}
                                  </DialogDescription>
                                </DialogHeader>
                                {renderDetailedView(calc)}
                              </DialogContent>
                            </Dialog>
                            <Button
                              onClick={() => deleteCalculation(calc.id)}
                              variant="outline"
                              size="sm"
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                        
                        {renderResultsSummary(calc)}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

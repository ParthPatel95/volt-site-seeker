
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  Calendar, 
  DollarSign, 
  Zap, 
  Building2, 
  Settings, 
  TrendingUp, 
  BarChart3,
  PieChart,
  Target,
  Activity
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, PieChart as RechartsPieChart, Cell, BarChart, Bar, LineChart, Line } from 'recharts';
import { StoredCalculation, HostingROIResults, BTCROIResults } from '../types/btc_roi_types';

interface BTCROICalculationDetailViewProps {
  calculation: StoredCalculation;
}

export const BTCROICalculationDetailView: React.FC<BTCROICalculationDetailViewProps> = ({
  calculation
}) => {
  const formatCurrency = (amount: number) => `$${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  const formatPercent = (percent: number) => `${percent.toFixed(1)}%`;
  const formatNumber = (num: number) => num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const isHosting = calculation.calculationType === 'hosting';
  const results = calculation.results as HostingROIResults | BTCROIResults;

  // Generate chart data
  const monthlyProjectionData = Array.from({ length: 12 }, (_, i) => {
    const month = i + 1;
    if (isHosting) {
      const hostingResults = results as HostingROIResults;
      return {
        month: `Month ${month}`,
        profit: hostingResults.netProfit / 12 * month,
        revenue: hostingResults.totalHostingRevenue / 12 * month,
        costs: (hostingResults.totalElectricityCost + hostingResults.totalOperationalCost) / 12 * month
      };
    } else {
      const miningResults = results as BTCROIResults;
      return {
        month: `Month ${month}`,
        profit: miningResults.monthlyNetProfit * month,
        revenue: miningResults.monthlyRevenue * month,
        costs: miningResults.monthlyPowerCost * month
      };
    }
  });

  // Cost breakdown data
  const costBreakdownData = () => {
    if (isHosting) {
      const hostingResults = results as HostingROIResults;
      return [
        { name: 'Electricity', value: hostingResults.totalElectricityCost, color: '#ef4444' },
        { name: 'Operations', value: hostingResults.totalOperationalCost, color: '#f97316' },
        { name: 'Taxes', value: hostingResults.taxAnalysis.totalAnnualTaxes, color: '#eab308' },
        { name: 'Infrastructure', value: calculation.formData.infrastructureCost / 5, color: '#84cc16' }, // Amortized over 5 years
      ];
    } else {
      const miningResults = results as BTCROIResults;
      return [
        { name: 'Power', value: miningResults.yearlyPowerCost, color: '#ef4444' },
        { name: 'Pool Fees', value: miningResults.yearlyPoolFees, color: '#f97316' },
        { name: 'Maintenance', value: miningResults.totalInvestment * 0.05, color: '#eab308' }, // 5% maintenance
        { name: 'Hardware Depreciation', value: miningResults.totalInvestment * 0.2, color: '#84cc16' }, // 20% annual depreciation
      ];
    }
  };

  const COLORS = ['#ef4444', '#f97316', '#eab308', '#84cc16'];

  return (
    <div className="space-y-6 max-h-[85vh] overflow-y-auto">
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="financial">Financial</TabsTrigger>
          <TabsTrigger value="charts">Charts</TabsTrigger>
          <TabsTrigger value="technical">Technical</TabsTrigger>
          <TabsTrigger value="config">Config</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* Key Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-green-600">Annual Profit</p>
                    <p className="text-2xl font-bold text-green-800">
                      {isHosting ? 
                        formatCurrency((results as HostingROIResults).netProfit) : 
                        formatCurrency((results as BTCROIResults).yearlyNetProfit)
                      }
                    </p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-blue-50 to-sky-50 border-blue-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-600">12-Month ROI</p>
                    <p className="text-2xl font-bold text-blue-800">
                      {formatPercent(results.roi12Month)}
                    </p>
                  </div>
                  <Target className="w-8 h-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-50 to-violet-50 border-purple-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-purple-600">
                      {isHosting ? 'Profit Margin' : 'Break Even'}
                    </p>
                    <p className="text-2xl font-bold text-purple-800">
                      {isHosting ? 
                        formatPercent((results as HostingROIResults).profitMarginPercent) :
                        `${(results as BTCROIResults).breakEvenDays.toFixed(0)} days`
                      }
                    </p>
                  </div>
                  <Activity className="w-8 h-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-orange-50 to-amber-50 border-orange-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-orange-600">Investment</p>
                    <p className="text-2xl font-bold text-orange-800">
                      {isHosting ? 
                        formatCurrency(calculation.formData.infrastructureCost) :
                        formatCurrency((results as BTCROIResults).totalInvestment)
                      }
                    </p>
                  </div>
                  <DollarSign className="w-8 h-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>
          </div>

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
                  <span>{calculation.timestamp.toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Time:</span>
                  <span>{calculation.timestamp.toLocaleTimeString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Type:</span>
                  <Badge variant={isHosting ? "default" : "secondary"}>
                    {isHosting ? 'Hosting' : 'Self Mining'}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span>Region:</span>
                  <span>{calculation.formData.region}</span>
                </div>
                <div className="flex justify-between">
                  <span>ASIC Model:</span>
                  <span>{calculation.formData.asicModel}</span>
                </div>
                <div className="flex justify-between">
                  <span>Units:</span>
                  <span>{calculation.formData.units.toLocaleString()}</span>
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
                  <span>{formatCurrency(calculation.networkData.price)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Difficulty:</span>
                  <span>{(calculation.networkData.difficulty / 1e12).toFixed(2)}T</span>
                </div>
                <div className="flex justify-between">
                  <span>Block Reward:</span>
                  <span>{calculation.networkData.blockReward} BTC</span>
                </div>
                <div className="flex justify-between">
                  <span>Network Hashrate:</span>
                  <span>{(calculation.networkData.hashrate / 1e18).toFixed(0)} EH/s</span>
                </div>
                <div className="flex justify-between">
                  <span>Avg Block Time:</span>
                  <span>{calculation.networkData.avgBlockTime} min</span>
                </div>
                <div className="flex justify-between">
                  <span>Next Halving:</span>
                  <span>{calculation.networkData.nextHalvingDays} days</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="financial" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Financial Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Metric</TableHead>
                      <TableHead className="text-right">Value</TableHead>
                      <TableHead className="text-right">Details</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isHosting ? (
                      <>
                        <TableRow>
                          <TableCell className="font-medium">Infrastructure Investment</TableCell>
                          <TableCell className="text-right">{formatCurrency(calculation.formData.infrastructureCost)}</TableCell>
                          <TableCell className="text-right">Initial CapEx</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">Annual Revenue</TableCell>
                          <TableCell className="text-right">{formatCurrency((results as HostingROIResults).totalHostingRevenue)}</TableCell>
                          <TableCell className="text-right">Client hosting fees</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">Energy Costs</TableCell>
                          <TableCell className="text-right">{formatCurrency((results as HostingROIResults).totalElectricityCost)}</TableCell>
                          <TableCell className="text-right">{formatNumber((results as HostingROIResults).totalEnergyUsageKWh)} kWh</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">Operational Costs</TableCell>
                          <TableCell className="text-right">{formatCurrency((results as HostingROIResults).totalOperationalCost)}</TableCell>
                          <TableCell className="text-right">Maintenance + Overhead</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">Annual Taxes</TableCell>
                          <TableCell className="text-right">{formatCurrency((results as HostingROIResults).taxAnalysis.totalAnnualTaxes)}</TableCell>
                          <TableCell className="text-right">Income + Property</TableCell>
                        </TableRow>
                        <TableRow className="border-t-2">
                          <TableCell className="font-bold">Net Annual Profit</TableCell>
                          <TableCell className="text-right font-bold text-green-600">{formatCurrency((results as HostingROIResults).netProfit)}</TableCell>
                          <TableCell className="text-right">{formatPercent((results as HostingROIResults).profitMarginPercent)} margin</TableCell>
                        </TableRow>
                      </>
                    ) : (
                      <>
                        <TableRow>
                          <TableCell className="font-medium">Hardware Investment</TableCell>
                          <TableCell className="text-right">{formatCurrency((results as BTCROIResults).totalInvestment)}</TableCell>
                          <TableCell className="text-right">{calculation.formData.units} units × {formatCurrency(calculation.formData.hardwareCost)}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">Daily BTC Mined</TableCell>
                          <TableCell className="text-right">{(results as BTCROIResults).dailyBTCMined.toFixed(6)} BTC</TableCell>
                          <TableCell className="text-right">{formatNumber(calculation.formData.hashrate)} TH/s total</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">Daily Revenue</TableCell>
                          <TableCell className="text-right">{formatCurrency((results as BTCROIResults).dailyRevenue)}</TableCell>
                          <TableCell className="text-right">@ {formatCurrency(calculation.networkData.price)} BTC</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">Daily Power Cost</TableCell>
                          <TableCell className="text-right">{formatCurrency((results as BTCROIResults).dailyPowerCost)}</TableCell>
                          <TableCell className="text-right">{formatNumber((calculation.formData.powerDraw * calculation.formData.units) / 1000)} kW</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">Pool Fees</TableCell>
                          <TableCell className="text-right">{formatCurrency((results as BTCROIResults).dailyPoolFees)}</TableCell>
                          <TableCell className="text-right">{formatPercent(calculation.formData.poolFee)} of revenue</TableCell>
                        </TableRow>
                        <TableRow className="border-t-2">
                          <TableCell className="font-bold">Daily Net Profit</TableCell>
                          <TableCell className="text-right font-bold text-green-600">{formatCurrency((results as BTCROIResults).dailyNetProfit)}</TableCell>
                          <TableCell className="text-right">{formatCurrency((results as BTCROIResults).monthlyNetProfit)} monthly</TableCell>
                        </TableRow>
                      </>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="charts" className="space-y-4">
          {/* Profitability Projection Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                12-Month Profitability Projection
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={monthlyProjectionData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => formatCurrency(value as number)} />
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      stackId="1"
                      stroke="#10b981"
                      fill="#10b981"
                      fillOpacity={0.6}
                    />
                    <Area
                      type="monotone"
                      dataKey="costs"
                      stackId="2"
                      stroke="#ef4444"
                      fill="#ef4444"
                      fillOpacity={0.6}
                    />
                    <Area
                      type="monotone"
                      dataKey="profit"
                      stroke="#3b82f6"
                      fill="#3b82f6"
                      fillOpacity={0.8}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Cost Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="w-5 h-5" />
                  Cost Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart>
                      <Pie
                        data={costBreakdownData()}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {costBreakdownData().map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => formatCurrency(value as number)} />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Performance Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                    <span className="text-sm font-medium">Energy Efficiency</span>
                    <span className="font-bold text-blue-600">
                      {((calculation.formData.powerDraw * calculation.formData.units) / 1000 / (calculation.formData.hashrate * calculation.formData.units) * 1000).toFixed(2)} W/TH
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                    <span className="text-sm font-medium">Uptime Expected</span>
                    <span className="font-bold text-green-600">
                      {isHosting ? calculation.formData.expectedUptimePercent : 99}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                    <span className="text-sm font-medium">Network Share</span>
                    <span className="font-bold text-purple-600">
                      {((calculation.formData.hashrate * calculation.formData.units) / (calculation.networkData.hashrate / 1e12) * 100).toFixed(6)}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                    <span className="text-sm font-medium">Total Power Draw</span>
                    <span className="font-bold text-orange-600">
                      {((calculation.formData.powerDraw * calculation.formData.units) / 1000).toFixed(2)} kW
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
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
                  <span>{calculation.formData.asicModel}</span>
                </div>
                <div className="flex justify-between">
                  <span>Hashrate per Unit:</span>
                  <span>{calculation.formData.hashrate} TH/s</span>
                </div>
                <div className="flex justify-between">
                  <span>Power Draw per Unit:</span>
                  <span>{calculation.formData.powerDraw} W</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Units:</span>
                  <span>{calculation.formData.units.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Hashrate:</span>
                  <span>{(calculation.formData.hashrate * calculation.formData.units).toLocaleString()} TH/s</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Power Draw:</span>
                  <span>{((calculation.formData.powerDraw * calculation.formData.units) / 1000).toFixed(2)} kW</span>
                </div>
                <div className="flex justify-between">
                  <span>Efficiency:</span>
                  <span>{(calculation.formData.powerDraw / calculation.formData.hashrate).toFixed(2)} W/TH</span>
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
                  <span>${calculation.formData.powerRate.toFixed(4)}/kWh</span>
                </div>
                <div className="flex justify-between">
                  <span>Pool Fee:</span>
                  <span>{calculation.formData.poolFee}%</span>
                </div>
                <div className="flex justify-between">
                  <span>Cooling Overhead:</span>
                  <span>{calculation.formData.coolingOverhead}%</span>
                </div>
                <div className="flex justify-between">
                  <span>Hardware Cost/Unit:</span>
                  <span>{formatCurrency(calculation.formData.hardwareCost)}</span>
                </div>
                {isHosting && (
                  <>
                    <div className="flex justify-between">
                      <span>Hosting Fee Rate:</span>
                      <span>${calculation.formData.hostingFeeRate?.toFixed(4)}/kWh</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Infrastructure Cost:</span>
                      <span>{formatCurrency(calculation.formData.infrastructureCost)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Monthly Overhead:</span>
                      <span>{formatCurrency(calculation.formData.monthlyOverhead)}</span>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="config" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Complete Configuration</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Parameter</TableHead>
                      <TableHead className="text-right">Value</TableHead>
                      <TableHead>Category</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell>ASIC Model</TableCell>
                      <TableCell className="text-right">{calculation.formData.asicModel}</TableCell>
                      <TableCell className="text-gray-500">Hardware</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Units</TableCell>
                      <TableCell className="text-right">{calculation.formData.units}</TableCell>
                      <TableCell className="text-gray-500">Hardware</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Region</TableCell>
                      <TableCell className="text-right">{calculation.formData.region}</TableCell>
                      <TableCell className="text-gray-500">Location</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Power Rate</TableCell>
                      <TableCell className="text-right">${calculation.formData.powerRate}/kWh</TableCell>
                      <TableCell className="text-gray-500">Energy</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Pool Fee</TableCell>
                      <TableCell className="text-right">{calculation.formData.poolFee}%</TableCell>
                      <TableCell className="text-gray-500">Mining</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Efficiency Override</TableCell>
                      <TableCell className="text-right">{calculation.formData.efficiencyOverride}%</TableCell>
                      <TableCell className="text-gray-500">Performance</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Resale Value</TableCell>
                      <TableCell className="text-right">{calculation.formData.resaleValue}%</TableCell>
                      <TableCell className="text-gray-500">Financial</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Maintenance</TableCell>
                      <TableCell className="text-right">{calculation.formData.maintenancePercent}%</TableCell>
                      <TableCell className="text-gray-500">Operational</TableCell>
                    </TableRow>
                    {isHosting && (
                      <>
                        <TableRow>
                          <TableCell>Hosting Fee Rate</TableCell>
                          <TableCell className="text-right">${calculation.formData.hostingFeeRate}/kWh</TableCell>
                          <TableCell className="text-gray-500">Hosting</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Infrastructure Cost</TableCell>
                          <TableCell className="text-right">{formatCurrency(calculation.formData.infrastructureCost)}</TableCell>
                          <TableCell className="text-gray-500">Hosting</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Monthly Overhead</TableCell>
                          <TableCell className="text-right">{formatCurrency(calculation.formData.monthlyOverhead)}</TableCell>
                          <TableCell className="text-gray-500">Hosting</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Expected Uptime</TableCell>
                          <TableCell className="text-right">{calculation.formData.expectedUptimePercent}%</TableCell>
                          <TableCell className="text-gray-500">Hosting</TableCell>
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

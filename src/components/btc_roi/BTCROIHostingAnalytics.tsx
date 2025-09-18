
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, Percent, Target, AlertCircle, CheckCircle, Calculator } from 'lucide-react';
import { HostingROIResults } from './types/btc_roi_types';

interface BTCROIHostingAnalyticsProps {
  hostingResults: HostingROIResults;
}

export const BTCROIHostingAnalytics: React.FC<BTCROIHostingAnalyticsProps> = ({ hostingResults }) => {
  const formatCurrency = (amount: number) => `$${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  const formatPercent = (percent: number) => `${percent.toFixed(1)}%`;

  // Prepare chart data
  const costBreakdownData = [
    { name: 'Energy Costs', value: hostingResults.costAnalytics.energyCostPercentage, amount: hostingResults.totalElectricityCost },
    { name: 'Operational', value: hostingResults.costAnalytics.operationalCostPercentage, amount: hostingResults.totalOperationalCost },
    { name: 'Taxes', value: hostingResults.costAnalytics.taxPercentage, amount: hostingResults.taxAnalysis.totalAnnualTaxes },
    { name: 'Profit', value: Math.abs(hostingResults.costAnalytics.profitPercentage), amount: Math.abs(hostingResults.netProfit) }
  ];

  const monthlyData = hostingResults.monthlyBreakdown.map(month => ({
    month: `Month ${month.month}`,
    revenue: month.hostingRevenue,
    costs: month.electricityCost + month.operationalCost + month.taxes,
    profit: month.netProfit,
    uptime: month.uptimePercent
  }));

  const COLORS = ['#ef4444', '#f97316', '#eab308', '#22c55e'];

  return (
    <div className="space-y-6">
      <Tabs defaultValue="analytics" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="breakdown">Cost Breakdown</TabsTrigger>
          <TabsTrigger value="competitive">Market Analysis</TabsTrigger>
          <TabsTrigger value="taxes">Tax Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="analytics" className="space-y-4">
          {/* Key Performance Indicators */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Target className="w-4 h-4 text-blue-500" />
                  Break-Even Rate
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ${hostingResults.costAnalytics.breakEvenHostingRate.toFixed(4)}/kWh
                </div>
                <p className="text-xs text-muted-foreground">
                  Current: ${hostingResults.totalHostingRevenue / hostingResults.totalEnergyUsageKWh * 1000}/kWh
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Calculator className="w-4 h-4 text-green-500" />
                  Margin of Safety
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatPercent(hostingResults.costAnalytics.marginOfSafety)}
                </div>
                <Progress value={Math.max(0, hostingResults.costAnalytics.marginOfSafety)} className="w-full" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Percent className="w-4 h-4 text-purple-500" />
                  Effective Tax Rate
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatPercent(hostingResults.taxAnalysis.taxRate)}
                </div>
                <p className="text-xs text-muted-foreground">
                  {formatCurrency(hostingResults.taxAnalysis.totalAnnualTaxes)} annually
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-orange-500" />
                  Profit Margin
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatPercent(hostingResults.profitMarginPercent)}
                </div>
                <Badge variant={hostingResults.profitMarginPercent > 15 ? "default" : "destructive"}>
                  {hostingResults.profitMarginPercent > 15 ? "Healthy" : "Low"}
                </Badge>
              </CardContent>
            </Card>
          </div>

          {/* Monthly Performance Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Monthly Performance Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                  <Line type="monotone" dataKey="revenue" stroke="#22c55e" name="Revenue" />
                  <Line type="monotone" dataKey="costs" stroke="#ef4444" name="Total Costs" />
                  <Line type="monotone" dataKey="profit" stroke="#3b82f6" name="Net Profit" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Sensitivity Analysis */}
          <Card>
            <CardHeader>
              <CardTitle>Sensitivity Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 border rounded">
                  <div className="text-sm text-muted-foreground">Energy Cost Impact</div>
                  <div className="text-lg font-bold">
                    {formatPercent(hostingResults.costAnalytics.sensitivityAnalysis.energyCostImpact)}
                  </div>
                  <div className="text-xs">per 1% cost increase</div>
                </div>
                <div className="text-center p-4 border rounded">
                  <div className="text-sm text-muted-foreground">Hosting Rate Impact</div>
                  <div className="text-lg font-bold">
                    {formatPercent(hostingResults.costAnalytics.sensitivityAnalysis.hostingRateImpact)}
                  </div>
                  <div className="text-xs">per 1% rate increase</div>
                </div>
                <div className="text-center p-4 border rounded">
                  <div className="text-sm text-muted-foreground">Uptime Impact</div>
                  <div className="text-lg font-bold">
                    {formatPercent(hostingResults.costAnalytics.sensitivityAnalysis.uptimeImpact)}
                  </div>
                  <div className="text-xs">per 1% uptime increase</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="breakdown" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Cost Breakdown Pie Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Cost Structure</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={costBreakdownData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${Number(value).toFixed(1)}%`}
                    >
                      {costBreakdownData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `${Number(value).toFixed(1)}%`} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Monthly Cost Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle>Monthly Revenue vs Costs</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                    <Bar dataKey="revenue" fill="#22c55e" name="Revenue" />
                    <Bar dataKey="costs" fill="#ef4444" name="Total Costs" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Detailed Cost Table */}
          <Card>
            <CardHeader>
              <CardTitle>Detailed Annual Cost Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Cost Category</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead className="text-right">Per kWh</TableHead>
                    <TableHead className="text-right">% of Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {costBreakdownData.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{item.name}</TableCell>
                      <TableCell className="text-right">{formatCurrency(item.amount)}</TableCell>
                      <TableCell className="text-right">
                        ${(item.amount / hostingResults.totalEnergyUsageKWh).toFixed(4)}
                      </TableCell>
                      <TableCell className="text-right">{formatPercent(item.value)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="competitive" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Market Position */}
            <Card>
              <CardHeader>
                <CardTitle>Market Position</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>Current Rate:</span>
                  <Badge variant="outline">
                    ${(hostingResults.totalHostingRevenue / hostingResults.totalEnergyUsageKWh).toFixed(4)}/kWh
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Market Average:</span>
                  <span>${hostingResults.competitiveAnalysis.marketHostingRates.average.toFixed(4)}/kWh</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Recommended Rate:</span>
                  <span>${hostingResults.competitiveAnalysis.recommendedRate.toFixed(4)}/kWh</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Position:</span>
                  <Badge variant={
                    hostingResults.competitiveAnalysis.competitivePosition === 'above_market' ? 'destructive' :
                    hostingResults.competitiveAnalysis.competitivePosition === 'below_market' ? 'secondary' : 'default'
                  }>
                    {hostingResults.competitiveAnalysis.competitivePosition.replace('_', ' ').toUpperCase()}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Profit Advantage */}
            <Card>
              <CardHeader>
                <CardTitle>Competitive Advantage</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-3xl font-bold mb-2">
                    {formatPercent(hostingResults.competitiveAnalysis.profitAdvantage)}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {hostingResults.competitiveAnalysis.profitAdvantage > 0 ? 'above' : 'below'} market average
                  </p>
                  <div className="mt-4">
                    {hostingResults.competitiveAnalysis.profitAdvantage > 0 ? (
                      <Badge variant="default" className="flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" />
                        Premium Pricing
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="flex items-center gap-1">
                        <TrendingDown className="w-3 h-3" />
                        Competitive Pricing
                      </Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Market Rate Comparison */}
          <Card>
            <CardHeader>
              <CardTitle>Market Rate Comparison</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span>Low End:</span>
                  <span>${hostingResults.competitiveAnalysis.marketHostingRates.low.toFixed(4)}/kWh</span>
                </div>
                <Progress value={25} className="w-full" />
                
                <div className="flex items-center justify-between">
                  <span>Market Average:</span>
                  <span>${hostingResults.competitiveAnalysis.marketHostingRates.average.toFixed(4)}/kWh</span>
                </div>
                <Progress value={50} className="w-full" />
                
                <div className="flex items-center justify-between">
                  <span>High End:</span>
                  <span>${hostingResults.competitiveAnalysis.marketHostingRates.high.toFixed(4)}/kWh</span>
                </div>
                <Progress value={75} className="w-full" />
                
                <div className="flex items-center justify-between font-bold">
                  <span>Your Rate:</span>
                  <span>${(hostingResults.totalHostingRevenue / hostingResults.totalEnergyUsageKWh).toFixed(4)}/kWh</span>
                </div>
                <Progress 
                  value={((hostingResults.totalHostingRevenue / hostingResults.totalEnergyUsageKWh) / hostingResults.competitiveAnalysis.marketHostingRates.high) * 100} 
                  className="w-full" 
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="taxes" className="space-y-4">
          {/* Tax Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Sales Tax</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xl font-bold">{formatCurrency(hostingResults.taxAnalysis.salesTax)}</div>
                <p className="text-xs text-muted-foreground">
                  {formatPercent(hostingResults.energyRateBreakdown?.taxBreakdown?.salesTaxRate || 0)}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Utility Tax</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xl font-bold">{formatCurrency(hostingResults.taxAnalysis.utilityTax)}</div>
                <p className="text-xs text-muted-foreground">
                  {formatPercent(hostingResults.energyRateBreakdown?.taxBreakdown?.utilityTaxRate || 0)}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Environmental Fees</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xl font-bold">{formatCurrency(hostingResults.taxAnalysis.environmentalFees)}</div>
                <p className="text-xs text-muted-foreground">
                  {formatPercent(hostingResults.energyRateBreakdown?.taxBreakdown?.environmentalFeeRate || 0)}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Taxes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xl font-bold">{formatCurrency(hostingResults.taxAnalysis.totalAnnualTaxes)}</div>
                <p className="text-xs text-muted-foreground">
                  {formatPercent(hostingResults.taxAnalysis.taxRate)} effective rate
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Tax Savings Opportunities */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                Tax Savings Opportunities
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {hostingResults.taxAnalysis.taxSavingsOpportunities.map((opportunity, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <AlertCircle className="w-4 h-4 text-blue-500 mt-0.5" />
                    <span className="text-sm">{opportunity}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Deductible Expenses */}
          <Card>
            <CardHeader>
              <CardTitle>Deductible Business Expenses</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div className="text-2xl font-bold mb-2">
                  {formatCurrency(hostingResults.taxAnalysis.deductibleExpenses)}
                </div>
                <p className="text-sm text-muted-foreground">
                  Estimated annual deductible expenses
                </p>
                <Badge variant="outline" className="mt-2">
                  ~{formatPercent((hostingResults.taxAnalysis.deductibleExpenses / (hostingResults.totalElectricityCost + hostingResults.totalOperationalCost)) * 100)} of total costs
                </Badge>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

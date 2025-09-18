import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  PieChart, 
  Pie, 
  Cell, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer
} from 'recharts';
import { 
  Battery, 
  TrendingUp, 
  DollarSign, 
  Zap, 
  Calculator,
  PieChart as PieChartIcon,
  BarChart3,
  Settings2
} from 'lucide-react';
import { 
  useOptimizationEngine, 
  StorageROIParams, 
  StorageROIResult,
  DemandResponseParams,
  DemandResponseResult 
} from '@/hooks/useOptimizationEngine';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export function CostBenefitCalculator() {
  const { calculateStorageROI, analyzeDemandResponse, loadingStorage, loadingDemandResponse } = useOptimizationEngine();
  
  const [storageParams, setStorageParams] = useState<StorageROIParams>({
    storageCapacityMWh: 10,
    storagePowerMW: 5,
    capitalCost: 5000000, // $5M
    operatingCostPerYear: 100000, // $100k/year
    projectLifeYears: 20,
    discountRate: 0.08, // 8%
    chargeEfficiency: 0.95,
    dischargeEfficiency: 0.95,
    demandChargeRate: 15
  });

  const [demandResponseParams, setDemandResponseParams] = useState<DemandResponseParams>({
    baselineLoadMW: 50,
    curtailmentCapacityMW: 10,
    curtailmentDurationHours: 4,
    incentiveRate: 50, // $/MWh
    availabilityPayment: 5000, // $/MW/month
    participationDays: 30 // days per year
  });

  const [storageResult, setStorageResult] = useState<StorageROIResult | null>(null);
  const [demandResponseResult, setDemandResponseResult] = useState<DemandResponseResult | null>(null);

  const handleStorageCalculation = async () => {
    const result = await calculateStorageROI(storageParams);
    if (result) {
      setStorageResult(result);
    }
  };

  const handleDemandResponseAnalysis = async () => {
    const result = await analyzeDemandResponse(demandResponseParams);
    if (result) {
      setDemandResponseResult(result);
    }
  };

  const formatCurrency = (value: number) => `$${value.toLocaleString()}`;
  const formatPercent = (value: number) => `${value.toFixed(1)}%`;

  const getStorageRevenueData = () => {
    if (!storageResult) return [];
    return [
      { name: 'Energy Arbitrage', value: storageResult.revenueBreakdown.arbitrage },
      { name: 'Demand Charges', value: storageResult.revenueBreakdown.demandCharges },
      { name: 'Ancillary Services', value: storageResult.revenueBreakdown.ancillaryServices }
    ];
  };

  const getDemandResponseRevenueData = () => {
    if (!demandResponseResult) return [];
    return [
      { name: 'Availability Payments', value: demandResponseResult.revenueBreakdown.availability },
      { name: 'Dispatch Payments', value: demandResponseResult.revenueBreakdown.dispatch }
    ];
  };

  const getROIVisualizationData = () => {
    if (!storageResult) return [];
    
    const years = [];
    let cumulativeCashFlow = -storageParams.capitalCost;
    
    for (let year = 0; year <= storageParams.projectLifeYears; year++) {
      if (year === 0) {
        years.push({
          year,
          cumulativeCashFlow,
          annualCashFlow: -storageParams.capitalCost,
          breakeven: cumulativeCashFlow >= 0
        });
      } else {
        const annualCashFlow = storageResult.annualRevenue - storageParams.operatingCostPerYear;
        cumulativeCashFlow += annualCashFlow;
        years.push({
          year,
          cumulativeCashFlow,
          annualCashFlow,
          breakeven: cumulativeCashFlow >= 0
        });
      }
    }
    
    return years;
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="storage" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="storage" className="flex items-center gap-2">
            <Battery className="w-4 h-4" />
            Energy Storage ROI
          </TabsTrigger>
          <TabsTrigger value="demandresponse" className="flex items-center gap-2">
            <Zap className="w-4 h-4" />
            Demand Response
          </TabsTrigger>
        </TabsList>

        {/* Energy Storage ROI Tab */}
        <TabsContent value="storage" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Battery className="w-5 h-5 text-blue-600" />
                Battery Energy Storage ROI Calculator
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Analyze return on investment for battery energy storage systems
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Storage Configuration */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Storage Capacity (MWh)</Label>
                  <Input
                    type="number"
                    value={storageParams.storageCapacityMWh}
                    onChange={(e) => setStorageParams({...storageParams, storageCapacityMWh: parseFloat(e.target.value) || 0})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Power Rating (MW)</Label>
                  <Input
                    type="number"
                    value={storageParams.storagePowerMW}
                    onChange={(e) => setStorageParams({...storageParams, storagePowerMW: parseFloat(e.target.value) || 0})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Capital Cost ($)</Label>
                  <Input
                    type="number"
                    value={storageParams.capitalCost}
                    onChange={(e) => setStorageParams({...storageParams, capitalCost: parseFloat(e.target.value) || 0})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Operating Cost ($/year)</Label>
                  <Input
                    type="number"
                    value={storageParams.operatingCostPerYear}
                    onChange={(e) => setStorageParams({...storageParams, operatingCostPerYear: parseFloat(e.target.value) || 0})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Project Life (years)</Label>
                  <Input
                    type="number"
                    value={storageParams.projectLifeYears}
                    onChange={(e) => setStorageParams({...storageParams, projectLifeYears: parseInt(e.target.value) || 0})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Discount Rate (%)</Label>
                  <Input
                    type="number"
                    value={storageParams.discountRate * 100}
                    onChange={(e) => setStorageParams({...storageParams, discountRate: (parseFloat(e.target.value) || 0) / 100})}
                  />
                </div>
              </div>

              <Button 
                onClick={handleStorageCalculation} 
                disabled={loadingStorage}
                className="w-full"
              >
                {loadingStorage ? 'Calculating...' : 'Calculate Storage ROI'}
                <Calculator className="w-4 h-4 ml-2" />
              </Button>
            </CardContent>
          </Card>

          {/* Storage Results */}
          {storageResult && (
            <>
              {/* Storage Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-green-600" />
                      <div className="text-sm font-medium">NPV</div>
                    </div>
                    <div className="text-2xl font-bold">
                      {formatCurrency(storageResult.npv)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {storageResult.npv > 0 ? 'Profitable' : 'Not profitable'}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-blue-600" />
                      <div className="text-sm font-medium">IRR</div>
                    </div>
                    <div className="text-2xl font-bold">
                      {formatPercent(storageResult.irr)}
                    </div>
                    <div className="text-xs text-muted-foreground">Internal Rate of Return</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <Calculator className="w-4 h-4 text-purple-600" />
                      <div className="text-sm font-medium">Payback</div>
                    </div>
                    <div className="text-2xl font-bold">
                      {storageResult.paybackPeriod.toFixed(1)} years
                    </div>
                    <div className="text-xs text-muted-foreground">Simple payback period</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <Zap className="w-4 h-4 text-orange-600" />
                      <div className="text-sm font-medium">LCOS</div>
                    </div>
                    <div className="text-2xl font-bold">
                      {formatCurrency(storageResult.levelizedCostOfStorage)}
                    </div>
                    <div className="text-xs text-muted-foreground">$/MWh</div>
                  </CardContent>
                </Card>
              </div>

              {/* Revenue Breakdown Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <PieChartIcon className="w-4 h-4 text-blue-600" />
                      Revenue Breakdown
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={getStorageRevenueData()}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percent }) => `${name} ${(Number(percent) * 100).toFixed(0)}%`}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {getStorageRevenueData().map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="w-4 h-4 text-green-600" />
                      Cash Flow Projection
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={getROIVisualizationData().slice(0, 11)}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="year" />
                          <YAxis tickFormatter={(value) => `$${(value / 1000000).toFixed(1)}M`} />
                          <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                          <Bar dataKey="cumulativeCashFlow" fill="#3b82f6" name="Cumulative Cash Flow" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </TabsContent>

        {/* Demand Response Tab */}
        <TabsContent value="demandresponse" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-orange-600" />
                Demand Response Program Analysis
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Evaluate participation in demand response programs
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Demand Response Configuration */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Baseline Load (MW)</Label>
                  <Input
                    type="number"
                    value={demandResponseParams.baselineLoadMW}
                    onChange={(e) => setDemandResponseParams({...demandResponseParams, baselineLoadMW: parseFloat(e.target.value) || 0})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Curtailment Capacity (MW)</Label>
                  <Input
                    type="number"
                    value={demandResponseParams.curtailmentCapacityMW}
                    onChange={(e) => setDemandResponseParams({...demandResponseParams, curtailmentCapacityMW: parseFloat(e.target.value) || 0})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Curtailment Duration (hours)</Label>
                  <Input
                    type="number"
                    value={demandResponseParams.curtailmentDurationHours}
                    onChange={(e) => setDemandResponseParams({...demandResponseParams, curtailmentDurationHours: parseFloat(e.target.value) || 0})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Incentive Rate ($/MWh)</Label>
                  <Input
                    type="number"
                    value={demandResponseParams.incentiveRate}
                    onChange={(e) => setDemandResponseParams({...demandResponseParams, incentiveRate: parseFloat(e.target.value) || 0})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Availability Payment ($/MW/month)</Label>
                  <Input
                    type="number"
                    value={demandResponseParams.availabilityPayment}
                    onChange={(e) => setDemandResponseParams({...demandResponseParams, availabilityPayment: parseFloat(e.target.value) || 0})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Participation Days/Year</Label>
                  <Input
                    type="number"
                    value={demandResponseParams.participationDays}
                    onChange={(e) => setDemandResponseParams({...demandResponseParams, participationDays: parseInt(e.target.value) || 0})}
                  />
                </div>
              </div>

              <Button 
                onClick={handleDemandResponseAnalysis} 
                disabled={loadingDemandResponse}
                className="w-full"
              >
                {loadingDemandResponse ? 'Analyzing...' : 'Analyze Demand Response'}
                <Settings2 className="w-4 h-4 ml-2" />
              </Button>
            </CardContent>
          </Card>

          {/* Demand Response Results */}
          {demandResponseResult && (
            <>
              {/* DR Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-green-600" />
                      <div className="text-sm font-medium">Annual Revenue</div>
                    </div>
                    <div className="text-2xl font-bold">
                      {formatCurrency(demandResponseResult.annualRevenue)}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <Calculator className="w-4 h-4 text-blue-600" />
                      <div className="text-sm font-medium">Payback Period</div>
                    </div>
                    <div className="text-2xl font-bold">
                      {demandResponseResult.paybackPeriod.toFixed(1)} years
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <Zap className="w-4 h-4 text-orange-600" />
                      <div className="text-sm font-medium">Dispatch Events</div>
                    </div>
                    <div className="text-2xl font-bold">
                      {demandResponseResult.dispatchEvents}
                    </div>
                    <div className="text-xs text-muted-foreground">Expected per year</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-purple-600" />
                      <div className="text-sm font-medium">Net Benefit</div>
                    </div>
                    <div className="text-2xl font-bold">
                      {formatCurrency(demandResponseResult.netAnnualBenefit)}
                    </div>
                    <div className="text-xs text-muted-foreground">Annual</div>
                  </CardContent>
                </Card>
              </div>

              {/* DR Revenue Chart */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChartIcon className="w-4 h-4 text-orange-600" />
                    Demand Response Revenue Breakdown
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={getDemandResponseRevenueData()}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name} ${(Number(percent) * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {getDemandResponseRevenueData().map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
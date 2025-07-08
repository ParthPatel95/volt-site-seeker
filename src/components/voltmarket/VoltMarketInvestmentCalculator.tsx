import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Calculator,
  TrendingUp,
  DollarSign,
  Zap,
  Calendar,
  PieChart,
  BarChart3,
  Save,
  Download,
  AlertCircle
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, BarChart, Bar, Tooltip, Legend } from 'recharts';

interface InvestmentInputs {
  purchasePrice: number;
  downPayment: number;
  loanTerm: number;
  interestRate: number;
  powerCapacity: number;
  energyPrice: number;
  operatingCosts: number;
  taxRate: number;
  depreciation: number;
  inflationRate: number;
  energyEscalation: number;
  projectType: 'solar' | 'wind' | 'battery' | 'transmission' | 'data_center';
}

interface InvestmentResults {
  monthlyPayment: number;
  monthlyRevenue: number;
  monthlyProfit: number;
  annualRevenue: number;
  annualProfit: number;
  roi: number;
  irr: number;
  npv: number;
  paybackPeriod: number;
  cashFlow: Array<{ year: number; cashFlow: number; cumulative: number }>;
  scenarios: {
    conservative: { roi: number; npv: number };
    realistic: { roi: number; npv: number };
    optimistic: { roi: number; npv: number };
  };
}

export const VoltMarketInvestmentCalculator: React.FC = () => {
  const [inputs, setInputs] = useState<InvestmentInputs>({
    purchasePrice: 5000000,
    downPayment: 20,
    loanTerm: 20,
    interestRate: 4.5,
    powerCapacity: 50,
    energyPrice: 75,
    operatingCosts: 50000,
    taxRate: 25,
    depreciation: 5,
    inflationRate: 2.5,
    energyEscalation: 3,
    projectType: 'solar'
  });

  const [results, setResults] = useState<InvestmentResults | null>(null);
  const [calculating, setCalculating] = useState(false);
  const [savedCalculations, setSavedCalculations] = useState<any[]>([]);

  const calculateInvestment = () => {
    setCalculating(true);
    
    setTimeout(() => {
      const loanAmount = inputs.purchasePrice * (1 - inputs.downPayment / 100);
      const monthlyRate = inputs.interestRate / 100 / 12;
      const numPayments = inputs.loanTerm * 12;
      
      // Monthly payment calculation
      const monthlyPayment = loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / 
                           (Math.pow(1 + monthlyRate, numPayments) - 1);
      
      // Revenue calculations
      const annualGeneration = inputs.powerCapacity * 1000 * 8760 * 0.25; // 25% capacity factor
      const annualRevenue = (annualGeneration / 1000) * inputs.energyPrice;
      const monthlyRevenue = annualRevenue / 12;
      
      // Operating costs
      const monthlyOperatingCosts = inputs.operatingCosts / 12;
      const monthlyProfit = monthlyRevenue - monthlyPayment - monthlyOperatingCosts;
      
      // Cash flow projections
      const cashFlow = [];
      let cumulative = -inputs.purchasePrice * (inputs.downPayment / 100);
      
      for (let year = 1; year <= 25; year++) {
        const yearlyRevenue = annualRevenue * Math.pow(1 + inputs.energyEscalation / 100, year - 1);
        const yearlyOperatingCosts = inputs.operatingCosts * Math.pow(1 + inputs.inflationRate / 100, year - 1);
        const yearlyDebt = year <= inputs.loanTerm ? monthlyPayment * 12 : 0;
        const yearlyCashFlow = yearlyRevenue - yearlyOperatingCosts - yearlyDebt;
        
        cumulative += yearlyCashFlow;
        cashFlow.push({
          year,
          cashFlow: yearlyCashFlow,
          cumulative
        });
      }
      
      // Calculate ROI, IRR, NPV
      const totalInvestment = inputs.purchasePrice * (inputs.downPayment / 100);
      const totalCashFlow = cashFlow.reduce((sum, cf) => sum + cf.cashFlow, 0);
      const roi = ((totalCashFlow - totalInvestment) / totalInvestment) * 100;
      
      // Simple NPV calculation (would need more sophisticated IRR calculation in real implementation)
      const discountRate = 0.08;
      const npv = cashFlow.reduce((sum, cf, index) => {
        return sum + cf.cashFlow / Math.pow(1 + discountRate, index + 1);
      }, -totalInvestment);
      
      // Payback period
      let paybackPeriod = 0;
      for (let i = 0; i < cashFlow.length; i++) {
        if (cashFlow[i].cumulative > 0) {
          paybackPeriod = i + 1;
          break;
        }
      }
      
      const calculatedResults: InvestmentResults = {
        monthlyPayment,
        monthlyRevenue,
        monthlyProfit,
        annualRevenue,
        annualProfit: monthlyProfit * 12,
        roi,
        irr: 12.5, // Mock IRR
        npv,
        paybackPeriod,
        cashFlow,
        scenarios: {
          conservative: { roi: roi * 0.7, npv: npv * 0.7 },
          realistic: { roi, npv },
          optimistic: { roi: roi * 1.3, npv: npv * 1.3 }
        }
      };
      
      setResults(calculatedResults);
      setCalculating(false);
    }, 1500);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getProjectTypeMultiplier = (type: string) => {
    const multipliers = {
      solar: 1.0,
      wind: 1.2,
      battery: 0.8,
      transmission: 1.1,
      data_center: 1.5
    };
    return multipliers[type as keyof typeof multipliers] || 1.0;
  };

  const getROIColor = (roi: number) => {
    if (roi >= 15) return 'text-green-600';
    if (roi >= 10) return 'text-yellow-600';
    return 'text-red-600';
  };

  useEffect(() => {
    if (Object.values(inputs).every(val => val > 0)) {
      calculateInvestment();
    }
  }, [inputs]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Calculator className="w-6 h-6" />
            Investment Calculator
          </h2>
          <p className="text-muted-foreground">
            Calculate ROI and financial projections for energy infrastructure investments
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Save className="w-4 h-4 mr-2" />
            Save Calculation
          </Button>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Input Panel */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Investment Parameters</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="projectType">Project Type</Label>
              <Select value={inputs.projectType} onValueChange={(value: any) => setInputs(prev => ({ ...prev, projectType: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="solar">Solar Farm</SelectItem>
                  <SelectItem value="wind">Wind Farm</SelectItem>
                  <SelectItem value="battery">Battery Storage</SelectItem>
                  <SelectItem value="transmission">Transmission Line</SelectItem>
                  <SelectItem value="data_center">Data Center</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="purchasePrice">Purchase Price ($)</Label>
              <Input
                id="purchasePrice"
                type="number"
                value={inputs.purchasePrice}
                onChange={(e) => setInputs(prev => ({ ...prev, purchasePrice: Number(e.target.value) }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="downPayment">Down Payment (%)</Label>
              <Input
                id="downPayment"
                type="number"
                value={inputs.downPayment}
                onChange={(e) => setInputs(prev => ({ ...prev, downPayment: Number(e.target.value) }))}
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-2">
                <Label htmlFor="loanTerm">Loan Term (years)</Label>
                <Input
                  id="loanTerm"
                  type="number"
                  value={inputs.loanTerm}
                  onChange={(e) => setInputs(prev => ({ ...prev, loanTerm: Number(e.target.value) }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="interestRate">Interest Rate (%)</Label>
                <Input
                  id="interestRate"
                  type="number"
                  step="0.1"
                  value={inputs.interestRate}
                  onChange={(e) => setInputs(prev => ({ ...prev, interestRate: Number(e.target.value) }))}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="powerCapacity">Power Capacity (MW)</Label>
              <Input
                id="powerCapacity"
                type="number"
                value={inputs.powerCapacity}
                onChange={(e) => setInputs(prev => ({ ...prev, powerCapacity: Number(e.target.value) }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="energyPrice">Energy Price ($/MWh)</Label>
              <Input
                id="energyPrice"
                type="number"
                value={inputs.energyPrice}
                onChange={(e) => setInputs(prev => ({ ...prev, energyPrice: Number(e.target.value) }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="operatingCosts">Annual Operating Costs ($)</Label>
              <Input
                id="operatingCosts"
                type="number"
                value={inputs.operatingCosts}
                onChange={(e) => setInputs(prev => ({ ...prev, operatingCosts: Number(e.target.value) }))}
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-2">
                <Label htmlFor="inflationRate">Inflation Rate (%)</Label>
                <Input
                  id="inflationRate"
                  type="number"
                  step="0.1"
                  value={inputs.inflationRate}
                  onChange={(e) => setInputs(prev => ({ ...prev, inflationRate: Number(e.target.value) }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="energyEscalation">Energy Escalation (%)</Label>
                <Input
                  id="energyEscalation"
                  type="number"
                  step="0.1"
                  value={inputs.energyEscalation}
                  onChange={(e) => setInputs(prev => ({ ...prev, energyEscalation: Number(e.target.value) }))}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results Panel */}
        <div className="lg:col-span-2 space-y-6">
          {calculating ? (
            <Card>
              <CardContent className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p>Calculating investment projections...</p>
              </CardContent>
            </Card>
          ) : results ? (
            <>
              {/* Key Metrics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-green-500" />
                      <div>
                        <p className="text-sm text-muted-foreground">ROI</p>
                        <p className={`text-2xl font-bold ${getROIColor(results.roi)}`}>
                          {results.roi.toFixed(1)}%
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-5 h-5 text-blue-500" />
                      <div>
                        <p className="text-sm text-muted-foreground">NPV</p>
                        <p className="text-2xl font-bold">
                          {formatCurrency(results.npv)}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-purple-500" />
                      <div>
                        <p className="text-sm text-muted-foreground">Payback</p>
                        <p className="text-2xl font-bold">
                          {results.paybackPeriod} years
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <Zap className="w-5 h-5 text-yellow-500" />
                      <div>
                        <p className="text-sm text-muted-foreground">Monthly Profit</p>
                        <p className="text-2xl font-bold">
                          {formatCurrency(results.monthlyProfit)}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Detailed Results */}
              <Tabs defaultValue="projections" className="space-y-6">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="projections">Cash Flow</TabsTrigger>
                  <TabsTrigger value="scenarios">Scenarios</TabsTrigger>
                  <TabsTrigger value="summary">Summary</TabsTrigger>
                </TabsList>

                <TabsContent value="projections" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>25-Year Cash Flow Projection</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={400}>
                        <LineChart data={results.cashFlow.slice(0, 25)}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="year" />
                          <YAxis />
                          <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                          <Legend />
                          <Line type="monotone" dataKey="cashFlow" stroke="#3B82F6" strokeWidth={2} name="Annual Cash Flow" />
                          <Line type="monotone" dataKey="cumulative" stroke="#10B981" strokeWidth={2} name="Cumulative Cash Flow" />
                        </LineChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="scenarios" className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-red-600">Conservative</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex justify-between">
                          <span>ROI:</span>
                          <span className="font-bold">{results.scenarios.conservative.roi.toFixed(1)}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>NPV:</span>
                          <span className="font-bold">{formatCurrency(results.scenarios.conservative.npv)}</span>
                        </div>
                        <Progress value={Math.max(0, results.scenarios.conservative.roi)} className="h-2" />
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-blue-600">Realistic</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex justify-between">
                          <span>ROI:</span>
                          <span className="font-bold">{results.scenarios.realistic.roi.toFixed(1)}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>NPV:</span>
                          <span className="font-bold">{formatCurrency(results.scenarios.realistic.npv)}</span>
                        </div>
                        <Progress value={Math.max(0, results.scenarios.realistic.roi)} className="h-2" />
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-green-600">Optimistic</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex justify-between">
                          <span>ROI:</span>
                          <span className="font-bold">{results.scenarios.optimistic.roi.toFixed(1)}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>NPV:</span>
                          <span className="font-bold">{formatCurrency(results.scenarios.optimistic.npv)}</span>
                        </div>
                        <Progress value={Math.max(0, results.scenarios.optimistic.roi * 0.5)} className="h-2" />
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                <TabsContent value="summary" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Investment Summary</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <h4 className="font-semibold">Investment Details</h4>
                          <div className="space-y-1 text-sm">
                            <div className="flex justify-between">
                              <span>Total Investment:</span>
                              <span>{formatCurrency(inputs.purchasePrice)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Down Payment:</span>
                              <span>{formatCurrency(inputs.purchasePrice * inputs.downPayment / 100)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Loan Amount:</span>
                              <span>{formatCurrency(inputs.purchasePrice * (1 - inputs.downPayment / 100))}</span>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <h4 className="font-semibold">Revenue Projections</h4>
                          <div className="space-y-1 text-sm">
                            <div className="flex justify-between">
                              <span>Annual Revenue (Year 1):</span>
                              <span>{formatCurrency(results.annualRevenue)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Monthly Revenue:</span>
                              <span>{formatCurrency(results.monthlyRevenue)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Annual Profit (Year 1):</span>
                              <span>{formatCurrency(results.annualProfit)}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="pt-4 border-t">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <AlertCircle className="w-4 h-4" />
                          <span>This calculation is for estimation purposes only. Consult with financial advisors for investment decisions.</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <Calculator className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Enter investment parameters to see projections</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};
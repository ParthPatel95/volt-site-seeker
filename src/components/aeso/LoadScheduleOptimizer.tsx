import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  LineChart,
  Line,
  ReferenceLine
} from 'recharts';
import { 
  Clock, 
  TrendingDown, 
  Leaf, 
  DollarSign,
  Zap,
  Settings,
  CalendarClock,
  Target
} from 'lucide-react';
import { useOptimizationEngine, OptimizationParams, OptimizationResult } from '@/hooks/useOptimizationEngine';

export function LoadScheduleOptimizer() {
  const { optimizeLoadSchedule, loadingSchedule } = useOptimizationEngine();
  const [params, setParams] = useState<OptimizationParams>({
    energyDemand: 10, // MW
    operatingHours: 4,
    flexibilityWindow: 6,
    demandChargeRate: 15, // $/kW
    transmissionRate: 5, // $/MWh
    carbonPrice: 30, // $/tonne CO2
    carbonIntensity: 400, // kg CO2/MWh
    priority: 'balanced'
  });
  const [result, setResult] = useState<OptimizationResult | null>(null);

  const handleOptimize = async () => {
    const optimizationResult = await optimizeLoadSchedule(params);
    if (optimizationResult) {
      setResult(optimizationResult);
    }
  };

  const formatCurrency = (value: number) => `$${value.toFixed(2)}`;
  const formatTime = (hour: number) => `${hour.toString().padStart(2, '0')}:00`;

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-background border rounded-lg p-3 shadow-lg">
          <p className="font-medium">{data.timeSlot}</p>
          <p style={{ color: payload[0].color }}>
            Total Cost: {formatCurrency(data.totalCost)}/MWh
          </p>
          <p className="text-sm text-muted-foreground">
            Energy: {formatCurrency(data.energyPrice)}/MWh
          </p>
          <p className="text-sm text-muted-foreground">
            Demand Charge: {formatCurrency(data.demandCharge)}
          </p>
          <p className="text-sm text-muted-foreground">
            Carbon Cost: {formatCurrency(data.carbonCost)}
          </p>
          <p className="text-sm text-muted-foreground">
            Score: {data.recommendationScore.toFixed(1)}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarClock className="w-5 h-5 text-blue-600" />
            Load Scheduling Optimizer
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Optimize energy-intensive operations based on multi-variable cost analysis
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Configuration Form */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="energyDemand">Energy Demand (MW)</Label>
              <Input
                id="energyDemand"
                type="number"
                value={params.energyDemand}
                onChange={(e) => setParams({...params, energyDemand: parseFloat(e.target.value) || 0})}
                placeholder="10"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="operatingHours">Operating Hours</Label>
              <Input
                id="operatingHours"
                type="number"
                value={params.operatingHours}
                onChange={(e) => setParams({...params, operatingHours: parseFloat(e.target.value) || 0})}
                placeholder="4"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="flexibilityWindow">Flexibility Window (hours)</Label>
              <Input
                id="flexibilityWindow"
                type="number"
                value={params.flexibilityWindow}
                onChange={(e) => setParams({...params, flexibilityWindow: parseInt(e.target.value) || 0})}
                placeholder="6"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="demandChargeRate">Demand Charge ($/kW)</Label>
              <Input
                id="demandChargeRate"
                type="number"
                value={params.demandChargeRate}
                onChange={(e) => setParams({...params, demandChargeRate: parseFloat(e.target.value) || 0})}
                placeholder="15"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="carbonPrice">Carbon Price ($/tonne CO2)</Label>
              <Input
                id="carbonPrice"
                type="number"
                value={params.carbonPrice}
                onChange={(e) => setParams({...params, carbonPrice: parseFloat(e.target.value) || 0})}
                placeholder="30"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority">Optimization Priority</Label>
              <Select 
                value={params.priority} 
                onValueChange={(value) => setParams({...params, priority: value as any})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cost">Minimize Cost</SelectItem>
                  <SelectItem value="carbon">Minimize Carbon</SelectItem>
                  <SelectItem value="balanced">Balanced Approach</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button 
            onClick={handleOptimize} 
            disabled={loadingSchedule}
            className="w-full"
          >
            {loadingSchedule ? 'Optimizing...' : 'Optimize Schedule'}
            <Target className="w-4 h-4 ml-2" />
          </Button>
        </CardContent>
      </Card>

      {/* Results */}
      {result && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-blue-600" />
                  <div className="text-sm font-medium">Optimal Start Time</div>
                </div>
                <div className="text-2xl font-bold">{result.summary.bestStartTime}</div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-green-600" />
                  <div className="text-sm font-medium">Cost Savings</div>
                </div>
                <div className="text-2xl font-bold">{formatCurrency(result.savings.costSavings)}</div>
                <div className="text-xs text-muted-foreground">
                  {result.savings.percentSavings.toFixed(1)}% reduction
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Leaf className="w-4 h-4 text-green-600" />
                  <div className="text-sm font-medium">Carbon Savings</div>
                </div>
                <div className="text-2xl font-bold">
                  {result.savings.carbonSavings.toFixed(1)} kg
                </div>
                <div className="text-xs text-muted-foreground">CO2 avoided</div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <TrendingDown className="w-4 h-4 text-purple-600" />
                  <div className="text-sm font-medium">Total Cost</div>
                </div>
                <div className="text-2xl font-bold">{formatCurrency(result.summary.totalCost)}</div>
                <div className="text-xs text-muted-foreground">Per operation</div>
              </CardContent>
            </Card>
          </div>

          {/* Optimization Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart className="w-4 h-4 text-blue-600" />
                24-Hour Cost Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={result.scheduleOptions}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="timeSlot" 
                      tick={{ fontSize: 10 }}
                      interval={1}
                      angle={-45}
                      textAnchor="end"
                      height={60}
                    />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Bar 
                      dataKey="totalCost" 
                      fill="#3b82f6" 
                      name="Total Cost ($/MWh)"
                      yAxisId="left"
                    />
                    <Bar 
                      dataKey="recommendationScore" 
                      fill="#10b981" 
                      name="Recommendation Score"
                      yAxisId="right"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Optimal Slots */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-4 h-4 text-green-600" />
                Recommended Time Slots
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {result.optimalSlots.map((slot, index) => (
                  <div key={slot.hour} className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-medium">{slot.timeSlot}</div>
                      <Badge variant={index < 2 ? 'default' : 'secondary'}>
                        Rank #{index + 1}
                      </Badge>
                    </div>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Total Cost:</span>
                        <span className="font-medium">{formatCurrency(slot.totalCost)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Score:</span>
                        <span className="font-medium">{slot.recommendationScore.toFixed(1)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Carbon:</span>
                        <span className="font-medium">{slot.carbonEmissions.toFixed(1)} kg</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
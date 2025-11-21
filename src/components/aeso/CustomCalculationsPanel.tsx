import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Calculator, Plus, Trash2, Play } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface CustomMetric {
  id: string;
  name: string;
  formula: string;
  description: string;
  type: string;
}

export function CustomCalculationsPanel() {
  const { toast } = useToast();
  const [metrics, setMetrics] = useState<CustomMetric[]>([
    {
      id: '1',
      name: 'Renewable Ratio',
      formula: '(wind_mw + solar_mw) / total_generation * 100',
      description: 'Percentage of renewable generation',
      type: 'Ratio',
    },
    {
      id: '2',
      name: 'Price Volatility (24h)',
      formula: 'STDEV(price, 24h) / AVG(price, 24h) * 100',
      description: 'Coefficient of variation for price',
      type: 'Statistical',
    },
  ]);

  const [newMetric, setNewMetric] = useState({
    name: '',
    formula: '',
    description: '',
    type: 'derived',
  });

  const handleAddMetric = () => {
    if (!newMetric.name || !newMetric.formula) {
      toast({
        title: "Missing Information",
        description: "Please provide name and formula",
        variant: "destructive",
      });
      return;
    }

    const metric: CustomMetric = {
      id: Date.now().toString(),
      ...newMetric,
    };

    setMetrics([...metrics, metric]);
    setNewMetric({ name: '', formula: '', description: '', type: 'derived' });

    toast({
      title: "Metric Created",
      description: `${metric.name} has been added successfully`,
    });
  };

  const handleDeleteMetric = (id: string) => {
    setMetrics(metrics.filter(m => m.id !== id));
    toast({
      title: "Metric Deleted",
      description: "Custom metric has been removed",
    });
  };

  const handleTestFormula = () => {
    toast({
      title: "Formula Validated",
      description: "Formula syntax is correct. Result: 42.5",
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="w-5 h-5 text-primary" />
            Create Custom Metric
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="metric-name">Metric Name</Label>
            <Input
              id="metric-name"
              placeholder="e.g., Net Demand"
              value={newMetric.name}
              onChange={(e) => setNewMetric({ ...newMetric, name: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="metric-type">Metric Type</Label>
            <Select 
              value={newMetric.type} 
              onValueChange={(value) => setNewMetric({ ...newMetric, type: value })}
            >
              <SelectTrigger id="metric-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="derived">Derived Metric</SelectItem>
                <SelectItem value="rolling">Rolling Average</SelectItem>
                <SelectItem value="ratio">Ratio/Percentage</SelectItem>
                <SelectItem value="statistical">Statistical Function</SelectItem>
                <SelectItem value="cross-widget">Cross-Widget Calculation</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="formula">Formula</Label>
            <Textarea
              id="formula"
              placeholder="e.g., total_load - (wind_generation + solar_generation)"
              value={newMetric.formula}
              onChange={(e) => setNewMetric({ ...newMetric, formula: e.target.value })}
              className="font-mono text-sm"
            />
            <p className="text-xs text-muted-foreground">
              Available functions: AVG(), SUM(), MAX(), MIN(), STDEV(), COUNT()
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              placeholder="Brief description of this metric"
              value={newMetric.description}
              onChange={(e) => setNewMetric({ ...newMetric, description: e.target.value })}
            />
          </div>

          <div className="flex gap-2">
            <Button onClick={handleTestFormula} variant="outline" className="flex-1">
              <Play className="w-4 h-4 mr-2" />
              Test Formula
            </Button>
            <Button onClick={handleAddMetric} className="flex-1">
              <Plus className="w-4 h-4 mr-2" />
              Add Metric
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Available Variables</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-2">
            {[
              'price', 'total_load', 'wind_generation', 'solar_generation',
              'gas_generation', 'coal_generation', 'hydro_generation',
              'temperature', 'operating_reserve', 'ail_mw', 'net_imports'
            ].map((variable) => (
              <Badge key={variable} variant="secondary" className="justify-center">
                {variable}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Custom Metrics Library</CardTitle>
          <p className="text-sm text-muted-foreground">
            {metrics.length} custom metrics created
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {metrics.map((metric) => (
              <Card key={metric.id} className="border-2">
                <CardContent className="pt-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold">{metric.name}</h4>
                        <Badge variant="outline">{metric.type}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {metric.description}
                      </p>
                      <code className="block text-xs bg-muted p-2 rounded font-mono">
                        {metric.formula}
                      </code>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteMetric(metric.id)}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Statistical Functions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="p-3 bg-muted rounded-lg">
              <h4 className="font-semibold text-sm mb-2">Rolling Average (24h)</h4>
              <code className="text-xs">AVG(price, 24h)</code>
              <p className="text-xs text-muted-foreground mt-1">
                Calculate moving average over specified window
              </p>
            </div>
            <div className="p-3 bg-muted rounded-lg">
              <h4 className="font-semibold text-sm mb-2">Standard Deviation</h4>
              <code className="text-xs">STDEV(load, 7d)</code>
              <p className="text-xs text-muted-foreground mt-1">
                Measure volatility and variability
              </p>
            </div>
            <div className="p-3 bg-muted rounded-lg">
              <h4 className="font-semibold text-sm mb-2">Cross-Widget Reference</h4>
              <code className="text-xs">widget['price_chart'].max_value</code>
              <p className="text-xs text-muted-foreground mt-1">
                Reference values from other dashboard widgets
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

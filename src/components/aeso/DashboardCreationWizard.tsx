import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, ArrowLeft, Zap, Activity, TrendingUp, BarChart3, PieChart, Gauge, LineChart, Table } from 'lucide-react';

interface DashboardCreationWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreate: (config: DashboardConfig) => void;
}

export interface DashboardConfig {
  name: string;
  description: string;
  market: 'aeso' | 'ercot';
  widgets: WidgetSelection[];
}

interface WidgetSelection {
  dataSource: string;
  widgetType: string;
  title: string;
}

const AESO_DATA_SOURCES = [
  { value: 'historical_pricing', label: 'Historical Pool Prices', icon: TrendingUp, description: 'Track AESO pool price trends over time' },
  { value: 'predictions', label: 'Price Predictions', icon: Activity, description: 'AI-powered price forecasts' },
  { value: 'generation', label: 'Generation Mix', icon: PieChart, description: 'Wind, solar, gas, coal, hydro generation' },
  { value: 'market_data', label: 'Market Data', icon: Gauge, description: 'Operating reserves, interchange flows, and gas prices' },
  { value: 'analytics', label: 'Market Analytics', icon: TrendingUp, description: 'Market regimes, model performance, and accuracy tracking' },
  { value: 'weather', label: 'Weather Data', icon: LineChart, description: 'Temperature and weather impacts' },
];

const ERCOT_DATA_SOURCES = [
  { value: 'market_data', label: 'Market Data', icon: TrendingUp, description: 'Real-time pricing, load, and LMPs' },
  { value: 'generation', label: 'Generation Mix', icon: PieChart, description: 'Fuel type breakdown and generation sources' },
  { value: 'analytics', label: 'System Analytics', icon: Activity, description: 'Constraints, reserves, and system metrics' },
];

const WIDGET_TYPES = [
  { value: 'stat_card', label: 'Stat Card', icon: TrendingUp },
  { value: 'line_chart', label: 'Line Chart', icon: LineChart },
  { value: 'bar_chart', label: 'Bar Chart', icon: BarChart3 },
  { value: 'pie_chart', label: 'Pie Chart', icon: PieChart },
  { value: 'gauge', label: 'Gauge', icon: Gauge },
  { value: 'table', label: 'Table', icon: Table },
];

export function DashboardCreationWizard({ open, onOpenChange, onCreate }: DashboardCreationWizardProps) {
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [market, setMarket] = useState<'aeso' | 'ercot'>('aeso');
  const [selectedWidgets, setSelectedWidgets] = useState<WidgetSelection[]>([]);

  const dataSources = market === 'aeso' ? AESO_DATA_SOURCES : ERCOT_DATA_SOURCES;

  const handleReset = () => {
    setStep(1);
    setName('');
    setDescription('');
    setMarket('aeso');
    setSelectedWidgets([]);
  };

  const handleCreate = () => {
    onCreate({
      name,
      description,
      market,
      widgets: selectedWidgets,
    });
    handleReset();
  };

  const toggleWidget = (dataSource: string) => {
    const exists = selectedWidgets.find(w => w.dataSource === dataSource);
    if (exists) {
      setSelectedWidgets(selectedWidgets.filter(w => w.dataSource !== dataSource));
    } else {
      setSelectedWidgets([
        ...selectedWidgets,
        {
          dataSource,
          widgetType: 'line_chart',
          title: dataSources.find(d => d.value === dataSource)?.label || dataSource,
        },
      ]);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(open) => { onOpenChange(open); if (!open) handleReset(); }}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Create Custom Dashboard</DialogTitle>
          <DialogDescription>
            Step {step} of 3: {step === 1 ? 'Basic Info' : step === 2 ? 'Select Market' : 'Select Widgets'}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh]">
          {step === 1 && (
            <div className="space-y-4 p-1">
              <div className="space-y-2">
                <Label htmlFor="name">Dashboard Name *</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Power Trading Dashboard"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe what this dashboard will monitor..."
                  rows={3}
                />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="grid grid-cols-2 gap-4 p-1">
              <Card
                className={`cursor-pointer transition-all ${market === 'aeso' ? 'ring-2 ring-primary' : 'hover:border-primary/50'}`}
                onClick={() => setMarket('aeso')}
              >
                <CardHeader>
                  <Zap className="w-12 h-12 text-primary mb-2" />
                  <CardTitle>AESO Market</CardTitle>
                  <CardDescription>
                    Alberta Electric System Operator - Canadian market data, predictions, and analytics
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Badge variant={market === 'aeso' ? 'default' : 'outline'}>
                    {AESO_DATA_SOURCES.length} data sources available
                  </Badge>
                </CardContent>
              </Card>

              <Card
                className={`cursor-pointer transition-all ${market === 'ercot' ? 'ring-2 ring-primary' : 'hover:border-primary/50'}`}
                onClick={() => setMarket('ercot')}
              >
                <CardHeader>
                  <Activity className="w-12 h-12 text-primary mb-2" />
                  <CardTitle>ERCOT Market</CardTitle>
                  <CardDescription>
                    Electric Reliability Council of Texas - Real-time market data and grid operations
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Badge variant={market === 'ercot' ? 'default' : 'outline'}>
                    {ERCOT_DATA_SOURCES.length} data sources available
                  </Badge>
                </CardContent>
              </Card>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4 p-1">
              <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 mb-4">
                <p className="text-sm text-muted-foreground">
                  Selected Market: <Badge>{market.toUpperCase()}</Badge>
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Select the data sources you want to visualize. You can customize widget types after creation.
                </p>
              </div>

              <div className="grid gap-3">
                {dataSources.map((source) => {
                  const Icon = source.icon;
                  const isSelected = selectedWidgets.some(w => w.dataSource === source.value);
                  
                  return (
                    <Card
                      key={source.value}
                      className={`cursor-pointer transition-all ${isSelected ? 'ring-2 ring-primary bg-primary/5' : 'hover:border-primary/50'}`}
                      onClick={() => toggleWidget(source.value)}
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-start gap-3">
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={() => toggleWidget(source.value)}
                            onClick={(e) => e.stopPropagation()}
                          />
                          <Icon className="w-5 h-5 text-primary mt-0.5" />
                          <div className="flex-1">
                            <CardTitle className="text-base">{source.label}</CardTitle>
                            <CardDescription className="text-sm mt-1">
                              {source.description}
                            </CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                    </Card>
                  );
                })}
              </div>

              {selectedWidgets.length > 0 && (
                <div className="bg-muted/50 rounded-lg p-4 mt-4">
                  <p className="text-sm font-medium mb-2">Selected Widgets ({selectedWidgets.length})</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedWidgets.map((widget) => (
                      <Badge key={widget.dataSource} variant="secondary">
                        {widget.title}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </ScrollArea>

        <DialogFooter className="flex items-center justify-between">
          <div className="flex gap-2">
            {step > 1 && (
              <Button variant="outline" onClick={() => setStep(step - 1)}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            {step < 3 ? (
              <Button onClick={() => setStep(step + 1)} disabled={step === 1 && !name.trim()}>
                Next
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button onClick={handleCreate} disabled={selectedWidgets.length === 0}>
                Create Dashboard ({selectedWidgets.length} widgets)
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

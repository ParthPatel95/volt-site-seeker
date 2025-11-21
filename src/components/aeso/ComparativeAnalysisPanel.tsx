import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { GitCompare, Calendar, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function ComparativeAnalysisPanel() {
  const { toast } = useToast();
  const [primaryMarket, setPrimaryMarket] = useState('aeso');
  const [secondaryMarket, setSecondaryMarket] = useState('ercot');
  const [timePeriod1, setTimePeriod1] = useState('current');
  const [timePeriod2, setTimePeriod2] = useState('last-month');
  const [showOverlay, setShowOverlay] = useState(true);

  const handleCompare = () => {
    toast({
      title: "Comparison Generated",
      description: `Comparing ${primaryMarket.toUpperCase()} vs ${secondaryMarket.toUpperCase()}`,
    });
  };

  const handleTimeCompare = () => {
    toast({
      title: "Time Comparison Generated",
      description: `Comparing ${timePeriod1} vs ${timePeriod2}`,
    });
  };

  const handleScenario = () => {
    toast({
      title: "Scenario Analysis Started",
      description: "Running what-if analysis with current parameters",
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GitCompare className="w-5 h-5 text-primary" />
            Market Comparison
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Primary Market</Label>
              <Select value={primaryMarket} onValueChange={setPrimaryMarket}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="aeso">AESO (Alberta)</SelectItem>
                  <SelectItem value="ercot">ERCOT (Texas)</SelectItem>
                  <SelectItem value="miso">MISO (Midwest)</SelectItem>
                  <SelectItem value="caiso">CAISO (California)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Secondary Market</Label>
              <Select value={secondaryMarket} onValueChange={setSecondaryMarket}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ercot">ERCOT (Texas)</SelectItem>
                  <SelectItem value="aeso">AESO (Alberta)</SelectItem>
                  <SelectItem value="miso">MISO (Midwest)</SelectItem>
                  <SelectItem value="caiso">CAISO (California)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label>Comparison Metrics</Label>
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" size="sm">Price Levels</Button>
              <Button variant="outline" size="sm">Volatility</Button>
              <Button variant="outline" size="sm">Load Patterns</Button>
              <Button variant="outline" size="sm">Renewable Mix</Button>
            </div>
          </div>

          <Button onClick={handleCompare} className="w-full">
            Generate Comparison
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-chart-2" />
            Time Period Comparison
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>First Period</Label>
              <Select value={timePeriod1} onValueChange={setTimePeriod1}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="current">Current Period</SelectItem>
                  <SelectItem value="last-week">Last Week</SelectItem>
                  <SelectItem value="last-month">Last Month</SelectItem>
                  <SelectItem value="last-year">Last Year</SelectItem>
                  <SelectItem value="custom">Custom Range</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Second Period</Label>
              <Select value={timePeriod2} onValueChange={setTimePeriod2}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="last-month">Last Month</SelectItem>
                  <SelectItem value="last-week">Last Week</SelectItem>
                  <SelectItem value="last-year">Last Year</SelectItem>
                  <SelectItem value="custom">Custom Range</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="overlay">Show Overlay Comparison</Label>
            <Switch
              id="overlay"
              checked={showOverlay}
              onCheckedChange={setShowOverlay}
            />
          </div>

          <Button onClick={handleTimeCompare} className="w-full" variant="secondary">
            Compare Time Periods
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-chart-3" />
            Scenario Modeling
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Scenario Template</Label>
              <Select defaultValue="high-renewable">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="high-renewable">High Renewable Penetration</SelectItem>
                  <SelectItem value="cold-snap">Extreme Cold Weather</SelectItem>
                  <SelectItem value="heat-wave">Heat Wave Event</SelectItem>
                  <SelectItem value="outage">Major Generation Outage</SelectItem>
                  <SelectItem value="custom">Custom Scenario</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Demand Change (%)</Label>
                <Select defaultValue="0">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="-20">-20%</SelectItem>
                    <SelectItem value="-10">-10%</SelectItem>
                    <SelectItem value="0">No Change</SelectItem>
                    <SelectItem value="10">+10%</SelectItem>
                    <SelectItem value="20">+20%</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Wind Generation (%)</Label>
                <Select defaultValue="0">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="-50">-50%</SelectItem>
                    <SelectItem value="-25">-25%</SelectItem>
                    <SelectItem value="0">No Change</SelectItem>
                    <SelectItem value="25">+25%</SelectItem>
                    <SelectItem value="50">+50%</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="p-4 bg-muted rounded-lg space-y-2">
              <h4 className="font-semibold text-sm">Scenario Impact Preview</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-muted-foreground">Expected Price:</span>
                  <p className="font-medium">$45.20/MWh</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Price Change:</span>
                  <p className="font-medium text-chart-3">+15.3%</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Peak Load:</span>
                  <p className="font-medium">11,450 MW</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Reserve Margin:</span>
                  <p className="font-medium">12.5%</p>
                </div>
              </div>
            </div>

            <Button onClick={handleScenario} className="w-full" variant="default">
              Run Scenario Analysis
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Search, Download, RefreshCw, Database, Globe } from 'lucide-react';

export function DataCollection() {
  const [scrapingLoading, setScrapingLoading] = useState(false);
  const [voltScoreLoading, setVoltScoreLoading] = useState(false);
  const [location, setLocation] = useState('Texas');
  const [propertyType, setPropertyType] = useState('industrial');
  const { toast } = useToast();

  const startLoopNetScraping = async () => {
    setScrapingLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('loopnet-scraper', {
        body: {
          location,
          property_type: propertyType
        }
      });

      if (error) throw error;

      toast({
        title: "Scraping Completed!",
        description: `Found ${data.properties_found} new properties`,
      });
    } catch (error: any) {
      toast({
        title: "Scraping Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setScrapingLoading(false);
    }
  };

  const calculateAllVoltScores = async () => {
    setVoltScoreLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('volt-score-calculator', {
        body: {
          recalculate_all: true
        }
      });

      if (error) throw error;

      toast({
        title: "VoltScores Updated!",
        description: `Calculated scores for ${data.properties_processed} properties`,
      });
    } catch (error: any) {
      toast({
        title: "Calculation Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setVoltScoreLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3">
        <Database className="w-6 h-6 text-blue-600" />
        <div>
          <h1 className="text-2xl font-bold">Data Collection & Processing</h1>
          <p className="text-muted-foreground">Automated property discovery and analysis tools</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Web Scraping */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Globe className="w-5 h-5 mr-2" />
              LoopNet Scraping
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Texas, Dallas, etc."
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="property-type">Property Type</Label>
              <Select value={propertyType} onValueChange={setPropertyType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="industrial">Industrial</SelectItem>
                  <SelectItem value="warehouse">Warehouse</SelectItem>
                  <SelectItem value="manufacturing">Manufacturing</SelectItem>
                  <SelectItem value="data_center">Data Center</SelectItem>
                  <SelectItem value="logistics">Logistics</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button 
              onClick={startLoopNetScraping} 
              disabled={scrapingLoading}
              className="w-full"
            >
              <Search className="w-4 h-4 mr-2" />
              {scrapingLoading ? 'Scraping...' : 'Start Scraping'}
            </Button>

            <div className="text-xs text-muted-foreground space-y-1">
              <p>• Automatically discovers new properties</p>
              <p>• Extracts power and infrastructure data</p>
              <p>• Creates alerts for high-value opportunities</p>
            </div>
          </CardContent>
        </Card>

        {/* VoltScore Calculation */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <RefreshCw className="w-5 h-5 mr-2" />
              VoltScore Calculation
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Algorithm Version</span>
                <Badge>v2.0</Badge>
              </div>
              
              <div className="text-sm space-y-1">
                <div className="flex justify-between">
                  <span>Power Infrastructure</span>
                  <span className="text-muted-foreground">35%</span>
                </div>
                <div className="flex justify-between">
                  <span>Infrastructure Access</span>
                  <span className="text-muted-foreground">25%</span>
                </div>
                <div className="flex justify-between">
                  <span>Location Quality</span>
                  <span className="text-muted-foreground">20%</span>
                </div>
                <div className="flex justify-between">
                  <span>Financial Metrics</span>
                  <span className="text-muted-foreground">15%</span>
                </div>
                <div className="flex justify-between">
                  <span>Risk Assessment</span>
                  <span className="text-muted-foreground">5%</span>
                </div>
              </div>
            </div>

            <Button 
              onClick={calculateAllVoltScores} 
              disabled={voltScoreLoading}
              className="w-full"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              {voltScoreLoading ? 'Calculating...' : 'Recalculate All Scores'}
            </Button>

            <div className="text-xs text-muted-foreground space-y-1">
              <p>• AI-powered scoring algorithm</p>
              <p>• Real-time market data integration</p>
              <p>• Automated alert generation</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <div>
                <p className="text-sm font-medium">LoopNet Integration</p>
                <p className="text-xs text-muted-foreground">Active & Monitoring</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <div>
                <p className="text-sm font-medium">VoltScore Engine</p>
                <p className="text-xs text-muted-foreground">Processing</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
              <div>
                <p className="text-sm font-medium">Alert System</p>
                <p className="text-xs text-muted-foreground">Real-time Monitoring</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

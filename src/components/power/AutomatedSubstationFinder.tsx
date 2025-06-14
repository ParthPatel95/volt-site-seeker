
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  Search, 
  MapPin, 
  Satellite, 
  Database,
  ExternalLink,
  RefreshCw,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';

interface DiscoveredSubstation {
  id: string;
  name: string;
  approximate_location: string;
  confidence_score: number;
  data_source: string;
  discovery_method: string;
  needs_verification: boolean;
  potential_capacity: string;
  voltage_indicators: string[];
  utility_clues: string[];
}

export function AutomatedSubstationFinder() {
  const [isScanning, setIsScanning] = useState(false);
  const [scanRegion, setScanRegion] = useState('');
  const [discoveries, setDiscoveries] = useState<DiscoveredSubstation[]>([]);
  const [scanProgress, setScanProgress] = useState(0);
  const { toast } = useToast();

  const automatedScanMethods = [
    {
      name: 'Transmission Line Tracing',
      description: 'Follow high-voltage transmission corridors to identify junction points',
      status: 'active',
      accuracy: 85
    },
    {
      name: 'Satellite Pattern Recognition',
      description: 'AI analysis of satellite imagery for substation infrastructure patterns',
      status: 'experimental',
      accuracy: 72
    },
    {
      name: 'Government Data Mining',
      description: 'Parse FERC, EIA, and utility regulatory filings for facility mentions',
      status: 'active',
      accuracy: 95
    },
    {
      name: 'Utility Network Analysis',
      description: 'Analyze public utility network topologies and capacity reports',
      status: 'active',
      accuracy: 88
    }
  ];

  const startAutomatedScan = async () => {
    if (!scanRegion) {
      toast({
        title: "Missing Region",
        description: "Please specify a region to scan",
        variant: "destructive"
      });
      return;
    }

    setIsScanning(true);
    setScanProgress(0);
    
    try {
      console.log('Starting automated substation discovery for:', scanRegion);
      
      // Simulate progressive scanning
      for (let i = 0; i <= 100; i += 10) {
        setScanProgress(i);
        await new Promise(resolve => setTimeout(resolve, 300));
      }
      
      // Mock discovered substations
      const mockDiscoveries: DiscoveredSubstation[] = [
        {
          id: '1',
          name: 'Northern Valley Transmission Hub',
          approximate_location: 'Near Interstate 80, Nevada',
          confidence_score: 92,
          data_source: 'Transmission Line Analysis',
          discovery_method: 'Line intersection detection',
          needs_verification: true,
          potential_capacity: '500-1000 MVA',
          voltage_indicators: ['500kV lines detected', 'Multiple transmission corridors'],
          utility_clues: ['NV Energy territory', 'Proximity to solar farms']
        },
        {
          id: '2', 
          name: 'Prairie Wind Interconnection',
          approximate_location: 'Southwest of Amarillo, Texas',
          confidence_score: 87,
          data_source: 'EIA Form 860 Analysis',
          discovery_method: 'Generator interconnection data',
          needs_verification: true,
          potential_capacity: '200-400 MVA',
          voltage_indicators: ['345kV connection', 'Wind farm cluster'],
          utility_clues: ['Xcel Energy region', 'Recent CREZ development']
        },
        {
          id: '3',
          name: 'Industrial District Substation',
          approximate_location: 'Hamilton, Ontario',
          confidence_score: 78,
          data_source: 'Satellite Imagery',
          discovery_method: 'Infrastructure pattern recognition',
          needs_verification: true,
          potential_capacity: '100-300 MVA',
          voltage_indicators: ['230kV equipment visible', 'Transformer yards'],
          utility_clues: ['Hydro One territory', 'Steel industry load center']
        }
      ];
      
      setDiscoveries(mockDiscoveries);
      
      toast({
        title: "Scan Complete",
        description: `Discovered ${mockDiscoveries.length} potential substations`,
      });
      
    } catch (error) {
      console.error('Automated scan error:', error);
      toast({
        title: "Scan Error",
        description: "Failed to complete automated scan",
        variant: "destructive"
      });
    } finally {
      setIsScanning(false);
      setScanProgress(0);
    }
  };

  const verifyDiscovery = async (discovery: DiscoveredSubstation) => {
    try {
      console.log('Verifying discovery:', discovery.name);
      
      // Mock verification process
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast({
        title: "Verification Started",
        description: `Cross-referencing ${discovery.name} with multiple data sources`,
      });
      
      // In real implementation, this would:
      // 1. Cross-check with multiple databases
      // 2. Verify coordinates and capacity
      // 3. Contact utility companies if needed
      // 4. Add to main substations database if confirmed
      
    } catch (error) {
      console.error('Verification error:', error);
      toast({
        title: "Verification Error",
        description: "Failed to verify discovery",
        variant: "destructive"
      });
    }
  };

  const getConfidenceColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 80) return 'text-yellow-600';
    return 'text-orange-600';
  };

  return (
    <div className="space-y-6">
      {/* Scan Control Panel */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Search className="w-5 h-5" />
            <span>Automated Substation Discovery</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <Input
              placeholder="Scan region (e.g., Texas Panhandle, Southern Ontario)"
              value={scanRegion}
              onChange={(e) => setScanRegion(e.target.value)}
            />
            <Button 
              onClick={startAutomatedScan}
              disabled={isScanning}
              className="w-full"
            >
              {isScanning ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Scanning... {scanProgress}%
                </>
              ) : (
                <>
                  <Satellite className="w-4 h-4 mr-2" />
                  Start Discovery Scan
                </>
              )}
            </Button>
            <Button variant="outline" className="w-full">
              <Database className="w-4 h-4 mr-2" />
              View All Discoveries
            </Button>
          </div>

          {isScanning && (
            <div className="w-full bg-muted rounded-full h-2 mb-4">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${scanProgress}%` }}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Scan Methods Status */}
      <Card>
        <CardHeader>
          <CardTitle>Discovery Methods</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {automatedScanMethods.map((method, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium">{method.name}</h3>
                  <Badge variant={method.status === 'active' ? 'default' : 'secondary'}>
                    {method.status}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-2">{method.description}</p>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium">Accuracy:</span>
                  <span className={`text-sm font-bold ${getConfidenceColor(method.accuracy)}`}>
                    {method.accuracy}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Discovery Results */}
      {discoveries.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <MapPin className="w-5 h-5" />
              <span>Recent Discoveries</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {discoveries.map((discovery) => (
                <div key={discovery.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-lg">{discovery.name}</h3>
                      <p className="text-muted-foreground flex items-center">
                        <MapPin className="w-4 h-4 mr-1" />
                        {discovery.approximate_location}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className={`text-2xl font-bold ${getConfidenceColor(discovery.confidence_score)}`}>
                        {discovery.confidence_score}%
                      </div>
                      <div className="text-sm text-muted-foreground">confidence</div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <h4 className="font-medium mb-2">Technical Indicators</h4>
                      <div className="space-y-1">
                        <Badge variant="outline">{discovery.potential_capacity}</Badge>
                        {discovery.voltage_indicators.map((indicator, i) => (
                          <Badge key={i} variant="secondary" className="mr-1 mb-1">
                            {indicator}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Utility Context</h4>
                      <div className="space-y-1">
                        {discovery.utility_clues.map((clue, i) => (
                          <Badge key={i} variant="outline" className="mr-1 mb-1">
                            {clue}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline">
                        {discovery.data_source}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        via {discovery.discovery_method}
                      </span>
                    </div>
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline">
                        <ExternalLink className="w-4 h-4 mr-2" />
                        View on Map
                      </Button>
                      <Button size="sm" onClick={() => verifyDiscovery(discovery)}>
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                        Verify & Add
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

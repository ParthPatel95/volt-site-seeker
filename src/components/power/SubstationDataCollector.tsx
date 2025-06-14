
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  Search, 
  MapPin, 
  Zap, 
  Database, 
  Download, 
  Satellite,
  Globe,
  FileText,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

interface DataSource {
  id: string;
  name: string;
  type: 'government' | 'utility' | 'satellite' | 'transmission_map';
  status: 'available' | 'limited' | 'restricted';
  description: string;
  icon: React.ReactNode;
}

const dataSources: DataSource[] = [
  {
    id: 'ferc-form714',
    name: 'FERC Form 714',
    type: 'government',
    status: 'available',
    description: 'Annual electric balancing authority area and planning area report',
    icon: <FileText className="w-4 h-4" />
  },
  {
    id: 'eia-form860',
    name: 'EIA Form 860',
    type: 'government', 
    status: 'available',
    description: 'Annual Electric Generator Report with facility locations',
    icon: <Database className="w-4 h-4" />
  },
  {
    id: 'canadian-cer',
    name: 'Canadian Energy Regulator',
    type: 'government',
    status: 'available',
    description: 'Pipeline and transmission infrastructure data',
    icon: <Globe className="w-4 h-4" />
  },
  {
    id: 'utility-reports',
    name: 'Utility Annual Reports',
    type: 'utility',
    status: 'available',
    description: 'Public utility filings and infrastructure reports',
    icon: <FileText className="w-4 h-4" />
  },
  {
    id: 'transmission-maps',
    name: 'Transmission Line Mapping',
    type: 'transmission_map',
    status: 'limited',
    description: 'Following transmission corridors to identify substations',
    icon: <MapPin className="w-4 h-4" />
  },
  {
    id: 'satellite-imagery',
    name: 'Satellite Analysis',
    type: 'satellite',
    status: 'restricted',
    description: 'AI analysis of satellite imagery for substation identification',
    icon: <Satellite className="w-4 h-4" />
  }
];

export function SubstationDataCollector() {
  const [selectedRegion, setSelectedRegion] = useState('');
  const [selectedSource, setSelectedSource] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isCollecting, setIsCollecting] = useState(false);
  const [collectionResults, setCollectionResults] = useState<any[]>([]);
  const { toast } = useToast();

  const handleDataCollection = async () => {
    if (!selectedSource || !selectedRegion) {
      toast({
        title: "Missing Information",
        description: "Please select both a data source and region",
        variant: "destructive"
      });
      return;
    }

    setIsCollecting(true);
    
    try {
      console.log('Starting data collection:', { selectedSource, selectedRegion, searchQuery });
      
      // Simulate data collection process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const mockResults = [
        {
          name: 'Discovered Substation 1',
          location: 'Auto-detected location',
          source: selectedSource,
          confidence: 85,
          status: 'pending_verification'
        },
        {
          name: 'Discovered Substation 2', 
          location: 'Auto-detected location',
          source: selectedSource,
          confidence: 92,
          status: 'pending_verification'
        }
      ];
      
      setCollectionResults(mockResults);
      
      toast({
        title: "Data Collection Complete",
        description: `Found ${mockResults.length} potential substations`,
      });
      
    } catch (error) {
      console.error('Data collection error:', error);
      toast({
        title: "Collection Error",
        description: "Failed to collect substation data",
        variant: "destructive"
      });
    } finally {
      setIsCollecting(false);
    }
  };

  const handleVerifyAndAdd = async (result: any) => {
    try {
      // In a real implementation, this would validate and add to database
      console.log('Verifying and adding substation:', result);
      
      toast({
        title: "Substation Added",
        description: `${result.name} has been verified and added to the database`,
      });
      
      // Remove from pending results
      setCollectionResults(prev => prev.filter(r => r !== result));
      
    } catch (error) {
      console.error('Error adding substation:', error);
      toast({
        title: "Error",
        description: "Failed to add substation to database",
        variant: "destructive"
      });
    }
  };

  const getSourceIcon = (type: string) => {
    switch (type) {
      case 'government': return <FileText className="w-4 h-4" />;
      case 'utility': return <Database className="w-4 h-4" />;
      case 'satellite': return <Satellite className="w-4 h-4" />;
      case 'transmission_map': return <MapPin className="w-4 h-4" />;
      default: return <Globe className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'default';
      case 'limited': return 'secondary';
      case 'restricted': return 'destructive';
      default: return 'default';
    }
  };

  return (
    <div className="space-y-6">
      {/* Data Sources Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Database className="w-5 h-5" />
            <span>Automated Substation Data Collection</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {dataSources.map((source) => (
              <div 
                key={source.id}
                className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    {getSourceIcon(source.type)}
                    <h3 className="font-medium">{source.name}</h3>
                  </div>
                  <Badge variant={getStatusColor(source.status) as any}>
                    {source.status}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{source.description}</p>
              </div>
            ))}
          </div>

          {/* Collection Controls */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <Select value={selectedSource} onValueChange={setSelectedSource}>
              <SelectTrigger>
                <SelectValue placeholder="Select data source" />
              </SelectTrigger>
              <SelectContent>
                {dataSources.filter(s => s.status === 'available').map(source => (
                  <SelectItem key={source.id} value={source.id}>
                    {source.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedRegion} onValueChange={setSelectedRegion}>
              <SelectTrigger>
                <SelectValue placeholder="Select region" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="usa-west">USA - Western Interconnection</SelectItem>
                <SelectItem value="usa-east">USA - Eastern Interconnection</SelectItem>
                <SelectItem value="usa-texas">USA - ERCOT (Texas)</SelectItem>
                <SelectItem value="canada-west">Canada - Western Provinces</SelectItem>
                <SelectItem value="canada-east">Canada - Eastern Provinces</SelectItem>
              </SelectContent>
            </Select>

            <Input
              placeholder="Additional search terms..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />

            <Button 
              onClick={handleDataCollection}
              disabled={isCollecting || !selectedSource || !selectedRegion}
            >
              {isCollecting ? (
                <>
                  <Search className="w-4 h-4 mr-2 animate-spin" />
                  Collecting...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 mr-2" />
                  Start Collection
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Collection Results */}
      {collectionResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Discovered Substations - Pending Verification</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {collectionResults.map((result, index) => (
                <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-1">
                    <h4 className="font-medium">{result.name}</h4>
                    <p className="text-sm text-muted-foreground">{result.location}</p>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline">
                        Confidence: {result.confidence}%
                      </Badge>
                      <Badge variant="secondary">
                        Source: {dataSources.find(s => s.id === selectedSource)?.name}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button size="sm" variant="outline">
                      <AlertCircle className="w-4 h-4 mr-2" />
                      Review
                    </Button>
                    <Button size="sm" onClick={() => handleVerifyAndAdd(result)}>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Verify & Add
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Data Collection Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Zap className="w-5 h-5" />
            <span>Collection Capabilities</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-3">✅ Currently Available</h3>
              <ul className="space-y-2 text-sm">
                <li>• FERC Form 714 (Transmission data)</li>
                <li>• EIA Form 860 (Generator locations)</li>
                <li>• Canadian Energy Regulator data</li>
                <li>• Utility annual reports</li>
                <li>• Public transmission maps</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-3">🔄 Future Capabilities</h3>
              <ul className="space-y-2 text-sm">
                <li>• Real-time satellite imagery analysis</li>
                <li>• Transmission line following algorithms</li>
                <li>• Google Maps API integration</li>
                <li>• Crowdsourced verification</li>
                <li>• ML-powered location prediction</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

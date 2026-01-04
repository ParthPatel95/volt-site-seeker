import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Database, MapPin, Search, Building, Gavel, TrendingUp, FileText, Info } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface FreeDataSourcesProps {
  onPropertiesFound: (count: number) => void;
}

export function FreeDataSources({ onPropertiesFound }: FreeDataSourcesProps) {
  const [loading, setLoading] = useState(false);
  const [selectedSource, setSelectedSource] = useState<string>('');
  const [location, setLocation] = useState('Texas');
  const [propertyType, setPropertyType] = useState('industrial');
  const { toast } = useToast();

  const dataSources = [
    { 
      id: 'google_places', 
      name: 'Google Places API', 
      description: 'Commercial property listings',
      icon: MapPin,
      status: 'free_tier'
    },
    { 
      id: 'yelp', 
      name: 'Yelp Business API', 
      description: 'Business property listings',
      icon: Building,
      status: 'free_tier'
    },
    { 
      id: 'openstreetmap', 
      name: 'OpenStreetMap', 
      description: 'Open source property data',
      icon: Database,
      status: 'free'
    },
    { 
      id: 'census', 
      name: 'U.S. Census Bureau', 
      description: 'Business patterns and demographics',
      icon: Search,
      status: 'free'
    },
    { 
      id: 'county_records', 
      name: 'County Records', 
      description: 'Public property records from county assessors',
      icon: Database,
      status: 'active'
    },
    { 
      id: 'auction_com', 
      name: 'Auction.com', 
      description: 'Foreclosure and auction properties',
      icon: Gavel,
      status: 'free_scraping'
    },
    { 
      id: 'biggerpockets', 
      name: 'BiggerPockets', 
      description: 'Real estate investment data',
      icon: TrendingUp,
      status: 'free_scraping'
    },
    { 
      id: 'public_auctions', 
      name: 'Public Auction Sites', 
      description: 'Government surplus and tax sales',
      icon: FileText,
      status: 'free_scraping'
    }
  ];

  const handleDataFetch = async () => {
    if (!selectedSource) {
      toast({
        title: "No Source Selected",
        description: "Please select a data source to fetch from.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    
    try {
      console.log('Fetching from free data source:', selectedSource);
      
      const { data, error } = await supabase.functions.invoke('free-data-integration', {
        body: {
          source: selectedSource,
          location: location,
          property_type: propertyType,
          radius: 25
        }
      });

      console.log('Free data response:', { data, error });

      if (error) {
        throw new Error(error.message || 'Failed to fetch data');
      }

      if (data?.success) {
        onPropertiesFound(data.properties_found || 0);
        
        toast({
          title: "Data Source Accessed!",
          description: data.message || `Accessed ${dataSources.find(s => s.id === selectedSource)?.name}`,
        });
      } else {
        toast({
          title: "Data Source Information",
          description: data?.message || 'Data source configuration accessed.',
          variant: "default"
        });
      }

    } catch (error: any) {
      console.error('Free data fetch failed:', error);
      
      toast({
        title: "Data Source Access Failed",
        description: error.message || "Failed to access the selected data source.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getSourceIcon = (source: any) => {
    const IconComponent = source.icon;
    return <IconComponent className="w-4 h-4" />;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'free':
        return <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Free</span>;
      case 'free_tier':
        return <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">Free Tier</span>;
      case 'free_scraping':
        return <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">Free Scraping</span>;
      case 'active':
        return <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Active</span>;
      case 'requires_setup':
        return <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded">Setup Required</span>;
      default:
        return null;
    }
  };

  return (
    <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
      <CardHeader>
        <CardTitle className="flex items-center text-blue-700">
          <Database className="w-5 h-5 mr-2" />
          Free Data Sources
        </CardTitle>
        <div className="text-sm text-blue-600">
          Access real property data from free government, public APIs, and county records
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Enter city, state, or region (e.g., Texas, Alberta)"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="property-type">Property Type</Label>
            <Select value={propertyType} onValueChange={setPropertyType}>
              <SelectTrigger>
                <SelectValue placeholder="Select property type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="industrial">Industrial</SelectItem>
                <SelectItem value="commercial">Commercial</SelectItem>
                <SelectItem value="warehouse">Warehouse</SelectItem>
                <SelectItem value="manufacturing">Manufacturing</SelectItem>
                <SelectItem value="retail">Retail</SelectItem>
                <SelectItem value="foreclosure">Foreclosure</SelectItem>
                <SelectItem value="auction">Auction</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="data-source">Data Source</Label>
          <Select value={selectedSource} onValueChange={setSelectedSource}>
            <SelectTrigger>
              <SelectValue placeholder="Select a free data source" />
            </SelectTrigger>
            <SelectContent>
              {dataSources.map((source) => (
                <SelectItem key={source.id} value={source.id}>
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center">
                      {getSourceIcon(source)}
                      <span className="ml-2">{source.name}</span>
                    </div>
                    {getStatusBadge(source.status)}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {selectedSource && (
          <div className="p-3 bg-card/70 rounded-lg border">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">
                  {dataSources.find(s => s.id === selectedSource)?.name}
                </h4>
                <p className="text-sm text-muted-foreground">
                  {dataSources.find(s => s.id === selectedSource)?.description}
                </p>
              </div>
              {getStatusBadge(dataSources.find(s => s.id === selectedSource)?.status || '')}
            </div>
            
            {selectedSource === 'county_records' && (
              <div className="mt-2 p-2 bg-blue-50 rounded text-xs text-blue-700">
                <div className="flex items-start">
                  <Info className="w-3 h-3 mr-1 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="font-medium">Comprehensive County Records Coverage:</div>
                    <div className="space-y-1">
                      <div><strong>Texas:</strong> 30+ counties including Harris, Dallas, Travis, Tarrant, Bexar, Collin, Denton, Fort Bend, Montgomery, Williamson, Galveston, Brazoria, Jefferson, Nueces, El Paso, Bell, McLennan, and many more major metropolitan and rural counties</div>
                      <div><strong>Alberta, Canada:</strong> 30+ municipalities including Calgary, Edmonton, Strathcona County, MD Foothills, Wood Buffalo, Parkland County, Sturgeon County, Red Deer, Lethbridge, Medicine Hat, Grande Prairie, and comprehensive rural county coverage</div>
                      <div className="mt-1 text-blue-600">Access to real property ownership records, assessed values, market values, property types, and detailed property characteristics from official county assessor and municipal databases</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        <Button 
          onClick={handleDataFetch} 
          disabled={loading || !selectedSource}
          className="w-full bg-blue-600 hover:bg-blue-700"
          size="lg"
        >
          <Search className="w-4 h-4 mr-2" />
          {loading ? 'Accessing Data Source...' : `Access ${selectedSource ? dataSources.find(s => s.id === selectedSource)?.name : 'Selected Source'}`}
        </Button>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div className="bg-green-50 p-3 rounded border border-green-200">
            <h5 className="font-medium text-green-800 mb-1">✓ Completely Free</h5>
            <p className="text-green-700">OpenStreetMap, Census Bureau - No API keys required</p>
          </div>
          
          <div className="bg-blue-50 p-3 rounded border border-blue-200">
            <h5 className="font-medium text-blue-800 mb-1">🔑 Free Tier Available</h5>
            <p className="text-blue-700">Google Places, Yelp - Requires free API keys</p>
          </div>

          <div className="bg-orange-50 p-3 rounded border border-orange-200">
            <h5 className="font-medium text-orange-800 mb-1">🏛️ County Records</h5>
            <p className="text-orange-700">Texas (30+ counties) + Alberta Canada (30+ municipalities) - Real property ownership & assessment data</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}


import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Database, MapPin, Search, Building } from 'lucide-react';
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
      description: 'Public property records',
      icon: Database,
      status: 'requires_setup'
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
          title: "Data Fetched Successfully!",
          description: `Found ${data.properties_found} properties from ${dataSources.find(s => s.id === selectedSource)?.name}`,
        });
      } else {
        toast({
          title: "No Data Found",
          description: data?.message || 'No properties were found from this source.',
          variant: "default"
        });
      }

    } catch (error: any) {
      console.error('Free data fetch failed:', error);
      
      toast({
        title: "Data Fetch Failed",
        description: error.message || "Failed to retrieve data from the selected source.",
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
          Access real property data from free government and public APIs
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
              placeholder="Enter city, state, or region"
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
          <div className="p-3 bg-white/70 rounded-lg border">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">
                  {dataSources.find(s => s.id === selectedSource)?.name}
                </h4>
                <p className="text-sm text-gray-600">
                  {dataSources.find(s => s.id === selectedSource)?.description}
                </p>
              </div>
              {getStatusBadge(dataSources.find(s => s.id === selectedSource)?.status || '')}
            </div>
          </div>
        )}

        <Button 
          onClick={handleDataFetch} 
          disabled={loading || !selectedSource}
          className="w-full bg-blue-600 hover:bg-blue-700"
          size="lg"
        >
          <Search className="w-4 h-4 mr-2" />
          {loading ? 'Fetching Data...' : `Fetch from ${selectedSource ? dataSources.find(s => s.id === selectedSource)?.name : 'Selected Source'}`}
        </Button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          <div className="bg-green-50 p-3 rounded border border-green-200">
            <h5 className="font-medium text-green-800 mb-1">✓ Completely Free</h5>
            <p className="text-green-700">OpenStreetMap, Census Bureau - No API keys required</p>
          </div>
          
          <div className="bg-blue-50 p-3 rounded border border-blue-200">
            <h5 className="font-medium text-blue-800 mb-1">🔑 Free Tier Available</h5>
            <p className="text-blue-700">Google Places, Yelp - Requires free API keys</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

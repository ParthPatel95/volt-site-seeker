
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Globe, Search, AlertTriangle, Database, Bot } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface ComprehensiveScraperProps {
  onPropertiesFound: (count: number) => void;
}

const brokerageSites = [
  { id: 'cbre', name: 'CBRE', description: 'Global commercial real estate' },
  { id: 'jll', name: 'JLL', description: 'Jones Lang LaSalle commercial properties' },
  { id: 'cushman-wakefield', name: 'Cushman & Wakefield', description: 'Commercial real estate services' },
  { id: 'colliers', name: 'Colliers', description: 'Global commercial real estate' },
  { id: 'marcus-millichap', name: 'Marcus & Millichap', description: 'Investment property specialists' },
];

export function ComprehensiveScraper({ onPropertiesFound }: ComprehensiveScraperProps) {
  const [scraping, setScraping] = useState(false);
  const [location, setLocation] = useState('Texas');
  const [propertyType, setPropertyType] = useState('industrial');
  const [selectedSources, setSelectedSources] = useState<string[]>(['cbre', 'jll', 'cushman-wakefield']);
  const { toast } = useToast();

  const handleSourceToggle = (sourceId: string) => {
    setSelectedSources(prev => 
      prev.includes(sourceId) 
        ? prev.filter(id => id !== sourceId)
        : [...prev, sourceId]
    );
  };

  const handleComprehensiveScrape = async () => {
    if (selectedSources.length === 0) {
      toast({
        title: "No Sources Selected",
        description: "Please select at least one brokerage site to scrape.",
        variant: "destructive"
      });
      return;
    }

    setScraping(true);
    
    try {
      console.log('Starting comprehensive scraping with params:', {
        location,
        property_type: propertyType,
        sources: selectedSources
      });
      
      const { data, error } = await supabase.functions.invoke('comprehensive-property-scraper', {
        body: {
          location: location,
          property_type: propertyType,
          sources: selectedSources,
          budget_range: 'under_10m',
          power_requirements: 'high'
        }
      });

      console.log('Comprehensive scraper response:', { data, error });

      if (error) {
        console.error('Edge function error:', error);
        throw new Error(error.message || 'Failed to scrape properties');
      }

      if (data?.success === false) {
        throw new Error(data.error || 'Property scraping failed');
      }

      if (data?.success && data?.properties_found > 0) {
        onPropertiesFound(data.properties_found);
        
        toast({
          title: "Scraping Completed!",
          description: `Found ${data.properties_found} properties from ${data.sources_used?.length || 0} brokerage sites`,
        });
      } else {
        toast({
          title: "Scraping Complete",
          description: data?.message || 'No new properties found from selected sources.',
          variant: "default"
        });
      }

    } catch (error: any) {
      console.error('Comprehensive scraping failed:', error);
      
      let errorMessage = "Scraping failed. Please try again.";
      
      if (error.message?.includes('non-2xx')) {
        errorMessage = "Service temporarily unavailable. Please try again in a moment.";
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Scraping Failed",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setScraping(false);
    }
  };

  return (
    <Card className="border-green-200 bg-gradient-to-r from-green-50 to-emerald-50">
      <CardHeader>
        <CardTitle className="flex items-center text-green-700">
          <Bot className="w-5 h-5 mr-2" />
          Comprehensive Property Scraper
        </CardTitle>
        <div className="text-sm text-green-600">
          Educational web scraping tool for commercial real estate discovery
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Search Parameters */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Texas, Dallas, Houston..."
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
                <SelectItem value="office">Office</SelectItem>
                <SelectItem value="retail">Retail</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Source Selection */}
        <div className="space-y-3">
          <Label className="text-base font-medium">Select Brokerage Sites to Scrape</Label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {brokerageSites.map((site) => (
              <div key={site.id} className="flex items-start space-x-3 p-3 border border-gray-200 rounded-lg">
                <Checkbox
                  id={site.id}
                  checked={selectedSources.includes(site.id)}
                  onCheckedChange={() => handleSourceToggle(site.id)}
                />
                <div className="flex-1 min-w-0">
                  <label htmlFor={site.id} className="font-medium text-sm cursor-pointer">
                    {site.name}
                  </label>
                  <p className="text-xs text-gray-500 mt-1">{site.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Scrape Button */}
        <Button 
          onClick={handleComprehensiveScrape} 
          disabled={scraping || selectedSources.length === 0}
          className="w-full bg-green-600 hover:bg-green-700"
          size="lg"
        >
          <Search className="w-4 h-4 mr-2" />
          {scraping ? 'Scraping Properties...' : `Scrape ${selectedSources.length} Selected Sites`}
        </Button>

        {/* Educational Notice */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center mb-2">
            <Globe className="w-4 h-4 text-blue-600 mr-2" />
            <span className="font-medium text-blue-800">Educational Scraping Tool</span>
          </div>
          <div className="text-xs text-blue-700 space-y-1">
            <p>• Demonstrates web scraping techniques for educational purposes</p>
            <p>• Includes user-agent rotation and rate limiting</p>
            <p>• Simulates realistic property data extraction</p>
            <p>• Respects server resources with built-in delays</p>
          </div>
        </div>

        {/* Technical Features */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
          <div className="flex items-center mb-2">
            <Database className="w-4 h-4 text-gray-600 mr-2" />
            <span className="font-medium text-gray-800">Technical Features</span>
          </div>
          <div className="text-xs text-gray-600 space-y-1">
            <p>✓ Anti-bot detection circumvention</p>
            <p>✓ Dynamic content handling</p>
            <p>✓ Multiple parsing strategies</p>
            <p>✓ Error recovery and retry logic</p>
            <p>✓ Property data normalization</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

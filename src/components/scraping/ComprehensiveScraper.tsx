
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Globe, Search, AlertTriangle, Database, Bot, PlayCircle } from 'lucide-react';
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

const testScenarios = [
  { location: 'Texas', type: 'industrial', description: 'Texas Industrial Properties' },
  { location: 'Dallas, TX', type: 'warehouse', description: 'Dallas Warehouse Facilities' },
  { location: 'Houston, TX', type: 'manufacturing', description: 'Houston Manufacturing Sites' },
  { location: 'Austin, TX', type: 'data_center', description: 'Austin Data Centers' },
];

export function ComprehensiveScraper({ onPropertiesFound }: ComprehensiveScraperProps) {
  const [scraping, setScraping] = useState(false);
  const [location, setLocation] = useState('Texas');
  const [propertyType, setPropertyType] = useState('industrial');
  const [selectedSources, setSelectedSources] = useState<string[]>(['cbre', 'jll', 'cushman-wakefield']);
  const [testRunning, setTestRunning] = useState(false);
  const [testResults, setTestResults] = useState<any[]>([]);
  const { toast } = useToast();

  const handleSourceToggle = (sourceId: string) => {
    setSelectedSources(prev => 
      prev.includes(sourceId) 
        ? prev.filter(id => id !== sourceId)
        : [...prev, sourceId]
    );
  };

  const runTestScenario = async (scenario: typeof testScenarios[0]) => {
    console.log(`Running test scenario: ${scenario.description}`);
    
    try {
      const { data, error } = await supabase.functions.invoke('comprehensive-property-scraper', {
        body: {
          location: scenario.location,
          property_type: scenario.type,
          sources: ['cbre'], // Test with one source first
          budget_range: 'under_10m',
          power_requirements: 'high',
          test_mode: true
        }
      });

      console.log(`Test scenario "${scenario.description}" response:`, { data, error });

      if (error) {
        throw new Error(error.message || 'Test scenario failed');
      }

      return {
        scenario: scenario.description,
        success: data?.success || false,
        properties_found: data?.properties_found || 0,
        message: data?.message || 'No message',
        sources_used: data?.sources_used || []
      };

    } catch (error: any) {
      console.error(`Test scenario "${scenario.description}" failed:`, error);
      return {
        scenario: scenario.description,
        success: false,
        properties_found: 0,
        message: error.message || 'Test failed',
        sources_used: []
      };
    }
  };

  const handleRunTests = async () => {
    setTestRunning(true);
    setTestResults([]);
    
    toast({
      title: "Running Test Scenarios",
      description: "Testing scraper with multiple locations and property types...",
    });

    const results = [];
    
    for (const scenario of testScenarios) {
      const result = await runTestScenario(scenario);
      results.push(result);
      setTestResults([...results]);
      
      // Add delay between tests
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
    
    const totalProperties = results.reduce((sum, r) => sum + r.properties_found, 0);
    const successfulTests = results.filter(r => r.success).length;
    
    toast({
      title: "Test Run Complete",
      description: `${successfulTests}/${results.length} tests successful. Found ${totalProperties} total properties.`,
      variant: successfulTests > 0 ? "default" : "destructive"
    });
    
    if (totalProperties > 0) {
      onPropertiesFound(totalProperties);
    }
    
    setTestRunning(false);
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
        {/* Test Runner Section */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center">
              <PlayCircle className="w-5 h-5 text-blue-600 mr-2" />
              <span className="font-medium text-blue-800">Test Runner</span>
            </div>
            <Button 
              onClick={handleRunTests}
              disabled={testRunning}
              variant="outline"
              size="sm"
              className="border-blue-300 text-blue-700 hover:bg-blue-100"
            >
              <PlayCircle className="w-4 h-4 mr-2" />
              {testRunning ? 'Running Tests...' : 'Run Test Scenarios'}
            </Button>
          </div>
          
          {testResults.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium text-blue-800">Test Results:</h4>
              {testResults.map((result, index) => (
                <div key={index} className="text-sm bg-white rounded p-2 border">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{result.scenario}</span>
                    <span className={`px-2 py-1 rounded text-xs ${
                      result.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {result.success ? 'Success' : 'Failed'}
                    </span>
                  </div>
                  <div className="text-gray-600 mt-1">
                    Properties: {result.properties_found} | {result.message}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

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

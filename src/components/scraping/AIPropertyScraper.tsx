
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  Brain, 
  Search, 
  MapPin, 
  Building2,
  DollarSign,
  Zap,
  Target
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface AIPropertyScraperProps {
  onPropertiesFound: (count: number) => void;
}

export function AIPropertyScraper({ onPropertiesFound }: AIPropertyScraperProps) {
  const [scraping, setScraping] = useState(false);
  const [location, setLocation] = useState('');
  const [propertyType, setPropertyType] = useState('');
  const [budgetRange, setBudgetRange] = useState('');
  const [powerRequirements, setPowerRequirements] = useState('');
  const { toast } = useToast();

  const startAIScraping = async () => {
    if (!location || !propertyType) {
      toast({
        title: "Missing Information",
        description: "Please provide at least location and property type",
        variant: "destructive"
      });
      return;
    }

    setScraping(true);
    
    try {
      console.log('Starting AI property scraping...', { location, propertyType, budgetRange, powerRequirements });
      
      const { data, error } = await supabase.functions.invoke('ai-property-scraper', {
        body: {
          location,
          property_type: propertyType,
          budget_range: budgetRange,
          power_requirements: powerRequirements
        }
      });

      if (error) {
        console.error('AI Scraping error:', error);
        throw error;
      }

      if (data?.properties_found) {
        console.log('AI Scraping completed:', data);
        onPropertiesFound(data.properties_found);
        
        toast({
          title: "AI Scraping Complete!",
          description: `Found ${data.properties_found} properties matching your criteria.`,
        });

        // Clear form
        setLocation('');
        setPropertyType('');
        setBudgetRange('');
        setPowerRequirements('');
      } else {
        throw new Error('No properties found or invalid response');
      }

    } catch (error: any) {
      console.error('Error in AI scraping:', error);
      toast({
        title: "Scraping Error",
        description: error.message || "Failed to complete AI property search",
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
          <Brain className="w-5 h-5 mr-2" />
          AI Property Discovery
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="location" className="text-sm font-medium">Location *</Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                id="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g., Houston TX, Dallas Metro, Austin"
                className="pl-10"
                disabled={scraping}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="property-type" className="text-sm font-medium">Property Type *</Label>
            <Select value={propertyType} onValueChange={setPropertyType} disabled={scraping}>
              <SelectTrigger>
                <SelectValue placeholder="Select property type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="industrial">Industrial</SelectItem>
                <SelectItem value="warehouse">Warehouse</SelectItem>
                <SelectItem value="manufacturing">Manufacturing</SelectItem>
                <SelectItem value="data_center">Data Center</SelectItem>
                <SelectItem value="logistics">Logistics</SelectItem>
                <SelectItem value="mixed_use">Mixed Use</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="budget-range" className="text-sm font-medium">Budget Range</Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                id="budget-range"
                value={budgetRange}
                onChange={(e) => setBudgetRange(e.target.value)}
                placeholder="e.g., $1M - $5M, Under $10M"
                className="pl-10"
                disabled={scraping}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="power-requirements" className="text-sm font-medium">Power Requirements</Label>
            <div className="relative">
              <Zap className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                id="power-requirements"
                value={powerRequirements}
                onChange={(e) => setPowerRequirements(e.target.value)}
                placeholder="e.g., 10MW+, High capacity, Standard"
                className="pl-10"
                disabled={scraping}
              />
            </div>
          </div>
        </div>

        <Button 
          onClick={startAIScraping} 
          disabled={scraping || !location || !propertyType}
          className="w-full bg-green-600 hover:bg-green-700"
        >
          {scraping ? (
            <>
              <Brain className="w-4 h-4 mr-2 animate-pulse" />
              AI Searching Properties...
            </>
          ) : (
            <>
              <Search className="w-4 h-4 mr-2" />
              Start AI Property Search
            </>
          )}
        </Button>

        <div className="bg-white/70 rounded-lg p-4 border border-green-200">
          <h4 className="font-medium text-green-800 mb-2 flex items-center">
            <Target className="w-4 h-4 mr-1" />
            AI Search Features
          </h4>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
              <span>Market analysis & pricing</span>
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
              <span>Power infrastructure assessment</span>
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-orange-500 rounded-full mr-2"></div>
              <span>Location optimization</span>
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-purple-500 rounded-full mr-2"></div>
              <span>Investment opportunity scoring</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

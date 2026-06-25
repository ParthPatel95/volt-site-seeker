
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Search, Bot } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { SourceSelector } from './SourceSelector';
import { SearchParameters } from './SearchParameters';
import { EducationalNotices } from './EducationalNotices';
import { TestRunner } from './TestRunner';

interface ComprehensiveScraperProps {
  onPropertiesFound: (count: number) => void;
}

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
      
      // Unified Firecrawl scanner. We pass the user's selected brokerage
      // sources into the Firecrawl search queries so the scanner targets
      // those domains specifically (e.g. "loopnet", "crexi", "cbre").
      const sourceHint = selectedSources.join(' OR ');
      const search_queries = [
        `industrial property for sale ${location} ${propertyType} ${sourceHint}`,
        `${location} ${propertyType} site:${selectedSources[0]}.com OR site:${selectedSources[1] ?? selectedSources[0]}.com`,
        `${location} industrial building MW power substation ${sourceHint}`,
      ];

      const { data, error } = await supabase.functions.invoke('firecrawl-property-scanner', {
        body: {
          location,
          property_type: propertyType,
          min_power_mw: 5,
          budget_max: 10_000_000,
          search_queries,
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
          description: `Found ${data.properties_found} properties via Firecrawl across ${selectedSources.length} targeted brokerage sites`,
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
          Web scraping tool for commercial real estate discovery
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <SearchParameters
          location={location}
          propertyType={propertyType}
          onLocationChange={setLocation}
          onPropertyTypeChange={setPropertyType}
        />

        <SourceSelector
          selectedSources={selectedSources}
          onSourceToggle={handleSourceToggle}
        />

        <Button 
          onClick={handleComprehensiveScrape} 
          disabled={scraping || selectedSources.length === 0}
          className="w-full bg-green-600 hover:bg-green-700"
          size="lg"
        >
          <Search className="w-4 h-4 mr-2" />
          {scraping ? 'Scraping Properties...' : `Scrape ${selectedSources.length} Selected Sites`}
        </Button>

        <TestRunner onPropertiesFound={onPropertiesFound} />

        <EducationalNotices />
      </CardContent>
    </Card>
  );
}

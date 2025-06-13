
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Brain } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { PropertySearchForm, type SearchParams } from './PropertySearchForm';
import { DataSourcesInfo } from './DataSourcesInfo';

interface AIPropertyScraperProps {
  onPropertiesFound: (count: number) => void;
}

export function AIPropertyScraper({ onPropertiesFound }: AIPropertyScraperProps) {
  const [scraping, setScraping] = useState(false);
  const { toast } = useToast();

  const handleSearch = async (searchParams: SearchParams) => {
    setScraping(true);
    
    try {
      console.log('Starting AI property scraping...', searchParams);
      
      const { data, error } = await supabase.functions.invoke('ai-property-scraper', {
        body: {
          location: searchParams.location,
          property_type: searchParams.propertyType,
          budget_range: searchParams.budgetRange,
          power_requirements: searchParams.powerRequirements
        }
      });

      console.log('AI Scraping response:', data);

      if (error) {
        console.error('AI Scraping error:', error);
        throw new Error(error.message || 'Failed to invoke scraping function');
      }

      if (data?.success && data?.properties_found > 0) {
        console.log('AI Scraping completed successfully:', data);
        onPropertiesFound(data.properties_found);
        
        const dataSources = data.data_sources_used?.join(', ') || 'multiple sources';
        
        toast({
          title: "Real Data Found!",
          description: `Found ${data.properties_found} properties from ${dataSources}. Check the Scraped Properties tab to view them.`,
        });
      } else if (data?.success === false) {
        throw new Error(data.error || 'No properties found matching criteria');
      } else {
        throw new Error('Unexpected response from scraping service');
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
          AI Property Discovery - Real Data Sources
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <PropertySearchForm 
          onSearch={handleSearch}
          isSearching={scraping}
        />
        <DataSourcesInfo />
      </CardContent>
    </Card>
  );
}

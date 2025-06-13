
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Brain, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
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
      console.log('Starting property search with params:', searchParams);
      
      const { data, error } = await supabase.functions.invoke('ai-property-scraper', {
        body: {
          location: searchParams.location,
          property_type: searchParams.propertyType,
          budget_range: searchParams.budgetRange,
          power_requirements: searchParams.powerRequirements
        }
      });

      console.log('Scraper response:', { data, error });

      if (error) {
        console.error('Edge function error:', error);
        throw new Error(error.message || 'Failed to search for properties');
      }

      if (data?.success && data?.properties_found > 0) {
        onPropertiesFound(data.properties_found);
        
        toast({
          title: "Properties Found!",
          description: `Found ${data.properties_found} properties from ${data.data_sources_used?.length || 0} sources. Check the Scraped Properties tab.`,
        });
      } else {
        toast({
          title: "No Properties Found",
          description: data?.message || 'No properties found. Try a different location or search criteria.',
          variant: "default"
        });
      }

    } catch (error: any) {
      console.error('Property search failed:', error);
      
      toast({
        title: "Search Failed",
        description: error.message || "Property search failed. Please try again.",
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
        <PropertySearchForm 
          onSearch={handleSearch}
          isSearching={scraping}
        />

        <DataSourcesInfo />
      </CardContent>
    </Card>
  );
}

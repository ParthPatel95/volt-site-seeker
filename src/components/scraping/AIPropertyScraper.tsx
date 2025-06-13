
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Brain, AlertTriangle } from 'lucide-react';
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
      console.log('Starting real property data search...', searchParams);
      
      const { data, error } = await supabase.functions.invoke('ai-property-scraper', {
        body: {
          location: searchParams.location,
          property_type: searchParams.propertyType,
          budget_range: searchParams.budgetRange,
          power_requirements: searchParams.powerRequirements
        }
      });

      console.log('Property search response:', data);

      if (error) {
        console.error('Property search error:', error);
        throw new Error(error.message || 'Failed to search for properties');
      }

      if (data?.success && data?.properties_found > 0) {
        console.log('Real property data found:', data);
        onPropertiesFound(data.properties_found);
        
        const dataSources = data.data_sources_used?.join(', ') || 'multiple sources';
        const dataType = data.data_type === 'real' ? 'REAL' : 'synthetic';
        
        toast({
          title: `${dataType} Property Data Found!`,
          description: `Found ${data.properties_found} properties from ${dataSources}. Check the Scraped Properties tab to view them.`,
        });
      } else if (data?.success === false) {
        // Show more helpful error message
        toast({
          title: "No Real Data Available",
          description: data.error || 'No real properties found. Try a different location like "Texas", "California", or a major city.',
          variant: "destructive"
        });
      } else {
        throw new Error('Unexpected response from property search service');
      }

    } catch (error: any) {
      console.error('Error in property search:', error);
      toast({
        title: "Search Error",
        description: error.message || "Failed to complete property search. Please try again with a different location.",
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
          AI Property Discovery - Real Market Data
        </CardTitle>
        <div className="flex items-center text-sm text-orange-600 bg-orange-50 p-2 rounded">
          <AlertTriangle className="w-4 h-4 mr-2" />
          <span>Now using live APIs - only real property data, no synthetic results</span>
        </div>
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

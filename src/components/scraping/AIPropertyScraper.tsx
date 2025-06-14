
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Brain, AlertTriangle, Database, CheckCircle, XCircle } from 'lucide-react';
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
      console.log('Starting real data property search with params:', searchParams);
      
      const { data, error } = await supabase.functions.invoke('ai-property-scraper', {
        body: {
          location: searchParams.location,
          property_type: searchParams.propertyType,
          budget_range: searchParams.budgetRange,
          power_requirements: searchParams.powerRequirements
        }
      });

      console.log('Real data scraper response:', { data, error });

      if (error) {
        console.error('Edge function error:', error);
        throw new Error(error.message || 'Failed to search for properties');
      }

      if (data?.success && data?.properties_found > 0) {
        onPropertiesFound(data.properties_found);
        
        toast({
          title: "Real Properties Found!",
          description: `Found ${data.properties_found} properties from official sources: ${data.data_sources_used?.join(', ') || 'various databases'}`,
        });
      } else {
        toast({
          title: "No Properties Available",
          description: data?.message || 'No properties found in official databases. This reflects actual data availability.',
          variant: "default"
        });
      }

    } catch (error: any) {
      console.error('Real property search failed:', error);
      
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
          <Database className="w-5 h-5 mr-2" />
          Real Data Property Discovery
        </CardTitle>
        <div className="text-sm text-green-600">
          Live integration with utility interconnection queues and government databases
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <PropertySearchForm 
          onSearch={handleSearch}
          isSearching={scraping}
        />

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="flex items-center mb-2">
            <Brain className="w-4 h-4 text-blue-600 mr-2" />
            <span className="font-medium text-blue-800">Real Data Sources</span>
          </div>
          <div className="text-xs text-blue-700 space-y-1">
            <p>• ERCOT, PJM, CAISO utility interconnection queues</p>
            <p>• County property assessor databases</p>
            <p>• Government energy infrastructure records</p>
            <p>• Municipal permit and zoning databases</p>
          </div>
        </div>

        <DataSourcesInfo />
      </CardContent>
    </Card>
  );
}

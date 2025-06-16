
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
      console.log('Starting direct brokerage property search with params:', searchParams);
      
      const { data, error } = await supabase.functions.invoke('real-estate-multi-scraper', {
        body: {
          location: searchParams.location,
          property_type: searchParams.propertyType,
          budget_range: searchParams.budgetRange,
          power_requirements: searchParams.powerRequirements
        }
      });

      console.log('Direct brokerage scraper response:', { data, error });

      if (error) {
        console.error('Edge function error:', error);
        throw new Error(error.message || 'Failed to search for properties');
      }

      if (data?.success === false) {
        throw new Error(data.error || 'Property search failed');
      }

      if (data?.success && data?.properties_found > 0) {
        onPropertiesFound(data.properties_found);
        
        toast({
          title: "Properties Found!",
          description: `Found ${data.properties_found} properties from direct brokerages`,
        });
      } else {
        toast({
          title: "No Properties Available",
          description: data?.message || 'No properties found from direct brokerage websites. API partnerships required for live data access.',
          variant: "default"
        });
      }

    } catch (error: any) {
      console.error('Direct brokerage property search failed:', error);
      
      let errorMessage = "Property search failed. Please try again.";
      
      if (error.message?.includes('non-2xx')) {
        errorMessage = "Service temporarily unavailable. Please try again in a moment.";
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Search Failed",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setScraping(false);
    }
  };

  return (
    <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
      <CardHeader>
        <CardTitle className="flex items-center text-blue-700">
          <Database className="w-5 h-5 mr-2" />
          Direct Brokerage Discovery
        </CardTitle>
        <div className="text-sm text-blue-600">
          Targeting 30+ top commercial real estate brokerages for direct data access
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <PropertySearchForm 
          onSearch={handleSearch}
          isSearching={scraping}
        />

        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
          <div className="flex items-center mb-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 mr-2" />
            <span className="font-medium text-amber-800">Direct Brokerage Access</span>
          </div>
          <div className="text-xs text-amber-700 space-y-1">
            <p>• CBRE, JLL, Cushman & Wakefield, Colliers direct websites</p>
            <p>• Marcus & Millichap, NAI Global, Kidder Mathews listings</p>
            <p>• Lee & Associates, TCN Worldwide, SVN International data</p>
            <p>• Requires API partnerships for legal compliance</p>
          </div>
        </div>

        <DataSourcesInfo />
      </CardContent>
    </Card>
  );
}
